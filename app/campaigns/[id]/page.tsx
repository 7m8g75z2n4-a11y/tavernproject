import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import CampaignPageClient from "./CampaignPageClient";

type PageProps = {
  params: { id: string };
};

export default async function CampaignPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth");
  }

  const email = session.user.email;
  const id = params.id;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!campaign) {
    notFound();
  }

  if (campaign.ownerEmail && campaign.ownerEmail !== email) {
    // Exists but not owned by this user ? pretend it doesn't exist
    notFound();
  }

  return <CampaignPageClient campaign={campaign} />;
}
