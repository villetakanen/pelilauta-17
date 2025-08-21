<script lang="ts">
import type { Site } from '@schemas/SiteSchema';
import { site } from '@stores/site';
import { t } from '@utils/i18n';
import { logError } from '@utils/logHelpers';
import { onMount } from 'svelte';
import MembersOnly from '../MembersOnly.svelte';
import HandoutList from './HandoutList.svelte';

/**
 * Handouts application for site members.
 * Manages handout display and member-only access control.
 */
interface Props {
  /** Site data to initialize the global site store */
  site: Site;
}

const { site: initialSite }: Props = $props();
let isInitialized = $state(false);
let hasError = $state(false);

// Derived state for better reactivity
const currentSite = $derived.by(() => $site || initialSite);

onMount(() => {
  try {
    if (!$site || $site.key !== initialSite.key) {
      site.set(initialSite);
    }
    isInitialized = true;
  } catch (error) {
    logError('HandoutsApp', 'Failed to initialize site data:', error);
    hasError = true;
  }
});
</script>

<div class="content-columns">
  <MembersOnly site={currentSite}>


  {#if hasError}
    <div class="column-l p-4 text-center">
      <p class="text-error">{t('errors:loadingFailed')}</p>
      <button 
        onclick={() => window.location.reload()} 
        class="btn btn-secondary mt-2"
      >
        {t('common:retry')}
      </button>
    </div>
  {:else if !isInitialized}
    <div class="column-l p-4">
      <p class="text-light">{t('common:loading')}</p>
    </div>
  {:else}
    
      <article class="column-l">
        <h2>{t('site:handouts.title')}</h2>
        <p class="text-light">{t('site:handouts.description')}</p>

        <HandoutList />
      </article>
  {/if}
  </MembersOnly>
</div>