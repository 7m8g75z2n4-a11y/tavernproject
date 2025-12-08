// app/api/characters/[id]/mint/route.ts
import { NextRequest, NextResponse } from "next/server";

type MintRouteContext = {
  params: {
    id: string;
  };
};

export async function GET(req: NextRequest, { params }: MintRouteContext) {
  const { id } = params;

  return NextResponse.json(
    {
      ok: true,
      message: "Mint GET endpoint reached.",
      characterId: id,
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest, { params }: MintRouteContext) {
  const { id } = params;

  try {
    return NextResponse.json(
      {
        ok: true,
        message: "Mint POST endpoint reached.",
        characterId: id,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[mint] error", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Mint failed on the server.",
      },
      { status: 500 }
    );
  }
}
