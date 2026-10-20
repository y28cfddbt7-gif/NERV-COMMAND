// One dossier, one bounded radio card; Canvas drama uses the existing tactical hook.
function initV221Drama(){
 if(!window.NERV_CHRONICLE||!window.NERV_BATTLE||!window.NERV_FX)return;
 const room=v215Panel('mission','dossier','作戦資料室','<p class="eyebrow">NERV / ANGEL OPERATIONS ARCHIVE</p><h2>使徒・作戦資料室</h2><p class="staff-note">TV版の参照資料と、この端末で実施した作戦を区別して記録します。</p><p id="chronicleError" role="status"></p><details id="angelReference" open><summary>使徒資料 / TV SERIES</summary><div class="dossier-picker">'+Object.entries(angelDossiers).map(([id,a])=>'<button data-dossier-angel="'+id+'">第'+a.number+'使徒<br>'+a.name+'</button>').join('')+'</div><div class="dossier-hero"><span id="dossierPortrait" class="angel-art" role="img"></span><div><small id="dossierNumber"></small><h3 id="dossierName"></h3><p id="dossierForm"></p><b id="dossierEpisode"></b><p id="dossierEpisodeTitle"></p></div></div><p id="dossierLore" class="staff-guide"></p><p id="dossierSimulation" class="dossier-simulation"></p></details><details id="angelJournal"><summary>実施作戦 / 受領した通信記録</summary><div class="dossier-pager"><button id="chroniclePrevCase" aria-label="前の作戦">前の作戦</button><b id="chronicleCase"></b><button id="chronicleNextCase" aria-label="次の作戦">次の作戦</button></div><article id="chronicleScene"></article><div class="dossier-pager"><button id="chroniclePrevScene">前の通信</button><b id="chroniclePage"></b><button id="chronicleNextScene">次の通信</button></div><details class="chronicle-explanation"><summary>記録と保存について</summary><p class="staff-note">通信は作戦中の状態から作成したオリジナルの描写です。保存成功後に記録され、再読込では再発報しません。最新6作戦・最大96件を保持。</p></details><button id="chronicleContact" class="staff-secondary">担当パイロットの回線を開く ↗</button></details><button class="staff-secondary" data-ops-route="battle/records">戦闘の結果・経過へ ↗</button>');
 const radio=document.createElement('button');radio.id='battleStory';radio.className='battle-story';radio.hidden=true;radio.type='button';radio.setAttribute('aria-label','受領した作戦通信と資料室を開く');radio.innerHTML='<span id="storyPortrait"></span><span class="story-copy"><small id="storyCode"></small><b id="storyTitle"></b><span id="storyText"></span></span><span class="story-arrow" aria-hidden="true">↗</span>';$('consoleBattleFlow').after(radio);
 const notice=document.createElement('div');notice.className='sr-only';notice.id='storyAnnouncement';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');radio.after(notice);
 const entry=document.createElement('button');entry.className='staff-secondary';entry.dataset.opsRoute='mission/dossier';entry.textContent='使徒資料・作戦中の通信記録 ↗';$('battleRecords').after(entry);
 const settingsPanel=qs('.page[data-page="settings"] [data-view="effects"] .staff-panel'),metrics=settingsPanel?.querySelector('.fx-performance');
 if(metrics){const explanation=metrics.nextElementSibling,diagnostics=document.createElement('details');diagnostics.className='chronicle-diagnostics';diagnostics.innerHTML='<summary>描画診断・測定値について</summary>';metrics.before(diagnostics);diagnostics.append(metrics);if(explanation?.classList.contains('staff-note'))diagnostics.append(explanation);}
 const setting=document.createElement('button');setting.id='storyEffects';setting.className='staff-secondary';settingsPanel?.append(setting);
 let selectedAngel='sachiel',caseIndex=0,sceneIndex=0,fx=null,lastCase=S.defense.caseNo,frames=0,lastRadio='';
 function history(){return NERV_CHRONICLE.snapshot();}
 function face(id){const p=personalById(id);return p?personalFace(p):document.createElement('span');}
 function setFace(id,who){const target=$(id);target.replaceChildren(face(who));}
 function cases(root){return [...new Set(root.scenes.map(s=>s.caseKey))];}
 function renderRoom(){
  if(currentPage!=='mission'||mobileCurrent.mission!=='dossier')return;const a=angelDossiers[selectedAngel],root=history(),keys=cases(root);meteoText('chronicleError',root.error);$('chronicleError').hidden=!root.error;
  $('dossierPortrait').dataset.angel=selectedAngel;$('dossierPortrait').setAttribute('aria-label',a.name+'の修正済み外観');meteoText('dossierNumber','TV SERIES / 第'+a.number+'使徒');meteoText('dossierName',a.name);meteoText('dossierForm',a.form);meteoText('dossierEpisode',a.episode);meteoText('dossierEpisodeTitle',a.title);meteoText('dossierLore',a.lore);meteoText('dossierSimulation','本端末の独自演習：'+a.simulation);
  for(const b of room.querySelectorAll('[data-dossier-angel]'))b.setAttribute('aria-pressed',String(b.dataset.dossierAngel===selectedAngel));
  caseIndex=Math.max(0,Math.min(caseIndex,keys.length-1));const records=root.scenes.filter(s=>s.caseKey===keys[caseIndex]).slice().reverse();sceneIndex=Math.max(0,Math.min(sceneIndex,records.length-1));const record=records[sceneIndex],out=$('chronicleScene');out.replaceChildren();
  meteoText('chronicleCase',record?'CASE '+record.caseNo+' / '+angelDossiers[record.angel].name:'作戦記録なし');meteoText('chroniclePage',records.length?(sceneIndex+1)+' / '+records.length:'0 / 0');$('chroniclePrevCase').disabled=!keys.length||caseIndex===0;$('chronicleNextCase').disabled=caseIndex>=keys.length-1;$('chroniclePrevScene').disabled=!records.length||sceneIndex===0;$('chronicleNextScene').disabled=sceneIndex>=records.length-1;$('chronicleContact').disabled=!record||!S.infra.comms;
  if(record){const person=personalById(record.speaker),head=document.createElement('h3'),label=document.createElement('small'),text=document.createElement('p'),meta=document.createElement('p');head.textContent=record.title;label.textContent=(person?.name||'管制回線')+' / TURN '+record.round+' / '+new Date(record.at).toLocaleString('ja-JP');text.textContent=record.text;meta.className='staff-note';meta.textContent='記録時：UNIT-0'+record.unit+' / 機体 '+record.integrity+'% / 目標残 '+record.hp+' / '+({knife:'ナイフ',rifle:'パレット',positron:'陽電子狙撃'}[record.weapon]||record.weapon);out.append(face(record.speaker),head,label,text,meta);out.dataset.beat=record.beat;}
  else{out.textContent=root.error?'保護中の記録は変更しません。':'作戦を受領すると通信記録が始まります。敗北・中断の記録も、明示的な復旧後まで残ります。';delete out.dataset.beat;}
 }
 function renderRadio(){
  const a=S.world?.angels?.active,root=currentPage==='battle'&&S.prefs.storyCinematics!==false?history():{scenes:[]},record=root.scenes.find(s=>s.caseNo===S.defense.caseNo&&s.angel===a?.id),show=!!record&&currentPage==='battle'&&S.prefs.storyCinematics!==false;
  radio.hidden=!show;if(show&&lastRadio!==record.id){lastRadio=record.id;setFace('storyPortrait',record.speaker);meteoText('storyCode','CASE '+record.caseNo+' / '+(personalById(record.speaker)?.name||'管制')+' / TURN '+record.round);meteoText('storyTitle',record.title);meteoText('storyText',record.text);radio.dataset.beat=record.beat;radio.setAttribute('aria-label',(personalById(record.speaker)?.name||'管制')+'からの通信：'+record.text+'。全文・資料室を開く');}
  setting.textContent='作戦通信・専用演出：'+(S.prefs.storyCinematics===false?'OFF':'ON');setting.setAttribute('aria-pressed',String(S.prefs.storyCinematics!==false));
 }
 function active(){return !!fx&&fx.caseNo===S.defense.caseNo&&S.prefs.storyCinematics!==false&&!fx.finished;}
 function paint(g,w,h){
  if(!fx||fx.caseNo!==S.defense.caseNo||S.prefs.storyCinematics===false)return;const moving=isMoving(),age=Math.max(0,performance.now()-fx.at)/1000,p=moving?Math.min(1,age):.65;
  if(moving&&age>=1){fx.finished=true;return;}if(fx.finished&&moving)return;
  const t=tacticalState();if(!t)return;const target=tacticalTarget(),own=tacticalPoint(t.pos.col,t.pos.row),self=fx.beat==='at'||fx.kind==='enemy',cx=(self?own.x:target.x)*w,cy=(self?own.y-.145:target.y)*h;
  g.save();g.globalAlpha=moving?Math.max(.08,1-p):.7;g.lineJoin='miter';g.lineWidth=2;
  const polygon=(radius,color)=>{g.strokeStyle=color;g.beginPath();for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4,x=cx+Math.cos(a)*radius,y=cy+Math.sin(a)*radius;(i?g.lineTo(x,y):g.moveTo(x,y));}g.closePath();g.stroke();};
  if(fx.kind==='enemy'){
   g.strokeStyle=fx.angel==='ramiel'?'#9deeff':fx.angel==='shamshel'?'#ffad6d':'#f6b57e';g.lineWidth=fx.angel==='ramiel'?5:2;g.beginPath();g.moveTo(target.x*w,target.y*h);
   const row=fx.rows?.includes(t.pos.row)?t.pos.row:fx.rows?.at(-1)||2,columns=fx.columns?.length?fx.columns:[t.pos.col];if(fx.angel==='shamshel'){columns.forEach((col,i)=>{const p=tacticalPoint(col,row);g.moveTo(target.x*w,target.y*h);g.bezierCurveTo(w*(i?.88:.12),h*.25,w*(i?.2:.82),h*.55,p.x*w,p.y*h-h*.1);});}else{const p=tacticalPoint(columns.includes(t.pos.col)?t.pos.col:columns[0],row);g.lineTo(p.x*w,p.y*h-h*.1);}g.stroke();polygon(12+p*22,fx.loss?'#ff9672':'#a4e6cc');
  }else if(['at','neutralized'].includes(fx.beat)){
   for(let i=0;i<3;i++)polygon(12+i*9+p*14,fx.beat==='neutralized'?'#ffd17a':'#a7e9d2');
  }else if(fx.beat==='deployed'){
   g.strokeStyle='#b9eced';for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(own.x*w+i*9,h);g.lineTo(own.x*w+i*9,(own.y-.2-p*.2)*h);g.stroke();}
  }else if(fx.beat==='charged'){
   g.strokeStyle='#a7efff';g.lineWidth=3;g.beginPath();g.moveTo(own.x*w,own.y*h);g.lineTo(target.x*w,target.y*h);g.stroke();polygon(16+p*22,'#c0f5ff');
  }else if(fx.beat==='victory'){
   for(let i=0;i<8;i++){const a=i*Math.PI/4;g.strokeStyle='#fbc39c';g.beginPath();g.moveTo(cx+Math.cos(a)*6,cy+Math.sin(a)*6);g.lineTo(cx+Math.cos(a)*(16+p*38),cy+Math.sin(a)*(16+p*38));g.stroke();}polygon(6+p*28,'#ffd9aa');
  }else{polygon(20+p*20,'#e8c28a');}
  g.restore();frames++;if(!moving)fx.finished=true;
 }
 function reset(){fx=null;lastRadio='';meteoText('storyAnnouncement','');}
 window.NERV_DRAMA={paint,active,snapshot:()=>({frames,effect:fx?{beat:fx.beat,kind:fx.kind||'scene',caseNo:fx.caseNo,finished:!!fx.finished}:null,ownRAF:false})};
 window.addEventListener('nerv-chronicle',event=>{
  const newest=event.detail.at(-1);if(!newest)return;renderRadio();renderRoom();if(S.prefs.storyCinematics===false)return;
  meteoText('storyAnnouncement',(personalById(newest.speaker)?.name||'管制')+'。'+newest.title+'。'+newest.text);
  fx={...newest,at:performance.now(),finished:false};NERV_BATTLE.paintTactical();NERV_FX.refresh();
 });
 window.addEventListener('nerv-tactical-turn',event=>{if(S.prefs.storyCinematics===false||fx&&fx.caseNo===S.defense.caseNo&&((fx.beat==='victory')||(active()&&performance.now()-fx.at<150&&['charged','neutralized','identified'].includes(fx.beat))))return;const record=event.detail;if(!record?.round)return;fx={...record,kind:'enemy',beat:'enemy',angel:currentAngel()?.id,caseNo:S.defense.caseNo,loss:record.loss,at:performance.now(),finished:false};NERV_BATTLE.paintTactical();NERV_FX.refresh();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&fx)fx.finished=true;});window.addEventListener('nerv-fx-quality',()=>{if(fx&&!isMoving())fx.finished=true;});
 radio.addEventListener('click',()=>{caseIndex=0;const root=history();sceneIndex=Math.max(0,root.scenes.filter(r=>r.caseKey===cases(root)[0]).length-1);NERV_MOBILE.open('mission','dossier');$('angelReference').open=false;$('angelJournal').open=true;renderRoom();});
 for(const b of room.querySelectorAll('[data-dossier-angel]'))b.addEventListener('click',()=>{selectedAngel=b.dataset.dossierAngel;renderRoom();});
 for(const [id,delta,kind] of [['chroniclePrevCase',-1,'case'],['chronicleNextCase',1,'case'],['chroniclePrevScene',-1,'scene'],['chronicleNextScene',1,'scene']])$(id).addEventListener('click',()=>{if(kind==='case'){caseIndex+=delta;sceneIndex=0;}else sceneIndex+=delta;renderRoom();});
 for(const [a,b] of [['angelReference','angelJournal'],['angelJournal','angelReference']]){const el=$(a);el.setAttribute('name','angel-archive');el.querySelector('summary').addEventListener('click',()=>{if(!el.open)$(b).open=false;});el.addEventListener('toggle',()=>{if(el.open)$(b).open=false;});}
 $('chronicleContact').addEventListener('click',()=>{const root=history(),key=cases(root)[caseIndex],record=root.scenes.filter(r=>r.caseKey===key).slice().reverse()[sceneIndex];if(record&&S.infra.comms)NERV_MESSAGES.open(['rei','shinji','asuka'][record.unit]);});
 setting.addEventListener('click',async()=>{await commandOperation(()=>{S.prefs.storyCinematics=S.prefs.storyCinematics===false;});if(S.prefs.storyCinematics===false)reset();renderRadio();NERV_FX.refresh();});
 function render(){let stage='';try{stage=currentPage==='battle'?(consoleBattle()?.stage||''):'';}catch(error){}document.body.dataset.chronicleStage=stage;document.body.dataset.chronicleMode=$('battleTacticalCanvas')?.dataset.consoleFieldMode||'';document.body.dataset.chronicleView=currentPage==='mission'&&mobileCurrent.mission==='dossier'?'dossier':'none';if(!staffWorldReady)return;if(lastCase!==S.defense.caseNo){lastCase=S.defense.caseNo;reset();}renderRadio();renderRoom();}
 const previousDraw=draw;draw=function(){previousDraw();render();};window.addEventListener('nerv-route',()=>{render();NERV_FX.refresh();});window.addEventListener('nerv-world-ready',render);render();
}
initV221Drama();
