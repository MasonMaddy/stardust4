# Playground Sign-in — folder map

The educator sign-in journey for a shared room tablet: service login → educator select →
PIN → room select. This folder holds the whole lineage — direction explorations, the
current prototype, spin-off labs, and the dev handover spec. Start here to find the right
artifact; the site nav (Sandbox → Playground Sign-in) links the live pages.

| Path | What it is | Status |
|---|---|---|
| `index.html` + `variants.jsx` + `helpers.jsx` | **Direction explorations** — the original multi-direction comparison board (phone frames, all visual directions side by side). | Exploration record — kept for reference |
| `variants-brief.md` | Build brief for the 5-variant service sign-in comparison round. | Exploration record |
| `ipad/` | iPad portrait first cut of the Centred-classic direction, built standalone so it could be merged back. | Superseded — device switching now lives in the prototype |
| `directions/tall-scene.html` | **Anatomy** page for the approved Playful tall-scene direction (`v=3`). | Current — linked as "Anatomy" in nav |
| `version-0.3/` | **The prototype.** Full S1–S7 flow, phone ⇄ tablet, plus `standalone.html` (un-shelled web build) and the anatomy inspector (`inspect-goggles.js`). | Current |
| `service-to-educator/` | Fork of v0.3: Immersive teal service login; signing in reveals the educator list on a bottom sheet. | Lab — candidate for v0.4 |
| `motion-lab/` | Direction D "travelling logo": Service ⇄ Educator transition study (fade-through + one shared brand-mark element) with SwiftUI/Compose notes. | Lab — candidate for v0.4 |
| `handoff.source.json` | **Source of truth for the dev handover.** Edit this, then run `node scripts/build-handoff.mjs`. | Current |
| `HANDOFF.md` · `handoff.html` · `handover/` | Generated handover spec (screens S1–S7, flows, acceptance criteria, platform deltas). Never hand-edit — regenerate from `handoff.source.json`; CI (`build-handoff.mjs --check`) fails on drift. | Generated |
| `assets/` | Icons shared by the root exploration pages. Each sub-prototype carries its own `assets/` copy so it stays standalone. | — |

**Version lineage:** direction explorations → v0.1/v0.2 (Playful tall-scene chosen) →
**v0.3 (current)** → v0.4 will fold in the service-to-educator sheet reveal and the
motion-lab transition once approved.
