"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function NewCampaignPage() {
  const [name, setName] = useState("");
  const [gmName, setGmName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please give your campaign a name.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, gmName }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        const message = data.error ?? `Could not create campaign (status ${res.status}).`;
        setError(message);
        return;
      }

      const campaign = data.campaign;
      router.push(`/campaigns/${campaign.id}`);
    } catch (err) {
      console.error("Create campaign error", err);
      setError("Unexpected error creating campaign.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="campaign-new-layout">
      <section className="campaign-new-card parchment-card">
        <header className="campaign-new-header">
          <h1>Host a Campaign</h1>
          <p>
            Name your adventure and set who&apos;s guiding the party. You can
            invite players and add characters later.
          </p>
        </header>

        <form className="campaign-new-form" onSubmit={handleSubmit}>
          <label className="campaign-new-label">
            <span>Campaign Name</span>
            <input
              className="campaign-new-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Curse of Strahd"
              required
            />
          </label>

          <label className="campaign-new-label">
            <span>Game Master</span>
            <input
              className="campaign-new-input"
              type="text"
              value={gmName}
              onChange={(e) => setGmName(e.target.value)}
              placeholder="orion"
            />
          </label>

          {error && <p className="campaign-new-error">{error}</p>}

          <footer className="campaign-new-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Campaign"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
