/**
 * Programmatic Firebase Authentication Utility for E2E Tests
 *
 * This utility provides functions for programmatic authentication in individual tests
 * when the global setup auth state is not sufficient (e.g., testing with different users,
 * account registration flows, etc.)
 *
 * Documentation:
 * - Quick Start: docs/e2e/QUICKSTART-AUTH.md
 * - Full Guide: docs/e2e/README-PROGRAMMATIC-AUTH.md
 * - Implementation: docs/pbi/053-implementation-summary.md
 */

import type { Page } from '@playwright/test';
import { config } from 'dotenv';
import {
  adminUser,
  existingUser,
  newUser,
} from '../playwright/.auth/credentials';

// Load environment variables from .env.development
config({ path: '.env.development' });

// Firebase REST API endpoint for password authentication
const FIREBASE_AUTH_ENDPOINT =
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';

// Get Firebase API key from environment (loaded from .env.development)
const API_KEY = process.env.PUBLIC_apiKey || process.env.TEST_FIREBASE_API_KEY;
const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

interface FirebaseAuthResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
  displayName?: string;
  photoUrl?: string;
  emailVerified?: boolean;
}

interface UserCredentials {
  email: string;
  password: string;
}

/**
 * Authenticates a user programmatically by injecting Firebase auth state into localStorage
 *
 * @param page - Playwright page instance
 * @param credentials - User credentials to authenticate with
 */
export async function authenticateProgrammatically(
  page: Page,
  credentials: UserCredentials = existingUser,
): Promise<void> {
  if (!API_KEY) {
    throw new Error(
      'Firebase API key not found. Please ensure .env.development exists with PUBLIC_apiKey',
    );
  }

  console.log(`🔐 Authenticating programmatically: ${credentials.email}`);

  // Step 1: Authenticate with Firebase REST API
  const authResponse = await fetch(`${FIREBASE_AUTH_ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
      returnSecureToken: true,
    }),
  });

  if (!authResponse.ok) {
    const errorData = await authResponse.json();
    throw new Error(
      `Firebase authentication failed: ${errorData.error?.message || authResponse.statusText}`,
    );
  }

  const authData: FirebaseAuthResponse = await authResponse.json();
  console.log('✅ Firebase authentication successful');

  // Step 2: Navigate to the app to set the correct origin
  await page.goto(BASE_URL);

  // Step 3: Construct and inject Firebase localStorage structure
  const firebaseAuthKey = `firebase:authUser:${API_KEY}:[DEFAULT]`;
  const expirationTime = Date.now() + parseInt(authData.expiresIn) * 1000;

  const firebaseAuthValue = {
    uid: authData.localId,
    email: authData.email,
    emailVerified: authData.emailVerified || false,
    isAnonymous: false,
    providerData: [
      {
        providerId: 'password',
        uid: authData.email,
        displayName: authData.displayName || null,
        email: authData.email,
        phoneNumber: null,
        photoURL: authData.photoUrl || null,
      },
    ],
    stsTokenManager: {
      refreshToken: authData.refreshToken,
      accessToken: authData.idToken,
      expirationTime: expirationTime,
    },
    createdAt: Date.now().toString(),
    lastLoginAt: Date.now().toString(),
    apiKey: API_KEY,
    appName: '[DEFAULT]',
  };

  // Inject the Firebase auth state into localStorage
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { key: firebaseAuthKey, value: firebaseAuthValue },
  );

  console.log('💾 Auth state injected into localStorage');

  // Step 4: Reload to apply the auth state
  await page.reload();
  await page.waitForLoadState('domcontentloaded');

  // Wait for auth state to be processed
  await page.waitForTimeout(1000);

  console.log('✅ Programmatic authentication complete');
}

/**
 * Authenticates with the existing user account (default for most tests)
 */
export async function authenticateAsExistingUser(page: Page): Promise<void> {
  return authenticateProgrammatically(page, existingUser);
}

/**
 * Authenticates with the new user account (for onboarding tests)
 */
export async function authenticateAsNewUser(page: Page): Promise<void> {
  return authenticateProgrammatically(page, newUser);
}

/**
 * Authenticates with the admin user account (for admin feature tests)
 */
export async function authenticateAsAdmin(page: Page): Promise<void> {
  return authenticateProgrammatically(page, adminUser);
}

/**
 * Clears all authentication state from the browser
 */
export async function clearAuth(page: Page): Promise<void> {
  if (!API_KEY) {
    throw new Error('Firebase API key not found');
  }

  await page.goto(BASE_URL);

  await page.evaluate((apiKey) => {
    const firebaseAuthKey = `firebase:authUser:${apiKey}:[DEFAULT]`;
    localStorage.removeItem(firebaseAuthKey);
    localStorage.clear();
  }, API_KEY);

  console.log('🧹 Authentication state cleared');
}
