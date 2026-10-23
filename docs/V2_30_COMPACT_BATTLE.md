# NERV-COMMAND v2.30 | One-screen task-focused battle workflow

Based on v2.29 with its functioning issue resolution, real tactical orders, enemy targeting AI, MAGI gates and save-backed rules preserved.

## Why this release exists
The operator reported that v2.29 had working combat but was unusably long. Previously the old TACTICAL COMMAND, v2.28 3×3 battle map, v2.29 recon/feint/defend commands, real combat/precision Canvas and weapon controls were shown one after the next. This is a UI problem, not a new combat algorithm requirement.

## A shorter interface that doesn't remove functionality
- On battle/engage, two large tabs: **指揮マップ** (default; 3×3 grid, hazards, orders, AP and real wait-turn) and **精密照準・兵装** (original painted battle stage, target Canvas, MAGI and weapon/AT controls). They are mutually exclusive on screen, **not** cloned, detached from their engine or replaced with bogus commands.
- Keep a real **手番終了** button on the compact toolbar even in map mode; it calls `consoleBattleCommand('wait')` using the existing save/AP engine.
- Reduce 3×3 sector button height from 98px to 66px (9 tiles still large enough to tap), reduce decorative telemetry margins, and keep the 3 skill command buttons.
- Keep the original 2.25 giant TACTICAL COMMAND alive and updated but **default hidden**, shown with a single 44px “作戦テレメトリを表示” toggle. The v2.24 detailed data link is moved to the bottom of the screen as a disclosure.
- On battle/setup, the three **real incident actions** (from v2.29) appear in a 3-column row rather than a 3-card stack. After the incident is resolved, the cards, verbose explanation and resource summary collapse into a compact completion line; refusal/error text remains visible.
- MAGI's vote detail list is placed inside an optional native disclosure; original approval buttons remain on screen. The old v2.28 plan is folded even for legacy cases; users can open it explicitly, including on old saved games.
- Every action remains connected to original game reducers; no duplicate UI state is persisted, no saved game reset or migration is required.
- Tab mode and optional telemetry expansion are transient presentation-only state. On new CASE the operator starts in command-map mode.
- Existing iOS Scriptable floating Close/share avoidance remains untouched.
- No new unbounded animation loop or JS timer; the brief switch feedback uses the existing Anime.js v4 `NERV_MOTION`.
- Graphics are protected byte-identically, and visual layers are not rasterized or downscaled.

## Validation
Build `NERV_COMMAND_v2_30_SCRIPTABLE.js`, `.txt`, bundled ZIP and checksum-pinned `NERV_COMMAND_v2_30_STARTER.js`. Run historical regressions (including launch incident, energy costs, WebAudio recovery) and v2.30 compact UI assertions. Inspect on the iPhone: setup incident choices fit side by side, MAGI details can expand, battle has two mode tabs, map has usable 3×3 large targets, “手番終了” actually advances enemy, precision targets/weapon buttons still work. Native iOS overlay, touch accuracy and measured frame rates require physical device verification.
