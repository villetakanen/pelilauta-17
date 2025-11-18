<script lang="ts">
import type { CnListItem } from '@11thdeg/cyan-lit';
import { updatePageRefsOrder } from '@firebase/client/site/updatePageRefsOrder';
import type { PageRef, Site } from '@schemas/SiteSchema';
import { pushSnack } from '@utils/client/snackUtils';
import { t } from '@utils/i18n';
import { logDebug, logError } from '@utils/logHelpers';
import SvelteSortableList from '../../app/SvelteSortableList.svelte';

interface Props {
  site: Site;
}
const { site }: Props = $props();

let saving = $state(false);

// Group pages by category with derived state
const pagesByCategory = $derived.by(() => {
  const result = new Map<string, PageRef[]>();

  if (!site.pageRefs) return result;

  // Get all category slugs
  const categorySlugs = (site.pageCategories || []).map((cat) => cat.slug);

  // Group pages into their categories
  for (const page of site.pageRefs) {
    const categorySlug =
      page.category && categorySlugs.includes(page.category)
        ? page.category
        : '__uncategorized';

    if (!result.has(categorySlug)) {
      result.set(categorySlug, []);
    }
    result.get(categorySlug)?.push(page);
  }

  // Sort pages within each category by order field
  for (const pages of result.values()) {
    pages.sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }

  return result;
});

// Get categories for display
const categories = $derived(site.pageCategories || []);

/**
 * Handle reordering of pages within a category
 */
async function handleReorder(
  categorySlug: string,
  reorderedItems: CnListItem[],
) {
  saving = true;

  try {
    // Convert reordered items back to PageRefs
    const reorderedPageKeys = reorderedItems.map((item) => item.key);

    // Build the complete ordered pageRefs array
    const allPages: PageRef[] = [];

    // Process each category in order
    for (const category of categories) {
      const pages = pagesByCategory.get(category.slug) || [];

      if (category.slug === categorySlug) {
        // Use the reordered pages for this category
        for (const key of reorderedPageKeys) {
          const page = pages.find((p) => p.key === key);
          if (page) {
            allPages.push(page);
          }
        }
      } else {
        // Keep existing order for other categories
        allPages.push(...pages);
      }
    }

    // Add uncategorized pages at the end
    const uncategorized = pagesByCategory.get('__uncategorized') || [];
    if (categorySlug === '__uncategorized') {
      // Use the reordered pages for uncategorized
      for (const key of reorderedPageKeys) {
        const page = uncategorized.find((p) => p.key === key);
        if (page) {
          allPages.push(page);
        }
      }
    } else {
      // Keep existing order
      allPages.push(...uncategorized);
    }

    logDebug('ManualTocOrdering', 'Updating page order', {
      siteKey: site.key,
      categorySlug,
      pageCount: allPages.length,
    });

    // Update the site with the new order
    await updatePageRefsOrder(site.key, allPages);

    pushSnack(t('snack:site.tocOrderUpdated'));

    // Reload the page to reflect changes
    window.location.reload();
  } catch (error) {
    logError('ManualTocOrdering', 'Failed to update page order:', error);
    pushSnack(t('snack:site.tocOrderUpdateFailed'));
  } finally {
    saving = false;
  }
}

/**
 * Convert PageRef to CnListItem for the sortable list
 */
function pageRefToListItem(page: PageRef): CnListItem {
  return {
    key: page.key,
    title: page.name,
  };
}

/**
 * Handle items changed event from sortable list
 */
function createReorderHandler(categorySlug: string) {
  return (items: CnListItem[]) => {
    handleReorder(categorySlug, items);
  };
}
</script>

<section class="surface p-2">
  <h3 class="flex items-center gap-1">
    <cn-icon noun="sort"></cn-icon>
    {t("site:toc.manualOrder.title")}
  </h3>
  <p class="downscaled text-low mb-2">
    {t("site:toc.manualOrder.info")}
  </p>

  {#if saving}
    <div class="flex items-center gap-1 mb-2">
      <cn-loader size="small"></cn-loader>
      <span class="text-low">{t("site:toc.manualOrder.saving")}</span>
    </div>
  {/if}

  {#each categories as category}
    {@const pages = pagesByCategory.get(category.slug) || []}
    {#if pages.length > 0}
      <div class="mb-2">
        <h4 class="downscaled mb-1">{category.name}</h4>
        <SvelteSortableList
          items={pages.map(pageRefToListItem)}
          onItemsChanged={createReorderHandler(category.slug)}
        />
      </div>
    {/if}
  {/each}

  {@const uncategorized = pagesByCategory.get("__uncategorized") || []}
  {#if uncategorized.length > 0}
    <div class="mb-2">
      <h4 class="downscaled mb-1">{t("site:toc.uncategorized")}</h4>
      <SvelteSortableList
        items={uncategorized.map(pageRefToListItem)}
        onItemsChanged={createReorderHandler("__uncategorized")}
      />
    </div>
  {/if}
</section>
