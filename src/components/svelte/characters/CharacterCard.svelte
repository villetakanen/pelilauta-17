<script lang="ts">
import type { Character } from '@schemas/CharacterSchema';
import SiteLink from '@svelte/sites/SiteLink.svelte';
import { t } from '@utils/i18n';
import type { Snippet } from 'svelte';

export interface CharacterCardProps {
  character: Character;
  children?: Snippet;
  actions?: Snippet;
}
const { character, children, actions }: CharacterCardProps = $props();
</script>

<cn-card
  href={`/characters/${character.key}`}
  title={character.name}
>
  {#if character.siteKey}
    <p class="downscaled">
      <strong>{t('entries:character.site')}</strong>:<br /><SiteLink siteKey={character.siteKey} />
    </p>
  {/if}

  {#if character.description}
    <p class="downscaled text-low">
      {character.description}
    </p>
  {/if}
  <!-- Default content inside the card -->
  {@render children?.()}
  <!-- The card Actions slot -->
  {#if actions}
    <div slot="actions">
      {@render actions()}
    </div>
  {/if}
</cn-card>

