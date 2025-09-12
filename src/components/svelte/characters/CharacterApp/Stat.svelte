<script lang="ts">
/**
 * Single character stat display/edit component.
 *
 * Shows editable fields when the user is the owner of the character.
 */
import { character } from '@stores/characters/characterStore';
import { uid } from '@stores/session';

interface Props {
  // The stat to display/edit
  key: string;
}

const { key }: Props = $props();
const stat = $derived.by(() => {
  return $character?.sheet?.stats.find((s) => s.key === key);
});

const owns = $derived.by(() => $character?.owners?.includes($uid));
</script>

{#if stat}
  {#if stat.type === 'text'}
    {#if owns}
      <label class="span-cols">
        <span class="sr-only">{stat.key}</span>
        <input
          type="text"
          value="{stat.value}"
        />
      </label>
    {:else}
      <div>
        {stat.value}
      </div>
    {/if}
    {:else if stat.type === 'number'}
        {#if owns}
        <label class="span-cols">
            <span class="sr-only">{stat.key}</span>
            <input
            type="number"
            value="{stat.value}"
            />
        </label>
        {:else}
        <div>
            {stat.value}
        </div>
        {/if}
  {:else}
    <div>
      {stat.key}
    </div>
  {/if}
{/if}