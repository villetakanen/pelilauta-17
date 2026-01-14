import { z } from 'zod';

export const CHARACTER_SHEETS_COLLECTION_NAME = 'charsheets';

/**
 * Schema for a stat block within a group.
 * Each block is a visual card/section that contains stats.
 */
const StatBlockSchema = z.object({
  key: z.string().min(1, 'StatBlock key cannot be empty'),
  label: z.string().optional(),
});

export type StatBlock = z.infer<typeof StatBlockSchema>;

/**
 * Schema for a stat block group that defines the grid layout for blocks.
 * Each group contains one or more blocks arranged in columns.
 */
const StatBlockGroupSchema = z.object({
  key: z.string().min(1, 'StatBlockGroup key cannot be empty'),
  layout: z.enum(['cols-1', 'cols-2', 'cols-3']).default('cols-1'),
  blocks: z.array(StatBlockSchema).default([]),
});

export type StatBlockGroup = z.infer<typeof StatBlockGroupSchema>;

/**
 * The base schema for any type of character stat.
 * It includes common properties like key, description, and block.
 */
const StatBaseSchema = z.object({
  key: z
    .string()
    .min(1, 'Key cannot be empty')
    .describe(
      'Unique identifier for the stat, e.g., "strength" or "hit_points".',
    ),
  label: z
    .string()
    .optional()
    .describe('Display label for the stat, e.g. "Strength".'),
  description: z
    .string()
    .optional()
    .describe(
      'Optional description for the stat, e.g., "Measures physical power".',
    ),
  block: z
    .string()
    .optional()
    .describe(
      'Optional block key for organizing stats in the UI, e.g., "abilities".',
    ),
  value: z.any().optional().describe('The value of the stat.'),
});

/**
 * Schema for a stat that holds a numeric value.
 */
const NumberStatSchema = StatBaseSchema.extend({
  type: z.literal('number'),
  value: z.number().default(0).describe('The numeric value of the stat.'),
});

/**
 * Schema for a stat that can be toggled on or off.
 */
const ToggledStatSchema = StatBaseSchema.extend({
  type: z.literal('toggled'),
  value: z.coerce
    .boolean()
    .default(false)
    .describe('The boolean state of the stat.'),
});

/**
 * Schema for a stat that is defined by the D20 Ability Score system.
 * It includes a "base value" and a "modifier".
 *
 * For schema purposes, the "base value" is a descriptive field, while the
 * "modifier" is a numeric value, as in "number" type stats.
 */
const D20AbilityScoreSchema = StatBaseSchema.extend({
  type: z.literal('d20_ability_score'),
  baseValue: z
    .number()
    .default(10)
    .describe('The descriptive base value of the ability score, e.g., "10".'),
  value: z
    .number()
    .default(0)
    .describe(
      'The numeric modifier for the ability score, e.g., +3 for Strength.',
    ),
  hasProficiency: z
    .boolean()
    .default(false)
    .describe(
      'Whether this ability score supports proficiency bonuses (e.g., for saving throws).',
    ),
}).describe(
  'A stat that represents a D20 Ability Score, such as Strength or Dexterity, with a base value and a modifier.',
);

/**
 * Schema for a stat whose value is derived from a formula.
 * The formula can reference other stats using the "@key" notation.
 */
const DerivedStatSchema = StatBaseSchema.extend({
  type: z.literal('derived'),
  formula: z
    .string()
    .describe(
      'The formula to calculate the value, e.g., "@strength_modifier + @proficiency_bonus".',
    ),
});

/**
 * Schema for a stat whose value is derived from a formula.
 * The formula can reference other stats using the "@key" notation.
 */
const TextStatSchema = StatBaseSchema.extend({
  type: z.literal('text'),
  // Make text value optional with a safe default so sheets without an
  // explicit value won't fail validation. This mirrors other schemas that
  // provide defaults (number -> 0, toggled -> false).
  value: z.string().default('').describe('The text value of the stat.'),
});

/**
 * Schema for a choice option used in ChoiceStatSchema.
 */
const ChoiceOptionSchema = z.object({
  label: z.string().min(1, 'Choice label cannot be empty'),
  value: z.string().min(1, 'Choice value cannot be empty'),
});

export type ChoiceOption = z.infer<typeof ChoiceOptionSchema>;

