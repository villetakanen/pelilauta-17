<script lang="ts">
import {
  loadSheet,
  selectItem,
  sheet,
} from 'src/stores/admin/sheetEditorStore';
import { appMeta } from 'src/stores/metaStore/metaStore';
import { pushSnack } from 'src/utils/client/snackUtils';
import { t } from 'src/utils/i18n';
import { uid } from '../../../../stores/session';
import WithAuth from '../../app/WithAuth.svelte';
import NewBlockGroupCard from './NewBlockGroupCard.svelte';
import PropertyDrawer from './PropertyDrawer.svelte';
import StatBlockGroupCard from './StatBlockGroupCard.svelte';

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
    loadSheet(sheetKey).catch((error) => {
      pushSnack({
        message: `Failed to load sheet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    });
  }
});
</script>

<WithAuth {allow}>
  <div class="content-columns">
    <!-- The primary sheet containing area -->
    <article class="column-l">
      <header
        class="pb-2 mb-2 border-b cursor-pointer hover:surface-2 p-2 rounded transition-colors"
        onclick={() => selectItem("sheet", $sheet?.key || "")}
        role="button"
        tabindex="0"
        onkeydown={(e) =>
          e.key === "Enter" && selectItem("sheet", $sheet?.key || "")}
      >
        <h1 class="text-h3">{$sheet?.name || "Untitled Sheet"}</h1>
        <p class="text-low">{$sheet?.system || "No System"}</p>
      </header>

      <section>
        <h2 class="text-h4">{t("admin:sheetEditor.statGroups")}</h2>
        <p class="text-low downscaled">
          Organize your sheet into block groups. Each group can contain multiple
          stat blocks in a grid layout.
        </p>
      </section>

      {#each $sheet?.statBlockGroups || [] as group, groupIndex}
        <StatBlockGroupCard {group} {groupIndex} />
      {/each}
      <br />
      <NewBlockGroupCard />
    </article>
  </div>

  <PropertyDrawer />
</WithAuth>
