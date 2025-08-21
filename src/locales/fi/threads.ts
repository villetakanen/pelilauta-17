import type { Locale } from '@utils/i18n';

export const threads: Locale = {
  fork: {
    title: 'Jaa uutena lankana',
    quoted: 'Lainaus',
    crossPost: 'Jatkoi keskustelua uudessa langassa ',
  },
  info: {
    title: 'Tietoja',
    author: 'Kirjoittanut',
    inTopic: 'aiheessa',
    replies: '{count} vastausta',
    createdAt: 'Luotu {time}',
    flowTime: 'Päivitetty {time}',
    loveCount: '{count} tykkäystä',
    actions: {
      title: 'Toiminnot',
      admin: {
        title: 'Hallinta',
        repost: 'Jaa uudelleen',
      },
    },
  },
  edit: {
    title: 'Muokkaa viestiä',
  },
  quote: {
    fromThread: 'Lainaus keskustelusta',
  },
  tray: {
    title: 'Aiheet',
  },
  forum: {
    title: 'Foorumi',
    description:
      'Keskustelua roolipeleistä, pelinkehityksestä, ja muista roolipelaamiseen liittyvistä aiheista.',
  },
  channel: {
    page: 'Sivu',
    threadCount: '{count} keskustelua',
    pageCount: 'Sivu {current}/{count}',
    toFirstPage: 'Ensimmäinen sivu <',
    nextPage: '> Seuraava sivu',
    latest: {
      createdAt: 'Uusin ketju',
      flowTime: 'Viimeksi päivitetty',
      latestIsNewest: '(Viimeisin kommentti, on uusimpaan ketjuun)',
    },
  },
  discussion: {
    title: 'Keskustelu',
    reply: 'Vastaa',
    empty: 'Aloita keskustelu aiheesta vastaamalla alta.',
    confirmDelete: {
      message: 'Oletko varma, että haluat poistaa tämän viestin?',
    },
  },
  confirmDelete: {
    title: 'Vahvista poisto',
    success: 'Keskustelu poistettu',
    message:
      'Oletko varma, että haluat poistaa tämän keskustelun pysyvästi. Keskustelua ei voi palauttaa.',
  },
  onboarding: {
    title: 'Tervetuloa Pelilaudalle!',
    description:
      'Pelilauta on roolipelaamiseen keskittynyt sovellus, jossa voit keskustella, jakaa ja dokumentoisa roolipelejä. Kirjautumalla sisään voit osallistua keskusteluihin, reagoida viesteihin ja aloittaa uusia aiheita.',
  },
  snacks: {
    replyDeleted: 'Viesti poistettu',
  },
};
