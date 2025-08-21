<script lang="ts">
import { deleteThread } from '@firebase/client/threads/deleteThread';
import type { Thread } from '@schemas/ThreadSchema';
import { uid } from '@stores/session';
import WithAuth from '@svelte/app/WithAuth.svelte';
import { pushSessionSnack, pushSnack } from '@utils/client/snackUtils';
import { t } from '@utils/i18n';
import { logError } from '@utils/logHelpers';

interface Props {
  thread: Thread;
}
const { thread }: Props = $props();
const allow = $derived.by(() => {
  if (!$uid) {
    return false;
  }
  return thread.owners.includes($uid);
});

async function onsubmit(e: Event) {
  e.preventDefault();
  try {
    await deleteThread(thread);
    // Add a Snackbar notification to confirm the deletion.
    pushSessionSnack({
      message: t('threads:confirmDelete.success'),
    });

    // Redirect to the forum page.
    window.location.href = '/';
  } catch (e: unknown) {
    if (e instanceof Error) {
      logError(e);
      pushSnack(t('app:error.generic'));
    } else {
      logError(new Error('Unknown error occurred during thread deletion'));
      pushSnack(t('app:error.generic'));
    }
  }
}
</script>
<WithAuth {allow}>
  <div class="content-columns">

    <section>
    
      <h1 class="downscaled">{t('threads:confirmDelete.title')}</h1>
      
      <p>{t('threads:confirmDelete.message')}</p>
    
      <form class="toolbar" {onsubmit}>
        <a href={`/threads/${thread.key}`} class="button text">
          {t('actions:cancel')}
        </a>
        <button type="submit" class="button">
          {t('actions:confirm.delete')}
        </button>
      </form>

    </section>
  </div>
</WithAuth>
 
