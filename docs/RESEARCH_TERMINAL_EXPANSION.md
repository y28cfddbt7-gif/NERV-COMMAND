# 起動・施設・兵装・UIの調査記録

2026-10-17。ソースを取得したことと作品の公式設定を検証したことを区別します。

## 取得できた資料

- [GitHubのUI検索](https://github.com/search?q=evangelion+nerv+interface&type=repositories)：HTTP 200。複数の公開作例を確認。
- [TheGreatGildo/nerv-ui](https://github.com/TheGreatGildo/nerv-ui)：READMEをraw.githubusercontent.comから取得。黒背景、役割ごとの橙/緑/赤、圧縮された機関名の文字組み、データに結び付ける計器という二次的なUI作例として参照。外部スキルやライブラリとして導入・実行していません。
- [charlintosh/evangelion-ui-artboard](https://github.com/charlintosh/evangelion-ui-artboard)：READMEと `screenshots/preview.png` を取得・目視。橙と赤の警告枠・機関風文字・蜂の巣状表示の二次作例。画像やソースを製品へコピーせず、表示を点滅で読みにくくしない設計を採用。
- [KotalaKishanReddy/nerv-terminal](https://github.com/KotalaKishanReddy/nerv-terminal)：READMEを取得。大きな機関名と起動時の端末風演出を確認。ロック・自動更新・外部スクリプトの実行は採用していません。
- `docs/ART_DIRECTION.md` と既存 `assets/eva_units_redrawn.png`：今回の輪郭線・塗り・配色の固定基準。

これらは公開ファン作例であり、公式の設定資料ではありません。新背景は画像生成による独自解釈で、地下空洞・懸垂都市・本部ピラミッド・湖・格納式兵装を表現しています。公式の設備寸法、火砲能力や医療情報は断定していません。

## 検索を試みたが取得できなかった先

Google（GeoFront・NERV headquarters・Tokyo-3 armament・interface）、Bing（NERV boot screen・GeoFront・armament）、`www.evangelion.co.jp`、EvageeksのGeoFront/Tokyo-3/Nerv Headquarters/Weapons/Entry PlugをHTTPSで要求しましたが、いずれもプロキシが `Tunnel connection failed: 403 Forbidden` を返しました。

別のGitHub検索でもジオフロント・兵装の確かな設定資料は取得できていません。一般検索・公式・解説を閲覧済みとは扱いません。必要なドメインを環境設定のネットワーク下書きに追加しました。追加は保存だけで、実行中環境の通信許可が有効になった証拠ではありません。設定が適用されたら対象のHTTPS要求を再確認できます。

## 検証との境界

アプリの回帰検証はオフライン/HTTPスタブです。生成した新素材のデコードと状態連動はChromiumで確認しますが、実サービス疎通、iPhone WebKit、実音響・実機ウィジェットを確認したことにはなりません。
