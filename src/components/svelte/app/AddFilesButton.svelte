<script lang="ts">
import { t } from '@utils/i18n';

interface Props {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  addFiles: (files: File[]) => void;
}

const {
  accept = 'image/*',
  multiple = true,
  disabled = false,
  addFiles,
}: Props = $props();

let fileInputRef: HTMLInputElement;

function handleFileChange(event: Event) {
  const { files } = event.target as HTMLInputElement;
  if (files) {
    addFiles(Array.from(files));
  }
}
const handleButtonClick = () => {
  fileInputRef?.click();
};
</script>

<input
  type="file"
  onchange={handleFileChange}
  style="display: none"
  bind:this={fileInputRef}
/>
<button onclick={handleButtonClick} type="button">
  <cn-icon noun="assets"></cn-icon>
  <span>{t('actions:upload')}</span>
</button>
