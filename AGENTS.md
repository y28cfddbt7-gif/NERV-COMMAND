# CURRENT WORKTREE: v4.0.4 architecture refactor (2026-10-27)

**The material below is historical and not the active branch target.** Current work is
`feature/v4-0-4-chat-dev`, from immutable v4.0.4 release
`104a4a2a10b07bcd0d869649c66317854dacc5f3`. The original release branch
`feature/v4-0-4-map-control-dock` stays unchanged. Use the present
`src/build.json` for runtime module order, NOT the older v2.23 introduction below.

Development objective: remove structural patch-on-patch complexity without removing
operator gameplay, tactical map, mobile controls, EVA/MAGI/city/security/comms,
saved data, restored backup behavior or original image content.

- `src/browser/operation-recovery.js` is the production owner that installs v312,
  v313 and v314 recovery/alert behaviors in their original sequence. The legacy
  individual source files remain for old tests but are NOT in the build manifest.
  One atomic backup -> transition -> persist / rollback implementation now owns
  both manual all-alert recovery and CASE-only retreat.
- Never introduce another override layer as the default repair method. Modify
  the canonical owner, add behavioral tests, and retire a verified redundant
  path in the same change. The 104 JS / 37 CSS baseline is an upper module
  growth budget; production now loads 102 JS / 37 CSS.
- Run `python3 scripts/audit_architecture.py --check` to report current
  active and excluded modules. Check `docs/ARCHITECTURE_REFACTOR.md`.
- 170 historical generated release files (2,314,777,650 worktree bytes) were
  removed from this development branch in `d4b963691b8e6e68d8c66091875fecbe8871eefb`.
  Historical copies remain at protected immutable commits. This does NOT rewrite
  Git history, reduce the runtime by 2.31GB or authorize deleting user artwork.
- Always build from modular source using `python3 scripts/build.py`, then
  `python3 scripts/build.py --check`, regression tests, and 390px browser test.
  CI: `.github/workflows/v404-chat-dev.yml`. User's Scriptable device still
  requires a separate physical test.
- Do not point the small Scriptable starter to unverified development runtime.
  Test with the full standalone Scriptable output from the CI artifact. New
  release and SHA-pinned starter are a separate controlled publication step.

---

# AGENTS.md — NERV COMMAND Codex development rules

## v2.23 current / Contextual staff communication
Current branch feature/v2-23-contextual-duty-comms extends published v2.22 4ed96482261b69f27ce00c1009367980baefb8dd. Read docs/V2_23_COMMUNICATION.md and V223 research/validation/release records. ALL artwork including city_batteries_v222.webp, weapon alpha and EVA CSS stays fixed. User authorizes consolidating duplicate screens: nine legacy routes resolve to a single canonical public function; old mounted panels/IDs/reducers persist, no lost records. Merged details open one at a time; keep iPhone pages short. General staff dispatch is in work/brief. Six gameplay domains consult assigned characters through existing messages, actual delivery-time state, role limits and context memory. Consultation never performs gameplay, discloses unobserved solutions or bypasses approval. Additive memory.dutyContext and replyKeys remain bounded inside schema1 and existing one-write transactions/focus-safe receive. Automatic candidates reuse existing polling/cooldown/visibility/input/opt-out guards. Optional AI receives the same role-filtered facts with consistent pending-input signatures. No new RAF/timer/CDN. Keep verified immutable small starter; no physical iPhone/API claims.

