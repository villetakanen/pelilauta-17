/**
 * Static character sheet loader.
 *
 * Loads and validates character sheet definitions from static JSON files.
 * See: docs/ADR-001-static-character-sheets.md
 */

import {
  type CharacterSheet,
  CharacterSheetSchema,
} from '@schemas/CharacterSheetSchema';

import dnd5eBasic from './dnd5e-basic.json';
import homebrew from './homebrew.json';

// Raw sheets loaded from JSON
const rawSheets: Record<string, unknown> = {
  'dnd5e-basic': dnd5eBasic,
  homebrew: homebrew,
};

// Validated sheets cache
let validatedSheets: Map<string, CharacterSheet> | null = null;

/**
 * Lazily validates and caches all sheets.
 */
function getValidatedSheets(): Map<string, CharacterSheet> {
  if (validatedSheets) return validatedSheets;

  validatedSheets = new Map();
  for (const [key, raw] of Object.entries(rawSheets)) {
    try {
      const validated = CharacterSheetSchema.parse(raw);
      validatedSheets.set(key, validated);
    } catch (error) {
      console.error(`Failed to validate sheet "${key}":`, error);
    }
  }
  return validatedSheets;
}

/**
 * Get a character sheet by key.
 */
export function getSheet(key: string): CharacterSheet | undefined {
  return getValidatedSheets().get(key);
}

/**
 * Get all available character sheets.
 */
export function getAllSheets(): CharacterSheet[] {
  return Array.from(getValidatedSheets().values());
}

/**
 * Get all sheet keys.
 */
export function getSheetKeys(): string[] {
  return Array.from(getValidatedSheets().keys());
}

/**
 * Get sheets filtered by system.
 */
export function getSheetsBySystem(system: string): CharacterSheet[] {
  return getAllSheets().filter((sheet) => sheet.system === system);
}
