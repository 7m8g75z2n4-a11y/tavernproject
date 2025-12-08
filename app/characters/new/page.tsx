"use client";

import { useState, type React } from "react";
import { useRouter } from "next/navigation";

type CharacterDraft = {
  name: string;
  ancestry: string;
  klass: string;
  level: string;
  hp: string;
  ac: string;
  speed: string;
  notes: string;
};

const initialDraft: CharacterDraft = {
  name: "",
  ancestry: "",
  klass: "",
  level: "1",
  hp: "10 / 10",
  ac: "10",
  speed: "30 ft",
  notes: "",
};

function buildSubtitle(draft: CharacterDraft) {
  const subtitleParts = [];
  if (draft.ancestry) subtitleParts.push(draft.ancestry);
  if (draft.klass) subtitleParts.push(draft.klass);
  const base = subtitleParts.join(" ").trim();
  const levelText = `Level ${draft.level || "1"}`;
  return base ? `${base} • ${levelText}` : levelText;
}

export default function NewCharacterPage() {
  const [draft, setDraft] = useState<CharacterDraft>(initialDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  function update<K extends keyof CharacterDraft>(key: K, value: CharacterDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const level = draft.level || "1";
    const parts: string[] = [];
    if (draft.ancestry) parts.push(draft.ancestry);
    if (draft.klass) parts.push(draft.klass);
    const subtitle = parts.length > 0 ? `${parts.join(" ")} • Level ${level}` : `Level ${level}`;

    const payload = {
      name: draft.name || "Unnamed Hero",
      subtitle,
      hp: "10 / 10",
      ac: 10,
      speed: "30 ft",
      notes: "",
    };

    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Failed to create character", await res.text());
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      const created = data.character;

      // Option A: go back to dashboard
      // router.push("/dashboard");

      // Option B: go straight to the new sheet (if you wire it later)
      // router.push(`/characters/${created.id}`);

      router.push("/dashboard");
    } catch (err) {
      console.error("Error creating character", err);
    } finally {
      setIsSubmitting(false);
    }
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
              required
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

          <div className="character-new-row">
            <label className="character-new-label">
              <span>HP</span>
              <input
                className="character-new-input"
                type="text"
                value={draft.hp}
                onChange={(e) => update("hp", e.target.value)}
                placeholder="38 / 38"
              />
            </label>

            <label className="character-new-label">
              <span>Armor Class</span>
              <input
                className="character-new-input"
                type="number"
                min={0}
                value={draft.ac}
                onChange={(e) => update("ac", e.target.value)}
                placeholder="15"
              />
            </label>

            <label className="character-new-label">
              <span>Speed</span>
              <input
                className="character-new-input"
                type="text"
                value={draft.speed}
                onChange={(e) => update("speed", e.target.value)}
                placeholder="30 ft"
              />
            </label>
          </div>

          <label className="character-new-label">
            <span>Concept Notes</span>
            <textarea
              className="character-new-notes"
              rows={4}
              value={draft.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Who are they? What are they running from? What do they want?"
            />
          </label>

          <footer className="character-new-footer">
            <button
              type="button"
              className="btn-secondary character-new-btn"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary character-new-btn" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Character"}
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
            <p className="character-new-line">{buildSubtitle(draft)}</p>
            <p className="character-new-line">
              {draft.hp || "HP 10 / 10"} • AC {draft.ac || "10"}
            </p>
            <p className="character-new-line">{draft.speed || "30 ft"}</p>
          </div>
        </div>
        <p className="character-new-help">
          This preview matches how your character will appear on the dashboard.
        </p>
      </aside>
    </div>
  );
}


