import type { ReactNode } from "react";

type TavernBadgeProps = {
  children: ReactNode;
  variant?: "amber" | "slate" | "muted";
};

const BADGE_STYLES: Record<string, string> = {
  amber: "bg-amber-500/20 text-amber-200 border border-amber-500/40",
  slate: "bg-slate-800/60 text-slate-100 border border-slate-700",
  muted: "bg-slate-900/80 text-slate-400 border border-slate-800",
};

export function TavernBadge({ children, variant = "amber" }: TavernBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${BADGE_STYLES[variant]}`}>
      {children}
    </span>
  );
}
