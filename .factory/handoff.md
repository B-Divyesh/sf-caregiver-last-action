# Caregiver Last Action — review 2 handoff

Work order: `caregiver-last-action-review-2`
Reviewed commit: `a2a1d4c`
Result: **FAIL** — review documents only; no product code was changed.

## Completed review work

- Reviewed the deployed site cold at 390px and desktop, including live demo,
  reset, local demo storage namespace, same-origin network capture, and offline
  reload/write.
- Read the brief, design, claims, demo guide, all earlier review/polish/handoff
  material, source, README, and browser tests.
- Ran `npm ci`, `npm test` (5 passed), and `npm run build` (passed; production
  shell 20.96 kB gzip). Ran each tagged claim command; all eight passed.
- Ran the complete browser suite. It failed reproducibly in the untagged
  service-worker offline test because controller navigation destroys its
  execution context.
- Checked live route status/headers, metadata, 404, robots, sitemap, manifest,
  legal pages, links, and responsive console errors.

## Findings left

See `.factory/review-2.md` for exact evidence and fixes.

1. **BLOCKING:** two-device pairing/sync, part of the brief’s smallest useful
   product, is explicitly unavailable in the live release.
2. **BLOCKING:** F-1-3 regressed/was only partly repaired: desktop still claims
   “End-to-end encrypted” for unavailable sharing, and several persistence,
   import, and privacy claims are not registered or tested.
3. **BLOCKING:** the complete `npm run test:e2e` suite is flaky/failing in the
   service-worker readiness path.
4. **MINOR:** route changes do not focus the h1 or announce the new route.

## Re-run

```bash
npm ci
npm test
npm run build
npm run test:e2e
```

Then run every command in `.factory/claims.json`, and repeat the live demo
offline/privacy checks described in `.factory/review-2.md`.
