import { prisma } from "@/lib/prisma";
import { SessionEventType } from "@prisma/client";
import { getCurrentUser, authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import CampaignPageClient, { type CampaignWithRelations } from "./CampaignPageClient";
import { getServerSession } from "next-auth";
import { generateInviteToken } from "@/lib/invites";

type CampaignPageParams = {
  id?: string | string[] | undefined;
};

type CampaignPageProps = {
  params?: Promise<CampaignPageParams>;
  searchParams?: Promise<any>;
};

const prismaAny = prisma as any;

async function logSessionEvent(
  campaignId: string,
  type: SessionEventType,
  message: string,
  characterId?: string
) {
  const active = await prisma.session.findFirst({
    where: { campaignId, isActive: true },
    select: { id: true },
  });
  if (!active) return;
  await prisma.sessionEvent.create({
    data: {
      sessionId: active.id,
      type,
      message,
      ...(characterId ? { characterId } : {}),
    },
  });
}

async function createInvite(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  const expiresAtRaw = String(formData.get("expiresAt") || "").trim();
  const maxUsesRaw = String(formData.get("maxUses") || "").trim();

  const user = await getCurrentUser();
  if (!user?.id || !campaignId) return;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, createdById: true, ownerEmail: true },
  });
  if (!campaign) return;

  const isOwner =
    (campaign.createdById && campaign.createdById === user.id) ||
    (!!campaign.ownerEmail && campaign.ownerEmail === user.email);
  if (!isOwner) return;

  const token = generateInviteToken();
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;
  const maxUses =
    maxUsesRaw && !Number.isNaN(Number(maxUsesRaw)) ? Number(maxUsesRaw) : null;

  await prisma.campaignInvite.create({
    data: {
      campaignId,
      token,
      createdById: user.id,
      expiresAt,
      maxUses,
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

async function revokeInvite(formData: FormData) {
  "use server";
  const inviteId = String(formData.get("inviteId") || "");
  const campaignId = String(formData.get("campaignId") || "");
  const user = await getCurrentUser();
  if (!inviteId || !campaignId || !user?.id) return;

  const invite = await prisma.campaignInvite.findUnique({
    where: { id: inviteId },
    include: { campaign: true },
  });
  if (!invite || invite.campaignId !== campaignId) return;

  const isOwner =
    (invite.campaign.createdById && invite.campaign.createdById === user.id) ||
    (!!invite.campaign.ownerEmail && invite.campaign.ownerEmail === user.email);
  if (!isOwner) return;

  await prisma.campaignInvite.update({
    where: { id: inviteId },
    data: { isRevoked: true },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

async function summarizeLastSession(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  if (!campaignId) return "No campaign id.";

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      sessions: {
        orderBy: { createdAt: "desc" },
        include: { events: true },
        take: 1,
      },
      quests: true,
      partyMembers: { include: { character: true } },
    },
  });
  if (!campaign) return "Campaign not found.";

  const last = campaign.sessions[0];
  const eventsText =
    last?.events?.map((e) => `- ${e.type}: ${e.message ?? ""}`).join("\n") ?? "";

  return (
    `Campaign: ${campaign.name}\n` +
    `Last session: ${last?.title ?? "Unknown"} on ${last ? last.createdAt.toISOString() : "n/a"}\n` +
    `Events:\n${eventsText || "No events logged."}`
  );
}

async function campaignOverview(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  if (!campaignId) return "No campaign id.";

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      quests: true,
      partyMembers: { include: { character: true } },
      sessions: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });
  if (!campaign) return "Campaign not found.";

  const party = campaign.partyMembers
    .map((p) => p.character?.name ?? "Unknown")
    .join(", ");
  const questList = campaign.quests
    .map((q) => `- ${q.title} (${q.status})`)
    .join("\n");
  const sessionList = campaign.sessions
    .map((s) => `- ${s.title ?? "Session"} (${s.createdAt.toISOString()})`)
    .join("\n");

  return (
    `Campaign: ${campaign.name}\n` +
    `Party: ${party || "No party yet"}\n` +
    `Recent sessions:\n${sessionList || "None"}\n` +
    `Quests:\n${questList || "No quests"}`
  );
}

async function nextSessionHooks(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  if (!campaignId) return "No campaign id.";

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      quests: true,
      partyMembers: { include: { character: true } },
    },
  });
  if (!campaign) return "Campaign not found.";

  const hooks = campaign.quests
    .filter((q) => q.status !== "COMPLETED" && q.status !== "FAILED")
    .slice(0, 3)
    .map((q) => `- Push quest "${q.title}" (${q.status})`)
    .join("\n");

  return (
    `Next session hooks for ${campaign.name}:\n` +
    (hooks || "- Introduce a fresh complication tied to the party's goals.")
  );
}

async function addCharacterToCampaign(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect("/auth");
  }

  const campaignId = formData.get("campaignId");
  const characterId = formData.get("characterId");

  if (typeof campaignId !== "string" || typeof characterId !== "string") {
    return;
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ownerEmail: email },
  });

  if (!campaign) {
    return;
  }

  const existing = await prisma.partyMember.findFirst({
    where: { campaignId, characterId, ownerEmail: email },
  });

  if (!existing) {
    await prisma.partyMember.create({
      data: {
        campaignId,
        characterId,
        ownerEmail: email,
      },
    });
  }

  revalidatePath(`/campaigns/${campaignId}`);
}

