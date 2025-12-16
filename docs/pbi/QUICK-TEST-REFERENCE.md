# Quick Test Reference Card - PBI 53 & 54

**Print this page or keep it visible while testing!**

---

## 🚨 Critical Tests (Must Pass)

### 1. Fast Login Navigation Test
```
1. Clear browser storage
2. Log in
3. IMMEDIATELY navigate to /create/thread
4. ✅ Should load WITHOUT errors
5. ✅ Console should be CLEAN (no "User not authenticated")
```

### 2. Thread Creation Test
```
1. Go to /create/thread
2. Fill: Title + Channel + Content
3. Click Send
4. ✅ Should redirect to thread page
5. ✅ Thread should be created
6. ✅ No console errors
```

### 3. EULA Acceptance Test
```
1. Use new user account
2. Navigate to /onboarding/eula
3. Enter nickname
4. Click Accept
5. ✅ Should redirect to home
6. ✅ Profile should be created
7. ✅ No auth errors in console
```

### 4. Character Edit Test
```
1. Open your character
2. Toggle Edit mode ON
3. Change a number stat (type new value)
4. ✅ Should update IMMEDIATELY (not on blur)
5. Save and reload
6. ✅ Value should persist
```

---

## 🎯 What to Watch For

### ❌ BAD (Report These!)
- ❌ Console: "User not authenticated"
- ❌ Console: "auth.currentUser is null"
- ❌ API calls fail with 401
- ❌ Buttons stuck disabled
- ❌ Race condition errors

### ✅ GOOD (Expected)
- ✅ Clean console (no errors)
- ✅ Fast, smooth auth
- ✅ All API calls succeed
- ✅ Buttons work correctly
- ✅ Immediate UI updates

---

## 📋 Quick Checklist

Core Functions:
- [ ] Login works
- [ ] Create thread works
- [ ] Edit character works
- [ ] EULA acceptance works
- [ ] Profile updates work

Race Condition Tests:
- [ ] Fast navigation after login
- [ ] Multiple API calls on load
- [ ] Cold start (clear cache + login)

Console Check:
- [ ] Zero auth errors
- [ ] Zero JavaScript errors
- [ ] Clean network tab (no 401s)

---

## 🔧 Test User Credentials

```
E2E User: test-e2e@example.com
Admin:    test-admin@example.com
(Passwords in .env file)
```

---

## 🌐 Test URLs

```
Thread Creation:  /create/thread
EULA Page:        /onboarding/eula
Profile:          /profile/{userId}
Character:        /characters/{characterId}
Settings:         /settings/profile
```

---

## 🚀 5-Minute Smoke Test

```bash
1. Login                          [30s]
2. Navigate to /create/thread     [10s]
3. Create a thread                [60s]
4. Edit a character               [60s]
5. Check console for errors       [30s]
6. Check network tab for 401s     [30s]

Total: ~4 minutes

✅ All pass? → Good to merge!
❌ Any fail? → Run full test guide
```

---

## 🐛 If You Find a Bug

Document:
1. **Exact steps** to reproduce
2. **Browser** & version
3. **Console errors** (copy full text)
4. **Network tab** status codes
5. **Screenshot** if visual issue

Report to: [Team Channel/Issue Tracker]

---

## 📊 Success Criteria

- [ ] All critical tests pass
- [ ] Zero console errors
- [ ] Zero network 401 errors
- [ ] No race conditions
- [ ] Performance OK (no slowdowns)

---

## 🔄 Changed Files Reference

**High Impact:**
- `ThreadEditorForm.svelte` → Thread creation
- `EulaForm.svelte` → User onboarding
- `apiClient.ts` → All API calls
- `createThreadApi.ts` → Thread API

**Medium Impact:**
- `CharacterHeader.svelte` → Edit toggle
- `NumberStat.svelte` → Stat editing
- `SiteStoreInitializer.svelte` → Site pages

**Low Impact (formatting only):**
- `ProfileThreads.astro`
- `ProfileTool.svelte`
- `SessionPurge.svelte`

---

## 🎯 Performance Targets

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| E2E Suite | 150-250s | 80-120s | 40-50% ↓ |
| Auth Reliability | 85-90% | 99%+ | 99%+ |
| User Impact | N/A | N/A | None |

---

**Keep console open while testing!**  
**Report any "User not authenticated" errors immediately!**

---

**Version:** 1.0  
**PBIs:** 053, 054  
**Status:** Ready for Testing