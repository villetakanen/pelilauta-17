<script lang="ts">
import type { Site } from '@schemas/SiteSchema';
import { site } from '@stores/site';
import { t } from '@utils/i18n';
import MembersOnly from '../MembersOnly.svelte';
import ExportAsMdSection from './ExportAsMDSection.svelte';

interface Props {
  site: Site;
}
const { site: initialSite }: Props = $props();
$site = initialSite;
</script>

<div class="content-columns">
  <MembersOnly site={$site}>
    <section class="column-s">
      <h1>{t('site:data.title')}</h1>
      <p class="downscaled text-low">{t('site:data.description')}</p>
    </section>
    <ExportAsMdSection />
    <section class="column-s">
      <a href="/sites/{$site.key}/import" class="button">
      {t('site:import.title')} 
      </a>
    </section>
  </MembersOnly>
</div>