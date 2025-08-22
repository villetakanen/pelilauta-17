<script lang="ts">
import type { Handout } from 'src/schemas/HandoutSchema';
import type { Site } from 'src/schemas/SiteSchema';
import { uid } from 'src/stores/session';
import { t } from 'src/utils/i18n';

interface Props {
  handout: Handout;
  site: Site;
}

const { site, handout }: Props = $props();

const visible = $derived.by(() => {
  if (site.owners.includes($uid)) return true;
  return false;
});
</script>
    
    {#if visible}
      <a
        href={`/sites/${site.key}/handouts/${handout.key}/edit`}
        class="fab"
      >
        <cn-icon noun="edit" small></cn-icon>
        <span class="sm-hidden">{t('actions:edit')}</span>
      </a>
    {/if}