# ADR 003 — NERV-COMMAND v3.1 / 統合作戦画面 + 戦術ゲーム再設計

**Decision: ACCEPTED FOR IMPLEMENTATION (design only, no runtime release).**  
Supersedes the screen/navigation parts of `docs/V3_0_ARCHITECTURE_DECISION.md` that required a separate MAGI station or COMMS station for mission-critical actions. Keeps the approved persistence, asset protection and transaction rules.  
Baseline: `feature/v3-0-phase2-operational-comms` (version 3.0.2).  
Target: **NERV職員として一作戦を指揮するゲーム**, not a suite of loosely connected menus.

## 0. なぜ前版を破棄するか
The existing battle module lives under `battle/setup|deploy|engage`, the official municipal command under `infra/map`, and the Phase 2 staff/pilot transmissions under `messages/contacts`. A player must navigate off the battle screen to request pilot acknowledgement then return, which violates the operation premise. The newest communications request/topic/dropdown UI represents an administrative workflow, not an engaging tactical decision. Success on the CI regression suite did **not** prove that this interaction was usable.

**ABSOLUTE DESIGN RULE:** During an active CASE, every required sortie, combat, defense, MAGI, official radio, approval, and command acknowledgement action MUST be executable **without leaving the single OPERATIONS page**. A modal, bottom sheet, inline one-line reply, or smart command ribbon is allowed; a separately navigated screen is not. No additional full-width panels, multiple independent tactical boards, or vertical stacks of repeated telemetry.

## 1. Exactly two top-level contexts
- **HOME / DUTY**: offline normal duties, real weather, calendar, clock, battery, preferences, personal conversations, personal message archive, system info, simulation training selection. Utilities remain intact as subordinate menu items, not deleted.
- **OPERATIONS / 作戦管制**: a single context with phase-aware main canvas. Main job changes based on CASE phase. All mandatory mission communications and technical actions are embedded.
- **Legacy MAGI and COMMS details** are *optional read-only or specialist facilities* opened from OPERATIONS as overlays/sheets for deep dive, and from HOME as archive/duty utilities. Neither is a mandatory stop during a mission. Navigation's clear persistent HOME control remains visible throughout, excluding native iOS Close/share hitboxes.
- The main app can expose optional settings/support routes, but the bottom primary navigation has **HOME** and **OPERATIONS** only while a CASE is active. No 4-8 navigation tab rows during combat.

## 2. Unified OPERATIONS screen anatomy on iPhone 17 Pro
Prioritize the battlefield at ~55–65% of the **available in-app content viewport**, adjusting dynamically to keyboards/native Scriptable chrome. A fixed pixel guess must not cover user controls.

1. **One compact STATUS rail** (not duplicate ribbons): `CASE / current EVA / AP 0–2 / turn / threat status`. During alerts expand warning briefly and revert. All controls under the iOS native Close/share safe-area.
2. **One dominant tactical visual**: the existing protected high-resolution Tokyo-3 artwork, terrain/city representation or professionally composed battle art, with unobtrusive tactical overlays. Render target, EVA, path, shielding, attack cones, infrastructure damage, cable/power reach. Keep labels short, selected target details outside map; suppress repeating long labels inside it. Do not replace original art by low quality inserted doodles or SVG.
3. **One priority EVENT/COMM ribbon**, one or two lines max, showing who spoke, what decision is required, whether response is pending. Tap expands a *bottom sheet* limited to ~35% of viewport, while the map remains visible; up to 3 meaningful reply/decision choices. One tap closes the sheet, one tap resumes the exact map state. Urgent exceptions remain as inline event cards, never switch route.
4. **One contextual ACTION row** (three to four large, >=44pt controls): phase-specific commands such as `移動`, `照準/攻撃`, `解析`, `防衛設備`; primary choices may change with situation. Hidden advanced commands inside one compact tactical sheet only when necessary. `手番終了` always at predictable location.
5. **One HOME affordance** always accessible and physically tappable. When leaving an active battle, confirm only if there is a *pending uncommitted* action, not when merely reviewing. Returning preserves selected unit, viewed region, queue and CASE phase.

A breakdown of the viewport must be validated in an iPhone screenshot for launch, battle and emergency. The battlefield must remain legible even with the comm sheet open.

## 3. ONE game loop, no screen-hopping
**Phase machine**: `duty -> contact -> analysis -> sortie.prepare -> sortie.review -> sortie.launch -> combat -> aftermath -> duty`.
Each phase renders a different **operation surface in the same OPERATIONS route**. A phase is controlled by simulation state, not manual menu navigation:
- Contact: angel appears, Hyuga auto-reports. Assign response priority: scan / evacuation / ready EVA. One decision has a real consequence.
- Analysis: MAGI reliability and 3-core verdict visible in a small expandable **overlay**, the real MAGI reducer decides feasibility. Data has confidence and freshness, never simply a fake percent decoration.
- Sortie: three **actual** decisions, not a sequence of obligatory dummy acknowledgements: which EVA to deploy, which sortie position/route, which shortage to accept/resolve. Resource/sync/cable/approval constraints propagate to combat; original launch visuals animate within the **same screen**.
- Combat: tactical map and aim are **two modes of the same main canvas**, no separate page, no second full-size illustration. Rapid toggle swaps view; original 2 AP and actual combat state remain. Player makes tactical and command-level decisions without scrolling multiple screens.
- Aftermath: objective fulfilled/failed, city damage, pilot status, log of decisions, staff/pilot reactions, readiness for next CASE. Then returns to DUTY without combat replay.

