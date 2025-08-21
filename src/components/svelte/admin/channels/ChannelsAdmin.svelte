<script lang="ts">
import { type Channel, parseChannel } from '@schemas/ChannelSchema';
import { logDebug } from '@utils/logHelpers';
import { onMount } from 'svelte';
import AddChannelDialog from './AddChannelDialog.svelte';
import ChannelSettings from './ChannelSettings.svelte';

let channels: Channel[] = $state([]);
const topics = $derived.by(() => {
  const t = new Set<string>();
  for (const channel of channels) {
    t.add(channel.category ?? '-');
  }
  return Array.from(t);
});

onMount(async () => {
  const { db } = await import('@firebase/client');
  const { doc, onSnapshot } = await import('firebase/firestore');
  const channelsRef = doc(db, 'meta', 'threads');
  onSnapshot(channelsRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      if (data) {
        channels = data.topics.map(parseChannel);
      }
    } else {
      channels = [];
    }
  });
});

function filterChannels(topic: string) {
  return channels.filter((channel) => channel.category === topic);
}

async function addChannel(name: string, category: string, icon: string) {
  logDebug('Adding channel', { name, category, icon });
}
</script>

<div class="content-columns">
  <section class="column-l">
    <h1>Forum</h1>
    <p class="text-caption pb-1 pt-1">
      Forum channels are used to create discussion threads. You can create a new channel by
      clicking the button below.
    </p>
    <div class="toolbar">
      <AddChannelDialog 
        {topics}
        {addChannel}
      />
    </div>
    {#if channels.length === 0}
      <p>No channels found</p>
    {:else}
      {#each topics as topic}
        <h2>{topic}</h2>
        {#each filterChannels(topic) as channel}
          <ChannelSettings {channel} />
        {/each}
      {/each}
    {/if}
  </section>
</div>