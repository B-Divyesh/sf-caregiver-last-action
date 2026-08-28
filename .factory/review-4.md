# Adversarial first-read review 4 — Caregiver Last Action

**Verdict: FAIL.** Reviewed 2026-08-28 against the live deployment in fresh
Chromium contexts at 390×844 and 1440×1000, and against clean clone
`/tmp/caregiver-last-action-review4.LjONpZ` at `fbd0eb1`. Three findings remain.
Two are blocking: the required demo banner is unreadable in the light theme,
and the claim registry has regressed around reachable workflow guarantees.

## Cold read

Before scrolling on both phone and desktop, my answer was: “This shows baby
caregivers the latest feed, sleep, medicine, or diaper action. I should click
**Try it with sample data** to see three realistic care actions.”

The exact first-screen copy answered all three questions:

- What: “See the last baby-care action.”
- For whom: “For baby caregivers handing off feeds, sleep, medicine, and diapers.”
- First click and result: “Try it with sample data” beside “See three realistic care actions.”

All three short facts were also above the fold at 390 px. No cold-read finding
was found.

## Findings

### F-4-1 — BLOCKING — the demo banner is unreadable in the light theme

**Exact location/quotes:** live `/demo`, the required banner containing “Demo —
sample data, nothing is saved.”, “Reset demo”, and “Start for real”. In a fresh
390×844 context with `prefers-color-scheme: light`, axe reports:

- banner text: `#172225` on `#263940`, **1.34:1**;
- both actions: `#8b5d00` on `#263940`, **2.10:1**.

All three fail the required 4.5:1 ratio. The defect is visible in the live
mobile screenshot: the status sentence is nearly lost against the banner.
`src/styles.css:186-191` hard-codes the dark banner background while the light
media query changes `--ink` and `--brass` to dark colors.

**Why a first-time visitor is lost:** this is the persistent notice that says
the visitor is using disposable data and exposes the only reset and exit
actions. A light-theme phone can obscure the sandbox boundary and its controls.
That makes the required demo weak, so it is blocking.

**Concrete fix:** in the light media query, either use a light banner surface
with the light-theme text tokens, or retain the night banner with explicit
`#f5f1e8` text and `#f3c969` actions. Add an axe assertion after navigating to
`/demo` with `colorScheme: 'light'`; the existing accessibility test audits `/`
only and therefore misses this route-specific failure.

### F-1-3 — BLOCKING (regression) — workflow guarantees are absent from the claim contract

**Exact live locations/quotes:** the pairing dialogs reachable from **Create
invitation** and **Enter invitation** say:

- “Preparing a direct connection on this device.”
- “Keep it private: anyone who sees it during pairing could join.”
- “Invitation expires when this dialog or app is closed.”
- “Creating the encrypted response…”
- on a real/demo mismatch, “Sample boards can only pair with another sample board.”

The correction deletion confirmation also says “The deletion will remain in
correction history.” The `visible-correction-history` test edits a note; it does
not delete a care action or assert that the deletion remains visible. A live
deletion and reload left zero Diaper rows, zero “Deleted” text, and no control
that could reopen that event’s correction history. The tombstone exists in
storage but the promised history is not visible to the caregiver.

No `.factory/claims.json` entry lists deletion history, direct transport,
invitation lifetime, pairing authorization, response encryption, or cross-mode
pairing isolation. `paired-demo-sync` proves only that a care action crosses
between two demo boards. `demo-isolation` does not attempt real-to-demo pairing.

The encryption wording is also inaccurate. A response captured from the live
dialog decoded from `cla1.z.<base64url>` to plain deflate-compressed JSON with
`{"v":1,"s":{"type":"answer","sdp":"…"},"d":true}`. Care records are
encrypted later with AES-GCM in `src/peer.ts`; the response itself is not
encrypted.

**Why this misleads:** this product handles family and health-adjacent data.
A caregiver can reasonably read these lines as guarantees about transport,
authorization, expiry, and sandbox separation, but the clean claim matrix does
not prove them and one line describes the wrong object as encrypted. This
reopens the earlier incomplete-claims finding, so the history rule makes it
blocking under the same ID.

