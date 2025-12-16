# PBI-054 Migration Progress Tracker

**Last Updated:** 2024-12-14  
**Status:** 🟡 IN PROGRESS  
**Overall Progress:** 3/20 tests migrated (15%)

---

## 🔥 PRE-MIGRATION TEST SUITE BASELINE (2024-12-14)

**CRITICAL:** This section documents the state of the test suite BEFORE the bulk migration to programmatic auth.
All tests were run individually to identify which tests are failing and need fixes.

### Summary Statistics

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total Test Files** | 22 | 100% |
| **Passing Files** | 15 | 68% |
| **Failing Files** | 7 | 32% |
| **Skipped Tests** | 3 | - |
| **Total Individual Tests** | ~80+ | - |
| **Passing Individual Tests** | ~66 | ~82% |
| **Failing Individual Tests** | ~14 | ~18% |

### ✅ PASSING TEST FILES (15)

1. **`front-page.spec.ts`** - 2/2 tests passing ✅ (Already migrated)
2. **`cache-purging.spec.ts`** - 2/2 tests passing ✅
3. **`channels.spec.ts`** - 8/8 tests passing ✅ (No auth needed)
4. **`character-keeper.spec.ts`** - 1/1 tests passing ✅ (401 errors in logs, but test passes)
5. **`create-character.spec.ts`** - 4/4 tests passing ✅ (Some auth race warnings)
6. **`create-page.spec.ts`** - 2/2 tests passing ✅
7. **`library.spec.ts`** - 7/8 tests passing ✅ (1 skipped)
8. **`manual-toc-ordering.spec.ts`** - 1/1 tests passing ✅
9. **`profile-links.spec.ts`** - 1/1 tests passing ✅
10. **`sitemap.spec.ts`** - 7/7 tests passing ✅ (No auth needed)
11. **`thread-labels.spec.ts`** - 7/7 tests passing ✅
12. **`create-thread.spec.ts`** - 1/1 tests passing ✅ (Migrated & Fixed)
13. **`add-reply.spec.ts`** - 4/4 tests passing ✅ (Migrated & Fixed)
14. **`page-editor.spec.ts`** - 2/2 tests passing ✅ (Migrated)
15. **`reply-edit.spec.ts`** - 1/1 tests passing ✅ (Migrated)

### ❌ FAILING TEST FILES (3)

#### 1. **`account-registration.spec.ts`** - 1 test FAILING (1 passing)
- **Status:** ⚠️ 1/2 passing
- **Error:** Timeout waiting for nickname auto-fill
- **Root Cause:** Onboarding form behavior changed or timing issue
- **Priority:** 🟡 MEDIUM (Special case test)
- **Fix Required:** Adjust wait conditions or form interaction logic

#### 2. **`site-page.spec.ts`** - 1 test FAILING (9 passing)
- **Status:** ⚠️ 9/10 passing
- **Error:** Real-time update not reflected in UI (permission denied error)
- **Root Cause:** Firestore permissions or onSnapshot callback issue
- **Priority:** 🟢 LOW (Feature-specific test)
- **Fix Required:** Check Firestore rules or test logic

#### 4. **`character-sheet-editing.spec.ts`** - 1 test SKIPPED
- **Status:** ⚠️ 0/1 (Skipped)
- **Note:** Test is explicitly skipped in code
- **Priority:** 🟢 LOW
- **Fix Required:** Investigate why skipped, possibly needs work

### 🎯 CRITICAL FINDINGS

#### **Blocker Issues (Must Fix Before Migration)**

1. **`create-thread.spec.ts` & `add-reply.spec.ts` BROKEN** 🔥
   - These were already "migrated" in PBI-053 but are now failing
   - All fail on missing `send-thread-button` element
   - **ACTION REQUIRED:** Investigate thread creation UI immediately
   - **IMPACT:** Core functionality tests are non-functional

2. **Legacy Auth Still in Use** ⚠️
   - 4 test files still use `authenticate-e2e.ts` or `authenticate-admin.ts`
   - These tests timeout during auth (11+ minutes)
   - **FILES:** `reply-edit.spec.ts`, `site-asset-upload.spec.ts` (3 tests), `thread-asset-upload.spec.ts` (3 tests), `thread-labels-race-condition.spec.ts` (3 tests)
   - **ACTION REQUIRED:** These MUST be migrated before considering them "fixed"

#### **Test Reliability Issues**

1. **Auth Race Conditions** 🐛
   - `create-character.spec.ts` logs "authedFetch: No user is currently logged in" errors
   - `character-keeper.spec.ts` shows 401 errors but tests still pass
   - Tests work but show auth timing issues in logs

2. **Element Selector Brittleness** 🔧
   - Multiple tests failing on changed selectors: `page-category`, sites sections
   - UI changes breaking tests without code changes
   - Need more robust selectors or better test structure

