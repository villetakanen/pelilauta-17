<script lang="ts">
import type { Site } from '@schemas/SiteSchema';
import { uid } from '@stores/session';
import { t } from '@utils/i18n';
import { site } from '../../../stores/site';

interface Props {
  site: Site;
}

const { site: initialSite }: Props = $props();
$site = initialSite;
const member = $derived.by(() => {
  if (!$site) return false;
  return $site.owners.includes($uid) || $site.players?.includes($uid);
});
</script>
<nav class="border-t" style="flex: 0 0 auto;">
  <ul>
  {#if $site.useClocks}
    <li>
      <a href={`/sites/${$site.key}/clocks`} class="tray-button">
        <cn-icon noun="clock" xsmall></cn-icon>
        <span>{t('site:clocks.title')}</span>
      </a>
    </li>
  {/if}
  {#if $site.useHandouts && member}
    <li>
      <a href={`/sites/${$site?.key}/handouts`} class="tray-button">
        <cn-icon noun="books" xsmall></cn-icon>
        <span>{t('site:handouts.title')}</span>
      </a>
    </li>
  {/if}
  {#if $site.useCharacters }
    <li>
      <a href={`/sites/${$site?.key}/characters`} class="tray-button">
        <cn-icon noun="adventurer" xsmall></cn-icon>
        <span>{t('site:characters.title')}</span>
      </a>
    </li>
  {/if}
  </ul>
</nav>
          