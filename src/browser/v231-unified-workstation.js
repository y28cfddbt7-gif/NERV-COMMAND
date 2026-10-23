// NERV-COMMAND v2.31: unified workstation hierarchy, not another tactical panel.
// Presentation only. This module never alters S, a combat reducer, art, or audio.
function initV231UnifiedWorkstation(){
 if(!window.NERV_MOBILE||!document.getElementById('terminalContext'))return;
 const stats={version:'2.31',routes:0,phaseUpdates:0,layouts:0,commands:0,ownTimers:false,ownRAF:false,imagesChanged:false};
 const bar=document.createElement('section');bar.id='v231StatusRail';bar.className='v231-rail';
 bar.setAttribute('aria-label','現在の業務状況');
 bar.innerHTML='<div class="v231-rail-label"><span id="v231Sector">NERV / OPERATIONS</span><strong id="v231Phase">READY</strong></div>'+
   '<div class="v231-rail-data"><b id="v231Condition">管制待機</b><small id="v231Priority">情報を照合</small></div>'+
   '<button type="button" id="v231Proceed" aria-label="次の作業を開く">作業へ <span aria-hidden="true">›</span></button>';
 const summary=document.createElement('details');summary.id='v231Facilities';summary.className='v231-secondary';
 summary.innerHTML='<summary>施設・防衛設備の詳細</summary>';
 const wire=(id,value)=>{const n=document.getElementById(id);const text=String(value??'--');if(n&&n.textContent!==text)n.textContent=text;};
 const button=bar.querySelector('button');
 let route='',last='',lastPage='',lastView='';
 const modes={home:'HOME',battle:'BATTLE',infra:'TOKYO-3',eva:'EVA',magi:'MAGI',work:'STAFF',
  mission:'OPERATIONS',messages:'COMMS',weather:'WEATHER',settings:'SETTINGS',tools:'TOOLS',hq:'HQ'};
 function getState(){
  if(typeof S==='undefined'||!S?.defense)return null;
  const page=typeof currentPage==='string'?currentPage:'home',view=mobileCurrent[page]||'';
  let b=null;
  try{if(typeof consoleBattle==='function')b=consoleBattle();}catch(e){}
  const d=S.defense,unit=Number(S.tactics?.attacker)||0;
  const eva=S.evas?.[unit],danger=d.status==='active';
  let title='待機 / NOMINAL',priority='機能を選択',next=null,label='開く';
  if(page==='battle'){
   const stage=b?.stage||'standby',incident=window.NERV_GAME_V229?.get?.();
   if(!danger){title=d.status==='victory'?'作戦完了':d.status==='defeat'?'被害・復旧':'接近目標待機';
    priority='目標の確認と指令受理';next='battle/setup';}
   else if(!b){title='作戦引継ぎ待機';priority='発進指令と機体準備を照合';next='battle/setup';}
   else if(stage==='approval'){
    title=incident?.status==='pending'?'発進異常・対応要':'発進承認 / UNIT-0'+unit;
    priority=incident?.status==='pending'?'対応方法を判断':eva?.state==='HANGAR'?'機体準備':'MAGI承認と射出条件';
    next='battle/setup';
   }else if(stage==='placement'){title='出撃位置・兵装を指定';priority='配置地点を確定';next='battle/deploy';}
   else{title='戦闘中 / TURN '+d.round;priority=(b.ap??0)+' / 2 AP · UNIT-0'+unit;
    next='battle/engage';}
  }else if(page==='infra'){
   title=danger?'防衛作戦進行中':'都市防衛 / NOMINAL';
   priority='電力 '+(S.infra?.power?'正常':'障害')+' · 通信 '+(S.infra?.comms?'接続':'切断');
   next='infra/map';
  }else if(page==='magi'){
   title=S.magi?.approvedFor!=null?'三基承認 / UNIT-0'+S.magi.approvedFor:'三基合議・診断';
   priority='MELCHIOR / BALTHASAR / CASPER';next='magi/main';
  }else if(page==='eva'){
   title='UNIT-0'+unit+' / '+(eva?.state||'STANDBY');
   priority='同期率 '+(eva?.sync??'--')+'% · 出撃 '+(danger?'作戦進行中':'待機');next='eva/monitor';
  }else if(page==='messages'||page==='work'&&view==='communications'){
   title='通信回線 '+(S.infra?.comms?'確立':'切断');
   priority='受信・報告を監視';next=page==='messages'?'messages':null;
  }else if(page==='mission'){title=danger?'作戦進行中':'作戦照会';priority='作戦・施設・兵装';next='battle/engage';}
  else if(page==='home'){title=danger?'使徒接近 / 警戒態勢':'NERV / NOMINAL';priority=danger?'管制指令を照合':'機能一覧から職員業務を選択';next=danger?'battle/engage':null;}
  else if(page==='weather'){title='気象観測';priority='実測値と警報を確認';next=null;}
  else if(page==='hq'){title='司令部';priority='命令系統と報告を確認';next=null;}
  else if(page==='tools'){title='職員支援';priority='業務・タスク';next=null;}
  else if(page==='settings'){title='端末設定';priority='映像・音声・保存';next=null;}
  return {page,view,stage:b?.stage||'',title,priority,next,label,danger};
 }
 function locate(){
  // Merge real live status directly inside the existing terminal header.
  // Keep one unified topbar below Scriptable's native safe area.
  const host=document.getElementById('terminalContext');
  const slot=host?.querySelector(':scope > div');
  if(slot&&bar.parentElement!==slot){slot.append(bar);stats.layouts++;}
  const city=typeof mobileSection==='function'?mobileSection('infra','map'):null;
  const facilities=document.getElementById('v27Facilities');
  if(city&&facilities&&!summary.contains(facilities)){facilities.before(summary);summary.append(facilities);stats.layouts++;}
  const rack=document.getElementById('v227SignalRack');
  const page=typeof currentPage==='string'?currentPage:'';
  const view=typeof mobileCurrent==='object'?mobileCurrent[page]:'';
  const isComms=page==='messages'||page==='work'&&view==='communications';
  const active=document.querySelector('.page.active .mobile-view:not([hidden])')||document.querySelector('.page.active');
  if(rack&&isComms&&active&&!active.contains(rack)){
   const station=active.querySelector('.v226-station[data-station="messages"]');
   if(station)station.after(rack);else active.prepend(rack);
   rack.classList.add('v231-comms-rack');stats.layouts++;
  }else if(rack&&isComms&&active&&rack.closest('.v226-station')){
   rack.closest('.v226-station').after(rack);rack.classList.add('v231-comms-rack');stats.layouts++;
  }
  // Keep extra presentation-only modules available internally for backward
  // compatibility, but prevent duplicate status cards taking viewport height.
 }
 function update(){
  if(!staffWorldReady)return;
  locate();const state=getState();if(!state)return;
  const {page,view,stage,title,priority,next}=state;
  document.body.dataset.v231Page=page;
  document.body.dataset.v231View=view;
  document.body.dataset.v231BattleStage=stage;
  wire('v231Sector',modes[page]||'NERV');
  wire('v231Phase',state.danger?'ALERT':'STANDBY');
  wire('v231Condition',title);
  wire('v231Priority',priority);
  // A workbar is only an index; it never performs a second approval or attack.
  route=next;
  button.hidden=!route||route===page+'/'+view;
  if(!button.hidden){button.textContent='作業へ ›';}
  bar.dataset.alert=state.danger?'active':'normal';
  const signature=[page,view,stage,title,priority].join('|');
  if(signature!==last){stats.phaseUpdates++;last=signature;}
  if(page!==lastPage||view!==lastView){stats.routes++;lastPage=page;lastView=view;}
 }
 button.addEventListener('click',()=>{
  if(!route)return;
  const [page,view]=route.split('/');
  window.NERV_MOBILE.open(page,view);stats.commands++;
 });
 // The existing render chain calls its last link for each state transition.
 const previousDraw=draw;
 draw=function(){previousDraw();update();};
 window.addEventListener('nerv-route',update);
 window.addEventListener('nerv-world-ready',update);
 window.addEventListener('nerv-fx-quality',update);
 window.NERV_UNIFIED_UI={snapshot:()=>({...stats,route,page:lastPage,view:lastView,status:last,artworkTouched:false})};
 update();
}
initV231UnifiedWorkstation();