## v2.22 current / Artwork fitting and Anime motion
Current branch feature/v2-22-city-armament-motion extends published v2.21 3bff8f5148bf90e0c1cb3b3ee038a2b24ee2fe7a. Read docs/V2_22_INTERFACE.md and V222 release/validation records. Preserve ALL earlier image assets/fixtures and EVA CSS. User authorizes replacing the simple battery selection drawing with a separately added city_batteries_v222.webp inspection painting; original SVG remains hidden and unchanged. Map uses the same city bitmaps, labels above footer and two bounded footer lines. Preserve weapon RGB/alpha/crop but fit the rows by their original aspect inside every plate; explicit detail zoom is local and resets to fit on reentry/selection. Interface animation uses vendored Anime stagger/easings through the existing NERV_MOTION/NERV_FX hook, max6 entries/max5 panel targets. Manual paused seek is driven by performance.now, independent of simulation Date and respecting UI speed; cancel finished objects explicitly. No new scheduler/timer/CDN or world/save schema/rule changes. Keep12pages/99sections, bounded scope, all combat/MAGI/journal/recovery interlocks and verified small immutable starter.


## v2.21 current / Angel chronicle
Current branch feature/v2-21-angel-chronicle extends published v2.20 03026f295247af5c04a2971389c531441f2c6dc7. Read docs/V2_21_ANGEL_CHRONICLE.md and V221 validation/release records. User explicitly authorizes Angel-only repair: new angels_v221.webp replaces embedded old sheet; retain old atlas and all historical fixtures. Character/EVA/weapon/facility/city artwork and weapon alpha stay fixed. Preserve corrected 1:2 Angel rendering/crop, TV3/4/5 numbering, new original radio journal and addressable mission/dossier (12 pages/99 sections). Optional chronicle schema1 is written inside existing commandOperation; persist failures roll back and emit no story, future/corrupt journal is preserved without blocking core gameplay. Effects use existing bounded tactical hook; no new RAF/timer/CDN/API or simulation/balance changes. Preserve actual telegraphed enemy impact paths, not tracking evaded EVA. New scenes once/beat/case, 6case/96record cap, no reload replay. Source references vs original exercises are explicit. Keep small starter pinned and verified at real immutable published ref.


## v2.20 current UI
Current branch feature/v2-20-terminal-ui extends published v2.19 a8b92a7beaf408d81b3df641a88095ebbe4007af. Read docs/V2_20_TERMINAL_UI.md and V220 validation/release records. All original character/EVA/Angel/weapon/facility/city images and historical fixtures remain fixed. Weapon transparency uses the ORIGINAL armaments_v214.webp RGB with the separately generated alpha atlas armaments_alpha_v220.webp as a CSS mask at identical sprite coordinates. Do not display generated replacement RGB, recolor weapons or edit protected sources. The lossless WebP is embedded once through a CSS variable. New UI overrides shared presentation only: blue-gray industrial panels, amber actions, cyan-green actual data, red warnings, Japanese system font for operations, serif MAGI/warnings and monospaced readouts. Home stays a directory. Five bottom destinations plus searchable12-function menu, live route context, focus trapping/restoration, inert background and existing canonical URLs/history. Battle and MAGI main have inline menu access. Preserve fixed art renderers, saved world/permissions/AI/transactions and the unified2AP/MAGI rules. No new schedulers/CDNs or world mutations. Keep the ~13KB verified immutable starter; physical iPhone is unverified.


## v2.19 inherited console
Current work is feature/v2-19-unified-console, extending published v2.18 d0204d1d9dc01fc03091a536661929e2838ec122. Read docs/V2_19_CONSOLE.md, docs/VALIDATION.md and V219 release/validation records first. Preserve ALL fixed character/weapon/facility/EVA/Angel/city images and rendering CSS. The user explicitly replaces the multiple combat workflows and separate MAGI abnormality tabs with unified consoles. Legacy DOM/reducers remain for saves and compatibility, not separate public gameplay. Public battle is approval -> MAP deployment/equipment -> 2AP field movement/attack/guard with real manual aim. Enemy telegraphs stay locked through both AP; only one real enemy phase consumes10 seconds. City fire starts HOLD. All normal weapons have an EVA-only win path; positron requires genuine external supply. MAGI has main/log/config; one three-core main screen handles normal decisions and six anomaly families with measurements/routing/calibration/signatures/program/666 allocation and changing attack sources. Do not auto-solve or skip timed technical approval. Keep facility dispatch, doctrine, equipment zoom, messages/API/settings and recovery. operatorConsole schema1 is additive; unknown future/corrupt records stop without overwriting. All mutations use one backed-up commandOperation; no nested transactions; effects only after commit. No new unbounded scheduler/CDN. Updated browser tests must use current public flows; do not restore obsolete UI to satisfy old selectors. Historical hash fixtures stay unchanged. Full details and actual test results in current docs.

