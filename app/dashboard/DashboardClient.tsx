"use client";

import Link from "next/link";
import { useState } from "react";
import type { Character, Campaign } from "@prisma/client";

type Counts = {
  characters: number;
  campaigns: number;
  sessions: number;
};

type CampaignWithCounts = Campaign & { _count?: { sessions: number } };

type DashboardClientProps = {
  initialCharacters: Character[];
  initialCampaigns: CampaignWithCounts[];
  counts: Counts;
  userEmail: string;
};

type TabId = "characters" | "campaigns" | "settings";

export default function DashboardClient({
  initialCharacters,
  initialCampaigns,
  counts,
  userEmail,
}: DashboardClientProps) {
  const [characters] = useState<Character[]>(initialCharacters);
  const [campaigns] = useState<CampaignWithCounts[]>(initialCampaigns);
  const [activeTab, setActiveTab] = useState<TabId>("characters");

  return (
    <div className="dashboard">
      {/* Tabs */}
      <nav className="dashboard-tabs">
        <button
          className={
            "dashboard-tab" +
            (activeTab === "characters" ? " dashboard-tab--active" : "")
          }
          type="button"
          onClick={() => setActiveTab("characters")}
        >
          Characters
        </button>
        <button
          className={
            "dashboard-tab" +
            (activeTab === "campaigns" ? " dashboard-tab--active" : "")
          }
          type="button"
          onClick={() => setActiveTab("campaigns")}
        >
          Campaigns
        </button>
        <button
          className={
            "dashboard-tab" +
            (activeTab === "settings" ? " dashboard-tab--active" : "")
          }
          type="button"
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </nav>

      <div className="dashboard-content">
        {/* CHARACTERS TAB */}
        {activeTab === "characters" && (
          <section className="dashboard-section">
            <header className="dashboard-section-header">
              <div>
                <h2>Your Characters</h2>
                <p>Bring your heroes back to the table anytime.</p>
              </div>
              <Link href="/characters/new">
                <button className="btn-primary dashboard-section-cta">
                  + Add Character
                </button>
              </Link>
            </header>

            {characters.length === 0 ? (
              <p className="dashboard-empty">
                You don't have any characters yet. Create one to begin.
              </p>
            ) : (
              <div className="dashboard-grid">
                {characters.map((c) => (
                  <article
                    key={c.id}
                    className="card parchment-card character-card"
                  >
                    <div className="card-header">
                      <h3>{c.name}</h3>
                      {c.subtitle && (
                        <p className="card-subtitle">{c.subtitle}</p>
                      )}
                    </div>
                    <p className="card-meta">
                      {c.hp ? `HP ${c.hp}` : "HP -"}
                      {c.ac != null ? ` \u2022 AC ${c.ac}` : ""}
                    </p>
                    <Link href={`/characters/${c.id}`}>
                      <button className="btn-secondary card-button">
                        Open Sheet
                      </button>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* CAMPAIGNS TAB */}
        {activeTab === "campaigns" && (
          <section className="dashboard-section">
            <header className="dashboard-section-header">
              <div>
                <h2>Your Campaigns</h2>
                <p>Step back into the stories you're telling.</p>
              </div>
              <div className="dashboard-section-actions">
                <Link href="/sessions">
                  <button className="btn-secondary dashboard-section-cta">
                    Sessions Dashboard
                  </button>
                </Link>
                <Link href="/campaigns/new">
                  <button className="btn-secondary dashboard-section-cta">
                    Host a Campaign
                  </button>
                </Link>
              </div>
            </header>

            {campaigns.length === 0 ? (
              <p className="dashboard-empty">
                You haven't hosted any campaigns yet. Start one to gather
                your party.
              </p>
            ) : (
              <div className="dashboard-grid">
                {campaigns.map((c) => (
                  <article
                    key={c.id}
                    className="card parchment-card campaign-card"
                  >
                    <div className="card-header">
                      <h3>{c.name}</h3>
                      <p className="card-subtitle">
                        {c.gmName ? `GM ${c.gmName}` : "GM not set"}
                      </p>
                    </div>
                    <p className="card-meta">
                      {`GM ${c.gmName || "Unknown"} \u2022 ${c._count?.sessions ?? 0} session(s)`}
                    </p>
                    <p className="card-meta">
                      Created {""}
                      {new Date(c.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <Link href={`/campaigns/${c.id}`}>
                      <button className="btn-secondary card-button">
                        Open Campaign
                      </button>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <section className="dashboard-section">
            <header className="dashboard-section-header">
              <div>
                <h2>Settings</h2>
                <p>Personalize your Tavern experience.</p>
              </div>
            </header>

            <div className="dashboard-settings">
              <p>Signed in as {userEmail}</p>
              <p>
                Characters: {counts.characters} \u2022 Campaigns: {counts.campaigns} \u2022 Sessions: {counts.sessions}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
