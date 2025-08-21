<script lang="ts">
import type { Site } from '@schemas/SiteSchema';
import { canEdit, character, update } from '@stores/characters/characterStore';
import CharacterCard from '@svelte/characters/CharacterCard.svelte';
import { pushSnack } from '@utils/client/snackUtils';
import { t } from '@utils/i18n';
import { logError } from '@utils/logHelpers';
import SiteSelect from '../SiteSelect.svelte';

type modes = 'view' | 'edit';

let mode: modes = $state('view'); // Default mode is view
let name = $state('');
let description = $state('');
let selectedSiteKey = $state('');
let selectedSite: Site | null = $state(null);

$effect(() => {
  if ($character) {
    name = $character.name;
    description = $character.description ?? '';
    selectedSiteKey = $character.siteKey ?? '';
    selectedSite = null; // Will be set by SiteSelect component
  }
});

function toggleMode() {
  mode = mode === 'view' ? 'edit' : 'view';
}

function setSelectedSite(siteKey: string, site: Site | null) {
  selectedSiteKey = siteKey;
  selectedSite = site;
}

async function saveChanges(e: Event) {
  e.preventDefault();
  try {
    const updates: { name: string; description: string; siteKey?: string } = {
      name,
      description,
    };

    // Add siteKey if a site is selected, or set to undefined to remove it
    if (selectedSite) {
      updates.siteKey = selectedSite.key;
    } else {
      updates.siteKey = undefined;
    }

    await update(updates);
    mode = 'view'; // Switch back to view mode after saving
    pushSnack(t('characters:snacks:changesSaved'));
  } catch (error) {
    logError('CharacterInfo', 'Failed to save changes:', error);
    pushSnack(t('characters:snacks:changesSaveFailed'));
  }
}
</script>
{#if $character}
  <!-- View Mode!-->
  {#if mode === 'view'}
    <CharacterCard character={$character}>
      {#snippet actions()}
        {#if $canEdit}
          <div class="toolbar justify-end">
            <button class="text" onclick={toggleMode}>
              <cn-icon noun="edit" ></cn-icon>
              <!-- Use cn-icon for consistent icon styling -->
              <span>{t('actions:edit')}</span>
            </button>
            <a href ={`/characters/${$character.key}/delete`} class="text button">
              <cn-icon noun="delete" ></cn-icon>
              <span>{t('actions:delete')}</span>
            </a>
          </div>
        {/if}
      {/snippet}
    </CharacterCard>
  <!-- Edit Mode!-->
  {:else}
    <article class="elevation-1 p-2">
      <form onsubmit={saveChanges}>
        <label>
          {t('entries:character:name')}
          <input type="text" bind:value={name} />
        </label>
        <label>
          {t('entries:character:description')}
          <textarea bind:value={description}></textarea>
        </label>
        
        <SiteSelect 
          {selectedSiteKey}
          {setSelectedSite}
        />
        
        <div class="toolbar justify-end">
          <button type="button" class="button text" onclick={toggleMode}>
            {t('actions:cancel')}
          </button>
          <button type="submit" class="button primary">
            {t('actions:save')}
          </button>
        </div>
      </form>
    </article>
  {/if}
{/if}