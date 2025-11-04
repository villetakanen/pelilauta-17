# PBI-041 Implementation Checklist

## Pre-Implementation

- [x] Team review of PBI-041 document completed
- [x] Acceptance criteria agreed upon
- [x] i18n translations reviewed (English and Finnish)

---

## Phase 1: Schema and Helpers (2 hours) ✅ COMPLETED

### Schema Changes
- [x] Update `src/schemas/ThreadSchema.ts`
  - [x] Add `labels: z.array(z.string()).optional()` field
  - [x] Verify build passes
  - [x] Verify existing threads still parse correctly

### Helper Functions
- [x] Create `src/utils/shared/threadTagHelpers.ts`
  - [x] Implement `getAllThreadTags(thread)` function
  - [x] Implement `isLabel(thread, tag)` function (renamed from `isAdminTag`)
  - [x] Implement `normalizeTag(tag)` function
  - [x] Add JSDoc comments for all functions
  - [x] Export all functions

### Unit Tests
- [x] Create `test/utils/threadTagHelpers.test.ts`
  - [x] Test `getAllThreadTags()` with no tags
  - [x] Test `getAllThreadTags()` with only user tags
  - [x] Test `getAllThreadTags()` with only labels
  - [x] Test `getAllThreadTags()` with both tag types
  - [x] Test `getAllThreadTags()` deduplication
  - [x] Test `isLabel()` returns false when no labels
  - [x] Test `isLabel()` returns true for labels
  - [x] Test `isLabel()` returns false for user tags
  - [x] Test `normalizeTag()` lowercases
  - [x] Test `normalizeTag()` trims whitespace
  - [x] All tests pass (24 tests total)

### Documentation
- [x] Create `src/docs/76-01-entry-labels-and-tags.md` with comprehensive documentation

### Verification
- [x] Run `npm run build` - success
- [x] Run `npm run test` - all tests pass (321 tests total)
- [x] No TypeScript errors
- [x] Commit Phase 1 changes

---

## Phase 2: API Endpoints (3-4 hours) ✅ COMPLETED

### Admin Labels API Endpoint
- [x] Create `src/pages/api/threads/[threadKey]/labels.ts`
  - [x] Import required modules (serverDB, isAdmin, schemas, etc.)
  - [x] Use `tokenToUid()` and `isAdmin()` for auth (no wrapper function)
  - [x] Implement `POST` handler for adding labels
    - [x] Verify admin authentication using `tokenToUid()` and `isAdmin()`
    - [x] Parse and validate request body
    - [x] Normalize labels using `normalizeTag()`
    - [x] Get existing thread
    - [x] Add labels to labels array (deduplicate)
    - [x] Update thread document
    - [x] Update tag index with combined tags using `getAllThreadTags()`
    - [x] Purge cache in background task
    - [x] Return success response with updated labels
  - [x] Implement `DELETE` handler for removing labels
    - [x] Verify admin authentication using `tokenToUid()` and `isAdmin()`
    - [x] Parse and validate request body
    - [x] Normalize labels using `normalizeTag()`
    - [x] Get existing thread
    - [x] Remove labels from labels array
    - [x] Update thread document
    - [x] Update tag index with combined tags using `getAllThreadTags()`
    - [x] Purge cache in background task (or remove from index if no tags left)
    - [x] Return success response
  - [x] Add error handling for all operations
  - [x] Add logging with `logDebug`, `logError`, `logWarn`

### Update Thread Endpoint
- [x] Modify `src/pages/api/threads/[threadKey].ts`
  - [x] Import `getAllThreadTags` from helper
  - [x] Verify `labels` is NOT in `allowedFields` array (with comment explaining why)
  - [x] Update tag index logic to use `getAllThreadTags()` in background tasks
  - [x] Ensure labels persist through user updates

### API Unit Tests
- [ ] ~~API unit tests deferred in favor of E2E tests (per user request)~~

### Verification
- [ ] Test POST endpoint manually (after UI implemented)
- [ ] Test DELETE endpoint manually (after UI implemented)
- [ ] Verify tag index updated correctly
- [ ] Verify cache purging works
- [x] Run `npm run build` - success
- [x] Run `npm run test` - all tests pass
- [x] Commit Phase 2 changes

---

## Phase 3: UI Components (3-4 hours)

