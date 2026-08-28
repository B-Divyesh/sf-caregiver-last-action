# Caregiver Last Action — polish 3 handoff

## Done

- Closed every finding in `.factory/review-1.md`, `.factory/review-2.md`, and
  `.factory/review-3.md`. The detailed finding map is in
  `.factory/polish-3.md`.
- Added two claims and their observable browser tests: record all four care
  actions and show correction history with labeled before/after values.
- Made demo reset wait for queued IndexedDB writes before clearing the isolated
  `demo:` database. Reset now reliably restores Mila’s three sample care
  actions even immediately after recording one.
- Completed Demo, Privacy, Terms, and 404 metadata; added built-output CSP,
  Permissions-Policy, and route-metadata checks.
- Added the required how-it-works and medical-limit sections while preserving
  the quiet-night-watch visual system. Updated terminology throughout to
  **care action**.
- Updated the catalog description to the verb-first sentence: “See the latest
  baby-care action before the next caregiver arrives.”

## Verification

Final source commits: `2398528`, `c4e0229`, `65f56b2` on `main`; all are
pushed to `origin/main`.

From a final clean clone at `/tmp/caregiver-last-action-polish-3-final.1ndqFi`:

- `npm ci`: passed; 0 reported vulnerabilities.
- Every one of the 14 commands in `.factory/claims.json`: passed individually
  in both Chromium projects.
- `npm test`: 5 passed.
- `npm run build`: passed; `dist/index.html` 25.10 kB gzip, inline JS 17.53 kB
  gzip, inline CSS 5.02 kB gzip.
- `npm run test:e2e`: 44 passed across mobile and desktop Chromium. This
  includes axe WCAG 2 A/AA checks, offline reload/write, private demo traffic,
  direct routes, metadata/CSP hash checks, reset isolation, and pairing.

Local visual evidence:

- `.factory/evidence-local/demo-mobile-polish-3.png`
- `.factory/evidence-local/demo-desktop-polish-3.png`

Production deployment used `/opt/fleet/lib/deploy-static.sh caregiver-last-action dist`.
Azure deployment `c324b476-0afa-4862-b82c-8c6442599b6d` completed successfully
to `https://lively-flower-0d0850e10.7.azurestaticapps.net`, then the configured
custom domain was checked at `https://caregiver-last-action.sociobot.in`.

Cold live verification after that deployment:

- `/`, `/demo`, `/privacy/`, `/terms/`, `/robots.txt`, `/sitemap.xml`, and
  `/manifest.json` returned 200; an unknown route returned the styled 404.
- `/manifest.json` returned `application/json`. Root responses included the
  matching CSP hash, Permissions-Policy, Referrer-Policy, and
  X-Content-Type-Options.
- A fresh mobile browser context verified first-screen wording, demo banner,
  live Demo metadata, sample Medicine, immediate Reset demo back to 3 rows and
  Diaper, Start for real isolation, focus/announcement, and offline Medicine.
- Two fresh live demo contexts paired and synced Medicine. Live axe found 0
  serious/critical issues. `/opt/fleet/lib/verify-url.sh` on `/demo` reported
  no console errors, `lang="en"`, one h1, one main, zero missing image alts,
  and zero unlabeled buttons.
- Lighthouse mobile on live `/demo`: performance 100, accessibility 96, LCP
  1.0 s, CLS 0.007.

Live evidence:

- `.factory/evidence-live/demo-mobile-live.png`
- `.factory/evidence-live/verify-demo/screenshot-desktop.png`
- `.factory/evidence-live/verify-demo/screenshot-mobile.png`
- `.factory/evidence-live/lighthouse-demo-mobile.json`

## Run and deploy

```bash
npm ci
npm test
npm run build
npm run test:e2e
/opt/fleet/lib/deploy-static.sh caregiver-last-action dist
```

## Remaining work

None. The product remains a local-first offline PWA with no analytics or
third-party runtime assets.
