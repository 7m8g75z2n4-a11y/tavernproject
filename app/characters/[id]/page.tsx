import CharacterSheetClient from "./CharacterSheetClient";
import { Character3DPreview } from "@/components/characters/Character3DPreview";
import { TavernButton } from "@/components/ui/TavernButton";
import { TavernCard } from "@/components/ui/TavernCard";
import { PageShell, SectionGroup } from "@/components/ui/Page";
import { SectionHeader } from "@/components/ui/Section";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { archiveCharacter, deleteCharacter } from "./actions";

type CharacterPageParams = {
  id?: string | string[] | undefined;
};

type CharacterPageProps = {
  params?: Promise<CharacterPageParams>;
  searchParams?: Promise<any>;
};

function NotFoundCard({
  id,
  options = [],
}: {
  id?: string;
  options?: { id: string; name: string }[];
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-center text-slate-200">
        <p className="text-lg font-semibold text-amber-200">Character not found.</p>
        {id && (
          <p className="mt-2 text-sm text-slate-400">
            Tried to load <span className="font-mono text-amber-200">{id}</span>
          </p>
        )}
        {options.length > 0 && (
          <div className="mt-4 space-y-2 text-sm text-slate-400">
            <p>Known characters in this world:</p>
            <ul className="space-y-1 text-left">
              {options.map((opt) => (
                <li key={opt.id}>
                  <Link
                    href={`/characters/${opt.id}`}
                    className="text-amber-200 hover:text-amber-100"
                  >
                    {opt.name} · {opt.id}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link
          href="/dashboard"
          className="mt-4 inline-flex rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:border-amber-400"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

export default async function CharacterPage({ params }: CharacterPageProps) {
  const resolvedParams = await params;
  const rawIdValue = resolvedParams?.id;
  const rawId =
    typeof rawIdValue === "string"
      ? rawIdValue
      : Array.isArray(rawIdValue)
      ? rawIdValue[0]
      : undefined;

  if (!rawId) {
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
    <PageShell className="pt-6 pb-12">
      <SectionHeader
        title={identity.name}
        subtitle={`${identity.className} · Level ${identity.level}`}
        breadcrumb="Character"
        actions={
          <Link href="/dashboard">
            <TavernButton variant="secondary">Back to dashboard</TavernButton>
          </Link>
        }
      />

      <SectionGroup>
        <div className="grid gap-6 lg:grid-cols-[1fr,1.4fr]">
          <div className="space-y-4">
            <TavernCard
              title="Portrait"
              actions={
                <Link href={`/characters/${character.id}/edit`}>
                  <TavernButton variant="ghost">Edit character</TavernButton>
                </Link>
              }
            >
              <Character3DPreview identity={identity} appearanceJson={appearance} />
            </TavernCard>

            <TavernCard title="Actions">
              <form action={archiveCharacter} className="space-y-3 text-sm">
                <input type="hidden" name="characterId" value={character.id} />
                <label className="text-slate-400">
                  Confirmation text: <span className="font-mono text-amber-200">ARCHIVE</span>
                </label>
                <input
                  name="confirmation"
                  placeholder="ARCHIVE"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
                <TavernButton variant="primary" type="submit">
                  Archive Character
                </TavernButton>
              </form>
              <form action={deleteCharacter} className="space-y-3 text-sm">
                <input type="hidden" name="characterId" value={character.id} />
                <label className="text-[11px] text-rose-300">
                  Type the character name to delete permanently
                </label>
                <input
                  name="confirmation"
                  placeholder={character.name}
                  className="w-full rounded-xl border border-rose-500/50 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
                <TavernButton variant="danger" type="submit">
                  Delete Character
                </TavernButton>
              </form>
            </TavernCard>
          </div>

          <TavernCard>
            <CharacterSheetClient character={character} />
          </TavernCard>
        </div>
      </SectionGroup>
    </PageShell>
  );
}
