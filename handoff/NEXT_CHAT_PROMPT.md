最新版はv2.21、再開ブランチfeature/v2-21-angel-chronicle。AGENTS.md、docs/V2_21_ANGEL_CHRONICLE.md、V221の検証/公開記録を読む。人物/EVA/兵装/施設/街並みと過去fixtureを維持。使徒のみ別素材angels_v221.webpへ修復済み。1:2比率・ラミエル切出し、実状態の人物別通信と保存journal、mission/dossier（12画面99区画）を保持。保存失敗時に発報しない。未来/破損journalは保護し戦闘は継続。既存共有フックの約1秒の演出、低モーション・非表示停止・OFFを維持。2AP/給電/MAGIのルールを変更しない。小型起動版を不変の公開コミットへ固定し検証して納品。以下は履歴。

最新版はv2.20、再開ブランチfeature/v2-20-terminal-ui。AGENTS.md、docs/V2_20_TERMINAL_UI.md、現行検証/公開記録を読む。武器の元RGB・その他全固定画像は変更しない。別アルファマスクの透過表示、共通検索メニュー/現在位置/5項目ナビ、2AP戦闘/MAGI三基、既存保存を維持。旧UIや古いブランチへ戻さない。

# v2.19からの再開

現在の実装はfeature/v2-19-unified-console。v2.18やmainへ戻さない。docs/V2_19_CONSOLE.md、docs/VALIDATION.md、handoff/V219_RELEASE.jsonを読む。EVA・人物・兵装・施設・街並み画像は全て固定。戦闘は発進承認→MAP配置・装備→2APの移動/攻撃/守備と実照準。MAGIはmain/log/configの三タブ、三基選択と測定・配線・校正・署名・命令列・666の演算配分を同じ画面で処理する。旧URLは転送、旧DOM/リデューサは保存互換用。旧の「次へ」ゲームや増殖タブを公開UIへ戻さない。operatorConsole.schema1の未知形式を上書きしない。新規の描画ループ・CDNは不要。全確認はpython3 scripts/test.py --browser-workers 4。ビルドとブラウザ検証を同時実行しない。小型v2.19 STARTERを実際に公開された不変コミットのリンクで納品する。

以下は継承された旧版の履歴です。

v2.18 / feature/v2-18-city-artworkから継続。まずAGENTS.md、docs/V2_18_CITY_ART.md、docs/VALIDATION.md、COPY_SCRIPTABLE.mdと現行画面見本を読む。v2.17の戦術/給電/固定画像を保持し、街並みは3景×3状態の精密な画像へ更新済み。通常/砲塔展開/装甲収容のWebP3枚（計約1.5MB、1254px）を一度デコードし各Canvasから共有。新規画像もv2_18_city_art.jsonで保護。WebGLでも同じ絵を表示し、207インスタンスは薄い管制線、地面非表示/6ドローコール。省電力/非対応でも同じ画像。新しいループ/CDN/状態変更はない。更新の納品は小型NERV_COMMAND_v2_18_STARTER.jsを公開済みコミットに固定し、raw本体と起動版を実バイト/SHAで照合。旧コードへ戻さない。以下のv2.17は引き継ぐゲーム仕様。

NERV COMMAND v2.17から継続してください。

ブランチ: feature/v2-17-tactical-engagement。v2.16 c639f43bd82795c16d17ccf0090af72f9ca025fbと保護された07f2242を継承。

まずAGENTS.md、HANDOFF.md、docs/V2_17_TACTICAL.md、docs/V2_17_RESEARCH.md、docs/VALIDATION.md、COPY_SCRIPTABLE.md、handoff/QUALITY_GATE.mdと現行画面見本を読む。

固定画像/EVA描画CSS/歴史的fixtureを変更しない。12主要画面・98区画・11連絡先を維持。街並みはCanvas/WebGLで、SVGを表示しない。既存の非表示SVGモデル・IDは互換性のため残っている。固定の都市兵装SVGは保護対象。

新規戦闘は専用画面で、隣接ドラッグ移動・敵予告射界・遮蔽/防御・手動照準・実際の命中と外れ。都市援護は初期HOLD。旧ケースは明示的に戦術操作へ移行し、進行をリセットしない。発進準備・出撃審議・射出・各武器条件は共通の本物の遷移。射撃時は実際の現ターンMAGI合議。旧APIで手動照準を迂回したり距離と位置を別々に変更させない。

POWER_LOSTも正常電源/通信で再接続でき、内部電源を無料補充しない。外部給電なら内部0秒でA.T./武器を使用可能。通常武器は内部電源でも勝利可能、ポジトロンは外部給電・二段階充填・電力40が必要。手動戦闘中だけ担当機の思考時計を停止し、敵ターン10秒＋行動コスト。勝敗後/ほかの機体/従来モードの実時間時計と32秒ターンは維持。既存部位損傷から機体健全性を引き継ぐ。

三機・人物・兵装・施設の素材は同一。市街はCanvas2D地図と眺望、Three r160背景は207インスタンス/6バッチ/7ドローコール。低品質/失敗/コンテキスト喪失時はCanvas。斬撃/弾道/ビーム/命中/反撃は保存成功後のCanvas描画。静止設定でも最後の跡と結果を残す。NERV_FX第4フックを共用し、独立RAFを増やさない。画面外/非表示で停止。新しいケースに旧命中演出を持ち込まない。

保存はevaCombat.tactical schema1。将来schema/壊れた座標は上書きせず停止。既存のバックアップ・保存失敗ロールバック・回収整備・警報確認を維持。従来の会話/API/MAGI/職員業務/保安/頻度/ウィジェットを壊さない。

修正はsrc/、生成はpython3 scripts/build.py。python3 scripts/test.pyを使用し、ブラウザ実行中に生成物を変更しない。故意の旧ソースバイト例外はeva.js/magi.js（共有遷移）とoperation-visuals.js/city-defense.js（電源復帰・手動ターン）。旧fixtureのハッシュは書き換えず、振舞いと固定画像を検証。

納品はfeature公開→実際のraw本体/SHA照合→python3 scripts/copy_link.py --starter。NERV_COMMAND_v2_17_STARTER.jsだけを案内し、巨大コード/SVGをチャットへ出さない。端末の保存やバックアップをキャッシュ整理で削除しない。

iPhone実機Scriptable/WebKit/FPS/電池/実タッチと実APIは未検証。ブラウザ描画カウンターやnativeモックを実機検証と呼ばない。環境は各タスクで分離済みなので、明示依頼がなければworktreeを作らず既存チェックアウトを使う。
