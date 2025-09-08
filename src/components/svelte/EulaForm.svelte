<script lang="ts">
  import { logDebug } from '@utils/logHelpers';

  async function handleSubmit(event: Event) {
    event.preventDefault();
    logDebug('EulaForm', 'Submitting EULA acceptance');
    const response = await fetch('/api/onboarding/complete-eula', {
      method: 'POST',
    });

    if (response.ok) {
      logDebug('EulaForm', 'EULA accepted, redirecting to create profile');
      window.location.href = '/create-profile';
    } else {
      logDebug('EulaForm', 'EULA acceptance failed', response);
      // Handle error - maybe show a snackbar
    }
  }
</script>

<form on:submit={handleSubmit}>
  <article class="prose">
    <p>By clicking "Accept", you agree to our terms and conditions.</p>
    <p><strong>Rekisteröityessäsi saat tilin ja profiilin.</strong></p>
    <ul>
      <li>Tilisi tiedot ovat vain sinun ja hallinnon nähtävillä.</li>
      <li>Profiilisi ja julkaisusi ovat kaikkien käyttäjien nähtävillä.</li>
    </ul>
    <p><strong>Tietosuojakäytäntö</strong></p>
    <ul>
      <li>Olet vastuussa julkaisuistasi. Hallinto voi poistaa sääntöjen tai lain vastaista sisältöä.</li>
      <li>Voit poistaa tuottamasi sisältösi itse. Jos poistat tilisi, mutta et sisältöäsi, se merkitään anonyymiksi.</li>
      <li>Tietosi tallennetaan salattuina Googlen pilvipalveluun EU:ssa.</li>
    </ul>
  </article>
  <div class="pt-4">
    <button type="submit" class="cyan-button primary">Accept</button>
  </div>
</form>
