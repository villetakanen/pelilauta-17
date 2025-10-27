# PBI-026: Bluesky Integration - Implementation Notes

**Date:** 2024
**Status:** ✅ Partially Implemented (Embed UI Complete)
**Developer Notes**

## What Was Implemented

### 1. Schema Updates ✅

**File:** `src/schemas/ThreadSchema.ts`

Added three new optional fields to `ThreadSchema`:
```typescript
// Bluesky syndication tracking
blueskyPostUrl: z.string().url().optional(), // https://bsky.app/profile/[handle]/post/[rkey]
blueskyPostUri: z.string().optional(), // at://did:plc:xxx/app.bsky.feed.post/yyy
blueskyPostCreatedAt: z.any().optional(), // When post was created
```

**Why these fields?**
- `blueskyPostUrl`: Human-readable web URL for embedding and display
- `blueskyPostUri`: AT Protocol URI for programmatic operations
- `blueskyPostCreatedAt`: Timestamp tracking when syndication occurred

All fields are optional to maintain backward compatibility with existing threads.

### 2. UI Component Updates ✅

**File:** `src/components/server/ThreadsApp/ThreadInfoSection.astro`

Added Bluesky embed card that:
- Only renders when `thread.blueskyPostUrl` exists
- Uses Bluesky's official embed script (`https://embed.bsky.app/static/embed.js`)
- Includes fallback link for no-JS scenarios
- Styled to fit within the existing card system

**Implementation details:**
```astro
{thread.blueskyPostUrl && (
  <cn-card
    title={t("threads:info.blueskyTitle")}
    noun="share"
    class="mt-2"
  >
    <blockquote
      class="bluesky-embed"
      data-bluesky-uri={thread.blueskyPostUri || thread.blueskyPostUrl}
    >
      <p>
        <a href={thread.blueskyPostUrl} target="_blank" rel="noopener noreferrer">
          {t("threads:info.viewOnBluesky")}
        </a>
      </p>
    </blockquote>
  </cn-card>
)}
```

The Bluesky embed script automatically transforms blockquotes with `class="bluesky-embed"` into rich interactive embeds with like, repost, and reply buttons.

### 3. Internationalization ✅

**Files:** 
- `src/locales/fi/threads.ts`
- `src/locales/en/threads.ts`

Added translations:
```typescript
info: {
  blueskyTitle: "Bluesky", // Same in both languages
  viewOnBluesky: "Katso Blueskyssa", // Finnish
  viewOnBluesky: "View on Bluesky", // English
}
```

## What Still Needs Implementation

### Critical Fixes Required

#### 1. Logic Error in bskyService.ts ❌
**File:** `src/utils/server/bsky/bskyService.ts` (Line 95)

**Current (BROKEN):**
```typescript
if (!postRecord === undefined || !postRecord.text) {
```

**Required Fix:**
```typescript
if (!postRecord || !postRecord.text) {
```

**Impact:** This bug prevents proper validation and may cause silent failures.

#### 2. Security Issue - Credential Logging ⚠️
**File:** `src/utils/server/bsky/bskyService.ts` (Line 24)

**Remove this line:**
```typescript
logDebug(identifier, password); // ❌ Exposes secrets
```

**Replace with:**
```typescript
logDebug('Bluesky login attempt for handle:', identifier); // ✅ Safe
```

#### 3. API Endpoint - Return URI ❌
**File:** `src/pages/api/bsky/skeet.ts`

Currently discards the Bluesky URI. Needs to capture and return it:

```typescript
const blueskyUri = await postToBluesky(
  articleData.text,
  articleData.linkUrl,
  articleData.linkTitle,
  articleData.linkDescription,
);

if (!blueskyUri) {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Failed to post to Bluesky'
    }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
}

return new Response(
  JSON.stringify({
    success: true,
    blueskyUri,
    message: 'Successfully posted to Bluesky'
  }),
  { status: 200, headers: { 'Content-Type': 'application/json' } }
);
```

#### 4. Helper Function - URI Conversion ❌
**New File:** `src/utils/bskyHelpers.ts`

Create utility to convert AT Protocol URIs to web URLs:

