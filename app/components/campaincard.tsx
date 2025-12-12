// components/campaign/CampaignCard.tsx
"use client";

import { useState } from "react";

type CampaignCardProps = {
  id: string;
  name: string;
  description?: string | null;
  archivedAt?: string | null;
  onChanged?: () => void; // callback to refetch list
};

export function CampaignCard({
  id,
  name,
  description,
  archivedAt,
  onChanged,
}: CampaignCardProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [isUnarchiving, setIsUnarchiving] = useState(false);

  const isArchived = Boolean(archivedAt);

  async function handleArchive() {
    try {
      setIsArchiving(true);
      const res = await fetch(`/api/campaigns/${id}/archive`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to archive");
      onChanged?.();
    } catch (err) {
      console.error(err);
      alert("Could not archive this campaign.");
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleUnarchive() {
    try {
      setIsUnarchiving(true);
      const res = await fetch(`/api/campaigns/${id}/unarchive`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to unarchive");
      onChanged?.();
    } catch (err) {
      console.error(err);
      alert("Could not unarchive this campaign.");
    } finally {
      setIsUnarchiving(false);
    }
  }

  return (
    <div className="rounded-lg border p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">
            {name}{" "}
            {isArchived && (
              <span className="ml-2 text-xs uppercase tracking-wide opacity-70">
                Archived
              </span>
            )}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {!isArchived ? (
            <button
              onClick={handleArchive}
              disabled={isArchiving}
              className="text-xs border px-2 py-1 rounded-md hover:bg-red-50 disabled:opacity-60"
            >
              {isArchiving ? "Archiving..." : "Archive"}
            </button>
          ) : (
            <button
              onClick={handleUnarchive}
              disabled={isUnarchiving}
              className="text-xs border px-2 py-1 rounded-md hover:bg-emerald-50 disabled:opacity-60"
            >
              {isUnarchiving ? "Restoring..." : "Unarchive"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
