<script lang="ts">
import type { Site } from '@schemas/SiteSchema';
import { t } from '@utils/i18n';

interface Props {
  site: Site;
  homepage: string;
  setHomepage: (key: string) => void;
}
const { site, setHomepage, homepage }: Props = $props();
const pageRefsAsOptions = $derived.by(() => {
  if (!site.pageRefs) return [];
  return site.pageRefs.map((pageRef) => {
    return [pageRef.key, pageRef.name];
  });
});
</script>

<label>{t('entries:site.homePage')}
  <select
    onchange={(e) => setHomepage((e.target as HTMLSelectElement).value)}
  >
    {#each pageRefsAsOptions as [key, name]}
      <option
        value={key}
        selected={homepage === key}
      >{name}</option>
    {/each}
  </select>
</label>