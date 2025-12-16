# Manual Test Guide: PBI-53 & PBI-54

**Date:** 2024  
**PBIs:** 
- PBI-053: Optimize Playwright E2E Suite with Programmatic Firebase Authentication
- PBI-054: Migrate E2E Tests to Programmatic Authentication

**Purpose:** This guide covers manual testing for all non-test components that were modified as part of the authentication improvements and race condition fixes.

---

## Overview of Changes

### Critical Changes
1. **Firebase Auth Race Condition Fix** - Added `await auth.authStateReady()` to prevent race conditions
2. **Thread Editor Form** - Improved authentication state handling
3. **EULA Form** - Fixed auth checks and validation
4. **Character Components** - Fixed reactivity and event handling
5. **Profile Components** - Minor code quality improvements

---

## Test Environment Setup

### Prerequisites
- [ ] Application running locally: `pnpm run dev`
- [ ] Firebase Emulator running (if using): `pnpm run firebase:emulators`
- [ ] Test user account credentials available
- [ ] Clear browser cache and localStorage before testing

### Test User Accounts
- **E2E Test User:** `test-e2e@example.com` / (password from env)
- **Admin User:** `test-admin@example.com` / (password from env)

---

## Test Cases

## 1. Thread Creation Flow (ThreadEditorForm.svelte)

### Test 1.1: Create New Thread - Happy Path
**Location:** `/create/thread`

**Steps:**
1. Log in to the application
2. Navigate to `/create/thread`
3. Verify the thread editor loads
4. Fill in the thread form:
   - **Title:** "Test Thread Manual Test"
   - **Channel:** Select any channel from dropdown
   - **Content:** Type some markdown content with tags like `#testtag #manual`
5. Verify:
   - [ ] Send button is DISABLED until content is entered
   - [ ] Send button becomes ENABLED after making changes
   - [ ] Tags are extracted and displayed below the editor
6. Click the Send button
7. Verify:
   - [ ] Button shows loading spinner during save
   - [ ] You are redirected to the thread view page
   - [ ] Thread is created successfully
   - [ ] All content is displayed correctly

**Expected Result:** Thread created successfully with no authentication errors.

---

### Test 1.2: Thread Editor - Authentication State Check
**Location:** `/create/thread`

**Steps:**
1. Open browser DevTools → Console
2. Navigate to `/create/thread` while NOT logged in
3. Verify:
   - [ ] You are redirected to login page
   - [ ] URL contains redirect parameter
4. Log in
5. Verify:
   - [ ] You are redirected back to `/create/thread`
6. Fill in thread details
7. Verify:
   - [ ] Send button is DISABLED if `authUser` is not ready
   - [ ] Send button becomes ENABLED once auth is ready AND form is changed
8. Monitor console for errors (should be none)

**Expected Result:** No "User not authenticated" errors in console. Form properly waits for Firebase auth to initialize.

---

### Test 1.3: Thread Editor - File Upload
**Location:** `/create/thread`

**Steps:**
1. Log in and navigate to `/create/thread`
2. Fill in Title and select Channel
3. Click "Add Files" button
4. Select one or more image files
5. Verify:
   - [ ] File previews appear in lightbox
   - [ ] Form marked as changed
   - [ ] Send button becomes enabled
6. Add some content text
7. Click Send
8. Wait for redirect to thread page
9. Verify:
   - [ ] Images are uploaded successfully
   - [ ] Images display in the thread

**Expected Result:** File uploads work correctly with new auth flow.

---

### Test 1.4: Thread Editor - Channel Selection
**Location:** `/create/thread?channel=general`

**Steps:**
1. Log in
2. Navigate to `/create/thread?channel=general`
3. Verify:
   - [ ] Channel dropdown pre-selects "general" (or appropriate channel)
4. Change channel to different value
5. Verify:
   - [ ] Form marked as changed
   - [ ] Send button becomes enabled
