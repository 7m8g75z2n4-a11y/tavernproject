import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type PageProps = {
  params: {
    campaignId: string;
    characterId: string;
  };
};

export default async function PlayerCharacterCampaignPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user?.id || !user.email) {
    redirect("/login");
  }

  const character = await prisma.character.findFirst({
    where: {
      id: params.characterId,
      OR: [
        { createdById: user.id },
        { ownerEmail: user.email },
      ],
    },
  });
  if (!character) notFound();

  const campaign = await prisma.campaign.findUnique({
    where: { id: params.campaignId },
  });
  if (!campaign) notFound();

  const membership = await prisma.partyMember.findFirst({
    where: {
      campaignId: campaign.id,
      characterId: character.id,
    },
  });
  if (!membership) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-3">
          <p className="text-lg font-semibold">Not in this campaign.</p>
          <Link href="/player" className="text-amber-300 hover:text-amber-200">
            Back to Player Home
          </Link>
        </div>
      </div>
    );
  }

  const sessionEvents = await prisma.sessionEvent.findMany({
    where: {
      session: {
        campaignId: campaign.id,
      },
    },
    include: { session: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const downtime = await prisma.downtimeActivity.findMany({
    where: {
      campaignId: campaign.id,
      characterId: character.id,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Campaign
            </p>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
          </div>
          <Link href="/player" className="text-sm text-amber-300 hover:text-amber-200">
            ← Back to Player Home
          </Link>
        </div>

        <section className="grid gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Character in this campaign
            </p>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{character.name}</h2>
                <p className="text-sm text-slate-400">
                  {(character as any).system ?? "System"} • {character.class ?? "Class"}{" "}
                  {character.level ? `• Lv ${character.level}` : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-amber-200">
                HP{" "}
                {(membership as any).hpCurrent != null &&
                (membership as any).hpMax != null
                  ? `${(membership as any).hpCurrent}/${(membership as any).hpMax}`
                  : "—"}
              </span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-amber-200">
                XP {(membership as any).xp ?? "—"}
              </span>
              {Array.isArray((membership as any).conditions) &&
                (membership as any).conditions.map((c: string) => (
                  <span key={c} className="rounded-full bg-slate-800 px-2 py-0.5 text-red-200">
                    {c}
                  </span>
                ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Combat & Gear
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <p className="text-xs text-slate-400 uppercase">AC</p>
                <p className="text-lg font-semibold">
                  {character.ac != null ? character.ac : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <p className="text-xs text-slate-400 uppercase">HP</p>
                <p className="text-lg font-semibold">
                  {(membership as any).hpCurrent != null &&
                  (membership as any).hpMax != null
                    ? `${(membership as any).hpCurrent}/${(membership as any).hpMax}`
                    : character.hp ?? "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <p className="text-xs text-slate-400 uppercase">Speed</p>
                <p className="text-lg font-semibold">{character.speed ?? "—"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Recent session log
            </p>
            {sessionEvents.length === 0 ? (
              <p className="text-sm text-slate-500">No events yet.</p>
            ) : (
              <div className="space-y-2">
                {sessionEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{ev.type}</p>
                      <span className="text-[11px] text-slate-400">
                        {new Date(ev.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300">{ev.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">Downtime</p>
            {downtime.length === 0 ? (
              <p className="text-sm text-slate-500">No downtime activities.</p>
            ) : (
              <div className="space-y-2">
                {downtime.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-100">{d.name ?? d.title}</p>
                      <span className="text-[11px] uppercase text-slate-400">
                        {d.status}
                      </span>
                    </div>
                    {d.description && (
                      <p className="text-xs text-slate-400">{d.description}</p>
                    )}
                    <p className="text-xs text-slate-300">
                      Progress: {d.progress ?? 0}
                      {d.goal ? ` / ${d.goal}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
