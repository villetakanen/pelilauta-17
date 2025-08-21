import { serverDB } from '@firebase/server';
import { type Channel, parseChannel } from '@schemas/ChannelSchema';
import { toClientEntry } from '@utils/client/entryUtils';

export async function GET(): Promise<Response> {
  const channels: Channel[] = [];

  const channelsRef = serverDB.collection('meta').doc('threads');
  const doc = await channelsRef.get();

  const channelsArray = doc.data()?.topics;

  if (!channelsArray) {
    return new Response('No channels found', { status: 500 });
  }

  for (const channel of channelsArray) {
    channels.push(parseChannel(toClientEntry(channel)));
  }

  return new Response(JSON.stringify(channels), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=60, stale-while-revalidate',
    },
  });
}
