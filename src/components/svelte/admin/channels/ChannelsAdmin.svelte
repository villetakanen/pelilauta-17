<script lang="ts">
import { authedFetch } from '@firebase/client/apiClient';
import { authUser, uid } from '@stores/session';
import { type Channel, parseChannel } from 'src/schemas/ChannelSchema';
import { t } from 'src/utils/i18n';
import { logDebug, logError } from 'src/utils/logHelpers';
import { onMount } from 'svelte';
import AddChannelDialog from './AddChannelDialog.svelte';
import ChannelSettings from './ChannelSettings.svelte';
import TopicToolbar from './TopicToolbar.svelte';

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
    error = err instanceof Error ? err.message : t('admin:errors.loadFailed');
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
    showSuccess(t('admin:channels.create.success', { name }));
  } catch (err) {
    logError('ChannelsAdmin', 'Failed to create channel:', err);
    const errorMessage =
      err instanceof Error ? err.message : t('admin:channels.create.failed');
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
    showSuccess(t('admin:channels.refresh.allSuccess'));
  } catch (err) {
    logError('ChannelsAdmin', 'Failed to refresh channels:', err);
    const errorMessage =
      err instanceof Error ? err.message : t('admin:channels.refresh.failed');
    showError(errorMessage);
  }
}

function handleChannelDeleted(deletedSlug: string) {
  // Remove the deleted channel from the local state
  channels = channels.filter((channel) => channel.slug !== deletedSlug);
  logDebug('ChannelsAdmin', `Channel deleted from UI: ${deletedSlug}`);
}

// Topic management functions
function moveTopicUp(topicIndex: number) {
  if (topicIndex === 0) return; // Can't move first topic up

  const topicsArray = [...topics];
  [topicsArray[topicIndex - 1], topicsArray[topicIndex]] = [
    topicsArray[topicIndex],
    topicsArray[topicIndex - 1],
  ];

  // This would need to be implemented with a proper topic management system
  logDebug('ChannelsAdmin', 'Move topic up not yet implemented');
}

function moveTopicDown(topicIndex: number) {
  if (topicIndex >= topics.length - 1) return; // Can't move last topic down

  const topicsArray = [...topics];
  [topicsArray[topicIndex], topicsArray[topicIndex + 1]] = [
    topicsArray[topicIndex + 1],
    topicsArray[topicIndex],
  ];

  // This would need to be implemented with a proper topic management system
  logDebug('ChannelsAdmin', 'Move topic down not yet implemented');
}

function deleteTopic(topic: string) {
  const hasChannels = filterChannels(topic).length > 0;
  if (hasChannels) return; // Can't delete topic with channels

  // This would need to be implemented with a proper topic management system
  logDebug('ChannelsAdmin', 'Delete topic not yet implemented');
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

<section class="content-listing">
  <header class="surface elevation-1">
    <div class="toolbar px-0">
      <div class="grow">
        <h1>{t('admin:title')}</h1>
      </div>
      <div class="flex gap-2">
        <button onclick={refreshAllChannels} class="text" disabled={isLoading}>
          {#if isLoading}
            <cn-loader small></cn-loader>
          {:else}
            <cn-icon noun="spiral" small></cn-icon>
          {/if}
          <span>{t('admin:channels.refreshAll')}</span>
        </button>
        <AddChannelDialog 
          {topics}
          {addChannel}
        />
      </div>
    </div>
    <p class="text-caption pb-1">
      {t('admin:description')}
    </p>
    <p class="text-caption text-low text-end">
      <kbd>Ctrl+R</kbd> {t('admin:shortcuts.refreshAll')} • <kbd>Ctrl+N</kbd> {t('admin:shortcuts.addChannel')}
    </p>
  </header>

  <div class="listing-items">

    {#if error}
      <div class="p-4 border border-error radius-s bg-error-low">
        <p class="text-error">
          <cn-icon noun="info" small></cn-icon>
          {error}
        </p>
        <button onclick={loadChannels} class="btn btn-sm mt-2">
          <cn-icon noun="tools" small></cn-icon>
          {t('admin:errors.retry')}
        </button>
      </div>
    {:else if isLoading}
      <div class="p-4 text-center">
        <cn-loader></cn-loader>
        <p class="text-caption">{t('admin:channels.loading')}</p>
      </div>
    {:else if channels.length === 0}
      <div class="p-4 text-center">
        <cn-icon noun="discussion" large></cn-icon>
        <h2>{t('admin:channels.noChannels.title')}</h2>
        <p class="text-caption pb-4">{t('admin:channels.noChannels.description')}</p>
      </div>
    {:else}
      {#each topics as topic, index}
        <TopicToolbar 
          {topic}
          hasChannels={filterChannels(topic).length > 0}
          canMoveUp={index > 0}
          canMoveDown={index < topics.length - 1}
          onMoveUp={() => moveTopicUp(index)}
          onMoveDown={() => moveTopicDown(index)}
          onDelete={() => deleteTopic(topic)}
        />
        {#each filterChannels(topic) as channel}
          <ChannelSettings 
            {channel} 
                onRefresh={loadChannels}
                onChannelDeleted={handleChannelDeleted}
              />
            {/each}
      {/each}
    {/if}
  </div>
</section>