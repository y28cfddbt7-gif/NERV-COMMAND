NERV COMMANDの現行v2.14から作業を継続してください。

リポジトリ：y28cfddbt7-gif/NERV-COMMAND
ブランチ：feature/v2-14-magi-security-ai
直前の公開版：v2.13 6f24fe687a4cb063542e5bf28bff903aaa46e718
最新コミットはこのブランチのHEADとHANDOFF.md先頭を確認し、古いmainへ戻さないでください。

AGENTS.md、docs/V2_14_SYSTEMS.md、docs/V2_14_RESEARCH.md、docs/VALIDATION.md、COPY_SCRIPTABLE.mdとhandoff/QUALITY_GATE.mdを読みます。src/build.jsonが正本。生成物へ直接編集せずpython3 scripts/build.pyで更新。

永久固定：EVA三機と描画CSS、パイロット3人、従来職員5人の顔、司令部・ジオフロント・都市迎撃武器。歴史的fixturesのハッシュを変更して回帰を隠さない。今回の明示要求で三種の携行兵装を別WebPへ精密化。元SVGは保存。プラグは変更なし。ゲンドウ・冬月・キールの新顔も別素材。

11主要画面・80区画・11連絡先。既存戦闘、共通当直世界、MAGI/666、個別記憶と自発通信、6ウィジェットを維持。v2.14のAPI会話はネイティブKeychain・明示ON・HTTPS・同時1件・12秒タイムアウト・320文字JSON検証。API待ちに保存を止めない。送信前に試行を保存し再起動で課金要求を再送しない。キーをHTML/保存JSON/ログ/ソースへ出さない。通常の私的会話だけに使用し、警戒/戦闘/非常/業務操作依頼/自発通信はオフライン。AIは状態を直接変更せず確認画面の提案だけ。

保安3系統（入退館、偽装整備、監査文書）は独自模擬事案。証拠・正規手続きとの区別・上級承認・期限・一度だけの失敗費用・保存復元を維持。world.securityは未来スキーマなら保全停止。警報クリアで保安案件を消さない。新規のFX4種は共通スケジューラー・非表示停止・低モーション・品質予算を共有。指定サイト自体は403で未取得。

python3 scripts/test.pyで全検証。最新の件数と未検証範囲はdocs/VALIDATION.mdとhandoff/V214_VALIDATION_LOG.txt。実機iPhone、実API、FPS/メモリ/電池・音・位置情報は未検証。Web調査は原作と独自ルールを区別。

納品は対応するfeatureブランチを公開しraw本体とSHAを照合後python3 scripts/copy_link.py --starter。巨大なコードやSVGをチャットへ出さない。小型のNERV_COMMAND_v2_14_STARTER.jsを案内します。
