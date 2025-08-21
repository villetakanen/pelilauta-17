<script lang="ts">
import { addAssetToSite } from '@firebase/client/site/addAssetToSite';
import type { Site } from '@schemas/SiteSchema';
import { update } from '@stores/site';
import { resizeImage } from '@utils/client/resizeImage';
import { t } from '@utils/i18n';

/**
 * A file input for setting a site theme image. There are 3 different images we want to use
 * for the site theme: an avatar, a card image, and a background image. This component
 * allows the user to upload an image to the site Assets and adds that image to the site.
 */

interface Props {
  site: Site;
  imageField: 'avatarURL' | 'posterURL' | 'backgroundURL';
}
const { site, imageField }: Props = $props();
let preview = $state<string | null>(site[imageField] ?? null);
let file = $state<File | null>(null);

async function fileChanged(e: Event) {
  const target = e.target as HTMLInputElement;
  const f = target.files?.[0];
  if (!f) return;

  const resized = await resizeImage(f);

  // Add file base64 to preview
  const reader = new FileReader();
  reader.onload = () => {
    preview = reader.result as string;
  };
  reader.readAsDataURL(resized);

  // Set file
  file = resized;
}

async function onsubmit(e: Event) {
  e.preventDefault();
  if (!preview) return;

  const f = file;
  if (!f) return;

  const url = await addAssetToSite(site, f, {});

  update({
    [imageField]: url,
  });
}

function resetPreview() {
  preview = null;
  file = null;
}

async function deleteImage() {
  update({
    [imageField]: '',
  });
  preview = null;
  file = null;
}
</script>

<form
  onsubmit={onsubmit}
  class="flex flex-no-wrap p-2"
>
  {#if preview}
    <img
      src={preview}
      alt={t('app:meta.preview')}
      class="icon-large flex-none"
      style="align-self: flex-start;justify-self: center;flex-grow: 0;"
     />
  {:else}
    <cn-icon noun="assets" large class="flex-none" style="align-self: flex-start;justify-self: center;flex-grow: 0;"></cn-icon>
  {/if}
  
  <div>
    <label>{t(`entries:site.${imageField}`)}
      <input type="file" accept="image/*" onchange={fileChanged} />
    </label>
    
    <div class="toolbar justify-end">
      <button type="button" disabled={!site[imageField]} onclick={deleteImage} class="text">
        {t('actions:delete')}
      </button>
        
        <button type="reset" disabled={file === null} onclick={resetPreview}  class="text">
          {t('actions:reset')}
        </button>
        <button type="submit" disabled={file === null} >
          {t('actions:upload')}
        </button>
      </div>
  </div>
</form>

