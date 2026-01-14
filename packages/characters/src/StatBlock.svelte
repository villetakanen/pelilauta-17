<script lang="ts">
/**
 * Renders a single stat block (card) containing stats.
 */

import ChoiceStatComponent from './stats/ChoiceStat.svelte';
import D20AbilityStatComponent from './stats/D20AbilityStat.svelte';
import DerivedStatComponent from './stats/DerivedStat.svelte';
import NumberStatComponent from './stats/NumberStat.svelte';
import TextStatComponent from './stats/TextStat.svelte';
import ToggledStatComponent from './stats/ToggledStat.svelte';
import type { CharacterStat, StatBlock } from './types';

interface Props {
  block: StatBlock;
  stats: CharacterStat[];
  values: Record<string, unknown>;
  readonly?: boolean;
  onchange?: (key: string, value: unknown) => void;
}

const { block, stats, values, readonly = true, onchange }: Props = $props();

function handleStatChange(key: string) {
  return (value: unknown) => {
    if (onchange) {
      onchange(key, value);
    }
  };
}

function getStatValue(stat: CharacterStat): unknown {
  const stored = values[stat.key];
  if (stored !== undefined) return stored;

  // Return default based on type
  switch (stat.type) {
    case 'number':
      return stat.value ?? 0;
    case 'text':
      return stat.value ?? '';
    case 'toggled':
      return stat.value ?? false;
    case 'choice':
      return stat.value ?? '';
    case 'd20_ability_score':
      return stat.baseValue ?? 10;
    case 'derived':
      return stat.formula;
    default:
      return '';
  }
}
</script>

<cn-card elevation="1" class="stat-block">
  <h3 class="stat-block__title downscaled" slot="title">{block.label ?? block.key}</h3>

  <div class="stat-block__stats">
    {#each stats as stat (stat.key)}
      {#if stat.type === 'number'}
        <NumberStatComponent
          {stat}
          value={Number(getStatValue(stat))}
          {readonly}
          onchange={handleStatChange(stat.key)}
        />
      {:else if stat.type === 'text'}
        <TextStatComponent
          {stat}
          value={String(getStatValue(stat))}
          {readonly}
          onchange={handleStatChange(stat.key)}
        />
      {:else if stat.type === 'toggled'}
        <ToggledStatComponent
          {stat}
          value={Boolean(getStatValue(stat))}
          {readonly}
          onchange={handleStatChange(stat.key)}
        />
      {:else if stat.type === 'choice'}
        <ChoiceStatComponent
          {stat}
          value={String(getStatValue(stat))}
          {readonly}
          onchange={handleStatChange(stat.key)}
        />
      {:else if stat.type === 'd20_ability_score'}
        <D20AbilityStatComponent
          {stat}
          value={Number(getStatValue(stat))}
          {readonly}
          onchange={handleStatChange(stat.key)}
        />
      {:else if stat.type === 'derived'}
        <DerivedStatComponent
          {stat}
          value={getStatValue(stat) as string | number}
          {readonly}
        />
      {/if}
    {/each}
  </div>
</cn-card>
