<script lang="ts">
/*
 * A microfrontend/app for displaying a character's details with auto-updating.
 *
 * This component subscribes to a character's data and mounts the components
 * to display and interact with the character.
 */
import { character, subscribe } from 'src/stores/characters/characterStore';
import { logDebug } from 'src/utils/logHelpers';
import CharacterCard from '../CharacterCard.svelte';
import CharacterArticle from './CharacterArticle.svelte';
import CharacterHeader from './CharacterHeader.svelte';
import StatBlock from './StatBlock.svelte';

interface Props {
  characterKey: string;
}

const { characterKey }: Props = $props();
const statBlocks = $derived.by(() => {
  return $character?.sheet?.statGroups || [];
});

$effect(() => {
  logDebug('CharacterApp', 'Subscribing to character:', characterKey);
  subscribe(characterKey);
});
</script>

<div class="content-sheet">
  <CharacterHeader />
  
  <aside>
    {#if $character}
      <CharacterCard character={$character}></CharacterCard>
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
    <!-- Future metadata about the character could go here -->
    <CharacterArticle />
  </div>

</div>