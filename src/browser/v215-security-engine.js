// Field investigation is a spatial/logical task; legacy procedure drills remain available.
Object.assign(securityKinds,{
 relay:{title:'非正規中継器・盗聴回線の検知',zone:'整備通路 / 通信中継',contact:'aoba',evidence:[['signal','搬入口の波形記録'],['hop','中継ホップの記録'],['patrol','現地担当の照会']],findings:[['登録のない識別子が区画内へ移動しています。','中継先が認証済みの経路と一致しません。','巡回担当が無許可の中継機器を確認しました。'],['更新待ちの検査用識別子を確認しました。','中継経路は技術部の試験票と一致しています。','担当職員が認可済みの測定器と確認しました。']]},
 cargo:{title:'搬入物と運送記録の不一致',zone:'搬入口 / 送電区画',contact:'hyuga',evidence:[['ticket','搬入票の記録'],['transit','搬送経路の履歴'],['seal','現地封印の確認']],findings:[['搬入票に未登録の荷番号が含まれています。','許可区画と異なる場所へ搬送されています。','封印と送り状の番号が一致しません。'],['更新された荷番号が原票に記録されています。','搬送は当直が認可した経路です。','封印と原票が一致しています。']]},
 decoy:{title:'偽警報による管制誘導の疑惑',zone:'中央管制 / 監視網',contact:'maya',evidence:[['alarm','発報源の記録'],['route','転送経路の照合'],['sensor','独立した現地確認']],findings:[['登録外の発報源から警報が転送されています。','監視網の正規の経路と異なります。','独立確認では警報の対象物がありません。'],['認可済みの感知器試験が記録されています。','転送は正式な監視経路です。','独立確認で試験担当と一致しました。']]}
});
const fieldNodeNames=['搬入口','中央昇降路','整備通路','退避経路','文書庫','送電区画'];
const v215PriorSecurityDefaults=securityDefaults;
securityDefaults=function(tick){return {...v215PriorSecurityDefaults(tick),cadence:215,nextDueTick:tick+worldPacing().securityFirst};};
const v215PriorSecurityNormalize=securityNormalize;
securityNormalize=function(raw,tick){const r=v215PriorSecurityNormalize(raw,tick);if(r.future)return r;const s=r.value;if(raw?.cadence!==215){s.cadence=215;if(!s.case)s.nextDueTick=Math.max(s.nextDueTick,tick+worldPacing().securityFirst);r.repaired=true;}
 const a=s.case;if(a?.fieldwork){const f=a.fieldwork;if(Number(f.schema)>1)return {future:true};a.fieldwork={...f,schema:1,selected:Math.floor(worldBound(f.selected,0,5,0)),budget:Math.floor(worldBound(f.budget,0,16,12)),records:Array.isArray(f.records)?f.records.filter(x=>worldObject(x)&&['camera','trace','patrol'].includes(x.tool)&&[0,1,2,3,4,5].includes(x.node)).slice(-10):[],planned:Array.isArray(f.planned)?f.planned.filter(i=>[0,1,2,3,4,5].includes(i)).slice(0,3):[],gates:[...new Set((Array.isArray(f.gates)?f.gates:[]).filter(i=>[1,2,4,5].includes(i)))].slice(0,2),verified:!!f.verified,contained:!!f.contained,patrol:f.patrol&&[0,1,2,3,4,5].includes(f.patrol.node)&&Number.isFinite(f.patrol.dueTick)?f.patrol:null};}
 if(a?.fieldwork){const f=a.fieldwork,p=f.pendingResolution;f.pendingResolution=p&&['escort','handoff'].includes(p.op)&&Number.isFinite(p.dueTick)&&a.stage==='analyzed'?{op:p.op,dueTick:p.dueTick}:null;}r.repaired=r.repaired||JSON.stringify(raw)!==JSON.stringify(s);return r;};
