// lib/data.ts

// === Types ===

export type AbilityScores = {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
};

export type Character = {
  id: string;
  name: string;
  subtitle: string;
  hp: string;
  ac: number;
  speed: string;
  stats: AbilityScores;
  features: string[];
  inventory: string[];
  notes: string;
};

export type CampaignPartyMember = {
  id: string;
  name: string;
  role: string;
  level: string;
};

export type Campaign = {
  id: string;
  name: string;
  gm: string;
  partyLink: string;
  party: CampaignPartyMember[];
};

export type Session = {
  id: string;
  title: string;
  date: string;
  partyName: string;
};

// === Mock Data ===

export const characters: Character[] = [
  {
    id: "1",
    name: "Elira Dawnwhisper",
    subtitle: "Elf Ranger • Level 5",
    hp: "38 / 38",
    ac: 15,
    speed: "30 ft",
    stats: {
      STR: 10,
      DEX: 18,
      CON: 14,
      INT: 12,
      WIS: 16,
      CHA: 11,
    },
    features: ["Favored Foe", "Sharpshooter", "Natural Explorer"],
    inventory: ["Longbow", "Shortswords (2)", "Traveler’s Cloak", "Healing Potion (x2)"],
    notes: "Scout and archer of the party. Distrustful of cities, prefers the treeline.",
  },
  {
    id: "2",
    name: "Brother Hal",
    subtitle: "Human Cleric • Level 3",
    hp: "24 / 24",
    ac: 17,
    speed: "30 ft",
    stats: {
      STR: 12,
      DEX: 10,
      CON: 14,
      INT: 11,
      WIS: 16,
      CHA: 13,
    },
    features: ["Channel Divinity", "Turn Undead", "Blessings of the Sun"],
    inventory: ["Mace", "Shield with Sunburst", "Holy Symbol", "Healing Kit"],
    notes: "Soft-spoken, but unshakeable in the face of darkness. Keeps meticulous notes.",
  },
];

export const charactersById: Record<string, Character> = Object.fromEntries(
  characters.map((c) => [c.id, c])
);

export const campaigns: Campaign[] = [
  {
    id: "1",
    name: "Curse of Strahd",
    gm: "GM Thomas",
    partyLink: "https://tavern.app/join/curse-of-strahd-demo",
    party: [
      { id: "1", name: "Kael", role: "Race Sorcerer", level: "Level 5" },
      { id: "2", name: "Rhea", role: "Ranger", level: "Level 3" },
      { id: "3", name: "Thalia", role: "Elf Cleric", level: "Level 3" },
      { id: "4", name: "Brennar", role: "Paladin", level: "Level 4" },
    ],
  },
];

export const campaignsById: Record<string, Campaign> = Object.fromEntries(
  campaigns.map((c) => [c.id, c])
);

export const sessions: Session[] = [
  {
    id: "1",
    title: "Session 7: The Emberfall Heist",
    date: "Last played: 12 Rainfall",
    partyName: "The Emberfall Company",
  },
];

export const sessionsById: Record<string, Session> = Object.fromEntries(
  sessions.map((s) => [s.id, s])
);
