<script lang="ts">
import { updateReply } from 'src/firebase/client/threads/updateReply';
import type { Reply } from 'src/schemas/ReplySchema';
import { t } from 'src/utils/i18n';
import { logError } from 'src/utils/logHelpers';
import AddFilesButton from '../app/AddFilesButton.svelte';

interface Props {
  reply: Reply;
}
const { reply }: Props = $props();
const dialogId = `edit-reply-dialog-${reply.key}`;
let replyContent = $state<string>(reply.markdownContent || '');
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

export function showDialog() {
  const dialog = document.getElementById(dialogId) as HTMLDialogElement;
  // Reset content to current reply content when opening
  replyContent = reply.markdownContent || '';
  files = [];
  error = null;
  dialog.showModal();
}

function handleClose() {
  const dialog = document.getElementById(dialogId) as HTMLDialogElement;
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

  try {
    await updateReply(reply.threadKey, reply.key, replyContent, files);

    // Only close dialog on successful save
    handleClose();
    // Ideally we should trigger a reload or update the UI here.
    // For MVP, a page reload might be simplest, or relying on Firestore real-time updates if subscribed.
    // Assuming the parent component or page handles real-time updates or we reload.
    // Let's reload for now to be safe and simple as per PBI "without a page refresh (or with a refresh if easier for MVP)"
    // Actually, if we are using Firestore subscriptions, it should update automatically.
    // If not, we might need to reload.
    // Let's try without reload first, assuming subscription.
  } catch (err) {
    // Log the error for debugging
    logError('EditReplyDialog', 'Failed to update reply:', err);

    // Show user-friendly error but keep dialog open so user can retry
    error =
      err instanceof Error
        ? err.message
        : 'Failed to update reply. Please try again.';
    saving = false;
  }
}
</script>

<dialog id={dialogId}>
    <div class="header">
        <button type="button" onclick={handleClose} aria-label="Close dialog">
            <cn-icon noun="close"></cn-icon>
        </button>
        <h3>{t("actions:edit")}</h3>
    </div>

    <form {onsubmit}>
        {#if error}
            <div
                class="error-message"
                style="background: var(--cn-color-error-bg, #fee); color: var(--cn-color-error, #c00); padding: var(--cn-gap-xs); border-radius: var(--cn-radius); margin-bottom: var(--cn-gap);"
            >
                <cn-icon noun="info"></cn-icon>
                <span>{error}</span>
            </div>
        {/if}

        {#if files.length > 0}
            <section
                style="container: images / inline-size; width: min(420px,90vw); margin: 0 auto; margin-bottom: var(--cn-gap)"
            >
                <cn-lightbox images={previews}></cn-lightbox>
            </section>
        {/if}

        <textarea
            placeholder={t("entries:reply.placeholders.markdownContent")}
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
            <button
                type="button"
                class="text"
                onclick={handleClose}
                disabled={saving}
            >
                {t("actions:cancel")}
            </button>
            <button type="submit" class="call-to-action" disabled={saving}>
                {#if saving}
                    <cn-icon noun="clock"></cn-icon>
                    <span>{t("actions:saving") || "Saving..."}</span>
                {:else}
                    {t("actions:save")}
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
