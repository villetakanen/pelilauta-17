<script lang="ts">
import type { Site } from '@schemas/SiteSchema';
import { uid } from '@stores/session';
import { userSites } from '@stores/userSites';
import { t } from '@utils/i18n';
import { logDebug } from '@utils/logHelpers';

interface Props {
  selectedSiteKey: string;
  setSelectedSite: (siteKey: string, site: Site | null) => void;
}

const { selectedSiteKey, setSelectedSite }: Props = $props();

// Use the userSites store which contains sites the user owns or plays in
const sites = $derived($userSites || []);
const loading = $derived(!$uid); // Loading if no user authenticated

$effect(() => {
  logDebug('SiteSelect', 'Available sites:', sites);
});

// Auto-select site when sites are loaded and selectedSiteKey is prefilled
$effect(() => {
  if (selectedSiteKey && sites.length > 0) {
    const prefillSite = sites.find((site) => site.key === selectedSiteKey);
    if (prefillSite) {
      setSelectedSite(selectedSiteKey, prefillSite);
    }
  }
});

function handleSelectionChange(event: Event) {
  const select = event.target as HTMLSelectElement;
  const selectedKey = select.value;

  if (selectedKey === '') {
    setSelectedSite('', null);
    return;
  }

  const selectedSite = sites.find((site) => site.key === selectedKey) || null;
  setSelectedSite(selectedKey, selectedSite);
}
</script>

<label>
  {t('entries:character.site')}
  <select
    value={selectedSiteKey || ''}
    onchange={handleSelectionChange}
    disabled={loading}
  >
    <option value="">{loading ? t('actions:loading') : t('characters:create.noSite')}</option>
    {#each sites as site}
      <option value={site.key}>{site.name}</option>
    {/each}
  </select>
</label>

<p class="downscaled text-low">{t('characters:sites.select.description')}</p>

{#if !loading && sites.length === 0}
  <p class="downscaled text-low">
    {t('characters:sites.select.empty')} 
    <a href="/sites/new">{t('actions:create.site')}</a>
  </p>
{/if}
