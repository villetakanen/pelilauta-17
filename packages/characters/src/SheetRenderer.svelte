<script lang="ts">
/**
 * Main entry point for rendering a character sheet.
 *
 * This component orchestrates the rendering of stat block groups
 * and their contained stats based on a CharacterSheet definition.
 */

import StatBlockGroup from './StatBlockGroup.svelte';
import type { CharacterSheet } from './types';

interface Props {
  sheet: CharacterSheet;
  values?: Record<string, unknown>;
  readonly?: boolean;
  onchange?: (key: string, value: unknown) => void;
}

const { sheet, values = {}, readonly = true, onchange }: Props = $props();

// Get all stats that belong to blocks within a group
function getGroupStats(groupKey: string): typeof sheet.stats {
  const group = sheet.statBlockGroups.find((g) => g.key === groupKey);
  if (!group) return [];

  const blockKeys = group.blocks.map((b) => b.key);
  return sheet.stats.filter((s) => s.block && blockKeys.includes(s.block));
}
</script>

<div class="sheet-renderer">
  {#if sheet.statBlockGroups.length === 0}
    <p class="text-low">No stat blocks defined for this sheet.</p>
  {:else}
    {#each sheet.statBlockGroups as group (group.key)}
      <StatBlockGroup
        {group}
        stats={getGroupStats(group.key)}
        {values}
        {readonly}
        {onchange}
      />
    {/each}
  {/if}
</div>
