import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type PlayerCampaignRow = {
  campaignId: string;
  campaignName: string;
  isActive: boolean;
  lastSessionDate?: Date | null;
  characterId: string;
  characterName: string;
  system?: string | null;
  className?: string | null;
  level?: number | null;
  hp?: number | null;
  xp?: number | null;
  conditions?: string[] | null;
};

export default async function PlayPage() {
  const user = await getCurrentUser();
  if (!user?.email) redirect("/login");

  const memberships = await prisma.partyMember.findMany({
    where: {
      OR: [
        { character: { createdById: user.id ?? undefined } },
        { character: { ownerEmail: user.email } },
      ],
    },
    include: {
      character: true,
      campaign: {
        include: {
          sessions: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: PlayerCampaignRow[] = memberships.map((m) => {
    const latestSession = m.campaign?.sessions?.[0];
    return {
      campaignId: m.campaignId,
      campaignName: m.campaign?.name ?? "Campaign",
      isActive: (m.campaign as any)?.isActive ?? false,
      lastSessionDate: latestSession?.createdAt ?? null,
      characterId: m.characterId,
      characterName: m.character?.name ?? "Character",
      system: (m.character as any)?.system ?? null,
      className: m.character?.class ?? null,
      level: m.character?.level ?? null,
      hp: (m as any).hpCurrent ?? null,
      xp: (m as any).xp ?? null,
      conditions: (m as any).conditions ?? null,
    };
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">My Table</h1>
          <p className="text-sm text-slate-400">
            Campaigns where you have a seat and the characters you bring.
          </p>
        </header>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <p className="text-sm text-slate-300">
              You&apos;re not in any campaigns yet. Ask a GM to add one of your characters
              to their party.
            </p>
            <Link
              href="/campaigns"
              className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-500"
            >
              Browse Campaigns
            </Link>
          </div>
        ) : (
          <section className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              {rows.map((row) => (
                <div
                  key={`${row.campaignId}-${row.characterId}`}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3 shadow-lg shadow-black/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-amber-300">
                        {row.campaignName}
                      </p>
                      <h3 className="text-lg font-semibold text-slate-50">
                        {row.characterName}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {row.system ?? "System"} / {row.className ?? "Class"}
                        {row.level ? ` / Lv ${row.level}` : ""}
                      </p>
                    </div>
                    {row.lastSessionDate && (
                      <span className="text-[11px] text-slate-500">
                        Last session: {new Date(row.lastSessionDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-amber-200">
                      HP {row.hp != null ? row.hp : "--"}
                    </span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-amber-200">
                      XP {row.xp != null ? row.xp : "--"}
                    </span>
                    {Array.isArray(row.conditions) &&
                      row.conditions.map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-slate-800 px-2 py-0.5 text-red-200"
                        >
                          {c}
                        </span>
                      ))}
                  </div>

                  <div className="flex gap-2 text-sm">
                    <Link
                      href={`/characters/${row.characterId}`}
                      className="flex-1 rounded-md border border-slate-700 px-3 py-2 text-center hover:border-amber-400"
                    >
                      Open Character
                    </Link>
                    <Link
                      href={`/play/${row.campaignId}/${row.characterId}`}
                      className="flex-1 rounded-md bg-amber-600 px-3 py-2 text-center font-semibold text-slate-950 hover:bg-amber-500"
                    >
                      Open player view
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
