<script lang="ts">
import { t } from 'src/utils/i18n';

interface Props {
  onAddTopic: (name: string) => Promise<void>;
  onCancel: () => void;
}

const { onAddTopic, onCancel }: Props = $props();

let topicName = $state('');
let isSubmitting = $state(false);

async function handleSubmit(event: SubmitEvent) {
  event.preventDefault();
  if (!topicName.trim() || isSubmitting) return;

  isSubmitting = true;
  try {
    await onAddTopic(topicName.trim());
    // Component will be unmounted by parent, so no need to reset form
  } catch (err) {
    // Error handling is done by parent component
  } finally {
    isSubmitting = false;
  }
}

function handleCancel() {
  onCancel();
}
</script>

<div class="surface elevation-1 p-4 mb-2">
  <form onsubmit={handleSubmit}>
    <div class="flex gap-2 items-end">
            <div class="grow">
        <label for="topic-name-input" class="block text-caption mb-1">{t('admin:topics.create.name')}:</label>
        <input
          id="topic-name-input"
          type="text"
          bind:value={topicName}
          placeholder={t('admin:topics.create.placeholder')}
          class="w-full"
          maxlength="50"
          required
          disabled={isSubmitting}
        />
      </div>
      <div class="flex gap-1">
        <button 
          type="submit" 
          class="btn btn-primary btn-sm" 
          disabled={!topicName.trim() || isSubmitting}
        >
          {#if isSubmitting}
            <cn-loader small></cn-loader>
          {:else}
            <cn-icon noun="tag" small></cn-icon>
          {/if}
          <span>{t('admin:topics.create.save')}</span>
        </button>
        <button 
          type="button" 
          onclick={handleCancel} 
          class="btn btn-sm"
          disabled={isSubmitting}
        >
          {t('actions:cancel')}
        </button>
      </div>
    </div>
  </form>
</div>