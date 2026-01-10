<script lang="ts">
import { addGroup } from 'src/stores/admin/sheetEditorStore';

// runes reactive local state
let groupName = $state('');

function handleAddGroup() {
  const name = String(groupName).trim();
  if (!name) return;

  addGroup(name, 'rows');
  groupName = '';
}
</script>

<cn-card>
  <div class="flex items-center">
    <cn-icon noun="card" large></cn-icon>
  </div>
  <label>
    <span>Group Name</span>
    <input type="text" bind:value={groupName} placeholder="e.g., Attributes" />
  </label>
  <div slot="actions" class="toolbar items-center">
    <button
      type="button"
      class="text"
      onclick={() => handleAddGroup()}
      disabled={!groupName.trim()}
    >
      <cn-icon noun="add"></cn-icon>
      <span>New Group</span>
    </button>
  </div>
</cn-card>
