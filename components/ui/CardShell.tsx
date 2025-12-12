import type { ReactNode } from "react";

type CardShellProps = {
  children: ReactNode;
  className?: string;
};

export function CardShell({ children, className }: CardShellProps) {
  return (
    <div
      className={`bg-slate-900/60 border border-slate-800 rounded-2xl shadow-sm shadow-black/40 text-slate-300 p-6 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
