<script lang="ts">
import { addBlockGroup } from 'src/stores/admin/sheetEditorStore';

let groupName = $state('');

function handleAddGroup() {
  const name = String(groupName).trim();
  if (!name) return;

  addBlockGroup(name, 'cols-1');
  groupName = '';
}
</script>

<cn-card>
    <div class="flex items-center">
        <cn-icon noun="card" large></cn-icon>
    </div>
    <label>
        <span>Block Group Name</span>
        <input
            type="text"
            bind:value={groupName}
            placeholder="e.g., Character Info"
        />
    </label>
    <div slot="actions" class="toolbar items-center">
        <button
            type="button"
            class="text"
            onclick={handleAddGroup}
            disabled={!groupName.trim()}
        >
            <cn-icon noun="add"></cn-icon>
            <span>New Block Group</span>
        </button>
    </div>
</cn-card>
