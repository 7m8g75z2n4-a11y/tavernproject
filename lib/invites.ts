import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export function generateInviteToken() {
  // 32 bytes -> 43 base64url chars; trim to 40 for neatness
  return crypto.randomBytes(32).toString("base64url").slice(0, 40);
}

export async function validateInviteToken(token: string) {
  if (!token) return null;
  const invite = await prisma.campaignInvite.findUnique({
    where: { token },
    include: { campaign: true },
  });
  if (!invite) return null;

  const now = new Date();
  if (invite.isRevoked) return null;
  if (invite.expiresAt && invite.expiresAt < now) return null;
  if (invite.maxUses != null && invite.usedCount >= invite.maxUses) return null;
  if (!invite.campaign) return null;

  return invite;
}
