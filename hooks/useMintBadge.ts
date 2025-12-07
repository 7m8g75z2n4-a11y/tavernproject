"use client";

import { useCallback, useState } from "react";

interface MintResult {
  tokenId: string;
  chainId: number;
  txHash: string;
}

export function useMintBadge() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MintResult | null>(null);

  const mint = useCallback(async (metadata: Record<string, any>, targetUserId?: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/badges/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata, targetUserId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Mint failed with ${res.status}`);
      }

      const data = await res.json();
      setResult({
        tokenId: data.tokenId,
        chainId: data.chainId,
        txHash: data.txHash,
      });
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  return { mint, loading, error, result };
}
