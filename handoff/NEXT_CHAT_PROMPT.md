# 次のチャットへ貼り付けるプロンプト

最新は `feature/v2-10-eva-command` / v2.10です。`07f2242`→`0a73d2f`の継承版から追加改修済み。EVA三機とパイロット顔は固定。9画面49区画、EVA通常戦闘、司令部、666外部防御があります。最初に最新のAGENTS.mdとdocs/V2_10_COMMAND_OPERATIONS.mdを読み、src/build.jsonから配布ファイル名を確認してください。以下の旧コミットや旧ブランチは過去の引継ぎです。

以下をコピーしてください。リポジトリ連携を利用する場合も、`main` のまま再開しないでください。

```text
NERV COMMAND TERMINALの既存開発を引き継いでください。

リポジトリ：y28cfddbt7-gif/NERV-COMMAND
再開ブランチ：fix/restore-visual-command-07f2242
現行バージョン：v2.9
ユーザー指定の基準コミット：07f2242942ffd1eaf6c9734b2bbc773dc8c7bc1f
引き継ぎ入口：https://github.com/y28cfddbt7-gif/NERV-COMMAND/blob/fix/restore-visual-command-07f2242/HANDOFF.md
最初にdocs/V2_9_RESTORATION.mdも読み、tests/fixtures/reference_07f2242.jsonで固定する元ロジック・EVA描画と、好評だったパイロット顔画像を維持してください。最新の単体ScriptableはNERV_COMMAND_v2_9_SCRIPTABLE.jsです。

最初にHANDOFF.md、AGENTS.md、docs/STAFF_GUIDE.md、docs/ART_DIRECTION.md、handoff/QUALITY_GATE.mdを読み、handoff/previews/の現行画面見本を確認してください。docs/DEVELOPMENT.md、docs/VALIDATION.mdの最新結果、MIGRATION_BRIEF.md、READMEも確認してください。README_v2_7.mdとFIRST_CODEX_TASK.mdは過去の資料で、完了済みの構造移行をやり直す指示ではありません。開始時にチェックアウト中のブランチとコミットを記録し、mainとの差やhandoff/BASELINE.jsonの基準値を確認してください。

これはNERV職員が使う想定のiPhone Scriptable端末です。ユーザーが最新ビジュアルを高く評価した状態から継続し、一からの作り直しや見た目の後退を避けてください。8主要画面/39区画、背景透過の三機の共通描画、EVA/敵の地図表示、MAGI三基合議と侵入物語、横流れSTATUS、現在地優先気象、警報の継続/明示クリア、当直/引継ぎ/点検・受命/勤務評価と保存互換性を維持してください。ホームは移動ボタンと発令中の警報のみです。

src/を編集し、共通ビルドからブラウザ版と単一ファイルScriptable版を生成してください。生成物を直接編集しないでください。変更に応じた回帰、320/390/430px、関連画面のリンク/戻る/再読込、低モーション/ミュート、旧保存/バックアップ失敗を検証してください。全体コマンドはpython3 scripts/test.pyです。件数と結果は現在の実行ログで確認し、過去の件数を成功として転記しないでください。実機と実サービス通信は未検証なので、実機検証済みとは報告しないでください。

私はZIPを取得できない場合があります。納品には更新コード全文をコピーできる、実際に公開されたコミットのGitHub/Rawリンクを付けてください。公開前のコードや古いmainへのリンクを更新版として案内しないでください。

今後の候補は「iPhone実機での操作調整＋マップからの直接指揮」です。ただし候補は確定要件ではなく、この後の私の依頼を優先してください。新しい依頼がなければ、資料を読んだ結果と次の着手案を簡潔に示してください。
```

コミット固定の引き継ぎURLが手元にあれば、上記の入口URLをその固定URLへ差し替えると、後日のブランチ更新と混同しません。元のチャットの閲覧・元添付の取得ができなくても、保存済み素材と画面見本で現在の方向性を確認できます。
