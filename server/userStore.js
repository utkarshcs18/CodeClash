import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data/users.json");
const secret = process.env.JWT_SECRET || "codesquad-dev-secret";

function read() {
  if (!existsSync(file)) return [];
  return JSON.parse(readFileSync(file, "utf8"));
}

function write(users) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(users, null, 2));
}

function publicUser(user) {
  return { id: user.id, username: user.username, email: user.email };
}

export async function registerUser({ username, email, password }) {
  const name = String(username || "").trim().slice(0, 20);
  const mail = String(email || "").trim().toLowerCase();
  const pass = String(password || "");
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(name)) {
    return { ok: false, error: "Username is 3–20 letters, numbers, or underscores." };
  }
  if (!mail.includes("@") || !mail.includes(".")) {
    return { ok: false, error: "Enter a real email." };
  }
  if (pass.length < 6) return { ok: false, error: "Password needs at least 6 characters." };
  const users = read();
  if (users.some((user) => user.username.toLowerCase() === name.toLowerCase() || user.email === mail)) {
    return { ok: false, error: "That username or email is already used." };
  }
  const user = {
    id: `${Date.now()}`,
    username: name,
    email: mail,
    passwordHash: await bcrypt.hash(pass, 10),
  };
  users.push(user);
  write(users);
  return { ok: true, token: sign(user), user: publicUser(user) };
}

export async function loginUser({ email, password }) {
  const mail = String(email || "").trim().toLowerCase();
  const users = read();
  const user = users.find((item) => item.email === mail || item.username.toLowerCase() === mail);
  if (!user || !(await bcrypt.compare(String(password || ""), user.passwordHash))) {
    return { ok: false, error: "Email or password is wrong." };
  }
  return { ok: true, token: sign(user), user: publicUser(user) };
}

export function verifyToken(token) {
  const payload = jwt.verify(token, secret);
  const user = read().find((item) => item.id === payload.id);
  if (!user) throw new Error("missing user");
  return publicUser(user);
}

function sign(user) {
  return jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: "7d" });
}
