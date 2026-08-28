# Adversarial first-read review 1 — Caregiver Last Action

**Verdict: FAIL.** Reviewed 2026-08-28 on the deployed site in fresh Chromium contexts at 390×844 and 1440×1000, and from a clean local clone at 33576e1.

## Cold read

Before scrolling, I understood a board that records a recent care action. I could not answer **for whom** or **what to click first** from the mobile first screen. Its explanatory copy is only “Know what happened last.”, “Saved on this device”, and “The next action becomes the handoff.” The word Caregiver is a wordmark, not an explanation; no first-screen sentence says baby caregivers, the types of care, or the handoff situation. Four equal controls say “Tap to start Feed”, “Tap to start Sleep”, “Tap to record Medicine”, and “Tap to record Diaper”. Desktop adds “One clear answer, saved privately on this device.”, but still omits the people and first result.

## Findings

### F-1-1 — BLOCKING — cold first screen does not state the job, people, and first action

**Location/quote:** mobile hero and the four equal controls quoted above.

**Why:** a first-time visitor cannot reliably know that this is for baby caregivers handing off feeds, sleep, medicine, and diapers, or which action will safely demonstrate it first.

**Fix:** use “See the last baby-care action.” and “For baby caregivers handing off feeds, sleep, medicine, and diapers.” Add a single “Try it with sample data” button with “See three realistic handoff entries.” beside it. Leave the real recording controls below.

### F-1-2 — BLOCKING — demo is absent and ?demo=1 uses real data

**Location/quote:** no “Try it with sample data”, “Demo — sample data, nothing is saved”, “Reset demo”, or “Start for real” text exists in the landing DOM or source. /demo returns the normal app.

**Evidence:** after recording a real Diaper entry, opening /?demo=1 displayed the same Diaper card with no banner or reset. Source has only IndexedDB database caregiver-last-action, no demo: namespace or fixtures; .factory/demo.md is absent.

**Why:** there is no one-click try-out, and a purported demo URL exposes and would write the real record. Offline and privacy sandbox checks cannot run.

**Fix:** implement /demo and ?demo=1 with a separate demo: namespace, three realistic completed entries, persistent demo banner, Reset demo, and Start for real. Cache its sample for offline use, document it, and prove in browser tests that demo writes never affect real storage.

### F-1-3 — BLOCKING — claims registry and claim tests are missing

**Location/quote:** .factory/claims.json does not exist and no test contains @claim:. Unlisted visitor claims include “Saved on this device”, “One clear answer, saved privately on this device.”, “The free board, history, corrections and exports stay available forever.”, “A Household pass adds private live pairing between two nearby devices.”, “$12 once · no account · no subscription”, “Imports never erase newer changes.”, “Private by design.”, and README claims about local storage, tracking, export, offline use, encryption, pairing, and CDN requests.

**Evidence:** a clean clone had zero listed claim commands to run. npm test passed 5 tests, npm run build passed, and npm run test:e2e passed 14 tests, but none is a registered observable claim test against demo data. A normal fresh-session interception made only same-origin requests, but that is not the required demo-flow privacy check.

**Why:** privacy, price, import/export, encryption, and offline promises are not independently provable from a clean sandbox.

**Fix:** add one registry item and tagged demo test per claim. Cover offline reload/write, same-origin-only demo traffic, CSV/JSON content, safe import merge, local persistence, price/entitlement behaviour, and encrypted pairing. Remove claims that cannot be tested.

### F-1-4 — BLOCKING — malformed backup import corrupts the saved record

**Location/quote:** Import backup; src/storage.ts checks only top-level shape before returning imported state.

**Evidence:** live upload of {"version":1,"events":[{"id":"broken"}],"corrections":[],"settings":{}} showed “This change could not be saved. Try again.” but wrote that state to IndexedDB. Reload then throws “Cannot read properties of undefined (reading 'timed')”; the loading element says “Could not open the local record.” while a partial unusable board remains.

**Why:** a bad backup can make the household record unavailable with no safe recovery path.

**Fix:** validate every nested event, correction, and setting before merge or write; leave existing state untouched when invalid; recover safely from old bad state. Add this exact payload as a regression test that verifies the prior record survives reload.

### F-1-5 — BLOCKING — paid action is a dead link

**Location/quote:** Buy Household pass links to https://api.sociobot.in/api/v1/products/caregiver-last-action/checkout.

**Evidence:** following that exact URL returns **HTTP 404**.

**Why:** the only offered route to two-device pairing leads to a missing page.

**Fix:** register and smoke-test checkout before showing the action, or hide it and state that pairing is not available. Add a release test that follows the exact URL.

### F-1-6 — HIGH — demo/404/discovery/social route structure is incomplete

