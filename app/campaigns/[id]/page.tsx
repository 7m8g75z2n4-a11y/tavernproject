import { prisma } from "@/lib/prisma";
import { PartyRoom3D } from "@/components/campaigns/PartyRoom3D";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

type Params = { id: string };

const numberFromForm = (value: FormDataEntryValue | null) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const normalizeInventory = (campaignInventory: any, characterInventory: any) => {
  if (campaignInventory) return campaignInventory;
  if (characterInventory) return characterInventory;
  return {
    currency: { gp: 0, sp: 0, cp: 0 },
    items: [],
  };
};

const initialsFromName = (name?: string) => {
  if (!name) return "PC";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
};

const eventCategory = (eventType: string) => {
  switch (eventType) {
    case "hp_change":
      return "HP";
    case "xp_gain":
    case "xp_loss":
      return "XP";
    case "loot_gain":
    case "loot_loss":
      return "Loot";
    case "quest_update":
      return "Quest";
    case "downtime_start":
    case "downtime_progress":
    case "downtime_complete":
      return "Downtime";
    case "note":
      return "Note";
    default:
      return "Log";
  }
};

const eventIcon = (eventType: string) => {
  switch (eventType) {
    case "hp_change":
      return "❤";
    case "xp_gain":
    case "xp_loss":
      return "✦";
    case "loot_gain":
    case "loot_loss":
      return "💰";
    case "quest_update":
      return "✶";
    case "downtime_start":
    case "downtime_progress":
    case "downtime_complete":
      return "⚒";
    case "note":
      return "✎";
    default:
      return "•";
  }
};