async function deleteCampaign(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const campaignId = formData.get("campaignId");
  if (typeof campaignId !== "string") return;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, createdById: true },
  });
  if (!campaign || campaign.createdById !== user.id) {
    redirect("/");
  }

  const sessions = await prisma.session.findMany({
    where: { campaignId },
    select: { id: true },
  });
  const sessionIds = sessions.map((s) => s.id);

  await prisma.$transaction([
    prisma.sessionEvent.deleteMany({
      where: sessionIds.length ? { sessionId: { in: sessionIds } } : { sessionId: "" },
    }),
    prisma.session.deleteMany({ where: { campaignId } }),
    prisma.downtimeActivity.deleteMany({ where: { campaignId } }),
    prisma.gMNote.deleteMany({ where: { campaignId } }),
    prisma.quest.deleteMany({ where: { campaignId } }),
    prisma.nPC.deleteMany({ where: { campaignId } }),
    prisma.partyMember.deleteMany({ where: { campaignId } }),
    prisma.campaign.delete({ where: { id: campaignId } }),
  ]);

  revalidatePath("/");
  redirect("/");
}

async function archiveCampaign(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const campaignId = formData.get("campaignId");
  if (typeof campaignId !== "string") return;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, createdById: true },
  });
  if (!campaign || campaign.createdById !== user.id) {
    redirect("/");
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { isArchived: true, archivedAt: new Date() },
  });

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/campaigns");
  revalidatePath("/dashboard");
}

async function restoreCampaign(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const campaignId = formData.get("campaignId");
  if (typeof campaignId !== "string") return;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, createdById: true },
  });
  if (!campaign || campaign.createdById !== user.id) {
    redirect("/");
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { isArchived: false, archivedAt: null },
  });

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/campaigns");
  revalidatePath("/dashboard");
}

