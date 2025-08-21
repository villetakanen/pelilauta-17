<script lang="ts">
// Import stores and utilities
import { profile } from '@stores/session/profile'; // $profile is used directly as per nanostores/svelte
import { pushSessionSnack } from '@utils/client/snackUtils'; // For user feedback
import { t } from '@utils/i18n';
import { onMount } from 'svelte';

// No props needed for this component
// interface Props {}
// const {}: Props = $props();

// Component state using Svelte runes
let uid = $state<string | null>(null);
let email = $state<string | null>(null);
let avatarURL = $state<string | null>(null);
let displayName = $state<string | null>(null);
let loadingAvatarUpdate = $state(false); // For UX feedback during avatar update

// No specific derived state needed for this component structure
// const derivedVar = $derived.by(() => {return value})

onMount(async () => {
  // Dynamically import Firebase Auth functions and instance
  const { onAuthStateChanged } = await import('firebase/auth');
  const { auth } = await import('@firebase/client'); // Corrected path as per instructions

  onAuthStateChanged(auth, (user) => {
    if (user) {
      uid = user.uid;
      email = user.email;
      avatarURL = user.photoURL;
      displayName = user.displayName;
    } else {
      // Handle user being logged out or not found
      uid = null;
      email = null;
      avatarURL = null;
      displayName = null;
    }
  });
});

/**
 * Updates the user's avatar URL in their profile.
 * Dynamically imports the updateProfile function.
 */
async function updateAvatar() {
  if (!avatarURL || !$profile?.key) {
    pushSessionSnack(t('settings:authz.error.missingInfo'), { type: 'error' });
    return;
  }
  loadingAvatarUpdate = true;
  try {
    // Dynamically import Firebase profile update function
    const { updateProfile } = await import(
      '@firebase/client/profile/updateProfile'
    );
    await updateProfile({ avatarURL: avatarURL }, $profile.key);
    pushSessionSnack(t('settings:authz.updateAvatarSuccess'));
    // Optionally, re-fetch profile or rely on store subscription if $profile updates automatically
  } catch (error) {
    console.error('Error updating avatar:', error);
    pushSessionSnack(t('settings:authz.error.updateFailed'), { type: 'error' });
  } finally {
    loadingAvatarUpdate = false;
  }
}
</script>
  
  <section>
    <h3>{t('settings:authz.title')}</h3>
    <p class="text-low downscaled">{t('settings:authz.info')}</p>
  
    <div class="field-grid">
      <p><strong>{t('settings:authz.fields.uid')}</strong></p>
      <p>{uid || '---'}</p> 
  
      <p><strong>{t('settings:authz.fields.displayName')}</strong></p>
      <p>{displayName || '---'}</p>
  
      <p><strong>{t('settings:authz.fields.email')}</strong></p>
      <p>{email || '---'}</p>
  
      <p><strong>{t('settings:authz.fields.avatarURL')}</strong></p>
      <div>
        <p>{avatarURL || '---'}</p>
        {#if avatarURL && avatarURL !== $profile?.avatarURL}
          <div class="flex flex-row items-center my-1">
            <cn-avatar src={$profile?.avatarURL} alt="Current Avatar"></cn-avatar>
            <cn-icon noun="add" class="mx-1"></cn-icon> 
            <cn-avatar src={avatarURL} alt="New Avatar"></cn-avatar>
          </div>
          <button
          type="button"
          class="button"
          disabled={!avatarURL || avatarURL === $profile?.avatarURL || loadingAvatarUpdate}
          onclick={updateAvatar}
        >
          {#if loadingAvatarUpdate}
            <cn-loader></cn-loader>
          {:else}
            <cn-icon noun="avatar"></cn-icon>
          {/if}
          <span>{t('settings:authz.updateAvatar')}</span>
        </button>
        {/if} 
      </div>
    </div>
  
    <p class="text-low downscaled mt-2">
      <a href="/docs/04-authz">{t('actions:learnMore')}</a>
    </p>
  </section>
  