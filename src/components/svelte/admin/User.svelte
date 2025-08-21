<script lang="ts">
import { setFrozen } from '@firebase/client/account/setFrozen';
import type { Account } from '@schemas/AccountSchema';
import { appMeta } from '@stores/metaStore/metaStore';
import ProfileLink from '@svelte/app/ProfileLink.svelte';
import { toDisplayString } from '@utils/contentHelpers';

interface Props {
  account: Account;
}
const { account }: Props = $props();
const adminStatus = $derived(() => $appMeta.admins.includes(account.uid));
const frozenStatus = $derived(() => account.frozen);

const toggleFrozen = async () => {
  account.frozen = !account.frozen;
  await setFrozen(account.frozen, account.uid);
};
</script>

<p class="m-0 p-2">
  <ProfileLink uid={account.uid} /><br>
  <span class="text-caption">{account.uid}</span>
</p>
<p class="m-0 p-2">{toDisplayString(account.lastLogin)}</p>

  {#if adminStatus()}
  <div style="justify-content: center; display: flex;">
    <cn-icon noun="admin"></cn-icon>
    </div>
  {:else}
    <p></p>
  {/if}
  <cn-toggle-button
    disabled={adminStatus()}
    pressed={frozenStatus()}
    onchange={toggleFrozen}
  ></cn-toggle-button>

