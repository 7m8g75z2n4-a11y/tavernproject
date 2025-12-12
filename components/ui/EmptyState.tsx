import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  body: ReactNode;
  cta?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, body, cta, className }: EmptyStateProps) {
  return (
    <div className={`space-y-3 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-6 text-center text-slate-400 ${className ?? ""}`}>
      {Icon && (
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-amber-300">
          <Icon size={20} />
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <p className="text-sm">{body}</p>
      </div>
      {cta && <div>{cta}</div>}
    </div>
  );
}
