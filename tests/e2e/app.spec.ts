import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Know what happened last.' })).toBeVisible();
  await expect(page.getByText('The next action becomes the handoff.')).toBeVisible();
});

test('records timed and instant actions with end-time semantics, then persists', async ({ page }) => {
  await page.getByRole('button', { name: /Feed/ }).click();
  await expect(page.getByText('Feed in progress')).toBeVisible();
  await page.getByRole('button', { name: 'End feed' }).click();
  await expect(page.locator('.last-card__type')).toContainText('Feed');
  await expect(page.getByText(/Ended/)).toBeVisible();

  await page.getByRole('button', { name: /Medicine/ }).click();
  await expect(page.locator('.last-card__type')).toContainText('Medicine');
  await page.reload();
  await expect(page.locator('.last-card__type')).toContainText('Medicine');
  await expect(page.getByRole('list').getByText('Feed', { exact: true })).toBeVisible();
});

test('records a visible correction and validates time order', async ({ page }) => {
  await page.getByRole('button', { name: /Diaper/ }).click();
  await page.getByRole('button', { name: /Correct diaper/ }).click();
  await page.getByLabel('Note (optional)').fill('Wet');
  await page.getByLabel('Reason for correction (shown in correction history)').fill('Added handoff detail');
  await page.getByRole('button', { name: 'Save correction' }).click();
  await expect(page.getByText('Corrected')).toBeVisible();
  await expect(page.getByText('Instant · Wet')).toBeVisible();
});

test('supports keyboard focus and has no serious accessibility violations', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to the handoff board' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  await page.emulateMedia({ colorScheme: 'dark' });
  const darkResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(darkResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('loads the app shell and records locally while offline', async ({ page, context }) => {
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload({ waitUntil: 'networkidle' });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Know what happened last.' })).toBeVisible();
  await page.getByRole('button', { name: /Diaper/ }).click();
  await expect(page.locator('.last-card__type')).toContainText('Diaper');
  await context.setOffline(false);
});

test('restores the paid pairing surface from a cached valid license', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'One browser coverage is enough for the gated branch.');
  await page.evaluate(() => {
    localStorage.setItem('sb_license:caregiver-last-action', 'test-license');
    localStorage.setItem('sb_license_verdict:caregiver-last-action', JSON.stringify({ valid: true, reason: 'ok', checkedAt: Date.now() }));
  });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Create invitation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Join invitation' })).toBeVisible();
});

test('pairs two isolated devices and syncs an encrypted change', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'Peer-to-peer coverage runs once on desktop.');
  test.setTimeout(45_000);
  const unlock = () => {
    localStorage.setItem('sb_license:caregiver-last-action', 'test-license');
    localStorage.setItem('sb_license_verdict:caregiver-last-action', JSON.stringify({ valid: true, reason: 'ok', checkedAt: Date.now() }));
  };
  const firstContext = await browser.newContext();
  const secondContext = await browser.newContext();
  await firstContext.addInitScript(unlock);
  await secondContext.addInitScript(unlock);
  const first = await firstContext.newPage();
  const second = await secondContext.newPage();
  await Promise.all([first.goto('http://127.0.0.1:4173/'), second.goto('http://127.0.0.1:4173/')]);

  await first.getByRole('button', { name: 'Create invitation' }).click();
  await first.getByRole('heading', { name: 'Scan on the second device' }).waitFor();
  const invitation = await first.locator('#pair-code').inputValue();
  await second.getByRole('button', { name: 'Join invitation' }).click();
  await second.getByLabel('Invitation code').fill(invitation);
  await second.getByRole('button', { name: 'Create response' }).click();
  await second.getByRole('heading', { name: 'Return this response' }).waitFor();
  const response = await second.locator('#pair-code').inputValue();

  await first.getByRole('button', { name: 'Enter their response' }).click();
  await first.getByLabel('Response code').fill(response);
  await first.getByRole('button', { name: 'Finish pairing' }).click();
  await second.getByRole('button', { name: 'Done' }).click();
  await expect(first.getByText(/Connected · changes sync live/)).toBeVisible({ timeout: 15_000 });
  await expect(second.getByText(/Connected · changes sync live/)).toBeVisible({ timeout: 15_000 });

  await first.getByRole('button', { name: /Medicine/ }).click();
  await expect(second.locator('.last-card__type')).toContainText('Medicine');
  await firstContext.close();
  await secondContext.close();
});

test('legal pages are directly addressable', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { name: 'Privacy, in plain language.' })).toBeVisible();
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { name: 'Terms for a calm handoff.' })).toBeVisible();
});
