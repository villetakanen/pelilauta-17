# PBI-036: Fix Tag Case-Sensitivity for Synonym Queries

**Priority:** High  
**Type:** Bug Fix  
**Complexity:** Medium  
**Status:** Ready for Development

## Problem Statement

When viewing a tag page with synonyms (e.g., `/tags/d%26d`), **threads are missing** from the results while pages appear correctly. This is caused by case-sensitive Firestore queries not matching tags stored with different casing.

### Root Cause

Tags are stored in Firestore with the exact casing entered by users, but synonym queries use lowercase values from `TAG_SYNONYMS`, causing mismatches:

**Storage (mixed case):**
```typescript
// Thread tagged with "DnD" by user
tagData = {
  tags: ["DnD"],  // ❌ Mixed case as entered
  ...
}
```

**Query (lowercase from synonyms):**
```typescript
// API builds query for d&d tag
const allTags = ["d&d", "dnd", "d&d", "dungeons & dragons", ...];  // ✅ All lowercase
// Firestore query: array-contains-any ["d&d", "dnd", ...]
// ❌ Won't match "DnD" due to case sensitivity!
```

**Why pages work but threads don't:**
- Pages are typically tagged through a more controlled interface
- Threads often use hashtags from markdown content which preserve user's casing
- The issue affects any content with non-lowercase tags when queried via synonyms

## Expected Behavior

- Tag queries with synonyms should match tags regardless of casing
- Both threads AND pages should appear in tag listings
- User-entered tag casing should be normalized to lowercase for consistent matching

## Current Behavior

