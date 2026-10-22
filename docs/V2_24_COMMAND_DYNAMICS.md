# v2.24 / Command Dynamics (presentation-only)

Branch base: v2.23 verified head e1a08dffb5e384ae849a69c8fcbc1d4fb80841c (2026-10-22 01:27 JST).

- Reuse vendored Anime.js 4.5.0 via NERV_MOTION and shared NERV_FX. No new scheduler, external CDN, timers, or state mutations.
- Show a compact live tactical readout on operational pages, with simulated track/CASE, MAGI decision status, EVA deployment and communication link directly derived from existing S.
- Provide 44px thumb-friendly direct links to existing MAP, MAGI, battle and staff communications. Existing reducers own all command outcomes.
- Add translucent radar sweep overlays on mounted original Canvas city/placement maps and keep existing bitmap draw/pixel data untouched.
- Finite Anime motion on state changes and action acknowledgements; never claim an action succeeded merely because the button was clicked.
- Keep every assets/** file, protected art renderer and existing save format unchanged; avoid new dependency downloads.
- Scriptable deployment must include both an embedded full single-file runtime and a small verified starter pinned to a published immutable runtime revision.
- This code does not assert tested on physical iPhone. Test in Scriptable/WebKit separately before release acceptance.

Validation: run node --check on generated app.js, scripts/build.py --check and scripts/test.py (with browser environment).