## v2.18 inherited baseline (historical)
The inherited release was v2.18 on `feature/v2-18-city-artwork`, extending v2.17 `b36bd6aea53c5fb1b1cb62e06b73307a2bf83e2d` and protected `07f2242`. Read `docs/V2_18_CITY_ART.md`, `docs/V2_17_TACTICAL.md`, `docs/VALIDATION.md` and `COPY_SCRIPTABLE.md`. Preserve all existing images and EVA rendering CSS plus the three new city atlases pinned in v2_18_city_art.json. Inventory remains12 pages/98 sections/11 contacts. Deliver checksum-verified small `NERV_COMMAND_v2_18_STARTER.js` at an actually published immutable commit.

City scenes now use three original1254px raster atlases (normal/armed/sheltered), each containing street/map/battle views, shared and decoded once. Display the appropriate image per district from real armor/turret/HP, plus damage/power overlays. Do not return to rectangular/vector city backgrounds. Fixed character, EVA, weapon, HQ and Geofront assets remain untouched. Three's207 instances are faint transparent control outlines over the same visible painting; ground is hidden, six draw calls, existing matrix/dirty/DPR budget preserved. No WebGL/low quality/context loss uses the SAME painted Canvas backdrop. No new timer/RAF/CDN. Initial image failure can use the legacy Canvas backup; never show SVG streets. New art is original fan illustration, not an official geographic city map. Gameplay/world state/save logic is unchanged.

The battle page retains engage/setup/targets/records and shared preparation, real MAGI sortie vote, launch, saved resources and records. After deployment, new encounters use manual pointer/keyboard field control: adjacent movement, enemy telegraph locked before movement, cover, guard, weak-point aiming and real misses. Each shot obtains an actual current-turn MAGI approval. City covering fire starts HOLD; do not allow automatic city weapons to replace the EVA victory path. Classic cases can explicitly activate manual control without resetting progress. Legacy APIs must not bypass manual aim or change range independently of position. Keep independent Home/alarm-review routes and old mission routes for compatibility.

POWER_LOST units can reconnect with healthy main power/comms and resume DEPLOYED without refilling internal battery. External-powered units can activate A.T. at internal zero. Normal weapons work on internal power; positron still requires external power. Manual mode pauses the attacker's planning clock and charges 10 seconds per enemy turn plus action costs; classic turns remain32 seconds, other units retain real-time drain. Animation speed never changes simulation time. eva.js/magi.js retain the shared-transition historical-byte exception; operation-visuals.js/city-defense.js additionally have intentional power-recovery/tactical-turn exceptions. Preserve historical fixtures and verify behavior, never rewrite their old hashes.

Street and map displays are painted Canvas2D; battle shows the same painting underneath a lazy transparent Three.js control layer. NEVER show SVG streets as fallback. Hidden legacy SVG model/IDs remain for compatibility; visible selection/fixed-sprite markers use Canvas/HTML. Three keeps207 instances/six batches, six draw calls, capped DPR and dirty-only rendering. Bitmap decoding is shared once per atlas; state changes select normal/armed/sheltered pixels per district with actual HP and power overlays. Low quality/context loss/no WebGL retains the SAME bitmap scene. Shared NERV_FX fourth hook owns bounded tactical effects; no independent RAF. Keep max6 Anime tweens and default Anime RAF disabled. Fixed city-weapon illustrations remain untouched.

