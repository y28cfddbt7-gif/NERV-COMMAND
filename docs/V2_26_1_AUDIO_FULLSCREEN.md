# NERV-COMMAND v2.26.1 – Scriptable full-screen and iOS audio recovery

This is a surgical patch on the user-approved v2.26 code: `feature/v2-26-contextual-stations` at `e8e853616f01fade93807e7a4b8163dfcb24c53b`.

## WebView UI
- `src/scriptable/webview.js`: `await web.present(true)` instead of `await web.present(false)`. This is the documented Scriptable full-screen presentation API. It is the supported attempt to hide the host's Close/share bar; HTML/CSS cannot access system-hosted controls.
- Scriptable may still show OS-managed controls according to OS/app build; these cannot be guaranteed absent until observed on the target iPhone.
- iOS status gestures and the host's close behavior remain Scriptable-controlled. No private API.

## Audio
- Adds `src/browser/v2261-audio-recovery.js` after all current interface modules without changing the original sound synthesis implementation, waveforms, parameters, volumes, saved game state or assets.
- Detects background/foreground via `visibilitychange`, `pagehide/pageshow` and window blur/focus.
- Requests `AudioContext.resume()` on foreground if the original context is `suspended` or iOS/WebKit `interrupted`; never attempts to play audio unprompted.
- After a background interruption, next genuine pointer/keyboard gesture releases stale `AudioContext` and creates a new one via existing `prepareSound()`. This also covers some WebKit devices where state incorrectly reports `running` although silent.
- One rebuild per observed background interruption, not on every click. Does not run any new RAF/interval/timer.
- If user turned sound OFF, automatic recovery is disabled. A privacy-safe, read-only debug snapshot is at `NERV_AUDIO_RECOVERY.snapshot()`.
- Browser-native audio recovery is best-effort; iOS may still require a tap after returning due to audio activation policy.

## Delivery / regression
- A complete Scriptable JavaScript binary + identical .txt code and ZIP are created by `scripts/build.py` and pinned via immutable runtime SHA-256.
- Lightweight `NERV_COMMAND_v2_26_1_STARTER.js` is the recommended iPhone copy/paste; first run needs internet.
- Preserve v2.26 under a separate script for rollback.
- CI checks source assets, visual styles, original engine and automated suite plus audio simulation; only an actual iPhone can verify system Chrome and physical sound.