const formatEventTime = (date: Date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export async function startSession(formData: FormData) {
  "use server";
  const campaignId = formData.get("campaignId")?.toString();
  if (!campaignId) return;

  const active = await prisma.session.findFirst({
    where: { campaignId, isActive: true },
  });
  if (active) {
    redirect(`/campaigns/${campaignId}`);
  }

  const latest = await prisma.session.findFirst({
    where: { campaignId },
    orderBy: { sessionNumber: "desc" },
  });
  const nextNumber = (latest?.sessionNumber ?? 0) + 1;

  await prisma.session.create({
    data: {
      campaignId,
      sessionNumber: nextNumber,
      title: `Session ${nextNumber}`,
      isActive: true,
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
  redirect(`/campaigns/${campaignId}`);
}

export async function endSession(formData: FormData) {
  "use server";
  const sessionId = formData.get("sessionId")?.toString();
  const campaignId = formData.get("campaignId")?.toString();
  if (!sessionId || !campaignId) return;

  const events = await prisma.sessionEvent.findMany({
    where: { sessionId },
  });

  const summaryParts: string[] = [];
  const xp = events.filter((e) => e.eventType === "xp_gain").length;
  const hp = events.filter((e) => e.eventType === "hp_change").length;
  const notes = events.filter((e) => e.eventType === "note").length;
  if (xp) summaryParts.push(`${xp} XP changes`);
  if (hp) summaryParts.push(`${hp} HP changes`);
  if (notes) summaryParts.push(`${notes} notes`);

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      isActive: false,
      summary: summaryParts.length
        ? summaryParts.join(", ")
        : "Session ended.",
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
  redirect(`/campaigns/${campaignId}`);
}

export async function logHpChange(formData: FormData) {
  "use server";
  const sessionId = formData.get("sessionId")?.toString();
  const campaignId = formData.get("campaignId")?.toString();
  const characterId = formData.get("characterId")?.toString();
  const amount = numberFromForm(formData.get("amount"));
  if (!sessionId || !campaignId || !characterId) return;

  await prisma.sessionEvent.create({
    data: {
      id: randomUUID(),
      sessionId,
      campaignId,
      characterId,
      eventType: "hp_change",
      value: amount,
      payload: {},
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

export async function logXpGain(formData: FormData) {
  "use server";
  const sessionId = formData.get("sessionId")?.toString();
  const campaignId = formData.get("campaignId")?.toString();
  const characterId = formData.get("characterId")?.toString();
  const amount = numberFromForm(formData.get("amount"));
  if (!sessionId || !campaignId || !characterId) return;

  await prisma.sessionEvent.create({
    data: {
      id: randomUUID(),
      sessionId,
      campaignId,
      characterId,
      eventType: "xp_gain",
      value: amount,
      payload: {},
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

export async function logNote(formData: FormData) {
  "use server";
  const sessionId = formData.get("sessionId")?.toString();
  const campaignId = formData.get("campaignId")?.toString();
  const text = formData.get("text")?.toString();
  if (!sessionId || !campaignId || !text) return;

  await prisma.sessionEvent.create({
    data: {
      id: randomUUID(),
      sessionId,
      campaignId,
      eventType: "note",
      payload: { text },
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

export async function addCondition(formData: FormData) {
  "use server";
  const sessionId = formData.get("sessionId")?.toString();
  const campaignId = formData.get("campaignId")?.toString();
  const characterId = formData.get("characterId")?.toString();
  const condition = formData.get("condition")?.toString().trim();
  if (!sessionId || !campaignId || !characterId || !condition) return;

  await prisma.sessionEvent.create({
    data: {
      id: randomUUID(),
      sessionId,
      campaignId,
      characterId,
      eventType: "condition_add",
      payload: { condition },
    },
  });

  const membership = await prisma.campaignPlayer.findUnique({
    where: { campaignId_characterId: { campaignId, characterId } },
  });
  const next = Array.isArray(membership?.conditions)
    ? membership!.conditions
    : [];
  if (!next.includes(condition)) next.push(condition);

  await prisma.campaignPlayer.upsert({
    where: { campaignId_characterId: { campaignId, characterId } },
    update: { conditions: next },
    create: {
      campaignId,
      characterId,
      conditions: next,
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

export async function removeCondition(formData: FormData) {
  "use server";
  const sessionId = formData.get("sessionId")?.toString();
  const campaignId = formData.get("campaignId")?.toString();
  const characterId = formData.get("characterId")?.toString();
  const condition = formData.get("condition")?.toString().trim();
  if (!sessionId || !campaignId || !characterId || !condition) return;

  await prisma.sessionEvent.create({
    data: {
      id: randomUUID(),
      sessionId,
      campaignId,
      characterId,
      eventType: "condition_remove",
      payload: { condition },
    },
  });

  const membership = await prisma.campaignPlayer.findUnique({
    where: { campaignId_characterId: { campaignId, characterId } },
  });
  const next = Array.isArray(membership?.conditions)
    ? membership!.conditions.filter((c: string) => c !== condition)
    : [];

  await prisma.campaignPlayer.upsert({
    where: { campaignId_characterId: { campaignId, characterId } },
    update: { conditions: next },
    create: {
      campaignId,
      characterId,
      conditions: next,
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

export async function giveLoot(formData: FormData) {
  "use server";
  const sessionId = formData.get("sessionId")?.toString();
  const campaignId = formData.get("campaignId")?.toString();
  const characterId = formData.get("characterId")?.toString();
  const itemName = formData.get("itemName")?.toString().trim();
  const quantity = numberFromForm(formData.get("quantity") ?? 1) || 1;
  const gp = numberFromForm(formData.get("gp"));
  const sp = numberFromForm(formData.get("sp"));
  const cp = numberFromForm(formData.get("cp"));
  if (!sessionId || !campaignId || !characterId || !itemName) return;

  await prisma.sessionEvent.create({
    data: {
      id: randomUUID(),
      sessionId,
      campaignId,
      characterId,
      eventType: "loot_gain",
      payload: {
        itemName,
        quantity,
        currencyChange: { gp, sp, cp },
      },
    },
  });

  const membership = await prisma.campaignPlayer.findUnique({
    where: { campaignId_characterId: { campaignId, characterId } },
    include: { character: true },
  });

  const baseInventory = normalizeInventory(
    membership?.inventory,
    membership?.character?.coreJson?.inventory,
  );

  const items = Array.isArray(baseInventory.items)
    ? [...baseInventory.items]
    : [];
  const currency = baseInventory.currency ?? { gp: 0, sp: 0, cp: 0 };
  const existing = items.find(
    (i: any) => i.name?.toLowerCase() === itemName.toLowerCase(),
  );
  if (existing) {
    existing.quantity = (existing.quantity ?? 0) + quantity;
  } else {
    items.push({
      id: randomUUID(),
      name: itemName,
      quantity,
    });
  }
  currency.gp = (currency.gp ?? 0) + gp;
  currency.sp = (currency.sp ?? 0) + sp;
  currency.cp = (currency.cp ?? 0) + cp;

  await prisma.campaignPlayer.upsert({
    where: { campaignId_characterId: { campaignId, characterId } },
    update: { inventory: { currency, items } },
    create: {
      campaignId,
      characterId,
      inventory: { currency, items },
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

export async function removeLoot(formData: FormData) {
  "use server";
  const sessionId = formData.get("sessionId")?.toString();
  const campaignId = formData.get("campaignId")?.toString();
  const characterId = formData.get("characterId")?.toString();
  const itemName = formData.get("itemName")?.toString().trim();
  const quantity = numberFromForm(formData.get("quantity") ?? 1) || 1;
  const gp = numberFromForm(formData.get("gp"));
  const sp = numberFromForm(formData.get("sp"));
  const cp = numberFromForm(formData.get("cp"));
  if (!sessionId || !campaignId || !characterId || !itemName) return;

  await prisma.sessionEvent.create({
    data: {
      id: randomUUID(),
      sessionId,
      campaignId,
      characterId,
      eventType: "loot_loss",
      payload: {
        itemName,
        quantity,
        currencyChange: { gp, sp, cp },
      },
    },
  });

  const membership = await prisma.campaignPlayer.findUnique({
    where: { campaignId_characterId: { campaignId, characterId } },
    include: { character: true },
  });
  const baseInventory = normalizeInventory(
    membership?.inventory,
    membership?.character?.coreJson?.inventory,
  );
  const items = Array.isArray(baseInventory.items)
    ? [...baseInventory.items]
    : [];
  const currency = baseInventory.currency ?? { gp: 0, sp: 0, cp: 0 };

  const existing = items.find(
    (i: any) => i.name?.toLowerCase() === itemName.toLowerCase(),
  );
  if (existing) {
    existing.quantity = Math.max(0, (existing.quantity ?? 0) - quantity);
  }
  currency.gp = (currency.gp ?? 0) - gp;
  currency.sp = (currency.sp ?? 0) - sp;
  currency.cp = (currency.cp ?? 0) - cp;

  const filteredItems = items.filter((i: any) => (i.quantity ?? 0) > 0);

  await prisma.campaignPlayer.upsert({
    where: { campaignId_characterId: { campaignId, characterId } },
    update: { inventory: { currency, items: filteredItems } },
    create: {
      campaignId,
      characterId,
      inventory: { currency, items: filteredItems },
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

export async function createNpc(formData: FormData) {
  "use server";
  const campaignId = formData.get("campaignId")?.toString();
  const name = formData.get("name")?.toString().trim();
  const role = formData.get("role")?.toString().trim() || null;
  const attitude = formData.get("attitude")?.toString().trim() || null;
  const description = formData.get("description")?.toString().trim() || null;
  if (!campaignId || !name) return;

  await prisma.nPC.create({
    data: { campaignId, name, role, attitude, description },
  });
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function updateNpc(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  const campaignId = formData.get("campaignId")?.toString();
  const name = formData.get("name")?.toString().trim();
  const role = formData.get("role")?.toString().trim() || null;
  const attitude = formData.get("attitude")?.toString().trim() || null;
  const description = formData.get("description")?.toString().trim() || null;
  if (!id || !campaignId || !name) return;

  await prisma.nPC.update({
    where: { id },
    data: { name, role, attitude, description },
  });
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function deleteNpc(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  const campaignId = formData.get("campaignId")?.toString();
  if (!id || !campaignId) return;

  await prisma.nPC.delete({ where: { id } });
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function createQuest(formData: FormData) {
  "use server";
  const campaignId = formData.get("campaignId")?.toString();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const status = formData.get("status")?.toString().trim() || "Active";
  const priority = formData.get("priority")?.toString().trim() || null;
  const giverNpcId = formData.get("giverNpcId")?.toString() || null;
  if (!campaignId || !title) return;

  await prisma.quest.create({
    data: { campaignId, title, description, status, priority, giverNpcId },
  });
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function updateQuest(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  const campaignId = formData.get("campaignId")?.toString();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const status = formData.get("status")?.toString().trim() || "Active";
  const priority = formData.get("priority")?.toString().trim() || null;
  const giverNpcId = formData.get("giverNpcId")?.toString() || null;
  if (!id || !campaignId || !title) return;

  await prisma.quest.update({
    where: { id },
    data: { title, description, status, priority, giverNpcId },
  });
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function deleteQuest(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  const campaignId = formData.get("campaignId")?.toString();
  if (!id || !campaignId) return;

  await prisma.quest.delete({ where: { id } });
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function createNote(formData: FormData) {
  "use server";
  const campaignId = formData.get("campaignId")?.toString();
  const title = formData.get("title")?.toString().trim();
  const content = formData.get("content")?.toString().trim();
  const sessionId = formData.get("sessionId")?.toString() || null;
  const npcId = formData.get("npcId")?.toString() || null;
  const questId = formData.get("questId")?.toString() || null;
  if (!campaignId || !title || !content) return;

  await prisma.gMNote.create({
    data: { campaignId, title, content, sessionId, npcId, questId },
  });
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function updateNote(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  const campaignId = formData.get("campaignId")?.toString();
  const title = formData.get("title")?.toString().trim();
  const content = formData.get("content")?.toString().trim();
  const sessionId = formData.get("sessionId")?.toString() || null;
  const npcId = formData.get("npcId")?.toString() || null;
  const questId = formData.get("questId")?.toString() || null;
  if (!id || !campaignId || !title || !content) return;

  await prisma.gMNote.update({
    where: { id },
    data: { title, content, sessionId, npcId, questId },
  });
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function deleteNote(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  const campaignId = formData.get("campaignId")?.toString();
  if (!id || !campaignId) return;

  await prisma.gMNote.delete({ where: { id } });
  revalidatePath(`/campaigns/${campaignId}`);
}

// Downtime
export async function createDowntime(formData: FormData) {
  "use server";
  const campaignId = formData.get("campaignId")?.toString();
  const characterId = formData.get("characterId")?.toString();
  const type = formData.get("type")?.toString().trim() || "custom";
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const targetProgress = numberFromForm(formData.get("targetProgress")) || 1;
  const linkedQuestId = formData.get("linkedQuestId")?.toString() || null;
  const sessionId = formData.get("sessionId")?.toString() || null;
  if (!campaignId || !characterId || !title) return;

  const activity = await prisma.downtimeActivity.create({
    data: {
      campaignId,
      characterId,
      type,
      title,
      description,
      status: "planned",
      targetProgress,
      progress: 0,
      linkedQuestId,
    },
  });

  if (sessionId) {
    await prisma.sessionEvent.create({
      data: {
        id: randomUUID(),
        sessionId,
        campaignId,
        characterId,
        eventType: "downtime_start",
        payload: { activityId: activity.id, title: activity.title, type: activity.type },
      },
    });
  }

  revalidatePath(`/campaigns/${campaignId}`);
}

export async function advanceDowntime(formData: FormData) {
  "use server";
  const activityId = formData.get("activityId")?.toString();
  const delta = numberFromForm(formData.get("delta") ?? 1) || 1;
  const sessionId = formData.get("sessionId")?.toString() || null;
  if (!activityId) return;

  const activity = await prisma.downtimeActivity.findUnique({ where: { id: activityId } });
  if (!activity) return;

  const nextProgress = (activity.progress ?? 0) + delta;
  const nextStatus = activity.status === "planned" ? "in_progress" : activity.status;

  await prisma.downtimeActivity.update({
    where: { id: activityId },
    data: { progress: nextProgress, status: nextStatus },
  });

  if (sessionId) {
    await prisma.sessionEvent.create({
      data: {
        id: randomUUID(),
        sessionId,
        campaignId: activity.campaignId,
        characterId: activity.characterId,
        eventType: "downtime_progress",
        payload: {
          activityId,
          title: activity.title,
          type: activity.type,
          delta,
        },
      },
    });
  }

  revalidatePath(`/campaigns/${activity.campaignId}`);
}

export async function completeDowntime(formData: FormData) {
  "use server";
  const activityId = formData.get("activityId")?.toString();
  const sessionId = formData.get("sessionId")?.toString() || null;
  const resultSummary = formData.get("resultSummary")?.toString().trim() || null;
  if (!activityId) return;

  const activity = await prisma.downtimeActivity.findUnique({ where: { id: activityId } });
  if (!activity) return;

  await prisma.downtimeActivity.update({
    where: { id: activityId },
    data: { status: "completed", resultSummary },
  });

  if (sessionId) {
    await prisma.sessionEvent.create({
      data: {
        id: randomUUID(),
        sessionId,
        campaignId: activity.campaignId,
        characterId: activity.characterId,
        eventType: "downtime_complete",
        payload: {
          activityId,
          title: activity.title,
          type: activity.type,
          resultSummary,
        },
      },
    });
  }

  revalidatePath(`/campaigns/${activity.campaignId}`);
}

export async function cancelDowntime(formData: FormData) {
  "use server";
  const activityId = formData.get("activityId")?.toString();
  if (!activityId) return;
  const activity = await prisma.downtimeActivity.findUnique({ where: { id: activityId } });
  if (!activity) return;
  await prisma.downtimeActivity.update({
    where: { id: activityId },
    data: { status: "cancelled" },
  });
  revalidatePath(`/campaigns/${activity.campaignId}`);
}

const humanizeEvent = (
  event: {
    eventType: string;
    value: number | null;
    payload: any;
    character?: { name: string };
  },
) => {
  const who = event.character?.name;
  switch (event.eventType) {
    case "hp_change":
      return `${who ?? "Unknown"} HP change ${event.value ?? 0}`;
    case "xp_gain":
      return `${who ?? "Unknown"} gained ${event.value ?? 0} XP`;
    case "condition_add":
      return `${who ?? "Unknown"} gained condition: ${event.payload?.condition}`;
    case "condition_remove":
      return `${who ?? "Unknown"} removed condition: ${event.payload?.condition}`;
    case "loot_gain": {
      const currency = event.payload?.currencyChange;
      const parts = [] as string[];
      if (currency?.gp) parts.push(`+${currency.gp} gp`);
      if (currency?.sp) parts.push(`+${currency.sp} sp`);
      if (currency?.cp) parts.push(`+${currency.cp} cp`);
      return `${who ?? "Unknown"} gained ${event.payload?.itemName} x${
        event.payload?.quantity ?? 1
      }${parts.length ? ` (${parts.join(", ")})` : ""}`;
    }
    case "loot_loss": {
      const currency = event.payload?.currencyChange;
      const parts = [] as string[];
      if (currency?.gp) parts.push(`-${currency.gp} gp`);
      if (currency?.sp) parts.push(`-${currency.sp} sp`);
      if (currency?.cp) parts.push(`-${currency.cp} cp`);
      return `${who ?? "Unknown"} lost ${event.payload?.itemName} x${
        event.payload?.quantity ?? 1
      }${parts.length ? ` (${parts.join(", ")})` : ""}`;
    }
    case "note":
      return `GM Note: ${event.payload?.text ?? ""}`;
    case "quest_update":
      return `Quest update: ${event.payload?.status ?? ""}`;
    case "downtime_start":
      return `Downtime started: ${event.payload?.title ?? ""} (${event.payload?.type ?? ""})`;
    case "downtime_progress":
      return `Downtime progress: ${event.payload?.title ?? ""} (+${event.payload?.delta ?? 0})`;
    case "downtime_complete":
      return `Downtime complete: ${event.payload?.title ?? ""}${
        event.payload?.resultSummary ? ` — ${event.payload.resultSummary}` : ""
      }`;
    default:
      return event.eventType;
  }
};

export default async function CampaignDetailPage({ params }: { params: Params }) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      gm: true,
      players: {
        include: {
          character: true,
        },
      },
      sessions: {
        orderBy: { sessionNumber: "desc" },
      },
    },
  });

  if (!campaign) {
    notFound();
  }

  const activeSession =
    campaign.sessions.find((s) => s.isActive) ?? null;

  const sessionEvents = activeSession
    ? await prisma.sessionEvent.findMany({
        where: { sessionId: activeSession.id },
        include: { character: true },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const npcs = await prisma.nPC.findMany({
    where: { campaignId: params.id },
    orderBy: { name: "asc" },
  });

  const quests = await prisma.quest.findMany({
    where: { campaignId: params.id },
    include: { giverNpc: true },
    orderBy: { createdAt: "desc" },
  });

  const notes = await prisma.gMNote.findMany({
    where: { campaignId: params.id },
    orderBy: { createdAt: "desc" },
  });

  const downtimeActivities = await prisma.downtimeActivity.findMany({
    where: { campaignId: params.id },
    include: { character: true },
    orderBy: { createdAt: "desc" },
  });

  const partyMembers = campaign.players.map((p) => {
    const cj = (p.character as any)?.coreJson ?? {};
    const identity = cj.identity ?? {};
    return {
      id: p.character.id,
      name: p.character.name,
      system: p.character.system,
      level: identity.level as number | undefined,
      conditions: p.conditions ?? [],
      inventory: normalizeInventory(p.inventory, cj.inventory),
    };
  });

  const lastSession =
    campaign.sessions.filter((s) => !s.isActive).at(0) ?? null;

  const downtimeOngoing = downtimeActivities.filter((d) =>
    ["planned", "in_progress"].includes(d.status),
  );
  const downtimeCompleted = downtimeActivities.filter(
    (d) => d.status === "completed",
  );

  const systemLabel =
    campaign.players.find((p) => p.character.system)?.character.system ?? "System TBD";
  const shareLink = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/campaigns/${campaign.id}`;

  return (
    <div className="relative min-h-screen bg-slate-950 text-amber-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1f2937_0%,_#0f172a_50%,_#020617_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.04] mix-blend-soft-light bg-[url('/noise.png')] bg-repeat" />
      <main className="relative z-10 min-h-screen p-6 md:p-8 lg:p-10 space-y-4">
        <div className="space-y-0.5">
          <div className="text-[11px] uppercase tracking-[0.3em] text-amber-300">Tavern</div>
          <div className="text-[11px] text-slate-500">Character & Campaign Ledger</div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-4">
        {/* Left: Party sidebar */}
        <aside className="border border-amber-800/50 rounded-lg p-3 bg-amber-900/10 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Party</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-amber-800/60 bg-amber-900/30 text-amber-200 flex items-center gap-1">
              <span>🎲</span>
              <span>{partyMembers.length}</span>
            </span>
          </div>
          {partyMembers.length === 0 ? (
            <p className="text-xs opacity-70">No party members yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {partyMembers.map((m) => (
                <li
                  key={m.id}
                  className="border border-amber-800/40 border-t border-amber-900/40 rounded-md p-2 bg-amber-900/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-800/80 border border-amber-700/40 flex items-center justify-center text-[11px] font-semibold text-slate-100">
                      {m.level ? `L${m.level}` : initialsFromName(m.name)}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="font-medium leading-tight text-amber-50">{m.name}</div>
                      <div className="text-[11px] text-slate-400">{m.system}</div>
                    </div>
                  </div>
                  {Array.isArray(m.conditions) && m.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {m.conditions.map((c: string) => (
                        <span
                          key={c}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-amber-800/60"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="border border-amber-800/50 rounded-md p-3 bg-amber-900/20 space-y-2">
            <div className="text-sm font-semibold">Share Link</div>
            <div className="text-[12px] text-slate-300">Invite players to the tavern room.</div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareLink}
                className="flex-1 rounded-md border border-amber-800/60 bg-black/30 px-2 py-1 text-[12px] text-amber-100"
              />
              <CopyLinkButton
                value={shareLink}
                className="px-3 py-1 rounded-md border border-amber-500/50 bg-amber-500/90 text-black text-[12px] font-semibold hover:shadow-[0_0_20px_rgba(245,199,106,0.3)] transition-shadow"
              />
            </div>
          </div>
        </aside>

        {/* Center column */}
        <section className="space-y-4">
          <header className="relative overflow-hidden border border-amber-800/60 rounded-xl p-5 bg-amber-900/10 shadow-lg shadow-amber-900/30">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-amber-700/40 via-amber-400/40 to-amber-700/40 opacity-70" />
            <div className="flex flex-col gap-2">
              <div className="text-[12px] uppercase tracking-[0.25em] text-amber-200/70">
                Current Room
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <h1 className="text-3xl font-semibold text-amber-50">{campaign.name}</h1>
                  <p className="text-sm text-slate-300">
                    {systemLabel} ·{" "}
                    {activeSession
                      ? `Active Session ${activeSession.sessionNumber}`
                      : lastSession
                        ? `Last Session ${lastSession.sessionNumber}`
                        : "No sessions yet"}
                  </p>
                  {campaign.description && (
                    <p className="text-sm text-slate-400">{campaign.description}</p>
                  )}
                  <p className="text-[11px] text-slate-500">
                    GM: {campaign.gm?.displayName ?? "Demo GM"}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <section className="border border-amber-800/50 rounded-lg p-3 bg-amber-900/5">
            <h2 className="text-sm font-semibold mb-2">Party Room</h2>
            <PartyRoom3D members={partyMembers} />
          </section>

          <section className="border border-amber-800/50 rounded-lg p-4 bg-[#f1e5c8] text-[#2b1b14] space-y-3 shadow-[0_15px_60px_rgba(0,0,0,0.35)]">
            {activeSession ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">
                      Session {activeSession.sessionNumber} — Active
                    </div>
                    {activeSession.title && (
                      <div className="text-xs opacity-70">
                        {activeSession.title}
                      </div>
                    )}
                  </div>
                  <form action={endSession}>
                    <input
                      type="hidden"
                      name="sessionId"
                      value={activeSession.id}
                    />
                    <input
                      type="hidden"
                      name="campaignId"
                      value={campaign.id}
                    />
                    <button className="px-3 py-1.5 text-xs rounded-md bg-red-700 hover:bg-red-600">
                      End Session
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold">Event Feed</h3>
                    <div className="relative border border-amber-800/40 rounded-md p-3 space-y-2 text-xs max-h-80 overflow-auto bg-amber-50">
                      <div className="absolute left-4 top-3 bottom-3 w-px bg-amber-900/40 rounded-full" />
                      {sessionEvents.length === 0 ? (
                        <p className="text-[#5b3c30]">No events yet.</p>
                      ) : (
                        sessionEvents.map((e) => (
                          <div
                            key={e.id}
                            className="relative pl-6 pr-2 py-2 rounded-md hover:bg-amber-100 border border-transparent"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-600">
                                {formatEventTime(e.createdAt)}
                              </div>
                              <span className="text-[10px] uppercase rounded-full border border-slate-300 px-2 py-0.5 text-slate-700">
                                {eventCategory(e.eventType)}
                              </span>
                            </div>
                            <div className="text-xs text-[#2b1b14] flex items-center gap-1">
                              <span className="text-[11px] text-slate-500">{eventIcon(e.eventType)}</span>
                              <span>{humanizeEvent(e)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="border border-amber-800/40 rounded-md p-2 space-y-2 bg-amber-50">
                      <div className="font-semibold">Change HP</div>
                      <form action={logHpChange} className="space-y-1">
                        <input
                          type="hidden"
                          name="sessionId"
                          value={activeSession.id}
                        />
                        <input
                          type="hidden"
                          name="campaignId"
                          value={campaign.id}
                        />
                        <select
                          name="characterId"
                          className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                        >
                          {campaign.players.map((p) => (
                            <option key={p.characterId} value={p.characterId}>
                              {p.character.name}
                            </option>
                          ))}
                        </select>
                        <input
                          name="amount"
                          type="number"
                          placeholder="-5 damage, +5 heal"
                          className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                        />
                        <button className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold">
                          Log HP
                        </button>
                      </form>
                    </div>

                    <div className="border border-amber-800/40 rounded-md p-2 space-y-2 bg-amber-50">
                      <div className="font-semibold">Give XP</div>
                      <form action={logXpGain} className="space-y-1">
                        <input
                          type="hidden"
                          name="sessionId"
                          value={activeSession.id}
                        />
                        <input
                          type="hidden"
                          name="campaignId"
                          value={campaign.id}
                        />
                        <select
                          name="characterId"
                          className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                        >
                          {campaign.players.map((p) => (
                            <option key={p.characterId} value={p.characterId}>
                              {p.character.name}
                            </option>
                          ))}
                        </select>
                        <input
                          name="amount"
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          defaultValue={10}
                          className="w-full accent-amber-500"
                        />
                        <div className="text-[11px] text-slate-600">Adjust XP before logging.</div>
                        <button className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold">
                          Log XP
                        </button>
                      </form>
                    </div>

                    <div className="border border-amber-800/40 rounded-md p-2 space-y-2 bg-amber-50">
                      <div className="font-semibold">Conditions</div>
                      <form action={addCondition} className="space-y-1">
                        <input
                          type="hidden"
                          name="sessionId"
                          value={activeSession.id}
                        />
                        <input
                          type="hidden"
                          name="campaignId"
                          value={campaign.id}
                        />
                        <select
                          name="characterId"
                          className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                        >
                          {campaign.players.map((p) => (
                            <option key={p.characterId} value={p.characterId}>
                              {p.character.name}
                            </option>
                          ))}
                        </select>
                        <input
                          name="condition"
                          placeholder="Condition (Poisoned)"
                          className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                        />
                        <button className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold">
                          Add Condition
                        </button>
                      </form>
                      <form action={removeCondition} className="space-y-1">
                        <input
                          type="hidden"
                          name="sessionId"
                          value={activeSession.id}
                        />
                        <input
                          type="hidden"
                          name="campaignId"
                          value={campaign.id}
                        />
                        <select
                          name="characterId"
                          className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                        >
                          {campaign.players.map((p) => (
                            <option key={p.characterId} value={p.characterId}>
                              {p.character.name}
                            </option>
                          ))}
                        </select>
                        <input
                          name="condition"
                          placeholder="Condition to remove"
                          className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                        />
                        <button className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold">
                          Remove Condition
                        </button>
                      </form>
                    </div>

                    <div className="border border-amber-800/40 rounded-md p-2 space-y-2 bg-amber-50">
                      <div className="font-semibold">Loot</div>
                      <form action={giveLoot} className="space-y-1">
                        <input
                          type="hidden"
                          name="sessionId"
                          value={activeSession.id}
                        />
                        <input
                          type="hidden"
                          name="campaignId"
                          value={campaign.id}
                        />
                        <select
                          name="characterId"
                          className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                        >
                          {campaign.players.map((p) => (
                            <option key={p.characterId} value={p.characterId}>
                              {p.character.name}
                            </option>
                          ))}
                        </select>
                        <input
                          name="itemName"
                          placeholder="Item name"
                          className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                        />
                        <input
                          name="quantity"
                          type="number"
                          defaultValue={1}
                          className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                        />
                        <div className="flex gap-2">
                          <input
                            name="gp"
                            type="number"
                            placeholder="gp"
                            className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                          />
                          <input
                            name="sp"
                            type="number"
                            placeholder="sp"
                            className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                          />
                          <input
                            name="cp"
                            type="number"
                            placeholder="cp"
                            className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                          />
                        </div>
                        <button className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold">
                          Give Loot
                        </button>
                      </form>
                      <form action={removeLoot} className="space-y-1">
                        <input
                          type="hidden"
                          name="sessionId"
                          value={activeSession.id}
                        />
                        <input
                          type="hidden"
                          name="campaignId"
                          value={campaign.id}
                        />
                        <select
                          name="characterId"
                          className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                        >
                          {campaign.players.map((p) => (
                            <option key={p.characterId} value={p.characterId}>
                              {p.character.name}
                            </option>
                          ))}
                        </select>
                        <input
                          name="itemName"
                          placeholder="Item to remove"
                          className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                        />
                        <input
                          name="quantity"
                          type="number"
                          defaultValue={1}
                          className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                        />
                        <div className="flex gap-2">
                          <input
                            name="gp"
                            type="number"
                            placeholder="gp"
                            className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                          />
                          <input
                            name="sp"
                            type="number"
                            placeholder="sp"
                            className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                          />
                          <input
                            name="cp"
                            type="number"
                            placeholder="cp"
                            className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                          />
                        </div>
                        <button className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold">
                          Remove Loot
                        </button>
                      </form>
                    </div>

                    <div className="border border-amber-800/40 rounded-md p-2 space-y-2 bg-amber-50">
                      <div className="font-semibold">GM Note</div>
                      <form action={logNote} className="space-y-1">
                        <input
                          type="hidden"
                          name="sessionId"
                          value={activeSession.id}
                        />
                        <input
                          type="hidden"
                          name="campaignId"
                          value={campaign.id}
                        />
                        <textarea
                          name="text"
                          rows={2}
                          className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                        />
                        <button className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold">
                          Add Note
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">No active session</div>
                    {lastSession && (
                      <div className="text-xs opacity-70">
                        Last session: #{lastSession.sessionNumber} {lastSession.title ?? ""}
                      </div>
                    )}
                  </div>
                  <form action={startSession}>
                    <input type="hidden" name="campaignId" value={campaign.id} />
                    <button className="px-3 py-1.5 text-xs rounded-md bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold">
                      Start Session
                    </button>
                  </form>
                </div>
                <div className="space-y-2 text-xs">
                  <h3 className="text-xs font-semibold">Session History</h3>
                  {campaign.sessions.filter((s) => !s.isActive).length === 0 ? (
                    <p className="opacity-60">No past sessions yet.</p>
                  ) : (
                    <ul className="space-y-1">
                      {campaign.sessions
                        .filter((s) => !s.isActive)
                        .map((s) => (
                          <li
                            key={s.id}
                            className="border border-amber-800/40 rounded px-2 py-1"
                          >
                            Session {s.sessionNumber} — {s.title ?? "Untitled"} {s.summary && (
                              <span className="opacity-70">({s.summary})</span>
                            )}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </section>
        </section>
        {/* Right: GM tools */}
        <aside className="border border-amber-800/50 rounded-lg p-3 bg-amber-900/10 backdrop-blur-sm space-y-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 px-1 pt-1">
            GM Tools
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 px-1 pb-1">
            <a href="#npcs" className="px-2 py-1 rounded-full border border-amber-900/40 bg-amber-900/20 hover:border-amber-700/40">
              🎭 NPCs
            </a>
            <a href="#quests" className="px-2 py-1 rounded-full border border-amber-900/40 bg-amber-900/20 hover:border-amber-700/40">
              ✶ Quests
            </a>
            <a href="#notes" className="px-2 py-1 rounded-full border border-amber-900/40 bg-amber-900/20 hover:border-amber-700/40">
              ✎ Notes
            </a>
            <a href="#downtime" className="px-2 py-1 rounded-full border border-amber-900/40 bg-amber-900/20 hover:border-amber-700/40">
              ⚒ Downtime
            </a>
          </div>
          <section id="npcs">
            <h3 className="text-sm font-semibold mb-2">NPCs (🎭)</h3>
            <div className="space-y-2 text-xs">
              {npcs.length === 0 ? (
                <p className="opacity-70">No NPCs yet.</p>
              ) : (
                npcs.map((n) => (
                  <details
                    key={n.id}
                    className="border border-amber-800/40 border-t border-amber-900/50 rounded-md p-2 bg-amber-900/20"
                  >
                    <summary className="cursor-pointer font-semibold">
                      {n.name} {n.role && <span className="opacity-60">({n.role})</span>}
                    </summary>
                    {n.attitude && (
                      <div className="opacity-70">Attitude: {n.attitude}</div>
                    )}
                    {n.description && (
                      <div className="mt-1 opacity-80">{n.description}</div>
                    )}
                    <form action={updateNpc} className="mt-2 space-y-1">
                      <input type="hidden" name="id" value={n.id} />
                      <input
                        type="hidden"
                        name="campaignId"
                        value={campaign.id}
                      />
                      <input
                        name="name"
                        defaultValue={n.name}
                        className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                      />
                      <input
                        name="role"
                        defaultValue={n.role ?? ""}
                        className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                        placeholder="Role"
                      />
                      <input
                        name="attitude"
                        defaultValue={n.attitude ?? ""}
                        className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                        placeholder="Attitude"
                      />
                      <textarea
                        name="description"
                        defaultValue={n.description ?? ""}
                        rows={2}
                        className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                    <form action={deleteNpc} className="mt-1">
                      <input type="hidden" name="id" value={n.id} />
                      <input type="hidden" name="campaignId" value={campaign.id} />
                      <button className="px-3 py-1 rounded bg-red-700 hover:bg-red-600 font-semibold">
                        Delete
                      </button>
                    </form>
                  </details>
                ))
              )}
              <div className="border border-amber-800/40 border-t border-amber-900/50 rounded-md p-2 space-y-1 bg-amber-900/20">
                <div className="font-semibold">Add NPC</div>
                <form action={createNpc} className="space-y-1">
                  <input
                    type="hidden"
                    name="campaignId"
                    value={campaign.id}
                  />
                  <input
                    name="name"
                    required
                    placeholder="Name"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  />
                  <input
                    name="role"
                    placeholder="Role"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  />
                  <input
                    name="attitude"
                    placeholder="Attitude"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  />
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Description"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  />
                  <button className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold">
                    Create NPC
                  </button>
                </form>
              </div>
            </div>
          </section>
          <section id="quests">
            <h3 className="text-sm font-semibold mb-2">Quests (✶)</h3>
            <div className="space-y-2 text-xs">
              {quests.length === 0 ? (
                <p className="opacity-70">No quests yet.</p>
              ) : (
                quests.map((q) => (
                  <details
                    key={q.id}
                    className="border border-amber-800/40 border-t border-amber-900/50 rounded-md p-2 bg-amber-900/20"
                  >
                    <summary className="cursor-pointer font-semibold">
                      {q.title} <span className="opacity-60">({q.status ?? "Active"})</span>
                    </summary>
                    {q.description && (
                      <div className="opacity-80 mt-1">{q.description}</div>
                    )}
                    {q.giverNpc && (
                      <div className="opacity-70 text-[11px]">
                        From: {q.giverNpc.name}
                      </div>
                    )}
                    <form action={updateQuest} className="mt-2 space-y-1">
                      <input type="hidden" name="id" value={q.id} />
                      <input
                        type="hidden"
                        name="campaignId"
                        value={campaign.id}
                      />
                      <input
                        name="title"
                        defaultValue={q.title}
                        className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                      />
                      <textarea
                        name="description"
                        defaultValue={q.description ?? ""}
                        rows={2}
                        className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                      />
                      <select
                        name="status"
                        defaultValue={q.status ?? "Active"}
                        className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                      >
                        <option>Active</option>
                        <option>Completed</option>
                        <option>Failed</option>
                      </select>
                      <input
                        name="priority"
                        defaultValue={q.priority ?? ""}
                        placeholder="Priority"
                        className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                      />
                      <select
                        name="giverNpcId"
                        defaultValue={q.giverNpcId ?? ""}
                        className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                      >
                        <option value="">No NPC</option>
                        {npcs.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                    <form action={deleteQuest} className="mt-1">
                      <input type="hidden" name="id" value={q.id} />
                      <input type="hidden" name="campaignId" value={campaign.id} />
                      <button className="px-3 py-1 rounded bg-red-700 hover:bg-red-600 font-semibold">
                        Delete
                      </button>
                    </form>
                  </details>
                ))
              )}

              <div className="border border-amber-800/40 border-t border-amber-900/50 rounded-md p-2 space-y-1 bg-amber-900/20">
                <div className="font-semibold">Add Quest</div>
                <form action={createQuest} className="space-y-1">
                  <input
                    type="hidden"
                    name="campaignId"
                    value={campaign.id}
                  />
                  <input
                    name="title"
                    required
                    placeholder="Title"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  />
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Description"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  />
                  <select
                    name="status"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                    defaultValue="Active"
                  >
                    <option>Active</option>
                    <option>Completed</option>
                    <option>Failed</option>
                  </select>
                  <input
                    name="priority"
                    placeholder="Priority"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  />
                  <select
                    name="giverNpcId"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  >
                    <option value="">No NPC</option>
                    {npcs.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                  <button className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold">
                    Create Quest
                  </button>
                </form>
              </div>
            </div>
          </section>
          <section id="downtime">
            <h3 className="text-sm font-semibold mb-2">Downtime (⚒)</h3>
            <div className="space-y-3 text-xs">
              <div className="border border-amber-800/40 border-t border-amber-900/50 rounded-md p-2 bg-amber-900/20">
                <div className="font-semibold mb-1">Ongoing</div>
                {downtimeOngoing.length === 0 ? (
                  <p className="opacity-70">No ongoing activities.</p>
                ) : (
                  downtimeOngoing.map((d) => (
                    <div key={d.id} className="border border-amber-800/40 border-t border-amber-900/50 rounded p-2 mb-2 bg-amber-950/30">
                      <div className="text-sm font-semibold">{d.title}</div>
                      <div className="text-[11px] opacity-70">
                        {d.type} · {d.status} · {d.progress}/{d.targetProgress}
                      </div>
                      <div className="text-[11px] opacity-70">
                        {d.character?.name ?? "Unknown"}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <form action={advanceDowntime} className="flex items-center gap-1">
                          <input type="hidden" name="activityId" value={d.id} />
                          <input type="hidden" name="sessionId" value={activeSession?.id ?? ""} />
                          <input
                            name="delta"
                            type="number"
                            defaultValue={1}
                            className="w-16 bg-black border border-amber-700/60 rounded px-2 py-1"
                          />
                          <button className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold">
                            Advance
                          </button>
                        </form>
                        <form action={completeDowntime} className="flex items-center gap-1">
                          <input type="hidden" name="activityId" value={d.id} />
                          <input type="hidden" name="sessionId" value={activeSession?.id ?? ""} />
                          <input
                            name="resultSummary"
                            placeholder="Result (optional)"
                            className="bg-black border border-amber-700/60 rounded px-2 py-1"
                          />
                          <button className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold">
                            Complete
                          </button>
                        </form>
                        <form action={cancelDowntime}>
                          <input type="hidden" name="activityId" value={d.id} />
                          <button className="px-2 py-1 rounded bg-amber-800 hover:bg-amber-700 font-semibold">
                            Cancel
                          </button>
                        </form>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border border-amber-800/40 border-t border-amber-900/50 rounded-md p-2 space-y-1 bg-amber-900/20">
                <div className="font-semibold">Completed</div>
                {downtimeCompleted.length === 0 ? (
                  <p className="opacity-70">None yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {downtimeCompleted.map((d) => (
                      <li key={d.id} className="border border-amber-800/40 border-t border-amber-900/50 rounded px-2 py-1 bg-amber-950/30">
                        <div className="font-semibold">{d.title}</div>
                        <div className="text-[11px] opacity-70">
                          {d.character?.name ?? "Unknown"} · {d.type} · {d.progress}/{d.targetProgress}
                        </div>
                        {d.resultSummary && (
                          <div className="text-[11px] opacity-80">{d.resultSummary}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border border-amber-800/40 border-t border-amber-900/50 rounded-md p-2 space-y-1 bg-amber-900/20">
                <div className="font-semibold">Create Downtime</div>
                <form action={createDowntime} className="space-y-1">
                  <input type="hidden" name="campaignId" value={campaign.id} />
                  <input type="hidden" name="sessionId" value={activeSession?.id ?? ""} />
                  <select
                    name="characterId"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  >
                    {campaign.players.map((p) => (
                      <option key={p.characterId} value={p.characterId}>
                        {p.character.name}
                      </option>
                    ))}
                  </select>
                  <select
                    name="type"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  >
                    <option value="training">Training</option>
                    <option value="research">Research</option>
                    <option value="crafting">Crafting</option>
                    <option value="work">Work</option>
                    <option value="carouse">Carouse</option>
                    <option value="custom">Custom</option>
                  </select>
                  <input
                    name="title"
                    required
                    placeholder="Title"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  />
                  <textarea
                    name="description"
                    rows={2}
                    placeholder="Description"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  />
                  <input
                    name="targetProgress"
                    type="number"
                    defaultValue={3}
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                    placeholder="Target progress"
                  />
                  <select
                    name="linkedQuestId"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  >
                    <option value="">No quest</option>
                    {quests.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title}
                      </option>
                    ))}
                  </select>
                  <button className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold">
                    Create
                  </button>
                </form>
              </div>
            </div>
          </section>
          <section id="notes">
            <h3 className="text-sm font-semibold mb-2">GM Notes (✎)</h3>
            <div className="space-y-2 text-xs">
              {notes.length === 0 ? (
                <p className="opacity-70">No notes yet.</p>
              ) : (
                notes.map((n) => (
                  <details
                    key={n.id}
                    className="border border-amber-800/40 border-t border-amber-900/50 rounded-md p-2 bg-amber-900/20"
                  >
                    <summary className="cursor-pointer font-semibold">
                      {n.title}
                    </summary>
                    <div className="mt-1 opacity-80 whitespace-pre-wrap">
                      {n.content}
                    </div>
                    <form action={updateNote} className="mt-2 space-y-1">
                      <input type="hidden" name="id" value={n.id} />
                      <input
                        type="hidden"
                        name="campaignId"
                        value={campaign.id}
                      />
                      <input
                        name="title"
                        defaultValue={n.title}
                        className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                      />
                      <textarea
                        name="content"
                        defaultValue={n.content ?? ""}
                        rows={2}
                        className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                      />
                      <select
                        name="sessionId"
                        defaultValue={n.sessionId ?? ""}
                        className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                      >
                        <option value="">No session</option>
                        {campaign.sessions.map((s) => (
                          <option key={s.id} value={s.id}>
                            Session {s.sessionNumber}
                          </option>
                        ))}
                      </select>
                      <select
                        name="npcId"
                        defaultValue={n.npcId ?? ""}
                        className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                      >
                        <option value="">No NPC</option>
                        {npcs.map((npc) => (
                          <option key={npc.id} value={npc.id}>
                            {npc.name}
                          </option>
                        ))}
                      </select>
                      <select
                        name="questId"
                        defaultValue={n.questId ?? ""}
                        className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                      >
                        <option value="">No Quest</option>
                        {quests.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.title}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                    <form action={deleteNote} className="mt-1">
                      <input type="hidden" name="id" value={n.id} />
                      <input type="hidden" name="campaignId" value={campaign.id} />
                      <button className="px-3 py-1 rounded bg-red-700 hover:bg-red-600 font-semibold">
                        Delete
                      </button>
                    </form>
                  </details>
                ))
              )}

              <div className="border border-amber-800/40 border-t border-amber-900/50 rounded-md p-2 space-y-1 bg-amber-900/20">
                <div className="font-semibold">Add Note</div>
                <form action={createNote} className="space-y-1">
                  <input
                    type="hidden"
                    name="campaignId"
                    value={campaign.id}
                  />
                  <input
                    name="title"
                    required
                    placeholder="Title"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  />
                  <textarea
                    name="content"
                    required
                    rows={2}
                    placeholder="Content"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  />
                  <select
                    name="sessionId"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  >
                    <option value="">No session</option>
                    {campaign.sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        Session {s.sessionNumber}
                      </option>
                    ))}
                  </select>
                  <select
                    name="npcId"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  >
                    <option value="">No NPC</option>
                    {npcs.map((npc) => (
                      <option key={npc.id} value={npc.id}>
                        {npc.name}
                      </option>
                    ))}
                  </select>
                  <select
                    name="questId"
                    className="w-full bg-white/80 border border-amber-700/60 rounded px-2 py-1 text-[#1b120f] shadow-inner"
                  >
                    <option value="">No Quest</option>
                    {quests.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title}
                      </option>
                    ))}
                  </select>
                  <button className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.35)] font-semibold">
                    Create Note
                  </button>
                </form>
              </div>
            </div>
          </section>
        </aside>
      </div>
      </main>
    </div>
  );
}




