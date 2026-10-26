// NERV-COMMAND v3.0 Phase 2 / Formal communications, NOT private conversation.
// Domain reducer only: v300 owns commandOperation, revisions, deduplication and event IDs.
(function initV301OfficialComms(){
 if(!window.NERV_COMMAND_V3)return;
 const MAX_REQUESTS=48,MAX_MESSAGES=64,MAX_LINKS=48;
 const clone=x=>JSON.parse(JSON.stringify(x));
 const contacts={
  hyuga:{name:'日向マコト',topics:['threat']},
  maya:{name:'伊吹マヤ',topics:['eva']},
  aoba:{name:'青葉シゲル',topics:['comms']},
  ritsuko:{name:'赤木リツコ',topics:['magi']},
  misato:{name:'葛城ミサト',topics:['orders']},
  rei:{name:'綾波レイ',unit:0,topics:['position','shutter-safety']},
  shinji:{name:'碇シンジ',unit:1,topics:['position','shutter-safety']},
  asuka:{name:'惣流・アスカ',unit:2,topics:['position','shutter-safety']}
 };
 const caseId=()=>S.defense?.caseNo>0?'CASE-'+S.defense.caseNo:null;
 // A schema-validated read-only snapshot; mutations occur only in the reducer.
 const state=()=>window.NERV_COMMAND_V3.snapshot();
 function message(k,from,to,text,transmission,priority='operations',delivery='delivered',emit){
  const e=emit('communication.issued',{from,to,priority,delivery},transmission.id);
  const m={id:'radio-'+e.id,caseId:e.caseId,eventId:e.id,orderId:transmission.id,
   sender:from,recipient:to,text:String(text).slice(0,200),
   channel:priority,at:e.at,read:false,delivery};
  k.communications.push(m);if(k.communications.length>MAX_MESSAGES)k.communications.shift();
  if(delivery==='delivered'&&S.world?.schema===1&&typeof worldCommunication==='function')
   worldCommunication(S.world,from,m.text,e.id);
  return m;
 }
 function validTopic(recipient,topic,sector){
  const p=contacts[recipient];if(!p||!p.topics.includes(topic))throw Error('担当外の照会です。通信先と業務を選択してください');
  if(topic==='shutter-safety'){
   if(!Number.isInteger(sector)||sector<0||sector>2)throw Error('確認する防衛区画を選択してください');
   if(p.unit!==S.tactics?.attacker)throw Error('射線確認は現在の攻撃担当パイロットへ送信してください');
   const pos=typeof tacticalState==='function'?tacticalState()?.pos:null;
   if(!pos||pos.row>2||pos.col!==sector)throw Error('現在のEVA射界に該当する防壁ではありません');
  }
  return p;
 }
 function report(t){
  const p=contacts[t.recipient],d=S.defense,unit=p.unit??S.tactics?.attacker??1;
  if(t.topic==='threat'){
   const plan=typeof tacticalState==='function'?tacticalState()?.enemyPlan:null;
   return {text:'CASE '+d.caseNo+'。波形解析 '+d.scans+'%、使徒耐久 '+(d.enemy?.hp??'未確認')+
    '。'+(d.scans>=34?'敵射界：'+(plan?.name||'解析済み'):'敵射界は未特定。追加MAGI解析を推奨。'),
    trusted:d.scans>=34};
  }
  if(t.topic==='eva'){
   const e=S.evas[unit]||{},damage=Number(e.tacticalIntegrity);
   return {text:'UNIT-0'+unit+' '+(e.state||'不明')+' / SYNC '+Number(e.sync||0).toFixed(1)+
    '% / 内部電源 '+(e.power??'--')+'秒'+(Number.isFinite(damage)?' / 健全性 '+damage+'%':'')+'。',trusted:true};
  }
  if(t.topic==='comms')
   return {text:'主電源 '+(S.infra.power?'正常':'障害')+'、回線 '+(S.infra.comms?'接続':'切断')+
     '。復旧後の保留送信は管制官の再送確認が必要です。',trusted:true};
  if(t.topic==='magi')
   return {text:'三基技術報告：'+((typeof worldMagiLimited==='function'&&worldMagiLimited())||
      (typeof magiIntrusionActive==='function'&&magiIntrusionActive())?'保留・侵入確認中。':'通常解析系は利用可能。')+
      '出撃の正式決議はMAGI側で照合してください。',trusted:true};
  if(t.topic==='orders'){
   const orders=S.commandV3?.orders?.filter(o=>o.caseId===t.caseId)||[];
   const current=orders.at(-1);
   return {text:current?'現在の上申 '+current.id+'：'+current.status+'。正式な承認・命令実行は作戦管制から行って。':
    '現時点で承認待ちの正式命令はありません。必要な上申を作成して。',trusted:true};
  }
  const e=S.evas[p.unit]||{},pos=typeof tacticalState==='function'?tacticalState()?.pos:null;
  if(t.topic==='position')
   return {text:'UNIT-0'+p.unit+' / '+(e.state||'待機')+'。'+
    (pos&&p.unit===S.tactics?.attacker?'配置 '+['西','中央','東'][pos.col]+'、距離 '+pos.row+'。':'現在の交戦配置は未確認。')+
    '指令を受領する準備を確認します。',trusted:e.state==='DEPLOYED'};
  const fresh=Number(t.round)===Number(d.round),same=pos?.col===t.sector&&pos?.row<=2&&p.unit===S.tactics?.attacker;
  const valid=fresh&&same&&e.state==='DEPLOYED';
  return {text:valid?
    'UNIT-0'+p.unit+'。'+['西','中央','東'][t.sector]+'区画の防壁展開を確認。射線が遮られた場合は再配置指示に従います。':
    '配置または作戦ターンが変更されています。現在の射線を再照会してください。',trusted:valid};
 }
 function mutation(k,kind,payload,emit){
  if(!caseId()||S.defense.status!=='active')throw Error('進行中の使徒迎撃作戦が必要です');
  const requests=k.transmissions??(k.transmissions=[]),links=k.links??(k.links=[]),id=payload?.transmissionId;
  if(kind==='comms.request'){
   const recipient=payload?.recipient,topic=payload?.topic,sector=payload?.sector;
   const p=validTopic(recipient,topic,sector);
   const existing=requests.find(x=>x.caseId===caseId()&&x.recipient===recipient&&x.topic===topic&&
    (topic!=='shutter-safety'||x.sector===sector)&&['queued','awaiting_reply','replied'].includes(x.status));
   if(existing)throw Error('同じ案件が未確認です。返信・受領を完了してください');
   const t={id:'tx-'+(++k.sequence),caseId:caseId(),recipient,topic,
    sector:topic==='shutter-safety'?sector:null,unit:p.unit??null,round:S.defense.round,
    status:S.infra.comms?'awaiting_reply':'queued',createdAt:Date.now(),replyId:null};
   requests.push(t);if(requests.length>MAX_REQUESTS)requests.shift();
   emit('communication.requested',{recipient,topic,queued:t.status==='queued'},t.id);
   message(k,'管制官 / C-3',p.name,'業務照会：'+topic+
    (t.sector!==null?' / '+['西','中央','東'][t.sector]+'区画':''),t,'official',
    S.infra.comms?'delivered':'queued',emit);
   return {status:t.status,transmissionId:t.id,message:t.status==='queued'?'回線断。送信を保留しました':'照会を送信。返信待ち'};
  }
  if(kind==='comms.flush'){
   if(!S.infra.comms)throw Error('通信回線が切断されています。復旧後に再送してください');
   const waiting=requests.filter(t=>t.caseId===caseId()&&t.status==='queued');
   if(!waiting.length)throw Error('再送待ち通信はありません');
   for(const t of waiting){
    if(t.topic==='shutter-safety'&&Number(t.round)!==Number(S.defense.round)){
     t.status='stale';emit('communication.expired',{topic:t.topic},t.id);continue;
    }
    t.status='awaiting_reply';
    for(const m of k.communications)if(m.orderId===t.id&&m.delivery==='queued'){
     m.delivery='delivered';if(S.world?.schema===1&&typeof worldCommunication==='function')
      worldCommunication(S.world,m.sender,m.text,m.eventId);
    }
    emit('communication.delivered',{recipient:t.recipient},t.id);
   }
   return {status:'delivered',count:waiting.length,message:'通信を再送・期限照合しました'};
  }
  const t=requests.find(x=>x.id===id&&x.caseId===caseId());
  if(!t)throw Error('現在の作戦に一致する通信案件がありません');
  if(kind==='comms.reply'){
   if(!S.infra.comms)throw Error('通信切断中。返信を受信できません');
   if(t.status!=='awaiting_reply')throw Error('返信待ち状態ではありません');
   const r=report(t);
   t.status='replied';t.trusted=r.trusted;t.replyAt=Date.now();t.replyTurn=S.defense.round;
   const m=message(k,contacts[t.recipient].name,'管制官 / C-3',r.text,t,
    r.trusted?'operations':'emergency','delivered',emit);
   t.replyId=m.id;
   emit(t.recipient==='shinji'||t.recipient==='rei'||t.recipient==='asuka'?
    'pilot.report.received':'staff.report.received',{recipient:t.recipient,topic:t.topic,trusted:r.trusted},t.id);
   return {status:t.status,transmissionId:t.id,message:r.text,trusted:r.trusted};
  }
  if(kind==='comms.acknowledge'){
   if(t.status!=='replied')throw Error('受領できる返信がありません');
   const reply=k.communications.find(m=>m.id===t.replyId);
   if(!reply||reply.delivery!=='delivered')throw Error('通信記録が一致しません');
   reply.read=true;t.status='acknowledged';t.ackAt=Date.now();
   if(t.topic==='shutter-safety'&&t.trusted===true&&t.round===S.defense.round){
    links.push({caseId:t.caseId,sector:t.sector,unit:t.unit,round:t.round,
     topic:'shutter-safety',status:'acknowledged',transmissionId:t.id,at:Date.now()});
    if(links.length>MAX_LINKS)links.shift();
   }
   emit('communication.acknowledged',{recipient:t.recipient,topic:t.topic,trusted:t.trusted},t.id);
   return {status:t.status,transmissionId:t.id,message:'受領確認を記録。正式な作戦判断へ反映しました'};
  }
  throw Error('未対応の通信処理です');
 }
 // Official radio actions share the v300 command/save/rollback gateway.
 window.NERV_COMMAND_V3.registerKinds(
  ['comms.request','comms.flush','comms.reply','comms.acknowledge'],mutation);
 function read(){
  try{
   const k=state(false),p=window.NERV_COMMAND_V3.read();
   if(p.blocked)return {blocked:true,error:p.error};
   return {...p,contacts:clone(contacts),transmissions:clone((k?.transmissions||[]).filter(t=>t.caseId===caseId()).slice(-18)),
    links:clone((k?.links||[]).filter(l=>l.caseId===caseId()).slice(-12)),
    queued:(k?.transmissions||[]).filter(t=>t.caseId===caseId()&&t.status==='queued').length,
    operationalMessages:clone((k?.communications||[]).filter(m=>m.caseId===caseId()&&m.recipient).slice(-20))};
  }catch(error){return {blocked:true,error:error.message}};
 }
 window.NERV_OPS_COMMS={phase:'P2',dispatch:window.NERV_COMMAND_V3.dispatch,read,contacts,snapshot:()=>state(),
  metadata:{schema:1,transactions:'shared-commandOperation',privateChatUnaffected:true,noTimers:true}};
})();
