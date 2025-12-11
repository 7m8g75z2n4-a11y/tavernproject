import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewCharacterClient from "./NewCharacterClient";

export default async function NewCharacterPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  return <NewCharacterClient />;
}
