<script lang="ts">
import { updateSiteAsset } from '@firebase/client/site/updateSiteAsset';
import type { Asset } from '@schemas/AssetSchema';
import type { Site } from '@schemas/SiteSchema';
import { t } from '@utils/i18n';
import { logError } from '@utils/logHelpers';
import LicenseSelect from './LicenseSelect.svelte';

import { pushSnack } from '@utils/client/snackUtils';

interface Props {
  site: Site;
  asset: Asset;
}
const { asset, site }: Props = $props();
let name = $state(asset.name);
let description = $state(asset.description);
let license = $state(asset.license);

const hasChanges = $derived.by(() => {
  return (
    name !== asset.name ||
    description !== asset.description ||
    license !== asset.license
  );
});

async function onsubmit(event: Event) {
  event.preventDefault();

  // Remove whitespace for sanity
  name = name.trim();
  description = description.trim();
  license = license.trim();

  try {
    await updateSiteAsset(site, {
      storagePath: asset.storagePath,
      name,
      description,
      license,
    });
    pushSnack(t('site:assets.asset_updated'));
  } catch (e) {
    logError('Failed to update asset', e);
    pushSnack(t('site:assets.failed_to_update_asset'));
  }
}
</script>

<form {onsubmit}>
  <label>
    {t('entries:assets.name')}
    <input
      type="text"
      bind:value={name}
      disabled
    />
  </label>
    <label>
        {t('entries:assets.description')}
        <textarea
        bind:value={description}
        ></textarea>
    </label>
  <LicenseSelect 
    value={license}
    onchange={(e: Event) => {
      license = (e.target as HTMLSelectElement).value;
    }} />
  <button
    disabled={!hasChanges}
    type="submit">
    {t('actions:save')}
  </button>
</form>


