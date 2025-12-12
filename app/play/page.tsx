import Link from "next/link";
import { PageShell, SectionGroup } from "@/components/ui/Page";
import { SectionHeader } from "@/components/ui/Section";
import { TavernCard } from "@/components/ui/TavernCard";
import { TavernButton } from "@/components/ui/TavernButton";
import { TavernBadge } from "@/components/ui/TavernBadge";
import { StatPill } from "@/components/ui/StatPill";
import { EmptyState } from "@/components/ui/EmptyState";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

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
      className: (m.character as any)?.class ?? null,
      level: (m.character as any)?.level ?? null,
      hp: (m as any).hpCurrent ?? null,
      xp: (m as any).xp ?? null,
      conditions: (m as any).conditions ?? null,
    };
  });

  const sortedRows = [...rows].sort((a, b) => {
    if (a.isActive === b.isActive) return 0;
    return a.isActive ? -1 : 1;
  });

  return (
    <PageShell className="pt-6 pb-12">
      <SectionHeader
        title="My Table"
        subtitle="Campaigns where you have a seat and the characters you bring."
        actions={
          <Link href="/campaigns">
            <TavernButton variant="secondary">Browse campaigns</TavernButton>
          </Link>
        }
      />

      <SectionGroup>
        {rows.length === 0 ? (
          <EmptyState
            title="No table yet"
            body="You are not seated at any campaigns. Ask a GM to invite one of your characters."
            cta={
              <Link href="/campaigns">
                <TavernButton variant="ghost">Find a campaign</TavernButton>
              </Link>
            }
          />
        ) : (
          sortedRows.map((row) => (
            <TavernCard
              key={`${row.campaignId}-${row.characterId}`}
              title={row.characterName}
              subtitle={`${row.campaignName} · ${row.system ?? "System"}${
                row.level ? ` · Lv ${row.level}` : ""
              }`}
              actions={
                <>
                  <Link href={`/characters/${row.characterId}`}>
                    <TavernButton variant="secondary">Character</TavernButton>
                  </Link>
                  <Link href={`/play/${row.campaignId}/${row.characterId}`}>
                    <TavernButton variant="primary">Open player view</TavernButton>
                  </Link>
                </>
              }
            >
              <div className="flex flex-wrap gap-3">
                <StatPill label="HP" value={row.hp ?? "--"} />
                <StatPill label="XP" value={row.xp ?? "--"} />
                {Array.isArray(row.conditions) &&
                  row.conditions.map((condition) => (
                    <TavernBadge key={condition} variant="muted">
                      {condition}
                    </TavernBadge>
                  ))}
              </div>
              <p className="text-sm text-slate-400">
                Last session:{" "}
                {row.lastSessionDate
                  ? new Date(row.lastSessionDate).toLocaleDateString()
                  : "Not logged yet"}
              </p>
            </TavernCard>
          ))
        )}
      </SectionGroup>
    </PageShell>
  );
}
