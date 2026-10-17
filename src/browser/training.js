// === v2.5 UNIFIED TACTICAL / SIM TRAINING EXPANSION ===
// Local simulated outcomes only. All existing state machines remain authoritative.
const unitNamesV25=['UNIT-00','UNIT-01','UNIT-02'];
const newOpsDefaults=()=>({xp:0,missions:0,successfulChecks:0,checkIndex:0,calibrations:0,gridBalance:50,gridQuality:0,locks:0,currentMissionLocks:0,lockBest:0,magiPredictions:0,magiMatches:0,missionAwarded:false,gridRewardKeys:[],magiRewardKeys:[],lastActions:[]});
S.ops={...newOpsDefaults(),...(S.ops&&typeof S.ops==='object'?S.ops:{})};
let v25AimStart=Date.now(),v25SyncStart=Date.now(),v25HomeStart=0;
const meter=(n)=>Math.max(0,Math.min(100,Math.round(n))); 
const isMoving=()=>S.prefs.motion&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function addXP(n,reason){S.ops.xp=Math.max(0,S.ops.xp+n);S.ops.lastActions.unshift({at:hhmmss(),reason,points:n});S.ops.lastActions=S.ops.lastActions.slice(0,8);persist();}
function eHTML(target,where,markup){const node=typeof target==='string'?qs(target):target;if(node&&typeof node.insertAdjacentHTML==='function')node.insertAdjacentHTML(where,markup);}
function v25MakeUI(){
 const headings={home:['01','CENTRAL DOGMA / HQ'],weather:['02','ENVIRONMENTAL INTEL'],infra:['03','MUNICIPAL DEFENSE'],eva:['04','EVA OPERATIONS'],magi:['05','TRI-CORE INTELLIGENCE'],mission:['06','TACTICAL DEFENSE'],tools:['07','PERSONNEL / DAILY'],settings:['08','SYSTEM PREFERENCES']};
 all('.page').forEach(p=>{const type=p.dataset.page,[index,title]=headings[type]||['--','NERV'];
  eHTML(p,'afterbegin',`<div class="nx-mast"><span class="nx-ident">NERV<span class="nx-slash"> / </span> ${index}</span><strong>${title}</strong><span class="nx-current" data-v25-clock>--:--:--</span><span class="nx-power">● LINK</span></div>`);
 });
 eHTML('.page[data-page="home"] .hero-card','afterend',`<section class="nx-station" aria-label="統合指揮状況">
 <div class="nx-head"><b>全系統統合指揮 <small>TACTICAL OVERVIEW / SIMULATION</small></b><span class="nx-live">● SYSTEM LIVE</span></div>
 <div class="nx-main-readouts"><div><small>総合警戒度 / CONDITION</small><b id="nxCondition">NORMAL</b></div><div><small>機体稼働 / ACTIVE EVA</small><b id="nxEvaActive">0 / 3</b></div><div><small>MAGI CONSENSUS</small><b id="nxMagiYes">WAITING</b></div><div><small>都市防衛 / INFRA</small><b id="nxCityRating">--%</b></div></div>
 <div class="nx-trace" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
 <div class="nx-miniheader">OPERATOR EVALUATION <span id="nxRank">TRAINEE / 000 XP</span></div>
 <div class="nx-game-intro">管制確認訓練 <small>QUICK RESPONSE DRILL</small></div>
 <div class="nx-small">指定された順序で系統を確認。正しい順序で3件完了すると評価点を獲得。</div>
 <div class="nx-order"><span id="nxCheckHint">NEXT / POWER</span><span id="nxCheckCount">0 / 3</span></div>
 <div class="nx-choices"><button type="button" data-nxcheck="0">01 ▰ 主電源<small>POWER</small></button><button type="button" data-nxcheck="1">02 ◈ 通信<small>COMMS</small></button><button type="button" data-nxcheck="2">03 △ MAGI<small>MAGI</small></button></div>
 <div class="nx-message" id="nxHomeMsg" aria-live="polite">LINK VALIDATION / AWAITING INPUT</div>
 </section>`);
 eHTML('.page[data-page="infra"] .infra-status','afterend',`<section class="nx-station nx-infra" aria-label="電力系統安定化訓練">
 <div class="nx-head"><b>電力供給最適化 <small>POWER GRID BALANCING</small></b><span class="nx-live">SIM / TRAINING</span></div>
 <div class="nx-grid-flags"><span>SUPPLY A / <b id="nxGridA">50%</b></span><span>SUPPLY B / <b id="nxGridB">50%</b></span><span>STABILITY / <b id="nxGridQ">--</b></span></div>
 <div class="nx-meter"><i class="nx-grid-target" id="nxGridTarget"></i><i class="nx-grid-fill" id="nxGridFill"></i></div>
 <label for="nxGridSlider" class="nx-small">主系統Aの負荷配分を調整 / SIMULATED LOAD RATIO</label><input id="nxGridSlider" type="range" min="15" max="85" step="1" value="50" aria-label="主系統の電力配分">
 <div class="nx-split"><span id="nxGridHint">目標配分を演算中</span><button type="button" id="nxGridCommit">▣ 配分を確定 / STABILIZE</button></div>
 <div class="nx-message" id="nxGridResult">操作による電力分配は架空の訓練シミュレーションです。</div>
 </section>`);
 eHTML('.page[data-page="eva"] .eva-display','afterend',`<section class="nx-station nx-eva-game" aria-label="シンクロ率調律ゲーム">
 <div class="nx-head"><b>神経同期調律 <small>SYNCHRONIZATION CALIBRATION</small></b><span class="nx-live">SIM / BIO-TUNING</span></div>
 <div class="nx-small">移動する信号を緑の同期領域で停止。格納中・準備中だけ調律可能。成功時は同期率を改善。</div>
 <div class="nx-synch"><div class="nx-synch-range" id="nxSyncRange"></div><span class="nx-synch-dot" id="nxSyncDot"></span></div>
 <div class="nx-split"><span id="nxSyncReadout">SIGNAL / READY</span><button type="button" id="nxSyncButton">◎ 信号を確定 / LOCK</button></div>
 <div class="nx-message" id="nxSyncResult">同期信号は模擬演算です。機体を選択して調律してください。</div>
 </section>`);
 eHTML('.page[data-page="magi"] #magiLiveTrack','afterend',`<section class="nx-station nx-magi-game" aria-label="MAGI多数決予測訓練">
 <div class="nx-head"><b>人格演算予測演習 <small>TRI-CORE PREDICTION</small></b><span class="nx-live">SIM / ANALYST</span></div>
 <div class="nx-small">現時点の電力・通信・機体条件から三基それぞれの審議結果を予測。判定ロジック自体は改変しません。</div>
 <div class="nx-predictions"><button type="button" data-nxcore="0"><b>BALTHASAR-2</b><span id="nxPred0">?</span><small>OPERATIONS</small></button><button type="button" data-nxcore="1"><b>CASPER-3</b><span id="nxPred1">?</span><small>HUMAN SAFETY</small></button><button type="button" data-nxcore="2"><b>MELCHIOR-1</b><span id="nxPred2">?</span><small>TECHNICAL LOGIC</small></button></div>
 <div class="nx-split"><span>全基の予測を選択</span><button type="button" id="nxMagiCheck">△ 予測を照合 / VERIFY</button></div>
 <div class="nx-message" id="nxMagiResult">APPROVE / DENY をタップで切替</div>
 </section>`);
 eHTML('.page[data-page="mission"] .threat-card','afterend',`<section class="nx-station nx-target-game" aria-label="レーダー照準ゲーム">
 <div class="nx-head"><b>迎撃目標照準 <small>TARGET ACQUISITION</small></b><span class="nx-live">SIM / BALLISTIC</span></div>
 <div class="nx-small">進行中の作戦で移動照準線を目標帯に重ねて固定。命中精度が作戦評価に反映されます。</div>
 <div class="nx-radar-game"><div class="nx-radar-ticks"></div><div class="nx-radar-hot" id="nxRadarHot"></div><div class="nx-radar-marker" id="nxRadarMarker"></div><div class="nx-radar-sweep" id="nxRadarSweep"></div><span class="nx-radar-label">AZIMUTH / 0–100 MILS</span></div>
 <div class="nx-split"><span id="nxLockCount">0 ACQUISITIONS</span><button type="button" id="nxLockButton">⌖ 照準固定 / LOCK</button></div>
 <div class="nx-message" id="nxLockResult">作戦を開始し、PHASE 04以降で照準可能。</div>
 </section>`);
 eHTML('.page[data-page="weather"] .meteo-notice','afterend',`<div class="nx-livebar"><b>DATA SOURCE PRIORITY</b><span>REAL WEATHER / WEATHER PANELS</span><small>OFFLINE DATA = --, NOT ZERO</small></div>`);
 eHTML('.page[data-page="tools"] .page-top','afterend',`<div class="nx-livebar"><b>PERSONNEL STATUS</b><span>LOCAL TASKS + FOCUS TIMER</span><small>PRIVATE / DEVICE ONLY</small></div>`);
 eHTML('.page[data-page="settings"] .page-top','afterend',`<div class="nx-livebar"><b>DISPLAY CONFIG</b><span>CRT / MOTION / SIGNAL</span><small>SIM DATA ≠ REAL</small></div>`);
 eHTML('.page[data-page="home"] .module-grid','afterend',`<section class="nx-station nx-feed"><div class="nx-head"><b>運用履歴 <small>ACTIVITY / LOCAL SIM</small></b><span>RECENT EVENTS</span></div><div id="nxRecentFeed" class="nx-feed-body">NO RECORDED ACTIVITY</div></section>`);
}
const v25StepLabels=['POWER SYSTEM','COMMS LINK','MAGI CORE'];
const v25State={prediction:[null,null,null]};
function v25Check(n){const k=S.ops.checkIndex||0;if(n!==k){S.ops.checkIndex=0;S.ops.xp=Math.max(0,S.ops.xp-1);$('nxHomeMsg').textContent='CHECK ORDER INVALID / FIRST STEP RESET';sound('deny');}else{S.ops.checkIndex=k+1;sound('select');$('nxHomeMsg').textContent='VERIFIED '+v25StepLabels[n];if(S.ops.checkIndex>=3){S.ops.checkIndex=0;S.ops.successfulChecks++;addXP(15,'QUICK RESPONSE CHECK / ALL PASS');$('nxHomeMsg').textContent='COMPLETE / ALL SYSTEMS ACKNOWLEDGED +15XP';sound('ok');}}persist();v25Render();}
function v25GridTarget(){const e=S.evas.filter(x=>x.state==='DEPLOYED').length;return Math.max(25,Math.min(78,47+(S.infra.armor?11:0)+(e*7)+(!S.infra.comms?-6:0)));}
function v25GridSave(){const target=v25GridTarget(),value=Number($('nxGridSlider').value),difference=Math.abs(target-value),q=meter(100-difference*5);S.ops.gridBalance=value;S.ops.gridQuality=q;if(difference<=4){const key=target+':'+value;const rewarded=!S.ops.gridRewardKeys.includes(key);if(rewarded){addXP(8,'GRID BALANCE VERIFIED');S.ops.gridRewardKeys.push(key);} $('nxGridResult').textContent='STABLE / APPROVED '+(rewarded?'+8XP':'/ VERIFIED')+' / TARGET '+target+'%';sound('ok');}else{$('nxGridResult').textContent='DEVIATION '+difference+'% / 負荷配分を再調整してください';sound('warning');}addLog('infra','GRID BALANCE / '+value+':'+(100-value)+' / STABILITY '+q+'%');draw();}
function wavePhase(t,duration){const p=((t%duration)+duration)%duration /duration;return p<.5?p*2:(1-p)*2;}
function v25Sync(){settleEvaPower();const e=selected();if(!['HANGAR','READY'].includes(e.state)){toast('同期調律は格納中・準備中のみ');sound('deny');return;}const val=isMoving()?wavePhase(Date.now()-v25SyncStart,2300)*100:50;
const goal=49+(S.selectedEva-1)*4,delta=Math.abs(val-goal);if(delta<=11){const gain=delta<=4?2.2:1.1;e.sync=Math.min(98,Math.round((Number(e.sync)+gain)*10)/10);S.ops.calibrations++;addXP(delta<=4?12:6,'UNIT-0'+S.selectedEva+' SYNCHRO '+(delta<=4?'PERFECT':'SUCCESS'));$('nxSyncResult').textContent='SYNCHRONIZATION '+(delta<=4?'PERFECT':'STABLE')+' / +'+gain.toFixed(1)+'%';sound('ok');}else{e.sync=Math.max(50,Math.round((Number(e.sync)-.3)*10)/10);$('nxSyncResult').textContent='OUT OF PHASE / -0.3% / RETRY';sound('deny');}addLog('eva','UNIT-0'+S.selectedEva+' / SYNCHRO CALIBRATION '+e.sync.toFixed(1)+'%');v25SyncStart=Date.now();draw();}
function v25MagiPredict(){if(v25State.prediction.some(v=>v===null)){toast('三基すべての予測を選択してください');return;}const actual=voteInfo();let match=0;actual.forEach((v,i)=>{if(v25State.prediction[i]===v.yes)match++;});S.ops.magiPredictions++;S.ops.magiMatches+=match;const baseScore=match===3?18:match===2?7:0;const key=[S.selectedEva,selected().state,selected().power>=240,S.infra.power,S.infra.armor,S.infra.comms].join(':');const score=S.ops.magiRewardKeys.includes(key)?0:baseScore;if(score){addXP(score,'MAGI PREDICTION / '+match+'/3');S.ops.magiRewardKeys.push(key);} $('nxMagiResult').textContent='RESULT '+match+'/3 CORRECT / '+(score?'+'+score+'XP':'NO NEW BONUS')+' / '+actual.map(v=>v.yes?'YES':'NO').join(' · ');sound(match>=2?'ok':'deny');addLog('magi','ANALYST PREDICTION '+match+'/3 CORRECT');v25State.prediction=[null,null,null];draw();}
function v25Target(){if(S.mission.phase<4||S.mission.phase>=6){toast('PHASE 04–05の作戦中のみ照準可能');sound('deny');return;}const pos=isMoving()?wavePhase(Date.now()-v25AimStart,2600)*100:50;const target=53;const delta=Math.abs(pos-target);if(delta<=12){S.ops.locks++;S.ops.currentMissionLocks++;const accuracy=Math.max(0,Math.round(100-delta*5));S.ops.lockBest=Math.max(S.ops.lockBest,accuracy);addXP(delta<=4?20:10,'TARGET LOCK / '+accuracy+'%');$('nxLockResult').textContent='TARGET ACQUIRED / '+accuracy+'% / +'+(delta<=4?20:10)+'XP';sound('launch');}else{$('nxLockResult').textContent='LOCK FAILURE / TARGET OUTSIDE ARC';sound('deny');}addLog('mission','BALLISTIC LOCK / '+(delta<=12?'CONFIRMED':'MISSED')+' / '+Math.round(delta)+' MILS');v25AimStart=Date.now();draw();}
function v25Render(){if(!$('nxCondition'))return;const critical=!S.infra.power||!S.infra.comms||S.evas.some(e=>e.state==='POWER_LOST');const deployed=S.evas.filter(e=>e.state==='DEPLOYED').length;const readiness=40+(S.infra.power?25:0)+(S.infra.comms?20:0)+(S.infra.armor?15:0);const level=critical?'EMERGENCY':S.mission.phase>0&&S.mission.phase<6?'TACTICAL':'NORMAL';
 $('nxCondition').textContent=level;$('nxCondition').dataset.level=critical?'critical':'normal';$('nxEvaActive').textContent=deployed+' / 3';$('nxCityRating').textContent=readiness+'%';$('nxMagiYes').textContent=S.magi.vote?(S.magi.vote.approved?'APPROVED':'REJECTED'):'STANDBY';
 const xp=S.ops.xp;const rank=xp>=450?'COMMANDER':xp>=220?'SECTION CHIEF':xp>=90?'OPERATOR':'TRAINEE';$('nxRank').textContent=rank+' / '+String(xp).padStart(3,'0')+' XP';
 $('nxCheckHint').textContent='NEXT / '+v25StepLabels[S.ops.checkIndex||0];$('nxCheckCount').textContent=(S.ops.checkIndex||0)+' / 3';
 const target=v25GridTarget();$('nxGridTarget').style.left=target+'%';$('nxGridA').textContent=S.ops.gridBalance+'%';$('nxGridB').textContent=(100-S.ops.gridBalance)+'%';$('nxGridQ').textContent=(S.ops.gridQuality||0)+'%';$('nxGridHint').textContent='TARGET SUPPLY A / '+target+'%';$('nxGridFill').style.width=S.ops.gridBalance+'%';
 for(let i=0;i<3;i++){const pred=v25State.prediction[i],el=$('nxPred'+i);el.textContent=pred===null?'?':pred?'YES':'NO';el.style.color=pred===null?'#b1ac8a':pred?'#79f996':'#ff7265';}
 $('nxLockCount').textContent=S.ops.currentMissionLocks+' MISSION LOCKS / BEST '+S.ops.lockBest+'%';$('nxLockButton').disabled=S.mission.phase<4||S.mission.phase>=6;
 $('nxSyncButton').disabled=!['HANGAR','READY'].includes(selected().state);
 const rows=[];for(const cat of ['mission','eva','magi','infra'])if(S.logs[cat]?.[0])rows.push({...S.logs[cat][0],cat});rows.sort((a,b)=>a.time<b.time?1:-1);const feed=$('nxRecentFeed');feed.replaceChildren();rows.slice(0,5).forEach(r=>{const node=document.createElement('div');const time=document.createElement('time');time.textContent=r.time;const cat=document.createElement('b');cat.textContent=r.cat.toUpperCase();node.append(time,cat,document.createTextNode(r.text.slice(0,75)));feed.append(node);});if(!rows.length)feed.textContent='NO RECORDED OPERATIONS / STANDBY';
}
function v25MotionTick(){if(document.hidden)return;all('[data-v25-clock]').forEach(e=>e.textContent=hhmmss());if(currentPage==='eva'){const p=isMoving()?wavePhase(Date.now()-v25SyncStart,2300)*100:50;$('nxSyncDot').style.left=p+'%';$('nxSyncReadout').textContent='SCAN POSITION / '+Math.round(p)+'%';$('nxSyncRange').style.left=(49+(S.selectedEva-1)*4-11)+'%';}if(currentPage==='mission'){$('nxRadarSweep').style.left=(isMoving()?wavePhase(Date.now()-v25AimStart,2600)*100:50)+'%';}if(currentPage==='home'){$('nxRecentFeed').dataset.active='true';}}
function v25Init(){v25MakeUI();
 all('[data-nxcheck]').forEach(b=>b.addEventListener('click',()=>v25Check(Number(b.dataset.nxcheck))));
 $('nxGridSlider').value=String(S.ops.gridBalance);$('nxGridSlider').addEventListener('input',()=>{const v=Number($('nxGridSlider').value);$('nxGridA').textContent=v+'%';$('nxGridB').textContent=100-v+'%';$('nxGridFill').style.width=v+'%';});$('nxGridCommit').addEventListener('click',v25GridSave);
 $('nxSyncButton').addEventListener('click',v25Sync);all('[data-nxcore]').forEach(b=>b.addEventListener('click',()=>{const n=Number(b.dataset.nxcore);v25State.prediction[n]=v25State.prediction[n]===null?true:!v25State.prediction[n];sound('tap');v25Render();}));$('nxMagiCheck').addEventListener('click',v25MagiPredict);$('nxLockButton').addEventListener('click',v25Target);
 $('missionAction').addEventListener('click',()=>{if(S.mission.phase===1){S.ops.currentMissionLocks=0;S.ops.missionAwarded=false;}if(S.mission.phase===6&&!S.ops.missionAwarded){S.ops.missions++;S.ops.missionAwarded=true;addXP(30+Math.min(20,S.ops.currentMissionLocks*5),'OPERATION COMPLETE / TARGET LOCKED');toast('模擬作戦完了 / 評価点を加算');v25Render();}},false);$('missionReset').addEventListener('click',()=>{S.ops.currentMissionLocks=0;S.ops.missionAwarded=false;v25Render();persist();},false);
 const prevDraw=draw;draw=function(){prevDraw();v25Render();};
 // Previous versions perform initial render before the expansion mounts.
 v25Render();v25MotionTick();setInterval(()=>{if(!document.hidden)v25MotionTick();},70);setInterval(()=>{if(!document.hidden && (currentPage==='home'||currentPage==='infra'||currentPage==='mission'))v25Render();},1500);

}
v25Init();

