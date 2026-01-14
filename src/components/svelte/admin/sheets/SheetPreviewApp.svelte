<script lang="ts">
/**
 * Sheet Preview Application
 *
 * Admin tool for previewing character sheet templates with sample data.
 */

import { getAllSheets, getSheet } from '@data/character-sheets';
import { SheetRenderer } from '@pelilauta/characters';
import type { CharacterSheet } from '@schemas/CharacterSheetSchema';

// Get all available sheets
const sheets = getAllSheets();

// Selected sheet key
let selectedKey = $state(sheets[0]?.key ?? '');

// Current sheet
const currentSheet = $derived.by((): CharacterSheet | undefined => {
  return getSheet(selectedKey);
});

// Sample values for preview (editable)
let sampleValues = $state<Record<string, unknown>>({});

// Generate default sample values when sheet changes
$effect(() => {
  if (currentSheet) {
    const defaults: Record<string, unknown> = {};
    for (const stat of currentSheet.stats) {
      switch (stat.type) {
        case 'number':
          defaults[stat.key] = stat.value ?? 0;
          break;
        case 'text':
          defaults[stat.key] = stat.value ?? 'Sample';
          break;
        case 'toggled':
          defaults[stat.key] = stat.value ?? false;
          break;
        case 'choice':
          defaults[stat.key] = stat.options?.[0]?.value ?? '';
          break;
        case 'd20_ability_score':
          defaults[stat.key] = stat.baseValue ?? 10;
          break;
        case 'derived':
          defaults[stat.key] = stat.formula;
          break;
      }
    }
    sampleValues = defaults;
  }
});

// Handle value changes in preview
function handleChange(key: string, value: unknown) {
  sampleValues = { ...sampleValues, [key]: value };
}

// Toggle between readonly and interactive preview
let readonly = $state(true);
</script>

<div class="sheet-preview-app">
  <cn-card>
    <h2 class="downscaled" slot="title">Sheet Preview</h2>

    <div class="toolbar mb-2">
      <label class="flex items-center gap-1">
        <span>Sheet:</span>
        <select bind:value={selectedKey}>
          {#each sheets as sheet}
            <option value={sheet.key}>{sheet.name} ({sheet.system})</option>
          {/each}
        </select>
      </label>

      <label class="flex items-center gap-1 ml-2">
        <input type="checkbox" bind:checked={readonly} />
        <span>Read-only</span>
      </label>
    </div>
  </cn-card>

  {#if currentSheet}
    <div class="mt-2">
      <SheetRenderer
        sheet={currentSheet}
        values={sampleValues}
        {readonly}
        onchange={handleChange}
      />
    </div>

    <cn-card class="mt-2">
      <h3 class="downscaled" slot="title">Sample Values (JSON)</h3>
      <pre class="text-small overflow-auto p-1 border">{JSON.stringify(sampleValues, null, 2)}</pre>
    </cn-card>
  {:else}
    <p class="text-low">No sheets available. Add sheet definitions to src/data/character-sheets/</p>
  {/if}
</div>
