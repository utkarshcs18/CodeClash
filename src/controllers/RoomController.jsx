import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { rememberPattern } from "../models/deck.js";
import { runTests } from "../models/runTests.js";
import { api } from "../services/api.js";
import { clearSession, emitAck, getSocket } from "../services/socket.js";
import { RoomView } from "../views/RoomView.jsx";

const blankProblem = {
  slug: "",
  title: "Loading question",
  difficulty: "Easy",
  tags: [],
  ask: "",
  given: "",
  returns: "",
  story: "",
  steps: [{ title: "Loading", body: "" }],
  examples: [],
  pattern: "",
  hint: "",
  approach: "",
  starter: "",
};

export function RoomController() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const roomCode = code.toUpperCase();
  const [problems, setProblems] = useState([]);
  const [room, setRoom] = useState(null);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [guide, setGuide] = useState("plain");
  const [step, setStep] = useState(0);
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [chatText, setChatText] = useState("");
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState("");
  const [stamped, setStamped] = useState(false);
  const [meId, setMeId] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let gone = false;
    const socket = getSocket();

    function onPresence(members) {
      setRoom((current) => (current ? { ...current, members } : current));
    }
    function onChat(chat) {
      setRoom((current) => (current ? { ...current, chat } : current));
    }
    function onCode(nextSource) {
      setSource(nextSource);
    }
    function onProblem(payload) {
      setRoom((current) => (current ? { ...current, ...payload } : current));
      setSource(payload.source);
      setStep(0);
      setResults(null);
      setGuide("plain");
      setDraft("");
      setStamped(false);
      setNotice("");
    }
    function onIdeas(payload) {
      setRoom((current) => (current ? { ...current, opened: payload.opened, ideas: payload.ideas } : current));
    }
    function rememberId() {
      setMeId(socket.id);
    }
    function onFail(err) {
      if (gone) return;
      const login = /login required/i.test(err?.message || "");
      if (login) clearSession();
      setError(login ? "Log in again to open a room." : "Could not reach the room server.");
    }

    if (socket.connected) rememberId();
    socket.on("connect", rememberId);
    socket.on("connect_error", onFail);
    socket.on("presence", onPresence);
    socket.on("chat", onChat);
    socket.on("code:edit", onCode);
    socket.on("problem:set", onProblem);
    socket.on("ideas", onIdeas);
    emitAck("room:join", { code: roomCode }).then((result) => {
      if (gone) return;
      if (!result?.ok) {
        setError(result?.error || "Could not open this room.");
        return;
      }
      setMeId(socket.id);
      setRoom(result.state);
      setSource(result.state.source);
    }).catch((err) => {
      if (!gone) setError(err.message);
    });

    return () => {
      gone = true;
      socket.off("connect", rememberId);
      socket.off("connect_error", onFail);
      socket.off("presence", onPresence);
      socket.off("chat", onChat);
      socket.off("code:edit", onCode);
      socket.off("problem:set", onProblem);
      socket.off("ideas", onIdeas);
    };
  }, [roomCode]);

  useEffect(() => {
    api("/api/problems")
      .then((list) => setProblems(Array.isArray(list) ? list : []))
      .catch((err) => {
        if (err?.status === 401) {
          clearSession();
          navigate("/login");
          return;
        }
        setNotice(err.message);
      });
  }, []);

  const problem = problems.find((item) => item.slug === room?.problemSlug) || problems[0] || blankProblem;

  function editSource(next) {
    setSource(next);
    getSocket().emit("code:edit", { source: next });
  }

  function pickProblem(slug) {
    getSocket().emit("problem:pick", { slug });
  }

  function loadApproach() {
    editSource(problem.approach);
    setGuide("hint");
  }

  async function execute(hidden) {
    const tests = (problem.tests || []).filter((test) => hidden || !test.hidden);
    if (tests.length === 0) {
      setResults({ mode: hidden ? "Submit" : "Run", error: "This question has no tests yet.", rows: [] });
      return;
    }
    setRunning(true);
    try {
      const outcome = await runTests(source, tests);
      const rows = (outcome.results || []).map((result, index) => ({
        ...result,
        hidden: tests[index].hidden,
        expected: tests[index].expected,
      }));
      setResults({ mode: hidden ? "Submit" : "Run", error: outcome.error || "", rows });
      if (hidden && !outcome.error && rows.length > 0 && rows.every((row) => row.pass) && room?.opened) {
        rememberPattern(problem);
        setStamped(true);
      }
    } catch (err) {
      setResults({ mode: hidden ? "Submit" : "Run", error: err.message || "The tests could not run.", rows: [] });
    } finally {
      setRunning(false);
    }
  }

  async function sealDraft() {
    setNotice("");
    try {
      const result = await emitAck("idea:seal", { text: draft });
      if (!result?.ok) setNotice(result?.error || "Could not seal that sentence.");
    } catch (err) {
      setNotice(err.message);
    }
  }

  function sendChat(event) {
    event.preventDefault();
    const text = chatText.trim();
    if (!text) return;
    getSocket().emit("chat:send", { text });
    setChatText("");
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setNotice("Could not copy the room code. Select it and copy it yourself.");
    }
  }

  return (
    <RoomView
      roomCode={roomCode}
      room={room}
      error={error}
      problem={problem}
      problems={problems}
      source={source}
      guide={guide}
      step={step}
      results={results}
      running={running}
      chatText={chatText}
      copied={copied}
      onGuide={setGuide}
      onStep={setStep}
      onSource={editSource}
      onPick={pickProblem}
      onApproach={loadApproach}
      onRun={() => execute(false)}
      onSubmit={() => execute(true)}
      onChat={setChatText}
      onSend={sendChat}
      onCopy={copyCode}
      onLeave={() => navigate("/")}
      draft={draft}
      onDraft={setDraft}
      onSeal={sealDraft}
      meId={meId}
      notice={notice}
    />
  );
}
