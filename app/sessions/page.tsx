import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null | undefined) {
  if (!value) return "Unknown date";
  return value.toLocaleString();
}

export default async function SessionsIndexPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect("/auth");
  }

  const sessions = await prisma.session.findMany({
    where: { ownerEmail: email },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      campaign: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <header className="flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-amber-400/70">
              Tavern
            </p>
            <h1 className="text-3xl font-semibold text-amber-100">
              Sessions
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Recent sessions across your campaigns.
            </p>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-400">
              No sessions yet. Start one from a campaign page.
            </p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {sessions.map((sessionItem) => (
                <li key={sessionItem.id} className="py-3">
                  <Link
                    href={`/sessions/${sessionItem.id}`}
                    className="flex items-center justify-between gap-4 hover:bg-slate-900/80 rounded-xl px-3 py-2 -mx-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-amber-100">
                          {sessionItem.campaign?.name || "Untitled Campaign"}
                        </p>
                        {!(sessionItem as any).isActive && (
                          <span className="rounded-full border border-slate-600 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                            Completed
                          </span>
                        )}
                        {(sessionItem as any).isActive && (
                          <span className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-300">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatDate(sessionItem.createdAt)}
                      </p>
                      {(sessionItem as any).summary && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-300">
                          {(sessionItem as any).summary}
                        </p>
                      )}
                    </div>

                    <span className="text-xs text-slate-500">
                      View session →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
