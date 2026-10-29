import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { addChat, createRoom, joinRoom, leaveRoom, roomCodeFor, sealIdea, setProblem, setSource } from "./roomStore.js";
import { addProblem, listProblems } from "./problemStore.js";
import { loginUser, registerUser, verifyToken } from "./userStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5000);
const clientOrigin = process.env.CLIENT_URL || "http://127.0.0.1:5173";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin(origin, callback) {
      const local = !origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      callback(null, local || origin === clientOrigin);
    },
  },
});

app.use(express.json({ limit: "200kb" }));

function readUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return verifyToken(token);
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const result = await registerUser(req.body || {});
    res.status(result.ok ? 201 : 400).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Could not save that account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const result = await loginUser(req.body || {});
    res.status(result.ok ? 200 : 401).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Could not log in." });
  }
});

app.get("/api/problems", (_req, res) => {
  try {
    res.json(listProblems());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Could not load questions." });
  }
});

app.post("/api/problems", (req, res) => {
  let user;
  try {
    user = readUser(req);
  } catch {
    res.status(401).json({ error: "Log in again." });
    return;
  }
  try {
    const result = addProblem(req.body || {}, user.username);
    res.status(result.ok ? 201 : 400).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Could not save that question." });
  }
});

const dist = path.resolve(__dirname, "../dist");
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api|\/socket\.io).*/, (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: "That request was not valid JSON." });
    return;
  }
  console.error(err);
  if (!res.headersSent) res.status(500).json({ error: "Something went wrong on the server." });
});

function cleanName(name) {
  const value = String(name || "").trim().slice(0, 20);
  return value || "friend";
}

io.use((socket, next) => {
  try {
    socket.user = verifyToken(socket.handshake.auth?.token);
    next();
  } catch {
    next(new Error("Login required"));
  }
});

io.on("connection", (socket) => {
  socket.on("room:create", (_payload, ack) => {
    try {
      const state = createRoom(socket.id, cleanName(socket.user.username));
      socket.join(state.code);
      ack?.({ ok: true, state });
    } catch (err) {
      console.error(err);
      ack?.({ ok: false, error: err.message || "Could not open a room." });
    }
  });

  socket.on("room:join", ({ code }, ack) => {
    const result = joinRoom(socket.id, code, cleanName(socket.user.username));
    if (!result.ok) {
      ack?.({ ok: false, error: result.error });
      return;
    }
    socket.join(result.state.code);
    socket.to(result.state.code).emit("presence", result.state.members);
    ack?.({ ok: true, state: result.state });
  });

  socket.on("code:edit", ({ source }) => {
    const code = roomCodeFor(socket.id);
    if (!code) return;
    const next = setSource(code, source);
    socket.to(code).emit("code:edit", next);
  });

  socket.on("problem:pick", ({ slug }) => {
    const code = roomCodeFor(socket.id);
    if (!code) return;
    const state = setProblem(code, slug);
    if (state) {
      io.to(code).emit("problem:set", {
        problemSlug: state.problemSlug,
        source: state.source,
        opened: state.opened,
        ideas: state.ideas,
      });
    }
  });

  socket.on("idea:seal", ({ text }, ack) => {
    const code = roomCodeFor(socket.id);
    if (!code) {
      ack?.({ ok: false, error: "You are not in this room." });
      return;
    }
    const ideas = sealIdea(code, socket.id, text);
    if (!ideas.ok) {
      ack?.(ideas);
      return;
    }
    io.to(code).emit("ideas", ideas);
    ack?.(ideas);
  });

  socket.on("chat:send", ({ text }) => {
    const code = roomCodeFor(socket.id);
    if (!code) return;
    const chat = addChat(code, socket.id, text);
    io.to(code).emit("chat", chat);
  });

  socket.on("disconnect", () => {
    const update = leaveRoom(socket.id);
    if (update && !update.closed) io.to(update.code).emit("presence", update.members);
  });
});

httpServer.listen(port, () => {
  console.log(`CodeSquad room server on ${port}`);
});
