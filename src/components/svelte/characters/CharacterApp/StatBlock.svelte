<script lang="ts">
import type { CharacterStat } from 'src/schemas/CharacterSheetSchema';
import { character } from 'src/stores/characters/characterStore';
import { t } from 'src/utils/i18n';
import { onMount } from 'svelte';
import Stat from './Stat.svelte';

interface Props {
  group: string;
}

const { group }: Props = $props();

const statsInGroup = $derived.by(() => {
  if (!$character?.sheet?.stats) return [];
  return $character.sheet.stats.filter((stat) => stat.group === group);
});

function formatStatValue(stat: CharacterStat): string {
  switch (stat.type) {
    case 'number':
      return stat.value.toString();
    case 'toggled':
      return stat.value ? 'Kyllä' : 'Ei';
    case 'd20_ability_score': {
      const modifier =
        stat.value >= 0 ? `+${stat.value}` : stat.value.toString();
      return `${stat.baseValue} (${modifier})`;
    }
    case 'derived':
      return stat.formula; // For now, just show the formula
    default:
      return '';
  }
}

function getStatLabel(stat: CharacterStat): string {
  return stat.description || stat.key;
}
</script>

<section class="column-s elevation-1 border-radius p-2">
  <h3 class="downscaled">{group}</h3>
  
  {#if statsInGroup.length > 0}
    <div class="column-s gap-xs">
      {#each statsInGroup as stat}
        <Stat key={stat.key} />
      {/each}
    </div>
  {:else}
    <p class="text-low downscaled">
        {t('character:statBlock.noStats', { group })}
    </p>
  {/if}
</section>
