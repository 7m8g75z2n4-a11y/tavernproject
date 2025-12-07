"use client";

import { useState } from "react";

type CharacterDraft = {
  name: string;
  ancestry: string;
  klass: string;
  level: string;
};

const initialDraft: CharacterDraft = {
  name: "",
  ancestry: "",
  klass: "",
  level: "1",
};

export default function NewCharacterPage() {
  const [draft, setDraft] = useState<CharacterDraft>(initialDraft);

  function update<K extends keyof CharacterDraft>(key: K, value: CharacterDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="character-new-layout">
      {/* Left: creation form */}
      <section className="character-new-form">
        <header className="character-new-header">
          <h1>Create a Character</h1>
          <p>
            Give your new hero a name, ancestry, and class. You&apos;ll be able to
            refine the details later in their sheet.
          </p>
        </header>

        <form
          className="character-new-fields"
          onSubmit={(e) => {
            e.preventDefault();
            // eventually: save + navigate
            alert("This is a demo – character creation is not wired up yet.");
          }}
        >
          <label className="character-new-label">
            <span>Name</span>
            <input
              className="character-new-input"
              type="text"
              value={draft.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Elira Dawnwhisper"
            />
          </label>

          <div className="character-new-row">
            <label className="character-new-label">
              <span>Ancestry</span>
              <input
                className="character-new-input"
                type="text"
                value={draft.ancestry}
                onChange={(e) => update("ancestry", e.target.value)}
                placeholder="Elf, Tiefling..."
              />
            </label>

            <label className="character-new-label">
              <span>Class</span>
              <input
                className="character-new-input"
                type="text"
                value={draft.klass}
                onChange={(e) => update("klass", e.target.value)}
                placeholder="Ranger, Sorcerer..."
              />
            </label>

            <label className="character-new-label character-new-label--tiny">
              <span>Level</span>
              <input
                className="character-new-input"
                type="number"
                min={1}
                max={20}
                value={draft.level}
                onChange={(e) => update("level", e.target.value)}
              />
            </label>
          </div>

          <label className="character-new-label">
            <span>Concept Notes</span>
            <textarea
              className="character-new-notes"
              rows={4}
              placeholder="Who are they? What are they running from? What do they want?"
            />
          </label>

          <footer className="character-new-footer">
            <button type="button" className="btn-secondary character-new-btn">
              Cancel
            </button>
            <button type="submit" className="btn-primary character-new-btn">
              Create Character
            </button>
          </footer>
        </form>
      </section>

      {/* Right: live preview */}
      <aside className="character-new-preview">
        <h2>Preview</h2>
        <div className="character-new-card parchment-card">
          <div className="character-new-avatar" />
          <div className="character-new-meta">
            <h3>{draft.name || "Unnamed Hero"}</h3>
            <p className="character-new-line">
              {draft.ancestry || "Ancestry"}{" "}
              {draft.klass ? `• ${draft.klass}` : "• Class"}
            </p>
            <p className="character-new-line">Level {draft.level || "1"}</p>
          </div>
        </div>
        <p className="character-new-help">
          This preview matches how your character will appear on the dashboard.
        </p>
      </aside>
    </div>
  );
}
