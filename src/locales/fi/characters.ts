import type { Locale } from '@utils/i18n';

export const characters: Locale = {
  character: {
    title: 'Hahmot',
    description:
      'Hahmot ovat pelin pelaajien luomia pelihahmoja. Ne voivat sisältää tietoja, kuten nimen, kuvauksen ja hahmolomakkeen.',
    markdown: 'Yleiskuvaus',
  },
  confirmDeletion: {
    title: 'Poista hahmo',
    description:
      'Olet poistamassa hahmon "{characterName}". Toimintoa ei voi peruuttaa.',
    success: 'Hahmo poistettiin onnistuneesti.',
    error: 'Hahmon poistaminen epäonnistui. Yritä uudelleen.',
  },
  create: {
    title: 'Luo hahmo',
    description: 'Valitse alta hahmolomake, jota haluat käyttää. ',
    noSheet: 'Ei hahmolomaketta (vain nimi ja kuvaus)',
    noSite: 'Ei sivustoa',
  },
  edit: {},
  snacks: {
    characterNotFound: 'Hahmoa ei löytynyt.',
    changesSaved: 'Muutokset tallennettiin.',
    changesSaveFailed: 'Muutosten tallennus epäonnistui.',
    characterCreated: 'Hahmo {name} luotiin onnistuneesti.',
  },
  sheets: {
    editor: {
      info: {
        title: 'Lomakkeen tiedot',
      },
    },
    select: {
      label: 'Hahmolomake',
      none: 'Ei lomaketta',
      loading: 'Ladataan hahmolomakkeita...',
      empty: 'Ei hahmolomakkeita saatavilla.',
      'feature-flagged':
        'Tuki hahmolomakkeille on kokeellinen, ja sitä ei ole vielä otettu käyttöön.',
    },
    fields: {
      name: 'Lomakkeen nimi',
    },
    placeholders: {
      name: 'Esim. D&D 5e Taistelijat',
    },
  },
  sites: {
    select: {
      description: 'Valitse pelisi tai sivustosi, johon hahmo liittyy.',
      empty: 'Sinulla ei ole pelejä tai sivustoja.',
    },
  },
};
