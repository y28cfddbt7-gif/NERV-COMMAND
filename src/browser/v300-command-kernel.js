// NERV-COMMAND 3.0 / Phase 1: transaction-backed command kernel.
// v2.33 remains the canonical owner of combat, facility, MAGI and EVA state.
// This is NOT a second rules engine: all real resource mutations delegate to v2.33.
(function initV300Kernel(){
 const VERSION=1, MAX_EVENTS=128, MAX_COMMANDS=160, MAX_MESSAGES=64;
 const copy=x=>JSON.parse(JSON.stringify(x));
 const validId=s=>typeof s==='string'&&/^[a-zA-Z0-9_.:-]{1,80}$/.test(s);
 const isObject=x=>x&&typeof x==='object'&&!Array.isArray(x);
 const safe=t=>String(t||'').slice(0,180);
 function root(create=false){
  const p=S.commandV3;
  if(p===undefined||p===null){
   if(!create)return null;
   S.commandV3={schema:VERSION,revision:0,sequence:0,activeCaseId:null,cases:[],orders:[],events:[],commands:[],
    communications:[],migration:{from:'v2.33',status:'adapted'}};
  }
  const k=S.commandV3;
  if(!isObject(k)||k.schema!==VERSION||!Number.isSafeInteger(k.revision)||k.revision<0||
    !Number.isSafeInteger(k.sequence)||k.sequence<0||
    !['cases','orders','events','commands','communications'].every(t=>Array.isArray(k[t])))
   throw Error('未知または破損した作戦エンジン保存形式です。上書きせず復旧してください。');
  return k;
 }
 const caseId=()=>S.defense?.caseNo>0?'CASE-'+S.defense.caseNo:null;
 const eventId=(k)=>'evt-'+(++k.sequence);
 function logEvent(k,type,details,orderId=null){
  const e={id:eventId(k),caseId:caseId(),kind:type,orderId,payload:copy(details||{}),tick:S.world?.tick??0,
   at:Date.now()};
  k.events.push(e);if(k.events.length>MAX_EVENTS)k.events.shift();
  return e;
 }
 function radio(k,sender,text,orderId=null,priority='operations'){
  const e=logEvent(k,'communication.issued',{sender,priority},orderId);
  const msg={id:'radio-'+e.id,caseId:e.caseId,eventId:e.id,orderId,sender,text:safe(text),
   channel:priority,at:e.at,read:false};
  k.communications.push(msg);if(k.communications.length>MAX_MESSAGES)k.communications.shift();
  if(S.world?.schema===1&&typeof worldCommunication==='function'){
   worldCommunication(S.world,sender,msg.text,e.id);
  }
  return msg;
 }
 function observed(){
  const d=S.defense||{},t=typeof tacticalState==='function'?tacticalState():null;
  const col=t?.pos?.col,row=t?.pos?.row;
  const b=typeof consoleBattle==='function'?(()=>{try{return consoleBattle();}catch(_){return null}})():null;
  const active=d.status==='active';
  const los=active&&t&&row<=2&&[0,1,2].includes(col)&&!!d.city?.[col]?.armor;
  const phase=!active?(d.status==='victory'||d.status==='defeat'?'afterAction':'idle'):
   b?.stage==='field'?'battle':b?.stage==='placement'?'launch.deploy':b?.stage==='approval'?'launch.review':d.scans>=34?'analysis':'contact';
  return {caseId:caseId(),phase,status:d.status||'idle',tick:S.world?.tick??0,
   selected:Number(d.selected??1),energy:d.energy??0,parts:d.parts??0,
   scans:d.scans??0,power:S.infra?.power===true,comms:S.infra?.comms===true,
   magiHold:typeof worldMagiLimited==='function'&&worldMagiLimited(),
   intrusion:typeof magiIntrusionActive==='function'&&magiIntrusionActive(),
   securityHold:typeof securityHold==='function'&&securityHold(),
   losBlocked:!!los,losSector:los?col:null,unit:S.tactics?.attacker??1,
   ap:b?.ap??null,enemyHp:d.enemy?.hp??null,
   city:(d.city||[]).map(c=>({hp:c.hp,armor:!!c.armor,turret:!!c.turret}))};
 }
 function canOperate(o){
  if(o.status!=='active')throw Error('進行中の作戦がありません。新規作戦を開始してください。');
  if(!o.power||!o.comms)throw Error('主電源と作戦通信を復旧してください。');
  if(o.magiHold||o.intrusion||o.securityHold)throw Error('MAGI・保安の保留を先に解消してください。');
 }
 function ensureCase(k,o){
  if(!o.caseId)throw Error('有効な使徒迎撃CASEがありません。');
  k.activeCaseId=o.caseId;
  let c=k.cases.find(x=>x.id===o.caseId);
  if(!c){c={id:o.caseId,legacyCaseNo:S.defense.caseNo,scenarioId:typeof currentAngel==='function'?currentAngel()?.id||'legacy':'legacy',
   createdAt:Date.now(),phase:o.phase};k.cases.push(c);if(k.cases.length>20)k.cases.shift();
   logEvent(k,'operation.linked',{scenario:c.scenarioId});}
  c.phase=o.phase;c.updatedAt=Date.now();return c;
 }
 function latest(k,sector){
  return [...k.orders].reverse().find(x=>x.caseId===caseId()&&x.kind==='city.shutter'&&x.targetId==='sector-'+sector&&
   ['requested','authorized','executed'].includes(x.status));
 }
 function evaluate(order,o){
  const sector=order.sector,c=o.city[sector];
  if(!c)return {approved:false,reason:'施設区画を確認してください。'};
  if(o.scans<34)return {approved:false,reason:'使徒の波形解析が未完了'};
  if(c.hp<15)return {approved:false,reason:'施設損傷が深刻。修復を優先'};
  if(c.armor)return {approved:false,reason:'防壁はすでに展開中'};
  if(o.energy<12)return {approved:false,reason:'防壁展開に必要な電力が不足'};
  return {approved:true,reason:sector===o.unit&&o.phase==='battle'?
   '射線に影響する。配置変更か防壁解除を条件に承認':'都市保護を優先。展開を承認'};
 }
 function mutation(k,kind,payload){
  const o=observed(),sector=Number(payload?.sector),orderId=payload?.orderId;
  const sectorOK=Number.isInteger(sector)&&sector>=0&&sector<=2;
  if(kind==='analysis.request'){
   canOperate(o);if(o.scans>=100)throw Error('解析は完了しています');
   if(o.energy<12)throw Error('MAGI解析に必要な電力12が不足');
   const before=S.defense.scans;
   v27Scan();if(S.defense.scans<=before)throw Error('波形解析を実行できませんでした');
   ensureCase(k,o);const e=logEvent(k,'analysis.completed',{before,scans:S.defense.scans,power:S.defense.energy});
   radio(k,'日向マコト / 戦況情報','使徒波形の解析率 '+S.defense.scans+'%。進路と交戦条件を更新します。');
   return {eventId:e.id,status:'executed',message:'MAGI波形解析 '+S.defense.scans+'%'};
  }
  if(kind==='city.shutter.request'){
   canOperate(o);if(!sectorOK)throw Error('西・中央・東の区画を選択してください');
   if(o.scans<34)throw Error('先に使徒の波形を一度解析してください');
   if(o.city[sector]?.armor)throw Error('対象区画の防壁は展開済みです');
   if(latest(k,sector))throw Error('同区画の上申が進行中です。重複申請できません');
   ensureCase(k,o);
   const id='order-'+(++k.sequence);
   const order={id,caseId:o.caseId,kind:'city.shutter',targetId:'sector-'+sector,sector,
    requester:'operator-C3',authority:'misato',status:'requested',createdAt:Date.now(),revision:k.revision};
   k.orders.push(order);if(k.orders.length>64)k.orders.shift();
   logEvent(k,'order.requested',{sector,authority:'misato'},id);
   radio(k,'管制官 / C-3',['西','中央','東'][sector]+'区画の防壁展開を葛城一尉に上申。',id);
   return {orderId:id,status:'requested',message:'上申を記録。指揮官回答を照合してください'};
  }
  if(kind==='city.shutter.review'){
   canOperate(o);
   const order=k.orders.find(x=>x.id===orderId&&x.caseId===o.caseId);
   if(!order||order.kind!=='city.shutter'||order.status!=='requested')throw Error('審議待ちの正式命令がありません');
   const review=evaluate(order,o);
   order.status=review.approved?'authorized':'denied';
   order.review={by:'misato',source:'local-rule-simulation',approved:review.approved,
    reason:review.reason,at:Date.now()};
   logEvent(k,review.approved?'order.authorized':'order.denied',{sector:order.sector,reason:review.reason},order.id);
   radio(k,'葛城ミサト / 作戦指揮',review.reason,order.id,review.approved?'operations':'emergency');
   return {orderId:order.id,status:order.status,message:review.reason};
  }
  if(kind==='city.shutter.execute'){
   canOperate(o);
   const order=k.orders.find(x=>x.id===orderId&&x.caseId===o.caseId);
   if(!order||order.kind!=='city.shutter'||order.status!=='authorized'||order.review?.approved!==true)throw Error('未承認または期限切れの命令です');
   if(o.city[order.sector]?.armor)throw Error('既に防壁が展開されています');
   if(o.energy<12||o.city[order.sector]?.hp<=0)throw Error('電力・防壁健全性を再照合してください');
   S.defense.selected=order.sector;
   const before=S.defense.energy;
   v27Armor(); // Preserve legacy authoritative energy spend, log and animation.
   if(!S.defense.city[order.sector].armor||S.defense.energy!==before-12)throw Error('防壁命令の検証に失敗。保存を取り消します');
   order.status='executed';order.executedAt=Date.now();
   const e=logEvent(k,'facility.shutter.closed',{sector:order.sector,energy:S.defense.energy},order.id);
   const now=observed();
   radio(k,'日向マコト / 戦況情報',['西','中央','東'][order.sector]+'区画の防壁が展開。使徒進路と射線を再照合します。',order.id);
   if(now.losBlocked){
    logEvent(k,'eva.line.blocked',{unit:now.unit,col:now.losSector},order.id);
    radio(k,['綾波レイ','碇シンジ','惣流・アスカ'][now.unit]+' / EVA',
     '防壁によって射線が遮られています。移動または防壁解除の指示をお願いします。',order.id,'emergency');
   }
   return {eventId:e.id,orderId:order.id,status:'executed',message:'防壁を展開。都市電力 -12'};
  }
  if(kind==='city.shutter.release'){
   canOperate(o);
   if(!sectorOK||!o.city[sector]?.armor)throw Error('対象の防壁は展開されていません');
   const order=latest(k,sector);
   if(!order||order.status!=='executed')throw Error('共通作戦エンジンが承認した防壁のみ解除できます');
   S.defense.city[sector].armor=false;
   v27Record(['西','中央','東'][sector]+'区画 / 戦術射線確保のため防壁開放');
   order.status='released';order.releasedAt=Date.now();
   const e=logEvent(k,'facility.shutter.opened',{sector,cityHp:S.defense.city[sector].hp},order.id);
   radio(k,'日向マコト / 戦況情報','防壁開放を確認。都市防護は低下し、EVAの射線は回復します。',order.id);
   return {eventId:e.id,orderId:order.id,status:'executed',message:'防壁開放。都市防護が低下'};
  }
  throw Error('未対応の命令種別です。');
 }
 async function dispatch(input){
  try{
   if(!staffWorldReady)throw Error('作戦データの引継ぎが完了していません');
   if(!isObject(input)||!validId(input.commandId)||input.actorId!=='operator-C3'||
      !['analysis.request','city.shutter.request','city.shutter.review',
        'city.shutter.execute','city.shutter.release'].includes(input.kind))
    throw Error('命令ID・権限または操作種別が不正です。');
   if(input.caseId!==caseId()||!input.caseId)throw Error('現在のCASEが一致しません。');
   const previous=root(false),already=previous?.commands.find(x=>x.commandId===input.commandId);
   if(already)return {ok:true,duplicate:true,...copy(already.result),revision:previous.revision};
   if(previous&&input.expectedRevision!==undefined&&input.expectedRevision!==previous.revision)
    throw Error('作戦状況が更新されています。再照合してください。');
   let result=null;
   const tx=await commandOperation(()=>{
    const k=root(true);if(input.expectedRevision!==undefined&&input.expectedRevision!==k.revision)
      throw Error('作戦状況が更新されています。再照合してください。');
    if(k.commands.some(x=>x.commandId===input.commandId))throw Error('処理済みの命令です');
    result=mutation(k,input.kind,input.payload||{});
    k.revision++;
    k.commands.push({commandId:input.commandId,kind:input.kind,caseId:input.caseId,result:copy(result)});
    if(k.commands.length>MAX_COMMANDS)k.commands.shift();
   });
   if(!tx.ok)return tx;
   const final=root(false);
   window.dispatchEvent(new CustomEvent('nerv-command-v3',{detail:{kind:input.kind,
     caseId:caseId(),revision:final.revision,status:result.status}}));
   return {ok:true,...copy(result),revision:final.revision};
  }catch(e){return {ok:false,error:e.message};}
 }
 function read(){
  try{
   const k=root(false),o=observed(),orders=k?.orders.filter(x=>x.caseId===o.caseId)||[],
    messages=k?.communications.filter(x=>x.caseId===o.caseId)||[];
   return {schema:VERSION,ready:!!staffWorldReady,revision:k?.revision??0,
    ...o,orders:copy(orders.slice(-15)),messages:copy(messages.slice(-12)),
    eventCount:k?.events.length??0,blocked:false};
  }catch(error){return {blocked:true,ready:false,error:error.message};}
 }
 // Real tactical line-of-sight consequence for the phase-one authorized shutter.
 // Old v2.33 has no extra cost when it is not a v3 authorized facility.
 if(typeof tacticalFireErrors==='function'){
  const previousFireErrors=tacticalFireErrors;
  tacticalFireErrors=function(){
   const errors=previousFireErrors();
   try{const o=observed(),k=root(false);if(o.losBlocked&&
     k?.orders.some(x=>x.caseId===o.caseId&&x.status==='executed'&&x.sector===o.losSector)&&
     ['rifle','positron'].includes(armamentSelected))
      errors.push('防壁が射線を遮蔽。EVA移動か都市防壁解除を指示');
   }catch(_){}
   return errors;
  };
 }
 window.NERV_COMMAND_V3={phase:'P1',dispatch,read,snapshot:()=>copy(root(false)),contract:{
  authority:'operator-C3',simulatedCommander:'misato',persistent:true,canonical:'legacy-state-adapter',
  ownRAF:false,ownTimers:false,originalArtworkUnchanged:true}};
})();
