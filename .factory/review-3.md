# Adversarial first-read review 3 — Caregiver Last Action

**Verdict: FAIL.** Reviewed 2026-08-28 against the live deployment in fresh
Chromium contexts at 390×844 and 1440×1000, and against a clean local clone of
`9a9b583`. The product works end to end, but five findings remain. Three reopen
earlier findings and are blocking under the review-history rule.

## Cold read

Before scrolling on both phone and desktop, my answer was: “This shows baby
caregivers which feed, sleep, medicine, or diaper action happened last. I should
click **Try it with sample data** to see three example entries.”

The exact first-screen copy supplies all three answers:

- What: “See the last baby-care action.”
- For whom: “For baby caregivers handing off feeds, sleep, medicine, and diapers.”
- First click: “Try it with sample data” beside “See three realistic handoff entries.”

No cold-read blocker was found. The mobile first screen also showed all three
plain facts before scrolling.

## Findings

### F-3-1 — BLOCKING — the claim registry is still incomplete (reopens F-1-3)

**Exact quotes/locations:** README: “Start and end feeds or sleep.”, “Record
medicine or diaper changes in one tap.”, and “Correct an entry without hiding
its history.” Landing empty state: “Start a feed or sleep below, or record
medicine or a diaper change in one tap.” None has an entry in
`.factory/claims.json`.

The untagged browser test at `tests/e2e/app.spec.ts:11` exercises Feed and
Medicine, and the untagged test at line 25 exercises a correction. An untagged
test is not the required one-to-one `@claim:<id>` contract. The correction test
also checks only the new note and a “Corrected” badge. The live correction
history lists a reason and timestamp but does not reveal the before/after values,
so “without hiding its history” is not fully observable to a caregiver.

**Why this misleads:** recording and visible correction history are core brief
requirements. A visitor can rely on these statements, but the clean claim
matrix cannot prove them. The correction wording promises more than the UI
shows.

**Concrete fix:** add `record-care-actions` and `visible-correction-history` to
the registry. Tag tests that start and end Feed and Sleep, record Medicine and
Diaper with one activation each, and verify the resulting rows. Show the old and
new time/note values in correction history, then test that display after reload.
Alternatively remove or narrow each sentence that is not guaranteed.

### F-3-2 — BLOCKING — social metadata remains incomplete (reopens F-1-6)

**Exact locations:** live `/privacy/` and `/terms/` have no `og:description`,
`twitter:title`, `twitter:description`, or `twitter:image`. Live `/demo` changes
the document title to “Demo — Caregiver Last Action”, but its Open Graph and
Twitter titles remain “Caregiver Last Action — last baby-care action”. The
designed 404 has no meta description, canonical, Open Graph metadata, Twitter
metadata, or Apple touch icon.

**Why this matters:** the earlier route/discovery finding was marked fixed, but
shared legal/demo links still do not carry complete route-specific previews and
the 404 does not meet the same metadata baseline. This is a half-fix of an
earlier finding, so it is blocking in this review.

**Concrete fix:** give Demo, Privacy, Terms, and 404 complete route-specific
description, canonical where appropriate, Open Graph title/description/image,
Twitter title/description/image/card, favicon, and Apple touch icon metadata.
Add a built-output test for every route rather than checking only the browser
title and h1.

### F-3-3 — BLOCKING — the same care item still has several names (reopens F-1-10)

**Exact quotes/locations:** the board labels one concept “Current care action”
and “Latest care action”; the hero promises “three realistic handoff entries”;
the empty-state h3 says “The next action becomes the handoff”; README says
“Correct an entry”; and the history empty state says “Your record will appear
here.”

**Why this slows a first read:** the design’s terminology table says a completed
item is a “care action” and the latest item is the “latest care action”. “Entry”,
“record”, “action”, and “handoff” are used for the same item. “The next action
becomes the handoff” also does not identify a task when heard in a heading list.
The earlier terminology/heading finding is therefore only partially fixed.

**Concrete fix:** use “care action” for the item throughout. Suggested rewrites:
“See three realistic care actions.”, “Record the first care action.”, “Completed
care actions appear here.”, and “Correct a care action without hiding its
history.” Remove “Current care action” or change it to a distinct label such as
“Handoff board”, leaving “Latest care action” as the one name for the result.

