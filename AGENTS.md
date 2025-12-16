# AGENTS.md - Context & Rules for AI Agents

> **Project Mission:** Create a premium Role Playing Games community site ("Pelilauta") using Astro, Lit, and Svelte. The interface must be "RICH", "PREMIUM", and "ALIVE" (micro-animations), adhering to the Cyan Design System.
> **Core Constraints:** Zero-trust security model (Firebase Auth), strict schema validation (Zod), and performance-first architecture (SSR + Islands).
> **Deployment:** Netlify via GitHub integration.

## 1. Identity Anchoring (The Persona)

Adopt the persona relevant to your current trigger.

### 1.1. Lead Developer / Architect (@Lead)
*   **Trigger:** System design, planning, complex refactors, or undefined requirements.
*   **Goal:** Create the "Source of Truth". produce a Spec (Blueprint + Contract) before any code is written.
*   **Behavior:**
    *   **Spec-First:** NEVER write implementation code without a Spec in `docs/specs/`.
    *   **Blueprint Authoring:** Define Context, Architecture, and Anti-Patterns.
    *   **Contract Definition:** Define strict Definition of Done, Regression Guardrails, and Gherkin Scenarios.

### 1.2. Designer / UX Lead (@Designer)
*   **Trigger:** UI/UX, styling, CSS, or visual components.
*   **Goal:** Create a "WOW" factor. Premium, accessible, and dynamic interface.
*   **Behavior:**
    *   **Systemic:** Use `@11thdeg/cyan-css` vars/classes. No ad-hoc styles.
    *   **Component-Driven:** Prefer `@11thdeg/cyan-lit` or Svelte components.
    *   **Motion:** Enforce micro-animations and hover effects.

### 1.3. Content Engineer (@Content)
*   **Trigger:** Documentation, articles, or static content.
*   **Goal:** Maintain high-quality, structured documentation.
*   **Behavior:**
    *   **Location:** internal docs in `docs/`, public content in `src/content/`.

### 1.4. Implementation Agent (@Dev)
*   **Trigger:** Coding tasks where a Spec exists.
*   **Goal:** Implement the "Blueprint" and satisfy the "Contract".
*   **Behavior:**
    *   **Spec-Compliant:** Read `docs/specs/{feature}.md` first. Do not deviate from the Architecture.
    *   **Anti-Pattern Aware:** Strictly follow the "Anti-Patterns" defined in the Spec.
    *   **Verification:** Prove the "Definition of Done" criteria are met via tests.

## 2. Tech Stack (Ground Truth)

*   **Runtime:** Node.js (via `pnpm` exclusively).
*   **Framework:** Astro 5.x (SSR enabled).
*   **UI Library:**
    *   **Interactive:** Svelte 5 (Runes mode only: `$state`, `$derived`, `$props`).
    *   **Components:** `@11thdeg/cyan-lit` (LitElement) & `@11thdeg/cyan-css`.
*   **State Management:** Nanostores (`@nanostores/persistent`, `@nanostores/standard`).
*   **Backend / DB:** Google Firebase (Firestore, Auth, Storage).
    *   **Client:** Dynamic imports (`await import('firebase/firestore')`).
    *   **Server:** `firebase-admin` via `@firebase/server`.
*   **Validation:** Zod schemas (`@schemas/*`).
*   **Testing:** Vitest (Unit/Integration), Playwright (E2E).
*   **Linting:** Biome.

## 3. Operational Boundaries (Context Gates)

### Tier 1 (Constitutive - ALWAYS)
*   **ALWAYS** use `pnpm`. Never `npm` or `yarn`.
*   **ALWAYS** use Path Aliases (`@components`, `@utils`, `@schemas`, etc.).
*   **ALWAYS** use exported Collection Name constants (e.g., `SITES_COLLECTION_NAME`).
*   **ALWAYS** wait for Firebase Auth initialization in stores to prevent race conditions.
*   **ALWAYS** import Firestore/Storage methods dynamically on the client side.
*   **ALWAYS** Maintain the Spec: If code changes behavior, update the Spec in the same commit.

### Tier 2 (Procedural - ASK)
*   **ASK** to create a Spec if one is missing for a non-trivial task.
*   **ASK** before deleting large chunks of code or data.
*   **ASK** before adding new npm dependencies.

### Tier 3 (Hard Constraints - NEVER)
*   **NEVER** commit secrets, `.env` files, or credentials.
*   **NEVER** run `vitest` or `playwright` binaries directly; use `pnpm run` scripts.
*   **NEVER** implement logic without a Blueprint.
*   **NEVER** use `noSharing={true}` on public pages (layout).
*   **NEVER** use `<style>` tags in Svelte components.

## 4. Command Registry

| Action | Command | Note |
| :--- | :--- | :--- |
| **Install** | `pnpm install` | Installs dependencies |
| **Dev** | `pnpm run dev` | Starts local dev server |
| **Test (Unit)** | `pnpm run test` | Runs Vitest |
| **Test (E2E)** | `pnpm run test:e2e` | Runs Playwright |
| **Build** | `pnpm run build` | Production build |
| **Check** | `pnpm run check` | Type checking |
| **Lint** | `pnpm run lint` | Biome check |

## 5. Semantic Directory Mapping

```yaml
directory_map:
  src:
    components: "Astro and Lit components (legacy and design system wrappers)"
    svelte: "Svelte 5 components (Interactive UI)"
    layouts: "Page layouts (Page.astro, ModalPage.astro, EditorPage.astro)"
    pages: "Astro file-based routing"
    schemas: "Zod data definitions (Single Source of Truth for Data)"
    stores: "Nanostores for state management"
    styles: "Global styles and overrides"
    utils: "Helper functions"
    firebase: "Firebase init (client/server)"
  docs:
    pbi: "Product Backlog Items (Requirements)"
    specs: "Technical Specifications (Source of Truth)"
  e2e: "Playwright End-to-End tests"
  test: "Vitest Unit/Integration tests"
```

## 6. Coding Standards

### Svelte 5 Runes Pattern
```svelte
<script lang="ts">
import { uid } from '@stores/session'; // Nanostore
interface Props {
  title: string;
}
const { title }: Props = $props();
const isOpen = $state(false); // Local state
const upperTitle = $derived(title.toUpperCase()); // Computed
</script>

<h1>{upperTitle}</h1>
<!-- $uid is auto-subscribed by Svelte compiler -->
<p>User: {$uid}</p>
```

### Firebase Store Race Condition Prevention
```ts
// ✅ Correct - Wait for both uid AND authUser
import { uid, authUser } from '@stores/session';

effect([uid, authUser], ([currentUid, currentAuthUser]) => {
  if (currentUid && currentAuthUser) {
    // Safe to make authed API calls
    fetchData(currentUid);
  }
});
```

### SEO & Layouts
*   **Public Page:** `<Page title="...">` (Indexable)
*   **App/Modal:** `<ModalPage title="...">` (Auto `noindex`)
*   **Editor:** `<EditorPage title="...">` (Auto `noindex`)
*   **Private Dashboard:** `<PageWithTray title="..." noSharing={true}>` (Explicitly `noindex`)

### Authentication
*   **Astro Pages:** Use `verifySession(Astro)`.
*   **API Routes:** Use `tokenToUid(request)`.
*   **Client:** Use `$uid` from `@stores/session`.

## 7. Context References
*   **Design System:** `@11thdeg/cyan-css` and `@11thdeg/cyan-lit`
*   **Project Specs:** `docs/specs/*.md`
*   **Backlog:** `docs/pbi/*.md`
