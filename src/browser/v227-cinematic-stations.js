// v2.27 / Cinematic workstations. Additive HUD only, never alter source art or reducers.
// The existing NERV_MOTION Anime.js v4 scheduler drives every finite JS animation.
function initV227CinematicStations(){
 if(!window.NERV_MOTION||!document.getElementById('shell'))return;
 const canvases=new Map(), nodes={}, last={}, stats={renders:0,animations:0,mounts:0,changes:0};
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const moving=()=>!document.hidden&&!reduced?.matches&&typeof isMoving==='function'&&isMoving();
 const panelVisible=e=>!!e?.isConnected&&e.getClientRects().length>0;
 const put=(el,s)=>{const v=String(s??'--');if(el&&el.textContent!==v)el.textContent=v;};
 function cue(key,els,props,owner){
  if(!moving()||!panelVisible(owner))return false;
  const list=(Array.isArray(els)?els:[els]).filter(Boolean);if(!list.length)return false;
  const ok=window.NERV_MOTION.animate('v227-'+key,list,{
   duration:440,ease:'outCubic',composition:'replace',...props,
   onComplete:()=>list.forEach(e=>{e.style.removeProperty('opacity');e.style.removeProperty('transform');})
  },owner);
  if(ok)stats.animations++;
  return !!ok;
 }
 function createOnce(target,id,build,position='inside'){
  if(!target)return null;
  let item=document.getElementById(id);
  if(!item){
   item=document.createElement('div');item.id=id;item.className='v227-overlay';
   item.setAttribute('aria-hidden','true');item.innerHTML=build;
   if(position==='after')target.after(item);else target.append(item);
   stats.mounts++;
  }
  return item;
 }
 function current(){
  try{
   if(typeof S==='undefined'||!S||!S.defense||!S.infra||!S.magi)return null;
   const d=S.defense,infra=S.infra,m=S.magi,b=S.operatorConsole?.battle||{};
   const session=typeof consoleMagiSession==='function'?consoleMagiSession():null;
   const ctx=typeof consoleMagiContext==='function'?consoleMagiContext():null;
   const votes=Array.isArray(session?.decision)?session.decision:Array.isArray(m.vote?.votes)?m.vote.votes:[];
   const tri=['MELCHIOR','BALTHASAR','CASPER'].map(n=>{
    const found=votes.find(x=>x&&typeof x.name==='string'&&x.name.startsWith(n));
    return found?(found.yes?'yes':'no'):'idle';
   });
   const intrude=typeof magiIntrusionActive==='function'&&magiIntrusionActive();
   const critical=!infra.power||!infra.comms||intrude||d.status==='defeat'||S.evas?.some(e=>e.state==='POWER_LOST');
   const stage=b.caseNo===d.caseNo?b.stage:'';
   const contact=d.status==='active',dist=contact?String(d.enemy?.dist??'--'):'--';
   const turn=Number.isFinite(d.round)?d.round:0;
   const unit=Number.isInteger(b.unit)?b.unit:Number(S.tactics?.attacker||0);
   const ap=typeof b.ap==='number'?b.ap:'--';
   const latest=typeof personalThread==='function'?personalThread()?.messages?.slice(-1)[0]:null;
   const who=typeof personalContact!=='undefined'&&typeof personalById==='function'?personalById(personalContact):null;
   return {d,infra,m,b,session,ctx,tri,intrude,critical,stage,contact,dist,turn,unit,ap,latest,who};
  }catch(e){return null;}
 }
 function mountMagi(){
  const board=document.getElementById('consoleMagiBoard');if(!board)return;
  const overlay=createOnce(board,'v227MagiOverlay',
   '<div class="v227-magi-top"><span>MAGI SYS · 03 CORES</span><span class="v227-code">CNS / 01 - 03</span></div>'+
   '<div class="v227-magi-net"><i class="v227-pulse p1"></i><i class="v227-pulse p2"></i><i class="v227-pulse p3"></i></div>'+
   '<span class="v227-magi-crosshair a"></span><span class="v227-magi-crosshair b"></span>'+
   '<div class="v227-magi-bottom"><span id="v227MagiPulse">INDEPENDENT PROCESSING</span><span>GEOFRONT / LOCAL</span></div>');
  const existing=document.getElementById('v227MagiBus');
  if(!existing){
   const bus=document.createElement('section');bus.id='v227MagiBus';bus.className='v227-magi-bus';bus.setAttribute('aria-label','MAGI実測と審議結果');
   bus.innerHTML='<div class="v227-bus-top"><span>TRI-PERSONALITY CONSENSUS</span><strong id="v227VoteHeadline">STANDBY</strong></div>'+
    '<div class="v227-vote-array">'+['MELCHIOR','BALTHASAR','CASPER'].map((n,i)=>'<span class="v227-vote-cell" data-core="'+i+'"><b>'+n+'</b><strong>待機</strong><i></i></span>').join('')+'</div>'+
    '<div class="v227-bus-foot"><b id="v227CoreProgress">測定 0/3</b><div class="v227-bus-meter"><i id="v227BusFill"></i></div><small id="v227MagiOperation">独立判断待機</small></div>';
   board.after(bus);stats.mounts++;
  }
  board.classList.add('v227-magi-equipped');
  nodes.magi=overlay;
 }
 function mountCity(){
  const canvas=document.getElementById('tokyoCityCanvas');
  if(!canvas||!canvas.parentElement)return;
  const parent=canvas.parentElement;
  const layer=createOnce(parent,'v227CityOverlay',
   '<div class="v227-map-top"><b>GEOGRAPHICAL WARNING DATA</b><strong id="v227CityTrack">SECTOR CLEAR</strong></div>'+
   '<div class="v227-city-grid">'+Array.from({length:19},(_,i)=>'<i data-hex="'+i+'"></i>').join('')+'</div>'+
   '<div class="v227-target"><i></i><b id="v227TargetCode">TGT / 000</b></div>'+
   '<div class="v227-map-panels">'+
    '<span>POWER / <b id="v227Power">ONLINE</b></span>'+
    '<span>COMMS / <b id="v227Comms">LINK</b></span>'+
    '<span>THREAT / <b id="v227Threat">NONE</b></span>'+
    '</div><div class="v227-map-bottom">DEFENSE MAP / SIMULATION <i>TRACKING GRID</i></div>');
  nodes.city=layer;
  parent.classList.add('v227-city-host');
 }
 function mountBattle(){
  const stage=document.getElementById('battleStage');if(!stage)return;
  const layer=createOnce(stage,'v227BattleOverlay',
   '<div class="v227-battle-head"><span>TACTICAL ACQUISITION</span><b id="v227BattleStage">WAITING</b></div>'+
   '<div class="v227-lock-shape"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i><b id="v227LockLabel">NO TARGET</b></div>'+
   '<div class="v227-battle-side"><span>RANGE <b id="v227Range">--</b></span><span>AP <b id="v227AP">--</b></span></div>'+
   '<div class="v227-battle-tail">UNIT CONTROL <b id="v227Unit">00</b> / COMMAND APPROVAL REQUIRED</div>');
  nodes.battle=layer;
  stage.classList.add('v227-battle-host');
 }
 function mountComms(){
  const host=document.querySelector('.v226-station[data-station="messages"]');
  if(!host)return;
  if(!document.getElementById('v227SignalRack')){
   const rack=document.createElement('div');rack.id='v227SignalRack';rack.className='v227-signal-rack';
   rack.innerHTML='<div class="v227-signal-title"><b>CHANNEL MONITOR / AUDIO LINK</b><strong id="v227CommsMode">LISTENING</strong></div>'+
    '<div class="v227-wave-bars" aria-hidden="true">'+Array.from({length:23},(_,i)=>'<i style="--v227-bar:'+(8+(i*13)%42)+'%"></i>').join('')+'</div>'+
    '<div class="v227-signal-foot"><span id="v227Operator">OPERATOR / STANDBY</span><span id="v227CommsState">LINK OK</span></div>';
   host.append(rack);stats.mounts++;
  }
  host.classList.add('v227-comms-equipped');
 }
 function updateMagi(s){
  const bus=document.getElementById('v227MagiBus');
  if(!bus)return;
  const measured=Array.isArray(s.session?.observed)?s.session.observed.length:0;
  const active=s.tri.filter(x=>x!=='idle').length,unanimous=active===3&&s.tri.every(x=>x==='yes');
  const signature=[...s.tri,measured,s.ctx?.kind,s.ctx?.stage,s.intrude].join('/');
  const title=s.intrude?'INTRUSION WARNING':unanimous?'CONSENSUS APPROVED':active?'BALLOT REGISTERED':'TRI-CORE STANDBY';
  put(document.getElementById('v227VoteHeadline'),title);
  put(document.getElementById('v227MagiPulse'),s.intrude?'666 EXTERNAL INTRUSION':s.ctx?.kind==='normal'?'CONSENSUS CHANNEL ACTIVE':'INDEPENDENT DIAGNOSTICS');
  put(document.getElementById('v227CoreProgress'),'測定 '+measured+'/3');
  put(document.getElementById('v227MagiOperation'),s.ctx?.title||'通常審議');
  const fill=document.getElementById('v227BusFill');
  if(fill)fill.style.width=Math.max(0,Math.min(100,measured*100/3))+'%';
  for(const [i,value] of s.tri.entries()){
   const el=bus.querySelector('.v227-vote-cell[data-core="'+i+'"]');if(!el)continue;
   el.dataset.vote=value;put(el.querySelector('strong'),value==='yes'?'承認':value==='no'?'否決':'待機');
  }
  const board=document.getElementById('consoleMagiBoard');if(board)board.dataset.v227Status=s.intrude?'warning':unanimous?'approved':'normal';
  if(last.magi!==undefined&&last.magi!==signature){
   stats.changes++;cue('magi-bus',[...bus.querySelectorAll('.v227-vote-cell')],{opacity:[.5,1],translateY:[6,0],delay:window.anime.stagger(58),duration:480,ease:'outCubic'},bus);
   cue('magi-signal',[...board.querySelectorAll('.v227-pulse')],{scale:[.3,1],opacity:[0,1],delay:window.anime.stagger(90),duration:590,ease:'outQuart'},board);
  }
  last.magi=signature;
 }
 function updateCity(s){
  const node=nodes.city;if(!node?.isConnected)return;
  const signature=[s.contact,s.dist,s.infra.power,s.infra.comms,s.d.caseNo,s.critical].join('/');
  node.dataset.threat=s.critical?'critical':s.contact?'tracking':'nominal';
  put(document.getElementById('v227CityTrack'),s.contact?'CASE '+String(s.d.caseNo).padStart(3,'0'):'NO HOSTILE TRACK');
  put(document.getElementById('v227Power'),s.infra.power?'ACTIVE':'FAIL');
  put(document.getElementById('v227Comms'),s.infra.comms?'ONLINE':'LOST');
  put(document.getElementById('v227Threat'),s.contact?'DIST '+s.dist:'CLEAR');
  put(document.getElementById('v227TargetCode'),s.contact?'ANGEL / '+String(s.d.caseNo).padStart(3,'0'):'TGT / NONE');
  // Tactical sectors are based on saved lane (0-2) and approach distance (0-9).
  // Coordinates are schematic, never presented as GPS.
  const lane=Math.max(0,Math.min(2,Math.round(Number(s.d.enemy?.lane)||0)));
  const row=Math.max(0,Math.min(3,Math.round((9-Math.max(0,Math.min(9,Number(s.d.enemy?.dist)||0)))/3)));
  const sectorIndex=row*5+[0,2,4][lane];
  const cells=[...node.querySelectorAll('.v227-city-grid i')];
  cells.forEach((cell,i)=>{cell.dataset.track=s.contact&&i===sectorIndex?'true':'false';});
  const target=node.querySelector('.v227-target');
  if(target){target.style.left=([28,50,72][lane])+'%';target.style.top=(24+row*14)+'%';}
  if(last.city!==undefined&&last.city!==signature){
   stats.changes++;cue('city-warning',node.querySelectorAll('.v227-map-panels span').length?[...node.querySelectorAll('.v227-map-panels span')]:[],{opacity:[.25,1],translateX:[-7,0],delay:window.anime.stagger(75),duration:420},node);
   cue('city-lock',node.querySelector('.v227-target'),{scale:[1.25,1],opacity:[.3,1],duration:490,ease:'outExpo'},node);
  }
  last.city=signature;
 }
 function updateBattle(s){
  const node=nodes.battle;if(!node?.isConnected)return;
  const signature=[s.contact,s.d.caseNo,s.dist,s.stage,s.ap,s.unit,s.turn].join('/');
  node.dataset.threat=s.critical?'critical':s.contact?'tracking':'nominal';
  put(document.getElementById('v227BattleStage'),s.stage==='field'?'ENGAGEMENT':s.stage==='placement'?'DEPLOYMENT':s.stage==='approval'?'APPROVAL':'STANDBY');
  put(document.getElementById('v227LockLabel'),s.contact?'TARGET LOCK':'NO CONTACT');
  put(document.getElementById('v227Range'),s.dist);
  put(document.getElementById('v227AP'),s.ap);
  put(document.getElementById('v227Unit'),'0'+s.unit);
  if(last.battle!==undefined&&signature!==last.battle){
   stats.changes++;cue('battle-reticle',node.querySelector('.v227-lock-shape'),{scale:[1.18,1],opacity:[.48,1],duration:500,ease:'outExpo'},node);
  }
  last.battle=signature;
 }
 function updateComms(s){
  const host=document.getElementById('v227SignalRack');if(!host)return;
  const text=s.who?.name||'管制回線';
  const hasMessage=s.latest?.from==='contact';
  const signature=[text,s.infra.comms,s.latest?.id].join('/');
  put(document.getElementById('v227Operator'),text+' / '+(hasMessage?'受信記録あり':'監視中'));
  put(document.getElementById('v227CommsState'),s.infra.comms?'CHANNEL OPEN':'LINK LOST');
  put(document.getElementById('v227CommsMode'),!s.infra.comms?'NO SIGNAL':hasMessage?'SIGNAL RECEIVED':'LISTENING');
  host.dataset.signal=s.infra.comms?'online':'offline';
  if(last.comms!==undefined&&last.comms!==signature){
   stats.changes++;cue('comms-signal',[...host.querySelectorAll('.v227-wave-bars i')].slice(0,8),{scaleY:[.2,1],opacity:[.3,1],delay:window.anime.stagger(45),duration:400},host);
  }
  last.comms=signature;
 }
 function render(){
  const state=current();if(!state)return;
  mountMagi();mountCity();mountBattle();mountComms();
  const page=typeof currentPage==='string'?currentPage:'';
  if(page==='magi')updateMagi(state);
  if(page==='infra')updateCity(state);
  if(page==='battle')updateBattle(state);
  if(page==='messages'||page==='work')updateComms(state);
  stats.renders++;
 }
 const oldDraw=draw;
 draw=function(){oldDraw();render();};
 window.addEventListener('nerv-route',render);
 window.addEventListener('nerv-world-ready',render);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
 window.NERV_CINEMATIC={version:'2.27',snapshot:()=>({...stats,ownRAF:false,ownTimers:false,imagesModified:false,latest:{...last}})};
 render();
}
initV227CinematicStations();
