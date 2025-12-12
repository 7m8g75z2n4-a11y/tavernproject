"use client";

import Link from "next/link";
import { useState } from "react";
import type { Campaign } from "@prisma/client";

type CampaignWithCounts = Campaign & { _count?: { sessions: number } };

type CampaignsListProps = {
  activeCampaigns: CampaignWithCounts[];
  archivedCampaigns: Campaign[];
};

export default function CampaignsList({
  activeCampaigns,
  archivedCampaigns,
}: CampaignsListProps) {
  const [showArchived, setShowArchived] = useState(false);
  const hasActive = activeCampaigns.length > 0;
  const hasArchived = archivedCampaigns.length > 0;

  if (!hasActive && !hasArchived) {
    return (
      <p className="text-sm opacity-70 mb-6">
        No campaigns yet. The tavern tables are still clear.
      </p>
    );
  }

  return (
    <div className="space-y-3 mb-6">
      {hasActive ? (
        <div className="space-y-3">
          {activeCampaigns.map((c) => (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="block p-3 border border-amber-700/50 rounded-lg hover:bg-amber-900/20 transition"
            >
              <div className="text-sm font-medium">{c.name}</div>
              {c.description && (
                <div className="text-xs opacity-70 line-clamp-2">
                  {c.description}
                </div>
              )}
              <div className="text-[10px] opacity-60 mt-1">
                GM: {c.gmName ?? "Unknown"} · Sessions: {c._count?.sessions ?? 0}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm opacity-70">
          No active campaigns open right now. Archive any finished stories and
          unarchive when you're ready to revisit them.
        </p>
      )}

      {hasArchived && (
        <div className="rounded-lg border border-amber-500/30 bg-slate-900/60 p-3">
          <button
            type="button"
            className="text-xs text-amber-200 underline underline-offset-2"
            onClick={() => setShowArchived((prev) => !prev)}
          >
            {showArchived
              ? "Hide archived campaigns"
              : `Show archived campaigns (${archivedCampaigns.length})`}
          </button>

          {showArchived && (
            <div className="mt-3 space-y-2">
              {archivedCampaigns.map((campaign) => {
                const archivedDate = campaign.archivedAt
                  ? new Date(campaign.archivedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Unknown date";
                return (
                  <Link
                    key={campaign.id}
                    href={`/campaigns/${campaign.id}`}
                    className="block rounded-lg border border-slate-800/90 bg-slate-950/70 px-3 py-2 text-sm hover:border-amber-500/60 hover:bg-slate-900/80"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-amber-100">
                        {campaign.name}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        Archived
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{archivedDate}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
