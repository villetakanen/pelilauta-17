# Gemini instructions

We are creating a role playing games community site with Astro, Lit and Svelte. The application
will be deployed to Netlify using a Github integration.

## SSR with Astro

We want to render all stateless components, and components that share the state with the server. These
components will be progressively enhanced with Svelte or Solid-js on the client side.

Where a microfrontend or a sub-app is completely stateful, and requires an authenticated user, we will
do those parts fully client-side with Svelte or Solid-js.

## Svelte 

Most of the client side interactivity is now done with Svelte. We use the same nano store pattern for shared
state management as the previous Solid-js components. Switch over to svelte is done for lit-element and performance
reasons.

Avoid writing  `<style>` tags inside the Svelte components, as we are using Lit + external CSS design system classes
and atomics for styling.

Svelte uses runes mode, typescript and we want to model the componets with template below:
```
<script lang="ts">
import { uid } from '@stores/session';
// uid is used as $uid, as nanostores implement svelte store interface

interface Props {
  [propName: string]: [type],
  ...   // other props
}
const { propName, ... }: Props = $props;
const statefulVar = $state('value'); // stateful store, use $state, use let if you need to reassign
const derivedVar = $derived.by(() => {return value}) // derived store, use $derived.by

...
</script>

<section>
  <h1>{statefulVar}</h1>
  <p>{derivedVar}</p>
  <p>{propName}</p>
</section>
```

### Nanostores on svelte

Do note, that we are using the `nanostores` package for state management. The stores are imported from
`@stores/session` and `@stores/route`. The stores are used as `$storeName` in the components. The way runes
mode uses these is to add a `$` to the store name. This is done by the svelte compiler, so you can use the
store name as a normal variable. 

f.ex:
```
<script lang="ts">
import { uid } from '@stores/session';

logDebug('uid', $uid);
</script>

<a href="/profile/{$uid}">
  <img src="https://avatars.dicebear.com/api/bottts/{$uid}.svg" alt="Avatar" />
</a>
```

## TypeScript

We use shorthands for library paths. E.g. `import SectionComponent from '@svelte/app/SectionComponent.svelte'`

## Cyan Design System

We use the Cyan Design System v4.0.0 for UI components and styling. It's a modern, scalable toolkit distributed as npm packages.

### Core Packages

- **`@11thdeg/cyan-lit`**: Web components library built with Lit
- **`@11thdeg/cyan-css`**: CSS framework with styles, design tokens, and utilities (required peer dependency)
- **`@11thdeg/cn-editor`**: Rich text editor component
- **`@11thdeg/cn-story-clock`**: Progress tracking for tabletop RPGs
- **`@11thdeg/cn-dice`**: Dice rolling component

Always import CSS framework in your application entry point:
```ts
import '@11thdeg/cyan-css';
```

### Available Web Components

Import components as needed:
```ts
import '@11thdeg/cyan-lit/dist/components/cn-card.js';
```

**Core Components:**
- `<cn-app-bar>`: Top-level navigation container
- `<cn-avatar>`: User profile picture or initials
- `<cn-avatar-button>`: Clickable avatar
- `<cn-bubble>`: Dismissible information element
- `<cn-card>`: Flexible content container
- `<cn-icon>`: SVG icon renderer
- `<cn-lightbox>`: Modal overlay for images/content
- `<cn-loader>`: Animated loading indicator
- `<cn-menu>`: Dropdown options/actions
- `<cn-navigation-icon>`: Navigation-specific icons
- `<cn-reaction-button>`: Content reaction button
- `<cn-share-button>`: Content sharing button
- `<cn-snackbar>`: Temporary bottom messages
- `<cn-sortable-list>`: Drag-and-drop reorderable list
- `<cn-toggle-button>`: Two-state toggle button
- `<cn-tray-button>`: Panel/tray control button

### CSS Framework Structure

- **`core`**: Base HTML element styles
- **`utilities`**: High-level layout and composition classes
- **`atomics`**: Single-purpose utility classes
- **`components`**: Light-dom component styles
- **`typography`**: Text styling classes and variables
- **`tokens`**: CSS custom properties for theming

### Design Tokens

Use CSS variables for consistency:
- Core tokens: `--cn-[selector]-[token]` (e.g., `--cn-button-background-color`)
- Theme tokens: `--color-[token]` and `--background-[token]`

### Key Atomic Classes

**Layout:**
- `.flex`, `.flex-col`, `.grid`, `.two-col`, `.four-col`
- `.items-center`, `.items-start`, `.grow`, `.shrink`

**Spacing:**
- `.p-1`, `.p-2`, `.px-1`, `.py-1`, `.m-1`, `.mx-1`, etc.

**Visual:**
- `.radius-s`, `.radius-m`, `.radius-l`, `.radius-round`
- `.border`, `.border-t`, `.border-between`
- `.text-center`, `.text-high`, `.text-low`

