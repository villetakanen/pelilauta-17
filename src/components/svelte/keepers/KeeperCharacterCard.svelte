<script lang="ts">
import type { Character } from '@schemas/CharacterSchema';
import type { CharacterSheet } from '@schemas/CharacterSheetSchema';

interface Props {
  character: Character;
  sheet: CharacterSheet;
  siteKey: string;
}

const { character, sheet, siteKey }: Props = $props();
</script>

<a href={`/sites/${siteKey}/characters/${character.key}`} class="column-s">
    <h3>{character.name}</h3>
    <p>Sheet: {sheet.name}</p>
</a>
