import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateInviteToken } from "@/lib/invites";

type JoinPageParams = {
  token?: string | string[] | undefined;
};

type JoinPageProps = {
  params?: Promise<JoinPageParams>;
  searchParams?: Promise<any>;
};

async function joinCampaignViaInvite(formData: FormData) {
  "use server";
  const token = String(formData.get("token") || "");
  const characterId = String(formData.get("characterId") || "");
  const user = await getCurrentUser();
  if (!user || !token || !characterId) {
    redirect("/login?callbackUrl=/join/" + token);
  }

  const invite = await validateInviteToken(token);
  if (!invite) {
    redirect("/join/" + token + "?error=invalid");
  }

  const character = await prisma.character.findUnique({
    where: { id: characterId },
    select: { id: true, createdById: true, ownerEmail: true },
  });
  if (
    !character ||
    (character.createdById && character.createdById !== user.id) ||
    (character.ownerEmail && character.ownerEmail !== user.email)
  ) {
    redirect("/join/" + token + "?error=character");
  }

  const existing = await prisma.partyMember.findFirst({
    where: { campaignId: invite.campaignId, characterId },
  });
  if (existing) {
    redirect(`/play/${invite.campaignId}/${characterId}`);
  }

  await prisma.$transaction([
    prisma.partyMember.create({
      data: {
        campaignId: invite.campaignId,
        characterId,
        ownerEmail: user.email ?? null,
        userId: user.id ?? null,
      },
    }),
    prisma.campaignInvite.update({
      where: { id: invite.id },
      data: { usedCount: { increment: 1 } },
    }),
  ]);

  redirect(`/play/${invite.campaignId}/${characterId}`);
}

export default async function JoinPage({ params }: JoinPageProps) {
  const resolvedParams = await params;
  const rawToken = resolvedParams?.token;
  const token =
    typeof rawToken === "string"
      ? rawToken
      : Array.isArray(rawToken)
      ? rawToken[0]
      : undefined;

  const user = await getCurrentUser();
  if (!token) {
    redirect("/");
  }

  const invite = await validateInviteToken(token);
  if (!invite) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="space-y-3 text-center">
          <p className="text-lg font-semibold">This invitation is no longer valid.</p>
          <Link href="/" className="text-amber-300 hover:text-amber-200 underline">
            Return home
          </Link>
        </div>
      </div>
    );
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: invite.campaignId },
    select: {
      id: true,
      name: true,
      description: true,
      partyMembers: { select: { characterId: true } },
    },
  });

  if (!campaign) {
    redirect("/");
  }

  if (!user) {
    redirect(`/login?callbackUrl=/join/${token}`);
  }

  const existingCharacterIds = new Set(
    (campaign.partyMembers ?? []).map((pm) => pm.characterId)
  );

  const characters = await prisma.character.findMany({
    where: {
      isArchived: false,
      OR: [
        { createdById: user.id ?? undefined },
        { ownerEmail: user.email ?? undefined },
      ],
      NOT: { id: { in: Array.from(existingCharacterIds) } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-300">Campaign Invite</p>
          <h1 className="text-2xl font-bold text-amber-100">{campaign.name}</h1>
          {campaign.description && (
            <p className="text-sm text-slate-300 mt-1">{campaign.description}</p>
          )}
        </div>

        {characters.length === 0 ? (
          <div className="space-y-2 text-sm text-slate-300">
            <p>You have no available characters to join this campaign.</p>
            <Link
              href="/characters/new"
              className="text-amber-300 hover:text-amber-200 underline"
            >
              Create a character
            </Link>
          </div>
        ) : (
          <form className="space-y-3" action={joinCampaignViaInvite}>
            <input type="hidden" name="token" value={token} />
            <label className="block text-sm">
              <span className="text-slate-200">Choose a character to join</span>
              <select
                name="characterId"
                required
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              >
                <option value="">Select a character</option>
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn-primary w-full">
              Join campaign
            </button>
          </form>
        )}

        <div className="text-xs text-slate-500">
          Invite token: <span className="font-mono text-amber-200">{token}</span>
        </div>
      </div>
    </div>
  );
}
