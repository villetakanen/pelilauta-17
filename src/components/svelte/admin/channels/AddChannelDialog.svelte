<script lang="ts">
import { logDebug } from '@utils/logHelpers';
import { toMekanismiURI } from '@utils/mekanismiUtils';

interface Props {
  topics: Array<string>;
  addChannel: (name: string, category: string, icon: string) => Promise<void>;
}

const { topics, addChannel }: Props = $props();

let dialogRef: HTMLDialogElement | undefined = $state();

let channelName = $state('');
const channelSlug = $derived.by(() => toMekanismiURI(channelName));

let selectedCategory = $state('');
let icon = $state('icon1'); // Default icon

let isSaving = $state(false);

function openDialog() {
  if (dialogRef) {
    // Set default category if available
    if (topics.length > 0 && !selectedCategory) {
      selectedCategory = topics[0];
    }
    dialogRef.showModal();
  } else {
    dialogRef = undefined;
  }
}

function closeDialog() {
  if (dialogRef) {
    dialogRef.close();
    // Reset form fields
    channelName = '';
    icon = 'icon1'; // Reset to default icon
  }
}

async function handleSave() {
  if (!channelName || !selectedCategory) {
    logDebug('AddChannelDialog: Name and category are required.');
    // Optionally show an error message to the user
    return;
  }
  isSaving = true;
  try {
    logDebug('AddChannelDialog: Saving channel', {
      name: channelName,
      category: selectedCategory,
    });
    await addChannel(channelName, selectedCategory, icon);
    closeDialog();
  } catch (error) {
    console.error('Failed to add channel:', error);
    // Optionally show an error message to the user
  } finally {
    isSaving = false;
  }
}

function handleCancel() {
  closeDialog();
}

function handleSubmit(event: SubmitEvent) {
  event.preventDefault();
  handleSave();
}
</script>

<button onclick={openDialog}>
  <cn-icon noun="add" small></cn-icon>
  <span>Add Channel</span>
</button>

<dialog bind:this={dialogRef}>    
  <form onsubmit={handleSubmit} class="dialog-form">                   
      <fieldset>
        <label>
          Name:
          <input
            type="text"
            bind:value={channelName}
            placeholder="Enter channel name"
            required />
        </label>
        <p class="text-caption">{channelSlug}</p>

        <label>
          Topic:
          <select
            bind:value={selectedCategory}
            class="select select-bordered w-full"
            required
            disabled={topics.length === 0}
          >
            {#if topics.length === 0}
              <option value="" disabled>No categories available</option>
            {:else}
              <option value="" disabled selected={!selectedCategory}>Select a category</option>
              {#each topics as topic}
                <option value={topic}>{topic}</option>
              {/each}
            {/if}
            </select>
        </label>
        

        <label>
          Icon:
          <select bind:value={icon}>
            <option value="icon1">Icon 1</option>
            <option value="icon2">Icon 2</option>
            <option value="icon3">Icon 3</option>
          </select>
        </label>
      </fieldset>

      <!-- Toolbar for actions -->
      <div class="toolbar">
        <button type="button" class="btn" onclick={handleCancel} disabled={isSaving}>Cancel</button>
        <button type="submit" class="btn btn-primary" disabled={isSaving || !channelName || !selectedCategory}>
          {#if isSaving}
            <cn-loader noun="discussion"></cn-loader>
          {:else}
            <cn-icon noun="discussion"></cn-icon>
          {/if}
          <span>SAVE</span>
        </button>
      </div>

    </form>
</dialog>