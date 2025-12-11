import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const campaignId = url.searchParams.get("campaignId") ?? undefined;

  const sessions = await prisma.session.findMany({
    where: {
      ownerEmail: email,
      ...(campaignId ? { campaignId } : {}),
    },
    orderBy: { sessionDate: "desc" },
  });

  return NextResponse.json({ ok: true, sessions });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    sessionDate?: string;
    notes?: string;
    campaignId?: string;
  };

  const title = (body.title ?? "").trim();
  const campaignId = (body.campaignId ?? "").trim();

  if (!title) {
    return NextResponse.json(
      { ok: false, error: "Session title is required." },
      { status: 400 }
    );
  }

  if (!campaignId) {
    return NextResponse.json(
      { ok: false, error: "campaignId is required." },
      { status: 400 }
    );
  }

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      ownerEmail: email,
    },
  });

  if (!campaign) {
    return NextResponse.json(
      { ok: false, error: "Campaign not found for user." },
      { status: 404 }
    );
  }

  const sessionDate = body.sessionDate ? new Date(body.sessionDate) : null;

  const created = await prisma.session.create({
    data: {
      title,
      sessionDate,
      notes: body.notes ?? null,
      campaignId,
      ownerEmail: email,
    },
  });

  return NextResponse.json({ ok: true, session: created }, { status: 201 });
}
