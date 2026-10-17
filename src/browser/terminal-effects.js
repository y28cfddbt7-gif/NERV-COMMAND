// Presentation only: derive readouts and warnings from the existing game state.
function terminalAlert(){
 if(!S.infra.power)return {level:'critical',key:'power',title:'主電源停止',message:'都市の電力供給が停止しています。補助系統・主電源を確認してください。',page:'infra'};
 if(!S.infra.comms)return {level:'critical',key:'comms',title:'通信回線断',message:'作戦通信がオフラインです。都市インフラの通信系統を復旧してください。',page:'infra'};
 const lost=S.evas.findIndex(e=>e.state==='POWER_LOST');
 if(lost>=0)return {level:'critical',key:'eva-'+lost,title:'EVA 電源喪失',message:'UNIT-0'+lost+' の内部電源が枯渇。機体の帰投・回収を指示してください。',page:'eva'};
 if(magiIntrusionActive())return {level:'critical',key:'magi-intrusion',title:'MAGI 外部侵入',message:'MAGIへの侵食を検知。通常審議を停止しています。侵入対処で封じ込めてください。',page:'magi'};
 if(S.defense?.status==='defeat'||S.defense?.city?.some(c=>c.hp<=0))return {level:'critical',key:'city-damage',title:'都市防衛網 損傷',message:'都市施設の機能停止を検知。都市管制で状態を確認するか、警報クリアで正常待機へ復旧してください。',page:'infra'};
 if(S.defense?.status==='active')return {level:'watch',key:'enemy-'+S.defense.caseNo,title:'敵性反応 接近',message:'都市防衛 CASE '+String(S.defense.caseNo).padStart(3,'0')+' / 接近まで '+S.defense.enemy.dist+' ターン。波形解析・MAGI戦術審議を確認。',page:'infra'};
 if(S.mission.phase>0&&S.mission.phase<6)return {level:'watch',key:'mission',title:'作戦進行中',message:'PHASE '+String(S.mission.phase).padStart(2,'0')+' / EVA・MAGI・作戦管制の連携条件を確認してください。',page:'mission'};
 return {level:'nominal',key:'nominal'};
}
function renderLauncher(){
 const put=(id,value)=>{const el=$(id);if(el)el.textContent=value;};
 const weather=weatherCurrent();
 const temperature=Number.isFinite(weather?.temperature_2m)?Math.round(weather.temperature_2m)+'°':'--°';
 put('launcherWeather',weather?'保存気象 '+temperature+' / '+(S.weather.place||'現在地'):'気象データ未取得');
 put('launcherInfra',S.defense?.status==='active'?'敵性反応 / 都市防衛中':!S.infra.power||!S.infra.comms?'系統異常 / 要確認':'都市防衛 / '+({idle:'待機中',victory:'迎撃成功',defeat:'復旧待ち'}[S.defense?.status]||'待機中'));
 put('launcherEva','出撃 '+S.evas.filter(e=>e.state==='DEPLOYED').length+' / 3');
 put('launcherMission',staffStageNames[S.mission.phase]||'状況確認');
 put('launcherMagi',magiIntrusionActive()?'侵食検知 / 審議停止中':S.magi.approvedFor!=null?'UNIT-0'+S.magi.approvedFor+' / 出撃承認済':'三基審議 / 待機中');
 put('launcherTools','未完了タスク '+S.tasks.filter(t=>!t.done).length);
 put('launcherSettings','効果音 '+(S.prefs.sound?'ON':'OFF')+' / 演出 '+(S.prefs.motion?'ON':'OFF'));
 const slider=$('soundVolume');if(slider){slider.value=String(S.prefs.soundVolume??55);$('soundVolumeValue').textContent=slider.value+'%';}
}
function initTerminalEffects(){
 const launcher=qs('#commandLauncher');if(!launcher)return; // Node-only DOM harness has no mounted UI.
 const ambient=document.createElement('div');ambient.className='terminal-ambient';ambient.setAttribute('aria-hidden','true');
 ambient.innerHTML='<i class="ambient-scan"></i><i class="ambient-rail"></i>';qs('#shell').prepend(ambient);
 let alertKey=null,alertPage='infra';
 function renderTerminalAlert(){
  const state=terminalAlert(),panel=$('commandAlert'),visible=state.level!=='nominal';
  const put=(id,text)=>{const el=$(id);if(el.textContent!==text)el.textContent=text;};
  panel.classList.toggle('hidden',!visible);panel.dataset.level=state.level;
  document.body.dataset.alert=state.level;
  if(visible){
   put('commandAlertCode',state.level==='critical'?'EMERGENCY / SYSTEM FAILURE':'TACTICAL / CONDITION ALERT');
   put('commandAlertTitle',state.title);put('commandAlertMessage',state.message);alertPage=state.page;
  }
  // One finite cue on a new incident; redraws and navigation never restart it.
  if(alertKey!==null&&alertKey!==state.key&&visible)sound(state.level==='critical'?'alarm':'warning');
  alertKey=state.key;
 }
 const priorDraw=draw;draw=function(){priorDraw();renderLauncher();renderTerminalAlert();};
 const priorAlert=renderTacticalAlert;renderTacticalAlert=function(){priorAlert();renderTerminalAlert();};
 const priorSettings=renderSettings;renderSettings=function(){priorSettings();renderLauncher();};
 const priorGo=go;go=function(page){
  if(page==='magi'&&currentPage==='eva')S.magi.purpose='sortie';
  if(page==='magi'&&currentPage==='infra')S.magi.purpose='intercept';
  priorGo(page);document.body.dataset.page=currentPage;
  if(isMoving()){
   const active=qs('.page.active');active.classList.remove('terminal-enter');void active.offsetWidth;active.classList.add('terminal-enter');
  }
 };
 window.NERV_TEST.open=go;
 $('commandAlertOpen').addEventListener('click',()=>openAlertReview());
 $('alertContinue').addEventListener('click',closeAlertReview);
 $('alertClear').addEventListener('click',clearTerminalAlert);
 $('alertTarget').addEventListener('click',()=>{if(recoveryBusy)return;closeAlertReview();go(alertPage);if(window.NERV_MOBILE)window.NERV_MOBILE.open(alertPage,alertPage==='infra'?(S.infra.power&&S.infra.comms?'facilities':'systems'):alertPage==='magi'?'intrusion':'control');});
 $('alertReview').addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();closeAlertReview();}
  if(event.key==='Tab'){const buttons=all('#alertReview button:not(:disabled)');if(!buttons.length){event.preventDefault();return;}const first=buttons[0],last=buttons[buttons.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
 });
 window.NERV_TEST.reviewAlert=openAlertReview;
 document.body.dataset.page=currentPage;
 $('soundVolume').addEventListener('input',event=>{
  S.prefs.soundVolume=Number(event.target.value);$('soundVolumeValue').textContent=event.target.value+'%';
  if(audio&&soundBus)soundBus.gain.setTargetAtTime(soundLevel(),audio.currentTime,.025);persist();
 });
 $('soundPreview').addEventListener('click',()=>{if(S.prefs.sound)sound('launch');else toast('効果音をONにしてから確認してください');});
 document.addEventListener('pointerdown',event=>{
  if(S.prefs.sound){try{prepareSound();}catch(e){}}
  const button=event.target.closest('button');
  if(button&&isMoving()){button.classList.remove('terminal-press');void button.offsetWidth;button.classList.add('terminal-press');}
 },{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSound();});
 const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const motionChange=()=>{if(media?.matches)all('.terminal-enter,.terminal-press').forEach(el=>el.classList.remove('terminal-enter','terminal-press'));};
 if(media?.addEventListener)media.addEventListener('change',motionChange);
 renderLauncher();renderTerminalAlert();
}
initTerminalEffects();