**Location/evidence:** /demo has the root title and h1; /not-a-route returns HTTP 200 and normal “Know what happened last.” content. /robots.txt and /sitemap.xml return 404. Root, demo, privacy, and terms have no canonical, Open Graph, Twitter-card, or Apple-touch-icon tags. Root and legal routes do have valid titles, descriptions, language, favicon SVG, and one h1.

**Why:** a typo looks valid, shared links lack identity/previews, crawlers cannot discover routes, and the demo URL is not a demo.

**Fix:** create a real demo route titled “Demo — Caregiver Last Action”, add canonical/social metadata and a 1200×630 original-art card, Apple icon, robots and sitemap, and a styled 404 that returns 404 with a home link.

### F-1-7 — HIGH — routes do not share the required accessible skeleton

**Location/quote:** root has the wordmark and a footer with only Privacy and Terms; privacy/terms have only “← Back to the handoff board” and footers with one legal link.

**Why:** legal routes lose the home wordmark, skip link, consistent navigation, both legal links, product one-liner, Param Factory attribution, and build ID.

**Fix:** use one header/footer on root, demo, privacy, terms, and 404: wordmark to home, skip link, Demo and Privacy navigation, both legal links, one-liner, Built by Param Factory, and version/build ID.

### F-1-8 — MEDIUM — sensitive-data deployment lacks CSP and Permissions-Policy

**Location/evidence:** live root headers include HSTS, Referrer-Policy, and X-Content-Type-Options, but no Content-Security-Policy or Permissions-Policy; the repository has no deployment configuration. This confirms the earlier handoff’s medium issue remains unresolved.

**Why:** the app holds family care data and can open a QR camera without a strict script/frame policy or explicit camera policy.

**Fix:** deploy a matching strict CSP and a camera-limiting Permissions-Policy, then assert both headers in release tests.

### F-1-9 — LOW — manifest MIME type remains incompatible

**Location/evidence:** live /manifest.webmanifest returns Content-Type: application/octet-stream, not manifest JSON. This is the unresolved low issue in .factory/verification.md.

**Why/fix:** installability is less portable than necessary. Serve application/manifest+json (or application/json) and assert it at release.

### F-1-10 — MINOR — headings and entry nouns are inconsistent

**Location/quote:** THE QUIET HANDOFF, WHAT LED HERE, ACROSS THE ROOM, and MAKE IT YOURS do not identify their section out of context. The same item is an action, record, and handoff.

**Why/fix:** tired visitors and screen-reader heading users cannot scan it. Use Latest care action, Recent care actions, Share with another caregiver, and Names and backups, and use care action consistently.

### F-1-11 — MINOR — payment copy uses unexplained legal jargon

**Location/quote:** “Sociobot/Dodo is the merchant of record.”

**Why/fix:** it does not say who charges or refunds a caregiver. Replace with “Sociobot/Dodo takes payment and handles refunds.”

### F-1-12 — MINOR — README introduction is 33 words

**Quote:** “Caregivers can start and stop feeds or sleep, record medicine or diaper changes in one tap, correct a record without hiding the audit trail, and see the latest completed action at a glance.”

**Why/fix:** it contains four jobs. Replace with “Start and end feeds or sleep. Record medicine or diaper changes in one tap. Correct entries without hiding their history. See the latest completed action first.”

### F-1-13 — MINOR — README paid-pairing bullet is 24 words

**Quote:** “Paid, live two-device pairing over WebRTC; a scanned QR establishes a one-time AES-GCM key and both devices keep a local copy.”

**Why/fix:** it combines price, connection, cryptography, and storage. Replace with “A Household pass connects two nearby devices. Each device keeps its own local copy.” Link to a security note if needed.

### F-1-14 — MINOR — README test sentence is 34 words

**Quote:** “E2E coverage includes start/stop, instant actions, refresh persistence, correction history, keyboard focus, axe WCAG checks, offline reload/write, legal routes, paid-state restoration, and an actual encrypted sync between two isolated browser contexts.”

**Why/fix:** it is hard to scan. Replace with “Browser tests cover recording, corrections, offline use, accessibility, legal pages, and two-device sync.”

### F-1-15 — MINOR — README license sentence is 25 words

**Quote:** “A returned ?license= token is stored at sb_license:caregiver-last-action, removed from the URL, and re-verified no more than once a day.”

**Why/fix:** product behaviour and implementation detail are mixed. Replace with “After purchase, this device stores your license and checks it daily.” Move key names to developer documentation.

### F-1-16 — MINOR — README pairing-protocol sentence is 32 words

**Quote:** “One device creates an SDP invitation and a random 256-bit secret, the second device scans or pastes it and returns an SDP answer, and both establish a direct WebRTC data channel.”

**Why/fix:** it is protocol jargon. Replace with “One caregiver shows an invitation. The other scans it or pastes its code to connect directly.”

