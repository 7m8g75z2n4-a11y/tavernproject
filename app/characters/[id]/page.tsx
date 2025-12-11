import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CharacterSheetClient from "./CharacterSheetClient";
import { Character3DPreview } from "@/components/characters/Character3DPreview";
import {
  archiveCharacter,
  deleteCharacter,
} from "./actions";

type PageProps = {
  params: { id?: string } | Promise<{ id?: string }>;
};

function NotFoundCard({
  id,
  options = [],
}: {
  id?: string;
  options?: { id: string; name: string }[];
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold">Character not found.</p>
        {id && (
          <p className="text-sm text-slate-400">
            Tried to load id: <span className="text-amber-200 font-mono">{id}</span>
          </p>
        )}
        {options.length > 0 && (
          <div className="text-sm text-slate-400 space-y-2 max-w-lg mx-auto">
            <p className="text-center">Existing characters in this database:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-left">
              {options.map((opt) => (
                <li key={opt.id}>
                  <Link
                    href={`/characters/${opt.id}`}
                    className="text-amber-300 hover:text-amber-200 font-mono break-all"
                  >
                    {opt.name} ({opt.id})
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link
          href="/dashboard"
          className="text-sm text-amber-300 hover:text-amber-200 underline"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

export default async function CharacterPage({ params }: PageProps) {
  const resolvedParams = await params;
  const rawId = resolvedParams?.id;
  if (!rawId || typeof rawId !== "string") {
    const known = await prisma.character.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return <NotFoundCard id={rawId} options={known} />;
  }

  const character = await prisma.character.findUnique({
    where: { id: rawId },
  });

  if (!character) {
    const known = await prisma.character.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return <NotFoundCard id={rawId} options={known} />;
  }

  const core = (character as any).coreJson ?? {};
  const identity = {
    name: core?.identity?.name ?? character.name,
    ancestry: core?.identity?.ancestry ?? core?.identity?.race ?? "Unknown",
    className:
      core?.identity?.className ??
      core?.identity?.class ??
      (character as any).class ??
      "Adventurer",
    level: core?.identity?.level ?? (character as any).level ?? 1,
  };
  const appearance = (character as any).appearanceJson ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-amber-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <div className="lg:w-1/3 space-y-4">
          <Character3DPreview identity={identity} appearanceJson={appearance} />
          <div className="space-y-3 rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 text-sm text-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-amber-300">Actions</span>
              <Link
                href={`/characters/${character.id}/edit`}
                className="text-xs text-amber-300 underline underline-offset-2"
              >
                Edit Character
              </Link>
            </div>
            <form action={archiveCharacter} className="space-y-2 text-xs">
              <input type="hidden" name="characterId" value={character.id} />
              <label className="space-y-1 text-slate-400">
                Type <span className="font-mono text-amber-200">ARCHIVE</span> to confirm
              </label>
              <input
                name="confirmation"
                placeholder="ARCHIVE"
                className="w-full rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
              <button
                type="submit"
                className="w-full rounded-md border border-amber-600/70 bg-amber-600/20 px-3 py-1 text-xs font-semibold text-amber-100 hover:bg-amber-500/20"
              >
                Archive Character
              </button>
            </form>
            <form action={deleteCharacter} className="space-y-2 text-xs">
              <input type="hidden" name="characterId" value={character.id} />
              <label className="text-[11px] text-rose-300">
                Type the character name to permanently delete
              </label>
              <input
                name="confirmation"
                placeholder={character.name}
                className="w-full rounded-md border border-rose-500/40 bg-slate-950/70 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
              <button
                type="submit"
                className="w-full rounded-md border border-rose-500/70 bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-100 hover:bg-rose-500/40"
              >
                Delete Character
              </button>
            </form>
          </div>
        </div>
        <div className="lg:w-2/3 space-y-4">
          <CharacterSheetClient character={character} />
        </div>
      </div>
    </div>
  );
}
