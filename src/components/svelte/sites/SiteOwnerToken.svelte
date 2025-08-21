<script lang="ts">
import type { Site } from '@schemas/SiteSchema';
import { uid } from '@stores/session';

interface Props {
  site: Site;
}

const { site } = $props() as Props;
const owns = $derived(site.owners.includes($uid));
</script>
{#if owns}
<cn-icon noun="avatar" small></cn-icon>
{/if}