<!-- src/components/svelte/threads/ChannelLoadMore.svelte -->
<script lang="ts">
import { parseThread, type Thread } from '@schemas/ThreadSchema';
import { logDebug, logError } from '@utils/logHelpers';
import ThreadListItem from './ThreadListItem.svelte';

interface Props {
  channelSlug: string;
  initialLastFlowTime: number;
  initialHasMore: boolean;
}

const { channelSlug, initialLastFlowTime, initialHasMore }: Props = $props();

let isLoading = $state(false);
let hasMore = $state(initialHasMore);
let lastFlowTime = $state(initialLastFlowTime);
let error = $state<string | null>(null);
let newThreads = $state<Thread[]>([]);

async function loadMore() {
  if (isLoading || !hasMore) return;

  isLoading = true;
  error = null;

  try {
    const response = await fetch(
      `/api/threads.json?channel=${channelSlug}&startAt=${lastFlowTime}&limit=11`,
    );

    if (!response.ok) {
      throw new Error(`Failed to load threads: ${response.status}`);
    }

    const threadsData = await response.json();
    const threads = threadsData.map(
      (
        thread: any, // Use any to avoid schema parsing issues on client
      ) => parseThread(thread, thread.key),
    );

    if (threads.length > 0) {
      newThreads = [...newThreads, ...threads];
      lastFlowTime = threads[threads.length - 1].flowTime;
      hasMore = threads.length === 11;
    } else {
      hasMore = false;
    }

    logDebug('ChannelLoadMore', `Loaded ${threads.length} more threads`);
  } catch (err) {
    logError('ChannelLoadMore', 'Failed to load more threads:', err);
    error = err instanceof Error ? err.message : 'Failed to load more threads';
  } finally {
    isLoading = false;
  }
}
</script>

<!-- Render additional threads -->
{#each newThreads as thread}
  <ThreadListItem {thread} />
{/each}

<!-- Load more button -->
{#if hasMore}
  <div class="flex justify-center p-4">
    <button 
      onclick={loadMore}
      disabled={isLoading}
      class="px-4 py-2 bg-button text-button border-none radius-m cursor-pointer text-body disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Loading...' : 'Load More Threads'}
    </button>
  </div>
{/if}

{#if error}
  <div class="text-center p-4">
    <p class="text-error mb-2">{error}</p>
    <button 
      onclick={loadMore} 
      class="px-2 py-1 bg-transparent text-primary border border-primary radius-s cursor-pointer text-caption"
    >
      Retry
    </button>
  </div>
{/if}