async function createNpc(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!campaignId || !name) return;

  await prisma.nPC.create({
    data: {
      campaignId,
      name,
      role: role || null,
      description: description || null,
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

async function updateNpc(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  const npcId = String(formData.get("npcId") || formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!campaignId || !npcId || !name) return;

  await prisma.nPC.update({
    where: { id: npcId },
    data: {
      name,
      role: role || null,
      description: description || null,
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

async function deleteNpc(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  const npcId = String(formData.get("npcId") || formData.get("id") || "");

  if (!campaignId || !npcId) return;

  await prisma.nPC.delete({ where: { id: npcId } });
  revalidatePath(`/campaigns/${campaignId}`);
}

async function createQuest(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  const title = String(formData.get("title") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const status = String(formData.get("status") || "PLANNED");

  if (!campaignId || !title) return;

  await prisma.quest.create({
    data: {
      campaignId,
      title,
      summary: summary || null,
      status: status as any,
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

async function updateQuest(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  const questId = String(formData.get("questId") || formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const status = String(formData.get("status") || "");

  if (!campaignId || !questId || !title) return;

  await prisma.quest.update({
    where: { id: questId },
    data: {
      title,
      summary: summary || null,
      ...(status ? { status: status as any } : {}),
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

async function updateQuestStatus(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  const questId = String(formData.get("questId") || formData.get("id") || "");
  const status = String(formData.get("status") || "");

  if (!campaignId || !questId || !status) return;

  const quest = await prisma.quest.update({
    where: { id: questId },
    data: { status: status as any },
  });

  await logSessionEvent(
    campaignId,
    SessionEventType.quest_update,
    `Quest "${quest.title}" marked ${status.toLowerCase()}.`
  );

  revalidatePath(`/campaigns/${campaignId}`);
}

async function deleteQuest(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  const questId = String(formData.get("questId") || formData.get("id") || "");

  if (!campaignId || !questId) return;

  await prisma.quest.delete({ where: { id: questId } });
  revalidatePath(`/campaigns/${campaignId}`);
}

async function createNote(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const npcId = String(formData.get("npcId") || "") || null;
  const questId = String(formData.get("questId") || "") || null;

  if (!campaignId || !title || !body) return;

  const active = await prisma.session.findFirst({
    where: { campaignId, isActive: true },
    select: { id: true },
  });

  await prisma.gMNote.create({
    data: {
      campaignId,
      title,
      body,
      npcId: npcId || null,
      questId: questId || null,
      sessionId: active?.id ?? null,
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

async function updateNote(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  const noteId = String(formData.get("noteId") || formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!campaignId || !noteId || !title || !body) return;

  await prisma.gMNote.update({
    where: { id: noteId },
    data: { title, body },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

async function deleteNote(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  const noteId = String(formData.get("noteId") || formData.get("id") || "");

  if (!campaignId || !noteId) return;

  await prisma.gMNote.delete({ where: { id: noteId } });
  revalidatePath(`/campaigns/${campaignId}`);
}

async function createDowntime(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  const characterId = String(formData.get("characterId") || "");
  const name = String(formData.get("name") || formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const goalRaw = String(formData.get("goal") || "").trim();
  const goal = goalRaw ? Number(goalRaw) : null;

  if (!campaignId || !characterId || !name) return;

  const activity = await prisma.downtimeActivity.create({
    data: {
      campaignId,
      characterId,
      name,
      description: description || null,
      goal,
      status: "ONGOING",
    },
  });

  await logSessionEvent(
    campaignId,
    SessionEventType.downtime_start,
    `Downtime started: ${activity.name}`,
    activity.characterId
  );

  revalidatePath(`/campaigns/${campaignId}`);
}

async function advanceDowntime(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  const activityId = String(formData.get("activityId") || formData.get("downtimeId") || "");
  const amountRaw = String(formData.get("amount") || "").trim();
  const amount = amountRaw ? Number(amountRaw) : Number(formData.get("progressIncrement") || 1);

  if (!campaignId || !activityId) return;

  const activity = await prisma.downtimeActivity.update({
    where: { id: activityId },
    data: {
      progress: { increment: amount },
    },
  });

  await logSessionEvent(
    campaignId,
    SessionEventType.downtime_advance,
    `Downtime advanced: ${activity.name} (+${amount}).`,
    activity.characterId
  );

  revalidatePath(`/campaigns/${campaignId}`);
}

async function completeDowntime(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  const activityId = String(formData.get("activityId") || formData.get("downtimeId") || "");

  if (!campaignId || !activityId) return;

  const activity = await prisma.downtimeActivity.update({
    where: { id: activityId },
    data: {
      status: "COMPLETED",
    },
  });

  await logSessionEvent(
    campaignId,
    SessionEventType.downtime_complete,
    `Downtime completed: ${activity.name}`,
    activity.characterId
  );

  revalidatePath(`/campaigns/${campaignId}`);
}

async function cancelDowntime(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId") || "");
  const activityId = String(formData.get("activityId") || formData.get("downtimeId") || "");

  if (!campaignId || !activityId) return;

  const activity = await prisma.downtimeActivity.update({
    where: { id: activityId },
    data: {
      status: "CANCELLED",
    },
  });

  await logSessionEvent(
    campaignId,
    SessionEventType.downtime_cancel,
    `Downtime cancelled: ${activity.name}`,
    activity.characterId
  );

  revalidatePath(`/campaigns/${campaignId}`);
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const resolvedParams = await params;
  const rawId = resolvedParams?.id;
  const id =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
      ? rawId[0]
      : undefined;

  if (!id || id === "undefined" || id === "null") {
    notFound();
  }

  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    redirect("/login");
  }

  const user = await getCurrentUser();
  const email = user?.email as string;
  const userId = user?.id;
  if (!id || id === "undefined" || id === "null") {
    notFound();
  }

  if (!id || id === "undefined" || id === "null") {
    notFound();
  }

  const include: Record<string, any> = {
    sessions: {
      orderBy: { createdAt: "desc" },
      include: { events: true },
    },
    partyMembers: {
      include: { character: true },
    },
    npcs: true,
    quests: true,
    gmNotes: true,
    downtimeActivities: {
      include: { character: true },
    },
    invites: {
      orderBy: { createdAt: "desc" },
    },
  };

  // Only load campaigns owned by this user, with their relations
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include,
  });

  const allCharacters = await prisma.character.findMany({
    where: { ownerEmail: email, isArchived: false },
    orderBy: { createdAt: "asc" },
  });

  const currentCharacterIds = new Set(
    (campaign?.partyMembers ?? []).map((pm) => pm.characterId)
  );

  const availableCharacters = allCharacters.filter(
    (c) => !currentCharacterIds.has(c.id)
  );

  if (!campaign) {
    notFound();
  }

  const campaignWithRelations = campaign as unknown as CampaignWithRelations;

  const isGM = campaign.ownerEmail === email;
  const isOwner =
    (campaign.createdById && userId && campaign.createdById === userId) ||
    (!campaign.createdById && !!campaign) ||
    (campaign.ownerEmail === email);

  return (
    <CampaignPageClient
      campaign={campaignWithRelations}
      deleteCampaign={deleteCampaign}
      archiveCampaign={archiveCampaign}
      restoreCampaign={restoreCampaign}
      addCharacterToCampaign={addCharacterToCampaign}
      availableCharacters={availableCharacters}
      isGM={session.user.email === campaign.ownerEmail || campaign.createdById === userId}
      canDelete={isOwner}
      invites={(campaign as any).invites ?? []}
      inviteActions={{ createInvite, revokeInvite }}
      gmActions={{
        createNpc,
        updateNpc,
        deleteNpc,
        createQuest,
        updateQuest,
        deleteQuest,
        updateQuestStatus,
        createNote,
        updateNote,
        deleteNote,
        createDowntime,
        advanceDowntime,
        completeDowntime,
        cancelDowntime,
        summarizeLastSession,
        campaignOverview,
        nextSessionHooks,
      }}
    />
  );
}
