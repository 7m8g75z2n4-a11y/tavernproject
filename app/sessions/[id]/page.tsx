"use client";

import { sessionsById } from "@/lib/data";
import { useParams } from "next/navigation";
import { useState } from "react";

type SessionPageProps = {
  params: { id: string };
};

export default function SessionPage({ params }: SessionPageProps) {
  const dynamicParams = useParams() as { id?: string };
  const sessionId = dynamicParams?.id ?? params.id ?? "demo-session";
  const session = sessionsById[sessionId] ?? sessionsById["1"];

  const [isMintingBadge, setIsMintingBadge] = useState(false);
  const [badgeMessage, setBadgeMessage] = useState<string | null>(null);
  const [badgeError, setBadgeError] = useState<string | null>(null);

  async function handleMintBadgeClick() {
    if (isMintingBadge) return;
    setIsMintingBadge(true);
    setBadgeMessage(null);
    setBadgeError(null);

    try {
      const res = await fetch("/api/badges/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) {
        const text = await res.text();
        setBadgeError("Badge mint failed. " + text);
        return;
      }

      const data = await res.json();
      if (data.ok) {
        const base = data.message ?? "Badge minted.";
        const tx = data.txHash ? ` Tx: ${data.txHash}` : "";
        setBadgeMessage(base + tx);
      } else {
        setBadgeError(data.error ?? "Badge mint failed on server.");
      }
    } catch (err) {
      console.error("Badge mint error", err);
      setBadgeError("Unexpected error while minting badge.");
    } finally {
      setIsMintingBadge(false);
    }
  }

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
          <div className="session-footer-actions">
            <button type="button" className="btn-secondary session-footer-btn">
              Save for Later
            </button>
            <button type="button" className="btn-primary session-footer-btn">
              End Session
            </button>
          </div>
          <button
            type="button"
            className="btn-secondary session-mint-badge-btn"
            onClick={handleMintBadgeClick}
            disabled={isMintingBadge}
          >
            {isMintingBadge ? "Minting Badge..." : "Mint Session Badge"}
          </button>
          {badgeMessage && <p className="session-mint-message">{badgeMessage}</p>}
          {badgeError && <p className="session-mint-error">{badgeError}</p>}
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
