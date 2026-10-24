# NERV-COMMAND v3.1.2 / MAGI pending-operation recovery fix

**Root cause, verified in source:** The visible city's average integrity and the “recover all” modal are separate state transitions. The v3.1.1 `終了・復旧` button opened `openAlertReview('end')`, but three old wrappers in `world-workflow.js`, `v214-security-ui.js` and `v215-operations-ui.js` forcibly set `alertClear.disabled=true` when a technical incident was unresolved, even in **end CASE** mode. A city-damage alert could also outrank the MAGI maintenance alert; the generic `対象の管制画面を開く` then sent the operator to city control instead of the actual blocking MAGI maintenance desk. The old CSS selected nonexistent `#commandAlert.critical` while script used `data-level=critical`, making critical alert text/buttons clipped.

## Fix / final semantics
- `警報をクリアして正常待機へ`: full system recovery, still blocked if MAGI maintenance, cooling or security cases are unresolved. The actual clear handler now validates this as well to prevent programmatic bypass. No fictitious technical clearance.
- `終了・復旧` in OPERATIONS with unresolved incident(s): explicit **作戦のみ終了・EVA回収**. Keep MAGI fault, cooling incident, security case, city sector HP, artillery/armor state, electricity/comms state and consumed power/parts as they really were. Terminate the active CASE, clear the enemy and combat phase, return EVA to the hangar, preserve real injury values and all history. No 100% fake restoration when technical work is outstanding.
- Require confirmation with dynamically truthful text and note; read/write atomically with the existing original `callNative('backupState')` before `persist`, rollback on any error. No direct reset on button tap.
- When pending MAGI maintenance outranks city-damage in the recovery task, the `対象の管制画面` button explicitly opens **MAGI > 保守監視**. If cooling blocks, open `work/incidents`; if security blocks, open `work/security`. The click handler uses capture and stops the generic original handler, so there is no conflicting route.
- Highlight critical alert text and action using the real `data-level="critical"`, not the phantom `.critical` class. No image bytes altered.
- Do not add any extra tab, tall panel, or asset replacement. Preserve v3.1.1 as rollback.

## Scope
This is a small correctness and safety patch. It does not yet merge all specialist maintenance puzzles into the main operation sheet, nor redesign the original alert visual beyond fixing clipped critical information. Device screenshots and taps are **not verified** by CI.

## Test plan
1. For battle DEFENSE LOST, city 100% or partially damaged, pending MAGI clock maintenance: old full recovery is blocked, but `終了・復旧` shows `作戦のみ終了・EVA回収`; confirmation ends only CASE and **does not** mark MAGI resolved.
2. `対象の管制画面` routes directly to `magi/maintenance` despite a higher-priority city-damage alert.
3. The original city HP and electricity/comms state persist until independently recovered. EVA damage remains; EVA and combat stage stand down.
4. Confirm native backup occurs before mutation, failed backup cancels, failed persist restores original; all work tickets and event logs survive.
5. If there are **no** outstanding MAGI, cooling or security incidents, normal full recovery still restores all systems and city to 100%.
6. Legacy game, official radio, asset checksum and audio tests stay green.
