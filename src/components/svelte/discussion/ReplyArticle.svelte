<script lang="ts">
import { marked } from 'marked';
import type { Reply } from 'src/schemas/ReplySchema';
import { t } from 'src/utils/i18n';
import { uid } from '../../../stores/session';
import AvatarLink from '../app/AvatarLink.svelte';
import ProfileLink from '../app/ProfileLink.svelte';
import ReactionButton from '../app/ReactionButton.svelte';

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
<article  class="flex {fromUser ? 'flex-row-reverse' : ''}">
  <div class="sm-hidden flex-none" style="flex: 0 0 auto">
    <AvatarLink uid={reply.owners[0]} />
  </div>
  <cn-bubble reply={fromUser || undefined} class="grow">
    <div class="toolbar downscaled">
      <p class="grow">
        <ProfileLink uid={reply.owners[0]} />
      </p>
      <ReactionButton target="reply" small key={reply.key}></ReactionButton>
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
  </cn-bubble>
    
</article>