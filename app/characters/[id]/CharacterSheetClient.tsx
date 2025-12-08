"use client";

import { useState } from "react";
import type { Character } from "@prisma/client";

type SheetTab = "overview" | "stats" | "notes";

export default function CharacterSheetClient({
  character,
}: {
  character: Character;
}) {
  const [activeTab, setActiveTab] = useState<SheetTab>("overview");

  const displayName = character.name || "Unnamed Hero";
  const subtitle = character.subtitle || "Level 1 Adventurer";

  return (
    <div className="character-layout">
      {/* Left: sheet */}
      <section className="character-sheet parchment-card">
        <header className="character-sheet-header">
          <h1>{displayName}</h1>
          <p className="character-sheet-subtitle">{subtitle}</p>
        </header>

        {/* Tabs */}
        <nav className="character-tabs">
          <button
            type="button"
            className={
              "character-tab" +
              (activeTab === "overview" ? " character-tab--active" : "")
            }
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={
              "character-tab" +
              (activeTab === "stats" ? " character-tab--active" : "")
            }
            onClick={() => setActiveTab("stats")}
          >
            Stats
          </button>
          <button
            type="button"
            className={
              "character-tab" +
              (activeTab === "notes" ? " character-tab--active" : "")
            }
            onClick={() => setActiveTab("notes")}
          >
            Notes
          </button>
        </nav>

        {/* Tab content */}
        <div className="character-tab-body">
          {activeTab === "overview" && (
            <div className="character-overview">
              <div className="character-overview-row">
                <div className="character-pill">
                  <span className="character-pill-label">HP</span>
                  <span className="character-pill-value">
                    {character.hp || "—"}
                  </span>
                </div>
                <div className="character-pill">
                  <span className="character-pill-label">AC</span>
                  <span className="character-pill-value">
                    {character.ac != null ? character.ac : "—"}
                  </span>
                </div>
                <div className="character-pill">
                  <span className="character-pill-label">Speed</span>
                  <span className="character-pill-value">
                    {character.speed || "—"}
                  </span>
                </div>
              </div>

              <p className="character-overview-text">
                This is your character's quick summary. As Tavern grows,
                you'll be able to track features, conditions, and equipment
                here.
              </p>
            </div>
          )}

          {activeTab === "stats" && (
            <div className="character-stats-grid">
              {/* Placeholder stats for now */}
              {["STR", "DEX", "CON", "INT", "WIS", "CHA"].map((stat) => (
                <div key={stat} className="character-stat-card">
                  <span className="character-stat-label">{stat}</span>
                  <span className="character-stat-value">10</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="character-notes">
              <p className="character-notes-label">Notes</p>
              <p className="character-notes-body">
                {character.notes && character.notes.trim().length > 0
                  ? character.notes
                  : "No notes yet. You can use this space later to record backstory, secrets, and session events."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Right: portrait placeholder */}
      <aside className="character-portrait-side">
        <div className="character-portrait-orb">
          {/* Put your 3D / portrait here later */}
        </div>
        <p className="character-portrait-caption">
          Every hero begins with a spark. Soon this will be a full 3D portrait
          and pose.
        </p>
      </aside>
    </div>
  );
}
