# v2.15 Web参照と取得制約

2026-10-20（日本時間）。添付の第三新東京市構想図を主な配置参考としました。既存の人物・兵装・施設画像は維持。新規の地図は模式図、使徒図は新しく描いたファンイラストです。公式画像の無断転載として追加したものではありません。

## Anime.js

- [指定の公式サイト](https://animejs.com/)と[公式ドキュメント](https://animejs.com/documentation/animation/)は、この実行環境ではプロキシのトンネル403となり本文を取得できませんでした。
- 代わりに、公式GitHubの[package.json](https://github.com/juliangarnier/anime/blob/master/package.json)、[4.5.0 README](https://github.com/juliangarnier/anime/blob/v4.5.0/README.md)、[UMD配布物](https://github.com/juliangarnier/anime/blob/v4.5.0/dist/bundles/anime.umd.min.js)、[engine実装](https://github.com/juliangarnier/anime/blob/v4.5.0/src/engine/engine.js)、[animation実装](https://github.com/juliangarnier/anime/blob/v4.5.0/src/animation/animation.js)、[timer実装](https://github.com/juliangarnier/anime/blob/v4.5.0/src/timer/timer.js)、[MITライセンス](https://github.com/juliangarnier/anime/blob/v4.5.0/LICENSE.md)をraw.githubusercontent.comから取得できました。
- `engine.useDefaultMainLoop=false`、手動`engine.update()`、`animate()`、`complete()`、`cancel()`の実装を確認して統合。ライブラリ本体は改変せず、隣のラッパーで既存の描画エンジンへ接続します。
- 版・配布物・ライセンスのSHA-256は`tests/fixtures/v2_15_additions.json`に記録。ライセンスを配布ZIPにも含めます。

## エヴァの地理・使徒・MAGI

参照先は[第三新東京市](https://wiki.evageeks.org/Tokyo-3)、[サキエル](https://wiki.evageeks.org/Sachiel)、[シャムシェル](https://wiki.evageeks.org/Shamshel)、[ラミエル](https://wiki.evageeks.org/Ramiel)、[MAGI](https://wiki.evageeks.org/Magi)、[第拾参話](https://wiki.evageeks.org/Episode_13)、[第拾壱話](https://wiki.evageeks.org/Episode_11)。今回これらのWikiは526を返し、本文の新規取得を確認できませんでした。Fandomの対応するページも403です。

BingのWeb・画像検索、Google検索でも設定・外観を調査しました。Bingの「Ramiel」の結果には第5使徒であることを示すFandom/EvaWikiの関連結果がありました。一方、複数の検索応答には検索語と無関係な結果が混在し、Googleはリダイレクト案内しか返さなかったため、それらを外観・設定の裏付けとして採用していません。取得できないページを読んだとは報告しません。

過去のv2.14調査で取得できた[第六話](https://wiki.evageeks.org/Episode_06)、MAGI・第拾参話・第拾壱話などの保存資料と既知のTV設定を補助に使っています。サキエル＝第3使徒の白い仮面と赤いコア、シャムシェル＝第4使徒の長い胴体と光の鞭、ラミエル＝第5使徒の青い正八面体と高出力射撃、という基本外観を新規図に反映しました。Wikiは二次資料です。

添付構想図の都市密度、湖、山並みを参考にし、箱根・芦ノ湖・地下ジオフロントという設定を2.5D地形へ落とし込んでいます。個々の建物・道路の位置は独自の模式配置で、測量や公式地図の正確な複製ではありません。

MAGIの三人格、通常審議、職員の役割を維持。新しい同期ずれ・資料不一致・給電バスの障害と、保安6系統の証拠・経路・区画操作は独自の職員業務シナリオです。原作にそのまま存在する故障手順や、特定人物が起こした公式事件としては扱いません。HP・損傷・時間・費用も独自の数値です。

新規の使徒イラスト以外に、既存の固定画像を生成し直したり再圧縮したりしていません。次の改修でも各固定素材のfixtureを維持してください。
