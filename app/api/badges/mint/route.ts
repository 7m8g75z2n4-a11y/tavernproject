import { NextResponse } from "next/server";
import { mintBadgeOnChain } from "@/lib/chain";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    walletAddress?: string;
    sessionId?: string;
    label?: string;
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

  const sessionId = body.sessionId || "demo-session";
  const label = body.label || "Session Badge";
  const tokenUri = `ipfs://badge/${sessionId}`;

  try {
    const result = await mintBadgeOnChain({
      to: walletAddress,
      tokenUri,
    });

    return NextResponse.json(
      {
        ok: true,
        message: result.simulated
          ? "Simulated badge mint (no chain config)."
          : "Badge minted successfully.",
        txHash: result.txHash,
        tokenId: result.tokenId,
        tokenUri,
        label,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[badge mint] error", err);
    return NextResponse.json(
      { ok: false, error: "Badge mint failed on the server." },
      { status: 500 }
    );
  }
}
