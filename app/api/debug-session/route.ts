import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  return NextResponse.json({
    ok: true,
    sessionEmail: session?.user?.email ?? null,
    sessionUserId: session?.user?.id ?? null,
  });
}
