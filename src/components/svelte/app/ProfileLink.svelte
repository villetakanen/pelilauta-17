<script lang="ts">
import { t } from 'src/utils/i18n';
import { getProfileAtom, loading } from '../../../stores/profiles';

interface Props {
  uid: string;
}
const { uid }: Props = $props();

// Defensive check for undefined uid
if (!uid) {
  console.warn('ProfileLink: received undefined uid, rendering anonymous');
}

const profileAtom = uid ? getProfileAtom(uid) : undefined;
const profile = $derived(profileAtom ? $profileAtom : undefined);
const isLoading = $derived(uid ? $loading.includes(uid) : false);
</script>

{#if isLoading}
  <cn-loader inline></cn-loader>
{:else if profile}
  <a href="/profiles/{profile.key}">{profile.nick}</a>
{:else}
  <span>{t('app.anonymous.nick')}</span>
{/if}