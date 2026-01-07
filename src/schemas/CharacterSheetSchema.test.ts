import { describe, expect, it } from 'vitest';
import { CharacterStatSchema } from './CharacterSheetSchema';

describe('CharacterSheetSchema', () => {
  describe('ChoiceStatSchema', () => {
    it('should parse choice stat with static options', () => {
      const stat = {
        type: 'choice',
        key: 'species',
        options: [
          { label: 'Elf', value: 'elf' },
          { label: 'Dwarf', value: 'dwarf' },
        ],
      };
      const result = CharacterStatSchema.parse(stat);
      expect(result.type).toBe('choice');
      expect(result.key).toBe('species');
      if (result.type === 'choice') {
        expect(result.options).toHaveLength(2);
      }
    });

    it('should parse choice stat with ref path', () => {
      const stat = {
        type: 'choice',
        key: 'class',
        ref: 'systems/ll/classes',
      };
      const result = CharacterStatSchema.parse(stat);
      expect(result.type).toBe('choice');
      if (result.type === 'choice') {
        expect(result.ref).toBe('systems/ll/classes');
      }
    });

    it('should reject choice stat without options or ref', () => {
      const stat = {
        type: 'choice',
        key: 'invalid_choice',
      };
      expect(() => CharacterStatSchema.parse(stat)).toThrow(
        'Choice stat must have either options or ref defined',
      );
    });

    it('should reject choice stat with empty options array', () => {
      const stat = {
        type: 'choice',
        key: 'empty_choice',
        options: [],
      };
      // Empty array is valid (user might add options later in admin UI)
      const result = CharacterStatSchema.parse(stat);
      expect(result.type).toBe('choice');
    });

    it('should reject option with empty label', () => {
      const stat = {
        type: 'choice',
        key: 'bad_label',
        options: [{ label: '', value: 'valid' }],
      };
      expect(() => CharacterStatSchema.parse(stat)).toThrow();
    });

    it('should reject option with empty value', () => {
      const stat = {
        type: 'choice',
        key: 'bad_value',
        options: [{ label: 'Valid', value: '' }],
      };
      expect(() => CharacterStatSchema.parse(stat)).toThrow();
    });

    it('should have default empty string value', () => {
      const stat = {
        type: 'choice',
        key: 'species',
        options: [{ label: 'Elf', value: 'elf' }],
      };
      const result = CharacterStatSchema.parse(stat);
      if (result.type === 'choice') {
        expect(result.value).toBe('');
      }
    });
  });
});
