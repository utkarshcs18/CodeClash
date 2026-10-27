import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { rememberPattern } from "../models/deck.js";
import { runTests } from "../models/runTests.js";
import { api } from "../services/api.js";
import { currentUser, getSocket } from "../services/socket.js";
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
  const [name] = useState(() => currentUser()?.username || "friend");
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

  useEffect(() => {
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
    }
    function onIdeas(payload) {
      setRoom((current) => (current ? { ...current, opened: payload.opened, ideas: payload.ideas } : current));
    }
    function rememberId() {
      setMeId(socket.id);
    }

    if (socket.connected) rememberId();
    socket.on("connect", rememberId);
    socket.on("presence", onPresence);
    socket.on("chat", onChat);
    socket.on("code:edit", onCode);
    socket.on("problem:set", onProblem);
    socket.on("ideas", onIdeas);
    socket.emit("room:join", { code: roomCode, name }, (result) => {
      if (!result?.ok) {
        setError(result?.error || "Could not open this room.");
        return;
      }
      setMeId(socket.id);
      setRoom(result.state);
      setSource(result.state.source);
    });

    return () => {
      socket.off("connect", rememberId);
      socket.off("presence", onPresence);
      socket.off("chat", onChat);
      socket.off("code:edit", onCode);
      socket.off("problem:set", onProblem);
      socket.off("ideas", onIdeas);
    };
  }, [roomCode, name]);

  useEffect(() => {
    api("/api/problems").then(setProblems).catch(() => setError("Could not load questions."));
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
    setRunning(true);
    const tests = problem.tests.filter((test) => hidden || !test.hidden);
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
    setRunning(false);
  }

  function sealDraft() {
    getSocket().emit("idea:seal", { text: draft });
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
      setCopied(false);
    }
  }

  return (
    <RoomView
      roomCode={roomCode}
      name={name}
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
      stamped={stamped}
    />
  );
}
