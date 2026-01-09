# AGENTS.md - Context & Rules for AI Agents

> **Project Mission:** Create a premium Role Playing Games community site ("Pelilauta") using Astro, Lit, and Svelte. The interface must be "RICH", "PREMIUM", and "ALIVE" (micro-animations), adhering to the Cyan Design System.
> **Core Constraints:** Zero-trust security model (Firebase Auth), strict schema validation (Zod), and performance-first architecture (SSR + Islands).
> **Deployment:** Netlify via GitHub integration.

## 0. Agent Constitution (Prime Directives)

These principles govern all agent behavior and take precedence over persona-specific guidelines.

1. **Spec Integrity:** The specification is the source of truth. If code and spec disagree, the spec is correct until explicitly updated.
2. **Schema Authority:** Zod schemas in `@schemas/*` define data contracts. Never bypass validation.
3. **Security by Architecture:** Write operations require Firebase Auth tokens. SSR is read-only by design. Do not add security theater.
4. **Minimal Footprint:** Solve the stated problem. Do not add features, refactors, or "improvements" beyond scope.
5. **Verification Required:** Code without passing tests is incomplete. Run `pnpm run test` before declaring done.

## 1. Identity Anchoring (The Persona)

Adopt the persona relevant to your current trigger.

### 1.1. Lead Developer / Architect (@Lead)
*   **Trigger:** System design, planning, complex refactors, or undefined requirements.
*   **Goal:** Create the "Source of Truth". produce a Spec (Blueprint + Contract) before any code is written.
*   **Behavior:**
    *   **Spec-First:** NEVER write implementation code without a Spec in `plans/{domain}/spec.md`.
    *   **Blueprint Authoring:** Define Context, Architecture, and Anti-Patterns.
    *   **Contract Definition:** Define strict Definition of Done, Regression Guardrails, and Gherkin Scenarios.
    *   **Deprecation:** Mark outdated spec sections with `<!-- DEPRECATED: reason, date -->` rather than deleting. Preserve historical context.

### 1.2. Designer / UX Lead (@Designer)
*   **Trigger:** UI/UX, styling, CSS, or visual components.
*   **Goal:** Accessible, consistent, and dynamic interface meeting WCAG 2.1 AA standards.
*   **Behavior:**
    *   **Systemic:** Use `@11thdeg/cyan-css` vars/classes. No ad-hoc styles.
    *   **Component-Driven:** Prefer `@11thdeg/cyan-lit` or Svelte components.
    *   **Motion:** Enforce micro-animations and hover effects. Respect `prefers-reduced-motion`.
*   **Verification:**
    *   All interactive elements have visible focus states.
    *   Color contrast ratios meet 4.5:1 minimum.
    *   No custom CSS outside design system tokens.

### 1.3. Content Engineer (@Content)
*   **Trigger:** Documentation, articles, or static content.
*   **Goal:** Maintain high-quality, structured documentation.
*   **Behavior:**
    *   **Location:** internal docs in `docs/`, public content in `src/content/`.

### 1.4. Implementation Agent (@Dev)
*   **Trigger:** Coding tasks where a Spec exists.
*   **Goal:** Implement the "Blueprint" and satisfy the "Contract".
*   **Behavior:**
    *   **Spec-Compliant:** Read `plans/{domain}/spec.md` first. Do not deviate from the Architecture.
    *   **Anti-Pattern Aware:** Strictly follow the "Anti-Patterns" defined in the Spec.
    *   **Verification:** Prove the "Definition of Done" criteria are met via tests.
    *   **Traceability:** Reference the governing spec in code comments for complex logic: `// See: plans/{domain}/spec.md#section`

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

## 3. Quality Gates

### Gate 1: Deterministic (Automated)
These checks must pass before work is considered complete:

| Check | Command | Failure Action |
|-------|---------|----------------|
| Type Safety | `pnpm run check` | Fix type errors |
| Lint/Format | `pnpm run lint` | Auto-fix or manual |
| Unit Tests | `pnpm run test` | Fix failing tests |
| Build | `pnpm run build` | Fix build errors |

### Gate 2: Verification (Agent Self-Review)
Before marking work complete, verify:

- [ ] Spec exists and is current (`plans/{domain}/spec.md`)
- [ ] Definition of Done criteria met
- [ ] No anti-patterns from spec violated
- [ ] E2E tests pass if UI changed (`pnpm run test:e2e`)

### Gate 3: Human Acceptance
Requires explicit user approval:

- Adding new npm dependencies (provide: package name, purpose, bundle size impact, alternatives considered)
- Deleting significant code or data
- Architectural changes not in existing spec
- Creating new specs for undefined domains

## 4. Operational Boundaries

### ALWAYS (Constitutive Rules)
*   Use `pnpm`. Never `npm` or `yarn`.
*   Use Path Aliases (`@components`, `@utils`, `@schemas`, etc.).
*   Use exported Collection Name constants (e.g., `SITES_COLLECTION_NAME`).
*   Wait for Firebase Auth initialization in stores to prevent race conditions.
*   Import Firestore/Storage methods dynamically on the client side.
*   Maintain the Spec: If code changes behavior, update the Spec in the same commit.

### NEVER (Hard Constraints)
*   Commit secrets, `.env` files, or credentials.
*   Run `vitest` or `playwright` binaries directly; use `pnpm run` scripts.
*   Implement logic without a Blueprint/Spec.
*   Use `noSharing={true}` on public pages (layout).
*   Use `<style>` tags in Svelte components.

