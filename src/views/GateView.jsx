import { Link } from "react-router-dom";

export function GateView() {
  return (
    <div className="wrap fit-screen">
      <nav>
        <Link className="brand" to="/">
          <div className="mark" aria-hidden="true">
            <span />
          </div>
          CodeSquad
        </Link>
      </nav>
      <header className="hero">
        <div>
          <div className="kicker">The hall is private</div>
          <div className="flank">
            <span>Friends only<br />past this door</span>
            <h1>
              Give your name.
              <br />
              <em>Then the room opens.</em>
            </h1>
            <span>Sentences<br />before code</span>
          </div>
          <p className="lede">
            Two people, one question, and a sentence each before the editor wakes. The hall starts when you log in or take a seat.
          </p>
        </div>
        <div className="doors">
          <Link className="door" to="/login">
            <small>Already seated</small>
            <strong>Log in</strong>
            <span>Come back to your name and open a room.</span>
          </Link>
          <Link className="door" to="/signup">
            <small>First visit</small>
            <strong>Sign up</strong>
            <span>Make a seat. A friend can join with the room code.</span>
          </Link>
        </div>
      </header>
    </div>
  );
}
