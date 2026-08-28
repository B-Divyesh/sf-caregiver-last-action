import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'See the last baby-care action.' })).toBeVisible();
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
  await page.getByRole('link', { name: 'Skip to the handoff board' }).focus();
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
  await expect(page.getByRole('heading', { name: 'See the last baby-care action.' })).toBeVisible();
  await page.getByRole('button', { name: /Diaper/ }).click();
  await expect(page.locator('.last-card__type')).toContainText('Diaper');
  await context.setOffline(false);
});

test('@claim:no-purchase does not show a purchase path', async ({ page }) => {
  await expect(page.getByText('Share is not available in this release.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Buy/ })).toHaveCount(0);
});

test('legal pages are directly addressable', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { name: 'Privacy, in plain language.' })).toBeVisible();
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { name: 'Terms for a clear handoff.' })).toBeVisible();
});

test('@claim:demo-isolation demo has sample data and never changes the real record', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Diaper/ }).click();
  await expect(page.locator('.last-card__type')).toContainText('Diaper');
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved.')).toBeVisible();
  await expect(page.locator('.last-card__type')).toContainText('Diaper');
  await expect(page.getByText('Wet diaper', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Medicine/ }).click();
  await expect(page.locator('.last-card__type')).toContainText('Medicine');
  await page.goto('/');
  await expect(page.locator('.last-card__type')).toContainText('Diaper');
});

test('@claim:latest-action demo shows the latest completed care action first', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.last-card__type')).toContainText('Diaper');
  await expect(page.locator('#history-list')).toContainText('Diaper');
});

test('@claim:csv-export demo CSV contains its completed care actions', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const file = await download;
  const csv = await readFile(await file.path(), 'utf8');
  expect(csv).toContain('"type","started_at","ended_at"');
  expect(csv).toContain('"feed"');
  expect(csv).toContain('"sleep"');
  expect(csv).toContain('"diaper"');
});

test('@claim:offline-demo demo reloads and records while offline after first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload({ waitUntil: 'networkidle' });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved.')).toBeVisible();
  await page.getByRole('button', { name: /Medicine/ }).click();
  await expect(page.locator('.last-card__type')).toContainText('Medicine');
  await context.setOffline(false);
});

test('@claim:private-demo demo flow sends no third-party requests', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo');
  await page.getByRole('button', { name: /Medicine/ }).click();
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:backup-merge invalid backup leaves the existing record usable', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Medicine/ }).click();
  await expect(page.locator('.last-card__type')).toContainText('Medicine');
  await page.locator('#import-file').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{"version":1,"events":[{"id":"broken"}],"corrections":[],"settings":{}}') });
  await expect(page.getByText('That backup has missing or invalid care actions. Nothing was changed.')).toBeVisible();
  await page.reload();
  await expect(page.locator('.last-card__type')).toContainText('Medicine');
});

test('@claim:backup-json demo exports a complete JSON backup', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  const file = await download;
  const backup = JSON.parse(await readFile(await file.path(), 'utf8')) as { version: number; events: unknown[] };
  expect(backup.version).toBe(1);
  expect(backup.events).toHaveLength(3);
});
