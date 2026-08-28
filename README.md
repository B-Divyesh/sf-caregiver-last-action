# Caregiver Last Action

See the last baby-care action for a clear caregiver handoff.

For baby caregivers handing off feeds, sleep, medicine, and diapers. Start and
end feeds or sleep. Record medicine or diaper changes in one tap. Correct an
entry without hiding its history.

Try the isolated sample board: <https://caregiver-last-action.sociobot.in/demo>.
Sample data never changes a real record. Use **Start for real** in the demo
banner when ready.

## What it does

- Shows the latest completed care action first.
- Exports completed care actions as CSV.
- Exports and imports backups. Imports keep newer changes.
- Works offline after the first visit.
- The sample board makes no third-party requests.
- Paired devices share new care actions.

This is a household record, not medical guidance. It does not provide dosing,
predictions, or safety recommendations.

## Run, test, and build

Requires Node.js 22+ and npm.

```bash
npm ci
npm run dev
npm test
npm run build
npm run test:e2e
```

The static deployment directory is `dist/`. Deploy it as a Static Web App; the
included `staticwebapp.config.json` sets the route, security, cache, and
manifest rules.

## Verify claims

Run every command in `.factory/claims.json` from a clean checkout. Browser
tests cover recording, pairing, corrections, exports, demo isolation, offline
use, accessibility, legal pages, and safe imports.

## Privacy

Care actions are saved in this browser. See [Privacy](public/privacy/index.html) and
[Terms](public/terms/index.html).

## License

MIT — see [LICENSE](LICENSE).
