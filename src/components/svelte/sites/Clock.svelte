<script lang="ts">
import type { Clock } from '@schemas/ClockSchema';
import { uid } from '@stores/session';
import type { CnStoryClock } from 'cn-story-clock/src';
import { site } from '../../../stores/site';
import { updateClock } from '../../../stores/site/clocksStore';

interface Props {
  clock: Clock;
}
const { clock }: Props = $props();

const view = $derived.by(() => !$site?.owners.includes($uid) || undefined);

async function handleChange(event: CustomEvent) {
  const { value } = event.target as CnStoryClock;
  await updateClock({ ...clock, stage: value });
}
</script>

<div class="flex align-center flex-no-wrap">
  <cn-story-clock 
    {view}
    onchange={handleChange}
    tabindex="0"
    role="button"
    name={clock.label} 
    value={clock.stage} 
    >
    {#each clock.ticks as tick}
      <cn-tick size={tick}></cn-tick>
    {/each}
  </cn-story-clock>
  <p class="grow">{clock.label} {view}
  {#if !view}
    <br>
    <code>clock:{clock.key}</code>
  {/if}
  </p>
  {#if !view}
    <a href={`/sites/${$site?.key}/delete/clock/${clock.key}`} aria-label="delete" class="button text">
      <cn-icon noun="delete"></cn-icon>
    </a>
  {/if}
</div>