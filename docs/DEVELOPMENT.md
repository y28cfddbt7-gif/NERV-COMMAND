# v2.7共通ソースとビルド

構造移行ではゲームルール・UI・保存スキーマを変更していません。移行前コミット `0ec87248ead21113698fce2d19d06fc37df154c7` の4成果物のSHA-256を `tests/fixtures/v2_7_artifacts.json` に記録し、生成結果が一致することを検証します。

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
| `src/browser/lifecycle.js`, `scope-*.js` | 共通描画・更新・保存イベント・バンドルのスコープ |
| `src/ui/index.html`, `src/ui/pages/*.html` | 共通シェルと8画面の初期DOM |
| `src/styles/*.css` | 機能別スタイル。既存の上書き順序を維持 |
| `src/scriptable/storage.js`, `boot.js` | 既存保存ファイルと一度だけのバックアップ・起動情報 |
| `src/scriptable/widgets.js`, `webview.js`, `main.js` | 6種類のウィジェット・WebView/ネイティブブリッジ・配布テンプレート |
| `assets/` | 既存のEVA画像。参照ファイルをビルド時にdata URL化 |

`src/build.json` が順序と参照画像の定義です。ブラウザのJSモジュールは単一のIIFE内に順番に結合する**ビルド時モジュール**です。独立したES modulesではありません。共有状態 `S`、関数の巻き上げ、`draw` の拡張順序、イベントのcapture順を維持し、ScriptableのWebViewと単一貼付け方式で読み込み機構を増やさず動かすための移行段階です。各ファイルを単独でscriptタグに読み込んだり、順序を変更しないでください。今後の依存性分離は同じ回帰テストで段階的に進められます。

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

ソースも生成物も元と一致するため、スキーマ移行やデータのリセットは追加していません。テストは隔離したブラウザコンテキストと合成データ、モックのScriptableファイルシステムを使用し、実際のユーザーの保存ファイルを書き換えません。

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

ブラウザ検証では8画面×320/390/430pxのはみ出し、画像読込、3機のA.T.フィールドの中心位置をアニメーション中・リサイズ後に検査します。さらに出撃・作戦の前提条件、充填・照準・発射、都市防衛の勝敗・損傷継続・修理と資源・MAGI審議のターン失効・侵入隔離・ケーブル・支援射撃・旧保存読込を確認します。失敗はassertionまたは例外として終了コードに反映します。画面キャプチャは `test-results/` に出力します。

ビルドテストは別ディレクトリへの再配置、反復ビルド、ZIP内容とハッシュ、ソースを変更すると両ターゲットへ届くこと、不一致を `--check` が拒否することを検査します。将来の意図的な機能変更では、互換性の確認とレビューなしに元のハッシュの期待値を更新しないでください。`BASELINE_CHECKS.json` と `QA_REPORT_v2_7.json` は移行前の履歴資料です。

## 今回の範囲と今後

既存のホーム・気象・都市インフラ・EVA・作戦・MAGI・ツール・設定を保持しました。今後のiPhone情報画面の拡充、ウィジェットの再設計、世界観を深める新シナリオは、この構造を基に別の機能変更として進めます。端末APIで取得できない値を実測値として表示しないでください。

iPhone Scriptable/WebKit実機、ホーム/ロック画面の見切れ・タップ・更新、位置情報許可、実際の気象・地図取得は未検証です。Chromium・モックの成功で実機検証済みとは扱いません。実機チェックでは既存保存のコピーを保管し、6ウィジェット、8画面、バックグラウンド復帰時の電力、MAGI承認、実データ未取得表示を確認してください。

参考資料：既存の作品世界参照は `RESEARCH_REFERENCES_v2_7.md` にあります。今回参照を試みた公式API資料は [Scriptable config](https://docs.scriptable.app/config/)、[ListWidget](https://docs.scriptable.app/listwidget/)、[WebView](https://docs.scriptable.app/webview/)、[Playwright assertions](https://playwright.dev/python/docs/test-assertions) です。2026-10-17の取得は環境のプロキシに403で拒否されたため、これらを取得済みの根拠には使っていません。既存素材は変更せず、新たな公式ロゴ・画像の取り込みも行っていません。
