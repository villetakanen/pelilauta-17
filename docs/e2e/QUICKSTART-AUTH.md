# Quick Start: Programmatic Authentication

## TL;DR

Tests are **already authenticated** by default. Just write your tests normally:

```typescript
import { expect, test } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:4321";

test("my test", async ({ page }) => {
  // User is already logged in - no authentication code needed!
  await page.goto(`${BASE_URL}/create/thread`);
  
  // Optional: Verify authentication
  await expect(page.getByTestId("setting-navigation-button")).toBeVisible();
  
  // Your test logic here...
});
```

## What Changed?

### Before (UI Authentication)
```typescript
import { authenticate } from './authenticate-e2e';

test('my test', async ({ page }) => {
  await authenticate(page);  // ❌ REMOVE THIS
  // ...
});
```

### After (Programmatic Authentication)
```typescript
test('my test', async ({ page }) => {
  // ✅ Already authenticated!
  // ...
});
```

## How It Works

1. **Global Setup** runs once before all tests
2. Authenticates with Firebase REST API (no UI!)
3. Saves auth state to `playwright/.auth/user.json`
4. All tests automatically load this auth state

**Result:** ~5-10 seconds saved per test file!

## Special Cases

### Need Unauthenticated State?

```typescript
import { clearAuth } from "./programmatic-auth";

test("registration flow", async ({ page }) => {
  await clearAuth(page);
  // Now test registration...
});
```

### Need Different User?

```typescript
import { authenticateAsNewUser, authenticateAsAdmin } from "./programmatic-auth";

test("onboarding", async ({ page }) => {
  await authenticateAsNewUser(page);
  // Test with new user...
});

test("admin feature", async ({ page }) => {
  await authenticateAsAdmin(page);
  // Test admin features...
});
```

## Default User

Tests use this account by default:

- **Email:** sator@iki.fi
- **Password:** test-test-test
- **Permissions:** Admin
- **Profile:** Fully set up

## Troubleshooting

### "User not authenticated" errors?

1. Check storage state exists:
   ```bash
   ls -la playwright/.auth/user.json
   ```

2. Re-run global setup:
   ```bash
   npx playwright test --project=setup
   ```

3. Check Firebase config in `src/firebase/client/index.ts`

### Tests still slow?

Remove old authentication imports:
```bash
grep -r "authenticate-e2e" e2e/*.spec.ts
```

## Performance

| Metric | Before | After |
|--------|--------|-------|
| Single test | 15-25s | 8-12s |
| Full suite | 150-250s | 80-120s |

**40-50% faster!** 🚀

## More Info

- Full docs: `docs/e2e/README-PROGRAMMATIC-AUTH.md`
- Implementation: `docs/pbi/053-implementation-summary.md`
- PBI: `docs/pbi/053-programmatic-auth-playwright.md`

## Questions?

1. **Do I need to call authenticate()?** NO! Already done.
2. **What if I need a different user?** Use `programmatic-auth.ts` utilities.
3. **Can I still use UI login?** Yes, but it's slower and deprecated.
4. **Will this work in CI?** Yes! Same speed improvements.
5. **Do I need .env.development?** YES! Required for Firebase configuration.

## Migration Checklist

When updating an old test:

- [ ] Remove `import { authenticate } from './authenticate-e2e'`
- [ ] Remove `await authenticate(page)` calls
- [ ] Remove `waitForAuthState()` calls
- [ ] Update `BASE_URL` to use env variable
- [ ] Reduce timeout from 120s to 90s
- [ ] Test it works!

---

**🎉 That's it! Your tests are now faster and more reliable.**