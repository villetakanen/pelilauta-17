import type { Entry } from '@schemas/EntrySchema';
import { systemToNounMapping } from '../schemas/nouns';
import { logWarn } from './logHelpers';

type Timestamp = {
  seconds: number;
  nanoseconds: number;
};

export function toDate(variable: unknown): Date {
  if (!variable) return new Date();
  if (variable instanceof Date) return variable;
  if (typeof variable === 'string') return new Date(variable);
  if (typeof variable === 'number') return new Date(variable);

  const virtual = variable as Timestamp;
  if (virtual.seconds) return new Date(virtual.seconds * 1000);

  return new Date();
}

/*export function topicToNoun(topic: string | undefined): string {
  logWarn(
    'topicToNoun is a development time helper, it should be replaced with a meta-store mapping in production',
  );

  switch (topic) {
    case 'Roolipelit':
      return 'd20';
    case 'Yleinen':
      return 'discussion';
    case 'Videot':
      return 'youtube';
    default:
      return 'fox';
  }
}*/

export function systemToNoun(system: string | undefined): string {
  if (Object.keys(systemToNounMapping).includes(system || '')) {
    return systemToNounMapping[system || ''];
  }
  logWarn('missing systemToNoun mapping, using homebrew as default', system);
  return 'homebrew';
}

/**
 * This function normalizes the flowTime to a number.
 *
 * Sometimes an entry might be missing th flowTime, or it might be in a legacy
 * format.
 *
 * Assuming the flowTime is not found, we try using updatedAt, and if that is
 * not found, we try using createdAt. If none of these are found, we default to 0.
 *
 * @param entry
 * @returns
 */
export function parseFlowTime(entry: Partial<Entry>): number {
  return entry.flowTime
    ? toDate(entry.flowTime).getTime()
    : entry.updatedAt
      ? toDate(entry.updatedAt).getTime()
      : entry.createdAt
        ? toDate(entry.createdAt).getTime()
        : 0;
}
