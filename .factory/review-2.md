# Adversarial first-read review 2 — Caregiver Last Action

**Verdict: FAIL.** Reviewed 2026-08-28 against the live deployment in fresh Chromium contexts at 390×844 and 1440×1000, and against clean checkout `a2a1d4c` after `npm ci`.

## Cold read

**Mobile and desktop, before scrolling:** “This is a board that tells baby caregivers what feed, sleep, medicine, or diaper action happened last. I should click **Try it with sample data** first to see three handoff entries.” All three answers were available in the first screen from the exact copy “See the last baby-care action.”, “For baby caregivers handing off feeds, sleep, medicine, and diapers.”, and “Try it with sample data / See three realistic handoff entries.” No cold-read finding.

## Findings

### F-2-1 — BLOCKING — the two-device handoff promised by the brief is unavailable

**Location/quote:** live landing, **Share with another caregiver**: “Share is not available in this release.” and “This release keeps the handoff board on one device. Export a backup to move a record to another device.” `src/app.ts` sets `pairingAvailable = false`.

**Why:** the researched job is two or more caregivers handing off care. The brief’s smallest useful product explicitly includes “a locally synced PWA for two devices” and encrypted QR pairing. Manual backup transfer is not a current, unambiguous shared last-action answer; it asks a caregiver to export and move a file at the very moment the product is meant to remove uncertainty.

**Fix:** ship the existing encrypted QR pairing path as a tested, available feature with an isolated canned demo, or explicitly change the researched brief and product positioning to a one-device personal log. Add a claim test that pairs two clean browser contexts and asserts a completed care action reaches the other board without changing either real record from demo mode.

### F-1-3 — BLOCKING (regression) — claim registry remains incomplete and a security claim is shown for a disabled feature

**Location/quote:** desktop live landing shows **“End-to-end encrypted”** immediately above “Share is not available in this release.” The same section exposes “Your name (shown to a paired caregiver)”. The landing also says “Saved on this device”, “Your record stays yours”, and “Imports never erase newer changes.” README says “Exports and imports backups.” and “The app stores care actions in this browser.” None has a corresponding claim in `.factory/claims.json`.

**Why:** polish 1 recorded F-1-3 as resolved by removing unprovable encryption copy. The deployed desktop surface has restored it, although no sharing is offered and no `end-to-end-encrypted` claim/test exists. The other statements are visitor-relevant persistence, privacy, and merge promises without an exact sandbox proof. Existing entries prove demo isolation, safe *invalid* imports, and complete JSON export; they do not prove real-state persistence, valid backup import, or that valid imports never erase newer changes.

**Fix:** while sharing is unavailable, remove the encryption badge and paired-caregiver label. Otherwise add an exact encrypted-pairing claim and demo fixture. Add separately tagged observable tests for real local persistence, valid JSON import, and merge preservation; add matching registry entries for each retained sentence. Remove “Your record stays yours” and artwork-origin copy unless they can be stated precisely and tested.

### F-2-2 — BLOCKING — the clean-checkout browser suite is not reliable

**Location/evidence:** from the clean checkout, `npm test` passed (5/5) and `npm run build` passed, but `npm run test:e2e` failed in `tests/e2e/app.spec.ts:48` during **loads the app shell and records locally while offline**. The failure reproduced when that test was run alone: `page.evaluate: Execution context was destroyed, most likely because of a navigation` while awaiting `navigator.serviceWorker.ready`. The app’s `controllerchange` handler unconditionally reloads the page.

**Why:** a required end-to-end quality check fails from a clean install. The isolated tagged `@claim:offline-demo` command passed, so this is a test/application service-worker race rather than evidence that the offline claim is untested. It nevertheless makes the release gate unreliable and can hide a genuine offline regression.

**Fix:** make service-worker activation deterministic in the test and application: wait for the first controller change before evaluating readiness, or avoid reload during initial registration. Re-run `npm run test:e2e` until the full suite is stable; retain the tagged offline test as well.

### F-2-3 — MINOR — navigation does not move focus or announce the new route

**Location/evidence:** clicking **Demo** performs a document navigation. `/demo` updates its title to “Demo — Caregiver Last Action”, but `src/app.ts` neither focuses the new `<h1>` nor writes a route-change message to an aria-live region. The same is true when **Start for real** returns to `/`.

**Why:** keyboard and screen-reader visitors land on a new state without the focus/announcement behaviour required for real routes. The route has correct URL and title, but it does not provide the required transition cue.

**Fix:** after initialization, focus the route’s `<h1 tabindex="-1">` and announce “Demo board opened” or “Caregiver Last Action opened” in a polite live region. Add a browser test for Demo → Back and Start for real → Back that asserts URL, focus, and announcement.

## Demo and sandbox checks

