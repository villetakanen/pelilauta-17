<script lang="ts">
/**
 * Single character stat display/edit component.
 *
 * Shows editable fields when the user is the owner of the character.
 */

import type { CharacterStat } from '@schemas/CharacterSheetSchema';
import { isEditing } from '@stores/characters/characterSheetState';
import { resolvedCharacter, update } from '@stores/characters/characterStore';
import { uid } from '@stores/session';
import { logError } from '@utils/logHelpers';
import NumberStat from './NumberStat.svelte';
import TextStat from './TextStat.svelte';
import ToggledStat from './ToggledStat.svelte';

interface Props {
  // The stat to display/edit, from the character sheet
  stat: CharacterStat;
}

const { stat }: Props = $props();

const statValue = $derived.by(() => {
    return $resolvedCharacter?.stats[stat.key] ?? stat.value;
});

const owns = $derived.by(() => $resolvedCharacter?.owners?.includes($uid) || false);
const canEdit = $derived.by(() => owns && $isEditing);

let saving = $state(false);
let error = $state<string | null>(null);

async function updateStat(key: string, value: string | number | boolean) {
  saving = true;
  error = null;
  
  if (!$resolvedCharacter) return;

  const newStats = { ...$resolvedCharacter.stats, [key]: value };

  try {
    await update({ stats: newStats });
  } catch (e) {
    logError('Stat.svelte', `Failed to update stat ${key}`, e);
    error = 'Failed to save';
    // TODO: Rollback state on failure
  } finally {
    saving = false;
  }
}
</script>

{#if stat}
  {#if stat.type === 'text'}
    <TextStat
      label={stat.key}
      value={String(statValue)}
      interactive={canEdit}
      onchange={(newValue) => updateStat(stat.key, newValue)}
      disabled={saving}
    />
  {:else if stat.type === 'number'}
    <NumberStat
      label={stat.key}
      value={Number(statValue)}
      interactive={canEdit}
      onchange={(newValue) => updateStat(stat.key, newValue)}
      disabled={saving}
    />
  {:else if stat.type === 'toggled'}
    <ToggledStat
      label={stat.key}
      value={Boolean(statValue)}
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
