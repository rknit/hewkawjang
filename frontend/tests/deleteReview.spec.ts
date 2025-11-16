import { test, expect } from '@playwright/test';

test('DeleteReview', async ({ page }) => {
  // Login
  await page.goto('/');
  await page.getByText('Login').click();
  await page.getByRole('textbox', { name: 'Enter your email' }).click();
  await page
    .getByRole('textbox', { name: 'Enter your email' })
    .fill('test@user.com');
  await page.getByRole('textbox', { name: 'Enter your password' }).click();
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('test');
  await page.getByText('Log in').click();

  // Navigate to restaurant page
  await page.goto('/Restaurant?restaurantId=1');

  // Wait for reviews section to load
  await page.waitForSelector('text=/Based on \\d+ review/', { timeout: 5000 });
  await page.waitForTimeout(2000);

  // Get initial review count from the "Based on X reviews" text
  const initialReviewText = await page
    .locator('text=/Based on \\d+ review/')
    .first()
    .textContent();

  // Extract the number from text like "Based on 8 reviews"
  const initialCountMatch = initialReviewText?.match(/Based on (\d+) review/);
  const initialReviewCount = initialCountMatch
    ? parseInt(initialCountMatch[1])
    : 0;
  console.log(`Initial review count: ${initialReviewCount}`);

  // Look for delete button (Trash icon with accessibilityLabel="Delete review")
  const deleteButton = page.getByLabel('Delete review').first();

  // Click the delete button
  await deleteButton.click();

  // Handle confirmation dialog
  page.once('dialog', async (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    expect(dialog.message()).toContain(
      'Are you sure you want to delete this review',
    );
    // Click "Delete" to confirm
    await dialog.accept();
  });

  // Wait for deletion to process and page to update
  await page.waitForTimeout(2000);

  // Reload the page to see updated review count
  await page.reload();
  await page.waitForSelector('text=/Based on \\d+ review/', { timeout: 5000 });
  await page.waitForTimeout(2000);

  // Get final review count
  const finalReviewText = await page
    .locator('text=/Based on \\d+ review/')
    .first()
    .textContent();

  const finalCountMatch = finalReviewText?.match(/Based on (\d+) review/);
  const finalReviewCount = finalCountMatch ? parseInt(finalCountMatch[1]) : 0;
  console.log(`Final review count: ${finalReviewCount}`);

  // Verify review count decreased by 1
  expect(finalReviewCount).toBe(initialReviewCount - 1);
});
