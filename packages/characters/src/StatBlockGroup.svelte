<script lang="ts">
/**
 * Renders a group of stat blocks with configurable grid layout.
 */

import StatBlock from './StatBlock.svelte';
import type { CharacterStat, StatBlockGroup } from './types';

interface Props {
  group: StatBlockGroup;
  stats: CharacterStat[];
  values: Record<string, unknown>;
  readonly?: boolean;
  onchange?: (key: string, value: unknown) => void;
}

const { group, stats, values, readonly = true, onchange }: Props = $props();

// Get stats for a specific block
function getBlockStats(blockKey: string): CharacterStat[] {
  return stats.filter((s) => s.block === blockKey);
}

// Map layout to CSS class
const layoutClass = $derived.by(() => {
  switch (group.layout) {
    case 'cols-2':
      return 'grid-cols-2';
    case 'cols-3':
      return 'grid-cols-3';
    default:
      return 'grid-cols-1';
  }
});
</script>

<div class="stat-block-group grid gap-1 {layoutClass}">
  {#each group.blocks as block (block.key)}
    <StatBlock
      {block}
      stats={getBlockStats(block.key)}
      {values}
      {readonly}
      {onchange}
    />
  {/each}
</div>
