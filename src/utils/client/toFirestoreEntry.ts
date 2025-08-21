import type { Entry } from '@schemas/EntrySchema';
import {
  type DocumentData,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export interface Params {
  silent?: boolean;
}

/**
 * Firestore handles dates as Timestamps, so we need to convert them from Date/number to Timestamp
 *
 */
export function convertDatesToTimestamps(record: DocumentData) {
  const converted: DocumentData = { ...record };

  if (converted.createdAt instanceof Date) {
    converted.createdAt = new Timestamp(
      converted.createdAt.getTime() / 1000,
      0,
    );
  }

  if (converted.updatedAt instanceof Date) {
    converted.updatedAt = new Timestamp(
      converted.updatedAt.getTime() / 1000,
      0,
    );
  }

  return converted;
}

/**
 * Firestore handles dates as Timestamps, so we need to convert them from Date/number to Timestamp
 *
 * Sometimes, we want to do a silent conversion, where we don't want to update the
 * fields createdAt, updatedAt and flowTime - thus they are deleted from the object
 *
 * @param entry A partial entry or a an object that extends Entry
 * @param params { silent: boolean }, if silent is true, the fields createdAt, updatedAt and flowTime will be deleted
 * @returns A Record with the entry fields converted to a format suported by the Firestore
 */
export function toFirestoreEntry(
  entry: Partial<Entry>,
  params: Params = { silent: false },
) {
  if (!params.silent)
    return {
      ...entry,
      author: entry.owners ? entry.owners[0] : '-',
      createdAt: entry.createdAt
        ? new Timestamp(entry.createdAt.getTime() / 1000, 0)
        : serverTimestamp(),
      updatedAt: serverTimestamp(),
      flowTime: serverTimestamp(),
    };

  // We want to return the entry, and delete the fields createdAt, updatedAt and flowTime if they are present
  const { createdAt, updatedAt, flowTime, ...rest } = entry;

  return {
    ...rest,
    author: entry.owners ? [0] : '-',
  };
}

export function toFirestoreEntryUpdate(entry: Partial<Entry>) {
  return {
    ...entry,
    updatedAt: serverTimestamp(),
    flowTime: serverTimestamp(),
  };
}
