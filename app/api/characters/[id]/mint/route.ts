// app/api/characters/[id]/mint/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request, context: any) {
  const id = context?.params?.id as string | undefined;

  return NextResponse.json(
    {
      ok: true,
      method: "GET",
      characterId: id ?? null,
      message: "Mint GET endpoint reached.",
    },
    { status: 200 }
  );
}

export async function POST(request: Request, context: any) {
  const id = context?.params?.id as string | undefined;

  return NextResponse.json(
    {
      ok: true,
      method: "POST",
      characterId: id ?? null,
      message: "Mint POST endpoint reached.",
    },
    { status: 200 }
  );
}
