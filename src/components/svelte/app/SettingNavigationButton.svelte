<script lang="ts">
import { uid } from '@stores/session';
import { profile } from '@stores/session/profile';
import { t } from '@utils/i18n';
</script>
{#if $uid}
<a href="/settings" aria-label={$profile?.nick} data-testid="setting-navigation-button">
  <cn-navigation-icon noun="avatar" label={$profile?.nick}></cn-navigation-icon>
</a>
{:else}
<a href="/login" aria-label={t('navigation:login')}>
  <cn-navigation-icon noun="login" label={t('navigation:login')}></cn-navigation-icon>
</a>
{/if}