// NERV-COMMAND 3.1 - ONE operation surface.
// All critical commands stay on battle/*, no route to infra/magi/messages.
// Reuses real v2.33/v3 command and communications reducers. Zero game timers/RAF.
(function initV310IntegratedOperations(){
 if(!window.NERV_MOBILE||!window.NERV_COMMAND_V3||!window.NERV_OPS_COMMS)return;
 const $=id=>document.getElementById(id), kernel=window.NERV_COMMAND_V3,radio=window.NERV_OPS_COMMS;
 const stats={version:'3.1',routes:0,actions:0,draws:0,failures:0,ownRAF:false,ownTimers:false};
 const page=document.querySelector('.page[data-page="battle"]');if(!page)return;
 const station=document.createElement('section');station.id='v310Operations';station.setAttribute('aria-label','統合作戦管制');
 station.innerHTML='<div class="v310-status"><strong id="v310Phase">OPERATIONS / STANDBY</strong>'+
  '<span id="v310Telemetry">UNIT — · AP — · ENEMY —</span>'+ 
  '<button id="v310Recovery" type="button" aria-label="作戦終了または全系統復旧の確認を開く">終了・復旧</button>'+
  '<button id="v310Home" type="button">⌂ HOME</button></div>'+
  '<button id="v310RadioRibbon" type="button" class="v310-ribbon"><b id="v310RadioFrom">作戦通信</b><span id="v310RadioText">受信待機中</span><em>確認 ▸</em></button>'+
  '<div class="v310-actions" id="v310Actions">'+
  '<button type="button" data-v310-action="move">移動</button>'+
  '<button type="button" data-v310-action="aim">照準・攻撃</button>'+
  '<button type="button" data-v310-action="city">都市防衛</button>'+
  '<button type="button" data-v310-action="radio">通信・MAGI</button>'+
  '<button type="button" data-v310-action="wait" class="v310-end">手番終了</button></div>'+
  '<div id="v310Outcome" role="status" aria-live="polite" class="v310-outcome"></div>'+
  '<div class="v310-sheet" id="v310Sheet" hidden role="region" aria-label="戦術補助・通信" aria-live="off">'+
  '<div class="v310-sheet-header"><strong id="v310SheetTitle">指揮・通信</strong>'+
  '<button id="v310SheetClose" type="button" aria-label="作戦マップへ戻る">閉じる ×</button></div>'+
  '<div class="v310-sheet-scroll">'+
  '<div class="v310-sectors" id="v310Sectors" role="group" aria-label="都市防衛区画">'+
  '<button data-v310-sector="0">西部</button><button data-v310-sector="1">中央</button><button data-v310-sector="2">東部</button></div>'+
  '<p id="v310Situation" class="v310-situation"></p>'+
  '<div id="v310SmartActions" class="v310-smart-actions"></div>'+
  '<details id="v310TacticalExtras" class="v310-extra"><summary>戦術支援・陽動・局地防御</summary><div id="v310TacticalSlot"></div></details>'+ 
  '<details id="v310CityExtras" class="v310-extra"><summary>設備の詳細操作（装甲・砲台・修復・送電）</summary>'+
  '<div id="v310CitySlot"></div></details>'+
  '<details id="v310OfficialExtras" class="v310-extra"><summary>正式命令・指揮官判断の記録</summary>'+
  '<div id="v310OrdersSlot"></div></details>'+
  '<details id="v310RadioExtras" class="v310-extra"><summary>人物別通信・全送受信ログ</summary>'+
  '<div id="v310RadioSlot"></div></details>'+
  '</div></div>';
 const top=station.querySelector('.v310-status'),ribbon=station.querySelector('#v310RadioRibbon'),
  actions=station.querySelector('#v310Actions'),sheet=station.querySelector('#v310Sheet');
 const q=id=>station.querySelector('#'+id);
 const display=(id,value)=>{const n=q(id),txt=String(value??'--');if(n&&n.textContent!==txt)n.textContent=txt;};
 const state={open:false,kind:'city',busy:false,serial:0,sector:null,caseId:null,phase:'',signature:''};
 const reduced=window.matchMedia?.('(prefers-reduced-motion:reduce)');
 function situation(){
  const p=kernel.read(),c=radio.read();
  let b=null;try{b=consoleBattle();}catch(_){}
  const field=typeof tacticalState==='function'?tacticalState()?.pos:null;
  const phase=S.defense.status==='active'?(b?.stage==='approval'?'準備・承認':b?.stage==='placement'?'射出・配置':b?.stage==='field'?'交戦':'接敵') :
    ['victory','defeat'].includes(S.defense.status)?'作戦結果':'監視';
  return {p,c,b,field,phase,active:S.defense.status==='active'};
 }
 function goOperation(view){
  if(currentPage!=='battle')return;
  if(mobileCurrent.battle===view)return;
  stats.routes++;
  window.NERV_MOBILE.open('battle',view);
 }
 function restoreNav(){
  const nav=document.querySelector('.bottom-nav');if(!nav)return;
  nav.dataset.v310Nav='on';
  for(const b of nav.querySelectorAll('[data-nav]')){
   const keep=b.dataset.nav==='home'||b.dataset.nav==='battle';
   b.hidden=!keep;
   if(b.dataset.nav==='battle'){b.innerHTML='<span aria-hidden="true">⌖</span><small>作戦管制</small>';b.title='統合作戦管制';}
  }
  const home=document.querySelector('.page[data-page="home"]');
  if(home&&!$('v310UtilityLinks')){
   const details=document.createElement('details');details.id='v310UtilityLinks';
   details.innerHTML='<summary>実用機能・職員記録・専門設備</summary><div class="v310-home-links">'+
    '<button type="button" data-v310-open="weather">天気</button>'+
    '<button type="button" data-v310-open="tools">職員ツール</button>'+
    '<button type="button" data-v310-open="settings">設定</button>'+
    '<button type="button" data-v310-open="messages">個人通信・記録</button>'+
    '<button type="button" data-v310-open="magi">MAGI詳細</button></div>';
   home.prepend(details);
   details.addEventListener('click',e=>{const b=e.target.closest('[data-v310-open]');if(b)window.NERV_MOBILE.open(b.dataset.v310Open);});
  }
 }
 function mount(){
  restoreNav();
  const engage=mobileSection('battle','engage'),setup=mobileSection('battle','setup'),deploy=mobileSection('battle','deploy');
  if(!station.isConnected){
   const nav=page.querySelector('.v232-task-nav')||page.querySelector('.mobile-tabs');
   if(nav)nav.after(station);else page.prepend(station);
  }
  // Move actual CONTROL NODES rather than cloning fake buttons or state.
  // Earlier draw wrappers may restore their original parent; this is the
  // final relocation after all legacy renderers have completed.
  for(const [id,slot] of [['v233CityControl','v310CitySlot'],
                         ['v300Operations','v310OrdersSlot'],['v301Radio','v310RadioSlot'],['v229CombatOrders','v310TacticalSlot']]){
   const node=$(id),target=q(slot);if(node&&target&&node.parentElement!==target)target.append(node);
  }
  if(engage&&page.classList.contains('active')){
   const dest=engage.querySelector('#v230BattleToolbar');if(dest)dest.setAttribute('aria-label','戦術・照準切替');
  }
 }
 function targetSector(c,field){
  const proposed=state.sector;
  return Number.isInteger(proposed)?proposed:Number.isInteger(field?.col)?field.col:
    Math.min(2,Math.max(0,Number(S.defense.selected)||0));
 }
 function orderFor(p,sector,statuses){
  return [...(p.orders||[])].reverse().find(o=>o.kind==='city.shutter'&&o.sector===sector&&statuses.includes(o.status));
 }
 function messageFor(c,recipient,topic,sector,statuses){
  return [...(c.transmissions||[])].reverse().find(t=>t.recipient===recipient&&t.topic===topic&&
   (topic!=='shutter-safety'||t.sector===sector)&&statuses.includes(t.status));
 }
 function addChoice(id,label,note,disabled=false){
  const b=document.createElement('button');b.type='button';b.dataset.v310Choice=id;
  const title=document.createElement('strong');title.textContent=label;b.append(title);
  if(note){const sub=document.createElement('small');sub.textContent=note;b.append(sub);}
  b.disabled=!!disabled;return b;
 }
 function guidance(s){
  const {p,c,field,phase}=s,sector=targetSector(c,field),a=p.status==='active';
  const pending=orderFor(p,sector,['requested']),approved=orderFor(p,sector,['authorized']),
   done=orderFor(p,sector,['executed']);
  const pilot=['rei','shinji','asuka'][p.unit]||'shinji';
  const conflict=phase==='交戦'&&field?.col===sector&&field?.row<=2;
  const clearance=c.links?.some(x=>x.sector===sector&&x.unit===p.unit&&x.round===S.defense.round&&x.status==='acknowledged');
  const safety=messageFor(c,pilot,'shutter-safety',sector,['queued','awaiting_reply','replied','acknowledged']);
  const choices=[];
  if(state.kind==='city'){
   q('v310Sectors').hidden=false;
   display('v310SheetTitle','都市防衛 / COMMAND AUTHORITY');
   const totalHealth=p.city?.length?Math.round(p.city.reduce((sum,x)=>sum+(Number(x.hp)||0),0)/p.city.length):0;
   display('v310Situation','都市健全性 '+totalHealth+'% · '+['西','中央','東'][sector]+'区画HP '+p.city[sector]?.hp+
    '% · 防衛電力 '+p.energy+'%'+(totalHealth===100?' / 施設修復不要。作戦終了・復旧は上部ボタン':' / 個別施設の修理は下の設備詳細から'));
   if(!a)choices.push(addChoice('noop','作戦待機中','目標接近後に都市設備を指揮'));
   else if(p.city[sector]?.armor){
    if(done)choices.push(addChoice('release','防壁を解除','射線を回復する代わりに都市の防御を失う'));
    else choices.push(addChoice('noop','防壁展開中','詳細設備操作から現状を確認'));
   }else if(p.scans<34){
    choices.push(addChoice('scan','MAGIへ緊急解析','電力12を消費、敵情報を更新',!p.power||!p.comms||p.energy<12));
   }else if(pending){
    choices.push(addChoice('review','ミサトの判断を確認','正式な上申への承認・否決を照合'));
   }else if(approved){
    if(conflict&&!clearance){
     choices.push(addChoice('clearance','パイロットに射線確認を依頼','現在の配置に対する通信と受領確認'));
     if(safety?.status==='awaiting_reply')choices.push(addChoice('reply','パイロットからの報告を受信','報告内容を確認してから進める'));
     if(safety?.status==='replied')choices.push(addChoice('ack','パイロットの報告を受領','同ターンの射線確認を記録'));
     choices.push(addChoice('move','代わりにEVAを再配置','移動先をマップ上で指定し、APを使う'));
    }else choices.push(addChoice('execute','承認済み防壁を展開','電力12消費、都市防衛とEVA射線へ反映',!p.power||p.energy<12));
   }else{
    choices.push(addChoice('propose','ミサトへ防壁案を上申','解析を元に正式な承認を求める'));
    choices.push(addChoice('scan','追加MAGI解析','電力12を使用し情報の確度を向上',p.scans>=100||p.energy<12));
   }
   q('v310CityExtras').hidden=false;q('v310OfficialExtras').hidden=false;q('v310RadioExtras').hidden=true;q('v310TacticalExtras').hidden=phase!=='交戦';
  }else{
   q('v310Sectors').hidden=true;
   display('v310SheetTitle','通信・MAGI / FIELD OPERATIONS');
   display('v310Situation',p.phase+' · '+(p.comms?'回線正常':'回線断・送信保留')+
    ' · MAGI '+(p.magiHold||p.intrusion?'異常':'オンライン')+' · 波形解析 '+p.scans+'%');
   if(!a)choices.push(addChoice('noop','作戦待機中','職員・パイロットの通信記録は下の詳細から確認'));
   else{
    choices.push(addChoice('radiohyuga','日向 / 敵の進路','位置・攻撃情報を照会'));
    choices.push(addChoice('radiomaya','マヤ / 機体診断','同期率・機体状態を照会'));
    choices.push(addChoice('radiopilot','パイロット / 現場状況','担当EVAから現在位置を確認'));
    choices.push(addChoice('scan','MAGI波形解析','実際の電力12を消費',p.scans>=100||!p.power||p.energy<12));
    if(c.queued>0)choices.push(addChoice('flush','青葉 / 保留通信を再送',c.queued+'件の通信を再送',!p.comms));
    const unanswered=[...(c.transmissions||[])].reverse().find(t=>t.status==='awaiting_reply'||t.status==='replied');
    if(unanswered){
     choices.push(addChoice(unanswered.status==='replied'?'ack':'reply',
      unanswered.status==='replied'?'報告の受領を記録':'最新の返信を受信',
      (c.contacts[unanswered.recipient]?.name||unanswered.recipient)+' / '+unanswered.topic));
    }
   }
   q('v310CityExtras').hidden=true;q('v310OfficialExtras').hidden=true;q('v310RadioExtras').hidden=false;q('v310TacticalExtras').hidden=phase!=='交戦';
  }
  const node=q('v310SmartActions');node.replaceChildren(...choices);
  for(const b of q('v310Sectors').querySelectorAll('button')){
   b.setAttribute('aria-pressed',String(Number(b.dataset.v310Sector)===sector));
  }
 }
 function render(){
  if(!staffWorldReady)return;
  stats.draws++;
  mount();
  const s=situation(),{p,c,b,phase}=s;
  if(p.blocked||c.blocked){display('v310Outcome',p.error||c.error);return;}
  const key=S.defense.caseNo;
  if(state.caseId!==key){state.caseId=key;state.sector=null;state.open=false;sheet.hidden=true;}
  state.phase=phase;
  // Old stage views are still independent DOM panels internally. They are
  // exposed as ONE operation route that changes phase automatically.
  const required=s.active?(b?.stage==='field'?'engage':b?.stage==='placement'?'deploy':'setup'):
    ['victory','defeat'].includes(S.defense.status)?'records':'setup';
  if(currentPage==='battle'&&mobileCurrent.battle!==required)goOperation(required);
  const playing=!!s.active&&b?.stage==='field';
  station.dataset.v310Phase=playing?'combat':required;
  display('v310Phase','CASE '+String(key||0).padStart(2,'0')+' / '+phase);
  display('v310Telemetry','UNIT-0'+(p.unit??1)+' · '+(b?.ap??2)+'/2 AP · ENEMY '+(p.enemyHp??'--')+
    ' · POWER '+p.energy+'%');
  const messages=[...(c.operationalMessages||[]),...(p.messages||[])].filter(m=>m.delivery!=='queued').sort((a,b)=>(a.at||0)-(b.at||0));
  const last=messages.at(-1);
  display('v310RadioFrom',last?.sender||'日向 / 作戦監視');
  display('v310RadioText',last?.text|| (s.active?'使徒迎撃管制中。状況の変化に注意。':'警戒監視中 / 受信待機'));
  q('v310Actions').hidden=!playing;
  for(const b of actions.querySelectorAll('button')){
   b.disabled=state.busy||!playing;
  }
  const end=actions.querySelector('[data-v310-action=wait]');
  if(end&&playing){
   const reasons=typeof tacticalReady==='function'?tacticalReady():[];
   end.disabled=state.busy||reasons.length>0;end.title=reasons.join(' / ');
  }
  // End/recovery is NOT facility repair. 100% city HP does not prevent
  // returning the CASE, EVA and infrastructure to normal standby.
  q('v310Home').disabled=state.busy;
  q('v310Recovery').disabled=state.busy||typeof recoveryBusy!=='undefined'&&recoveryBusy;
  q('v310Recovery').textContent=S.defense.status==='idle'?'系統復旧':'終了・復旧';
  sheet.hidden=!state.open;
  if(state.open)guidance(s);
 }
 function setSheet(kind){
  state.kind=kind;state.open=true;
  // Don't duplicate administrative panels. All official reducers and their
  // live controls are the moved originals inside this single contextual sheet.
  for(const id of ['v310TacticalExtras','v310CityExtras','v310OfficialExtras','v310RadioExtras']){const n=q(id);if(n)n.open=false;}
  render();
 }
 async function dispatch(api,kind,payload={}){
  const p=api.read(),caseId=p.caseId;
  if(p.blocked||!caseId||p.status!=='active')return {ok:false,error:'進行中のCASEが必要です'};
  const commandId='C31-'+Date.now().toString(36)+'-'+(++state.serial);
  return api.dispatch({commandId,caseId,actorId:'operator-C3',expectedRevision:p.revision,kind,payload});
 }
 async function run(choice){
  if(state.busy)return;
  const s=situation(),{p,c,field}=s,sector=targetSector(c,field),
    pilot=['rei','shinji','asuka'][p.unit]||'shinji';
  const pending=orderFor(p,sector,['requested']),approved=orderFor(p,sector,['authorized']);
  const transmission=messageFor(c,pilot,'shutter-safety',sector,['queued','awaiting_reply','replied']);
  const latest=[...(c.transmissions||[])].reverse().find(x=>x.status==='awaiting_reply'||x.status==='replied');
  state.busy=true;render();
  let r={ok:false,error:'現在の状況では操作できません'};
  try{
   if(choice==='scan')r=await dispatch(kernel,'analysis.request');
   else if(choice==='propose')r=await dispatch(kernel,'city.shutter.request',{sector});
   else if(choice==='review')r=await dispatch(kernel,'city.shutter.review',{orderId:pending?.id});
   else if(choice==='execute')r=await dispatch(kernel,'city.shutter.execute',{orderId:approved?.id});
   else if(choice==='release')r=await dispatch(kernel,'city.shutter.release',{sector});
   else if(choice==='clearance')r=transmission?{ok:true,message:'通信は送信済み。受信・受領確認を行ってください'}:
      await dispatch(radio,'comms.request',{recipient:pilot,topic:'shutter-safety',sector});
   else if(choice==='reply')r=await dispatch(radio,'comms.reply',{transmissionId:state.kind==='city'?transmission?.id:latest?.id});
   else if(choice==='ack')r=await dispatch(radio,'comms.acknowledge',{transmissionId:state.kind==='city'?transmission?.id:latest?.id});
   else if(choice==='radiohyuga'||choice==='radiomaya'||choice==='radiopilot'){
    const recipient=choice==='radiohyuga'?'hyuga':choice==='radiomaya'?'maya':pilot;
    const topic=choice==='radiohyuga'?'threat':choice==='radiomaya'?'eva':'position';
    r=await dispatch(radio,'comms.request',{recipient,topic});
   }else if(choice==='flush')r=await dispatch(radio,'comms.flush');
   else if(choice==='move'){
    const modeResult=await consoleBattleCommand('mode',{mode:'move'});
    if(!modeResult.ok)throw Error(modeResult.error||'移動指令を選択できません');
    state.open=false;state.kind='city';$('v230BattleToolbar')?.querySelector('[data-v230-mode=command]')?.click();
    r={ok:true,message:'マップの移動可能区画をタップしてください。移動には1APを使用'};
   }
   if(r.ok)stats.actions++;else stats.failures++;
   display('v310Outcome',(r.ok?'受領 / ':'保留 / ')+(r.message||r.error||'命令を確認してください'));
   window.NERV_MOTION?.animate?.('v310-feedback',q('v310Outcome'),
    {opacity:[.55,1],duration:270,ease:'outQuad'},station);
  }catch(e){stats.failures++;display('v310Outcome','エラー / '+e.message);}
  finally{state.busy=false;render();}
 }
 station.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.id==='v310Recovery'){
   // Never reset from a single tap: existing operator modal performs backup,
   // explicit confirmation, save and rollback on failure.
   state.open=false;render();
   openAlertReview('end');
   return;
  }
  if(b.id==='v310Home'){window.NERV_MOBILE.open('home');return;}
  if(b.id==='v310SheetClose'){state.open=false;render();return;}
  if(b.id==='v310RadioRibbon'){setSheet('radio');return;}
  if(b.dataset.v310Sector!==undefined){
   state.sector=Number(b.dataset.v310Sector);
   // Reflect the selected district in the legacy (real) city UI on screen.
   render();return;
  }
  if(b.dataset.v310Choice){run(b.dataset.v310Choice);return;}
  const act=b.dataset.v310Action;
  if(act==='city'||act==='radio'){setSheet(act);return;}
  if(act==='move'||act==='aim'){
   const mode=act==='move'?'command':'precision';
   if(act==='move')consoleBattleCommand('mode',{mode:'move'}).then(r=>{
    if(!r.ok)display('v310Outcome',r.error||'移動に切り替えられません');
   });
   $('v230BattleToolbar')?.querySelector('[data-v230-mode="'+mode+'"]')?.click();
   state.open=false;render();return;
  }
  if(act==='wait')$('v230BattleToolbar')?.querySelector('[data-v230-action=wait]')?.click();
 });
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&state.open){state.open=false;render();}
 });
 const oldDraw=draw;draw=function(){oldDraw();render();};
 for(const name of ['nerv-route','nerv-world-ready','nerv-tactical-render','nerv-command-v3']){
  window.addEventListener(name,render);
 }
 window.NERV_V310={snapshot:()=>({...stats,caseId:state.caseId,phase:state.phase,sheetOpen:state.open,
  operationOnly:currentPage==='battle',panelLocation:q('v310RadioSlot')?.contains($('v301Radio'))??false})};
 render();
})();
