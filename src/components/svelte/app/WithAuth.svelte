<script lang="ts">
import { t } from 'src/utils/i18n';
import type { Snippet } from 'svelte';
import { uid } from '../../../stores/session';

interface Props {
  allow: boolean;
  suspend?: boolean;
  message?: string;
  children?: Snippet;
}

const props: Props = $props();

// Use $derived to ensure reactivity when props change
const isAllowed = $derived(props.allow);
const isSuspended = $derived(props.suspend ?? false);
</script>

{#if isSuspended}
  <div class="flex justify-center p-4">
    <cn-loader></cn-loader>
  </div>
{:else if isAllowed}
  {@render props.children?.()}
{:else}
  <div class="content-columns">
    <article>
      <div class="flex justify-center p-2">
        <cn-icon noun="monsters" xlarge></cn-icon>
      </div>
      <div class="surface border-radius p-2 mt-2">
        <h1>{t("app:forbidden.title")}</h1>
        <p>{props.message || t("app:forbidden.message")}</p>
        {#if !$uid}
          <div class="toolbar justify-center">
            <a href="/login" class="button">
              {t("actions:login")}
            </a>
          </div>
        {/if}
      </div>
    </article>
  </div>
{/if}
