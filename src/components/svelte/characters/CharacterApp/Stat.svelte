<script lang="ts">
/**
 * Single character stat display/edit component.
 *
 * Shows editable fields when the user is the owner of the character.
 */

import type { CharacterStat } from '@schemas/CharacterSheetSchema';
import { isEditing } from '@stores/characters/characterSheetState';
import { character, update } from '@stores/characters/characterStore';
import { uid } from '@stores/session';
import { logError } from '@utils/logHelpers';
import NumberStat from './NumberStat.svelte';
import TextStat from './TextStat.svelte';
import ToggledStat from './ToggledStat.svelte';

interface Props {
  // The stat to display/edit
  key: string;
}

const { key }: Props = $props();
const stat = $derived.by(() => {
  return $character?.sheet?.stats.find((s) => s.key === key);
});

const owns = $derived.by(() => $character?.owners?.includes($uid) || false);
const canEdit = $derived.by(() => owns && $isEditing);

let saving = $state(false);
let error = $state<string | null>(null);

async function updateStat(key: string, value: string | number | boolean) {
  saving = true;
  error = null;
  const c = { ...$character };
  if (!c?.sheet?.stats) return;
  const statToUpdate = c.sheet.stats.find((s) => s.key === key);
  if (statToUpdate) {
    statToUpdate.value = value;
    try {
      await update(c);
    } catch (e) {
      logError('Stat.svelte', `Failed to update stat ${key}`, e);
      error = 'Failed to save';
      // TODO: Rollback state on failure
    } finally {
      saving = false;
    }
  }
}
</script>

{#if stat}
  {#if stat.type === 'text'}
    <TextStat
      label={stat.key}
      value={String(stat.value)}
      interactive={canEdit}
      onchange={(newValue) => updateStat(stat.key, newValue)}
      disabled={saving}
    />
  {:else if stat.type === 'number'}
    <NumberStat
      label={stat.key}
      value={Number(stat.value)}
      interactive={canEdit}
      onchange={(newValue) => updateStat(stat.key, newValue)}
      disabled={saving}
    />
  {:else if stat.type === 'toggled'}
    <ToggledStat
      label={stat.key}
      value={Boolean(stat.value)}
      interactive={canEdit}
      onchange={(newValue) => updateStat(stat.key, newValue)}
      disabled={saving}
    />
  {:else}
    <div>{stat.key}</div>
  {/if}
  {#if error}
    <p class="text-error text-small">{error}</p>
  {/if}
{/if}
