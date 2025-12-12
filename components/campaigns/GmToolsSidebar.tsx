"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { TabsShell } from "@/components/ui/TabsShell";
import { TavernCard } from "@/components/ui/TavernCard";
import { Sparkles, Users, BookOpen, ListChecks, Clock10 } from "lucide-react";

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
  activeSessionId: string | null;
  npcs: any[];
  quests: any[];
  gmNotes: any[];
  downtimeActivities: any[];
  sessions: any[];
  partyMembers: any[];
  gmActions: GMActionProps;
};

export default function GmToolsSidebar({
  campaignId,
  activeSessionId,
  npcs,
  quests,
  gmNotes,
  downtimeActivities,
  sessions,
  partyMembers,
  gmActions,
}: Props) {
  const [aiResult, setAiResult] = useState<string>("");
  const [aiPending, startAi] = useTransition();

  const ongoingDowntime = useMemo(
    () =>
      downtimeActivities.filter(
        (d) => d.status !== "COMPLETED" && d.status !== "CANCELLED"
      ),
    [downtimeActivities]
  );
  const finishedDowntime = useMemo(
    () =>
      downtimeActivities.filter(
        (d) => d.status === "COMPLETED" || d.status === "CANCELLED"
      ),
    [downtimeActivities]
  );

  function runAi(action: (fd: FormData) => Promise<string>) {
    startAi(async () => {
      const fd = new FormData();
      fd.append("campaignId", campaignId);
      const res = await action(fd);
      setAiResult(res ?? "No response.");
    });
  }

  const tabs = useMemo(
    () => [
      { value: "npcs", label: "NPCs", icon: Users, children: <NpcPanel campaignId={campaignId} npcs={npcs} gmActions={gmActions} /> },
      {
        value: "quests",
        label: "Quests",
        icon: ListChecks,
        children: (
          <QuestPanel
            campaignId={campaignId}
            activeSessionId={activeSessionId}
            quests={quests}
            npcs={npcs}
            gmActions={gmActions}
          />
        ),
      },
      {
        value: "notes",
        label: "Notes",
        icon: BookOpen,
        children: (
          <NotesPanel
            campaignId={campaignId}
            activeSessionId={activeSessionId}
            gmNotes={gmNotes}
            npcs={npcs}
            quests={quests}
            sessions={sessions}
            gmActions={gmActions}
          />
        ),
      },
      {
        value: "downtime",
        label: "Downtime",
        icon: Clock10,
        children: (
          <DowntimePanel
            campaignId={campaignId}
            activeSessionId={activeSessionId}
            activities={downtimeActivities}
            partyMembers={partyMembers}
            finishedDowntime={finishedDowntime}
            gmActions={gmActions}
          />
        ),
      },
      {
        value: "ai",
        label: "AI",
        icon: Sparkles,
        children: (
          <AiPanel
            runAi={runAi}
            aiPending={aiPending}
            aiResult={aiResult}
            gmActions={gmActions}
          />
        ),
      },
    ],
    [campaignId, npcs, quests, gmNotes, downtimeActivities, sessions, partyMembers, activeSessionId, gmActions, aiPending, aiResult]
  );

  return (
    <TavernCard className="space-y-0 bg-slate-900/80 px-0">
      <div className="px-4 py-3 border-b border-slate-800/70">
        <h2 className="text-sm font-semibold tracking-wide text-amber-300 uppercase">GM Tools</h2>
        <p className="text-xs text-slate-400">Run the night from one panel.</p>
      </div>
      <div className="px-4 py-4">
        <TabsShell tabs={tabs} className="space-y-4" />
      </div>
    </TavernCard>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-slate-950/70 border border-slate-800/70 rounded-xl p-3 shadow-inner shadow-black/30 space-y-3">
      <h3 className="text-xs uppercase tracking-wide text-amber-300 font-semibold">
        {title}
      </h3>
      {children}
    </section>
  );
}
function NpcPanel({
  campaignId,
  npcs,
  gmActions,
}: {
  campaignId: string;
  npcs: any[];
  gmActions: GMActionProps;
}) {
  return (
    <div className="space-y-3">
      <SectionCard title="New NPC">
        <form action={gmActions.createNpc} className="space-y-2 text-xs">
          <input type="hidden" name="campaignId" value={campaignId} />
          <div className="flex gap-2">
            <input
              name="name"
              placeholder="Name"
              className="w-1/2 rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/80"
              required
            />
            <input
              name="role"
              placeholder="Role (Innkeeper, Villain...)"
              className="w-1/2 rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/80"
            />
          </div>
          <textarea
            name="description"
            placeholder="Notes / disposition"
            rows={2}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/80"
          />
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center rounded-md bg-amber-600/90 hover:bg-amber-500 text-xs font-semibold text-slate-950 py-1.5 transition-colors"
          >
            Add NPC
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Known NPCs">
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {npcs.length === 0 && (
            <p className="text-xs text-slate-500 italic">No NPCs yet.</p>
          )}
          {npcs.map((npc) => (
            <details
              key={npc.id}
              className="rounded-lg border border-slate-800 bg-slate-900/70 p-2 text-xs"
            >
              <summary className="flex items-center justify-between cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-100">{npc.name}</span>
                  {npc.role && (
                    <span className="text-[11px] text-amber-200/90">
                      {npc.role}
                    </span>
                  )}
                  {(npc.description || npc.disposition) && (
                    <span className="text-[11px] text-slate-400 truncate">
                      {npc.description || npc.disposition}
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-wide text-slate-500">
                  Edit
                </span>
              </summary>

              <form action={gmActions.updateNpc} className="mt-2 space-y-2">
                <input type="hidden" name="campaignId" value={campaignId} />
                <input type="hidden" name="npcId" value={npc.id} />
                <input
                  name="name"
                  defaultValue={npc.name}
                  className="w-full rounded-md bg-slate-950/70 border border-slate-800 px-2 py-1 text-slate-100"
                  required
                />
                <input
                  name="role"
                  defaultValue={npc.role ?? ""}
                  className="w-full rounded-md bg-slate-950/70 border border-slate-800 px-2 py-1 text-slate-100"
                />
                <textarea
                  name="description"
                  defaultValue={npc.description ?? npc.disposition ?? ""}
                  rows={2}
                  className="w-full rounded-md bg-slate-950/70 border border-slate-800 px-2 py-1 text-slate-100"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-700"
                  >
                    Save
                  </button>
                  <button
                    formAction={gmActions.deleteNpc}
                    type="submit"
                    name="npcId"
                    value={npc.id}
                    className="flex-1 rounded-md bg-red-700 px-2 py-1 text-xs font-semibold text-red-50 hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </form>
            </details>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
function QuestPanel({
  campaignId,
  activeSessionId,
  quests,
  npcs,
  gmActions,
}: {
  campaignId: string;
  activeSessionId: string | null;
  quests: any[];
  npcs: any[];
  gmActions: GMActionProps;
}) {
  const statusOptions = ["PLANNED", "ACTIVE", "COMPLETED", "FAILED"];
  return (
    <div className="space-y-3">
      <SectionCard title="New Quest">
        <form action={gmActions.createQuest} className="space-y-2 text-xs">
          <input type="hidden" name="campaignId" value={campaignId} />
          <input
            name="title"
            placeholder="Quest title"
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/80"
            required
          />
          <div className="flex gap-2">
            <select
              name="status"
              defaultValue="PLANNED"
              className="w-1/2 rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500/80"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <select
              name="npcId"
              defaultValue=""
              className="w-1/2 rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100"
            >
              <option value="">Linked NPC (optional)</option>
              {npcs.map((npc) => (
                <option key={npc.id} value={npc.id}>
                  {npc.name}
                </option>
              ))}
            </select>
          </div>
          <textarea
            name="summary"
            placeholder="Summary / hook"
            rows={2}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/80"
          />
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center rounded-md bg-amber-600/90 hover:bg-amber-500 text-xs font-semibold text-slate-950 py-1.5 transition-colors"
          >
            Add Quest
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Quests">
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {quests.length === 0 && (
            <p className="text-xs text-slate-500 italic">No quests yet.</p>
          )}
          {quests.map((quest) => (
            <details
              key={quest.id}
              className="rounded-lg border border-slate-800 bg-slate-900/70 p-2 text-xs"
            >
              <summary className="flex items-start justify-between cursor-pointer gap-2">
                <div>
                  <div className="font-semibold text-slate-100">
                    {quest.title || "Untitled quest"}
                  </div>
                  {quest.summary && (
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {quest.summary}
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center rounded-full border border-slate-600/80 bg-slate-900/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200/90">
                  {quest.status || "UNKNOWN"}
                </span>
              </summary>

              <div className="mt-2 space-y-2">
                <form
                  action={gmActions.updateQuestStatus}
                  className="flex flex-wrap gap-1"
                >
                  <input type="hidden" name="campaignId" value={campaignId} />
                  <input type="hidden" name="questId" value={quest.id} />
                  {statusOptions.map((s) => (
                    <button
                      key={s}
                      type="submit"
                      name="status"
                      value={s}
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        s === quest.status
                          ? "bg-amber-600 text-slate-950"
                          : "bg-slate-800 text-slate-100 hover:bg-slate-700"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  {activeSessionId && (
                    <input type="hidden" name="sessionId" value={activeSessionId} />
                  )}
                </form>

                <form action={gmActions.updateQuest} className="space-y-2">
                  <input type="hidden" name="campaignId" value={campaignId} />
                  <input type="hidden" name="questId" value={quest.id} />
                  <input
                    name="title"
                    defaultValue={quest.title}
                    className="w-full rounded-md bg-slate-950/70 border border-slate-800 px-2 py-1 text-slate-100"
                    required
                  />
                  <textarea
                    name="summary"
                    defaultValue={quest.summary ?? ""}
                    rows={2}
                    className="w-full rounded-md bg-slate-950/70 border border-slate-800 px-2 py-1 text-slate-100"
                  />
                  <select
                    name="status"
                    defaultValue={quest.status}
                    className="w-full rounded-md bg-slate-950/70 border border-slate-800 px-2 py-1 text-slate-100"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-700"
                    >
                      Save
                    </button>
                    <button
                      formAction={gmActions.deleteQuest}
                      type="submit"
                      name="questId"
                      value={quest.id}
                      className="flex-1 rounded-md bg-red-700 px-2 py-1 text-xs font-semibold text-red-50 hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </form>
              </div>
            </details>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
function NotesPanel({
  campaignId,
  activeSessionId,
  gmNotes,
  npcs,
  quests,
  sessions,
  gmActions,
}: {
  campaignId: string;
  activeSessionId: string | null;
  gmNotes: any[];
  npcs: any[];
  quests: any[];
  sessions: any[];
  gmActions: GMActionProps;
}) {
  return (
    <div className="space-y-3">
      <SectionCard title="New Note">
        <form action={gmActions.createNote} className="space-y-2 text-xs">
          <input type="hidden" name="campaignId" value={campaignId} />
          <input
            name="title"
            placeholder="Title"
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/80"
            required
          />
          <textarea
            name="body"
            placeholder="Secrets, rulings, hooks..."
            rows={3}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/80"
            required
          />
          <select
            name="sessionId"
            defaultValue={activeSessionId ?? ""}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100"
          >
            <option value="">Link: none</option>
            {activeSessionId && (
              <option value={activeSessionId}>This session</option>
            )}
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                Session: {s.title ?? "Session"}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <select
              name="npcId"
              defaultValue=""
              className="w-1/2 rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100"
            >
              <option value="">Link NPC (optional)</option>
              {npcs.map((npc) => (
                <option key={npc.id} value={npc.id}>
                  {npc.name}
                </option>
              ))}
            </select>
            <select
              name="questId"
              defaultValue=""
              className="w-1/2 rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100"
            >
              <option value="">Link Quest (optional)</option>
              {quests.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center rounded-md bg-amber-600/90 hover:bg-amber-500 text-xs font-semibold text-slate-950 py-1.5 transition-colors"
          >
            Add Note
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Notes">
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {gmNotes.length === 0 && (
            <p className="text-xs text-slate-500 italic">No notes yet.</p>
          )}
          {gmNotes
            .slice()
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .map((note) => (
              <details
                key={note.id}
                className="rounded-lg border border-slate-800 bg-slate-900/70 p-2 text-xs"
              >
                <summary className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-100">
                      {note.title || "Note"}
                    </span>
                    {note.body && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {note.body}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 text-[10px] text-amber-200">
                    {note.sessionId && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800">
                        Session
                      </span>
                    )}
                    {note.npcId && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800">
                        NPC
                      </span>
                    )}
                    {note.questId && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800">
                        Quest
                      </span>
                    )}
                  </div>
                </summary>

                <form action={gmActions.updateNote} className="mt-2 space-y-2">
                  <input type="hidden" name="campaignId" value={campaignId} />
                  <input type="hidden" name="noteId" value={note.id} />
                  <input
                    name="title"
                    defaultValue={note.title ?? ""}
                    className="w-full rounded-md bg-slate-950/70 border border-slate-800 px-2 py-1 text-slate-100"
                    required
                  />
                  <textarea
                    name="body"
                    defaultValue={note.body ?? ""}
                    rows={3}
                    className="w-full rounded-md bg-slate-950/70 border border-slate-800 px-2 py-1 text-slate-100"
                    required
                  />
                  <div className="flex gap-2">
                    <select
                      name="sessionId"
                      defaultValue={note.sessionId ?? ""}
                      className="w-1/3 rounded-md bg-slate-950/70 border border-slate-800 px-2 py-1 text-slate-100"
                    >
                      <option value="">No session</option>
                      {sessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title ?? "Session"}
                        </option>
                      ))}
                    </select>
                    <select
                      name="npcId"
                      defaultValue={note.npcId ?? ""}
                      className="w-1/3 rounded-md bg-slate-950/70 border border-slate-800 px-2 py-1 text-slate-100"
                    >
                      <option value="">No NPC</option>
                      {npcs.map((npc) => (
                        <option key={npc.id} value={npc.id}>
                          {npc.name}
                        </option>
                      ))}
                    </select>
                    <select
                      name="questId"
                      defaultValue={note.questId ?? ""}
                      className="w-1/3 rounded-md bg-slate-950/70 border border-slate-800 px-2 py-1 text-slate-100"
                    >
                      <option value="">No quest</option>
                      {quests.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-700"
                    >
                      Save
                    </button>
                    <button
                      formAction={gmActions.deleteNote}
                      type="submit"
                      name="noteId"
                      value={note.id}
                      className="flex-1 rounded-md bg-red-700 px-2 py-1 text-xs font-semibold text-red-50 hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </form>
              </details>
            ))}
        </div>
      </SectionCard>
    </div>
  );
}
function DowntimePanel({
  campaignId,
  activeSessionId,
  activities,
  partyMembers,
  finishedDowntime,
  gmActions,
}: {
  campaignId: string;
  activeSessionId: string | null;
  activities: any[];
  partyMembers: any[];
  finishedDowntime: any[];
  gmActions: GMActionProps;
}) {
  return (
    <div className="space-y-3">
      <SectionCard title="New Activity">
        <form action={gmActions.createDowntime} className="space-y-2 text-xs">
          <input type="hidden" name="campaignId" value={campaignId} />
          {activeSessionId && (
            <input type="hidden" name="sessionId" value={activeSessionId} />
          )}
          <select
            name="characterId"
            defaultValue=""
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100"
            required
          >
            <option value="" disabled>
              Choose character
            </option>
            {partyMembers.map((p) =>
              p.character ? (
                <option key={p.id} value={p.character.id}>
                  {p.character.name}
                </option>
              ) : null
            )}
          </select>
          <input
            name="name"
            placeholder="Activity title"
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/80"
            required
          />
          <div className="flex gap-2">
            <input
              name="goal"
              placeholder="Goal (e.g. 10 days)"
              className="w-1/2 rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100 placeholder:text-slate-500"
            />
            <input
              name="description"
              placeholder="What are they doing?"
              className="w-1/2 rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center rounded-md bg-amber-600/90 hover:bg-amber-500 text-xs font-semibold text-slate-950 py-1.5 transition-colors"
          >
            Add Activity
          </button>
        </form>
      </SectionCard>
      <SectionCard title="Ongoing">
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {activities.filter(
            (a) => a.status !== "COMPLETED" && a.status !== "CANCELLED"
          ).length === 0 && (
            <p className="text-xs text-slate-500 italic">
              No ongoing activities.
            </p>
          )}
          {activities
            .filter((a) => a.status !== "COMPLETED" && a.status !== "CANCELLED")
            .map((activity) => (
              <div
                key={activity.id}
                className="rounded-lg border border-slate-800 bg-slate-900/70 p-2 text-xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-100">
                      {activity.name ?? activity.title}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {activity.character?.name ?? "Unknown"} • Progress: {activity.progress ?? 0}
                      {activity.goal ? ` / ${activity.goal}` : ""}
                    </p>
                    {activity.description && (
                      <p className="text-[11px] text-slate-300">
                        {activity.description}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-amber-200">
                    {activity.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <form
                    action={gmActions.advanceDowntime}
                    className="flex items-center gap-1"
                  >
                    <input type="hidden" name="campaignId" value={campaignId} />
                    <input type="hidden" name="activityId" value={activity.id} />
                    {activeSessionId && (
                      <input
                        type="hidden"
                        name="sessionId"
                        value={activeSessionId}
                      />
                    )}
                    <input
                      name="amount"
                      type="number"
                      min="1"
                      placeholder="+1"
                      className="w-16 rounded-md bg-slate-950/70 border border-slate-800 px-2 py-1 text-[11px] text-slate-100"
                    />
                    <button
                      type="submit"
                      className="rounded-md bg-slate-800 px-2 py-1 text-[11px] text-slate-100 hover:bg-slate-700"
                    >
                      Advance
                    </button>
                  </form>
                  <form action={gmActions.completeDowntime}>
                    <input type="hidden" name="campaignId" value={campaignId} />
                    <input type="hidden" name="activityId" value={activity.id} />
                    {activeSessionId && (
                      <input
                        type="hidden"
                        name="sessionId"
                        value={activeSessionId}
                      />
                    )}
                    <button
                      type="submit"
                      className="rounded-md bg-emerald-700 px-2 py-1 text-[11px] text-emerald-50 hover:bg-emerald-600"
                    >
                      Complete
                    </button>
                  </form>
                  <form action={gmActions.cancelDowntime}>
                    <input type="hidden" name="campaignId" value={campaignId} />
                    <input type="hidden" name="activityId" value={activity.id} />
                    {activeSessionId && (
                      <input
                        type="hidden"
                        name="sessionId"
                        value={activeSessionId}
                      />
                    )}
                    <button
                      type="submit"
                      className="rounded-md bg-red-700 px-2 py-1 text-[11px] text-red-50 hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              </div>
            ))}
        </div>
      </SectionCard>
      <SectionCard title="Completed / Cancelled">
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {finishedDowntime.length === 0 && (
            <p className="text-xs text-slate-500 italic">Nothing yet.</p>
          )}
          {finishedDowntime.map((activity) => (
            <div
              key={activity.id}
              className="rounded-lg border border-slate-800 bg-slate-900/70 p-2 text-[11px] flex items-center justify-between"
            >
              <div>
                <div className="text-slate-100">
                  {activity.name ?? activity.title}
                </div>
                <div className="text-slate-400">
                  {activity.character?.name ?? "Unknown"}
                </div>
              </div>
              <span className="text-xs text-slate-400 capitalize">
                {activity.status?.toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
function AiPanel({
  runAi,
  aiPending,
  aiResult,
  gmActions,
}: {
  runAi: (action: (fd: FormData) => Promise<string>) => void;
  aiPending: boolean;
  aiResult: string;
  gmActions: GMActionProps;
}) {
  return (
    <div className="space-y-3">
      <SectionCard title="Crystal Archive">
        <p className="text-xs text-slate-300/80">
          Quick summaries and hooks based on your sessions, quests, and party.
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
        <div className="min-h-[120px] max-h-48 overflow-y-auto rounded-md border border-amber-600/40 bg-slate-950/70 p-2 text-slate-100 whitespace-pre-wrap mt-2">
          {aiPending ? "Consulting the spirits..." : aiResult || "No AI output yet."}
        </div>
      </SectionCard>
    </div>
  );
}


