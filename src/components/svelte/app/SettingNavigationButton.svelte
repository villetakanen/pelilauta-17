<script lang="ts">
import { authUser, sessionState } from '@stores/session';
import { profile } from 'src/stores/session/profile';
import { t } from 'src/utils/i18n';

const isLoading = $derived(
  $sessionState === 'loading' || $sessionState === 'initial',
);
const isAuthenticated = $derived($authUser && $sessionState === 'active');
</script>

{#if isLoading}
  <div class="p-1">
    <cn-loader small></cn-loader>
  </div>
{:else if isAuthenticated}
  <!-- We are now using authUser, which points to firebase auth user login state. This is a bit faster
       than using uid, which requires an additional lookup. Using authUser enables the ux to look cleaner,
       even if there is a slight possibility for $profile to be loading while already logged in-->
  <a
    href="/settings"
    aria-label={$profile?.nick}
    data-testid="setting-navigation-button"
  >
    <cn-navigation-icon noun="avatar" label={$profile?.nick}
    ></cn-navigation-icon>
  </a>
{:else}
  <a href="/login" aria-label={t("navigation:login")}>
    <cn-navigation-icon noun="login" label={t("navigation:login")}
    ></cn-navigation-icon>
  </a>
{/if}
