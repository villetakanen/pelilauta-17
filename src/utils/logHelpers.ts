import { FirebaseError } from 'firebase/app';
import { z } from 'zod';

export function logError(...args: unknown[]) {
  for (const arg of args) {
    if (arg instanceof z.ZodError) {
      logError(arg.issues);
    } else {
      if (arg instanceof FirebaseError) {
        console.error('🔥', arg.code, arg.message);
      } else {
        console.error('🦑', ...args);
      }
    }
  }
}

export function logWarn(...args: unknown[]) {
  console.warn('⚠️', ...args);
}
export function logDebug(...args: unknown[]) {
  console.debug('🐛', ...args);
}
