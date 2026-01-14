<script lang="ts">
/**
 * Renders a D20 ability score stat (e.g., Strength 16 (+3)).
 *
 * Uses the cn-d20-ability-score web component from @11thdeg/cyan-lit.
 */
import type { D20AbilityStat } from '../types';

interface Props {
  stat: D20AbilityStat;
  value: number;
  readonly?: boolean;
  onchange?: (value: number) => void;
}

const { stat, value, readonly = true, onchange }: Props = $props();

function handleInput(e: Event) {
  const target = e.target as HTMLElement & { base: number };
  if (onchange) {
    onchange(target.base);
  }
}
</script>

<cn-d20-ability-score
  label={stat.key}
  base={value}
  interactive={!readonly}
  oninput={handleInput}
></cn-d20-ability-score>
