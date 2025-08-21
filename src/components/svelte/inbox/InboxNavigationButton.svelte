<script lang="ts">
import { newCount } from '@stores/inbox';
import { uid } from '@stores/session';
import { t } from '@utils/i18n';

const count = $derived.by(() => {
  if ($uid) {
    if ($newCount > 9) {
      return '9+';
    }
    return `${$newCount}`;
  }
});
</script>

{#if $uid}
  <a href="/inbox" style="display:block; position:relative">
    <cn-navigation-icon noun="send" label={t('navigation:inbox')} ></cn-navigation-icon>
    {#if $newCount > 0}
      <span class="pill notification-pill">{count}</span>
    {/if}
  </a>
{/if}