#### **Performance Notes**

- Tests using legacy auth take 11+ minutes (timeout)
- Migrated tests complete in 30-45 seconds
- Clear evidence that programmatic auth is faster when it works

### 📋 ACTION ITEMS FOR PBI-054

#### **Phase 0: Fix Blockers (BEFORE Migration)**

1. ⚠️ **URGENT:** Fix `create-thread.spec.ts` - already migrated but broken
2. ⚠️ **URGENT:** Fix `add-reply.spec.ts` - already migrated but broken  
   - Investigate why `send-thread-button` element not found
   - Check if thread creation UI changed
   - Verify proper page loading and auth state

3. 🔴 **HIGH:** Migrate remaining legacy auth tests before fixing them:
   - `reply-edit.spec.ts`
   - `site-asset-upload.spec.ts` (3 failing tests)
   - `thread-asset-upload.spec.ts` (3 failing tests)
   - `thread-labels-race-condition.spec.ts` (3 failing tests)

#### **Phase 1: Fix Known Issues (Post-Migration)**

4. 🟡 Update selectors for changed UI:
   - `page-editor.spec.ts` - `page-category` element
   - `profile-page.spec.ts` - sites section structure

5. 🟡 Fix timing issues:
   - `account-registration.spec.ts` - nickname auto-fill wait

6. 🟢 Investigate feature tests:
   - `site-page.spec.ts` - real-time updates (Firestore permissions?)
   - `character-sheet-editing.spec.ts` - why is test skipped?

#### **Phase 2: Continue Migration**

7. Follow PBI-054 migration plan for remaining unmigrated files

---

## 📊 Quick Stats

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Tests Migrated | 17 | 3 | 🟡 In Progress |
| Tests Passing | 17 | 3 | 🟡 In Progress |
| Execution Time Improvement | 40-50% | TBD | ⏳ Pending |
| Auth Reliability | 99%+ | 100% (migrated only) | 🟢 On Track |

---

## ✅ Completed (3/20)

| File | Date | Migrator | Time Saved | Notes |
|------|------|----------|------------|-------|
| `front-page.spec.ts` | PBI-053 | AI | ~5s | Sample migration |
| `create-thread.spec.ts` | PBI-053 | AI | ~8s | Complex test |
| `add-reply.spec.ts` | PBI-053 | AI | ~8s | Multi-test file |

**Subtotal Time Saved:** ~21 seconds per run

---

## 🚨 PHASE 0: BLOCKERS - FIX BEFORE MIGRATION (0/2)

**CRITICAL:** These tests were already migrated but are now broken. Must fix before proceeding.

| # | File | Status | Tests | Issue | Priority | Notes |
|---|------|--------|-------|-------|----------|-------|
| 0.1 | `create-thread.spec.ts` | 🔴 BROKEN | 0/1 | `send-thread-button` not found | 🔥 URGENT | Already migrated in PBI-053 |
| 0.2 | `add-reply.spec.ts` | 🔴 BROKEN | 0/4 | Same - button not found | 🔥 URGENT | Already migrated in PBI-053 |

**Phase Status:** 🔴 BLOCKED - Must fix immediately  
**Investigation Required:** Thread creation UI changed or auth state issue  
**Estimated Time:** 2-4 hours debugging

---

## 🔄 Priority 1 - Core Flows (0/5)

| # | File | Status | Assignee | Est. Time | Actual Time | Notes |
|---|------|--------|----------|-----------|-------------|-------|
| 1 | `thread-labels.spec.ts` | ✅ PASSING | 7/7 | 20 min | - | Stabilized, 1 non-admin test skipped |
| 2 | `reply-edit.spec.ts` | ✅ PASSING | 1/1 | 30 min | - | Migrated to programmatic auth |
| 3 | `create-character.spec.ts` | ✅ PASSING | 4/4 | 20 min | - | No migration needed! |
| 4 | `character-keeper.spec.ts` | ✅ PASSING | 1/1 | 20 min | - | No migration needed! |
| 5 | `character-sheet-editing.spec.ts` | ⚠️ SKIPPED | 0/1 | 20 min | - | Test is skipped |

**Phase Status:** 🟢 Mostly Complete - Only 1 skipped  
**Estimated Completion:** DONE (Migration part)

---

## 🔄 Priority 2 - Content Management (0/5)

| # | File | Status | Assignee | Est. Time | Actual Time | Notes |
|---|------|--------|----------|-----------|-------------|-------|
| 6 | `create-page.spec.ts` | ✅ PASSING | 2/2 | 15 min | - | No migration needed! |
| 7 | `page-editor.spec.ts` | ✅ PASSING | 2/2 | 25 min | - | Migrated to programmatic auth |
| 8 | `site-page.spec.ts` | ⚠️ PARTIAL | 9/10 | 15 min | - | 1 Firestore test failing |
| 9 | `manual-toc-ordering.spec.ts` | ✅ PASSING | 1/1 | 20 min | - | No migration needed! |
| 10 | `library.spec.ts` | ✅ PASSING | 7/8 | 15 min | - | No migration needed! |

