# NERV-COMMAND v2.33 — PERSISTENT NAVIGATION / CITY CONTROL

Based on v2.32, correcting defects observed in an actual iPhone screenshot (10:37): the native Scriptable Close/share row overlapped the top "発進" tab, and the "battle-active" CSS suppressed all navigation home. The urban map was handsome but the city's *real* power, comms, defense, facility, repair and diagnostics actions were in separate subviews.

## Fix A: always get home
- Make the existing lower five-station bottom navigation visible in `battle-active` and `console-magi-active`. Reuse existing `data-nav=home` button and its `go('home')` listener. Do **not** add an inert duplicate close/home control or a new stacked toolbar.
- Reconcile top of Scriptable's built-in Close/share safe area. The iOS-owned native controls remain, but application content has +42px extra top spacing and sticky tab top inset. This prevents the top tab row being hidden beneath the native controls. Bottom padding reserves the restored navigation so the last clickable controls are not obscured.
- Maintain 44px or larger hit targets and one-handed touch accessibility.

## Fix B: real municipal command on primary panorama, not read-only
- Below the existing high-quality original Tokyo-3 map (no image change), mount compact `CITY OPS` with one *selected real facility* (Western armor, battery, Eastern interception, GeoFront). The previously existing map click selects a district and this new command deck follows `S.defense.selected`.
- Show live facility health, armor deployment and turret deployment, plus remaining `defense.energy`, `defense.parts` and `defense.spares`.
- Expose exactly four primary **real** commands using established handlers: `v27Armor` (cost defense power 12; deploy armored shutters), `v27Turret` (spend material 20; install interception weapons), `v27Repair` (spend material 18; restore up to 27 HP), `v27Power` (consume one reserve power allotment; +38 defense energy).
- If city main power is offline, the reserve key becomes **主電源復旧** and runs the existing `powerToggle` handler. If power is up but comms disconnected, it becomes **通信回線復旧** and runs `commsToggle`. Actual switching can invalidate prior MAGI launch approval, consistent with underlying engine; there is no fake override of existing permission rules.
- Include a fifth, *secondary* diagnostic command running `infraDiag` and saving its original log. The four primary actions have condition-aware disabled state and descriptive requirement text. Feedback explicitly distinguishes state changes and diagnostic operations.
- All existing facility, electrical-grid, deployment, dispatch, journal and weapons pages remain reachable through "その他" menu. Do not duplicate giant information panels.

## Implementation
`src/browser/v233-city-commands.js` mounts after the v2.32 map and delegates to existing controller event targets via `click()` while collecting before/after stored state. `src/styles/v233-navigation-city.css` restores navigation, fixes native safe-area placement and styles a two-column real-operation deck.
This release makes **no** adjustments to source image assets, image compression, game resource costs, tactics, initialization code or the WebAudio engine. Avoid any new timer, RAF or network fetch.

## Verification
- Check GitHub Actions completed regression suite, original image/third-party hashes, JS syntax, audio restoration and existing v2.29 gameplay reducer.
- iPhone: tap Home from battle setup/precision without scrolling; no native Close/share hit collision; city map selects four facilities and each command updates the correct saved resources. Cause power/comms to go offline using original systems view and verify quick restore. Verify unavailable commands cannot be executed.
- iPhone actual UI remains an unverified physical-device acceptance requirement.
- Deliver full integrated Scriptable `NERV_COMMAND_v2_33_SCRIPTABLE.js`, matching paste text, SHA-pinned light launcher and ZIP archive with all existing imagery.
