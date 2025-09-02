import type { Locale } from '../../utils/i18n';
import { actions } from './actions';
import { characters } from './characters';
import { entries } from './entries';
import { site } from './site';

export const en: Locale = {
  actions,
  app: {
    title: 'Pelilauta 2 -  Version 16 – Alpha release',
    errors: {
      fetchingThreads:
        'Failed to load threads. Please try refreshing the page.',
    },
  },
  characters,
  entries,
  site,
};
