<script lang="ts">
/*
 * A header component for the CharacterApp microfrontend.
 * Displays character name and edit button if permitted.
 */
import type { Character } from '@schemas/CharacterSchema';
import {
  isEditing,
  toggleEditing,
} from '@stores/characters/characterSheetState';
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
    <h1 class="text-h3 mb-0 grow">{character?.name}</h1>
    {#if canEdit}
      <button class="secondary" onclick={toggleEditing}>
        <cn-icon noun={$isEditing ? 'check' : 'edit'}></cn-icon>
        <span>{$isEditing ? t('actions:done') : t('actions:edit')}</span>
      </button>
    {/if}
  </div>
  <p class="text-small text-low">{character?.description}</p>
</header>
