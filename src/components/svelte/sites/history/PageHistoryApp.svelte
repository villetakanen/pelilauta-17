<script lang="ts">
import {
  type PageHistory,
  PageHistorySchema,
} from '@schemas/PageHistorySchema';
import type { Page } from '@schemas/PageSchema';
import type { Site } from '@schemas/SiteSchema';
import { uid } from '@stores/session';
import { site } from '@stores/site';
import WithAuth from '@svelte/app/WithAuth.svelte';
import { t } from '@utils/i18n';
import PageHistoryArticle from './PageHistoryArticle.svelte';
import PageHistoryIndex from './PageHistoryIndex.svelte';

/**
 * A Wrapper for the SiteMembersApp component,
 * Inits the site-store and subscribes to the Site Entry in the Firestore
 */

interface Props {
  site: Site;
  page: Page;
  revision: number;
}
const { site: initialSite, page, revision }: Props = $props();
$site = initialSite;
let diff = $state<PageHistory | null>(null);
const allow = $derived.by(() => {
  return $site.owners.includes($uid);
});

$effect(() => {
  async function loadDiff() {
    if (!page || !page.siteKey || !page.key) {
      throw new Error('Page or siteKey is not defined');
    }

    try {
      // Fetch the page history document
      const response = await fetch(
        `/api/sites/${page.siteKey}/pages/${page.key}/diff`,
      );
      if (!response.ok) {
        throw new Error(
          t('site:page.history.errors.fetch_failed', {
            status: response.status,
          }),
        );
      }

      const historyDoc = PageHistorySchema.parse(await response.json());

      // If revision is not specified, default to the most recent one
      if (revision < 1 || revision > historyDoc.history.length) {
        throw new Error(t('site:page.history.errors.invalid_revision'));
      }

      // Set the page's revision history
      diff = historyDoc;
    } catch (error) {
      console.error('Error loading page history:', error);
    }
  }
  loadDiff();
});
</script>

<WithAuth {allow}>
  <div class="content-columns">
    {#if diff }
      <PageHistoryArticle {page} {diff} {revision}/>
      <PageHistoryIndex {page} {diff} {revision}/>
    {/if}
  </div>
</WithAuth>