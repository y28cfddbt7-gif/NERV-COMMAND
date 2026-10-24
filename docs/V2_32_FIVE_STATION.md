# NERV-COMMAND v2.32 — FIVE STATIONS / OPERABLE UI

## Goal
Correct the user-observed problems in five iPhone screenshots: tactical grid looked purposeless; battle precision was duplicated and unwieldy; inexpensive-looking EVA inset obscured original fine EVA art; city map labels overlapped and the map was tiny; low-grade city engineering illustration and too many subpages undermined NERV aesthetics. This release changes real display hierarchy, not game scoring.

## Single primary job per station
1. **BATTLE**: the v2.29 state-backed tactical grid is the dominant element (49dvh, 3×3 real sector buttons). The precision/weapon view is separate via the v2.30 two-mode switch, large original battle illustration/canvas up to 58dvh. Top operational telemetry only UNIT, AP, ENEMY HP, PHASE; move by sector taps, Recon/Feint/Fortify by real 1AP state changes, End Turn in the existing v2.30 controller. Secondary tactical actions behind one optional details; duplicate earlier HUD, technical documentation and mode bars suppressed. Switching into precision explicitly sets the real reducer to attack mode before presenting the target; this was missing in v2.30.
2. **SORTIE**: real existing command/state stages shown as one row: 機体準備, 出撃審議, 射出実行. The first stage shows the user's meaningful v2.29 incident and machine preparation; after real EVA READY/DEPLOYED, the second displays genuine MAGI and authorized placement buttons; third takes the existing deployment canvas, weapon, external power and original irreversible launch reducer. Unresolved incident blocks progressing. No fabricated 10s countdown, simulated MAGI approval or new save format. Old v2.28 optional plans and case detail remain in collapsible disclosures, never erased.
3. **TOKYO-3**: original `assets/tokyo3_*_v218.webp` preserved byte-identically, using its existing damage/shelter state renderer. ONLY the extra large text overlays that the renderer added when drawing a "map" have been suppressed behind `window.NERV_V232_MODE`. The original art pixels stay unchanged. The secondary overprinted v2.27 HUD is suppressed. A large 53dvh panoramic map preserves the 840:360 aspect, can be panned horizontally (no stretching/soft image), and has a full-view toggle. At top one compact four-item live condition row (health, power, comms, threat); city facility controls are available via detail and the 2-tab station switch.
4. **EVA**: remove the low-quality floating `#operationVisual` insert but DO NOT delete or alter the original unit sprite/atlas or the EVA action reducers. Show the canonical illustration as the hero. Status/repair/launch remain operable.
5. **MAGI**: keep the canonical original three-core consensus UI, maintain click/touch/keyboard independent analyses, remove duplicate tiny summary/decision bus. True MAGI approval and intrusion handling unchanged. Finite pulse timing and reduced-motion handling retained.
6. **COMMS**: contact, full messages and real conversation controls dominate; at most one tiny waveform, rather than repeated readout panels.

## Navigation
- One top inline terminal label, one primary navigation strip with *two task views* + "その他" disclosure. No horizontally scrolling 7-page tabs. Legacy routes, utility/work/weather/privacy/records and extra function views stay accessible in the disclosure. Bottom nav unchanged.
- Controls minimum 44px and respect the Scriptable native Close/share overlay. No attempt to remove iOS-owned chrome.
- Existing saves, all resource/launch/battle reducers, power and MAGI constraints, speech/WaveAudio behavior and operation history remain.
- Original protected images and third-party libraries remain untouched. No image re-generation, recompression, sprite low-resolution fallback or new ornamental picture.

## Implementation and tests
- Boot flag `src/browser/v232-boot.js` initializes before decorated station modules.
- Actual presentation reorganizer: `src/browser/v232-five-station.js`; final CSS consolidation: `src/styles/v232-five-station.css`. The original map renderer has one conditional guard around **its own text overlay** in map mode only. Original sprite and atlas files are unchanged.
- v2.30 precision switch makes an actual `consoleBattleCommand('mode',{mode:'attack'})` call so tapping the picture aims at the target, rather than just changing which div is visible.
- Preserve 2.31 as rollback. Run all tests including v2.32 no-new-RAF/no-new-save checks, original media SHA256, v2.29 gameplay regression, iOS audio recovery.
- Generate complete `NERV_COMMAND_v2_32_SCRIPTABLE.js`, identical `.txt`, SHA-pinned minimal startup `NERV_COMMAND_v2_32_STARTER.js`, and full ZIP with code and source images.
- iPhone acceptance still requires real device observation: horizontal map panning, 2-mode battle press events, MAGI independent analysis, safe area and real audio after iOS resume.
