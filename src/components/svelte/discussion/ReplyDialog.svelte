<script lang="ts">
import { addReply } from '@firebase/client/threads/addReply';
import type { Thread } from '@schemas/ThreadSchema';
import { uid } from '@stores/session';
import AddFilesButton from '@svelte/app/AddFilesButton.svelte';
import { t } from '@utils/i18n';

interface Props {
  thread: Thread;
}
const { thread }: Props = $props();
const dialogId = `reply-dialog-${thread.key}`;
let replyContent = $state<string>('');
let files = $state<File[]>([]);
let changed = $state(false);
let saving = $state(false);

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
}

async function onsubmit(e: Event) {
  // Hide the dialog while saving the reply
  const dialog = document.getElementById(dialogId) as HTMLDialogElement;
  dialog.close();

  // TODO: Send the reply
  e.preventDefault();
  saving = true;
  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);
  const markdownContent = formData.get('reply') as string;

  if (files.length > 0) {
    await addReply(thread, $uid, markdownContent, '', files);
  } else {
    await addReply(thread, $uid, markdownContent);
  }

  handleClose();
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
      <button type="button" class="text" onclick={handleClose}>
        {t('actions:cancel')}
      </button>
      <button type="submit" class="call-to-action">
        {t('actions:send')}
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