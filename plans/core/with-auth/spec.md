# WithAuth Component Specification

## Overview
`WithAuth` is a client-side UI wrapper component that conditionally renders content based on authorization state. It provides a consistent "forbidden" fallback UI when access is denied.

**Location:** `src/components/svelte/app/WithAuth.svelte`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `allow` | `boolean` | Yes | Reactive condition controlling content visibility |
| `suspend` | `boolean` | No | When true, shows loader instead of forbidden message (for rehydrating state) |
| `message` | `string` | No | Custom message for forbidden state (default: `t('app:forbidden.message')`) |
| `children` | `Snippet` | No | Content to render when `allow` is true |

## Behavior

```
suspend = true              → Render loader
suspend = false, allow = true  → Render children
suspend = false, allow = false → Render "Forbidden" card with optional login link
```

When `allow` is false:
- Shows monster icon and forbidden title
- Displays custom `message` or default i18n string
- If user has no `$uid`, shows login button

## Reactivity Requirements (Svelte 5)

> **IMPORTANT:** Due to Svelte 5's `$props()` semantics, the `allow` prop must be wrapped in `$derived` to ensure reactivity when the parent's condition changes asynchronously.

```typescript
// ✅ Correct: Use $derived for reactive allow
const props: Props = $props();
const isAllowed = $derived(props.allow);

{#if isAllowed}
  {@render props.children?.()}
{/if}
```

```typescript
// ❌ Incorrect: Destructured props don't update reactively
const { allow } = $props();

{#if allow}  // Won't re-evaluate when parent's state changes!
```

## Usage Pattern

### With Session State Helpers
When gating content based on auth, combine with `isActive`:

```svelte
<script lang="ts">
import { isActive } from 'src/stores/session/computed';
import { appMeta } from 'src/stores/metaStore/metaStore';
import { uid } from 'src/stores/session';

const isAdmin = $derived.by(() => $isActive && $appMeta.admins.includes($uid));
</script>

<WithAuth allow={isAdmin}>
  <AdminContent />
</WithAuth>
```

### With Simple Conditions
For non-async conditions:

```svelte
<WithAuth allow={hasPermission}>
  <ProtectedContent />
</WithAuth>
```

## Anti-Patterns

- **Don't rely on `$uid` alone** — Use `$isActive` to ensure session is verified
- **Don't check `allow` during rehydrating phase** — Wait for session to stabilize
- **Don't use for security** — This is UX gating only; real security is on write operations

## Related

- [Session Store Spec](../session-store/spec.md) — Session state helpers (`isActive`, `isRehydrating`)
- [Session and Auth Spec](../session-and-auth/spec.md) — Security model context

## Changelog
- **2026-01-07**: Fixed reactivity bug by using `$derived(props.allow)` pattern
