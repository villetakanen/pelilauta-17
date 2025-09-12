<script lang="ts">
import {
  dirty,
  load,
  save,
  characterSheet as sheet,
} from 'src/stores/characters/characterSheetStore';
import { appMeta } from 'src/stores/metaStore/metaStore';
import { pushSnack } from 'src/utils/client/snackUtils';
import { uid } from '../../../../stores/session';
import WithAuth from '../../app/WithAuth.svelte';
import SheetInfoForm from './SheetInfoForm.svelte';
import SheetStatGroups from './SheetStatGroups.svelte';
import SheetStats from './SheetStats.svelte';
import StatsSection from './StatsSection.svelte';

export interface Props {
  sheetKey: string;
}
const { sheetKey }: Props = $props();
const allow = $derived.by(() => $appMeta.admins.includes($uid));

/**
 * Subscribe to the character sheet data when the component is mounted and the user is authorized.
 * The sheet store is used by the children components to display and edit the sheet.
 */
$effect(() => {
  if (allow) {
    try {
      load(sheetKey);
    } catch (error) {
      pushSnack({
        message: `Failed to subscribe to sheet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }
});

async function onsubmit(e: Event) {
  e.preventDefault();
  await save().catch((error) => {
    pushSnack({
      message: `Failed to save sheet: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  });
  pushSnack({ message: 'Sheet saved' });
}
</script>

<WithAuth {allow}>
  <div class="content-sheet">
    <header>
      <form class="toolbar" onsubmit={onsubmit}>
        <h1 class="text-h3 m-0">Character Sheet Editor</h1>
        <p class="debug">
          {`${$dirty}`}
        </p>
        <button type="submit" class="button primary" disabled={!$dirty}>
          <cn-icon noun="save"></cn-icon>
          <span>Save Sheet</span>
        </button>
      </form>
    </header>

    <section class="blocks">
      {#each $sheet?.statGroups || [] as group }
        <div class="p-1 surface">
          <div class="toolbar pt-0 mt-0">
            <h4 class="text-h5">{group}</h4>
            <button class="text" aria-label="delete">
              <cn-icon noun="delete"></cn-icon>
            </button>
          </div>
          <StatsSection {group} />
          <div class="toolbar items-center">
            <button class="text">
              <cn-icon noun="add"></cn-icon>
              <span>New Stat</span>
            </button>
          </div>
        </div>
      {/each}

      <div>
        <cn-card>
          <div class="flex items-center">
            <cn-icon noun="card" large></cn-icon>
          </div>
          <div slot="actions" class="toolbar items-center">
            <button class="text">
              <cn-icon noun="add"></cn-icon>
              <span>New Group</span>
            </button>
          </div>
        </cn-card>
      </div>
    </section>

    <aside>
      <SheetInfoForm />
    </aside>
  </div>
  <div class="content-columns">
    <SheetStatGroups />
    <SheetStats />
    
  </div>
</WithAuth>

