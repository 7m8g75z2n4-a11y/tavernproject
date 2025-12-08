"use client";

import type { Character } from "./data";

const CHARACTERS_KEY = "tavern.characters";

export function loadCharactersFromStorage(): Character[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CHARACTERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Character[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCharactersToStorage(chars: Character[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHARACTERS_KEY, JSON.stringify(chars));
  } catch {
    // ignore storage errors
  }
}
