<script lang="ts">
import { authedPost } from '@firebase/client/apiClient';
import { appMeta } from '@stores/metaStore/metaStore';
import { uid } from '@stores/session';
import WithAuth from '@svelte/app/WithAuth.svelte';
import { logDebug } from '@utils/logHelpers';

type Props = {
  showLocalTools: boolean;
};
const { showLocalTools }: Props = $props();
const visible = $derived.by(() => $appMeta.admins.includes($uid));

async function testSSRAuth() {
  const response = await authedPost('/api/bsky/skeet', {
    text: 'Hello world',
  });
  logDebug(`SSR Auth response: ${response.status}`);
}
async function testSSRNoAuth() {
  /* json is 
  text,
  linkUrl,
  linkTitle,
  linkDescription, */
  const response = await fetch('/api/bsky/skeet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: 'Hello world!',
      linkUrl: 'https://pelilauta.social',
      linkTitle: 'Pelilauta',
      linkDescription: 'Pelilauta test post',
    }),
  });
  logDebug(`SSR Auth response: ${response.status}`);
}
</script>

<WithAuth allow={visible}>
  <h3>MOD / ADM</h3>
  <p class="text-caption pb-1 pt-1">
    Admin and Mod tools. Please note some of the tools are not available in the public
    deployment of the Pelilauta app - and require a local deployment.
  </p>
  <ul>
    <li>
      <a href="/admin/channels">
        <cn-icon noun="discussion" small></cn-icon> Forum / Channels
      </a>
    </li>
    <li>
      <a href="/admin/messaging">
        <cn-icon noun="send" small></cn-icon> Social Media Poster
      </a>
    </li>
    {#if showLocalTools}  
      <li>
        <a href="/admin/users">
          <cn-icon noun="adventurer" small></cn-icon> Users
        </a>
      </li>
      
    {/if}
    <li>
      <a href="/admin/sheets">
        <cn-icon noun="adventurer" small></cn-icon> Character Sheets
      </a>
    </li>
    <li>
      <a href="/admin/sites">
        <cn-icon noun="mekanismi" small></cn-icon> Site activity
      </a>
    </li>
    <li>
      <button onclick={testSSRAuth}>
        <cn-icon noun="adventurer" small></cn-icon> Test SSR Auth
      </button>
    </li>
    <li>
      <button onclick={testSSRNoAuth}>
        <cn-icon noun="adventurer" small></cn-icon> Test SSR No Auth
      </button>
    </li>
    <li>
      <button id="error-button">Throw test error</button>
<script>
  function handleClick () {
    throw new Error('This is a test error');
  }
  document.querySelector("#error-button").addEventListener("click", handleClick);
</script>
    </li>
  </ul>
</WithAuth>

