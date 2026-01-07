# Site TOC Specification

> Table of contents ordering and management for sites.

## Overview

The Site TOC (Table of Contents) displays pages organized by categories with configurable sort ordering, including manual drag-and-drop reordering.

## Sort Orders

| Value | Description |
|-------|-------------|
| `name` | Alphabetical by page name |
| `createdAt` | Oldest first |
| `flowTime` | Most recently updated first |
| `manual` | Custom order via `PageRef.order` field |

## Schema

**PageRefSchema** (`src/schemas/SiteSchema.ts`):

```typescript
PageRefSchema = z.object({
  key: z.string(),
  name: z.string(),
  author: z.string(),
  category: z.string().optional(),
  flowTime: z.number(),
  order: z.number().optional(), // Manual sort position
});
```

## Components

### ManualTocOrdering

**File:** `src/components/svelte/sites/toc/ManualTocOrdering.svelte`

Purpose: Drag-and-drop interface for reordering pages within categories.

**Behavior:**
- Groups pages by category
- Renders sortable list using `SvelteSortableList`
- Saves order immediately on drop via `updatePageRefsOrder()`
- Shows loading state during save

### SiteTocTool

**File:** `src/components/svelte/sites/toc/SiteTocTool.svelte`

Purpose: TOC settings admin UI.

**Behavior:**
- Sort order dropdown (name, createdAt, flowTime, manual)
- Shows `ManualTocOrdering` when `sortOrder === 'manual'`
- Only visible to site owners

## Client Functions

### updatePageRefsOrder

**File:** `src/firebase/client/site/updatePageRefsOrder.ts`

```typescript
async function updatePageRefsOrder(
  siteKey: string,
  orderedPageRefs: PageRef[],
  silent?: boolean
): Promise<void>
```

**Behavior:**
1. Assigns sequential `order` values (0, 1, 2, ...)
2. Updates `site.pageRefs` via Firestore
3. Triggers cache purge unless `silent: true`

## Display Logic

**File:** `src/components/server/SiteApp/SiteTocApp.astro`

When `sortOrder === 'manual'`:
```typescript
pagesInCategory.sort((a, b) => {
  const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
  return orderA - orderB;
});
```

Pages without `order` field appear last.

## i18n Keys

| Key | Description |
|-----|-------------|
| `entries:site.sortOrders.manual` | "Manual Order" dropdown option |
| `site:toc.manualOrder.title` | Section heading |
| `site:toc.manualOrder.info` | Help text |
| `site:toc.manualOrder.saving` | Loading indicator |
| `snack:site.tocOrderUpdated` | Success message |
| `snack:site.tocOrderUpdateFailed` | Error message |

## Authorization

- Only site owners can access TOC settings
- Firestore security rules enforce write access
- Viewers see ordered TOC but cannot edit
