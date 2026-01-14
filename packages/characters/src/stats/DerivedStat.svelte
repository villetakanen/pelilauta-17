<script lang="ts">
/**
 * Renders a derived stat (formula-based, read-only display).
 *
 * Note: Formula evaluation is not implemented yet.
 * This component displays the formula or a placeholder value.
 */
import type { DerivedStat } from '../types';

interface Props {
  stat: DerivedStat;
  value?: string | number;
  readonly?: boolean;
}

const { stat, value }: Props = $props();

const displayValue = $derived(value ?? stat.formula);
</script>

<div class="stat stat--derived">
  <label class="stat__label">{stat.key}</label>
  <span class="stat__value text-low">{displayValue}</span>
</div>
