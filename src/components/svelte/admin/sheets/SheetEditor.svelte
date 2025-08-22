<script lang="ts">
import WithAuth from 'src/components/svelte/app/WithAuth.svelte';
import { subscribeCharacterSheet } from 'src/stores/characters/characterSheetStore';
import { appMeta } from 'src/stores/metaStore/metaStore';
import { uid } from 'src/stores/session';
import { pushSnack } from 'src/utils/client/snackUtils';
import SheetInfoForm from './SheetInfoForm.svelte';
import SheetStatGroups from './SheetStatGroups.svelte';
import SheetStats from './SheetStats.svelte';

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
      subscribeCharacterSheet(sheetKey);
    } catch (error) {
      pushSnack({
        message: `Failed to subscribe to sheet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }
});
</script>

<WithAuth {allow}>
  <div class="content-columns">
    <SheetInfoForm />
    <SheetStatGroups />
    <SheetStats />
  </div>
</WithAuth>

