// One bounded scheduler owns new Canvas motion; UI values always come from S.
// Static/reduced-motion rendering remains informative and never delays a command.
function initImmersiveTerminal() {
 if(!qs('#staffSupport'))return;
 const surfaces=[],frameHooks=[],media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 let visibleSignature='',frame=0,lastFrame=0,frames=0,lastCost=0,averageCost=0,slowFrames=0,adaptiveRate=60,paintCount=0,hit=null,hitTimer=0;
 const stats={active:0,frames:0,paintCount:0,averageCost:0,rate:0};
 const quality=()=>['auto','high','low'].includes(S.prefs.fxQuality)?S.prefs.fxQuality:'auto';
 const moving=()=>!document.hidden&&isMoving();
 const rate=()=>quality()==='low'?20:quality()==='high'?60:adaptiveRate;
 function addSurface(canvas,paint,visible) {
  let context=null;try{context=canvas.getContext('2d',{alpha:true});}catch(error){}
  if(!context){canvas.dataset.renderer='static';return;}
  canvas.dataset.renderer='canvas';surfaces.push({canvas,context,paint,visible,visibleOnScreen:false});
 }
 function drawSurface(surface,time) {
  const {canvas,context}=surface,rect=canvas.getBoundingClientRect(),scale=quality()==='low'?1:Math.min(1.5,window.devicePixelRatio||1);
  if(rect.width<1||rect.height<1)return;
  const width=Math.max(1,Math.round(rect.width*scale)),height=Math.max(1,Math.round(rect.height*scale));
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  context.setTransform(scale,0,0,scale,0,0);context.clearRect(0,0,rect.width,rect.height);
  surface.paint(context,rect.width,rect.height,time);paintCount++;
 }
 function paint(time,force=false) {
  const active=surfaces.filter(s=>s.visible()&&s.canvas.getBoundingClientRect().bottom>0&&s.canvas.getBoundingClientRect().top<innerHeight);
  const hooks=frameHooks.filter(h=>h.visible());stats.active=active.length+hooks.length;visibleSignature=active.map(s=>s.canvas.id).join('|');
  for(const surface of surfaces){const enabled=active.includes(surface);surface.canvas.dataset.running=String(enabled&&moving());}
  if(!force&&time-lastFrame<1000/rate()-1)return;
  const start=performance.now();for(const s of active)drawSurface(s,moving()?time/1000:0);for(const h of hooks)h.tick(time);
  lastCost=performance.now()-start;averageCost=averageCost?averageCost*.9+lastCost*.1:lastCost;
  if(quality()==='auto'&&averageCost>8){if(++slowFrames>=20)adaptiveRate=30;}else slowFrames=Math.max(0,slowFrames-1);
  lastFrame=time;frames++;Object.assign(stats,{frames,paintCount,averageCost:Math.round(averageCost*100)/100,rate:moving()?rate():0});
 }
 function loop(time) {frame=0;if(document.hidden||!moving())return;paint(time);if(stats.active)frame=requestAnimationFrame(loop);}
 function refresh() {
  if(frame)cancelAnimationFrame(frame);frame=0;
  document.body.classList.toggle('fx-suspended',document.hidden);document.body.classList.toggle('fx-motion',moving());document.body.dataset.fxQuality=quality();
  if(document.hidden){stats.active=0;stats.rate=0;for(const s of surfaces)s.canvas.dataset.running='false';return;}
  paint(performance.now(),true);if(moving()&&stats.active)frame=requestAnimationFrame(loop);
 }
 function grid(ctx,w,h) {
  ctx.lineWidth=.6;ctx.strokeStyle='#31594c';ctx.beginPath();
  for(let x=0;x<w;x+=24){ctx.moveTo(x,0);ctx.lineTo(x,h);}for(let y=0;y<h;y+=24){ctx.moveTo(0,y);ctx.lineTo(w,y);}ctx.stroke();
 }
 function text(ctx,value,x,y,color='#b5c9a0',size=9) {ctx.fillStyle=color;ctx.font=size+'px monospace';ctx.fillText(value,x,y);}
 function neural(ctx,w,h,time) {
  if(window.NERV_VISUALS?.neural)return window.NERV_VISUALS.neural(ctx,w,h,time);
  grid(ctx,w,h);const e=selected(),connected=['READY','DEPLOYED'].includes(e.state),alert=e.state==='POWER_LOST';
  const colors=['#86cdd8','#b1a8eb','#ee9671'],color=alert?'#ed765b':colors[S.selectedEva];
  for(let line=0;line<3;line++) {
   const center=(line+1)*h/4,amplitude=connected?Math.max(3,e.sync/7):2;
   ctx.strokeStyle=line===1?color:'#739b86';ctx.lineWidth=line===1?1.6:.8;ctx.beginPath();
   for(let x=0;x<=w;x+=3){const y=center+Math.sin(x*.075-time*(line+1)*1.3)*Math.sin(x*.027+line)*amplitude;(x?ctx.lineTo(x,y):ctx.moveTo(x,y));}ctx.stroke();
  }
  text(ctx,'UNIT-0'+S.selectedEva+' / '+stateJP[e.state],8,14,color);text(ctx,'SYNC '+Number(e.sync).toFixed(1)+'% / '+(connected?'NEURAL LINK':'RESERVE'),8,h-9);
  const supply=Math.max(0,Math.min(1,e.power/300));ctx.fillStyle=evaExternalPower(S.selectedEva)?'#7dd9ba':'#cd9f60';ctx.fillRect(w-12,h*(1-supply),4,h*supply);
 }
 function compute(ctx,w,h,time) {
  grid(ctx,w,h);const x=externalMagiState(),v=S.magi.vote?.votes,active=externalMagiActive()||sequenceBusy;
  for(let i=0;i<3;i++) {
   const top=20+i*(h-26)/3,pressure=x.pressure[i],color=pressure>=90?'#ed7258':x.status==='protected'||x.status==='contained'?'#91d2b4':'#d6a561';
   ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();
   for(let px=0;px<w;px+=4){const py=top+16+(active?Math.sin(px*.06+time*(i+1))*Math.min(11,3+pressure*.1):0);px?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
   text(ctx,externalCoreNames[i]+' / '+(externalMagiActive()?pressure+'% PRESSURE':v?'DECISION REGISTERED':'STANDBY'),8,top,color);
  }
 }
 function radar(ctx,w,h,time) {
  const d=S.defense,active=d.status==='active',cx=w/2,cy=h*.54,radius=Math.min(w,h)*.47;
  ctx.save();ctx.translate(cx,cy);ctx.scale(1,.64);ctx.strokeStyle='#75ab9270';ctx.lineWidth=.7;
  for(let i=1;i<=4;i++){ctx.beginPath();ctx.arc(0,0,radius*i/4,0,Math.PI*2);ctx.stroke();}
  if(active){const angle=time*.4-.8;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(angle)*radius,Math.sin(angle)*radius);ctx.strokeStyle='#b1e2a69c';ctx.stroke();}
  ctx.restore();
  text(ctx,'TOKYO-3 / '+(active?'TRACK '+d.enemy.code:'PASSIVE WATCH'),8,14,active?'#ebbb73':'#99beaa');
  text(ctx,active?'RANGE '+d.enemy.dist+' TURNS / SCAN '+d.scans+'%':'NO HOSTILE RETURN',8,h-9);
  if(active){const coordinates=$('v27Enemy').getAttribute('transform')?.match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/);if(coordinates){const x=Number(coordinates[1])*w/680,y=Number(coordinates[2])*h/445;ctx.strokeStyle=d.scans>=68?'#edba77':'#a4c899';ctx.lineWidth=1;ctx.beginPath();for(const [sx,sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ctx.moveTo(x+sx*18,y+sy*10);ctx.lineTo(x+sx*18,y+sy*18);ctx.lineTo(x+sx*10,y+sy*18);}ctx.stroke();text(ctx,'X '+coordinates[1]+' / Y '+coordinates[2]+' / ALT —',8,27,'#c8b480',7);}}

  const forecast=defenseForecast();if(forecast.sector!==null&&forecast.loss>0){const pos=[[.26,.43],[.5,.25],[.75,.43],[.5,.72]][forecast.sector];ctx.strokeStyle='#ee8065';ctx.lineWidth=1.8;ctx.beginPath();ctx.ellipse(w*pos[0],h*pos[1],w*.12,h*.065,0,0,Math.PI*2);ctx.stroke();text(ctx,'IMPACT '+forecast.loss,w*pos[0]-24,h*pos[1]-14,'#ef9976');}
 }
 function impact(ctx,w,h,time) {
  if(!hit)return;const age=moving()?Math.max(0,(performance.now()-hit.at)/1000):.3,center=w*.68,cy=h*.45;
  const color=hit.weapon==='positron'?'#b5ecf5':hit.weapon==='knife'?'#e7d28f':'#eda36a';ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=hit.weapon==='positron'?5:2;
  ctx.beginPath();ctx.moveTo(w*.12,hit.weapon==='knife'?h*.85:cy);ctx.lineTo(center,cy);ctx.stroke();
  for(let i=0;i<3;i++){ctx.globalAlpha=Math.max(.12,1-age*.6-i*.13);ctx.lineWidth=1;ctx.beginPath();ctx.arc(center,cy,8+i*10+age*15,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;
  text(ctx,'CONFIRMED HIT / '+hit.damage+' DAMAGE',8,h-12,color,10);
 }
 function mountPanel(page,id,label,markup) {
  const panel=document.createElement('section');panel.className='mobile-view';panel.dataset.view=id;panel.innerHTML=markup;qs('.page[data-page="'+page+'"]').append(panel);registerTerminalView(page,id,label);return panel;
 }
 const neuralPanel=mountPanel('eva','neural','神経・部位監視','<div class="staff-panel fx-instrument"><div class="staff-panel-title"><h2>神経接続・部位監視</h2><b id="neuralUnit"></b></div><canvas id="neuralLive" class="fx-canvas" aria-label="実際の模擬同期率と給電に連動した神経接続波形"></canvas><div class="fx-meter-pair"><div><small>SYNC / SIM</small><strong id="neuralSync"></strong></div><div><small>POWER / SUPPLY</small><strong id="neuralPower"></strong></div></div><h3>部位別損傷報告</h3><div id="neuralDamage" class="fx-damage-grid"></div><p id="neuralDamageNote" class="staff-note"></p><button class="staff-secondary" data-ops-route="eva/control">発進・回収管制 ↗</button></div>');
 const damagePanel=mountPanel('eva','damage','部位報告','<div class="staff-panel"><div class="staff-panel-title"><h2>部位別損傷報告</h2><b>RECEIVED DATA</b></div></div>');
 neuralPanel.querySelector('h3').remove();damagePanel.querySelector('.staff-panel').append($('neuralDamage'),$('neuralDamageNote'),neuralPanel.querySelector('[data-ops-route]'));
 addSurface($('neuralLive'),neural,()=>currentPage==='eva'&&mobileCurrent.eva==='neural'&&S.prefs.fxWaveField!==false);
 const computation=mountPanel('magi','compute','演算監視','<div class="staff-panel fx-instrument"><div class="staff-panel-title"><h2>MAGI / 演算系統</h2><b id="computeStatus"></b></div><div id="computeDiagram">'+nervMagiDiagram('CORE NETWORK')+'</div><canvas id="computeLive" class="fx-canvas fx-compute" aria-label="MAGI三基の稼働・侵入圧に連動した演算表示"></canvas><p id="computeReadout" class="staff-guide"></p><div class="ops-route-grid"><button data-ops-route="magi/consensus">三基合議 ↗</button><button data-ops-route="magi/firewall">666防御指示 ↗</button></div></div>');
 const streams=mountPanel('magi','streams','演算波形','<div class="staff-panel"><div class="staff-panel-title"><h2>三基の演算・侵入圧</h2><b>LIVE / SIM</b></div></div>');
 streams.querySelector('.staff-panel').append($('computeLive'),$('computeReadout'),computation.querySelector('.ops-route-grid'));
 const inspect=document.createElement('button');inspect.className='staff-secondary';inspect.dataset.opsRoute='magi/streams';inspect.textContent='演算波形・資源を確認 ↗';computation.querySelector('.staff-panel').append(inspect);
 addSurface($('computeLive'),compute,()=>currentPage==='magi'&&mobileCurrent.magi==='streams');
 qs('#computeDiagram svg').setAttribute('role','group');
 for(const core of $('computeDiagram').querySelectorAll('[data-fx-core]')){const index=Number(core.dataset.fxCore);core.setAttribute('role','button');core.setAttribute('tabindex','0');core.setAttribute('aria-label',externalCoreNames[index]+'を選択');const select=()=>externalMagiAction('select',index);core.addEventListener('click',select);core.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();select();}});}
 const compact=document.createElement('div');compact.className='fx-magi-compact';compact.innerHTML=nervMagiDiagram('666');$('external666').append(compact);
 compact.setAttribute('role','button');compact.tabIndex=0;compact.setAttribute('aria-label','MAGI三基の防御状態を拡大');compact.addEventListener('click',()=>window.NERV_MOBILE.open('magi','compute'));compact.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();window.NERV_MOBILE.open('magi','compute');}});
 const map=$('v27IsoMap'),stack=document.createElement('div');stack.className='fx-map-stack';map.before(stack);stack.append(map);
 const mapCanvas=document.createElement('canvas');mapCanvas.id='tacticalSweep';mapCanvas.className='fx-map-canvas';mapCanvas.setAttribute('aria-hidden','true');stack.append(mapCanvas);addSurface(mapCanvas,radar,()=>currentPage==='infra'&&mobileCurrent.infra==='map');
 const impactCanvas=document.createElement('canvas');impactCanvas.id='weaponImpactCanvas';impactCanvas.className='fx-impact-canvas';impactCanvas.setAttribute('aria-hidden','true');const viewport=document.createElement('div');viewport.className='fx-weapon-viewport';$('armamentControlPlate').before(viewport);viewport.append($('armamentControlPlate'),impactCanvas);viewport.parentElement.classList.add('fx-armament-stage');
 addSurface(impactCanvas,impact,()=>currentPage==='mission'&&mobileCurrent.mission==='weapon-control'&&!!hit);
 const notice=document.createElement('div');notice.id='fxHitNotice';notice.className='fx-hit-notice hidden';notice.setAttribute('role','status');qs('#shell').append(notice);
 const effectPanel=mountPanel('settings','effects','映像品質','<div class="staff-panel"><h2>映像品質 / RENDER CONTROL</h2><label class="staff-label" for="fxQuality">描画品質</label><select id="fxQuality"><option value="auto">自動 / 60fps目標・負荷時30fps</option><option value="high">高精細 / 60fps目標</option><option value="low">省電力 / 20fps目標</option></select><p class="staff-note">画面アニメーションOFF・低モーション設定時は静止。非表示の描画を停止します。</p><dl class="fx-performance"><div><dt>描画モード</dt><dd id="fxMode"></dd></div><div><dt>表示中の計器</dt><dd id="fxActive"></dd></div><div><dt>平均描画時間 / この端末</dt><dd id="fxCost"></dd></div></dl><p class="staff-note">値はこの端末の描画処理時間です。実機のフレームレートや電池消費を保証する値ではありません。</p></div>');
 $('fxQuality').value=quality();$('fxQuality').addEventListener('change',async()=>{const selectedQuality=$('fxQuality').value;await commandOperation(()=>{S.prefs.fxQuality=selectedQuality;});$('fxQuality').value=quality();refresh();window.dispatchEvent(new CustomEvent('nerv-fx-quality'));});
 const sequence=qs('.seq-emblem');sequence.insertAdjacentHTML('beforeend',nervLaunchPlate());
 const sequencePhases={prepare:['CAGE UPLINK','PILOT SIGNAL / ENTRY PLUG','LCL / RESTRAINT CHECK','CONTROL LINK / READY'],launch:['MAGI / VERIFIED','UMBILICAL / SUPPLY ROUTE','RESTRAINT RELEASE','CATAPULT / SURFACE'],recovery:['REMOTE CONTROL','RECOVERY ROUTE','RESTRAINT / A.T. STOP','CAGE DOCKED / MAINTENANCE']};
 const oldSequence=playSequence;playSequence=function(kind,title,unit,steps,done,detail){
  const currentUnit=S.selectedEva;sequence.querySelector('.launch-unit').dataset.unit=String(currentUnit);sequence.querySelector('.entry-plug-number').textContent='0'+currentUnit;
  const result=oldSequence(kind,title,unit,steps,done,detail);sequence.dataset.sequence=kind;syncSequence();return result;
 };
 function syncSequence(){const overlay=$('sequenceOverlay');if(!overlay)return;const raw=$('seqCounter').textContent,stage=Math.max(0,Math.min(3,parseInt(raw,10)-1||0));sequence.dataset.stage=String(stage);const label=sequence.querySelector('.launch-cage-label');label.textContent=(sequencePhases[sequence.dataset.sequence]||sequencePhases.prepare)[stage];}
 const sequenceObserver=new MutationObserver(syncSequence);sequenceObserver.observe($('seqStep'),{childList:true,subtree:true,characterData:true});
 const boot=qs('.boot-lattice');if(boot)boot.innerHTML='<svg viewBox="0 0 320 110" aria-hidden="true"><g fill="none" stroke="currentColor"><path d="m110 5 100 0 49 50-49 50H110L61 55z"/><path d="m126 23 68 0 33 32-33 32h-68L93 55z"/><path d="m140 39 40 0 17 16-17 16h-40l-17-16z"/></g><path d="M0 55h61m198 0h61" stroke="#89d7d2"/></svg>';
 function renderState() {
  const alert=terminalAlert(),battle=S.defense.status==='active';document.body.dataset.fxMode=alert.level==='critical'?'emergency':battle?'battle':alert.level==='watch'?'watch':'normal';
  const e=selected();neuralPanel.dataset.unit=String(S.selectedEva);meteoText('neuralUnit','UNIT-0'+S.selectedEva);meteoText('neuralSync',Number(e.sync).toFixed(1)+'%');meteoText('neuralPower',evaExternalPower(S.selectedEva)?'EXTERNAL':Math.ceil(e.power)+' SEC');
  const damage=$('neuralDamage');damage.replaceChildren();let measured=false;
  for(const [key,label] of [['head','頭部'],['torso','胴体'],['leftArm','左腕'],['rightArm','右腕'],['leftLeg','左脚'],['rightLeg','右脚']]){const value=e.damage?.[key],known=Number.isFinite(value);measured=measured||known;const row=document.createElement('div'),name=document.createElement('span'),reading=document.createElement('b');name.textContent=label;reading.textContent=known?Math.max(0,Math.min(100,value))+'%':'未計測';row.dataset.damaged=String(known&&value>0);row.append(name,reading);damage.append(row);}
  meteoText('neuralDamageNote',measured?(e.damageSource||'受信した部位別損傷報告を表示しています。'):e.state==='MAINTENANCE'?'整備中 / 部位別損傷報告は未受信です。':'部位別損傷報告は未受信です。機体信号と電源系統を継続監視。');
  const x=externalMagiState();
  for(const root of [$('computeDiagram'),compact])for(const core of root.querySelectorAll('[data-fx-core]')){const i=Number(core.dataset.fxCore),state=x.pressure[i]>=90?'danger':['protected','contained'].includes(x.status)?'protected':externalMagiActive()?'active':'idle';core.dataset.status=state;core.dataset.selected=String(x.selected===i);core.querySelector('.magi-core-readout').textContent=externalMagiActive()||x.status==='contained'?x.pressure[i]+'%':S.magi.vote?'判定済み':'稼働';}
  meteoText('computeStatus',x.status==='protected'?'666 PROTECTED':worldMagiLimited()?'COOLING HOLD':externalMagiActive()?'EXTERNAL ATTACK':'CORE ONLINE');
  meteoText('computeReadout','解析 '+x.analysis+'% / 演算資源 '+x.budget+' / '+(externalMagiActive()||x.status==='contained'?x.message:worldMagiLimited()?'冷却系統点検中。通常審議を保留。':'三基の通常審議を監視しています。'));
  meteoText('fxMode',moving()?quality().toUpperCase()+' / '+rate()+'fps目標':'STATIC');meteoText('fxActive',String(stats.active));meteoText('fxCost',stats.averageCost+' ms');
  refresh();
 }
 window.addEventListener('nerv-confirmed-hit',event=>{
  hit={...event.detail,at:performance.now()};notice.textContent='UNIT-0'+hit.unit+' / 命中 '+hit.damage+' / 目標残 '+hit.remaining;notice.classList.remove('hidden');notice.dataset.weapon=hit.weapon;
  clearTimeout(hitTimer);hitTimer=setTimeout(()=>{hit=null;notice.classList.add('hidden');refresh();},moving()?1500:2200);refresh();
 });
 window.addEventListener('nerv-route',()=>{$('operationVisual')?.classList.add('hidden');renderState();});window.addEventListener('nerv-equipment-selected',refresh);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){hit=null;clearTimeout(hitTimer);notice.classList.add('hidden');}refresh();});
 window.addEventListener('resize',refresh);window.addEventListener('scroll',()=>{if(document.hidden)return;const visible=surfaces.filter(s=>s.visible()&&s.canvas.getBoundingClientRect().bottom>0&&s.canvas.getBoundingClientRect().top<innerHeight).map(s=>s.canvas.id).join('|');if(visible!==visibleSignature)refresh();},{passive:true});media?.addEventListener?.('change',refresh);
 $('motionSwitch').addEventListener('click',()=>{refresh();window.dispatchEvent(new CustomEvent('nerv-fx-quality'));});
 const oldDraw=draw;draw=function(){oldDraw();renderState();};const oldSettings=renderSettings;renderSettings=function(){oldSettings();refresh();};
 const oldEva=renderEVA;renderEVA=function(){oldEva();if(currentPage==='eva'&&mobileCurrent.eva==='neural')renderState();};
 window.NERV_FX={refresh,registerHook:(tick,visible)=>{if(frameHooks.length>=4)return false;frameHooks.push({tick,visible});refresh();return true;},register:(canvas,paint,visible)=>{if(!canvas||surfaces.length>=12||surfaces.some(s=>s.canvas===canvas))return false;addSurface(canvas,paint,visible);refresh();return true;},frameBudget:()=>1000/rate(),snapshot:()=>({...stats,quality:quality(),moving:moving(),scheduled:!!frame,mode:document.body.dataset.fxMode}),resetAuto:()=>{adaptiveRate=60;slowFrames=0;refresh();}};
 const restore=()=>{const [page,view]=location.hash.slice(1).split('/');if([['eva','neural'],['eva','damage'],['magi','compute'],['magi','streams'],['settings','effects']].some(([p,v])=>p===page&&v===view))window.NERV_MOBILE.open(page,view);};window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
 document.body.classList.add('fx-ready');renderState();restore();
}
initImmersiveTerminal();
