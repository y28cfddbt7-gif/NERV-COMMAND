# 次のチャットへ貼り付けるプロンプト

以下が現行の再開先です。古いmainやv2.9/v2.10へ戻さないでください。

```text
NERV COMMANDの既存開発を引き継いでください。
リポジトリ：y28cfddbt7-gif/NERV-COMMAND
現行ブランチ：feature/v2-11-staff-world / v2.11
基準：v2.10 92a7767860ef90b5d8e47ead1306958d69bdc267 → v2.9 → ユーザー指定07f2242942ffd1eaf6c9734b2bbc773dc8c7bc1f。

AGENTS.md、HANDOFF.md、docs/V2_11_STAFF_WORLD.md、docs/V2_11_RESEARCH.md、docs/VALIDATION.md、handoff/QUALITY_GATE.mdと最新画面見本を読んでください。EVA三機とパイロット顔は永久固定。保護する元53ファイルはtests/fixtures/reference_07f2242.jsonを維持。描画や機能を先祖返りさせず、既存ソースに追加する方針です。

v2.11は10画面56区画。第一段階として共通世界状態、冷却系統点検業務、実負荷からの異常、部署承認による解決、永続化・破損保護、ホーム/MAGI共有表示・履歴を実装済み。後続の統一権限、複数部署とNPC、EVA監視支援は計画です。既存の直接戦闘や旧勤務評価は保持しており、アプリ全域の職位制御が完了したとは扱いません。

ホーム先頭に職員業務・司令部損傷・5人との会話・666の導線があります。iPhoneで縦長になる機能は独立区画に分割し履歴と再読込に対応。Web検索でTV/旧劇場版の組織と技術設定を確認し、独自の模擬数値や台詞を原作設定と混同しないでください。

src/から共通ビルドし、python3 scripts/test.pyで検証。実機Scriptable/WebKitは未検証なので実機検証済みと呼ばない。コピー負荷を減らす約12KBのNERV_COMMAND_v2_11_STARTER.jsを納品に使います。本体を初回だけ取得・SHA-256検証し保存。6種類のウィジェットは本体やネットなしで動きます。更新時はmanifestのruntime refを実際に公開するブランチに合わせ、生成・コミット・公開後python3 scripts/copy_link.py --starterで確かめた固定コミットのコードリンクを渡してください。巨大なコードやSVGをチャットへ出力しません。

今後は私の新しい依頼を優先してください。追加依頼がなければ実装範囲と次段階の計画を確認し、現行機能を調査してください。
```
