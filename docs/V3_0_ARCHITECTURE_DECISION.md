# NERV-COMMAND v3.0 / 統合管制アーキテクチャ確定仕様
Status: **ARCHITECTURE APPROVED FOR IMPLEMENTATION** (design only; NO v3.0 code has shipped).
Baseline: GitHub branch \`feature/v2-33-navigation-city-commands\` (2.33, 102 browser modules including vendored libraries, 41 CSS modules).
Design branch: \`design/v3-0-unified-operations\`.
Purpose: NERV職員が「監視→報告→解析→承認→指令→結果確認」を遂行する運用シミュレーター。
Non-goals: EVAを直接歩行操作するアクションゲーム、戦闘リプレイ、存在しないリアル計測の捏造、低品質な描画への退行。

## 1. 確定する4ワークステーション
1. **ホーム / DUTY**: 警戒区分・担当案件・未読通信・勤務開始・実生活ユーティリティ入口。実際の天気・カレンダー・時計・電池・端末設定をサブに維持。
2. **統合作戦管制 / OPERATIONS**: ONE primary job in ONE page. [平時監視→接敵→発進(準備/審議/射出)→戦闘(戦術/照準)→事後報告・復旧] の状態依存ビューを切り替える。都市設備、EVA機体、武装、損害、電源、発進、補給、敵の経路は全てここから案件に関連づけて扱う。モードは別々の独立大画面を意味しない。
3. **MAGI**: 三基の本体図を主役に、測定、意見・根拠、解析の信頼性、技術保守、侵入対応、正式審議。
4. **通信 / COMMS**: 作戦にひもづく案件・報告、相手別通信、パイロットの返答、業務引継ぎ。緊急通信は他ワークステーションの小さな受信帯にも表示し、開くと元の案件に戻れる。
常時ナビは4項目だけ。すべてからホームへ復帰可能。実用系と閲覧履歴は「ホーム > ユーティリティ」配下。既存の古いページは移行中だけ互換ルートを持つ。新サブ画面を増やさない。

## 2. 現行コード資産の統廃合台帳（実測ソース）
### KEEP: Domain / Engine [ゲームルールを保持し依存だけ剥離]
- \`src/browser/city-defense.js\`: 防壁・迎撃砲・修理・電力・被害・ターンの実ルール。
- \`src/browser/v215-angel-engine.js\`: サキエル/シャムシエル/ラミエルの特性・遭遇条件。
- \`src/browser/v217-tactical-engine.js\`, \`src/browser/v219-console-engine.js\`: 3×3射界・AP・配置・武装・承認・戦闘命令の実処理。
- \`src/browser/v229-gameplay.js\`: 発進異常の分岐と先行解析/陽動/防御の実ルール。
- \`src/browser/v228-sortie-tactics.js\` **内の finalize/保存検証だけ**: 発進時の補正は実ルールなので \`domain/sortie.js\` に抜き出す。v228の画面そのものは移さない。
- \`src/browser/magi.js\`, \`src/browser/v219-console-engine.js\` のMAGI部, \`src/browser/magi-intrusion.js\`, \`src/browser/v215-world-engine.js\`: 合議・異常・信頼性の真実のソースを一本化。
- \`src/browser/staff-world.js\`, \`src/browser/world-workflow.js\`, \`src/browser/v214-security-engine.js\`, \`src/browser/v215-security-engine.js\`: 勤務イベント、保安/冷却/侵入を domain の独立 reducer として維持。
- \`src/browser/v213-personas.js\`, \`src/browser/v213-conversation.js\`, \`src/browser/v223-dialogue.js\`: 人物性格・言葉遣い・記憶の資産として維持。正式操作はここで直接行わない。
- \`src/browser/v212-messages.js\`, \`src/browser/duty-dispatch.js\`, \`src/browser/personnel-services.js\`: 通信履歴・受命/証拠/完了報告を COMMS/operation inbox に吸収。重複リスナーは廃止。
- \`src/browser/state.js\`, \`src/browser/persistence-guard.js\`, \`src/browser/state-safeguard.js\`, \`src/browser/native-bridge.js\`, \`src/browser/v2261-audio-recovery.js\`: セーブ/復旧/Scriptableブリッジ/音声は互換を厳守。
- \`src/browser/v215-motion.js\` と \`src/vendor/animejs-4.5.0.umd.min.js\`: 有界のアニメーション管理を維持。
- \`assets/**\` の既存高品質画像: byte-for-byte不変。元素材を圧縮・再生成・低解像度化しない。

### MERGE: 同じ意味の複数実装を一箇所にまとめてから撤去
- 画面/ナビ: \`mobile-views.js\`, \`navigation.js\`, \`v219-navigation.js\`, \`v220-terminal-ui.js\` → \`ui/shell.js\` & \`ui/router.js\`。
- 複数の戦術/作戦表示: \`v215-battle-ui.js\`, \`v216-battle-screen.js\`, \`v217-tactical-ui.js\`, \`v219-battle-ui.js\`, \`v228-sortie-tactics.js\` のDOM → \`ui/stations/operations.js\`。
- 都市表示: \`v215-city.js\`, \`v216-city-stage.js\`, \`v218-city-art.js\`, \`v233-city-commands.js\` のUI → \`ui/components/city-map.js\` + \`ui/components/facility-actions.js\`。**画像レイヤーそのものは保持**。
- 発進 UI: \`v229-gameplay-ui.js\`, \`v230-compact-battle.js\`, \`v232-five-station.js\` の発進・戦闘ナビ → 操作状況に応じた \`ui/components/launch-sequence.js\`。
- 作戦関連の端末画面と人物通信: \`v213-message-ui.js\`, \`v215-comms.js\`, \`v223-workspace.js\` → \`ui/stations/comms.js\`。
- 旧コードで \`draw\`, \`worldAdvance\`, \`tacticalPlan\`, \`v27Advance\`, \`mobileNavigate\` を関数再代入する拡張は優先的に統合し、次の版では単一の処理入口へ移管する。

### RETIRE AFTER PARITY: 削除してよいのは中身の依存を切った後
- \`v221-drama-ui.js\`, \`v222-interface.js\`, \`v224-command-dynamics.js\`, \`v225-tactical-motion.js\`, \`v226-context-stations.js\`, \`v227-cinematic-stations.js\` の重複装飾パネル。
- \`v231-unified-workstation.js\`, \`v232-boot.js\`, \`v232-five-station.js\`, \`v233-city-commands.js\` の上書きレイヤー（UIを置換した後）。
- \`v228-sortie-tactics.js\` と \`v229-gameplay-ui.js\` の廃止は「発進時の実ルール抽出」と「事前異常選択UIの移行」後のみ。
- \`src/styles/v221-*.css\`～\`v233-*.css\` は依存CSSを棚卸して \`ui/tokens.css\`, \`ui/layout.css\`, \`ui/stations/*.css\` に整理。色・アートの基準は保持。
**実削除は使用箇所検索・代替実装・旧セーブ/機能テスト合格後に実施。モジュール数の削減自体は目的としない。**

## 3. 単一の共通作戦エンジン (Command Kernel)
目標コード構造:
- \`domain/operation.js\`: 統合案件、フェーズ、資源、施設、EVA、使徒と状態検証。
- \`domain/rules/{city,sortie,combat,magi,staff}.js\`: 純粋な判定・状態更新。
- \`domain/orders.js\`: 依頼/上申/承認/正式実行の判定。
- \`domain/events.js\`: 順序付き、保存可能、冪等なドメインイベント生成。
- \`domain/comms.js\`: report/thread/message/choices、人物ごとの知識・意図・口調。ゲーム効果は command bus を経由。
- \`services/transaction.js\`: 唯一の read-validate-reduce-commit-persist 境界。Scriptable bridgeに接続。
- \`services/clock.js\`: ゲームターンと既存world.tickの整合。UIのアニメーション時間でルールを進めない。
- \`services/read-model.js\`: 画面共通の派生情報。各ビューが独自に真偽を推定しない。
- \`ui/stations/{home,operations,magi,comms}.js\`, \`ui/components/{city-map,launch-sequence,battle-map,pilot-link}.js\`。

### データのルール
最初の移行版は既存 \`S\` を唯一の正（canonical）とし、\`S.commandV3\` に schema:1 の「案件・命令・イベント・通信参照」だけを**追加**。既存 \`S.defense, S.evas, S.magi, S.infra, S.world, S.personalMessages, S.operatorConsole\` を同時に複製して真実のデータを二重管理しない。Command Kernelは旧 reducer を adapter で一箇所から呼ぶ。旧コードから読み書きする箇所がゼロになった時だけ、スナップショットと検証済みの原子的マイグレーションで \`S.commandV3\` の完全所有へ切り替える。

\`S.commandV3\` 初期の最小例:
\`\`\`js
{
  schema: 1,
  revision: 0,
  activeCaseId: null,
  cases: [],
  orders: [],
  events: [],
  communications: [],
  lastProcessedEventId: null,
  migration: { from: 'v2.33', status: 'adapted' }
}
\`\`\`
casesのレコード: \`{id, legacyCaseNo, scenarioId, phase, createdAt, updatedAt, assignedUnit, objectives, alert}\`。
orders: \`{id, caseId, kind, requester, authority, approval, status, payload, expectedRevision, createdAt, resolvedAt, resultEventIds}\`。
events: \`{id, sequence, caseId, kind, origin, sourceOrderId, payload, tick, visibility, createdAt}\`。
communications: \`{id, eventId, orderId, caseId, sender, recipient, channel, priority, text, choices, deliveredAt, ackAt}\`。
実際の評価は S の真実から導出し、伝達文字列を canonical state として扱わない。イベント/案件/送信先のIDとフェーズを厳格に検証。

### 唯一の命令入口
\`\`\`js
await dispatchCommand({
  commandId, caseId, actorId: 'operator-C3',
  kind, targetId, payload, expectedRevision
});
\`\`\`
内部の順序:
1. commandId重複を排除 (再送は同一結果)、case/権限/進行phase/電力/通信/資源/情報鮮度/対象状態を検証。
2. 権限が不要なら既存ドメイン reducer へ。承認が必要なら order:requested を保存して保留し、勝手には実行しない。
3. 承認通知 (authorize) が届いた場合のみ同一注文IDに基づき実行。命令リプレイ時に二重課金しない。
4. state + event + order status を一つの \`commandOperation\` 相当の保存トランザクション内で確定。失敗なら rollback。
5. 確定後のイベントを購読者へ配信。MAGI計算、人物報告、都市/戦闘の表示は派生read-modelを再描画。
6. 外部AIや通信文生成は保存後のread-modelを説明するのみで権限や戦闘数値を直接変更しない。

## 4. 本物の指揮系統と通信の分離
チャンネル:
- \`official\`: 正式命令、上申、承認。ログと権限確認必須。
- \`operations\`: 日向の索敵/進路報告、青葉の通信監視、マヤの技術診断、ミサトの作戦指揮、パイロットの作戦報告。
- \`personal\`: 休憩中の私的会話。従来の記憶・人物表現を維持。ここで正式命令/承認/損害を直接書き換えることは禁止。
- \`emergency\`: 割り込み優先。再送/既読/確認期限を保存し、回線断なら pending queue へ。

人物/役割/裁量:
- オペレーター C-3: 観測・技術照会・委任範囲内の設備命令、上申・再照会、承認済み作戦の実行管理。
- 葛城ミサト: 作戦変更、出撃/迎撃の重要承認。権限の根拠は event/order として保存。単なるセリフで承認としない。
- 赤木リツコ: MAGI/機体の技術再照合と保守復旧承認。
- 日向マコト: 戦術監視、索敵情報、敵進路と異常の報告。
- 青葉シゲル: 通信状況と回線切替の情報。
- 伊吹マヤ: シンクロ率/機体健全性/技術的異常の報告。
- パイロット (零/初/弐): 現場報告、命令受領・確認・保留・実行結果。性格と負担により応答・信頼性・遅延が変化する。**勝手に命令を実行しない**。

通信→実処理の確定例:
1. 日向の \`angel.track.detected\` → eventに観測元/信頼度/情報tick。
2. オペレーター \`request.magi.analysis\` → MAGI解析に電力/AP/所要turnを払い、結果を event。
3. ミサトへ \`propose.city.shutter\` → \`order:requested\`。
4. ミサト \`order.authorized\` → C-3が \`execute.city.shutter\` を押して初めて設備変更。
5. shutter後、使徒進路/射線/EVAの移動条件の再評価 → 日向とパイロットの報告更新。
6. 報告既読/未読/応答待ちは本当の業務状態として蓄積。作戦の勝敗と区別する。

現状の \`v212-messages.js\` は「Private, local conversations. No network chat service, authority changes or combat rewards」と明記される。これを破らず、正式な作戦通信レイヤーを別チャンネルとして加える。\`duty-dispatch.js\` の受命→確認→完了を正式作戦へ接続する。外部LLMは任意、オフライン固定シナリオだけでも成立し、LLM出力からゲーム状態を直接更新しない。

### セリフ品質基準
人物別の機密/職務/発話形式、場面変化、直近の報告、既に知っている事実、状況の緊急性から選ぶ。イベントIDを条件とした少なくとも複数の言い回しを保持し、重複を抑制。未発生の観測や承認、実行を「確認済み」と言わせない。NPCの曖昧な個人会話は作戦指示の代わりにならない。

## 5. 連携の必須イベント契約
A. \`angel.detected\` → CITY threat marker / MAGI scan request / 日向 emergency。
B. \`analysis.completed\` → 敵の進路・脅威評価更新 / MAGI三基報告 / ミサトへ提案可能に。
C. \`facility.shutter.closed\` → 市街ダメージ軽減だけでなく使徒進路・EVA射界の再計算 / パイロットの射線障害報告。
D. \`power.bus.reallocated\` → 都市設備 / EVA電源 / MAGI解析枠へ一度だけ反映し、旧認可無効化。
E. \`sortie.authorized\` → 条件付き射出可能、発進位置・武装・同期状態を戦闘へ引き継ぎ。
F. \`pilot.report.received\` → 観測情報の確度・命令確認状態を更新 (雑談は報酬なし)。
G. \`comms.link.lost\` → 遠隔指令はpending・確認遅延、再接続後に重複なしで配達。必要なら手動運用。
H. \`battle.phase.advanced\` → 敵予告射界/設備ダメージ/通信ログ/MAGI分析を同一CASE・TURNで更新。
I. \`operation.closed\` → 損害・補給・職員報告・次勤務へ移行。戦闘リプレイなし。

## 6. モードと段階の状態機械
- alert = \`normal | watch | emergency\` (UIの赤化だけでなく使用可能権限/通信優先度/設備制限に反映)。
- operation phase = \`idle -> contact -> analysis -> launch.prepare -> launch.review -> launch.deploy -> battle.tactical/battle.aim -> afterAction -> recovery -> idle\`。
- \`battle.tactical\` と \`battle.aim\` は表示モードでありセーブ上はbattle一フェーズ。画面遷移でAP消費/戦闘ターンの進行なし。
- 発進3段階は「機体準備 / 出撃審議 / 射出実行」。既存の正式MAGI判定が未承認なら次段階不可。
- 環境異常 (電力/MAGI/通信) はparallel flags; 進行ゲートの理由と代替運用をread-modelに列挙し、ゲーム攻略不能なdeadlockを作らない。

## 7. 描画とユーザー操作の契約
- NERV高品質画像は原版を使用。戦闘 = 原画+大きな操作可能マップ、MAGI = 大きな三基、都市 = 混雑していない大きなマップ、EVA = 画面を分割せず原画優先。
- 1ページ1主役、常設アクションは3〜5個、状態帯は1本、タップ領域44pt相当以上、指示への反応は300ms以内を目標 (実機測定)。
- 通信の緊急帯は縮小表示 (未読件数/送信者/要点)。タップで同じ案件の該当通信を開く。各画面から1タップでホームへ。
- Scriptableが描くClose/ShareはiOS側のネイティブUIであり、消せる前提にしない。safe-areaを実測して上部に食い込ませない。
- Anime.js v4: 既存 \`NERV_MOTION\` 経由の bounded animation だけ。通常は一部稼働(レーダー/回線)、事件中は段階連動(approval/lock-on)、非常時のみ同期警報。無限重複 RAF/強制60fps/不必要な更新は不可。
- WebAudio復帰は既存 \`v2261-audio-recovery.js\` を保護。iOSバックグラウンド復帰の再同期を試験。

## 8. データ移行と互換方針
- 2.33全状態の深いコピーとハッシュのバックアップを作成するまで移行処理をしない。
- \`S.commandV3\` が無ければ schema1 のみ新設する。無効/未知の将来schemaは**読み取り専用で停止**、黙ってデータを上書きしない。
- adapter段階は旧リデューサのみがcity/eva/magi/worldを更新。画面はread-modelから参照する。保存は唯一のtransactionから行い、ロールバック時にSとイベントログが矛盾しない。
- v3正式更新後にv2.33へ戻して既存データを上書きしないよう、Scriptableは**別スクリプト/別保存識別子または互換性保護ガード**を採用。
- 移行試験ケース: 未作戦/発進承認前/戦闘中/設備損傷/通信未返信/MAGI侵入中/通信断/電源断/既存3機の整備状態。
- duplicate commandId、古いcaseId、古いexpectedRevision、連続タップ、通信再送、アプリ強制終了、無音復帰を検証。
- 原画像・ライブラリSHA-256一致、旧作戦結果の再現、現実ユーティリティのデータ源維持をrelease gateにする。

## 9. フェーズ別開発と合格基準
**Phase 0 — Freeze & inventory:** v2.33正常版、原画SHA、全画面導線、状態と命令の棚卸し。DOM/JS依存一覧、互換バックアップと旧テストを固定。画面追加しない。
**Phase 1 — Command Kernel:** 単一dispatch、domain adapters、schema検証、event log、read model、発進/戦闘/都市資源のテスト。旧UIで挙動同等かを検証。
**Phase 2 — COMMS & AUTHORITY:** 独立の業務通信/私信、承認、報告、パイロット受信確認、通信切断・復旧時の保留、人物ごとの応答。イベントが実際の作戦判断に影響する。
**Phase 3 — Four-station UI:** 旧パネルを新UIへ移植し、4画面以外は補助機能へ。原画像のフル品質、マップ優先、大きなEVA、MAGI三基、受信帯。旧UIの依存を切ったものから削除。
**Phase 4 — Scenario & polish:** 最小1本の縦断シナリオを全経路で検証し、サキエル/シャムシエル/ラミエルの固有戦術に拡張。性能、アニメ、音、旧セーブの回帰テストと実機確認。

### 必須の最初の縦断シナリオ (acceptance)
サキエル検知 -> 日向報告 -> MAGI解析 -> ミサトへ東部防壁の承認申請 -> 防壁展開 -> 敵移動/初号機の射線変化 -> パイロットから射線障害報告 -> 移動か防壁解除の判断 -> 戦闘 -> 損害報告 -> 次勤務。**上記が同一CASEの保存イベントとして再起動後も繋がって初めてv3.0と呼ぶ。**

### 納品ルール
各実装マイルストーンで \`Scriptable\` に貼れる自己完結の**完全版JavaScript** (\`.js\` + 同一内容 \`.txt\`) と小型起動スクリプト、必要な画像/ライブラリ配置、テスト結果、残課題を納品。差分だけでは完了扱いにしない。

## 10. 決定事項と変更管理
この設計の変更は ADR 文書で明記し、画面を増やす提案は「既存4画面のどの操作に統合できないか」を立証すること。ゲームエンジンの単一ソース化、命令権限、人物通信の真実性、元画像保護、データ互換を必須条件とする。
