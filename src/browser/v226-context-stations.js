// NERV v2.26 / contextual workstations. Read-only presentation and finite Anime.js motion.
// No new RAF/timer/CDN; no save mutations; all original screens, art, and reducers remain.
function initV226Stations(){
 if(!window.NERV_MOTION||!window.NERV_MOBILE||!document.getElementById('shell'))return;
 const panels={};
 const specs={
  infra:{title:'TOKYO-3 / CITY DEFENSE',tag:'都市管制 / ALERT GRID',html:
    '<div class="v226-city"><div class="v226-hex" aria-hidden="true">'+
      Array.from({length:7},(_,i)=>'<i data-hex="'+i+'"></i>').join('')+'</div>'+
      '<div class="v226-facts"><span>ENEMY TRACK <b data-v226="enemy">NO CONTACT</b></span>'+
      '<span>POWER GRID <b data-v226="power">--- </b></span>'+
      '<span>COMMAND LINK <b data-v226="comms">--- </b></span>'+
      '<span>DEFENSE <b data-v226="defense">待機</b></span></div></div>'+
    '<div class="v226-chips"><i>RADAR / SCAN</i><i data-v226="cityStatus">CITY STATUS</i></div>'},
  magi:{title:'MAGI / TRI-CONSENSUS',tag:'三基解析 / DECISION BUS',html:
    '<div class="v226-tri"><div class="v226-signal" aria-hidden="true"><i></i><i></i><i></i></div>'+
      ['MELCHIOR','BALTHASAR','CASPER'].map((n,i)=>'<div class="v226-vote" data-core="'+i+'"><b>'+n+'</b><span data-v226="vote'+i+'">STANDBY</span></div>').join('')+'</div>'+
    '<div class="v226-magi-status"><span data-v226="analysis">三基監視中</span><i data-v226="progress"></i></div>'},
  messages:{title:'NERV / PERSONNEL COMMS',tag:'通信管制 / INCOMING CHANNEL',html:
    '<div class="v226-comms"><div class="v226-wave" aria-hidden="true">'+
    Array.from({length:17},(_,i)=>'<i style="--h:'+(3+(i*7)%13)+'px"></i>').join('')+'</div>'+
    '<div class="v226-comm-info"><span>ACTIVE CHANNEL <b data-v226="contact">待機</b></span>'+
    '<span>LINK <b data-v226="link">--- </b></span><small data-v226="incoming">直近の受信記録を監視</small></div></div>'},
  eva:{title:'EVA / UNIT OPERATIONS',tag:'機体運用 / TELEMETRY',html:
    '<div class="v226-eva">'+[0,1,2].map(i=>'<span class="v226-unit" data-unit="'+i+'"><b>UNIT-0'+i+'</b><i data-v226="unit'+i+'">STANDBY</i></span>').join('')+'</div>'+
    '<p class="v226-eva-note" data-v226="evaSummary">装備・給電・稼働状況を監視</p>'}
 };
 for(const [name,spec] of Object.entries(specs)){
  const node=document.createElement('aside');node.className='v226-station';node.dataset.station=name;
  node.setAttribute('aria-label',spec.tag);
  node.innerHTML='<div class="v226-hdr"><strong>'+spec.title+'</strong><small>'+spec.tag+'</small></div>'+spec.html+
    '<p class="v226-live" data-v226="notice" role="status" aria-live="polite">実データと同期 / 模擬管制</p>';
  panels[name]=node;
 }
 const alarm=document.createElement('div');alarm.id='v226AlertStrip';alarm.className='v226-alert-strip';alarm.setAttribute('role','status');alarm.setAttribute('aria-live','polite');alarm.hidden=true;
 alarm.innerHTML='<i aria-hidden="true"></i><b>TACTICAL ALERT</b><span data-v226="alert">状況変化</span>';
 let currentName='',lastAlarm='',renders=0,changes=0,animations=0,transitions=0,activeCount=0,lastMessage='',lastReceipts={},initDone=false;
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const query=(name,key)=>panels[name]?.querySelector('[data-v226="'+key+'"]');
 const safe=(text,max=90)=>String(text==null?'':text).replace(/\s+/g,' ').slice(0,max);
 function set(node,value){const valueText=safe(value,120);if(node&&node.textContent!==valueText)node.textContent=valueText;}
 function motionAllowed(){return !document.hidden&&!reduced?.matches&&typeof isMoving==='function'&&isMoving();}
 function animate(key,elements,parameters,owner){
  if(!motionAllowed()||!owner?.isConnected)return;
  const list=(Array.isArray(elements)?elements:[elements]).filter(Boolean);if(!list.length)return;
  if(window.NERV_MOTION.animate('v226-'+key,list,{duration:450,composition:'replace',...parameters,onComplete:()=>{
   for(const e of list){e.style.removeProperty('opacity');e.style.removeProperty('transform');}},},owner))animations++;
 }
 function announce(node,name,line){
  const key=safe(line,95);
  if(lastReceipts[name]===key)return;
  if(lastReceipts[name]!==undefined){set(node.querySelector('[data-v226="notice"]'),line);
   animate(name+'-receipt',node.querySelector('[data-v226="notice"]'),{opacity:[.35,1],translateX:[7,0],duration:400,ease:'outCubic'},node);}
  lastReceipts[name]=key;
 }
 function mountedOwner(){
  const page=typeof currentPage==='string'?currentPage:'';
  const v=typeof mobileCurrent==='object'?mobileCurrent[page]:'';
  const name=page==='infra'&&v==='map'?'infra':page==='magi'&&v==='main'?'magi':
    page==='messages'?'messages':page==='work'&&v==='communications'?'messages':
    page==='eva'&&['monitor','control','neural'].includes(v)?'eva':'';
  const owner=name?(document.querySelector('.page.active .mobile-view:not([hidden])')||document.querySelector('.page.active')):null;
  return {name,owner};
 }
 function state(){
  if(typeof S==='undefined'||!S?.defense||!S?.infra||!S?.magi)return null;
  const enemy=S.defense.enemy||{},d=S.defense,infra=S.infra,mag=S.magi;
  let ctx=null,session=null;
  try{if(typeof consoleMagiContext==='function')ctx=consoleMagiContext();
   if(typeof consoleMagiSession==='function')session=consoleMagiSession();}catch(e){}
  const votes=Array.isArray(session?.decision)?session.decision:Array.isArray(mag.vote?.votes)?mag.vote.votes:[];
  const voteState=['MELCHIOR','BALTHASAR','CASPER'].map(x=>{
   const vote=votes.find(y=>typeof y?.name==='string'&&y.name.startsWith(x));
   return vote?(vote.yes?'AGREE':'DENY'):'STANDBY';
  });
  const selected=typeof personalContact!=='undefined'?personalContact:'';
  const name=typeof personalById==='function'?personalById(selected)?.name:'';
  const thread=typeof personalThread==='function'?personalThread()?.messages:[];
  const latest=Array.isArray(thread)?[...thread].reverse().find(x=>x?.from==='contact'):null;
  const active=d.status==='active',issue=!infra.power||!infra.comms||S.evas?.some(e=>e.state==='POWER_LOST')||false;
  return {active,issue,enemy,d,infra,mag,ctx,session,voteState,name,latest};
 }
 function apply(name,s){
  const panel=panels[name];if(!panel||!s)return;
  const alarmed=s.issue||s.d.status==='defeat';
  panel.dataset.alert=alarmed?'critical':s.active?'watch':'normal';
  let signature='';
  if(name==='infra'){
   const track=s.active?'CASE '+String(s.d.caseNo||0).padStart(3,'0')+' / 距離 '+String(s.enemy.dist??'--'):'NO CONTACT';
   const defense=s.active?'警戒・迎撃中':s.d.status==='victory'?'迎撃完了':'監視待機';
   set(query(name,'enemy'),track);set(query(name,'power'),s.infra.power?'ONLINE':'FAILURE');
   set(query(name,'comms'),s.infra.comms?'CONNECTED':'DISCONNECTED');
   set(query(name,'defense'),defense);set(query(name,'cityStatus'),alarmed?'WARNING / PRIORITY':s.active?'ENEMY CONTACT':'NOMINAL');
   const hexes=[...panel.querySelectorAll('[data-hex]')];for(let i=0;i<hexes.length;i++)hexes[i].dataset.hot=String(s.active&&i===3);
   signature=[track,s.infra.power,s.infra.comms,defense].join('|');
  }else if(name==='magi'){
   const observed=s.session?.observed?.length||0;
   const progress=s.ctx?.kind==='normal'?'三基審議 / '+(s.mag.approvedFor==null?'未承認':'承認済'):
     (s.ctx?.title||'独立診断')+' / 測定 '+observed+'/3';
   for(let i=0;i<3;i++){
    const vote=s.voteState[i],core=panel.querySelector('[data-core="'+i+'"]');
    core.dataset.result=vote;set(query(name,'vote'+i),vote);
   }
   set(query(name,'analysis'),progress);
   // This denotes number of actual measured cores, NOT fabricated analytic completion.
   const width=Math.round(Math.min(3,Math.max(0,observed))/3*100)+'%';
   const bar=query(name,'progress');if(bar?.style.width!==width)bar.style.width=width;
   signature=[...s.voteState,progress].join('|');
  }else if(name==='messages'){
   const last=s.latest?.text?safe(s.latest.text,92):'受信記録なし';
   set(query(name,'contact'),s.name||'連絡先未選択');
   set(query(name,'link'),s.infra.comms?'ONLINE':'OFFLINE');
   if(s.infra.comms&&s.latest?.id&&lastMessage&&lastMessage!==s.latest.id&&motionAllowed()){
    const node=query(name,'incoming');set(node,'');const target='受信 / '+last;
    window.NERV_MOTION.tween('v226-type',0,1,x=>{set(node,target.slice(0,Math.max(0,Math.ceil(target.length*x))));},node,550,{ease:'outCubic'});
   }else set(query(name,'incoming'),last==='受信記録なし'?last:'受信 / '+last);
   lastMessage=s.latest?.id||'';signature=[s.name,lastMessage,s.infra.comms].join('|');
  }else if(name==='eva'){
   const readings=(Array.isArray(S.evas)?S.evas:[]).slice(0,3);
   readings.forEach((u,i)=>{const textState=u?.state||'不明';const node=panel.querySelector('[data-unit="'+i+'"]');if(node)node.dataset.unitState=textState;set(query(name,'unit'+i),textState);});
   const deployed=readings.filter(u=>u.state==='DEPLOYED').length;
   set(query(name,'evaSummary'),'展開 '+deployed+'/3機 / '+(s.infra.power?'都市給電 ON':'都市給電 OFF'));
   signature=readings.map(e=>e?.state).join('|')+'|'+s.infra.power;
  }
  if(lastReceipts[name]!==undefined&&lastReceipts[name]!==signature){
   changes++;const targets=name==='infra'?[...panel.querySelectorAll('.v226-facts span,.v226-hex i')]:
    name==='magi'?[...panel.querySelectorAll('.v226-vote')]:
    name==='messages'?[panel.querySelector('.v226-comm-info')]:
    [...panel.querySelectorAll('.v226-unit')];
   animate(name+'-update',targets.slice(0,5),{opacity:[.45,1],translateY:[5,0],delay:window.anime.stagger(55),duration:410,ease:'outQuart'},panel);
   announce(panel,name,'状況更新 / '+(name==='infra'?'都市防衛':name==='magi'?'三基解析':name==='eva'?'機体状況':'通信回線'));
  }else if(lastReceipts[name]===undefined)lastReceipts[name]=signature;
  lastReceipts[name]=signature;
 }
 function alertStatus(s){
  if(!s)return;
  const value=typeof terminalAlert==='function'?terminalAlert():null;
  const level=value?.level||'nominal';
  const visible=level!=='nominal';
  alarm.hidden=!visible;
  if(visible){
   alarm.dataset.level=level;
   set(alarm.querySelector('[data-v226="alert"]'),value.title||'警戒情報');
   if(lastAlarm&&lastAlarm!==(level+'|'+value.key)&&motionAllowed()){
    animate('alert',[alarm.querySelector('b'),alarm.querySelector('span')],{opacity:[.3,1],translateX:[-8,0],delay:window.anime.stagger(75),duration:500,ease:'outExpo'},alarm);
   }
  }
  lastAlarm=level+'|'+(value?.key||'nominal');
  const shell=document.getElementById('shell');
  if(shell&&alarm.parentElement!==shell){shell.insertBefore(alarm,shell.firstChild);}
 }
 function render(){
  renders++;const where=mountedOwner(),s=state();
  if(currentName!==where.name){transitions++;currentName=where.name;}
  for(const [key,node] of Object.entries(panels)){if(key!==where.name&&node.isConnected)node.remove();}
  if(where.name&&where.owner){
   const panel=panels[where.name];
   if(panel.parentElement!==where.owner){where.owner.insertBefore(panel,where.owner.firstChild);activeCount++;}
   apply(where.name,s);
  }
  alertStatus(s);
 }
 const oldDraw=draw;
 draw=function(){oldDraw();render();};
 window.addEventListener('nerv-route',render);
 window.addEventListener('nerv-world-ready',render);
 document.addEventListener('visibilitychange',render);
 window.addEventListener('nerv-fx-quality',render);
 window.NERV_STATIONS={version:'2.26',snapshot:()=>({name:currentName,renders,changes,animations,transitions,activeCount,alert:alarm.hidden?'nominal':alarm.dataset.level,ownRAF:false,ownTimers:false,sourceAssetsModified:false})};
 initDone=true;render();
}
initV226Stations();
