# Copy audit — polish 4

Reviewed 2026-08-28. This records every visitor-facing sentence, label, and
state message on the landing/app routes, legal routes, 404, README, and demo
guide. Counts treat hyphenated words as one word. No item is over 22 words and
none uses a banned marketing term. The first screen was read aloud at 390 px:
it says what the board shows, who it is for, and that **Try it with sample
data** opens three realistic care actions.

## Landing and app

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to the handoff board | 5 | action label |
| Caregiver Last Action | 3 | wordmark |
| Demo / History / Backups / Privacy | 1 each | navigation |
| A clear handoff | 3 | context label |
| See the last baby-care action. | 5 | `latest-action` |
| For baby caregivers handing off feeds, sleep, medicine, and diapers. | 10 | audience sentence |
| One clear answer for Mila’s next caregiver. | 8 | sample-board context |
| Try it with sample data | 5 | primary action |
| See three realistic care actions. | 5 | `demo-isolation` |
| Sample data is separate | 4 | `demo-isolation` |
| Works after the first visit offline | 6 | `offline-demo` |
| No purchase needed | 3 | `no-purchase` |
| Saved on this device | 4 | `local-persistence` |
| Opening the handoff board… | 4 | loading state |
| Demo — sample data, nothing is saved. | 6 | `demo-isolation`; light and dark axe coverage |
| Reset demo / Start for real | 2 / 3 | demo actions |
| Handoff board / Latest care action | 2 / 3 | distinct product terms |
| Record the first care action. | 5 | `record-care-actions` |
| Start a feed or sleep below. | 6 | `record-care-actions` |
| Record medicine or a diaper change in one tap. | 9 | `record-care-actions` |
| Tap to start Feed / Tap to start Sleep | 4 each | recording actions |
| Tap to record Medicine / Tap to record Diaper | 4 each | `record-care-actions` |
| Duration / Recorded as an instant action / Note | 1 / 5 / 1 | result labels |
| Earlier today / Recent care actions | 2 / 3 | headings |
| Export CSV | 2 | `csv-export` |
| No completed care actions yet. | 5 | empty state |
| Completed care actions appear here. | 5 | `record-care-actions` |
| Corrected / Deleted / Deleted care actions | 1 / 1 / 3 | visible history state |
| This care action was deleted. | 6 | `deletion-history` |
| Its correction history is kept below. | 7 | `deletion-history` |
| View correction history for deleted diaper care action | 8 | result-naming action |
| Share with another caregiver | 4 | heading |
| Device pairing / Share with the next caregiver. | 2 / 5 | section labels |
| Show an invitation on one device. | 6 | `paired-demo-sync` |
| Scan or paste it on the other. | 7 | `paired-demo-sync` |
| New care actions then appear on both boards. | 8 | `paired-demo-sync` |
| Not connected / Waiting for the other device… / Connecting… | 2 / 6 / 1 | current state |
| Connected · changes sync live | 4 | `paired-demo-sync` |
| Connection closed / Connection interrupted · records are still saved locally | 2 / 8 | status explanation |
| Create invitation / Enter invitation | 2 / 2 | pairing actions |
| Preparing pairing on this device. | 5 | progress state; no transport claim |
| Show this code to the caregiver you are pairing. | 9 | instruction |
| Keep this dialog open while the other caregiver responds. | 9 | instruction |
| Creating response… | 2 | progress state; no encryption claim |
| Sample and real boards cannot pair. | 6 | `demo-pairing-isolation` |
| Enter invitation again | 3 | result-naming recovery action |
| Scan the invitation shown on the first device, or paste its pairing code. | 13 | instruction |
| QR scanning is not supported here. | 6 | clear error |
| Copy and paste the code instead. | 6 | next step |
| Camera access was unavailable. | 4 | clear error |
| Close this and paste the pairing code instead. | 8 | next step |
| Names and backups / Move a backup | 3 / 3 | headings |
| Export a complete backup or merge one from another device. | 10 | `backup-json`, `backup-import` |
| Imports keep newer changes. | 4 | `backup-preserves-newer` |
| Export backup / Import backup / Save names | 2 each | result-naming actions |
| How this handoff board works | 5 | heading |
| Start and end feeds or sleep. | 6 | `record-care-actions` |
| The latest completed care action stays at the top. | 9 | `latest-action` |
| Enter it on the other. | 5 | `paired-demo-sync` |
| A household record, not medical guidance | 6 | scope heading |
| This app gives no dosing, predictions, or safety recommendations. | 9 | scope limit |
| Read Privacy and Terms for data and safety details. | 9 | legal links |
| Clear handoffs for baby caregivers. | 5 | footer one-liner |
| Built by Param Factory · build 20260828.4 | 6 | build label |
| You’re offline. Changes will stay on this device. | 8 | `offline-demo`, `local-persistence` |
| This change could not be saved. Try again. | 8 | save error and next step |
| The sample could not be reset. Reload and try again. | 10 | reset error and next step |

## README and supporting routes

| Copy | Words | Result |
| --- | ---: | --- |
| See the last baby-care action for a clear caregiver handoff. | 10 | `latest-action` |
| For baby caregivers handing off feeds, sleep, medicine, and diapers. | 10 | audience sentence |
| Correct a care action without hiding its history. | 8 | `visible-correction-history` |
| Keeps a deleted care action in its correction history. | 9 | `deletion-history` |
| Sample data never changes a real record. | 7 | `demo-isolation` |
| Exports completed care actions as CSV. | 6 | `csv-export` |
| Exports and imports backups. | 4 | `backup-json`, `backup-import` |
| The sample board makes no third-party requests. | 7 | `private-demo` |
| Paired devices share new care actions. | 6 | `paired-demo-sync` |
| Care actions are saved in this browser. | 7 | `local-persistence` |
| Sample and real boards cannot pair. | 6 | `demo-pairing-isolation` |
| Privacy, in plain language. | 4 | route heading |
| Export a JSON backup or CSV when you need one. | 10 | `backup-json`, `csv-export` |
| Terms for a clear handoff. | 5 | route heading |
| The app does not provide medical advice, dosing instructions, alerts, or a substitute for professional care. | 16 | safety scope |
| That page is not here. | 5 | 404 heading |
| Go back to the handoff board or open the sample board. | 11 | clear 404 recovery |

## Terminology

| Concept | Product word |
| --- | --- |
| A completed feed, sleep, medicine, or diaper item | care action |
| The most recent completed item | latest care action |
| The whole top-of-screen view | handoff board |
| Downloaded household data | backup |
| Isolated try-out content | sample data |
| Linked device connection | pairing |
