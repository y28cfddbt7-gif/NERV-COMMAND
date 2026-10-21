# NERV COMMAND TERMINAL v2.23

**v2.23 / `feature/v2-23-contextual-duty-comms`**。固定画像は全て維持。重複タブ9件を統合し、点検・保安・MAGI・戦闘・都市・EVAを担当者への状況相談と接続。履歴・権限を守る人物別の返答と、元の作業への復帰を追加。[操作と変更](docs/V2_23_COMMUNICATION.md) / [検証](docs/VALIDATION.md)。導入は約13KB `NERV_COMMAND_v2_23_STARTER.js`。以下は履歴。

# NERV COMMAND TERMINAL v2.22

**v2.22 / `feature/v2-22-city-armament-motion`**。固定画像を保持し、兵装ビルの精細な参考画を追加。防衛盤のラベル/状態表示の切れとEVA兵装の大きすぎる表示を修正し、Anime.jsの順次展開・選択・画像切替を共有描画へ統合。[操作・変更](docs/V2_22_INTERFACE.md) / [検証](docs/VALIDATION.md)。導入は約13KB `NERV_COMMAND_v2_22_STARTER.js`。以下は履歴。

**v2.21 / `feature/v2-21-angel-chronicle`**。固定の人物・EVA・兵装・施設・街並みを維持し、使徒三種の画像と切出し比率を修正。実状態に連動する管制通信・専用演出・エピソード資料と保存済み通信を読める作戦資料室を追加。[変更と使い方](docs/V2_21_ANGEL_CHRONICLE.md) / [検証](docs/VALIDATION.md)。導入は約13KB `NERV_COMMAND_v2_21_STARTER.js`。[導入手順](COPY_SCRIPTABLE.md)。以下は過去版の履歴です。

**v2.20 / `feature/v2-20-terminal-ui`**。固定画像・街並み・2AP戦闘・MAGIを継承。武器は元画像のRGBと別アルファマスクで背景透過。共通UI・機能検索・現在位置・5項目ナビ・読みやすい操作書体へ再設計。[変更と使い方](docs/V2_20_TERMINAL_UI.md) / [検証](docs/VALIDATION.md)。導入は約13KB `NERV_COMMAND_v2_20_STARTER.js`。[導入手順](COPY_SCRIPTABLE.md)。以下は過去版の履歴です。


**v2.19 / `feature/v2-19-unified-console`**。固定の人物・兵装・施設・街並み画像を維持。戦闘を発進承認→MAP配置・兵装→2APの移動/戦闘/守備→実照準へ統合。MAGIは三基管制・処理履歴・設定の3タブへ整理し、測定・配線・補正・署名・666演算配分を実状態と接続。[操作・設計・調査](docs/V2_19_CONSOLE.md) / [検証](docs/VALIDATION.md)。導入は小型 `NERV_COMMAND_v2_19_STARTER.js`。[導入手順](COPY_SCRIPTABLE.md)。以下は過去版の履歴です。


**最新版はv2.18 / `feature/v2-18-city-artwork`です。** 固定画像とv2.17の手動戦術・給電を維持し、市街眺望・俯瞰地図・戦闘背景を精密な新規背景画へ更新。通常/砲塔展開/装甲収容を区画状態に応じて切り替えます。3景×3状態を約1.5MBの共有WebPにまとめ、SVG表示は使用しません。[変更・操作](docs/V2_18_CITY_ART.md) / [検証](docs/VALIDATION.md)。導入は小型 [NERV_COMMAND_v2_18_STARTER.js](NERV_COMMAND_v2_18_STARTER.js)。以下は旧版の履歴です。

**旧v2.17 / `feature/v2-17-tactical-engagement`です。** 固定画像を維持し、街並みをCanvasへ変更（SVG表示なし）。EVAをドラッグして移動し、敵の予告射界・遮蔽・防御を判断して手動照準で攻撃する戦術盤を追加。電源喪失からの再給電と、外部給電時の内部電源0秒でのA.T.操作を修正しました。通常武器の内部電源による勝利、外部給電による陽電子狙撃が可能。都市援護は初期状態で待機です。[操作・設計](docs/V2_17_TACTICAL.md) / [Web参照と制約](docs/V2_17_RESEARCH.md) / [検証](docs/VALIDATION.md)。導入は小型 [NERV_COMMAND_v2_17_STARTER.js](NERV_COMMAND_v2_17_STARTER.js) を使用。[導入手順](COPY_SCRIPTABLE.md)。以下は旧版の履歴です。

**旧v2.16 / `feature/v2-16-battle-city-motion`です。** v2.15 `1e9d5ef`から継続。固定画像を維持し、独立したEVA戦闘画面で格納から準備・審議・射出・給電・攻撃・結果まで案内します。添付参考に沿った兵装ビルと住宅街を追加し、Three.jsの207部品・6インスタンスバッチ、Anime.jsのEasings / engine.speed / compositionを既存の共通描画予算へ統合。12主要画面・98区画。[操作](docs/V2_16_BATTLE.md) / [公式ソースと取得制約](docs/V2_16_RESEARCH.md) / [検証](docs/VALIDATION.md)。導入は小型 `NERV_COMMAND_v2_16_STARTER.js`。[導入手順](COPY_SCRIPTABLE.md)。以下は旧版の履歴です。

