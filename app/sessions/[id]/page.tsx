"use client";

import { sessionsById } from "@/lib/data";

type SessionPageProps = {
  params: { id: string };
};

export default function SessionPage({ params }: SessionPageProps) {
  const session = sessionsById[params.id] ?? sessionsById["1"];

  return (
    <div className="session-layout">
      <section className="session-scroll">
        <header className="session-header">
          <div>
            <h1>{session.title}</h1>
            <p className="session-subtitle">{session.date}</p>
          </div>
          <div className="session-party-tag">{session.partyName}</div>
        </header>

        <div className="session-body">
          <div className="session-row">
            <label>
              <span className="session-label">XP Awarded</span>
              <input className="session-input" type="number" placeholder="e.g. 450" />
            </label>
            <label>
              <span className="session-label">Per Player?</span>
              <input className="session-input" type="text" placeholder="Yes / No / Notes" />
            </label>
          </div>

          <div className="session-row">
            <label>
              <span className="session-label">HP Change</span>
              <input className="session-input" type="text" placeholder="+5 to Elira, -8 to Hal..." />
            </label>
            <label>
              <span className="session-label">Gold &amp; Loot</span>
              <input className="session-input" type="text" placeholder="120g, obsidian ring, etc." />
            </label>
          </div>

          <div className="session-column">
            <span className="session-label">Conditions</span>
            <div className="session-chips">
              {["Poisoned", "Stunned", "Prone", "Exhausted"].map((cond) => (
                <button key={cond} type="button" className="session-chip">
                  {cond}
                </button>
              ))}
              <input className="session-input session-input--inline" type="text" placeholder="Other..." />
            </div>
          </div>

          <div className="session-column">
            <span className="session-label">Session Notes</span>
            <textarea
              className="session-notes"
              rows={6}
              placeholder="What happened tonight? Major beats, NPCs, promises, consequences..."
            />
          </div>
        </div>

        <footer className="session-footer">
          <button type="button" className="btn-secondary session-footer-btn">
            Save for Later
          </button>
          <button type="button" className="btn-primary session-footer-btn">
            End Session
          </button>
        </footer>
      </section>

      <aside className="session-side">
        <div className="session-side-card">
          <h2>At the Table</h2>
          <p>
            Use this panel to track what changed this session. When we add persistence, this will feed into
            characters, campaigns, and logs.
          </p>
        </div>
      </aside>
    </div>
  );
}
