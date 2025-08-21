<script lang="ts">
import type { Site } from '@schemas/SiteSchema';
import { site } from '@stores/site';
import PreviewImport from './PreviewImport.svelte';
import UploadFilesForm from './UploadFilesForm.svelte';

interface Props {
  site: Site;
}

const { site: initialSite }: Props = $props();

$effect(() => {
  // Ensure the site store is set with the initial site data
  // when the component is mounted
  site.set(initialSite);
});
</script>
<div class="content-columns">
  <UploadFilesForm />
  <PreviewImport />
</div>