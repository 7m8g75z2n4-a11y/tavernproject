"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { characters as seedCharacters } from "@/lib/data";
import type { Character } from "@/lib/data";
import { loadCharactersFromStorage, saveCharactersToStorage } from "@/lib/storage";

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
  const router = useRouter();

  function update<K extends keyof CharacterDraft>(key: K, value: CharacterDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function buildNewCharacter(): Character {
    const id = Date.now().toString();
    const subtitleParts = [];
    if (draft.ancestry) subtitleParts.push(draft.ancestry);
    if (draft.klass) subtitleParts.push(draft.klass);
    const subtitle =
      subtitleParts.length > 0
        ? `${subtitleParts.join(" ")} • Level ${draft.level || "1"}`
        : `Level ${draft.level || "1"}`;

    return {
      id,
      name: draft.name || "Unnamed Hero",
      subtitle,
      hp: "10 / 10",
      ac: 10,
      speed: "30 ft",
      stats: {
        STR: 10,
        DEX: 10,
        CON: 10,
        INT: 10,
        WIS: 10,
        CHA: 10,
      },
      features: [],
      inventory: [],
      notes: "",
    };
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const existing = loadCharactersFromStorage() ?? seedCharacters;
    const newChar = buildNewCharacter();
    const updated = [...existing, newChar];
    saveCharactersToStorage(updated);
    router.push("/dashboard");
  }

  return (
    <div className="character-new-layout">
      <section className="character-new-form">
        <header className="character-new-header">
          <h1>Create a Character</h1>
          <p>
            Give your new hero a name, ancestry, and class. You&apos;ll be able to refine the details later in their
            sheet.
          </p>
        </header>

        <form className="character-new-fields" onSubmit={handleSubmit}>
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
            <button type="button" className="btn-secondary character-new-btn" onClick={() => router.push("/dashboard")}>
              Cancel
            </button>
            <button type="submit" className="btn-primary character-new-btn">
              Create Character
            </button>
          </footer>
        </form>
      </section>

      <aside className="character-new-preview">
        <h2>Preview</h2>
        <div className="character-new-card parchment-card">
          <div className="character-new-avatar" />
          <div className="character-new-meta">
            <h3>{draft.name || "Unnamed Hero"}</h3>
            <p className="character-new-line">
              {draft.ancestry || "Ancestry"} {draft.klass ? `• ${draft.klass}` : "• Class"}
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
