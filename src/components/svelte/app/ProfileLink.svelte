<script lang="ts">
import { getProfileAtom, loading } from '@stores/profiles';
import { t } from '@utils/i18n';

interface Props {
  uid: string;
}
const { uid }: Props = $props();

const profileAtom = getProfileAtom(uid);
const profile = $derived($profileAtom);
const isLoading = $derived($loading.includes(uid));
</script>

{#if isLoading}
  <cn-loader inline></cn-loader>
{:else if profile}
  <a href="/profiles/{profile.key}">{profile.nick}</a>
{:else}
  <span>{t('app.anonymous.nick')}</span>
{/if}