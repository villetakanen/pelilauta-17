/**
 * This is a command line/node script that will initialize the test database with the necessary data.
 *
 * We use the Firestore settings in the .env.development file to connect to the Firestore database
 * of the end-to-end test project.
 */

import { config } from 'dotenv';
import { cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

config({
  path: '.env.development',
});
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.PUBLIC_projectId,
  private_key_id: process.env.SECRET_private_key_id,
  private_key: process.env.SECRET_private_key,
  client_email: process.env.SECRET_client_email,
  client_id: process.env.SECRET_client_id,
  auth_uri: process.env.SECRET_auth_uri,
  token_uri: process.env.SECRET_token_uri,
  auth_provider_x509_cert_url: process.env.SECRET_auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.SECRET_client_x509_cert_url,
  universe_domain: process.env.SECRET_universe_domain,
};

const serverApp = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: process.env.PUBLIC_databaseURL,
});

export const serverDB = getFirestore(serverApp);

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
serverDB.collection('sites').doc(testSite.key).set(testSite);
console.log('Test site created:', testSite.key);

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
  owners: ['e2e-test-owner'],
  category: 'alpha',
  tags: ['e2e', 'test'],
};
serverDB
  .collection('sites')
  .doc(testSite.key)
  .collection('pages')
  .doc(testSiteFrontPage.key)
  .set(testSiteFrontPage);
console.log('Test site front page created:', testSiteFrontPage.key);

console.log('Database initialization complete, fire away!');
