# NERV-COMMAND v3.1.5 / Actionable alarms, guided security, map-linked city

## User-reported problems
- Screenshot: a persistent non-interactive TACTICAL ALERT strip and large empty alert card occupy top of the page.
- Security missions have genuine investigation mechanics, but no single operator-facing step-by-step next instruction.
- Painted map, facility selection and actionable infrastructure controls are separated across pages, so players cannot see which district responds to a command.

## Implementation
- Keep **one** compact sticky alert strip. Tap the strip to open the existing confirmed alarm-recovery dialog; tap "対処へ" to open the real specialist desk. Hide it on the matched target work view and when the alert resolves; shrink/mark acknowledged on inspection. Hide the duplicate large `#commandAlert` visual while retaining its underlying modal wiring.
- Add one **live** five-stage security guide on existing real security, fieldwork, evidence, control and response workstations. It derives the current real `security.case.stage`, tracked `fieldwork` evidence, and canonical `fieldRoute`/zone names. The next procedure and the button to open its actual station update on every draw. It does not bypass investigations or approve cases automatically.
- Bind four labeled, colored, selectable hotspot buttons to the **existing painted city map**. Each selects the same `S.defense.selected` as the original 2.5D tactical panel. They are schematic sectors, not GPS.
- Immediately below the map place the selected facility health/armor/turret/resource panel, with actual original command button delegates: `v27Repair`, `v27Armor`, `v27Turret`, `v27Power`, plus original power/comms/diagnostic buttons. Existing resource/phase restrictions remain; the state remains saved by the original gameplay handlers.
- Keep historical image files, tactical reducer code, backup/recovery, and simulation physics unchanged. No additional scheduler, animation loop or duplicate game state.

## Testing
- `node tests/test_v315_operator_ui.js`: click-to-open alert, safety modal, real workstation routing, step changes, map selection and resources/HP updates through real existing control IDs.
- Existing v3.1.4 all-warning reset, all v3.0/v3.1 regressions and original art fixture tests remain enabled.
- GitHub Actions builds `NERV_COMMAND_v3_1_5_SCRIPTABLE.js` and the small `NERV_COMMAND_v3_1_5_STARTER.js`, pinned to immutable runtime hash.
- iOS Scriptable screenshot/gesture testing still requires device verification; CI is not a replacement.

## UX trade-offs
The displayed city photograph is not a true georeferenced map; four hotspots indicate simulation sectors. Existing online OpenStreetMap geography remains a separate feature, explicitly not used to imply fictional facilities exist in actual Hakone coordinates.