- **PASS:** one click on **Try it with sample data** opened `/demo` directly on a realistic Mila board: latest **Diaper**, note **Wet diaper**, plus Feed and Sleep history. The persistent visible banner said “Demo — sample data, nothing is saved.” and provided **Reset demo** and **Start for real**.
- **PASS:** Reset restored the three sample entries. A fresh demo context used only `demo:caregiver-last-action` IndexedDB and `demo:cla_device_id` local storage. The live demo action flow made only same-origin requests.
- **PASS:** after service-worker readiness, a live demo reload while network-intercepted offline retained the banner and recorded Medicine as the latest action.

## Claim commands

All eight registered commands were run from the clean install. The tagged commands passed individually, including the isolated offline and privacy/network checks.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `latest-action` | PASS | Demo Diaper is first on the board and appears in history. |
| `demo-isolation` | PASS | Demo Medicine does not change a real Diaper record. |
| `csv-export` | PASS | Download contains header plus feed, sleep, and diaper rows. |
| `offline-demo` | PASS | Demo reloads offline and records Medicine. |
| `private-demo` | PASS | Demo flow has same-origin requests only. |
| `backup-merge` | PASS | Malformed backup is rejected and the saved Demo Medicine record survives reload. |
| `backup-json` | PASS | Download contains version 1 and all three sample actions. |
| `no-purchase` | PASS | No purchase path is exposed. |

F-1-3 remains blocking because the registry does not cover every live claim, not because a registered command failed.

## Earlier-review verification

Every finding in `review-1.md` and `polish-1.md` was checked again against the live deployment and source.

| Earlier finding | Result |
| --- | --- |
| F-1-1 first-screen clarity | Fixed. The first screen names baby caregivers, care types, sample action, and its result. |
| F-1-2 demo isolation | Fixed. `/demo` and `?demo=1` use the documented `demo:` namespace, samples, banner, reset, and Start for real. |
| F-1-3 claims registry | **Regressed / half-fixed; reissued above.** |
| F-1-4 malformed import | Fixed. The tagged malformed nested-event test rejects before write and survives reload. |
| F-1-5 dead checkout | Fixed. No checkout or purchase link remains. |
| F-1-6 metadata, discovery, 404 | Fixed. `/demo` title, canonical/social metadata, robots, sitemap, icon, and designed HTTP 404 all work. |
| F-1-7 shared skeleton | Fixed. Home, legal pages, and 404 have skip link, wordmark, nav, legal footer, attribution, and build id. |
| F-1-8 missing CSP / Permissions-Policy | Fixed. Live responses include both matching policies. |
| F-1-9 manifest MIME | Fixed. `/manifest.json` is `application/json`. |
| F-1-10 headings / nouns | Fixed for the primary board headings: Latest care action, Recent care actions, Share with another caregiver, Names and backups. The disabled sharing copy is covered by F-2-1/F-1-3. |
| F-1-11 payment jargon | Fixed by removing the inactive payment surface. |
| F-1-12 through F-1-18 README copy and technical jargon | Fixed; current caregiver-facing sentences are short and the inactive pairing/protocol copy is absent. |

## Structure, links, and identity

- **PASS:** live root, `/demo`, `/privacy/`, `/terms/`, `/robots.txt`, `/sitemap.xml`, and `/manifest.json` returned 200. `/not-a-route` returned a designed HTTP 404 with ways home and to demo. `mailto:` links were explicit.
- **PASS:** root, demo, Privacy, Terms, and 404 each had one h1, a useful route title, language, description (where applicable), canonical, favicon/Apple icon, original social card, skip link, main, and consistent header/footer.
- **PASS:** live CSP, Permissions-Policy, Referrer-Policy, and `nosniff` headers were present. No console/page errors occurred in fresh 390px or desktop loads.
- **PASS:** the moonlit-room artwork, bedside-clock hierarchy, dark slate/brass palette, and calm low-motion interface match `.factory/design.md` and do not read as a generic SaaS template.
- **FAIL:** route focus/announcement is F-2-3.

## Copy audit

Counts treat hyphenated words and URLs as one word. Dynamic clock values and sample record data are excluded; every static landing and README sentence/label is listed. No item exceeds 22 words and no banned marketing adjective appears.

