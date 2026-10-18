# v2.13 Web調査と実装の解釈

2026-10-18にBing検索3件と以下の本文13ページを実際に取得（HTTP 200）しました。取得内容の一部には新劇場版の記述も含まれるため、本実装ではTV版 / 旧劇場版の人物像を使い、惣流アスカ・NERV本部の所属を維持します。資料はファン編集の二次資料であり、台詞の再現精度や独自の権限区分を公式設定として保証するものではありません。

| 本文 | 反映した点 |
| --- | --- |
| [Shinji Ikari](https://wiki.evageeks.org/Shinji_Ikari) | 内向性、チェロ、パイロットと指揮系統の距離 |
| [Rei Ayanami](https://wiki.evageeks.org/Rei_Ayanami) | 寡黙さ、任務への姿勢。派生作品の明るい人物像を混ぜない |
| [Asuka Langley Soryu](https://wiki.evageeks.org/Asuka_Langley_Soryu) | 惣流の自信・競争心・評価への敏感さ |
| [Misato Katsuragi](https://wiki.evageeks.org/Misato_Katsuragi) | 戦術指揮、通常と非常時の切り替え、パイロットとの関係 |
| [Ritsuko Akagi](https://wiki.evageeks.org/Ritsuko_Akagi) | 技術部門・EVA/MAGI管理、猫とコーヒー |
| [Maya Ibuki](https://wiki.evageeks.org/Maya_Ibuki) | 技術監視とリツコの補佐、丁寧な応答 |
| [Makoto Hyuga](https://wiki.evageeks.org/Makoto_Hyuga) | 管制・作戦補佐。ミサトへの指揮系統を維持 |
| [Shigeru Aoba](https://wiki.evageeks.org/Shigeru_Aoba) | 通信・情報の管制、ギター |
| [Gendo Ikari](https://wiki.evageeks.org/Gendo_Ikari) | NERV司令、短い抑制的な応答、シンジとの距離 |
| [Kozo Fuyutsuki](https://wiki.evageeks.org/Kozo_Fuyutsuki) | 副司令・司令補佐、慎重な姿勢 |
| [Magi](https://wiki.evageeks.org/Magi) | 三基の異なる人格と合議。実装済み666との連携を維持 |
| [Episode 06](https://wiki.evageeks.org/Episode_06) | 陽電子狙撃と送電の関係。既存の独自戦闘計算は変えない |
| [Entry Plug](https://wiki.evageeks.org/Entry_Plug) | 搭乗用プラグとEVA運用の位置付け |

検索語：`Evangelion Gendo Ikari Fuyutsuki Nerv commander TV personality`、`Evangelion communication Shinji Rei Asuka Soryu Misato Ritsuko Maya Hyuga Aoba`、`Evangelion positron rifle progressive knife entry plug design`。

通信文は全て本アプリ独自の文章です。原作の台詞集を取り込んでいません。人格の口調・一人称は人物像からの演出的解釈であり、会話の全状況で原作と同じ心理を再現する主張ではありません。管制補助C-3、会話記憶の上限、親しさ、クールダウン、警戒時の雑談保留、データ開示範囲は独自のシミュレーション設計です。機密を話さないことと、原作上知っていないことを混同しないよう、司令にも本端末へ開示できる情報だけを返す境界を設けました。

装備の形状は今回のユーザー添付3点を優先し、白灰のポジトロン本体・暗赤色グリップのナイフ・白橙のプラグを独自の概略SVGにしました。公式の特定製品モデルやTV登場モデルを精密復元したものではありません。検索画像は新たに転載せず、固定済みの全画像と都市武装をそのまま利用しています。新規2人の顔を推測で既存の顔へ割り当てず、職務識別章で表示しました。
