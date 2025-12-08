"use client";

import Link from "next/link";
import { useState } from "react";
import type { Character, Campaign } from "@prisma/client";

type DashboardClientProps = {
  initialCharacters: Character[];
  initialCampaigns: Campaign[];
};

export default function DashboardClient({
  initialCharacters,
  initialCampaigns,
}: DashboardClientProps) {
  const [characters] = useState<Character[]>(initialCharacters);
  const [campaigns] = useState<Campaign[]>(initialCampaigns);

  return (
    <div className="dashboard">
      {/* Tabs */}
      <nav className="dashboard-tabs">
        <button className="dashboard-tab dashboard-tab--active">
          Characters
        </button>
        <button className="dashboard-tab">Campaigns</button>
        <button className="dashboard-tab">Settings</button>
      </nav>

      <div className="dashboard-content">
        {/* Characters panel */}
        <section className="dashboard-section">
          <header className="dashboard-section-header">
            <div>
              <h2>Your Characters</h2>
              <p>Bring your heroes back to the table anytime.</p>
            </div>
            <Link href="/characters/new">
              <button className="btn-primary dashboard-section-cta">
                + Add Character
              </button>
            </Link>
          </header>

          <div className="dashboard-grid">
            {characters.map((c) => (
              <article
                key={c.id}
                className="card parchment-card character-card"
              >
                <div className="card-header">
                  <h3>{c.name}</h3>
                  {c.subtitle && (
                    <p className="card-subtitle">{c.subtitle}</p>
                  )}
                </div>
                <p className="card-meta">
                  {c.hp ? `HP ${c.hp}` : "HP —"}
                  {c.ac != null ? ` • AC ${c.ac}` : ""}
                </p>
                <Link href={`/characters/${c.id}`}>
                  <button className="btn-secondary card-button">
                    Open Sheet
                  </button>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Campaigns panel */}
        <section className="dashboard-section">
          <header className="dashboard-section-header">
            <div>
              <h2>Your Campaigns</h2>
              <p>Step back into the stories you&apos;re telling.</p>
            </div>
            <Link href="/campaigns/new">
              <button className="btn-secondary dashboard-section-cta">
                Host a Campaign
              </button>
            </Link>
          </header>

          <div className="dashboard-grid">
            {campaigns.length === 0 && (
              <p className="dashboard-empty">
                You don&apos;t have any campaigns yet. Host one to begin.
              </p>
            )}

            {campaigns.map((c) => (
              <article
                key={c.id}
                className="card parchment-card campaign-card"
              >
                <div className="card-header">
                  <h3>{c.name}</h3>
                  {c.gmName && (
                    <p className="card-subtitle">GM {c.gmName}</p>
                  )}
                </div>
                <p className="card-meta">
                  Created{" "}
                  {new Date(c.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <Link href={`/campaigns/${c.id}`}>
                  <button className="btn-secondary card-button">
                    Open Campaign
                  </button>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}


