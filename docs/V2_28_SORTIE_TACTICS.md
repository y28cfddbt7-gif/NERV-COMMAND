# NERV-COMMAND v2.28 / SORTIE DECISION + TACTICAL COMMAND MAP

Base: v2.27 tested GitHub build branch `feature/v2-27-cinematic-workstations`. This release retains ALL protected image files and renders, complete game, and Scriptable audio restoration.

## Sortie workflow: a real strategic decision before MAP combat

On battle/setup, an additive sortie planning desk lets the NERV duty officer select a launch stance and up to three checks from four. Commands are persisted transactionally under optional `S.operatorConsole.sortieV228` (schema 1; caseNo and unit keyed). Existing console schema stays 1. An older save without this field remains fully valid. The original manual prepare, MAGI approval and launch buttons continue to enforce all existing gates. At deploy, the original console reducer applies the choices ONCE inside its own `commandOperation` transaction, before switching stage to battle.

- **BALANCED:** no intrinsic cost. Checked PILOT adds +4 sync (cap 100), INTEL adds +12 analysis (cap 100), EQUIPMENT adds up to +8 integrity (cap 100), POWER restores +6 defense energy (cap 100).
- **RAPID:** gains +1 unit of saved enemy standoff distance (cap 9) but -7 tactical integrity, in addition to the chosen inspections.
- **FORTIFIED:** spend 7 defense energy, launch with **1 rather than 2 AP** and an AT-guard posture against the next enemy turn. It is unavailable if energy is insufficient and the transaction rolls back safely.
- Save and game-clock durations are NEVER inferred from animation runtimes. Selecting checks uses finite slots, not fictitious timers. No fabricated pilot dialogues or fake MAGI approvals.
- Old in-progress scenarios with no explicit plan continue to deploy unchanged. New planned launches apply once only. Bad schemas fail safely without deleting the original save.

## Tactical map redesign
The active true simulation grid is **3 columns by 3 rows** (W/C/E × rows 1,2,3) with perspective canvas underneath. This release adds a large, thumb-friendly, **OPERABLE grid** above the original combat stage. Tapping neighboring sectors issues real `consoleBattleCommand('move',{col,row})` with all engine checks and AP cost, cover and enemy danger drawn from `tacticalState().enemyPlan`. Illegal and distant sectors are disabled. Separate buttons issue the real guard/support command and switch to real manual aim UI. No fake 5×7 grid masquerading as the existing engine. Original 3D city illustration and weapon sprites stay unchanged; existing drag/touch canvas, MAGI analysis, direct weapons and history all remain available.

Anime.js v4.5.0 staggered launch step feedback and tactical threat changes use existing `NERV_MOTION.animate` + NERV_FX, without new unmanaged animation loops. Existing contact/music/alert/sound behavior is untouched.

## Validation and handoff
- Required: `python3 scripts/build.py`, `python3 scripts/build.py --check`, `node --check app.js`, `python3 scripts/test.py --no-browser`, `node tests/test_v2261_audio.js`, plus v2.28 actual finalizer tests.
- Preserve all `assets/**`, renderer CSS and vendor libraries byte-for-byte. Modified source files are restricted to the battle console integration, additive JS and CSS, tests/docs/build config.
- Deliver small checksum-pinned Scriptable launcher, illustrated all-in-one JS runtime, identical complete .txt code and downloadable ZIP. Keep v2.27 in separate Scriptable script for rollback.
- Device tests: choosing each stance; 3 of 4 checks and reselecting; original MAGI approval; stage deploy; AP/energy/integrity effects; button grid threat/cover and actual move; return to app preserving sound and code, restart preserving case status; rendered 60fps must be measured on device.
