<script lang="ts">
/**
 * Single number stat display/edit component
 */
interface Props {
  interactive: boolean;
  label: string;
  value: number;
  onchange: (newValue: number) => void;
  disabled: boolean;
}
const { label, value, onchange, interactive, disabled }: Props = $props();
</script>

{#if interactive}
  <label class="span-cols-2">
    <span>{label}</span>
    <input
      type="number"
      value={value}
      onchange={(e) => onchange(Number((e.target as HTMLInputElement).value))}
      disabled={disabled}
    />
  </label>
{:else}
  <span class="text-small text-high">{label}</span>
  <span class="text-low">{value}</span>
{/if}

<style>
  .span-cols-2 {
    grid-column: span 2;
  }
</style>
