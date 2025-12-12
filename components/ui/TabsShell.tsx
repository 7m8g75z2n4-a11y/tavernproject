"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type TabDefinition = {
  value: string;
  label: string;
  icon?: LucideIcon;
  children: ReactNode;
};

type TabsShellProps = {
  tabs: TabDefinition[];
  defaultValue?: string;
  className?: string;
};

export function TabsShell({ tabs, defaultValue, className }: TabsShellProps) {
  const firstValue = tabs[0]?.value;
  const [active, setActive] = useState(defaultValue ?? firstValue);

  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {tabs.map((tab) => {
          const isActive = tab.value === active;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActive(tab.value)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition ${
                isActive
                  ? "border-amber-500 bg-slate-800 text-amber-100 shadow"
                  : "border-slate-800 bg-transparent text-slate-400 hover:border-slate-600 hover:text-slate-100"
              }`}
            >
              {tab.icon && <tab.icon size={14} />}
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="space-y-4">
        {tabs.map(
          (tab) =>
            tab.value === active && (
              <div key={tab.value} className="space-y-4">
                {tab.children}
              </div>
            )
        )}
      </div>
    </div>
  );
}
