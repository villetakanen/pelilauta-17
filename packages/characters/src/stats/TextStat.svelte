<script lang="ts">
/**
 * Renders a text stat with optional edit capability.
 */
import type { TextStat } from '../types';

interface Props {
  stat: TextStat;
  value: string;
  readonly?: boolean;
  onchange?: (value: string) => void;
}

const { stat, value, readonly = true, onchange }: Props = $props();

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  if (onchange) {
    onchange(target.value);
  }
}
</script>

<div class="stat stat--text">
  <label class="stat__label">{stat.key}</label>
  {#if readonly}
    <span class="stat__value">{value}</span>
  {:else}
    <input
      type="text"
      class="stat__input"
      {value}
      oninput={handleInput}
    />
  {/if}
</div>
