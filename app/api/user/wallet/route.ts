import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { address } = await req.json();
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  // Optional: add checksum validation here.

  const user = await prisma.user.update({
    where: { id: userId },
    data: { walletAddress: address },
  });

  return NextResponse.json({
    success: true,
    walletAddress: user.walletAddress,
  });
}
