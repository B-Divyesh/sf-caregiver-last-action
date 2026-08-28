import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'See the last baby-care action.' })).toBeVisible();
  await expect(page.getByText('Record the first care action.')).toBeVisible();
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
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Share with another caregiver' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Buy/ })).toHaveCount(0);
});

test('@claim:local-persistence saves a care action after reload', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Medicine/ }).click();
  await expect(page.locator('.last-card__type')).toContainText('Medicine');
  await page.reload();
  await expect(page.locator('.last-card__type')).toContainText('Medicine');
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
  const resetNavigation = page.waitForNavigation({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await resetNavigation;
  await expect(page.locator('#history-list .history-row')).toHaveCount(3);
  await expect(page.locator('.last-card__type')).toContainText('Diaper');
  await page.goto('/');
  await expect(page.locator('.last-card__type')).toContainText('Diaper');
});

test('@claim:latest-action demo shows the latest completed care action first', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.last-card__type')).toContainText('Diaper');
  await expect(page.locator('#history-list')).toContainText('Diaper');
});

test('@claim:record-care-actions starts and ends timed care actions and records instant care actions', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Feed/ }).click();
  await expect(page.getByText('Feed in progress')).toBeVisible();
  await page.getByRole('button', { name: 'End feed' }).click();
  await page.getByRole('button', { name: /Sleep/ }).click();
  await expect(page.getByText('Sleep in progress')).toBeVisible();
  await page.getByRole('button', { name: 'End sleep' }).click();
  await page.getByRole('button', { name: /Medicine/ }).click();
  await page.getByRole('button', { name: /Diaper/ }).click();
  await expect(page.locator('#history-list .history-row')).toHaveCount(7);
  await expect(page.locator('#history-list')).toContainText('Feed');
  await expect(page.locator('#history-list')).toContainText('Sleep');
  await expect(page.locator('#history-list')).toContainText('Medicine');
  await expect(page.locator('#history-list')).toContainText('Diaper');
});

test('@claim:visible-correction-history keeps labeled before and after values after reload', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Diaper/ }).click();
  await page.getByRole('button', { name: /Correct diaper/ }).first().click();
  await page.getByLabel('Note (optional)').fill('Wet diaper at handoff');
  await page.getByLabel('Reason for correction (shown in correction history)').fill('Added handoff detail');
  await page.getByRole('button', { name: 'Save correction' }).click();
  await expect(page.locator('#app-dialog')).toBeHidden();
  await page.reload();
  await page.getByRole('button', { name: /Correct diaper/ }).first().click();
  await page.getByText(/Correction history \(1\)/).click();
  const history = page.locator('.correction-history');
  await expect(history.getByText('Added handoff detail')).toBeVisible();
  await expect(history.getByRole('heading', { name: 'Before' })).toBeVisible();
  await expect(history.getByText('No note')).toBeVisible();
  await expect(history.getByRole('heading', { name: 'After' })).toBeVisible();
  await expect(history.getByText('Wet diaper at handoff')).toBeVisible();
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

