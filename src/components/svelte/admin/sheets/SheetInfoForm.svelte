<script lang="ts">
import { dirty, saveSheet, sheet } from 'src/stores/admin/sheetEditorStore';
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

function updateName(e: Event) {
  name = (e.target as HTMLInputElement).value;
  if ($sheet) {
    sheet.set({ ...$sheet, name });
  }
}

function updateSystem(newSystem: string) {
  system = newSystem;
  if ($sheet) {
    sheet.set({ ...$sheet, system });
  }
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
          oninput={updateName}
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
      <SystemSelect {system} setSystem={updateSystem} />
    </div>
  </form>
{/if}
