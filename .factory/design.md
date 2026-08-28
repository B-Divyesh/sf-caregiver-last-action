# Caregiver Last Action — visual thesis

## Direction: the quiet night watch

This is a handoff instrument, not a baby journal. Its cinematic environmental world is the dim room just after a caregiver has set the bottle down: moonlit blue walls, one warm practical lamp, soft linen and a visible horizon. The interface borrows the composure of a film still and the legibility of a bedside clock. The last completed action gets the brightest plane and largest numerals; controls recede until needed.

The scene explains the product’s purpose: someone has just left the room, another person is arriving, and the shared record bridges that gap. It must never suggest monitoring, diagnosis, or medical certainty.

## Palette

Dark is the intentional default because the product is often used at night. A daylight treatment follows the system preference.

| Token | Night | Day | Role |
| --- | --- | --- | --- |
| Ink | `#F5F1E8` | `#172225` | Primary text |
| Muted | `#BFC7C6` | `#4C5C5E` | Supporting text |
| Horizon | `#0E1B22` | `#F3EFE5` | Page background |
| Slate | `#162A31` | `#FFFFFF` | Working surface |
| Brass | `#F3C969` | `#8B5D00` | Primary action / focus |
| Reed | `#8FC9B5` | `#176B59` | Complete / synced |
| Ember | `#F28C6B` | `#A53B20` | Warning / overdue state |
| Garnet | `#FF8A86` | `#9F2731` | Destructive actions |

All normal text combinations target WCAG AA (4.5:1); state is always paired with an icon or words.

## Typography

- **Display and interface:** `Avenir Next`, `Segoe UI`, system sans-serif. Rounded but disciplined, calm at large sizes, highly legible when tired.
- **Time and metadata:** `SFMono-Regular`, `Roboto Mono`, `Consolas`, monospace. Tabular figures make elapsed times and correction rows stable.
- Scale: 14 / 16 / 20 / 28 / clamp(44–72) px. Body never falls below 16 px.
- No remote font files. The system stacks keep the first load private and immediate.

## Spacing and shape

The base rhythm is 4 px, with primary steps at 8, 12, 16, 24, 32 and 48 px. Content is held to 1120 px. Mobile drops the atmospheric side rail and stacks actions under the status board. Corners are 12 px for controls and 24–32 px for larger planes—soft enough for the setting, never toy-like. Touch targets are at least 48 px.

## Interaction grammar

- The top of the board answers three questions in order: **what**, **when it ended**, **how long ago**.
- Starting an action changes that action into the single illuminated live control. Stopping it creates the authoritative completed record.
- Feed, sleep and medicine are timed. Diaper is an instant record because “ended” and “recorded” are the same moment.
- Corrections append a visible revision record instead of silently rewriting history.
- Sync language is literal: “Saved on this device”, “Ready to share”, “Merged 2 records”. No vague cloud metaphors.

## Motion

Changes use 180–240 ms opacity and transform transitions: a completed event rises into the board from its action row; sheets scale from their trigger; sync indicators cross-fade. Nothing loops. With `prefers-reduced-motion: reduce`, transforms and smooth scrolling are removed and state changes are instant.

## Asset plan and provenance

### `night-watch`

- Use: wide atmospheric header art and install splash crop.
- Prompt sheet: **Subject:** recently vacated nursery at night, empty wooden rocking chair, small side table with a bottle and folded muslin cloth, open doorway suggesting the next caregiver. **World:** quiet domestic night watch. **Materials:** linen, matte painted wall, pale oak, frosted glass. **Light:** blue moonlight plus one low amber practical lamp. **Lens:** cinematic 35 mm, wide low eye level, shallow atmospheric depth, right-side visual weight with clean dark negative space on the left. **Palette words:** deep ink, moonlit slate, muted teal, warm brass. **Negative list:** people, infants, faces, text, clocks, screens, brands, logos, watermark, medical equipment, surveillance devices, clutter, unsafe sleep setup.
- Model: `factory-image` via Azure AI Foundry (`/opt/fleet/lib/gen-image.sh`).
- Date: 2026-08-28.
- License/provenance: original AI-generated asset created specifically for this product; no real people, brands or copyrighted characters.
- Delivery: reviewed source retained in `assets/src/`; optimized responsive WebP/AVIF derivatives in `public/art/`, each mobile hero derivative ≤300 KB.

Icons and the wordmark are hand-authored as inline SVG/CSS, using simple product-native marks (moon horizon, bottle, bed, drop, nappy) and no third-party icon pack.
