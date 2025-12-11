import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SessionNewClient from "./SessionNewClient";

export default async function SessionNewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/auth");
  }

  return <SessionNewClient />;
}
