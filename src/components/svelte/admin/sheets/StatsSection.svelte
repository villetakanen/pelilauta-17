<script lang="ts">
import type { CharacterStat } from '@schemas/CharacterSheetSchema';
import {
  groupedStats,
  removeStat,
  sheet,
  updateStat,
} from 'src/stores/admin/sheetEditorStore';

interface Props {
  group: string;
  layout?: 'rows' | 'grid-2' | 'grid-3';
}
const { group, layout = 'rows' }: Props = $props();

const stats = $derived.by(() => {
  return $groupedStats.grouped[group] ?? [];
});

function getStatIndex(stat: CharacterStat): number {
  return $sheet?.stats?.indexOf(stat) ?? -1;
}

function handleRemoveStat(stat: CharacterStat) {
  const index = getStatIndex(stat);
  if (index !== -1) {
    removeStat(index);
  }
}

function handleKeyChange(stat: CharacterStat, newKey: string) {
  const index = getStatIndex(stat);
  if (index !== -1) {
    updateStat(index, { key: newKey });
  }
}

function handleTypeChange(stat: CharacterStat, newType: string) {
  const index = getStatIndex(stat);
  if (index !== -1) {
    const type = newType as 'number' | 'text' | 'toggled' | 'd20_ability_score';
    // Reset value to default based on type
    const value =
      type === 'number'
        ? 0
        : type === 'toggled'
          ? false
          : type === 'd20_ability_score'
            ? 10
            : '';
    updateStat(index, { type, value });
  }
}
</script>

<cn-stat-block label={group} {layout}>
  <section class="stat-grid">
    {#each stats as stat}
      <input
        type="text"
        value={stat.key}
        oninput={(e) =>
          handleKeyChange(stat, (e.target as HTMLInputElement).value)}
      />
      <select
        onchange={(e) =>
          handleTypeChange(stat, (e.target as HTMLSelectElement).value)}
      >
        <option value="number" selected={stat.type === "number"}>123</option>
        <option value="text" selected={stat.type === "text"}>ABC</option>
        <option value="toggled" selected={stat.type === "toggled"}>0/1</option>
        <option
          value="d20_ability_score"
          selected={stat.type === "d20_ability_score"}>D20-A</option
        >
      </select>
      <button
        class="text"
        aria-label="delete"
        type="button"
        onclick={() => handleRemoveStat(stat)}
      >
        <cn-icon noun="delete"></cn-icon>
      </button>
    {/each}
  </section>
</cn-stat-block>

<style>
  .stat-grid {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.5rem;
  }
</style>
