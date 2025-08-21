<script lang="ts">
import { updateCharacterSheet } from '@firebase/client/characterSheets/updateCharacterSheet';
import { loading, sheet } from '@stores/characters/characterSheetStore';
import SystemSelect from '@svelte/sites/SystemSelect.svelte';
import { pushSnack } from '@utils/client/snackUtils';
import { t } from '@utils/i18n';

let name = $state('');
let system = $state('');

const dirty = $derived.by(() => {
  return $sheet && ($sheet.name !== name || $sheet.system !== system);
});

$effect(() => {
  // On update of the sheet, override the local state
  if ($sheet) {
    name = $sheet.name;
    system = $sheet.system;
  }
});

async function handleSubmit(event: SubmitEvent) {
  event.preventDefault();
  try {
    const key = $sheet?.key;
    if (!key) throw new Error('Sheet key is required for update');

    await updateCharacterSheet({
      key: $sheet?.key,
      name,
      system,
    });
  } catch (error) {
    pushSnack(t('errors:firestore.write.generic'));
    console.error('Failed to update character sheet:', error);
  }
}
</script>

<section class="surface">
  {#if $loading}
    <cn-loader></cn-loader>
  {:else if $sheet}
    <h2 class="downscaled">{t('characters:sheets.editor.info.title')}</h2>
    <form onsubmit={handleSubmit}>
      <fieldset class:elevation-1={dirty}>
        <label>
          <span class="label">{t('characters:sheets.fields.name')}</span>
          <input
            type="text"
            bind:value={name}
            placeholder={t('characters:sheets.placeholders.name')}
            required />
        </label>
      
        <SystemSelect 
          system={system}
          setSystem={(value: string) => {
            system = value;
          }} />

      <div class="toolbar justify-end">
        <button
          type="button"
          class="text"
          disabled={!dirty}>
          <cn-icon noun="undo"></cn-icon>
          <span>{t('actions:reset')}</span>
        </button>
        <button
          type="submit"
          disabled={!dirty}>
          <cn-icon noun="save"></cn-icon>
          <span>{t('actions:save')}</span>
        </button>
      </div>
      </fieldset>
    </form>
    
  {/if}
  <!-- note: error state for not-loading, but no sheet, is handled by the parent, thus we do not need
       to care about it here -->
</section>



