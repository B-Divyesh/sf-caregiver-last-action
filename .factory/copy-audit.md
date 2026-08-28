# Copy audit

Reviewed 2026-08-28 for polish 3. Landing and README sentences are at most
22 words. No banned marketing terms appear. Product copy uses **care action**
for a completed feed, sleep, medicine, or diaper item.

## Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to the handoff board | 5 | pass |
| Caregiver Last Action | 3 | pass |
| Demo / History / Backups / Privacy | 1 each | pass |
| A clear handoff | 3 | pass |
| See the last baby-care action. | 5 | covered by `latest-action` |
| For baby caregivers handing off feeds, sleep, medicine, and diapers. | 10 | pass |
| Try it with sample data | 5 | pass |
| See three realistic care actions. | 5 | covered by `demo-isolation` |
| Sample data is separate | 4 | covered by `demo-isolation` |
| Works after the first visit offline | 6 | covered by `offline-demo` |
| No purchase needed | 3 | covered by `no-purchase` |
| Saved on this device | 4 | covered by `local-persistence` |
| Handoff board / Latest care action | 2 / 3 | pass |
| Record the first care action. | 5 | covered by `record-care-actions` |
| Start a feed or sleep below. | 6 | covered by `record-care-actions` |
| Record medicine or a diaper change in one tap. | 9 | covered by `record-care-actions` |
| Recent care actions | 3 | pass |
| No completed care actions yet. | 5 | pass |
| Completed care actions appear here. | 5 | covered by `record-care-actions` |
| Share with another caregiver | 4 | pass |
| Show an invitation on one device. | 6 | covered by `paired-demo-sync` |
| Scan or paste it on the other. | 7 | covered by `paired-demo-sync` |
| New care actions then appear on both boards. | 8 | covered by `paired-demo-sync` |
| Create invitation / Enter invitation | 2 each | pass |
| Names and backups | 3 | pass |
| Export a complete backup or merge one from another device. | 10 | covered by `backup-import` and `backup-json` |
| Imports keep newer changes. | 4 | covered by `backup-preserves-newer` |
| How this handoff board works | 5 | pass |
| Start and end feeds or sleep. | 6 | covered by `record-care-actions` |
| The latest completed care action stays at the top. | 9 | covered by `latest-action` |
| Enter it on the other. | 5 | covered by `paired-demo-sync` |
| A household record, not medical guidance | 6 | scope statement |
| This app gives no dosing, predictions, or safety recommendations. | 9 | scope statement |
| Read Privacy and Terms for data and safety details. | 9 | pass |
| Clear handoffs for baby caregivers. | 5 | pass |
| Demo — sample data, nothing is saved. | 6 | covered by `demo-isolation` |
| Reset demo / Start for real | 2 / 3 | covered by `demo-isolation` |
| You’re offline. Changes will stay on this device. | 8 | covered by `offline-demo` and `local-persistence` |
| Correction history / Before / After | 2 / 1 / 1 | covered by `visible-correction-history` |
| Close pairing | 2 | pass |

## README

| Copy | Words | Result |
| --- | ---: | --- |
| See the last baby-care action for a clear caregiver handoff. | 10 | covered by `latest-action` |
| For baby caregivers handing off feeds, sleep, medicine, and diapers. | 10 | pass |
| Start and end feeds or sleep. | 6 | covered by `record-care-actions` |
| Record medicine or diaper changes in one tap. | 8 | covered by `record-care-actions` |
| Correct a care action without hiding its history. | 8 | covered by `visible-correction-history` |
| Sample data never changes a real record. | 7 | covered by `demo-isolation` |
| Shows the latest completed care action first. | 7 | covered by `latest-action` |
| Exports completed care actions as CSV. | 6 | covered by `csv-export` |
| Exports and imports backups. | 4 | covered by `backup-json` and `backup-import` |
| Imports keep newer changes. | 4 | covered by `backup-preserves-newer` |
| Works offline after the first visit. | 6 | covered by `offline-demo` |
| The sample board makes no third-party requests. | 7 | covered by `private-demo` |
| Paired devices share new care actions. | 6 | covered by `paired-demo-sync` |
| Care actions are saved in this browser. | 7 | covered by `local-persistence` |

## Terminology

| Concept | Product word |
| --- | --- |
| A completed feed, sleep, medicine, or diaper item | care action |
| The most recent completed item | latest care action |
| The whole top-of-screen view | handoff board |
| Downloaded household data | backup |
| Isolated try-out content | sample data |
| Linked device connection | pairing |
