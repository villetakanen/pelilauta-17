<script lang="ts">
import type { Site } from 'src/schemas/SiteSchema';
import { uid } from 'src/stores/session';
import { t } from 'src/utils/i18n';

interface Props {
  site: Site;
}

const { site }: Props = $props();

const visible = $derived.by(() => {
  if (site.owners.includes($uid)) return true;
  return false;
});
</script>

{#if visible}
  <a
    href={`/sites/${site.key}/create/clock`}
    class="fab"
  >
    <cn-icon noun="add" small></cn-icon>
    <span class="sm-hidden">{t('actions:create.clock')}</span>
  </a>
{/if}