<script lang="ts">
import { CyanToggleButton } from '@11thdeg/cyan-next';
import type { Site } from '@schemas/SiteSchema';
import { t } from '@utils/i18n';
import { site, update } from '../../../stores/site';
import SitePageSelect from './SitePageSelect.svelte';

interface Props {
  site: Site;
}
const { site: initialSite }: Props = $props();
$site = initialSite;

async function setOption(
  option:
    | 'useClocks'
    | 'useHandouts'
    | 'useRecentChanges'
    | 'useSidebar'
    | 'usePlainTextURLs'
    | 'useCharacters',
  value: boolean,
) {
  update({ [option]: value });
}

async function setSidebarKey(key: string) {
  update({ sidebarKey: key });
}
</script>

<div class="content-columns">
  <article>
    <h2>{t('site:options.title')}</h2>

    <p class="downscaled">{t('site:options.description')}</p>

    <fieldset>
      <legend>{t('site:options.tools')}</legend>
    <cn-toggle-button 
      label={t('site:options.useClocks')}
      pressed={$site.useClocks || undefined}
      onchange={(e: Event) => setOption('useClocks', (e.target as CyanToggleButton).pressed)}
    ></cn-toggle-button>

    <cn-toggle-button 
      label={t('site:options.useHandouts')}
      pressed={$site.useHandouts || undefined}
      onchange={(e: Event) => setOption('useHandouts', (e.target as CyanToggleButton).pressed)}
    ></cn-toggle-button>

    <cn-toggle-button 
      label={t('site:options.useCharacters')}
      pressed={$site.useCharacters || undefined}
      onchange={(e: Event) => setOption('useCharacters', (e.target as CyanToggleButton).pressed)}
    ></cn-toggle-button>

    <cn-toggle-button 
      label={t('site:options.useRecentChanges')}
      pressed={$site.useRecentChanges || undefined}
      onchange={(e: Event) => setOption('useRecentChanges', (e.target as CyanToggleButton).pressed)}
    ></cn-toggle-button>
    </fieldset>

    <fieldset>
      <legend>{t('site:options.sidebar')}</legend>
      <cn-toggle-button 
        label={t('site:options.useSidebar')}
        pressed={$site.useSidebar || undefined}
        onchange={(e: Event) => setOption('useSidebar', (e.target as CyanToggleButton).pressed)}
      ></cn-toggle-button>

      {#if $site.useSidebar}
        <SitePageSelect 
          site={$site}
          selectedPageKey={$site.sidebarKey || ''}
          setSelectedPageKey={setSidebarKey}
          label={t('site:options.sidebarPage')}
          placeholder={t('site:options.useDefaultSidebar')}
        />
        <p class="downscaled text-low">{t('site:options.sidebarPageDescription')}</p>
      {/if}
    </fieldset>

    <fieldset>
      <legend>{t('site:options.extras')}</legend>

    <cn-toggle-button 
      label={t('entries:site.customPageKeys')}
      pressed={$site.usePlainTextURLs || undefined}
      onchange={(e: Event) => setOption('usePlainTextURLs', (e.target as CyanToggleButton).pressed)}
    ></cn-toggle-button>

    <p class="downscaled text-low">{t('site:create.plaintexturls.description')}</p>
    </fieldset>
  </article>
</div>