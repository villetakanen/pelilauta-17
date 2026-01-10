<script lang="ts">
import type { StatBlockGroup } from 'src/schemas/CharacterSheetSchema';
import {
  addBlock,
  blockHasStats,
  moveBlockGroupDown,
  moveBlockGroupUp,
  removeBlock,
  removeBlockGroup,
  updateBlockGroupKey,
  updateBlockGroupLayout,
  updateBlockKey,
} from 'src/stores/admin/sheetEditorStore';
import StatBlockCard from './StatBlockCard.svelte';

interface Props {
  group: StatBlockGroup;
  groupIndex: number;
}
const { group, groupIndex }: Props = $props();

let newBlockName = $state('');

function handleLayoutChange(e: Event) {
  const newLayout = (e.target as HTMLSelectElement)
    .value as StatBlockGroup['layout'];
  updateBlockGroupLayout(group.key, newLayout);
}

function handleNameChange(e: Event) {
  const newKey = (e.target as HTMLInputElement).value;
  updateBlockGroupKey(group.key, newKey);
}

function handleAddBlock() {
  if (!newBlockName.trim()) return;
  addBlock(group.key, newBlockName.trim());
  newBlockName = '';
}

function canDeleteGroup(): boolean {
  return group.blocks.length === 0;
}
</script>

<section class="surface p-2 mb-2">
    <div class="toolbar pt-0 mt-0 mb-2">
        <label class="grow">
            <span class="label">Group Name</span>
            <input type="text" value={group.key} oninput={handleNameChange} />
        </label>
        <label>
            <span class="label">Layout</span>
            <select value={group.layout} onchange={handleLayoutChange}>
                <option value="cols-1">1 Column</option>
                <option value="cols-2">2 Columns</option>
                <option value="cols-3">3 Columns</option>
            </select>
        </label>
        <div class="flex gap-1 items-end">
            <button
                type="button"
                class="text"
                aria-label="Move up"
                disabled={groupIndex === 0}
                onclick={() => moveBlockGroupUp(group.key)}
            >
                <cn-icon noun="arrow-up"></cn-icon>
            </button>
            <button
                type="button"
                class="text"
                aria-label="Move down"
                onclick={() => moveBlockGroupDown(group.key)}
            >
                <cn-icon noun="arrow-down"></cn-icon>
            </button>
            <button
                type="button"
                class="text"
                aria-label="Delete group"
                onclick={() => removeBlockGroup(group.key)}
                disabled={!canDeleteGroup()}
            >
                <cn-icon noun="delete"></cn-icon>
            </button>
        </div>
    </div>

    <!-- Stat Blocks within this group -->
    <div class="block-grid layout-{group.layout}">
        {#each group.blocks as block}
            <StatBlockCard
                groupKey={group.key}
                blockKey={block.key}
                blockLabel={block.label}
            />
        {/each}
    </div>

    <!-- Add new block -->
    <div class="toolbar mt-2">
        <input
            type="text"
            placeholder="New block name..."
            bind:value={newBlockName}
            class="grow"
        />
        <button
            type="button"
            class="text"
            onclick={handleAddBlock}
            disabled={!newBlockName.trim()}
        >
            <cn-icon noun="add"></cn-icon>
            <span>Add Block</span>
        </button>
    </div>
</section>

<style>
    .block-grid {
        display: grid;
        gap: 1rem;
    }
    .block-grid.layout-cols-1 {
        grid-template-columns: 1fr;
    }
    .block-grid.layout-cols-2 {
        grid-template-columns: repeat(2, 1fr);
    }
    .block-grid.layout-cols-3 {
        grid-template-columns: repeat(3, 1fr);
    }
    @media (max-width: 768px) {
        .block-grid.layout-cols-2,
        .block-grid.layout-cols-3 {
            grid-template-columns: 1fr;
        }
    }
</style>
