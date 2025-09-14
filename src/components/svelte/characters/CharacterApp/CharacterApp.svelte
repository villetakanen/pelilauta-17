<script lang="ts">
/*
 * A microfrontend/app for displaying a character's details with auto-updating.
 *
 * This component subscribes to a character's data and mounts the components
 * to display and interact with the character.
 */

import SiteCard from '@components/svelte/site-library/SiteCard.svelte';
import type { Character } from '@schemas/CharacterSchema';
import type { Site } from '@schemas/SiteSchema';
import { uid } from '@stores/session';
import { character, subscribe } from 'src/stores/characters/characterStore';
import CharacterCard from '../CharacterCard.svelte';
import CharacterArticle from './CharacterArticle.svelte';
import CharacterHeader from './CharacterHeader.svelte';
import StatBlock from './StatBlock.svelte';

interface Props {
  character: Character;
  site?: Site;
}

const { character: initialCharacter, site }: Props = $props();

$effect(() => {
  character.set(initialCharacter);
  // Logged in users get real-time updates to character data
  if ($uid) {
    subscribe(initialCharacter.key);
  }
});

const statBlocks = $derived.by(() => {
  return $character?.sheet?.statGroups || [];
});
</script>

<div class="content-sheet">
  <CharacterHeader />
  
  <aside>
    {#if $character}
      <CharacterCard character={$character}></CharacterCard>
    {/if}
    {#if site}
      <SiteCard {site} />
    {/if}
  </aside>

  <div class="blocks">
    {#if statBlocks.length > 0}
      {#each statBlocks as group}
        <StatBlock {group} />
      {/each}
    {/if}
  </div>
  
  <div class="meta">
    <CharacterArticle />
  </div>

</div>