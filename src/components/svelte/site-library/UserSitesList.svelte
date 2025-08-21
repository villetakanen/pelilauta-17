<script lang="ts">
import { uid } from '@stores/session/';
import { userSites } from '@stores/userSites/index.ts';
import { t } from '@utils/i18n.ts';
import { onMount } from 'svelte';
import FilteredSites from './FilteredSites.svelte';
import { filters, toggleOrder } from './filters.svelte.ts';
const directionNoun = $derived(
  filters.orderDirection === 'asc' ? 'arrow-up' : 'arrow-down',
);

onMount(() => {
  if (!$uid) {
    // Redirect to public site list if not logged in
    window.location.href = '/sites';
  }
});
</script>

<div class="content-cards">
   <div class="full-width">
      <div class="toolbar">
        <h4 class="grow">{t('library:sites.title')}</h4>
        <button class="text" aria-label={directionNoun} onclick={toggleOrder}>
          <cn-icon noun={directionNoun}></cn-icon>
        </button>
        <button
          class={filters.orderBy === 'name' ? '' : 'text'}
          onclick={() => filters.orderBy = 'name'}
        >
        {t('entries:site.name')}
        </button>
        <button
          class={filters.orderBy === 'flowTime' ? '' : 'text'}
          onclick={() => filters.orderBy = 'flowTime'}
        >
          {t('entries:site.flowTime')}
        </button>
      </div>
   </div>
   <FilteredSites />
   <div class="full-width mb-2">
      <p>{t('library:sites.count', { count: $userSites.length })}</p>
   </div>
</div>