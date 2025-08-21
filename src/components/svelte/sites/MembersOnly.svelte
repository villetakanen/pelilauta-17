<script lang="ts">
import type { Site } from '@schemas/SiteSchema';
import { uid } from '@stores/session';
import WithAuth from '@svelte/app/WithAuth.svelte';
import { t } from '@utils/i18n';
import type { Snippet } from 'svelte';

interface Props {
  site: Site;
  children?: Snippet;
}

const { site, children }: Props = $props();

const visible = $derived.by(() => {
  if (site.owners.includes($uid)) return true;
  if (site.players?.includes($uid)) return true;
  return false;
});
</script>

<WithAuth
  allow={visible}
  message={t('app:forbidden.membersOnly')}>
  {@render children?.()}
</WithAuth>
  