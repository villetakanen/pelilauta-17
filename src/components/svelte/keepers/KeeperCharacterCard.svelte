<script lang="ts">
import type { Character } from '@schemas/CharacterSchema';
import type { CharacterSheet } from '@schemas/CharacterSheetSchema';
import { derived } from 'svelte/store';

interface Props {
  character: Character;
  sheet: CharacterSheet;
  siteKey: string;
}

const { character, sheet, siteKey }: Props = $props();

const groups = $derived.by(() => {
  return sheet.statGroups || [];
});
</script>
<cn-card>
<a href={`/sites/${siteKey}/characters/${character.key}`} class="column-s">
    <h3>{character.name}</h3>
    <p>Sheet: {sheet.name}</p>
</a>
{#each groups as group}
    <div class="stat-group">
      <h4 class="text-h5 m-0">{group.key}</h4>
      {#each Object.entries(sheet.stats).filter(([_, stat]) => stat.group === group.key) as [statKey, stat]}
        <div style="display:flex; justify-content: space-between;">
          <span class="stat-name">{stat.key}</span>
          <span class="stat-value">{character.stats?.[statKey] ?? '-'}</span>
        </div>
      {/each}
    </div>
  {/each}
</cn-card>