<script lang="ts">
import type { CharacterStat } from 'src/schemas/CharacterSheetSchema';
import {
  addStat,
  blockHasStats,
  groupedStats,
  removeBlock,
  removeStat,
  selectItem,
  sheet,
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

function handleRemoveStat(stat: CharacterStat, e: Event) {
  e.stopPropagation();
  const index = getStatIndex(stat);
  if (index !== -1) {
    removeStat(index);
  }
}

function canDelete(): boolean {
  return !blockHasStats(blockKey);
}
</script>

<div class="stat-block surface elevation-1 p-2 h-full">
  <!-- Block Header -->
  <header
    class="toolbar pt-0 mt-0 mb-1 cursor-pointer hover:surface-2 -mx-2 -mt-2 p-2 rounded transition-colors"
    onclick={() => selectItem("block", blockKey)}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === "Enter" && selectItem("block", blockKey)}
  >
    <div class="grow">
      <h4 class="text-h6 m-0 leading-tight">{blockKey}</h4>
      {#if blockLabel}
        <span class="text-caption text-low">{blockLabel}</span>
      {/if}
    </div>

    <button
      type="button"
      class="text small"
      aria-label="Delete block"
      onclick={(e) => {
        e.stopPropagation();
        removeBlock(groupKey, blockKey);
      }}
      disabled={!canDelete()}
    >
      <cn-icon noun="delete"></cn-icon>
    </button>
  </header>

  <!-- Stats List -->
  <div class="flex flex-col gap-1">
    {#each stats as stat}
      <div
        class="stat-row flex items-center gap-2 p-1 rounded hover:surface-2 cursor-pointer border border-transparent hover:border-border"
        onclick={() => selectItem("stat", stat.key)}
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === "Enter" && selectItem("stat", stat.key)}
      >
        <div class="grow min-w-0">
          <div class="flex items-baseline gap-2">
            <span class="font-mono text-sm truncate">{stat.key || "..."}</span>
            <span
              class="text-caption px-1 rounded bg-surface-2 text-low text-xs"
              >{stat.type}</span
            >
          </div>
          {#if stat.description}
            <p class="text-caption text-low truncate">{stat.description}</p>
          {/if}
        </div>

        <button
          class="text small"
          aria-label="delete"
          type="button"
          onclick={(e) => handleRemoveStat(stat, e)}
        >
          <cn-icon noun="delete"></cn-icon>
        </button>
      </div>
    {/each}
  </div>

  <button
    type="button"
    class="text mt-2 w-full justify-center"
    onclick={() => addStat(blockKey)}
  >
    <cn-icon noun="add"></cn-icon>
    <span>Add Stat</span>
  </button>
</div>

<style>
  .stat-block {
    border-radius: var(--cn-border-radius);
  }
</style>
