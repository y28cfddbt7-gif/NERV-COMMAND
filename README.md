# NERV COMMAND TERMINAL v2.7

既存のiPhone Scriptableアプリを維持した、モジュール化済みの開発プロジェクトです。8画面・ゲームルール・画像・保存形式を変えず、ブラウザ版とScriptable単一ファイル版を同じソースから生成します。

開発前に [AGENTS.md](AGENTS.md)、[MIGRATION_BRIEF.md](MIGRATION_BRIEF.md)、[README_v2_7.md](README_v2_7.md) を確認してください。ソース構成と検証範囲は [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) にあります。

## ビルド

Python 3.10以上のみで実行できます。Node.js 18以上は回帰テストで使用します。ビルドに外部パッケージや通信は不要です。

```sh
python3 scripts/build.py
```

生成物：

- `index.html`：スタイル・処理・既存画像を埋め込んだブラウザ版
- `app.js` / `styles.css`：生成された開発・検証用バンドル
- `NERV_COMMAND_v2_7_SCRIPTABLE.js`：Scriptable向け単一ファイル
- `dist/NERV_COMMAND_v2_7_COPY_PASTE.txt`：Scriptableに全文を貼り付けるコード
- `dist/NERV_COMMAND_v2_7_RELEASE.zip`：HTML・Scriptable・画像・説明・チェックサムを含む配布物

`src/` と `assets/` を編集して再ビルドしてください。ルートの生成物を直接編集しないでください。構造移行時は4成果物のバイト一致を確認しました。現在は機能選択ホーム・大型警報・視覚/音響効果を拡張しています。ゲームルール・画像・保存キーは維持しています。

[UI・演出更新の説明](docs/UI_EFFECTS.md) / [iPhoneへコードをコピーする手順](COPY_SCRIPTABLE.md)

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

ブラウザではHTTPで配信すると保存を確認できます。Scriptableでは生成された `.js` またはコピー用 `.txt` の全文を新規スクリプトへ貼り付けます。ホーム画面3種類・ロック画面3種類の既存ウィジェットを維持しています。

気象・地図には別途インターネット接続が必要です。回帰テストは外部通信を遮断し、オフラインでの挙動を検証します。iPhoneのScriptable実機/WebKitと実際の気象・地図通信は未検証です。

非公式・非商用のファン制作です。EVA・MAGI・都市防衛・作戦は架空のシミュレーションであり、公式の防災警報ではありません。
