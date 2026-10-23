# NERV-COMMAND v2.31 — Unified Workstation UI

## Why a full screen hierarchy reset
Versions 2.24–2.30 repeatedly added visual summaries and duplicate forms across a single page. The user reported screens getting longer and longer, despite successful underlying combat gameplay. This is a structural UI redesign, not another stacked module or minor fold-away change.

## Canonical layout
- **One** existing top `#terminalContext` acts as a real terminal command bar with page title, inline dynamic operational state and the existing global function menu. There is no second/tall new header slab.
- Below it, one pinned per-page `.mobile-tabs` nav row, positioned safely below Scriptable's native iOS Close/share touch area. Original buttons remain interactive.
- A single **hero task** for each workstation: city = original city artwork + live defenses; MAGI = canonical tri-core board with real vote/measurement controls; EVA = painted unit monitor + existing commands; communications = one animated real-channel rack; combat = operational 3×3 command map OR precision canvas and weapons via v2.30 mode choice. No duplicated full-width fake tactical panels.
- Original `v226-station`, `v225Ops`, `v226DataLink`, repeated `v227MagiBus`, and superfluous `consoleBattleFlow` are hidden as redundant *read-only visual summaries*. The established state render functions remain, so no saved record or command disappears.
- Real `v227SignalRack` is moved outside the now-hidden v2.26 station on the active comms view; the real contact/channel readout keeps working.
- `#v27Facilities` is now inside an optional native `details` section titled '施設・防衛設備の詳細'; its child controls are preserved and available when expanded.
- Battle preparation and real incident resolution stay directly operable; the v2.29 3-choice launch decision remains visible. After resolution the card reduces to a receipt. The historical optional v2.28 checks and MAGI rationale are still accessible under details. Battle precision canvas and reference artwork are not replaced or flattened.
- No static image or design baseline is modified. Do not re-encode raster images, change EVA/city illustration renderers or SVG originals.
- No new game/save engine code, no extra web fetch, RAF, timer or audio code. All critical gameplay and restored WebAudio from v2.29–v2.30 remains.

## UX review checklist
1. Native Scriptable Close/share controls don't occlude the top navigation; nav taps work after scrolling.
2. On battle/setup, the real v2.29 incident choices and legitimate approvals are visible. Optional history/MAGI reasoning is a disclosure; user can still access the original unit/power command.
3. On battle/engage, exactly one battle view is primary: map plus AP commands or precision canvas plus weapons. Enemy phase and radio continue to work.
4. On MAGI, three-core main board and independent measurement controls remain fully interactive while duplicate tiny tri-consensus panel disappears.
5. On infra/map, original full-resolution Tokyo-3 map remains and optional facility controls can be expanded. City action buttons are still reachable.
6. On EVA, existing painted EVA assets and launch/maintenance controls remain, the static secondary summary is gone.
7. On comms, selected contact's waveform still appears as a standalone small rack after the duplicated station is removed.
8. Existing save opens without reset; old route URLs and bottom navigation still work. Basic performance and physical iPhone behavior must be measured on-device.

## Release requirements
Generate complete single-file Scriptable `.js`, identical `.txt` copy, 13KB checksum-locked starter, and ZIP. Preserve golden image hashes and all historic tests; also test v2.31 source has no new state mutators and that root hidden cards are read-only only.