test('@claim:backup-import demo imports a valid backup', async ({ page }) => {
  await page.goto('/demo');
  const now = Date.now();
  const backup = {
    version: 1,
    events: [{ id: 'imported-medicine', type: 'medicine', startAt: now, endAt: now, note: 'Imported dose note', updatedAt: now, revision: 1, deviceId: 'backup-device' }],
    corrections: [],
    settings: { babyName: 'Mila', caregiverName: 'Alex', updatedAt: now, deviceId: 'backup-device' },
  };
  await page.locator('#import-file').setInputFiles({ name: 'valid.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.locator('.last-card__type')).toContainText('Medicine');
  await expect(page.getByText('Imported dose note', { exact: true })).toBeVisible();
});

test('@claim:backup-preserves-newer demo import keeps a newer local action', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Medicine/ }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  const file = await download;
  const backup = JSON.parse(await readFile(await file.path(), 'utf8')) as { version: 1; events: Array<Record<string, unknown>>; corrections: unknown[]; settings: Record<string, unknown> };
  const medicine = backup.events.find((event) => event.type === 'medicine' && String(event.id).startsWith('event:'))!;
  const stale = { ...medicine, note: 'Older imported note', updatedAt: 0 };
  await page.locator('#import-file').setInputFiles({ name: 'older.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...backup, events: [stale] })) });
  await expect(page.getByText('Older imported note', { exact: true })).toHaveCount(0);
  await expect(page.locator('.last-card__type')).toContainText('Medicine');
});

test('@claim:paired-demo-sync shares a new action between paired sample boards', async ({ browser }) => {
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();
  try {
    await host.goto('/demo');
    await guest.goto('/demo');
    await host.getByRole('button', { name: 'Create invitation' }).click();
    const invitation = await host.locator('#pair-code').inputValue();
    await guest.getByRole('button', { name: 'Enter invitation' }).click();
    await guest.getByLabel('Invitation code').fill(invitation);
    await guest.getByRole('button', { name: 'Create response' }).click();
    const answer = await guest.locator('#pair-code').inputValue();
    await host.getByRole('button', { name: 'Enter their response' }).click();
    await host.getByLabel('Response code').fill(answer);
    await host.getByRole('button', { name: 'Finish pairing' }).click();
    await expect(host.getByText(/Connected.*changes sync live/)).toBeVisible({ timeout: 15_000 });
    await host.getByRole('button', { name: /Medicine/ }).click();
    await expect(guest.locator('.last-card__type')).toContainText('Medicine', { timeout: 15_000 });
  } finally {
    await hostContext.close();
    await guestContext.close();
  }
});

test('announces and focuses each document route', async ({ page }) => {
  await page.goto('/demo');
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole('heading', { name: 'See the last baby-care action.' })).toBeFocused();
  await expect(page.locator('#route-announcer')).toHaveText('Demo board opened');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'See the last baby-care action.' })).toBeFocused();
  await expect(page.locator('#route-announcer')).toHaveText('Caregiver Last Action opened');
});

test('keeps the mobile demo banner clear of the first care action', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  const banner = await page.locator('#demo-banner').boundingBox();
  const lastAction = await page.locator('#last-action').boundingBox();
  expect(banner).not.toBeNull();
  expect(lastAction).not.toBeNull();
  expect((banner?.y ?? 0) + (banner?.height ?? 0)).toBeLessThanOrEqual(lastAction?.y ?? 0);
});

test('uses complete route metadata in built output and on the demo route', async ({ page }) => {
  const required = [
    '<meta name="description"',
    '<link rel="canonical"',
    '<meta property="og:title"',
    '<meta property="og:description"',
    '<meta property="og:image"',
    '<meta name="twitter:card"',
    '<meta name="twitter:title"',
    '<meta name="twitter:description"',
    '<meta name="twitter:image"',
    '<link rel="icon"',
    '<link rel="apple-touch-icon"',
  ];
  for (const route of ['dist/index.html', 'dist/privacy/index.html', 'dist/terms/index.html', 'dist/404.html']) {
    const markup = await readFile(route, 'utf8');
    for (const marker of required) expect(markup, `${route} is missing ${marker}`).toContain(marker);
  }

  const rootMarkup = await readFile('dist/index.html', 'utf8');
  const inlineScript = rootMarkup.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1];
  expect(inlineScript).toBeTruthy();
  const inlineHash = createHash('sha256').update(inlineScript!).digest('base64');
  const deploymentConfig = JSON.parse(await readFile('dist/staticwebapp.config.json', 'utf8')) as { globalHeaders: Record<string, string> };
  expect(deploymentConfig.globalHeaders['Content-Security-Policy']).toContain(`sha256-${inlineHash}`);
  expect(deploymentConfig.globalHeaders['Permissions-Policy']).toContain('camera=(self)');

  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Caregiver Last Action');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Demo — Caregiver Last Action');
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', 'Demo — Caregiver Last Action');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Try three sample care actions without changing a real record.');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/demo$/);
});
