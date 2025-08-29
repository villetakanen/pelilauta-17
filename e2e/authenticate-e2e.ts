import { email, password } from '../playwright/.auth/credentials';

// Use environment variable for base URL or default to localhost
const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

export async function authenticate(page) {
  console.log('Starting authentication process...');
  
  // Perform authentication steps. Replace these actions with your own.
  await page.goto(`${BASE_URL}/login`);
  
  // Wait for the login form to be loaded
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  
  console.log('Login button clicked, waiting for navigation...');
  
  // Wait until the page receives the cookies.
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL(`${BASE_URL}/`, { timeout: 60000, waitUntil: 'domcontentloaded' });
  
  // Additional wait to ensure user profile is loaded - this is the reliable indicator of successful auth
  await page.waitForSelector('[data-testid="setting-navigation-button"]', { 
    timeout: 30000,
    state: 'visible' 
  });
  
  console.log('Authentication completed successfully');
}
