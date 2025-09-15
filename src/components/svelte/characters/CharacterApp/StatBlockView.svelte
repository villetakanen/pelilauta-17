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

const type = (key: string) => {
  return $resolvedCharacter?.sheet?.stats?.find((s) => s.key === key)?.type || 'number';
};

</script>

<section class="surface border-radius flex flex-col">
  {#each statsInGroup as stat}
    {#if stat.type === 'number'}
      <div class="flex flex-row flex-no-wrap">
        <h4 class="text-h5 m-0 grow">
          {stat.key}
        </h4>
        <input type="number" value={stat.value} class="stat flex-none" style="flex:none" readonly />
      </div>
    {/if}
  {/each}

  <div class="grow"></div>
  <h3 class="text-h4 text-center m-0">
    {group}
  </h3>
</section>