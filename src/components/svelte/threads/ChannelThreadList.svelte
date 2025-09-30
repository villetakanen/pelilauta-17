<script lang="ts">
import type { Channel } from '@schemas/ChannelSchema';
import type { Thread } from '@schemas/ThreadSchema';
import { parseThread } from '@schemas/ThreadSchema';
import { uid } from '@stores/session';
import { t } from '@utils/i18n';
import { toDisplayString } from '@utils/contentHelpers';
import { logDebug, logError } from '@utils/logHelpers';
import ProfileLink from '../app/ProfileLink.svelte';
import ThreadSubscriber from './ThreadSubscriber.svelte';

interface Props {
  channel: Channel;
  initialThreads: Thread[];
  initialLastFlowTime: number;
  hasError: boolean;
}

const { channel, initialThreads, initialLastFlowTime, hasError }: Props = $props();

// Component state
let threads = $state([...initialThreads]);
let lastFlowTime = $state(initialLastFlowTime);
let isLoading = $state(false);
let hasMore = $state(initialThreads.length === 11);
let error = $state<string | null>(null);
let isAuthenticated = $derived(!!$uid);

async function loadMoreThreads() {
  if (isLoading || !hasMore) return;
  
  isLoading = true;
  error = null;
  
  try {
    const response = await fetch(
      `/api/threads.json?channel=${channel.slug}&startAt=${lastFlowTime}&limit=11`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to load threads: ${response.status}`);
    }
    
    const threadsData = await response.json();
    const newThreads = threadsData.map((thread: any) => 
      parseThread(thread, thread.key)
    );
    
    if (newThreads.length > 0) {
      threads = [...threads, ...newThreads];
      lastFlowTime = newThreads[newThreads.length - 1].flowTime;
      hasMore = newThreads.length === 11;
    } else {
      hasMore = false;
    }
    
    logDebug('ChannelThreadList', `Loaded ${newThreads.length} more threads`);
  } catch (err) {
    logError('ChannelThreadList', 'Failed to load more threads:', err);
    error = err instanceof Error ? err.message : 'Failed to load more threads';
  } finally {
    isLoading = false;
  }
}
</script>

{#if !hasError}
<section class="content-listing">
  <header class="flex flex-row surface">
    <div class="grow">
      <nav aria-label="Breadcrumb">
        <ol class="list-none breadcrumbs">
          <li>
            <a href="/" class="text-link">{t('app:shortname')}</a>
          </li>
          <li class="grow">
            <a href="/channels/" class="text-link">{t('threads:forum.title')}</a>
          </li>
        </ol>
      </nav>
      <h1 class="text-h3">{channel.name}</h1>
    </div>

    <!-- Search box, disabled for anonymous users -->
    <div>
      <div class="flex items-center bg-surface border border-color p-2 radius-m">
        <input
          type="search"
          placeholder={`Search in ${channel.name}...`}
          />
          <cn-icon noun="search" small></cn-icon>
        </div>
    </div>
  </header>

  <div class="listing-items">
    {#each threads as thread (thread.key)}
      <article class="cols-2" id={`thread-${thread.key}`}>
        <div>
          <h4 class="downscaled m-0">
            <a href={`/threads/${thread.key}`} class="no-decoration">
              {thread.title}
            </a>
          </h4>
          <p class="text-caption m-0">
            <ProfileLink uid={thread.author} />
            {#if thread.tags}
              {#each thread.tags as tag}
                <span class="pill">
                  {tag}
                </span>
              {/each}
            {/if}
          </p>
          <ThreadSubscriber {thread} />
        </div>

        <!-- Grid col 2 -->
        <div class="border-l pl-2">
          <a href={`/threads/${thread.key}#discussion`}>
            {t('threads:info.flowTime', { time: toDisplayString(thread.flowTime) })}<br>
            {t('threads:info.replies', { count: thread.replyCount || 0 })}
          </a>
        </div>
      </article>
    {/each}
    
    <!-- Load more functionality -->
    {#if hasMore}
      <div class="flex justify-center p-4">
        <button 
          onclick={loadMoreThreads}
          disabled={isLoading}
          class="px-4 py-2 bg-button text-button border-none radius-m cursor-pointer text-body disabled:opacity-60"
        >
          {isLoading ? 'Loading...' : 'Load More Threads'}
        </button>
      </div>
    {/if}

    {#if error}
      <div class="text-center p-4">
        <p class="text-error mb-2">{error}</p>
        <button 
          onclick={loadMoreThreads} 
          class="px-2 py-1 bg-transparent text-primary border border-primary radius-s cursor-pointer text-caption"
        >
          Retry
        </button>
      </div>
    {/if}
  </div>

  <aside>
    <article class="border surface">
      <cn-icon noun={channel.icon} large></cn-icon>
      <h2 class="downscaled m-0 full-width">{channel.name}</h2>
      <p class="my-0 full-width">
        {t('threads:channel.threadCount', {count: channel.threadCount})}
      </p>
      {#if channel.description}
        <p class="text-small">{channel.description}</p>
      {/if}
    </article>
  </aside>
</section>
{:else}
  <div class="flex justify-center items-center p-8">
    <p class="text-error">Failed to load channel threads. Please try again later.</p>
  </div>
{/if}