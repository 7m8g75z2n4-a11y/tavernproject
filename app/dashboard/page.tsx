import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  const email = session.user?.email ?? null;

  const [characters, campaigns] = await Promise.all([
    prisma.character.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.campaign.findMany({
      where: email ? { ownerEmail: email } : undefined,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <DashboardClient initialCharacters={characters} initialCampaigns={campaigns} />
  );
}
