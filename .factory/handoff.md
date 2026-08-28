# Caregiver Last Action — polish 1 handoff

Work order: `caregiver-last-action-polish-1`

Base reviewed: `23a69b04164477134775c2a83884217ce9b5eac7`
Primary repair commit: `740e765381d83a51b52a9c9a1ef07da18aa94fd6`.
Deployment follow-up commit: `a02981c4b3596c1383489e51277f339c473c0d4f`.
Final CSP/deployment commit: `1ee53c50d48437dd1539c0e8b43b029497d753a5`.

## Delivered

- Rewrote the first screen for baby caregivers, with one visible sample action
  and three plain, tested facts.
- Added `/demo` and `?demo=1`: realistic Mila sample data, a persistent banner,
  reset, start-real link, separate `demo:` IndexedDB namespace, and offline
  precache.
- Added strict nested backup validation. Invalid files do not write to storage;
  an old invalid local value safely opens as an empty record instead of bricking
  the board.
- Removed the unverified Household-pass and pairing path from the release UI.
  The board, history, corrections, exports, and backups remain available.
- Added claims registry and demo-based browser tests, shared legal skeleton,
  metadata/social card/discovery files, styled 404, security/deploy headers,
  manifest MIME rule, and mobile contrast repair.

## Verification

Fresh dependency install: `npm ci` completed with 0 audit vulnerabilities.

- `npm test`: 5 passed.
- `npm run build`: passed; `dist/index.html` is 63.55 kB, 20.96 kB gzip.
- `npm run test:e2e`: 26 passed across Pixel 5 and desktop Chromium.
- Every command in `.factory/claims.json` passed individually from the fresh
  install: latest action, demo isolation, CSV, offline demo, demo privacy,
  safe import, JSON backup, and no-purchase surface.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ .factory/evidence-local`
  passed: HTTP 200, title, `lang=en`, one h1, main, zero missing image alt,
  zero unlabeled buttons, and zero browser errors. Screenshots:
  `.factory/evidence-local/screenshot-desktop.png` and
  `.factory/evidence-local/screenshot-mobile.png`.
- Playwright axe checks in the browser suite passed with zero serious/critical
  violations in dark and light treatments. The standalone `@axe-core/cli`
  command could not launch because its Selenium Chrome binary is absent; the
  repository's pinned Playwright axe integration is the recorded replacement.
- First live deployment exposed an inline-module CSP violation. The final CSP
  uses the exact module hash (`sha256-Vr7MLLWVdCNSMP7b8Ghyx4lBdOD1ZJrm9Npf9AhWga4=`)
  and is rechecked after the final deploy. Final live cold check: 902 ms,
  no console/page errors, title/lang/h1/main/alt/button checks all passed.

## Deploy

Deploy `dist/` as the static application. `public/staticwebapp.config.json` is
copied into `dist/` and contains the `/demo` rewrite, 404 override, CSP,
Permissions-Policy, cache policy, and manifest content type.

## Known product boundary

Live two-device pairing and its purchase flow are intentionally not offered in
this release because the reviewed checkout returned 404 and the external verify
endpoint did not demonstrate rate limiting. No purchase or verification request
is made by the repaired board. Re-enable only after the billing service is
registered and rate-limited, then restore a tested pairing UI.
