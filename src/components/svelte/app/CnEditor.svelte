<script lang="ts">
/**
 * Svelte wrapper for the cn-editor web component.
 *
 * This component provides a reactive Svelte interface to the cn-editor
 * web component, handling proper event binding and prop updates.
 *
 * @example
 * ```svelte
 * <CnEditor
 *   value={content}
 *   oninput={handleInput}
 *   placeholder="Enter your content..."
 *   disabled={saving}
 * />
 * ```
 */

import type { CnEditor as CnEditorElement } from '@11thdeg/cn-editor';
import { onMount } from 'svelte';

interface Props {
  /** The markdown content value */
  value?: string;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Whether the editor is required (for forms) */
  required?: boolean;
  /** Whether to show line numbers gutter */
  gutter?: boolean;
  /** HTML id attribute */
  id?: string;
  /** HTML name attribute (for forms) */
  name?: string;
  /** Input event handler - fires on every keystroke */
  oninput?: (event: Event) => void;
  /** Change event handler - fires on blur */
  onchange?: (event: Event) => void;
}

const {
  value = '',
  placeholder = '',
  disabled = false,
  required = false,
  gutter = false,
  id,
  name,
  oninput,
  onchange,
}: Props = $props();

let editorElement: CnEditorElement | undefined = $state();

onMount(() => {
  // Ensure the web component is registered
  if (!customElements.get('cn-editor')) {
    console.warn(
      'cn-editor web component not registered. Make sure to import it in your page.',
    );
  }
});

// Update editor value when prop changes
$effect(() => {
  if (editorElement && editorElement.value !== value) {
    editorElement.value = value;
  }
});

// Update disabled state
$effect(() => {
  if (editorElement) {
    editorElement.disabled = disabled;
  }
});

// Update gutter state
$effect(() => {
  if (editorElement) {
    editorElement.gutter = gutter;
  }
});

function handleInput(event: Event) {
  if (oninput) {
    oninput(event);
  }
}

function handleChange(event: Event) {
  if (onchange) {
    onchange(event);
  }
}
</script>

<cn-editor
  bind:this={editorElement}
  {id}
  {name}
  {value}
  {placeholder}
  {disabled}
  {required}
  {gutter}
  oninput={handleInput}
  onchange={handleChange}
></cn-editor>