Persist tactical schema1 under evaCombat with case/unit/position/aim/enemy plan/support/statistics. Stop on unknown future schemas or corrupt coordinates without overwriting them. Back up first, roll back every failed operation, and never carry old-case hit visuals into a new case. Tests cover pointer-driven victories with installed city guns held, internal-only victories, zero-battery external victories, evasion/cover/guard/misses, planning time, storage failures, reload, keyboard access and Canvas/no-WebGL behavior. See validation docs for actual counts and device limits.

v2.15 adds named TV Angels (Sachiel, Shamshel, Ramiel) through the existing combat resolver, a guided weapon/attacker/next-action console, 71 SVG city buildings with armor-linked retraction and real facility damage, three additional MAGI maintenance tasks with actual calibration controls, and six security scenario families with resource-bounded spatial investigation. Preserve camera/trace/patrol records, route verification, safe gate constraints and alternative departmental handoff/quarantine/escort resolutions. Canonical traits inform the art and tactical differences; numeric values and repeat encounters are original simulation.

Default balanced pacing is deliberately calm: security first20/repeat30 min, maintenance first30/repeat45 min, routine communication minimum10 min, idle cooling decreases. Quiet and exercise presets are user choices; exercise preserves faster historical load behavior. Automatic communication uses a shared gap/lock, unread cap, alert/focus/visibility controls. Replacing a scheduler requires replacing its registered visibility/pageshow handlers too. Explicit user-request messages and genuine deferred follow-ups remain available. Preserve additive future-schema stops for pacing, magiOps, angels and security.fieldwork.

Anime.js 4.5.0 is a pinned, unmodified MIT vendor with license bundled in the release. Wrapper fragments precede the app IIFE and skip the historical minimal Node DOM mock. The default Anime RAF is disabled; v215-motion uses NERV_FX.registerHook with at most six bounded tweens, offscreen/reduced-motion completion and no per-screen animation loops. Do not silently fetch a CDN or introduce unbounded timelines. The main animejs.com site returned403; official tagged GitHub code was actually obtained. Some lore/search endpoints failed or returned unrelated results; do not claim those were read or import unrelated images.
API stage 3 is implemented only in native Scriptable: opt-in HTTPS Responses or compatible Chat Completions, key/config in Keychain, bounded asynchronous requests, strict output validation, offline fallback and attempt persistence before sending. No key in WebView/state/logs, no automatic billable resend after restart, no direct AI world mutation. Only normal user-request conversations use AI; watch/battle/emergency, requests and proactive messages stay offline. Preserve the role-filtered detached context and existing human review routes. Browser preview is offline.

Security scenarios are original fictional procedures, not canonical episode recreations: access, forged maintenance, altered audit documents. Preserve evidence-based decisions, formal Fuyutsuki handoff, one-time failure costs, shared alerts and approval holds. Future security schema must stop migration without wiping data. Four user-selected visual effects reuse the single bounded scheduler; the source FX site returned tunnel403, so do not claim its implementation was inspected. Full organizational NPC/permission simulation remains a future phase.
Read `HANDOFF.md`, `handoff/QUALITY_GATE.md` and the current screenshots in `handoff/previews/` before continuing in a new chat. The user approved the visual implementation at `e98c584753e8f3a2faff26929b9b3ff0826d8a78`; retain that quality. Proposed roadmap items in the handoff are not implemented or automatically approved. `FIRST_CODEX_TASK.md` and older migration reports are historical.

## Mission
Maintain and expand NERV COMMAND TERMINAL, an unofficial Evangelion-inspired tactical iPhone/Scriptable simulator. The starting baseline is **v2.7 TACTICAL DEFENSE NETWORK**. Preserve the existing functioning implementation; do not replace it with mockups, screenshots, a simplified demo, or a fresh rewrite.

