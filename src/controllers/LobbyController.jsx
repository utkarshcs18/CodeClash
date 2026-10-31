import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readDeck } from "../models/deck.js";
import { api } from "../services/api.js";
import { clearSession, currentUser, emitAck, getSocket } from "../services/socket.js";
import { LobbyView } from "../views/LobbyView.jsx";

const emptyQuestion = {
  title: "",
  ask: "",
  story: "",
  starter: "function solve() {\n  \n}\n",
  testArgs: "[]",
  testExpected: "null",
};

function leaveIfExpired(err, navigate) {
  if (err?.status !== 401) return false;
  clearSession();
  navigate("/login");
  return true;
}

export function LobbyController() {
  const navigate = useNavigate();
  const user = currentUser();
  const [code, setCode] = useState("");
  const [roomError, setRoomError] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [pageError, setPageError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deck] = useState(() => readDeck());
  const [problems, setProblems] = useState([]);
  const [question, setQuestion] = useState(emptyQuestion);

  useEffect(() => {
    api("/api/problems")
      .then((list) => {
        setProblems(Array.isArray(list) ? list : []);
        if (!Array.isArray(list)) setPageError("Questions came back in an unexpected shape.");
      })
      .catch((err) => {
        if (leaveIfExpired(err, navigate)) return;
        setPageError(err.message);
      });
  }, [navigate]);

  useEffect(() => {
    const socket = getSocket();
    function onFail(err) {
      if (!/login required/i.test(err?.message || "")) return;
      clearSession();
      navigate("/login");
    }
    socket.on("connect_error", onFail);
    return () => socket.off("connect_error", onFail);
  }, [navigate]);

  async function createRoom() {
    setBusy(true);
    setRoomError("");
    try {
      const result = await emitAck("room:create", {});
      if (!result?.ok) {
        setRoomError(result?.error || "Could not open a room.");
        return;
      }
      navigate(`/room/${result.state.code}`);
    } catch (err) {
      setRoomError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom(event) {
    event.preventDefault();
    const nextCode = code.trim().toUpperCase();
    if (!nextCode) {
      setRoomError("Enter the room code your friend sent.");
      return;
    }
    setBusy(true);
    setRoomError("");
    try {
      const result = await emitAck("room:join", { code: nextCode });
      if (!result?.ok) {
        setRoomError(result?.error || "Could not join that room.");
        return;
      }
      navigate(`/room/${result.state.code}`);
    } catch (err) {
      setRoomError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function addQuestion(event) {
    event.preventDefault();
    setQuestionError("");
    try {
      const result = await api("/api/problems", { method: "POST", body: JSON.stringify(question) });
      if (!result?.problem) {
        setQuestionError("The question was not saved.");
        return;
      }
      setProblems((list) => [...list, result.problem]);
      setQuestion(emptyQuestion);
    } catch (err) {
      if (leaveIfExpired(err, navigate)) return;
      setQuestionError(err.message);
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
      roomError={roomError}
      questionError={questionError}
      pageError={pageError}
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