### Label Manager Component
- [ ] Create `src/components/svelte/threads/LabelManager.svelte`
  - [ ] Add TypeScript script with Props interface
  - [ ] Import required utilities (authedFetch, logDebug, etc.)
  - [ ] Create reactive state variables
    - [ ] `newLabel = $state('')`
    - [ ] `updating = $state(false)`
  - [ ] Create derived values
    - [ ] `allTags = $derived(getAllThreadTags(thread))`
    - [ ] `labels = $derived(thread.labels || [])`
  - [ ] Implement `addLabel()` function
    - [ ] Validate input
    - [ ] Check for duplicates
    - [ ] Call POST API
    - [ ] Update local thread object
    - [ ] Show success/error notification
    - [ ] Clear input on success
  - [ ] Implement `removeLabel(tag)` function
    - [ ] Call DELETE API
    - [ ] Update local thread object
    - [ ] Show success/error notification
  - [ ] Implement `handleKeyPress()` for Enter key
  - [ ] Create template with:
    - [ ] Title/heading
    - [ ] Input field for new label
    - [ ] Add button
    - [ ] Tag/label list display
    - [ ] Visual distinction for labels vs tags
    - [ ] Remove button for labels only
    - [ ] Legend explaining difference
  - [ ] **Use Cyan DS classes - NO component-level `<style>` tags**
    - [ ] Use `.cn-tag` for base styling
    - [ ] Use `.elevated .accent` for label styling
    - [ ] Use spacing atomics (`.p-1`, `.mt-2`, `.gap-1`, etc.)
    - [ ] Use layout utilities (`.flex`, `.wrap`, `.items-center`)
    - [ ] Use typography classes (`.text-caption`, `.downscaled`)
    - [ ] Inline styles only for design tokens (e.g., `border: 1px solid var(--color-accent)`)

### Update ThreadAdminActions
- [ ] Modify `src/components/svelte/threads/ThreadAdminActions.svelte`
  - [ ] Import `LabelManager` component
  - [ ] Add `<LabelManager {thread} />` in accordion
  - [ ] Verify placement and layout

### Update Thread Info Display
- [ ] Modify `src/components/server/ThreadsApp/ThreadInfoSection.astro`
  - [ ] Import `getAllThreadTags` and `isLabel`
  - [ ] Use `getAllThreadTags(thread)` instead of `thread.tags`
  - [ ] Add conditional class for labels (`.elevated .accent`)
  - [ ] Add inline style for accent border on labels
  - [ ] **NO component-level styles** - use Cyan DS classes only

### i18n Translations
- [ ] Update `src/locales/en/admin.ts`
  - [ ] Add `thread_tags.title`
  - [ ] Add `thread_tags.add_placeholder`
  - [ ] Add `thread_tags.admin_tag`
  - [ ] Add `thread_tags.user_tag`
  - [ ] Add `thread_tags.no_tags`
  - [ ] Add `thread_tags.already_exists`
  - [ ] Add `thread_tags.added`
  - [ ] Add `thread_tags.add_failed`
  - [ ] Add `thread_tags.removed`
  - [ ] Add `thread_tags.remove_failed`

- [ ] Update `src/locales/fi/admin.ts`
  - [ ] Add all Finnish translations (same keys as English)

### E2E Tests
- [ ] Create `e2e/admin-thread-tags.spec.ts`
  - [ ] Test: Admin can add tag to thread
  - [ ] Test: Admin can remove tag from thread
  - [ ] Test: Admin tags persist when user edits thread
  - [ ] Test: Admin tags visually distinct from user tags
  - [ ] Test: Non-admin cannot see admin tools
  - [ ] All tests pass

### Verification
- [ ] Run dev server and test UI manually
- [ ] Add admin tag via UI - verify it appears
- [ ] Remove admin tag via UI - verify it disappears
- [ ] Edit thread as owner - verify labels persist
- [ ] Check visual styling (admin vs user tags)
- [ ] Test on mobile/tablet viewport
- [ ] Test keyboard navigation
- [ ] Test with screen reader (basic check)
- [ ] Run `npm run build` - success
- [ ] Run E2E tests - all pass
- [ ] Commit Phase 3 changes

---

## Phase 4: Testing and Refinement (2 hours)

### Full Test Suite
- [ ] Run all unit tests: `npm run test`
- [ ] Run all E2E tests: `npm run test:e2e`
- [ ] Check code coverage (aim for >80% on new code)
- [ ] Fix any failing tests

### Manual Testing Checklist

#### Admin Tag Addition
- [ ] Can add single admin tag
- [ ] Can add multiple labels
- [ ] Tags are normalized (lowercase, trimmed)
- [ ] Cannot add duplicate tags
- [ ] Success notification appears
- [ ] Tag appears immediately in UI
- [ ] Tag persists after page reload

#### Admin Tag Removal
- [ ] Can remove labels via X button
- [ ] Removing admin tag doesn't affect user tags
- [ ] Success notification appears
- [ ] Tag disappears immediately from UI
- [ ] Removal persists after page reload

#### Persistence Through User Edits
- [ ] Admin adds tag to user's thread
- [ ] User edits thread content (add/remove hashtags)
- [ ] Admin tag remains unchanged
- [ ] Both tag types appear in tag index
- [ ] Thread appears on both tag pages

#### Tag Display
- [ ] Admin tags visually distinct (accent color/border)
- [ ] User tags use standard styling
- [ ] Legend shows difference between tag types
- [ ] Tags are clickable links to tag pages
- [ ] Layout looks good on desktop
- [ ] Layout looks good on mobile

#### Tag Index Updates
- [ ] Thread appears on admin tag pages
- [ ] Thread appears on user tag pages
- [ ] Removing all tags removes from tag index
- [ ] Cache purged after tag changes (verify with curl)

