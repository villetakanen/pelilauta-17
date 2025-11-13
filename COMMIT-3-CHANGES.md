# PBI-044 Commit 3: Client-Side API Wrapper

**Status:** ✅ Complete - Ready for Review

## Changes Summary

### 1. Added `authedPatch` Method
- **File:** `src/firebase/client/apiClient.ts`
- **Lines:** +13
- **Purpose:** HTTP PATCH convenience method for partial updates
- **Pattern:** Matches existing `authedGet`, `authedPost`, `authedPut`, `authedDelete`

### 2. Created `updateSiteApi` Wrapper
- **File:** `src/firebase/client/site/updateSiteApi.ts` (NEW)
- **Lines:** 64
- **Purpose:** Client-side wrapper for PATCH `/api/sites/[siteKey]` endpoint
- **Signature:** `updateSiteApi(site: Partial<Site>, silent = false): Promise<void>`
- **Features:**
  - Same API as old `updateSite` (easy migration)
  - Uses `authedPatch` for correct REST semantics
  - Validates `site.key` is present
  - Comprehensive error handling
  - Debug/error logging
  - Full JSDoc documentation

### 3. Comprehensive Unit Tests
- **File:** `test/lib/client/updateSiteApi.test.ts` (NEW)
- **Lines:** 256
- **Tests:** 12 new tests
- **Coverage:**
  - Input validation
  - API call parameters
  - Silent flag handling
  - Success/error responses
  - Network errors
  - Logging behavior

### 4. Documentation Updates
- **File:** `docs/pbi/044-migrate-update-site-to-ssr.md`
- Added "Implementation Status" section
- Marked Commit 3 as complete
- Listed all files modified

- **File:** `docs/pbi/044-commit-3-summary.md` (NEW)
- Detailed commit documentation
- Technical decisions explained
- Migration impact analysis

## Test Results

```
✅ All 366 tests pass (12 new)
✅ Biome linting clean (0 errors)
✅ No diagnostics errors
```

## Files Changed

```
Modified:
  src/firebase/client/apiClient.ts                 (+13 lines)
  docs/pbi/044-migrate-update-site-to-ssr.md       (+52 lines)

Created:
  src/firebase/client/site/updateSiteApi.ts        (64 lines)
  test/lib/client/updateSiteApi.test.ts            (256 lines)
  docs/pbi/044-commit-3-summary.md                 (249 lines)
  COMMIT-3-CHANGES.md                              (this file)
```

## Usage Example

```typescript
import { updateSiteApi } from '@firebase/client/site/updateSiteApi';

// Update site metadata (with timestamp update)
await updateSiteApi({ 
  key: 'my-site', 
  name: 'New Site Name',
  description: 'Updated description'
});

// Silent update (no timestamp, still purges cache)
await updateSiteApi({ 
  key: 'my-site', 
  sortOrder: 'manual' 
}, true);
```

## What's Next (Commit 4)

Migrate `SiteMetaForm.svelte` to use `updateSiteApi`:

```diff
- import { updateSite } from '@firebase/client/site/updateSite';
+ import { updateSiteApi } from '@firebase/client/site/updateSiteApi';

- await updateSite({ key: siteKey, ...formData });
+ await updateSiteApi({ key: siteKey, ...formData });
```

## Key Technical Decisions

1. **PATCH not PUT**: Correct REST semantics for partial updates
2. **Separate wrapper file**: Centralized error handling, consistent interface
3. **Keep `silent` parameter**: Maintains API compatibility with old `updateSite`
4. **Unit tests only**: Integration tests already exist in `test/api/sites-update.test.ts`

## No Breaking Changes

- ✅ Old `updateSite` still exists (removed in Commit 7)
- ✅ New wrapper is purely additive
- ✅ Components can migrate gradually
- ✅ Both patterns coexist safely

## Ready to Commit?

**Yes** - All criteria met:
- ✅ Code complete and tested
- ✅ All tests passing
- ✅ Linting clean
- ✅ Documentation updated
- ✅ No breaking changes
- ✅ Ready for review

---

**Commit Message:**
```
feat(api): add updateSiteApi client wrapper (PBI-044 commit 3)

- Add authedPatch helper to apiClient
- Create updateSiteApi wrapper for PATCH /api/sites/[siteKey]
- Add comprehensive unit tests (12 tests)
- Maintains API compatibility with old updateSite
- Ready for component migration (Commits 4-6)
```
