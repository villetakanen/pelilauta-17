<script lang="ts">
import { uid } from '@stores/session';
import { t } from '@utils/i18n';
/*
 * A header component for the CharacterApp microfrontend.
 * Displays character name and edit button if permitted.
 */
import { character } from 'src/stores/characters/characterStore';

const canEdit = $derived.by(() => {
  return $character?.owners?.includes($uid);
});
</script>

<header class="flex">
  <div>
    <h1 class="text-h3 mb-0">{$character?.name}</h1>
    <p class="text-small text-low">{$character?.description}</p>
  </div>
  {#if canEdit}
    <a href={`/characters/${$character?.key}/edit`} class="text button" style="flex-grow:0">
      <cn-icon noun="edit"></cn-icon>
      <span>{t('actions:edit')}</span>
    </a>
  {/if}
</header>