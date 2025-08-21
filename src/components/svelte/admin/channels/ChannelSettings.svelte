<script lang="ts">
import type { Channel } from '@schemas/ChannelSchema';
import { THREADS_COLLECTION_NAME } from '@schemas/ThreadSchema';
import { update } from '@stores/site';
import { toDisplayString } from '@utils/contentHelpers';
import { logDebug } from '@utils/logHelpers';
import { updateDoc } from 'firebase/firestore';

interface Props {
  channel: Channel;
}
const { channel }: Props = $props();

async function forceRefresh() {
  const { db } = await import('@firebase/client');
  const { getDocs, collection, query, where, getDoc, doc } = await import(
    'firebase/firestore'
  );
  const threadsRef = collection(db, THREADS_COLLECTION_NAME);
  const q = query(threadsRef, where('channel', '==', channel.slug));
  const threads = await getDocs(q);
  const lastFlowTime = threads.docs.reduce((acc, doc) => {
    const data = doc.data();
    if (data.flowTime.toMillis() > acc) {
      return data.flowTime.toMillis();
    }
    return acc;
  }, 1000);

  logDebug('forceRefresh', channel.slug, threads.size, lastFlowTime);

  const channels = await getDoc(doc(db, 'meta', 'threads'));
  if (channels.exists()) {
    logDebug('forceRefresh', 'updating', channel.slug);
    const data = channels.data();
    if (data) {
      const topics = data.topics.map((c: Channel) => {
        if (c.slug === channel.slug) {
          return {
            ...c,
            threadCount: threads.size,
            flowTime: lastFlowTime,
          };
        }
        return c;
      });
      logDebug('forceRefresh', 'updating', topics);
      await updateDoc(doc(db, 'meta', 'threads'), { topics });
    }
  }
}
</script>

<div class="flex">
  <div class="grow">
    <h3>{channel.slug}</h3>
  </div>
  <div>
    <p class="text-small">
      {channel.threadCount} threads <br><br>
      {toDisplayString(channel.flowTime)} latest flowTime
    </p>
    <button type="button"
    onclick={forceRefresh}
    >Force Refresh</button>
  </div>
</div>

