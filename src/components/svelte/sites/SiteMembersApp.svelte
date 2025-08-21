<script lang="ts">
import type { Site } from '@schemas/SiteSchema';
import { uid } from '@stores/session';
import WithAuth from '@svelte/app/WithAuth.svelte';
import { site } from '../../../stores/site';
import SiteOwnersTool from './SiteOwnersTool.svelte';
import SitePlayersTool from './SitePlayersTool.svelte';
/**
 * A Wrapper for the SiteMembersApp component,
 * Inits the site-store and subscribes to the Site Entry in the Firestore
 */

interface Props {
  site: Site;
}
const { site: initialSite }: Props = $props();
$site = initialSite;
</script>

<WithAuth allow={$site?.owners.includes($uid)}>
  <div class="content-columns">
    <SiteOwnersTool />
    <SitePlayersTool />
  </div>
</WithAuth>

