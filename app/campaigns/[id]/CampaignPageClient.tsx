"use client";

import Link from "next/link";
import type {
  Campaign,
  Session as DbSession,
  PartyMember,
  Character,
} from "@prisma/client";
import type { FormEvent } from "react";
import GmToolsSidebar from "@/components/campaigns/GmToolsSidebar";
import PartyRoom3D, { type PartySeat } from "@/components/PartyRoom3D";
import { useRouter } from "next/navigation";

type PartyMemberWithCharacter = PartyMember & { character: Character | null };
export type CampaignWithRelations = Campaign & {
  sessions: DbSession[];
  partyMembers: PartyMemberWithCharacter[];
  npcs?: any[];
  quests?: any[];
  gmNotes?: any[];
  downtimeActivities?: any[];
  invites?: any[];
};

type Props = {
  campaign: CampaignWithRelations;
  deleteCampaign: (formData: FormData) => Promise<void>;
  addCharacterToCampaign: (formData: FormData) => Promise<void>;
  archiveCampaign: (formData: FormData) => Promise<void>;
  restoreCampaign: (formData: FormData) => Promise<void>;
  availableCharacters: Character[];
  isGM: boolean;
  canDelete: boolean;
  invites: any[];
  inviteActions: {
    createInvite: (formData: FormData) => Promise<void>;
    revokeInvite: (formData: FormData) => Promise<void>;
  };
  gmActions: {
    createNpc: (formData: FormData) => Promise<void>;
    updateNpc: (formData: FormData) => Promise<void>;
    deleteNpc: (formData: FormData) => Promise<void>;
    createQuest: (formData: FormData) => Promise<void>;
    updateQuest: (formData: FormData) => Promise<void>;
    deleteQuest: (formData: FormData) => Promise<void>;
    updateQuestStatus: (formData: FormData) => Promise<void>;
    createNote: (formData: FormData) => Promise<void>;
    updateNote: (formData: FormData) => Promise<void>;
    deleteNote: (formData: FormData) => Promise<void>;
    createDowntime: (formData: FormData) => Promise<void>;
    advanceDowntime: (formData: FormData) => Promise<void>;
    completeDowntime: (formData: FormData) => Promise<void>;
    cancelDowntime: (formData: FormData) => Promise<void>;
    summarizeLastSession: (formData: FormData) => Promise<string>;
    campaignOverview: (formData: FormData) => Promise<string>;
    nextSessionHooks: (formData: FormData) => Promise<string>;
  };
};

function sessionTitle(s: DbSession) {
  const idx = (s as any).index;
  const fallback = `Session ${idx ?? ""}`.trim();
  return (s.title ?? fallback) || "Session";
}