/**
 * Schema for a stat that allows selection from a list of options.
 * Either static `options` array or dynamic `ref` (Firestore path) must be provided.
 */
const ChoiceStatSchema = StatBaseSchema.extend({
  type: z.literal('choice'),
  options: z
    .array(ChoiceOptionSchema)
    .optional()
    .describe('Static list of options to choose from.'),
  ref: z
    .string()
    .optional()
    .describe(
      'Firestore collection path for dynamic options, e.g., "systems/ll/species".',
    ),
  value: z.string().default('').describe('The selected option value.'),
}).refine((data) => data.options !== undefined || data.ref !== undefined, {
  message: 'Choice stat must have either options or ref defined',
});

export type ChoiceStat = z.infer<typeof ChoiceStatSchema>;

/**
 * A discriminated union of all possible stat types.
 * This allows for flexible and type-safe handling of different kinds of stats.
 */
export const CharacterStatSchema = z.discriminatedUnion('type', [
  NumberStatSchema,
  ToggledStatSchema,
  DerivedStatSchema,
  D20AbilityScoreSchema,
  TextStatSchema,
  ChoiceStatSchema,
]);

/**
 * The TypeScript type inferred from the CharacterStatSchema.
 * Use this type in your application code.
 */
export type CharacterStat = z.infer<typeof CharacterStatSchema>;

/**
 * A CharacterSheet is a template for creating characters for a specific game system.
 * It defines the structure of the character's stats.
 */
export const CharacterSheetSchema = z
  .object({
    key: z
      .string()
      .min(1, 'Key cannot be empty')
      .describe('Unique identifier for the character sheet template.'),
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .describe(
        'Name of the character sheet template, e.g., "D&D 5e" or "FATE Core".',
      ),
    system: z
      .string()
      .min(1, 'System cannot be empty')
      .describe(
        'The roleplaying game system this sheet is for, e.g., "dnd5e".',
      ),
    statBlockGroups: z.array(StatBlockGroupSchema).default([]),
    stats: z
      .array(CharacterStatSchema)
      .default([])
      .describe('The list of stat templates that make up this sheet.'),
  })
  .describe('A template for creating player characters.');

export type CharacterSheet = z.infer<typeof CharacterSheetSchema>;

/**
 * Migration function to convert existing character sheets with old formats
 * to the new StatBlockGroup structure.
 */
export function migrateCharacterSheet(sheet: unknown): CharacterSheet {
  // Ensure sheet is an object
  if (typeof sheet !== 'object' || sheet === null) {
    throw new Error('Invalid character sheet data');
  }

  const sheetData = sheet as Record<string, unknown>;

  // Migration: Convert old statGroups to new statBlockGroups
  if ('statGroups' in sheetData && Array.isArray(sheetData.statGroups)) {
    const oldGroups = sheetData.statGroups;

    // Check if it's the old format (string[] or {key, layout}[])
    if (oldGroups.length > 0) {
      const firstItem = oldGroups[0];

      // Old format: string[]
      if (typeof firstItem === 'string') {
        sheetData.statBlockGroups = (oldGroups as string[]).map(
          (groupName: string) => ({
            key: groupName,
            layout: 'cols-1' as const,
            blocks: [{ key: groupName }],
          }),
        );
      }
      // Old format: {key, layout}[] (StatGroup format)
      else if (
        typeof firstItem === 'object' &&
        firstItem !== null &&
        'key' in firstItem
      ) {
        sheetData.statBlockGroups = (
          oldGroups as Array<{ key: string; layout?: string }>
        ).map((group) => {
          // Map old layout to new layout
          let layout: 'cols-1' | 'cols-2' | 'cols-3' = 'cols-1';
          if (group.layout === 'grid-2') layout = 'cols-2';
          if (group.layout === 'grid-3') layout = 'cols-3';

          return {
            key: group.key,
            layout,
            blocks: [{ key: group.key }],
          };
        });
      }
    }

    // Remove old statGroups field
    delete sheetData.statGroups;
  }

  // Migration: Convert stats.group to stats.block
  if (Array.isArray(sheetData.stats)) {
    sheetData.stats = (sheetData.stats as Array<Record<string, unknown>>).map(
      (stat) => {
        if ('group' in stat && !('block' in stat)) {
          const { group, ...rest } = stat;
          return { ...rest, block: group };
        }
        return stat;
      },
    );
  }

  return CharacterSheetSchema.parse(sheetData);
}
