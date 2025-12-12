import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
};

export function SectionHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
}: SectionHeaderProps) {
  return (
    <header className="flex flex-col gap-2">
      {breadcrumb && (
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">{breadcrumb}</div>
      )}
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-slate-100">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}
