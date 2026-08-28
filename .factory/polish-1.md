# Polish 1 — finding closure

Local evidence: `npm test` (5 pass), `npm run build` (pass), `npm run test:e2e`
(26 pass), claim commands in `.factory/claims.json` (all pass), and
`.factory/evidence-local/screenshot-{desktop,mobile}.png`.

| Finding | Change | Evidence |
| --- | --- | --- |
| F-1-1 | Plain first-screen headline, audience sentence, demo action, and result text. | `app.spec.ts` first-read assertions; mobile screenshot. |
| F-1-2 | `/demo` and `?demo=1`, `demo:` IndexedDB, sample state, banner/reset/start-real, SW cache, demo docs. | `@claim:demo-isolation`, `@claim:offline-demo`. |
| F-1-3 | Added eight registry claims and observable demo tests; removed unprovable paid/encryption claims. | Every `.factory/claims.json` command. |
| F-1-4 | Deep event/correction/settings validator rejects malformed backups before write; invalid saved state falls back safely. | `@claim:backup-merge`. |
| F-1-5 | Removed the dead checkout and all purchase actions. | `@claim:no-purchase`; live deploy check required after push. |
| F-1-6 | Route title for demo, canonical/OG/Twitter/Apple metadata, social card, robots, sitemap, and 404 asset/config. | build inspection; `test:e2e` legal/direct route test. |
| F-1-7 | Added shared wordmark, skip link, nav, legal links, Param Factory footer, and build id to legal/404 pages. | `test:e2e` legal route test; screenshots. |
| F-1-8 | Added deploy CSP and Permissions-Policy; CSP includes the exact SHA-256 of Vite’s inlined module. | local hash check; live cold browser recheck after redeploy. |
| F-1-9 | Moved the linked manifest to `/manifest.json`, which Azure serves as JSON; retained immutable art/icon caching. | live `curl -I /manifest.json` after redeploy. |
| F-1-10 | Renamed headings and product nouns around “care action.” | copy audit and browser screenshots. |
| F-1-11 | Removed inactive payment surface and legal-jargon copy. | `@claim:no-purchase`. |
| F-1-12 | Rewrote README introduction into short sentences. | `.factory/copy-audit.md`. |
| F-1-13 | Removed inactive paid-pairing copy. | README and product view. |
| F-1-14 | Rewrote README test description. | README review. |
| F-1-15 | Removed inactive license implementation copy. | README review. |
| F-1-16 | Removed inactive pairing protocol copy. | README review. |
| F-1-17 | Shortened artwork documentation copy. | README review. |
| F-1-18 | Rewrote README as caregiver-facing plain language; technical details stay in source/design notes. | `.factory/copy-audit.md`. |
| verification: rate limit | Disabled the client verification/purchase surface so the release makes no call to the unrate-limited endpoint. | `@claim:private-demo`, `@claim:no-purchase`. |
| verification: cache policy | Added immutable cache rules plus SW v3. | `dist/staticwebapp.config.json`, offline claim. |

Live deployment initially exposed a CSP/module mismatch. It was fixed in the
follow-up deployment and is rechecked in the handoff evidence.
