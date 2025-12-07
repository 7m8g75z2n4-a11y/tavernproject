import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import {
  minterSigner,
  tavernCharactersAbi,
  TAVERN_CHARACTERS_ADDRESS,
  CHAIN_ID,
} from "@/lib/web3";
import { uploadCharacterMetadata } from "@/lib/ipfs";
import { ethers } from "ethers";

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const characterId = context.params.id;

    // Load character + user wallet
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        systemData: true,
        user: true,
      },
    });

    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    if (character.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (character.tokenId) {
      return NextResponse.json(
        { error: "Character already has an on-chain passport" },
        { status: 400 }
      );
    }

    // Here we assume you have user.walletAddress in the User table.
    // Adjust field name as needed.
    const walletAddress = (character.user as any).walletAddress as
      | string
      | null;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "No wallet connected to this account" },
        { status: 400 }
      );
    }

    // Build metadata snapshot
    const systemData = character.systemData as any;

    const metadata = {
      name: character.name,
      description:
        "A character passport minted from Tavern, the home between campaigns.",
      image: character.portraitUrl ?? undefined,
      external_url: `https://your-tavern-domain.com/characters/${character.id}`,
      attributes: [
        { trait_type: "System", value: character.system },
        systemData && {
          trait_type: "LevelSnapshot",
          value: systemData.level,
        },
        // Add more traits from coreJson if desired.
      ].filter(Boolean),
    };

    const tokenURI = await uploadCharacterMetadata(metadata);

    // Create contract instance
    const contract = new ethers.Contract(
      TAVERN_CHARACTERS_ADDRESS,
      tavernCharactersAbi,
      minterSigner
    );

    // Send tx
    const tx = await contract.mintCharacter(walletAddress, tokenURI);
    const receipt = await tx.wait();

    // Get the new tokenId (can also parse event logs)
    const nextTokenId = await contract.nextTokenId();
    const tokenId = nextTokenId.toString();

    await prisma.character.update({
      where: { id: character.id },
      data: {
        tokenId,
        chainId: CHAIN_ID,
        contractAddress: TAVERN_CHARACTERS_ADDRESS,
      },
    });

    return NextResponse.json({
      success: true,
      tokenId,
      chainId: CHAIN_ID,
      txHash: receipt.hash,
    });
  } catch (err: any) {
    console.error("Mint error", err);
    return NextResponse.json(
      { error: "Mint failed", details: err?.message },
      { status: 500 }
    );
  }
}
