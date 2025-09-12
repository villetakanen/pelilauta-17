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

<header>
  <div class="toolbar">
  <h1 class="text-h3 mb-0 grow">{$character?.name}</h1>
  {#if canEdit}
    
    <cn-menu>
      <ul>
        <li>
          <a href={`/characters/${$character?.key}/edit`}>
      <cn-icon xsmall noun="edit"></cn-icon>
      <span>{t('actions:edit')}</span>
    </a>
        </li>
        <li>
          <a href={`/characters/${$character?.key}/delete`}>
            <cn-icon xsmall noun="delete"></cn-icon>
            <span>{t('actions:delete')}</span>
          </a>
        </li>
      </ul>

    </cn-menu>
  {/if}
  </div>
  <p class="text-small text-low">{$character?.description}</p>
</header>