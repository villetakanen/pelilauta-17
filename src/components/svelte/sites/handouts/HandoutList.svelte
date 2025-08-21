<script lang="ts">
import { handouts } from '@stores/site/handouts';
import ProfileLink from '@svelte/app/ProfileLink.svelte';
import { toDisplayString } from '@utils/contentHelpers';
import HandoutListItem from './HandoutListItem.svelte';
</script>

<section class="surface p-2">

  {#if $handouts.length === 0}
    <p>No handouts available.</p>
  {:else}
    
    {#each $handouts as handout}
      <HandoutListItem {handout} />     
    {/each}
  {/if}
</section>

