import { test, expect } from '@playwright/test';

test('ViewRestaurantReviews', async ({ page }) => {
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

  // Navigate to a specific restaurant (replace with actual restaurant ID)
  await page.goto('/Restaurant?restaurantId=1'); // Adjust ID as needed

  // Wait for reviews section to load by waiting for the "Based on X reviews" text
  await page.waitForSelector('text=/Based on \\d+ review/', { timeout: 5000 });

  // Verify average rating is displayed (the large number in the review summary)
  // First match is the big average rating (3.9 in the example)
  await expect(page.locator('text=/^\\d+\\.\\d+$/').first()).toBeVisible();

  // Verify "Based on X reviews" text is displayed
  await expect(
    page.locator('text=/Based on \\d+ review/').first(),
  ).toBeVisible();

  // Verify the Filter by Rating section is visible
  await expect(page.getByText('Filter by Rating').first()).toBeVisible();

  // Verify filter buttons are displayed (1-5 star filters)
  await expect(page.getByText('1⭐').first()).toBeVisible();
  await expect(page.getByText('5⭐').first()).toBeVisible();

  await expect(page.locator('[fill="#FACC15"]').first()).toBeVisible();

  // Verify individual review elements are visible
  // Rating number in review card (e.g., "5.0", "4.0")
  // nth(1) gets the second rating (first review card rating)
  const reviewRatings = page.locator('text=/^\\d+\\.\\d+$/').nth(1);
  await expect(reviewRatings).toBeVisible({ timeout: 5000 });
});

test('ViewRestaurantWithNoReviews', async ({ page }) => {
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

  // Navigate to a restaurant with no reviews (adjust ID as needed to find one without reviews)
  await page.goto('/Restaurant?restaurantId=15'); // Use an ID of a restaurant with no reviews

  // Wait for the page to load
  await page.waitForTimeout(2000);

  // Verify "No reviews yet" message is displayed when there are no reviews
  await expect(page.getByText('No reviews yet')).toBeVisible({ timeout: 5000 });
});
