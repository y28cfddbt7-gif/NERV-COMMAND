# 共通ソースとビルド

v2.12は`v212-imagery.js`（小さな独自SVG）、`v212-combat.js`（既存resolver拡張と保存成功後の命中通知）、`v212-messages.js`（8人の永続通信）、`v212-motion.js`（一つの描画スケジューラー）を末尾に追加。旧53モジュールと固定描画は維持します。保存の専用控えは`backupWorld`の限定した拡張識別子で分け、旧バックアップを上書きしません。新規コードのルール・上限・フォールバックは [v2.12設計](V2_12_IMMERSIVE.md) を参照してください。生成物を直接編集せず、常に小さなSTARTERも再生成してください。

最新版v2.11の追加モジュールは `staff-world.js`（共有状態・因果的遷移）、`world-workflow.js`（保存トランザクションと画面）、`state-safeguard.js` / `persistence-guard.js`（旧読込の前後で保存を保護）、`v211-discovery.js`（ホームの導線・666投影）です。旧53ファイルと固定アートは変更しません。順序はmanifestを参照。新規職員業務は6区画、MAGI連携を加えて10画面56区画です。[構造と第一段階の制約](V2_11_STAFF_WORLD.md)。

`src/scriptable/starter.js`から約12KBの導入版を生成します。通常起動はmanifestの公開refにある全文版を初回取得し、ビルド時に埋めたSHA-256で検証・ローカル保存。ウィジェットは本体を読まず既存のnative storage/widgetsで動きます。全文版を生成してから導入版へそのハッシュを埋めるため、生成物を直接編集しないでください。同じ版の公開refを変更した場合は導入版も再生成・再配布が必要です。公開後 `python3 scripts/copy_link.py --starter` で確認します。

> 最新の操作仕様は [職員向け操作ガイド](STAFF_GUIDE.md) を参照してください。下記の構造移行・UI拡張の説明は開発経緯を含みます。現在のMAGI・戦術・警報処理はユーザーの指示で再設計済みで、旧ミニゲームを維持する制約はありません。ハッシュ比較は変更していないstate・toolsの2モジュールが対象です。EVA給電・地図初期化・現在地優先の気象処理は意図的に変更し、振舞いをブラウザで検証します。

構造移行時はゲームルール・UI・保存スキーマを変更せず、移行前コミット `0ec87248ead21113698fce2d19d06fc37df154c7` の4成果物の一致を検証しました。そのSHA-256は `tests/fixtures/v2_7_artifacts.json` に履歴として記録しています。後続の[UI・演出拡張](UI_EFFECTS.md)では生成物を意図的に変更し、ゲーム関連12モジュールの元ハッシュと回帰テストでロジックの維持を確認します。

## ソース構成

