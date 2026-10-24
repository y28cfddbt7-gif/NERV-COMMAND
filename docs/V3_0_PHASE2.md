# NERV-COMMAND v3.0 / Phase 2 — 正式通信連携

Status: **PHASE 2 INTEGRATED CODE**. This is not yet the full 4-workstation UI rewrite. v2.33 gameplay and Phase 1 kernel stay authoritative.

## What has actually been implemented
- New `src/browser/v301-operational-comms.js` with four transactional commands:
  `comms.request`, `comms.reply`, `comms.acknowledge`, `comms.flush`.
- Supported professional contacts: 日向 (enemy/track), マヤ (EVA health/sync), 青葉 (links), リツコ (MAGI), ミサト (orders), and レイ/シンジ/アスカ (own EVA position and shutter/firing-lane safety).
- Contact role/topic mismatch, wrong EVA pilot, wrong battle sector, wrong CASE ID, invalid actor, stale revision, missing response, double receive, unknown save schema rejected without changes.
- All radio transfers go through existing `commandOperation` atomic backup/persist/rollback. Same saved `S.commandV3.schema=1`; additive `transmissions` (bounded 48) and `links` (bounded 48). Shared bounded event log, formal messages and commandID journal, no new incompatible save schema.
- If comms off, a request becomes queued; it is stored once in the case, and not incorrectly shown as delivered in the `worldCommunication` feed. After restored, the operator deliberately presses **保留通信を再送** to deliver it once. Old-tick shutter safety messages expire instead of being replayed as if valid.
- Replies are based on **current canonical simulation state**, not arbitrary AI-generated text. Operator must click 受領確認 to record that they actually read the report. Private/personal conversations and their memories do not authorize orders.
- Critical integration: During active EVA field combat, if the selected approved city shutter will block the attacking EVA's sector firing lane, Phase 1 `city.shutter.execute` is rejected until a matching pilot receives a `shutter-safety` request, replies with a trusted same-turn report, and operator explicitly acknowledges it. The system also re-checks the current unit, sector and battle round at execution. Existing unconditional v2.33 legacy buttons remain outside this Phase 2 command scope.
- UI: `src/browser/v301-comms-ui.js` embeds one **collapsible formal radio section inside the EXISTING 通信 > 連絡先 screen**. Contact selector, request topic, optional map sector, live queued/pending/replied/acknowledged list, receive/ack actions, official transcript. No new separate screen. Existing private contacts and chat are untouched.
- `src/browser/v300-operations-desk.js` link to 全通信 opens the formal radio section, and shutter command buttons show a pilot safety dependency when appropriate. No new always-on tactical HUD.
- Original high-resolution artwork and vendor animation/audio files unchanged, no added timers, RAF loops or AI network calls.

## Phase 2 gameplay example
1. Phase 1 has active CASE and scan at least 34, attacking EVA deployed at distance 1–2 in same sector as a requested shutter.
2. Submit city shutter proposal to simulated Misato and record approval.
3. Executing immediately is denied, with explanation to obtain pilot radio clearance. Click 全通信.
4. In official operations radio select current pilot, `防壁展開前の射線確認`, current city sector. Send.
5. Receive pilot's report. Report alone still does not grant permission: click 受領確認, which commits an official `communication.acknowledged` event with validated round/sector/unit.
6. Return to city desk and execute shutter. Energy charged once. Firing lanes blocked, tactical weapon fire checks an actual obstacle. EVA must reposition or operator release shutter.
7. If communications fail, the radio request is saved as queued, replayed only when restored. Old round safety replies must be requested afresh.

## Safety & tests
- Existing v3.0 Phase 1 Node and older v2.29 combat tests remain; new Node VM tests cover six multi-command sequences: staff reply/ack and retry, radio outage/resend, actual pilot safety gate, wrong pilot and stale turn, revision/rollback/unknown schema, and cross-CASE isolation.
- Runtime `S.commandV3` is additive: no automatic migration of private personal conversations into official orders.
- The commander/pilot replies are **local rule-driven simulations** based on actual state, NOT freeform autonomous agents or real voice actors. No fabricated voice recordings.
- Systemwide 4-station UI cleanup, emergency interrupt audio, richer dialogue variants and deeper NPC chain-of-command are deliberately deferred, not misrepresented as Phase 2 achievements.
- No edits or re-encodings to `assets/` or existing original artwork.

## Scriptable distribution
Deliver full integrated Scriptable `.js` (~14MB), matching copy/paste `.txt`, small immutable SHA-pinned network starter, complete asset ZIP, pass/fail logs, and remaining device validation.
