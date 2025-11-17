import { test, expect, Page } from '@playwright/test';

async function setup(page: Page) {
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
}

test('WriteReviewInvalid', async ({ page, context }) => {
  await setup(page);

  // Submit without selecting rating or entering text
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toBe('Please select a rating.');
    await dialog.accept();
  });
  await page
    .locator('div')
    .filter({ hasText: /^Submit$/ })
    .first()
    .click();
});

test('WriteReviewValid', async ({ page, context }) => {
  await setup(page);

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
