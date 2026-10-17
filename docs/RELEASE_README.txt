NERV COMMAND TERMINAL v2.7 — modular source migration

Scriptable / iPhone:
Create a script in Scriptable and paste the entire contents of
NERV_COMMAND_v2_7_COPY_PASTE.txt (identical to the _SCRIPTABLE.js file).
The export is self-contained, including all existing EVA reference images.
Home-screen widgets: small / medium / large.
Lock-screen widgets: accessoryCircular / accessoryInline / accessoryRectangular.
Widgets use locally saved data, make no network requests, and open the script
when tapped. Weather shown in widgets is explicitly labelled as saved data.

Browser:
Open index.html, or serve this directory with python3 -m http.server 8000.
Use HTTP for reliable localStorage persistence. Weather/maps require Internet
access; location-dependent features require location permission.

Existing v2.7 saves and the pre-v2.7 Scriptable backup path are unchanged.
The command home is now a seven-destination launcher. Existing home training,
readouts and history remain available in its expandable details panel.
Large simulated warnings follow the existing power/comms/EVA/combat state.
Visual effects respect reduced motion and the app's animation setting.
Expanded synthesized sound is opt-in, with a volume control in settings.
The v2.7 gameplay modules, assets and storage keys are unchanged.
See README_v2_7.md for gameplay and simulated-versus-real data caveats.
SHA256SUMS.json contains the hashes of all release files other than itself.

Unofficial, non-commercial fan project. Simulated combat and infrastructure
are fictional, not official emergency alerts. iPhone Scriptable/WebKit and live
weather/map integrations still require independent device verification.
