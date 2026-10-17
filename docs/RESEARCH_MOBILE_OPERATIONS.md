# モバイル管制改修：調査と反映内容

2026-10-17にネット検索と資料取得を実施。以下は実際に本文を取得して確認した資料です。作品の公式資料とファン実装を区別し、外部のコード・画像・音声を本アプリへ取り込まず、設計上の参考として使用しました。

| 読んだ資料 | 確認した内容 | 今回の反映 |
| --- | --- | --- |
| [itorr/magi](https://github.com/itorr/magi) README | ファンによるMAGIの三基表示、人格の異なる判断を集約する構造 | MELCHIOR/BALTHASAR/CASPERを回路で結ぶ三角構成。アンバーの待機、緑の賛成、赤の否決 |
| [float1122/magi-system](https://github.com/float1122/magi-system) README | ファン実装が説明する科学者・母・女の人格、三基と多数決 | 三人格の表記と判断理由の分離。出撃・迎撃の二つの申請を維持。同リポジトリ独自の再帰審議や不可逆操作の拒否規則は導入していない |
| [mrcory/Eva_Clock](https://github.com/mrcory/Eva_Clock) README / Project Background | 外部アンビリカル給電、切断後の内部電源と活動限界カウントダウンという作品の要素を扱うファン制作時計 | 機体別の外部/内部電源、供給停止、活動残時間。発進前確認、LCL・神経接続・拘束状態は既存の模擬準備シーケンスを整理 |
| [JacobEGarcia/nerv-os](https://github.com/JacobEGarcia/nerv-os) README | NERV風端末に時計・タイマー・指示・ログなどの実用機能を組み込む例 | 職員支援に端末状況、当直記録、引継ぎ、点検を目的別に配置 |
| [OpenXcom](https://github.com/OpenXcom/OpenXcom/blob/master/README.md)、[BaseInfoState.cpp](https://github.com/OpenXcom/OpenXcom/blob/master/src/Basescape/BaseInfoState.cpp)、[UnitInfoState.cpp](https://github.com/OpenXcom/OpenXcom/blob/master/src/Battlescape/UnitInfoState.cpp) | 基地資源・容量の可視化、ユニットの行動時間・エネルギー・士気の個別数値/バー | 都市電力・資材・機体電源を区別し、施設配備と稼働可能数を明示。費用と効果のある防衛方針 |
| [The Battle for Wesnoth User’s Manual](https://github.com/wesnoth/wesnoth/blob/master/doc/manual/manual.en.html) §1.3.3 / §2.2 / §2.5 / §3.1 | ターン・収入・維持費の表示、戦闘前の被害計算、地形/防御線を考慮する判断 | ターン実行前に電力・砲台火力・対象区画の損害見通しを提示。防御・火力のトレードオフを数値化 |

検索にはGitHubのリポジトリ検索で `MAGI Evangelion`、`evangelion nerv terminal`、`Evangelion umbilical in:readme` 等を使用しました。検索結果だけで採用せず、上記の本文を読んで選定しました。検索で見つかった `WeiberNoname/EvangelionUnits` は他作品との混在と独自設定が強く、設定の根拠には採用していません。

## 取得できなかった資料と解釈の限界

エヴァンゲリオン公式サイト、EvaGeeksのMAGI/Evangelions記事、Wikipedia API、Wesnoth Wikiへの直接アクセスは環境のプロキシから403を返されました。GitHub検索も一時的に429を返したため、連続再試行を避け、既知の本文URLを使用しました。公式サイトを読了した、公式の操作仕様を再現した、という主張はしていません。公式参照先の従来一覧は [RESEARCH_REFERENCES_v2_7.md](../RESEARCH_REFERENCES_v2_7.md) に履歴として残しています。

三人格や外部電源などの作品由来の要素と、本アプリのゲームルールを分けています。SYNC閾値、MAGI各票の成立条件、内部電源300秒・A.T.時2倍・ターン32秒、防衛方針の倍率、HP、射撃条件、資源は本アプリ独自の模擬値です。三基中二基以上でも必須条件が不足すれば承認しません。エントリープラグ/LCL準備は既存READY状態から導く確認表示で、詳細な医療・生体シミュレーションや新しい実測データは実装していません。

ユーザー添付は配色・密度・装置らしい構図・大型警報の参考に使用し、画像内の火山情報やその他の文言を新機能の要件へ置き換えていません。
