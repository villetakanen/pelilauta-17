<script lang="ts">
import type { CnEditor } from '@11thdeg/cn-editor/';
import {
  character,
  loading,
  subscribe,
  update,
} from 'src/stores/characters/characterStore';
import { t } from 'src/utils/i18n';

export interface Props {
  characterKey: string;
}
const { characterKey }: Props = $props();
const saving = $state(false);
let dirty = $state(false);
let markdownContent = $state('');

$effect(() => {
  // We subscribe to the character data when the component mounts, if it's
  // changed during edit, we will show a warning or update the view.
  subscribe(characterKey);
});

async function handleMarkdownInput(event: Event) {
  const target = event.target as CnEditor;
  const content = target.value;
  if (content !== $character?.markdownContent) {
    dirty = true;
    markdownContent = content;
  }
}

async function handleSubmit(event: Event) {
  event.preventDefault();
  // Handle form submission logic here
  console.log('Form submitted for character:', characterKey);
  await update({ markdownContent });
}
</script>

<form
  id="thread-editor"
  class="content-editor"
  onsubmit={handleSubmit}>
    {#if $loading}
      <cn-loader></cn-loader>
    {:else if $character}
      <cn-editor
        value={$character.markdownContent || ''}
        name="markdownContent"
        disabled={saving}
        oninput={handleMarkdownInput}
        placeholder={t('entries:thread.placeholders.content')}
      ></cn-editor>
      <div class="toolbar">
        <button
          type="submit"
          class="button primary"
          disabled={!dirty || saving}>
          {saving ? t('actions:saving') : t('actions:save')}
        </button>
      </div>
    {/if}



  
</form>