### F-1-17 — MINOR — README artwork sentence is 23 words

**Quote:** “The source, prompt sidecar, review, optimized derivatives and provenance are recorded in assets/src/ and .factory/design.md.”

**Why/fix:** it piles internal terms into user documentation. Replace with “Artwork source and provenance are recorded in assets/src/ and the design notes.”

### F-1-18 — MINOR — README contains unexplained technical jargon

**Location/quote:** End-time-first, IndexedDB, deterministic last-write-wins, conflict audit entry, PWA, WebRTC, AES-GCM, SDP, STUN/TURN, tombstone, and device ID appear without plain definitions.

**Why/fix:** the README is product copy a caregiver may read. Keep a short plain-language sharing section and move protocol/storage terms to a developer appendix.

## Copy audit

Counts treat contractions as one word. This is the fresh empty-state live landing copy; clock and wordmark are excluded. F identifies a finding above.

### Landing page

| Copy unit | Words | Flag |
| --- | ---: | --- |
| Skip to the handoff board | 5 | — |
| The quiet handoff | 3 | F-1-10 |
| Know what happened last. | 4 | F-1-1 |
| One clear answer, saved privately on this device. | 8 | F-1-3 |
| Saved on this device | 4 | F-1-3 |
| Current handoff | 2 | F-1-10 |
| Last completed action | 3 | F-1-10 |
| The next action becomes the handoff. | 6 | F-1-3 |
| Start a feed or sleep below, or record medicine or a diaper change in one tap. | 16 | F-1-1 |
| Tap to start Feed | 4 | F-1-1 |
| Tap to start Sleep | 4 | F-1-1 |
| Tap to record Medicine | 4 | F-1-1 |
| Tap to record Diaper | 4 | F-1-1 |
| What led here | 3 | F-1-10 |
| Recent record | 2 | F-1-10 |
| Export CSV | 2 | — |
| No completed actions yet. | 4 | — |
| Your record will appear here. | 5 | F-1-3 |
| Across the room | 3 | F-1-10 |
| Connect another caregiver | 3 | — |
| End-to-end encrypted | 3 | F-1-3 |
| Keep two caregivers on the same page. | 7 | — |
| The free board, history, corrections and exports stay available forever. | 10 | F-1-3 |
| A Household pass adds private live pairing between two nearby devices. | 11 | F-1-3 |
| $12 once · no account · no subscription | 6 | F-1-3 |
| Sociobot/Dodo is the merchant of record. | 6 | F-1-11, F-1-3 |
| Refunds are handled there and revoke the license. | 9 | F-1-3 |
| Buy Household pass | 3 | F-1-5 |
| Restore purchase | 2 | — |
| Make it yours | 3 | F-1-10 |
| Device & data | 2 | — |
| Baby’s name (optional) | 3 | — |
| Your name (shown to a paired caregiver) | 7 | F-1-3 |
| Save names | 2 | — |
| Your record stays yours | 4 | F-1-3 |
| Export a complete backup or merge one from another device. | 10 | F-1-3 |
| Imports never erase newer changes. | 5 | F-1-3, F-1-4 |
| Export backup | 2 | — |
| Import backup | 2 | F-1-4 |
| Private by design. | 3 | F-1-3 |
| Not medical guidance. | 3 | F-1-3 |
| Night-watch artwork was generated for this product. | 8 | F-1-3 |

### README

