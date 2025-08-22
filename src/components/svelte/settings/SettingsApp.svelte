<script lang="ts">
import ProfileSection from 'src/components/shared/ProfileSection.svelte';
import {
  PROFILES_COLLECTION_NAME,
  type Profile,
  parseProfile,
} from 'src/schemas/ProfileSchema';
import { uid } from 'src/stores/session';
import { toClientEntry } from 'src/utils/client/entryUtils';
import { t } from 'src/utils/i18n';
import { onMount } from 'svelte';
import Actions from './Actions.svelte';
import AuthnSection from './AuthnSection.svelte';
import ProfileTool from './ProfileTool.svelte';
import RemoveAccountSection from './RemoveAccountSection.svelte';

let profile: Profile | null = $state(null);

onMount(() => {
  if ($uid === null) {
    window.location.href = '/login';
  }
  subscribe();
});

async function subscribe() {
  const { onSnapshot, doc, getFirestore } = await import('firebase/firestore');

  onSnapshot(doc(getFirestore(), PROFILES_COLLECTION_NAME, $uid), (doc) => {
    if (!doc.exists()) {
      return;
    }
    const p = parseProfile(toClientEntry(doc.data()), doc.id);
    profile = p;
  });
}
</script>

<div class="content-columns">
  {#if profile}
    <div class="column-s">
      <h3>{t('settings:preview.title')}</h3>
      <ProfileSection {profile} />
    </div>
    <ProfileTool {profile} />
    <Actions />
    <AuthnSection />
    <RemoveAccountSection />
  {:else} 
    <div>
      <cn-loader></cn-loader>
    </div>
  {/if}
</div>
