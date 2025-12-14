/**
 * Playwright Global Setup for Firebase Authentication
 *
 * This script runs before the E2E test suite to generate a Firebase authentication
 * session programmatically (without UI interaction). The session is saved to a
 * storage state file that Playwright injects into all test workers.
 *
 * Benefits:
 * - Faster test execution (no UI login overhead)
 * - More reliable (no flaky UI interactions)
 * - Easier maintenance (login UI changes don't break tests)
 *
 * Documentation:
 * - Quick Start: docs/e2e/QUICKSTART-AUTH.md
 * - Full Guide: docs/e2e/README-PROGRAMMATIC-AUTH.md
 * - Implementation: docs/pbi/053-implementation-summary.md
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { chromium, type FullConfig } from '@playwright/test';
import { config } from 'dotenv';
import { existingUser } from '../playwright/.auth/credentials';

// Load environment variables from .env.development
config({ path: '.env.development' });

// Firebase REST API endpoint for password authentication
const FIREBASE_AUTH_ENDPOINT =
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';

// Get Firebase API key from environment (loaded from .env.development)
const API_KEY = process.env.PUBLIC_apiKey || process.env.TEST_FIREBASE_API_KEY;
const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

async function globalSetup(_config: FullConfig) {
  console.log('🔐 Starting Firebase authentication setup...');

  if (!API_KEY) {
    console.error('❌ Firebase API key not found');
    console.error(
      '   Please ensure .env.development exists with PUBLIC_apiKey',
    );
    throw new Error('Firebase API key not configured');
  }

  console.log(`   Using API key: ${API_KEY.substring(0, 10)}...`);
  console.log(`   Base URL: ${BASE_URL}`);

  try {
    // Step 1: Authenticate with Firebase REST API
    console.log(`📡 Authenticating user: ${existingUser.email}`);

    const authResponse = await fetch(
      `${FIREBASE_AUTH_ENDPOINT}?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: existingUser.email,
          password: existingUser.password,
          returnSecureToken: true,
        }),
      },
    );

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      const errorMessage = errorData.error?.message || authResponse.statusText;

      console.error('❌ Firebase authentication failed');
      console.error(`   Error: ${errorMessage}`);
      console.error('');
      console.error('   This usually means:');
      console.error(
        `   1. The test user (${existingUser.email}) doesn't exist in this Firebase project`,
      );
      console.error('   2. The password is incorrect');
      console.error('   3. The Firebase project API key is wrong');
      console.error('');
      console.error('   To fix this:');
      console.error('   - Ensure test users exist in Firebase Authentication');
      console.error('   - Run: node e2e/init-test-db.js to set up test data');
      console.error(
        '   - Check playwright/.auth/credentials.ts for test credentials',
      );
      console.error('');

      throw new Error(`Firebase authentication failed: ${errorMessage}`);
    }

    const authData = await authResponse.json();
    console.log('✅ Firebase authentication successful');
    console.log(`   UID: ${authData.localId}`);

    // Step 2: Construct Firebase localStorage structure
    // This must match exactly what Firebase Auth SDK expects
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

    // Step 3: Create a browser context and inject the auth state
    console.log('🌐 Creating browser context with auth state...');

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the app first so we have the correct origin
    await page.goto(BASE_URL);

    // Inject the Firebase auth state into localStorage
    await page.evaluate(
      ({ key, value }) => {
        localStorage.setItem(key, JSON.stringify(value));
      },
      { key: firebaseAuthKey, value: firebaseAuthValue },
    );

    console.log('💾 Auth state injected into localStorage');

    // Step 4: Save the storage state to file
    const storageStatePath = path.join(
      process.cwd(),
      'playwright',
      '.auth',
      'user.json',
    );
    const storageStateDir = path.dirname(storageStatePath);

    // Ensure directory exists
    if (!fs.existsSync(storageStateDir)) {
      fs.mkdirSync(storageStateDir, { recursive: true });
    }

    await context.storageState({ path: storageStatePath });
    console.log(`✅ Storage state saved to: ${storageStatePath}`);

    // Step 5: Verify the auth state works
    console.log('🔍 Verifying authentication...');
    await page.reload();

    // Wait a bit for Firebase to process the auth state
    await page.waitForTimeout(2000);

    // Check if the user is authenticated by looking for the settings button
    try {
      await page.waitForSelector('[data-testid="setting-navigation-button"]', {
        timeout: 10000,
        state: 'visible',
      });
      console.log('✅ Authentication verified - user is logged in');
    } catch (error) {
      console.warn(
        '⚠️  Could not verify authentication (settings button not found)',
      );
      console.warn('   Tests may still work if auth state is valid');
      console.warn(
        '   Error:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    await browser.close();

    console.log('🎉 Global setup completed successfully!');
    console.log('');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;
