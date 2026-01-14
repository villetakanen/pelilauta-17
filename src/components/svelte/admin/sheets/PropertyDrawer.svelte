<script lang="ts">
import Drawer from '@cyan-svelte/components/Drawer.svelte';
import {
  clearSelection,
  selectedItem,
  selection,
  sheet,
} from 'src/stores/admin/sheetEditorStore';
import BlockProperties from './properties/BlockProperties.svelte';
import GroupProperties from './properties/GroupProperties.svelte';
import SheetProperties from './properties/SheetProperties.svelte';
import StatProperties from './properties/StatProperties.svelte';

const isOpen = $derived(!!$selection);
const item = $derived($selectedItem);

// Helper to find group key for a block
function getGroupKeyForBlock(blockKey: string): string | null {
  if (!$sheet) return null;
  for (const group of $sheet.statBlockGroups) {
    if (group.blocks.some((b) => b.key === blockKey)) return group.key;
  }
  return null;
}
</script>

<Drawer open={isOpen} title="Properties" onclose={clearSelection}>
    {#if $selection?.type === "sheet" && item && "statBlockGroups" in item}
        <SheetProperties sheet={item} />
    {:else if $selection?.type === "group" && item && "blocks" in item}
        <GroupProperties group={item} />
    {:else if $selection?.type === "block" && item && "label" in item}
        {@const groupKey = getGroupKeyForBlock(item.key)}
        {#if groupKey}
            <BlockProperties block={item} {groupKey} />
        {/if}
    {:else if $selection?.type === "stat" && item && "type" in item}
        <StatProperties
            stat={item as import("src/schemas/CharacterSheetSchema").CharacterStat}
        />
    {/if}
</Drawer>
