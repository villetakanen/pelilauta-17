# Cyan Svelte Specification

## 1. Overview
`@cyan-svelte` is a local package containing generic, design-system-aligned Svelte 5 components for the Pelilauta application. Ideally, it should be decoupled from the core application logic (stores, schema) to ensure reusability.

## 2. Structure
- **Location**: `packages/cyan-svelte`
- **Alias**: `@cyan-svelte` mapped to `packages/cyan-svelte/src`
- **Tech Stack**: Svelte 5 (Runes), Typescript.

## 3. Components

### Layout
- **Drawer**: `components/Drawer.svelte`
  - A slide-out sidebar overlay.
  - Props: `open` (boolean), `title` (string), `onclose` (callback).
  - Slots: Default slot for content.

### Future Candidates
- **Icon**: Wrapper for `<cn-icon>`.
- **Button**: Standardized buttons?
- **Dialog/Modal**: Generic modal.

## 4. Usage
Import components using the alias:
```svelte
import Drawer from '@cyan-svelte/components/Drawer.svelte';
```

## 5. Development Guidelines
- Use Svelte 5 Runes (`$props`, `$derived`).
- Avoid importing `src/stores/*` or `src/schemas/*` from the main app.
- Styles should assume the existence of Cyan Design System CSS variables (e.g., `--cn-border-color`).