**旧v2.15 / `feature/v2-15-tokyo3-incidents-angels`です。** v2.14 `d779e58`を継承し、固定の人物・兵装・施設画像を維持。第三新東京市を地形と高層市街地の2.5D地図へ拡張し、使徒3種の迎撃・武器選択ガイド、MAGI障害3種、保安の現場捜査6系統と複数の解決方法を追加しました。発生頻度を見直し、Anime.js 4.5.0をオフライン同梱。11画面・92区画。[操作・設計](docs/V2_15_OPERATIONS.md) / [資料と制約](docs/V2_15_RESEARCH.md) / [検証](docs/VALIDATION.md)。導入は小型の `NERV_COMMAND_v2_15_STARTER.js`。[導入手順](COPY_SCRIPTABLE.md)。以下の旧版説明は履歴です。

**最新版はv2.14 / `feature/v2-14-magi-security-ai`です。** v2.13 `6f24fe6`を継承。ScriptableのKeychainを使う任意のAPI会話、11人の通信、新規のゲンドウ・冬月・キールの顔、本部保安3系統、精密兵装図とMAGI図、Spatial Grid / Conic Portal / Wave Field / Layered Parallaxを追加。固定画像は保持し、今回指定された携行兵装三種だけを別素材で更新。11画面・80区画。[操作・設計](docs/V2_14_SYSTEMS.md) / [Web調査](docs/V2_14_RESEARCH.md) / [検証](docs/VALIDATION.md)。導入は小型の `NERV_COMMAND_v2_14_STARTER.js`。[導入手順](COPY_SCRIPTABLE.md)。以下の旧版説明は履歴です。

**最新版はv2.13 / `feature/v2-13-contextual-comms`です。** v2.12 `b24dad3`を継承し、10人の人格・職務・知識範囲、状況連動の返答、相手ごとの会話記憶と自発通信を追加しました。通常・警戒・戦闘・非常を区別し、業務操作は担当画面で確認します。固定画像は維持し、今回指定された3点の装備図だけを更新。11画面・68区画。外部AIは拡張境界までで、API設定・送信は第三段階です。[操作と段階](docs/V2_13_COMMUNICATION.md) / [Web調査](docs/V2_13_RESEARCH.md)。導入は約13 KBの `NERV_COMMAND_v2_13_STARTER.js`。[導入手順](COPY_SCRIPTABLE.md)。以下の旧版記述は履歴です。

**最新版はv2.12 / `feature/v2-12-immersive-terminal`です。** v2.11 `c7a94db`から継続し、EVA・全人物の顔・司令部・ジオフロント・既存迎撃武器の描画を固定。携行兵装図とポジトロン射撃、保存後の命中演出、8人の個別メッセージ、部位報告、三基のMAGI図、状態連動の共通描画・発進演出を追加しました。11画面・66区画。[操作と設計](docs/V2_12_IMMERSIVE.md) / [Web調査](docs/V2_12_RESEARCH.md)。導入は約13KBの `NERV_COMMAND_v2_12_STARTER.js` を推奨します。[導入手順](COPY_SCRIPTABLE.md)。以下の旧版記述は履歴です。

**最新版はv2.11 / `feature/v2-11-staff-world`です。** v2.10 `92a7767`から継続し、固定EVA三機・パイロット顔・既存機能を保持しています。第一段階として共通世界状態、MAGI冷却点検と因果的な流量異常、部署承認による復旧、保存復元、共有表示と履歴を実装。10主要画面・56区画。導入は約12KBの `NERV_COMMAND_v2_11_STARTER.js` を推奨します。[導入手順](COPY_SCRIPTABLE.md) / [実装範囲と次段階](docs/V2_11_STAFF_WORLD.md) / [検証](docs/VALIDATION.md)。以下の旧版記述は履歴です。

**最新版はv2.10 / `feature/v2-10-eva-command`です。** `07f2242`→v2.9の機能と固定EVA・パイロット顔を継承し、EVA通常戦闘、NERV司令部と5人の通信、都市の機関砲/誘導弾、666外部防御を追加しました。9主要画面・49区画。[操作・保存仕様](docs/V2_10_COMMAND_OPERATIONS.md) / [Web調査](docs/V2_10_RESEARCH.md)。単体コードは `NERV_COMMAND_v2_10_SCRIPTABLE.js`。以下は履歴で、旧版ブランチへ戻す指示ではありません。

**v2.9はユーザー指定の`07f2242942ffd1eaf6c9734b2bbc773dc8c7bc1f`を基準に再生成しています。** 固定EVA再描画・39区画・職員業務・給電/配置/MAGI/警報復旧を継承し、好評だったパイロットの顔イラストを搭乗者監視へ追加しました。[v2.9の差分と検証](docs/V2_9_RESTORATION.md)。最新の単体ファイルは`NERV_COMMAND_v2_9_SCRIPTABLE.js`、コピー用TXT・配布ZIPは`dist/NERV_COMMAND_v2_9_*`です。以下のv2.7表記は参照版からの履歴です。

