# NERV-COMMAND: post-v4.0.4 architecture recovery

## Goal and baseline

The problem is accumulated patch layers, not the absence of another feature.
The immutable working baseline is `feature/v4-0-4-map-control-dock` at
`104a4a2a10b07bcd0d869649c66317854dacc5f3`.
Work proceeds on `feature/v4-0-4-chat-dev`. Do not mutate the baseline branch.

The verified manifest contains 104 JavaScript modules (including vendor wrappers),
37 style modules and 19 image assets. The repository also retains old modules and
large generated releases. File exclusion from the manifest is *not* enough evidence
to safely delete a component.

## Rules for every subsequent change

1. Do not add a new `vNNN-override.js` or a new CSS override layer as a shortcut.
   Prefer modifying the current owner, extracting shared pure logic, and removing
   redundant owners **only when** their callers and saved-state behavior are proven.
2. One owner per operation. Game mutations run through the established
   command/save transaction. UI buttons merely delegate; no extra gameplay clock,
   hidden command engine or duplicate save path.
3. Preserve user storage keys, migrations, backup/rollback, current gameplay,
   EVA/MAGI/operations/security/city/staff interactions, existing artwork and
   widget startup. No "simplification" by silently removing functions.
4. Rebuild from `src/build.json` sources using `scripts/build.py`.
   Never hand-edit `app.js`, `styles.css`, `index.html`, or 14MB releases.
5. Run `python3 scripts/audit_architecture.py --check`. It fails on unknown
   build inputs, duplicate entries or an increase beyond the reviewed 104/37
   module budget. Module-count reductions are not proof of functional parity.
6. Run build/check, critical command/kernel/security/MAGI/EVA/save tests, and
   Chromium at 390px. Verify screenshots and taps. iPhone Scriptable/WKWebView
   must be checked on a physical device; browser QA is not a substitute.
7. Keep development CI read-only and its runtime preview **self-contained**.
   The small launcher points to an immutable released runtime and must not
   be repointed to a work-in-progress commit. Only release after full QA and
   immutable SHA-256 pinning.

## Stage 1 increment: unified v300/v301 formal command ownership
- v219 and v229 retain combat and sortie gameplay reducers; v400 delegates
  to their original save-backed commands and to formal domain APIs.
- v300 now owns official command validation, CASE/revision/idempotency checks,
  single commandOperation transaction and rollback, shared event IDs and UI
  notifications across both v300 facility orders and v301 operational radio.
- v301 registers four communication mutations with v300 and retains the
  backwards-compatible `NERV_OPS_COMMS.dispatch` alias, but no longer owns
  another dispatcher, schema validator, revision writer or command log.
- The S.commandV3 schema 1 and transmissions/links format remain unchanged.
  v300 now checks optional transmission/link collections for corruption.
- The legacy combat command entrypoint and native Scriptable starter are
  intentionally unchanged in this unit.

## Recommended migration sequence

### Stage 0: establish evidence (this branch)

- Inventory the production manifest, excluded legacy files and checked-in build
  archives with `scripts/audit_architecture.py` (report in `test-results/`).
- Establish fixed baseline, CI isolation and explicit growth budget.
- Record owned entry points and operational dependencies, rather than inferring
  removability from names. No existing gameplay is changed in this stage.

### Stage 1: command/transaction boundaries

- Trace UI event -> dispatcher -> real domain transition -> save/rollback ->
  status update for EVA, MAGI, combat, city infrastructure, security and comms.
- Identify redundant v2/v3 adapters; replace them one flow at a time with a
  canonical domain action interface, preserving old save format at its boundary.
- Add behavior tests for old and new paths before removing a legacy adapter.

### Stage 2: UI ownership and CSS consolidation

- Define one mounted screen component and one state reader for each workstation.
- Remove hidden mount duplication, historical repaint hooks and duplicated
  button handlers only when browser traces prove equivalent operations.
- Consolidate selector precedence into one stylesheet per active workstation,
  eliminating unnecessary `!important` rules without breaking accessibility or
  map hit targets (390px/320px/430px).

### Stage 3: build and distribution cost

- Separate immutable art assets from repeatedly regenerated code where Scriptable
  caching and offline behavior permit, subject to strict SHA checks.
- Stop checking large redundant releases into active working trees; keep
  archived tag/commits and Actions artifacts as verified delivery sources.
  Deleting tracked files alone cannot reclaim historical Git object bytes.
- Keep one full offline Scriptable release and one verified small starter for each
  released version. Validate actual bytes, immutable URL and hash.

### Stage 4: measurable end state

- Fewer **active** owners and overlapping style rules, not merely renamed files.
- No duplicate action/save paths, invisible interactive overlays or alternate
  screen implementations left on the public route.
- Same or better gameplay, save migration, recovery, UI readability and tap
  success on supported phone widths.
- Reproducible source->build->QA->immutable release; all failures visible in CI.

## What NOT to do

- Do not mass-delete the 19 files excluded from the manifest.
- Do not rewrite the entire 14MB bundle as one large manually generated script.
- Do not remove the protection on save/migration, artwork or existing operators.
- Do not claim the iPhone has passed because Chromium or API mocks passed.

## Commands

```sh
python3 scripts/audit_architecture.py --check
python3 scripts/build.py
python3 scripts/build.py --check
node --check app.js
node tests/test_v404_map_control_dock.js
python3 -m unittest discover -s tests -p qa_v400_browser.py -v
```

The development workflow on `feature/v4-0-4-chat-dev` automatically reruns
these classes of checks and uploads a full self-contained Scriptable preview,
architecture reports and browser captures when changes are pushed.
