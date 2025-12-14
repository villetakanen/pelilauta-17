# PBI-054 Migration Quick Reference

## 🎯 Goal
Migrate 17 E2E tests from UI-based to programmatic authentication.

---

## ✅ Quick Migration Pattern

### Find & Replace (Per File)

**Step 1: Remove old imports**
```typescript
// REMOVE these lines:
import { authenticate } from './authenticate-e2e';
import { waitForAuthState } from './wait-for-auth';
```

**Step 2: Add BASE_URL constant**
```typescript
// ADD at top of file (after imports):
const BASE_URL = process.env.BASE_URL || "http://localhost:4321";
```

**Step 3: Update test timeout**
```typescript
// CHANGE from:
test.setTimeout(120000);

// TO:
test.setTimeout(90000);
```

**Step 4: Remove authentication calls**
```typescript
// REMOVE these lines from test body:
await authenticate(page);
await authenticate(page, true); // for new user
await waitForAuthState(page, 15000);
```

**Step 5: Update URLs**
```typescript
// CHANGE from:
await page.goto('http://localhost:4321/some-page');

// TO:
await page.goto(`${BASE_URL}/some-page`);
```

**Step 6: Add optional auth verification** (if test is auth-critical)
```typescript
// ADD after page.goto() if needed:
await expect(page.getByTestId("setting-navigation-button")).toBeVisible({
  timeout: 10000,
});
```

---

## 📋 Files to Migrate (17 Total)

### Priority 1 - Core Flows (5 files)
- [ ] `thread-labels.spec.ts`
- [ ] `reply-edit.spec.ts`
- [ ] `create-character.spec.ts`
- [ ] `character-keeper.spec.ts`
- [ ] `character-sheet-editing.spec.ts`

### Priority 2 - Content (5 files)
- [ ] `create-page.spec.ts`
- [ ] `page-editor.spec.ts`
- [ ] `site-page.spec.ts`
- [ ] `manual-toc-ordering.spec.ts`
- [ ] `library.spec.ts`

### Priority 3 - Uploads (2 files)
- [ ] `thread-asset-upload.spec.ts`
- [ ] `site-asset-upload.spec.ts`

### Priority 4 - User Features (2 files)
- [ ] `profile-page.spec.ts`
- [ ] `profile-links.spec.ts`

### Priority 5 - Technical (2 files)
- [ ] `cache-purging.spec.ts`
- [ ] `thread-labels-race-condition.spec.ts`

### Special Case (1 file)
- [ ] `account-registration.spec.ts` ⚠️ See special pattern below

---

## ⚠️ Special Case: Account Registration

```typescript
// ADD this import:
import { clearAuth, authenticateAsNewUser } from './programmatic-auth';

// IN TEST:
test('registration flow', async ({ page }) => {
  // Clear existing auth
  await clearAuth(page);
  
  // Authenticate as new user for onboarding
  await authenticateAsNewUser(page);
  
  // Continue with test...
});
```

---

## ✅ Per-File Checklist

After migrating each file:

1. [ ] Removed `authenticate-e2e` import
2. [ ] Removed `wait-for-auth` import
3. [ ] Added `BASE_URL` constant
4. [ ] Updated all URLs to use `${BASE_URL}`
5. [ ] Reduced timeout to 90000ms
6. [ ] Removed `authenticate()` calls
7. [ ] Removed `waitForAuthState()` calls
8. [ ] Added optional auth verification (if critical)
9. [ ] Tested file runs successfully
10. [ ] Verified performance improvement

---

## 🧪 Testing Each File

```bash
# Test individual file
pnpm exec playwright test e2e/[filename].spec.ts --reporter=list

# Should see:
# - No global setup errors ✅
# - Tests pass ✅
# - Faster execution ✅
```

---

## 📊 Before/After Example

### BEFORE
```typescript
import { expect, test } from '@playwright/test';
import { authenticate } from './authenticate-e2e';
import { waitForAuthState } from './wait-for-auth';

test.setTimeout(120000);

test('create a page', async ({ page }) => {
  await authenticate(page);
  await page.goto('http://localhost:4321/create/page');
  await waitForAuthState(page, 15000);
  
  // test logic...
});
```

### AFTER
```typescript
import { expect, test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || "http://localhost:4321";

test.setTimeout(90000);

test('create a page', async ({ page }) => {
  // User already authenticated!
  await page.goto(`${BASE_URL}/create/page`);
  
  // Optional verification
  await expect(page.getByTestId("setting-navigation-button")).toBeVisible({
    timeout: 10000,
  });
  
  // test logic...
});
```

**Time saved:** ~5-10 seconds per test! ⚡

---

## 🎯 Success Criteria

- [ ] All 17 files migrated
- [ ] All tests passing
- [ ] 40-50% faster execution
- [ ] No auth-related flakiness

---

## 📚 Full Documentation

- **Quick Start:** `docs/e2e/QUICKSTART-AUTH.md`
- **Full Guide:** `docs/e2e/README-PROGRAMMATIC-AUTH.md`
- **PBI Details:** `docs/pbi/054-migrate-tests-to-programmatic-auth.md`

---

## 🚀 Let's Go!

Start with Priority 1 files, then work through the list.
Each file takes ~15-20 minutes to migrate and test.

**Total estimated time:** 4-6 hours spread over 2-3 days.

---

**Happy migrating! 🎉**