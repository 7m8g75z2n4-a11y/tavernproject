"use client";

import { useState } from "react";

const mockCharacters: Record<string, any> = {
  "1": {
    id: "1",
    name: "Elira Dawnwhisper",
    subtitle: "Elf Ranger • Level 5",
    hp: "38 / 38",
    ac: 15,
    speed: "30 ft",
    stats: {
      STR: 10,
      DEX: 18,
      CON: 14,
      INT: 12,
      WIS: 16,
      CHA: 11,
    },
    features: ["Favored Foe", "Sharpshooter", "Natural Explorer"],
    inventory: ["Longbow", "Shortswords (2)", "Traveler’s Cloak", "Healing Potion (x2)"],
    notes: "Scout and archer of the party. Distrustful of cities, prefers the treeline.",
  },
  "2": {
    id: "2",
    name: "Brother Hal",
    subtitle: "Human Cleric • Level 3",
    hp: "26 / 26",
    ac: 17,
    speed: "30 ft",
    stats: {
      STR: 12,
      DEX: 10,
      CON: 14,
      INT: 11,
      WIS: 16,
      CHA: 13,
    },
    features: ["Channel Divinity", "Bless", "Spare the Dying"],
    inventory: ["Mace", "Shield", "Healer’s Kit", "Holy Symbol"],
    notes: "Kind-hearted cleric who tends to the wounded and keeps spirits lifted.",
  },
};

type PageProps = {
  params: { id: string };
};

const tabs = ["Overview", "Stats", "Inventory"] as const;
type Tab = (typeof tabs)[number];

export default function CharacterSheetPage({ params }: PageProps) {
  const character = mockCharacters[params.id] ?? mockCharacters["1"];

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
          <div className="portrait-silhouette" />
        </div>
        <p className="portrait-caption">
          Your hero will appear here in 3D, resting between adventures.
        </p>
      </aside>
    </div>
  );
}
