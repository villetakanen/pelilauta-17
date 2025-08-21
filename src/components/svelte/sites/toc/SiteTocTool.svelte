<script lang="ts">
import { updateSite } from '@firebase/client/site/updateSite';
import {
  type Site,
  type SiteSortOrder,
  SiteSortOrderSchema,
} from '@schemas/SiteSchema';
import { uid } from '@stores/session';
import WithAuth from '@svelte/app/WithAuth.svelte';
import { pushSnack } from '@utils/client/snackUtils';
import { t } from '@utils/i18n';
import { logError } from '@utils/logHelpers';
import SiteCategoriesTool from './SiteCategoriesTool.svelte';

interface Props {
  site: Site;
}
const { site }: Props = $props();

const sortOrder = $state(site.sortOrder);
//let chapters:CategoryRef[] = $state(site.pageCategories || []);

const sortOrderOptions = new Map<string, string>([
  [SiteSortOrderSchema.Values.name, t('entries:site.sortOrders.name')],
  [
    SiteSortOrderSchema.Values.createdAt,
    t('entries:site.sortOrders.createdAt'),
  ],
  [SiteSortOrderSchema.Values.flowTime, t('entries:site.sortOrders.flowTime')],
]);

async function setSortOrder(e: Event) {
  const target = e.target as HTMLSelectElement;
  const value = target.value as SiteSortOrder;
  try {
    await updateSite(
      {
        key: site.key,
        sortOrder: value,
      },
      true,
    );
    // Lets notiufy the user about the update
    pushSnack(t('snack:site.sortOrderUpdated'));
  } catch (error) {
    logError(error);
    pushSnack(t('snack:site.sortOrderUpdateFailed'));
  }
}
</script> 

<WithAuth allow={site.owners.includes($uid)}>
  <div class="content-columns">
    <section>
      <h2>
        <cn-icon noun="tools"></cn-icon>
        {t('site:toc.admin.title')}
      </h2>
      <p>{t('site:toc.admin.info')}</p>
      <label>
        <span>{t('entries:site.sortOrder')}</span>
        <select onchange={setSortOrder}>
          {#each Array.from(sortOrderOptions.entries()) as [value, label]}
            <option
            selected={sortOrder === value}
            value={value}>{label}
            </option>
          {/each}
        </select>
      </label>
    </section>
    <SiteCategoriesTool {site} />
  </div>
</WithAuth>