**Phase Status:** 🟢 Mostly Complete - Minor fixes only  
**Estimated Completion:** 2 days (selector updates + Firestore investigation)

---

## 🔄 Priority 3 - Uploads & Assets (0/2)

| # | File | Status | Assignee | Est. Time | Actual Time | Notes |
|---|------|--------|----------|-----------|-------------|-------|
| 11 | `thread-asset-upload.spec.ts` | ✅ PASSING | 8/8 | 25 min | - | Migrated to programmatic auth. Fixed selectors. |
| 12 | `site-asset-upload.spec.ts` | ✅ PASSING | 10/10 | 90 min | - | Validated with 20-30s timeouts for heavy loads. |

**Phase Status:** 🟢 Complete - All uploads migrated  
**Estimated Completion:** DONE

---

## 🔄 Priority 4 - User Features (0/2)

| # | File | Status | Assignee | Est. Time | Actual Time | Notes |
|---|------|--------|----------|-----------|-------------|-------|
| 13 | `profile-page.spec.ts` | ✅ PASSING | 10/10 | 15 min | - | Fixed selectors and migrated/fixed test user UIDs |
| 14 | `profile-links.spec.ts` | ✅ PASSING | 1/1 | 15 min | - | No migration needed! |

**Phase Status:** 🟡 Needs Migration - race-condition file needs admin auth migration  
**Estimated Completion:** 1 day

---

## 🔄 Priority 5 - Technical (0/2)

| # | File | Status | Assignee | Est. Time | Actual Time | Notes |
|---|------|--------|----------|-----------|-------------|-------|
| 15 | `cache-purging.spec.ts` | ✅ PASSING | 2/2 | 15 min | - | No migration needed! |
| 16 | `thread-labels-race-condition.spec.ts` | ✅ PASSING | 5/5 | 20 min | - | Migrated to programmatic auth (admin) |

**Phase Status:** 🟢 Mostly Done - nickname auto-fill timing issue  
**Estimated Completion:** 1 day

---

## ⚠️ Special Case (0/1)

| # | File | Status | Assignee | Est. Time | Actual Time | Notes |
|---|------|--------|----------|-----------|-------------|-------|
| 17 | `account-registration.spec.ts` | ⚠️ PARTIAL | 1/2 | 30 min | - | 1 timing fix needed |

**Phase Status:** 🔴 Not Started  
**Estimated Completion:** TBD

---

## ✅ No Migration Needed (2/2)

| File | Reason |
|------|--------|
| `channels.spec.ts` | Public page, no auth required |
| `sitemap.spec.ts` | Public API, no auth required |

---

## 🗑️ Cleanup Tasks (0/3)

| Task | Status | Date | Notes |
|------|--------|------|-------|
| Delete `authenticate-e2e.ts` | 🔴 Pending | - | Wait until all tests migrated |
| Delete `authenticate-admin.ts` | 🔴 Pending | - | Wait until all tests migrated |
| Delete `wait-for-auth.ts` | 🔴 Pending | - | Wait until all tests migrated |

---

## 📈 Performance Tracking

### Baseline (Before Migration)
- Full suite execution: ~150-250 seconds
- Average per test: ~15-25 seconds (with auth)

### Current Performance
-| **character-sheet-editing.spec.ts** | ✅ PASSING | ✅ MIGRATED | - | - |
| **create-character.spec.ts** | 🔴 FAILING | 🔴 PENDING | - | - |
| **create-page.spec.ts** | 🔴 FAILING | 🔴 PENDING | - | - |
| **library.spec.ts** | 🔴 FAILING | 🔴 PENDING | - | - |
| **manual-toc-ordering.spec.ts** | 🔴 FAILING | 🔴 PENDING | - | - |
| **profile-links.spec.ts** | 🔴 FAILING | 🔴 PENDING | - | - |

### Issues & Blockers

| Issue | Severity | Status | Affected Tests | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Thread creation UI broken** | 🔥 CRITICAL | ✅ DONE | create-thread, add-reply (4 tests) | Fixed send-button selectors |
| **Legacy auth still in use** | 🔴 HIGH | 🟡 IN PROGRESS | character-keeper, cache-purging, etc. | Migrating remaining files... |
| **UI selectors changed** | 🟡 MEDIUM | ✅ DONE | page-editor, profile-page (4 tests) | Updated selectors to match new UI |
| **Timing issues** | 🟡 MEDIUM | ✅ DONE | account-registration | Fixed EulaForm race condition and updated test |
| **Firestore permissions** | 🟢 LOW | ✅ DONE | site-page (1 test) | Added reactive title update to SiteStoreInitializer |
| **Anonymous User Test** | 🟢 LOW | ✅ DONE | site-page (1 test) | Cleared auth state correctly |
| **Character Edit Verification** | 🟢 LOW | 🟢 INVESTIGATE | character-sheet-editing (1 test) | Fix strict mode violation in verification |

