<script lang="ts">
import {
  addGroup,
  dirty,
  moveGroupDown,
  moveGroupUp,
  removeGroup,
  saveSheet,
  saving,
  sheet,
  updateGroupKey,
} from 'src/stores/admin/sheetEditorStore';
import { logDebug, logError } from 'src/utils/logHelpers';

async function handleSave(e: Event) {
  e.preventDefault();
  try {
    await saveSheet();
    logDebug('StatGroupsForm', 'Sheet saved successfully');
  } catch (error) {
    logError('StatGroupsForm', 'Error saving sheet:', error);
  }
}

function handleAddGroup() {
  addGroup('', 'rows');
}
</script>

<form onsubmit={handleSave}>
  <fieldset class="border-radius px-2" class:elevation-1={$dirty}>
    <legend>Stat Groups</legend>
    <p class="text-low downscaled mb-2">
      Groups are used to organize stats in the character sheet UI. Create groups
      like "Attributes", "Skills", etc.
    </p>

    {#if $sheet?.statGroups && $sheet.statGroups.length > 0}
      {#each $sheet.statGroups as group, i}
        <div class="flex gap-2 mb-2">
          <label class="grow">
            Group Name:
            <input
              type="text"
              placeholder="e.g., Attributes, Skills, Combat"
              value={group.key}
              oninput={(e) =>
                updateGroupKey(group.key, (e.target as HTMLInputElement).value)}
              required
            />
          </label>
          <div class="flex flex-none gap-1">
            <button
              aria-label="Move Group Up"
              type="button"
              class="button text"
              disabled={i === 0}
              onclick={() => moveGroupUp(group.key)}
            >
              <cn-icon noun="arrow-up"></cn-icon>
            </button>
            <button
              aria-label="Move Group Down"
              type="button"
              class="button text"
              disabled={i === ($sheet?.statGroups?.length ?? 0) - 1}
              onclick={() => moveGroupDown(group.key)}
            >
              <cn-icon noun="arrow-down"></cn-icon>
            </button>
            <button
              aria-label="Remove Group"
              type="button"
              class="button flex-none text"
              onclick={() => removeGroup(group.key)}
            >
              <cn-icon noun="delete"></cn-icon>
            </button>
          </div>
        </div>
      {/each}
    {:else}
      <p class="text-low">No stat groups defined yet.</p>
    {/if}

    <div class="toolbar justify-end mb-2">
      <button type="button" class="text" onclick={handleAddGroup}>
        <cn-icon noun="add"></cn-icon>
        <span>Add Group</span>
      </button>
      <button
        type="submit"
        class="button primary"
        disabled={!$dirty || $saving}
      >
        <cn-icon noun="save"></cn-icon>
        <span>{$saving ? "Saving..." : "Save"}</span>
      </button>
    </div>
  </fieldset>
</form>
