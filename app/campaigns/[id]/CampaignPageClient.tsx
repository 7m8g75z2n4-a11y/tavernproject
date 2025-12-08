"use client";

import type { Campaign } from "@prisma/client";

export default function CampaignPageClient({ campaign }: { campaign: Campaign }) {
  const createdAt = new Date(campaign.createdAt);

  return (
    <div className="campaign-layout">
      {/* Left: campaign sheet */}
      <section className="campaign-sheet parchment-card">
        <header className="campaign-sheet-header">
          <h1>{campaign.name}</h1>
          <p className="campaign-sheet-subtitle">
            {campaign.gmName ? `GM ${campaign.gmName}` : "Game Master not set"}
          </p>
          <p className="campaign-sheet-meta">
            Hosted since{" "}
            {createdAt.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </header>

        <div className="campaign-body">
          <section className="campaign-section">
            <h2>Party</h2>
            <p className="campaign-section-text">
              Party management is coming soon. You&apos;ll be able to attach
              characters to this campaign and see who&apos;s at the table at a
              glance.
            </p>
          </section>

          <section className="campaign-section">
            <h2>Sessions</h2>
            <p className="campaign-section-text">
              Session logs will live here—recaps, XP notes, and story beats so
              you never forget what happened last time.
            </p>
          </section>
        </div>
      </section>

      {/* Right: vibe panel */}
      <aside className="campaign-side">
        <div className="campaign-banner-orb">
          {/* Placeholder art area */}
        </div>
        <p className="campaign-side-caption">
          Each campaign is its own tavern table. Soon you&apos;ll pin key art,
          safety tools, and table rules here.
        </p>
      </aside>
    </div>
  );
}
