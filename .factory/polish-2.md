# Polish 2 — zero-finding closure

Product repair commit: `91cf973`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the plain first screen: job, audience, one-click sample action, and result are visible before scrolling. | `app.spec.ts` first-read setup; `.factory/evidence-local/demo-mobile-viewport.png`; live root check. |
| F-1-2 | Kept `/demo` and `?demo=1` sample mode, banner, reset, Start for real, separate IndexedDB/local-storage namespaces, and offline cache. Demo broadcasts and pairing now have separate demo-only channels. | `@claim:demo-isolation`, `@claim:offline-demo`; live `/demo` check. |
| F-1-3 | Expanded the registry to eleven observable claims, added local persistence, valid import, newer-merge, and paired-board tests, and removed unprovable privacy/asset copy. | Every command in `.factory/claims.json` passed from a clean install. |
| F-1-4 | Retained deep import validation; malformed nested events are rejected before state is written. | `@claim:backup-merge`. |
| F-1-5 | Kept the inactive purchase surface removed. | `@claim:no-purchase`; live root link check. |
| F-1-6 | Retained direct demo/legal routes, titles, metadata, discovery files, manifest, and designed 404 configuration. | `test:e2e` legal/direct-route coverage; live route/status checks. |
| F-1-7 | Retained consistent headers, skip links, navigation, legal footer, attribution, and repair build id on app, legal, and 404 pages. | browser legal-route test; live route check. |
| F-1-8 | Retained CSP and Permissions-Policy configuration. | live response-header check. |
| F-1-9 | Retained `/manifest.json` serving configuration. | live manifest check. |
| F-1-10 | Retained descriptive board section headings and the consistent “care action” term. | `.factory/copy-audit.md`; mobile screenshot. |
| F-1-11 | Kept inactive payment jargon removed. | `@claim:no-purchase`. |
| F-1-12 | Kept the README introduction split into short task sentences. | `.factory/copy-audit.md`. |
| F-1-13 | Replaced unavailable pairing copy with available, tested device pairing. | `@claim:paired-demo-sync`. |
| F-1-14 | Kept the README test description short and current. | README copy audit. |
| F-1-15 | Kept inactive license details absent. | `@claim:no-purchase`. |
| F-1-16 | Kept protocol jargon out of caregiver-facing README copy. | README copy audit. |
| F-1-17 | Kept generated-art provenance in design records rather than visitor-facing promises. | `.factory/design.md`; copy audit. |
| F-1-18 | Kept caregiver-facing documentation in plain language. | `.factory/copy-audit.md`. |
| F-2-1 | Enabled the existing encrypted QR/WebRTC path, with invitation mode binding so a real board cannot pair with a demo board. | `@claim:paired-demo-sync` uses two clean demo contexts and observes Medicine on the second board. |
| F-2-2 | Stopped reloading on the initial service-worker controller change; reload only follows an explicit update request. | Full `npm run test:e2e` passes (38 tests), including both offline tests. |
| F-2-3 | Focus the route h1 after initialization and announce the route in a polite live region. | `announces and focuses each document route`. |
| Mobile overlap | Moved the demo banner into document flow on phones and made it sticky rather than overlaying the first care action. | `keeps the mobile demo banner clear of the first care action`; `.factory/evidence-local/demo-mobile-viewport.png`. |

Final local evidence: `npm test` (5 passed), `npm run build` (production shell
23.97 kB gzip), and `npm run test:e2e` (38 passed). The full claim-command
matrix passed individually after `npm ci`. Screenshot evidence is retained in
`.factory/evidence-local/demo-mobile-viewport.png` and
`.factory/evidence-local/demo-desktop.png`. Cold live checks at
`https://caregiver-last-action.sociobot.in/?demo=1` exposed one final CSP hash
mismatch; the matching rebuilt hash was deployed and the live route/header
checks were repeated successfully.
