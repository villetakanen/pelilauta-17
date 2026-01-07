<script lang="ts">
/**
 * Choice stat component for selecting from a list of options.
 *
 * This is a pure presentational component - options are always passed via props.
 * The sheet template (CharacterSheet) is responsible for storing the resolved options.
 * Any dynamic option loading (e.g., from a `ref` path) happens at sheet creation/editing time,
 * not at character view time.
 */
import type { ChoiceOption } from '@schemas/CharacterSheetSchema';

interface Props {
  label: string;
  value: string;
  options: ChoiceOption[];
  interactive: boolean;
  onchange: (newValue: string) => void;
  disabled: boolean;
}

const { label, value, options, interactive, onchange, disabled }: Props =
  $props();

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  onchange(target.value);
}

// Find the display label for the current value
const displayLabel = $derived(
  options.find((o) => o.value === value)?.label ?? value ?? '—',
);
</script>

{#if interactive}
  <label class="span-cols-2">
    <span>{label}</span>
    <select {value} onchange={handleChange} {disabled}>
      <option value="">-- Select --</option>
      {#each options as option}
        <option value={option.value} selected={value === option.value}>
          {option.label}
        </option>
      {/each}
    </select>
  </label>
{:else}
  <span class="text-small text-high">{label}</span>
  <span class="text-low">{displayLabel}</span>
{/if}

<style>
  .span-cols-2 {
    grid-column: span 2;
  }
</style>
