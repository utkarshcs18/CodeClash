export function LobbyView({ user, code, roomError, questionError, pageError, busy, deck, problems, question, onCode, onQuestion, onCreate, onJoin, onAdd, onLogout }) {
  return (
    <div className="wrap">
      <nav>
        <a className="brand" href="/">
          <div className="mark" aria-hidden="true">
            <span />
          </div>
          CodeSquad
        </a>
        <button className="btn btn-ghost" type="button" onClick={onLogout}>
          Log out {user?.username}
        </button>
      </nav>

      <header className="hero" id="top">
        <div>
          <div className="kicker">
            <span className="pulse">
              <i />
            </span>
            Practice with friends
          </div>
          <div className="flank">
            <span>Private rooms<br />for two</span>
            <h1>
              Understand it first.
              <br />
              <em>Solve it together.</em>
            </h1>
            <span>Sentences<br />before code</span>
          </div>
          <p className="lede">
            The editor stays shut until each of you writes, in private, what the problem is really asking. Both sentences open together. A solved page only stays with you if you understood it first.
          </p>
          <div className="hero-actions">
            <a className="btn btn-dark" href="#join">
              Start a room
            </a>
            <a className="btn btn-ghost" href="#how">
              How a room works
            </a>
          </div>
        </div>

        <form className="panel editor" id="join" onSubmit={onJoin}>
          <div className="editor-top">
            <strong>Your room</strong>
            <span className="lang">signed in</span>
          </div>
          <p className="lede">Signed in as {user?.username}. Rooms use that name.</p>
          <button className="btn btn-dark" type="button" onClick={onCreate} disabled={busy}>
            Create a room
          </button>
          <label className="field">
            Or join with a code
            <input
              value={code}
              onChange={(event) => onCode(event.target.value.toUpperCase())}
              placeholder="4F2A"
              maxLength={6}
            />
          </label>
          <button className="btn btn-ghost" type="submit" disabled={busy}>
            Join room
          </button>
          {roomError ? <p className="form-error" role="alert">{roomError}</p> : null}
        </form>
      </header>

      <section className="order" aria-label="Order of a room">
        <article>
          <em>I</em>
          <h3>Seal a sentence</h3>
          <p>Each person writes what the question is asking. The other sentence stays hidden.</p>
        </article>
        <article>
          <em>II</em>
          <h3>Open together</h3>
          <p>When every envelope is sealed, both lines appear and the shared page wakes.</p>
        </article>
        <article>
          <em>III</em>
          <h3>Keep the pattern</h3>
          <p>A full submit after that opening is the only way a card turns face up.</p>
        </article>
      </section>

      <section id="how">
        <div className="section-head">
          <div>
            <div className="idx">Your deck</div>
            <h2>{deck.length ? `${deck.length} pattern${deck.length === 1 ? "" : "s"} kept.` : "Nothing kept yet."}</h2>
          </div>
          <p>A pattern enters the deck only after the room seals its sentences and the hidden tests pass. Face-down cards are still waiting.</p>
        </div>
        {pageError ? <p className="form-error" role="alert">{pageError}</p> : null}
        <div className="deck">
          {problems.map((problem, index) => {
            const owned = deck.find((card) => card.slug === problem.slug);
            return (
              <article key={problem.slug} className={owned ? "deck-card owned" : "deck-card"} style={{ "--tilt": `${(index - 2) * 2}deg` }}>
                <small>{owned ? "Kept" : "Unopened"}</small>
                <strong>{owned ? problem.pattern : "····"}</strong>
                <span>{problem.title}</span>
              </article>
            );
          })}
        </div>
        <ol className="catalogue">
          {problems.map((problem, index) => {
            const owned = deck.some((card) => card.slug === problem.slug);
            return (
              <li key={problem.slug}>
                <em>{String(index + 1).padStart(2, "0")}</em>
                <div>
                  <strong>{problem.title}</strong>
                  <small>
                    {problem.difficulty} · {problem.pattern}
                  </small>
                </div>
                <span>{owned ? "Kept" : "In the hall"}</span>
              </li>
            );
          })}
        </ol>

        <aside className="plaque">
          <small>House rule</small>
          <p>Do not open the editor to discover the question. Say it first. The code is the second reading, not the first.</p>
        </aside>

        <form className="card" onSubmit={onAdd}>
          <h3>Add a question</h3>
          <p>This is saved on the server. The next room can pick it. No code edit, no restart.</p>
          <label className="field">
            Title
            <input value={question.title} onChange={(event) => onQuestion("title", event.target.value)} required />
          </label>
          <label className="field">
            What is it asking?
            <input value={question.ask} onChange={(event) => onQuestion("ask", event.target.value)} required />
          </label>
          <label className="field">
            Plain explanation
            <textarea value={question.story} onChange={(event) => onQuestion("story", event.target.value)} required />
          </label>
          <label className="field">
            Sample args as JSON
            <input value={question.testArgs} onChange={(event) => onQuestion("testArgs", event.target.value)} />
          </label>
          <label className="field">
            Expected return as JSON
            <input value={question.testExpected} onChange={(event) => onQuestion("testExpected", event.target.value)} />
          </label>
          <button className="btn btn-dark" type="submit">
            Save question
          </button>
          {questionError ? <p className="form-error" role="alert">{questionError}</p> : null}
        </form>
        <p className="note">
          These are original problems in the style of coding-site questions. The wording is ours. The habit is the sentence you seal before the code, not a streak counter.
        </p>
      </section>
      <footer>
        <span>CodeSquad</span>
        <span>A private hall for pairs</span>
      </footer>
    </div>
  );
}
