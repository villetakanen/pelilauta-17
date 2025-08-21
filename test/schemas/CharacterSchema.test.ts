import { describe, expect, it } from 'vitest';
import { CharacterSchema } from '../../src/schemas/CharacterSchema';

describe('CharacterSchema', () => {
  const basicCharacter = {
    key: 'char-123',
    name: 'Aragorn',
    description: 'Heir of Isildur',
    avatar: 'https://example.com/aragorn.png',
    owners: ['user-1'],
  };

  it('should validate a basic character without a sheet', () => {
    const result = CharacterSchema.safeParse(basicCharacter);
    expect(result.success).toBe(true);
  });

  it('should validate a character with only the required fields', () => {
    const minimalCharacter = {
      name: 'Legolas',
      owners: [],
    };
    const result = CharacterSchema.safeParse(minimalCharacter);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.owners).toEqual([]);
    }
  });

  it('should validate a character with an embedded sheet', () => {
    const characterWithSheet = {
      ...basicCharacter,
      sheet: {
        key: 'dnd5e-fighter',
        name: 'D&D 5e Fighter',
        system: 'dnd5e',
        stats: [
          { type: 'number', key: 'strength', value: 16 },
          { type: 'toggled', key: 'second_wind_used', value: false },
        ],
      },
    };
    const result = CharacterSchema.safeParse(characterWithSheet);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sheet?.stats.length).toBe(2);
    }
  });

  it('should fail if the name is empty', () => {
    const invalidCharacter = { ...basicCharacter, name: '' };
    const result = CharacterSchema.safeParse(invalidCharacter);
    expect(result.success).toBe(false);
  });

  it('should fail if the avatar URL is invalid', () => {
    const invalidCharacter = { ...basicCharacter, avatar: 'not-a-url' };
    const result = CharacterSchema.safeParse(invalidCharacter);
    expect(result.success).toBe(false);
  });

  it('should fail if the embedded sheet is invalid', () => {
    const characterWithInvalidSheet = {
      ...basicCharacter,
      sheet: {
        // Missing required 'key', 'name', and 'system' fields
        stats: [],
      },
    };
    const result = CharacterSchema.safeParse(characterWithInvalidSheet);
    expect(result.success).toBe(false);
  });
});
