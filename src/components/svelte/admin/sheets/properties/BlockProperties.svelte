<script lang="ts">
import type { StatBlock } from 'src/schemas/CharacterSheetSchema';
import { updateBlock, updateBlockKey } from 'src/stores/admin/sheetEditorStore';
import { toMekanismiURI } from 'src/utils/mekanismiUtils';

interface Props {
  block: StatBlock;
  groupKey: string;
}
const { block, groupKey }: Props = $props();

// We need groupKey to update the block since block keys are unique per sheet primarily via group context in store actions?
// Actually updateBlockKey needs groupKey.

function handleKeyChange(e: Event) {
  const newKey = (e.target as HTMLInputElement).value;
  updateBlockKey(groupKey, block.key, newKey);
}

function handleLabelChange(e: Event) {
  const newLabel = (e.target as HTMLInputElement).value;

  // Auto-Key Logic:
  const currentSlug = toMekanismiURI(block.label || '');
  const isSynced =
    block.key === currentSlug ||
    block.key === '' ||
    block.key.startsWith('new_block');

  // Update generic properties (label)
  updateBlock(groupKey, block.key, { label: newLabel });

  if (isSynced) {
    updateBlockKey(groupKey, block.key, toMekanismiURI(newLabel));
  }
}
</script>

<div class="property-group">
    <h3 class="text-h6 mb-2">Block Properties</h3>

    <label class="mt-2 block">
        <span class="label">Label</span>
        <input
            type="text"
            value={block.label || ""}
            oninput={handleLabelChange}
            placeholder="e.g. Attributes"
        />
    </label>

    <label class="mt-2 block">
        <span class="label">Key (ID)</span>
        <input
            type="text"
            value={block.key}
            onchange={handleKeyChange}
            placeholder="unique_block_id"
        />
        <span class="text-caption text-low">
            Unique identifier for this block. Auto-generated from label.
        </span>
    </label>
</div>
