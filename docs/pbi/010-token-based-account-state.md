# PBI: Implement CDN-Friendly User Registration & EULA Flow

**User Story:** As a developer, I want to implement a secure, server-verified user onboarding flow (EULA acceptance & profile creation) that does not interfere with the CDN caching of static pages for anonymous and fully registered users, following our project's technical guidelines.

### **Description & Context**

Our current user registration is handled entirely by client-side components, which is complex and doesn't leverage our SSR capabilities. We are moving to a new model that prioritizes CDN performance for our mostly-static site while progressively enhancing the experience for authenticated users.

The core architectural principle is **"Static First, Dynamic Later."** The initial HTML of any page must be static and identical for all users to be aggressively cached by the CDN. All personalization and authentication logic will be initiated by a client-side component after the static page loads.

This flow will be orchestrated using **Firebase Custom Claims** as a fast, database-free way to check a user's onboarding status.

**The High-Level User Journey:**

1. A new user signs up using the Firebase client-side SDK.
    
2. A Cloud Function triggers, setting initial custom claims on the user: `{ eula_accepted: false, account_created: false }`.
    
3. The user lands on a page. The static HTML is served instantly from the CDN.
    
4. A client-side Svelte component (`AuthManager.svelte`) runs. It checks the user's local Firebase auth state and its custom claims.
    
5. **Onboarding Path:** The claims are `false`. The component makes a single, secure `GET` request to a server endpoint (`/api/auth/status`) to confirm the user's status. Based on the server's response, the client redirects the user to the appropriate onboarding page.
    
6. **Happy Path:** The claims are `true`. The component does nothing further. **No API call is made.** The user experience is instantaneous.
    
7. The user completes the onboarding forms, which `POST`s to a server API that updates Firestore and, crucially, updates the user's custom claims to `true`.
    

### **Acceptance Criteria**

**1. Firebase Backend: Set Initial Custom Claims**

- [ ] Create a Firebase Cloud Function using Node.js.
    
- [ ] The function must be triggered by `functions.auth.user().onCreate`.
    
- [ ] Upon user creation, the function must set the following custom claims for the new user:
    
    ```
    { "eula_accepted": false, "account_created": false }
    ```
    

**2. Server API: Create an Auth Status Endpoint**

- [ ] Create a server-side API endpoint in Astro at `src/pages/api/auth/status.ts`.
    
- [ ] It must handle `GET` requests and use the project's server-side Firebase helpers (e.g., from `@firebase/server`).
    
- [ ] It must verify the `session` cookie.
    
- [ ] **If no valid session cookie exists,** it must return a JSON response: `{ "loggedIn": false }`.
    
- [ ] **If a valid session cookie exists,** it must decode the token and return a JSON response with the user's status derived from their custom claims:
    
    ```
    { "loggedIn": true, "uid": "...", "email": "...", "eula_accepted": true, "account_created": true }
    ```
    
- [ ] The API route's containing middleware should set `Cache-Control: private, no-store` headers to prevent CDN caching of the response.
    

**3. Client-Side Orchestrator: `AuthManager.svelte` Component**

- [ ] Create a Svelte component at `@svelte/app/AuthManager.svelte`. It must be placed in a main layout file to run on all pages.
    
- [ ] The component must use Svelte Runes mode and **must not** contain an inline `<style>` tag.
    
- [ ] It must use the Firebase client SDK's `onAuthStateChanged` to listen for auth state. **All Firebase client-side modules must be imported dynamically** (e.g., `const { auth } = await import('@firebase/client');`).
    
- [ ] It should update a **nanostore** (e.g., create a new `@stores/auth` store) to reflect the user's status.
    
- [ ] **If the user is logged out,** update the nanostore to reflect the anonymous state.
    
- [ ] **If the user is logged in:**
    
    - [ ] It must immediately get the user's ID token result (`user.getIdTokenResult()`) to inspect the claims from the local cache.
        
    - [ ] **Happy Path:** If `claims.eula_accepted` and `claims.account_created` are both `true`, update the nanostore to the authenticated state and **make no further network requests.**
        
    - [ ] **Onboarding Path:** If either claim is `false`, it must then `fetch` the `/api/auth/status` endpoint to get server-verified instructions.
        
    - [ ] Based on the API response, it must perform a client-side redirect (`window.location.href`) to the correct onboarding page.
        

**4. Onboarding Pages and Completion Logic**

- [ ] Create simple, server-rendered Astro pages at `/onboarding/accept-eula` and `/onboarding/create-profile`.
    
- [ ] These pages **must** use the `ModalPage.astro` layout and include the `noSharing={true}` prop to prevent SEO indexing.
    
- [ ] The pages will contain a standard HTML `<form>` that `POST`s to a completion endpoint.
    
- [ ] Create a server API endpoint at `src/pages/api/onboarding/complete.ts` to handle the `POST` request.
    
- [ ] This endpoint must:
    
    - [ ] Verify the user's session cookie.
        
    - [ ] Write the submitted form data to the user's document in Firestore.
        
    - [ ] **Crucially, update the user's custom claims** via the Firebase Admin SDK to set `eula_accepted: true` and/or `account_created: true`.
        
    - [ ] Redirect the user to their dashboard or the homepage upon successful completion.
        

**5. General Implementation Notes**

- [ ] Use the centralized logging utilities (`logDebug`, `logError`) from `@utils/logHelpers` for any debugging or error handling within the created components and API routes.
    

### **Definition of Done**

- A new user who signs up is correctly redirected to the EULA acceptance page on their first page load after login.
    
- A user who has accepted the EULA but not created a profile is redirected to the profile creation page.
    
- A fully registered user visiting the site experiences **no additional API calls** related to their auth status, and the UI correctly reflects their logged-in state.
    
- The frontpage and other static content pages remain fully cacheable by a CDN for all user types.
    
- The entire onboarding flow is enforced by server-verified logic and adheres to all technical guidelines specified in `GEMINI.md`.