### Combat turn specification
1. **Situation update (automatic)**: enemy telegraph, current sector, EVA power and casualties. Hyuga/Maya/Pilot reports can be read and acted on in-place.
2. **One strategic directive (recommended turn budget: 1 Command Slot/turn)**: authorize defense shutter, redirect power, request MAGI scan, prioritize evacuation/supply, or ask for radio correction. Some are free informational consultations, others consume resources/slot.
3. **EVA tactical orders (legacy 2 AP/turn)**: move, guard, neutralize AT, aim/fire, deploy support as supported by the existing reducers. A move, scan or fire must not be charged twice when command kernel and legacy reducer both observe it.
4. **Confirm turn end (single tap)**: replay-free enemy reaction, terrain/city damage, communications delivery, pilot fatigue/conditions. Command Slot resets. Do **not** advance time while player is reading a report or private chat.
5. **Next situation**: event queue prioritizes critical warning and choices, UI updates ONE map rather than appending cards.

A command with no meaningful alternative must be automated or consolidated. Do not require sequential `request -> review -> execute -> confirm` button presses if there is only one meaningful outcome. The commander can interrupt with approve/revise/deny **as an actual single event/decision**, not as a stack of four modal screens.

## 4. What makes this a game
- **Visible consequences**: shelter vs EVA launch power; armored shutter vs firearm line of sight; patrol support vs finite resources; time spent analyzing vs enemy advance; cable reach vs repositioning.
- **Uncertainty**: before MAGI scan the Angel's attack cone is partially unknown; a report may be stale after enemy movement; updated information can change the best decision.
- **Persistent stakes**: city damage, reserve power, EVA injury, supply, credibility of outdated reports and pilot stress carry through CASE, are explained in aftermath, and do not reset when switching modes.
- **Enemy identity**: Sachiel requires close pressure, breach and AT neutralization; Shamshel imposes zone denial/close combat; Ramiel uses high-threat long-range firing requiring engineering, energy and precision. Exact costs/balance to be tuned from deterministic simulations. Distinct enemies do NOT mean more full-screen tabs.
- **Operator role**: player is C-3 controller, issuing and synthesizing orders. Pilots carry them out and can warn, question or acknowledge. The result is decided by the tactical/domain reducer, not free-text mood.
- **Partial objectives**: protect civilian shelter, keep an EVA supplied, avoid exposing reactor line, preserve a city district, maximize mission success; one fight may be won with higher civilian damage or material debt.
- **Rule clarity**: display expected resource and risk before confirming; results must appear in position/AP/world-state and incident log immediately.

## 5. Communications as embedded battlefield mechanics
**NO mission-critical messages under `messages/contacts` during an active battle.** The separate contact UI remains for voluntary private chat and mission archives, never an action dependency.

Message types:
- `AUTO_REPORT`: triggered from canonical event such as enemy range change, sync drop, power cut; appears in one-line comm ribbon, no need to open any panel to continue unless action is needed.
- `REQUEST_INTEL`: question directly available from contextual `解析・確認` action, routed to Hyuga (enemy), Maya (EVA), Aoba (comms), Ritsuko (MAGI) with real resource/time/info freshness costs.
- `ORDER_PROPOSAL`: commander authority check when material (Misato) within contextual order sheet. Approval/denial/revision recorded but does not require a separate multi-screen acknowledgement ladder.
- `PILOT_COMMAND`: player gives operational instruction to current pilot; pilot response confirms or warns of constraint. Immediate radio and map response. Radio loss queues a stateful command, does not falsely claim receipt.
- `PILOT_WARNING`: hazard (e.g. defense shutter blocks aim). The **same in-place sheet** offers choices: `防壁解除` / `EVA再配置` / `作戦変更`, each with genuine costs and turn consequences. Dialogues are varied by persona and actual simulation context; no invented damage or unauthorized execution.
- `ACK`: important safety/authority acknowledgments stored in case, triggered from the choices sheet and never hidden in an unrelated contacts tab.

**Rule:** A conversation event never directly alters game statistics. The selected actionable response dispatches a typed command under `commandOperation`, after authorization. Private chat remains protected, separate and may exist during duty, but never grants authority.

**Example in one screen:**
- Hyuga ribbon: 「東部への接近を確認」
- Player highlights east shutters on tactical map, taps 防衛設備.
- Misato sheet responds approve/hold/alternate based on true conditions.
- Current pilot ribbon: 「その防壁では射線が塞がれます」
- Same sheet displays options `EVA移動(1AP)` | `展開を保留(0)` | `防壁解除(防護低下)`.
- Choosing `EVA移動` returns to the same tactical canvas with eligible cells highlighted; after move, order can resume as appropriate.
No separate route, dropdown selection for person/topic, or forced round-trip.

