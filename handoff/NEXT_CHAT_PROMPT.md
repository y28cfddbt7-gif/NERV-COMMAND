NERV COMMANDのv2.15から継続してください。
リポジトリ: y28cfddbt7-gif/NERV-COMMAND
ブランチ: feature/v2-15-tokyo3-incidents-angels
基準: v2.14 d779e5837dfcc4477bc565cf2830df00156d6a7b
HEADを確認し、古いmainへ戻さないでください。

AGENTS.md、docs/V2_15_OPERATIONS.md、docs/V2_15_RESEARCH.md、docs/VALIDATION.md、COPY_SCRIPTABLE.md、handoff/QUALITY_GATE.mdを読みます。src/build.jsonがソース順の正本。src/を編集してpython3 scripts/build.pyで生成します。

固定: EVA三機と描画CSS、全人物・兵装・施設・司令部・ジオフロント・都市迎撃武器画像。旧fixturesを書き換えず、新しい使徒アトラスとAnime.jsはv2_15_additions.jsonでも保護。第三新東京市は固定画像を置き換えず、SVG地形と71棟のビルを追加。

11画面92区画。使徒3種・選択武器/担当機/準備ガイドは既存の承認/電力/実ダメージ/保存を使用。サキエルとシャムシェルは通常武器でも勝て、ラミエルは外部給電と陽電子狙撃が必要。匿名対象の旧訓練も維持。使徒の外観と番号はTV版、数値は独自。

保安6系統は映像→回線→巡回→経路描画→MAGI照合→区画保留/記録隔離/同行確認/現場引継ぎ→副司令報告。予算・到着待ち・独立照合・安全な退避経路・一度だけの費用を維持。旧簡易演習と進行中データも互換。

MAGI保守3種は同期偏差の補正、3複製の比較、故障バスの隔離と2系統維持。通常審議を保留し、技術部の承認を経て復旧。既定の事件/連絡は低頻度。idle冷却は減少。設定には通常/低頻度/集中演習がある。自動通信は共有の間隔/ロック・未読上限・入力/警戒/非表示の抑制を維持。旧schedulerのvisibility/pageshowリスナーを残すと短周期へ戻るので注意。

Anime.js4.5.0のUMD/MITをローカル同梱、独自RAFなし。既存NERV_FXへhook登録し最大6補間、非表示/低モーションで完了停止。vendor3フラグメントはapp IIFEより前。Native mock用guardを保ち、実機性能を捏造しない。

python3 scripts/test.pyを全実行。最新件数はdocs/VALIDATION.mdとhandoff/V215_VALIDATION_LOG.txt。実機Scriptable/WebKit、実API、FPS/電池/メモリ等は未検証。資料の取得失敗・無関係検索結果はdocs/V2_15_RESEARCH.mdに記録。

API会話のKeychain、明示ON、HTTPS、同時1件、タイムアウト、送信前記録、再送抑制、検証済み提案だけという境界を維持。AIは内部状態を書き換えない。電話のキーをソース/HTML/保存JSON/ログ/チャットに出さない。

納品はfeature公開→実際のraw本体/SHA照合→python3 scripts/copy_link.py --starter。NERV_COMMAND_v2_15_STARTER.jsだけを案内し、巨大コード/SVGをチャットへ出さない。
