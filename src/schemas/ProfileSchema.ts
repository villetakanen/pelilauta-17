import { toFid } from '@utils/toFid';
import { z } from 'zod';

export const PROFILES_COLLECTION_NAME = 'profiles';

export const ProfileSchema = z.object({
  key: z.string(),
  username: z.string(),
  nick: z.string(),
  avatarURL: z.string().optional(),
  bio: z.string().optional(),
  tags: z.array(z.string()).optional(),
  lovedThreads: z.array(z.string()).optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

export function parseProfile(
  data: Record<string, unknown>,
  key: string,
): Profile {
  const nick = data.nick ? (data.nick as string) : 'N.N.';

  const username = data.username ? data.username : toFid(nick);

  return ProfileSchema.parse({
    ...data,
    nick,
    username,
    key,
  });
}
