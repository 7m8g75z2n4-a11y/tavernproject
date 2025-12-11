import type { SessionEvent, Session } from "@prisma/client";

type SessionEventInput = SessionEvent | { type?: string; data?: any; message?: string };

export function humanizeEvent(event: SessionEventInput): string {
  const type = event?.type;
  const data = (event as any)?.data ?? {};
  const message = (event as any)?.message ?? "";

  switch (type) {
    case "hp_change":
      if (data.delta != null) {
        return `HP ${data.delta > 0 ? "+" : ""}${data.delta}${
          data.current != null ? ` (now ${data.current})` : ""
        }`;
      }
      return message || "HP change";
    case "xp_gain":
    case "xp_change":
      if (data.amount != null) {
        return `Gained ${data.amount} XP${data.current != null ? ` (now ${data.current})` : ""}`;
      }
      return message || "XP change";
    case "condition_add":
      return `Gained condition: ${data.condition ?? message ?? "Unknown"}`;
    case "condition_remove":
      return `Removed condition: ${data.condition ?? message ?? "Unknown"}`;
    case "note":
      return data.text || message || "GM note";
    case "loot":
    case "loot_gain":
      return `Loot: ${data.item ?? message ?? "Unknown"}${data.amount ? ` x${data.amount}` : ""}`;
    case "quest_update":
      return `Quest update: ${data.title ?? "Unknown"} → ${data.status ?? "Updated"}`;
    case "downtime_start":
    case "downtime_create":
      return `Started downtime: ${data.title ?? "Activity"}`;
    case "downtime_advance":
      return `Advanced downtime: ${data.title ?? "Activity"} ${
        data.progress != null ? `(${data.progress})` : ""
      }`;
    case "downtime_complete":
      return `Completed downtime: ${data.title ?? "Activity"}`;
    case "downtime_cancel":
      return `Cancelled downtime: ${data.title ?? "Activity"}`;
    default:
      return message || type || "Event";
  }
}

export function pickSessionDate(session: Pick<Session, "sessionDate" | "date" | "createdAt">) {
  return session.sessionDate ?? session.date ?? session.createdAt;
}

export function formatSessionDateDisplay(session: Pick<Session, "sessionDate" | "date" | "createdAt">) {
  const date = pickSessionDate(session);
  if (!date) return "Unknown date";
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function sessionSummaryText(session: Session & { events?: SessionEvent[] }) {
  if (session.summary && session.summary.trim().length > 0) {
    return session.summary;
  }

  const fallback = session.events?.[0];
  if (fallback) {
    return humanizeEvent(fallback);
  }

  return "No recap yet.";
}
