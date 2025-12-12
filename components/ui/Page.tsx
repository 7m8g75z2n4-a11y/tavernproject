import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={`page-shell ${className ?? ""}`}>
      <div className="page-shell__inner">{children}</div>
    </div>
  );
}

type SectionGroupProps = {
  children: ReactNode;
};

export function SectionGroup({ children }: SectionGroupProps) {
  return <div className="space-y-6">{children}</div>;
}
