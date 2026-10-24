# NERV-COMMAND v3.0 / Phase 1 — Command Kernel Integrator

Status: **phase-one functional implementation; NOT the completed 4-station v3.0 app.**
Base: v2.33 with all source images and legacy gameplay preserved; no raster editing or removal of original history and communications.

## Shipped
1. New domain-oriented `src/browser/v300-command-kernel.js` exposing `window.NERV_COMMAND_V3.dispatch({commandId,caseId,actorId,kind,payload,expectedRevision})` and `read()`. Canonical game values remain the original `S.defense`, `S.evas`, `S.infra`, `S.magi` and `S.world`.
2. Additive, strictly validated `S.commandV3.schema===1`: bounded `cases`, `orders`, `events`, `communications`, `commands`, global revision and event sequence. State is first allocated within a successful transactional command, not on load.
3. Exact five real commands: `analysis.request`, `city.shutter.request`, `city.shutter.review`, `city.shutter.execute`, `city.shutter.release`. Interception is not a new cheating button: analysis routes to `v27Scan`, approved shutter routes to `v27Armor`, and both retain their canonical resource cost. Releasing a shutter is an explicit additional v3 tactical order and logs it into the existing defense history.
4. Approval decision is explicitly a **local rule-based SIMULATION of Misato's response**, never external AI or an actual human. She approves only when real game conditions permit; approval is saved to an order and remains separate from execution. A free-form chat reply NEVER exercises command authority.
5. Write transactions reuse `commandOperation` (existing backup / save / rollback). Commands reject invalid schema, wrong actor, wrong case, stale `expectedRevision`, missing resources, MAGI/security hold, repeated sector application and unknown type. Same `commandId` returns prior committed result with no additional cost. All decisions are attached to one legacy `CASE-N` and persisted.
6. An approved deployed city shutter that is on the active EVA field firing column blocks precision `rifle` / `positron` actions via the existing `tacticalFireErrors` validation. Move EVA or explicitly release the shutter to restore the line. It never changes game rules for unrelated unapproved shutters or old saves.
7. Formal reports are preserved in the v3 case log AND relayed to the existing `worldCommunication` feed with referenced case/order IDs. Hyuga tracks analysis and obstacles; simulated Misato review can approve or deny; the active pilot reports an actual firing obstruction.
8. `src/browser/v300-operations-desk.js` offers a **single folded row** inside the current city-map workstation, without another page. Five ordered command buttons, three sector buttons, and latest three formal reports; full contact conversations open the existing communications workstation. The new command UI is optional (collapsed by default) and no old game buttons are removed.
9. `src/styles/v300-operations.css` only styles this compact panel. No assets or existing protected visuals modified. Scriptable native WebView and WebAudio remain unchanged.

## Known scope boundaries
- Four-workstation consolidation, full pilot acknowledgment choices, radio channel retry, new mission scenario branches, convoy/routing/shutter propagation beyond the active aim lane, and dedicated MAGI character decision simulations are **future implementation phases**, not claimed in this release.
- Command Kernel only handles the approved city-shutter vertical slice so far, not all existing legacy actions. Legacy buttons still work; they do not all pass through this command dispatch in Phase 1.
- Saved v3 metadata is additive to v2.33's older data. The new format should be treated as **forward only**. Use a NEW Scriptable script, keep original v2.33 and its backup safe; do not run v2.33 to overwrite a v3 save.
- Validated results in CI are code/build and mock game-state tests; actual iPhone touch/UI and Scriptable storage tests still require a device.

## Scenario acceptance
1. Start Sachiel in existing game workflow; `S.defense.status === 'active'`.
2. Expand CITY OPS > OPERATIONS LINK. Analyse MAGI wave once (electric reserve -12, scan +34); Hyuga radios the result.
3. Choose same tactical field column, submit shutter request. No facility mutation or resource charge yet.
4. Check simulated Misato approval. No facility mutation until operator explicitly executes.
5. Execute shutter. Energy -12 once, official log+world communication, city armor becomes true, EVA's distant aiming action blocks where line-of-sight intersects; active pilot reports obstruction.
6. Move EVA out of the covered column, or release the shutter in the deck. New aim is then possible.
7. Restart app; command event history, already charged resources and its order remain intact. Replaying `commandId` never spends resources twice.
8. Switch off power / induce insufficient resources / use future unknown schema; all must fail with old source data preserved.

## Requirements for every further implementation phase
- Preserve high-resolution EVA/city/angel atlas and all original library checksums.
- Never invent approvals, diagnostics or battlefield outcomes in free-form conversation.
- No unbounded RAF, timers or invented offline world sync.
- Full Scriptable `.js`, identical `.txt`, small immutable SHA launcher and source-asset ZIP for every release.
