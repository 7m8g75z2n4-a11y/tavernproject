import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function PlayerHomePage() {
  const user = await getCurrentUser();
  if (!user?.id || !user.email) {
    redirect("/login");
  }

  const characters = await prisma.character.findMany({
    where: {
      isArchived: false,
      OR: [
        { createdById: user.id },
        { ownerEmail: user.email },
      ],
    },
    include: {
      partyMembers: {
        include: {
          campaign: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const campaignIds = Array.from(
    new Set(
      characters.flatMap((c) => c.partyMembers.map((pm) => pm.campaignId))
    )
  );

  const recentEvents = campaignIds.length
    ? await prisma.sessionEvent.findMany({
        where: {
          session: {
            campaignId: { in: campaignIds },
          },
        },
        include: {
          session: {
            select: { id: true, title: true, campaignId: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Your Adventures</h1>
          <p className="text-sm text-slate-400">
            Quick access to your characters and campaigns.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Your Characters</h2>
          {characters.length === 0 ? (
            <p className="text-sm text-slate-400">
              No characters yet. Create one and join a campaign.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{char.name}</h3>
                      <p className="text-sm text-slate-400">
                        {(char as any).system ?? "System"} •{" "}
                        {char.class ?? "Class"}{" "}
                        {char.level ? `• Lv ${char.level}` : ""}
                      </p>
                    </div>
                    <Link
                      href={`/characters/${char.id}`}
                      className="text-xs text-amber-300 hover:text-amber-200"
                    >
                      View sheet
                    </Link>
                  </div>

                  {char.partyMembers.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Not in any campaigns yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {char.partyMembers.map((pm) => (
                        <div
                          key={pm.id}
                          className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">
                                {pm.campaign?.name ?? "Campaign"}
                              </p>
                              <p className="text-xs text-slate-400">Player</p>
                            </div>
                            <Link
                              href={`/player/campaigns/${pm.campaignId}/characters/${char.id}`}
                              className="text-[11px] text-amber-300 hover:text-amber-200"
                            >
                              View in campaign
                            </Link>
                          </div>
                          <div className="flex flex-wrap gap-2 text-[11px]">
                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-amber-200">
                              HP{" "}
                              {(pm as any).hpCurrent != null &&
                              (pm as any).hpMax != null
                                ? `${(pm as any).hpCurrent}/${(pm as any).hpMax}`
                                : "—"}
                            </span>
                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-amber-200">
                              XP {(pm as any).xp ?? "—"}
                            </span>
                            {Array.isArray((pm as any).conditions) &&
                              (pm as any).conditions.map((c: string) => (
                                <span
                                  key={c}
                                  className="rounded-full bg-slate-800 px-2 py-0.5 text-red-200"
                                >
                                  {c}
                                </span>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {recentEvents.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <div className="space-y-2">
              {recentEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{ev.type}</p>
                    <span className="text-xs text-slate-400">
                      {new Date(ev.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-300">{ev.message}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
