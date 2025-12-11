"use client";

import React from "react";

type AppearanceJson = {
  portraitUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  vibe?: "heroic" | "mysterious" | "chaotic" | "serene";
  pose?: "idle" | "casting" | "ready" | "resting";
};

type Identity = {
  name?: string;
  ancestry?: string;
  className?: string;
  level?: number;
};

export function Character3DPreview({
  identity,
  appearanceJson,
}: {
  identity?: Identity;
  appearanceJson?: AppearanceJson | null;
}) {
  const primaryColor = appearanceJson?.primaryColor ?? "#f97316";
  const accentColor = appearanceJson?.accentColor ?? "#22d3ee";

  const vibeRaw = appearanceJson?.vibe ?? "tavern wanderer";
  const vibeLabel =
    vibeRaw.charAt(0).toUpperCase() + vibeRaw.slice(1) || "Tavern wanderer";

  const poseLabel = appearanceJson?.pose ?? "idle";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-700/40 bg-slate-950/80 shadow-xl shadow-amber-900/30">
      <div className="flex items-center justify-between border-b border-amber-800/40 px-4 py-2 text-xs text-amber-100/70">
        <span className="font-semibold tracking-wide uppercase">Character Room</span>
        <span className="rounded-full bg-amber-900/60 px-2 py-0.5 text-[10px] uppercase">
          {vibeLabel}
        </span>
      </div>

      <div className="relative px-4 pb-4 pt-6">
        <div
          className="absolute inset-3 rounded-2xl opacity-80 blur-xl"
          style={{
            background: `radial-gradient(circle at 10% 0%, ${accentColor}22, transparent 55%),
                         radial-gradient(circle at 90% 100%, ${primaryColor}33, transparent 60%)`,
          }}
        />

        <div className="relative flex flex-col items-center">
          <div className="relative mb-4 h-40 w-40">
            <div className="absolute inset-0 rounded-full bg-slate-900/70 backdrop-blur-sm border border-amber-700/40 shadow-lg shadow-black/60" />

            {appearanceJson?.portraitUrl ? (
              <img
                src={appearanceJson.portraitUrl}
                alt={identity?.name ?? "Character"}
                className="relative z-10 h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full">
                <div
                  className="h-24 w-20 rounded-3xl bg-gradient-to-b from-amber-300/90 to-amber-700/90 shadow-xl shadow-black/60"
                  style={{
                    boxShadow: `0 0 35px ${primaryColor}aa`,
                  }}
                />
              </div>
            )}

            <div className="pointer-events-none absolute -left-2 top-4 h-3 w-3 rounded-full bg-amber-300/80 blur-[1px]" />
            <div className="pointer-events-none absolute right-2 top-8 h-2 w-2 rounded-full bg-cyan-300/80 blur-[1px]" />
            <div className="pointer-events-none absolute left-6 bottom-4 h-2.5 w-2.5 rounded-full bg-purple-300/80 blur-[1px]" />
          </div>

          <div className="relative mb-4 h-7 w-44">
            <div className="absolute inset-x-3 bottom-0 h-3 rounded-full bg-black/50 blur-md" />
            <div className="relative h-full w-full rounded-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 shadow-inner shadow-black/40" />
            <div
              className="pointer-events-none absolute inset-x-6 top-0 h-1 rounded-full opacity-50"
              style={{
                background: `linear-gradient(90deg, transparent, ${primaryColor}aa, ${accentColor}aa, transparent)`,
              }}
            />
          </div>

          <div className="flex w-full flex-col items-center gap-1 text-center">
            <div className="text-sm font-semibold text-amber-50">
              {identity?.name ?? "Unnamed wanderer"}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-amber-200/80">
              {identity?.ancestry ?? "Unknown"} | {identity?.className ?? "Adventurer"} |{" "}
              {identity?.level ? `Level ${identity.level}` : "Level 1"}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-amber-200/70">
              <span className="rounded-full border border-amber-700/60 bg-amber-900/50 px-2 py-0.5">
                Pose: {poseLabel}
              </span>
              <span className="rounded-full border border-slate-700/80 bg-slate-900/70 px-2 py-0.5">
                View-only prototype
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
