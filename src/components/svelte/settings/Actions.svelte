<script lang="ts">
import { logout } from '@stores/session';
import { t } from '@utils/i18n';

async function logoutAction() {
  await logout();
  window.location.href = '/';
}
</script>

<article class="actions">
  <h3>{t('settings:actions.title')}</h3>
  <button class="button" type="button" onclick={logoutAction}>
    {t('actions:logout')}
  </button>
</article>