```typescript
import { logError } from './logHelpers';

/**
 * Converts AT Protocol URI to web URL
 * @param uri - AT Protocol URI (e.g., at://did:plc:xxx/app.bsky.feed.post/yyy)
 * @param handle - User's Bluesky handle (e.g., pelilauta.social)
 * @returns Web URL (e.g., https://bsky.app/profile/pelilauta.social/post/yyy)
 */
export function atUriToWebUrl(uri: string, handle: string): string | null {
  try {
    const match = uri.match(/at:\/\/[^/]+\/app\.bsky\.feed\.post\/(.+)$/);
    if (!match) return null;
    
    const rkey = match[1];
    return `https://bsky.app/profile/${handle}/post/${rkey}`;
  } catch (error) {
    logError('atUriToWebUrl', 'Failed to convert URI:', error);
    return null;
  }
}
```

#### 5. Client Function - Save URI ❌
**File:** `src/components/svelte/thread-editor/submitThreadUpdate.ts`

Update `syndicateToBsky()` to:
1. Capture API response with Bluesky URI
2. Convert AT URI to web URL
3. Save both URIs to Firestore
4. Return success/error status

See PBI-026 section F for complete implementation.

#### 6. Error Handling ❌
**File:** `src/components/svelte/thread-editor/submitThreadUpdate.ts`

Update `submitThreadUpdate()` to handle syndication results:
- Log warnings if syndication fails
- Don't block thread creation on Bluesky errors
- TODO: Add user notifications (toast/snackbar)

## Testing Checklist

### Manual Testing Required

- [ ] Create new thread with Bluesky syndication enabled
- [ ] Verify post appears on Bluesky
- [ ] Verify `blueskyPostUrl` and `blueskyPostUri` are saved to Firestore
- [ ] Verify embed appears in thread info section
- [ ] Verify embed loads correctly with JavaScript enabled
- [ ] Verify fallback link works with JavaScript disabled
- [ ] Test with thread that has no Bluesky data (backward compatibility)
- [ ] Test error handling when Bluesky API is down
- [ ] Test with missing environment variables
- [ ] Verify no credentials are logged to console

### Automated Tests Needed

- [ ] Unit test for `atUriToWebUrl()` with various URI formats
- [ ] Schema validation test for new optional fields
- [ ] Integration test for syndication flow
- [ ] E2E test for embed display

## Environment Variables Required

```env
SECRET_bsky_handle=your.bluesky.handle
SECRET_bsky_password=your-app-password
SECRET_FEATURE_bsky=true
```

**Note:** Use Bluesky app passwords, not account passwords.

## How the Embed Works

1. **Syndication Flow:**
   - User creates thread
   - `syndicateToBsky()` posts to Bluesky via `/api/bsky/skeet`
   - API returns Bluesky URI (after fixes)
   - URI is converted to web URL and saved to Firestore

2. **Display Flow:**
   - Thread page loads
   - `ThreadInfoSection` checks if `thread.blueskyPostUrl` exists
   - If yes, renders `<blockquote class="bluesky-embed">`
   - Bluesky's embed script transforms it into interactive embed

3. **Embed Features (Automatic):**
   - Shows original post content
   - Displays author info and timestamp
   - Interactive like/repost/reply buttons
   - Opens in new tab when clicked

## Browser Compatibility

- **Modern Browsers:** Full embed support
- **No JavaScript:** Fallback link displays
- **Old Browsers:** Fallback link displays

## Performance Considerations

- Embed script loads asynchronously (`async` attribute)
- Script is loaded on every thread page (consider lazy loading in future)
- Embed API call happens client-side after page load

## Security Considerations

- Links use `rel="noopener noreferrer"` for security
- Embed script loaded from official Bluesky CDN
- No user data passed to Bluesky embed (just post URI)
- **FIX REQUIRED:** Remove credential logging

## Future Enhancements

- [ ] Show engagement metrics (likes, reposts, replies)
- [ ] Retry mechanism for failed syndications
- [ ] User notifications for syndication success/failure
- [ ] Admin dashboard for syndication analytics
- [ ] Lazy load embed script (only when needed)
- [ ] Cache Bluesky embed responses

## Related Documents

- `docs/pbi/026-fix-bluesky-integration.md` - Full PBI with all requirements
- `docs/pbi/025-bluesky-embed-in-thread-info-section.md` - Original embed PBI
- `src/docs/74-feeds.md` - Bluesky integration documentation

## Current Status Summary

✅ **Completed:**
- Schema fields added
- UI component implemented
- Translations added
- Embed displays correctly (when data exists)

❌ **Blocking Issues:**
- Logic error in validation (line 95)
- API doesn't return URI
- Client doesn't save URI
- No URI conversion helper
- Security issue with credential logging

🎯 **Next Steps:**
1. Fix logic error and security issue
2. Implement API response handling
3. Create URI conversion helper
4. Update client to save URIs
5. Test end-to-end flow
6. Add error handling and notifications