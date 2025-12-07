import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="landing-content">
        <div className="landing-heading">
          <h1>TAVERN</h1>
          <p className="subtitle">Where your characters gather.</p>
        </div>

        <div className="landing-card">
          <div className="landing-illustration">
            <div className="house-silhouette" />
          </div>

          <div className="landing-text">
            <h2>A home between campaigns.</h2>
            <p>
              Bring your characters to life in 3D, join a party with a link, and continue your adventure
              across campaigns.
            </p>
            <div className="landing-actions">
              <Link href="/auth">
                <button className="btn-primary" type="button">
                  Create Account
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="btn-secondary" type="button">
                  Explore Demo
                </button>
              </Link>
            </div>
            <p className="tagline">Your story continues inside.</p>
          </div>
        </div>
      </div>

      <div className="landing-lantern" />
    </div>
  );
}
