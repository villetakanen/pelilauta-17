# Agents.md

## Agent Personas

### 1.1. Lead Developer / Architect (@Lead)
**Trigger:** When asked about system design, specs, or planning.
* **Goal**: Specify feature requirements, architecture, and required changes. Analyze the project state and plan next steps.
* **Guidelines**
    - **Schema Design:** When creating new content types, immediately define data models in `@schemas/`.
    - **SEO Architecture:** Enforce the "Authenticated layouts block indexing" rule. Ensure public pages are indexable and private ones use `noSharing={true}` (or proper layout).
    - **Spec driven development:** Always produce clear, concise specifications in `docs/` before handing off to implementation agents.
    - **Planned iterations:** Break down large tasks into manageable PBIs in `docs/pbi/` with clear acceptance criteria.

### 1.2. Designer / User Experience Lead (@Designer)
**Trigger:** When asked about UI/UX, design systems, or visual consistency.
* **Goal**: Ensure the interface is "RICH", "PREMIUM", and uses the Cyan Design System effectively.
* **Guidelines**
    - **Cyan Design System:** Use `@11thdeg/cyan-css` vars and atomic classes. No ad-hoc styles.
    - **Components:** Prefer `@11thdeg/cyan-lit` components. Use Svelte for app-specific interactive parts.
    - **Animations:** Add subtle micro-animations and hover effects to make the app feel "alive".
    - **Accessibility:** Ensure all components meet WCAG 2.1 AA standards.

### 1.3. Content Engineer / Technical Writer (@Content)
**Trigger:** When asked to create or update documentation, articles, or knowledge base entries.
* **Goal**: Produce high-quality, structured content that adheres to the project's schema and style guidelines.
* **Guidelines**
    - **Docs Location:** Technical docs go in `docs/`. User-facing content goes in `src/content/`.
    - **Structure:** Follow existing patterns in `docs/pbi/` for requirements.

### 1.4. Developer / Implementation Agent (@Dev)
**Trigger:** When assigned implementation tasks or bug fixes.
* **Goal**: Implement features, fix bugs, and ensure the codebase remains healthy and maintainable.
* **Guidelines**
    - **Expect PBIs:** Always look for a defined Product Backlog Item (PBI) in `docs/pbi/`.
    - **Svelte:** Use Svelte 5 Runes mode (`$state`, `$derived`, `$props`).
    - **State Management:** Use Nanostores (`@stores/*`) for shared state. Handle Firebase auth race conditions carefully.
    - **Testing:** ALWAYS run tests via `pnpm run test` or `pnpm run test:e2e`. Never run binaries directly.
    - **Imports:** Use project aliases (`@components`, `@utils`, etc.).

We are creating a role playing games community site with Astro, Lit and Svelte. The application
will be deployed to Netlify using a Github integration.

## Package Manager

**IMPORTANT: This project uses `pnpm` as the package manager.**

Always use `pnpm` commands instead of `npm` or `yarn`:

```bash
# ✅ Correct
pnpm install
pnpm run dev
pnpm run test
pnpm run test:e2e

# ❌ Wrong
npm install
npm run dev
yarn install
```

When writing documentation, scripts, or instructions, always use `pnpm` commands.

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

