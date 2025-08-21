<script lang="ts">
import { ASSET_LICENSES_KEYS } from '@schemas/AssetSchema';
import { t } from '@utils/i18n';

interface Props {
  value: string;
  onchange: (e: Event) => void;
}
const { value, onchange }: Props = $props();
</script>

<label>
  {t('entries:assets.license')}
  <select {value} {onchange}>
    {#each ASSET_LICENSES_KEYS as license}
      <option 
        selected={value === license}
        value={license}>{t(`site:license.${license}`)}</option>
    {/each}
  </select>
</label>