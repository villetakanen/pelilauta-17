<script lang="ts">
import ProfileLink from 'src/components/svelte/app/ProfileLink.svelte';
import { handouts } from 'src/stores/site/handouts';
import { toDisplayString } from 'src/utils/contentHelpers';
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

