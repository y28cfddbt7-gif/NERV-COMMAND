# AGENTS.md — NERV COMMAND Codex development rules

## Current handoff
Current release is v2.18 on `feature/v2-18-city-artwork`, extending v2.17 `b36bd6aea53c5fb1b1cb62e06b73307a2bf83e2d` and protected `07f2242`. Read `docs/V2_18_CITY_ART.md`, `docs/V2_17_TACTICAL.md`, `docs/VALIDATION.md` and `COPY_SCRIPTABLE.md`. Preserve all existing images and EVA rendering CSS plus the three new city atlases pinned in v2_18_city_art.json. Inventory remains12 pages/98 sections/11 contacts. Deliver checksum-verified small `NERV_COMMAND_v2_18_STARTER.js` at an actually published immutable commit.

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
- Required pages: home, weather, city/infrastructure, EVA, MAGI, mission, tools, settings, NERV headquarters, staff work, messages. There are 12 pages / 98 addressable sections. Keep all routes and small-screen grouping.
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
