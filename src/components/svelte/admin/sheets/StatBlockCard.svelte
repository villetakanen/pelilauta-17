<script lang="ts">
import type { CharacterStat } from 'src/schemas/CharacterSheetSchema';
import {
  addStat,
  blockHasStats,
  groupedStats,
  removeBlock,
  removeStat,
  sheet,
  updateBlockKey,
  updateStat,
} from 'src/stores/admin/sheetEditorStore';

interface Props {
  groupKey: string;
  blockKey: string;
  blockLabel?: string;
}
const { groupKey, blockKey, blockLabel }: Props = $props();

const stats = $derived.by(() => {
  return $groupedStats.grouped[blockKey] ?? [];
});

function getStatIndex(stat: CharacterStat): number {
  return $sheet?.stats?.indexOf(stat) ?? -1;
}

function handleBlockNameChange(e: Event) {
  const newKey = (e.target as HTMLInputElement).value;
  updateBlockKey(groupKey, blockKey, newKey);
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

function canDelete(): boolean {
  return !blockHasStats(blockKey);
}
</script>

<div class="stat-block surface elevation-1 p-2">
    <div class="toolbar pt-0 mt-0 mb-1">
        <input
            type="text"
            value={blockKey}
            oninput={handleBlockNameChange}
            class="grow text-h6"
            placeholder="Block name"
        />
        <button
            type="button"
            class="text"
            aria-label="Delete block"
            onclick={() => removeBlock(groupKey, blockKey)}
            disabled={!canDelete()}
        >
            <cn-icon noun="delete"></cn-icon>
        </button>
    </div>

    <div class="stat-grid">
        {#each stats as stat}
            <input
                type="text"
                value={stat.key}
                oninput={(e) =>
                    handleKeyChange(stat, (e.target as HTMLInputElement).value)}
                placeholder="stat key"
            />
            <select
                onchange={(e) =>
                    handleTypeChange(
                        stat,
                        (e.target as HTMLSelectElement).value,
                    )}
            >
                <option value="number" selected={stat.type === "number"}
                    >123</option
                >
                <option value="text" selected={stat.type === "text"}>ABC</option
                >
                <option value="toggled" selected={stat.type === "toggled"}
                    >0/1</option
                >
                <option
                    value="d20_ability_score"
                    selected={stat.type === "d20_ability_score"}>D20</option
                >
                <option value="choice" selected={stat.type === "choice"}
                    >Choice</option
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
    </div>

    <button type="button" class="text mt-1" onclick={() => addStat(blockKey)}>
        <cn-icon noun="add"></cn-icon>
        <span>Add Stat</span>
    </button>
</div>

<style>
    .stat-block {
        border-radius: var(--cn-border-radius);
    }
    .stat-grid {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 0.5rem;
        align-items: center;
    }
</style>