export default function CampaignPageClient({
  campaign,
  deleteCampaign,
  addCharacterToCampaign,
  archiveCampaign,
  restoreCampaign,
  availableCharacters,
  isGM,
  canDelete,
  invites,
  inviteActions,
  gmActions,
}: Props) {
  const router = useRouter();
  const handleArchiveSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (
      !confirm(
        `Archive campaign "${campaign.name}"? It'll be removed from lists until you restore it.`
      )
    ) {
      event.preventDefault();
    }
  };
  const handleRestoreSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (
      !confirm(
        `Restore campaign "${campaign.name}"? It'll become visible in your active lists again.`
      )
    ) {
      event.preventDefault();
    }
  };
  const sessionCount = campaign.sessions.length;
  const partyCount = campaign.partyMembers.length;
  const sortedSessions = [...campaign.sessions].sort((a, b) => {
    const aDate = (a as any).date ?? (a as any).sessionDate ?? a.createdAt;
    const bDate = (b as any).date ?? (b as any).sessionDate ?? b.createdAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });
  const npcs = (campaign as any).npcs ?? [];
  const quests = (campaign as any).quests ?? [];
  const gmNotes = (campaign as any).gmNotes ?? (campaign as any).gMNotes ?? [];
  const downtimeActivities = (campaign as any).downtimeActivities ?? [];
  const activeSessionId =
    campaign.sessions.find((s) => (s as any).isActive)?.id ?? null;
  const partyFor3D: PartySeat[] = campaign.partyMembers.map((pm, i) => {
    const hp = (pm as any).hpCurrent ?? (pm as any).hp ?? null;
    const maxHp = (pm as any).hpMax ?? (pm as any).maxHp ?? null;
    const core = (pm.character as any)?.coreJson ?? {};
    return {
      id: pm.character?.id ?? pm.id,
      name: pm.character?.name ?? "Character",
      className:
        core?.identity?.class ??
        (pm.character as any)?.className ??
        pm.character?.class ??
        null,
      hp,
      maxHp,
      seatIndex: i,
    };
  });

  return (
    <main className="campaign-detail">
      <div className="campaign-detail__header">
        <div className="campaign-detail__title">
          <p className="eyebrow">Campaign</p>
          <h1>{campaign.name}</h1>
          <p className="muted">
            GM: {campaign.gmName || "Unknown"} | {sessionCount} session
            {sessionCount === 1 ? "" : "s"} | {partyCount} party member
            {partyCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="campaign-detail__actions">
          <Link href="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
          <Link href={`/campaigns/${campaign.id}/sessions`} className="btn-secondary">
            Sessions Dashboard
          </Link>
        </div>
      </div>

      <div className="my-4 hidden sm:block">
        <div className="rounded-2xl border border-amber-700/40 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 p-3 shadow-lg shadow-black/40">
          <div className="flex items-center justify-between mb-2 text-sm text-amber-100">
            <div>
              <p className="font-semibold uppercase tracking-wide text-xs">Party Room</p>
              <p className="text-[11px] text-slate-300">
                Tap a pawn to inspect a character.
              </p>
            </div>
          </div>
          <PartyRoom3D
            seats={partyFor3D}
            onSeatClick={(id) => {
              router.push(`/characters/${id}`);
            }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px,1fr,320px]">
        {/* Left: Party sidebar */}
        <aside className="space-y-3">
          <article className="campaign-detail__card parchment-card">
            <div className="card-header">
              <h2>Party Members</h2>
              <p className="card-subtitle">
                {partyCount} member{partyCount === 1 ? "" : "s"}
              </p>
            </div>
            {partyCount === 0 ? (
              <p className="muted">No party members yet.</p>
            ) : (
              <ul className="campaign-detail__list">
                {campaign.partyMembers.map((pm) => (
                  <li key={pm.id} className="campaign-detail__list-item">
                    <div>
                      <div className="list-title">
                        {pm.character?.name ?? "Unnamed character"}
                      </div>
                      {pm.character?.subtitle && (
                        <div className="list-meta">{pm.character.subtitle}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {availableCharacters.length > 0 ? (
              <form
                className="campaign-party-add"
                action={addCharacterToCampaign}
              >
                <input type="hidden" name="campaignId" value={campaign.id} />
                <label className="campaign-party-select-label">
                  <span>Add a character</span>
                  <div className="campaign-party-select-row">
                    <select
                      className="campaign-party-select"
                      name="characterId"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>
                        Select a character
                      </option>
                      {availableCharacters.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="btn-primary campaign-party-add-button"
                    >
                      Add to party
                    </button>
                  </div>
                </label>
              </form>
            ) : (
              <p className="campaign-party-error">
                All your characters are already in this party.
              </p>
            )}
          </article>
        </aside>

        {/* Center: Sessions list */}
        <section className="campaign-detail__grid">
          <article className="campaign-detail__card parchment-card">
            <div className="card-header">
              <div>
                <h2>Sessions</h2>
                <p className="card-subtitle">
                  {sessionCount} total session{sessionCount === 1 ? "" : "s"}
                </p>
              </div>
              <Link
                href={`/campaigns/${campaign.id}/sessions/new`}
                className="btn-secondary campaign-party-add-button"
              >
                New Session
              </Link>
            </div>
            {sessionCount === 0 ? (
              <p className="muted">No sessions yet.</p>
            ) : (
              <ul className="space-y-2">
                {sortedSessions.map((s) => {
                  const sessionDate =
                    (s as any).date ?? (s as any).sessionDate ?? s.createdAt;
                  return (
                    <li key={s.id}>
                      <Link
                        href={`/sessions/${s.id}`}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm hover:border-amber-500/60 hover:bg-slate-900"
                      >
                        <span>
                          <span className="text-slate-50 hover:text-amber-100">
                            {sessionTitle(s)}
                          </span>
                          <p className="text-xs text-slate-500">
                            {new Date(sessionDate).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </article>

          {isGM && (
            <article className="campaign-detail__card parchment-card">
              <div className="card-header">
                <div>
                  <h2>Invites</h2>
                  <p className="card-subtitle">Create links for players to join</p>
                </div>
              </div>
              <form className="space-y-3" action={inviteActions.createInvite}>
                <input type="hidden" name="campaignId" value={campaign.id} />
                <label className="block text-sm">
                  <span className="text-slate-300">Expires at (optional)</span>
                  <input
                    type="datetime-local"
                    name="expiresAt"
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-slate-300">Max uses (optional)</span>
                  <input
                    type="number"
                    name="maxUses"
                    min={1}
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  />
                </label>
                <button type="submit" className="btn-primary w-full">
                  Create invite
                </button>
              </form>

              <div className="mt-4 space-y-2">
                {invites.length === 0 ? (
                  <p className="muted text-sm">No invites yet.</p>
                ) : (
                  invites.map((inv) => {
                    const url = `/join/${inv.token}`;
                    const expired =
                      inv.expiresAt && new Date(inv.expiresAt).getTime() < Date.now();
                    const uses =
                      inv.maxUses != null
                        ? `${inv.usedCount}/${inv.maxUses}`
                        : `${inv.usedCount} / unlimited`;
                    return (
                      <div
                        key={inv.id}
                        className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-xs text-amber-200 break-all">{url}</code>
                          {inv.isRevoked ? (
                            <span className="text-[11px] text-red-300">Revoked</span>
                          ) : expired ? (
                            <span className="text-[11px] text-slate-400">Expired</span>
                          ) : (
                            <form
                              action={inviteActions.revokeInvite}
                              className="text-right"
                            >
                              <input type="hidden" name="inviteId" value={inv.id} />
                              <input type="hidden" name="campaignId" value={campaign.id} />
                              <button
                                type="submit"
                                className="text-[11px] text-red-300 hover:text-red-200"
                              >
                                Revoke
                              </button>
                            </form>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">Uses: {uses}</div>
                        {inv.expiresAt && (
                          <div className="text-[11px] text-slate-400">
                            Expires: {new Date(inv.expiresAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </article>
          )}
        </section>

        {/* Right: GM Tools + AI sidebar */}
        {isGM ? (
          <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
            <GmToolsSidebar
              campaignId={campaign.id}
              activeSessionId={activeSessionId}
              npcs={npcs}
              quests={quests}
              gmNotes={gmNotes}
              downtimeActivities={downtimeActivities}
              sessions={campaign.sessions}
              partyMembers={campaign.partyMembers}
              gmActions={gmActions}
            />
          </aside>
        ) : (
          <aside className="flex flex-col gap-4 text-sm text-slate-400">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <p>This space is reserved for GM tools.</p>
            </div>
          </aside>
        )}
      </div>

      {canDelete && (
        <section className="mt-6">
          <div className="rounded-2xl border border-red-800 bg-red-950/40 p-4 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-red-200">
              Danger Zone
            </h2>
            <p className="text-sm text-red-100/80">
              Deleting this campaign will remove all sessions, events, quests, notes, downtime,
              and party links. This cannot be undone.
            </p>
            {!campaign.isArchived ? (
              <form
                action={archiveCampaign}
                onSubmit={handleArchiveSubmit}
                className="flex flex-col gap-2"
              >
                <input type="hidden" name="campaignId" value={campaign.id} />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg border border-yellow-500 bg-yellow-600/20 px-4 py-2 text-sm font-semibold text-yellow-100 hover:border-yellow-400 hover:bg-yellow-500/20"
                >
                  Archive Campaign
                </button>
              </form>
            ) : (
              <>
                <p className="text-sm text-amber-200/80">
                  This campaign is archived. Restore it to bring it back to your dashboards.
                </p>
                <form
                  action={restoreCampaign}
                  onSubmit={handleRestoreSubmit}
                  className="flex flex-col gap-2"
                >
                  <input type="hidden" name="campaignId" value={campaign.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg border border-emerald-500 bg-emerald-600/20 px-4 py-2 text-sm font-semibold text-emerald-100 hover:border-emerald-400 hover:bg-emerald-500/20"
                  >
                    Restore Campaign
                  </button>
                </form>
              </>
            )}
            <form
              action={deleteCampaign}
              onSubmit={(e) => {
                if (
                  !confirm(
                    `Delete campaign "${campaign.name}"? This cannot be undone.`
                  )
                ) {
                  e.preventDefault();
                }
              }}
              className="flex flex-col gap-2"
            >
              <input type="hidden" name="campaignId" value={campaign.id} />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg border border-red-700 bg-red-800/70 px-4 py-2 text-sm font-semibold text-red-50 hover:bg-red-700"
              >
                Delete Campaign
              </button>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}
