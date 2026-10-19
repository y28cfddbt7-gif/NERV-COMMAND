# v2.16 Web参照と制約

## Anime.js

指定された4ページはいずれも、この環境からはプロキシのトンネル403で本文を取得できませんでした。

- https://animejs.com/documentation/easings
- https://animejs.com/documentation/engine/engine-parameters/speed
- https://animejs.com/documentation/adapters/threejs-adapter/threejs-instanced-and-batched-meshes
- https://animejs.com/documentation/animation/tween-parameters/composition

代わりに公式リポジトリの**v4.5.0タグ**を実際に取得し、次のソースを確認しています。サイト本文を閲覧できたとは主張しません。

- [eases/parser.js](https://github.com/juliangarnier/anime/blob/v4.5.0/src/easings/eases/parser.js)：`out()`等のイージング生成。
- [engine.js](https://github.com/juliangarnier/anime/blob/v4.5.0/src/engine/engine.js)、[clock.js](https://github.com/juliangarnier/anime/blob/v4.5.0/src/core/clock.js)：`engine.speed`、手動更新とデフォルトRAFの停止。
- [animation.js](https://github.com/juliangarnier/anime/blob/v4.5.0/src/animation/animation.js)、[composition.js](https://github.com/juliangarnier/anime/blob/v4.5.0/src/animation/composition.js)：`replace`/`none`/`blend`。
- [three/instance.js](https://github.com/juliangarnier/anime/blob/v4.5.0/src/adapters/three/instance.js)、[index.js](https://github.com/juliangarnier/anime/blob/v4.5.0/src/adapters/three/index.js)：インスタンスのキャッシュ、行列分解、dirtyキュー、描画前の行列反映、利用上の制約。

移植したのは数値の位置・スケール部分です。通常のオブジェクトのgetter/setterで補間するため、完全版アダプターのprivate registryや別のAnimeエンジンは追加しません。色・material/TSL・BatchedMesh等には対応しないことをコードと操作資料にも明記しています。

## Three.js

既存のScriptableへオフラインで統合できるUMD配布物を持つr160を固定し、公式の[three.min.js](https://github.com/mrdoob/three.js/blob/r160/build/three.min.js)、[MIT](https://github.com/mrdoob/three.js/blob/r160/LICENSE)、[package.json](https://github.com/mrdoob/three.js/blob/r160/package.json)、[InstancedMeshの公式資料](https://github.com/mrdoob/three.js/blob/r160/docs/api/en/objects/InstancedMesh.html)を取得しました。最新リリースであるとは主張しません。配布物は未改変、SHA-256を`tests/fixtures/v2_16_vendor.json`に記録しています。実行時のCDN取得・npmインストールは不要です。

## 第三新東京市の造形

添付3枚の画像を直接参照しました。多連砲身、分厚い装甲の外壁、斜めの外装材・庇、青い窓、高層街の足元に続く住宅と電線を追加図形の参考としています。既存の人物・携行兵装・都市迎撃武器・施設画像は変更していません。

[Tokyo-3](https://wiki.evageeks.org/Tokyo-3)の取得は526。Bingの一般検索と「第三新東京市 武装ビル」の検索も実行しましたが、後者はベルリンの観光情報など無関係な結果を返しました。これらを設定や外観の根拠には使っていません。今回は添付参考と既存の調査記録を優先し、模式配置・独自の数値モデルとして実装しています。取得失敗を理由にTLS検証を無効化していません。
