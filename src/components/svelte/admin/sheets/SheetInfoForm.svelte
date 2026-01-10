<script lang="ts">
import {
  dirty,
  saveSheet,
  sheet,
  updateSheetInfo,
} from 'src/stores/admin/sheetEditorStore';
import { pushSnack } from 'src/utils/client/snackUtils';
import { t } from 'src/utils/i18n';
import SystemSelect from '../../sites/SystemSelect.svelte';

let name = $state('');
let system = $state('');

$effect(() => {
  // On update of the sheet, override the local state
  if ($sheet) {
    name = $sheet.name;
    system = $sheet.system;
  }
});

async function onsubmit(e: Event) {
  e.preventDefault();
  await saveSheet().catch((error) => {
    pushSnack({
      message: `Failed to save sheet: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  });
  pushSnack({ message: 'Sheet saved' });
}

function handleNameChange(e: Event) {
  name = (e.target as HTMLInputElement).value;
  updateSheetInfo({ name });
}

function handleSystemChange(newSystem: string) {
  system = newSystem;
  updateSheetInfo({ system });
}
</script>

{#if $sheet}
  <form {onsubmit}>
    <div class="toolbar p-0 mb-2">
      <label class="grow">
        <span class="label">{t("characters:sheets.fields.name")}</span>
        <input
          type="text"
          value={name}
          oninput={handleNameChange}
          placeholder={t("characters:sheets.placeholders.name")}
          required
        />
      </label>

      <button type="submit" class="button primary" disabled={!$dirty}>
        <cn-icon noun="save"></cn-icon>
        <span>Save Sheet</span>
      </button>
    </div>

    <div class="toolbar p-0">
      <SystemSelect {system} setSystem={handleSystemChange} />
    </div>
  </form>
{/if}
