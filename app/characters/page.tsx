import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function createCharacter(formData: FormData) {
  "use server";

  const name = formData.get("name")?.toString().trim();
  const system = formData.get("system")?.toString().trim() || "dnd5e";
  const portraitUrl = formData.get("portraitUrl")?.toString().trim() || "";
  const className = formData.get("className")?.toString().trim() || "";
  const ancestry = formData.get("ancestry")?.toString().trim() || "";
  const background = formData.get("background")?.toString().trim() || "";
  const skills = formData.get("skills")?.toString().trim() || "";
  const equipment = formData.get("equipment")?.toString().trim() || "";
  const armorProfs = formData.get("armorProfs")?.toString().trim() || "";
  const weaponProfs = formData.get("weaponProfs")?.toString().trim() || "";
  const toolProfs = formData.get("toolProfs")?.toString().trim() || "";
  const languageProfs = formData.get("languageProfs")?.toString().trim() || "";
  const otherProfs = formData.get("otherProfs")?.toString().trim() || "";
  const isCaster = formData.get("isCaster") === "on";
  const spells = formData.get("spells")?.toString().trim() || "";

  const num = (key: string) => {
    const v = formData.get(key)?.toString();
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const level = num("level");
  const xp = num("xp");
  const maxHp = num("maxHp");
  const currentHp = num("currentHp");
  const armorClass = num("armorClass");
  const initiative = num("initiative");
  const speed = num("speed");
  const str = num("str");
  const dex = num("dex");
  const con = num("con");
  const int = num("int");
  const wis = num("wis");
  const cha = num("cha");

  if (!name) {
    redirect("/characters");
  }

  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        authUserId: "demo-user",
        displayName: "Demo User",
      },
    });
  }

  await prisma.character.create({
    data: {
      name,
      system,
      portraitUrl: portraitUrl || undefined,
      userId: user.id,
      coreJson: {
        className,
        ancestry,
        background,
        level,
        xp,
        hp: {
          max: maxHp,
          current: currentHp,
        },
        combat: {
          armorClass,
          initiative,
          speed,
        },
        abilities: {
          str,
          dex,
          con,
          int,
          wis,
          cha,
        },
        skills,
        equipment,
        proficiencies: {
          armor: armorProfs || undefined,
          weapons: weaponProfs || undefined,
          tools: toolProfs || undefined,
          languages: languageProfs || undefined,
          other: otherProfs || undefined,
        },
        spellcasting: {
          isCaster,
          spells: spells || undefined,
        },
      },
    },
  });

  revalidatePath("/characters");
  redirect("/characters");
}

