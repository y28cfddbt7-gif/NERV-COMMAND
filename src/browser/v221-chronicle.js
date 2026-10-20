// Original, state-driven radio writing. Canon references and local game values stay separate.
const angelDossiers={
 sachiel:{number:3,name:'サキエル',episode:'第壱話・第弐話',title:'使徒、襲来 / 見知らぬ、天井',form:'白い仮面、骨質の肩部、赤いコアを持つ長身の人型。',lore:'TV版で第3新東京市へ最初に襲来する使徒。A.T.フィールドとコアの存在が、対使徒戦の重要な要素となる。',simulation:'この演習では、予告された接近射界を避け、中和の有効時間と接近経路を管理する。'},
 shamshel:{number:4,name:'シャムシェル',episode:'第参話',title:'鳴らない、電話',form:'頭足類を思わせる胴体と、左右に伸びる光の鞭。',lore:'TV版の第4使徒。長い胴体と光の鞭が特徴で、人型とは異なる輪郭を持つ。',simulation:'この演習では二列を薙ぐ攻撃予告を確認。遮蔽・守備と接近の順番を選び、射界内に居続けない。'},
 ramiel:{number:5,name:'ラミエル',episode:'第伍話・第六話',title:'レイ、心のむこうに / 決戦、第3新東京市',form:'青い正八面体の幾何学的な姿。',lore:'TV版の第5使徒。高出力の加粒子砲を備え、ヤシマ作戦での陽電子狙撃に結びつく。新劇場版の番号・可変形状とは区別する。',simulation:'ヤシマ作戦を参照した独自の単機演習。外部給電・充填・狙撃姿勢・照準を管理する。TV版の作戦そのものの再現ではない。'}
};
const chronicleBeats={
 detected:{title:'接近警報 / PATTERN WATCH',speaker:'aoba',text:()=> '地上監視に大型反応。目視情報を照合します。管制、発進手順の確認を。'},
 ready:{title:'搭乗信号を受領',speaker:'maya',text:a=>'UNIT-0'+a.unit+'、搭乗信号を確認。同期 '+a.sync.toFixed(1)+'%。照合データを送ります。'},
 approved:{title:'MAGI、出撃を承認',speaker:'misato',text:()=> '三基の承認を受領。配置と給電を確認して。急いでいても、そこは省略しないで。'},
 deployed:{title:'地上射出 / LIFT OFF',speaker:'pilot',text:a=>({0:'地上へ出るわ。機体信号は送っている。次の管制を待つ。',1:'地上に出ました。機体の位置、届いていますか。指示を確認します。',2:'地上へ出たわ。こっちは準備できてる。射界の報告、遅れないでよ。'}[a.unit])},
 identified:{title:'波形照合 / PATTERN BLUE',speaker:'ritsuko',text:a=>angelDossiers[a.angel].name+'の観測波形を照合。外見だけで判断せず、防御境界と射界を分けて見て。'},
 at:{title:'防御境界を展開',speaker:'pilot',text:a=>({0:'防御境界を展開する。機体の位置を見ていて。',1:'防御を展開しました。この位置で、攻撃の予告を確認します。',2:'防御境界、展開。あたしの位置と次の射界、ちゃんと合わせて。'}[a.unit])},
 neutralized:{title:'A.T.フィールド、中和',speaker:'ritsuko',text:()=> '敵側の防御境界に開口を確認。一時的なものよ。照準と承認を、いま照合して。'},
 charged:{title:'陽電子狙撃 / CHARGE READY',speaker:'hyuga',text:()=> '規定の充填を確認。送電系統を維持します。狙撃姿勢と照準の最終確認をお願いします。'},
 hit:{title:'有効打を観測',speaker:'maya',text:a=>'目標反応の低下を確認。残存値 '+a.hp+'。沈黙を確認するまで、監視を続けます。'},
 miss:{title:'射線を再照合',speaker:'hyuga',text:()=> '有効打を確認できません。残弾と照準を確認してください。次の敵射界も確認してください。'},
 damage:{title:'機体から損傷報告',speaker:'maya',text:a=>'UNIT-0'+a.unit+'、健全性 '+a.integrity+'%。損傷信号を受領。位置と防御を確認してください。'},
 evaded:{title:'予告射界を離脱',speaker:'misato',text:()=> '射界からの離脱を確認。その位置を次の一手につなげて。相手の予告は必ず更新して。'},
 critical:{title:'内部電源、残量警告',speaker:'maya',text:a=>'内部電源、残り '+Math.ceil(a.power)+'秒。接続可能なら外部給電を確認してください。'},
 victory:{title:'目標沈黙 / OPERATION CLOSED',speaker:'misato',text:()=> '目標の沈黙を確認。最後まで記録を残して。機体と街の被害確認、帰投の手順へ移るわよ。'},
 defeat:{title:'作戦中断 / RECOVERY PRIORITY',speaker:'fuyutsuki',text:()=> '記録を保全したまえ。失敗の報告も必要だ。機体の回収と被害確認を、手順どおりに進めよう。'}
};
function chronicleRead(create=false){
 const raw=S.chronicle;
 if(raw!==undefined&&(!worldObject(raw)||raw.schema!==1||!Array.isArray(raw.scenes)||raw.scenes.length>128||raw.scenes.some(r=>!worldObject(r)||!Object.prototype.hasOwnProperty.call(angelDossiers,r.angel)||!Object.prototype.hasOwnProperty.call(chronicleBeats,r.beat)||typeof r.id!=='string'||typeof r.caseKey!=='string'||typeof r.text!=='string'||typeof r.title!=='string'||r.text.length>500||r.title.length>120||r.id.length>160||r.caseKey.length>100||!Number.isFinite(r.at)||Math.abs(r.at)>8640000000000000||!Number.isInteger(r.caseNo)||r.caseNo<0||!Number.isInteger(r.round)||r.round<0||!['rei','shinji','asuka','misato','ritsuko','maya','hyuga','aoba','fuyutsuki'].includes(r.speaker)||![r.hp,r.power,r.integrity].every(Number.isFinite)||![0,1,2].includes(r.unit))))throw Error('未対応・破損した作戦記録を保護しています。追記と資料室の記録表示を停止しました。');
 if(!raw&&create)S.chronicle={schema:1,scenes:[]};return S.chronicle||{schema:1,scenes:[]};
}
function chronicleObserve(){
 if(!staffWorldReady)return null;const d=S.defense,a=S.world?.angels?.active;
 if(!a||a.caseNo!==d.caseNo||!angelDossiers[a.id])return null;
 const unit=S.tactics.attacker,e=S.evas[unit],c=evaCombatState(),t=S.evaCombat?.tactical;
 return {angel:a.id,caseKey:a.serial+':'+d.caseNo+':'+a.id,caseNo:d.caseNo,unit,round:d.round,status:d.status,state:e.state,approved:S.magi.approvedFor===unit,scans:d.scans,hp:d.enemy?.hp||0,power:Number(e.power)||0,sync:Number(e.sync)||0,integrity:e.tacticalIntegrity??100,external:evaExternalPower(unit),at:!!e.at,exposed:c.exposedUntil,charge:c.positronCharge||0,hits:t?.stats?.hits||0,misses:t?.stats?.misses||0,lastTurn:t?.lastTurn?{...t.lastTurn}:null,weapon:armamentSelected};
}
function chronicleChanges(before,a){
 if(!a)return [];if(!before||before.caseKey!==a.caseKey)return a.status==='active'?['detected']:[];
 const events=[];
 if(before.state!==a.state&&a.state==='READY')events.push('ready');
 if(!before.approved&&a.approved)events.push('approved');
 if(before.state!==a.state&&a.state==='DEPLOYED')events.push('deployed');
 if(before.scans<34&&a.scans>=34)events.push('identified');
 if(!before.at&&a.at)events.push('at');
 if(a.exposed>before.exposed)events.push('neutralized');
 if(before.charge<100&&a.charge>=100)events.push('charged');
 if(a.hits>before.hits)events.push('hit');if(a.misses>before.misses)events.push('miss');
 if(a.round>before.round&&a.lastTurn?.round===a.round)events.push(a.lastTurn.loss>0?'damage':'evaded');
 if(a.status==='active'&&a.state==='DEPLOYED'&&!a.external&&a.power<=60&&(before.power>60||before.state!=='DEPLOYED'))events.push('critical');
 if(before.status==='active'&&['victory','defeat'].includes(a.status))events.push(a.status);
 const priority=['evaded','damage','miss','hit','at','identified','neutralized','charged','ready','approved','deployed','critical','defeat','victory'];return events.sort((x,y)=>priority.indexOf(x)-priority.indexOf(y));
}
function chronicleRecord(before,after){
 const beats=chronicleChanges(before,after);if(!beats.length)return [];
 // An optional journal's future schema never overwrites data or blocks the core game.
 let root;try{root=chronicleRead(true);}catch(error){return [];}
 const created=[];for(const beat of beats){const id=after.caseKey+':'+beat;if(root.scenes.some(r=>r.id===id))continue;const definition=chronicleBeats[beat],speaker=definition.speaker==='pilot'?['rei','shinji','asuka'][after.unit]:definition.speaker;
  const record={id,caseKey:after.caseKey,caseNo:after.caseNo,angel:after.angel,beat,title:definition.title,text:definition.text(after),speaker,unit:after.unit,round:after.round,at:Date.now(),hp:after.hp,power:Math.ceil(after.power),integrity:after.integrity,weapon:after.weapon};root.scenes.unshift(record);created.push(record);
 }
 const cases=[...new Set(root.scenes.map(r=>r.caseKey))].slice(0,6);root.scenes=root.scenes.filter(r=>cases.includes(r.caseKey)).slice(0,96);return created;
}
const chroniclePriorOperation=commandOperation;
commandOperation=async function(change){
 let created=[];const result=await chroniclePriorOperation(()=>{const before=chronicleObserve();change();created=chronicleRecord(before,chronicleObserve());});
 if(result.ok&&created.length)window.dispatchEvent(new CustomEvent('nerv-chronicle',{detail:worldClone(created)}));
 return result;
};
window.NERV_CHRONICLE={snapshot:()=>{try{return {...worldClone(chronicleRead()),error:''};}catch(error){return {schema:null,scenes:[],error:error.message};}},dossiers:()=>worldClone(angelDossiers)};
