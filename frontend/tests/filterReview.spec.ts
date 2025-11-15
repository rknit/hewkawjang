import { test, expect } from '@playwright/test';

test.use({
  headless: false,
  viewport: { width: 1280, height: 720 },
  launchOptions: {
    slowMo: 10,
  },
});

test('FilterRestaurantReviews', async ({ page }) => {
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

  // Navigate to a specific restaurant
  await page.goto('/Restaurant?restaurantId=1');

  // Wait for reviews section to load
  await page.waitForSelector('text=/Based on \\d+ review/', { timeout: 5000 });

  // Verify Filter by Rating section is visible
  await expect(page.getByText('Filter by Rating').first()).toBeVisible();

  await page.waitForTimeout(4000);
  // Count initial number of reviews displayed
  const initialReviews = await page.locator('text=/^\\d+\\.\\d+$/').count();

  // Define filter buttons
  const oneStarButton = page.getByText('1⭐').first();
  const twoStarButton = page.getByText('2⭐').first();
  const threeStarButton = page.getByText('3⭐').first();
  const fourStarButton = page.getByText('4⭐').first();
  const fiveStarButton = page.getByText('5⭐').first();

  // Click on 1-star filter to DESELECT it (filters are selected by default)
  await oneStarButton.click();
  await page.waitForTimeout(1500);

  // Verify 1.0 ratings are not visible (or fewer 1-star reviews)
  // Check if there are no 1.0 ratings visible in review cards

  // Click on 2-star filter to DESELECT it
  await twoStarButton.click();
  await page.waitForTimeout(1500);

  // Click on 3-star filter to DESELECT it
  await threeStarButton.click();
  await page.waitForTimeout(1500);

  // Now only 4 and 5 star reviews should be visible
  // Verify that 4.0 or 5.0 ratings are visible
  const fourOrFiveStarVisible =
    (await page.getByText('4.0').count()) > 0 ||
    (await page.getByText('5.0').count()) > 0;
  expect(fourOrFiveStarVisible).toBe(true);

  // Verify 3.0 or lower ratings are not visible
  const threeStarReviews = await page.getByText('3.0').count();
  expect(threeStarReviews).toBe(0);
  const twoStarReviews = await page.getByText('2.0').count();
  expect(twoStarReviews).toBe(0);
  const oneStarReviews = await page.getByText('1.0').count();
  expect(oneStarReviews).toBe(0);

  // Click on 4-star filter to DESELECT it as well
  await fourStarButton.click();
  await page.waitForTimeout(1500);

  // Now only 5-star reviews should be visible
  // Verify 5.0 ratings are visible
  const fiveStarReviews = await page.getByText('5.0').count();
  expect(fiveStarReviews).toBeGreaterThan(0);

  // Click on 5-star filter to DESELECT it
  await fiveStarButton.click();
  await page.waitForTimeout(1500);

  // Re-select filters by clicking them again
  await fiveStarButton.click();
  await page.waitForTimeout(1500);

  // Only 5-star reviews should be visible now
  const onlyFiveStarReviews = await page.getByText('5.0').count();
  expect(onlyFiveStarReviews).toBeGreaterThan(0);

  // Click all other filters to select them back
  await fourStarButton.click();
  await page.waitForTimeout(500);
  await threeStarButton.click();
  await page.waitForTimeout(500);
  await twoStarButton.click();
  await page.waitForTimeout(500);
  await oneStarButton.click();
  await page.waitForTimeout(1500);

  // All reviews should be visible again (all filters selected)
  const finalReviews = await page.locator('text=/^\\d+\\.\\d+$/').count();
  console.log(
    `Initial Reviews: ${initialReviews}, Final Reviews: ${finalReviews}`,
  );
  expect(finalReviews).toBe(initialReviews);
});
