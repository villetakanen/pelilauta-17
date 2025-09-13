<script lang="ts">
/**
 * Single character stat display/edit component.
 *
 * Shows editable fields when the user is the owner of the character.
 */

import type { CharacterStat } from '@schemas/CharacterSheetSchema';
import { character, update } from '@stores/characters/characterStore';
import { uid } from '@stores/session';
import TextStat from './TextStat.svelte';

interface Props {
  // The stat to display/edit
  key: string;
}

const { key }: Props = $props();
const stat = $derived.by(() => {
  return $character?.sheet?.stats.find((s) => s.key === key);
});

const owns = $derived.by(() => $character?.owners?.includes($uid) || false);

function updateStat(key: string, value: string | number | boolean) {
  const c = { ...$character };
  if (!c?.sheet?.stats) return;
  const statToUpdate = c.sheet.stats.find((s) => s.key === key);
  if (statToUpdate) {
    statToUpdate.value = value;
    update(c);
  }
}
</script>

{#if stat}
  {#if stat.type === 'text'}
    <TextStat 
      key={stat.key} 
      value={String(stat.value)} 
      interactive={owns} 
      onchange={(newValue) => updateStat(stat.key, newValue)} />
  {:else if stat.type === 'number'}
      {#if owns}
        <label class="span-cols">
            <span class="sr-only">{stat.key}</span>
            <input
            type="number"
            value="{stat.value}"
            />
        </label>
        {:else}
        <div>
            {stat.value}
        </div>
      {/if}
  {:else if stat.type === 'toggled'}
    {#if owns}
      <div>
        <span>{stat.key}</span>
        <input
          type="checkbox"
          checked={stat.value}
        />
      </div>
    {:else}
      <div>
        <p class="text-overline m-0">{stat.key}</p>
        <p class="m-0">{stat.value ? '✔️' : '❌'}</p>
      </div>
    {/if}
  {:else}
    <div>
      {stat.key}
    </div>
  {/if}
{/if}