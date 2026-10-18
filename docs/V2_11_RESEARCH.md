# v2.11 調査と独自設計の境界

調査日2026-10-18。`Evangelion NERV technical division MAGI Ritsuko Maya 666 protection`などでWeb検索し、下記ページ本文も実際に取得しました。作品設定はファン編集のEvaWikiを含む二次資料に基づくため、独自設計を公式設定として断定しません。画像の再生成は行っていません。

| 参照 | 第一段階での扱い |
| --- | --- |
| [Nerv](https://wiki.evageeks.org/Nerv) | 指揮系統・戦術部門と技術部門を区別。管制補助が全部門の最終判断者にならない構造 |
| [Magi](https://wiki.evageeks.org/Magi) | 三基の人格、赤木リツコの技術的役割、旧劇場版で外部ハッキングを止めるtype-666防壁。自爆や内部の適応侵食と区別 |
| [Maya Ibuki](https://wiki.evageeks.org/Maya_Ibuki) | コンピュータ技術・EVA監視に関わる職員として点検連絡を担当。新劇場版後期の役職やWILLEを混在させない |
| [Makoto Hyuga](https://wiki.evageeks.org/Makoto_Hyuga) | 戦術作戦部でミサトを支援する立場として作戦状況・承認の連絡 |
| [Shigeru Aoba](https://wiki.evageeks.org/Shigeru_Aoba) | 発令所の技術職員、通信・索敵の状況確認 |
| [Scriptable FileManager](https://docs.scriptable.app/filemanager/) | ローカルLibraryへの本体キャッシュと保存ファイルの控え |
| [Scriptable Request](https://docs.scriptable.app/request/) | HTTPSで一度本体を取得。TLS検証を無効化せず、SHA-256でも確認 |
| [Scriptable module](https://docs.scriptable.app/module/) | 導入方式の調査。全体コードをモジュールへ移す方式ではなく、既存ネイティブAPIを保つ非同期スコープで起動 |

冷却枝系統の負荷モデル、70%/90%、30秒周期、6分の補完上限、点検・診断の手順、C-3という区分、台詞はアプリ独自です。原作にこの業務手順や数値があるという主張ではありません。物語の職務分担と、アプリ内の整合性を持つ職員体験を実現するための第一段階です。

EVA三機、パイロット顔、既存スタッフ顔は従来の素材をそのまま使用。新しい擬似乱数で顔・模擬状態・警報を毎回変える仕組みにはしていません。実際の天候や端末情報とは引き続き分離しています。
