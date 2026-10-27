import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readDeck } from "../models/deck.js";
import { api } from "../services/api.js";
import { clearSession, currentUser, getSocket } from "../services/socket.js";
import { LobbyView } from "../views/LobbyView.jsx";

const emptyQuestion = {
  title: "",
  ask: "",
  story: "",
  starter: "function solve() {\n  \n}\n",
  testArgs: "[]",
  testExpected: "null",
};

export function LobbyController() {
  const navigate = useNavigate();
  const user = currentUser();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deck] = useState(() => readDeck());
  const [problems, setProblems] = useState([]);
  const [question, setQuestion] = useState(emptyQuestion);

  useEffect(() => {
    api("/api/problems").then(setProblems).catch((err) => setError(err.message));
  }, []);

  function createRoom() {
    setBusy(true);
    setError("");
    const timer = setTimeout(() => {
      setBusy(false);
      setError("The room server did not answer. Run npm run dev, then try again.");
    }, 4000);
    getSocket().emit("room:create", {}, (result) => {
      clearTimeout(timer);
      setBusy(false);
      if (!result?.ok) {
        setError("The room server did not answer. Run npm run dev, then try again.");
        return;
      }
      navigate(`/room/${result.state.code}`);
    });
  }

  function joinRoom(event) {
    event.preventDefault();
    const nextCode = code.trim().toUpperCase();
    if (!nextCode) {
      setError("Enter the room code your friend sent.");
      return;
    }
    setBusy(true);
    setError("");
    getSocket().emit("room:join", { code: nextCode }, (result) => {
      setBusy(false);
      if (!result?.ok) {
        setError(result?.error || "Could not join that room.");
        return;
      }
      navigate(`/room/${result.state.code}`);
    });
  }

  async function addQuestion(event) {
    event.preventDefault();
    setError("");
    try {
      const result = await api("/api/problems", { method: "POST", body: JSON.stringify(question) });
      setProblems((list) => [...list, result.problem]);
      setQuestion(emptyQuestion);
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    clearSession();
    navigate("/");
  }

  return (
    <LobbyView
      user={user}
      code={code}
      error={error}
      busy={busy}
      deck={deck}
      problems={problems}
      question={question}
      onCode={setCode}
      onQuestion={(key, value) => setQuestion((current) => ({ ...current, [key]: value }))}
      onCreate={createRoom}
      onJoin={joinRoom}
      onAdd={addQuestion}
      onLogout={logout}
    />
  );
}