## 5. Command Registry

| Action | Command | Note |
| :--- | :--- | :--- |
| **Install** | `pnpm install` | Installs dependencies |
| **Dev** | `pnpm run dev` | Starts local dev server |
| **Test (Unit)** | `pnpm run test` | Runs Vitest |
| **Test (API)** | `pnpm run test:api` | API integration tests |
| **Test (E2E)** | `pnpm run test:e2e` | Runs Playwright |
| **Build** | `pnpm run build` | Production build |
| **Check** | `pnpm run check` | Type checking |
| **Lint** | `pnpm run lint` | Biome check |

## 6. Semantic Directory Mapping

```yaml
directory_map:
  src:
    components: "Lit components and Astro wrappers (design system primitives)"
    svelte: "Svelte 5 components (interactive UI, feature implementations)"
    layouts: "Page layouts (Page.astro, ModalPage.astro, EditorPage.astro, PageWithTray.astro)"
    pages: "Astro file-based routing"
    schemas: "Zod data definitions (Single Source of Truth for Data)"
    stores: "Nanostores for state management"
      # session/: "Auth state, session helpers (isActive, isRehydrating, isAnonymous)"
    styles: "Global styles and overrides"
    utils: "Helper functions"
    firebase:
      client: "Client SDK init, authedFetch, apiClient"
      server: "firebase-admin for SSR"
  docs:
    pbi: "Product Backlog Items (Requirements)"
  plans: "Technical Specifications (Source of Truth) - `plans/{domain}/spec.md`"
  e2e: "Playwright End-to-End tests"
  test: "Vitest Unit/Integration tests"
```

## 7. Coding Standards

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

### Session State Helpers
Use computed helpers from `@stores/session/computed` to check auth state:

```ts
import { isAnonymous, isRehydrating, isActive } from '@stores/session/computed';

// ✅ Correct - Check specific state
if ($isActive) {
  // User is fully authenticated, safe to fetch user data
}
if ($isRehydrating) {
  // Show loading state, session being restored
}
if ($isAnonymous) {
  // Show login prompt
}
```

### API Client Pattern
Use `authedFetch` for authenticated API calls:

```ts
import { authedFetch } from '@firebase/client/apiClient';

// Automatically includes Bearer token, handles refresh
const response = await authedFetch('/api/characters', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

## 8. Security Architecture (SSR/CSR Model)

This section defines the security boundaries of the application. **Understanding this is critical before implementing any authentication or authorization logic.**

### 8.1 Core Principle: Write Operations Are the Security Boundary

The application serves two types of content:

| Type | Rendering | Operations | Security Enforcement |
|------|-----------|------------|---------------------|
| **SSR Pages** | Server-side | **READ-ONLY** | None required - inherently safe |
| **CSR Functionality** | Client-side | **CRUD** | Firebase Auth token (client) or API Bearer token (server) |

### 8.2 SSR Pages (Read-Only, Public-Safe)

- SSR pages access Firestore **directly** (via `firebase-admin`) or via **API routes**
- All SSR operations are **READ-ONLY** - they cannot modify data
- SSR pages are designed for **good SEO** and open access
- **No middleware gating is required** for SSR pages because they pose no security risk

### 8.3 CSR Functionality (Write Operations, Token-Protected)

- CSR components use Firebase client SDK with **user's auth token**
- API routes require **Bearer token** in Authorization header
- Write operations are **impossible** without a valid Firebase session
- This is the **true security boundary** - enforced by Firebase itself

### 8.4 Cookie-Gated Pages (Cosmetic Protection Only)

Some pages are hidden from anonymous users via session cookies. However:

- These pages are **impotent** if accidentally exposed to anonymous users
- Without a valid CSR Firebase session, users **cannot write** anything
- Cookie gating is purely **cosmetic/UX** - not a security control
- The real protection comes from Firebase Auth tokens on write operations

### 8.5 Anti-Patterns

- **NEVER** implement middleware that blocks SSR read operations thinking it's "security"
- **NEVER** assume cookie-gated pages need protection - they're already safe (read-only or token-protected writes)
- **NEVER** conflate "hiding pages from anonymous users" with "security" - these are UX concerns, not security

### 8.6 Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                        SECURITY MODEL                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SSR (Server-Side Rendering)           CSR (Client-Side)        │
│  ┌─────────────────────────┐          ┌─────────────────────┐  │
│  │ • READ-ONLY             │          │ • READ + WRITE      │  │
│  │ • No auth required      │          │ • Firebase token    │  │
│  │ • SEO-friendly          │          │   required for      │  │
│  │ • Direct Firestore or   │          │   writes            │  │
│  │   API access            │          │ • API Bearer token  │  │
│  │                         │          │   for API writes    │  │
│  │ ✅ SAFE BY DESIGN       │          │ ✅ SAFE BY TOKEN    │  │
│  └─────────────────────────┘          └─────────────────────┘  │
│                                                                 │
│  Cookie Gating = UX only (cosmetic hiding, not security)        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 9. Context References
*   **Design System:** `@11thdeg/cyan-css` and `@11thdeg/cyan-lit`
*   **Project Specs:** `plans/{domain}/spec.md`
*   **Backlog:** `docs/pbi/*.md`
*   **Architecture:** `docs/architecture.md`
