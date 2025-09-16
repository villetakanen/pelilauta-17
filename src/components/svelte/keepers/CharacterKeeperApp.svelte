<script lang="ts">
import {
  CHARACTERS_COLLECTION_NAME,
  type Character,
} from '@schemas/CharacterSchema';
import type { CharacterSheet } from '@schemas/CharacterSheetSchema';
import { CHARACTER_SHEETS_COLLECTION_NAME } from '@schemas/CharacterSheetSchema';
import { charactersInKeeper } from '@stores/keepers/characterKeeperStore';
import { site, update } from '@stores/site';
import { logDebug } from '@utils/logHelpers';
import { onMount } from 'svelte';
import CharacterSheetSelector from './CharacterSheetSelector.svelte';
import KeeperCharacterCard from './KeeperCharacterCard.svelte';

interface Props {
  siteKey: string;
}
const { siteKey }: Props = $props();

let sheet = $state<CharacterSheet | null>(null);
let selectedSheetKey = $state<string>($site?.characterKeeperSheetKey || '');

async function getSheet(sheetKey: string) {
  const { doc, getDoc } = await import('firebase/firestore');
  const { db } = await import('@firebase/client');
  const sheetRef = doc(db, CHARACTER_SHEETS_COLLECTION_NAME, sheetKey);
  const sheetSnap = await getDoc(sheetRef);
  if (sheetSnap.exists()) {
    sheet = sheetSnap.data() as CharacterSheet;
  }
}

async function syncCharacters() {
  const { collection, query, where, onSnapshot } = await import(
    'firebase/firestore'
  );
  const { db } = await import('@firebase/client');
  const q = query(
    collection(db, CHARACTERS_COLLECTION_NAME),
    where('siteKey', '==', siteKey),
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const characters: Character[] = [];
    querySnapshot.forEach((doc) => {
      characters.push(doc.data() as Character);
    });
    charactersInKeeper.set(characters);
    logDebug('CharacterKeeperApp', 'Characters updated', characters);
  });

  return unsubscribe;
}

function setSelectedSheetKey(key: string) {
  selectedSheetKey = key;
  update({ characterKeeperSheetKey: key });
  if (key) {
    getSheet(key);
  } else {
    sheet = null;
  }
}

// Stale-while-revalidate implementation
onMount(() => {
  logDebug('CharacterKeeperApp', 'onMount');
  if (selectedSheetKey) {
    getSheet(selectedSheetKey);
  }
  const unsubscribe = syncCharacters();
  return () => {
    logDebug('CharacterKeeperApp', 'onUnmount');
    unsubscribe.then((unsub) => unsub());
  };
});
</script>

<div class="character-keeper-app">
    <CharacterSheetSelector
        system={$site?.system || ''}
        {selectedSheetKey}
        {setSelectedSheetKey}
    />
    {#if sheet}
        <ul>
            {#each $charactersInKeeper as character}
                <KeeperCharacterCard {character} {sheet} />
            {/each}
        </ul>
    {:else}
        <p>No sheet selected</p>
    {/if}
</div>
