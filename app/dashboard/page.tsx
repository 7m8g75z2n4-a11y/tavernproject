import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const characters = await prisma.character.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <DashboardClient initialCharacters={characters} />;
}
