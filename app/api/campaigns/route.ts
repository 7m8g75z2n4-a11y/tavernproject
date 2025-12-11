import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, getCurrentUser } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const userId = session?.user?.id;

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const campaigns = await prisma.campaign.findMany({
    where: {
      OR: [
        { ownerEmail: email },
        ...(userId ? [{ createdById: userId }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sessions: true } } },
  });

  return NextResponse.json({ ok: true, campaigns });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const email = user?.email;

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    gmName?: string;
  };

  const name = (body.name ?? "").trim();
  const gmName = (body.gmName ?? "").trim() || null;

  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Campaign name is required" },
      { status: 400 }
    );
  }

  const created = await prisma.campaign.create({
    data: {
      name,
      gmName,
      ownerEmail: email,
      createdById: user?.id ?? null,
    },
  });

  return NextResponse.json({ ok: true, campaign: created }, { status: 201 });
}
