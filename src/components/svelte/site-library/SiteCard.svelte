<script lang="ts">
import type { Site } from '@schemas/SiteSchema';
import { uid } from '@stores/session';
import { toDisplayString } from '@utils/contentHelpers';
import { systemToNoun } from '@utils/schemaHelpers';

interface Props {
  site: Site;
}
const { site }: Props = $props();
const owns = $derived(() => site.owners.includes($uid));
const plays = $derived(() => site.players?.includes($uid));
</script>
<cn-card
  title={site.name}
  href={`/sites/${site.key}`}
  noun={systemToNoun(site.system)}
  cover={site.posterURL || undefined}
>
  <p>{site.description}</p>
  <div slot="actions" class="flex toolbar">
    {#if owns()}
      <cn-icon noun="avatar"></cn-icon>
    {/if}
    {#if plays()}
      <cn-icon noun="adventurer"></cn-icon>
    {/if}
    <div>
      <p>{toDisplayString(site.flowTime)}</p>
    </div>
  </div>
</cn-card>