import type { Locale } from 'src/utils/i18n';

export const site: Locale = {
  clocks: {
    title: 'Clocks',
  },
  characters: {
    title: 'Characters',
    empty: 'No characters have been added to the site',
  },
  handouts: {
    title: 'Secrets',
  },
  keeper: {
    title: 'Character Keeper',
    lastUpdated: 'Last updated',
    error: {
      title: 'Error loading characters',
    },
    noCharacters: {
      title: 'No characters',
      description: 'There are no characters on this site yet.',
    },
    noSheet: {
      title: 'No character sheet selected',
      description: 'Select a character sheet to see the characters.',
    },
  },
  options: {
    title: 'Tools',
    description:
      'Pelilauta / Mekanismi includes a set of tools designed to assist with game mastering and playing. You can enable tools using the buttons below.',
    useClocks: 'Clocks',
    useHandouts: 'Secrets',
    useCharacters: 'Characters',
    useCharacterKeeper: 'Character Keeper',
    useRecentChanges: 'Recent changes panel',
    useSidebar: 'Sidebar (Mekanismi SideBar)',
    sidebarPage: 'Custom sidebar page',
    selectPage: 'Select page',
    selectSheet: 'Select a character sheet',
    selectSidebarPage: 'Select custom page for sidebar (optional)',
    sidebarPageDescription:
      'Select a custom page to display in the sidebar. If no page is selected, the default sidebar will be used.',
    useDefaultSidebar: 'Use default sidebar',
  },
};
