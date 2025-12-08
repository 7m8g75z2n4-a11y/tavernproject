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

  const characters = await prisma.character.findMany({
    orderBy: { createdAt: "desc" },
    // Later we can filter by session.user.email, etc.
  });

  return <DashboardClient initialCharacters={characters} />;
}
