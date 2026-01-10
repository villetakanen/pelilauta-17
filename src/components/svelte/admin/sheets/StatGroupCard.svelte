<script lang="ts">
import type { StatGroup } from 'src/schemas/CharacterSheetSchema';
import {
  addStat,
  groupHasStats,
  removeGroup,
  updateGroupKey,
  updateGroupLayout,
} from 'src/stores/admin/sheetEditorStore';
import StatsSection from './StatsSection.svelte';

interface Props {
  groupKey: string;
  layout: StatGroup['layout'];
}
const { groupKey, layout }: Props = $props();

function handleLayoutChange(e: Event) {
  const newLayout = (e.target as HTMLSelectElement)
    .value as StatGroup['layout'];
  updateGroupLayout(groupKey, newLayout);
}

function handleNameChange(e: Event) {
  const newKey = (e.target as HTMLInputElement).value;
  updateGroupKey(groupKey, newKey);
}
</script>

<section>
  <div class="toolbar">
    <label class="grow">
      <span class="label">Group Name</span>
      <input type="text" value={groupKey} oninput={handleNameChange} />
    </label>
    <label>
      <select value={layout} onchange={handleLayoutChange}>
        <option value="rows">Rows (single column)</option>
        <option value="grid-2">Grid 2-column</option>
        <option value="grid-3">Grid 3-column</option>
      </select>
    </label>
    <button
      type="button"
      class="text"
      aria-label="delete"
      onclick={() => removeGroup(groupKey)}
      disabled={groupHasStats(groupKey)}
    >
      <cn-icon noun="delete"></cn-icon>
    </button>
  </div>
  <StatsSection group={groupKey} {layout} />
  <div class="toolbar items-center">
    <button type="button" class="text" onclick={() => addStat(groupKey)}>
      <cn-icon noun="add"></cn-icon>
      <span>New Stat</span>
    </button>
  </div>
</section>
