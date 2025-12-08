// app/api/characters/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const characters = await prisma.character.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ characters });
}

export async function POST(req: Request) {
  const body = await req.json();

  const name: string = body.name || "Unnamed Hero";
  const subtitle: string | undefined = body.subtitle;
  const hp: string | undefined = body.hp;
  const ac: number | undefined = body.ac;
  const speed: string | undefined = body.speed;
  const notes: string | undefined = body.notes;

  const created = await prisma.character.create({
    data: {
      name,
      subtitle,
      hp,
      ac,
      speed,
      notes,
    },
  });

  return NextResponse.json({ character: created }, { status: 201 });
}
