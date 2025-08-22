<script lang="ts">
import WithAuth from 'src/components/svelte/app/WithAuth.svelte';
import { getAllAccounts } from 'src/firebase/client/admin/getAllAccounts';
import { appMeta } from 'src/stores/metaStore/metaStore';
import { uid } from 'src/stores/session';
import User from './User.svelte';

const allow = $derived.by(() => $appMeta.admins.includes($uid));
</script>

<style>
.user-grid {
  display: grid;
  grid-template-columns: 6fr 2fr 1fr 1fr;
  gap: var(--cn-grid);
  align-items: center;
}
</style>

<WithAuth {allow}>
  <div class="content-columns">
    <article class="column-l">
      <h1>Users</h1>
      {#await getAllAccounts()}
        <cn-loader></cn-loader>
      {:then accounts}
      <div class="user-grid">
        <div class="elevation-1 p-2">NICK</div>
        <div class="elevation-1 p-2">LAST LOGIN</div>
        <div class="elevation-1 p-2">A</div>
        <div class="elevation-1 p-2">FROZEN</div>
        {#each accounts as account}
          <User {account} />  
        {/each}
        </div>
        {:catch error}
          <p>{error.message}</p>
        {/await}
    </article>
  </div>
</WithAuth>