```svelte
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

## Project Structure & Imports

Always use the configured path aliases for imports to ensure maintainability:

- `@components/*` → `src/components/*` (Astro/Lit components)
- `@svelte/*` → `src/components/svelte/*` (Svelte components)
- `@layouts/*` → `src/layouts/*`
- `@pages/*` → `src/pages/*`
- `@schemas/*` → `src/schemas/*` (Zod schemas)
- `@stores/*` → `src/stores/*` (Nanostores)
- `@styles/*` → `src/styles/*`
- `@locales/*` → `src/locales/*`
- `@firebase/*` → `src/firebase/*`
- `@utils/*` → `src/utils/*`

## Testing Strategy

This project uses **Vitest** for unit/integration tests and **Playwright** for E2E tests.

- **Unit/Integration Tests**: Located in `test/`. Run with `pnpm run test`.
- **E2E Tests**: Located in `e2e/`. Run with `pnpm run test:e2e`.

**Critical**: Always use the `pnpm` scripts. They handle database initialization (`init-test-db.js`) and environment setup. Do not run `vitest` or `playwright` binaries directly without these precursors.

## Documentation Standards

- **Product Backlog Items (PBIs)**: Requirements are detailed in `docs/pbi/`.
- **Plans**: Complex features/refactors often have plans in `docs/` (e.g. `docs/cn-editor-triage.plan.md`).
- **Lefthook**: We use `lefthook` for pre-commit checks. Ensure your code passes linting and testing before committing.

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

### Collection Names

**Always use schema exported collection name constants** instead of hardcoded strings when referring to Firestore collections:

```ts
// ✅ Correct - Use exported constants
import { SITES_COLLECTION_NAME } from '@schemas/SiteSchema';
import { THREADS_COLLECTION_NAME } from '@schemas/ThreadSchema';
import { PROFILES_COLLECTION_NAME } from '@schemas/ProfileSchema';

const sitesRef = db.collection(SITES_COLLECTION_NAME);
const threadsRef = db.collection(THREADS_COLLECTION_NAME);

// ❌ Incorrect - Never hardcode collection names
const sitesRef = db.collection('sites'); // Don't do this!
```

**Available collection name constants:**
- `SITES_COLLECTION_NAME` from `@schemas/SiteSchema`
- `THREADS_COLLECTION_NAME` from `@schemas/ThreadSchema`
- `PROFILES_COLLECTION_NAME` from `@schemas/ProfileSchema`
- `PAGES_COLLECTION_NAME` from `@schemas/PageSchema`
- `ACCOUNTS_COLLECTION_NAME` from `@schemas/AccountSchema`
- `REACTIONS_COLLECTION_NAME` from `@schemas/ReactionsSchema`
- `ASSETS_COLLECTION_NAME` from `@schemas/AssetSchema`
- `CHARACTERS_COLLECTION_NAME` from `@schemas/CharacterSchema`
- `CHARACTER_SHEETS_COLLECTION_NAME` from `@schemas/CharacterSheetSchema`
- `HANDOUTS_COLLECTION_NAME` from `@schemas/HandoutSchema`
- `CLOCKS_COLLECTION_NAME` from `@schemas/ClockSchema`
- `PAGE_HISTORY_COLLECTION_NAME` from `@schemas/PageHistorySchema`

This ensures consistency and makes refactoring collection names easier if needed.

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

We have two main server-side authentication utilities:

#### For Astro Pages (Cookie-based Authentication)
Use `verifySession` for Astro pages that need authentication. This reads the session cookie:

```ts
import { verifySession } from '@utils/server/auth/verifySession';

// In Astro pages (.astro files)
const session = await verifySession(Astro);
if (!session?.uid) {
  return Astro.redirect('/login?redirect=' + encodeURIComponent(Astro.url.pathname));
}

// Use session.uid for the authenticated user ID
```

#### For API Routes (Token-based Authentication)
Use `tokenToUid` for API endpoints that receive Authorization headers with Bearer tokens:

```ts
import { tokenToUid } from '@utils/server/auth/tokenToUid';

// In API routes (src/pages/api/*)
const uid = await tokenToUid(request);
if (!uid) {
  return new Response('Unauthorized', { status: 401 });
}
```

#### Client-side Authentication
For client-side components, use the session store:

```ts
// Client-side auth checking
import { uid } from '@stores/session';

if (!$uid) {
  // Handle unauthenticated state
  return;
}
```

#### Firebase Auth Race Condition Prevention

**CRITICAL**: When creating stores that make authenticated API calls, always wait for Firebase auth initialization to prevent race conditions:

```ts
// ❌ Wrong - Race condition prone
import { uid } from '@stores/session';

effect(uid, (currentUid) => {
  if (currentUid) {
    // This can fail if Firebase auth isn't ready yet!
    fetchDataFromAPI(currentUid);
  }
});

// ✅ Correct - Wait for both uid and authUser
import { uid, authUser } from '@stores/session';

effect([uid, authUser], ([currentUid, currentAuthUser]) => {
  if (currentUid && currentAuthUser) {
    // Safe to make API calls - Firebase auth is fully initialized
    fetchDataFromAPI(currentUid);
  } else if (!currentUid) {
    // User logged out, clear data
    clearData();
  }
  // For other states (uid but no authUser), wait - don't make API calls
});
```

**Why this pattern is needed:**
- `uid` is a `persistentAtom` that restores immediately from localStorage
- Firebase auth initialization is async and takes time
- `authedFetch()` requires `auth.currentUser` to be available
- Race condition: uid available → effect triggers → API call fails with "User not authenticated"

**Use this pattern for any store that:**
- Makes authenticated API calls using `authedFetch`, `authedGet`, etc.
- Needs to wait for Firebase auth to be fully ready
- Should avoid "User not authenticated" errors on app startup

**Key Differences:**
- **`verifySession`**: Reads session cookies, returns session object with `uid` property, used in Astro pages
- **`tokenToUid`**: Reads Authorization header with Bearer token, returns uid string directly, used in API routes

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

### Layout-Based SEO Architecture

**CRITICAL PRINCIPLE: Authenticated layouts automatically enforce non-indexable behavior.**

- **ModalPage**: Always sets `noSharing={true}` - no prop needed
  - Modal-like authenticated interfaces (settings, creation flows, deletion confirmations)
  - Never indexable by search engines
  - Do NOT pass `noSharing` prop to ModalPage - it's redundant

- **EditorPage**: Always adds robots noindex via EditorHead
  - Content editing interfaces (page editor, character editor, etc.)
  - Never indexable by search engines
  - SEO blocking is automatic

- **Page & PageWithTray**: Support optional `noSharing` prop
  - Public pages: omit `noSharing` prop (default: indexable)
  - Private pages: use `noSharing={true}` or conditional `noSharing={site.hidden}`
  - Flexible for mixed public/private content

**Why this pattern?**
- ✅ **Foolproof**: Impossible to accidentally index authenticated interfaces
- ✅ **Consistent**: All modals/editors blocked the same way
- ✅ **Clean**: No redundant props on every modal/editor route
- ✅ **Maintainable**: Change once in layout, applies everywhere

```astro
// ✅ Correct - ModalPage auto-blocks indexing
<ModalPage title="Settings">

// ❌ Wrong - Don't add redundant noSharing to ModalPage
<ModalPage title="Settings" noSharing={true}>

// ✅ Correct - EditorPage auto-blocks indexing
<EditorPage title="Edit Page">

// ✅ Correct - Public page, indexable
<Page title="Front Page" description="...">

// ✅ Correct - Private page, blocked
<PageWithTray title="Dashboard" noSharing={true}>
```

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
