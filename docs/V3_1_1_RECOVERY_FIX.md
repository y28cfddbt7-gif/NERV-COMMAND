# NERV-COMMAND v3.1.1 — City Integrity 100% / Operator Recovery Fix

## Verified diagnosis
Two *different* recovery concepts had been incorrectly conflated in the v3.1 UI:

1. The HUD label **都市健全性** is the mean HP of the four defense sectors (`v27CityIntegrity()`). At 100%, selected facility HP=100 (if all values are clamped to 100). **応急修復** is naturally disabled: it costs 18 spare parts and restores up to +27 HP only if the selected sector has lost HP.
2. **作戦終了・正常待機へ復旧** is a distinct, operator-authorized event. `openAlertReview('end')` opens the confirmation dialog, and `clearTerminalAlert` backs up the full state using the Scriptable bridge `backupState`, resets the in-fiction world through `recoveredStaffState`, persists atomically via `persist`, and rolls the in-memory state back if save fails. This is **not** gated on municipal HP; a city with 100% HP may still have a defeated or active CASE, deployed/powerless EVAs, disconnected radio or nonzero battle status.

### Regression
v3.1 hid the original `.battle-top` row (with `battleAlertReview`) as part of the compact battlefield layout. That removed the visible battle recovery affordance while leaving the underlying transaction and modal intact. The user could see 100% integrity and assume the unavailable *facility repair* button was the only recovery path.

## v3.1.1 fix
- Add **終了・復旧** alongside HOME on the same operation status rail. When idle, label changes to 系統復旧.
- Show the real city-wide average and the selected sector's actual HP in the inline city sheet; at 100%, explicitly explain that facility repair is not needed and whole-CASЕ recovery is the **top operation button**.
- The button **only calls** `openAlertReview('end')` and does not directly mutate state or attempt to bypass backups. The existing modal remains the sole authority that authorizes ending/reset.
- Preserve the original EVA paintings, city atlas, Anime.js, Audio, command kernel, business rules and save bridge. No new timers or RAF.
- Min 44pt touch target for Recovery and HOME in iPhone header; restrict telemetry flex text to keep buttons reachable.
- Regression tests verify unchanged source until a confirmed recovery, 100%-HP recovery for active/defeat/victory/idle cases, all EVA to HANGAR with charge restored, power/comms restored, command-case history retained, and actual modal wording.

## How to use
1. On NERV-COMMAND v3.1.1, enter 作戦管制.
2. If the municipal average HP is 100%, facility 応急修復 remains disabled by design.
3. Tap **終了・復旧** beside HOME. A clear confirmation of complete CASE termination appears.
4. Confirm only when you intend to **end current operation and recover the whole simulation**. This resets the current enemy/turn/MAGI votes, city damage, combat resource availability and retrieves EVAs. Prior records and tasks are retained according to the existing reset logic. Before mutation the Scriptable bridge saves a backup.
5. If you only need to repair one damaged sector without ending a CASE, choose that sector then 設備の詳細操作 > 応急修復 instead (requires HP<100 and at least 18 spare parts).

## Scope
This is a focused **UI accessibility and recovery workflow** fix, not a refactor of the battle system or data migration. Full device touch placement has not been independently verified; source and CI verifications alone must not be described as physical-device pass.
