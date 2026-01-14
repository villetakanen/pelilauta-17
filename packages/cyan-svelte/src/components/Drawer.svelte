<script lang="ts">
import { fly } from 'svelte/transition';

interface Props {
  open?: boolean;
  title?: string;
  onclose?: () => void;
  children?: import('svelte').Snippet;
}

let { open = false, title = '', onclose, children }: Props = $props();
</script>

{#if open}
    <aside
        class="cyan-drawer surface elevation-2"
        transition:fly={{ x: 300, duration: 200 }}
    >
        <header class="flex items-center justify-between p-2 border-b">
            <h2 class="text-h5 m-0">{title}</h2>
            <button class="text" aria-label="Close" onclick={onclose}>
                <cn-icon noun="close"></cn-icon>
            </button>
        </header>

        <div class="content p-3 overflow-y-auto h-full pb-20">
            {@render children?.()}
        </div>
    </aside>
{/if}

<style>
    .cyan-drawer {
        position: fixed;
        top: 0;
        right: 0;
        width: 320px;
        height: 100vh;
        z-index: 100;
        border-left: 1px solid var(--cn-border-color);
    }
</style>
