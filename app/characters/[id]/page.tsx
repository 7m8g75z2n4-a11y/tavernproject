"use client";

import { CharacterOrb3D } from "@/app/components/CharacterOrb3D";
import { charactersById } from "@/lib/data";
import { useState } from "react";

type PageProps = {
  params: { id: string };
};

const tabs = ["Overview", "Stats", "Inventory"] as const;
type Tab = (typeof tabs)[number];

export default function CharacterSheetPage({ params }: PageProps) {
  const character = charactersById[params.id] ?? charactersById["1"];

  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  return (
    <div className="character-layout">
      <section className="character-sheet">
        <header className="character-sheet-header">
          <div>
            <h1>{character.name}</h1>
            <p className="character-subtitle">{character.subtitle}</p>
          </div>
          <div className="character-badges">
            <span className="character-badge">HP {character.hp}</span>
            <span className="character-badge">AC {character.ac}</span>
            <span className="character-badge">Speed {character.speed}</span>
          </div>
        </header>

        <nav className="character-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`character-tab${activeTab === tab ? " character-tab--active" : ""}`}
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="character-sheet-body">
          {activeTab === "Overview" && (
            <div className="sheet-overview">
              <h2>Story</h2>
              <p>{character.notes}</p>

              <h3>Key Features</h3>
              <ul className="sheet-list">
                {character.features.map((f: string) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "Stats" && (
            <div className="sheet-stats">
              <h2>Ability Scores</h2>
              <div className="stats-grid">
                {Object.entries(character.stats).map(([key, value]) => (
                  <div key={key} className="stat-box">
                    <span className="stat-label">{key}</span>
                    <span className="stat-value">{value as number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Inventory" && (
            <div className="sheet-inventory">
              <h2>Inventory</h2>
              <ul className="sheet-list">
                {character.inventory.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <aside className="character-portrait">
        <div className="portrait-orb">
          <CharacterOrb3D />
        </div>
        <p className="portrait-caption">
          Your hero will appear here in 3D, resting between adventures.
        </p>
      </aside>
    </div>
  );
}
