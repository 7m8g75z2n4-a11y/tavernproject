import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type PageProps = {
  params: { id: string };
};

export default async function SessionPage({ params }: PageProps) {
  const sessionId = params.id;

  const user = await getCurrentUser();
  if (!user) {
    return notFound();
  }

  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      campaign: {
        OR: [
          { createdById: user.id },
          { ownerEmail: user.email ?? undefined },
        ],
      },
    },
    include: {
      campaign: true,
      events: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!session) {
    return notFound();
  }

  const started =
    (session as any).startedAt && new Date((session as any).startedAt).toLocaleString();
  const ended =
    (session as any).endedAt && new Date((session as any).endedAt).toLocaleString();

  const duration =
    (session as any).startedAt && (session as any).endedAt
      ? Math.round(
          (new Date((session as any).endedAt).getTime() -
            new Date((session as any).startedAt).getTime()) /
            (1000 * 60)
        )
      : null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400/70">Session</p>
            <h1 className="mt-2 text-2xl font-semibold text-amber-50">
              {(session as any).name || session.title || "Untitled Session"}
            </h1>
            <p className="mt-1 text-sm text-slate-300/80">
              {session.campaign?.name ? `Campaign: ${session.campaign.name}` : "Linked campaign"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Started {started || "-"}
              {ended ? ` • Ended ${ended}` : ""}
              {duration !== null && ` • ~${duration} min`}
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            {session.campaign && (
              <Link
                href={`/campaigns/${session.campaign.id}`}
                className="rounded-full border border-amber-500/60 bg-slate-900 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-amber-200 hover:border-amber-300 hover:bg-slate-800"
              >
                Back to Campaign
              </Link>
            )}
          </div>
        </header>

        <section className="rounded-3xl border border-amber-900/40 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-5 shadow-xl shadow-black/60">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Recap
          </h2>
          {session.summary ? (
            <p className="mt-3 text-sm leading-relaxed text-slate-200">{session.summary}</p>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              No written summary yet. You can still read through the event history below.
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-xl shadow-black/60">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Session History
          </h2>

          {session.events.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">
              No events were logged for this session.
            </p>
          ) : (
            <ol className="mt-4 space-y-3 text-sm">
              {session.events.map((event) => {
                const when = new Date(
                  (event as any).createdAt ?? (event as any).timestamp ?? new Date()
                ).toLocaleTimeString();

                const text =
                  (event as any).summary ||
                  (event as any).description ||
                  event.message ||
                  `Event type: ${event.type}`;

                return (
                  <li key={event.id} className="relative border-l border-slate-700/80 pl-4">
                    <span className="absolute -left-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-100">{event.type}</p>
                      <span className="text-xs text-slate-400">{when}</span>
                    </div>
                    <p className="mt-1 text-slate-200">{text}</p>
                    {(event as any).details && (
                      <pre className="mt-1 max-h-32 overflow-y-auto rounded bg-slate-900/70 p-2 text-xs text-slate-300">
                        {JSON.stringify((event as any).details, null, 2)}
                      </pre>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
