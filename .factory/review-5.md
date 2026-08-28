# Adversarial first-read review 5 — Caregiver Last Action

**Verdict: PASS.** Reviewed 2026-08-28 against the deployed site in fresh
Chromium contexts at 390×844 and 1440×1000, and against clean clone
`/tmp/caregiver-last-action-review5.8eVHqU` at `f787f31`.

There are **zero findings**. All prior findings were rechecked from scratch;
all registered claims were run individually; and no unlisted visitor-relevant
product claim, dead link, routing defect, accessibility failure, or copy flag
was found.

## Cold read

Before scrolling, in both fresh contexts, the product read as: “This shows the
last completed baby-care action for caregivers handing off feeds, sleep,
medicine, and diapers. Click **Try it with sample data** first to see three
realistic care actions.”

The first screen explicitly supplied all three required answers:

| Question | Exact first-screen evidence |
| --- | --- |
| What does it do? | “See the last baby-care action.” |
| For whom? | “For baby caregivers handing off feeds, sleep, medicine, and diapers.” |
| What should be clicked first? | “Try it with sample data” beside “See three realistic care actions.” |

At 390 px, all three facts were visible before scrolling: “Sample data is
separate”, “Works after the first visit offline”, and “No purchase needed”.
The first screen also showed the top of the live board. No cold-read blocker
was found.

## Demo and sandbox verification

- The first-screen action opened `/demo` in one click.
- The initial demo board already showed Mila’s latest **Diaper** action with
  “Wet diaper”, plus realistic Feed and Sleep records.
- The persistent “Demo — sample data, nothing is saved.” banner exposed both
  **Reset demo** and **Start for real**.
- Recording a demo Medicine action, then Reset demo, restored exactly the
  three sample rows and the Diaper latest action.
- A real Diaper action remained available after leaving demo mode. Code and
  runtime checks confirmed distinct `demo:caregiver-last-action` IndexedDB,
  `demo:cla_device_id` local-storage, and demo-only broadcast namespaces.
- The registered offline claim reloaded the demo and recorded Medicine after
  `context.setOffline(true)`. The registered privacy claim intercepted the
  entire demo flow and accepted same-origin requests only.
- Two isolated demo contexts paired and delivered a new Medicine action. The
  bidirectional real/demo attempt was rejected and no action crossed storage
  namespaces.

## Claim matrix

Each command listed in `.factory/claims.json` was run individually from the
clean clone. Every command passed in mobile and desktop Chromium; each registry
ID has exactly one matching `@claim:<id>` test. The full `npm run test:e2e`
run subsequently passed all 52 tests.

| Claim ID | Result | Observable outcome checked |
| --- | --- | --- |
| `latest-action` | PASS | The most recent sample Diaper headed the board. |
| `record-care-actions` | PASS | Feed and Sleep started/ended; Medicine and Diaper recorded. |
| `visible-correction-history` | PASS | Reloaded history showed reason and labeled before/after values. |
| `deletion-history` | PASS | Deleted Diaper remained reopenable with its correction history. |
| `demo-isolation` | PASS | Demo reset and actions did not alter a real Diaper record. |
| `csv-export` | PASS | Download contained CSV header and sample rows. |
| `offline-demo` | PASS | Demo reloaded and recorded while offline after first visit. |
| `private-demo` | PASS | Demo action flow made same-origin requests only. |
| `backup-merge` | PASS | Invalid nested input left the prior record usable after reload. |
| `backup-json` | PASS | Download contained version 1 and all three sample actions. |
| `backup-import` | PASS | Valid imported Medicine action appeared. |
| `backup-preserves-newer` | PASS | Older import did not replace a newer local action. |
| `local-persistence` | PASS | Recorded Medicine survived reload. |
| `paired-demo-sync` | PASS | New Medicine reached the paired sample board. |
| `demo-pairing-isolation` | PASS | Both real/sample pairing directions rejected and stayed isolated. |
| `no-purchase` | PASS | No purchase action was exposed. |

