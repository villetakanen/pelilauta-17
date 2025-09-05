<script lang="ts">
import { t } from 'src/utils/i18n';
import { site } from '../../../../stores/site';
import MembersOnly from '../MembersOnly.svelte';
import HandoutList from './HandoutList.svelte';

/**
 * Handouts application for site members.
 * Manages handout display and member-only access control.
 */

// Site is now derived directly from the store, which is initialized by SiteStoreInitializer
const currentSite = $derived.by(() => $site);
</script>

<div class="content-columns">
  {#if currentSite}
    <MembersOnly site={currentSite}>
      <article class="column-l">
        <h2>{t('site:handouts.title')}</h2>
        <p class="text-light">{t('site:handouts.description')}</p>

        <HandoutList />
      </article>
    </MembersOnly>
  {:else}
    <div class="column-l p-4">
      <p class="text-light">{t('common:loading')}</p>
    </div>
  {/if}
</div>
