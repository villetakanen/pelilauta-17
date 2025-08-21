import { email, password } from '../playwright/.auth/credentials';

export async function authenticate(page) {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('http://localhost:4321/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('http://localhost:4321/');
}
