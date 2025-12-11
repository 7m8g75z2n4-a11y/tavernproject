"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CharacterDraft = {
  name: string;
  subtitle: string;
  hp: string;
  ac: string;
  speed: string;
  notes: string;
};

const initialDraft: CharacterDraft = {
  name: "",
  subtitle: "",
  hp: "10 / 10",
  ac: "10",
  speed: "30 ft",
  notes: "",
};

function buildSubtitle(draft: CharacterDraft) {
  const sub = draft.subtitle.trim();
  return sub || "Level 1 Adventurer";
}

export default function NewCharacterPage() {
  const [draft, setDraft] = useState<CharacterDraft>(initialDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function update<K extends keyof CharacterDraft>(key: K, value: CharacterDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    const name = draft.name.trim();
    if (!name) {
      setError("A name is required to bring this hero to life.");
      return;
    }

    const acValue = draft.ac.trim();
    const acNumber = acValue ? Number(acValue) : null;
    if (acValue && Number.isNaN(acNumber)) {
      setError("Armor Class must be a number.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name,
      subtitle: draft.subtitle.trim() || null,
      hp: draft.hp.trim() || null,
      ac: acNumber,
      speed: draft.speed.trim() || null,
      notes: draft.notes.trim() || null,
    };

    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        const message =
          data.error ?? `Failed to create character (status ${res.status}).`;
        setError(message);
        return;
      }

      const created = data.character;
      router.push(`/characters/${created.id}`);
    } catch (err) {
      console.error("Error creating character", err);
      setError("Unexpected error while creating this character.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="character-new-layout">
      <section className="character-new-form">
        <header className="character-new-header">
          <h1>Craft a Hero</h1>
          <p>
            Give your adventurer a name, a short title, and the vital stats.
            You can grow their legend on the sheet.
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

          <label className="character-new-label">
            <span>Subtitle</span>
            <input
              className="character-new-input"
              type="text"
              value={draft.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              placeholder="Elf Ranger • Level 5"
            />
          </label>

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
              placeholder="What sparks their legend? Goals, fears, or secrets go here."
            />
          </label>

          {error && <p className="character-new-error">{error}</p>}

          <footer className="character-new-footer">
            <button
              type="button"
              className="btn-secondary character-new-btn"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary character-new-btn"
              disabled={isSubmitting}
            >
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
