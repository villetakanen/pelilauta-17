<script lang="ts">
import { t } from 'src/utils/i18n';
import { newCount } from '../../../stores/inbox';
import { uid } from '../../../stores/session';

const count = $derived.by(() => {
  if ($uid) {
    if ($newCount > 9) {
      return '9+';
    }
    // The notification prop shows a string, even if it's 0 - so we need to return undefined to
    // avoid showing a notification bubble, when there are no new messages
    if ($newCount < 1) {
      return undefined;
    }
    return $newCount < 10 ? `${$newCount}` : undefined;
  }
  return undefined;
});
</script>

{#if $uid}
  <a href="/inbox" style="display:block; position:relative" aria-label={t('navigation:inbox')} >
    <cn-navigation-icon noun="send" label={t('navigation:inbox')} notification={count}></cn-navigation-icon>
  </a>
{/if}
