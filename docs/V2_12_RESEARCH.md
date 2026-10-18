# v2.12 Web調査・画像の扱い

2026-10-18にBingの通常検索と画像検索を実行し、下記本文を実際に取得しました。TV版と旧劇場版の人物・組織・技術設定を中心にしています。ファン編集のEvaWikiを含む二次資料なので、独自数値・台詞・画面配置を公式設定として断定しません。

| 取得資料 | 実装へ反映した内容 |
| --- | --- |
| [Progressive Knife](https://wiki.evageeks.org/Progressive_Knife) | 高周波振動する刃・EVAの基本装備。既存の近接/中和ロジックを保持し、別のSVG装備図と斬撃を追加 |
| [Episode 06](https://wiki.evageeks.org/Episode_06) | ヤシマ作戦の陽電子狙撃と大規模送電。外部給電・充填・承認を分けた模擬運用へ |
| [Evangelion Unit-01](https://wiki.evageeks.org/Evangelion_Unit-01) | 原作の陽電子射撃、零号機による防護という役割を確認。固定EVA画は変更しない |
| [Magi](https://wiki.evageeks.org/Magi) | MELCHIOR-1 / BALTHASAR-2 / CASPER-3の人格と、旧劇場版のtype-666外部防御。三基の図を独自SVGで構成 |
| [Shinji Ikari](https://wiki.evageeks.org/Shinji_Ikari) | TV版の人物・出撃背景を確認。内向的な応答と業務優先の通信に反映 |
| [Asuka Langley Soryu](https://wiki.evageeks.org/Asuka_Langley_Soryu) | 惣流の人物設定を参照。式波やWILLEの設定を混ぜない |
| [Rei Ayanami](https://wiki.evageeks.org/Rei_Ayanami) | TV版の簡潔な応答を参考にし、派生作品の明るい転校生像とは混同しない |
| [Ritsuko Akagi](https://wiki.evageeks.org/Ritsuko_Akagi) / [Misato Katsuragi](https://wiki.evageeks.org/Misato_Katsuragi) | 猫とコーヒー、戦術部門の役割等を確認。私的会話は独自の台詞 |
| [Maya Ibuki](https://wiki.evageeks.org/Maya_Ibuki) / [Makoto Hyuga](https://wiki.evageeks.org/Makoto_Hyuga) / [Shigeru Aoba](https://wiki.evageeks.org/Shigeru_Aoba) | 職務と人物像、青葉のギター等を確認。新劇場版後期の所属を混ぜない |
| [Scriptable Request](https://docs.scriptable.app/request/) / [FileManager](https://docs.scriptable.app/filemanager/) | HTTPS取得・ローカル本体キャッシュ・所有ファイル名を限定した整理 |

検索語例：`Evangelion Progressive Knife Positron Rifle Magi Casper Balthasar Melchior`、画像検索`Evangelion MAGI system display 666`。検索結果と本文は取得成功。`Positron_Rifle`、`Weapons`という個別Wiki URLは404のため、内容の根拠には使用せずEpisode 06等の取得済み本文を使いました。

MAGI本文に掲載された旧劇場版の表示画像は、画像本体の取得が403でした。取得できた画像をアプリへ転載したという扱いにはせず、三基と接続経路の関係を独自ベクター図として実装しています。既存の固定画像の置換や、検索画像の無断な追加同梱は行っていません。

ポジトロンの充填22×2・射撃40・有効3ターン・ダメージ計算、近接損傷推定、会話文・関係性・待ち時間、60/30/20fpsの品質基準はアプリ独自設計です。全国の電力をゲーム内の電力値で正確に再現しているという主張ではありません。
