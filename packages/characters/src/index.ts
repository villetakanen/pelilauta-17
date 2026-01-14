/**
 * @pelilauta/characters - Character sheet rendering components
 *
 * This package provides Svelte 5 components for rendering character sheets.
 * Components are pure presentation with no Firebase dependencies.
 */

// Main renderer
export { default as SheetRenderer } from './SheetRenderer.svelte';
export { default as StatBlock } from './StatBlock.svelte';
// Building blocks (for custom layouts)
export { default as StatBlockGroup } from './StatBlockGroup.svelte';
export { default as ChoiceStat } from './stats/ChoiceStat.svelte';
export { default as D20AbilityStat } from './stats/D20AbilityStat.svelte';
export { default as DerivedStat } from './stats/DerivedStat.svelte';
// Individual stat components
export { default as NumberStat } from './stats/NumberStat.svelte';
export { default as TextStat } from './stats/TextStat.svelte';
export { default as ToggledStat } from './stats/ToggledStat.svelte';

// Types
export type {
  CharacterSheet,
  CharacterStat,
  ChoiceOption,
  ChoiceStat as ChoiceStatType,
  D20AbilityStat as D20AbilityStatType,
  DerivedStat as DerivedStatType,
  NumberStat as NumberStatType,
  StatBlock as StatBlockType,
  StatBlockGroup as StatBlockGroupType,
  TextStat as TextStatType,
  ToggledStat as ToggledStatType,
} from './types';
