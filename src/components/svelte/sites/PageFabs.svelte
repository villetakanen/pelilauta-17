<script lang="ts">
import type { Site } from '@schemas/SiteSchema';
import { uid } from '@stores/session';
import { t } from '@utils/i18n';

interface Props {
  site: Site;
  pageKey: string;
}

const { site, pageKey }: Props = $props();

const visible = $derived.by(() => {
  if (site.owners.includes($uid)) return true;
  if (site.players?.includes($uid)) return true;
  return false;
});
</script>

{#if visible}
  <a
    href={`/sites/${site.key}/create/page`}
    class="fab secondary small"
  >
    <cn-icon noun="add" small></cn-icon>
    <span class="sm-hidden">{t('actions:create.page')}</span>
  </a>
  <a
    href={`/sites/${site.key}/${pageKey}/edit`}
    class="fab"
  >
    <cn-icon noun="edit" small></cn-icon>
    <span class="sm-hidden">{t('actions:edit')}</span>
  </a>
{/if}