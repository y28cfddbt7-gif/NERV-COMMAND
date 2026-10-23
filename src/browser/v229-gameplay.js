// v2.29 / Actual incident decisions and responsive tactical AI.
// The original approved, launch, battle and save engine is retained.
function initV229Gameplay(){
 if(typeof consoleBattle!=='function'||typeof tacticalPlan!=='function')return;
 const kinds=[
  {id:'power',title:'CATAPULT / 系統電圧不安定',text:'カタパルトへの供給電圧が不安定。予備回線を使うか、危険を承知で発進を急ぐか。',
   options:[['reserve','予備送電に切り替え','都市電力 -10 / 機体保護'],['manual','手動で電圧を調整','都市電力 -4 / MAGI解析 -8'],['rush','強行発進を許可','機体健全性 -12 / 敵が接近']]},
  {id:'comms',title:'COMMAND LINK / 発進通信遅延',text:'司令系統と射出盤の応答がずれている。再送・直接確認・待機のどれを選ぶか。',
   options:[['relay','副回線で再送','都市電力 -7 / 解析 +8'],['manual','管制官が直接照合','解析 -16 / 同期率 +2'],['hold','安全確認まで待機','敵が接近 / 解析 +12']]},
  {id:'sync',title:'SYNCHRONIZATION / 神経接続偏差',text:'パイロットの同期波形に偏差。調整を優先するか、機体を保護するか、早期発進するか。',
   options:[['recalibrate','再同期を実施','都市電力 -12 / 同期率 +8'],['stabilize','保護シーケンスを優先','敵が接近 / 健全性 +6'],['rush','緊急接続で発進','同期率 -7 / 敵距離 +1']]}
 ];
 const ids=kinds.map(x=>x.id);
 function get(){
  const p=S.operatorConsole?.incidentV229;
  if(!p||p.caseNo!==S.defense.caseNo||p.unit!==S.tactics.attacker)return null;
  validate(p);return p;
 }
 function validate(p){
  if(!p||p.schema!==1||!ids.includes(p.kind)||!['pending','resolved'].includes(p.status)||
     !Number.isInteger(p.caseNo)||![0,1,2].includes(p.unit)||
     (p.status==='resolved'&&!kinds.find(x=>x.id===p.kind).options.some(x=>x[0]===p.choice))||
     (p.status==='pending'&&p.choice!==null))throw Error('v2.29発進記録に整合しない情報があります。既存のセーブは変更していません。');
 }
 function incidentFor(caseNo,unit){
  const angel=currentAngel()?.id||'sachiel',code=angel==='ramiel'?2:angel==='shamshel'?1:0;
  return kinds[(caseNo+unit+code)%3];
 }
 function onStart(){
  const b=consoleBattle();if(!b)return;
  const root=consoleRoot(true),kind=incidentFor(S.defense.caseNo,b.unit);
  root.incidentV229={schema:1,caseNo:S.defense.caseNo,unit:b.unit,kind:kind.id,status:'pending',choice:null};
  const t=tacticalState();if(t){t.v229Enabled=true;t.v229Decoy=null;t.enemyPlan=tacticalPlan(t);}
  consoleRecord('sortie','管制異常報告 / '+kind.title+' / 対処指令待ち');
 }
 function beforeNext(){
  const p=get();if(p?.status==='pending')throw Error('発進異常が未処理です。三つの対処方法から判断して確定してください。');
 }
 function applyResponse(choice){
  const b=consoleBattle(),p=get();
  if(!b||b.stage!=='approval'||S.defense.status!=='active')throw Error('発進承認中の案件を選択してください。');
  if(!p||p.status!=='pending')throw Error('未処理の発進異常がありません。');
  const kind=kinds.find(x=>x.id===p.kind);
  if(!kind.options.some(x=>x[0]===choice))throw Error('この異常には使用できない対処法です。');
  const d=S.defense,e=S.evas[b.unit];
  const consume=n=>{if(d.energy<n)throw Error('都市電力 '+n+' が不足。別の対処を選択してください。');d.energy-=n;};
  const approach=()=>{if(d.enemy)d.enemy.dist=Math.max(0,(Number(d.enemy.dist)||0)-1);};
  const buffer=()=>{if(d.enemy)d.enemy.dist=Math.min(9,(Number(d.enemy.dist)||0)+1);};
  const integrity=delta=>{const n=Number.isFinite(e.tacticalIntegrity)?e.tacticalIntegrity:100;e.tacticalIntegrity=Math.max(1,Math.min(100,n+delta));};
  const sync=delta=>{e.sync=Math.max(0,Math.min(100,(Number(e.sync)||0)+delta));};
  const intel=delta=>{d.scans=Math.max(0,Math.min(100,(Number(d.scans)||0)+delta));};
  if(p.kind==='power'){
   if(choice==='reserve')consume(10);
   else if(choice==='manual'){consume(4);intel(-8);}
   else if(choice==='rush'){integrity(-12);approach();}
  }else if(p.kind==='comms'){
   if(choice==='relay'){consume(7);intel(8);}
   else if(choice==='manual'){intel(-16);sync(2);}
   else if(choice==='hold'){approach();intel(12);}
  }else if(p.kind==='sync'){
   if(choice==='recalibrate'){consume(12);sync(8);}
   else if(choice==='stabilize'){approach();integrity(6);}
   else if(choice==='rush'){sync(-7);buffer();}
  }
  p.choice=choice;p.status='resolved';
  consoleRecord('sortie','異常対処完了 / '+kind.title+' / '+kind.options.find(x=>x[0]===choice)[1]);
  return {title:kind.title,choice,energy:d.energy,distance:d.enemy?.dist,integrity:e.tacticalIntegrity,sync:e.sync};
 }
 // Called through the current bounded, save-backed commandOperation implementation.
 async function resolve(choice){
  const result=await commandOperation(()=>applyResponse(choice));
  return result;
 }
 const previousPlan=tacticalPlan;
 tacticalPlan=function(t){
  const base=previousPlan(t);
  if(!t?.v229Enabled||S.defense.status!=='active')return base;
  const step=S.defense.round+1,angel=currentAngel()?.id;
  // Deterministic, saved turn/case driven enemy planning. Telegraph remains
  // stable until the enemy turn, except when player deliberately deploys a decoy.
  const target=t.v229Decoy?.round===step?t.v229Decoy.col:
   (S.defense.caseNo+step)%3===0?(t.pos.col+1)%3:
   (S.defense.caseNo+step)%3===1?(t.pos.col+2)%3:t.pos.col;
  const cols=angel==='shamshel'?[target,(target+1)%3]:[target];
  return {round:step,columns:cols,rows:angel==='ramiel'?[1,2,3]:[1,2],
   name:(angel==='ramiel'?'加粒子砲':angel==='shamshel'?'光鞭':'接近侵攻')+' / '+(t.v229Decoy?.round===step?'陽動地点を追尾':'移動目標を予測')};
 };
 function action(order,b){
  const t=tacticalState();if(!b||b.stage!=='field'||!t||!t.v229Enabled)throw Error('新戦術指令を実行できる作戦がありません。');
  if(b.ap<1)throw Error('行動力が足りません。');
  if(tacticalReady().length)throw Error(tacticalReady().join(' / '));
  const d=S.defense,e=S.evas[t.unit];
  const energy=n=>{if(d.energy<n)throw Error('都市電力 '+n+' が必要です。');d.energy-=n;};
  if(order==='recon'){
   energy(9);d.scans=Math.min(100,(Number(d.scans)||0)+18);
   t.v229ReconRound=d.round+1;v27Record('MAGI先行解析 / 解析率 +18 / 電力 -9');
  }else if(order==='feint'){
   energy(7);
   const col=(t.pos.col+1+(d.round%2))%3;
   t.v229Decoy={round:d.round+1,col};
   t.enemyPlan=tacticalPlan(t);
   v27Record('陽動地点 '+['WEST','CENTRAL','EAST'][col]+' / 敵射界を変更 / 電力 -7');
  }else if(order==='fortify'){
   energy(7);e.at=true;t.guardUntil=d.round+1;
   v27Record('局地A.T.防御を起動 / 機体の次回被害を軽減 / 電力 -7');
  }else throw Error('未対応の戦術命令です');
 }
 function kind(){const p=get();return p?kinds.find(x=>x.id===p.kind):null;}
 window.NERV_GAME_V229={version:'2.29',get,kind,onStart,beforeNext,resolve,action,
  snapshot:()=>({case:S.defense.caseNo,incident:get()?{...get()}:null,enemyPlan:tacticalState()?.enemyPlan||null})};
}
initV229Gameplay();
