import { describe, expect, it } from 'vitest';
import {
  CharacterSheetSchema,
  CharacterStatSchema,
} from '../../src/schemas/CharacterSheetSchema';

describe('CharacterStatSchema', () => {
  it('should validate a number stat correctly', () => {
    const stat = {
      type: 'number',
      key: 'strength',
      value: 18,
      description: 'Physical might',
      group: 'Attributes',
    };
    const result = CharacterStatSchema.safeParse(stat);
    expect(result.success).toBe(true);
  });

  it('should use default value for a number stat if value is missing', () => {
    const stat = {
      type: 'number',
      key: 'dexterity',
    };
    const result = CharacterStatSchema.safeParse(stat);
    expect(result.success).toBe(true);
    if (result.success && result.data.type === 'number') {
      expect(result.data.value).toBe(0);
    }
  });

  it('should validate a toggled stat correctly', () => {
    const stat = {
      type: 'toggled',
      key: 'is_proficient',
      value: true,
      group: 'Skills',
    };
    const result = CharacterStatSchema.safeParse(stat);
    expect(result.success).toBe(true);
  });

  it('should use default value for a toggled stat if value is missing', () => {
    const stat = {
      type: 'toggled',
      key: 'has_advantage',
    };
    const result = CharacterStatSchema.safeParse(stat);
    expect(result.success).toBe(true);
    if (result.success && result.data.type === 'toggled') {
      expect(result.data.value).toBe(false);
    }
  });

  it('should validate a derived stat correctly', () => {
    const stat = {
      type: 'derived',
      key: 'strength_modifier',
      formula: 'floor((@strength - 10) / 2)',
      group: 'Modifiers',
    };
    const result = CharacterStatSchema.safeParse(stat);
    expect(result.success).toBe(true);
  });

  it('should fail validation if key is empty', () => {
    const stat = {
      type: 'number',
      key: '',
    };
    const result = CharacterStatSchema.safeParse(stat);
    expect(result.success).toBe(false);
  });

  it('should fail validation for an unknown type', () => {
    const stat = {
      type: 'text',
      key: 'name',
      value: 'John Doe',
    };
    const result = CharacterStatSchema.safeParse(stat);
    expect(result.success).toBe(false);
  });
});

describe('CharacterSheetSchema', () => {
  it('should validate a basic character sheet', () => {
    const sheet = {
      key: 'dnd5e-basic',
      name: 'D&D 5e Basic',
      system: 'dnd5e',
      stats: [
        { type: 'number', key: 'strength', value: 10 },
        { type: 'toggled', key: 'inspiration', value: false },
        {
          type: 'derived',
          key: 'proficiency_bonus',
          formula: 'ceil(1 + (@level / 4))',
        },
      ],
    };
    const result = CharacterSheetSchema.safeParse(sheet);
    expect(result.success).toBe(true);
  });

  it('should validate a character sheet with an empty stats array', () => {
    const sheet = {
      key: 'empty-sheet',
      name: 'Empty Sheet',
      system: 'generic',
      stats: [],
    };
    const result = CharacterSheetSchema.safeParse(sheet);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stats).toEqual([]);
    }
  });

  it('should fail if name is missing', () => {
    const sheet = {
      key: 'no-name-sheet',
      system: 'generic',
      stats: [],
    };
    const result = CharacterSheetSchema.safeParse(sheet);
    expect(result.success).toBe(false);
  });

  it('should fail if system is missing', () => {
    const sheet = {
      key: 'no-system-sheet',
      name: 'No System',
      stats: [],
    };
    const result = CharacterSheetSchema.safeParse(sheet);
    expect(result.success).toBe(false);
  });

  it('should fail if key is missing', () => {
    const sheet = {
      name: 'No Key',
      system: 'generic',
      stats: [],
    };
    const result = CharacterSheetSchema.safeParse(sheet);
    expect(result.success).toBe(false);
  });

  it('should fail if stats array contains an invalid stat', () => {
    const sheet = {
      key: 'invalid-stat-sheet',
      name: 'Invalid Stat Sheet',
      system: 'generic',
      stats: [
        { type: 'number', key: 'valid_stat', value: 10 },
        { type: 'invalid_type', key: 'invalid_stat' },
      ],
    };
    const result = CharacterSheetSchema.safeParse(sheet);
    expect(result.success).toBe(false);
  });
});
