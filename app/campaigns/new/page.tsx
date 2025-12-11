import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewCampaignClient from "./NewCampaignClient";

export default async function NewCampaignPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/auth");
  }

  return <NewCampaignClient />;
}
