---
name: 'Solution Architecture'
noun: 'veil-advance'
---

**(in english only)**

The Pelilauta is a web application that is built on top of the excellent Astro.build site generator.

The application consists of 2 bespoke apps: the discussions or "threads" app and the Game-wiki app. The threads app is a forum-like application that allows users to create threads and post messages. The Game-wiki app is a wiki-like application that allows users to create and edit game related wiki-sites.

## Principles

### Locally cached multi-page app

The Pelilauta is a multi-page application that is designed to be fast and responsive. The application is designed to be used on a mobile device and on a desktop computer. To enable this, we use reactive techniques (solid-js) to update the UI when the data changes, and local storage (nanostores) to cache the data.

Both apps have their own local storage and cache the data that is needed to render the UI. The data is fetched from the server when the app is loaded and when the user navigates to a new page. The data is then stored in the local storage and used to render the UI.

This approach allows the app to be fast and responsive, even on a slow network connection. The app should also work (at least somehow) offline, as the data is stored in the local storage.

**Do note: we are not doing full local-firs, so there is no merge-conflict resolution or anything like that.**

...

### Code structure
```
src/
  components/
    client/ (the solid-js, client side components)
      ThreadsApp/
        ... (UX of the threads app)
      SitesApp/
        ...
    server/ (the server side components)
      ...
    store/ (the store components)
      ThreadsApp/
        ... (state management of the threads app)
      SitesApp/
        ...
```

## Authentication and Session Management

We employ a multi-layered approach to authentication to cater to different rendering and data access scenarios, from client-side UI checks to server-side rendering and API protection.

### Client-Side Authentication (UI)

For client-side components (Svelte), we rely on a nanostore to manage the user's authentication state.

- **Mechanism**: A simple check is performed against the `uid` store imported from `@stores/session`.
- **Usage**: This is primarily for controlling UI elements, like showing or hiding buttons or links. It provides a fast and reactive way to update the view based on whether a user is logged in.
- **Example**:
  ```svelte
  <script lang="ts">
    import { uid } from '@stores/session';
  </script>

  {#if $uid}
    <a href="/profile">Your Profile</a>
  {:else}
    <a href="/login">Log In</a>
  {/if}
  ```

### Server-Side Authentication (Astro Pages)

For server-rendered Astro pages that require user authentication, we use a cookie-based session verification.

- **Mechanism**: The `verifySession` utility from `@utils/server/auth/verifySession` is called in the page's frontmatter. It inspects the session cookie sent with the request.
- **Usage**: This is used to protect entire pages and redirect unauthenticated users. It ensures that sensitive content is not rendered or sent to unauthorized clients.
- **Example**:
  ```astro
  ---
  import { verifySession } from '@utils/server/auth/verifySession';

  const session = await verifySession(Astro);
  if (!session?.uid) {
    return Astro.redirect('/login');
  }
  ---
  <!-- Page content for authenticated users -->
  ```

### Server-Side Authentication (API Routes)

For our API endpoints, we use a token-based approach to secure them.

- **Mechanism**: API routes are protected using the `tokenToUid` utility from `@utils/server/auth/tokenToUid`. This function validates a Bearer token from the `Authorization` header.
- **Usage**: This is crucial for securing data operations (CRUD) initiated from the client. The client must attach a valid Firebase Auth ID token to its requests.
- **Example**:
  ```typescript
  // src/pages/api/some-data.ts
  import { tokenToUid } from '@utils/server/auth/tokenToUid';

  export async function POST(request: Request) {
    const uid = await tokenToUid(request);
    if (!uid) {
      return new Response('Unauthorized', { status: 401 });
    }
    // Proceed with data operation for the authenticated user
  }
  ```