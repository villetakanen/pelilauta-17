<script lang="ts">
/*
 * A microfrontend/app for displaying a character's details with auto-updating.
 *
 * This component subscribes to a character's data and mounts the components
 * to display and interact with the character.
 */

import SiteCard from '@components/svelte/site-library/SiteCard.svelte';
import type { Character } from '@schemas/CharacterSchema';
import type { CharacterSheet } from '@schemas/CharacterSheetSchema';
import type { Site } from '@schemas/SiteSchema';
import { isEditing } from '@stores/characters/characterSheetState';
import {
  character,
  loading,
  resolvedCharacter,
  subscribe,
} from '@stores/characters/characterStore';
import { uid } from '@stores/session';
import CharacterCard from '../CharacterCard.svelte';
import CharacterArticle from './CharacterArticle.svelte';
import CharacterHeader from './CharacterHeader.svelte';
import StatBlock from './StatBlock.svelte';
import StatBlockView from './StatBlockView.svelte';

interface Props {
  character: Character;
  sheet?: CharacterSheet;
  site?: Site;
}

const {
  character: initialCharacter,
  sheet: initialSheet,
  site,
}: Props = $props();

$effect(() => {
  character.set(initialCharacter);
  // Set initial resolved character with preloaded sheet data
  resolvedCharacter.set({
    ...initialCharacter,
    sheet: initialSheet,
  });
  subscribe(initialCharacter.key);
});

const statBlocks = $derived.by(() => {
  return $resolvedCharacter?.sheet?.statGroups || [];
});
const isOwner = $derived.by(() => {
  return $resolvedCharacter?.owners?.includes($uid) || false;
});
</script>

<div class="content-sheet">
  {#if $loading && !$resolvedCharacter}
    <cn-loader></cn-loader>
  {:else if $resolvedCharacter}
    <CharacterHeader character={$resolvedCharacter} />
    
    <aside class="flex wide-flex-col">
      {#if site}
        <SiteCard {site} />
      {/if}
      <CharacterCard character={$resolvedCharacter}></CharacterCard>
    </aside>

    <div class="blocks">
      {#if statBlocks.length > 0}
        {#each statBlocks as group}
          {#if isOwner && $isEditing}
            <!-- Show the editor functionality-->
            <StatBlock {group} />
          {:else}
            <!-- Show the read-only functionality, reactive for logged in users -->
            <StatBlockView {group} />
          {/if}
        {/each}
      {/if}
    </div>
    
    <div class="meta">
      <CharacterArticle character={$resolvedCharacter} />
    </div>
  {/if}
</div>