## Permanent visual requirement
- The user explicitly requires the current EVA drawings to remain fixed in future revisions. Do not regenerate, replace, repaint or restyle the three-unit sheet or its shared EVA rendering. Build new environments/armament in a matching cel-shaded style. Preserve `assets/eva_units_redrawn.png`, `src/styles/eva.css` and the EVA rendering rules in `src/styles/command-visuals.css`; verify their hashes when changing adjacent UI.

- The user permanently fixes staff faces (`assets/command_staff.webp`), headquarters imagery (`assets/headquarters_atlas.webp`), Geofront/armament imagery (`assets/command_world_atlas.png`), and the current city armament SVG. Preserve `tests/fixtures/v2_11_fixed_visuals.json` without changing its hashes. New weapon/technical illustrations must be separate additions. Always retain the small checksum-verified Scriptable starter, bounded local caches and offline native widgets; do not make users paste the illustrated full app on routine updates.
- The user also permanently fixes `assets/pilot_portraits.webp` and its mapping to Shinji, Soryu Asuka and Rei. Never regenerate or substitute those faces.
- Always research Evangelion lore and appearances on the Web for relevant new changes; record sources, and distinguish canon from original simulation rules. Keep TV-era Soryu Asuka and command staff consistent.
- When iPhone screens become long, add independent, addressable subsections with history/reload support.

## Product and experience
- Primary target: **Scriptable on iPhone**, using a single pasteable `.js` artifact (including widgets where applicable).
- Secondary target: a browser-viewable HTML build for rapid testing.
- Entire UI: NERV-style dense tactical telemetry and bilingual Japanese/English labeling, amber structural lines, cyan/green instrumentation, red alert emphasis, compact mobile-responsive controls; accessible, readable, and thumb-friendly.
- Required pages: home, weather, city/infrastructure, EVA, MAGI, mission, tools, settings, NERV headquarters, staff work, messages. There are 12 pages / 99 addressable sections. Keep all routes and small-screen grouping.
- Preserve direct navigation between Mission ⇄ EVA ⇄ MAGI and all existing strategic-game interlocks.
- Weather opens with current-location conditions and local radar; show unavailable/error when location is missing, never substitute Hakone as current location. Preserve the separate startup auto-fetch preference.
- Status marquees are readable, pausable and static in reduced motion. Home remains buttons/alarms only.
- Fictional enemy and defense values must be labelled as simulated; do not present fabricated real weather, earthquakes, or flood alerts as measured facts.
- Do not blindly copy copyrighted logos or artwork from unlicensed sources. Existing bundled images are local reference assets for this private fan project.

## v2.7 gameplay invariants
- The user has explicitly authorized a NERV staff workflow redesign, superseding the old requirement to preserve every v2.7 minigame. Home contains only destination buttons, plus active alarms. Do not reintroduce dashboards or decorative hero sections on home.
- Tokyo-3 retains its defense map, facilities, power/armor/turret/repair management, target detection/scan, turns and resource economy.
- MAGI retains two ordinary three-core requests: sortie or interception. The user has additionally authorized an evolving intrusion story in a separate tab; it blocks ordinary approvals until containment or explicit backed-up recovery. Do not reintroduce the old unexplained node-guessing/timing games. Tactical commands guide defense, power, deployment, target analysis, MAGI approval and firing; show unmet requirements explicitly.
- Alert confirmation offers Continue or Clear. Only explicit Clear/end-operation confirmation restores all city/EVA systems and ends the operation. Back up first, preserve cumulative history, tasks, preferences and weather, cancel pending sequences, and roll back if persistence fails.
- Incoming private replies preserve the active composer draft/focus; cap stored conversations and cancel autonomous timers while hidden. Never treat private dialogue as an official command or combat reward.
- New Canvas motion uses one scheduler, only visible surfaces, quality budgets and reduced-motion/static fallbacks. Existing HQ/666 WebGL shares the budget. Do not fabricate sensor values or claim a target frame rate was measured on an iPhone.
- Long pages use independent mobile subsections. Preserve hash/history navigation and explicit routes to alert controls. Staff duty/handover/check records persist and survive alert recovery.
- MAGIシステム is the user-facing system name. Preserve the three persona vote panel and explain the local simulated decision rules.
- EVA external power is per unit: connected cable plus city power pauses internal consumption; disconnection/power loss resumes it. Doctrine forecasts and actual turn resolution share one calculation. A deployed defender A.T. protects its displayed map sector (legacy default HQ).
- The new transparent redraw sheet is shared by all large/small/map EVA displays. Preserve the archived original art files, but do not layer them over the new figures.
- EVA Unit-00/01/02 have their own visual profiles. A.T. field effect must stay aligned to the displayed unit when animated/resized.
- Keep persistent saves and backwards compatibility. Back up data before changing schema or explicitly clearing alerts. Do not reset progress on load or merely acknowledging an alert.

