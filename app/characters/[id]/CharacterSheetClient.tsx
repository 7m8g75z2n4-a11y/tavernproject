"use client";

import Link from "next/link";
import { useState } from "react";
import type { Character } from "@prisma/client";

type SheetTab = "overview" | "stats" | "notes";

export default function CharacterSheetClient({
  character,
}: {
  character: Character;
}) {
  const [activeTab, setActiveTab] = useState<SheetTab>("overview");

  const displayName = character.name || "Unnamed Hero";
  const subtitle = character.subtitle || "Level 1 Adventurer";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold leading-tight">{displayName}</h1>
            <p className="text-sm text-slate-400">{subtitle}</p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs text-amber-300 hover:text-amber-200 underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <nav className="flex gap-2">
          {[
            { id: "overview", label: "Overview" },
            { id: "stats", label: "Stats" },
            { id: "notes", label: "Notes" },
          ].map((tabKey) => (
            <button
              key={tabKey.id}
              type="button"
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                activeTab === tabKey.id
                  ? "bg-amber-600 text-slate-950"
                  : "bg-slate-800 text-slate-100 hover:bg-slate-700"
              }`}
              onClick={() => setActiveTab(tabKey.id as SheetTab)}
            >
              {tabKey.label}
            </button>
          ))}
        </nav>

        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6 space-y-4">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                    <p className="text-xs uppercase text-slate-400">HP</p>
                    <p className="text-xl font-semibold">{character.hp || "-"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                    <p className="text-xs uppercase text-slate-400">AC</p>
                    <p className="text-xl font-semibold">
                      {character.ac != null ? character.ac : "-"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                    <p className="text-xs uppercase text-slate-400">Speed</p>
                    <p className="text-xl font-semibold">
                      {character.speed || "-"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  Quick essentials for table use: health, defenses, and travel pace.
                </p>
              </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {["STR", "DEX", "CON", "INT", "WIS", "CHA"].map((stat) => (
                    <div
                      key={stat}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center"
                    >
                      <p className="text-xs uppercase text-slate-400">{stat}</p>
                      <p className="text-2xl font-semibold">10</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-300">
                  Full ability scores and saves are coming soon. For now, keep their story front and center.
                </p>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-amber-200">Notes</p>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">
                  {character.notes && character.notes.trim().length > 0
                    ? character.notes
                    : "No notes yet. Chronicle rumors, secrets, and session beats here."}
                </p>
              </div>
            )}
          </section>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 aspect-square w-full max-w-sm mx-auto flex items-center justify-center text-slate-400 text-sm">
              Portrait coming soon
            </div>
            <p className="text-sm text-slate-300">
              Every hero begins with a spark. Soon this will be a full 3D portrait and pose.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