### F-3-4 — HIGH — the landing page omits two required skeleton sections

**Location:** after the live product UI, the page goes directly to the footer.
There is no “How it works” sequence and no on-page “What it does not do” or
privacy section. The medical limitation appears only in README and Terms.

**Why this matters:** a caregiver can try the product, but there is no short
explanation of the timed versus instant actions, pairing sequence, or the
medicine-recording limitation. This is especially important for a health-adjacent
tool.

**Concrete fix:** after the live UI, add three short steps: record a care action,
check the latest action, and pair the other caregiver. Follow them with “A
household record, not medical guidance”, stating that the app gives no dosing,
predictions, or safety recommendations and linking to Privacy and Terms.

### F-3-5 — MINOR — two pairing buttons do not name their result

**Exact quotes/locations:** landing pairing panel: “Join invitation”; second
device response dialog: “Done”.

**Why this slows use:** a person joins a caregiver or enters an invitation, not
an invitation itself. “Done” does not say that it closes the pairing response.

**Concrete fix:** use “Enter invitation” and “Close pairing”. Add these dialog
labels to the copy audit.

## Demo and sandbox verification

- One click on **Try it with sample data** opened `/demo` with the persistent
  “Demo — sample data, nothing is saved.” banner, Reset demo, and Start for real.
- The first demo screen was already in use: Mila’s latest action was Diaper with
  “Wet diaper”, followed by realistic Feed and Sleep rows.
- After recording Medicine, Reset demo restored Diaper and exactly three rows;
  the added Medicine row disappeared.
- A real Diaper action created before entering Demo remained the real latest
  action after Start for real. The browser held distinct
  `caregiver-last-action` and `demo:caregiver-last-action` databases and distinct
  real/demo device-id keys.
- The complete live demo flow made no third-party requests. After service-worker
  readiness and network interception, `/demo` reloaded and recorded Medicine
  offline.
- Two isolated live demo contexts paired by invitation; Medicine recorded on
  the host appeared on the guest board.

## Claim matrix

Every command in `.factory/claims.json` was run individually from a clean local
clone. All 12 registered claims passed in both configured Chromium projects.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `latest-action` | PASS | Diaper headed the sample board and appeared in history. |
| `demo-isolation` | PASS | Demo changes did not replace the real Diaper action. |
| `csv-export` | PASS | CSV contained its header and Feed, Sleep, and Diaper rows. |
| `offline-demo` | PASS | Demo reloaded and recorded Medicine offline. |
| `private-demo` | PASS | Every request in the demo action flow was same-origin. |
| `backup-merge` | PASS | Malformed nested data was rejected and existing data survived reload. |
| `backup-json` | PASS | JSON had version 1 and all three sample actions. |
| `backup-import` | PASS | A valid Medicine action appeared after import. |
| `backup-preserves-newer` | PASS | An older imported variant did not replace the newer local action. |
| `local-persistence` | PASS | A real Medicine action survived reload. |
| `paired-demo-sync` | PASS | Medicine crossed between two paired sample boards. |
| `no-purchase` | PASS | No purchase action was exposed. |

F-3-1 remains blocking because visitor claims are absent from the registry, not
because a listed test failed.

## Copy audit

