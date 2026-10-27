import { useEffect, useState } from "react";

export function RoomView({
  roomCode,
  room,
  error,
  problem,
  problems,
  source,
  guide,
  step,
  results,
  running,
  chatText,
  copied,
  draft,
  meId,
  stamped,
  onGuide,
  onStep,
  onSource,
  onPick,
  onApproach,
  onRun,
  onSubmit,
  onChat,
  onSend,
  onCopy,
  onLeave,
  onDraft,
  onSeal,
}) {
  const [notes, setNotes] = useState(false);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [problem.slug]);

  if (error) {
    return (
      <div className="wrap">
        <div className="card missing">
          <h1>Room not found</h1>
          <p>{error}</p>
          <button className="btn btn-dark" type="button" onClick={onLeave}>
            Back home
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="studio">
        <p className="lede">Opening room {roomCode}…</p>
      </div>
    );
  }

  const opened = room.opened;
  const ideas = room.ideas || [];
  const mine = ideas.find((idea) => idea.id === meId);
  const passed = results?.rows?.filter((row) => row.pass).length ?? 0;
  const currentStep = problem.steps[step];

  return (
    <div className="studio">
      <nav>
        <a className="brand" href="/">
          <div className="mark" aria-hidden="true">
            <span />
          </div>
          CodeSquad
        </a>
        <div className="ritual" aria-label="Room ritual">
          <span className={!opened ? "now" : "done"}>Say it</span>
          <span className={opened && !stamped ? "now" : opened ? "done" : ""}>Open</span>
          <span className={stamped ? "now" : ""}>Keep the pattern</span>
        </div>
        <div className="room-meta">
          <button className="seal-token" type="button" onClick={onCopy}>
            {copied ? "Copied" : roomCode}
          </button>
          <div className="member-row">
            {room.members.map((member) => (
              <span key={member.id} className="person online">
                <span className="avatar" style={{ background: colorFor(member.name) }}>
                  {member.name.slice(0, 1).toUpperCase()}
                </span>
                {member.name}
              </span>
            ))}
          </div>
        </div>
        <button className="btn btn-ghost" type="button" onClick={onLeave}>
          Leave
        </button>
      </nav>

      <div className="pattern-switch">
        {problems.map((item) => (
          <button
            key={item.slug}
            type="button"
            className={item.slug === problem.slug ? "chip on" : "chip"}
            onClick={() => onPick(item.slug)}
          >
            {item.title}
          </button>
        ))}
      </div>

      <section className="poster-scene">
        <div className={flipped ? "poster-inner is-back" : "poster-inner"}>
          <article className="poster face front" inert={flipped || undefined} aria-hidden={flipped}>
            <div className="plate">
              <span>Plate</span>
              <b>{String(Math.max(problems.findIndex((item) => item.slug === problem.slug), 0) + 1).padStart(2, "0")}</b>
            </div>
            <div className="poster-kicker">
              <span className={problem.difficulty === "Easy" ? "pill green" : "pill amber"}>{problem.difficulty}</span>
              {problem.tags.map((tag) => (
                <span key={tag} className="pill">
                  {tag}
                </span>
              ))}
            </div>
            <h1>{problem.title}</h1>
            <p className="ask">{problem.ask}</p>
            <p>{problem.story}</p>
            <div className="given-row">
              <div>
                <small>Given</small>
                <b>{problem.given}</b>
              </div>
              <div>
                <small>Return</small>
                <b>{problem.returns}</b>
              </div>
            </div>
          </article>
          <article className="poster face back" inert={!flipped || undefined} aria-hidden={!flipped}>
            <div className="step-nav">
              <button className="btn btn-ghost" type="button" onClick={() => onStep(Math.max(0, step - 1))} disabled={step === 0}>
                Back
              </button>
              <span>
                Step {step + 1} / {problem.steps.length}
              </span>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => onStep(Math.min(problem.steps.length - 1, step + 1))}
                disabled={step === problem.steps.length - 1}
              >
                Next
              </button>
            </div>
            <h2>{currentStep.title}</h2>
            <p>{currentStep.body}</p>
            {problem.examples.map((example) => (
              <div key={example.input} className="example">
                <code>{example.input}</code>
                <span>→ {example.output}</span>
                <small>{example.why}</small>
              </div>
            ))}
          </article>
        </div>
        <div className="poster-actions">
          <button className="btn btn-ghost" type="button" onClick={() => setFlipped((value) => !value)}>
            {flipped ? "Show the question" : "Flip to the walkthrough"}
          </button>
          <button className={guide === "hint" ? "btn btn-dark" : "btn btn-ghost"} type="button" onClick={() => onGuide(guide === "hint" ? "plain" : "hint")}>
            {guide === "hint" ? "Hide the hint" : "Peek at the pattern"}
          </button>
        </div>
        {guide === "hint" ? (
          <div className="hint-slip">
            <p>
              <b>{problem.pattern}</b> {problem.hint}
            </p>
            <button className="btn btn-dark" type="button" onClick={onApproach} disabled={!opened}>
              {opened ? "Lay this approach on the page" : "The page is still shut"}
            </button>
          </div>
        ) : null}
      </section>

      <section className="envelopes">
        {ideas.map((idea) => (
          <article key={idea.id} className={opened && idea.sealed ? "envelope open" : idea.sealed ? "envelope shut" : "envelope"}>
            <div className="flap" />
            <div className="envelope-body">
              <small>{idea.name}</small>
              {idea.id === meId && !idea.sealed ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    onSeal();
                  }}
                >
                  <textarea
                    value={draft}
                    onChange={(event) => onDraft(event.target.value)}
                    maxLength={180}
                    placeholder="In one sentence, what is this really asking?"
                    aria-label="Your sentence"
                  />
                  <button className="btn btn-dark" type="submit" disabled={!draft.trim()}>
                    Seal it
                  </button>
                </form>
              ) : null}
              {idea.sealed && !opened ? <p className="sealed-label">Sealed. Waiting for the other person.</p> : null}
              {opened && idea.sealed ? <p className="revealed">{idea.text}</p> : null}
              {idea.id !== meId && !idea.sealed ? <p className="sealed-label">Still writing. You cannot see it yet.</p> : null}
            </div>
          </article>
        ))}
      </section>

      <section className={opened ? "page awake" : "page asleep"}>
        {!opened ? (
          <div className="shutter">
            <strong>The page stays blank on purpose.</strong>
            <p>Each person writes one sentence. Nobody sees the other sentence until every envelope is sealed. Then the editor wakes up.</p>
          </div>
        ) : null}
        <div className="panel editor">
          <div className="editor-top">
            <div className="dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <span className="lang">{stamped ? "pattern kept" : "one shared page"}</span>
            <div className="hero-actions">
              <button className="btn btn-ghost" type="button" onClick={onRun} disabled={!opened || running}>
                Run
              </button>
              <button className="btn btn-dark" type="button" onClick={onSubmit} disabled={!opened || running}>
                Submit
              </button>
            </div>
          </div>
          <textarea
            className="code-input"
            value={source}
            spellCheck="false"
            disabled={!opened}
            onChange={(event) => onSource(event.target.value)}
            aria-label="Shared code"
          />
        </div>
        <div className="card result-card">
          {stamped ? <p className="kept">This pattern is in your deck. It is the thing worth coming back for.</p> : null}
          {!results && opened ? <p>Run checks the examples. A full submit, after the sentences were sealed, keeps the pattern.</p> : null}
          {results?.error ? <p className="form-error">{results.error}</p> : null}
          {results && !results.error ? (
            <>
              <strong>
                {results.mode}: {passed}/{results.rows.length}
              </strong>
              {results.rows.map((row, index) => (
                <div key={index} className="verdict">
                  <span>{row.hidden ? `Hidden ${index + 1}` : `Example ${index + 1}`}</span>
                  <b>{row.pass ? "Passed" : "Not yet"}</b>
                </div>
              ))}
            </>
          ) : null}
        </div>
      </section>

      <button className="notes-tab" type="button" onClick={() => setNotes((value) => !value)}>
        {notes ? "Close notes" : `Notes ${room.chat.length ? `(${room.chat.length})` : ""}`}
      </button>
      {notes ? (
        <aside className="notes-dock">
          <div className="chat-log">
            {room.chat.length === 0 ? <p>A margin note, not a second editor.</p> : null}
            {room.chat.map((message) => (
              <p key={message.id}>
                <b>{message.name}</b> {message.text}
              </p>
            ))}
          </div>
          <form onSubmit={onSend} className="chat-form">
            <input value={chatText} onChange={(event) => onChat(event.target.value)} placeholder="Say it shorter" maxLength={400} />
            <button className="btn btn-dark" type="submit">
              Send
            </button>
          </form>
        </aside>
      ) : null}
    </div>
  );
}

function colorFor(name) {
  const colors = ["#1a56db", "#0e8f9a", "#0f9f6e", "#b7791f", "#7c3aed"];
  return colors[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length];
}
