# Polish 3 — zero-finding closure

Repair commits: `2398528`, `c4e0229`, and `65f56b2`. Production deployment:
Azure Static Web Apps deployment `c324b476-0afa-4862-b82c-8c6442599b6d`.

Shared evidence: the final clean clone at
`/tmp/caregiver-last-action-polish-3-final.1ndqFi` passed `npm ci`, all 14
individual claim commands from `.factory/claims.json`, `npm test` (5 passed),
`npm run build`, and `npm run test:e2e` (44 passed in mobile and desktop
Chromium). Screenshots: `.factory/evidence-local/demo-mobile-polish-3.png`,
`.factory/evidence-local/demo-desktop-polish-3.png`, and
`.factory/evidence-live/verify-demo/screenshot-mobile.png`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the first screen plain and specific: baby caregivers, four care types, one **Try it with sample data** action, and its result. | Browser first-read setup; local mobile screenshot; live `/` cold check found headline, audience, CTA, and three facts. |
| F-1-2 | Retained `/demo` and `?demo=1`, separate `demo:` storage, sample banner, Start for real, and offline cache. Serialized writes before Reset demo clears storage, eliminating an immediate-reset race. | `@claim:demo-isolation`; live `/demo` recorded Medicine, reset to exactly 3 rows and Diaper, then returned to the real Diaper board. |
| F-1-3 | Expanded the registry to 14 one-to-one observable claims, including recording and correction history. | All 14 individual clean-clone claim commands passed; live demo flow and axe check passed. |
| F-1-4 | Kept deep backup validation before merge/write. | `@claim:backup-merge`; live build includes the validator. |
| F-1-5 | Kept purchase UI and checkout links absent. | `@claim:no-purchase`; live `/demo` exposed no purchase action. |
| F-1-6 | Completed static legal/404 metadata and dynamic Demo metadata; the build test now checks every generated route. | `uses complete route metadata in built output and on the demo route`; live `/demo`, `/privacy/`, `/terms/`, and 404 checks. |
| F-1-7 | Retained the shared wordmark, skip link, navigation, legal links, attribution, and build ID on app, legal, and 404 routes. | `legal pages are directly addressable`; live route crawl returned 200s and the designed 404. |
| F-1-8 | Updated the strict CSP hash for the rebuilt inline app and retained Permissions-Policy. | Built metadata/CSP test; live `/` headers include matching CSP and `camera=(self)`. |
| F-1-9 | Retained `/manifest.json` with manifest JSON content type. | Live `/manifest.json` returned 200 and `application/json`. |
| F-1-10 | Replaced competing item names with **care action**, **latest care action**, and **handoff board** for their distinct meanings. | `.factory/copy-audit.md`; local and live demo screenshots. |
| F-1-11 | Kept inactive payment and merchant jargon removed. | `@claim:no-purchase`; live `/demo` check. |
| F-1-12 | Kept the README introduction split into short task sentences. | `.factory/copy-audit.md`. |
| F-1-13 | Kept the README free of inactive paid-pairing copy. | README review and `@claim:no-purchase`. |
| F-1-14 | Kept the README browser-test description short and current. | `.factory/copy-audit.md`; clean-clone 44-test run. |
| F-1-15 | Kept obsolete license implementation copy removed. | README review and `@claim:no-purchase`. |
| F-1-16 | Kept protocol jargon out of caregiver-facing README copy. | `.factory/copy-audit.md`. |
| F-1-17 | Kept artwork provenance in design records rather than visitor-facing copy. | `.factory/design.md`; README review. |
| F-1-18 | Kept caregiver-facing documentation plain, short, and consistent. | `.factory/copy-audit.md`. |
| F-2-1 | Retained real two-device demo pairing and sync, with demo/real mode binding. | `@claim:paired-demo-sync`; live two-context pairing delivered Medicine to the guest board. |
| F-2-2 | Retained the service-worker controller-change guard. | `@claim:offline-demo`; live demo reloaded and recorded Medicine offline. |
| F-2-3 | Retained route h1 focus and polite route announcements. | `announces and focuses each document route`; live Demo → Start for real focused the h1 and announced the route. |
| F-3-1 | Added `record-care-actions` and `visible-correction-history`; correction history now shows reason plus labeled before/after times, notes, and status after reload. | Both tagged claim tests; clean-clone claim matrix; live demo check. |
| F-3-2 | Added complete route-specific Open Graph, Twitter, canonical, description, favicon, and Apple-touch metadata for Privacy, Terms, 404, and Demo. | Built-output metadata test; live `/demo`, `/privacy/`, `/terms/`, and 404 metadata checks. |
| F-3-3 | Changed handoff entries, current care action, empty state, and README correction wording to the terminology table. | `.factory/copy-audit.md`; live root copy is “See three realistic care actions.” |
| F-3-4 | Added the missing three-step “How this handoff board works” sequence and on-page medical/privacy limit section without changing the night-watch identity. | Mobile and desktop screenshots; live `/demo` cold check. |
| F-3-5 | Renamed **Join invitation** to **Enter invitation** and **Done** to **Close pairing**. | `@claim:paired-demo-sync`; live pairing flow. |
| Mobile overlap | Kept the banner in normal sticky document flow on phones. | `keeps the mobile demo banner clear of the first care action`; local and live mobile screenshots. |

There are no unresolved findings.