All claim-like product statements on the landing page and README map to these
entries where applicable: latest action, action recording, correction/deletion
history, isolation, CSV/JSON backup operations, persistence, offline behavior,
private demo traffic, pairing, and no-purchase status. The medical-scope text
is a limitation rather than a performance, privacy, or feature promise.

## Copy audit

Counts treat hyphenated terms as one word. Dynamic names, timestamps, and care
record values are excluded; repeated labels are listed once. Every static
landing/app and README sentence or visitor-facing label is at most 22 words.
No banned marketing term, jargon problem, inconsistent care-item term,
context-free heading, or non-result-naming button was found.

| Landing/app copy | Words | Check |
| --- | ---: | --- |
| Skip to the handoff board | 5 | action label |
| Caregiver Last Action | 3 | wordmark |
| Demo / History / Backups / Privacy | 1 each | navigation |
| A clear handoff | 3 | context label |
| See the last baby-care action. | 5 | `latest-action` |
| For baby caregivers handing off feeds, sleep, medicine, and diapers. | 10 | audience |
| One clear answer for Mila’s next caregiver. | 7 | sample context |
| Try it with sample data | 5 | primary action |
| See three realistic care actions. | 5 | demo result |
| Sample data is separate | 4 | `demo-isolation` |
| Works after the first visit offline | 6 | `offline-demo` |
| No purchase needed | 3 | `no-purchase` |
| Saved on this device | 4 | `local-persistence` |
| Opening the handoff board… | 4 | loading state |
| Demo — sample data, nothing is saved. | 6 | demo boundary |
| Reset demo / Start for real | 2 / 3 | demo actions |
| Handoff board / Latest care action | 2 / 3 | product terms |
| Record the first care action. | 5 | clear empty-state heading |
| Start a feed or sleep below. | 6 | recording instruction |
| Record medicine or a diaper change in one tap. | 9 | recording instruction |
| Tap to start Feed / Tap to start Sleep | 4 each | result-naming actions |
| Tap to record Medicine / Tap to record Diaper | 4 each | result-naming actions |
| Duration / Recorded as an instant action / Note | 1 / 5 / 1 | result labels |
| Earlier today / Recent care actions | 2 / 3 | headings |
| Export CSV | 2 | result-naming action |
| No completed care actions yet. | 5 | empty state |
| Completed care actions appear here. | 5 | empty-state next step |
| Corrected / Deleted / Deleted care actions | 1 / 1 / 3 | history state |
| This care action was deleted. | 5 | deletion state |
| Its correction history is kept below. | 6 | deletion explanation |
| View correction history for deleted diaper care action | 7 | result-naming action |
| Share with another caregiver | 4 | heading |
| Device pairing / Share with the next caregiver. | 2 / 5 | section labels |
| Show an invitation on one device. | 6 | pairing instruction |
| Scan or paste it on the other. | 7 | pairing instruction |
| New care actions then appear on both boards. | 8 | `paired-demo-sync` |
| Not connected / Waiting for the other device… / Connecting… | 2 / 6 / 1 | current state |
| Connected · changes sync live | 4 | paired state |
| Connection closed / Connection interrupted · records are still saved locally | 2 / 7 | state explanation |
| Create invitation / Enter invitation | 2 / 2 | result-naming actions |
| Preparing pairing on this device. | 5 | progress state |
| Show this code to the caregiver you are pairing. | 9 | instruction |
| Keep this dialog open while the other caregiver responds. | 9 | instruction |
| Creating response… | 2 | progress state |
| Sample and real boards cannot pair. | 6 | `demo-pairing-isolation` |
| Enter invitation again | 3 | recovery action |
| Scan the invitation shown on the first device, or paste its pairing code. | 13 | instruction |
| QR scanning is not supported here. | 6 | error explanation |
| Copy and paste the code instead. | 6 | error next step |
| Camera access was unavailable. | 4 | error explanation |
| Close this and paste the pairing code instead. | 8 | error next step |
| Names and backups / Move a backup | 3 / 3 | headings |
| Export a complete backup or merge one from another device. | 10 | backup operation |
| Imports keep newer changes. | 4 | `backup-preserves-newer` |
| Export backup / Import backup / Save names | 2 each | result-naming actions |
| How this handoff board works | 5 | heading |
| Start and end feeds or sleep. | 6 | recording instruction |
| The latest completed care action stays at the top. | 9 | `latest-action` |
| Enter it on the other. | 5 | pairing instruction |
| A household record, not medical guidance | 6 | scope heading |
| This app gives no dosing, predictions, or safety recommendations. | 9 | scope limitation |
| Read Privacy and Terms for data and safety details. | 9 | legal links |
| Clear handoffs for baby caregivers. | 5 | footer one-liner |
| Built by Param Factory · build 20260828.4 | 6 | build label |
| You’re offline. Changes will stay on this device. | 8 | offline status |
| This change could not be saved. Try again. | 8 | error and next step |
| The sample could not be reset. Reload and try again. | 10 | error and next step |

