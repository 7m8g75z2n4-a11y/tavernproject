import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/navigation";
import { redirect } from "next/navigation";

async function ensureOwner(characterId: string, user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user) return null;
  const character = await prisma.character.findUnique({ where: { id: characterId } });
  if (!character) return null;
  if (character.createdById && character.createdById !== user.id) return null;
  if (character.ownerEmail && character.ownerEmail !== user.email) return null;
  return character;
}

export async function updateCharacter(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) return;

  const characterId = formData.get("characterId")?.toString();
  if (!characterId) return;

  const character = await ensureOwner(characterId, user);
  if (!character) return;

  const name = (formData.get("name") ?? "").toString().trim();
  const system = (formData.get("system") ?? "").toString().trim();
  const className = (formData.get("class") ?? "").toString().trim();
  const avatarUrl = (formData.get("avatarUrl") ?? "").toString().trim();
  const vibe = (formData.get("vibe") ?? "").toString().trim();

  const appearance = character.appearanceJson ?? {};
  const updatedAppearance = {
    ...appearance,
    primaryColor: (formData.get("primaryColor") ?? appearance.primaryColor ?? "#f97316").toString(),
    accentColor: (formData.get("accentColor") ?? appearance.accentColor ?? "#22d3ee").toString(),
    vibe: vibe || appearance.vibe,
    pose: (formData.get("pose") ?? appearance.pose ?? "idle").toString(),
  };

  await prisma.character.update({
    where: { id: characterId },
    data: {
      name: name || character.name,
      class: className || character.class,
      avatarUrl: avatarUrl || character.avatarUrl,
      appearanceJson: updatedAppearance,
      isArchived: false,
      deletedAt: null,
    },
  });

  revalidatePath(`/characters/${characterId}`);
  revalidatePath("/me");
}

export async function archiveCharacter(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) return;

  const characterId = formData.get("characterId")?.toString();
  const confirmation = (formData.get("confirmation") ?? "").toString().trim();
  if (!characterId || confirmation !== "ARCHIVE") return;

  const character = await ensureOwner(characterId, user);
  if (!character) return;

  await prisma.character.update({
    where: { id: characterId },
    data: { isArchived: true, deletedAt: new Date() },
  });

  revalidatePath(`/characters/${characterId}`);
  revalidatePath("/me");
  revalidatePath("/play");
}

export async function deleteCharacter(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const characterId = formData.get("characterId")?.toString();
  const confirmation = (formData.get("confirmation") ?? "").toString().trim();
  if (!characterId) return;

  const character = await ensureOwner(characterId, user);
  if (!character) return;
  if (confirmation !== character.name) return;

  const membership = await prisma.partyMember.findFirst({
    where: { characterId },
  });
  if (membership) return;

  await prisma.character.delete({ where: { id: characterId } });

  revalidatePath("/me");
  revalidatePath("/play");
  redirect("/characters");
}
