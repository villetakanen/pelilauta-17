<script lang="ts">
import type { StatBlockGroup } from 'src/schemas/CharacterSheetSchema';
import {
  updateBlockGroupKey,
  updateBlockGroupLayout,
} from 'src/stores/admin/sheetEditorStore';

interface Props {
  group: StatBlockGroup;
}
const { group }: Props = $props();

function handleKeyChange(e: Event) {
  const newKey = (e.target as HTMLInputElement).value;
  updateBlockGroupKey(group.key, newKey);
}

function handleLayoutChange(e: Event) {
  const newLayout = (e.target as HTMLSelectElement)
    .value as StatBlockGroup['layout'];
  updateBlockGroupLayout(group.key, newLayout);
}
</script>

<div class="property-group">
    <h3 class="text-h6 mb-2">Group Properties</h3>

    <label>
        <span class="label">Key (ID)</span>
        <input
            type="text"
            value={group.key}
            onchange={handleKeyChange}
            placeholder="unique_group_id"
        />
        <span class="text-caption text-low">
            Unique identifier for this group.
        </span>
    </label>

    <label class="mt-2 block">
        <span class="label">Layout</span>
        <select value={group.layout} onchange={handleLayoutChange}>
            <option value="cols-1">1 Column</option>
            <option value="cols-2">2 Columns</option>
            <option value="cols-3">3 Columns</option>
        </select>
    </label>
</div>
