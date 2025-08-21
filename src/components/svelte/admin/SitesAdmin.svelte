<script lang="ts">
import { appMeta } from '@stores/metaStore/metaStore';
import { uid } from '@stores/session';
import WithAuth from '@svelte/app/WithAuth.svelte';
import AddSiteReactions from './AddSiteReactions.svelte';

import {
  SITES_COLLECTION_NAME,
  type Site,
  parseSite,
} from '@schemas/SiteSchema';
import ProfileLink from '@svelte/app/ProfileLink.svelte';
import { toClientEntry } from '@utils/client/entryUtils';
import { toDisplayString } from '@utils/contentHelpers';
import { onMount } from 'svelte';

const visible = $derived.by(() => $appMeta.admins.includes($uid));
const sites = $state(new Array<Site>());

onMount(async () => {
  if (!visible) return;
  const { getFirestore, query, collection, orderBy, getDocs } = await import(
    'firebase/firestore'
  );
  const q = query(
    collection(getFirestore(), SITES_COLLECTION_NAME),
    orderBy('flowTime', 'desc'),
  );
  const snapshot = await getDocs(q);

  for (const doc of snapshot.docs) {
    sites.push(parseSite(toClientEntry(doc.data()), doc.id));
  }
});

function getLatesPageRef(site: Site) {
  if (!site?.pageRefs?.length) return undefined;
  return [...site.pageRefs].sort((a, b) => b.flowTime - a.flowTime)[0];
}
</script>
<WithAuth allow={visible}>
  <div class="content-columns">
  <section>
    <h1>SITES</h1>
    <p>Site activity for public and hidden site - used for usage and triage purposes.</p>
    {#each sites as site}
      <h4>{site.name}</h4>
      <p>
        {getLatesPageRef(site)?.name}
        -
        <ProfileLink uid={getLatesPageRef(site)?.author || ''} />
        -
        {toDisplayString(getLatesPageRef(site)?.flowTime)}
      </p>
      <div class="toolbar">
        <AddSiteReactions site={site} />
      </div>
    {/each}
  </section>
  </div>
</WithAuth>