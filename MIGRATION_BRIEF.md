# Codex handoff: NERV COMMAND TERMINAL

## Current state
- The current user-approved staff redesign supersedes the original minigame-preservation brief. Home is buttons-only; MAGI offers sortie/intercept votes; tactics use guided orders; alert clearing performs explicit, backed-up recovery. See `docs/STAFF_GUIDE.md`. Historical counters and saves are retained.
- The structural migration is implemented in `src/` and `scripts/build.py`; see `docs/DEVELOPMENT.md`. At that milestone all four shipped v2.7 artifacts were byte-identical. This did not add a new gameplay version or claim device verification.
- The subsequent UI effects update adds a seven-destination launcher, large simulated alerts and expanded procedural sound. Current artifacts intentionally differ from the historical v2.7 hashes; protected gameplay modules, assets and storage keys remain unchanged. See `docs/UI_EFFECTS.md`.
- Baseline version: **v2.7 TACTICAL DEFENSE NETWORK**, developed iteratively through v2.2–v2.7.
- The user wants a believable **iPhone NERV staff terminal**, not a static image, with dramatic instrumentation and dense, usable controls.
- User approved v2.7's general direction and wants development to continue rather than restart.
- Most recent themes: A.T. field centering, explicit links between Mission/EVA/MAGI, strategic telemetry, 2.5D Tokyo-3 defense, persistence across battles.

## Primary screens
1. Home: operational readiness, alerts, personnel rank/XP, links and status.
2. Weather: Tokyo-3-themed data-dense dashboard; real weather data should be distinguished from simulated warnings and unavailable providers.
3. Infrastructure/City: 2.5D defense map, 4 facilities, hostile detection/scan/approach, armor/turrets/power/repair, sustained damage.
4. EVA: Unit-00/01/02, sortie/recall, sync, power, umbilical, A.T. effect and operational HUD.
5. MAGI: Melchior/Balthasar/Casper voting, strategic adjudication, detection and cyber isolation mini-game.
6. Mission: Yashima-inspired charge/aim/support-shot operations with prerequisites and cross-page state.
7. Tools: tasks/timers and practical utility.
8. Settings: user preferences and data management.

## Key goal for the first Codex milestone
Refactor the single large HTML/Scriptable payload into maintainable modules while maintaining pixel- and behavior-level parity wherever practical. Add a reliable build command and regression tests. Make sure the generated `Scriptable.js` is straightforward to copy/paste on an iPhone, including necessary inlined resources.

## UX and gameplay priorities after migration
- A holistic shared alert-state UX across all screens (NORMAL/ALERT/BATTLE), applied consistently.
- User-driven tactical outcomes with clear resource tradeoffs, rather than a cosmetic mini-game.
- Visible ship/mission action preconditions, direct navigation, change log/history, staging/status lights, animated HUD overlays.
- Responsiveness for 320 / 390 / 430 CSS-pixel widths, especially thumb-sized target areas.
- Fiction simulation is distinct from real data. No automatic fabricated river levels or weather alerts.

## Important caveats
- Browser regression tests were reported for v2.7 in the original handoff, but independent iPhone Scriptable verification remains outstanding.
- Live external weather and map API access is not guaranteed.
- Original generator `finalize_v27.py` was not portable (referenced `/mnt/data/...`) and is not a suitable build pipeline. Implement a clean one.
- Existing art files are bundled reference/drawn assets. Do not replace them by generic AI renderings without permission.
