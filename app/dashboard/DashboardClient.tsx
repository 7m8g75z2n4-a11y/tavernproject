"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { campaigns, characters as seedCharacters } from "@/lib/data";
import { loadCharactersFromStorage, saveCharactersToStorage } from "@/lib/storage";
import type { Character } from "@/lib/data";

export default function DashboardClient() {
  const [characters, setCharacters] = useState<Character[]>(seedCharacters);

  useEffect(() => {
    const stored = loadCharactersFromStorage();
    if (stored && stored.length > 0) {
      setCharacters(stored);
    }
  }, []);

  useEffect(() => {
    saveCharactersToStorage(characters);
  }, [characters]);

  return (
    <div className="dashboard">
      <nav className="dashboard-tabs">
        <button className="dashboard-tab dashboard-tab--active" type="button">
          Characters
        </button>
        <button className="dashboard-tab" type="button">
          Campaigns
        </button>
        <button className="dashboard-tab" type="button">
          Settings
        </button>
      </nav>

      <div className="dashboard-content">
        <section className="dashboard-section">
          <header className="dashboard-section-header">
            <div>
              <h2>Your Characters</h2>
              <p>Bring your heroes back to the table anytime.</p>
            </div>
            <Link href="/characters/new">
              <button className="btn-primary dashboard-section-cta" type="button">
                + Add Character
              </button>
            </Link>
          </header>

          <div className="dashboard-grid">
            {characters.map((c) => (
              <article key={c.id} className="card parchment-card character-card">
                <div className="card-header">
                  <h3>{c.name}</h3>
                  <p className="card-subtitle">{c.subtitle}</p>
                </div>
                <p className="card-meta">
                  HP {c.hp} • AC {c.ac}
                </p>
                <Link href={`/characters/${c.id}`}>
                  <button className="btn-secondary card-button" type="button">
                    Open Sheet
                  </button>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <header className="dashboard-section-header">
            <div>
              <h2>Your Campaigns</h2>
              <p>Step back into the stories you&apos;re telling.</p>
            </div>
            <button className="btn-secondary dashboard-section-cta" type="button">
              Host a Campaign
            </button>
          </header>

          <div className="dashboard-grid">
            {campaigns.map((c) => (
              <article key={c.id} className="card parchment-card campaign-card">
                <div className="card-header">
                  <h3>{c.name}</h3>
                  <p className="card-subtitle">{c.gm}</p>
                </div>
                <p className="card-meta">Party size: {c.party.length}</p>
                <Link href={`/campaigns/${c.id}`}>
                  <button className="btn-secondary card-button" type="button">
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