**Responsive:**
- `.sm-hidden`, `.md-hidden`, `.lg-hidden`
- `.sm-only`, `.md-only`, `.lg-only`

### Content Layout Utilities

- `.content-cards`: Responsive card container
- `.content-columns`: Multi-column layout with `.column-s`, `.column-m`, `.column-l`
- `.content-editor`: Full-height editor interface
- `.content-listing`: List layout with optional sidebar
- `.toolbar`: Action and control container
- `nav#rail`: Primary navigation rail
- `nav#fab-tray`: Floating action button container

## Lit

Legacy Lit components are installed via NPM or Git Submodules, but prefer Cyan Design System components. 

## Google Firebase

The backend is Google Firebase, using Auth, Firestore and Storage services.

### Client-side Firebase

Firestore and storage methods should **always** be imported dynamically for code splitting:

```ts
// ✅ Correct - Dynamic imports
const { doc, getDoc, updateDoc } = await import('firebase/firestore');
const { db } = await import('@firebase/client');

// ❌ Incorrect - Static imports cause bundle bloat
import { doc, getDoc, updateDoc } from 'firebase/firestore';
```

### Server-side Firebase

For Astro components and API routes:

```ts
import { serverDB, serverAuth } from '@firebase/server';

// Server-side operations don't need dynamic imports
const doc = await serverDB.collection('sites').doc(id).get();
```

### Authentication Patterns

```ts
// Client-side auth checking
import { uid } from '@stores/session';

if (!$uid) {
  // Handle unauthenticated state
  return;
}

// Server-side auth (API routes)
import { tokenToUid } from '@utils/server/auth/tokenToUid';

const uid = await tokenToUid(request);
if (!uid) {
  return new Response('Unauthorized', { status: 401 });
}
```

## Biome

Biome is used for linting and formatting. We are using the default settings, with 2 spaces as intentation.

## Error Handling and Logging

Use the centralized logging utilities with proper context:

```ts
import { logDebug, logError, logWarn } from '@utils/logHelpers';

// Always provide context (component/function name) as first parameter
logDebug('ComponentName', 'Action description', data);
logError('ComponentName', 'Error description:', error);
```

## Schema Validation

All data should be validated using Zod schemas:

```ts
import { SiteSchema, type Site } from '@schemas/SiteSchema';

// Parse data from external sources
const site = SiteSchema.parse(rawData);
```

## State Management

### Local Component State
Use `$state` for component-local reactive state:

```ts
const isOpen = $state(false);
const items = $state<Item[]>([]);
```

### Derived State
Use `$derived.by` for computed values:

```ts
const filteredItems = $derived.by(() => {
  return items.filter(item => item.active);
});
```

### Global State
Use nanostores for shared state across components:

```ts
import { atom } from 'nanostores';

export const globalCounter = atom(0);

// In components
import { globalCounter } from '@stores/app';
console.log($globalCounter); // Access reactive value
```

### Persistent State
Use `persistentAtom` for state that should survive page reloads:

```ts
import { persistentAtom } from '@nanostores/persistent';

const userPreferences = persistentAtom('user-prefs', {
  theme: 'light',
  language: 'en'
});
```

## Page Layouts

We have 4 page layouts for different use cases:

- **Page.astro**: Standard Public pages with full navigation and SEO
- **PageWithTray.astro**: Interactive pages needing slide-out tray menus (dashboards, tools)
- **ModalPage.astro**: Routes that look like a modal, and contain a back-button at the top (e.g. settings, profile). Do note: these are not true modals, but full pages that look like modals for UX consistency.
- **EditorPage.astro**: Content editing interfaces (maximized space, editor-specific features)

Choose based on: public vs authenticated, static vs interactive, full-page vs modal context.

Routes with editors and modals should check if the user is authenticated before rendering.

## SEO Best Practices

### The `noSharing` Prop

The `noSharing` prop on page layouts controls SEO indexing behavior:

- **When `noSharing={true}`**: Adds `<meta name="robots" content="noindex, nofollow" />` to prevent search engine indexing
- **When `noSharing` is omitted or `false`**: Page is indexable by search engines

**Important:** Never use `noSharing` on public pages that should be discoverable:

```astro
// ❌ Bad - Front page won't be indexed by search engines
<Page title="My Site" noSharing>

// ✅ Good - Front page is indexable
<Page title="My Site">

// ✅ Good - Private admin page shouldn't be indexed  
<AdminPage title="Admin Dashboard" noSharing>
```

**Use `noSharing={true}` only for:**
- Private user dashboards and settings
- Admin interfaces
- Authentication pages
- Development/testing pages
- Any page that should not appear in search results

**Never use `noSharing` on:**
- Front page (`src/pages/index.astro`)
- Public content pages
- Library/community pages
- Any page you want users to discover via search engines