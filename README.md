# NERV COMMAND — Codex migration repository

**Current development build: v2.8 PERSONNEL & COMMAND.** See [README_v2_8.md](README_v2_8.md) for personnel ID cards, internal dispatch, hierarchical commands, sound settings, installation, and validation. EVA visuals and existing strategic rules are preserved. Run `python3 scripts/build.py`, `python3 scripts/test.py`, and `python3 scripts/build.py --release` from this directory. Edit shared sources under `src/`; root browser files and the v2.8 Scriptable file are generated. The original v2.7 Scriptable artifact is retained.

The original handoff documentation follows.

This is a **source-code handoff**, not a new feature version. It carries the already-built v2.7 system plus developer instructions so Codex can begin work immediately.

## Suggested process
1. Extract this ZIP locally.
2. Create a **private** GitHub repository named `NERV-COMMAND`.
3. Upload/commit the **extracted files and directories**, not just the ZIP file. Keep `AGENTS.md` at the repository root.
4. Open https://chatgpt.com/codex, connect GitHub, create/publish a cloud environment linked to `NERV-COMMAND`.
5. Paste the instruction in `FIRST_CODEX_TASK.md` into the initial task.
6. Review changes and pass tests before using the generated Scriptable export on the iPhone.

Start with `MIGRATION_BRIEF.md` for overall project goals, `AGENTS.md` for development rules, and `README_v2_7.md` for application usage and operational caveats.

## What is included
- `index.html` / `app.js` / `styles.css` - browser build and its components.
- `NERV_COMMAND_v2_7_SCRIPTABLE.js` - existing single-file Scriptable v2.7 release.
- `assets/` - local EVA visuals.
- `tests/`, `QA_REPORT_v2_7.json` - existing regression tools/report.
- `scripts/verify_baseline.py` - repeatable consistency check.
- `AGENTS.md`, `MIGRATION_BRIEF.md`, `FIRST_CODEX_TASK.md` - Codex handoff.
- `previews/` - visual comparison references.

## Quick local checks
```
python3 scripts/verify_baseline.py
node --check app.js
node tests/qa_state_v23.js
node tests/qa_widgets_v23.js
```

This is an unofficial, non-commercial fan project. It is not a NERV official product or a real emergency alert terminal. Never present simulated warnings as official alerts.
