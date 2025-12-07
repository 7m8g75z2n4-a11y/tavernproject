"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";

export function useSyncWallet() {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected || !address) return;

    const sync = async () => {
      try {
        const res = await fetch("/api/user/wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        });
        if (!res.ok) {
          // Likely unauthenticated while auth isn’t wired; skip quietly.
          return;
        }
      } catch {
        // Ignore transient network errors to avoid noisy overlays in dev.
      }
    };

    void sync();
  }, [address, isConnected]);
}
