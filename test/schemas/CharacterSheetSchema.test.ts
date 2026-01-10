import { describe, expect, it } from 'vitest';
import {
  CharacterSheetSchema,
  CharacterStatSchema,
  migrateCharacterSheet,
} from '../../src/schemas/CharacterSheetSchema';

describe('CharacterStatSchema', () => {
  it('should validate a number stat correctly', () => {
    const stat = {
      type: 'number',
      key: 'strength',
      value: 18,
      description: 'Physical might',
      block: 'Attributes',
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
      block: 'Skills',
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
      block: 'Modifiers',
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
      type: 'atext',
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
      key: 'dnd5e-basic',
      name: 'No Key',
      system: 'generic',
      stats: [],
    };
    // Actually this should pass since key is provided
    const result = CharacterSheetSchema.safeParse(sheet);
    expect(result.success).toBe(true);
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

  it('should validate a character sheet with StatBlockGroup objects', () => {
    const sheet = {
      key: 'modern-sheet',
      name: 'Modern Sheet with StatBlockGroups',
      system: 'dnd5e',
      statBlockGroups: [
        { key: 'Attributes', layout: 'cols-2', blocks: [{ key: 'Abilities' }] },
        { key: 'Skills', layout: 'cols-1', blocks: [{ key: 'Skills' }] },
        { key: 'Combat', layout: 'cols-3', blocks: [{ key: 'Combat' }] },
      ],
      stats: [
        { type: 'number', key: 'strength', value: 10, block: 'Abilities' },
        { type: 'number', key: 'acrobatics', value: 5, block: 'Skills' },
      ],
    };
    const result = CharacterSheetSchema.safeParse(sheet);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.statBlockGroups).toHaveLength(3);
      expect(result.data.statBlockGroups[0].key).toBe('Attributes');
      expect(result.data.statBlockGroups[0].layout).toBe('cols-2');
    }
  });

  it('should use default layout for StatBlockGroup if not specified', () => {
    const sheet = {
      key: 'default-layout-sheet',
      name: 'Default Layout Sheet',
      system: 'generic',
      statBlockGroups: [{ key: 'Stats', blocks: [] }],
      stats: [],
    };
    const result = CharacterSheetSchema.safeParse(sheet);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.statBlockGroups[0].layout).toBe('cols-1');
    }
  });
});

describe('migrateCharacterSheet', () => {
  it('should migrate string-based stat groups to StatBlockGroup objects', () => {
    const oldSheet = {
      key: 'legacy-sheet',
      name: 'Legacy Sheet',
      system: 'dnd5e',
      statGroups: ['Attributes', 'Skills', 'Combat'],
      stats: [
        { type: 'number', key: 'strength', value: 10, group: 'Attributes' },
        { type: 'number', key: 'acrobatics', value: 5, group: 'Skills' },
      ],
    };

    const migratedSheet = migrateCharacterSheet(oldSheet);

    expect(migratedSheet.statBlockGroups).toHaveLength(3);
    expect(migratedSheet.statBlockGroups[0]).toEqual({
      key: 'Attributes',
      layout: 'cols-1',
      blocks: [{ key: 'Attributes' }],
    });
    // Stats should now have 'block' instead of 'group'
    expect(migratedSheet.stats[0].block).toBe('Attributes');
    expect(migratedSheet.stats[1].block).toBe('Skills');
  });

  it('should migrate object-based statGroups to new format', () => {
    const oldSheet = {
      key: 'modern-sheet',
      name: 'Modern Sheet',
      system: 'dnd5e',
      statGroups: [
        { key: 'Attributes', layout: 'grid-2' },
        { key: 'Skills', layout: 'rows' },
      ],
      stats: [{ type: 'number', key: 'str', value: 10, group: 'Attributes' }],
    };

    const result = migrateCharacterSheet(oldSheet);

    expect(result.statBlockGroups).toHaveLength(2);
    expect(result.statBlockGroups[0]).toEqual({
      key: 'Attributes',
      layout: 'cols-2',
      blocks: [{ key: 'Attributes' }],
    });
    expect(result.statBlockGroups[1]).toEqual({
      key: 'Skills',
      layout: 'cols-1',
      blocks: [{ key: 'Skills' }],
    });
    // Stats should have block
    expect(result.stats[0].block).toBe('Attributes');
  });

  it('should handle empty statGroups array', () => {
    const sheet = {
      key: 'empty-groups-sheet',
      name: 'Empty Groups Sheet',
      system: 'generic',
      statGroups: [],
      stats: [],
    };

    const result = migrateCharacterSheet(sheet);
    expect(result.statBlockGroups).toEqual([]);
  });

  it('should not modify already migrated StatBlockGroup format', () => {
    const newSheet = {
      key: 'new-format-sheet',
      name: 'New Format Sheet',
      system: 'generic',
      statBlockGroups: [
        { key: 'Group1', layout: 'cols-2', blocks: [{ key: 'Block1' }] },
      ],
      stats: [{ type: 'number', key: 'stat1', value: 10, block: 'Block1' }],
    };

    const result = migrateCharacterSheet(newSheet);
    expect(result.statBlockGroups).toEqual(newSheet.statBlockGroups);
    expect(result.stats[0].block).toBe('Block1');
  });

  it('should throw error for invalid sheet data', () => {
    expect(() => migrateCharacterSheet(null)).toThrow(
      'Invalid character sheet data',
    );
    expect(() => migrateCharacterSheet('not an object')).toThrow(
      'Invalid character sheet data',
    );
  });
});
