// Pointer-driven field control and visible, confirmed-action Canvas effects.
function initV217Tactics(){
 if(!window.NERV_BATTLE||!window.NERV_TACTICAL)return;
 const stage=$('battleStage'),canvas=document.createElement('canvas');canvas.id='battleTacticalCanvas';canvas.tabIndex=0;canvas.setAttribute('role','application');canvas.setAttribute('aria-label','戦術盤。機体を隣接区画へドラッグ。上部コアをタップして照準。キーボードはMで移動、Aで照準、矢印で調整、Enterで確定。');stage.append(canvas);
 const panel=document.createElement('div');panel.id='battleTactics';panel.innerHTML='<p id="tacticalTelemetry" class="tactical-telemetry"></p><p id="tacticalWarning" role="status"></p><div class="tactical-controls">'+[['scan','対象解析'],['at','A.T.展開'],['neutralize','敵A.T.中和'],['guard','防御・1手'],['charge','陽電子充填'],['supply','補助送電'],['focus','狙撃姿勢・1手'],['cable','外部給電']].map(([key,label])=>'<button data-tactical="'+key+'">'+label+'</button>').join('')+'</div><button id="tacticalFire" class="staff-primary">照準を指定して攻撃</button><p id="tacticalFeedback" role="status" aria-live="polite"></p><button id="tacticalSupport" class="staff-secondary" data-tactical="support">都市援護：待機</button>';
 qs('.battle-orders').after(panel);
 const activate=document.createElement('button');activate.id='tacticalActivate';activate.className='staff-primary';activate.textContent='現在の作戦を戦術操作へ移行';$('battleTactics').before(activate);
 const help=document.createElement('p');help.className='tactical-instructions';help.id='tacticalInstructions';help.textContent='機体をドラッグして隣へ移動 ／ 赤区画は次の攻撃。解析後、上のコアを狙って攻撃。';stage.after(help);
 let pending=false,message='',gesture=null,preview=null,keyMode='',keyPoint=null,fx=null,frames=0,lastPosition='',effectFrames=0,lastCase=S.defense.caseNo;
 function setMessage(s){message=s;meteoText('tacticalFeedback',s);}
 async function act(action,payload){if(pending)return {ok:false,error:'処理中です'};pending=true;render();try{const r=await tacticalCommand(action,payload);if(action!=='fire'||!r.ok)setMessage(r.ok?(action==='aim'?'照準記録 / 武器と中和条件を確認して攻撃':action==='fire'?(tacticalState()?.last||'攻撃結果を記録しました'):'操作記録済み / '+(tacticalState()?.last||'')):r.error);return r;}finally{pending=false;render();NERV_FX.refresh();}}
 activate.addEventListener('click',()=>act('activate'));
 for(const id of ['v27Advance','strategyAdvance'])$(id)?.addEventListener('click',event=>{if(tacticalActive()){event.stopImmediatePropagation();act('wait');}},true);
 for(const b of panel.querySelectorAll('[data-tactical]'))b.addEventListener('click',()=>act(b.dataset.tactical));
 $('tacticalFire').addEventListener('click',()=>act('fire'));
 $('battleStart').addEventListener('click',async event=>{event.stopImmediatePropagation();if(S.defense.status==='active'){NERV_MOBILE.open('battle','engage');return;}const angel=qs('[data-battle-target][aria-pressed="true"]')?.dataset.battleTarget||'sachiel';const r=await act('start',{angel});if(r.ok)NERV_MOBILE.open('battle','engage');},true);
 function point(event){const r=canvas.getBoundingClientRect();return {x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height};}
 function nearest(p){let best=null,dist=Infinity;for(let row=1;row<=3;row++)for(let col=0;col<3;col++){const at=tacticalPoint(col,row),d=Math.hypot(p.x-at.x,p.y-at.y);if(d<dist){best={col,row};dist=d;}}return best;}
 canvas.addEventListener('pointerdown',event=>{if(pending||tacticalReady().length)return;const p=point(event),t=tacticalState(),at=tacticalPoint(t.pos.col,t.pos.row);const consoleMode=canvas.dataset.consoleFieldMode;if(consoleMode==='guard')return;gesture={mode:consoleMode?(consoleMode==='move'?'move':'aim'):(Math.hypot(p.x-at.x,p.y-at.y)<.17?'move':'aim'),start:p};preview=p;canvas.setPointerCapture(event.pointerId);paint();event.preventDefault();});
 canvas.addEventListener('pointermove',event=>{if(!gesture)return;preview=point(event);paint();});
 canvas.addEventListener('pointerup',event=>{if(!gesture)return;const mode=gesture.mode,p=point(event);gesture=null;preview=null;try{canvas.releasePointerCapture(event.pointerId);}catch(error){}if(mode==='move')act('move',nearest(p));else act('aim',p);paint();});
 canvas.addEventListener('pointercancel',()=>{gesture=null;preview=null;paint();});
 canvas.addEventListener('keydown',event=>{
  if(pending||tacticalReady().length)return;const t=tacticalState();
  if(event.key.toLowerCase()==='m'){keyMode='move';keyPoint={...t.pos};setMessage('移動：矢印で隣接区画、Enterで確定');}
  else if(event.key.toLowerCase()==='a'){keyMode='aim';keyPoint={...tacticalTarget()};setMessage('照準：矢印で調整、Enterで確定');}
  else if(event.key==='Escape'){keyMode='';keyPoint=null;}
  else if(event.key==='Enter'&&keyPoint){const mode=keyMode,p={...keyPoint};keyMode='';keyPoint=null;act(mode,p);}
  else if(event.key.startsWith('Arrow')&&keyPoint){const dx=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0,dy=event.key==='ArrowUp'?-1:event.key==='ArrowDown'?1:0;if(keyMode==='move'){keyPoint.col=v27Clamp(keyPoint.col+dx,0,2);keyPoint.row=v27Clamp(keyPoint.row+dy,1,3);}else{keyPoint.x=v27Clamp(keyPoint.x+dx*.015,0,1);keyPoint.y=v27Clamp(keyPoint.y+dy*.015,0,1);}}
  else return;event.preventDefault();paint();
 });
 function visible(){return currentPage==='battle'&&mobileCurrent.battle==='engage'&&!document.hidden&&canvas.getBoundingClientRect().bottom>0&&canvas.getBoundingClientRect().top<innerHeight;}
 function paint(){
  if(!visible())return;const r=canvas.getBoundingClientRect(),dpr=Math.min(1.5,devicePixelRatio||1),w=r.width,h=r.height;if(!w||!h)return;
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
  const g=canvas.getContext('2d');if(!g)return;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);frames++;
  const t=tacticalState();if(!t)return;try{tacticalValidate(t);}catch(error){return;}
  g.fillStyle='#00100d66';g.fillRect(0,0,w,h);g.font='9px monospace';
  for(let row=1;row<=3;row++)for(let col=0;col<3;col++){
   const p=tacticalPoint(col,row),width=(.17+row*.045)*w,hh=h*.14,x=p.x*w-width*.46,y=p.y*h-hh*.5,threat=t.enemyPlan.columns.includes(col)&&t.enemyPlan.rows.includes(row),cover=row===2&&col!==1;
   g.fillStyle=threat?'#e6412b38':cover?'#6dc5b421':'#173c3214';g.fillRect(x,y,width*.92,hh);g.strokeStyle=threat?'#ff735a':'#b7d0aa88';g.lineWidth=threat?1.4:.7;g.strokeRect(x,y,width*.92,hh);
   g.fillStyle=threat?'#ffab81':cover?'#a3e6cf':'#bfd3b4';g.fillText((threat?'!! ':cover?'遮蔽 ':'')+['W','C','E'][col]+row,x+4,y+12);
  }
  const core=tacticalTarget(),radius=tacticalRadius();if(S.defense.scans>=34){g.strokeStyle='#ffce7c';g.lineWidth=1.2;g.setLineDash([3,4]);g.beginPath();g.ellipse(core.x*w,core.y*h,radius*w,radius*h,0,0,7);g.stroke();g.setLineDash([]);g.fillStyle='#ffdc97';g.fillText('CORE / AIM',core.x*w+13,core.y*h-10);}
  const aim=gesture?.mode==='aim'?preview:keyMode==='aim'?keyPoint:t.aim;if(aim){const x=aim.x*w,y=aim.y*h;g.strokeStyle='#e8ffe7';g.lineWidth=1.5;g.beginPath();g.moveTo(x-16,y);g.lineTo(x+16,y);g.moveTo(x,y-13);g.lineTo(x,y+13);g.stroke();g.strokeRect(x-9,y-9,18,18);}
  const move=gesture?.mode==='move'?nearest(preview):keyMode==='move'?keyPoint:null;if(move){const p=tacticalPoint(move.col,move.row);g.strokeStyle='#ffda85';g.lineWidth=3;g.strokeRect(p.x*w-18,p.y*h-18,36,36);}
  if(fx){
   const elapsed=(performance.now()-fx.at)/900,progress=isMoving()?Math.min(1,elapsed):1;g.save();g.shadowBlur=S.prefs.fxQuality==='low'?0:12;g.shadowColor=fx.weapon==='positron'?'#8ae9ff':'#ffb35e';
   if(fx.type==='shot'){
    const a={x:fx.from.x*w,y:fx.from.y*h-h*.12},b={x:fx.to.x*w,y:fx.to.y*h},x=a.x+(b.x-a.x)*progress,y=a.y+(b.y-a.y)*progress;
    if(fx.weapon==='knife'){g.strokeStyle='#fff1b4';g.lineWidth=5;g.beginPath();g.moveTo(b.x-28,b.y+30);g.quadraticCurveTo(b.x+38,b.y-25,b.x-10,b.y-35);g.stroke();g.strokeStyle='#ffab54';g.lineWidth=1;g.stroke();}
    else{g.strokeStyle=fx.weapon==='positron'?'#a9f5ff':'#ffd592';g.lineWidth=fx.weapon==='positron'?9:3;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(x,y);g.stroke();g.strokeStyle='#fffdef';g.lineWidth=fx.weapon==='positron'?3:1;g.stroke();}
    if(progress>.45||!isMoving()){for(let k=0;k<12;k++){const angle=k*Math.PI/6,rr=9+progress*20;g.strokeStyle=fx.hit?'#ffda84':'#a1aba2';g.lineWidth=1.5;g.beginPath();g.moveTo(b.x+Math.cos(angle)*8,b.y+Math.sin(angle)*8);g.lineTo(b.x+Math.cos(angle)*rr,b.y+Math.sin(angle)*rr);g.stroke();}g.font='bold 12px monospace';g.fillStyle=fx.hit?'#ffebad':'#d4d5bf';g.fillText(fx.hit?'HIT −'+fx.damage:'MISS',Math.min(w-78,b.x+20),b.y+30);}
   }else{
    const p=tacticalPoint(t.pos.col,t.pos.row);g.strokeStyle=fx.loss?'#ff8055':'#83dfc1';g.lineWidth=fx.loss?4:2;g.beginPath();g.moveTo(w*.5,h*.23);g.lineTo(p.x*w,p.y*h);g.stroke();g.font='bold 11px monospace';g.fillStyle=g.strokeStyle;g.fillText(fx.loss?'DAMAGE −'+fx.loss:'EVADE',8,h-22);
   }
   g.restore();effectFrames++;if(isMoving()&&elapsed>=1)fx.finished=true;
  }
 }
 function render(){
  if(!staffWorldReady)return;const active=tacticalActive(),t=tacticalState(),d=S.defense,e=S.evas[S.tactics.attacker],deployed=e.state==='DEPLOYED';
  if(lastCase!==d.caseNo){lastCase=d.caseNo;fx=null;message='';keyMode='';keyPoint=null;}
  let valid=active;try{if(t)tacticalValidate(t);}catch(error){valid=false;message=error.message;}
  stage.classList.toggle('tactical-stage',valid);panel.hidden=!active;help.hidden=!valid;activate.hidden=d.status!=='active'||active;activate.disabled=pending;
  const manual=active&&deployed&&d.status==='active';$('battleDo').hidden=manual;$('battleOrderDetail').hidden=manual;qs('.battle-phases').hidden=manual;
  canvas.style.pointerEvents=manual?'auto':'none';canvas.hidden=!valid;
  $('battleTactics').dataset.ready=String(manual);panel.classList.toggle('tactical-ended',d.status!=='active');
  if(valid){
   const position=tacticalPoint(t.pos.col,t.pos.row),actor=$('battleEvaSprite').parentElement,key=[t.unit,t.pos.col,t.pos.row].join(':');
   actor.style.left=position.x*100+'%';actor.style.top=(position.y-.29)*100+'%';actor.style.bottom='auto';actor.style.height='29%';actor.style.width=(stage.clientHeight*.145)+'px';actor.style.marginLeft=(-stage.clientHeight*.0725)+'px';
   if(key!==lastPosition){const old=lastPosition.split(':').map(Number);lastPosition=key;if(old.length===3&&isMoving()&&old[0]===t.unit){const from=tacticalPoint(old[1],old[2]);NERV_MOTION.tween('eva-field-move',1,0,v=>{actor.style.transform=v?'translate('+((from.x-position.x)*stage.clientWidth*v)+'px,'+((from.y-position.y)*stage.clientHeight*v)+'px)':'';},stage,420,{composition:'replace',ease:'outCubic'});}}
   meteoText('tacticalTelemetry','T'+d.round+'/14 · '+(evaExternalPower(t.unit)?'EXT給電 / INT '+Math.ceil(e.power)+'秒保持':'INT '+Math.ceil(e.power)+'秒')+' · 都市 '+d.energy+'% · 機体 '+(e.tacticalIntegrity??100)+'%');
   meteoText('tacticalWarning',d.status==='active'?'次の攻撃：'+t.enemyPlan.name+' / '+t.enemyPlan.columns.map(n=>['西','中央','東'][n]).join('・')+' / '+(tacticalThreat(t)?'現在位置は危険':'現在位置は射界外'):d.status==='victory'?'目標沈黙 / 記録画面で結果を確認':'防衛失敗 / 警報確認から回収・復旧');
   $('tacticalWarning').dataset.danger=String(tacticalThreat(t));
  }
  if(!valid){const actor=$('battleEvaSprite').parentElement;for(const property of ['left','top','bottom','height','width','marginLeft','transform'])actor.style[property]='';lastPosition='';}
  const ready=tacticalReady();for(const b of panel.querySelectorAll('[data-tactical]')){const action=b.dataset.tactical;let errors=[...ready];if(action==='cable')errors=!['DEPLOYED','POWER_LOST'].includes(e.state)||!S.infra.power||!S.infra.comms?['主電源・通信と出撃機が必要']:[];else if(action==='scan')errors.push(...(d.scans>=100||d.energy<12?['解析済みまたは都市電力12が不足']:[]));else if(action==='charge'||action==='supply')errors.push(...evaCombatConditions(action==='charge'?'positronCharge':'positronSupply'));else if(action==='neutralize')errors.push(...evaCombatConditions('neutralize'));else if(action==='at')errors.push(...combatBasics());b.disabled=pending||errors.length>0;b.title=errors.join(' / ');b.hidden=(['charge','supply','focus'].includes(action)&&armamentSelected!=='positron')||(action==='neutralize'&&armamentSelected==='positron');if(action==='at')b.textContent=e.at?'A.T.解除':'A.T.展開';}
  const fire=[...ready,...tacticalFireErrors()];$('tacticalFire').disabled=pending||fire.length>0;$('tacticalFire').textContent=pending?'記録中…':({knife:'ナイフ',rifle:'パレット',positron:'陽電子射撃'}[armamentSelected])+'で攻撃'+(fire.length?' / '+fire[0]:' / 照準位置へ発射');$('tacticalFire').title=fire.join(' / ');
  $('tacticalSupport').textContent='都市援護：'+(t?.support?'射撃許可':'待機（EVAで交戦）');$('tacticalSupport').setAttribute('aria-pressed',String(!!t?.support));meteoText('tacticalFeedback',message||'思考中は内部電源停止。移動・攻撃で10秒＋行動分を消費。命中には照準が必要。');paint();window.dispatchEvent(new Event('nerv-tactical-render'));
 }
 window.addEventListener('nerv-tactical-shot',event=>{fx={...event.detail,type:'shot',at:performance.now(),finished:false};setMessage(event.detail.hit?'命中 '+event.detail.damage+' / 目標残 '+event.detail.remaining:'射撃は外れました / 照準位置を修正してください');paint();NERV_FX.refresh();});
 window.addEventListener('nerv-tactical-turn',event=>{if(fx?.type==='shot'&&performance.now()-fx.at<100)return;fx={...event.detail,type:'enemy',at:performance.now(),finished:false};paint();NERV_FX.refresh();});
 NERV_FX.registerHook(paint,()=>visible()&&!!fx&&!fx.finished&&isMoving());
 const oldDraw=draw;draw=function(){oldDraw();render();};window.addEventListener('nerv-route',render);window.addEventListener('resize',render);window.addEventListener('nerv-fx-quality',()=>{if(fx&&!isMoving())fx.finished=true;paint();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&fx)fx.finished=true;});
 const originalSnapshot=window.NERV_BATTLE.snapshot;window.NERV_BATTLE.snapshot=()=>({...originalSnapshot(),tactical:{pending,frames,effectFrames,effect:fx?{type:fx.type,weapon:fx.weapon,hit:fx.hit,finished:fx.finished}:null,ownRAF:false}});render();
}
initV217Tactics();
