import { test, expect } from '@playwright/test';

test('public root introduces Town and Enter Town opens the Bulletin', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /The internet feels smaller when you find your people/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Enter Town/i }).first()).toHaveAttribute('href', '#/home');
  await expect(page.getByRole('link', { name: 'Explore downtowns' }).first()).toHaveAttribute('href', '#/communities');
  await expect(page.locator('.ps2-sidebar')).toHaveCount(0);

  await page.getByRole('link', { name: /Enter Town/i }).first().click();
  await expect(page.getByRole('heading', { name: 'The Town Bulletin' })).toBeVisible();
  await expect(page.locator('.ps2-sidebar')).toBeVisible();
});
