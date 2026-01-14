<script lang="ts">
/**
 * Renders a numeric stat with optional edit capability.
 */
import type { NumberStat } from '../types';

interface Props {
  stat: NumberStat;
  value: number;
  readonly?: boolean;
  onchange?: (value: number) => void;
}

const { stat, value, readonly = true, onchange }: Props = $props();

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const newValue = Number.parseInt(target.value, 10);
  if (!Number.isNaN(newValue) && onchange) {
    onchange(newValue);
  }
}
</script>

<div class="stat stat--number">
  <label class="stat__label">{stat.key}</label>
  {#if readonly}
    <span class="stat__value">{value}</span>
  {:else}
    <input
      type="number"
      class="stat__input"
      {value}
      oninput={handleInput}
    />
  {/if}
</div>
