<script lang="ts">
import { CharacterSheetSchema } from '@schemas/CharacterSheetSchema';
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
import NewGroupCard from './NewGroupCard.svelte';
import SheetInfoForm from './SheetInfoForm.svelte';
import StatsSection from './StatsSection.svelte';

export interface Props {
  sheetKey: string;
}
const { sheetKey }: Props = $props();
const allow = $derived.by(() => $appMeta.admins.includes($uid));

/**
 * Add a new stat with an empty key to the given group unless one already exists.
 */
function addStat(groupName: string) {
  const updated = { ...$sheet };
  if (!updated.stats) updated.stats = [];

  // Only add if there isn't an existing stat with empty key in this group
  const hasEmpty = updated.stats.some(
    (s) => s.group === groupName && s.key === '',
  );
  if (hasEmpty) return;

  updated.stats = [
    ...updated.stats,
    {
      type: 'number',
      key: '-',
      value: 0,
      group: groupName,
    },
  ];

  // Validate and set the sheet atom
  sheet.set(CharacterSheetSchema.parse(updated));
}

function groupHasStats(groupName: string) {
  return ($sheet?.stats || []).some((s) => s.group === groupName);
}

function removeGroup(groupName: string) {
  // Only allow removing empty groups
  if (groupHasStats(groupName)) return;

  const updated = { ...$sheet };
  if (!updated?.statGroups) return;

  updated.statGroups = updated.statGroups.filter((g) => g !== groupName);
  sheet.set(CharacterSheetSchema.parse(updated));
}

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
</script>

<WithAuth {allow}>
  <div class="content-sheet border p-1">
    <header class="pb-2">
      <SheetInfoForm />
      <br>
    </header>

    <section class="blocks">
      {#each $sheet?.statGroups || [] as group }
        <div class="p-1 surface">
          <div class="toolbar pt-0 mt-0">
            <h4 class="text-h5">{group}</h4>
            <button
              type="button"
              class="text"
              aria-label="delete"
              onclick={() => removeGroup(group)}
              disabled={groupHasStats(group)}
            >
              <cn-icon noun="delete"></cn-icon>
            </button>
          </div>
          <StatsSection {group} />
          <div class="toolbar items-center">
                <button
                  type="button"
                  class="text"
                  onclick={() => addStat(group)}
                >
                  <cn-icon noun="add"></cn-icon>
                  <span>New Stat</span>
                </button>
          </div>
        </div>
      {/each}

      <div>
        <NewGroupCard />
      </div>
    </section>
  </div>
</WithAuth>

