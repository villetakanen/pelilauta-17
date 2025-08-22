<script lang="ts">
import { uid } from 'src/stores/session';
import { t } from 'src/utils/i18n';

const visible = $derived.by(() => {
  return !!$uid;
});
</script>

{#if visible}
  <a
    href="/create/thread"
    class="fab"
    data-testid="createDiscussionFab">

    <cn-icon noun="send" small></cn-icon>
    <span class="sm-hidden">{t('actions:create.thread')}</span>

  </a>
{/if}