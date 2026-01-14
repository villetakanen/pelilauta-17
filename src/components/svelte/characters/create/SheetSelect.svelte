<script lang="ts">
/**
 * Sheet selection component for character creation.
 *
 * TODO: Implement static sheet loading from src/data/character-sheets/
 * See: docs/ADR-001-static-character-sheets.md
 */

interface Props {
  system: string;
  selected: string | undefined;
  onSelect: (key: string, name: string) => void;
}

const { selected, onSelect }: Props = $props();

// TODO: Load sheets from static data when implemented
// For now, only "Markdown only" option is available
</script>

<div class="sheet-select">
  <button
    class="border p-2"
    class:selected={!selected}
    onclick={() => onSelect("-", "Markdown only")}
  >
    Markdown only
  </button>
  <!-- TODO: Add sheet options when static data is implemented -->
</div>
