<script lang="ts">
import type { Character } from '@schemas/CharacterSchema';
import type { CharacterSheet } from '@schemas/CharacterSheetSchema';

interface Props {
  character: Character;
  sheet: CharacterSheet;
}

const { character, sheet }: Props = $props();
</script>

<div class="keeper-character-card">
    <h3>{character.name}</h3>
    <p>Sheet: {sheet.name}</p>
</div>
