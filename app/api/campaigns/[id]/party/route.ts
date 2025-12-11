import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type RouteContext = {
  params: { id: string };
};

export async function POST(req: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const campaignId = context.params.id;

  const body = (await req.json().catch(() => ({}))) as {
    characterId?: string;
  };

  const characterId = (body.characterId ?? "").trim();

  if (!characterId) {
    return NextResponse.json(
      { ok: false, error: "characterId is required." },
      { status: 400 }
    );
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ownerEmail: email },
  });

  if (!campaign) {
    return NextResponse.json(
      { ok: false, error: "Campaign not found." },
      { status: 404 }
    );
  }

  const character = await prisma.character.findFirst({
    where: { id: characterId, ownerEmail: email, isArchived: false },
  });

  if (!character) {
    return NextResponse.json(
      { ok: false, error: "Character not found." },
      { status: 404 }
    );
  }

  const existing = await prisma.partyMember.findFirst({
    where: {
      campaignId,
      characterId,
      ownerEmail: email,
    },
    include: { character: true },
  });

  if (existing) {
    return NextResponse.json(
      {
        ok: true,
        partyMember: existing,
        alreadyInParty: true,
      },
      { status: 200 }
    );
  }

  const created = await prisma.partyMember.create({
    data: {
      campaignId,
      characterId,
      ownerEmail: email,
    },
    include: {
      character: true,
    },
  });

  return NextResponse.json(
    { ok: true, partyMember: created, alreadyInParty: false },
    { status: 201 }
  );
}
