/**
 * Types for the @pelilauta/characters package.
 *
 * These mirror the schema types but are defined locally to avoid
 * coupling the package to the main app's schema definitions.
 */

export interface StatBlock {
  key: string;
  label?: string;
}

export interface StatBlockGroup {
  key: string;
  layout: 'cols-1' | 'cols-2' | 'cols-3';
  blocks: StatBlock[];
}

export interface ChoiceOption {
  label: string;
  value: string;
}

export interface BaseStat {
  key: string;
  description?: string;
  block?: string;
}

export interface NumberStat extends BaseStat {
  type: 'number';
  value?: number;
}

export interface TextStat extends BaseStat {
  type: 'text';
  value?: string;
}

export interface ToggledStat extends BaseStat {
  type: 'toggled';
  value?: boolean;
}

export interface ChoiceStat extends BaseStat {
  type: 'choice';
  options?: ChoiceOption[];
  ref?: string;
  value?: string;
}

export interface D20AbilityStat extends BaseStat {
  type: 'd20_ability_score';
  baseValue?: number;
  value?: number;
  hasProficiency?: boolean;
}

export interface DerivedStat extends BaseStat {
  type: 'derived';
  formula: string;
}

export type CharacterStat =
  | NumberStat
  | TextStat
  | ToggledStat
  | ChoiceStat
  | D20AbilityStat
  | DerivedStat;

export interface CharacterSheet {
  key: string;
  name: string;
  system: string;
  statBlockGroups: StatBlockGroup[];
  stats: CharacterStat[];
}

/**
 * Props common to all stat components.
 */
export interface StatComponentProps<T = unknown> {
  stat: CharacterStat;
  value: T;
  readonly: boolean;
  onchange?: (value: T) => void;
}
