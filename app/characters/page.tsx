import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CharactersPage() {
  const characters = await prisma.character.findMany({
    where: { isArchived: false },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen p-6 text-amber-100 bg-black">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Your Characters</h1>
          <p className="text-sm opacity-70">All heroes saved in your tavern.</p>
        </div>
        <Link
          href="/characters/new"
          className="px-3 py-2 text-sm bg-amber-600 hover:bg-amber-500 font-semibold rounded-md"
        >
          + Create Character
        </Link>
      </div>

      {characters.length === 0 ? (
        <p className="text-sm opacity-70">No characters yet. Create one to get started.</p>
      ) : (
        <div className="space-y-3">
          {characters.map((c) => {
            const stats: string[] = [];
            if (c.hp) stats.push(`HP ${c.hp}`);
            if (c.ac != null) stats.push(`AC ${c.ac}`);
            if (c.speed) stats.push(c.speed);
            return (
              <Link
                key={c.id}
                href={`/characters/${c.id}`}
                className="block p-3 border border-amber-700/50 rounded-lg hover:bg-amber-900/20 transition"
              >
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs opacity-70">{c.subtitle || "Adventurer"}</div>
                <div className="text-xs opacity-70">
                  {stats.length > 0 ? stats.join(" | ") : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
