# NERV-COMMAND v3.2.1: integrated operations consolidation

Baseline: v3.2.0 at `c593cd876f9b12b8e0b53f01c3d226af7820b16b`.

## Actual improvements

- OPERATIONS reads `terminalAlert()` from real incident state, and shows one clickable warning in the existing integrated status header. Tapping it enters the full universal, confirmed recovery workflow. The previous separate sticky warning strip is not displayed in OPERATIONS; it remains active on DUTY and specialist views.
- The redundant v2.31 status rail is **removed from the DOM** while HOME or OPERATIONS is active, rather than being hidden by another CSS layer. Specialist pages keep their detailed status.
- v2.32 no longer creates a second battle task navigation row, while keeping its source setup/deployment, imagery and map controls.
- MAGI/communications sheet renders a compact MELCHIOR / BALTHASAR / CASPER readout from actual saved `S.magi.vote.votes` for the currently selected EVA. Prior results are labeled saved history and not mistaken for current approval.
- Save-state schema, canonical combat/city/MAGI actions, original image assets, radio/authorization sequence, rollback-based recovery and Scriptable bridge are unchanged. This is the removal of duplicate presentation, not destructive rewriting of the game.

## Not done yet

Remaining legacy specialist HTML pages and hidden CSS must still be consolidated after safety and UI testing. MAGI readout displays stored evidence, but does not itself authorize launch or issue new votes. Real iPhone Scriptable/WebKit layout and gestures are not yet confirmed.

## Release checks

`python3 scripts/test.py --no-browser`, existing manual-recovery/gameplay/radio tests, and `node tests/test_v321_operations_consolidation.js`.

CI publishes complete Scriptable JS/TXT and an immutable-sha pinned small STARTER on successful checks.
