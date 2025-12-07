"use client";

import { Web3Providers } from "@/lib/wagmi";
import { NavBar } from "@/components/layout/NavBar";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Web3Providers>
      <NavBar />
      {children}
    </Web3Providers>
  );
}
