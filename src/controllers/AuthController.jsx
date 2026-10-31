import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { saveSession } from "../services/socket.js";
import { AuthView } from "../views/AuthView.jsx";

export function AuthController({ mode }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const path = mode === "signup" ? "/api/auth/register" : "/api/auth/login";
      const result = await api(path, { method: "POST", body: JSON.stringify(form) });
      if (!result?.token || !result?.user) {
        setError("The server did not finish signing you in.");
        return;
      }
      saveSession(result.token, result.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return <AuthView mode={mode} form={form} error={error} busy={busy} onChange={update} onSubmit={submit} />;
}
