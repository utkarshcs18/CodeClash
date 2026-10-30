import { Link } from "react-router-dom";

export function AuthView({ mode, form, error, busy, onChange, onSubmit }) {
  const signup = mode === "signup";
  return (
    <div className="wrap fit-screen">
      <nav>
        <Link className="brand" to="/">
          <div className="mark" aria-hidden="true">
            <span />
          </div>
          CodeSquad
        </Link>
        <Link className="btn btn-ghost" to={signup ? "/login" : "/signup"}>
          {signup ? "Log in" : "Sign up"}
        </Link>
      </nav>
      <header className="hero">
        <div>
          <div className="kicker">Account first</div>
          <div className="flank">
            <span>By invitation<br />of a friend</span>
            <h1>
            {signup ? "Make a seat." : "Come back in."}
            <br />
            <em>{signup ? "Then open a room." : "Your rooms are waiting."}</em>
            </h1>
            <span>No room<br />without a name</span>
          </div>
          <p className="lede">
            A room opens only after an account exists. Questions are loaded from the server, and a signed-in person can add a new one without editing code.
          </p>
        </div>
        <form className="panel editor" onSubmit={onSubmit}>
          <div className="editor-top">
            <strong>{signup ? "Sign up" : "Log in"}</strong>
          </div>
          {signup ? (
            <label className="field">
              Username
              <input value={form.username} onChange={(event) => onChange("username", event.target.value)} maxLength={20} required />
            </label>
          ) : null}
          <label className="field">
            {signup ? "Email" : "Email or username"}
            <input value={form.email} onChange={(event) => onChange("email", event.target.value)} required />
          </label>
          <label className="field">
            Password
            <input type="password" value={form.password} onChange={(event) => onChange("password", event.target.value)} required />
          </label>
          <button className="btn btn-dark" type="submit" disabled={busy}>
            {signup ? "Create account" : "Log in"}
          </button>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
        </form>
      </header>
    </div>
  );
}