- **Tags without synonyms**: Work correctly (single tag, case doesn't matter for exact match)
- **Tags with synonyms + lowercase tags**: Work correctly  
- **Tags with synonyms + mixed case tags**: Missing from results (case mismatch)
- Example: Thread tagged `#DnD` won't appear when viewing `/tags/d%26d` which queries for `["dnd", "d&d", ...]`

## Acceptance Criteria

- [ ] Normalize all tags to lowercase when storing in tag collection
- [ ] Update thread tag storage to normalize tags
- [ ] Update page tag storage to normalize tags  
- [ ] Verify that tag pages show both threads and pages for tags with synonyms
- [ ] Test with mixed-case tags (e.g., `#DnD`, `#PathFinder`) to ensure they match synonym queries
- [ ] Consider migration script to normalize existing tag entries (optional but recommended)

## Implementation Notes

### Solution: Normalize Tags to Lowercase on Storage

The fix requires normalizing tags to lowercase when storing them in the tag collection, ensuring they match the lowercase synonyms in queries.

### Files to Change

**1. `src/pages/api/threads/[threadKey].ts`** (line ~187):

```typescript
// Before (case-sensitive):
const tagData = TagSchema.parse({
  key: threadKey,
  title: updatedThread.title,
  type: 'thread',
  author: updatedThread.owners?.[0] || '',
  tags: updatedThread.tags,
  flowTime: toDate(updatedThread.flowTime).getTime(),
});

// After (normalized):
const tagData = TagSchema.parse({
  key: threadKey,
  title: updatedThread.title,
  type: 'thread',
  author: updatedThread.owners?.[0] || '',
  tags: updatedThread.tags.map(t => t.toLowerCase()),  // ✅ Normalize to lowercase
  flowTime: toDate(updatedThread.flowTime).getTime(),
});
```

**2. `src/pages/api/threads/create.ts`** (line ~161):

```typescript
// Before (case-sensitive):
const tagData = TagSchema.parse({
  key: threadKey,
  title: thread.title,
  type: 'thread',
  author: uid,
  tags: thread.tags,
  flowTime: toDate(thread.flowTime).getTime(),
});

// After (normalized):
const tagData = TagSchema.parse({
  key: threadKey,
  title: thread.title,
  type: 'thread',
  author: uid,
  tags: thread.tags.map(t => t.toLowerCase()),  // ✅ Normalize to lowercase
  flowTime: toDate(thread.flowTime).getTime(),
});
```

**3. `src/firebase/client/page/updatePageTags.ts`** (line ~25):

```typescript
// Before (case-sensitive):
const tagData = TagSchema.parse({
  key: `${page.siteKey}/${page.key}`,
  title: page.name,
  type: 'page',
  author: page.owners[0] || '',
  tags: page.tags,
  flowTime: page.flowTime,
});

// After (normalized):
const tagData = TagSchema.parse({
  key: `${page.siteKey}/${page.key}`,
  title: page.name,
  type: 'page',
  author: page.owners[0] || '',
  tags: page.tags.map(t => t.toLowerCase()),  // ✅ Normalize to lowercase
  flowTime: page.flowTime,
});
```

**4. `src/firebase/client/threads/updateThreadTags.ts`** (line ~26) (if still in use):

```typescript
// Same pattern - normalize tags to lowercase
tags: thread.tags.map(t => t.toLowerCase()),
```

### Important: Display vs Storage

**Note:** This change only affects the **tag index collection** used for querying. The original thread/page documents should still preserve user's original casing for display purposes. Only the denormalized tag index entries need lowercase normalization.

### Testing

1. **Create thread with mixed-case tag:**
   - Create thread with content `#DnD` or `#PathFinder`
   - Verify tag is stored lowercase in tags collection
   
2. **Query with synonyms:**
   - Visit `/tags/d%26d` (which has synonyms including "dnd")
   - Verify threads with `#DnD`, `#dnd`, `#D&D` all appear
   
3. **Verify existing functionality:**
   - Test tags without synonyms still work
   - Test tag links on thread/page listings
   - Test tag editing preserves user's input in main document

4. **Check API response:**
   - Inspect network tab for `/api/tags/[tag].json`
   - Verify response includes both threads and pages

### Migration Considerations

**Existing tag entries** in Firestore will have mixed-case tags and won't match synonym queries until re-saved. Options:

- **Option A (Lazy migration)**: Fix applies as content is edited naturally
- **Option B (Active migration - Recommended)**: Migration script to normalize existing entries:

```typescript
// Migration script pseudocode
const tagDocs = await db.collection('tags').get();
for (const doc of tagDocs.docs) {
  const data = doc.data();
  const normalizedTags = data.tags.map(t => t.toLowerCase());
  
  if (JSON.stringify(normalizedTags) !== JSON.stringify(data.tags)) {
    await doc.ref.update({ tags: normalizedTags });
    console.log(`Normalized tags for ${doc.id}`);
  }
}
```

## Related

- Tag synonyms feature (`src/schemas/TagSynonyms.ts`)
- Tag API endpoint (`src/pages/api/tags/[tag].json.ts`) - uses lowercase synonyms in query
- Tag display page (`src/pages/tags/[tag].astro`)
- Thread creation API (`src/pages/api/threads/create.ts`)
- Thread update API (`src/pages/api/threads/[threadKey].ts`)
- Page tag storage (`src/firebase/client/page/updatePageTags.ts`)

## Risk Assessment

**Low Risk:**
- Changes only affect tag index collection (denormalized data)
- Original thread/page documents unchanged
- No schema changes required
- Backward compatible (mixed-case tags just won't match until normalized)
- Queries become more lenient (find more results), not stricter

**Potential Issues:**
- Existing content with mixed-case tags won't appear in synonym queries until:
  - Content is re-saved, OR
  - Migration script is run
- Should be invisible to users as tag display still uses original casing from main documents

## Estimated Effort

**2-3 hours** (including testing and migration)

- 30 min: Code fixes (4 files)
- 30 min: Local testing with mixed-case tags
- 1 hour: Migration script to normalize existing entries
- 30 min: Run migration and verify production data
- 30 min: Post-migration verification

## Additional Context

**Why this is Firestore-specific:**
- Firestore queries are case-sensitive for string matching
- `array-contains-any` with `["dnd"]` won't match tags array with `["DnD"]`
- This is expected Firestore behavior, not a bug
- Solution is to normalize data at write-time for consistent queries

**Alternative approaches considered:**
1. ❌ Case-insensitive query (not supported by Firestore)
2. ❌ Query all case variations (would require too many variations: DnD, dnd, Dnd, dNd, etc.)
3. ✅ **Normalize to lowercase on write** (standard practice for searchable text)
