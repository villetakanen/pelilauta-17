<script lang="ts">
import { authedFetch } from '@firebase/client/apiClient';
import { authUser, uid } from '@stores/session';
import { type Channel, parseChannel } from 'src/schemas/ChannelSchema';
import { logDebug, logError } from 'src/utils/logHelpers';
import { onMount } from 'svelte';
import AddChannelDialog from './AddChannelDialog.svelte';
import ChannelSettings from './ChannelSettings.svelte';

let channels: Channel[] = $state([]);
let isLoading = $state(true);
let error = $state<string | null>(null);

const topics = $derived.by(() => {
  const t = new Set<string>();
  for (const channel of channels) {
    t.add(channel.category ?? '-');
  }
  return Array.from(t);
});

// Wait for both uid and authUser to prevent race conditions
$effect(() => {
  if ($uid && $authUser) {
    loadChannels();
  } else if (!$uid) {
    // User logged out, clear data
    channels = [];
    isLoading = false;
  }
  // For other states (uid but no authUser), wait - don't make API calls
});

// Keyboard shortcuts for admin actions
$effect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    // Only handle shortcuts when no input is focused
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    // Ctrl/Cmd + R: Refresh all channels
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      refreshAllChannels();
    }

    // Ctrl/Cmd + N: Focus on "Add Channel" button (if available)
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      const addButton = document.querySelector(
        '[data-add-channel-trigger]',
      ) as HTMLElement;
      if (addButton) {
        addButton.click();
      }
    }
  }

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
});

async function loadChannels() {
  try {
    isLoading = true;
    error = null;

    const response = await authedFetch('/api/admin/channels');
    if (!response.ok) {
      throw new Error(
        `Failed to load channels: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    channels = data.channels.map(parseChannel);
    logDebug('ChannelsAdmin', `Loaded ${channels.length} channels`);
  } catch (err) {
    logError('ChannelsAdmin', 'Failed to load channels:', err);
    error = err instanceof Error ? err.message : 'Failed to load channels';
  } finally {
    isLoading = false;
  }
}

function filterChannels(topic: string) {
  return channels.filter((channel) => channel.category === topic);
}

async function addChannel(name: string, category: string, icon: string) {
  try {
    logDebug('ChannelsAdmin', 'Creating channel:', { name, category, icon });

    const response = await authedFetch('/api/admin/channels', {
      method: 'POST',
      body: JSON.stringify({ name, category, icon }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create channel: ${response.status} ${errorText}`,
      );
    }

    const newChannel = await response.json();
    logDebug('ChannelsAdmin', 'Channel created successfully:', newChannel);

    // Reload channels to get fresh data
    await loadChannels();

    // Show success notification (if using cn-snackbar)
    showSuccess(`Channel "${name}" created successfully`);
  } catch (err) {
    logError('ChannelsAdmin', 'Failed to create channel:', err);
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to create channel';
    showError(errorMessage);
    throw err; // Re-throw so AddChannelDialog can handle it
  }
}

async function refreshAllChannels() {
  try {
    logDebug('ChannelsAdmin', 'Refreshing all channel statistics');

    const response = await authedFetch('/api/admin/channels/refresh', {
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to refresh channels: ${response.status} ${errorText}`,
      );
    }

    const result = await response.json();
    logDebug('ChannelsAdmin', 'Refresh completed:', result.message);

    // Reload channels to get fresh statistics
    await loadChannels();
    showSuccess(result.message);
  } catch (err) {
    logError('ChannelsAdmin', 'Failed to refresh channels:', err);
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to refresh channels';
    showError(errorMessage);
  }
}

function handleChannelDeleted(deletedSlug: string) {
  // Remove the deleted channel from the local state
  channels = channels.filter((channel) => channel.slug !== deletedSlug);
  logDebug('ChannelsAdmin', `Channel deleted from UI: ${deletedSlug}`);
}

// Helper functions for user feedback
function showSuccess(message: string) {
  // TODO: Implement using cn-snackbar in future
  console.log('Success:', message);
}

function showError(message: string) {
  // TODO: Implement using cn-snackbar in future
  console.error('Error:', message);
}
</script>

<div class="content-columns">
  <section class="column-l">
    <div class="toolbar">
      <div class="grow">
        <h1>Forum Administration</h1>
        <p class="text-caption pb-1">
          Manage forum channels and topics. Create new channels, refresh statistics, and organize forum structure.
        </p>
        <p class="text-caption text-low">
          <kbd>Ctrl+R</kbd> Refresh All • <kbd>Ctrl+N</kbd> Add Channel
        </p>
      </div>
      <div class="flex gap-2">
        <button onclick={refreshAllChannels} class="btn" disabled={isLoading}>
          {#if isLoading}
            <cn-loader small></cn-loader>
          {:else}
            <cn-icon noun="tools" small></cn-icon>
          {/if}
          Refresh All
        </button>
        <AddChannelDialog 
          {topics}
          {addChannel}
        />
      </div>
    </div>

    {#if error}
      <div class="p-4 border border-error radius-s bg-error-low">
        <p class="text-error">
          <cn-icon noun="info" small></cn-icon>
          {error}
        </p>
        <button onclick={loadChannels} class="btn btn-sm mt-2">
          <cn-icon noun="tools" small></cn-icon>
          Retry
        </button>
      </div>
    {:else if isLoading}
      <div class="p-4 text-center">
        <cn-loader></cn-loader>
        <p class="text-caption">Loading channels...</p>
      </div>
    {:else if channels.length === 0}
      <div class="p-4 text-center">
        <cn-icon noun="discussion" large></cn-icon>
        <h2>No Channels Found</h2>
        <p class="text-caption pb-4">Create your first channel to get started.</p>
      </div>
    {:else}
      {#each topics as topic}
        <div class="mb-4">
          <h2 class="pb-2">{topic}</h2>
          <div class="content-cards">
            {#each filterChannels(topic) as channel}
              <ChannelSettings 
                {channel} 
                onRefresh={loadChannels}
                onChannelDeleted={handleChannelDeleted}
              />
            {/each}
          </div>
        </div>
      {/each}
    {/if}
  </section>
</div>

<style>
kbd {
  display: inline-block;
  padding: 0.125rem 0.25rem;
  font-size: 0.75rem;
  background: var(--background-low);
  border: 1px solid var(--border-low);
  border-radius: var(--radius-s);
  font-family: monospace;
  margin: 0 0.125rem;
}
</style>