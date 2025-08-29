**Title:** Move Thread Creation to Server-Side API

**As a** user, **I want to** create new threads with instant feedback and improved reliability, **so that** I don't experience delays or potential failures from client-side permission issues and complex transaction logic.

---

### Description

Currently, thread creation is handled entirely client-side through the `addThread` function in `src/firebase/client/threads/addThread.ts`. This approach has several drawbacks:

1. **Security and Permission Issues:** Client-side operations like increasing channel thread counts can fail due to permission constraints
2. **Complex Transaction Logic:** Multiple related operations (thread creation, reactions initialization, channel updates, tag management) are performed sequentially on the client
3. **Performance Issues:** Users experience 2-3 second delays while all operations complete
4. **Error Handling:** If any step fails, the entire operation may be left in an inconsistent state

#### Current Client-Side Flow:

1. Create thread document in Firestore
2. Upload attached files to Firebase Storage
3. Update thread with uploaded image URLs
4. ~~Increase channel thread count~~ (currently commented out due to permission issues)
5. Create reactions document for the thread
6. Update thread tags
7. Mark thread as seen for the creator

#### Proposed Server-Side Solution:

Move thread creation to a new API endpoint (`POST /api/threads/create`) following the same pattern established by the `add-reply` endpoint. This will provide:

- **Improved Security:** Server-side operations with proper admin permissions
- **Better Performance:** Immediate response with background processing
- **Consistent Error Handling:** Proper transaction management and rollback capabilities
- **Enhanced Reliability:** Eventual consistency for non-critical operations

### Proposed Workflow:

1. **Client-side:** Form submission calls `POST /api/threads/create` with `multipart/form-data` containing:
   - Thread metadata (title, description, channel, tags, etc.)
   - Attached files

2. **Server-side Critical Tasks (Synchronous):**
   - Authenticate the request using `tokenToUid`
   - **Verify user account status (check if account is frozen/suspended)**
   - Validate required fields and permissions
   - Upload attached files to Firebase Storage
   - **Create the thread document in the `THREADS_COLLECTION`**

3. **Early Return:** Respond with **202 "Accepted"** HTTP status within **500 milliseconds**

4. **Server-side Background Tasks (Asynchronous):**
   - Initialize reactions document for the thread
   - Update channel thread count in `meta/threads` collection
   - Process and update thread tags
   - Send notifications if applicable
   - Update any search indexes or caches

### Implementation Details

#### Files to Modify/Create:

- **Create:** `src/pages/api/threads/create.ts` - New API endpoint
- **Modify:** Thread creation components to use the new API instead of client-side `addThread`
- **Modify:** `src/firebase/client/threads/addThread.ts` - Mark as deprecated or remove
- **Update:** Form handling to send `multipart/form-data` to the API

#### API Endpoint Structure:

```typescript
// POST /api/threads/create
export async function POST({ request }: APIContext): Promise<Response> {
  // 1. Authentication
  const uid = await tokenToUid(request);
  
  // 2. Check account status (frozen/suspended)
  const userAccount = await getUserAccount(uid);
  if (userAccount?.frozen || userAccount?.suspended) {
    return new Response('Account suspended', { status: 403 });
  }
  
  // 3. Parse multipart form data
  const formData = await request.formData();
  
  // 4. Validate required fields and permissions
  
  // 5. CRITICAL: Upload files and create thread
  
  // 6. EARLY RETURN: 202 Accepted
  
  // 7. BACKGROUND: Execute non-critical tasks
}
```

#### Security Considerations:

- Use server-side Firebase Admin SDK for privileged operations
- **Verify user account status to prevent frozen/suspended accounts from posting**
- Validate user permissions for channel posting
- Sanitize and validate all input data
- Implement proper error handling and logging

### Acceptance Criteria

- [ ] Thread creation form submission receives **202 Accepted** response within **500 milliseconds**
- [ ] **Frozen or suspended accounts receive a 403 Forbidden response and cannot create threads**
- [ ] New thread document is created in `THREADS_COLLECTION_NAME` with correct structure
- [ ] Attached files are uploaded to Firebase Storage and linked to the thread
- [ ] Channel thread count is updated **eventually** in the `meta/threads` collection
- [ ] Reactions document is created for the new thread
- [ ] Thread tags are processed and updated in the system
- [ ] Thread creator is automatically marked as having "seen" the thread
- [ ] Client-side components handle the API response correctly
- [ ] Error responses include meaningful error messages
- [ ] Background task failures are logged but don't affect the initial response
- [ ] The original client-side `addThread` function is removed or deprecated

### Testing Requirements

- [ ] Unit tests for the new API endpoint
- [ ] **Tests for frozen/suspended account rejection (403 Forbidden)**
- [ ] Integration tests for file upload functionality
- [ ] E2E tests to ensure form submission works end-to-end
- [ ] Performance tests to verify the 500ms response time requirement
- [ ] Error handling tests for various failure scenarios
- [ ] Background task completion verification

### Migration Strategy

1. **Phase 1:** Implement the new API endpoint alongside existing client-side logic
2. **Phase 2:** Update thread creation forms to use the new API
3. **Phase 3:** Test thoroughly in development and staging environments
4. **Phase 4:** Deploy to production and monitor
5. **Phase 5:** Remove or deprecate the old client-side `addThread` function

### Benefits

- **Better User Experience:** Near-instant feedback on thread creation
- **Improved Reliability:** Server-side operations with proper permissions
- **Consistent Data:** Atomic operations prevent inconsistent states
- **Better Error Handling:** Proper transaction management and meaningful error messages
- **Security:** Privileged operations handled server-side
- **Performance:** Background processing doesn't block user interaction

### Priority

**High Priority** - This addresses critical user experience issues and technical debt around permission handling and transaction consistency.
