import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user?.id || !user.email) {
    redirect("/login");
  }

  const characters = await prisma.character.findMany({
    where: {
      isArchived: false,
      OR: [{ createdById: user.id }, { ownerEmail: user.email }],
    },
    include: {
      partyMembers: {
        include: { campaign: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const inCampaign = characters.filter((c) => c.partyMembers.length > 0);
  const noCampaign = characters.filter((c) => c.partyMembers.length === 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Your Tavern</h1>
          <p className="text-slate-400">
            Welcome back. Here are your characters and the campaigns they are in.
          </p>
        </header>

        {characters.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <p className="text-sm text-slate-300">You don&apos;t have any characters yet.</p>
            <Link
              href="/characters/new"
              className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-500"
            >
              Create a Character
            </Link>
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Active Characters</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {inCampaign.map((char) => {
                  const primary = char.partyMembers[0];
                  const hpCurrent = (primary as any)?.hpCurrent;
                  const hpMax = (primary as any)?.hpMax;
                  const xp = (primary as any)?.xp;
                  const conditions = Array.isArray((primary as any)?.conditions)
                    ? (primary as any).conditions
                    : [];
                  return (
                    <div
                      key={char.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">{char.name}</h3>
                          <p className="text-sm text-slate-400">
                            {(char as any).system ?? "System"} / {char.class ?? "Class"}{" "}
                            {char.level ? `/ Lv ${char.level}` : ""}
                          </p>
                        </div>
                        <Link
                          href={`/characters/${char.id}`}
                          className="text-xs text-amber-300 hover:text-amber-200"
                        >
                          Open Character
                        </Link>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px]">
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-amber-200">
                          HP {hpCurrent != null && hpMax != null ? `${hpCurrent}/${hpMax}` : "--"}
                        </span>
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-amber-200">
                          XP {xp ?? "--"}
                        </span>
                        {conditions.map((c: string) => (
                          <span
                            key={c}
                            className="rounded-full bg-slate-800 px-2 py-0.5 text-red-200"
                          >
                            {c}
                          </span>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Campaigns
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {char.partyMembers.map((pm) => (
                            <Link
                              key={pm.id}
                              href={`/campaigns/${pm.campaignId}`}
                              className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-200 hover:border-amber-400"
                            >
                              {pm.campaign?.name ?? "Campaign"}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {primary?.campaignId && (
                        <div className="flex gap-2">
                          <Link
                            href={`/campaigns/${primary.campaignId}`}
                            className="inline-flex flex-1 items-center justify-center rounded-md border border-amber-600/50 bg-amber-600/20 px-3 py-1.5 text-sm font-semibold text-amber-100 hover:border-amber-400"
                          >
                            Open Campaign
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {noCampaign.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">Not in a campaign yet</h2>
                <div className="space-y-2">
                  {noCampaign.map((char) => (
                    <div
                      key={char.id}
                      className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{char.name}</p>
                        <p className="text-xs text-slate-400">
                          {(char as any).system ?? "System"} / {char.class ?? "Class"}
                        </p>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <Link
                          href={`/characters/${char.id}`}
                          className="rounded-md border border-slate-700 px-3 py-1 text-amber-200 hover:border-amber-400"
                        >
                          Open
                        </Link>
                        <Link
                          href="/campaigns"
                          className="rounded-md bg-amber-600 px-3 py-1 text-slate-950 font-semibold hover:bg-amber-500"
                        >
                          Join a Campaign
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
