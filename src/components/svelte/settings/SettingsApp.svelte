<script lang="ts">
import { profile } from '@stores/session/profile';
import ProfileSection from '../../shared/ProfileSection.svelte';
import Actions from './Actions.svelte';
import AuthnSection from './AuthnSection.svelte';
import ProfileTool from './ProfileTool.svelte';
import RemoveAccountSection from './RemoveAccountSection.svelte';
</script>

<div class="content-columns">
  {#if $profile}
    <ProfileSection profile={$profile} />
    <ProfileTool />
    <Actions />
    <AuthnSection />
    <RemoveAccountSection />
  {:else} 
    <div>
      <cn-loader></cn-loader>
    </div>
  {/if}
</div>
