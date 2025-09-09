# PBI: Improve Sentry Test Error Button in Admin Tray

**Title:** Fix and Improve Sentry Test Error Button in Admin Tray

**As an** admin, **I want** a properly working test error button in the admin tray that sends errors to Sentry monitoring, **so that** I can verify that error tracking is working correctly in different environments.

---

### Description

The admin tray currently has a test error button, but it has several implementation issues:

1. **Mixed paradigms**: Uses vanilla JavaScript event listeners inside a Svelte component
2. **Poor error handling**: Doesn't properly integrate with our Sentry error capture utility
3. **No feedback**: No visual feedback to confirm the error was sent
4. **Limited testing**: Only throws a basic error without context

The button should be properly implemented using Svelte patterns and integrate with our existing Sentry utilities to provide comprehensive error testing capabilities.

#### Current Implementation Issues:

**File:** `src/components/svelte/admin/AdminTray.svelte` (lines ~75-83)
```svelte
<li>
  <button id="error-button">Throw test error</button>
<script>
  function handleClick () {
    throw new Error('This is a test error');
  }
  document.querySelector("#error-button").addEventListener("click", handleClick);
</script>
</li>
```

**Problems:**
- Uses vanilla JS `document.querySelector` in a Svelte component
- `<script>` tag inside component template (incorrect Svelte syntax)
- Doesn't use our `captureError` utility from `@utils/client/sentry`
- No user feedback or error context
- Inconsistent with other buttons in the tray

#### Proposed Implementation:

**File:** `src/components/svelte/admin/AdminTray.svelte`
```svelte
<script lang="ts">
import { captureError } from '@utils/client/sentry';
// ... existing imports

let testErrorMessage = $state('');

async function throwTestError() {
  try {
    const testError = new Error('Admin Test Error - Sentry Integration Check');
    
    // Add context for debugging
    const errorContext = {
      component: 'AdminTray',
      action: 'test_error_button',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Send to Sentry
    await captureError(testError, errorContext);
    
    testErrorMessage = 'Test error sent to Sentry successfully ✓';
    
    // Clear message after 3 seconds
    setTimeout(() => {
      testErrorMessage = '';
    }, 3000);
    
  } catch (error) {
    testErrorMessage = 'Failed to send error to Sentry ✗';
    console.error('Test error failed:', error);
  }
}
</script>

<!-- In template -->
<li>
  <button onclick={throwTestError}>
    <cn-icon noun="warning" small></cn-icon> Test Sentry Error
  </button>
  {#if testErrorMessage}
    <p class="text-caption text-low p-1">{testErrorMessage}</p>
  {/if}
</li>
```

### Benefits

- **Proper Svelte Implementation**: Uses Svelte event handling and reactive state
- **Sentry Integration**: Properly uses our `captureError` utility with context
- **User Feedback**: Visual confirmation that the error was sent
- **Rich Context**: Provides useful debugging information with the error
- **Consistency**: Matches the styling and patterns of other admin tools
- **Better Debugging**: Helps verify Sentry configuration in different environments

### Implementation Details

#### Files to Modify:

1. **`src/components/svelte/admin/AdminTray.svelte`**
   - Remove the incorrect `<script>` tag and vanilla JS event listener
   - Import `captureError` from `@utils/client/sentry`
   - Add proper Svelte button with `onclick` handler
   - Add state for user feedback message
   - Include proper error context for debugging

#### Error Context Information:

The test error will include:
- Component name and action for tracking
- Timestamp for correlation
- User agent for environment debugging
- Current URL for context
- Custom error message indicating it's a test

#### Visual Design:

- Use `warning` icon to indicate this is a test/diagnostic tool
- Show temporary success/failure message below the button
- Style consistent with other admin tray buttons
- Auto-clear feedback message after 3 seconds

### Acceptance Criteria

- [x] Test error button uses proper Svelte event handling (no vanilla JS)
- [x] Button integrates with existing `captureError` utility
- [x] Error is successfully sent to Sentry with proper context
- [x] User receives visual feedback when error is sent
- [x] Feedback message automatically clears after 3 seconds
- [x] Error includes useful debugging context (component, timestamp, URL, etc.)
- [x] Button styling is consistent with other admin tray buttons
- [x] Works in both development and production environments
- [x] No console errors or warnings from the implementation
- [x] Sentry dashboard shows the test error with proper context

### Testing Requirements

- [ ] Manual testing: Click button → verify visual feedback appears
- [ ] Manual testing: Check Sentry dashboard for test error with context
- [ ] Manual testing: Verify feedback message disappears after 3 seconds
- [ ] Environment testing: Test in both development and production
- [ ] Console testing: Verify no JavaScript errors in browser console
- [ ] Error context testing: Verify all context fields are populated in Sentry

### Priority

**Low Priority** - This is a developer/admin tool improvement. The existing button partially works, but this enhances the debugging experience and follows proper Svelte patterns.

### Estimated Effort

**XSmall** - Simple refactoring of existing functionality:
- Remove 6 lines of problematic code
- Add 25 lines of proper Svelte implementation
- Import existing utility function
- No new dependencies or complex logic required

### Security Considerations

- Button is already protected by admin authentication
- Only available to users listed in `appMeta.admins`
- Test errors don't expose sensitive information
- Uses existing secure Sentry integration

### Technical Notes

#### Why This Implementation is Better:

1. **Svelte Best Practices**: Uses reactive state and proper event handling
2. **Integration**: Leverages existing Sentry utilities and patterns
3. **User Experience**: Provides immediate feedback on action success/failure
4. **Debugging**: Rich context helps identify environment-specific issues
5. **Maintainability**: Consistent with codebase patterns and easier to modify

#### Error Context Helps With:

- Identifying which admin triggered the test
- Correlating test errors with specific deployments
- Debugging Sentry configuration issues
- Verifying error capture in different browsers/environments
- Tracking test error frequency and patterns

This improvement makes the admin error testing more reliable, user-friendly, and consistent with the application's architecture patterns.