**Concrete fix:** change the transient copy to “Preparing pairing on this
device.” and “Creating response…”. Replace the expiry guarantee with “Keep this
dialog open while the other caregiver responds.” Keep any direct/encryption or
code-holder claim only with a dedicated observable claim test. Add a separate
`demo-pairing-isolation` entry/test that tries both real→demo and demo→real
invitations, asserts rejection, records on each side, reloads, and confirms no
care action crossed namespaces. Add a deletion-history claim/test that deletes
a sample care action, reloads, and shows the deleted status in correction
history.

### F-4-2 — MINOR — a pairing error button does not name its result

**Exact location/quote:** pairing error dialog, button **“Try again”**.

**Why:** it does not say which failed step will reopen. This is especially
ambiguous after scanning, pasting, and creating a response are all possible.

**Concrete fix:** rename it **“Enter invitation again”**. That is the screen the
button actually opens.

## Demo and sandbox verification

- One click from `/` opened `/demo` with Mila’s latest **Diaper** action, “Wet
  diaper”, and three realistic Diaper, Feed, and Sleep rows already visible.
- The persistent banner, Reset demo, and Start for real were present. F-4-1 is
  the light-theme readability failure, not a missing control.
- Recording Medicine and immediately selecting Reset restored Diaper and
  exactly three rows; Medicine disappeared.
- A real Diaper action created before entering Demo remained the real latest
  action after Start for real.
- The browser used distinct `caregiver-last-action` and
  `demo:caregiver-last-action` IndexedDB databases and distinct real/demo
  device-ID keys.
- The complete action flow made no third-party HTTP request. After service
  worker readiness, `/demo` reloaded offline and recorded Medicine.
- Two fresh live demo contexts paired and synced Medicine. A real invitation
  entered on a demo board was rejected with “Sample boards can only pair with
  another sample board.” The behavior passed manually, but the claim-contract
  gap is F-1-3.

## Claim matrix

Every command in `.factory/claims.json` was run individually from the clean
clone. Each command passed in both configured Chromium projects.

| Claim ID | Result | Observable evidence |
| --- | --- | --- |
| `latest-action` | PASS | Diaper headed the sample board. |
| `record-care-actions` | PASS | Feed and Sleep started/ended; Medicine and Diaper recorded; seven rows resulted. |
| `visible-correction-history` | PASS | Reloaded history showed reason and labeled Before/After values. |
| `demo-isolation` | PASS | Demo changes/reset did not replace the real Diaper action. |
| `csv-export` | PASS | CSV contained its header and Feed, Sleep, and Diaper rows. |
| `offline-demo` | PASS | Demo reloaded and recorded Medicine offline. |
| `private-demo` | PASS | Every HTTP request in the tested demo action flow was same-origin. |
| `backup-merge` | PASS | A malformed nested event was rejected and the saved action survived reload. |
| `backup-json` | PASS | JSON had version 1 and all three sample actions. |
| `backup-import` | PASS | A valid imported Medicine action appeared. |
| `backup-preserves-newer` | PASS | An older imported variant did not replace the newer local action. |
| `local-persistence` | PASS | Medicine survived reload. |
| `paired-demo-sync` | PASS | Medicine crossed between two paired sample boards. |
| `no-purchase` | PASS | No purchase path was exposed. |

All listed tests pass, but the reachable unlisted pairing claims in F-1-3 mean
the claim contract is not complete.

## Copy audit

Counts treat a hyphenated term as one word. Dynamic names, times, and sample
record values are data and are excluded. Repeated strings are listed once.
No copy exceeds 22 words and no banned marketing adjective appears. The only
jargon/claim flags and non-result button are identified below.

### Landing and product surface

