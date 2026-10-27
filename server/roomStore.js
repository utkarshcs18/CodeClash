import { getProblem, listProblems } from "./problemStore.js";

const rooms = new Map();
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode() {
  let code = "";
  for (let i = 0; i < 4; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return rooms.has(code) ? makeCode() : code;
}

function ideaView(room) {
  return {
    opened: room.opened,
    ideas: [...room.members.values()].map((member) => {
      const idea = room.ideas.get(member.id);
      return {
        id: member.id,
        name: member.name,
        sealed: Boolean(idea?.sealed),
        text: room.opened ? idea?.text || "" : "",
      };
    }),
  };
}

function publicRoom(room) {
  return {
    code: room.code,
    problemSlug: room.problemSlug,
    source: room.source,
    members: [...room.members.values()],
    chat: room.chat,
    ...ideaView(room),
  };
}

function addMember(room, socketId, name) {
  room.members.set(socketId, {
    id: socketId,
    name: name.slice(0, 20),
  });
}

export function createRoom(socketId, name) {
  const problem = listProblems()[0];
  const room = {
    code: makeCode(),
    problemSlug: problem.slug,
    source: problem.starter,
    members: new Map(),
    chat: [],
    ideas: new Map(),
    opened: false,
  };
  addMember(room, socketId, name);
  rooms.set(room.code, room);
  return publicRoom(room);
}

export function joinRoom(socketId, code, name) {
  const room = rooms.get(String(code || "").toUpperCase());
  if (!room) return { ok: false, error: "That room code does not exist." };
  addMember(room, socketId, name);
  return { ok: true, state: publicRoom(room) };
}

export function leaveRoom(socketId) {
  for (const [code, room] of rooms) {
    if (!room.members.has(socketId)) continue;
    room.members.delete(socketId);
    room.ideas.delete(socketId);
    if (room.members.size === 0) rooms.delete(code);
    return room.members.size ? { code, members: [...room.members.values()] } : { code, closed: true };
  }
  return null;
}

export function setSource(code, source) {
  const room = rooms.get(code);
  if (!room) return null;
  room.source = String(source).slice(0, 20000);
  return room.source;
}

export function setProblem(code, slug) {
  const room = rooms.get(code);
  if (!room) return null;
  const problem = getProblem(slug);
  room.problemSlug = problem.slug;
  room.source = problem.starter;
  room.ideas = new Map();
  room.opened = false;
  return publicRoom(room);
}

export function sealIdea(code, socketId, text) {
  const room = rooms.get(code);
  if (!room) return null;
  const member = room.members.get(socketId);
  const clean = String(text || "").trim().slice(0, 180);
  if (!member || !clean || room.ideas.get(socketId)?.sealed) return ideaView(room);
  room.ideas.set(socketId, { name: member.name, text: clean, sealed: true });
  const stillWriting = [...room.members.keys()].some((id) => !room.ideas.get(id)?.sealed);
  if (!stillWriting) room.opened = true;
  return ideaView(room);
}

export function addChat(code, socketId, text) {
  const room = rooms.get(code);
  if (!room) return null;
  const member = room.members.get(socketId);
  const clean = String(text || "").trim().slice(0, 400);
  if (!member || !clean) return room.chat;
  room.chat = [...room.chat, { id: `${Date.now()}-${socketId}`, name: member.name, text: clean }].slice(-40);
  return room.chat;
}

export function roomCodeFor(socketId) {
  for (const room of rooms.values()) {
    if (room.members.has(socketId)) return room.code;
  }
  return null;
}
