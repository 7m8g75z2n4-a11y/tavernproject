export type CoreCharacterData = {
  vibeTags?: string[];
  // Extend with class, ancestry, system, etc.
  [key: string]: unknown;
};

export type CharacterVisualConfig = {
  baseModel: "heroA" | "heroB" | "heroC";
  color: string;
  aura?: "arcane" | "holy" | "shadow";
};

export function mapCoreToVisual(core: CoreCharacterData): CharacterVisualConfig {
  const tags = core.vibeTags || [];

  if (tags.includes("arcane")) {
    return { baseModel: "heroA", color: "#b27cfb", aura: "arcane" };
  }

  if (tags.includes("holy")) {
    return { baseModel: "heroB", color: "#f7e59e", aura: "holy" };
  }

  return { baseModel: "heroC", color: "#d1d5db" };
}
