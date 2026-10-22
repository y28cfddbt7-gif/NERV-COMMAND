# v2.27 — Cinematic workstations + iPhone touch-safe layout

Baseline: v2.26.1 `feature/v2-26-1-fullscreen-audio` at `c7bffe567e3d69d6a85833766554d82ac31c9ddf`. Keep that exact version available for rollback.

## Real iPhone issue
In Scriptable's `web.present(true)` mode, the native host Close/share controls still float over the top of the WebView on iOS. Do NOT attempt to remove Scriptable-owned UI through CSS or private APIs. Instead reserve 76 CSS pixels at the start of `#shell` and offset all in-app sticky operation tabs by the same 76 pixels. This physically displaces important controls, including MAGI tabs, below the host hit-region even after scrolling. Existing home/content structure, device safe-area rules and bottom navigation remain.

## Reference-image visual language
Retain every original art asset and renderer. Build additive HTML/CSS HUD overlays modeled after the red/orange/teal fictional NERV terminal visual grammar. Source illustrations are unchanged:
- MAGI: three-branched telemetry line and signal pulses drawn over the original three-core chart; an amber-green decision rail shows real saved votes and observed measurement count, with a red warning variant for actual infiltration. The small redundant v2.26 summary is suppressed on MAGI so the big canonical three-core display remains dominant, not stacked behind duplicates.
- City: transparent hex tactical lattice, selectable-target *visual* marker and radar sweep over the original bitmap/Canvas city map, with real enemy CASE, power grid, comms and distance. The overlay is pointer-events:none and does not change native map touch events.
- Battle: lock brackets, tactical contact status, real AP, unit and distance over the original combat scene. Does not auto-issue an attack/approval or fabricate target geometries.
- Communications: multi-band operational waveform, local selected recipient and actual link indicator shown in the existing comms station. Uses no microphone capture or fabricated radio/audio data; synthetic bars are clearly stylistic visuals.
- Anime.js 4.5.0: all transitional motion uses the existing bounded `NERV_MOTION`/NERV_FX engine with staggering; background scan/pulse CSS respects reduced-motion and motion OFF. No extra JS RAF, timers or external network.

## Regression
- Do not change assets/**, source raster/SVG renderers, vendor, world/game mutations or historical saved state.
- `python3 scripts/build.py`, `python3 scripts/build.py --check`, `node --check app.js`, `python3 scripts/test.py --no-browser`, and `node tests/test_v2261_audio.js` must pass.
- Run v2.27 assertions for the 76px clearance, pointer-events-none overlays, workstation graph and absence of independent background loops.
- Immutable SHA-pinned Scriptable starter + complete illustrated runtime, identical .txt and ZIP are required.
- Device-side validation: open MAGI, horizontally scroll tabs, tap tab 1 and last tab, scroll content until tabs stick and tap again while Close/share is visible; then navigate city/combat/comms and verify touch events, original imagery and sound after background/return. The Scriptable native Close/share bar cannot be guaranteed hidden. Performance/fps and rendering are unverified on the target iPhone until tested.
