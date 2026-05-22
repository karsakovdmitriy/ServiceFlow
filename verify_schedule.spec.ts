import { test, expect } from '@playwright/test';

test('verify dynamic schedule overview', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForURL('http://localhost:3000/');
  await page.click('nav a:has-text("Расписание")');

  // Wait for dynamic content
  await page.waitForSelector('text=Обзор недели');

  // Take screenshot
  await page.screenshot({ path: 'schedule-dynamic.png', fullPage: true });

  // Check if grid exists
  const grid = await page.locator('.grid-cols-7');
  await expect(grid).toBeVisible();
});
