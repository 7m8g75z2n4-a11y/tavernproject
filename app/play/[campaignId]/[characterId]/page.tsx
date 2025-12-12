import { notFound, redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { humanizeEvent } from "@/lib/session-events";

type PlayerViewPageParams = {
  campaignId?: string | string[] | undefined;
  characterId?: string | string[] | undefined;
};

type PlayerViewPageProps = {
  params?: Promise<PlayerViewPageParams>;
  searchParams?: Promise<any>;
};

function formatWhen(date: Date) {
  return formatDistanceToNow(date, { addSuffix: true });
}

export default async function PlayerViewPage({ params }: PlayerViewPageProps) {
  const resolvedParams = await params;
  const rawCampaignId = resolvedParams?.campaignId;
  const campaignId =
    typeof rawCampaignId === "string"
      ? rawCampaignId
      : Array.isArray(rawCampaignId)
      ? rawCampaignId[0]
      : undefined;
  const rawCharacterId = resolvedParams?.characterId;
  const characterId =
    typeof rawCharacterId === "string"
      ? rawCharacterId
      : Array.isArray(rawCharacterId)
      ? rawCharacterId[0]
      : undefined;

  if (!campaignId || !characterId) {
    notFound();
  }
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Load campaign, character, membership, downtime, and recent events
  const [campaign, character, membership, downtimeActivities, sessionEvents] =
    await Promise.all([
      prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          sessions: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      }),
      prisma.character.findFirst({
        where: {
          id: characterId,
          OR: [
            { createdById: user.id ?? undefined },
            { ownerEmail: user.email ?? undefined },
          ],
        },
      }),
      prisma.partyMember.findFirst({
        where: {
          campaignId,
          characterId,
        },
      }),
      prisma.downtimeActivity.findMany({
        where: {
          campaignId,
          characterId,
        },
      take: 20,
      }),
      prisma.sessionEvent.findMany({
        where: {
          session: {
            campaignId,
          },
        },
        include: {
          session: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

  if (!campaign || !character || !membership) {
    notFound();
  }

  const hpCurrent = (membership as any).hpCurrent ?? (membership as any).hp ?? 0;
  const hpMax = (membership as any).hpMax ?? (membership as any).maxHp ?? hpCurrent ?? 0;
  const xp = (membership as any).xp ?? 0;
  const conditions: string[] =
    Array.isArray((membership as any).conditions) ? (membership as any).conditions : [];

  const ongoingDowntime = downtimeActivities.filter(
    (d) => d.status !== "COMPLETED" && d.status !== "CANCELLED"
  );
  const completedDowntime = downtimeActivities.filter((d) => d.status === "COMPLETED");

  // Split events into "yours" vs general campaign events
  const yourEvents = sessionEvents.filter((e) => e.characterId === character.id);
  const campaignOnlyEvents = sessionEvents.filter(
    (e) => !e.characterId || e.characterId !== character.id
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-amber-300">
              {campaign.name || "Campaign"}
            </h1>
            <p className="text-sm text-slate-300">
              Playing as{" "}
              <span className="font-semibold text-amber-200">{character.name}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
              System: {campaign.system || "TTRPG"}
            </span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
              Table View
            </span>
          </div>
        </header>

        {/* Layout: Status + Activities */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Left: Status & Combat */}
          <div className="space-y-4 md:col-span-1">
            {/* Status card */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/40">
              <h2 className="text-sm font-semibold text-slate-200">Current Status</h2>
              <div className="mt-3 space-y-3 text-sm">
                {/* HP */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">HP</span>
                    <span className="font-mono text-amber-200">
                      {hpCurrent}/{hpMax || "?"}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-amber-500"
                      style={{
                        width:
                          hpMax && hpMax > 0
                            ? `${Math.min(100, (hpCurrent / hpMax) * 100)}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>

                {/* XP */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">XP</span>
                  <span className="font-mono text-slate-100">{xp}</span>
                </div>

                {/* Conditions */}
                <div>
                  <span className="text-slate-300">Conditions</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {conditions.length === 0 ? (
                      <span className="text-xs text-slate-500">No active conditions</span>
                    ) : (
                      conditions.map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-amber-200"
                        >
                          {c}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Combat Snapshot */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/40">
              <h2 className="text-sm font-semibold text-slate-200">Combat Snapshot</h2>
              <p className="mt-2 text-xs text-slate-400">
                Quick view; open your full character sheet for detailed combat info.
              </p>
              <a
                href={`/characters/${character.id}`}
                className="mt-3 inline-flex rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/20"
              >
                Open full character sheet
              </a>
            </section>
          </div>

          {/* Middle: Downtime */}
          <div className="space-y-4 md:col-span-1">
            <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/40">
              <h2 className="text-sm font-semibold text-slate-200">Downtime</h2>

              <div className="mt-3 space-y-4 text-sm">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Ongoing
                  </h3>
                  {ongoingDowntime.length === 0 ? (
                    <p className="mt-1 text-xs text-slate-500">
                      No ongoing downtime. Your GM can start one from their campaign view.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {ongoingDowntime.map((d) => (
                        <li key={d.id} className="rounded-lg bg-slate-800/70 px-3 py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-100">{d.name ?? "Downtime"}</span>
                            {typeof d.progress === "number" && (
                              <span className="text-xs text-amber-200">{d.progress}</span>
                            )}
                          </div>
                          {d.description && (
                            <p className="mt-1 text-xs text-slate-400">{d.description}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Completed
                  </h3>
                  {completedDowntime.length === 0 ? (
                    <p className="mt-1 text-xs text-slate-500">
                      You have not completed any downtime here yet.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {completedDowntime.map((d) => (
                        <li key={d.id} className="rounded-lg bg-slate-800/50 px-3 py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-100">{d.name ?? "Downtime"}</span>
                            <span className="text-xs text-emerald-300">Completed</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right: Recent Activity */}
          <div className="space-y-4 md:col-span-1">
            <section className="rounded-xl border border-amber-500/40 bg-slate-900/80 p-4 shadow-lg shadow-black/50">
              <h2 className="text-sm font-semibold text-amber-200">Recent Activity</h2>
              <p className="mt-1 text-xs text-slate-400">
                Campaign events, with your own log highlighted.
              </p>

              {/* Your events */}
              <div className="mt-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Your log
                </h3>
                {yourEvents.length === 0 ? (
                  <p className="mt-1 text-xs text-slate-600">
                    No character-specific events yet. Your GM can log HP/XP, conditions,
                    loot, and more during sessions.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2 text-xs">
                    {yourEvents.slice(0, 10).map((e) => (
                      <li key={e.id} className="rounded-lg bg-slate-800/80 px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-amber-200">
                            {humanizeEvent(e)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {formatWhen(e.createdAt)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Campaign events */}
              <div className="mt-4 border-t border-slate-800 pt-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Campaign log
                </h3>
                {campaignOnlyEvents.length === 0 ? (
                  <p className="mt-1 text-xs text-slate-600">
                    No other events yet. Once your GM logs notes, quest updates, or
                    downtime, they will appear here.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2 text-xs">
                    {campaignOnlyEvents.slice(0, 10).map((e) => (
                      <li key={e.id} className="rounded-lg bg-slate-900 px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-100">{humanizeEvent(e)}</span>
                          <span className="text-[10px] text-slate-500">
                            {formatWhen(e.createdAt)}
                          </span>
                        </div>
                            {e.session && (
                              <p className="mt-0.5 text-[10px] text-slate-500">
                                Session on{" "}
                                {(
                                  (e.session as any).startedAt ?? e.session.createdAt
                                ).toLocaleDateString()}
                              </p>
                            )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
