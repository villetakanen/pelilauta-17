<script lang="ts">
import { authedFetch } from '@firebase/client/apiClient';
import type { Channel } from 'src/schemas/ChannelSchema';
import { toDisplayString } from 'src/utils/contentHelpers';
import { logDebug, logError } from 'src/utils/logHelpers';

interface Props {
  channel: Channel;
  onRefresh?: () => void;
  onChannelUpdated?: (updatedChannel: Channel) => void;
  onChannelDeleted?: (deletedSlug: string) => void;
}
const { channel, onRefresh, onChannelUpdated, onChannelDeleted }: Props =
  $props();

let isRefreshing = $state(false);
let isDeleting = $state(false);

async function forceRefresh() {
  try {
    isRefreshing = true;
    logDebug(
      'ChannelSettings',
      `Refreshing statistics for channel: ${channel.slug}`,
    );

    const response = await authedFetch('/api/admin/channels/refresh', {
      method: 'POST',
      body: JSON.stringify({ channelSlug: channel.slug }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to refresh channel: ${response.status} ${errorText}`,
      );
    }

    const result = await response.json();
    logDebug('ChannelSettings', 'Refresh completed:', result.message);

    // Notify parent to reload data
    if (onRefresh) onRefresh();

    // Show success feedback (TODO: implement with cn-snackbar)
    console.log('Success:', result.message);
  } catch (err) {
    logError(
      'ChannelSettings',
      `Failed to refresh channel ${channel.slug}:`,
      err,
    );
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to refresh channel';
    // Show error feedback (TODO: implement with cn-snackbar)
    console.error('Error:', errorMessage);
  } finally {
    isRefreshing = false;
  }
}

function handleEdit() {
  // For now, just prompt for a new name as a simple edit
  const newName = prompt(`Edit channel name (current: "${channel.name}"):`);
  if (newName?.trim() && newName !== channel.name) {
    updateChannel(newName.trim());
  }
}

async function updateChannel(newName: string) {
  try {
    const response = await authedFetch('/api/admin/channels', {
      method: 'PUT',
      body: JSON.stringify({
        originalSlug: channel.slug,
        name: newName,
        category: channel.category,
        icon: channel.icon,
        description: channel.description,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      logDebug('ChannelSettings', 'Channel updated:', result.channel);
      // Show success feedback (TODO: implement with cn-snackbar)
      console.log('Success: Channel updated');

      if (onChannelUpdated) {
        onChannelUpdated(result.channel);
      }

      // Reload to get fresh data
      if (onRefresh) {
        onRefresh();
      }
    } else {
      const data = await response.json();
      const errorMessage = data.error || response.statusText;
      console.error('Error:', errorMessage);
      alert(`Failed to update channel: ${errorMessage}`);
      logError('ChannelSettings', 'Failed to update channel:', errorMessage);
    }
  } catch (error) {
    logError('ChannelSettings', 'Error updating channel:', error);
    alert('Error updating channel. Please try again.');
  }
}

async function handleDelete() {
  // Enhanced confirmation dialog
  const confirmation = confirm(
    `⚠️ DELETE CHANNEL: "${channel.name}"\n\n` +
      `This will permanently delete the channel.\n` +
      `- Current threads: ${channel.threadCount}\n` +
      `- Category: ${channel.category}\n\n` +
      `❗ This action cannot be undone!\n\n` +
      `Type the channel name to confirm deletion:`,
  );

  if (!confirmation) {
    return;
  }

  // Ask user to type the channel name for confirmation
  const typedName = prompt(
    `Please type "${channel.name}" to confirm deletion:`,
  );
  if (typedName !== channel.name) {
    alert('Channel name does not match. Deletion cancelled.');
    return;
  }

  isDeleting = true;
  try {
    const response = await authedFetch(
      `/api/admin/channels?slug=${encodeURIComponent(channel.slug)}`,
      {
        method: 'DELETE',
      },
    );

    if (response.ok) {
      logDebug('ChannelSettings', 'Channel deleted:', channel.slug);
      // Show success feedback (TODO: implement with cn-snackbar)
      console.log('Success: Channel deleted');

      if (onChannelDeleted) {
        onChannelDeleted(channel.slug);
      }
    } else {
      const data = await response.json();
      const errorMessage = data.error || response.statusText;
      // Show error feedback (TODO: implement with cn-snackbar)
      console.error('Error:', errorMessage);
      alert(`Failed to delete channel: ${errorMessage}`);
      logError('ChannelSettings', 'Failed to delete channel:', errorMessage);
    }
  } catch (error) {
    logError('ChannelSettings', 'Error deleting channel:', error);
    alert('Error deleting channel. Please try again.');
  } finally {
    isDeleting = false;
  }
}
</script>

<cn-card class="channel-settings">
  <div class="flex items-start gap-4">
    <div class="flex items-center gap-2">
      <cn-icon noun={channel.icon} medium></cn-icon>
      <div>
        <h3 class="text-l">{channel.name}</h3>
        <p class="text-caption text-low">{channel.slug}</p>
      </div>
    </div>
    
    <div class="grow"></div>
    
    <div class="text-right text-small">
      <div class="pb-1">
        <span class="text-high">{channel.threadCount}</span> 
        <span class="text-low">threads</span>
      </div>
      <div class="text-caption text-low">
        {toDisplayString(channel.flowTime)} latest
      </div>
    </div>
    
    <div class="flex flex-col gap-2">
      <button 
        type="button"
        class="btn btn-sm"
        onclick={forceRefresh}
        disabled={isRefreshing}
        title="Refresh channel statistics"
      >
        {#if isRefreshing}
          <cn-loader small></cn-loader>
        {:else}
          <cn-icon noun="tools" small></cn-icon>
        {/if}
        Refresh
      </button>
      
      <!-- TODO: Add edit and delete buttons in Phase 2 -->
      <button 
        type="button" 
        class="btn btn-sm btn-outline"
        onclick={handleEdit}
        title="Edit channel"
      >
        <cn-icon noun="edit" small></cn-icon>
        Edit
      </button>
      
      <button 
        type="button" 
        class="btn btn-sm btn-outline text-danger"
        onclick={handleDelete}
        disabled={isDeleting}
        title="Delete channel (must have no threads)"
      >
        {#if isDeleting}
          <cn-loader small></cn-loader>
        {:else}
          <cn-icon noun="delete" small></cn-icon>
        {/if}
        Delete
      </button>
    </div>
  </div>
  
  {#if channel.description}
    <div class="pt-2 border-t">
      <p class="text-small text-low">{channel.description}</p>
    </div>
  {/if}
  
  <div class="pt-2 border-t text-caption text-low">
    <span>Category: {channel.category || 'Uncategorized'}</span>
  </div>
</cn-card>

<style>
.channel-settings {
  margin-bottom: 0.5rem;
}

.text-danger {
  color: var(--color-danger);
}
</style>

