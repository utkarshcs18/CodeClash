import { io } from "socket.io-client";

let socket;

export function authToken() {
  return localStorage.getItem("codesquad-token") || "";
}

export function currentUser() {
  try {
    return JSON.parse(localStorage.getItem("codesquad-user") || "null");
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  localStorage.setItem("codesquad-token", token);
  localStorage.setItem("codesquad-user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("codesquad-token");
  localStorage.removeItem("codesquad-user");
  socket?.disconnect();
  socket = null;
}

export function getSocket() {
  const token = authToken();
  if (socket && socket.auth?.token !== token) {
    socket.disconnect();
    socket = null;
  }
  if (!socket) socket = io({ auth: { token } });
  return socket;
}

export function emitAck(event, payload, ms = 4000) {
  const socket = getSocket();
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("The room server did not answer. Run npm run dev, then try again."));
    }, ms);
    socket.emit(event, payload, (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    });
  });
}
