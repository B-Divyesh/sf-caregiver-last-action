# Caregiver Last Action

Caregiver Last Action is a private handoff board for two or more baby caregivers. It answers one tired, time-sensitive question first: **what happened last, and when did it end?**

It is intentionally smaller than a baby journal. Caregivers can start and stop feeds or sleep, record medicine or diaper changes in one tap, correct a record without hiding the audit trail, and see the latest completed action at a glance.

Live product: <https://caregiver-last-action.sociobot.in>

## What v1 includes

- End-time-first board for feed, sleep, medicine and diaper actions
- Persistent local storage in IndexedDB; no account and no tracking SDK
- Visible correction and deletion history
- Deterministic last-write-wins conflict resolution with a conflict audit entry
- JSON backup/import and CSV export
- Installable PWA with a versioned offline shell
- One-time $12 Household pass through the Sociobot billing API
- Paid, live two-device pairing over WebRTC; a scanned QR establishes a one-time AES-GCM key and both devices keep a local copy
- Directly addressable privacy and terms pages

Caregiver Last Action is a coordination utility, not medical guidance. It does not provide medication dosing, predictions or safety recommendations.

## Run locally

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. Service-worker registration is disabled in development so hot reload cannot be shadowed by an old app-shell cache.

## Test and build

```bash
npm test          # deterministic state/conflict unit tests
npm run build     # exact production build command; writes dist/
npm run test:e2e  # builds, serves, and runs mobile + desktop Playwright checks
npm run check     # all of the above
```

Playwright is pinned to `1.58.2`, matching the factory browser image. E2E coverage includes start/stop, instant actions, refresh persistence, correction history, keyboard focus, axe WCAG checks, offline reload/write, legal routes, paid-state restoration, and an actual encrypted sync between two isolated browser contexts.

The static deployment root is `dist/`; `dist/index.html` is produced by `npm run build`.

## Configuration

The production billing base defaults to `https://api.sociobot.in`. Staging can switch to the test engine without a source change:

```bash
VITE_BILLING_BASE_URL=https://pilot-api.sociobot.in npm run build
```

The product slug—not a provider product ID—is used in checkout and verify URLs. A returned `?license=` token is stored at `sb_license:caregiver-last-action`, removed from the URL, and re-verified no more than once a day.

## Pairing and data model

Pairing is serverless. One device creates an SDP invitation and a random 256-bit secret, the second device scans or pastes it and returns an SDP answer, and both establish a direct WebRTC data channel. Every state message is additionally encrypted with AES-GCM. No public STUN/TURN service is used, so v1 is designed for nearby devices on a network that permits direct peer connections. Both apps must remain open for live sync; each continues working independently if the link drops.

Events carry a stable ID, device ID, revision and updated time. Merges prefer the higher revision, then newer update, then device ID as a deterministic tie-breaker. Concurrent variants produce a visible correction entry. A deletion is a tombstone, preventing an older paired copy from reviving the record.

## Privacy and artwork

Care data stays in the browser unless the user explicitly exports it or pairs a trusted device. License verification is the only application API call. No fonts, scripts or analytics load from third-party CDNs.

The night-watch scene is original generated artwork. The source, prompt sidecar, review, optimized derivatives and provenance are recorded in [`assets/src/`](assets/src/) and [`.factory/design.md`](.factory/design.md).

## License

MIT — see [LICENSE](LICENSE).
