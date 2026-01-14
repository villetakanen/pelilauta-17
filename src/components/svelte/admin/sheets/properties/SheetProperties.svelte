<script lang="ts">
import type { CharacterSheet } from 'src/schemas/CharacterSheetSchema';
import { updateSheetInfo } from 'src/stores/admin/sheetEditorStore';
import { t } from 'src/utils/i18n';
import SystemSelect from '../../../sites/SystemSelect.svelte';

interface Props {
  sheet: CharacterSheet;
}
const { sheet }: Props = $props();

function handleNameChange(e: Event) {
  const name = (e.target as HTMLInputElement).value;
  updateSheetInfo({ name });
}

function handleSystemChange(system: string) {
  updateSheetInfo({ system });
}
</script>

<div class="property-group">
    <h3 class="text-h6 mb-2">Sheet Properties</h3>

    <label>
        <span class="label">{t("characters:sheets.fields.name")}</span>
        <input
            type="text"
            value={sheet.name}
            oninput={handleNameChange}
            placeholder={t("characters:sheets.placeholders.name")}
            required
        />
    </label>

    <label class="mt-2 block">
        <span class="label">{t("characters:sheets.fields.system")}</span>
        <SystemSelect system={sheet.system} setSystem={handleSystemChange} />
    </label>

    <div class="text-low text-sm mt-4">
        <p>ID: {sheet.key}</p>
    </div>
</div>
