/**
 * This is a command line/node script that will initialize the test database with the necessary data.
 *
 * We use the Firestore settings in the .env.development file to connect to the Firestore database
 * of the end-to-end test project.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({
  path: '.env.development',
});

// Use the service account file directly instead of environment variables
const serviceAccountPath = join(__dirname, '../server_principal.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

console.log('Using project_id:', serviceAccount.project_id);

const serverApp = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.PUBLIC_databaseURL,
});

export const serverDB = getFirestore(serverApp);
export const serverAuth = getAuth(serverApp);

// Create a test site
const testSite = {
  key: 'e2e-test-site',
  name: 'The E2E Test Site',
  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp(),
  flowTime: FieldValue.serverTimestamp(),
  owners: [
    'e2e-test-owner',
    'JatmZFE8X9coxETMz2sUs5YW1r22',
    'vN8RyOYratXr80130A7LqVCLmLn1',
    'H3evfU7BDmec9KkotRiTV41YECg1', // ville.takanen@iki.fi test user
  ],
  homepage: 'front-page',
  hidden: true,
  sortOrder: 'name',
  usePlainTextURLs: true,
  pageCategories: [
    { slug: 'alpha', name: 'Alpha' },
    { slug: 'beta', name: 'Beta' },
    { slug: 'omega', name: 'Omega' },
  ],
  pageRefs: [
    {
      key: 'front-page',
      name: 'Front Page',
      author: 'e2e-test-owner',
      category: 'alpha',
      flowTime: 0,
    },
  ],
};
await serverDB.collection('sites').doc(testSite.key).set(testSite);
console.log('Test site created:', testSite.key);
console.log('Site owners:', testSite.owners);

const testSitePages = await serverDB
  .collection('sites')
  .doc(testSite.key)
  .collection('pages')
  .get();
if (testSitePages.empty) {
  console.log('No pages found for the test site, creating default pages.');
} else {
  console.log('Test site already has pages, deleting existing pages.');
  const batch = serverDB.batch();
  for (const doc of testSitePages.docs) {
    console.log('Deleting page:', doc.id);
    batch.delete(doc.ref);
  }
  await batch.commit();
}

// Create a test site front page
const testSiteFrontPage = {
  key: 'front-page',
  siteKey: testSite.key,
  name: 'Front Page',
  createdAt: FieldValue.serverTimestamp(),
  markdownContent: "# Welcome to the E2E Test Site!\n\n here's the front page",
  owners: ['e2e-test-owner', 'H3evfU7BDmec9KkotRiTV41YECg1'],
  category: 'alpha',
  tags: ['e2e', 'test'],
};
await serverDB
  .collection('sites')
  .doc(testSite.key)
  .collection('pages')
  .doc(testSiteFrontPage.key)
  .set(testSiteFrontPage);
console.log('Test site front page created:', testSiteFrontPage.key);

// Create a regular test page for cache testing
const testPage = {
  key: 'test-page',
  siteKey: testSite.key,
  name: 'Test Page',
  createdAt: FieldValue.serverTimestamp(),
  markdownContent:
    '# Test Page\n\nThis is a regular test page for cache header testing.',
  owners: ['e2e-test-owner', 'H3evfU7BDmec9KkotRiTV41YECg1'],
  category: 'alpha',
  tags: ['e2e', 'test', 'cache'],
};
await serverDB
  .collection('sites')
  .doc(testSite.key)
  .collection('pages')
  .doc(testPage.key)
  .set(testPage);
console.log('Test page created:', testPage.key);

// Wait a bit to ensure all writes are committed
await new Promise((resolve) => setTimeout(resolve, 1000));

console.log('Database initialization complete, fire away!');

// Cleanup test user for account creation flow test
const testUserUid = 'H3evfU7BDmec9KkotRiTV41YECg1';
console.log(`Cleaning up user ${testUserUid} for account creation test...`);

// 1. Clear custom claims
await serverAuth.setCustomUserClaims(testUserUid, {});
console.log('Custom claims cleared.');

// 2. Delete account document
const accountRef = serverDB.collection('accounts').doc(testUserUid);
await accountRef.delete();
console.log('Account document deleted.');

// 3. Delete profile document
const profileRef = serverDB.collection('profiles').doc(testUserUid);
await profileRef.delete();
console.log('Profile document deleted.');

console.log('User cleanup complete.');
