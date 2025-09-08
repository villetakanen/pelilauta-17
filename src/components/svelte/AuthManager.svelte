<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '@firebase/client';
  import { logDebug } from '@utils/logHelpers';
  import { browser } from '$app/environment';

  onMount(() => {
    if (!browser) return;

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        const claims = tokenResult.claims;
        const eulaAccepted = claims.eula_accepted === true;
        const accountCreated = claims.account_created === true;

        logDebug('AuthManager', 'User claims', { eulaAccepted, accountCreated });

        const currentPath = window.location.pathname;
        
        const publicPaths = ['/eula', '/'];
        const isPublicPath = publicPaths.includes(currentPath) || currentPath.startsWith('/docs') || currentPath.startsWith('/login');

        if (!eulaAccepted && !isPublicPath) {
          logDebug('AuthManager', `EULA not accepted, redirecting from ${currentPath} to /eula`);
          window.location.href = '/eula';
          return;
        }

        const profileCreationAllowedPaths = [...publicPaths, '/create-profile'];
        const isProfileCreationPath = profileCreationAllowedPaths.includes(currentPath);

        if (eulaAccepted && !accountCreated && !isProfileCreationPath) {
            logDebug('AuthManager', `Account not created, redirecting from ${currentPath} to /create-profile`);
            window.location.href = '/create-profile';
            return;
        }
      }
    });

    return () => unsubscribe();
  });
</script>
