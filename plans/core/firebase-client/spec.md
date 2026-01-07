# Feature: Firebase Client Configuration

> **Status:** Live
> **Layer:** Core / Data

## Blueprint

### Context
This module (`src/firebase/client/index.ts`) is the entry point for the Firebase Client SDK. It is responsible for initializing the Firebase app and exporting the service instances (Auth, Firestore, etc.) used by the rest of the application.

It also handles **environment-specific configuration**, such as enabling or disabling persistence based on the runtime environment (Manual Testing vs. Automated E2E Testing).

### Architecture

#### 1. App Initialization
- Initializes a single Firebase App instance using environment variables (`PUBLIC_apiKey`, etc.).
- Exports singleton instances for:
  - `auth`: Firebase Authentication
  - `db`: Cloud Firestore
  - `storage`: Cloud Storage (commented out until needed)

#### 2. Persistence Strategy (The "Logout" Fix)
A critical responsibility of this module is to configure the Authentication Persistence correctly to avoid race conditions between tabs and test runners.

- **Default Behavior (Production/Dev):** Uses `browserLocalPersistence` (IndexedDB) by default. This is reliable for multi-tab usage.
- **Automated Testing (Playwright):** Playwright has difficulty capturing/restoring IndexedDB state. It requires `localStorage` persistence to reliably share auth state between setup and test contexts.
- **The Conflict:** Forcing `localStorage` persistence globally causes race conditions during manual `localhost` development (resulting in unexpected logouts/storage events) when multiple tabs or HMR updates occur.

**Solution:**
We condition the persistence setting on `navigator.webdriver`.
- **If `navigator.webdriver === true`:** Logic detects automation. Forces `localStorage` persistence.
- **If `navigator.webdriver === false`**: Standard user session. Uses default persistence.

### Implementation Details
- **File:** `src/firebase/client/index.ts`
- **Logic:**
  ```typescript
  if (
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost' &&
    navigator.webdriver // <--- Critical check
  ) {
    console.log('🤖 Automation detected: forcing localStorage persistence');
    setPersistence(auth, browserLocalPersistence)...
  }
  ```

## Contract

### Definition of Done
- [x] Firebase App is initialized with environment variables.
- [x] `auth` and `db` instances are exported.
- [x] Persistence is configured to support Playwright E2E tests (`localStorage`).
- [x] Persistence configuration does NOT interfere with manual localhost development (Guarded by `navigator.webdriver`).

### Regression Guardrails
- **Do not remove the `navigator.webdriver` check:** Removing this will cause random logouts for developers working on localhost.
- **Do not remove the `setPersistence` block:** Removing this will break E2E auth setup tests.
