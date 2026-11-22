import { test } from '@playwright/test';

const hasCredentials = Boolean(process.env.TEST_USERNAME && process.env.TEST_PASSWORD);

test('capture Town layout audit', async ({ page }) => {
  test.skip(!hasCredentials, 'Set TEST_USERNAME and TEST_PASSWORD to run the authenticated layout audit');
  await page.setViewportSize({
    width: 1280,
    height: 720,
  });

  // Open Town
  await page.goto('/');

  // Go to Feed to access the login screen
  await page.getByRole('link', { name: '02 Feed' }).click();

  // Sign in
  await page.getByRole('textbox', { name: 'Username' }).fill(
    process.env.TEST_USERNAME!
  );

  await page.getByRole('textbox', { name: 'Password' }).fill(
    process.env.TEST_PASSWORD!
  );

  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait for authentication to complete
  await page.getByRole('button', { name: 'SIGN OUT' }).waitFor({
    state: 'visible',
    timeout: 15000,
  });

  // TOWN
  await page.getByRole('link', { name: '01 Bulletin' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'layout-audit/town.png',
    fullPage: false,
  });

  // FEED
  await page.getByRole('link', { name: '02 Feed' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'layout-audit/feed.png',
    fullPage: false,
  });

  // COMMUNITIES
  await page.getByRole('link', { name: '03 Downtowns' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'layout-audit/communities.png',
    fullPage: false,
  });

  // SEARCH
  await page.getByRole('link', { name: 'Search Town' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'layout-audit/search.png',
    fullPage: false,
  });

  // PROFILE
  await page.getByRole('link', { name: '11 Profile' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'layout-audit/profile.png',
    fullPage: false,
  });

  // SETTINGS (secondary account destination)
  await page.getByRole('link', { name: '09 Settings' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'layout-audit/settings.png',
    fullPage: false,
  });
});
