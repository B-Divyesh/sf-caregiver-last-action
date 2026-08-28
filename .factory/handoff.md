# Caregiver Last Action — polish 2 handoff

Product repair commit: `91cf973` (`fix: restore safe caregiver pairing and claims`).

## Done

- Restored the two-device QR pairing flow required by the brief. It keeps AES-GCM
  transport in the existing peer implementation and binds invitations to demo or
  real mode, so sample state cannot pair with or write to real state.
- Closed the complete claim registry: local persistence, valid import, newest
  merge preservation, paired demo sync, and all earlier claims now have one
  tagged observable test each.
- Removed the initial service-worker reload race, added route h1 focus and polite
  announcements, and prevented the mobile demo banner from covering the first
  care action.
- Updated plain-language sharing/privacy copy, README, catalog description,
  demo notes, build IDs, and copy audit without changing the quiet-night-watch
  visual system.

## Verify

From a clean checkout:

```bash
npm ci
npm test
npm run build
npm run test:e2e
```

Then run every command listed in `.factory/claims.json`.

Local evidence on 2026-08-28:

- `npm test`: 5 passed.
- `npm run build`: passed; `dist/index.html` is 23.97 kB gzip.
- `npm run test:e2e`: 38 passed across mobile and desktop Chromium, including
  axe serious/critical checks, offline reload/write, and two-context pairing.
- Each of the 11 claim commands passed individually after `npm ci`.
- Screenshots: `.factory/evidence-local/demo-mobile-viewport.png` and
  `.factory/evidence-local/demo-desktop.png`.

## Deployment and known gaps

Deployed with `/opt/fleet/lib/deploy-static.sh caregiver-last-action dist` to
<https://caregiver-last-action.sociobot.in>. Cold live verification on
2026-08-28 confirmed `/`, `/demo`, `/privacy/`, `/terms/`, `/robots.txt`,
`/sitemap.xml`, and `/manifest.json` return 200; an unknown path returns the
designed 404. `/manifest.json` returns `application/json`; CSP,
Permissions-Policy, Referrer-Policy, and `nosniff` are present. The first cold
check caught an outdated CSP script hash; it was corrected to the rebuilt
bundle hash and redeployed before this handoff. There are no known product gaps.
