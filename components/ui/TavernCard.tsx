import type { ReactNode } from "react";
import { CardShell } from "./CardShell";

type TavernCardProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function TavernCard({
  title,
  subtitle,
  actions,
  footer,
  className,
  children,
}: TavernCardProps) {
  return (
    <CardShell className={`space-y-4 ${className ?? ""}`}>
      {(title || subtitle || actions) && (
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            {title && <h2 className="text-xl font-semibold text-slate-100">{title}</h2>}
            {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      <div className="space-y-3">{children}</div>
      {footer && <div className="pt-4 border-t border-slate-800">{footer}</div>}
    </CardShell>
  );
}