| README copy | Words | Check |
| --- | ---: | --- |
| Caregiver Last Action | 3 | document title |
| See the last baby-care action for a clear caregiver handoff. | 10 | `latest-action` |
| For baby caregivers handing off feeds, sleep, medicine, and diapers. | 10 | audience |
| Start and end feeds or sleep. | 6 | `record-care-actions` |
| Record medicine or diaper changes in one tap. | 8 | `record-care-actions` |
| Correct a care action without hiding its history. | 8 | `visible-correction-history` |
| Try the isolated sample board: URL. | 6 | demo entry point |
| Sample data never changes a real record. | 7 | `demo-isolation` |
| Use Start for real in the demo banner when ready. | 10 | demo exit instruction |
| What it does | 4 | heading |
| Shows the latest completed care action first. | 7 | `latest-action` |
| Exports completed care actions as CSV. | 6 | `csv-export` |
| Exports and imports backups. | 4 | backup operations |
| Imports keep newer changes. | 4 | `backup-preserves-newer` |
| Keeps a deleted care action in its correction history. | 9 | `deletion-history` |
| Works offline after the first visit. | 6 | `offline-demo` |
| The sample board makes no third-party requests. | 7 | `private-demo` |
| Paired devices share new care actions. | 6 | `paired-demo-sync` |
| This is a household record, not medical guidance. | 8 | scope limitation |
| It does not provide dosing, predictions, or safety recommendations. | 9 | scope limitation |
| Run, test, and build | 4 | developer heading |
| Requires Node.js 22+ and npm. | 5 | developer instruction |
| The static deployment directory is dist. | 6 | developer instruction |
| Deploy it as a Static Web App; the included config sets route, security, cache, and manifest rules. | 17 | developer instruction |
| Verify claims | 2 | developer heading |
| Run every claims command from a clean checkout. | 8 | developer instruction |
| Browser tests cover recording, pairing, deletion history, corrections, exports, demo isolation, offline use, accessibility, legal pages, and safe imports. | 17 | developer instruction |
| Privacy | 1 | heading |
| Care actions are saved in this browser. | 7 | `local-persistence` |
| See Privacy and Terms. | 4 | legal links |
| License | 1 | heading |
| MIT — see LICENSE. | 4 | license link |

## Structure, accessibility, links, and identity

- `/`, `/demo`, `/privacy/`, `/terms/`, `/robots.txt`, `/sitemap.xml`, and
  `/manifest.json` returned 200. `/not-a-route` returned the designed 404.
  All internal and mailto links resolved appropriately.
- Every reviewed route had its required title pattern, one h1, `lang=en`, main
  landmark, description, canonical, OG/Twitter metadata, favicon, Apple-touch
  icon, and coherent shared header/footer. Demo changed its title and metadata
  to “Demo — Caregiver Last Action”.
