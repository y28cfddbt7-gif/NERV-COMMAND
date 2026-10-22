// v2.25 TACTICAL COMMAND MOTION / additive, read-only controls.
// Anime.js 4.5.0 motion is manually advanced by existing NERV_MOTION/NERV_FX.
// No independent timer, RAF, new simulation state, API or asset manipulation.
function initV225TacticalMotion(){
 if(!window.NERV_MOTION||!window.NERV_MOBILE||!document.getElementById('shell'))return;
 const panel=document.createElement('section');
 panel.id='v225Ops';
 panel.className='v225-ops';
 panel.setAttribute('aria-label','管制判断支援 / 模擬訓練');
 panel.innerHTML=
  '<header class="v225-header"><span><b>TACTICAL COMMAND</b><small>OPERATOR DECISION CYCLE / SIM</small></span><strong id="v225Alert" class="v225-alert">STANDBY</strong></header>'+
  '<div class="v225-intel"><div class="v225-lock" aria-hidden="true"><i class="v225-cross"></i><i class="v225-acquire"></i><span id="v225LockCaption">SEARCH</span></div>'+
  '<div class="v225-intel-data"><div class="v225-pair"><small>CONTACT / 状況</small><b id="v225Contact">確認中</b></div>'+
  '<div class="v225-pair"><small>COMMAND / 指揮段階</small><b id="v225Stage">待機</b></div>'+
  '<div class="v225-pair"><small>RESOURCES / 戦術資源</small><b id="v225Resource">照合待ち</b></div></div></div>'+
  '<div class="v225-flow" aria-label="現行の作戦段階">'+
  '<span data-v225-step="detect">01 <b>索敵</b></span><span data-v225-step="approve">02 <b>審議</b></span>'+
  '<span data-v225-step="deploy">03 <b>配置</b></span><span data-v225-step="field">04 <b>戦闘</b></span></div>'+
  '<div class="v225-magi"><div class="v225-magi-label">MAGI / TRI-CORE DECISION <small id="v225MagiState">WAITING</small></div>'+
  '<div class="v225-cores">'+['MELCHIOR','BALTHASAR','CASPER'].map((name,i)=>'<div class="v225-core" data-v225-core="'+i+'" data-vote="idle"><div><b>'+name+'</b><em>待機</em></div><i><s></s></i></div>').join('')+'</div></div>'+
  '<div class="v225-decision"><div><small>NEXT AUTHORIZED WORKFLOW</small><strong id="v225Recommendation">管制情報を照合</strong><span id="v225Why">指令の実行は従来の担当画面で承認してください。</span></div>'+
  '<button type="button" id="v225Proceed" class="v225-proceed">担当画面を開く →</button></div>'+
  '<div class="v225-confirm"><span class="v225-beacon" aria-hidden="true"></span><span id="v225Receipt" role="status" aria-live="polite">管制監視中 / 既存の保存状態と連動</span></div>';
 const q=id=>panel.querySelector('#'+id);
 const steps=[...panel.querySelectorAll('[data-v225-step]')];
 const bars=[...panel.querySelectorAll('.v225-core')];
 const maxHistory=3,receipts=[];
 let lastKey='',lastRoute='',lastRecord='',renders=0,transitions=0,animations=0,redirects=0,stopped=0,route='infra/map';
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 function canMove(){return !document.hidden&&!reduced?.matches&&typeof isMoving==='function'&&isMoving();}
 function clean(){for(const el of panel.querySelectorAll('[data-v225-step],.v225-core,.v225-alert,.v225-lock,.v225-pair,.v225-decision,.v225-beacon')){el.style.removeProperty('opacity');el.style.removeProperty('transform');}}
 function motion(key,targets,props,owner=panel){
  if(!canMove()||!panel.isConnected)return false;
  const items=(Array.isArray(targets)?targets:[targets]).filter(Boolean);
  if(!items.length)return false;
  const running=window.NERV_MOTION.animate('v225-'+key,items,{...props,autoplay:false,composition:'replace',onComplete:()=>{
   for(const e of items){e.style.removeProperty('opacity');e.style.removeProperty('transform');}
  }},owner);
  if(running)animations++;return !!running;
 }
 function text(id,value){const el=q(id),next=String(value);if(el&&el.textContent!==next)el.textContent=next;}
 function snapshot(){
  if(typeof S==='undefined'||!S||!S.defense||!S.magi||!Array.isArray(S.evas))return null;
  const d=S.defense,e=d.enemy||{},x=S.infra||{},m=S.magi||{},b=S.operatorConsole?.battle;
  const stage=b&&b.caseNo===d.caseNo?b.stage:'';
  const active=d.status==='active';
  const issue=!x.power||!x.comms||S.evas.some(x=>x.state==='POWER_LOST')||
    (typeof magiIntrusionActive==='function'&&magiIntrusionActive());
  const votes=Array.isArray(S.operatorConsole?.magi?.decision)?S.operatorConsole.magi.decision:
    Array.isArray(m.vote?.votes)?m.vote.votes:[];
  const voteStates=['MELCHIOR','BALTHASAR','CASPER'].map(name=>{
   const v=votes.find(v=>v&&typeof v.name==='string'&&v.name.startsWith(name)&&typeof v.yes==='boolean');
   return v?(v.yes?'yes':'no'):'idle';
  });
  const deployed=S.evas.filter(u=>u.state==='DEPLOYED').length;
  let next;
  if(!x.power||!x.comms)next={label:'インフラ障害を確認',why:'送電・回線の状態を先に照合してください。',route:'infra/systems'};
  else if(typeof magiIntrusionActive==='function'&&magiIntrusionActive())next={label:'MAGI侵入対処',why:'外部侵入中は通常審議より封じ込めを優先。',route:'magi/main'};
  else if(active&&stage==='approval')next={label:'発進・MAGI承認を確認',why:'発進準備と出撃審議の条件を確認。',route:'battle/setup'};
  else if(active&&stage==='placement')next={label:'配置地点・兵装の確認',why:'遮蔽、給電、兵装を点検してから射出。',route:'battle/deploy'};
  else if(active&&stage==='field')next={label:'戦術盤で次の指令',why:'残AP・射界・被害状況を判断してください。',route:'battle/engage'};
  else if(active)next={label:'迎撃作戦を照合',why:'接近目標と出撃条件を作戦管制で確認。',route:'battle/setup'};
  else next={label:'都市管制で監視',why:'次の敵性反応に備えて施設状態を照合。',route:'infra/map'};
  const phase=active?stage==='field'?3:stage==='placement'?2:stage==='approval'?1:0:0;
  const event=Array.isArray(S.operatorConsole?.history)?S.operatorConsole.history.find(r=>r&&typeof r.text==='string'):null;
  const record=event?String(event.system)+'|'+String(event.at)+'|'+event.text.slice(0,90):'';
  const level=issue||d.status==='defeat'?'critical':active?'watch':'normal';
  return {d,e,m,active,stage,phase,issue,voteStates,deployed,next,level,record,
    key:[d.status,d.caseNo,d.round,e.dist,e.hp,d.scans,stage,b?.ap,deployed,voteStates.join(','),x.power,x.comms,m.approvedFor,record].join('|'),
    indicator:active?'CASE '+String(d.caseNo||0).padStart(3,'0')+' / DIST '+String(e.dist??'--'):'NO HOSTILE TRACK',
    stageText:active?{approval:'発進承認',placement:'配置・給電',field:'戦術交戦'}[stage]||'接近検知':d.status==='victory'?'迎撃完了':'平時監視',
    resource:stage==='field'&&typeof b?.ap==='number'?'残 '+b.ap+' AP / EVA '+deployed+'機':'EVA '+deployed+'/3機 / MAGI '+(m.approvedFor==null?'未承認':'承認済'),
  };
 }
 function ensurePosition(){
  const deck=document.getElementById('v224CommandDeck');
  if(!deck?.isConnected){panel.remove();return false;}
  if(panel.previousElementSibling!==deck||panel.parentElement!==deck.parentElement)deck.after(panel);
  return true;
 }
 function receipt(value){
  if(!value||receipts[0]===value)return;receipts.unshift(value);receipts.length=Math.min(receipts.length,maxHistory);
  text('v225Receipt',receipts[0]);
  motion('receipt',q('v225Receipt'),{opacity:[.3,1],translateX:[6,0],duration:350,ease:'outQuart'},q('v225Receipt'));
 }
 function show(snapshot){
  if(!ensurePosition())return;
  renders++;
  const s=snapshot||snapshotNow();if(!s)return;
  panel.dataset.alert=s.level;panel.dataset.state=s.active?'contact':'standby';
  text('v225Alert',s.level==='critical'?'EMERGENCY':s.level==='watch'?'TRACKING':'NOMINAL');
  text('v225Contact',s.indicator);text('v225LockCaption',s.active?'TRACK LOCK':'SEARCH');
  text('v225Stage',s.stageText);text('v225Resource',s.resource);
  text('v225Recommendation',s.next.label);text('v225Why',s.next.why);
  q('v225Proceed').dataset.v225Route=s.next.route;route=s.next.route;
  const v=s.voteStates;
  const allAgree=v.every(x=>x==='yes'),voted=v.some(x=>x!=='idle');
  text('v225MagiState',!voted?'AWAITING CONSENSUS':allAgree?'UNANIMOUS':'DECISION RECORDED');
  for(let i=0;i<bars.length;i++){
   bars[i].dataset.vote=v[i];const em=bars[i].querySelector('em');
   em.textContent=v[i]==='yes'?'賛成':v[i]==='no'?'否決':'待機';
  }
  for(let i=0;i<steps.length;i++){
   steps[i].dataset.progress=s.active?(i<s.phase?'done':i===s.phase?'now':'future'):'idle';
  }
  const changed=lastKey!==''&&s.key!==lastKey;
  const first=lastKey==='';
  const recorded=s.record&&s.record!==lastRecord;
  if(recorded&&lastRecord){receipt('管制記録更新 / '+s.record.split('|').slice(2).join('|').slice(0,52));}
  if(changed){transitions++;
   clean();
   motion('flow',steps,{opacity:[.48,1],translateY:[7,0],delay:window.anime.stagger(50),duration:390,ease:'outCubic'});
   motion('core',bars,{opacity:[.55,1],scaleX:[.94,1],delay:window.anime.stagger(65),duration:480,ease:'outExpo'});
   motion('vote-fill',bars.map(x=>x.querySelector('i s')),{scaleX:[.05,1],delay:window.anime.stagger(65),duration:510,ease:'outExpo'});
   motion('resource',q('v225Resource'),{opacity:[.3,1],translateX:[12,0],duration:490,ease:'outQuart'},q('v225Resource'));
   motion('next',q('v225Proceed'),{scale:[.96,1],opacity:[.65,1],duration:440,ease:'outBack(1.25)'},q('v225Proceed'));
   if(s.active)motion('track',q('v225LockCaption'),{opacity:[.25,1],scale:[.83,1],duration:480,ease:'outBack(1.5)'},q('v225LockCaption'));
   if(s.level==='critical')motion('emergency',q('v225Alert'),{opacity:[.18,1],translateX:[-8,0],duration:460,ease:'outQuart'},q('v225Alert'));
  }else if(first){motion('entry',[...panel.querySelectorAll('.v225-pair'),q('v225Proceed')],{opacity:[.3,1],translateY:[8,0],delay:window.anime.stagger(45),duration:440,ease:'outCubic'});}
  lastKey=s.key;lastRecord=s.record;
 }
 function snapshotNow(){try{return snapshot();}catch(error){return null;}}
 function onRoute(){clean();const target=document.body?.dataset?.interfaceView||((typeof currentPage==='string'?currentPage:'')+'/'+(typeof mobileCurrent==='object'?mobileCurrent[currentPage]||'':''));if(target!==lastRoute){lastRoute=target;lastKey='';stopped++;}show();}
 const oldDraw=draw;
 draw=function(){oldDraw();show();};
 q('v225Proceed').addEventListener('click',()=>{
  const target=q('v225Proceed').dataset.v225Route||route;
  const routes=new Set(['infra/map','infra/systems','magi/main','battle/setup','battle/deploy','battle/engage']);
  if(!routes.has(target))return;
  receipt('担当画面へ移動 / '+q('v225Recommendation').textContent+'（実行は別途承認）');
  redirects++;const [page,view]=target.split('/');window.NERV_MOBILE.open(page,view);
 });
 window.addEventListener('nerv-route',onRoute);
 window.addEventListener('nerv-world-ready',onRoute);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clean();}else onRoute();});
 window.addEventListener('nerv-fx-quality',onRoute);
 window.NERV_TACTICAL_MOTION={version:'2.25',snapshot:()=>({renders,transitions,animations,redirects,stopped,ownRAF:false,ownTimers:false,route,
  originalArtworkChanged:false,view:panel.isConnected,decision:snapshotNow()?.next?.label})};
 show();
}
initV225TacticalMotion();
