import { authedPost } from '@firebase/client/apiClient';
import { type Channel, ChannelSchema } from '@schemas/ChannelSchema';
import { PROFILES_COLLECTION_NAME } from '@schemas/ProfileSchema';
import type { Thread } from '@schemas/ThreadSchema';
import { logError } from '@utils/logHelpers';

async function getProfile(uid: string) {
  const { db } = await import('@firebase/client');
  const { getDoc, doc } = await import('firebase/firestore');
  const { normalizeProfileData } = await import('@stores/profiles');

  try {
    const publicProfileDoc = await getDoc(
      doc(db, PROFILES_COLLECTION_NAME, uid),
    );
    if (publicProfileDoc.exists()) {
      const profileData = publicProfileDoc.data();
      if (profileData) {
        return normalizeProfileData(profileData, uid);
      }
    }
  } catch (error) {
    logError('submitThreadUpdate', 'getProfile', uid, error);
  }
  return {
    key: uid,
    nick: 'Anonymous',
    username: 'Anonymous',
    avatarUrl: '',
    bio: '',
    frozen: false,
  };
}

export async function syndicateToBsky(
  thread: Thread,
  uid: string,
): Promise<void> {
  const profile = await getProfile(uid);

  // Fetch channels from the server
  const channelsResponse = await fetch(
    `${window.location.origin}/api/meta/channels.json`,
  );
  const channelsData = await channelsResponse.json();
  const channels = channelsData.map((channel: Partial<Channel>) =>
    ChannelSchema.parse(channel),
  );
  const channelTitle =
    channels.find((channel: Channel) => channel.slug === thread.channel)
      ?.name || thread.channel;

  if (!thread.markdownContent) return;

  const text = `${profile?.nick || 'Pelilauta'} loi uuden ketjun aiheessa: ${channelTitle}\n\n #roolipelit #pelilauta #roolipelsky`;
  const linkUrl = `https://pelilauta.social/threads/${thread.key}`;
  const linkTitle = thread.title;
  const linkDescription = `${thread.markdownContent.substring(0, 220)}...`;

  await authedPost(`${window.location.origin}/api/bsky/skeet`, {
    text,
    linkUrl,
    linkTitle,
    linkDescription,
  });
}

export async function submitThreadUpdate(
  data: Partial<Thread>,
  files?: File[],
) {
  const { addThread } = await import('@firebase/client/threads/addThread');
  const { updateThread } = await import(
    '@firebase/client/threads/updateThread'
  );

  if (!data.title || !data.markdownContent || !data.channel || !data.owners) {
    throw new Error('Missing minimum required fields');
  }

  // Handle thread updates (e.g., editing a thread)
  if (data.key) {
    // the updateThread function requires the thread key to be set in the thread object
    await updateThread(data);
    return data.key;
  }

  const posted = await addThread(data, files || [], data.owners[0]);

  await syndicateToBsky(posted, data.owners[0]);

  return posted.key;
}
