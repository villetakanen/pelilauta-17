<!-- src/components/svelte/threads/ThreadListItem.svelte -->
<script lang="ts">
import type { Thread } from '@schemas/ThreadSchema';
import ProfileLink from '@svelte/app/ProfileLink.svelte';
import ThreadSubscriber from '@svelte/threads/ThreadSubscriber.svelte';
import { toDisplayString } from '@utils/contentHelpers';
import { t } from '@utils/i18n';

interface Props {
  thread: Thread;
}
const { thread }: Props = $props();
</script>

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