Counts treat hyphenated terms and URLs as one word. Dynamic times, caregiver
names, and sample record values are excluded. No sentence exceeds 22 words and
no banned marketing adjective appears.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to the handoff board | 5 | pass |
| Caregiver Last Action | 3 | pass |
| Demo / History / Backups / Privacy | 1 each | pass |
| A clear handoff | 3 | pass |
| See the last baby-care action. | 5 | covered by `latest-action` |
| For baby caregivers handing off feeds, sleep, medicine, and diapers. | 10 | pass |
| Try it with sample data | 5 | pass |
| See three realistic handoff entries. | 5 | F-3-3: inconsistent term |
| Sample data is separate | 4 | covered by `demo-isolation` |
| Works after the first visit offline | 6 | covered by `offline-demo` |
| No purchase needed | 3 | covered by `no-purchase` |
| Saved on this device | 4 | covered by `local-persistence` |
| Opening the handoff board… | 4 | pass |
| Current care action | 3 | F-3-3: conflicts with “Latest care action” |
| Latest care action | 3 | pass |
| The next action becomes the handoff. | 6 | F-3-3: vague heading and inconsistent term |
| Start a feed or sleep below, or record medicine or a diaper change in one tap. | 16 | F-3-1: unlisted claim |
| Tap to start Feed | 4 | F-3-1: unlisted result |
| Tap to start Sleep | 4 | F-3-1: unlisted result |
| Tap to record Medicine | 4 | F-3-1: unlisted one-click result |
| Tap to record Diaper | 4 | F-3-1: unlisted one-click result |
| Earlier today | 2 | pass |
| Recent care actions | 3 | pass |
| Export CSV | 2 | covered by `csv-export` |
| No completed actions yet. | 4 | pass |
| Your record will appear here. | 5 | F-3-3: inconsistent term |
| Another device | 2 | pass |
| Share with another caregiver | 4 | pass |
| Device pairing | 2 | covered by `paired-demo-sync` |
| Share with the next caregiver. | 5 | pass |
| Show an invitation on one device. | 6 | pass |
| Scan or paste it on the other. | 7 | pass |
| New care actions then appear on both boards. | 8 | covered by `paired-demo-sync` |
| Not connected | 2 | pass |
| Create invitation | 2 | pass |
| Join invitation | 2 | F-3-5: unclear result |
| Your household | 2 | pass |
| Names and backups | 3 | pass |
| Baby’s name (optional) | 3 | pass |
| Your name (optional) | 3 | pass |
| Save names | 2 | pass |
| Move a saved record | 4 | pass; “record” means the whole backup here |
| Export a complete backup or merge one from another device. | 10 | covered by `backup-json` and `backup-import` |
| Imports keep newer changes. | 4 | covered by `backup-preserves-newer` |
| Export backup / Import backup | 2 each | covered by backup claims |
| Board / History / Connect / Settings | 1 each | pass |
| Clear handoffs for baby caregivers. | 5 | pass |
| Privacy / Terms | 1 each | pass |
| Built by Param Factory · build 91cf973 | 6 | pass |
| Demo — sample data, nothing is saved. | 6 | covered by `demo-isolation` |
| Reset demo / Start for real | 2 / 3 | manually verified |
| You’re offline. Changes will stay on this device. | 8 | covered by offline and persistence claims |
| Done | 1 | F-3-5: does not name the result |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Caregiver Last Action | 3 | pass |
| See the last baby-care action for a clear caregiver handoff. | 10 | covered by `latest-action` |
| For baby caregivers handing off feeds, sleep, medicine, and diapers. | 10 | pass |
| Start and end feeds or sleep. | 6 | F-3-1: unlisted claim |
| Record medicine or diaper changes in one tap. | 8 | F-3-1: unlisted claim |
| Correct an entry without hiding its history. | 7 | F-3-1 and F-3-3 |
| Try the isolated sample board: URL. | 6 | pass |
| Sample data never changes a real record. | 7 | covered by `demo-isolation` |
| Use Start for real in the demo banner when ready. | 10 | pass |
| What it does | 3 | pass |
| Shows the latest completed care action first. | 7 | covered by `latest-action` |
| Exports completed care actions as CSV. | 6 | covered by `csv-export` |
| Exports and imports backups. | 4 | covered by `backup-json` and `backup-import` |
| Imports keep newer changes. | 4 | covered by `backup-preserves-newer` |
| Works offline after the first visit. | 6 | covered by `offline-demo` |
| The sample board makes no third-party requests. | 7 | covered by `private-demo` |
| Paired devices share new care actions. | 6 | covered by `paired-demo-sync` |
| This is a household record, not medical guidance. | 8 | pass: scope statement |
| It does not provide dosing, predictions, or safety recommendations. | 9 | pass: scope statement |
| Run, test, and build | 4 | pass |
| Requires Node.js 22+ and npm. | 5 | pass |
| The static deployment directory is `dist/`. | 6 | pass |
| Deploy it as a Static Web App; the included configuration sets the route, security, cache, and manifest rules. | 18 | pass; developer instruction |
| Verify claims | 2 | pass |
| Run every command in `.factory/claims.json` from a clean checkout. | 9 | pass |
| Browser tests cover recording, pairing, corrections, exports, demo isolation, offline use, accessibility, legal pages, and safe imports. | 17 | pass; verified in the clean suite |
| Privacy | 1 | pass |
| Care actions are saved in this browser. | 7 | covered by `local-persistence` |
| See Privacy and Terms. | 4 | pass |
| License | 1 | pass |
| MIT — see LICENSE. | 4 | pass |

