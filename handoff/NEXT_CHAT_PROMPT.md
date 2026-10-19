NERV COMMANDのv2.16から継続してください。
リポジトリ: y28cfddbt7-gif/NERV-COMMAND
ブランチ: feature/v2-16-battle-city-motion
基準: v2.15 1e9d5effffa6a555dd7c7f26de1da408afde11b3
HEADを確認し、古いmainへ戻さないでください。

AGENTS.md、docs/V2_16_BATTLE.md、docs/V2_16_RESEARCH.md、docs/V2_15_OPERATIONS.md、docs/VALIDATION.md、COPY_SCRIPTABLE.md、handoff/QUALITY_GATE.mdを読みます。src/build.jsonがソース順の正本。src/を編集してpython3 scripts/build.pyで生成します。

固定: EVA三機と描画CSS、全人物・兵装・施設・司令部・ジオフロント・都市迎撃武器画像。旧fixturesを書き換えず、新しい使徒アトラスとAnime.jsはv2_15_additions.jsonでも保護。第三新東京市は固定画像を置き換えず、SVG地形と71棟のビルを追加。

12画面98区画。独立したbattle主要画面にengage/setup/targets/recordsを追加。従来のmission/engagementは互換経路。格納から発進準備・審議・射出・給電・攻撃まで既存の状態遷移を共有し、トランザクション内で保存する。eva.js/magi.jsはこの共有関数抽出だけが歴史的バイト基準からの意図した例外。固定EVA描画と全画像はそのまま。

Three.js r160はオフラインUMD、207部品/6 InstancedMesh、GPUコンテキスト1つ。公式Anime.js instance.jsの数値位置/スケールだけを移植し、dirty行列をcommitChangesで反映。完全版アダプターではなく、色/TSL/BatchedMeshは対象外。コンテキスト喪失/省電力はSVGへ。独自RAFなし。engine.speedはUIだけ0.5/1/1.5、ゲーム時刻に影響しない。replace/none/blendの所有者と最大6補間を維持。

使徒3種・選択武器/担当機/準備ガイドは既存の承認/電力/実ダメージ/保存を使用。サキエルとシャムシェルは通常武器でも勝て、ラミエルは外部給電と陽電子狙撃が必要。匿名対象の旧訓練も維持。使徒の外観と番号はTV版、数値は独自。

保安6系統は映像→回線→巡回→経路描画→MAGI照合→区画保留/記録隔離/同行確認/現場引継ぎ→副司令報告。予算・到着待ち・独立照合・安全な退避経路・一度だけの費用を維持。旧簡易演習と進行中データも互換。

MAGI保守3種は同期偏差の補正、3複製の比較、故障バスの隔離と2系統維持。通常審議を保留し、技術部の承認を経て復旧。既定の事件/連絡は低頻度。idle冷却は減少。設定には通常/低頻度/集中演習がある。自動通信は共有の間隔/ロック・未読上限・入力/警戒/非表示の抑制を維持。旧schedulerのvisibility/pageshowリスナーを残すと短周期へ戻るので注意。

Anime.js4.5.0のUMD/MITをローカル同梱、独自RAFなし。既存NERV_FXへhook登録し最大6補間、非表示/低モーションで完了停止。vendor3フラグメントはapp IIFEより前。Native mock用guardを保ち、実機性能を捏造しない。

python3 scripts/test.pyを全実行。最新件数はdocs/VALIDATION.mdとhandoff/V216_VALIDATION_LOG.txt。実機Scriptable/WebKit、実API、FPS/電池/メモリ等は未検証。資料の取得失敗・無関係検索結果はdocs/V2_15_RESEARCH.mdに記録。

API会話のKeychain、明示ON、HTTPS、同時1件、タイムアウト、送信前記録、再送抑制、検証済み提案だけという境界を維持。AIは内部状態を書き換えない。電話のキーをソース/HTML/保存JSON/ログ/チャットに出さない。

納品はfeature公開→実際のraw本体/SHA照合→python3 scripts/copy_link.py --starter。NERV_COMMAND_v2_16_STARTER.jsだけを案内し、巨大コード/SVGをチャットへ出さない。
