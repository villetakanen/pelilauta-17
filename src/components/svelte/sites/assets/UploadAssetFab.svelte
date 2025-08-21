<script lang="ts">
import { addAssetToSite } from '@firebase/client/site/addAssetToSite';
import type { Site } from '@schemas/SiteSchema';
import { uid } from '@stores/session';
import { resizeImage } from '@utils/client/resizeImage';
import { pushSnack } from '@utils/client/snackUtils';
import { t } from '@utils/i18n';
import { logWarn } from '@utils/logHelpers';

interface Props {
  site: Site;
}
const { site }: Props = $props();

const visible = $derived.by(() => site.owners.includes($uid));

async function uploadFiles(files: FileList) {
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      const resizedFile = await resizeImage(file);
      // Check the file size, reject if it's too big (e.g., 10MB)
      if (resizedFile.size > 10 * 1024 * 1024) {
        throw new Error('File is too big');
      }
      // Upload the resized file
      await addAssetToSite(site, resizedFile);
      pushSnack(t('site:assets.upload.success', { file: file.name }));
    } else if (
      file.type === 'application/pdf' ||
      file.type === 'text/plain' ||
      file.type === 'text/markdown'
    ) {
      // Handle PDF, text, and markdown files
      console.log('PDF/Text/Markdown file:', file);

      // Check the file size, reject if it's too big (e.g., 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File is too big');
      }

      // Upload the file
      await addAssetToSite(site, file);
      pushSnack(t('site:assets.upload.success', { file: file.name }));
    } else {
      pushSnack(
        t('site:assets.upload.error.invalidFileType', { file: file.type }),
      );
    }
  }
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const files = input.files;
    await uploadFiles(files);
    input.value = ''; // Clear the input value after processing
  } else {
    logWarn('No files selected or input is empty');
  }
}

function handleButtonClick() {
  const input = document.querySelector('#file-input-fab') as HTMLInputElement;
  if (input) {
    input.click();
  }
}
</script>

{#if visible}
<input
  id="file-input-fab"
  type="file"
  onchange={handleFileChange}
  style='display: none'
  accept="image/*,video/*,audio/*,application/pdf,application/zip"
/>
<button 
  class="fab" 
  onclick={handleButtonClick}
  type="button">
  <cn-icon noun="assets"></cn-icon>
  <span>{t('actions:upload')}</span>
</button>
{/if}