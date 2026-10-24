# NERV-COMMAND v3.1 — Integrated Operations / First Running Build

**Scope:** Implement the first playable same-route combat shell described in `V3_1_INTEGRATED_GAME_DESIGN.md`. This is **a working integration milestone**, not the completed tactical redesign/Phase 4 of that ADR.

## Actual behavior
- Operates inside the existing **battle** station with automatic phase view according to canonical `consoleBattle().stage`, preserving old approval, deployment, attack mechanics, original images and save.
- On one battle page: CASE, EVA/AP/HP/power top rail, latest *real committed* formal radio, contextual tactical/precision switch, a compact bottom command bar and a limited-height **inline/bottom overlay** accessible without jumping to infra/MAGI/messages.
- City command choices run actual `NERV_COMMAND_V3.dispatch()` for MAGI scan, shutter proposal, locally simulated Misato approval, approved shutter deploy and safe release, with transaction validation and original power cost. Battle tactical map remains visible and is the primary art; no new bitmap.
- When a shutter clashes with EVA lane, **request/reply/ack** happens from the *same* battle page. Only same-CASE, same-turn, same-unit, same-sector acknowledged pilot radio authorizes deployment. A button offers switching to real move mode (actual AP costs apply on tap).
- Contextual staff communication available inside the same operation page: Hyuga enemy report, Maya EVA status, selected pilot situation, MAGI waveform scan, optional offline transmit/resend, report reply/ack. The original underlying official radio controls and diary are available via **one details disclosure inside this same sheet**, never compulsory separate routing.
- Existing v2.33 municipal operations, Phase 1 approved orders and Phase 2 professional radio controllers are **moved**, not cloned, into the optional inline sheet; they continue to run original event handlers.
- Existing v2.29 recon/feint/fortify controls moved into the single tactical sheet under an optional disclosure.
- In active CASE, bottom primary nav is limited to **HOME** and **作戦管制**, and HOME surfaces utility links to real weather, staff tools, settings, personal chat and expert MAGI details. Those functions are not deleted.
- Reuses the original WebAudio, Anime.js, painted EVA/city map and Scriptable bootstrap intact.

## Technical migration
New modules:
- `src/browser/v310-operation-surface.js` (late in browser manifest, after previous decorators, before route-close), exposes `window.NERV_V310.snapshot()`.
- `src/styles/v310-operation-surface.css` last in styles manifest, handles fixed 5-command touch strip + max 37dvh sheet, original map at ~51dvh, protected iOS safe area.

The new integration deliberately does not create a separate 'operation' route because historic game reducer and generated `mobileSection('battle',view)` rely on the battle DOM and must remain compatible with existing saves. Three internal phase DOM sections still exist, but all are **one battle/operations screen** and advance automatically with game state.

**Technical debt remaining**: v221-v301 redundant decorator source files and corresponding CSS are still compiled and may reparent nodes during draw. This build prioritizes *not losing game controls*. Full architectural elimination and one command slot per turn/multi-objective balance belong to subsequent build stages; do not misrepresent this as complete final redesign.

## Screens to verify on iPhone
1. HOME -> 作戦管制. If no active CASE, setup stage visible with high quality Angel roster.
2. Pick Sachiel, start CASE, encounter launch incident. Solve with original real options, choose unit, approve by MAGI, deploy with canonical positioning/weapon.
3. Battlefield opens automatically; primary map has no mandatory tabs. Bottom actions: 移動, 照準・攻撃, 都市防衛, 通信・MAGI, 手番終了.
4. Switch tactical/precision and back with correct reducer mode/AP. No extra turn when reading/reporting.
5. Tap 都市防衛, select EVA's firing-sector, request shutter/approval, then see inline pilot clearance choices without navigating to another page.
6. Send, receive and acknowledge pilot reply via SAME modal; deploy shutter consumes 12 power and blocks line of sight until moving EVA or releasing shutter.
7. Temporarily disable comms through existing original utilities: outgoing transmissions queue and can be resent after restoration; no phantom acknowledgments.
8. HOME button visible throughout, no overlap with native Scriptable Close/Share. UI sheets keep main battle art visible, touch areas >=44pt.
9. Screenshots for setup, deploy, field command, precision, pilot warning; compare original artwork and image hashes.
10. Stop on any buttons that are blocked behind chrome, unreachable or duplicated. Restore original v3.0.2 if physical UX fails.

## Automated checks
- Existing legacy and v3.0 Phase 1/2 Python+Node suites remain unchanged except version-specific fixture assertions.
- New v3.1 static architecture and route discipline tests assert no mandated `NERV_MOBILE.open('messages'|'magi'|'infra')`, no new underlying reducers, official transactions reused, no timers or RAF. Runtime unit tests confirm original resource/ack/rollback flow.
- Build output: complete `NERV_COMMAND_v3_1_SCRIPTABLE.js`, identical `.txt`, immutable SHA-pinned `NERV_COMMAND_v3_1_STARTER.js`, and source ZIP.
