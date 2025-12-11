"use client";

import Link from "next/link";
import type { Session, Campaign } from "@prisma/client";

type SessionWithCampaign = Session & { campaign: Campaign };

type Props = {
  session: SessionWithCampaign;
};

export default function SessionPageClient({ session }: Props) {
  return (
    <main className="session-detail">
      <header className="session-detail__header">
        <div>
          <p className="eyebrow">Session</p>
          <h1>{session.title}</h1>
          <p className="muted">Campaign: {session.campaign.name}</p>
          {session.sessionDate && (
            <p className="muted">
              {new Date(session.sessionDate).toLocaleString()}
            </p>
          )}
        </div>
        <Link href={`/campaigns/${session.campaignId}`} className="btn-secondary">
          Back to Campaign
        </Link>
      </header>

      {session.notes ? (
        <section className="card parchment-card">
          <h2>Notes</h2>
          <p className="muted whitespace-pre-wrap">{session.notes}</p>
        </section>
      ) : (
        <p className="muted">No notes recorded for this session.</p>
      )}
    </main>
  );
}