NERV職員が使う管制端末を想定した、iPhone Scriptableアプリです。ボタンだけのホーム、三基の合議を行うMAGIシステム、順番に指示を出す戦術指揮、確認して復旧できる警報へ再設計しました。8画面・既存素材の保管・保存データの読込互換性を維持し、ブラウザ版とScriptable単一ファイル版を同じソースから生成します。

添付参考からEVA三機を背景透過で再描画し、大きな機体監視・小型表示・出撃位置表示で共有しています。敵の接近・機体の配置変更、横流れの状況表示、MAGI侵入対処シナリオ、現在地を優先する気象表示、回転計器・波形・移動・短いスプラッシュを追加しました。8画面は39区画に分割しています。

操作は [職員ガイド](docs/STAFF_GUIDE.md)、画像と演出の方針は [ビジュアル改修](docs/ART_DIRECTION.md)、資料は [調査記録](docs/RESEARCH_MOBILE_OPERATIONS.md) を参照してください。

次のチャットでの再開は **[引き継ぎ入口](HANDOFF.md)** と [開始プロンプト](handoff/NEXT_CHAT_PROMPT.md) を使用してください。現行画面見本・品質基準・検証記録をまとめています。完全な引き継ぎZIPは `python3 scripts/handoff.py` で生成できます。

開発前に [AGENTS.md](AGENTS.md)、[MIGRATION_BRIEF.md](MIGRATION_BRIEF.md)、[README_v2_7.md](README_v2_7.md) を確認してください。ソース構成と検証範囲は [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) にあります。

## 管制・地下施設・職員業務の拡張

EVA描画を固定し、起動・ジオフロント・迎撃兵装の共通背景と状態連動の動きを追加しました。EVAの搭乗者監視、各画面に届く職員通信と受命/作業/報告、勤務評価、6サイズのネイティブウィジェットを改修しています。既存区画を残して39区画です。[最新操作ガイド](docs/TERMINAL_EXPANSION.md) / [調査記録と取得制限](docs/RESEARCH_TERMINAL_EXPANSION.md)。

## 職員端末の追加操作

職員支援に表裏を表示できる職員証と館内放送・職員通信を追加しました。戦術指揮の行動選択は分類・指令・実行前確認の3段階。無音だった操作にも既存音を優先してタップ音を補います。EVAの描画は維持しています。[操作と保存の詳細](docs/PERSONNEL_SERVICES.md)。

## ビルド

Python 3.10以上のみで実行できます。Node.js 18以上は回帰テストで使用します。ビルドに外部パッケージや通信は不要です。

```sh
python3 scripts/build.py
```

生成物：

- `index.html`：スタイル・処理・既存画像を埋め込んだブラウザ版
- `app.js` / `styles.css`：生成された開発・検証用バンドル
- `NERV_COMMAND_v2_15_STARTER.js`：推奨の小さな導入版（初回オンラインで本体を検証・保存）
- `NERV_COMMAND_v2_15_SCRIPTABLE.js`：全文を同梱したオフライン導入版
- `dist/NERV_COMMAND_v2_15_COPY_PASTE.txt`：Scriptableに全文を貼り付けるコード
- `dist/NERV_COMMAND_v2_15_RELEASE.zip`：HTML・Scriptable・画像・説明・チェックサムを含む配布物

`src/` と `assets/` を編集して再ビルドしてください。ルートの生成物を直接編集しないでください。構造移行時の互換性記録は履歴として保持し、今回の職員向け再設計では操作・ルールを意図的に変更しています。既存保存を読み込んだだけでは作戦・損傷・累計記録をリセットしません。

[職員向け操作ガイド](docs/STAFF_GUIDE.md) / [iPhoneへコードをコピーする手順](COPY_SCRIPTABLE.md)

## テスト

ブラウザ検証用の依存関係を一度準備します。システムのChromiumがある場合はそのまま利用できます。

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
# システムChromiumがない場合のみ：
.venv/bin/python -m playwright install chromium
.venv/bin/python scripts/test.py
```

現在のクラウド環境では依存関係を確認済みなので、`python3 scripts/test.py` で全検証を実行できます。ブラウザなしの検証は `python3 scripts/test.py --no-browser` です。このオプションでは画面・操作の検証は実行されません。

## 起動とインストール

```sh
python3 -m http.server 8000 --directory .
```

ブラウザではHTTPで配信すると保存を確認できます。Scriptableでは小さな `STARTER.js` の全文を新規スクリプトへ貼り付け、初回のみオンラインで実行します。本体を毎回貼り直す必要はありません。全文版・コピー用TXTもオフライン導入の選択肢として保持しています。ホーム画面3種類・ロック画面3種類の既存ウィジェットを維持しています。

気象・地図には別途インターネット接続が必要です。回帰テストは外部通信を遮断し、オフラインでの挙動を検証します。iPhoneのScriptable実機/WebKitと実際の気象・地図通信は未検証です。

非公式・非商用のファン制作です。EVA・MAGI・都市防衛・作戦は架空のシミュレーションであり、公式の防災警報ではありません。