## 6. Reconcile Phase 1+2 technical assets with game design
Reuse `S` as canonical 2.x save owner until complete migration. Retain `S.commandV3.schema===1` and its `orders/events/transmissions/links` for compatibility. Each CASE carries identity, turn, phase, sender, authority, freshness. Do not create a second battle resource pool.

**Preserve reducers**: `v219-console-engine.js`, `v217-tactical-engine.js`, `v215-angel-engine.js`, `v229-gameplay.js`, `city-defense.js`, real MAGI/power rules, existing save and WebAudio recovery. Preserve existing high-res reference assets and local Anime.js library byte-for-byte.

**Replace old presentation** rather than masking:
- Retire/replace `v300-operations-desk.js` city's multi-stage administrative form with `ui/operation-surface.js` and `ui/command-sheet.js`.
- Retire/replace `v301-comms-ui.js` contacts dropdown request/ack panel with `ui/inline-radio.js` in OPERATIONS; preserve its protocol/data reducer `v301-operational-comms.js` initially under adapter.
- Collapse `battle/setup`, `battle/deploy`, `battle/engage`, `infra/map` into a single `operation` route with phase + a single scene per phase. Preserve deep links via redirects as old-saved-state compatibility.
- Retire redundant `v221..v233` visual readout stacks, `v231`/v232/v233 patch layers when all their real buttons and image references are migrated. Avoid endless layered CSS `display:none !important`.
- MAGI high-resolution tri-core display and remaining technical control available as an inline overlay, without leaving OPERATIONS. The old dedicated page can remain as an OPTIONAL diagnostic accessible from HOME, not a required quest chain.
- Formal event transport `v300-command-kernel.js` + `v301-operational-comms.js` still run through `commandOperation` and immutable command IDs. Merge their read models and keep transaction invariants including rollback, turn/CASE validation, dedup and queue replay.
- Hard requirement: raw Scriptable full `.js`/matching `.txt` and light SHA-pinned starter delivered per implementation milestone. No patch-only delivery.

## 7. Acceptance tests (must pass BEFORE shipping redesigned UI)
**A. No navigation detour:** While Sachiel battle active, pilot warning, commander proposal, MAGI scan, shutter release, EVA move and weapon fire can all be completed in OPERATIONS. Assert `currentPage==='operations'` through entire sequence and no `NERV_MOBILE.open('messages')`, `...open('infra')`, or `...open('magi')` is executed by a mandatory decision.
**B. Real consequences:** East shutter saves city damage but blocks rifle lane; choosing alternative route changes EVA sector and costs 1 AP, or opening shutter makes lane valid but changes city's protection. All changes originate in original rules and persist.
**C. Communication truth:** A queued pilot request during radio failure does not falsely mark delivered or acknowledged. Resume/retry once; expiry check for changed turn/position; rendered dialogue matches fresh canonical state.
**D. Attack timing:** Reading/viewing the comm sheet does not advance battle turn or spend AP. Committing a tactical action does. Enemy phase follows explicit turn end, once.
**E. Device screen:** On iPhone 17 Pro, a meaningful playable battlefield dominates, commands do not hide under native Scriptable chrome, HOME reachable without scrolling, action targets >=44pt.
**F. Content continuity:** All three original EVA painted artworks, city atlas, protected backgrounds, WebAudio resume, weather/calendar/battery, and legacy saves survive.
**G. UI discipline:** Only one main map and one live status rail on OPERATIONS. All necessary communication in an inline contextual sheet; no permanent duplicate cards and no compulsory nested subviews.
**H. Character quality:** Distinct persona lines from verified state, no misleading fictional authority; 3+ variants per frequently occurring situation, no high-frequency spam.
**I. Simulation:** Deterministic scenario tests for success, retreat, low resources, comms offline, MAGI hold, pilot non-ack, evacuation risk; no softlock without a genuine alternate route.

## 8. Implementation sequence
**0. Freeze + playable vertical slice spec**: preserve v3.0.2 as rollback; test original assets, explicit event-by-event map of 1 Sachiel operation, validate flow/state and screens before adding graphics.
**1. Unified battle hub**: replace mandatory navigation with one `operation` scene, inline contextual comm + tactical choices. Port existing release approval and city command UI in-place. Do not add a new card to current UI.
**2. Tactical depth**: single Command Slot + two EVA AP (costs from actual reducers), multi-objective missions, player alternatives, real territory/cover/shutter/power interactions.
**3. Character coordination**: meaningful dynamic reports, pilot replies, authority, radio loss and recovery integrated in the same canvas.
**4. Consolidation**: physically remove old UI modules and duplicated CSS after coverage and visual parity, eliminate wrapper chains, retain only essential domain engines and art.
**5. Acceptance**: full Scriptable package, screenshots on iPhone, scenario tests, rollback and save migration evidence.

**Stop condition:** Do NOT begin another new visual page or additional operation HUD until A–I acceptance conditions are supported by tests. This ADR supersedes the previous four equal screens plan for active CASE.
