<script lang="ts">
import { uid } from 'src/stores/session';
import { t } from 'src/utils/i18n';
</script>

{#if $uid}
  <a href="/library" class="button">
    <cn-icon noun="adventurer" small></cn-icon>
    <span class="sm-hidden">{t('library:sites.title')}</span>
  </a>
{/if}