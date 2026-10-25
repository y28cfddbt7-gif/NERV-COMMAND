# NERV-COMMAND v3.2.2: operational map as the real battle UI

Reference: the user's screenshot depicting NERV / CENTRAL COMMAND, case/AP, grey-green tactical map, yellow EVA crosshair, red forecast target, operations radio, and four large primary buttons.

## Shipped scope
- Preserved the existing 3x3 live tactical map with genuine functional hit areas. Added a **pointer-transparent** SVG overlay with dark ink grid, district shape, Eva unit position, attacker-reported forecast fire zones, and actual defended/damaged sectors. Routes and marks are schematic, never claimed as actual geographical coordinates or exact enemy coordinates.
- Actual data from `tacticalState()`, `enemyPlan`, `S.defense.city` and `consoleBattle()`; drawing is invalidated only when the signature changes. No new timers, game actions, or fake result data. The existing map can still be tapped to issue a real move.
- Kept one command composition near the map: battle map, operational radio, four working **解析 / 移動 / 攻撃 / 防衛** actions and a separate end-turn control.
- Unlike v3.2.0, the four operations buttons and radio now live immediately under the same actual field map, **not in a second permanently fixed bottom overlay**.
- Reuses `v315CityDesk` actual original facility operations in the integrated defense sheet when in battle. The panel returns behind the original illustrated Tokyo-3 map on the INFRA page. The older city command panel sits under a single expert disclosure without cloning its state.
- Recovers any alert through the existing multi-step, backup-first confirmed recovery action. Keeps v3.2.1 single alert/MAGI core decision readout.
- Existing city/EVA illustration assets, phase/game reducers and save files remain untouched.

## Boundaries
- The enemy prediction is labeled **FIRE ZONE**; there is no verified real enemy position in the source combat state, so do not invent an ANGEL coordinate as in the draft schematic.
- The old specialist pages have not all been retired. This is a verified v3.2.2 structural milestone, not a claim of the entire v3.2 renovation.
- Real iPhone Scriptable/WebKit layout not yet verified.

## Tests
`node tests/test_v322_tactical_map.js` plus `python3 scripts/test.py --no-browser`, v3.2.0/3.2.1 regression tests and all existing combat, MAGI, radio, city and recovery tests.

GitHub Actions emits the complete self-contained Scriptable JS, copy-paste TXT, release ZIP and immutable-SHA pinned smaller starter. Use the built artefacts, not cherry-picked source fragments.
