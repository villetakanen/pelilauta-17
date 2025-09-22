<script lang="ts">
import { CnToggleButton } from '@11thdeg/cyan-lit';
/*
 * A header component for the CharacterApp microfrontend.
 * Displays character name and edit button if permitted.
 */
import type { Character } from '@schemas/CharacterSchema';
import { isEditing } from '@stores/characters/characterSheetState';
import { uid } from '@stores/session';
import { t } from '@utils/i18n';

interface Props {
  character: Character;
}
const { character }: Props = $props();

const canEdit = $derived.by(() => {
  return character?.owners?.includes($uid);
});
</script>

<header>
  <div class="toolbar">
    <h1 class="mb-0 grow">{character?.name}</h1>
    {#if canEdit}
      <cn-toggle-button
        label={t('characters:sheets.mode.edit')}
        pressed={$isEditing}
        onchange={(e: Event) => isEditing.set((e.target as CnToggleButton).pressed)}
      ></cn-toggle-button>
    {/if}
  </div>
  <p class="text-small text-low">{character?.description}</p>
</header>
