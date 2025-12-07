import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CharacterWizard } from "@/components/characters/CharacterWizard";

export async function createCharacterFromWizard(formData: FormData) {
  "use server";

  const payload = formData.get("payload")?.toString();
  const campaignId = formData.get("campaignId")?.toString();

  if (!payload) redirect("/characters");

  let data: any;
  try {
    data = JSON.parse(payload);
  } catch {
    redirect("/characters");
  }

  const name = (data?.identity?.name || "").toString().trim();
  const system = (data?.system || "dnd5e").toString().trim() || "dnd5e";
  if (!name) redirect("/characters");

  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        authUserId: "demo-user",
        displayName: "Demo User",
      },
    });
  }

  const character = await prisma.character.create({
    data: {
      name,
      system,
      userId: user.id,
      portraitUrl: data?.identity?.portraitUrl || null,
      coreJson: {
        system,
        concept: data?.concept,
        identity: data?.identity,
        attributes: data?.attributes,
        combat: data?.combat,
        primaryAttack: data?.primaryAttack,
        inventory: data?.inventory,
        story: data?.story,
      },
    },
  });

  if (campaignId) {
    await prisma.campaignPlayer.create({
      data: {
        campaignId,
        characterId: character.id,
      },
    });
    revalidatePath(`/campaigns/${campaignId}`);
    redirect(`/campaigns/${campaignId}`);
  }

  revalidatePath("/characters");
  redirect(`/characters/${character.id}`);
}

export default function NewCharacterPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const campaignId =
    typeof searchParams.campaignId === "string" ? searchParams.campaignId : undefined;

  return (
    <main className="min-h-screen bg-black text-amber-100 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
            Character
          </p>
          <h1 className="text-3xl font-semibold">Create a new character</h1>
          <p className="text-sm opacity-70 mt-1">
            A quick wizard to build identity, stats, gear, and story hooks.
          </p>
        </div>
        <CharacterWizard
          createCharacterAction={createCharacterFromWizard}
          campaignId={campaignId}
        />
      </div>
    </main>
  );
}
