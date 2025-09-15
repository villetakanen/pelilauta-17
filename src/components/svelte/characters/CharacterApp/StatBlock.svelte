<script lang="ts">
import { resolvedCharacter } from '@stores/characters/characterStore';
import { t } from '@utils/i18n';
import Stat from './Stat.svelte';

interface Props {
  group: string;
}

const { group }: Props = $props();

const statsInGroup = $derived.by(() => {
  if (!$resolvedCharacter?.sheet?.stats) return [];
  return $resolvedCharacter.sheet.stats.filter((stat) => stat.group === group);
});
</script>

<section class="column-s elevation-1 border-radius p-2">
  <h3 class="downscaled">{group}</h3>
  
  {#if statsInGroup.length > 0}
    <div class="stat-grid">
      {#each statsInGroup as stat}
        <Stat {stat} />
      {/each}
    </div>
  {:else}
    <p class="text-low downscaled">
        {t('character:statBlock.noStats', { group })}
    </p>
  {/if}
</section>

<style>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--cn-grid);
}
</style>