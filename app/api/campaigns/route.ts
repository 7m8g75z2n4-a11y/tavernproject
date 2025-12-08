import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;

  const campaigns = await prisma.campaign.findMany({
    where: email ? { ownerEmail: email } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    gmName?: string;
  };

  const name = (body.name ?? "").trim();
  const gmName = (body.gmName ?? "").trim() || null;

  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Campaign name is required." },
      { status: 400 }
    );
  }

  const created = await prisma.campaign.create({
    data: {
      name,
      gmName,
      ownerEmail: email,
    },
  });

  return NextResponse.json({ ok: true, campaign: created }, { status: 201 });
}
