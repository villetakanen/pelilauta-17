<script lang="ts">
/**
 * Sheet selection component for character creation.
 */
import { getSheetsBySystem } from '@data/character-sheets';

interface Props {
  system: string;
  selected: string | undefined;
  onSelect: (key: string, name: string) => void;
}

const { system, selected, onSelect }: Props = $props();

const filteredSheets = $derived(getSheetsBySystem(system));
</script>

<div class="sheet-select flex flex-wrap gap-1">
  <button
    class="border p-2"
    class:selected={!selected || selected === "-"}
    onclick={() => onSelect("-", "Markdown only")}
  >
    Markdown only
  </button>
  {#each filteredSheets as sheet}
    <button
      class="border p-2"
      class:selected={selected === sheet.key}
      onclick={() => onSelect(sheet.key, sheet.name)}
    >
      {sheet.name}
    </button>
  {/each}
</div>
