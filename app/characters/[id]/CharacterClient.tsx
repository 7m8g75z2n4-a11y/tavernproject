"use client";

import { CharacterRoom3D } from "@/components/characters/CharacterRoom3D";

type CharacterClientProps = {
  character: {
    id: string;
    name: string;
    // extend with your real fields (system, stats, etc.)
  };
};

export default function CharacterClient({ character }: CharacterClientProps) {
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)]">
      <div>
        <h1 className="text-xl font-semibold">{character.name}</h1>
        {/* TODO: render stats / tabs / biography here */}
      </div>

      <CharacterRoom3D name={character.name} />
    </div>
  );
}
