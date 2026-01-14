<script lang="ts">
/**
 * Renders a choice/select stat with predefined options.
 */
import type { ChoiceStat } from '../types';

interface Props {
  stat: ChoiceStat;
  value: string;
  readonly?: boolean;
  onchange?: (value: string) => void;
}

const { stat, value, readonly = true, onchange }: Props = $props();

const options = $derived(stat.options ?? []);

function handleChange(e: Event) {
  const target = e.target as HTMLSelectElement;
  if (onchange) {
    onchange(target.value);
  }
}

const displayValue = $derived.by(() => {
  const option = options.find((o) => o.value === value);
  return option?.label ?? value;
});
</script>

<div class="stat stat--choice">
  <label class="stat__label">{stat.key}</label>
  {#if readonly}
    <span class="stat__value">{displayValue}</span>
  {:else}
    <select class="stat__select" {value} onchange={handleChange}>
      <option value="">--</option>
      {#each options as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  {/if}
</div>
