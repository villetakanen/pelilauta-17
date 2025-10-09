<script lang="ts">
import type { CnToggleButton } from '@11thdeg/cyan-lit';

// This is a child component of SettingsApp.svelte, which sets up the site store
import { site, update } from '@stores/site';
import { t } from '@utils/i18n';

async function setHidden(e: Event) {
  const value = (e.target as CnToggleButton).pressed;
  await update({ hidden: value });
}
</script>

{#if $site}
  <fieldset>
    <legend>{t('site:settings.meta.extra')}</legend>
  
    <cn-toggle-button
      label={t('entries:site.hidden')}
      pressed={$site.hidden}
      onchange={setHidden}></cn-toggle-button>
  
    <p class="text-caption text-low">
      {t('site:create.hidden.description')}
    </p>
  </fieldset>
{/if}