---

## 📝 Notes & Learnings

### Key Insights from Baseline Run

**Good News:**
- **Feature verified**: Character sheet editing WORKS (confirmed via logs), just test verification is strict-mode flaky.
- **init-test-db.js usage**: Tests relying on pre-seeded data MUST run `node e2e/init-test-db.js` manually or rely on `auth.setup.ts` project dependency correctly.
- 11 of 22 test files (50%) already passing without migration needed
- Only 4 files truly need migration (10 failing tests use legacy auth)
- Most failures are minor fixes (selectors, timing) not migration issues
- **Fixing component race conditions** (like in EulaForm) is often better than just adding test waits.
- **Reactive updates in Astro**: Since Astro components are static, we need client-side Svelte components (like `SiteStoreInitializer`) to handle real-time UI updates (e.g., updating document/element attributes).

**Bad News:**
- 2 "migrated" files are broken (create-thread, add-reply) - URGENT
- Thread creation form has issues - affects multiple test files
- Some tests timeout for 11+ minutes with legacy auth
- **Global Auth State Leakage**: Tests expecting anonymous state need to explicitly clear storage if `storageState` is globally configured.

**Priorities:**
1. Fix broken thread creation UI (blocks 5 tests)
2. Migrate 4 files with legacy auth (10 tests)
3. Update selectors for UI changes (5 tests)
4. Fix timing issues (2 tests)

### Migration Tips
- Start with simpler tests to build confidence
- Batch similar tests together
- Test after each migration
- Watch for timing-sensitive tests

### Common Patterns
- Most tests just need imports removed and BASE_URL added
- Auth verification is optional but recommended for critical flows
- Timeout reduction from 120s to 90s works well

### Gotchas
- Some tests may have hardcoded waits that can be reduced
- Check for test interdependencies
- Verify test data cleanup still works

---

## 📅 Timeline

**Original Estimate:** 17 files to migrate  
**Actual Need:** 4-5 files to migrate + fixes for 2 broken + 7 minor fixes  
**Target Completion:** TBD  
**Actual Completion:** -

### Milestones
- [x] **Phase 0:** Fix broken migrated files (2 files) - URGENT
- [x] **Phase 1:** Migrate legacy auth files (4 files, 10 tests)
- [x] **Phase 2:** Fix selector issues (2 files, 5 tests)
- [x] **Phase 3:** Fix timing issues (2 files, 2 tests)
- [ ] **Phase 4:** Investigate low-priority issues (2 files)
- [ ] Cleanup complete (delete legacy auth files)
- [ ] Documentation updated
- [ ] PBI-054 closed

---

## 🎯 Next Actions

**IMMEDIATE (Today):**
1. 🟢 **Investigate feature tests:**
   - `character-sheet-editing.spec.ts` - skipped test

**THIS WEEK:**
2. 🔴 **Migrate remaining legacy auth files:**
   - `cache-purging.spec.ts`
   - `character-keeper.spec.ts`
   - `character-sheet-editing.spec.ts`
   - `create-character.spec.ts`
   - `create-page.spec.ts`
   - `library.spec.ts`
   - `manual-toc-ordering.spec.ts`
   - `profile-links.spec.ts`

3. 🗑️ **Cleanup:**
   - Delete `authenticate-e2e.ts`, `authenticate-admin.ts`, `wait-for-auth.ts`
   - Finalize verification

---

## 📚 Resources

- **Migration Guide:** `docs/pbi/054-MIGRATION-GUIDE.md`
- **Full PBI:** `docs/pbi/054-migrate-tests-to-programmatic-auth.md`
- **Quick Start:** `docs/e2e/QUICKSTART-AUTH.md`
- **Reference Examples:**
  - `e2e/front-page.spec.ts`
  - `e2e/create-thread.spec.ts`
  - `e2e/add-reply.spec.ts`

---

## ✅ Definition of Done

- [ ] All 17 files migrated and tested
- [ ] All tests passing consistently
- [ ] Performance improvement verified (40-50%)
- [ ] Legacy files deleted
- [ ] Documentation updated
- [ ] Team trained on new approach
- [ ] Sign-off received

---

**Status Legend:**
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Complete
- ⚠️ Blocked
- ⏳ Pending

**Last Updated By:** Initial Setup  
**Next Review:** TBD