### Landing

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to the handoff board | 5 | pass |
| Caregiver Last Action | 3 | pass |
| Demo / History / Backups / Privacy | 1 each | pass |
| A clear handoff | 3 | pass |
| See the last baby-care action. | 6 | pass |
| For baby caregivers handing off feeds, sleep, medicine, and diapers. | 9 | pass |
| Try it with sample data | 5 | pass |
| See three realistic handoff entries. | 5 | pass |
| Demo stays on this device | 6 | covered by `private-demo` |
| Works after the first visit offline | 6 | covered by `offline-demo` |
| No purchase needed | 3 | covered by `no-purchase` |
| Saved on this device | 4 | F-1-3: unlisted persistence claim |
| Opening the handoff board… | 4 | pass |
| Current care action / Latest care action | 3 / 3 | pass |
| The next action becomes the handoff. | 6 | pass |
| Start a feed or sleep below, or record medicine or a diaper change in one tap. | 16 | pass |
| Tap to start Feed / Tap to start Sleep | 4 each | pass |
| Tap to record Medicine / Tap to record Diaper | 4 each | pass |
| Earlier today / Recent care actions | 2 / 3 | pass |
| Export CSV | 2 | covered by `csv-export` |
| No completed actions yet. | 4 | pass |
| Your record will appear here. | 5 | pass |
| Another device / Share with another caregiver | 2 / 4 | F-2-1 context |
| End-to-end encrypted | 2 | F-1-3: jargon, unlisted, contradicts disabled sharing |
| Share is not available in this release. | 7 | F-2-1 |
| This release keeps the handoff board on one device. | 9 | F-2-1 |
| Export a backup to move a record to another device. | 10 | F-2-1 |
| Go to backups | 3 | pass |
| Your household / Names and backups | 2 / 3 | pass |
| Baby’s name (optional) | 3 | pass |
| Your name (shown to a paired caregiver) | 7 | F-1-3: misleading while pairing is unavailable |
| Save names | 2 | pass |
| Your record stays yours | 4 | F-1-3: unlisted privacy claim |
| Export a complete backup or merge one from another device. | 10 | F-1-3: valid import/merge unlisted |
| Imports never erase newer changes. | 5 | F-1-3: unlisted merge claim |
| Export backup / Import backup | 2 each | F-1-3: positive import is untested |
| Board / History / Connect / Settings | 1 each | pass |
| Clear handoffs for baby caregivers. | 5 | pass |
| Privacy / Terms | 1 each | pass |
| Built by Param Factory · build 33576e1 | 6 | pass |
| Night-watch artwork was generated for this product. | 7 | F-1-3: unlisted provenance claim |
| Demo — sample data, nothing is saved. | 6 | covered by `demo-isolation` |
| Reset demo / Start for real | 2 / 3 | pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| See the last baby-care action for a clear caregiver handoff. | 10 | pass |
| For baby caregivers handing off feeds, sleep, medicine, and diapers. | 9 | pass |
| Start and end feeds or sleep. | 6 | pass |
| Record medicine or diaper changes in one tap. | 8 | pass |
| Correct an entry without hiding its history. | 7 | pass |
| Try the isolated sample board: URL | 6 | pass |
| Sample data never changes a real record. | 7 | covered by `demo-isolation` |
| Use Start for real in the demo banner when ready. | 10 | pass |
| What it does | 3 | pass |
| Shows the latest completed care action first. | 7 | covered by `latest-action` |
| Exports completed care actions as CSV. | 6 | covered by `csv-export` |
| Exports and imports backups. | 4 | F-1-3: positive import unlisted |
| Invalid backups do not change the saved record. | 8 | covered by `backup-merge` |
| Works offline after the first visit. | 6 | covered by `offline-demo` |
| Keeps demo data on the device. | 6 | covered by `private-demo` |
| It sends no third-party requests. | 5 | covered by `private-demo` |
| This is a household record, not medical guidance. | 8 | pass: scope disclaimer |
| It does not provide dosing, predictions, or safety recommendations. | 9 | pass: scope disclaimer |
| Requires Node.js 22+ and npm. | 5 | pass |
| The static deployment directory is `dist/`. | 6 | pass |
| Deploy it as a Static Web App; the included configuration sets route, security, cache, and manifest rules. | 16 | pass |
| Run every command in `.factory/claims.json` from a clean checkout. | 9 | pass |
| Browser tests cover recording, corrections, exports, demo isolation, offline use, accessibility, legal pages, and safe imports. | 14 | pass |
| The app stores care actions in this browser. | 8 | F-1-3: unlisted real-storage claim |
| Backups are created only when you choose them. | 8 | F-1-3: unlisted privacy claim |
| See Privacy and Terms. | 4 | pass |
| MIT — see LICENSE. | 3 | pass |

## Missed leverage / AI

**Finding F-2-1 applies:** two-device sync is the obvious, brief-required missing capability. No AI feature is required for this narrow, safety-adjacent coordination tool; adding AI would be decorative and should not substitute for sync.

## What would make this perfect

Restore a tested two-device handoff or honestly narrow the brief and product to a one-device record. Make every remaining visitor claim exact, registered, and observable in the demo sandbox. Then eliminate the service-worker test race and add route focus/announcement coverage. Re-run the full clean-checkout suite and this complete live review; only zero findings warrants PASS.
