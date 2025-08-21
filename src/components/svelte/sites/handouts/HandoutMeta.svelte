<script lang="ts">
import type { Handout } from '@schemas/HandoutSchema';
import type { Site } from '@schemas/SiteSchema';
import { uid } from '@stores/session';
import { site } from '@stores/site';
import { update } from '@stores/site/handouts';
import ProfileLink from '@svelte/app/ProfileLink.svelte';
import UserSelect from '@svelte/app/UserSelect.svelte';
import { pushSnack } from '@utils/client/snackUtils';
import { t } from '@utils/i18n';
import { logDebug } from '@utils/logHelpers';

interface Props {
  site: Site;
  handout: Handout;
}
const { site: initialSite, handout }: Props = $props();
let newReader = $state('');
let readers = $state(handout.readers ?? ([] as string[]));

/**
 * Handout Metadata editor
 */
const visible = $derived.by(() => {
  if ($site?.owners?.includes($uid)) return true;
  return false;
});
const omit = $derived.by(() => {
  const omitted = new Set($site?.owners);
  for (const reader of readers ?? []) {
    omitted.add(reader);
  }
  return Array.from(omitted);
});

$site = initialSite;

function onUserSelect(e: Event) {
  const target = e.target as HTMLSelectElement;
  newReader = target.value;
}

async function dropReader(reader: string) {
  const r = new Set(readers);
  r.delete(reader);
  await update({
    ...handout,
    readers: Array.from(r),
  });
  readers = Array.from(r);
}

async function onSubmit(e: Event) {
  e.preventDefault();
  logDebug('HandoutMeta.onSubmit', newReader);
  const r = new Set(readers);
  r.add(newReader);
  try {
    await update({
      ...handout,
      readers: Array.from(r),
    });
  } catch (err) {
    logDebug('HandoutMeta.onSubmit', err);
    pushSnack(t('site:handouts.metadata.error'));
  }
  newReader = '';
  readers = Array.from(r);
}
</script>

{#if visible}
  <section class="surface p-1">
    <h3>{t('site:handouts.metadata.title')}</h3>
    {#if readers?.length }

        {#each readers as reader}
          <div class="toolbar">
            <p class="p-0 grow">
              <ProfileLink uid={reader} />
            </p>
            <button
              aria-label={t('actions:delete')} 
              onclick={() => dropReader(reader)}>
              <cn-icon noun="delete"></cn-icon>
            </button>
          </div>  
        {/each}

    {/if}

    <form onsubmit={onSubmit}>
      <hr>
      <UserSelect 
        value='-'
        {omit}
        onchange={onUserSelect}
        label={t('site:handouts.add.reader')}/>
      <button 
        disabled={!newReader || newReader === '-'}
        type="submit">{t('actions:add')}</button>
    </form>

  </section>
{/if}