## Earlier-finding verification

Every finding in `review-1.md` and `review-2.md`, plus both polish records and
the prior handoff, was checked against the live site and current source.

| Earlier finding | Review 3 result |
| --- | --- |
| F-1-1 first-screen clarity | Fixed; verified in both cold viewports. |
| F-1-2 missing/unsafe demo | Fixed; live namespace, reset, real-data isolation, banner, and offline use verified. |
| F-1-3 missing claim contract | **Half-fixed; reopened as F-3-1.** |
| F-1-4 destructive malformed import | Fixed; clean tagged test passed and validator rejects before merge. |
| F-1-5 dead checkout | Fixed; no checkout/purchase surface exists. |
| F-1-6 route/discovery/social metadata | **Half-fixed; reopened as F-3-2.** |
| F-1-7 inconsistent route skeleton | Fixed; skip links, wordmark, nav, legal links, attribution, and build id are present. |
| F-1-8 missing CSP/Permissions-Policy | Fixed; both headers are live and load without violations. |
| F-1-9 manifest MIME | Fixed; `/manifest.json` returns `application/json`. |
| F-1-10 unclear headings/inconsistent nouns | **Half-fixed; reopened as F-3-3.** |
| F-1-11 payment jargon | Fixed; payment surface is absent. |
| F-1-12 long README introduction | Fixed; no current sentence exceeds 22 words. |
| F-1-13 long paid-pairing bullet | Fixed; removed. |
| F-1-14 long README test sentence | Fixed; current sentence is 17 words. |
| F-1-15 license implementation sentence | Fixed; removed. |
| F-1-16 protocol-jargon sentence | Fixed; removed from README. |
| F-1-17 long artwork sentence | Fixed; removed from README. |
| F-1-18 unexplained README jargon | Fixed for caregiver copy; developer terms remain in developer sections. |
| F-2-1 unavailable two-device handoff | Fixed; live two-context pairing and sync passed. |
| F-2-2 service-worker reload race | Fixed; full clean browser suite passed. |
| F-2-3 missing route focus/announcement | Fixed; Demo, Start for real, and browser Back restored URL, focused h1, and announced the route. |

## Structure, links, accessibility, and identity

- Root, Demo, Privacy, Terms, robots, sitemap, and manifest returned 200. An
  unknown URL returned the designed 404. Every actual product link returned 200;
  the two explicit `mailto:` links were excluded from HTTP checks.
- Every route had `lang="en"`, one h1, one main landmark, a valid route title,
  and a favicon. Metadata exceptions are listed in F-3-2.
- Browser Back restored `/`, the correct title, focused h1, and polite route
  announcement. Deep links and hash links worked.
- The live verification script reported one h1, one main, no missing image alt,
  no unlabeled button, and no console errors. The clean Playwright axe integration
  found no serious or critical WCAG 2 A/AA violations in light or dark schemes.
- `npm test` passed 5 tests; `npm run build` produced `dist/index.html` at 23.95
  kB gzip; `npm run test:e2e` passed 38 tests across phone and desktop projects.
- The moonlit nursery art, bedside-clock hierarchy, slate/brass palette, and
  horizon mark match `.factory/design.md`. The site is visually distinct and is
  not a generic SaaS template. The missing skeleton sections are F-3-4.

## Missed leverage and AI

No additional AI feature is justified. This safety-adjacent coordination job is
better served by deterministic recording. The brief-implied export/import,
offline use, correction flow, and two-device sync are present. The correction
history needs the completeness described in F-3-1; that is a core repair, not an
AI opportunity.

## What would make this perfect

Close the claim registry around all recording and correction promises, and show
the actual before/after correction history. Complete route-specific social
metadata, use “care action” consistently, add the required three-step and
privacy/limitations sections, and replace the two vague pairing actions. Then
re-run the complete clean claim matrix and live checklist. Only zero findings
warrants PASS.
