---
name: 'Tietosuoja'
noun: 'monsters'
---

Pelilauta on avoimen lähdekoodin sovellus, joka on tarkoitettu käytettäväksi yksityishenkilöiden ja yhteisöjen kesken. Sovellus ei kerää käyttäjistään henkilökohtaisia tietoja, mutta käyttäjän itse julkaisema sisältö on julkista ja näkyvissä kaikille sovelluksen käyttäjille.

Sovellus tallentaa käyttäjän antamat tiedot Googlen Firebase -pilvipalveluun EU:n alueelle. Tietoja ei siirretä EU:n ulkopuolelle, mutta Googlen palvelut saattavat käyttää EU:n ulkopuolisia palveluita, kuten kuvien ja sivujen välimuistia.

Sovelluksen tallentamat tiedot käyvät selville sen tietokannan mallintavasta GitHub -repositoriosta, joka läytyy avoimena lähdekoodina osoittesta: https://github.com/villetakanen/pelilauta-16/tree/main/src/schemas

Kirjautumisessa käyttämäsi palvelun (Google, Facebook tai sähköposti) palauttamat yksityiset tiedot, jotka on tallennettu Pelilaudan Firebese-kirjautumistietoihin. Näitä tietoja ei tallenneta sovelluksen tietokantaan, eivätkä ne näy muille kuin teknisille ylläpitäjille.

Kirjautumistiedot poistetaan manuaalisesti, kun käyttäjän tili on ensin poistettu sovelluksesta. Tämä tapahtuu 1-2 viikon kuluessa tilin poistamisesta. Kirjautumistiedot eivät poistu automaattisesti, kun poistat tilisi, koska niitä ei tallenneta sovelluksen tietokantaan. 

Lisää tietoa siitä, miten Firebase tallentaa kirjautumistiedot, löytyy täältä: https://firebase.google.com/support/privacy

Sovellus seuraa käyttäjien akiivisuutta, jotta voimme poistaa epäaktiiviset käyttäjät tietosuojan paranemiseksi. Tämä tarkoittaa, että jos et ole kirjautunut sovellukseen 6 kuukauteen, tilisi poistetaan. Aktiivisuuden seurantaan 
käytetyt tiedot näkyvät vain pääkäyttäjille, ja ne löytyvät tiedostosta: https://github.com/villetakanen/pelilauta-16/blob/main/src/schemas/AccountSchema.ts 