function fieldRoute(c){return [0,c.variant===1?2:1,['sabotage','cargo','relay'].includes(c.kind)?5:4];}
const v215PriorNewCase=securityNewCase;
securityNewCase=function(state,kind,tick,training=false){v215PriorNewCase(state,kind,tick,training);const c=securityActive(state);if(!training){c.deadlineTick=tick+24;c.fieldwork={schema:1,selected:0,budget:12,records:[],planned:[],gates:[],verified:false,contained:false,patrol:null,pendingResolution:null,feedback:'搬入口の記録から対象の移動経路を調べてください。'};}};
function fieldRecord(state,c,tool,node){
 const f=c.fieldwork,r=fieldRoute(c),index=tool==='camera'?0:tool==='trace'?1:2,hit=node===r[index],label=securityKinds[c.kind].evidence[index][0];
 const text=hit?'T+'+(index*4+2)+' / '+fieldNodeNames[node]+(index<2?' → '+fieldNodeNames[r[index+1]]:' / '+(c.variant?'認証番号は正規':'認証番号の不一致を確認')):'該当する対象の記録はありません。';
 f.records.push({tool,node,at:state.world.tick,text,match:hit});f.records=f.records.slice(-10);if(hit&&!c.evidence.includes(label))c.evidence.push(label);if(['accepted','collecting'].includes(c.stage))c.stage='collecting';f.feedback=text;worldLog(state.world,'現場照会',c.id+' / '+tool+' / '+fieldNodeNames[node]+' / '+text,c.id);
}
const v215PriorSecurityTick=securityTick;
securityTick=function(state,tick){
 const s=state.world.security,c=s?.case;
 if(!c&&(state.world.magiOps?.active||worldActiveIncident(state.world)||state.defense.status==='active')){if(s&&s.nextDueTick<=tick)s.nextDueTick=tick+4;return;}
 if(c?.fieldwork?.patrol&&tick>=c.fieldwork.patrol.dueTick&&state.infra.comms){const node=c.fieldwork.patrol.node;c.fieldwork.patrol=null;fieldRecord(state,c,'patrol',node);}
 if(c?.stage==='analyzed'&&c?.fieldwork?.pendingResolution&&tick>=c.fieldwork.pendingResolution.dueTick&&state.infra.power&&state.infra.comms){const op=c.fieldwork.pendingResolution.op;c.fieldwork.pendingResolution=null;c.stage='decision';c.decision=op==='escort'?'release':'escalate';c.contained=op!=='escort';c.fieldwork.feedback=op==='escort'?'巡回担当が正規通行の同行確認を完了。副司令へ報告できます。':'保安担当が証拠保全と現場引継ぎを受領。副司令へ報告できます。';worldLog(state.world,'保安連携',c.id+' / '+c.fieldwork.feedback,c.id);}
 v215PriorSecurityTick(state,tick);
 if(c&&!s.case)s.nextDueTick=tick+worldPacing(state).securityInterval;
};
const v215PriorSecurityDispatch=worldDispatch;
worldDispatch=function(state,action){
 const [,op,key]=action.split('.');
 if(action.startsWith('security.operation.')){if(!securityKinds[key])throw Error('保安案件を選択してください');securityNewCase(state,key,state.world.tick,false);return;}
 const c=securityActive(state),f=c?.fieldwork;
 if(!action.startsWith('security.')||!f)return v215PriorSecurityDispatch(state,action);
 if(['escort','quarantine','handoff'].includes(op)){
  if(!state.infra.power||!state.infra.comms)throw Error('主電源・通信を復旧してください');if(f.pendingResolution||c.stage!=='analyzed'||!f.verified)throw Error('経路照合・MAGI解析を完了し、進行中の照会を待ってください');
  if(op==='quarantine'){if(!['audit','relay','decoy','sabotage'].includes(c.kind))throw Error('物理的な入退館・搬入は現場担当による確認が必要です');if(state.defense.energy<6)throw Error('独立回線への切替に電力6が必要です');state.defense.energy-=6;f.method='independent-record-quarantine';f.contained=true;c.contained=true;c.decision='hold';c.stage='decision';f.feedback='取得記録を保全し、問題の回線を独立経路へ隔離しました。副司令への報告が必要です。';}
  else{if(op==='escort'&&(!['access','cargo'].includes(c.kind)||c.variant!==1||f.gates.length))throw Error('正規通行と確認した物理案件で、経路が開放されている必要があります');if(f.budget<2)throw Error('担当部署への現場照会枠2が必要です');f.budget-=2;f.method=op==='escort'?'supervised-passage':'security-team-handoff';f.pendingResolution={op,dueTick:state.world.tick+(op==='escort'?1:2)};c.contained=true;f.feedback='現場担当へ依頼済み。'+(op==='escort'?'1':'2')+'更新後に受領確認が届きます。';}
  worldLog(state.world,'保安解決手配',c.id+' / '+f.method,c.id);return;
 }
 if(['node','camera','trace','patrol','route','resetRoute','verify','gate','seal'].includes(op)){
  if(!state.infra.power||!state.infra.comms)throw Error('電源と通信を復旧してください');if(['detected','reported','failed'].includes(c.stage))throw Error('案件受領後、正式報告の前に現場照会を行ってください');
  const n=Number(key);if(['node','route','gate'].includes(op)&&![0,1,2,3,4,5].includes(n))throw Error('区画を選んでください');
  if(op==='node')f.selected=n;
  if(['camera','trace','patrol'].includes(op)){
   if(!['accepted','collecting'].includes(c.stage))throw Error('現場照会は解析を依頼する前に実施してください');const cost=op==='patrol'?2:1;if(f.budget<cost)throw Error('照会枠を使い切りました。取得記録を保全して上級へ上申してください');if(op==='patrol'&&f.patrol)throw Error('巡回照会の返答を待ってください');f.budget-=cost;
   if(op==='patrol'){f.patrol={node:f.selected,dueTick:state.world.tick+1};f.feedback='巡回担当へ照会。次の30秒更新で確認が届きます。';}else fieldRecord(state,c,op,f.selected);
  }
  if(op==='route'){if(f.planned.length>=3)throw Error('経路を消去してから描き直してください');f.planned.push(n);f.verified=false;f.contained=false;}
  if(op==='resetRoute'){f.planned=[];f.verified=false;f.contained=false;}
  if(op==='verify'){const correct=c.evidence.length===3&&f.planned.join(',')===fieldRoute(c).join(',');f.verified=correct;f.feedback=correct?'時系列と経路が一致しました。MAGI照合と区画制御へ進めます。':'映像・回線・巡回の3記録を揃え、時系列に沿って3区画を接続してください。';}
  if(op==='gate'){if(![1,2,4,5].includes(n))throw Error('退避経路・搬入口の閉鎖権限はありません');if(f.gates.includes(n))f.gates=f.gates.filter(i=>i!==n);else{if(f.gates.length>=2)throw Error('同時保留は2区画までです');f.gates.push(n);}f.contained=false;}
  if(op==='seal'){if(!f.verified||c.stage!=='analyzed')throw Error('経路の独立照合とMAGI解析を先に完了してください');f.contained=f.gates.includes(fieldRoute(c)[2]);if(f.contained)f.method='local-sector-hold';f.feedback=f.contained?'対象の最終区画を一時保留。退避経路は開放を維持しています。':'記録が示す最終区画を保留してください。';}
  return;
 }
 if(op==='evidence')throw Error('現場捜査盤で映像・回線・巡回の記録を取得してください');
 if(op==='analyze'&&!f.verified)throw Error('現場記録3件と経路の独立照合が必要です');
 if(op==='hold'&&!f.contained)throw Error('区画制御盤で対象経路の保留を確認してください');
 if(op==='release'&&(!f.verified||f.gates.length))throw Error('経路を検証し、正規通行を妨げる区画保留を解除してください');
 return v215PriorSecurityDispatch(state,action);
};
