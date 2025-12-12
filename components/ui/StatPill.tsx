import type { ReactNode } from "react";

type StatPillProps = {
  label: string;
  value: ReactNode;
  tone?: "default" | "danger";
};

export function StatPill({ label, value, tone = "default" }: StatPillProps) {
  const base = "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-wider";
  const variantClass =
    tone === "danger" ? "bg-rose-600/40 text-rose-100" : "bg-slate-800/60 text-amber-200";

  return (
    <span className={`${base} ${variantClass}`}>
      <span className="text-[10px] text-slate-400">{label}</span>
      <span>{value}</span>
    </span>
  );
}
