import { test, expect } from '@playwright/test';

test('Digital Town homepage loads', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Digital Town/i);
});