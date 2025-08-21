<script lang="ts">
import type { CnCard } from '@11thdeg/cyan-next';
import type { Thread } from '@schemas/ThreadSchema';
import { uid } from '@stores/session';
import { hasSeen } from '@stores/subscription';

interface Props {
  thread: Thread;
}
const { thread }: Props = $props();

$effect(() => {
  // This efffect should only run if we have an active user session
  if (!$uid) {
    return;
  }

  // As we have an UID, we can check if the thread has been seen
  const element = document.getElementById(`thread-${thread.key}`) as CnCard;
  if ($hasSeen(thread.key, thread.flowTime)) {
    element.classList.remove('notify');
    return;
  }
  element.classList.add('notify');
});
</script>