import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { updateCharacter } from "../actions";

type CharacterEditPageParams = {
  id?: string | string[] | undefined;
};

type CharacterEditPageProps = {
  params?: Promise<CharacterEditPageParams>;
  searchParams?: Promise<any>;
};

export default async function CharacterEditPage({ params }: CharacterEditPageProps) {
  const resolvedParams = await params;
  const rawId = resolvedParams?.id;
  const resolvedId =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
      ? rawId[0]
      : undefined;
  if (!resolvedId) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    notFound();
  }

  const character = await prisma.character.findFirst({
    where: {
      id: resolvedId,
      OR: [
        { createdById: user.id ?? undefined },
        { ownerEmail: user.email ?? undefined },
      ],
    },
  });

  if (!character || character.isArchived) {
    notFound();
  }

  const core = (character as any).coreJson ?? {};
  const appearance = (character as any).appearanceJson ?? {};

  return (
    <main className="min-h-screen bg-slate-950 text-amber-50">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-400/70">Edit Character</p>
          <h1 className="text-3xl font-semibold text-amber-100">{character.name}</h1>
          <p className="text-sm text-slate-400">
            Update identity and appearance details for this hero.
          </p>
        </div>

        <form action={updateCharacter} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm shadow-lg shadow-black/40">
          <input type="hidden" name="characterId" value={character.id} />

          <label className="block space-y-1 text-xs text-slate-300">
            Name
            <input
              name="name"
              defaultValue={character.name}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>

          <label className="block space-y-1 text-xs text-slate-300">
            System
            <input
              name="system"
              defaultValue={(character as any).system ?? ""}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>

          <label className="block space-y-1 text-xs text-slate-300">
            Class / Role
            <input
              name="class"
              defaultValue={(character as any).class ?? core?.identity?.className ?? ""}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>

          <label className="block space-y-1 text-xs text-slate-300">
            Portrait URL
            <input
              name="avatarUrl"
              defaultValue={character.avatarUrl ?? ""}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-xs text-slate-300">
              Primary Color
              <input
                name="primaryColor"
                defaultValue={appearance?.primaryColor ?? ""}
                type="color"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-1 py-1"
              />
            </label>
            <label className="space-y-1 text-xs text-slate-300">
              Accent Color
              <input
                name="accentColor"
                defaultValue={appearance?.accentColor ?? ""}
                type="color"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-1 py-1"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-xs text-slate-300">
              Vibe
              <select
                name="vibe"
                defaultValue={appearance?.vibe ?? ""}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-100"
              >
                <option value="">Choose</option>
                <option value="heroic">Heroic</option>
                <option value="mysterious">Mysterious</option>
                <option value="chaotic">Chaotic</option>
                <option value="serene">Serene</option>
              </select>
            </label>
            <label className="space-y-1 text-xs text-slate-300">
              Pose
              <select
                name="pose"
                defaultValue={appearance?.pose ?? ""}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-100"
              >
                <option value="">Choose</option>
                <option value="idle">Idle</option>
                <option value="casting">Casting</option>
                <option value="ready">Ready</option>
                <option value="resting">Resting</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-md border border-amber-600/70 bg-amber-600/20 px-4 py-2 text-xs font-semibold text-amber-100 hover:bg-amber-500/20"
          >
            Save Changes
          </button>
        </form>

        <Link
          href={`/characters/${character.id}`}
          className="inline-flex text-xs text-amber-200 hover:text-amber-100"
        >
          ← Back to character
        </Link>
      </div>
    </main>
  );
}
