<script lang="ts">
import type { CharacterStat } from 'src/schemas/CharacterSheetSchema';
import {
  selectedItem,
  sheet,
  updateStat,
} from 'src/stores/admin/sheetEditorStore';

import { toMekanismiURI } from 'src/utils/mekanismiUtils';

interface Props {
  stat: CharacterStat;
}
const { stat }: Props = $props();

const index = $derived(
  $sheet?.stats?.findIndex((s) => s.key === stat.key) ?? -1,
);

function handleKeyChange(e: Event) {
  if (index === -1) return;
  updateStat(index, { key: (e.target as HTMLInputElement).value });
}

function handleLabelChange(e: Event) {
  if (index === -1) return;
  const newLabel = (e.target as HTMLInputElement).value;

  const updates: Partial<CharacterStat> = { label: newLabel };

  // Auto-Key Logic:
  // If the current key matches the slug of the current label (or is empty/placeholder),
  // then update the key to match the new label.
  const currentSlug = toMekanismiURI(stat.label || '');
  const isSynced =
    stat.key === currentSlug ||
    stat.key === '' ||
    stat.key.startsWith('new_stat');

  if (isSynced) {
    updates.key = toMekanismiURI(newLabel);
  }

  updateStat(index, updates);
}

function handleDescriptionChange(e: Event) {
  if (index === -1) return;
  updateStat(index, {
    description: (e.target as HTMLTextAreaElement).value,
  });
}

function handleTypeChange(e: Event) {
  if (index === -1) return;
  const type = (e.target as HTMLSelectElement).value as CharacterStat['type'];

  import('src/stores/admin/sheetEditorStore').then(({ changeStatType }) => {
    // @ts-expect-error - The action likely supports the type string at runtime or we need to update store types
    changeStatType(index, type);
  });
}
</script>

<div class="property-group">
    <h3 class="text-h6 mb-2">Stat Properties</h3>

    <label>
        <span class="label">Type</span>
        <select value={stat.type} onchange={handleTypeChange}>
            <option value="number">Number</option>
            <option value="text">Text</option>
            <option value="toggled">Toggled (Checkbox)</option>
            <option value="d20_ability_score">D20 Ability</option>
            <option value="choice">Choice (Dropdown)</option>
            <option value="derived">Derived (Formula)</option>
        </select>
    </label>

    <label class="mt-2 block">
        <span class="label">Label</span>
        <input
            type="text"
            value={stat.label || ""}
            oninput={handleLabelChange}
            placeholder="e.g. Strength"
        />
    </label>

    <label class="mt-2 block">
        <span class="label">Key (ID)</span>
        <input
            type="text"
            value={stat.key}
            onchange={handleKeyChange}
            placeholder="unique_stat_id"
        />
        <span class="text-caption text-low"> Auto-generated from label. </span>
    </label>

    <label class="mt-2 block">
        <span class="label">Description</span>
        <textarea
            value={stat.description || ""}
            onchange={handleDescriptionChange}
            rows="3"
        ></textarea>
    </label>

    <!-- Type Specific Config -->
    <div class="mt-4 p-2 surface-2 rounded">
        {#if stat.type === "derived"}
            <label>
                <span class="label">Formula</span>
                <input
                    type="text"
                    value={stat.formula}
                    onchange={(e) =>
                        updateStat(index, {
                            formula: (e.target as HTMLInputElement).value,
                        })}
                    placeholder="@strength + 2"
                />
            </label>
        {:else if stat.type === "d20_ability_score"}
            <label class="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={stat.hasProficiency}
                    onchange={(e) =>
                        updateStat(index, {
                            hasProficiency: (e.target as HTMLInputElement)
                                .checked,
                        })}
                />
                <span>Has Proficiency Toggle</span>
            </label>
            <label class="mt-2 block">
                <span class="label">Base Value</span>
                <input
                    type="number"
                    value={stat.baseValue}
                    onchange={(e) =>
                        updateStat(index, {
                            baseValue: Number(
                                (e.target as HTMLInputElement).value,
                            ),
                        })}
                />
            </label>
        {:else if stat.type === "choice"}
            <p class="text-low">Choice options editor coming in Phase 3.</p>
        {/if}
    </div>
</div>
