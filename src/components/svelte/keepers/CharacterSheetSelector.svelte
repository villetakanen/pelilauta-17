<script lang="ts">
import { authedGet } from '@firebase/client/apiClient';
import type { CharacterSheet } from '@schemas/CharacterSheetSchema';
import { t } from '@utils/i18n';
import { onMount } from 'svelte';

interface Props {
  system: string;
  selectedSheetKey: string;
  setSelectedSheetKey: (key: string) => void;
}

const { system, selectedSheetKey, setSelectedSheetKey }: Props = $props();

let sheets = $state<CharacterSheet[]>([]);

async function fetchSheets() {
  const res = await authedGet<{ sheets: CharacterSheet[] }>(
    `/api/character-sheets?system=${system}`,
  );
  if (res?.sheets) {
    sheets = res.sheets;
  }
}

onMount(() => {
  fetchSheets();
});
</script>

<div class="select-wrapper">
    <select onchange={(e) => setSelectedSheetKey(e.currentTarget.value)} value={selectedSheetKey}>
        <option value="">{t('site:options.selectSheet')}</option>
        {#each sheets as sheet}
            <option value={sheet.key}>{sheet.name}</option>
        {/each}
    </select>
</div>
