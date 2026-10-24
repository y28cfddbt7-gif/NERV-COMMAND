# NERV-COMMAND v3.1.3 — Defeated CASE versus Actual City Damage

## Screenshot regression (2026-10-24)
The user observed a red **都市防衛網 損傷** banner with **都市健全性 100%**, power **正常**, communications **接続**, and no current enemy.

The source traced this discrepancy to `terminalAlert()` in `src/browser/terminal-effects.js`:
`S.defense.status==='defeat'||S.defense.city.some(c=>c.hp<=0)` emitted the same city-facility-failure message for a defeated CASE even if all four city facilities were healthy. The city summary derived enemy visibility only from `active`, so a defeated CASE also appeared as **敵影 なし**. The older banner opened a general alert review rather than explicitly initiating confirmed CASE termination.

## v3.1.3 corrections
- Use a **late, additive** `src/browser/v313-alert-consistency.js` that wraps `terminalAlert()` after all old alert wrappers, without changing historic gameplay or source artwork.
- Only a sector with HP <= 0 is described as a **都市施設 機能停止**. Include the actual affected sector names and integrity percentage.
- A defeated CASE without a facility at zero is reported as **迎撃作戦 敗北 / 終了待ち**. It is not misrepresented as physical city damage.
- Show **作戦敗北** in city enemy/mission summary instead of a misleading generic **なし**.
- Replace the main red-banner action for that specific defeated CASE with **作戦終了・復旧の確認**. This opens `openAlertReview('end')`, invoking the already safeguarded v3.1.2 recovery controller; it never directly mutates saved state.
- After the operator successfully completes recovery, the normal `draw()` chain recomputes the banner from current state and clears obsolete defeat alerts. Unresolved MAGI, cooling, security and city facility issues keep their original authoritative state.
- Preserve precedence of existing power loss, communications loss, EVA power loss, and MAGI intrusion alerts. No ad-hoc auto-restore.
- Preserve reference art, original tests, original reset handlers, original simulation schema, saved history, audio, and no new timers/RAF.

## Regression
`node tests/test_v313_alert.js` covers healthy-city defeat, actual zero-HP sector, power-fault priority, explicit modal flow, no implicit saved-state mutation, victory and fully restored idle state. CI additionally executes all inherited v3.1.2 source, save, and Scriptable safety tests.

## Device limitations
Automated source / browser tests do not prove the iPhone Scriptable UI itself. Existing Scriptable saved data are **not** deleted or silently migrated. The release starter must be replaced on device to load the new immutable runtime.
