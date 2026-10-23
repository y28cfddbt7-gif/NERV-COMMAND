# NERV-COMMAND v2.29: 実際に変化する発進・戦術ゲーム

This version addresses the user-observed failure of v2.28: it merely added a large pre-launch form, without creating meaningful game decisions. v2.29 replaces the foreground workflow with a real incident, real resource choices, and real tactical orders. Existing high-resolution images and audio recovery remain.

## Starting an operation
- Calling `consoleBattleCommand('start')` initializes a deterministic incident, keyed by the current CASE, the selected EVA, and the Angel; the incident is saved as optional `S.operatorConsole.incidentV229` (schema 1) without changing the existing `S.operatorConsole.schema===1`. Existing saved operations with no incident continue unchanged.
- Three distinct scenarios (catapult power instability, delayed command link, neural sync drift). Each has three actions with materially different costs/benefits: city power, MAGI scan quality, sync level, EVA integrity, enemy distance.
- Incident remains **pending** until the operator chooses a response. The original `placement` and `deploy` commands refuse to advance if a fresh CASE has an unresolved incident.
- Selecting a response is a real `commandOperation` transaction; result and cost are persisted and logged, and a resolved incident cannot be executed twice.
- Existing engine MAGI vote, preparation, officer role/security restrictions and all legacy game operations remain mandatory.
- The v2.28 form is preserved under a collapsed section for a new incident, rather than taking up a full extra screen; old saved CASEs can access it directly.

## Actual combat changes
- New tactical command calls `consoleBattleCommand('recon'|'feint'|'fortify')` inside the original transactional reducer: all cost 1AP, 9/7/7 city power respectively.
- Recon increases real saved MAGI scan progress by 18; feint changes the actual `enemyPlan.columns` for the next attack, redirecting away from the EVA sector; fortify activates A.T. and saved `guardUntil` for the next enemy turn.
- A deterministic `tacticalPlan` variant plans real attack lanes based on position, CASE and round, rather than always tracking the exact current column. The upcoming pattern is visible in the tactical map and used by the existing `v27Advance` damage calculation.
- The legacy 3×3 game grid, own player location, movement/AP, weapon/line-of-fire and original illustrated stage remain fully operational. This is a **game-rule enhancement**, not a claim of a brand-new 5×7 grid, real-time pathfinding, multi-unit simultaneous control or combat replays.
- No new JavaScript interval / RAF. Finite interface animations use bounded Anime.js v4 via `NERV_MOTION`.

## Acceptance / known boundaries
- Automatically test choice costs, idempotence, rejection for insufficient power, real enemy retargeting and AP tactical orders, plus historical regressions, audio recovery, generated Scriptable artifacts, byte-for-byte artwork preservation.
- Hardware testing required for iPhone native-toolbar coverage, touch hit areas, motion/audio, and end-to-end UI screenshots.
- Provide SHA-256 pinned 13KB Scriptable starter, complete single-file JavaScript, identical .txt copy version, ZIP; leave v2.28 intact for rollback.

## Player walkthrough
1. Battle > receive Angel case. The new red SORTIE DECISION panel presents one of three incidents.
2. Choose a meaningful resolution. Inspect immediate changed energy/sync/scans/integrity/enemy distance.
3. Finish legacy preparation + MAGI vote, then confirm MAP launch. Unresolved incident blocks placement.
4. In tactical battle, compare risk sectors and move. Press Recon, Feint, or Fortify, noting AP and city power cost; then end turn and observe enemy attack telegraph/damage and effects.
