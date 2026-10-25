# NERV-COMMAND v4.0.2 / iOS startup failure isolation

## Reported failure
The user ran the v4.0.1 Scriptable launcher on an iPhone and saw a fullscreen NERV / 起動系統異常 showing only `Script error.`. A previous v4.0.0 displayed a black WebView. A passing GitHub Chromium test does **not** prove successful WKWebView operation.

## Defect confirmed from v4.0.1 source
The diagnostic layer opened its own full-screen error immediately upon the **first** JavaScript error event, even if the remaining JavaScript modules were still loading or could ultimately recover. This overlay itself could mask a fully rendered terminal. There were no module-level breadcrumbs, so the generic cross-origin `Script error.` provided no actionable location.

## This revision
- Remove immediate fatal reporting; wait for **actual bundle execution completion** and the successful first paint of the new command station. A transient error while loading is recorded but not treated as failed startup. Show diagnostics after a timeout only if the terminal remains unready.
- Add `__NERV_BOOT_STAGE__` markers before each JS module during build, and `__NERV_BOOT_BUNDLE_COMPLETE__` only after the whole assembled bundle has executed.
- Add `__NERV_V400_RENDERED__` set **after** initial state/Map/radio/controls render, not merely after adding a bare DOM section.
- Fatal diagnostic reports module, source filename/line/column when WebKit provides them, stack when available, progress stage, and boot flags; provides copyable diagnostics.
- Still loads no external CSS/JS before the initial application paint.
- Never resets, migrates, deletes, or overwrites saved state. Existing native FileManager persistence and backups are unchanged.

## Remaining uncertainty
The original trigger of the first `Script error.` event is **not yet established**. A WKWebView engine/memory issue remains possible (the HTML is roughly 14 MB and embeds many artwork/data URI assets), as does a specific runtime exception that Chromium did not reproduce. Do not claim this revision repairs the root cause until actual iPhone diagnosis.

## Acceptance
- Test intentionally injects an initial generic `Script error.`, then completes boot and verifies no overlay appeared.
- Test a genuinely incomplete startup and verify it reports the module breadcrumb and line rather than only `Script error.`.
- Build all standalone Scriptable deliverables and run protected core/playwright browser suites.
