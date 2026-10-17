# First task to paste into Codex

This GitHub repository contains my existing NERV COMMAND TERMINAL v2.7 iPhone Scriptable app and browser build. Do not start over. Read `AGENTS.md`, `MIGRATION_BRIEF.md`, and `README_v2_7.md`, then:

1. Audit the code structure, generated artifacts, assets, persistent state and tests. Identify discrepancies, hard-coded temporary paths and fragile coupling.
2. Establish a reproducible build system for a browser build and a single-file **Scriptable iPhone** export from shared modular sources. Keep output behavior/UI as close to v2.7 as possible; do not alter gameplay rules as part of the migration.
3. Preserve eight screens, EVA Unit-00/01/02 visuals and power/A.T. logic, mission-to-EVA-to-MAGI navigation, MAGI tactical review, Tokyo-3 defense map, turn-based combat, facilities/repair/resources, live-vs-simulated data labels, and saved-state compatibility.
4. Run the baseline tests and add automated regression coverage. In particular check A.T.-field centering, sortie/mission prerequisites, direct navigation and loading old saved data. Include 320/390/430px screen checks where browser automation is available.
5. Generate the final Scriptable .js, browser HTML, and a versioned release ZIP, with one-command build and test instructions.
6. Summarize file changes, commands run, tests passed/failed, and what still requires iPhone WebKit/Scriptable verification. Make small reviewable commits; do not claim unexecuted tests passed.

For this **first task**, focus on infrastructure and equivalence, not on new v2.8 gameplay or a visual redesign. Do not delete or replace existing UI art.
