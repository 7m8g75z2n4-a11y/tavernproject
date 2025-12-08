import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mintCharacterOnChain } from "@/lib/chain";

export async function POST(req: Request, context: any) {
  const id = context?.params?.id as string | undefined;

  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Missing character id." },
      { status: 400 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    walletAddress?: string;
  };

  const fallbackWallet = process.env.TAVERN_TEST_WALLET || "";
  const walletAddress = body.walletAddress || fallbackWallet;

  if (!walletAddress) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "No wallet address provided and TAVERN_TEST_WALLET is not set.",
      },
      { status: 400 }
    );
  }

  const character = await prisma.character.findUnique({ where: { id } });

  if (!character) {
    return NextResponse.json(
      { ok: false, error: "Character not found." },
      { status: 404 }
    );
  }

  const tokenUri = `ipfs://character/${character.id}`;

  try {
    const result = await mintCharacterOnChain({
      to: walletAddress,
      tokenUri,
    });

    return NextResponse.json(
      {
        ok: true,
        message: result.simulated
          ? "Simulated character mint (no chain config)."
          : "Character minted successfully.",
        txHash: result.txHash,
        tokenId: result.tokenId,
        tokenUri,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[character mint] error", err);
    return NextResponse.json(
      { ok: false, error: "Mint failed on the server." },
      { status: 500 }
    );
  }
}