- Route navigation and Start for real moved focus to the h1 and wrote the
  appropriate polite live announcement. Browser history restored the route.
- `verify-url.sh` passed against live `/demo`: no console errors, one h1, one
  main, no missing image alt text, and no unlabeled buttons.
- Live axe scans at 390 px found no serious or critical WCAG 2 A/AA findings on
  dark root, light Demo, dark Privacy, or light Terms.
- The 25.37 kB gzip single-file app is within the static-product budget. The
  source/runtime checks found no analytics, remote font, runtime AI call, or
  third-party demo request. AI is not expected by this brief; recording,
  backup import/export, offline operation, and two-device sync are present.
- The moonlit nursery art, bedside-clock hierarchy, slate/brass palette, and
  quiet low-motion controls match the recorded “quiet night watch” thesis and
  do not resemble a generic SaaS template.

## Earlier-review verification

| Earlier finding | Recheck result |
| --- | --- |
| F-1-1 | Fixed: cold first screen gives the job, baby-caregiver audience, sample action, and result. |
| F-1-2 | Fixed: `/demo` and `?demo=1` use separate sample storage, banner, reset, exit, and offline cache. |
| F-1-3 | Fixed: all 16 current visitor-relevant feature/privacy claims have one tagged, clean-sandbox test. |
| F-1-4 | Fixed: deep invalid-backup validation rejects before write and survives reload. |
| F-1-5 | Fixed: no checkout or purchase surface is present. |
| F-1-6 | Fixed: direct routes, metadata, robots, sitemap, social card, manifest, and designed HTTP 404 work. |
| F-1-7 | Fixed: app, legal, and 404 routes provide skip link, wordmark, navigation, legal footer, attribution, and build ID. |
| F-1-8 | Fixed: live CSP, Permissions-Policy, Referrer-Policy, and `nosniff` load without console violations. |
| F-1-9 | Fixed: linked `/manifest.json` returns `application/json`. |
| F-1-10 | Fixed: care action/latest care action/handoff board terms are used consistently. |
| F-1-11 | Fixed: inactive payment jargon is absent. |
| F-1-12 | Fixed: README introduction sentences are within the copy limit. |
| F-1-13 | Fixed: obsolete paid-pairing README copy is absent. |
| F-1-14 | Fixed: README browser-test description is short and current. |
| F-1-15 | Fixed: obsolete license implementation copy is absent. |
| F-1-16 | Fixed: caregiver-facing README avoids protocol jargon. |
| F-1-17 | Fixed: asset provenance is kept in design records, not visitor copy. |
| F-1-18 | Fixed: remaining caregiver-facing README copy is plain and consistent. |
| F-2-1 | Fixed: two isolated demo contexts completed pairing and synced Medicine. |
| F-2-2 | Fixed: the offline reload/write test passed individually and in the full suite. |
| F-2-3 | Fixed: Demo and Start for real focus the h1 and announce the route. |
| F-3-1 | Fixed: recording, correction, and deleted-history behaviors have dedicated observable claim tests. |
| F-3-2 | Fixed: root, Demo, Privacy, Terms, and 404 have complete route metadata. |
| F-3-3 | Fixed: the single care-action terminology is retained across UI and README. |
| F-3-4 | Fixed: three-step guide and medical/privacy limit are present after the working product. |
| F-3-5 | Fixed: pairing actions state their result, including Enter invitation and Close pairing. |
| Mobile overlap | Fixed: the light Demo banner sits in normal sticky flow above the first action. |
| F-4-1 | Fixed: live light-theme Demo banner passed axe and was legible at 390 px. |
| F-4-2 | Fixed: pairing recovery uses “Enter invitation again”. |

## What would make this perfect

No additional product change is identified by this review. Preserve this state
by running every registry command, the full browser suite, and the live
light-theme demo check after any future copy, service-worker, storage, or
pairing change.