| Copy unit | Words | Result |
| --- | ---: | --- |
| Skip to the handoff board | 5 | pass |
| Caregiver Last Action | 3 | pass |
| Demo / History / Backups / Privacy | 1 each | pass |
| A clear handoff | 3 | pass |
| See the last baby-care action. | 5 | `latest-action` |
| For baby caregivers handing off feeds, sleep, medicine, and diapers. | 10 | pass |
| Try it with sample data | 5 | pass: result-naming action |
| See three realistic care actions. | 5 | `demo-isolation` |
| Sample data is separate | 4 | `demo-isolation` |
| Works after the first visit offline | 6 | `offline-demo` |
| No purchase needed | 3 | `no-purchase` |
| Saved on this device | 4 | `local-persistence` |
| Opening the handoff board… | 4 | pass |
| Demo — sample data, nothing is saved. | 6 | `demo-isolation`; contrast F-4-1 |
| Reset demo / Start for real | 2 / 3 | pass; contrast F-4-1 |
| Handoff board / Latest care action | 2 / 3 | pass |
| Record the first care action. | 5 | `record-care-actions` |
| Start a feed or sleep below. | 6 | `record-care-actions` |
| Record medicine or a diaper change in one tap. | 9 | `record-care-actions` |
| Tap to start Feed / Tap to start Sleep | 4 each | `record-care-actions` |
| Tap to record Medicine / Tap to record Diaper | 4 each | `record-care-actions` |
| Earlier today / Recent care actions | 2 / 3 | pass |
| Export CSV | 2 | `csv-export`; result-naming action |
| No completed care actions yet. | 5 | pass |
| Completed care actions appear here. | 5 | pass |
| Another device / Share with another caregiver | 2 / 4 | pass |
| Device pairing | 2 | pass |
| Share with the next caregiver. | 5 | pass |
| Show an invitation on one device. | 6 | `paired-demo-sync` |
| Scan or paste it on the other. | 7 | `paired-demo-sync` |
| New care actions then appear on both boards. | 8 | `paired-demo-sync` |
| Not connected | 2 | pass |
| Create invitation / Enter invitation | 2 each | pass: result-naming actions |
| Your household / Names and backups | 2 / 3 | pass |
| Baby’s name (optional) / Your name (optional) | 3 each | pass |
| Save names | 2 | pass: result-naming action |
| Move a backup | 3 | pass |
| Export a complete backup or merge one from another device. | 10 | `backup-json`, `backup-import` |
| Imports keep newer changes. | 4 | `backup-preserves-newer` |
| Export backup / Import backup | 2 each | pass: result-naming actions |
| A calm routine / How this handoff board works | 3 / 5 | pass |
| Record a care action | 4 | pass |
| Start and end feeds or sleep. | 6 | `record-care-actions` |
| Check the latest care action | 5 | pass |
| The latest completed care action stays at the top. | 9 | `latest-action` |
| Pair another caregiver | 3 | pass |
| Enter it on the other. | 5 | `paired-demo-sync` |
| New care actions appear on both boards. | 7 | `paired-demo-sync` |
| Use it with care | 4 | pass |
| A household record, not medical guidance | 6 | clear scope heading |
| This app gives no dosing, predictions, or safety recommendations. | 9 | clear scope statement |
| Read Privacy and Terms for data and safety details. | 9 | pass |
| Board / History / Connect / Settings | 1 each | pass |
| Clear handoffs for baby caregivers. | 5 | pass |
| Built by Param Factory · build 2398528 | 6 | pass |
| You’re offline. | 2 | `offline-demo` |
| Changes will stay on this device. | 6 | `local-persistence` |

### Reachable dialogs and state copy

| Copy unit | Words | Result |
| --- | ---: | --- |
| Visible correction / Correct this diaper care action | 2 / 5 | pass |
| Reason for correction (shown in correction history) | 7 | `visible-correction-history` |
| No earlier corrections. | 3 | pass |
| Delete care action / Save correction | 3 / 2 | pass: result-naming actions |
| End time must be the same as or later than start time. | 12 | clear error |
| The deletion will remain in correction history. | 7 | F-1-3: unlisted and not visible after deletion/reload |
| Preparing a direct connection on this device. | 7 | F-1-3: jargon and unlisted transport claim |
| Let the other caregiver scan this code. | 7 | pass |
| Keep it private: anyone who sees it during pairing could join. | 11 | F-1-3: unlisted authorization claim |
| Invitation expires when this dialog or app is closed. | 9 | F-1-3: unlisted lifetime claim |
| Copy code / Enter their response | 2 / 3 | pass: result-naming actions |
| The other caregiver will show a response code. | 8 | pass |
| Copy it on that device and paste it below. | 9 | pass |
| Finish pairing | 2 | pass: result-naming action |
| Scan the invitation shown on the first device, or paste its pairing code. | 13 | pass |
| Scan invitation QR / Create response | 3 / 2 | pass: result-naming actions |
| Creating the encrypted response… | 4 | F-1-3: inaccurate, unlisted security claim |
| Keep this screen open until the first device says connected. | 10 | pass instruction |
| Close pairing | 2 | pass: result-naming action |
| Sample boards can only pair with another sample board. | 9 | F-1-3: unlisted sandbox claim |
| Try again | 2 | F-4-2: does not name the reopened step |
| QR scanning is not supported here. | 6 | clear error |
| Copy and paste the code instead. | 6 | clear next step |
| Hold the QR inside the frame | 6 | pass |
| Camera access was unavailable. | 4 | clear error |
| Close this and paste the pairing code instead. | 8 | clear next step |
| This change could not be saved. | 6 | clear error |
| Try again. | 2 | clear next step in toast context |
| The sample could not be reset. | 6 | clear error |
| Reload and try again. | 4 | clear next step |

