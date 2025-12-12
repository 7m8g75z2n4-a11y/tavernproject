import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type CampaignSessionsPageParams = {
  id?: string | string[] | undefined;
};

type CampaignSessionsPageProps = {
  params?: Promise<CampaignSessionsPageParams>;
  searchParams?: Promise<any>;
};

export default async function CampaignSessionsPage({ params }: CampaignSessionsPageProps) {
  const resolvedParams = await params;
  const rawId = resolvedParams?.id;
  const campaignId =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
      ? rawId[0]
      : undefined;

  if (!campaignId) {
    notFound();
  }
  const user = await getCurrentUser();
  if (!user) {
    return notFound();
  }

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      OR: [
        { createdById: user.id ?? undefined },
        { ownerEmail: user.email ?? undefined },
      ],
    },
    include: {
      sessions: {
        orderBy: { createdAt: "desc" },
        include: {
          events: {
            take: 3,
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!campaign) {
    return notFound();
  }

  const hasSessions = campaign.sessions.length > 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400/70">
              Campaign Sessions
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-amber-50">
              {campaign.name}
            </h1>
            <p className="mt-1 text-sm text-slate-300/80">
              A log of every night you and your party met around the table.
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Link
              href={`/campaigns/${campaign.id}`}
              className="rounded-full border border-amber-500/60 bg-slate-900 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-amber-200 hover:border-amber-300 hover:bg-slate-800"
            >
              Back to Campaign
            </Link>
          </div>
        </div>

        <section className="rounded-3xl border border-amber-900/40 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-5 shadow-xl shadow-black/60">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-amber-100">Sessions</h2>
            {hasSessions && (
              <p className="text-xs text-slate-400">
                {campaign.sessions.length}{" "}
                {campaign.sessions.length === 1 ? "session" : "sessions"}
              </p>
            )}
          </div>

          {!hasSessions && (
            <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/70 px-4 py-6 text-sm text-slate-300">
              <p>
                No sessions yet. Once you start and end sessions from the{" "}
                <span className="font-semibold text-amber-200">main campaign page</span>, they’ll
                be listed here with summaries and links into their full history.
              </p>
              <p className="mt-3">
                Head back to the campaign, click{" "}
                <span className="font-semibold text-amber-200">Start Session</span>, run your
                adventure, then <span className="font-semibold text-amber-200">End Session</span>{" "}
                to log it.
              </p>
            </div>
          )}

          {hasSessions && (
            <ul className="flex flex-col gap-3">
              {campaign.sessions.map((session) => {
                const isActive = session.isActive ?? false;
                const started =
                  (session as any).startedAt ??
                  (session as any).date ??
                  (session as any).sessionDate ??
                  session.createdAt;
                const ended =
                  (session as any).endedAt ??
                  (session as any).completedAt ??
                  null;

                const startedText = started ? new Date(started).toLocaleString() : "–";
                const endedText = ended ? new Date(ended).toLocaleString() : "";
                const lastEvents = session.events ?? [];

                return (
                  <li
                    key={session.id}
                    className="group rounded-2xl border border-slate-800/80 bg-slate-950/70 px-4 py-4 transition hover:border-amber-500/70 hover:bg-slate-900/80"
                  >
                    <Link href={`/sessions/${session.id}`} className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-semibold text-amber-100">
                            {(session as any).name || session.title || "Untitled Session"}
                          </h3>
                          <p className="text-xs text-slate-400">
                            Started {startedText}
                            {endedText ? ` • Ended ${endedText}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isActive && (
                            <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                              Active
                            </span>
                          )}
                          {!isActive && ended && (
                            <span className="inline-flex items-center rounded-full bg-slate-700/60 px-3 py-1 text-xs font-semibold text-slate-200">
                              Archived
                            </span>
                          )}
                        </div>
                      </div>

                      {session.summary && (
                        <p className="text-sm text-slate-200/90">{session.summary}</p>
                      )}

                      {lastEvents.length > 0 && (
                        <div className="mt-2 text-xs text-slate-400">
                          <p className="mb-1 font-semibold text-slate-300">Last few moments:</p>
                          <ul className="space-y-0.5">
                            {lastEvents.map((e) => (
                              <li key={e.id} className="truncate">
                            - {e.type} - {(e as any).summary || (e as any).description || "event"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p className="mt-3 text-right text-xs font-medium text-amber-300 opacity-0 transition group-hover:opacity-100">
                        View full session -
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
