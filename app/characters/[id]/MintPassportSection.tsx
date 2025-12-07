"use client";

import { useState } from "react";
import { useMintPassport } from "@/hooks/useMintPassport";

type Props = {
  characterId: string;
  hasPassport: boolean;
  tokenId?: string | null;
};

export function MintPassportSection({
  characterId,
  hasPassport,
  tokenId,
}: Props) {
  const { mint, loading, error, result } = useMintPassport(characterId);
  const [showDetails, setShowDetails] = useState(false);

  if (hasPassport || result) {
    const effectiveTokenId = result?.tokenId || tokenId;
    return (
      <div className="mt-4 p-3 rounded-lg border border-amber-700/40 bg-amber-900/10">
        <p className="text-sm">
          On-chain passport: <span className="font-mono">#{effectiveTokenId}</span>
        </p>
        {result && (
          <button
            className="mt-2 text-xs underline"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide transaction" : "View transaction details"}
          </button>
        )}
        {showDetails && result && (
          <div className="mt-1 text-xs opacity-80">
            <div>Chain ID: {result.chainId}</div>
            <div>Tx hash: {result.txHash}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 p-3 rounded-lg border border-amber-700/40 bg-amber-900/10">
      <p className="text-sm mb-2">
        Mint a <span className="font-semibold">Tavern passport</span> to put this
        character on-chain.
      </p>
      <button
        onClick={mint}
        disabled={loading}
        className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-sm font-semibold"
      >
        {loading ? "Minting..." : "Mint passport"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
