<script lang="ts">
import { updateSite } from 'src/firebase/client/site/updateSite';
import {
  type Site,
  type SiteSortOrder,
  SiteSortOrderSchema,
} from 'src/schemas/SiteSchema';
import { pushSnack } from 'src/utils/client/snackUtils';
import { t } from 'src/utils/i18n';
import { logError } from 'src/utils/logHelpers';
import { uid } from '../../../../stores/session';
import WithAuth from '../../app/WithAuth.svelte';
import SiteCategoriesTool from './SiteCategoriesTool.svelte';

interface Props {
  site: Site;
}
const { site }: Props = $props();

const sortOrder = $state(site.sortOrder);
//let chapters:CategoryRef[] = $state(site.pageCategories || []);

const sortOrderOptions = new Map<string, string>([
  ['name' as SiteSortOrder, t('entries:site.sortOrders.name')],
  ['createdAt' as SiteSortOrder, t('entries:site.sortOrders.createdAt')],
  ['flowTime' as SiteSortOrder, t('entries:site.sortOrders.flowTime')],
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