export default function AuthPage() {
  return (
    <div className="auth">
      <div className="auth-panel">
        <section className="auth-section auth-create">
          <h1 className="auth-title">TAVERN</h1>
          <h2 className="auth-heading">Create Account</h2>
          <form className="auth-form">
            <label className="auth-label">
              <span>Email</span>
              <input type="email" className="auth-input" />
            </label>
            <label className="auth-label">
              <span>Password</span>
              <input type="password" className="auth-input" />
            </label>
            <button type="button" className="btn-primary auth-submit">
              Enter
            </button>
          </form>
        </section>

        <div className="auth-divider">
          <span>Sign In</span>
        </div>

        <section className="auth-section auth-signin">
          <form className="auth-form">
            <label className="auth-label">
              <span>Email Address</span>
              <input type="email" className="auth-input" />
            </label>
            <label className="auth-label">
              <span>Password</span>
              <input type="password" className="auth-input" />
            </label>
            <button type="button" className="btn-secondary auth-submit auth-google">
              <span className="auth-google-icon" />
              Continue with Google
            </button>
          </form>
          <p className="auth-footnote">
            The Tavern keeps your characters safe and your stories yours.
          </p>
        </section>
      </div>
      <div className="auth-lantern" />
    </div>
  );
}
