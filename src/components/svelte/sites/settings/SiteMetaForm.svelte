<script lang="ts">
import type { CyanToggleButton } from '@11thdeg/cyan-next';
import type { Site } from '@schemas/SiteSchema';
import { update } from '@stores/site';
import { pushSnack } from '@utils/client/snackUtils';
import { t } from '@utils/i18n';
import SystemSelect from '../SystemSelect.svelte';
import LicenseSelect from '../assets/LicenseSelect.svelte';
import SiteHomepageSelect from './SiteHomepageSelect.svelte';

interface Props {
  site: Site;
}
const { site }: Props = $props();

let name = $state(site.name);
let description = $state(site.description);
let system = $state(site.system);
let hidden = $state(site.hidden);
let homepage = $state(site.homepage ?? '');
let license = $state(site.license ?? '0'); // Default to 'none' if not set

const dirty = $derived.by(() => {
  if (name !== site.name) return true;
  if (site.description !== description) return true;
  if (site.system !== system) return true;
  if (site.homepage !== homepage) return true;
  if (site.license !== license) return true;
  return false;
});
function setName(e: Event) {
  name = (e.target as HTMLInputElement).value;
}
function setDescription(e: Event) {
  description = (e.target as HTMLTextAreaElement).value;
}
function setSystem(s: string) {
  system = s;
}
function setHomepage(key: string) {
  homepage = key;
}
function setLicense(e: Event) {
  const value = (e.target as HTMLSelectElement).value;
  license = value;
}

async function setHidden(e: Event) {
  const value = (e.target as CyanToggleButton).pressed;
  hidden = value;
  await update({ hidden: value });
}
function reset() {
  name = site.name;
}
async function handleSubmit(e: Event) {
  e.preventDefault();
  if (!dirty) return;
  const updates: Partial<Site> = {
    key: site.key,
  };
  if (name !== site.name) {
    updates.name = name;
  }
  if (description !== site.description) {
    updates.description = description;
  }
  if (system !== site.system) {
    updates.system = system;
  }
  if (homepage !== site.homepage) {
    updates.homepage = homepage;
  }
  if (license !== site.license) {
    updates.license = license;
  }
  await update(updates);
  pushSnack(t('site:settings.meta.saved'));
}
</script>

<section>
  <form
    onsubmit={handleSubmit}
    onreset={reset}
  >
    <h2>{t('site:settings.meta.title')}</h2>
    <fieldset>
      <label>{t('entries:site.name')}
        <input
          type="text"
          value={name}
          placeholder={t('entries:site.placeholders.name')}
          required
          name="name"
          minlength="3"
          oninput={setName}
        />
      </label>
      <label>{t('entries:site.description')}
        <textarea
          name="description"
          rows="3"
          oninput={setDescription}
          placeholder={t('entries:site.placeholders.description')}>{description}</textarea>
      </label>
      <SystemSelect
        {system}
        {setSystem}/>
      <SiteHomepageSelect
        {site} 
        {homepage}
        {setHomepage}/>
      <LicenseSelect value={license} onchange={setLicense}/>
    </fieldset>
    <div class="toolbar justify-end">
      <button type="button" onclick={reset} class="text" disabled={!dirty}>{t('actions:reset')}</button>
      <button type="submit" disabled={!dirty}>{t('actions:save')}</button>
    </div>
  </form>
  <h3>{t('site:settings.meta.extra')}</h3>
  <cn-toggle-button
    label={t('entries:site.hidden')}
    pressed={hidden}
    onchange={setHidden}></cn-toggle-button>
  <p class="downscaled mt-0 pt-0 px-1">
    {t('site:create.hidden.description')}
  </p>
</section>