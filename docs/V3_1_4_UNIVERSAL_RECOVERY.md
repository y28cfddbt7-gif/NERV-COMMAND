# NERV-COMMAND v3.1.4 — Universal operator-selected alarm recovery

## User decision

**警報復旧は、あらゆる警報・保守・保安・MAGI状態で選択可能。**
Recovery is an explicit **simulation operator override**: the operator can stop the exercise and restore normal standby, including when approval procedures have not finished. This is intentionally different from pretending a supervisor granted technical clearance.

The previous v3.1.2 implementation left the ordinary `alertClear` control disabled when a real `world.security.case`, `world.magiOps.active`, or cooling incident remained active. Separate wrappers each disabled the same button. v3.1.3 corrected one false city-damage warning, but not this common UI block.

## Behavior

- Open **警報を確認する** on any alert. The main action is always **警報復旧（全系統・手動）**, never gray/disallowed because a technical ticket exists.
- Before execution, the confirmation screen explicitly names pending cases. No state changes merely by opening the modal.
- After user confirmation, atomically **backupState → stage on cloned state → persist**, returning the original state if either backup or persist fails.
- Restore the simulation's facilities, city HP, power/comms, EVA power/position, enemy, mission and MAGI runtime from the existing `recoveredStaffState` function.
- Pending **security** and **MAGI maintenance** cases move into their existing bounded archives with `interruption: "operator-manual-recovery"`. They are *not* marked technically approved. Cooling incidents receive `resolution: "operator-manual-recovery"`, while retaining their event records. The world journal records operator interruption and original documents/communications are retained.
- Also set intrusions and external MAGI exercise attacks to idle, and pause new automatic faults for at least ten simulation ticks.
- Keep an optional **作戦のみ終了・EVA回収を選ぶ** link if an active, won or lost CASE exists. That uses the existing safeguarded v3.1.2 CASE-only flow, keeping pending tickets unchanged. When using its confirmation with outstanding tickets, the new separate full recovery option remains visible.
- Security analysis/evidence gameplay and staff technical approval remain required for *ordinary case resolution*. Only deliberate full operator override ends unapproved exercises.

## Coverage

`node tests/test_v314_alert_workflow.js` reproduces the real legacy disabled-button pattern and verifies full recovery with security, cooling, MAGI maintenance, intrusion and external defense individually and in combination, preserved records, case retreat, backup, and rollback. Existing v3.1.1–v3.1.3 checks are retained, along with immutable art baseline checks. Browser/Scriptable physical device verification is still separate from CI.

## Distribution

The complete rebuilt Scriptable runtime is **NERV_COMMAND_v3_1_4_SCRIPTABLE.js**, and the small copy/paste launcher is **NERV_COMMAND_v3_1_4_STARTER.js**. The starter is pinned to an immutable commit and verified by its runtime SHA-256. Updating requires replacing the previous starter in Scriptable; original persisted save data are retained.
