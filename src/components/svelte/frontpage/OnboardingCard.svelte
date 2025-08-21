<script lang="ts">
import { uid } from '@stores/session';
import { t } from '@utils/i18n';
</script>
{#if !$uid}
  <cn-card
    title={t('app:onboarding.title')}
    noun="fox"
    cover="/myrrys-proprietary/public-domain/talk-to-me-by-wootha-620px.webp"
    href="/login"
    class="secondary mb-2"
    >
    <p>{t('app:onboarding.text')}</p>
    <div slot="actions" class="toolbar justify-center">
      <a href="/login" class="button cta">
        {t('actions:login')}
      </a>
    </div>
  </cn-card>
{/if}