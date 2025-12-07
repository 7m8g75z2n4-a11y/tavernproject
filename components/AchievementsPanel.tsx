"use client";

import { useMintBadge } from "@/hooks/useMintBadge";
import { useState } from "react";

type BadgeDisplay = {
  tokenId: string;
  title: string;
  description?: string;
  image?: string;
  chainId?: number;
};

type Props = {
  existingBadges?: BadgeDisplay[];
};

export function AchievementsPanel({ existingBadges = [] }: Props) {
  const { mint, loading, error, result } = useMintBadge();
  const [name, setName] = useState("Survived the Nightmare");
  const [description, setDescription] = useState(
    "Endured the tavern gauntlet and lived to tell the tale."
  );
  const [image, setImage] = useState<string>("");

  const handleMint = async () => {
    const metadata = {
      name,
      description,
      image: image || undefined,
      attributes: [
        { trait_type: "Series", value: "Tavern Achievements" },
        { trait_type: "Badge", value: name },
      ],
    };
    await mint(metadata);
  };

  const renderBadge = (badge: BadgeDisplay, idx: number) => (
    <div
      key={badge.tokenId + idx}
      className="p-3 rounded-lg border border-amber-700/40 bg-amber-900/10 flex gap-3 items-center"
    >
      {badge.image && (
        <img
          src={badge.image}
          alt={badge.title}
          className="w-12 h-12 rounded object-cover border border-amber-700/60"
        />
      )}
      <div className="flex-1">
        <div className="text-sm font-semibold">{badge.title}</div>
        {badge.description && (
          <div className="text-xs opacity-80">{badge.description}</div>
        )}
        {badge.chainId && (
          <div className="text-[11px] opacity-70 mt-1">
            Chain: {badge.chainId} · Token #{badge.tokenId}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Mint a badge</h3>
        <div className="space-y-2">
          <input
            className="w-full px-3 py-2 rounded border border-amber-700/40 bg-amber-950/40 text-sm"
            placeholder="Badge name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="w-full px-3 py-2 rounded border border-amber-700/40 bg-amber-950/40 text-sm"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 rounded border border-amber-700/40 bg-amber-950/40 text-sm"
            placeholder="Image URL (optional)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
          <button
            onClick={handleMint}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-sm font-semibold"
          >
            {loading ? "Minting..." : "Mint badge"}
          </button>
          {error && <div className="text-xs text-red-300">{error}</div>}
          {result && (
            <div className="text-xs text-green-300">
              Minted badge #{result.tokenId} on chain {result.chainId} (tx:{" "}
              {result.txHash})
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Earned badges</h3>
        {result &&
          renderBadge(
            {
              tokenId: result.tokenId,
              title: name,
              description,
              image,
              chainId: result.chainId,
            },
            -1
          )}
        {existingBadges.map(renderBadge)}
        {!existingBadges.length && !result && (
          <div className="text-xs opacity-70">
            No badges yet. Survive the tavern to earn your first medal.
          </div>
        )}
      </div>
    </div>
  );
}
