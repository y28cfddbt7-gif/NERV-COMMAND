# v2.26 / Contextual Workstations

Base is user-tested v2.25 head `569e1c005e6868520ae642b9b30eb65bf35ba99a`.
Requested change: no shared giant Tactical Command panel on duty, MAGI or communications.

## Placement
- `v225Ops` (TACTICAL COMMAND) is mounted only on active battle pages; never on work, MAGI, EVA or city screens.
- `v224DataLink` stays accessible in battle under a collapsed native `<details>` panel. Original four deep links and data remain.
- City/map: compact tactical contact and hex alert status based on the real enemy CASE, city power, communication and defense state. The existing city artwork/canvas and overlays remain intact.
- MAGI/main: compact tri-core decision panel, actual yes/no votes and observed core count. No fictitious percentage completion or auto-approval.
- Messages and work/communications: selected recipient and incoming transcript preview with a short finite type-in animation on a new received message; no microphone/media capture or synthetic audio claim.
- EVA monitoring and controls: three unit state signals and city power condition.
- Global small status strip: only visible for actual non-nominal `terminalAlert()` events, with animated attention on incident transitions.
- Everything is advisory display; simulated decisions and all save, role/permission and resource rules remain unchanged.

## Motion budget
Use vendored Anime.js v4.5.0 through existing bounded `NERV_MOTION` `animate/tween` and shared NERV_FX only. CSS wave uses tiny compositor transforms only while the relevant message panel is mounted; respects motion preferences. No new RAF, JS timer, external CDN or network request.

## Protection and handoff
Keep every `assets/**`, existing image CSS, vendor binaries, world reducers and existing state filenames byte-identical. Build `NERV_COMMAND_v2_26_SCRIPTABLE.js` (all-in-one), `dist/NERV_COMMAND_v2_26_COPY_PASTE.txt` and `NERV_COMMAND_v2_26_STARTER.js` (small copy-ready launcher with SHA-256 verified download from immutable commit). Include `dist/NERV_COMMAND_v2_26_RELEASE.zip`. Run regressions, artifact check, image compare and JS syntax tests. The device's WebKit compatibility, screenshot review and measured fps must be checked on the user's iPhone, not assumed from CI.
