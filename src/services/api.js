import { authToken } from "./socket.js";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body) headers["Content-Type"] = "application/json";
  const token = authToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(path, { ...options, headers });
  } catch {
    throw new ApiError("The room server did not answer. Run npm run dev, then try again.", 0);
  }

  const data = await response.json().catch(() => ({}));
  if (response.status === 401) throw new ApiError(data.error || "Log in again.", 401);
  if (!response.ok) throw new ApiError(data.error || "That request failed.", response.status);
  return data;
}
