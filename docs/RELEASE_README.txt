NERV COMMAND v2.12 / IMMERSIVE PERSONNEL TERMINAL

推奨導入: NERV_COMMAND_v2_12_STARTER.js または START_HERE.txt（約13KB）だけをコピー。
初回はオンラインで検証済み本体を保存。以後はオフライン起動可。6種類のウィジェットも起動版から使用可。

ホーム→メッセージでパイロット3人・司令部5人との個別会話。
戦術指揮→携行兵装 / 武器使用でナイフ・パレット・ポジトロン。
EVA→神経接続 / 部位報告、MAGI→演算監視 / 演算波形、設定→映像品質。
固定画像と旧業務・戦闘を維持。描画停止・低モーション・品質制御に対応。
詳しくは V2_12_IMMERSIVE.md / V2_12_RESEARCH.md / COPY_SCRIPTABLE.md。
iPhoneのScriptable/WebKit実機の性能・音・ウィジェット寸法は未検証。

以下は以前の配布履歴です。

NERV COMMAND v2.11 — STAFF WORLD / SMALL STARTER

Recommended: copy NERV_COMMAND_v2_11_STARTER.js or START_HERE.txt into a new
Scriptable script. This is about 12 KB, not the multi-megabyte illustrated app.
Run once online: it verifies the full runtime using SHA-256 and caches it in
Scriptable Library. Later launches work offline. Existing saved state is kept.
The starter includes all six native widgets without loading the large runtime.
The full SCRIPTABLE.js / COPY_PASTE.txt are optional offline distribution files.

Home opens to duty, headquarters, five staff portraits/conversations and 666.
Stage one implements shared world state, routine cooling inspection, causal
cooling anomalies, scoped response/technical approval, persistent history and
safe bounded catch-up. See V2_11_STAFF_WORLD.md, V2_11_RESEARCH.md and
COPY_SCRIPTABLE.md. Original EVA/pilot graphics remain fixed.

NERV COMMAND TERMINAL v2.10 — EVA operations / NERV headquarters / 666 external protection

Create a script in iPhone Scriptable and paste the entire contents of
NERV_COMMAND_v2_10_COPY_PASTE.txt or NERV_COMMAND_v2_10_SCRIPTABLE.js.
The same self-contained HTML and transparent redrawn EVA sheet are embedded
in the export. The original image files remain archived in assets/.
Six existing widget families remain supported.
The approved v2.9 pilot portraits are included in the original pilot workflow.
See V2_10_COMMAND_OPERATIONS.md and V2_10_RESEARCH.md for new gameplay and sources.
The 07f2242 modules and approved EVA/pilot images remain unchanged.
Personnel support now includes a front/back ID card and fictional internal
messages (12 retained, acknowledged locally). Random messages run only while
visible and can be disabled. Tactical dispatch offers category, command and
final review with live condition checks before the original handler runs.
Silent controls receive a tap cue without doubling their existing sounds.

Read STAFF_GUIDE.md for CURRENT operations. README_v2_7.md is historical.
Home contains only feature buttons and any active simulated warning.
Alert confirmation offers Continue or Clear. Clear backs up the current state,
ends the operation, restores city facilities and returns all EVA units to
powered hangar standby. Tasks, weather, settings and cumulative records remain.
MAGI has two simple requests with three-core votes: sortie or interception.
Tactical orders guide defense, power, sortie, analysis, approval and firing.
Mobile tabs separate each task. Personnel support stores duty, handovers and
inspection records. EVA external supply is per unit. Defense doctrines offer
visible cost/firepower/protection trade-offs and next-turn forecasts. Armor,
power, facility and EVA actions have state-driven mechanical displays.
A separate evolving MAGI intrusion story pauses ordinary voting until
containment or explicit recovery. Map markers track deployed units/hostiles;
the defender A.T. protects its assigned sector. Pausable status marquees
explain results and next actions. Weather opens with current-location data.
Old node-guessing, prediction and timing minigames remain removed.

index.html is the browser build; use HTTP for localStorage persistence.
Weather/maps need external network access; location features need permission.
Sound is opt-in; reduced-motion settings are respected.

SHA256SUMS.json contains release file hashes. iPhone Scriptable/WebKit and
live external services still need independent device verification.
Unofficial fan project: city/EVA/MAGI/combat warnings are fictional simulations,
not real emergency alerts.

The current terminal adds a shared cel-shaded GeoFront/artillery atlas,
a new local startup screen, pilot operations readouts and cross-screen
fictional duty requests. Accept a job, do the required work, then report it
for a one-time duty score. Existing EVA art is fixed. Six native widget
families display cached local status. See TERMINAL_EXPANSION.md and
RESEARCH_TERMINAL_EXPANSION.md for operation and reference limits.
