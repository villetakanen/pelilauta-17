<script lang="ts">
import type { Site } from '@schemas/SiteSchema';
import { t } from '@utils/i18n';
import SiteThemeImageInput from './SiteThemeImageInput.svelte';

interface Props {
  site: Site;
}
const { site }: Props = $props();
</script>

<section class="column-l">
  <h2>{t('site:settings.theming.title')}</h2>
  <SiteThemeImageInput site={site} imageField="backgroundURL" />
  <SiteThemeImageInput site={site} imageField="posterURL" />
  <SiteThemeImageInput site={site} imageField="avatarURL" />
</section>