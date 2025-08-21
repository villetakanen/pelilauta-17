<script lang="ts">
import type { Channel } from '@schemas/ChannelSchema';
import type { Thread } from '@schemas/ThreadSchema';
import { uid } from '@stores/session';
import AddFilesButton from '@svelte/app/AddFilesButton.svelte';
import { pushSnack } from '@utils/client/snackUtils';
import { extractTags } from '@utils/contentHelpers';
import { t } from '@utils/i18n';
import { logDebug, logError } from '@utils/logHelpers';
import type { CnEditor } from 'cn-editor/src/cn-editor';
import { onMount } from 'svelte';
import ChannelSelect from './ChannelSelect.svelte';
import { submitThreadUpdate } from './submitThreadUpdate';

interface Props {
  thread?: Thread;
  channelKey: string;
  channels: Channel[];
}

const { thread, channelKey, channels }: Props = $props();

// Component level state
let saving = $state(false);
let changed = $state(false);
let files = $state<File[]>([]);
let existingImages = $state<Array<{ url: string; alt: string }>>([]);
let tags = $state<string[]>(thread?.tags || []);

// Derived state
const previews = $derived.by(() => {
  const filePreviews = files.map((file) => ({
    src: URL.createObjectURL(file),
    caption: file.name,
  }));

  const imagePreviews = existingImages.map((image) => ({
    src: image.url,
    caption: image.alt,
  }));

  return [...imagePreviews, ...filePreviews];
});

onMount(() => {
  if (thread?.images) {
    existingImages = thread.images;
  }
});

async function handleSubmit(event: Event) {
  logDebug('ThreadEditorForm', 'handleSubmit', event);
  event.preventDefault();
  saving = true;
  const form = new FormData(event.target as HTMLFormElement);
  const data: Partial<Thread> = {
    title: form.get('title') as string,
    channel: form.get('channel') as string,
    markdownContent: form.get('markdownContent') as string,
    tags,
    owners: [$uid],
  };
  if (thread) {
    data.key = thread.key;
  }
  try {
    const slug = await submitThreadUpdate(data, files);
    saving = false;
    window.location.href = `/threads/${slug}`;
  } catch (error) {
    logError('Error saving thread', error);
    pushSnack(t('threads:editor.error.save'));
    saving = false;
  }
}
async function handleChange() {
  if (!changed) {
    changed = true;
  }
}

async function handleContentChange(event: InputEvent) {
  const editor = event.target as CnEditor;
  const content = editor.value;
  tags = extractTags(content);
  handleChange();
}

function onChannelChange(event: Event) {
  const select = event.target as HTMLSelectElement;
  const selectedChannel = select.value;
  if (selectedChannel !== channelKey) {
    handleChange();
  }
}

function onAddFiles(newFiles: File[]) {
  if (!newFiles || newFiles.length === 0) {
    return;
  }
  files = [...files, ...newFiles];
  handleChange();
}
</script>

<form
  id="thread-editor"
  class="content-editor"
  onsubmit={handleSubmit}>

  <!-- Toolbar for title, channel, and add files button -->
  <section class="toolbar">
    <label class="grow">
    {t('entries:thread.title')}
      <input
        type="text"
        name="title"
        disabled={saving}
        placeholder={t('entries:thread.placeholders.title')}
        onchange={handleChange}
        value={thread?.title || ''}
      />
    </label>
    <ChannelSelect 
      channels={channels}
      channelKey={channelKey}
      disabled={saving}
      onchange={onChannelChange}
    />
    <AddFilesButton
      accept="image/*"
      multiple={true}
      addFiles={onAddFiles}
      disabled={saving}
    />
  </section>

  <!-- Lightbox for attachments like images -->
  {#if files.length > 0}
    <section style="container: images / inline-size; width: min(420px,90vw); margin: 0 auto; margin-bottom: var(--cn-gap)">
      <cn-lightbox images={previews}></cn-lightbox>
    </section>
  {/if}

    <cn-editor
      value={thread?.markdownContent || ''}
      name="markdownContent"
      disabled={saving}
      oninput={handleContentChange}
      placeholder={t('entries:thread.placeholders.content')}
    ></cn-editor>


  {#if tags.length > 0}
    <section class="flex elevation-1 p-1">
      {#each tags as tag}
        <span class="cn-tag">{tag}</span>
      {/each}
    </section>
  {/if}

  <section class="toolbar">
    {#if thread?.key}
      <button type="button" disabled={saving} class="text">
        {t('actions:delete')}
      </button>
    {/if}
    <button type="button" disabled={saving} class="text">
      {t('actions:cancel')}
    </button>
    <div class="grow"></div>
    <button type="submit" disabled={saving || !changed} data-testid="send-thread-button">
      {#if saving}
        <cn-loader noun="send" style="display:inline-block;vertical-align: middle"></cn-loader>
      {:else}
        <cn-icon noun="send"></cn-icon>
      {/if}
      <span>{t('actions:send')}</span>
    </button>
  </section>
</form>