| Copy unit | Words | Flag |
| --- | ---: | --- |
| Caregiver Last Action is a private handoff board for two or more baby caregivers. | 14 | F-1-3 |
| It answers one tired, time-sensitive question first: what happened last, and when did it end? | 16 | F-1-3 |
| It is intentionally smaller than a baby journal. | 8 | — |
| Caregivers can start and stop feeds or sleep, record medicine or diaper changes in one tap, correct a record without hiding the audit trail, and see the latest completed action at a glance. | 33 | F-1-12 |
| End-time-first board for feed, sleep, medicine and diaper actions | 11 | F-1-18, F-1-3 |
| Persistent local storage in IndexedDB; no account and no tracking SDK | 11 | F-1-18, F-1-3 |
| Visible correction and deletion history | 5 | F-1-3 |
| Deterministic last-write-wins conflict resolution with a conflict audit entry | 11 | F-1-18, F-1-3 |
| JSON backup/import and CSV export | 6 | F-1-3 |
| Installable PWA with a versioned offline shell | 7 | F-1-18, F-1-3 |
| One-time $12 Household pass through the Sociobot billing API | 10 | F-1-3 |
| Paid, live two-device pairing over WebRTC; a scanned QR establishes a one-time AES-GCM key and both devices keep a local copy. | 24 | F-1-13 |
| Directly addressable privacy and terms pages | 6 | F-1-3 |
| Caregiver Last Action is a coordination utility, not medical guidance. | 10 | F-1-3 |
| It does not provide medication dosing, predictions or safety recommendations. | 10 | F-1-3 |
| Requirements: Node.js 22+ and npm. | 5 | F-1-18 |
| Open http://localhost:5173. | 4 | — |
| Service-worker registration is disabled in development so hot reload cannot be shadowed by an old app-shell cache. | 19 | F-1-18 |
| Playwright is pinned to 1.58.2, matching the factory browser image. | 12 | F-1-18 |
| E2E coverage includes start/stop, instant actions, refresh persistence, correction history, keyboard focus, axe WCAG checks, offline reload/write, legal routes, paid-state restoration, and an actual encrypted sync between two isolated browser contexts. | 34 | F-1-14 |
| The static deployment root is dist/; dist/index.html is produced by npm run build. | 13 | F-1-18 |
| The production billing base defaults to https://api.sociobot.in. | 10 | F-1-18 |
| Staging can switch to the test engine without a source change. | 11 | F-1-18 |
| The product slug—not a provider product ID—is used in checkout and verify URLs. | 15 | F-1-18 |
| A returned ?license= token is stored at sb_license:caregiver-last-action, removed from the URL, and re-verified no more than once a day. | 25 | F-1-15 |
| Pairing is serverless. | 3 | F-1-18 |
| One device creates an SDP invitation and a random 256-bit secret, the second device scans or pastes it and returns an SDP answer, and both establish a direct WebRTC data channel. | 32 | F-1-16 |
| Every state message is additionally encrypted with AES-GCM. | 9 | F-1-18, F-1-3 |
| No public STUN/TURN service is used, so v1 is designed for nearby devices on a network that permits direct peer connections. | 22 | F-1-18, F-1-3 |
| Both apps must remain open for live sync; each continues working independently if the link drops. | 16 | F-1-3 |
| Events carry a stable ID, device ID, revision and updated time. | 11 | F-1-18 |
| Merges prefer the higher revision, then newer update, then device ID as a deterministic tie-breaker. | 16 | F-1-18, F-1-3 |
| Concurrent variants produce a visible correction entry. | 7 | F-1-3 |
| A deletion is a tombstone, preventing an older paired copy from reviving the record. | 14 | F-1-18, F-1-3 |
| Care data stays in the browser unless the user explicitly exports it or pairs a trusted device. | 17 | F-1-3 |
| License verification is the only application API call. | 8 | F-1-3 |
| No fonts, scripts or analytics load from third-party CDNs. | 10 | F-1-3 |
| The night-watch scene is original generated artwork. | 8 | F-1-3 |
| The source, prompt sidecar, review, optimized derivatives and provenance are recorded in assets/src/ and .factory/design.md. | 23 | F-1-17 |
| MIT — see LICENSE. | 3 | — |

## Verification record

| Check | Result |
| --- | --- |
| Fresh desktop/mobile live load and console/page errors | PASS: HTTP 200; no errors |
| First-read clarity | FAIL: F-1-1 |
| /demo, ?demo=1, storage/reset/banner | FAIL: F-1-2 |
| Demo offline/privacy sandbox | NOT TESTABLE: no demo |
| Claims registry/listed commands | FAIL: F-1-3 |
| Clean-clone npm test | PASS: 5 tests |
| Clean-clone npm run build | PASS: dist/, 23.43 kB gzip app shell |
| Clean-clone npm run test:e2e | PASS: 14 tests |
| Crawled links | Root/Privacy/Terms PASS; checkout HTTP 404 (F-1-5) |
| Title/lang/h1/description | PASS on root and legal routes |
| Canonical/OG/Twitter/Apple/robots/sitemap/404 | FAIL: F-1-6 |
| Shared header/footer | FAIL: F-1-7 |
| CSP/Permissions-Policy | FAIL: F-1-8 |
| Visual identity | PASS: original quiet-night system matches .factory/design.md; not generic SaaS |
| Missed leverage / AI | No finding: import/export and sharing exist; medical coordination does not need decorative AI |

## Earlier-review verification

No earlier .factory/review-*.md or .factory/polish-*.md files exist. The historical handoff/verification issues were checked from scratch:

- **Malformed import:** still reproducible live and in code; F-1-4.
- **License verification rate limit:** fixed at the service. A fresh 60-request invalid-token burst returned 30 × HTTP 200 followed by 30 × HTTP 429 with Retry-After: 4; it is not repeated as a finding.
- **Missing CSP/Permissions-Policy:** still present; F-1-8.
- **Manifest MIME compatibility:** still present; F-1-9.

## What would make this perfect

Implement and test the isolated demo and claims contract first. Then make imports non-destructive, repair checkout, finish the route/metadata/404 and header/footer/security work, and simplify the copy. Re-run this full live checklist; only zero findings should change the verdict.