## Files and source of truth
- `src/build.json`: ordered build manifest. Edit `src/browser/`, `src/styles/`, `src/ui/`, `src/scriptable/` and `assets/`, then run `python3 scripts/build.py`. See `docs/DEVELOPMENT.md` for scope and initialization constraints.
- The user requires a copyable Scriptable code link with every delivery. Prefer a GitHub link to the exact published commit's small STARTER export. Verify the matching full runtime at its configured HTTPS ref and checksum as well. Verify that the remote contains the delivered file; never label an old `main` export or a workspace path as the updated download. Explain any publication blocker explicitly. Keep the repository's existing visibility.
- Root `index.html`, `app.js`, `styles.css` and `NERV_COMMAND_v2_7_SCRIPTABLE.js` are now generated compatibility artifacts. Do not edit them directly. The initial modular migration reproduces all four byte for byte.
- `index.html`: known working browser build for v2.7 (contains embedded styles/scripts and external map dependencies).
- `app.js`, `styles.css`: generated component counterparts from the common modular sources.
- `NERV_COMMAND_v2_7_SCRIPTABLE.js`: verified v2.7 single-file Scriptable delivery artifact. It includes the embedded browser HTML.
- `assets/`: bundled EVA image assets; `tests/`: existing test harnesses; `previews/`: screenshots to compare UI.
- `scripts/verify_baseline.py`: compares shipped source/artifacts for consistency.

## Workflow
1. Before feature work, read `README.md`, `MIGRATION_BRIEF.md`, and `README_v2_7.md`; inspect existing code and run baseline tests.
2. Modular migration and portable build are implemented in `src/` and `scripts/build.py`. Continue from these sources; the old nonportable v2.7 generator is not used.
3. Produce browser and Scriptable artifacts from the same source, ensure state/schema continuity, and add meaningful automated tests. Do not change gameplay rules while restructuring.
4. Make small commits, describe exactly what changed, and include test results. If a browser-only test passes, never claim iPhone Scriptable/WebKit runtime has been verified.
5. After structural migration, add features in iterative branches. Retain an installable single-file export and release ZIP for every version.

## Baseline tests
- `python3 scripts/test.py` builds both targets and runs baseline, build/release, Scriptable API-mock and offline Chromium regressions. Browser prerequisites are in `requirements-dev.txt`; see `docs/DEVELOPMENT.md`.
- Preserve historical artifact/module fixtures as historical evidence. Current tests guard unchanged state/task modules and exercise the explicitly redesigned staff workflow, instead of requiring removed minigames to remain.
- `python3 scripts/verify_baseline.py`
- `node --check app.js`
- `node tests/qa_state_v23.js`
- `node tests/qa_widgets_v23.js`
Some Python browser tests require a configured browser/Playwright environment; report missing prerequisites instead of claiming them passed.

## Do not
- Do not invent integration coverage, pass/fail counts, official lore, or current weather data.
- Do not wipe unrelated gameplay features for cosmetic simplification.
- Do not commit tokens, API credentials, personal location, or live save files.
