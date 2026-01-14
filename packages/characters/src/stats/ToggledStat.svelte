<script lang="ts">
/**
 * Renders a boolean toggle stat.
 */
import type { ToggledStat } from '../types';

interface Props {
  stat: ToggledStat;
  value: boolean;
  readonly?: boolean;
  onchange?: (value: boolean) => void;
}

const { stat, value, readonly = true, onchange }: Props = $props();

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (onchange) {
    onchange(target.checked);
  }
}
</script>

<div class="stat stat--toggled flex">
  <label class="stat__label grow">{stat.key}</label>
  <input
    type="checkbox"
    class="stat__checkbox"
    checked={value}
    disabled={readonly}
    onchange={handleChange}
  />
</div>
