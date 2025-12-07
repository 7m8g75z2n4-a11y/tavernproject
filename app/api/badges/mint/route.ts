import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import {
  minterSigner,
  tavernBadgesAbi,
  TAVERN_BADGES_ADDRESS,
  BADGES_CHAIN_ID,
} from "@/lib/web3";
import { uploadCharacterMetadata } from "@/lib/ipfs";
import { ethers } from "ethers";

// Body: { targetUserId?: string, metadata: {...} }
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId, metadata } = await req.json();
    const userToMint = targetUserId || userId;

    if (!metadata || typeof metadata !== "object") {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userToMint },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.walletAddress) {
      return NextResponse.json(
        { error: "User has no wallet connected" },
        { status: 400 }
      );
    }

    const tokenURI = await uploadCharacterMetadata(metadata);

    const contract = new ethers.Contract(
      TAVERN_BADGES_ADDRESS,
      tavernBadgesAbi,
      minterSigner
    );

    const tx = await contract.mintBadge(user.walletAddress, tokenURI);
    const receipt = await tx.wait();

    const nextTokenId = await contract.nextTokenId();
    const tokenId = nextTokenId.toString();

    const badge = await prisma.badge.create({
      data: {
        userId: user.id,
        tokenId,
        chainId: BADGES_CHAIN_ID,
        contractAddress: TAVERN_BADGES_ADDRESS,
        metadataUri: tokenURI,
      },
    });

    return NextResponse.json({
      success: true,
      tokenId,
      chainId: BADGES_CHAIN_ID,
      contractAddress: TAVERN_BADGES_ADDRESS,
      txHash: receipt.hash,
      badge,
    });
  } catch (err: any) {
    console.error("Badge mint error", err);
    return NextResponse.json(
      { error: "Badge mint failed", details: err?.message },
      { status: 500 }
    );
  }
}
