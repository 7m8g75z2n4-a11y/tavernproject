import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface NewSessionPageProps {
  params: { id: string };
}

async function createSession(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect("/auth");
  }

  const campaignId = formData.get("campaignId")?.toString() || "";
  const title = formData.get("title")?.toString() || "";
  const dateStr = formData.get("date")?.toString();
  const summary = formData.get("summary")?.toString() || "";
  const notes = formData.get("notes")?.toString() || "";

  if (!campaignId || !title) {
    throw new Error("Missing campaignId or title");
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ownerEmail: email },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  const date = dateStr ? new Date(dateStr) : new Date();

  const created = await prisma.session.create({
    data: {
      title,
      date,
      sessionDate: date,
      summary: summary || null,
      notes: notes || null,
      campaignId,
      ownerEmail: email,
    },
  });

  redirect(`/sessions/${created.id}`);
}

export default async function NewSessionPage({ params }: NewSessionPageProps) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect("/auth");
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: params.id, ownerEmail: email },
  });

  if (!campaign) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-300">Campaign not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex justify-center px-4 py-10">
      <div className="w-full max-w-xl space-y-6">
        <header>
          <p className="text-xs uppercase tracking-wide text-amber-400/70 mb-1">
            New Session
          </p>
          <h1 className="text-2xl font-semibold text-amber-50">
            {campaign.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create a new session for this campaign.
          </p>
        </header>

        <form
          action={createSession}
          className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/90 shadow-xl shadow-black/60 p-5 space-y-4"
        >
          <input type="hidden" name="campaignId" value={campaign.id} />

          <div className="space-y-1.5">
            <label
              htmlFor="title"
              className="text-xs font-medium text-slate-200"
            >
              Session title
            </label>
            <input
              id="title"
              name="title"
              required
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/70"
              placeholder="e.g. Into the Barovian Mist"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="date"
              className="text-xs font-medium text-slate-200"
            >
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500/70"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="summary"
              className="text-xs font-medium text-slate-200"
            >
              Summary (what happened?)
            </label>
            <textarea
              id="summary"
              name="summary"
              rows={4}
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/70"
              placeholder="Write a short recap of the session..."
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="notes"
              className="text-xs font-medium text-slate-200"
            >
              GM Notes (private)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/70"
              placeholder="Prep notes, secrets, reminders..."
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition shadow-md shadow-amber-500/30"
          >
            Create session
          </button>
        </form>
      </div>
    </main>
  );
}
