# AGENTS.md — NERV COMMAND Codex development rules

## Current handoff
Read `HANDOFF.md`, `handoff/QUALITY_GATE.md` and the current screenshots in `handoff/previews/` before continuing in a new chat. The user approved the visual implementation at `e98c584753e8f3a2faff26929b9b3ff0826d8a78`; retain that quality. Proposed roadmap items in the handoff are not implemented or automatically approved. `FIRST_CODEX_TASK.md` and older migration reports are historical.

## Mission
Maintain and expand NERV COMMAND TERMINAL, an unofficial Evangelion-inspired tactical iPhone/Scriptable simulator. The starting baseline is **v2.7 TACTICAL DEFENSE NETWORK**. Preserve the existing functioning implementation; do not replace it with mockups, screenshots, a simplified demo, or a fresh rewrite.

## Product and experience
- Primary target: **Scriptable on iPhone**, using a single pasteable `.js` artifact (including widgets where applicable).
- Secondary target: a browser-viewable HTML build for rapid testing.
- Entire UI: NERV-style dense tactical telemetry and bilingual Japanese/English labeling, amber structural lines, cyan/green instrumentation, red alert emphasis, compact mobile-responsive controls; accessible, readable, and thumb-friendly.
- Required pages: home, weather, city/infrastructure, EVA, MAGI, mission, tools, settings.
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
- Long pages use independent mobile subsections. Preserve hash/history navigation and explicit routes to alert controls. Staff duty/handover/check records persist and survive alert recovery.
- MAGIシステム is the user-facing system name. Preserve the three persona vote panel and explain the local simulated decision rules.
- EVA external power is per unit: connected cable plus city power pauses internal consumption; disconnection/power loss resumes it. Doctrine forecasts and actual turn resolution share one calculation. A deployed defender A.T. protects its displayed map sector (legacy default HQ).
- The new transparent redraw sheet is shared by all large/small/map EVA displays. Preserve the archived original art files, but do not layer them over the new figures.
- EVA Unit-00/01/02 have their own visual profiles. A.T. field effect must stay aligned to the displayed unit when animated/resized.
- Keep persistent saves and backwards compatibility. Back up data before changing schema or explicitly clearing alerts. Do not reset progress on load or merely acknowledging an alert.

## Files and source of truth
- `src/build.json`: ordered build manifest. Edit `src/browser/`, `src/styles/`, `src/ui/`, `src/scriptable/` and `assets/`, then run `python3 scripts/build.py`. See `docs/DEVELOPMENT.md` for scope and initialization constraints.
- The user requires a copyable Scriptable code link with every delivery. Prefer a GitHub link to the exact published commit/branch's generated single-file export. Verify that the remote contains the delivered file; never label an old `main` export or a workspace path as the updated download. Explain any publication blocker explicitly. Keep the repository's existing visibility.
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
