import { test, expect } from '@playwright/test';

test('DeleteReview', async ({ page }) => {
  // Login
  await page.goto('/');
  await page.getByText('Login').click();
  await page.getByRole('textbox', { name: 'Enter your email' }).fill('test@user.com');
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('test');
  await page.getByText('Log in').click();

  // Navigate to restaurant page
  await page.goto('/Restaurant?restaurantId=1');

  // Wait for reviews section to load
  const reviewCountLocator = page.locator('text=/Based on \\d+ review/').first();
  await reviewCountLocator.waitFor({ state: 'visible', timeout: 10000 });

  // Get initial review count
  const initialReviewText = await reviewCountLocator.textContent();
  const initialCountMatch = initialReviewText?.match(/Based on (\d+) review/);
  const initialReviewCount = initialCountMatch ? parseInt(initialCountMatch[1]) : 0;
  console.log(`Initial review count: ${initialReviewCount}`);

  // Verify there is at least one review to delete
  expect(initialReviewCount).toBeGreaterThan(0);

  // Set up dialog handler BEFORE clicking the delete button
  // Use page.on() to handle synchronous window.confirm dialogs
  page.once('dialog', async (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    expect(dialog.message()).toBe('Delete this review?');
    await dialog.accept();
  });

  // Find and click the first delete button
  const deleteButton = page.getByLabel('Delete review').first();
  await deleteButton.click();

  // Wait for deletion to complete
  await page.waitForTimeout(3000);

  // Reload page to fetch fresh data from API
  await page.reload();
  await reviewCountLocator.waitFor({ state: 'visible', timeout: 10000 });

  // Get final review count
  const finalReviewText = await reviewCountLocator.textContent();
  const finalCountMatch = finalReviewText?.match(/Based on (\d+) review/);
  const finalReviewCount = finalCountMatch ? parseInt(finalCountMatch[1]) : 0;
  console.log(`Final review count: ${finalReviewCount}`);

  // Verify review count decreased by 1
  expect(finalReviewCount).toBe(initialReviewCount - 1);
});
