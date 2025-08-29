<script lang="ts">
import { submitReply } from 'src/firebase/client/threads/submitReply';
import type { Thread } from 'src/schemas/ThreadSchema';
import { t } from 'src/utils/i18n';
import { logError } from 'src/utils/logHelpers';
import { uid } from '../../../stores/session';
import AddFilesButton from '../app/AddFilesButton.svelte';

interface Props {
  thread: Thread;
}
const { thread }: Props = $props();
const dialogId = `reply-dialog-${thread.key}`;
let replyContent = $state<string>('');
let files = $state<File[]>([]);
let changed = $state(false);
let saving = $state(false);
let error = $state<string | null>(null);

const previews = $derived.by(() => {
  return files.map((file) => ({
    src: URL.createObjectURL(file),
    caption: file.name,
  }));
});

function showDialog() {
  const dialog = document.getElementById(dialogId) as HTMLDialogElement;
  dialog.showModal();
}

function handleClose() {
  const dialog = document.getElementById(dialogId) as HTMLDialogElement;
  replyContent = '';
  files = [];
  dialog.close();
  changed = false;
  saving = false;
  error = null;
}

async function onsubmit(e: Event) {
  e.preventDefault();

  // Don't close dialog yet - keep it open during save
  saving = true;
  error = null;

  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);
  const markdownContent = formData.get('reply') as string;

  try {
    await submitReply(thread, markdownContent, '', files);

    // Only close dialog on successful save
    handleClose();
  } catch (err) {
    // Log the error for debugging
    logError('ReplyDialog', 'Failed to save reply:', err);

    // Show user-friendly error but keep dialog open so user can retry
    error =
      err instanceof Error
        ? err.message
        : 'Failed to save reply. Please try again.';
    saving = false;
  }
}
</script>

<div class="toolbar items-center">
  <button type="button" onclick={showDialog}>
    <cn-icon noun="send"></cn-icon>
    <span>{t('threads:discussion.reply')}</span>
  </button>
</div>

<dialog id={dialogId}>

  <div class="header">
    <button type="button" onclick={handleClose} aria-label="Close dialog">
      <cn-icon noun="close"></cn-icon>
    </button>
    <h3>{t('threads:discussion.reply')}</h3>
  </div>

  <form {onsubmit}>

    {#if error}
    <div class="error-message" style="background: var(--cn-color-error-bg, #fee); color: var(--cn-color-error, #c00); padding: var(--cn-gap-xs); border-radius: var(--cn-radius); margin-bottom: var(--cn-gap);">
      <cn-icon noun="info"></cn-icon>
      <span>{error}</span>
    </div>
    {/if}

    {#if files.length > 0}
    <section style="container: images / inline-size; width: min(420px,90vw); margin: 0 auto; margin-bottom: var(--cn-gap)">
      <cn-lightbox images={previews}></cn-lightbox>
    </section>
    {/if}

    <textarea
      placeholder={t('entries:reply.markdownContent')}
      rows="5"
      name="reply"
      required
      class="reply-textarea"
      bind:value={replyContent}
    ></textarea>
    
    <div class="toolbar">
      <AddFilesButton
        accept="image/*"
        multiple={true}
        addFiles={(newFiles: File[]) => {
          files = [...files, ...newFiles];
          changed = true;
        }}
      disabled={saving}
    />
      <div class="grow"></div>
      <button type="button" class="text" onclick={handleClose} disabled={saving}>
        {t('actions:cancel')}
      </button>
      <button type="submit" class="call-to-action" disabled={saving}>
        {#if saving}
          <cn-icon noun="clock"></cn-icon>
          <span>{t('actions:saving') || 'Saving...'}</span>
        {:else}
          {t('actions:send')}
        {/if}
      </button>
    </div>
  </form>
</dialog>

<style>
.reply-textarea {
  min-width: 85dvw;
}
@media screen and (min-width: 621px) {
  .reply-textarea {
    min-width: 620px;
  }
}

</style>