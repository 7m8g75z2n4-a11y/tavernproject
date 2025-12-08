import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import CharacterSheetClient from "./CharacterSheetClient";

type PageProps = {
  params: { id: string };
};

export default async function CharacterPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth");
  }

  const email = session.user.email;
  const id = params.id;

  const character = await prisma.character.findUnique({
    where: { id },
  });

  if (!character) {
    notFound();
  }

  if (character.ownerEmail && character.ownerEmail !== email) {
    notFound();
  }

  return <CharacterSheetClient character={character} />;
}
