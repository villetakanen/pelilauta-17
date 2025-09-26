<script lang="ts">
import { t } from '../../../../utils/i18n';

interface Props {
  topic: string;
  hasChannels: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
}

const {
  topic,
  hasChannels,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDelete,
}: Props = $props();
</script>

<div class="toolbar border-b">
  <h2 class="m-0 grow">{topic}</h2>
  <button 
    onclick={onMoveUp}
    class="icon"
    disabled={!canMoveUp}
    aria-label={t('admin:topics.moveUp')}
    >
    <cn-icon noun="arrow-up"></cn-icon>
  </button>
  <button 
    onclick={onMoveDown}
    class="icon"
    disabled={!canMoveDown}
    aria-label={t('admin:topics.moveDown')}
    >
    <cn-icon noun="arrow-down"></cn-icon>
  </button>
    <button 
      onclick={onDelete}
      class="icon"
      disabled={hasChannels}
      aria-label={hasChannels ? t('admin:topics.deleteDisabled') : t('admin:topics.delete')}
      title={hasChannels ? t('admin:topics.deleteDisabled') : t('admin:topics.delete')}
    >
      <cn-icon noun="trash" small></cn-icon>
    </button>

</div>
