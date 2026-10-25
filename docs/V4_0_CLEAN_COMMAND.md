# NERV-COMMAND v4.0.0 — Genuine structural rebuild, no legacy battle widget composition

Base: v3.2.4 `bc8d586d4708c54ab77cf233b71e68e1b8972d3d`.
Branch: `feature/v4-0-clean-command`.

## Real changes, not decoration patches

1. **One independent operations UI**, implemented in `src/browser/v400-command-station.js` and `src/styles/v400-command-station.css`. It creates its own map SVG, real 3x3 hit targets, central command status, CASE/AP, operations radio, four actions, phase-specific setup/approval/deployment/combat/after-action controls, and in-place incident/MAGI/city/weapon detail.
2. **Zero relocated historic battle DOM nodes**. Unlike v3.2, the new module never moves, inserts, clones or depends on `v228SectorGrid`, `v310Operations`, or old CSS ownership. There is no `draw` monkey patch in the new module and no new timer or persistence schema.
3. **Physically removed 9 JS modules** and **8 CSS stylesheets** from the build manifest: obsolete v2.29 UI, v2.30 compact, v2.31 status, v2.32 station, v2.33 city UI, v3.0 operation UI, v3.0 comms UI, v3.1 operations UI, v3.22 map adapter. Their files remain versioned for historical source, but they are NOT compiled or executed in v4. Historical core UI modules required to initialize canonical game state still execute without being user-visible on the battle route; these are migration debt, not independently visible tactical surfaces.
4. **Canonical unchanged commands** via `consoleBattleCommand`, `consoleMagiCommand`, `NERV_OPS_COMMS.dispatch`, and real `v27*()` city reducers. No fake AP, resource change, hit percentage, enemy coordinate or fake "completed" success state.
5. **A single map rendering** always paints roads and grid even while EVA position telemetry is pending, and draws the actual EVA position, forecast attack areas, actual city HP/armor/turret, live AP/energy, and honest `POSITION UNKNOWN` enemy-tracking notice. Same SVG hosts unblocked 9 real placement/movement touch zones.
6. **Scriptable save capacity safety**: the Native bridge's previous hard cap was only 200,000 *characters* for state, pre-recovery backup and world backup. Increased each validation to 2,000,000 *characters* while retaining all existing last-good backup, bounded-state validation, quarantine and rollback semantics. No saved data migration or automatic reset. If state exceeds this guard or the FileManager rejects it, return the true save error and keep the alarm.
7. **Actual Chromium browser visual tests** on a 390px viewport. Fail the workflow if the new panel, nine cells, graphic contours, correct map geometry, or warning/recovery controls cannot be rendered. Upload real screenshot as artifact.

## Operational notes and remaining work

- **This is a clean battle presentation replacement**, not a claim the entire project (weather, personnel, security, city maintenance) has been rewritten. Some original core UI modules still supply initialization, built-in original dialogs, and 2.28 sortie policy compatibility. They are not shown as competing battle cards.
- Existing save files are never cleared; no legacy reset is part of release. An alert recovery still requires explicit action and confirmed backup.
- Initial build is isolated on a feature branch. Do NOT point a production Scriptable launcher to it until the browser and safety workflow succeeds.
- The user remains the authority on actual Scriptable/WebKit display and touch feel. A browser test does not pretend to substitute for iPhone hardware validation.
- An active combat case might require `adopt` or incident resolution before `field`; this is intentional and uses existing true save rules. No bypass.

## Validation

`node tests/test_v400_clean_terminal.js`
`python3 -m unittest discover -s tests -p qa_v400_browser.py -v`
`node tests/test_v300_command_kernel.js`
`node tests/test_v301_operational_comms.js`
`node tests/test_v314_alert_workflow.js`
`node tests/qa_persistence_recovery.js`
`node tests/qa_scriptable_bridge.js`

The v4 workflow builds and publishes the entire stand-alone Scriptable runtime, paste-ready TXT, release ZIP, and a SHA-256 verified small starter pinned to the immutable runtime commit.
