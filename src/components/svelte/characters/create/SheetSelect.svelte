<script lang="ts">
import { sheets } from '@stores/characters/sheetsStore';
import { t } from '@utils/i18n';

interface Props {
  system: string;
  selected?: string;
  onSelect: (sheetKey: string, sheetName: string) => void;
}

const { system, selected, onSelect }: Props = $props();

const options = $sheets
  .filter((sheet) => sheet.system === system)
  .map((sheet) => ({
    label: sheet.name,
    value: sheet.key,
  }));

options.push({ label: t('characters:defaultSheet'), value: '-' });

function onchange(e: Event) {
  const select = e.target as HTMLSelectElement;
  const selectedKey = select.value;
  const selectedSheet = $sheets.find((sheet) => sheet.key === selectedKey);
  onSelect(
    selectedKey,
    selectedSheet ? selectedSheet.name : t('characters:defaultSheet'),
  );
}
</script>

<select onchange={onchange}>
  {#each options as option}
    <option
      value={option.value}
      selected={option.value === selected}
    >
      {option.label}
    </option>
  {/each}
</select>