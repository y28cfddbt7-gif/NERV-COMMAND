# v2.17 Web参照・取得制約

2026-10-20の実装時に外部取得を再実施。TLS検証は無効化していません。

- https://wiki.evageeks.org/Umbilical_Cable と https://wiki.evageeks.org/Progressive_Knife はHTTP526、`Yashima`の参照試行も403。本文を確認できたとは主張しません。
- Googleの `Evangelion umbilical cable Tokyo-3 armament buildings` はHTTP200ですがJavaScript/転送ページで、設定の裏付けを含む本文は得られませんでした。
- Bingの `Evangelion umbilical cable five minutes` は一般的なシリーズ紹介、`Tokyo-3 armament buildings Evangelion` は現実の東京観光等を返し、給電条件や武装ビルの根拠に使える結果は得られませんでした。
- https://www.evangelion.co.jp/ とWikipediaの本文取得はプロキシ403。
- [Three.js r160のInstancedMesh公式資料](https://github.com/mrdoob/three.js/blob/r160/docs/api/en/objects/InstancedMesh.html)を実際に取得（5,597 bytes）。[Anime.js4.5.0 engine公式ソース](https://github.com/juliangarnier/anime/blob/v4.5.0/src/engine/engine.js)も取得（4,440 bytes）。既存の固定ローカル配布物と単一描画スケジューラを継続使用。

造形は今回までにユーザーが添付した武装ビル・街並み参考、固定済み画像、および[前版の取得記録](V2_16_RESEARCH.md)を参照。画像の置換・新しい外部画像の取り込みはしていません。アンビリカルと通常武器/高出力兵器の区別を維持し、取得できなかった資料から新しい原作設定を断定しません。

新しい区画戦術・敵の予告射界・遮蔽・手動照準・機体健全性・10秒ターンは**独自ゲーム規則**です。原作の確定値・配置・戦闘手順の再現とは区別します。
