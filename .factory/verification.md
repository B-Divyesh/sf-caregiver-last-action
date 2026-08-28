# Independent verification — FAIL

Work order: `caregiver-last-action-verify-1`  
Verified: 2026-08-28 (UTC)  
Candidate: `a8c633fc3631b11976545288d0065bce8a77a5f2`  
Live URL: <https://caregiver-last-action.sociobot.in/>

## Verdict

**FAIL.** The live deployment is the tested candidate and the core local PWA
flow works, but two release-blocking requirements fail: malformed import input
can persist an unrecoverable local state, and the product-unlock API has no
observed rate limit. Do not release as accepted until both are corrected and
re-verified.

## Local, reproducible checks

Clean checkout was already exactly at the candidate and had no pre-existing
worktree changes. `npm ci` installed 75 packages with 0 audit vulnerabilities.

| Check | Result | Evidence |
| --- | --- | --- |
| Unit tests | PASS | `npm test`: 5/5 Vitest tests passed. |
| Types / exact production build | PASS | `npm run build` (`tsc --noEmit && vite build`) passed; produced `dist/`. |
| Browser integration | PASS | `npm run test:e2e`: 12 passed, 2 intended mobile duplicate paid-branch skips; final Playwright status `passed`. |
| Bundle / assets | PASS | `dist/index.html` is 71,420 bytes, 23.43 kB gzip. Mobile AVIF is 13,737 bytes; all initial JS is in the 71 kB app shell, well below the 200 kB JS budget. |

No lint command exists in `package.json`; the build performs the available
TypeScript check.

## Product flows exercised independently

- Desktop and 390×844 mobile live sessions: empty board, timed Feed start/end,
  instant Diaper and Medicine records, end-time-first headline, correction
  with note, persistence, CSV export, and valid correction recovery all
  worked. The visual review found no clipping or bottom-nav overlap.
- Invalid correction time (`end < start`) displayed: “End time must be the
  same as or later than start time.” The user could correct it and save.
- Keyboard-only live use: skip link received a visible `3px` brass focus ring,
  Enter moved focus to `main`, action and dialog controls were operable, native
  dialog initial focus was the labelled close control, and Escape closed it.
- Two isolated local browser contexts completed the encrypted invitation /
  response exchange and synchronised a Medicine record (the repository E2E
  test). The application uses WebRTC plus AES-GCM; no remote relay was
  requested.
- Controlled live service worker was `activated` with scope `/`; an offline
  reload succeeded and an offline Medicine write updated the board. Reduced
  motion reduced transition and loading animation durations to `0.00001s`.
  The deployed worker exactly matches `public/sw.js` (SHA-256
  `c0603d25460688b2a2590055336830cb3cc84cc510568fe5b2fcd35363e79054`).
  Its update path is present (`updatefound` toast → `SKIP_WAITING` →
  `clients.claim`/controller reload); an actual update toast cannot be induced
  without changing the deployed version.
- Live axe WCAG 2 A/AA scan at 390px: 0 serious/critical findings (0 total).
  No browser console errors or page errors were captured in either viewport.
- Live Lighthouse (headless Chromium): Performance **99**, Accessibility
  **100**, Best Practices **100**, SEO **100**; LCP 1.2 s, CLS 0, TBT 149 ms,
  total transfer 38 KiB.

## Deployment identity, privacy, and policies

- Live `/` returned HTTP 200 and was byte-identical to `dist/index.html`:
  71,420 bytes and SHA-256
  `804d49f85ca3f08e478fc29de7049d1422dfad32e26754265d13f112151eb5b8`.
  The earlier deployment-only failure is therefore **not reproducible**.
- Fresh unlicensed desktop/mobile loads made requests only to
  `https://caregiver-last-action.sociobot.in` (document, same-origin art, and
  same-origin manifest connectivity probe). Source inspection and runtime
  capture found no analytics, CDN script/font, or third-party request. Care
  data persists in IndexedDB; only a supplied license triggers the documented
  Sociobot verification request. `/privacy/` and `/terms/` both returned 200.
- The licensing API CORS preflight permits exactly the live product origin,
  supports GET, and its invalid-license response is `200`, JSON, and
  `Cache-Control: no-store`.
- Live root headers include HSTS, `Referrer-Policy:
  strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`.
  They lack CSP and Permissions-Policy. All static paths observed use
  `Cache-Control: public, must-revalidate, max-age=30`; the manifest is served
  as `application/octet-stream` rather than a manifest JSON type.

## Defects

### High — malformed JSON import can brick the local application

The import validator accepts only a shallow shape. In a clean live browser I
imported this accepted JSON:

```json
{"version":1,"events":[{"id":"broken"}],"corrections":[],"settings":{}}
```

The page reported “This change could not be saved. Try again.”, but it had
already persisted the malformed state. Reload then showed:

`Could not open the local record. Cannot read properties of undefined (reading 'timed')`

The record is left unusable until the person clears site storage, which risks
loss of their handoff history. Validate every event/correction/settings field
and reject before persistence; then add a regression E2E test and a recovery
path for already-corrupt state.

### High — product-unlock verification endpoint has no observed rate limit

Against
`GET https://api.sociobot.in/api/v1/products/caregiver-last-action/verify?license=…`,
a 60-request burst (12 concurrent requests, distinct invalid tokens) returned
**60 × HTTP 200**. No response was HTTP 429 and no `Retry-After` header was
present, so no threshold was observed through 60 rapid requests. This violates
the explicit server-endpoint acceptance requirement and permits unbounded
verification probing. Add an API-side per-client/product limiter that returns
429 plus `Retry-After`, then re-run this burst and record the threshold.

### Medium — missing browser hardening policy for sensitive local data

The live deployment sends no `Content-Security-Policy` or `Permissions-Policy`.
The app has input escaping and no observed third-party content, but a strict
CSP/frame-ancestor policy and a camera-limited Permissions-Policy should be
applied before a sensitive family-data release.

### Low — short cache lifetime / manifest MIME compatibility

Static files are revalidated every 30 seconds rather than receiving immutable
long-lived asset caching, and `manifest.webmanifest` is served as
`application/octet-stream`. The app works in Chromium and its service worker
caches the shell, but these deployment settings fall short of the intended PWA
caching policy and may reduce install compatibility/performance elsewhere.

## Re-test criteria

1. Reject malformed imports without modifying IndexedDB and provide a safe
   recovery path for any invalid stored state.
2. Enforce and demonstrate `429` plus `Retry-After` on the licensing endpoint.
3. Apply CSP/Permissions-Policy and appropriate cache/MIME settings, then
   repeat the live response-policy probe.
