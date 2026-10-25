# NERV-COMMAND v3.2.4 — iPhone screenshot recovery

Base: v3.2.3 at `2b4fc06b053ecca7427661489f35008801b7a81f`.

## Real user-visible defects observed
1. The complete tactical SVG was missing despite a giant blank 3×3 map.
2. The CASE header and PATTERN BLUE text collided on the iPhone display.
3. The previous global TACTICAL ALERT banner persisted above the single-operation CASE.
4. The big CITY COMMAND AUTHORITY panel covered the map as a floating overlay.
5. Retired labels such as **従来の発進方針・点検を表示** still appeared.
6. Overly verbose auxiliary controls cluttered the live operation.

## Fixed at source
- **Map**: the actual `#v322MapOverlay` is now absolutely positioned, inset 0, 100% width/height, z-index above painted 3×3 cell tiles and pointer-transparent. No parallel or decorative-only map. The existing nine real sector buttons still receive the tap. If combat telemetry has not yet yielded a valid EVA position, the city contour/grid are drawn and the honest `UNIT POSITION / SYNC` status replaces an invented position.
- **Status**: grid header is truly constrained to a narrow left title + right alert/AP column on iPhone, with wrapping and small bounded type.
- **Alert**: v2.26's actual global alert is removed from the DOM while `currentPage==='battle'`. The active incident is accessible from the existing CASE alert button with unchanged backup/confirmation/recovery workflow.
- **Command sheet**: move the *real* MAGI/CITY/attack/communications panel under the same battle card, **below** map, radio, four action buttons and outcome. It is inline and collapses by default, not a position:fixed block obstructing the tactical map. Internal controls remain bound to canonical reducers.
- **Function consolidation**: fold remaining v2.25/v2.30 operation furniture into one opt-in `高度な操作・作戦履歴` details group, while retaining operative buttons and historical content. Retire the "old/従来" preparation disclosure label in favor of `発進準備の詳細・点検記録`.
- Protected drawings/assets, persistence, AP, tactical state reducers, MAGI votes, station communications and verified alarm recovery remain unchanged.

## Validation
`python3 scripts/test.py --no-browser`
`node tests/test_v322_tactical_map.js`
`node tests/test_v323_command_ui.js`
`node tests/test_v324_screenshot_regression.js`

New test deliberately boots an active battle **without known unit coordinates** to verify city/map still renders and does not invent EVA or enemy position. No physical iPhone rendering automation is available in this connector, so real-device layout still requires user verification.

## Release
The v3.2.4 workflow builds and verifies a self-contained full Scriptable runtime, a complete copy-paste TXT, ZIP and small SHA-pinned starter, on this isolated feature branch. Previous stable v3.2.3 stays unchanged.