#### Authorization
- [ ] Non-admin users cannot see admin tools
- [ ] API rejects non-admin tag modifications (403)
- [ ] API rejects unauthenticated requests (401)

#### Edge Cases
- [ ] Thread with only labels - works
- [ ] Thread with only user tags - works
- [ ] Thread with overlapping tags - deduplicates
- [ ] Empty tag string - handled gracefully
- [ ] Very long tag names - handled (UI doesn't break)
- [ ] Special characters in tags - normalized correctly

### Performance Testing
- [ ] Tag operations complete in < 2 seconds
- [ ] No performance regression on thread listing
- [ ] No performance regression on thread page load
- [ ] No N+1 queries in Firestore
- [ ] Cache purging completes successfully

### Bug Fixes and Refinements
- [ ] Document any bugs found
- [ ] Fix all critical bugs
- [ ] Fix all high-priority bugs
- [ ] Consider deferring low-priority issues to future PBI
- [ ] Update tests to cover bug scenarios

### Code Quality
- [ ] Run Biome linter: `npm run lint`
- [ ] Fix all linting errors
- [ ] Fix all linting warnings (or document why they're ok)
- [ ] Code review checklist:
  - [ ] No console.log statements
  - [ ] Proper error handling
  - [ ] Meaningful variable names
  - [ ] JSDoc comments on public functions
  - [ ] No hardcoded strings (use i18n)
  - [ ] No magic numbers
  - [ ] Consistent code style
  - [ ] **No component-level `<style>` tags** - Cyan DS classes only
  - [ ] Inline styles only for design tokens (CSS variables)

### Documentation
- [ ] Update inline code comments
- [ ] Update JSDoc where needed
- [ ] Verify PBI-041 document is accurate
- [ ] Update quick reference if needed
- [ ] Add any lessons learned to PBI notes

### Final Verification
- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Build succeeds without warnings
- [ ] Ready for deployment

---

## Deployment

### Pre-Deployment
- [ ] Create pull request
- [ ] Code review completed
- [ ] All CI checks pass
- [ ] Staging deployment tested
- [ ] Team approval obtained

### Deployment Steps
- [ ] Merge to main branch
- [ ] Monitor Netlify build
- [ ] Verify deployment success
- [ ] Test on production environment
  - [ ] Add admin tag to real thread
  - [ ] Verify it appears on tag page
  - [ ] Edit thread as owner
  - [ ] Verify admin tag persists

### Post-Deployment Monitoring (First 24 hours)
- [ ] Monitor error logs in Sentry
- [ ] Check Firestore write counts (ensure no spikes)
- [ ] Monitor API response times
- [ ] Check cache purge success rate in Netlify logs
- [ ] Verify no increase in 500 errors
- [ ] Gather feedback from admin users

### Success Metrics (After 2 weeks)
- [ ] At least 5 threads have labels
- [ ] Zero labels lost during user edits
- [ ] < 0.5% error rate on admin tag operations
- [ ] No performance degradation
- [ ] Positive admin user feedback

---

## Rollback Plan (If Needed)

### Trigger Conditions
Rollback if:
- Critical bug causing data loss
- Performance degradation > 20%
- Error rate > 5% on tag operations
- Security vulnerability discovered

### Rollback Steps

#### UI Rollback (5 minutes)
- [ ] Revert UI component commits
- [ ] Deploy to Netlify
- [ ] Verify admin tools hidden
- [ ] API still works but no UI to use it

#### API Rollback (15 minutes)
- [ ] Revert API endpoint commits
- [ ] Revert thread update endpoint changes
- [ ] Deploy to Netlify
- [ ] Verify regular thread updates work
- [ ] AdminTags in database remain but unused

#### Full Rollback (30 minutes)
- [ ] Revert all PBI-041 commits
- [ ] Deploy to Netlify
- [ ] Verify everything back to normal
- [ ] No data loss (labels field ignored)

### Post-Rollback
- [ ] Document reason for rollback
- [ ] Create bug ticket for issues
- [ ] Plan fix and re-deployment
- [ ] Communicate with team

---

## Post-Implementation

### Documentation Updates
- [ ] Update release notes
- [ ] Update admin user documentation
- [ ] Add feature to changelog
- [ ] Update API documentation if public

### Team Communication
- [ ] Notify team of successful deployment
- [ ] Share quick reference card
- [ ] Demo feature to admin users
- [ ] Gather feedback

### Future Enhancements (Consider for future PBIs)
- [ ] Tag templates for common categories
- [ ] Bulk tag operations
- [ ] Tag suggestions based on content
- [ ] Tag analytics/trending
- [ ] Fine-grained tag permissions
- [ ] Tag audit log
- [ ] Tag aliases/synonyms
- [ ] Tag categories

---

## Sign-Off

- [ ] Developer sign-off: _______________
- [ ] Code reviewer sign-off: _______________
- [ ] QA sign-off: _______________
- [ ] Product owner sign-off: _______________
- [ ] Deployment date: _______________

---

## Notes

Use this space for implementation notes, issues encountered, or lessons learned:
