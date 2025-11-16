import { test, expect } from '@playwright/test';

test('WriteReview', async ({ page, context }) => {
  // Set authentication token in localStorage and cookie before navigating
  await page.goto('/');
  await page.getByText('Login').click();
  await page.getByRole('textbox', { name: 'Enter your email' }).click();
  await page
    .getByRole('textbox', { name: 'Enter your email' })
    .fill('test@user.com');
  await page.getByRole('textbox', { name: 'Enter your password' }).click();
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('test');
  await page.getByText('Log in').click();
  await page.getByText('My Reservation').click();
  await page.getByText('Completed').click();
  await page.getByText('Give Rating').first().click();
  await page.getByRole('img').nth(3).click();
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toBe('Review submitted successfully!');
    await dialog.accept();
  });
  await page.getByRole('textbox', { name: 'Share your experience...' }).click();
  await page
    .getByRole('textbox', { name: 'Share your experience...' })
    .fill('good');
  await page
    .locator('div')
    .filter({ hasText: /^Submit$/ })
    .first()
    .click();
});
