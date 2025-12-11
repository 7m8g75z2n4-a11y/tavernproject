"use client";

import { useMemo, useState, useTransition } from "react";

type GMActionProps = {
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

type Props = {
  campaignId: string;
  npcs: any[];
  quests: any[];
  gmNotes: any[];
  downtimeActivities: any[];
  sessions: any[];
  players: any[];
  gmActions: GMActionProps;
};

export default function CampaignGmSidebar({
  campaignId,
  npcs,
  quests,
  gmNotes,
  downtimeActivities,
  sessions,
  players,
  gmActions,
}: Props) {
  const [aiResult, setAiResult] = useState<string>("");
  const [aiPending, startAi] = useTransition();

  const activeQuests = useMemo(
    () => quests.filter((q) => !["COMPLETED", "FAILED"].includes(q.status)),
    [quests]
  );
  const doneQuests = useMemo(
    () => quests.filter((q) => ["COMPLETED", "FAILED"].includes(q.status)),
    [quests]
  );

  const ongoingDowntime = useMemo(
    () => downtimeActivities.filter((d) => d.status === "ONGOING"),
    [downtimeActivities]
  );
  const finishedDowntime = useMemo(
    () => downtimeActivities.filter((d) => d.status !== "ONGOING"),
    [downtimeActivities]
  );

  async function runAi(action: (fd: FormData) => Promise<string>) {
    startAi(async () => {
      const fd = new FormData();
      fd.append("campaignId", campaignId);
      const res = await action(fd);
      setAiResult(res ?? "No response.");
    });
  }

  return (
    <div className="rounded-2xl border border-amber-700/40 bg-slate-900/80 shadow-lg p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-amber-300">
          GM Tools
        </h2>
        <p className="text-xs text-slate-300/80">Run the night from here.</p>
      </div>

      {/* NPCs */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-300">
          NPCs
        </h3>
        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          {npcs.length === 0 && (
            <p className="text-xs text-slate-400">
              No NPCs yet. Add your first tavern regular.
            </p>
          )}
          {npcs.map((npc) => (
            <details
              key={npc.id}
              className="group rounded-md border border-slate-800/70 bg-slate-900/60 p-2"
            >
              <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-100">
                <span>{npc.name}</span>
                {npc.role && (
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-300">
                    {npc.role}
                  </span>
                )}
              </summary>
              <div className="mt-2 space-y-2 text-xs text-slate-200">
                {npc.description && (
                  <p className="text-slate-300">{npc.description}</p>
                )}
                <form action={gmActions.updateNpc} className="space-y-1">
                  <input type="hidden" name="campaignId" value={campaignId} />
                  <input type="hidden" name="npcId" value={npc.id} />
                  <input
                    name="name"
                    defaultValue={npc.name}
                    className="w-full rounded-md border border-slate-800 bg-slate-950/80 px-2 py-1 text-xs"
                  />
                  <input
                    name="role"
                    defaultValue={npc.role ?? ""}
                    className="w-full rounded-md border border-slate-800 bg-slate-950/80 px-2 py-1 text-xs"
                  />
                  <textarea
                    name="description"
                    defaultValue={npc.description ?? ""}
                    rows={2}
                    className="w-full rounded-md border border-slate-800 bg-slate-950/80 px-2 py-1 text-xs"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-100 hover:bg-slate-700"
                    >
                      Save
                    </button>
                    <button
                      formAction={gmActions.deleteNpc}
                      type="submit"
                      name="npcId"
                      value={npc.id}
                      className="flex-1 rounded-md bg-red-700 px-2 py-1 text-xs font-medium text-slate-50 hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </form>
              </div>
            </details>
          ))}

          <form action={gmActions.createNpc} className="space-y-1 pt-2 border-t border-slate-800 mt-2">
            <input type="hidden" name="campaignId" value={campaignId} />
            <input
              name="name"
              placeholder="Name"
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs placeholder:text-slate-500"
              required
            />
            <input
              name="role"
              placeholder="Role (bartender, patron, villain...)"
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs placeholder:text-slate-500"
            />
            <textarea
              name="description"
              placeholder="Short description / hook"
              rows={2}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-amber-600 px-2 py-1 text-xs font-medium text-slate-950 hover:bg-amber-500"
            >
              + Add NPC
            </button>
          </form>
        </div>
      </section>

      {/* Quests */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-300">
          Quests
        </h3>
        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400">Active Quests</p>
            {activeQuests.length === 0 && (
              <p className="text-xs text-slate-500">
                None active. Add or resume one below.
              </p>
            )}
            {activeQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                campaignId={campaignId}
                gmActions={gmActions}
              />
            ))}
          </div>
          <div className="space-y-1 border-t border-slate-800 pt-2">
            <p className="text-[11px] text-slate-400">Completed / Failed</p>
            {doneQuests.length === 0 && (
              <p className="text-xs text-slate-500">Nothing finished yet.</p>
            )}
            {doneQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                campaignId={campaignId}
                gmActions={gmActions}
              />
            ))}
          </div>

          <form action={gmActions.createQuest} className="space-y-1 pt-2 border-t border-slate-800">
            <input type="hidden" name="campaignId" value={campaignId} />
            <input
              name="title"
              placeholder="Quest title"
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs placeholder:text-slate-500"
              required
            />
            <textarea
              name="summary"
              placeholder="Goal, stakes, or key info"
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs placeholder:text-slate-500"
              rows={2}
            />
            <select
              name="status"
              defaultValue="PLANNED"
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs"
            >
              <option value="PLANNED">Planned</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
            <button
              type="submit"
              className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-amber-600 px-2 py-1 text-xs font-medium text-slate-950 hover:bg-amber-500"
            >
              + Add Quest
            </button>
          </form>
        </div>
      </section>

      {/* GM Notes */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-300">
          GM Notes
        </h3>
        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <form action={gmActions.createNote} className="space-y-1">
            <input type="hidden" name="campaignId" value={campaignId} />
            <input
              name="title"
              placeholder="Note title"
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs placeholder:text-slate-500"
            />
            <textarea
              name="body"
              placeholder="Prep, secrets, rulings..."
              rows={3}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs placeholder:text-slate-500"
              required
            />
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <select
                name="sessionId"
                defaultValue=""
                className="rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1"
              >
                <option value="">Session (optional)</option>
                {sessions.slice(0, 5).map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.title ?? "Session"} 
                  </option>
                ))}
              </select>
              <select
                name="npcId"
                defaultValue=""
                className="rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1"
              >
                <option value="">NPC (optional)</option>
                {npcs.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
              <select
                name="questId"
                defaultValue=""
                className="rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1"
              >
                <option value="">Quest (optional)</option>
                {quests.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-amber-600 px-2 py-1 text-xs font-medium text-slate-950 hover:bg-amber-500"
            >
              + Add Note
            </button>
          </form>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {gmNotes.length === 0 && (
              <p className="text-xs text-slate-400">No notes yet.</p>
            )}
            {gmNotes
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice(0, 8)
              .map((note) => (
                <details
                  key={note.id}
                  className="rounded-md border border-slate-800 bg-slate-900/60 p-2 text-xs"
                >
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-100">
                    <span>{note.title || "Untitled note"}</span>
                    <span className="text-[10px] text-slate-500">
                      {note.createdAt
                        ? new Date(note.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </summary>
                  <div className="mt-2 space-y-2 text-slate-200">
                    {(note.sessionId || note.npcId || note.questId) && (
                      <div className="flex flex-wrap gap-1 text-[10px] text-amber-200">
                        {note.sessionId && (
                          <span className="rounded-full bg-slate-800 px-2 py-0.5">
                            Session
                          </span>
                        )}
                        {note.npcId && (
                          <span className="rounded-full bg-slate-800 px-2 py-0.5">
                            NPC link
                          </span>
                        )}
                        {note.questId && (
                          <span className="rounded-full bg-slate-800 px-2 py-0.5">
                            Quest link
                          </span>
                        )}
                      </div>
                    )}
                    <form action={gmActions.updateNote} className="space-y-1">
                      <input
                        type="hidden"
                        name="campaignId"
                        value={campaignId}
                      />
                      <input type="hidden" name="noteId" value={note.id} />
                      <input
                        name="title"
                        defaultValue={note.title ?? ""}
                        className="w-full rounded-md border border-slate-800 bg-slate-950/70 px-2 py-1 text-xs"
                      />
                      <textarea
                        name="body"
                        defaultValue={note.body ?? ""}
                        rows={3}
                    className="w-full rounded-md border border-slate-800 bg-slate-950/70 px-2 py-1 text-xs"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-100 hover:bg-slate-700"
                    >
                      Save
                    </button>
                    <button
                      formAction={gmActions.deleteNote}
                      type="submit"
                      name="noteId"
                      value={note.id}
                      className="flex-1 rounded-md bg-red-700 px-2 py-1 text-xs font-medium text-slate-50 hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </form>
              </div>
            </details>
          ))}
          </div>
        </div>
      </section>

      {/* Downtime */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-300">
          Downtime
        </h3>
        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
          <div>
            <p className="text-[11px] text-slate-400 mb-1">Ongoing</p>
            <div className="space-y-2">
              {ongoingDowntime.length === 0 && (
                <p className="text-xs text-slate-500">
                  No ongoing downtime. Start one below.
                </p>
              )}
              {ongoingDowntime.map((d) => (
                <div
                  key={d.id}
                  className="rounded-md border border-slate-800 bg-slate-900/60 p-2 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-100 font-semibold">{d.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {d.character?.name ?? "Unknown character"}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase text-slate-100">
                      {d.status}
                    </span>
                  </div>
                  {d.description && (
                    <p className="text-[11px] text-slate-300">{d.description}</p>
                  )}
                  <div className="text-[11px] text-slate-400">
                    Progress: {d.progress ?? 0}
                    {d.goal ? ` / ${d.goal}` : ""}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <form action={gmActions.advanceDowntime}>
                      <input
                        type="hidden"
                        name="campaignId"
                        value={campaignId}
                      />
                      <input type="hidden" name="activityId" value={d.id} />
                      <button className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-100 hover:bg-slate-700">
                        Advance
                      </button>
                    </form>
                    <form action={gmActions.completeDowntime}>
                      <input
                        type="hidden"
                        name="campaignId"
                        value={campaignId}
                      />
                      <input type="hidden" name="activityId" value={d.id} />
                      <button className="rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] text-emerald-50 hover:bg-emerald-600">
                        Complete
                      </button>
                    </form>
                    <form action={gmActions.cancelDowntime}>
                      <input
                        type="hidden"
                        name="campaignId"
                        value={campaignId}
                      />
                      <input type="hidden" name="activityId" value={d.id} />
                      <button className="rounded-full bg-red-700 px-2 py-0.5 text-[10px] text-red-50 hover:bg-red-600">
                        Cancel
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2">
            <p className="text-[11px] text-slate-400 mb-1">Completed / Cancelled</p>
            <div className="space-y-1">
              {finishedDowntime.length === 0 && (
                <p className="text-xs text-slate-500">Nothing finished yet.</p>
              )}
              {finishedDowntime.map((d) => (
                <div
                  key={d.id}
                  className="rounded-md border border-slate-800 bg-slate-900/40 p-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-100">{d.title}</p>
                    <span
                      className={`
                        rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide
                        ${
                          d.status === "COMPLETED"
                            ? "bg-emerald-800/80 text-emerald-100"
                            : "bg-slate-800 text-slate-100"
                        }
                      `}
                    >
                      {d.status}
                    </span>
                  </div>
                  {d.description && (
                    <p className="mt-1 text-[11px] text-slate-300">
                      {d.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form action={gmActions.createDowntime} className="space-y-1 pt-2 border-t border-slate-800">
            <input type="hidden" name="campaignId" value={campaignId} />
            <input
              name="title"
              placeholder="Activity (training, crafting...)"
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs placeholder:text-slate-500"
              required
            />
            <textarea
              name="description"
              placeholder="What are they doing?"
              rows={2}
              className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs placeholder:text-slate-500"
            />
            <div className="flex gap-2">
              <select
                name="characterId"
                defaultValue=""
                className="flex-1 rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs"
                required
              >
                <option value="">Choose character</option>
                {players.map((p: any) =>
                  p.character ? (
                    <option key={p.id} value={p.character.id}>
                      {p.character.name ?? "Unnamed"}
                    </option>
                  ) : null
                )}
              </select>
              <input
                name="goal"
                placeholder="Goal"
                className="w-20 rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-amber-600 px-2 py-1 text-xs font-medium text-slate-950 hover:bg-amber-500"
            >
              + Start Downtime
            </button>
          </form>
        </div>
      </section>

      {/* AI Assistant */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-300">
          AI Assistant
        </h3>
        <div className="space-y-2 rounded-xl border border-violet-500/40 bg-slate-900/90 p-3 text-xs">
          <p className="text-slate-300/80">
            Summaries and hooks based on your sessions, quests, and party.
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => runAi(gmActions.summarizeLastSession)}
              className="rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1 text-slate-100 hover:border-amber-400"
              disabled={aiPending}
            >
              Summarize last session
            </button>
            <button
              type="button"
              onClick={() => runAi(gmActions.campaignOverview)}
              className="rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1 text-slate-100 hover:border-amber-400"
              disabled={aiPending}
            >
              Campaign overview
            </button>
            <button
              type="button"
              onClick={() => runAi(gmActions.nextSessionHooks)}
              className="rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1 text-slate-100 hover:border-amber-400"
              disabled={aiPending}
            >
              Hooks for next session
            </button>
          </div>
          <div className="min-h-[80px] max-h-40 overflow-y-auto rounded-md border border-slate-800 bg-slate-950/60 p-2 text-slate-100 whitespace-pre-wrap">
            {aiPending ? "Thinking..." : aiResult || "No AI output yet."}
          </div>
        </div>
      </section>
    </div>
  );
}

function QuestCard({
  quest,
  campaignId,
  gmActions,
}: {
  quest: any;
  campaignId: string;
  gmActions: GMActionProps;
}) {
  return (
    <details className="rounded-md border border-slate-800/70 bg-slate-900/60 p-2 text-xs">
      <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-100">
        <span>{quest.title}</span>
        <span
          className={`
            rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide
            ${
              quest.status === "COMPLETED"
                ? "bg-emerald-800/80 text-emerald-100"
                : quest.status === "FAILED"
                ? "bg-red-800/80 text-red-100"
                : quest.status === "ACTIVE"
                ? "bg-amber-700/80 text-amber-50"
                : "bg-slate-800 text-slate-100"
            }
          `}
        >
          {quest.status}
        </span>
      </summary>
      <div className="mt-2 space-y-2 text-slate-200">
        {quest.summary && <p className="text-slate-300">{quest.summary}</p>}

        <form action={gmActions.updateQuest} className="space-y-1">
          <input type="hidden" name="campaignId" value={campaignId} />
          <input type="hidden" name="questId" value={quest.id} />
          <input
            name="title"
            defaultValue={quest.title}
            className="w-full rounded-md border border-slate-800 bg-slate-950/80 px-2 py-1 text-xs"
          />
          <textarea
            name="summary"
            defaultValue={quest.summary ?? ""}
            rows={2}
            className="w-full rounded-md border border-slate-800 bg-slate-950/80 px-2 py-1 text-xs"
          />
          <select
            name="status"
            defaultValue={quest.status}
            className="w-full rounded-md border border-slate-800 bg-slate-950/80 px-2 py-1 text-xs"
          >
            <option value="PLANNED">Planned</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-100 hover:bg-slate-700"
            >
              Save
            </button>
            <button
              formAction={gmActions.deleteQuest}
              type="submit"
              name="questId"
              value={quest.id}
              className="flex-1 rounded-md bg-red-700 px-2 py-1 text-xs font-medium text-slate-50 hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </form>

        <form
          action={gmActions.updateQuestStatus}
          className="flex flex-wrap gap-1 pt-1"
        >
          <input type="hidden" name="campaignId" value={campaignId} />
          <input type="hidden" name="questId" value={quest.id} />
          {["PLANNED", "ACTIVE", "COMPLETED", "FAILED"].map((status) => (
            <button
              key={status}
              type="submit"
              name="status"
              value={status}
              className={`
                rounded-full px-2 py-0.5 text-[10px]
                ${
                  status === quest.status
                    ? "bg-amber-600 text-slate-950"
                    : "bg-slate-800 text-slate-100 hover:bg-slate-700"
                }
              `}
            >
              {status}
            </button>
          ))}
        </form>
      </div>
    </details>
  );
}
