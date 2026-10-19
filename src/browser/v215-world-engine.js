// Shared, persisted pacing and MAGI maintenance. All numerical rules are original simulation.
function worldPacing(state=S){
 const mode=['quiet','balanced','exercise'].includes(state.prefs?.eventPace)?state.prefs.eventPace:'balanced';
 return {mode,...({quiet:{securityFirst:80,securityInterval:120,magiFirst:90,magiInterval:150,jobTicks:60,radio:900000,idle:900000,idleLoad:-1},balanced:{securityFirst:40,securityInterval:60,magiFirst:60,magiInterval:90,jobTicks:40,radio:600000,idle:600000,idleLoad:-1},exercise:{securityFirst:6,securityInterval:10,magiFirst:20,magiInterval:30,jobTicks:10,radio:90000,idle:90000,idleLoad:2}}[mode])};
}
function worldCoolingReady(state){return state.world.tick>=(state.world.pacing?.nextCoolingTick||0)&&!state.world.magiOps?.active;}
const magiFaultKinds={clock:{title:'MAGI三基の時刻同期ずれ',label:'CLOCK / QUORUM',contact:'maya'},checksum:{title:'解析資料の整合性不一致',label:'ARCHIVE / CHECKSUM',contact:'ritsuko'},power:{title:'MAGI給電バスのノイズ',label:'POWER / REDUNDANCY',contact:'aoba'}};
function magiOpsDefault(tick,state=S){return {schema:1,sequence:0,auto:state.prefs?.magiFaultAuto!==false,nextDueTick:tick+worldPacing(state).magiFirst,active:null,archive:[]};}
function magiOpsNormalize(raw,tick){
 if(Number(raw?.schema)>1)return {future:true};const s=worldObject(raw)?worldClone(raw):{},d=magiOpsDefault(tick),a=s.active;
 const value={...d,...s,schema:1,sequence:Math.floor(worldBound(s.sequence,0,1e9,0)),nextDueTick:Math.floor(worldBound(s.nextDueTick,0,1e9,d.nextDueTick)),auto:s.auto!==false&&S.prefs.magiFaultAuto!==false,archive:Array.isArray(s.archive)?s.archive.filter(x=>worldObject(x)&&magiFaultKinds[x.kind]&&typeof x.id==='string').slice(0,6):[],active:null};
 if(a&&magiFaultKinds[a.kind]&&typeof a.id==='string'&&['detected','diagnosing','work','validated','reported'].includes(a.stage)){
  value.active={...a,createdTick:Math.floor(worldBound(a.createdTick,0,1e9,tick)),adjustments:[0,1,2].map(i=>Math.round(worldBound(a.adjustments?.[i],-8,8,0))),offsets:[0,1,2].map(i=>Math.round(worldBound(a.offsets?.[i],-6,6,[0,4,-3][i]))),feeds:[0,1,2].map(i=>a.feeds?.[i]!==false),damagedBus:Math.floor(worldBound(a.damagedBus,0,2,1)),inspected:[...new Set((Array.isArray(a.inspected)?a.inspected:[]).filter(i=>[0,1,2].includes(i)))],selectedCopy:[0,1,2].includes(a.selectedCopy)?a.selectedCopy:null};
  if(['diagnosing','reported'].includes(a.stage)&&!Number.isFinite(a.dueTick))value.active.stage=a.stage==='reported'?'validated':'detected';
 }
 return {value,repaired:JSON.stringify(raw)!==JSON.stringify(value)};
}
const v215PriorWorldNormalize=worldNormalize;
worldNormalize=function(raw,now){
 if(Number(raw?.pacing?.schema)>1||Number(raw?.magiOps?.schema)>1||Number(raw?.angels?.schema)>1)return {future:true};
 const result=v215PriorWorldNormalize(raw,now);if(result.future)return result;const w=result.world,oldPacing=JSON.stringify(w.pacing),oldAngels=JSON.stringify(w.angels),cfg=worldPacing(),m=magiOpsNormalize(w.magiOps,w.tick);if(m.future)return {future:true};
 if(!w.pacing||w.pacing.version!==215){w.pacing={...w.pacing,schema:1,version:215,startedAt:now,nextCoolingTick:w.tick};if(w.nextInspectionTick<w.tick+cfg.jobTicks)w.nextInspectionTick=w.tick+cfg.jobTicks;result.repaired=true;}
 w.pacing.nextCoolingTick=Math.floor(worldBound(w.pacing.nextCoolingTick,0,1e9,w.tick));w.pacing.startedAt=worldBound(w.pacing.startedAt,1,1e15,now);
 w.magiOps=m.value;result.repaired=result.repaired||m.repaired;
 const a=worldObject(w.angels)?w.angels:{};
 w.angels={...a,schema:1,auto:a.auto!==false,sequence:Math.floor(worldBound(a.sequence,0,1e9,0)),nextDueTick:Math.floor(worldBound(a.nextDueTick,0,1e9,w.tick+120)),history:Array.isArray(a.history)?a.history.filter(x=>worldObject(x)&&typeof x.id==='string').slice(0,6):[],active:a.active&&['sachiel','shamshel','ramiel'].includes(a.active.id)&&Number.isInteger(a.active.caseNo)?a.active:null};
 result.repaired=result.repaired||oldPacing!==JSON.stringify(w.pacing)||oldAngels!==JSON.stringify(w.angels);return result;
};
function magiOpsStart(state,kind,tick){
 const s=state.world.magiOps;if(s.active)throw Error('対応中のMAGI保守を先に引き継いでください');
 const keys=Object.keys(magiFaultKinds);kind=magiFaultKinds[kind]?kind:keys[s.sequence%keys.length];s.sequence++;
 s.active={id:'MAGI-OPS-'+s.sequence,kind,stage:'detected',createdTick:tick,adjustments:[0,0,0],offsets:[0,4,-3],feeds:[true,true,true],damagedBus:s.sequence%3,inspected:[],selectedCopy:null,feedback:'独立診断で原因と対象を確かめてください。'};
 worldLog(state.world,'MAGI保守受付',magiFaultKinds[kind].title+'。三基の通常審議を保留しました。',s.active.id);
 worldCommunication(state.world,'伊吹マヤ / 技術局',magiFaultKinds[kind].title+'を検出。MAGI保守盤で独立診断を依頼してください。',s.active.id);
 if(state===S){cancelSequence();staffInvalidateDecision();}
}
const v215PriorObserve=worldObserve;
worldObserve=function(state){const o=v215PriorObserve(state),a=state.world?.magiOps?.active;if(a){o.magiFault={id:a.id,kind:a.kind,title:magiFaultKinds[a.kind]?.title||'MAGI保守',stage:a.stage};o.magiHold=true;o.magi=o.magiFault.title+' / 保守確認待ち';o.alert='非常';}else o.magiFault=null;return o;};
function magiOpsTick(state,tick){
 const s=state.world.magiOps;if(!s)return;const a=s.active;
 if(!a){if(s.auto&&tick>=s.nextDueTick&&state.infra.power&&state.infra.comms&&!state.world.security?.case&&!worldActiveIncident(state.world)&&state.defense.status!=='active'&&!v215PriorObserve(state).intrusion)magiOpsStart(state,null,tick);return;}
 const sys=v215PriorObserve(state);if(!sys.power||!sys.comms||sys.intrusion||sys.magiHold)return;
 if(a.stage==='diagnosing'&&tick>=a.dueTick){a.stage='work';a.feedback='診断結果を確認し、保守盤で基準値へ合わせてください。';worldLog(state.world,'MAGI独立診断',magiFaultKinds[a.kind].title+'：保守対象を特定しました。',a.id);}
 if(a.stage==='reported'&&tick>=a.dueTick){a.stage='resolved';a.resolvedTick=tick;a.authorizedBy='赤木リツコ / 技術開発部';s.archive.unshift(worldClone(a));s.archive=s.archive.slice(0,6);s.active=null;s.nextDueTick=tick+worldPacing(state).magiInterval;worldLog(state.world,'MAGI復旧承認',magiFaultKinds[a.kind].title+'：技術部が復旧を承認。通常審議は再申請してください。',a.id);worldCommunication(state.world,'赤木リツコ / 技術開発部','照合結果を受領。三基の通常運用を再開するわ。',a.id);}
}
const v215PriorAdvance=worldAdvance;
worldAdvance=function(state,now){const before=state.world?.tick||0,changed=v215PriorAdvance(state,now);if(state.world?.magiOps)for(let t=before+1;t<=state.world.tick;t++)magiOpsTick(state,t);return changed;};
const v215PriorDispatch=worldDispatch;
worldDispatch=function(state,action){
 if(action==='pace.quiet'||action==='pace.balanced'||action==='pace.exercise'){
  state.prefs.eventPace=action.split('.')[1];const cfg=worldPacing(state),w=state.world;
  if(w.security&&!w.security.case)w.security.nextDueTick=w.tick+cfg.securityFirst;if(!w.magiOps.active)w.magiOps.nextDueTick=w.tick+cfg.magiFirst;w.nextInspectionTick=w.tick+cfg.jobTicks;worldLog(w,'勤務間隔','発生頻度を '+cfg.mode+' に変更。未処理案件は保持しました。');return;
 }
 if(!action.startsWith('magiops.'))return v215PriorDispatch(state,action);
 const w=state.world,s=w.magiOps,[,op,key,value]=action.split('.');
 if(op==='toggle'){s.auto=!s.auto;state.prefs.magiFaultAuto=s.auto;s.nextDueTick=w.tick+worldPacing(state).magiFirst;return;}
 if(op==='start'){if(!magiFaultKinds[key])throw Error('障害系統を選択してください');if(v215PriorObserve(state).intrusion||worldActiveIncident(w))throw Error('進行中のMAGI侵入・冷却異常を先に引き継いでください');magiOpsStart(state,key,w.tick);return;}
 const a=s.active;if(!a)throw Error('対応中のMAGI保守はありません');const sys=v215PriorObserve(state);if(!sys.power||!sys.comms||sys.intrusion||sys.magiHold)throw Error('主電源・通信と既存のMAGI侵入/冷却対応を確認してください');
 if(op==='diagnose'){if(a.stage!=='detected')throw Error('独立診断は受付後に一度だけ依頼できます');a.stage='diagnosing';a.dueTick=w.tick+1;}
 else if(['adjust','feed','inspect','copy'].includes(op)){
  if(a.stage!=='work')throw Error('独立診断の完了を待ってください');const index=Number(key);if(![0,1,2].includes(index))throw Error('対象の三基/系統を選んでください');
  if(op==='adjust'){const n=Number(value);if(a.kind!=='clock'||!Number.isInteger(n)||Math.abs(n)>8)throw Error('補正範囲は−8～+8 msです');a.adjustments[index]=n;}
  if(op==='feed'){if(a.kind!=='power')throw Error('給電バスの案件ではありません');a.feeds[index]=!a.feeds[index];}
  if(op==='inspect'){if(a.kind!=='checksum')throw Error('資料照合の案件ではありません');if(!a.inspected.includes(index))a.inspected.push(index);}
  if(op==='copy'){if(a.kind!=='checksum'||!a.inspected.includes(index))throw Error('原本と照合してから複製元を指定してください');a.selectedCopy=index;}
 }else if(op==='validate'){
  if(a.stage!=='work')throw Error('保守盤を確認してください');
  const correct=a.kind==='clock'?a.offsets.every((n,i)=>n+a.adjustments[i]===0):a.kind==='power'?!a.feeds[a.damagedBus]&&a.feeds.filter(Boolean).length>=2:a.inspected.length===3&&[0,1].includes(a.selectedCopy);
  a.feedback=correct?'独立照合が成立。技術部へ上申できます。':'基準値と一致しません。診断記録と現在の設定を見比べてください。';if(correct)a.stage='validated';
 }else if(op==='report'){if(a.stage!=='validated')throw Error('独立照合を先に完了してください');a.stage='reported';a.dueTick=w.tick+1;}
 else throw Error('許可された保守操作ではありません');
 worldLog(w,'MAGI保守処理',a.id+' / '+op+(key?' / '+key:'')+(a.stage==='validated'?' / 独立照合成立':''),a.id);
};