6. Fill in title and content
7. Submit thread
8. Verify thread is created in the selected channel

**Expected Result:** Channel parameter works correctly, form state updates properly.

---

## 2. EULA Acceptance Flow (EulaForm.svelte)

### Test 2.1: New User EULA Acceptance
**Location:** `/onboarding/eula`

**Steps:**
1. Create a brand new user account (or use account that hasn't accepted EULA)
2. Log in with new account
3. Verify you're redirected to `/onboarding/eula`
4. Try clicking "Accept" button
5. Verify:
   - [ ] Button is DISABLED (no nickname entered yet)
6. Enter a nickname (e.g., "TestUser123")
7. Wait for nickname availability check
8. Verify:
   - [ ] Nickname validation runs
   - [ ] Accept button becomes ENABLED when valid nickname entered AND `authUser` is ready
9. Click "Accept" button
10. Verify:
    - [ ] Button shows loading state
    - [ ] You are redirected to home page after ~1 second
    - [ ] Profile is created successfully
    - [ ] No console errors about authentication

**Expected Result:** EULA acceptance works smoothly, button properly waits for both valid input AND auth state.

---

### Test 2.2: EULA - Decline Flow
**Location:** `/onboarding/eula`

**Steps:**
1. Create new account or clear EULA acceptance
2. Navigate to EULA page
3. Enter a nickname
4. Click "Decline" button
5. Verify:
   - [ ] User is logged out
   - [ ] Redirected to home page
   - [ ] No longer authenticated
   - [ ] No errors in console

**Expected Result:** Declining EULA logs user out cleanly.

---

### Test 2.3: EULA - Avatar Display
**Location:** `/onboarding/eula`

**Steps:**
1. Use account with Google/social login (has photoURL)
2. Navigate to `/onboarding/eula`
3. Verify:
   - [ ] User avatar displays if available
   - [ ] Avatar URL comes from Firebase Auth `photoURL`
4. Complete EULA acceptance

**Expected Result:** Avatar displays correctly from Firebase Auth user object.

---

## 3. Character Management (CharacterApp Components)

### Test 3.1: Character Header - Edit Mode Toggle
**Location:** `/characters/{characterId}`

**Steps:**
1. Log in as character owner
2. Navigate to a character you own
3. Verify:
   - [ ] Edit toggle button is visible
   - [ ] Settings (tools) button is visible
4. Click the Edit toggle button
5. Verify:
   - [ ] Button toggles to "pressed" state
   - [ ] Character sheet enters edit mode
   - [ ] Form fields become editable
6. Click Edit toggle again
7. Verify:
   - [ ] Button toggles back to unpressed
   - [ ] Character sheet exits edit mode
   - [ ] Fields become read-only

**Expected Result:** Edit mode toggle works correctly for character owners.

---

### Test 3.2: Character Header - Non-Owner View
**Location:** `/characters/{characterId}`

**Steps:**
1. Log in as user who does NOT own the character
2. Navigate to someone else's character
3. Verify:
   - [ ] Edit toggle button is NOT visible
   - [ ] Settings button is still visible (for viewers)
   - [ ] Character is in read-only mode
4. Verify you cannot edit any fields

**Expected Result:** Non-owners cannot edit characters.

---

### Test 3.3: Number Stat Editing
**Location:** `/characters/{characterId}` (edit mode)

**Steps:**
1. Log in as character owner
2. Navigate to your character
3. Enable edit mode
4. Find a number stat field (e.g., "Strength", "HP", etc.)
5. Change the value (e.g., type "15")
6. **Immediately** (without clicking away):
   - [ ] Value updates in real-time
   - [ ] Store updates immediately (was changed from `onchange` to `oninput`)
7. Tab to next field
8. Navigate away from character
9. Return to character
10. Verify:
    - [ ] Changed value is persisted
    - [ ] Value displays correctly

**Expected Result:** Number stats update immediately on input (not just on blur/change).

---

### Test 3.4: Number Stat - Read-only Mode
**Location:** `/characters/{characterId}`

**Steps:**
1. Log in as character owner
2. Navigate to character
3. Keep edit mode OFF (read-only)
4. Try to modify number stat fields
5. Verify:
   - [ ] Fields are read-only
   - [ ] Cannot type in fields
6. Log in as different user (non-owner)
7. Navigate to character
8. Verify:
   - [ ] Fields remain read-only
   - [ ] No edit toggle available

**Expected Result:** Number stats are properly read-only when not in edit mode.

---

## 4. Profile Components

### Test 4.1: Profile Threads Display
**Location:** `/profile/{userId}`

**Steps:**
1. Log in
2. Navigate to your profile page
3. Scroll to "Threads" section
4. Verify:
   - [ ] Section title displays correctly
   - [ ] Your threads are listed (if you have any)
   - [ ] Each thread card shows:
     - Thread title
     - Channel icon
     - Thread metadata
5. If you have no threads:
   - [ ] Empty state message displays
6. Click on a thread card
7. Verify:
   - [ ] Navigates to thread detail page

**Expected Result:** Profile threads section displays correctly (code formatting fix only).

---

### Test 4.2: Profile Tool - Update Bio and Links
**Location:** `/settings/profile`

**Steps:**
1. Log in
2. Navigate to settings/profile
3. Update bio text
4. Add/modify profile links
5. Upload avatar image (if feature available)
6. Click Save
7. Verify:
   - [ ] Save completes successfully
   - [ ] No TypeScript errors in console
   - [ ] Changes are persisted
8. Navigate away and return
9. Verify changes are still present

**Expected Result:** Profile updates work correctly (type safety improvement only).

---

## 5. Session Management & Debugging

### Test 5.1: Session Purge Tool
**Location:** `/debug` or wherever SessionPurge component is used

**Steps:**
1. Log in to application
2. Open browser DevTools → Console
3. Navigate to debug page with SessionPurge component
4. Click "Purge Session" button
5. Monitor console output
6. Verify:
   - [ ] Cookies are deleted
   - [ ] localStorage is cleared
   - [ ] sessionStorage is cleared
   - [ ] IndexedDB databases are deleted
   - [ ] No biome lint warnings about `document.cookie` (suppressed with comments)
   - [ ] Process completes without errors
7. Verify:
   - [ ] User is logged out
   - [ ] Page state is reset

**Expected Result:** Session purge works correctly with proper linting suppressions.

---

## 6. Site Store Initialization

### Test 6.1: Site Page Load
**Location:** `/sites/{siteSlug}`

**Steps:**
1. Navigate to any site page
2. Open browser DevTools → Console
3. Look for "SiteStoreInitializer" debug messages
4. Verify:
   - [ ] "Seeding site store with SSR data" message appears once
   - [ ] Site store is initialized correctly
5. Navigate to another page on same site
6. Return to site page
7. Verify:
   - [ ] Store does not re-seed unnecessarily (check console)
   - [ ] "Store already seeded" message appears if appropriate

**Expected Result:** Site store initializes correctly on first load, doesn't re-initialize on navigation.

---

## 7. API Client Race Condition Testing

### Test 7.1: Fast Navigation After Login
**Location:** Various authenticated pages

**Steps:**
1. Clear browser cache and localStorage
2. Navigate to login page
3. Log in
4. **IMMEDIATELY** (within 1 second) navigate to `/create/thread`
5. Monitor browser DevTools → Console
6. Verify:
   - [ ] NO "User not authenticated" errors appear
   - [ ] Page loads successfully
   - [ ] API calls work correctly
7. Fill in thread form
8. Submit thread
9. Verify:
   - [ ] Thread is created successfully
   - [ ] NO authentication errors occur

**Expected Result:** Fast navigation after login does not cause authentication errors (race condition fixed).

---

### Test 7.2: Create Thread API - Auth Ready Check
**Location:** `/create/thread`

**Steps:**
1. Open browser DevTools → Console
2. Clear all storage and reload
3. Log in
4. Navigate to `/create/thread`
5. Fill in thread form
6. Monitor console during submission
7. Verify:
   - [ ] NO "User not authenticated" errors
   - [ ] API call waits for `auth.authStateReady()`
   - [ ] Thread creation succeeds
8. Check Network tab:
   - [ ] API request includes valid Authorization header
   - [ ] Request succeeds with 200/201 status

**Expected Result:** Thread creation API properly waits for auth state before making requests.

---

### Test 7.3: Authed Fetch - Multiple Rapid Calls
**Location:** Any page making multiple API calls

**Steps:**
1. Navigate to page that makes multiple authenticated API calls (e.g., dashboard)
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Monitor console for authentication errors
4. Verify:
   - [ ] All API calls succeed
   - [ ] NO "User not authenticated" errors
   - [ ] All requests have Authorization headers
5. Repeat test 3 times to ensure consistency

**Expected Result:** Multiple API calls on page load all succeed without race conditions.

---

## 8. Edge Cases & Error Scenarios

### Test 8.1: Thread Creation - Network Failure
**Location:** `/create/thread`

**Steps:**
1. Log in and navigate to `/create/thread`
2. Open DevTools → Network tab
3. Enable "Offline" mode
4. Fill in thread form
5. Click Send
6. Verify:
   - [ ] Error is handled gracefully
   - [ ] User sees appropriate error message
   - [ ] Form doesn't crash
7. Re-enable network
8. Try submitting again
9. Verify:
   - [ ] Submission succeeds

**Expected Result:** Network errors are handled gracefully.

---

### Test 8.2: EULA - Duplicate Nickname
**Location:** `/onboarding/eula`

**Steps:**
1. Navigate to EULA page with new account
2. Enter a nickname that already exists (e.g., "admin")
3. Wait for validation
4. Verify:
   - [ ] Nickname validation fails
   - [ ] Accept button remains DISABLED
   - [ ] User sees error/warning message
5. Change to unique nickname
6. Verify:
   - [ ] Validation passes
   - [ ] Accept button becomes ENABLED

**Expected Result:** Duplicate nickname detection works correctly.

---

### Test 8.3: Character Edit - Concurrent Sessions
**Location:** `/characters/{characterId}`

**Steps:**
1. Open character in two browser tabs/windows
2. Enable edit mode in both
3. Make different changes in each window
4. Save in first window
5. Save in second window
6. Verify:
   - [ ] Conflicts are handled appropriately
   - [ ] Data integrity is maintained
   - [ ] No crashes occur

**Expected Result:** Concurrent edits are handled (last write wins, or conflict resolution as designed).

---

## 9. Browser Compatibility Testing

### Test 9.1: Chrome/Chromium
Run all above tests in Chrome/Chromium browser.
- [ ] All tests pass
- [ ] No console errors

### Test 9.2: Firefox
Run critical path tests (Thread Creation, EULA, Character Edit) in Firefox.
- [ ] All tests pass
- [ ] No console errors

### Test 9.3: Safari
Run critical path tests in Safari (Mac only).
- [ ] All tests pass
- [ ] No console errors

---

## 10. Performance Verification

### Test 10.1: Cold Start Performance
**Steps:**
1. Clear all browser data
2. Navigate to home page
3. Log in
4. Measure time to:
   - [ ] Login complete
   - [ ] First authenticated page load
   - [ ] First API call success
5. Verify:
   - [ ] Auth initialization happens quickly
   - [ ] No noticeable delays from `authStateReady()` calls

**Expected Result:** New auth checks don't significantly impact user experience.

---

## Regression Testing Checklist

Run these quick smoke tests to ensure nothing else broke:

### Core Functionality
- [ ] User can log in
- [ ] User can log out
- [ ] User can create a thread
- [ ] User can reply to a thread
- [ ] User can create a character
- [ ] User can edit a character
- [ ] User can view their profile
- [ ] User can update their profile
- [ ] User can create a site page
- [ ] User can edit a site page

### Navigation
- [ ] Home page loads
- [ ] Thread list loads
- [ ] Character list loads
- [ ] Profile pages load
- [ ] Site pages load
- [ ] Navigation between pages works
- [ ] Back button works

### Authentication
- [ ] Login flow works
- [ ] Logout flow works
- [ ] Protected pages redirect to login
- [ ] Session persists across page reloads
- [ ] Session expires appropriately

---

## Test Results Template

**Tester:** ___________________  
**Date:** ___________________  
**Environment:** Production / Staging / Local  
**Browser:** ___________________  

| Test Case | Pass | Fail | Notes |
|-----------|------|------|-------|
| 1.1 Thread Creation Happy Path | ☐ | ☐ | |
| 1.2 Thread Auth State Check | ☐ | ☐ | |
| 1.3 Thread File Upload | ☐ | ☐ | |
| 1.4 Thread Channel Selection | ☐ | ☐ | |
| 2.1 EULA Acceptance | ☐ | ☐ | |
| 2.2 EULA Decline | ☐ | ☐ | |
| 2.3 EULA Avatar | ☐ | ☐ | |
| 3.1 Character Edit Toggle | ☐ | ☐ | |
| 3.2 Character Non-Owner | ☐ | ☐ | |
| 3.3 Number Stat Editing | ☐ | ☐ | |
| 3.4 Number Stat Read-only | ☐ | ☐ | |
| 4.1 Profile Threads | ☐ | ☐ | |
| 4.2 Profile Tool | ☐ | ☐ | |
| 5.1 Session Purge | ☐ | ☐ | |
| 6.1 Site Page Load | ☐ | ☐ | |
| 7.1 Fast Navigation | ☐ | ☐ | |
| 7.2 Create Thread API | ☐ | ☐ | |
| 7.3 Multiple Rapid Calls | ☐ | ☐ | |
| 8.1 Network Failure | ☐ | ☐ | |
| 8.2 Duplicate Nickname | ☐ | ☐ | |
| 8.3 Concurrent Sessions | ☐ | ☐ | |

**Overall Result:** PASS / FAIL  
**Critical Issues Found:** ___________________  
**Sign-off:** ___________________  

---

## Known Issues & Limitations

_Document any known issues or limitations discovered during testing_

---

## Notes for Testers

1. **Race Condition Testing:** The primary fix in these PBIs addresses authentication race conditions. Pay special attention to:
   - Fast navigation after login
   - Multiple API calls on page load
   - Cold start scenarios

2. **Console Monitoring:** Keep browser DevTools console open during testing. The absence of errors is as important as functionality working.

3. **Timing Matters:** Some tests require specific timing (e.g., "IMMEDIATELY after login"). Use a stopwatch or count seconds to ensure proper testing.

4. **Documentation:** If you find issues, document:
   - Exact steps to reproduce
   - Browser and version
   - Console error messages
   - Network tab information
   - Screenshots if applicable

5. **Test Coverage:** Most changes are internal improvements. External behavior should be identical, but more reliable.

---

## Success Criteria

- [ ] All manual tests pass
- [ ] No authentication race condition errors in console
- [ ] No regression in existing functionality
- [ ] Performance is acceptable (no noticeable slowdowns)
- [ ] All critical user flows work smoothly
- [ ] No JavaScript errors in browser console
- [ ] E2E tests pass (verify separately)

---

## Sign-off

**Developer:** ___________________  
**Date:** ___________________  

**QA Lead:** ___________________  
**Date:** ___________________  

**Product Owner:** ___________________  
**Date:** ___________________  

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Related PBIs:** PBI-053, PBI-054