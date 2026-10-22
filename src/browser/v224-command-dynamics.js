// v2.24: presentation-only command dynamics. Read simulation state; never mutate it.
// Uses the shared Anime.js/NERV_FX scheduler. No independent RAF, timer or network calls.
function initV224CommandDynamics(){
 if(!document.body||!document.getElementById('shell')||!window.NERV_MOTION||!window.NERV_MOBILE)return;
 const shell=document.getElementById('shell');
 const deck=document.createElement('section');
 deck.id='v224CommandDeck';deck.className='v224-command-deck';deck.setAttribute('aria-label','管制テレメトリ / 模擬訓練');
 deck.innerHTML='<div class="v224-title"><span>TACTICAL DATA LINK <small>SIMULATION / 訓練データ</small></span><b id="v224Condition">STANDBY</b></div>'+
  '<div class="v224-main"><div class="v224-scope" aria-hidden="true"><i class="v224-scope-grid"></i><i class="v224-scope-beam"></i><i class="v224-scope-ping"></i><strong id="v224ScopeTarget">00</strong></div>'+
  '<div class="v224-readouts"><div><small>TACTICAL TRACK / 目標</small><b id="v224Track">監視待機</b></div>'+
  '<div><small>MAGI / 三基管制</small><b id="v224Magi">照合待機</b></div>'+
  '<div><small>EVA / 作戦配備</small><b id="v224Eva">0 / 3 配備</b></div>'+
  '<div><small>COMMS / 通信</small><b id="v224Link">LINK READY</b></div></div></div>'+
  '<div class="v224-control"><button type="button" data-v224-jump="infra/map">戦術MAP</button>'+
  '<button type="button" data-v224-jump="magi/main">MAGI審議</button>'+
  '<button type="button" data-v224-jump="battle/engage">作戦指揮</button>'+
  '<button type="button" data-v224-jump="work/communications">通信</button></div>'+
  '<p class="v224-dispatch" id="v224Dispatch" role="status" aria-live="polite">当直端末と同期 / 操作は各担当画面で実行</p>';
 const wrapper=document.createElement('details');wrapper.className='v226-legacy-link';wrapper.id='v226DataLink';
 const summary=document.createElement('summary');summary.textContent='管制データリンク詳細 / EXPAND';
 wrapper.append(summary,deck);
 const $v=id=>deck.querySelector('#'+id);
 const values=new Map();const layers=new Map();let changeCount=0,signalCount=0,routeCount=0,lastSignature=null,lastCondition=null;
 function put(id,text){const e=$v(id),v=String(text);if(e&&values.get(id)!==v){e.textContent=v;values.set(id,v);}}
 function moving(){return !document.hidden&&typeof isMoving==='function'&&isMoving()&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
 function phaseName(x){return {approval:'発進承認',placement:'MAP配置',field:'交戦中'}[x]||'状況監視';}
 function current(){
  if(typeof S==='undefined'||!S||!S.defense||!Array.isArray(S.evas))return null;
  const d=S.defense,b=S.operatorConsole?.battle||null,m=S.magi||{},x=S.infra||{};
  const stage=b&&b.caseNo===d.caseNo?b.stage:null;
  const attack=d.status==='active',lost=S.evas.some(e=>e.state==='POWER_LOST'),risk=!x.power||!x.comms||lost;
  const intrusive=typeof magiIntrusionActive==='function'&&magiIntrusionActive();
  const critical=risk||intrusive||d.status==='defeat';
  const level=critical?'critical':attack?'watch':'normal';
  const track=attack?'CASE '+String(d.caseNo||0).padStart(3,'0')+' / 接近 '+String(d.enemy?.dist??'--'):d.status==='victory'?'直近迎撃完了':'敵性反応なし';
  const magi=intrusive?'侵入警報 / 隔離要':m.approvedFor!=null?'UNIT-0'+m.approvedFor+' 承認':'三基監視 / '+(m.vote?'審議記録あり':'待機');
  const n=S.evas.filter(e=>e.state==='DEPLOYED').length;
  const eva=n+'/3 配備'+(stage?' / '+phaseName(stage):'');
  const link=x.comms?'LINK / CONNECTED':'LINK / LOST';
  const signature=[level,d.caseNo,d.status,d.enemy?.dist,d.scans,d.round,stage,b?.ap,m.approvedFor,Boolean(m.vote),intrusive,n,x.comms,x.power,S.mission?.phase].join('|');
  return {level,track,magi,eva,link,attack,caseNo:d.caseNo||0,signature,stage,critical};
 }
 function activeOwner(){
  const page=typeof currentPage==='string'?currentPage:'';
  if(page!=='battle')return null;
  return document.querySelector('.page.active .mobile-view:not([hidden])')||document.querySelector('.page.active');
 }
 function mount(){
  const owner=activeOwner();
  if(!owner){wrapper.remove();return false;}
  if(wrapper.parentElement!==owner){owner.insertBefore(wrapper,owner.firstChild);routeCount++;}
  return true;
 }
 function dispatch(message,animate){
  put('v224Dispatch',message);
  if(animate&&moving()&&deck.isConnected){
   window.NERV_MOTION.animate('v224-dispatch',$v('v224Dispatch'),{opacity:[.45,1],translateY:[5,0],duration:340,ease:'outCubic',composition:'replace'},$v('v224Dispatch'));
  }
 }
 function render(){
  if(!mount())return;
  const snapshot=current();if(!snapshot)return;
  deck.dataset.condition=snapshot.level;
  document.body.dataset.v224Motion=moving()?'on':'off';
  put('v224Condition',snapshot.level==='critical'?'EMERGENCY':snapshot.level==='watch'?'TACTICAL ALERT':'ALL SYSTEMS');
  put('v224Track',snapshot.track);put('v224Magi',snapshot.magi);put('v224Eva',snapshot.eva);put('v224Link',snapshot.link);
  put('v224ScopeTarget',snapshot.attack?'CASE '+String(snapshot.caseNo).padStart(3,'0'):'SCAN');
  if(lastSignature!==null&&snapshot.signature!==lastSignature){
   changeCount++;
   const label=snapshot.critical?'警戒情報を更新':snapshot.attack?'戦術情報を更新':'系統状態を更新';
   dispatch(label+' / '+snapshot.track+' / '+snapshot.magi,true);
   const badge=$v('v224Condition');
   if(moving()&&badge){window.NERV_MOTION.animate('v224-condition',badge,{opacity:[.3,1],scale:[.96,1],duration:410,ease:'outQuart',composition:'replace'},badge);}
  }
  lastSignature=snapshot.signature;lastCondition=snapshot.level;
  for(const [canvas,overlay] of layers){
   if(!canvas.isConnected||!overlay.isConnected){overlay.remove();layers.delete(canvas);continue;}
   const parent=canvas.parentElement;if(!parent)continue;
   const r=canvas.getBoundingClientRect(),pr=parent.getBoundingClientRect();
   const left=Math.round(r.left-pr.left+parent.scrollLeft),top=Math.round(r.top-pr.top+parent.scrollTop);
   if(r.width>0&&r.height>0){
    const css=[left+'px',top+'px',Math.round(r.width)+'px',Math.round(r.height)+'px'];
    ['left','top','width','height'].forEach((k,i)=>{if(overlay.style[k]!==css[i])overlay.style[k]=css[i];});
   }
   overlay.hidden=r.width===0||r.height===0;
   overlay.dataset.condition=snapshot.level;
  }
 }
 function attachScopes(){
  // Strictly additive overlays. Never touch bitmap/canvas sources or rendering CSS.
  for(const id of ['consoleDeployMap','tokyoCanvasMap','tokyoCityCanvas','tokyoStreetCanvas']){
   const canvas=document.getElementById(id);
   if(!canvas||layers.has(canvas)||!canvas.parentElement)continue;
   const parent=canvas.parentElement;if(getComputedStyle(parent).position==='static')parent.style.position='relative';
   const layer=document.createElement('div');layer.className='v224-map-layer';layer.setAttribute('aria-hidden','true');
   layer.innerHTML='<i class="v224-map-sweep"></i><i class="v224-map-reticle"></i>';
   parent.append(layer);layers.set(canvas,layer);signalCount++;
  }
 }
 const allowed={'infra/map':true,'magi/main':true,'battle/engage':true,'work/communications':true};
 document.addEventListener('click',event=>{
  const target=event.target;if(!target||typeof target.closest!=='function')return;
  const jump=target.closest('[data-v224-jump]');
  if(jump&&deck.contains(jump)){
   const route=jump.dataset.v224Jump;if(!allowed[route])return;
   const parts=route.split('/');
   dispatch('業務画面を開く / '+jump.textContent.trim(),true);
   window.NERV_MOBILE.open(parts[0],parts[1]);return;
  }
  const action=target.closest('button[data-console-battle],button[data-console-magi],button[data-city-weapon],button[data-v27pick],button[data-console-mode],button[data-console-cell],button[data-route]');
  if(!action||action.disabled||!action.closest('.page.active'))return;
  const label=(action.textContent||action.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,42);
  if(!label)return;
  // A click is not proof of command completion; only the redraw/state change can confirm it.
  dispatch('操作受付 / '+label+' ・結果は管制画面で照合',true);
 },false);
 window.addEventListener('nerv-route',()=>{attachScopes();render();});
 window.addEventListener('nerv-world-ready',()=>{attachScopes();render();});
 window.addEventListener('nerv-fx-quality',render);
 document.addEventListener('visibilitychange',render);
 const previousDraw=draw;
 draw=function(){previousDraw();attachScopes();render();};
 window.NERV_COMMAND_DYNAMICS={version:'2.24',snapshot:()=>({changeCount,signalCount,routeCount,condition:lastCondition,mapLayers:layers.size,ownRAF:false,ownTimers:false,protectedArtworkUntouched:true})};
 attachScopes();render();
}
initV224CommandDynamics();
