import type { Locale } from 'src/utils/i18n';

export const admin: Locale = {
  title: 'Foorumin hallinta',
  description:
    'Hallitse foorumin kanavia ja aiheita. Luo uusia kanavia, päivitä tilastoja ja järjestä foorumin rakennetta.',
  shortcuts: {
    refreshAll: 'Päivitä kaikki',
    addChannel: 'Lisää kanava',
    addTopic: 'Lisää aihe',
  },
  channels: {
    title: 'Kanavat',
    addChannel: 'Lisää kanava',
    refreshAll: 'Päivitä kaikki',
    noChannels: {
      title: 'Kanavia ei löytynyt',
      description: 'Luo ensimmäinen kanavasi aloittaaksesi.',
    },
    loading: 'Ladataan kanavia...',
    actions: {
      edit: 'Muokkaa',
      delete: 'Poista',
      refresh: 'Päivitä tilastot',
    },
    delete: {
      confirm: 'POISTA KANAVA',
      warning: 'Tämä poistaa kanavan pysyvästi.',
      details: {
        threads: 'Nykyiset keskustelut',
        category: 'Kategoria',
      },
      cannotUndo: 'Tätä toimintoa ei voi perua!',
      typeToConfirm: 'Kirjoita kanavan nimi vahvistaaksesi poiston:',
      namePrompt: 'Kirjoita "{name}" vahvistaaksesi poiston:',
      nameMismatch: 'Kanavan nimi ei täsmää. Poisto peruttu.',
      hasThreads:
        'Kanavaa, jossa on keskusteluja, ei voi poistaa. Siirrä tai poista keskustelut ensin.',
      success: 'Kanava poistettu onnistuneesti',
      failed: 'Kanavan poistaminen epäonnistui',
    },
    edit: {
      namePrompt: 'Muokkaa kanavan nimeä (nykyinen: "{current}"):',
      success: 'Kanava päivitetty onnistuneesti',
      failed: 'Kanavan päivittäminen epäonnistui',
    },
    create: {
      success: 'Kanava "{name}" luotu onnistuneesti',
      failed: 'Kanavan luominen epäonnistui',
    },
    refresh: {
      success: 'Kanavan tilastot päivitetty',
      allSuccess: 'Kaikkien kanavien tilastot päivitetty',
      failed: 'Kanavan tilastojen päivittäminen epäonnistui',
    },
  },
  topics: {
    addTopic: 'Lisää aihe',
    create: {
      title: 'Luo uusi aihe',
      name: 'Aiheen nimi',
      placeholder: 'Syötä aiheen nimi',
      slugPreview: 'URL luodaan automaattisesti',
      description: 'Aiheet auttavat järjestämään kanavat loogisiin ryhmiin.',
      save: 'Luo aihe',
      success: 'Aihe "{name}" luotu onnistuneesti',
      failed: 'Aiheen luominen epäonnistui',
    },
    moveUp: 'Siirrä aihetta ylös',
    moveDown: 'Siirrä aihetta alas',
    delete: 'Poista aihe',
    deleteDisabled: 'Aihetta ei voi poistaa, koska siinä on kanavia',
  },
  errors: {
    loadFailed: 'Kanavien lataaminen epäonnistui',
    retry: 'Yritä uudelleen',
  },
};
