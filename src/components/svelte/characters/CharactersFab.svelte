<script lang="ts">
import type { Site } from '@schemas/SiteSchema';
import { uid } from '@stores/session';
import { t } from '@utils/i18n';

interface Props {
  site: Site;
}

const { site }: Props = $props();

const visible = $derived.by(() => {
  if (!$uid) return false;

  // Check if user is owner or player of the site
  if (site.owners.includes($uid)) return true;
  if (site.players?.includes($uid)) return true;

  return false;
});
</script>

{#if visible}
  <a
    href="/create/character?siteKey={site.key}"
    class="fab"
    aria-label={t('actions:create.character')}
  >
    <cn-icon noun="add" small></cn-icon>
    <span class="sm-hidden">{t('actions:create.character')}</span>
  </a>
{/if}