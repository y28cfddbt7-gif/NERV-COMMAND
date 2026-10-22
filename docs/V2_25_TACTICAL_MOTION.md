# v2.25 TACTICAL COMMAND MOTION

Base: user-confirmed v2.24 `feature/v2-24-command-dynamics` at `1aa1b43ea46d0e8482519af2e3d98538fa055223`.

## Scope

A new, additive decision panel follows the existing v2.24 command deck on operational pages. The panel reads the real saved simulation state and displays contact/CASE, threat distance, active phase, EVA count/AP, independent MAGI votes and the next authorized workflow. A button routes the operator to existing MAP, MAGI, deployment or engagement controls, where all actual decisions, approvals, resource costs, permissions and persistence still occur. Visual prompts are advisory, not auto-approval and not a fabricated game result.

Anime.js v4.5.0 effects use the existing `NERV_MOTION.animate` API (staggered phase rail, tri-core votes, bar fill, resource update, receipt, target lock and emergency response). Animations are finite, canceled/limited by the shared scheduler; no new RAF, polling interval, third-party CDN, storage schema, network requests or physics. The existing v2.24 radar sweep remains; its data uses real simulated CASE. When reduced motion is enabled, all status remains readable without animation.

Every existing `assets/**` image, EVA/weapon/city render CSS, simulation reducer, vendor library and stored user data must be byte-identical to v2.24. Never drop panels to make room for the new one. Ensure 44px or larger main interactive targets on iPhone.

## Delivery

- `NERV_COMMAND_v2_25_STARTER.js`: 13KB Scriptable paste-ready launcher; verified immutable runtime download on first execution; native widget needs no download.
- `NERV_COMMAND_v2_25_SCRIPTABLE.js` and `dist/NERV_COMMAND_v2_25_COPY_PASTE.txt`: full 1-file, offline illustrated runtime, also paste-ready.
- `dist/NERV_COMMAND_v2_25_RELEASE.zip`: release code, materials and documentation.
- CI must build, check generated files and run existing unit/Node regressions; the protected images, original animation vendor and art styles remain unmodified.
- Do not claim physical iPhone/WebKit FPS or full browser regression tests passed without real execution.

## Manual Scriptable acceptance

Verify home -> city/MAP -> MAGI -> battle setup -> deployment -> combat -> staff communications -> back. Check tab switching, MAGI vote display, EVA count, enemy distance/CASE, emergency cues, touch targets, pauses, backgrounds and original illustrations at full resolution. Confirm no data reset and try motion OFF and reduced-motion. Preserve v2.24 for rollback.
