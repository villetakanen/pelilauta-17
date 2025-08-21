<script lang="ts">
import type { Reply } from '@schemas/ReplySchema';
import { uid } from '@stores/session';
import AvatarLink from '@svelte/app/AvatarLink.svelte';
import ProfileLink from '@svelte/app/ProfileLink.svelte';
import ReactionButton from '@svelte/app/ReactionButton.svelte';
import { t } from '@utils/i18n';
import { marked } from 'marked';

interface Props {
  reply: Reply;
}
const { reply }: Props = $props();
const fromUser = $derived.by(() => {
  return reply.owners[0] === $uid;
});

const images = $derived.by(() => {
  return (
    reply.images?.map((image) => ({
      src: image.url,
      caption: image.alt,
    })) || []
  );
});
</script>
<article  class="flex flex-no-wrap">
  {#if !fromUser}
    <div class="sm-hidden flex-none">
      <AvatarLink uid={reply.owners[0]} />
    </div>
  {/if}

  <cn-bubble reply={fromUser || undefined}>
    <div class="toolbar downscaled">
      <p>
        <ProfileLink uid={reply.owners[0]} />
      </p>
      <cn-menu inline>
        <ul>
          <li>
            <a
              href={`/threads/${reply.threadKey}/replies/${reply.key}/fork`}
            >
              <cn-icon noun="fork" small></cn-icon>
              <span>{t('actions:fork')}</span>
            </a>
          </li>
          {#if fromUser}
            <li>
              <a
                href={`/threads/${reply.threadKey}/replies/${reply.key}/delete`}
              >
                <cn-icon noun="delete" small></cn-icon>
                <span>{t('actions:delete')}</span>
              </a>
            </li>
          {/if}
        </ul>
      </cn-menu>
    </div>
    <div>
      {#if images.length }
        <cn-lightbox {images}></cn-lightbox>
      {/if}
      {@html marked(reply.markdownContent || '')}
    </div>
    <div class="toolbar justify-end">
      <ReactionButton target="reply" small key={reply.key}></ReactionButton>
    </div>
  </cn-bubble>
    
  {#if fromUser}
    <div class="sm-hidden flex-none">
      <AvatarLink uid={reply.owners[0]} />
    </div>
  {/if}
</article>