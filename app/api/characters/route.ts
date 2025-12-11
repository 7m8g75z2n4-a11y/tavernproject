import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions, getCurrentUser } from "@/lib/auth";
import { getServerSession } from "next-auth";

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

  const characters = await prisma.character.findMany({
    where: {
      isArchived: false,
      OR: [
        { ownerEmail: email },
        ...(userId ? [{ createdById: userId }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, characters });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const email = user?.email;
  const userId = user?.id;

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    subtitle?: string;
    hp?: string;
    ac?: number;
    speed?: string;
    notes?: string;
  };

  const name = (body.name ?? "").trim();
  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Name is required" },
      { status: 400 }
    );
  }

  const created = await prisma.character.create({
    data: {
      name,
      subtitle: body.subtitle ?? null,
      hp: body.hp ?? null,
      ac: body.ac ?? null,
      speed: body.speed ?? null,
      notes: body.notes ?? null,
      ownerEmail: email,
      createdById: userId ?? null,
    },
  });

  return NextResponse.json({ ok: true, character: created }, { status: 201 });
}