export default async function CharactersPage() {
  const characters = await prisma.character.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="min-h-screen p-6 text-amber-100 bg-black">
      <h1 className="text-2xl font-semibold mb-4">Your Characters</h1>

      {characters.length === 0 ? (
        <p className="text-sm opacity-70 mb-4">
          No characters yet. The tavern’s upstairs rooms are empty.
        </p>
      ) : (
        <div className="space-y-3 mb-6">
          {characters.map((c) => (
            <Link
              key={c.id}
              href={`/characters/${c.id}`}
              className="block p-3 border border-amber-700/50 rounded-lg hover:bg-amber-900/20 transition"
            >
              <div className="text-sm font-medium">{c.name}</div>
              <div className="text-xs opacity-70">
                {c.system || "Unknown system"}
              </div>
            </Link>
          ))}
        </div>
      )}

      <section className="mt-4 max-w-2xl border border-amber-700/40 rounded-lg p-4 bg-amber-900/10 space-y-3">
        <h2 className="text-sm font-semibold mb-2">Create a new character</h2>
        <form action={createCharacter} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-xs opacity-80">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
              placeholder="Kael the Wanderer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="equipment" className="text-xs opacity-80">
              Equipment
            </label>
            <textarea
              id="equipment"
              name="equipment"
              rows={3}
              className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
              placeholder="Starting gear, loot, consumables..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="system" className="text-xs opacity-80">
                System
              </label>
              <input
                id="system"
                name="system"
                defaultValue="dnd5e"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="portraitUrl" className="text-xs opacity-80">
                Portrait URL (optional)
              </label>
              <input
                id="portraitUrl"
                name="portraitUrl"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="className" className="text-xs opacity-80">
                Class
              </label>
              <input
                id="className"
                name="className"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="Fighter"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="ancestry" className="text-xs opacity-80">
                Ancestry / Race
              </label>
              <input
                id="ancestry"
                name="ancestry"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="Human"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="background" className="text-xs opacity-80">
              Background
            </label>
            <input
              id="background"
              name="background"
              className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
              placeholder="Sailor"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="level" className="text-xs opacity-80">
                Level
              </label>
              <input
                id="level"
                name="level"
                type="number"
                min="1"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="xp" className="text-xs opacity-80">
                XP
              </label>
              <input
                id="xp"
                name="xp"
                type="number"
                min="0"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="maxHp" className="text-xs opacity-80">
                Max HP
              </label>
              <input
                id="maxHp"
                name="maxHp"
                type="number"
                min="0"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="12"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="currentHp" className="text-xs opacity-80">
                Current HP
              </label>
              <input
                id="currentHp"
                name="currentHp"
                type="number"
                min="0"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="12"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              ["str", "STR"],
              ["dex", "DEX"],
              ["con", "CON"],
              ["int", "INT"],
              ["wis", "WIS"],
              ["cha", "CHA"],
            ].map(([id, label]) => (
              <div key={id} className="flex flex-col gap-1">
                <label htmlFor={id} className="text-xs opacity-80">
                  {label}
                </label>
                <input
                  id={id}
                  name={id}
                  type="number"
                  className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                  placeholder="10"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="skills" className="text-xs opacity-80">
              Skills / Notes
            </label>
            <textarea
                id="skills"
                name="skills"
                rows={3}
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
              placeholder="Stealth +5, Perception +3..."
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="level" className="text-xs opacity-80">
                Level
              </label>
              <input
                id="level"
                name="level"
                type="number"
                min="1"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="xp" className="text-xs opacity-80">
                XP
              </label>
              <input
                id="xp"
                name="xp"
                type="number"
                min="0"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="maxHp" className="text-xs opacity-80">
                Max HP
              </label>
              <input
                id="maxHp"
                name="maxHp"
                type="number"
                min="0"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="12"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="currentHp" className="text-xs opacity-80">
                Current HP
              </label>
              <input
                id="currentHp"
                name="currentHp"
                type="number"
                min="0"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="12"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="armorClass" className="text-xs opacity-80">
                Armor Class
              </label>
              <input
                id="armorClass"
                name="armorClass"
                type="number"
                min="0"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="15"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="initiative" className="text-xs opacity-80">
                Initiative
              </label>
              <input
                id="initiative"
                name="initiative"
                type="number"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="+2"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="speed" className="text-xs opacity-80">
                Speed
              </label>
              <input
                id="speed"
                name="speed"
                type="number"
                min="0"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="armorProfs" className="text-xs opacity-80">
                Armor Proficiencies
              </label>
              <input
                id="armorProfs"
                name="armorProfs"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="Light, Medium..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="weaponProfs" className="text-xs opacity-80">
                Weapon Proficiencies
              </label>
              <input
                id="weaponProfs"
                name="weaponProfs"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="Simple, Martial..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="toolProfs" className="text-xs opacity-80">
                Tool Proficiencies
              </label>
              <input
                id="toolProfs"
                name="toolProfs"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="Thieves' tools, gaming sets..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="languageProfs" className="text-xs opacity-80">
                Languages
              </label>
              <input
                id="languageProfs"
                name="languageProfs"
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus-border-amber-400"
                placeholder="Common, Elvish..."
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label htmlFor="otherProfs" className="text-xs opacity-80">
                Other Proficiencies / Notes
              </label>
              <textarea
                id="otherProfs"
                name="otherProfs"
                rows={2}
                className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
                placeholder="Vehicles, instruments, misc."
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs opacity-80">
              <input
                type="checkbox"
                name="isCaster"
                className="h-4 w-4 accent-amber-500"
              />
              Spellcaster
            </label>
            <textarea
              id="spells"
              name="spells"
              rows={3}
              className="px-2 py-1 text-sm rounded-md bg-black border border-amber-700/60 outline-none focus:border-amber-400"
              placeholder="Spell list, slots, prepared spells..."
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-500 font-semibold rounded-md"
          >
            Create Character
          </button>
        </form>
      </section>
    </main>
  );
}