### README

Code commands are excluded because they are commands, not prose sentences.

| Copy unit | Words | Result |
| --- | ---: | --- |
| Caregiver Last Action | 3 | pass |
| See the last baby-care action for a clear caregiver handoff. | 10 | `latest-action` |
| For baby caregivers handing off feeds, sleep, medicine, and diapers. | 10 | pass |
| Start and end feeds or sleep. | 6 | `record-care-actions` |
| Record medicine or diaper changes in one tap. | 8 | `record-care-actions` |
| Correct a care action without hiding its history. | 8 | `visible-correction-history` |
| Try the isolated sample board: URL. | 6 | pass |
| Sample data never changes a real record. | 7 | `demo-isolation` |
| Use Start for real in the demo banner when ready. | 10 | pass |
| What it does | 3 | pass |
| Shows the latest completed care action first. | 7 | `latest-action` |
| Exports completed care actions as CSV. | 6 | `csv-export` |
| Exports and imports backups. | 4 | `backup-json`, `backup-import` |
| Imports keep newer changes. | 4 | `backup-preserves-newer` |
| Works offline after the first visit. | 6 | `offline-demo` |
| The sample board makes no third-party requests. | 7 | `private-demo` |
| Paired devices share new care actions. | 6 | `paired-demo-sync` |
| This is a household record, not medical guidance. | 8 | clear scope statement |
| It does not provide dosing, predictions, or safety recommendations. | 9 | clear scope statement |
| Run, test, and build | 4 | pass |
| Requires Node.js 22+ and npm. | 5 | appropriate developer requirement |
| The static deployment directory is dist/. | 6 | appropriate developer instruction |
| Deploy it as a Static Web App; the included configuration sets the route, security, cache, and manifest rules. | 18 | appropriate developer instruction |
| Verify claims | 2 | pass |
| Run every command in .factory/claims.json from a clean checkout. | 9 | pass |
| Browser tests cover recording, pairing, corrections, exports, demo isolation, offline use, accessibility, legal pages, and safe imports. | 17 | verified, except route-specific axe gap F-4-1 |
| Privacy | 1 | pass |
| Care actions are saved in this browser. | 7 | `local-persistence` |
| See Privacy and Terms. | 4 | pass |
| License | 1 | pass |
| MIT — see LICENSE. | 3 | pass |

### Terminology

| Concept | One product term | Result |
| --- | --- | --- |
| Completed feed, sleep, medicine, or diaper item | care action | consistent |
| Most recent completed item | latest care action | consistent |
| Top-of-screen summary | handoff board | consistent |
| Downloaded household data | backup | consistent |
| Isolated try-out content | sample data | consistent |
| Linked device connection | pairing | consistent |

## Earlier-finding verification

Every earlier review, polish record, and handoff was read. Each finding was
checked against the live site and current source, not accepted from its prior
status.

