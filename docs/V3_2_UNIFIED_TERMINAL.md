# NERV-COMMAND v3.2.0 — Unified NERV Terminal / first functional milestone

Baseline: `feature/v3-1-5-actionable-alert-security-city` commit `10b79c2177bc17c237673da9dacd12c8b0c4d6a9`.
Development branch: `feature/v3-2-unified-terminal`.

## Scope delivered by this initial milestone

- Home presents two primary entry points: **当直管制** and **作戦管制**. Historical specialist pages remain reachable as auxiliary functions through an expandable expert menu; they are not deleted.
- The existing **real** battle workstation receives the previously proposed NERV interface: compact NERV central-command header, CASE / EVA / AP / power telemetry, visible hazard/pattern label, dominant existing field map, live event/radio strip directly following the map, and four large actions **解析 / 移動 / 攻撃 / 防衛**. A separate **手番終了** control remains easy to reach.
- All operation actions reuse the v3.1 canonical game handlers and real dispatch mechanisms. `解析` opens the real communications/MAGI sheet, where `analysis.request` spends genuine game resources; `防衛` opens the real shutter/urban-defense sheet; `移動`, `攻撃`, `手番終了` reuse original tactical actions.
- The existing radio DOM node is **moved**, not duplicated, and remains clickable after being moved outside its original parent.
- The original high-resolution EVA and city paintings, the real map renderer, tactical logic, damage persistence, manual fully-confirmed alarm recovery, snapshot backup and Scriptable bridge remain unchanged. No independent animation timer, no duplicate map, no new parallel gameplay state.

## Presentation design

- Dark industrial body (#111a1d), warm amber commands (#eeaa56), cyan-green telemetry, red hazard accent, cream text.
- EVA 00 amber/yellow, 01 violet, 02 red used as small identification accents rather than global recoloring.
- A compact status header, a single scene and a contextual radio strip; all primary buttons have >= 43px touch height, with 52px main actions.
- The user's exact requested four-button appearance is implemented over the **existing actual battle screen**, not a separate fake screenshot.
- The field is the existing illustrated renderer; the simplified diagram used in the earlier conversation was a wireframe for composition, NOT substituted art.

## Deliberately not claimed as completed

This is **phase 1 of v3.2 structural renewal**, not the finished removal of 111 browser modules and 45 CSS files. Physically deleting legacy UI is deferred until event handlers and save compatibility have been audited and functional parity is covered by regression tests. Existing app screens behind the expert menu still need UI convergence and testing.

Physical iPhone Scriptable/WebKit gestures and visual fit are not verified by GitHub CI. Confirm on an actual device before publishing as stable.

## Verification and release

- `node tests/test_v320_unified_terminal.js`
- `python3 scripts/test.py --no-browser` plus previous v3.1 alarm/recovery and tactical regression checks.
- The v3.2 GitHub Actions workflow builds full `NERV_COMMAND_v3_2_0_SCRIPTABLE.js`, matching copy-paste TXT and smaller pinned `STARTER.js` and release ZIP, pinning the starter to an immutable runtime commit only after successful tests.
- Distribution is by the full generated file or pinned starter, never a diff or partial Scriptable snippet.

## Next milestones

1. Consolidate all alert banners, employee/security workflows and duplicate headers into a single event-and-action rail.
2. Fold tactical deployments, EVA monitoring and urban defense into a truly phase-dependent same-route operation surface; retain specialist overlays.
3. Replace the many hidden CSS layers with a smaller set of owned components and remove retired presentation modules after parity tests.
4. Add screenshot and touch validation on the user's iPhone 17 Pro and representative mobile viewport widths.
