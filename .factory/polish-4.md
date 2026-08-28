# Polish 4 — zero-finding closure

Repair commit: `8fad36b` (`8fad36bcaa1b05873a1f85bb99942544a2cd0a54`).
Production deployment: Azure Static Web Apps deployment
`2a20e8e7-e1d4-4b1c-b0bf-67b62982f7ff`.

Every review and polish record was read before repair. The table maps every
finding ID to its implemented state and the evidence used to recheck it.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the specific first screen: job, baby-caregiver audience, one sample action, result, and three facts. | Fresh `app.spec.ts` first-read setup; [live light mobile](../.factory/evidence-live/polish-4/live-demo-light-mobile.png); live `/` cold check. |
| F-1-2 | Kept `/demo` and `?demo=1`, separate `demo:` IndexedDB/key/channel, sample banner, Reset demo, Start for real, and offline cache. | `@claim:demo-isolation`, `@claim:offline-demo`; `LIVE_DEMO_RESET_START_REAL_SYNC=PASS`; live `/?demo=1`. |
| F-1-3 | Expanded the claim contract to 16 exact tagged claims. Removed inaccurate pairing-security promises, added deleted-history visibility, and added bidirectional sample/real pairing isolation. | All 16 fresh-clone claim commands; `@claim:deletion-history`; `@claim:demo-pairing-isolation`; live interaction pass. |
| F-1-4 | Retained deep backup validation before any merge/write. | `@claim:backup-merge` from the fresh clone. |
| F-1-5 | Kept checkout and purchase UI absent. | `@claim:no-purchase`; live link crawl. |
| F-1-6 | Kept direct Demo/legal routes, route metadata, discovery files, social card, and designed HTTP 404. | Built metadata test; live `/demo`, `/privacy/`, `/terms/`, `/robots.txt`, `/sitemap.xml`, and `/not-a-route` checks. |
| F-1-7 | Kept the common skip link, wordmark, nav, legal footer, attribution, and release build label. | Full browser suite legal-route test; live link crawl. |
| F-1-8 | Updated the deployed CSP hash for the rebuilt inline app and retained Permissions-Policy. | Built metadata/CSP hash test; live response headers. |
| F-1-9 | Kept `/manifest.json` and correct manifest JSON serving. | Live `/manifest.json` returned 200 `application/json`. |
| F-1-10 | Kept descriptive headings and the terminology table’s care action, latest care action, and handoff board terms. | `.factory/copy-audit.md`; live mobile screenshot. |
| F-1-11 | Kept inactive payment and merchant jargon removed. | `@claim:no-purchase`; live crawl. |
| F-1-12 | Kept the README introduction split into short caregiver-facing sentences. | `.factory/copy-audit.md`. |
| F-1-13 | Kept obsolete paid-pairing copy removed. | README review; live sharing section. |
| F-1-14 | Kept the README test description short and current. | README and clean 52-browser-test run. |
| F-1-15 | Kept inactive license implementation details removed. | README review; `@claim:no-purchase`. |
| F-1-16 | Kept protocol jargon out of caregiver-facing README copy. | README and copy audit. |
| F-1-17 | Kept artwork provenance in design records rather than visitor promises. | `.factory/design.md`; README review. |
| F-1-18 | Kept product copy plain, short, and consistent. | `.factory/copy-audit.md`. |
| F-2-1 | Kept available two-device sample pairing and verified an action arrives on the paired board. | `@claim:paired-demo-sync`; `LIVE_DEMO_RESET_START_REAL_SYNC=PASS`. |
| F-2-2 | Kept the initial service-worker controller-change guard and bumped the shell cache to `cla-shell-v8`. | Fresh-clone offline tests and `@claim:offline-demo`. |
| F-2-3 | Kept focused route h1 and polite route announcement after Demo/Start for real transitions. | `announces and focuses each document route`; live reset/return check. |
| F-3-1 | Kept recording and visible correction claims; added visible, reload-safe deletion history. | `@claim:record-care-actions`, `@claim:visible-correction-history`, and `@claim:deletion-history`. |
| F-3-2 | Kept complete metadata for root, Demo, Privacy, Terms, and 404. | Built-output metadata test; live route checks. |
| F-3-3 | Kept care-action terminology in board, history, empty state, README, and audit. | `.factory/copy-audit.md`; live screenshot. |
| F-3-4 | Kept the three-step guide and clear medical/privacy limit section. | Live `/demo` screenshot and cold check. |
| F-3-5 | Kept result-naming pairing controls, including Close pairing. | `@claim:paired-demo-sync`; live sample sync. |
| Mobile overlap | Kept the Demo banner in normal sticky flow above the first action on phones. | `keeps the mobile demo banner clear of the first care action`; live light mobile screenshot. |
| F-4-1 | Gave the Demo banner explicit night-surface text/action colors, so light-theme token changes cannot lower contrast. | Route-specific light-Demo axe test; fresh full suite; live light `/demo` axe and screenshot. |
| F-4-2 | Renamed the pairing recovery action from **Try again** to **Enter invitation again**. | `@claim:demo-pairing-isolation`; live bidirectional mismatch check. |

## Evidence summary

- Fresh clone: `/tmp/caregiver-last-action-polish4.0YdZCM` at `8fad36b`.
  `npm ci`, all 16 listed claim commands individually, `npm test` (5),
  `npm run build`, and `npm run test:e2e` (52) passed.
- Build: `dist/index.html` is 25.37 kB gzip.
- Local captures: `.factory/evidence-local/polish-4/demo-light-mobile.png`,
  `.factory/evidence-local/polish-4/demo-dark-desktop.png`, and the
  `verify/` report/captures.
- Mobile Lighthouse: Performance 99, Accessibility 100, LCP 1.1 s, CLS 0.007,
  total blocking time 110 ms.
- Live captures: `.factory/evidence-live/polish-4/live-demo-light-mobile.png`
  and `verify/`. `verify-url.sh` passed at
  `https://caregiver-last-action.sociobot.in/demo` with no console errors.
- Live route/header checks: root, Demo, `?demo=1`, Privacy, Terms, robots,
  sitemap, and manifest returned 200; unknown route returned designed HTTP 404;
  CSP and Permissions-Policy matched the deployed build.

There are no unresolved findings.
