// app/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

type Counts = {
  characters: number;
  campaigns: number;
  sessions: number;
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect("/auth");
  }

  const [characters, activeCampaigns, archivedCampaigns, sessionCount] = await Promise.all([
    prisma.character.findMany({
      where: { ownerEmail: email, isArchived: false },
      orderBy: { createdAt: "desc" },
    }),
    prisma.campaign.findMany({
      where: { ownerEmail: email, isArchived: false },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { sessions: true } } },
    }),
    prisma.campaign.findMany({
      where: { ownerEmail: email, isArchived: true },
      orderBy: [{ archivedAt: "desc" }, { createdAt: "desc" }],
      include: { _count: { select: { sessions: true } } },
    }),
    prisma.session.count({ where: { ownerEmail: email } }),
  ]);

  const counts: Counts = {
    characters: characters.length,
    campaigns: activeCampaigns.length + archivedCampaigns.length,
    sessions: sessionCount,
  };

  return (
    <DashboardClient
      initialCharacters={characters}
      initialCampaigns={activeCampaigns}
      archivedCampaigns={archivedCampaigns}
      counts={counts}
      userEmail={email}
    />
  );
}
