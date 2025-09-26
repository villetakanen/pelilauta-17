<script lang="ts">
import { authedFetch } from '@firebase/client/apiClient';
import { addTopicFormOpen } from '@stores/admin/ChannelsAdminStore';
import { authUser, uid } from '@stores/session';
import { type Channel, parseChannel } from 'src/schemas/ChannelSchema';
import { t } from 'src/utils/i18n';
import { logDebug, logError } from 'src/utils/logHelpers';
import AddChannelDialog from './AddChannelDialog.svelte';
import AddTopicForm from './AddTopicForm.svelte';
import ChannelSettings from './ChannelSettings.svelte';
import TopicToolbar from './TopicToolbar.svelte';

let channels: Channel[] = $state([]);
let topicList: string[] = $state([]);
let isLoading = $state(true);
let error = $state<string | null>(null);

const topics = $derived.by(() => {
  // Use topicList from API if available, otherwise derive from channels
  let derivedTopics: string[] = [];
  if (topicList.length > 0) {
    derivedTopics = topicList;
  } else {
    const t = new Set<string>();
    for (const channel of channels) {
      t.add(channel.category ?? '-');
    }
    derivedTopics = Array.from(t);
  }

  // Auto-open form if no topics exist and not currently loading
  if (derivedTopics.length === 0 && !isLoading && !error) {
    addTopicFormOpen.set(true);
  }

  return derivedTopics;
}); // Wait for both uid and authUser to prevent race conditions
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

    // Ctrl/Cmd + T: Open "Add Topic" form
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      addTopicFormOpen.set(true);
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

    // Load both channels and topics
    const [channelsResponse, topicsResponse] = await Promise.all([
      authedFetch('/api/admin/channels'),
      authedFetch('/api/admin/topics'),
    ]);

    if (!channelsResponse.ok) {
      throw new Error(
        `Failed to load channels: ${channelsResponse.status} ${channelsResponse.statusText}`,
      );
    }

    if (!topicsResponse.ok) {
      throw new Error(
        `Failed to load topics: ${topicsResponse.status} ${topicsResponse.statusText}`,
      );
    }

    const channelsData = await channelsResponse.json();
    const topicsData = await topicsResponse.json();

    channels = channelsData.channels.map(parseChannel);
    topicList = topicsData.topics || [];

    logDebug(
      'ChannelsAdmin',
      `Loaded ${channels.length} channels and ${topicList.length} topics`,
    );
  } catch (err) {
    logError('ChannelsAdmin', 'Failed to load channels and topics:', err);
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

async function addTopic(name: string) {
  try {
    logDebug('ChannelsAdmin', 'Creating topic:', { name });

    const response = await authedFetch('/api/admin/topics', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create topic: ${response.status} ${errorText}`,
      );
    }

    const result = await response.json();
    logDebug('ChannelsAdmin', 'Topic created successfully:', result);

    // Reload channels to get fresh topic list
    await loadChannels();

    // Show success notification
    showSuccess(t('admin:topics.create.success', { name }));
  } catch (err) {
    logError('ChannelsAdmin', 'Failed to create topic:', err);
    const errorMessage =
      err instanceof Error ? err.message : t('admin:topics.create.failed');
    showError(errorMessage);
    throw err; // Re-throw so AddTopicDialog can handle it
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

async function handleAddTopic(topicName: string) {
  await addTopic(topicName);
  // Hide the form after successful submission
  addTopicFormOpen.set(false);
}

function cancelAddTopic() {
  addTopicFormOpen.set(false);
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
        <button onclick={() => addTopicFormOpen.set(true)} class="outlined" disabled={$addTopicFormOpen} data-add-topic-trigger>
          <cn-icon noun="tag" small></cn-icon>
          <span>{t('admin:topics.addTopic')}</span>
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
      <kbd>Ctrl+R</kbd> {t('admin:shortcuts.refreshAll')} • <kbd>Ctrl+T</kbd> {t('admin:shortcuts.addTopic')} • <kbd>Ctrl+N</kbd> {t('admin:shortcuts.addChannel')}
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
      <!-- Add Topic Form -->
      {#if $addTopicFormOpen}
        <AddTopicForm 
          onAddTopic={handleAddTopic}
          onCancel={cancelAddTopic}
        />
      {/if}      {#each topics as topic, index}
        <TopicToolbar 
          {topic}
          {topics}
          hasChannels={filterChannels(topic).length > 0}
          canMoveUp={index > 0}
          canMoveDown={index < topics.length - 1}
          onTopicDeleted={loadChannels}
          onTopicsReordered={loadChannels}
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