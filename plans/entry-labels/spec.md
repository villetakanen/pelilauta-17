# Entry Labels Specification

> Admin-managed persistent tags for content entries that survive user edits.

## Overview

Entry labels are admin-assigned metadata tags that persist through content edits. Unlike user tags (extracted from content), labels are manually managed by moderators and remain unchanged when users edit their content.

## Terminology

| Term | Description | Editable By | Source |
|------|-------------|-------------|--------|
| **Tags** | Extracted from content (hashtags like `#dnd #lfg`) | Content owner | Auto-extracted from `markdownContent` |
| **Labels** | Manually assigned metadata | Admins only | API endpoint |

Both tags and labels appear together in the tag index for content discovery.

## Current Implementation

### Schema

**Thread labels** are currently implemented in `ThreadSchema`:

```typescript
// src/schemas/ThreadSchema.ts
labels: z.array(z.string()).optional()
```

### Helper Functions

**File:** `src/utils/shared/threadTagHelpers.ts`

| Function | Description |
|----------|-------------|
| `normalizeTag(tag)` | Lowercase, trim, collapse spaces |
| `getAllThreadTags(thread)` | Combines `tags` + `labels`, deduplicates, sorts |
| `isLabel(thread, tag)` | Returns true if tag is in `thread.labels` |

### API Endpoints

**File:** `src/pages/api/threads/[threadKey]/labels.ts`

| Method | Description | Auth Required |
|--------|-------------|---------------|
| `POST` | Add labels to thread | Admin |
| `DELETE` | Remove labels from thread | Admin |

**Request body:**
```json
{ "labels": ["featured", "quality-content"] }
```

**Response:**
```json
{
  "success": true,
  "labels": ["featured", "quality-content"],
  "message": "Labels added successfully"
}
```

### UI Component

**File:** `src/components/svelte/threads/LabelManager.svelte`

Admin-only component for managing thread labels:
- Text input to add new labels
- Chip display with remove buttons for existing labels
- Uses `admin:labels.*` i18n namespace

### Tag Index Integration

When labels are modified:
1. Thread document updated with new `labels` array
2. Tag index updated with combined `tags + labels` via `getAllThreadTags()`
3. Cache purged for affected thread and tag pages

## Data Flow

```
┌─────────────────┐     ┌─────────────────┐
│ User edits      │     │ Admin adds      │
│ content         │     │ label           │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ PUT /threads/   │     │ POST /threads/  │
│ [key]           │     │ [key]/labels    │
│                 │     │                 │
│ Updates: tags   │     │ Updates: labels │
│ Ignores: labels │     │ Ignores: tags   │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ getAllThreadTags()    │
         │ Combines: tags+labels │
         │ Deduplicates & sorts  │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ Update Tag Index      │
         │ Purge Cache           │
         └───────────────────────┘
```

## i18n Keys

**Namespace:** `admin:labels`

| Key | Description |
|-----|-------------|
| `title` | Section title |
| `legend` | Explanation text |
| `addPlaceholder` | Input placeholder |
| `addLabel` | Add button text |
| `removeLabel` | Remove button aria-label |
| `noLabels` | Empty state message |
| `errors.emptyLabel` | Validation error |
| `errors.alreadyExists` | Duplicate error |
| `errors.addFailed` | API error |
| `errors.removeFailed` | API error |

## Future Extension: Content Entry Level

The current implementation is thread-specific. The design allows for extension to all content entry types:

| Entry Type | Schema Field | API Endpoint | Status |
|------------|--------------|--------------|--------|
| Thread | `labels` | `/api/threads/[key]/labels` | ✅ Implemented |
| Site | `labels` | `/api/sites/[key]/labels` | ⏳ Planned |
| Page | `labels` | `/api/pages/[key]/labels` | ⏳ Planned |

To extend to other entry types:
1. Add `labels: z.array(z.string()).optional()` to schema
2. Create corresponding API endpoint
3. Add `LabelManager` to admin UI for that entry type
4. Extend helper functions to work with generic content entries

## Security

- All label operations require admin authentication (`isAdmin(uid)`)
- Labels are never modified by content update endpoints
- Server-side validation of admin status (no client-side trust)
