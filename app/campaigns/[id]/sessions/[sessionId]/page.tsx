import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type PageProps = {
  params: { id: string; sessionId: string };
};

function describeEvent(ev: any) {
  const data = (ev as any).data ?? {};
  switch (ev.type) {
    case "hp_change":
      return `HP ${data.delta ?? ""}${data.current ? ` (now ${data.current})` : ""}`;
    case "xp_gain":
    case "xp_change":
      return `XP ${data.amount ?? ""}${data.current ? ` (now ${data.current})` : ""}`;
    case "condition_add":
      return `Condition added: ${data.condition ?? "Unknown"}`;
    case "condition_remove":
      return `Condition removed: ${data.condition ?? "Unknown"}`;
    case "quest_update":
      return `Quest update: ${data.title ?? "Quest"} -> ${data.status ?? "Updated"}`;
    case "downtime_advance":
    case "downtime_complete":
    case "downtime_cancel":
    case "downtime_start":
      return ev.message || ev.type;
    case "loot":
      return ev.message || `Loot: ${data.item ?? ""}`;
    case "note":
      return ev.message || "Note";
    default:
      return ev.message || ev.type || "Event";
  }
}

export default async function SessionDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const session = await prisma.session.findFirst({
    where: {
      id: params.sessionId,
      campaign: { id: params.id, OR: [{ createdById: user.id ?? undefined }, { ownerEmail: user.email ?? undefined }] },
    },
    include: {
      campaign: { select: { id: true, name: true } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!session) {
    notFound();
  }

  const startedAt = new Date(session.createdAt);
  const endedAt = session.endedAt ? new Date(session.endedAt) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Session</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {session.title || `Session ${session.index ?? ""}`.trim()}
            </h1>
            <p className="mt-2 text-sm text-slate-400">{session.campaign?.name ?? ""}</p>
            <div className="mt-2 text-xs text-slate-500 space-x-2">
              <span>
                Started {startedAt.toLocaleDateString()} {startedAt.toLocaleTimeString()}
              </span>
              {endedAt && (
                <>
                  <span>|</span>
                  <span>
                    Ended {endedAt.toLocaleDateString()} {endedAt.toLocaleTimeString()}
                  </span>
                </>
              )}
              {session.isActive && (
                <>
                  <span>|</span>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300">
                    Active
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Link
              href={`/campaigns/${session.campaignId}/sessions`}
              className="rounded-full border border-slate-600 bg-slate-800/80 px-4 py-2 text-sm hover:bg-slate-700"
            >
              Back to Sessions
            </Link>
            <Link
              href={`/campaigns/${session.campaignId}`}
              className="rounded-full border border-amber-500/60 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-500/20"
            >
              Open Campaign
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
          <h2 className="text-sm font-semibold tracking-tight text-slate-100 mb-3">
            Session History
          </h2>
          {session.events.length === 0 ? (
            <p className="text-sm text-slate-400">No events were logged for this session.</p>
          ) : (
            <ol className="relative border-l border-slate-700 pl-4 space-y-4">
              {session.events.map((ev) => {
                const createdAt = new Date(ev.createdAt);
                const label = ev.type ?? (ev as any).kind ?? "event";
                const description =
                  (ev as any).summary ||
                  ev.message ||
                  (ev as any).note ||
                  JSON.stringify((ev as any).payload ?? {}, null, 0);

                return (
                  <li key={ev.id} className="space-y-1">
                    <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-amber-400"></div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-amber-100 uppercase tracking-wide">
                        {label}
                      </span>
                      <span>|</span>
                      <span>
                        {createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-100 whitespace-pre-wrap">
                      {describeEvent(ev) || description}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
