# v2.14 Web調査・画像の扱い

2026-10-18に取得。以下のEvaWikiは二次資料であり、公式設定資料そのものではありません。TV版・旧劇場版の人物役割を軸にし、台詞・事件・数値を公式のものと偽らない方針です。

| 取得資料 | 適用・区別 |
| --- | --- |
| [Evangelion Melee Weapons](https://wiki.evageeks.org/Evangelion_Melee_Weapons) | 高周波のプログレッシブナイフ。今回の形状はユーザー添付の赤いグリップを優先 |
| [Evangelion Ranged Weapons](https://wiki.evageeks.org/Evangelion_Ranged_Weapons) | パレット火器のSteyr ACRに似た構造、陽電子火器の複数形式を確認。白い二連円形部の陽電子銃はユーザー添付に基づく図で、TVの特定の全形式と同一とはしない |
| [第六話](https://wiki.evageeks.org/Episode_06) | 陽電子狙撃と外部電力の運用。既存の給電・充填・承認条件を維持 |
| [MAGI](https://wiki.evageeks.org/Magi) / [第拾参話](https://wiki.evageeks.org/Episode_13) | MELCHIOR-1＝科学者、BALTHASAR-2＝母、CASPER-3＝女。三基の合議・侵入対処と結ぶ。同Wikiの誤記注意を踏まえ、独自の波形や判定数値を設定資料として扱わない |
| [碇ゲンドウ](https://wiki.evageeks.org/Gendo_Ikari) / [冬月コウゾウ](https://wiki.evageeks.org/Kozo_Fuyutsuki) | 司令と副司令の役割、新規顔イラスト。既存五職員の顔を転用しない |
| [キール・ローレンツ](https://wiki.evageeks.org/Keel_Lorenz) / [SEELE](https://wiki.evageeks.org/Seele) | キールのバイザー、委員会とNERVの関係。私的な親密通信と区別する監査回線・モノリス表示 |
| [第拾壱話](https://wiki.evageeks.org/Episode_11) / [第弐拾壱話](https://wiki.evageeks.org/Episode_21) | 本部機能の停止や組織内の緊張を参照。今回の入退館・偽装指令・文書改ざんは独自の模擬事案。作中の実行者や黒幕を推定で断定しない |
| [Scriptable Keychain](https://docs.scriptable.app/keychain/) / [Request](https://docs.scriptable.app/request/) / [Alert](https://docs.scriptable.app/alert/) | 端末上のキー保管、POST/タイムアウト、安全なキー入力欄 |
| [OpenAI公式SDK Responses型](https://github.com/openai/openai-python/blob/main/src/openai/types/responses/response_create_params.py) / [Chat型](https://github.com/openai/openai-python/blob/main/src/openai/types/chat/completion_create_params.py) | 公式SDKソースをraw.githubusercontent.comから取得し、構造化出力・store・出力上限の形式を照合。実API疎通と全モデル互換性は別途実機で確認が必要 |

Bingでも兵装、MAGI、保安・SEELEの画像と設定の検索を実施しました。Web上の画像をそのまま配布物へ追加せず、新しい図を作成しています。固定のEVA・人物・司令部・ジオフロント・都市武装はそのまま保持します。

指定の[視覚効果サイト](https://visual-effects-index.my-project-hub99999.workers.dev/)およびOpenAI開発者ドキュメントのホストは、現在の環境ではプロキシのトンネル403で取得できませんでした。許可リストのドラフト追加は保存しましたが、取得可能になったとは報告しません。効果はユーザーが選んだSpatial Grid / Conic Portal / Wave Field / Layered Parallaxという名称をもとに独自実装。OpenAIの形式は上記の取得できた公式SDKで補いました。

全ての新規会話は人格・職務に基づくオリジナルの応答です。原作台詞の大量転用や、実行していない命令の完了を返す実装は避けています。