| ソース | 担当 |
| --- | --- |
| `src/browser/state.js`, `native-bridge.js` | 保存の読込・初期値・ブラウザ/Scriptable連携 |
| `src/browser/navigation.js`, `home.js` | 起動・8画面の遷移・端末電池表示 |
| `src/browser/weather.js`, `meteo.js`, `geographic-map.js` | 気象・降雨・実地図・未取得時の表示 |
| `src/browser/infrastructure.js`, `eva.js`, `magi.js`, `mission.js` | 各システムの既存状態機械・承認・作戦フェーズ |
| `src/browser/tools.js`, `clock.js`, `settings.js` | タスク・タイマー・時計・設定 |
| `src/browser/feedback.js`, `animation-alerts.js` | 音・ログ・操作演出・全体警戒表示 |
| `src/browser/training.js`, `tactics.js`, `city-defense.js` | 既存訓練・作戦連携・都市防衛と永続損傷 |
| `src/browser/magi-intrusion.js`, `command-visuals.js` | 非上書き更新バックアップ・侵入物語・配置マーカー・状況テキスト・参照図を基にした描画の共有 |
| `src/browser/world-terminal.js`, `duty-dispatch.js` | 本部・兵装・搭乗者・受命の独立区画、状態連動表示と勤務評価 |
| `src/browser/personnel-services.js`, `command-dispatch.js` | 職員証・架空通信・実行前確認。詳細は [追加ガイド](PERSONNEL_SERVICES.md) |
| `src/browser/mobile-views.js`, `personnel.js` | iPhone向け区画切替・履歴ルート・当直・引継ぎ・点検 |
| `src/browser/strategy.js`, `operation-visuals.js` | 防衛方針・次ターン予測・機体給電・機構の動作表示 |
| `src/browser/lifecycle.js`, `scope-*.js` | 共通描画・更新・保存イベント・バンドルのスコープ |
| `src/ui/index.html`, `src/ui/pages/*.html` | 共通シェルと8画面の初期DOM |
| `src/styles/*.css` | 機能別スタイル。既存の上書き順序を維持 |
| `src/scriptable/storage.js`, `boot.js` | 既存保存ファイルと一度だけのバックアップ・起動情報 |
| `src/scriptable/widgets.js`, `webview.js`, `main.js` | 6種類のウィジェット・WebView/ネイティブブリッジ・配布テンプレート |
| `assets/` | 既存のEVA画像。参照ファイルをビルド時にdata URL化 |

`src/build.json` が順序と参照画像の定義です。スタイルにも `{{asset:...}}` を展開できるため、RGBA描画シートを通常の `background-image` に一度埋め込み、CSSで三列を表示します。巨大なdata URLをカスタムプロパティへ格納するとブラウザの展開上限に抵触するため使用しません。ブラウザのJSモジュールは単一のIIFE内に順番に結合する**ビルド時モジュール**です。独立したES modulesではありません。共有状態 `S`、関数の巻き上げ、`draw` の拡張順序、イベントのcapture順を維持し、ScriptableのWebViewと単一貼付け方式で読み込み機構を増やさず動かすための移行段階です。各ファイルを単独でscriptタグに読み込んだり、順序を変更しないでください。今後の依存性分離は同じ回帰テストで段階的に進められます。

ウィジェットとWebViewのソースも、元のif/elseの境界を保ったフラグメントです。ウィジェットは既存のローカル保存値を読み、WebView起動・ネットワーク要求を行いません。保存済み気象値の表示と更新予定時刻は、実際の更新や実機レイアウトの保証ではありません。

## ビルドの契約

```sh
python3 scripts/build.py
python3 scripts/build.py --check
python3 scripts/build.py --out-dir /tmp/nerv-release
```

Python 3.10以上の標準ライブラリだけで動作し、作業ディレクトリに依存しません。元ソースと埋め込み画像はスクリプト位置から解決します。ブラウザHTMLを先に組み立て、その同じ文字列をJSON文字列としてScriptableへ埋め込みます。実行時に別のJS・CSS・画像をダウンロードする必要はありません（外部地図・気象は従来どおり別です）。

ビルド結果はルートの4成果物と、無視対象の `dist/` に保存されます。ZIPのエントリ順・日時・パーミッションを固定し、タイムスタンプや絶対パスを含めません。同じPython/zlib環境とソースでZIPも再現できます。異なるzlibバージョン間の圧縮バイト列までは保証しません。ZIP内の各ファイルはSHA-256で検査できます。

`--check` は書込みせず、ルート成果物とソースの不一致を終了コード1で報告します。CIはビルド前のこのチェックで生成物のコミット漏れを検出できます。`dist/` は未生成でも構いません。

## 保存互換性

- ブラウザ：`localStorage['nerv-command-v2']`
- Scriptable：Library内の `nerv_command_v2_state.json`
- Scriptable旧データバックアップ：`nerv_command_v2_state_pre_v2_7_backup.json`。存在時は上書きしません。
- EVAの旧保存に電力更新時刻がない場合に過去時間を勝手に減算しない処理、v2.5進行済み作戦の補完、v2.7防衛初期値の補完を維持します。

