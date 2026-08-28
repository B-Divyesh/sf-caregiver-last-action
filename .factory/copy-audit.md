# Copy audit

Reviewed 2026-08-28 after polish 2. Landing sentences are at most 22 words.
The banned marketing terms do not appear in landing copy.

| Copy | Words | Result |
| --- | ---: | --- |
| See the last baby-care action. | 6 | pass |
| For baby caregivers handing off feeds, sleep, medicine, and diapers. | 9 | pass |
| See three realistic handoff entries. | 5 | pass |
| Sample data is separate. | 4 | covered by `demo-isolation` |
| Works after the first visit offline. | 7 | pass |
| No purchase needed. | 3 | pass |
| Show an invitation on one device. | 7 | pass |
| Scan or paste it on the other. | 7 | pass |
| New care actions then appear on both boards. | 8 | covered by `paired-demo-sync` |
| Export a complete backup or merge one from another device. | 10 | covered by `backup-import` |
| Imports keep newer changes. | 4 | covered by `backup-preserves-newer` |

## Terminology

| Concept | Product word |
| --- | --- |
| A completed feed, sleep, medicine, or diaper entry | care action |
| The latest completed item | latest care action |
| Downloaded local record | backup |
| Sandbox content | sample data |
| Linked device connection | pairing |
