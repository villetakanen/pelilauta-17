<script lang="ts">
/**
 * Single text stat display/edit component
 *
 * Props:
 * - key
 * - value
 * - onchange (function to call on value change)
 *
 * The stats are put intoa grid of 2 cols, in case
 * of interactive mode, the input spans bot cols
 */
interface Props {
  interactive: boolean;
  key: string;
  value: string;
  onchange: (newValue: string) => void;
}
const { key, value, onchange, interactive }: Props = $props();
</script>

{#if interactive}
  <label class="span-cols-2">
    <span>{key}</span>
    <input
      type="text"
      value={value}
      onchange={(e) => onchange((e.target as HTMLInputElement).value)}
    />
  </label>
{:else}
  <span class="text-small text-high">{key}</span>
  <span class="text-low">{value}</span>
{/if}

<style>
.span-cols-2 {
  grid-column: span 2;
}
</style>