構造移行時はソースと生成物を元に一致させました。現在は機能拡張として `personnel`、機体別 `umbilical` / `mapSector`、`magi.intrusion`、気象の取得座標を追加しています。更新バックアップは警報クリア用と別の非上書きファイルです。旧保存では不足する初期値のみ補完し、既存の記録・未知の拡張項目を維持します。テストは隔離したブラウザコンテキストと合成データ、モックのScriptableファイルシステムを使用し、実際のユーザーの保存ファイルを書き換えません。

## 回帰テスト

`python3 scripts/test.py` はビルド、生成物検査、既存ベースライン、Nodeの状態テスト、6種類のウィジェット、Scriptable APIモック、Pythonのビルド検証、Chromiumの操作検証を実行します。最初の失敗で停止し、その終了コードを返します。ブラウザ未導入を成功扱いでスキップしません。

ブラウザの準備：

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python -m playwright install chromium
.venv/bin/python scripts/test.py
```

Chromiumは `CHROMIUM_EXECUTABLE`、システムの `chromium` / `chromium-browser`、Playwright付属の順で選びます。インストールでOS依存ライブラリ不足が報告された場合は、Playwrightが示す必要パッケージを準備してください。確認済みクラウド環境ではPython 3.12.14 / Node 24.19.0 / Playwright 1.62.0 / システムChromiumを使用しています。ブラウザのテストは一時HTTPサーバーを空きポートで起動し、終了時に閉じます。Webセキュリティは無効化しません。

個別コマンド：

```sh
python3 -m unittest discover -s tests -p 'test_*.py' -v
python3 -m unittest discover -s tests -p 'qa_*browser.py' -v
python3 tests/qa_v26_flow.py
node tests/qa_scriptable_bridge.js
```

ブラウザ検証では8画面×320/390/430pxのはみ出し、画像読込、3機のA.T.フィールドの中心位置をアニメーション中・リサイズ後に検査します。さらに出撃・作戦の前提条件、充填・照準・発射、都市防衛の勝敗・損傷継続・修理と資源・MAGI審議のターン失効・ケーブル・支援射撃・旧保存読込を確認します。失敗はassertionまたは例外として終了コードに反映します。画面キャプチャは `test-results/` に出力します。

ビルドテストは別ディレクトリへの再配置、反復ビルド、ZIP内容とハッシュ、ソースを変更すると両ターゲットへ届くこと、不一致を `--check` が拒否すること、変更していないモジュールの維持を検査します。将来の意図的な機能変更では、互換性の確認とレビューなしに元のハッシュの期待値を更新しないでください。`BASELINE_CHECKS.json` と `QA_REPORT_v2_7.json` は移行前の履歴資料です。

## 実機検証の範囲

8画面を保持し、目的別の独立タブへ分割しています。職員支援、EVA給電、MAGI表示、防衛方針の現在の仕様は [操作ガイド](STAFF_GUIDE.md) に記載しています。端末APIで取得できない値を実測値として表示しないでください。

iPhone Scriptable/WebKit実機、ホーム/ロック画面の見切れ・タップ・更新、位置情報許可、実際の気象・地図取得は未検証です。Chromium・モックの成功で実機検証済みとは扱いません。実機チェックでは既存保存のコピーを保管し、6ウィジェット、8画面、バックグラウンド復帰時の電力、MAGI承認、実データ未取得表示を確認してください。

参考資料：既存の作品世界参照は `RESEARCH_REFERENCES_v2_7.md` にあります。今回参照を試みた公式API資料は [Scriptable config](https://docs.scriptable.app/config/)、[ListWidget](https://docs.scriptable.app/listwidget/)、[WebView](https://docs.scriptable.app/webview/)、[Playwright assertions](https://playwright.dev/python/docs/test-assertions) です。2026-10-17の取得は環境のプロキシに403で拒否されたため、これらを取得済みの根拠には使っていません。既存素材は変更せず、新たな公式ロゴ・画像の取り込みも行っていません。
