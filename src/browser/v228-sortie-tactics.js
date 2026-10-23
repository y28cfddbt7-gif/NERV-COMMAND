// NERV-COMMAND v2.28 / SORTIE CONTROL + OPERABLE TACTICAL MAP
// Keeps legacy console schema=1, existing battle reducers, original art and Scriptable saves.
// All persistent decisions use commandOperation; no extra timers/RAF or direct data saves.
function initV228SortieTactics(){
 if(!window.NERV_MOTION||!document.getElementById('shell')||typeof consoleBattle!=='function')return;
 const info={version:'2.28',sortieCommands:0,mapCommands:0,transitions:0,failed:0,animations:0,ownTimers:false,ownRAF:false};
 const choices=['balanced','rapid','fortified'];
 const checks=['power','pilot','intel','equipment'];
 const names={power:'送電・カタパルト',pilot:'パイロット同期',intel:'MAGI情報照合',equipment:'兵装・機体健全性'};
 const descriptions={
  balanced:'標準発進。点検結果を優先して配備。',
  rapid:'速攻発進。敵との距離を確保、機体健全性を消費。',
  fortified:'防御発進。次の敵攻撃を軽減、初期APを消費。'
 };
 const el=(tag,cls,html)=>{const node=document.createElement(tag);node.className=cls;node.innerHTML=html;return node;};
 const sortie=el('section','v228-sortie',
  '<header class="v228-head"><div><small>LAUNCH SYSTEM / 発進管制</small><h3>EVA SORTIE CONTROL</h3></div><b id="v228Stage">STANDBY</b></header>'+
  '<div class="v228-sequence"><span data-v228-phase="0">01 <b>受理</b></span><span data-v228-phase="1">02 <b>点検</b></span><span data-v228-phase="2">03 <b>承認</b></span><span data-v228-phase="3">04 <b>射出</b></span></div>'+
  '<p class="v228-intro">発進優先方針と、3枠の事前点検を選択。整備結果は戦術盤へ反映されます。</p>'+
  '<div class="v228-group"><b>OPERATION POLICY / 発進方針</b><div class="v228-modes">'+
   choices.map((id,i)=>'<button type="button" data-v228-policy="'+id+'"><strong>'+['標準','速攻','防御'][i]+'</strong><small>'+['BALANCED','RAPID','FORTIFIED'][i]+'</small></button>').join('')+'</div></div>'+
  '<div class="v228-group"><b>PRE-LAUNCH CHECK / 点検枠 <em id="v228Budget">3 / 3</em></b>'+
   '<div class="v228-checks">'+checks.map((id,i)=>'<button type="button" data-v228-check="'+id+'">'+
   '<span class="v228-check-no">0'+(i+1)+'</span><strong>'+names[id]+'</strong><small data-v228-checkmark="'+id+'">未確認</small></button>').join('')+'</div></div>'+
  '<div class="v228-status"><span>対象機体 <b id="v228Unit">UNIT-00</b></span><span>準備評価 <b id="v228Assessment">待機</b></span><span>警告 <b id="v228Conditions">--</b></span></div>'+
  '<div class="v228-note" id="v228Result" role="status" aria-live="polite">発進案件を受理すると事前判断を開始します。</div>');
 const field=el('section','v228-field',
  '<div class="v228-head"><div><small>GEOSTRATEGIC DATA / 戦術配置</small><h3>TACTICAL COMMAND MAP</h3></div><b id="v228Round">TURN 00</b></div>'+
  '<div class="v228-field-state"><span>EVA <b id="v228FieldUnit">UNIT-00</b></span><span>AP <b id="v228FieldAP">--</b></span><span>ENERGY <b id="v228FieldEnergy">--</b></span><span>ENEMY <b id="v228FieldEnemy">--</b></span></div>'+
  '<div class="v228-sector-head"><span>西部</span><span>中央</span><span>東部</span></div>'+
  '<div class="v228-sector-grid" id="v228SectorGrid" aria-label="作戦区画の指揮。隣接区画を選択して移動">'+
  [1,2,3].flatMap(row=>[0,1,2].map(col=>{
   const id=col+','+row,region=['WEST','CENTER','EAST'][col];
   return '<button type="button" data-v228-sector="'+id+'"><span class="v228-sector-idx">'+region+' / '+row+'</span>'+
   '<strong class="v228-sector-type">SECTOR</strong><small class="v228-sector-signal">--</small></button>';
  })).join('')+'</div>'+
  '<p class="v228-forecast" id="v228Forecast">次の攻撃予測をMAGI解析・防御配置に反映</p>'+
  '<div class="v228-actions"><button type="button" data-v228-action="support">都市援護切替</button>'+
  '<button type="button" data-v228-action="aim">照準盤へ ↓</button>'+
  '<button type="button" data-v228-action="guard">A.T.防御</button></div>'+
  '<p class="v228-brief" id="v228Brief" role="status" aria-live="polite">戦闘開始後に操作可能になります。従来の直接ドラッグ操作も利用できます。</p>');
 const q=(root,id)=>root.querySelector('#'+id);
 let pending=false,signature='',phaseSignature='';
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 function moving(owner){return !!owner?.isConnected&&!document.hidden&&!reduced?.matches&&typeof isMoving==='function'&&isMoving();}
 function motion(key,target,params,owner){
  if(!moving(owner))return;
  const found=window.NERV_MOTION.animate('v228-'+key,target,{duration:430,composition:'replace',ease:'outQuart',...params,
   onComplete:()=>{for(const e of (Array.isArray(target)?target:[target])){e?.style.removeProperty('transform');e?.style.removeProperty('opacity');}}},owner);
  if(found)info.animations++;
 }
 function put(root,id,v){const elem=q(root,id),value=String(v);if(elem&&elem.textContent!==value)elem.textContent=value;}
 function saved(){
  if(typeof S==='undefined'||!S||!S.defense)return null;
  const p=S.operatorConsole?.sortieV228;
  if(!p||p.schema!==1||p.caseNo!==S.defense.caseNo||p.unit!==S.tactics.attacker)return null;
  return p;
 }
 function plan(){
  const p=saved();return p||{schema:1,caseNo:S.defense.caseNo,unit:S.tactics.attacker,policy:'balanced',checks:[],applied:false,score:null};
 }
 function validation(p){
  if(!p||p.schema!==1||!choices.includes(p.policy)||!Array.isArray(p.checks)||p.checks.length>3||
    p.checks.some(x=>!checks.includes(x))||new Set(p.checks).size!==p.checks.length||typeof p.applied!=='boolean')
   throw Error('発進計画の保存形式を確認できません。元の記録は保持しました。');
 }
 function ensure(){
  const b=consoleBattle();if(!b||S.defense.status!=='active'||!['approval','placement'].includes(b.stage))
   throw Error('発進準備中の作戦を選択してください');
  const root=consoleRoot(true);
  let p=root.sortieV228;
  if(!p||p.caseNo!==S.defense.caseNo||p.unit!==b.unit){
   p={schema:1,caseNo:S.defense.caseNo,unit:b.unit,policy:'balanced',checks:[],applied:false,score:null};
   root.sortieV228=p;
  }
  validation(p);if(p.applied)throw Error('発進は既に完了しています');
  return p;
 }
 async function command(action,value){
  if(pending)return;
  pending=true;try{
   const r=await commandOperation(()=>{
    const p=ensure();
    if(action==='policy'){
     if(!choices.includes(value))throw Error('不明な発進方針');
     p.policy=value;
    }else if(action==='check'){
     if(!checks.includes(value))throw Error('点検項目が不正です');
     if(value==='power'&&!S.infra.power)throw Error('都市電源の障害を先に復旧');
     if(value==='intel'&&(worldMagiLimited()||magiIntrusionActive()))throw Error('MAGI保留中は解析照合不可');
     if(value==='pilot'&&S.evas[p.unit].state==='POWER_LOST')throw Error('機体接続に異常あり');
     if(p.checks.includes(value))p.checks=p.checks.filter(x=>x!==value);
     else{if(p.checks.length>=3)throw Error('点検枠は3つです。項目を解除して変更してください');p.checks.push(value);}
    }else throw Error('未対応の発進操作');
    consoleRecord('sortie','発進計画 / '+p.policy+' / '+p.checks.map(x=>names[x]).join('・'));
   });
   if(r.ok){info.sortieCommands++;put(sortie,'v228Result',action==='policy'?descriptions[value]:'点検計画を更新 / 保存済み');
    motion('sortie-signal',[...sortie.querySelectorAll('[data-v228-check]')],{opacity:[.42,1],translateY:[4,0],delay:window.anime.stagger(35),duration:390},sortie);
   }else{info.failed++;put(sortie,'v228Result',r.error||'発進操作を保存できません');}
  }catch(e){info.failed++;put(sortie,'v228Result',e.message);}finally{pending=false;render();}
 }
 // Invoked inside the existing deploy transaction, before battle stage is committed.
 // Applied once and only once to legacy validated fields. No new reducer loop.
 function finalize(b,t,e){
  if(!b||!t||!e)return;
  const p=saved();if(!p)return;validation(p);if(p.applied)return;
  const d=S.defense,verified=p.checks;
  if(verified.includes('pilot'))e.sync=Math.min(100,(Number(e.sync)||0)+4);
  if(verified.includes('intel'))d.scans=Math.min(100,(Number(d.scans)||0)+12);
  if(verified.includes('equipment'))e.tacticalIntegrity=Math.min(100,(Number(e.tacticalIntegrity)||100)+8);
  if(verified.includes('power'))d.energy=Math.min(100,(Number(d.energy)||0)+6);
  if(p.policy==='rapid'){
   if(d.enemy)d.enemy.dist=Math.min(9,Math.max(0,(Number(d.enemy.dist)||0)+1));
   e.tacticalIntegrity=Math.max(1,(Number(e.tacticalIntegrity)||100)-7);
  }else if(p.policy==='fortified'){
   if(d.energy<7)throw Error('防御発進には都市電力7が必要です');
   d.energy-=7;b.ap=1;t.guardUntil=d.round+1;
  }
  p.applied=true;p.score=verified.length*20+(p.policy==='balanced'?20:15);
  consoleRecord('sortie','発進完了 / '+p.policy+' / 点検'+verified.length+'/3 / 戦術初期値へ反映');
 }
 // Name resolves at runtime in v219 battle engine, ensuring same commandOperation snapshot/rollback.
 window.NERV_SORTIE_HOOK={finalize};
 function locate(){
  const setup=typeof mobileSection==='function'?mobileSection('battle','setup'):null;
  if(setup&&!sortie.isConnected){const approval=document.getElementById('consoleApproval');if(approval)approval.closest('.console-approval-actions')?.before(sortie);else setup.prepend(sortie);}
  const engage=typeof mobileSection==='function'?mobileSection('battle','engage'):null;
  const stage=document.getElementById('battleStage');
  if(stage&&!field.isConnected)stage.before(field);
 }
 function ensureFeedback(value){put(field,'v228Brief',value);motion('brief',q(field,'v228Brief'),{opacity:[.35,1],translateX:[5,0]},field);}
 async function battleCommand(action,payload={}){
  if(pending)return;pending=true;
  try{
   const r=await consoleBattleCommand(action,payload);
   if(r.ok){info.mapCommands++;ensureFeedback(action==='move'?'移動指令実行 / 予測射界を再評価':action==='guard'?'A.T.防御命令を発令':'都市援護命令を更新');}
   else{info.failed++;ensureFeedback(r.error||'作戦指令を実行できません');}
  }catch(e){info.failed++;ensureFeedback(e.message);}finally{pending=false;render();}
 }
 function battleView(){
  const s=typeof S==='undefined'?null:S;
  if(!s||!s.defense||!s.evas)return null;
  const b=consoleBattle();const t=tacticalState();
  return {b,t,d:s.defense,e:s.evas[s.tactics.attacker],active:s.defense.status==='active'&&b?.stage==='field'&&!!t};
 }
 function renderSortie(){
  if(!sortie.isConnected)return;
  const b=consoleBattle(),p=plan(),active=S.defense.status==='active'&&!!b;
  const unit=b?.unit??S.tactics.attacker;
  const stage=b?.stage||'idle';
  const index=stage==='field'?3:stage==='placement'?2:active?1:0;
  put(sortie,'v228Stage',active?stage.toUpperCase():'NO ACTIVE CASE');
  put(sortie,'v228Unit','UNIT-0'+unit);
  put(sortie,'v228Budget',(3-p.checks.length)+' / 3');
  put(sortie,'v228Assessment',p.applied?'発進評価 '+p.score:p.checks.length+' / 3 点検');
  put(sortie,'v228Conditions',!S.infra.power?'電源':!S.infra.comms?'通信':worldMagiLimited()?'MAGI保留':'なし');
  const key=[index,p.policy,p.checks.join(','),p.applied].join('|');
  if(phaseSignature&&key!==phaseSignature){info.transitions++;motion('sequence',[...sortie.querySelectorAll('[data-v228-phase]')],{opacity:[.5,1],translateY:[5,0],delay:window.anime.stagger(75)},sortie);}
  phaseSignature=key;
  for(const [i,node]of [...sortie.querySelectorAll('[data-v228-phase]')].entries())node.dataset.state=i<index?'done':i===index?'now':'pending';
  for(const btn of sortie.querySelectorAll('[data-v228-policy]')){btn.setAttribute('aria-pressed',String(p.policy===btn.dataset.v228Policy));btn.disabled=pending||!active||stage==='field';}
  for(const btn of sortie.querySelectorAll('[data-v228-check]')){
   const id=btn.dataset.v228Check,selected=p.checks.includes(id);
   btn.setAttribute('aria-pressed',String(selected));btn.disabled=pending||!active||stage==='field'||!selected&&p.checks.length>=3;
   const marker=btn.querySelector('[data-v228-checkmark]');if(marker)marker.textContent=selected?'確認済':'未確認';
  }
 }
 function renderField(){
  if(!field.isConnected)return;
  const view=battleView(),t=view?.t,d=view?.d,b=view?.b;
  const active=!!view?.active;
  field.hidden=!active;
  if(!active)return;
  const enemies=t.enemyPlan||{columns:[],rows:[],name:'未取得'};
  put(field,'v228Round','TURN '+d.round);put(field,'v228FieldUnit','UNIT-0'+t.unit);
  put(field,'v228FieldAP',b.ap+'/2');put(field,'v228FieldEnergy',d.energy+'%');
  put(field,'v228FieldEnemy',(d.enemy?.hp??'--')+' HP');
  put(field,'v228Forecast','予告射界：'+enemies.name+' / '+enemies.columns.map(x=>['西','中央','東'][x]).join('・')+
   '　｜ 現在 '+(tacticalThreat(t)?'危険':'安全')+' / '+(t.pos.row===2&&t.pos.col!==1?'遮蔽有':'遮蔽なし'));
  const key=[d.round,b.ap,t.pos.col,t.pos.row,enemies.columns.join(','),enemies.rows.join(','),t.support].join('|');
  if(signature&&signature!==key){info.transitions++;
   motion('map-sector',[...field.querySelectorAll('[data-v228-sector]')],{opacity:[.64,1],scale:[.97,1],delay:window.anime.stagger(22),duration:300},field);}
  signature=key;
  for(const button of field.querySelectorAll('[data-v228-sector]')){
   const [col,row]=button.dataset.v228Sector.split(',').map(Number);
   const you=col===t.pos.col&&row===t.pos.row;
   const risky=enemies.columns.includes(col)&&enemies.rows.includes(row);
   const cover=row===2&&col!==1;
   const adjacent=Math.max(Math.abs(col-t.pos.col),Math.abs(row-t.pos.row))===1;
   const forbidden=currentAngel()?.id==='ramiel'&&row<2;
   const ready=tacticalReady().length===0;
   button.dataset.you=String(you);button.dataset.risk=String(risky);
   button.dataset.cover=String(cover);button.dataset.available=String(!you&&adjacent&&!forbidden&&ready&&b.ap>0);
   button.disabled=pending||!adjacent||forbidden||!ready||b.ap<1;
   const label=button.querySelector('.v228-sector-type'),hint=button.querySelector('.v228-sector-signal');
   if(label)label.textContent=you?'EVA-0'+t.unit:risky?'ENEMY FIRE':cover?'COVER':'OPEN';
   if(hint)hint.textContent=you?'現在位置':forbidden?'進入不可':risky?'攻撃予測':cover?'遮蔽 / 軽減':'移動 1AP';
  }
  const guard=field.querySelector('[data-v228-action="guard"]');
  if(guard)guard.disabled=pending||b.ap===0||tacticalReady().length>0;
  const support=field.querySelector('[data-v228-action="support"]');
  if(support){support.disabled=pending||tacticalReady().length>0;support.setAttribute('aria-pressed',String(t.support));support.textContent='都市援護：'+(t.support?'許可':'保留');}
 }
 function render(){if(!staffWorldReady)return;locate();renderSortie();renderField();}
 sortie.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.v228Policy)command('policy',b.dataset.v228Policy);
  if(b.dataset.v228Check)command('check',b.dataset.v228Check);
 });
 field.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.v228Sector){const [col,row]=b.dataset.v228Sector.split(',').map(Number);battleCommand('move',{col,row});}
  if(b.dataset.v228Action==='support')battleCommand('support');
  if(b.dataset.v228Action==='guard')battleCommand('guard');
  if(b.dataset.v228Action==='aim'){
   document.getElementById('consoleBattleModes')?.scrollIntoView({behavior:'smooth',block:'start'});
   ensureFeedback('攻撃モードを選び、従来の戦術盤で使徒コアを照準してください。');
  }
 });
 const oldDraw=draw;
 draw=function(){oldDraw();render();};
 window.addEventListener('nerv-route',render);
 window.addEventListener('nerv-world-ready',render);
 window.addEventListener('nerv-tactical-turn',render);
 window.addEventListener('nerv-tactical-shot',render);
 window.NERV_V228={snapshot:()=>({...info,sortie:saved()?{...saved()}:null,battle:battleView()?.active?'active':'idle'})};
 render();
}
initV228SortieTactics();
