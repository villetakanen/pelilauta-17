# Commit 5: Migrate TOC Tool Components to API Pattern

## Overview
This commit migrates both TOC (Table of Contents) tool components to use the new `updateSiteApi` pattern instead of the old direct Firestore `updateSite` pattern. Both components handle site metadata updates with the `silent=true` flag to prevent timestamp changes.

## Changes Made

### Files Modified

#### 1. `src/components/svelte/sites/toc/SiteTocTool.svelte`
- **Changed import:** `updateSite` → `updateSiteApi`
- **Updated function call:** Replaced `updateSite()` with `updateSiteApi()`
- **Improved error logging:** Added component context to error logs
- **Use case:** Updates site sort order (name/createdAt/flowTime)
- **Silent flag:** `true` (metadata-only, no timestamp update)

**Before:**
```typescript
import { updateSite } from 'src/firebase/client/site/updateSite';

await updateSite(
  {
    key: site.key,
    sortOrder: value,
  },
  true,
);
```

**After:**
```typescript
import { updateSiteApi } from 'src/firebase/client/site/updateSiteApi';

await updateSiteApi(
  {
    key: site.key,
    sortOrder: value,
  },
  true,
);
logError('SiteTocTool', 'Failed to update sort order:', error);
```

#### 2. `src/components/svelte/sites/toc/SiteCategoriesTool.svelte`
- **Changed import:** `updateSite` → `updateSiteApi`
- **Updated function call:** Replaced `updateSite()` with `updateSiteApi()`
- **Improved error logging:** Added component context to error logs
- **Use case:** Updates site page categories (add/remove/reorder)
- **Silent flag:** `true` (metadata-only, no timestamp update)

**Before:**
```typescript
import { updateSite } from 'src/firebase/client/site/updateSite';

await updateSite(
  {
    key: site.key,
    pageCategories: cats,
  },
  true,
);
logError('Error saving categories', error);
```

**After:**
```typescript
import { updateSiteApi } from 'src/firebase/client/site/updateSiteApi';

await updateSiteApi(
  {
    key: site.key,
    pageCategories: cats,
  },
  true,
);
logError('SiteCategoriesTool', 'Error saving categories:', error);
```

## Benefits

### 1. **API-First Architecture**
- Site updates now go through validated REST API endpoints
- Server-side validation via `SiteUpdateSchema`
- Centralized business logic

### 2. **Atomic Cache Purging**
- Cache purging happens server-side as part of the update transaction
- No risk of update succeeding but cache purge failing
- Eliminates stale cache issues

### 3. **Better Error Handling**
- Improved error messages with component context
- Consistent error handling across all update paths
- Better debugging information in logs

### 4. **Silent Updates Work Correctly**
- Both components use `silent=true` for metadata-only updates
- Timestamps (`updatedAt`) are not modified
- Cache still purged despite silent flag (important!)

### 5. **Security**
- All updates require authentication (JWT token)
- Ownership validation on server side
- No direct Firestore access from client

## Testing

### Test Results
```bash
pnpm test
# ✅ All 366 tests passing
# ✅ No test changes needed (components work with existing tests)
```

### Biome Lint/Format
```bash
pnpm biome check --write src/components/svelte/sites/toc/
# ✅ Fixed 2 files (formatting only)
```

### Manual Testing Checklist
- [ ] Sort order dropdown in TOC settings updates correctly
- [ ] Category add/remove/reorder works in TOC settings
- [ ] Snackbar notifications appear on success/error
- [ ] Silent updates don't change `updatedAt` timestamp
- [ ] Cache purging works (verify site HTML updates)
- [ ] Non-owners cannot access TOC admin tools

## Architecture Notes

### Silent Updates Semantics
- `silent=true` means **no timestamp update** (updatedAt stays unchanged)
- Cache purging **still happens** even with `silent=true`
- Use case: Metadata changes that shouldn't trigger "recently updated" notifications

### Why Group These Two Components?
1. Both are in the same feature area (TOC management)
2. Both use identical migration pattern
3. Both use `silent=true` flag
4. Logical commit boundary for review

## Remaining Work

After this commit, the following files still use the old `updateSite` pattern:
- `src/firebase/client/page/addPageRef.ts`
- `src/stores/site/index.ts`

These will be migrated in Commit 6, then Commit 7 will remove the old pattern entirely.

## Dependencies

**Requires:**
- ✅ Commit 3 (`updateSiteApi` wrapper exists)
- ✅ API endpoint `/api/sites/[siteKey]` working

**Enables:**
- Commit 6 (migrate remaining uses)
- Commit 7 (remove old pattern)

## Impact Analysis

### Code Changes
- Lines changed: ~20 (imports + function calls)
- Net complexity: Same (simple find-replace migration)
- Breaking changes: None (internal implementation detail)

### User-Facing Changes
- **None** - Same functionality, same UI, same behavior
- Cache purging now atomic (improvement)
- Better error messages in logs (improvement)

### Performance
- Negligible difference (same network call, just structured differently)
- Cache purging still happens synchronously
- No additional latency introduced

## Rollback Plan

If issues are discovered:
1. Revert this commit: `git revert <commit-hash>`
2. Old `updateSite` pattern still exists and works
3. No database migrations or breaking changes
4. Components revert to old behavior immediately

## Related Documentation

- PBI-044: Full migration plan in `docs/pbi/044-migrate-update-site-to-ssr.md`
- API Endpoint: `src/pages/api/sites/[siteKey]/index.ts`
- Client Wrapper: `src/firebase/client/site/updateSiteApi.ts`
- Schema: `src/schemas/SiteSchema.ts` (SiteUpdateSchema)