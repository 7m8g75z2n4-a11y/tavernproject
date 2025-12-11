"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Campaign } from "@prisma/client";

export default function SessionNewClient() {
  const searchParams = useSearchParams();
  const initialCampaignId = searchParams.get("campaignId") ?? "";

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [campaignId, setCampaignId] = useState(initialCampaignId);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!date) {
      const today = new Date();
      const iso = today.toISOString().split("T")[0];
      setDate(iso);
    }
  }, [date]);

  useEffect(() => {
    if (initialCampaignId) return;

    async function loadCampaigns() {
      setIsLoadingCampaigns(true);
      try {
        const res = await fetch("/api/campaigns");
        if (!res.ok) return;
        const data = await res.json();
        const list: Campaign[] = data.campaigns ?? [];
        setCampaigns(list);
        if (list.length > 0 && !campaignId) {
          setCampaignId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to load campaigns", err);
      } finally {
        setIsLoadingCampaigns(false);
      }
    }

    loadCampaigns();
  }, [initialCampaignId, campaignId]);

  const linkedCampaign = campaigns.find((c) => c.id === campaignId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    if (!campaignId) {
      setError("This page needs a campaignId – open it from a campaign.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          sessionDate: date || undefined,
          notes,
          campaignId,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        setError("Could not create session: " + text);
        return;
      }

      const data = await res.json();
      const created = data.session;

      router.push(`/sessions/${created.id}`);
    } catch (err) {
      console.error("Create session error", err);
      setError("Unexpected error creating session.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="session-new-layout">
      <section className="session-new-card parchment-card">
        <header className="session-new-header">
          <h1>Log a Session</h1>
          <p>
            Capture the date and notes for a night at the table. You can
            expand this later with XP, conditions, and more.
          </p>
        </header>

        <form className="session-new-form" onSubmit={handleSubmit}>
          <label className="session-new-label">
            <span>Session Title</span>
            <input
              className="session-new-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Session 1: Into the Mists"
              required
            />
          </label>

          <label className="session-new-label">
            <span>Date</span>
            <input
              className="session-new-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          {!initialCampaignId && (
            <label className="session-new-label">
              <span>Campaign</span>
              <select
                className="session-new-input"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                disabled={isLoadingCampaigns || campaigns.length === 0}
              >
                <option value="">Select a campaign</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {isLoadingCampaigns && (
                <p className="session-new-meta">Loading your campaigns...</p>
              )}
              {!isLoadingCampaigns && campaigns.length === 0 && (
                <p className="session-new-meta">
                  This page needs a campaignId – open it from a campaign.
                </p>
              )}
            </label>
          )}

          <label className="session-new-label">
            <span>Session Notes</span>
            <textarea
              className="session-new-notes"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What happened at the table?"
            />
          </label>

          {campaignId && (
            <p className="session-new-meta">
              Linked to campaign: {" "}
              <span className="session-new-meta-pill">
                {linkedCampaign?.name ?? campaignId.slice(0, 10) + "..."}
              </span>
            </p>
          )}

          {error && <p className="session-new-error">{error}</p>}

          <footer className="session-new-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Session"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}