| Earlier ID | Review 4 result |
| --- | --- |
| F-1-1 first-screen clarity | Fixed; verified cold in both viewports. |
| F-1-2 missing/unsafe demo | Fixed behaviorally; namespaces, reset, real-data isolation, banner, and offline sample passed. F-4-1 is a new banner contrast failure. |
| F-1-3 incomplete claim contract | **Regressed; reopened above with the same ID.** |
| F-1-4 destructive malformed import | Fixed; tagged clean test rejected the nested invalid event and preserved the record. |
| F-1-5 dead checkout | Fixed; no checkout or purchase action exists. |
| F-1-6 metadata/discovery/404 | Fixed; every route has complete metadata and unknown URLs return the designed 404. |
| F-1-7 inconsistent route skeleton | Fixed; shared skip link, brand, navigation, legal footer, attribution, and build ID are present. |
| F-1-8 missing CSP/Permissions-Policy | Fixed; both policies are live and load without violations. |
| F-1-9 manifest MIME | Fixed; `/manifest.json` is `application/json`. |
| F-1-10 unclear headings/inconsistent nouns | Fixed; semantic headings scan independently and product terms match the terminology table. |
| F-1-11 payment jargon | Fixed; payment copy is absent. |
| F-1-12 long README introduction | Fixed; each current sentence is at most 22 words. |
| F-1-13 long paid-pairing bullet | Fixed; removed. |
| F-1-14 long README test sentence | Fixed; 17 words. |
| F-1-15 license implementation sentence | Fixed; removed. |
| F-1-16 protocol-jargon sentence | Fixed in README; F-1-3 separately covers reachable pairing-dialog security jargon/claims. |
| F-1-17 long artwork sentence | Fixed; removed from README. |
| F-1-18 unexplained README jargon | Fixed; remaining technical terms are in developer instructions. |
| F-2-1 unavailable two-device handoff | Fixed; two live contexts paired and synced Medicine. |
| F-2-2 service-worker reload race | Fixed; individual offline claims and the full 44-test suite passed. |
| F-2-3 missing route focus/announcement | Fixed; Demo and browser Back focused h1 and announced the route. |
| F-3-1 missing recording/correction claims | Fixed; both tagged claims pass and correction history shows labeled values. |
| F-3-2 incomplete route metadata | Fixed on root, Demo, Privacy, Terms, and 404. |
| F-3-3 inconsistent care-item terms | Fixed; “care action” is used consistently. |
| F-3-4 missing how-it-works/limits sections | Fixed; both sections are live. |
| F-3-5 vague pairing actions | Fixed; “Enter invitation” and “Close pairing” are live. F-4-2 is a different error action. |
| Mobile demo-banner overlap | Fixed; the banner stays in document flow and does not cover the latest action. |

## Structure, links, accessibility, and identity

- Root, Demo, Privacy, Terms, robots, sitemap, manifest, social card, and icons
  returned 200. An unknown URL returned the designed 404. Every HTTP link in
  the product returned 200; explicit `mailto:` links were excluded.
- Root and Demo titles follow “Product — what it does” / “Demo — Product”.
  Privacy, Terms, and 404 have route-specific titles. Every page has `lang=en`,
  one h1, one main landmark, description, canonical, Open Graph/Twitter data,
  favicon, and Apple icon. The social card is 1200×630.
- Deep links load correctly. Demo and browser Back restore the URL, title,
  focused h1, and polite announcement. Hash links point to existing targets.
- `/opt/fleet/lib/verify-url.sh` on live `/demo` passed: no console errors, one
  h1, one main, no missing image alt, and no unlabeled buttons.
- Live Playwright axe found no serious/critical issue on root, Privacy, or Terms
  in light/dark, and none on Demo in dark. Demo in light fails F-4-1.
- The moonlit nursery art, bedside-clock hierarchy, slate/brass palette, and
  horizon mark match `.factory/design.md`. The site is visually distinct and
  not a generic SaaS template. Reduced-motion rules and 44 px controls are
  present.
- The clean clone passed `npm test` (5), `npm run build` (`dist/index.html`,
  25.10 kB gzip), and `npm run test:e2e` (44 across phone/desktop).

## Missed leverage and AI

No missing AI feature is justified. This safety-adjacent coordination job is
better served by deterministic records. The brief-implied import/export,
offline use, correction history, and two-device sync are present. No provider
key or decorative AI feature is embedded. The remaining pairing work is claim
accuracy and test coverage, not an AI opportunity.

## What would make this perfect

Make the required Demo status and actions meet 4.5:1 in the light theme and add
route-specific axe coverage. Remove or precisely test every pairing transport,
security, expiry, and sandbox statement; do not call the response encrypted.
Rename “Try again” to “Enter invitation again”. Re-run every clean claim command,
the complete suite, live light/dark axe, and this full checklist. Only zero
findings should change the verdict to PASS.
