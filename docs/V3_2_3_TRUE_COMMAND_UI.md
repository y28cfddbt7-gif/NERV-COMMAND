# v3.2.3 / NERV COMMAND — screenshot-matched actual tactical console

Base release: v3.2.2 `e9a2681a790a4146173dfc3bea31f5981d9b22ff`.
Feature: `feature/v3-2-3-true-command-ui`.
Primary acceptance reference: user-provided screenshot, formerly shown by assistant as “NERV / CENTRAL COMMAND” with CASE/AP, blue-grey line-map, EVA reticle, red tracking, radio, then four command buttons.

## Actual structural work
1. A new **single real DOM card** `#v323Frame` is mounted on `battle/engage` during live combat, comprising the EXISTING, live NERV status/control nodes, original functional 3×3 tactical map, concise map caption, existing radio, original real four tactical buttons, turn button and outcome text, in exactly that vertical order.
2. No second fake battle mock-up, no static-only copy of the map and no extra child Scriptable view. Action elements are moved using `append/prepend/after` (not copied), preserving event bindings.
3. The original precision Canvas `#battleStage`, tactical attack/AT controls `#battleTactics`, and weapon selector are **moved** to an in-place, contextual attack sheet `#v323AttackSlot`. They keep the canonical target/power/AP/save reducers.
4. The old hidden v2.30 mode/turn buttons are no longer clicked. `NERV_COMPACT_BATTLE.selectMode` and `endTurn` expose the SAME underlying `consoleBattleCommand` operations. The old v2.30 markup remains internally for parity but its action path is no longer a dependency of the primary UI.
5. Defensive control retains existing `v315CityDesk` repair, armor, gun, reserve power, diagnostics, and existing `v300` formal command sheet. All use original reducers. `v321` MAGI reads stored actual deliberations and v3.1.4 alarm reset still requires explicit confirmation.
6. Old v3.2 and v3.2.2 *styling layers* for the operation screen were removed from the v310 CSS and replaced with one current v3.2.3 visual source. Previous support styles and all protected original art remain intact.
7. SVG tactical diagram was refined with urban contour and EVA cockpit marker; its red symbols remain **forecast attack zones**. The source has no reliable enemy position coordinate, so the ANGEL element is a **tracking/status legend** (“POSITION UNKNOWN”), not a false location or a fake unit.

## Invariants and scope
- The map's real nine button cells remain pointer targets underneath the SVG (SVG has `pointer-events:none`).
- No new battle state, extra timers, resource mutation, or save migration.
- HOME/DUTY and specialist screens remain operational. Existing battle setup/deployment/records internally keep their original routes and saved data.
- This milestone consolidates the LIVE COMBAT face and context controls. It does not falsely claim to have deleted every historically retained specialist module.
- **Not verified on a real iPhone Scriptable/WebKit**. The user should compare iPhone screenshots and interactions after deploying this build.

## Validation
`python3 scripts/test.py --no-browser`
`node tests/test_v320_unified_terminal.js`
`node tests/test_v321_operations_consolidation.js`
`node tests/test_v322_tactical_map.js`
`node tests/test_v323_command_ui.js`
All previous combat/recovery/persistence/audio/MAGI/asset regression checks.
Release workflow builds a full paste-ready JS/TXT, ZIP and SHA-pinned starter on successful validation.
