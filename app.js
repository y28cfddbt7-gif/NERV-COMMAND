'use strict';
(()=>{
const $=id=>document.getElementById(id);
const qs=s=>document.querySelector(s);
const all=s=>Array.from(document.querySelectorAll(s));
const defaults=()=>({
  prefs:{sound:false,motion:true,showBoot:true,autoWeather:false},
  tasks:[],
  weather:null,
  infra:{power:true,armor:false,comms:true},
  evas:[{state:'HANGAR',sync:71.6,power:300,at:false},{state:'HANGAR',sync:83.4,power:300,at:false},{state:'HANGAR',sync:79.2,power:300,at:false}],
  magi:{approvedFor:null,vote:null,diagnosedAt:null},
  mission:{phase:0},logs:{infra:[],eva:[],magi:[],mission:[]},selectedEva:0
});
let S=defaults();
try{const b=window.__BOOT__?.state||JSON.parse(localStorage.getItem('nerv-command-v2')||'null');if(b&&typeof b==='object'){
  S={...S,...b,prefs:{...S.prefs,...b.prefs},infra:{...S.infra,...b.infra},magi:{...S.magi,...b.magi},mission:{...S.mission,...b.mission},logs:{...S.logs,...b.logs}};
  if(!Array.isArray(S.tasks))S.tasks=[];if(!Array.isArray(S.evas)||S.evas.length!==3)S.evas=defaults().evas;
  S.evas=S.evas.map((e,i)=>({...defaults().evas[i],...e}));
}}catch(e){console.warn('state parse',e)}
let currentPage='home',audio=null,toastTimeout=0,saveTimeout=0,busyWeather=false;
let battery=window.__BOOT__?.battery??null,charging=window.__BOOT__?.charging??false;
let focus={length:1500,remaining:1500,deadline:0,running:false};
let nextBridgeId=1;const bridgeCallbacks={};window.__nervQueue=[];
window.__nervDeliver=(id,result)=>{const entry=bridgeCallbacks[id];if(entry){delete bridgeCallbacks[id];entry(result);}};
function callNative(action,payload={}){
  if(window.__SCRIPTABLE__){return new Promise((resolve)=>{const id=nextBridgeId++;bridgeCallbacks[id]=resolve;window.__nervQueue.push({id,action,payload});});}
  if(action==='persist'){try{localStorage.setItem('nerv-command-v2',JSON.stringify(payload.state));return Promise.resolve({ok:true});}catch(e){return Promise.resolve({error:String(e)})}}
  if(action==='battery'){return navigator.getBattery?navigator.getBattery().then(b=>({level:Math.round(b.level*100),charging:b.charging})):Promise.resolve({level:null,charging:false});}
  if(action==='weather'){return browserWeather();}
  if(action==='mapLocation'){return new Promise(resolve=>{if(!navigator.geolocation)return resolve({error:'現在地に非対応の環境です'});navigator.geolocation.getCurrentPosition(p=>resolve({lat:p.coords.latitude,lng:p.coords.longitude}),e=>resolve({error:e.message}),{timeout:12000,enableHighAccuracy:false,maximumAge:120000});});}
  return Promise.resolve({error:'Unsupported action'});
}
function persist(){clearTimeout(saveTimeout);saveTimeout=setTimeout(()=>{const data=JSON.parse(JSON.stringify(S));callNative('persist',{state:data}).then(r=>{if(r?.error)toast('保存できませんでした: '+r.error);});},180);}
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.remove('hidden');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.add('hidden'),3800);}
function hhmmss(ts=Date.now()){return new Date(ts).toLocaleTimeString('ja-JP',{hour12:false});}
function addLog(type,text){const list=S.logs[type]||(S.logs[type]=[]);list.unshift({time:hhmmss(),text});if(list.length>35)list.length=35;persist();}
function renderLogs(type){const e=$(type+'Log');if(!e)return;e.replaceChildren();(S.logs[type]||[]).slice(0,9).forEach(x=>{const div=document.createElement('div');div.className='log-entry';const t=document.createElement('time');t.textContent='['+x.time+']';div.append(t,document.createTextNode(x.text));e.appendChild(div)});if(!e.children.length)e.textContent='// NO RECORDS / STANDBY';}
function sound(kind='tap'){
 if(!S.prefs.sound)return;
 try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const n=audio.currentTime;
 const tones={tap:[[630,0,.08],[850,.085,.055]],select:[[420,0,.13],[590,.13,.13]],ok:[[410,0,.10],[620,.13,.12],[860,.26,.2]],warning:[[170,0,.24],[124,.27,.28],[170,.55,.25]],launch:[[190,0,.17],[250,.2,.17],[380,.4,.23],[570,.63,.28]],scan:[[980,0,.04],[740,.07,.04],[520,.14,.09]],deny:[[330,0,.15],[215,.2,.23]],done:[[540,0,.1],[750,.14,.14],[980,.3,.2]]}[kind]||[[580,0,.1]];
 tones.forEach(([freq,at,len],i)=>{const osc=audio.createOscillator(),g=audio.createGain();osc.type=(kind==='warning'?'sawtooth':'triangle');osc.frequency.setValueAtTime(freq,n+at);osc.frequency.exponentialRampToValueAtTime(freq*.88,n+at+len);g.gain.setValueAtTime(.0001,n+at);g.gain.exponentialRampToValueAtTime(kind==='warning'?.052:.027,n+at+.016);g.gain.exponentialRampToValueAtTime(.0001,n+at+len);osc.connect(g);g.connect(audio.destination);osc.start(n+at);osc.stop(n+at+len+.02);});}catch(e){console.warn('audio',e)}
}
function go(page){settleEvaPower();if(!qs('.page[data-page="'+page+'"]'))return;currentPage=page;all('.page').forEach(el=>el.classList.toggle('active',el.dataset.page===page));all('[data-nav]').forEach(el=>el.classList.toggle('active',el.dataset.nav===page));$('topMode').textContent=page==='weather'||page==='tools'?'● REAL DATA':'● '+(page==='home'?'ACTIVE':'SIMULATION');$('topMode').style.color=page==='weather'||page==='tools'?'#8cdfa4':'#f9ad54';window.scrollTo({top:0,behavior:'instant'});draw();if(page==='infra')setTimeout(ensureMap,100);if(page==='weather')setTimeout(meteoEnter,80);else if(meteoRadarPlaying)meteoRadarPlayToggle();renderTacticalAlert();sound('tap');}
function openApp(skip){$('boot').classList.add('hidden');$('shell').classList.remove('hidden');if(skip){S.prefs.showBoot=false;persist();}draw();if(S.prefs.autoWeather && !window.__weatherTriggered){window.__weatherTriggered=true;setTimeout(loadWeather,500);}}
$('bootEnter').addEventListener('click',()=>{openApp(false);sound('ok')});$('bootSkip').addEventListener('click',()=>{openApp(true);toast('次回から起動演出を省略します')});
$('bootBar').style.width='100%';$('bootText').textContent='SYSTEM READY // AWAITING AUTHORIZATION';

all('[data-open]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.open)));
all('[data-nav]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.nav)));
$('quickSettings').addEventListener('click',()=>go('settings'));$('goHome').addEventListener('click',()=>go('home'));$('goHome').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go('home')}});
function fmtWx(code){if(code==null)return['--','◌'];if(code===0)return['快晴','☀'];if(code<4)return['晴れ・曇り','◕'];if(code===45||code===48)return['霧','≋'];if(code<60)return['霧雨','☂'];if(code<70)return['雨','☂'];if(code<80)return['雪','❄'];if(code<83)return['にわか雨','☁'];if(code<87)return['にわか雪','❄'];if(code<=99)return['雷雨','ϟ'];return['不明','◌'];}
function weatherUrl(lat,lon){return 'https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(lat)+'&longitude='+encodeURIComponent(lon)+'&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code&forecast_days=2&timezone=auto';}
function browserWeather(){return new Promise(resolve=>{if(!navigator.geolocation)return resolve({error:'このブラウザでは位置情報を利用できません'});navigator.geolocation.getCurrentPosition(async p=>{try{const lat=p.coords.latitude,lon=p.coords.longitude;const resp=await fetch(weatherUrl(lat,lon));if(!resp.ok)throw Error('HTTP '+resp.status);const raw=await resp.json();resolve({weather:raw,place:'現在地',updated:Date.now()});}catch(e){resolve({error:'通信エラー: '+e.message});}},e=>resolve({error:'位置情報エラー: '+e.message}),{timeout:12000,enableHighAccuracy:false,maximumAge:300000});});}
function applyWeather(result){if(!result?.weather?.current||!result.weather.hourly){toast('気象データが不正です');return false;}S.weather={raw:result.weather,place:result.place||'現在地',updated:result.updated||Date.now()};S.prefs.autoWeather=true;persist();renderWeather();renderHome();meteoUpdateRegions(true);return true;}
async function loadWeather(){if(busyWeather)return;busyWeather=true;$('weatherFetch').disabled=true;$('weatherFetch').textContent='◎ 現在地と気象データを取得中';$('weatherStatus').textContent='位置情報を取得し、気象サービスに照会しています…';sound('scan');try{const r=await callNative('weather');if(r?.error){$('weatherStatus').textContent=r.error+'。最後の取得値がある場合は保存値として表示します。';toast('天候の更新に失敗: '+r.error);sound('deny');}else if(applyWeather(r)){$('weatherStatus').textContent='気象データを更新しました。';toast('現在地の気象情報を更新');sound('ok');}}catch(e){$('weatherStatus').textContent='通信に失敗: '+e.message;}finally{busyWeather=false;$('weatherFetch').disabled=false;$('weatherFetch').textContent='◎ 現在地の天気を取得・更新';renderWeather();if(currentPage==='weather')meteoLoadRadar(true);}}
$('weatherFetch').addEventListener('click',loadWeather);
function weatherCurrent(){return S.weather?.raw?.current||null;}
function renderWeather(){const c=weatherCurrent(),w=S.weather;
 if(!c){meteoText('wxLocation','現在地未取得');meteoText('wxFresh','未取得');meteoText('wxTemp','--');meteoText('wxGlyph','◌');meteoText('wxDescription','気象データ未取得');['wxFeels','wxHumidity','wxWind','wxPressure'].forEach(id=>meteoText(id,'--'));$('forecast').innerHTML='<div class="meteo-empty">気象データを取得してください</div>';meteoRenderCurrent();return;}
 const [desc,glyph]=fmtWx(c.weather_code);meteoText('wxLocation',w.place||'現在地');meteoText('wxGlyph',glyph);meteoText('wxTemp',Number.isFinite(c.temperature_2m)?Math.round(c.temperature_2m):'--');meteoText('wxDescription',desc);
 meteoText('wxFeels',meteoNum(c.apparent_temperature,'°C',1));meteoText('wxHumidity',meteoNum(c.relative_humidity_2m,'%',0));meteoText('wxWind',meteoNum(c.wind_speed_10m,'km/h',1));meteoText('wxPressure',meteoNum(c.pressure_msl,'hPa',0));
 const minutes=Math.max(0,Math.floor((Date.now()-w.updated)/60000)),fresh=minutes<=30;meteoText('wxFresh',fresh?'取得 '+new Date(w.updated).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}):'保存値 '+minutes+'分前');$('wxFresh').style.color=fresh?'#83e3b2':'#ffbb73';
 const forecast=$('forecast');forecast.replaceChildren();const h=w.raw.hourly||{},times=h.time||[];const currentHour=(c.time||'').slice(0,13);let index=times.findIndex(t=>t.slice(0,13)>=currentHour);if(index<0)index=0;
 times.slice(index,index+6).forEach((time,i)=>{const k=index+i,el=document.createElement('div');el.className='forecast-cell';const hour=document.createElement('time');hour.textContent=time.slice(11,16);const icon=document.createElement('span');icon.className='f-icon';icon.textContent=fmtWx(h.weather_code?.[k])[1];const tmp=document.createElement('b');tmp.textContent=Number.isFinite(h.temperature_2m?.[k])?Math.round(h.temperature_2m[k])+'°':'--';const rain=document.createElement('small');const p=h.precipitation_probability?.[k];rain.textContent=p==null?'--%':p+'%';const bar=document.createElement('span');bar.className='precip-track';const fill=document.createElement('i');fill.style.width=Math.min(100,Math.max(0,Number(p)||0))+'%';bar.append(fill);el.append(hour,icon,tmp,bar,rain);forecast.append(el);});meteoRenderCurrent();}
function renderBattery(){if(battery==null){$('homeBattery').textContent='--%';$('batterySub').textContent='取得できません';return;}$('homeBattery').textContent=battery+'%';$('batteryFill').style.width=battery+'%';$('batterySub').textContent=charging?'充電中':'バッテリー残量';}
function renderHome(){const c=weatherCurrent();if(c){$('homeTemp').textContent=Math.round(c.temperature_2m)+'°';$('homeWeather').textContent=fmtWx(c.weather_code)[0];$('homeCity').textContent=S.weather.place+(Date.now()-S.weather.updated>30*60000?' / 保存値':' / 取得済');}else{$('homeTemp').textContent='--°';$('homeWeather').textContent='位置情報の取得待ち';$('homeCity').textContent='タップして取得';}const open=S.tasks.filter(t=>!t.done).length;$('homeTodo').innerHTML=open+' <i>OPEN</i>';const fault=!S.infra.power||!S.infra.comms||S.mission.phase>0&&S.mission.phase<6;$('homeStatus').textContent=fault?'TACTICAL ALERT / SIM':'ALL SYSTEMS NOMINAL / SIM';renderBattery();meteoText('nxComms',S.infra.comms?'ONLINE':'OFFLINE');meteoText('nxEvas',S.evas.filter(e=>e.state==='DEPLOYED').length+' / 3');meteoText('nxMagi',S.magi.approvedFor!==null?'APPROVED':'STANDBY');meteoText('nxMeteo',c?'ONLINE':'OFFLINE');meteoText('nxOps',fault?'TACTICAL ALERT':'ALL STATIONS READY');}
function renderInfra(){const a=S.infra,ready=40+ (a.power?25:0)+(a.comms?20:0)+(a.armor?15:0);$('cityReady').textContent=ready+'%';$('cityPower').textContent=a.power?'ON':'OFF';$('cityArmor').textContent=a.armor?'CLOSED':'OPEN';$('powerState').textContent=a.power?'主電源供給中':'主電源停止';$('armorState').textContent=a.armor?'装甲閉鎖済':'装甲開放中';$('commsState').textContent=a.comms?'通信回線正常':'通信回線断';$('infraAlert').textContent=a.power&&a.comms?'NOMINAL':'ALERT';$('infraAlert').style.color=a.power&&a.comms?'#88dcaa':'#ff5353';renderLogs('infra');}
function invalidateApproval(){if(S.magi.approvedFor!==null){addLog('magi','インフラ状態変更：既存の出撃承認を失効');}S.magi.approvedFor=null;S.magi.vote=null;}
['power','armor','comms'].forEach(key=>{$(key+'Toggle').addEventListener('click',()=>{S.infra[key]=!S.infra[key];invalidateApproval();addLog('infra',key.toUpperCase()+' / '+(S.infra[key]?'ONLINE':'OFFLINE'));renderInfra();renderEVA();renderMAGI();renderHome();renderTacticalAlert();sound(S.infra[key]?'ok':'warning');toast(key.toUpperCase()+' を '+(S.infra[key]?'有効':'無効')+' に変更');});});
$('infraDiag').addEventListener('click',()=>{const bad=Object.entries(S.infra).filter(([,v])=>!v).map(([k])=>k.toUpperCase());addLog('infra','自動診断 / '+(bad.length?'要確認 '+bad.join(', '):'3系統異常なし'));renderInfra();sound(bad.length?'warning':'scan');toast(bad.length?'診断結果：'+bad.join(' / ')+' に注意':'都市インフラ3系統の診断完了');});
const stateJP={HANGAR:'格納中',READY:'発進準備完了',DEPLOYED:'出撃中',MAINTENANCE:'整備中',POWER_LOST:'電源喪失'};
function selected(){return S.evas[S.selectedEva];}
const EVA_STATES=['HANGAR','READY','DEPLOYED','POWER_LOST','MAINTENANCE'];
let lastPowerSave=Date.now();
// Migration does NOT debit undocumented time from pre-v2.2 saves.
function migrateEvaClocks(now=Date.now()){
 S.evas.forEach(e=>{
  if(!Number.isFinite(e.power))e.power=300;
  e.power=Math.max(0,Math.min(300,Math.floor(e.power)));
  if(!EVA_STATES.includes(e.state))e.state='HANGAR';
  if(e.state==='DEPLOYED'){
   if(!Number.isFinite(e.powerUpdatedAt)||e.powerUpdatedAt<=0)e.powerUpdatedAt=now;
  }else{e.powerUpdatedAt=null; if(e.state==='POWER_LOST'){e.power=0;e.at=false;}}
 });
}
function settleEvaPower(now=Date.now()){
 let dirty=false,emergency=false;
 S.evas.forEach((e,i)=>{
  if(e.state!=='DEPLOYED')return;
  let anchor=e.powerUpdatedAt;
  if(!Number.isFinite(anchor)||anchor<=0||anchor>now){e.powerUpdatedAt=now;return;}
  const seconds=Math.floor((now-anchor)/1000);
  if(seconds<1)return;
  const old=e.power;
  e.power=Math.max(0,old-seconds*(e.at?2:1));
  e.powerUpdatedAt=anchor+seconds*1000;
  if(e.power!==old)dirty=true;
  if(e.power===0){e.state='POWER_LOST';e.at=false;e.powerUpdatedAt=null;
   S.magi.approvedFor=S.magi.approvedFor===i?null:S.magi.approvedFor;
   addLog('eva','UNIT-0'+i+' / EMERGENCY INTERNAL POWER LOST');emergency=true;
  }
 });
 if(emergency){sound('warning');persist();}
 else if(dirty&&now-lastPowerSave>=15000){lastPowerSave=now;persist();}
 return dirty;
}
migrateEvaClocks();settleEvaPower();
const EVA_NAMES=['PROTOTYPE','TEST TYPE','PRODUCTION'];
const EVA_STEPS={HANGAR:'01 / PREPARE',READY:'02 / MAGI AUTHORIZE',DEPLOYED:'03 / ACTIVE CONTROL',POWER_LOST:'04 / RECOVER',MAINTENANCE:'05 / MAINTAIN'};
function rejectEva(why){toast(why);sound('deny');renderEVA();}
function renderEVA(){
 const idx=S.selectedEva,e=selected(),isSortie=e.state==='DEPLOYED',approved=S.magi.approvedFor===idx&&e.state==='READY';
 all('[data-eva]').forEach(b=>{const active=Number(b.dataset.eva)===idx;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 const shell=qs('.eva-display'),figure=$('evaArtwork');shell.dataset.unit=String(idx);shell.dataset.state=e.state;figure.dataset.unit=String(idx);figure.dataset.state=e.state;
 figure.classList.toggle('at-on',isSortie&&e.at);
 $('evaSvg').setAttribute('aria-label','EVANGELION UNIT-0'+idx+' / '+EVA_NAMES[idx]+' / '+e.state+' / 生体機体全身スキャン');
 $('evaUnitLabel').textContent='EVANGELION UNIT-0'+idx;
 $('evaUnitDesignation').textContent=EVA_NAMES[idx]+' / UNIT-0'+idx;
 $('evaPaintMode').textContent=['AZURE / PROTOTYPE','VIOLET / TEST TYPE','SCARLET / PRODUCTION'][idx];
 $('evaTargetLock').textContent=e.state==='DEPLOYED'?'TRACKING / ACTIVE':'RESERVE / SECURE';
 $('evaNumSync').textContent=Number(e.sync).toFixed(1)+'%';$('evaNumMode').textContent=e.state==='DEPLOYED'?'ARMED / FIELD READY':'BIO-SCAN / STANDBY';
 $('evaFigureStamp').textContent='REF.0'+idx+' / DRAWING LAYER';
 $('evaStatusTag').textContent=e.state==='POWER_LOST'?'⚠ POWER LOST':e.state;
 $('evaActiveMode').textContent=e.state==='HANGAR'?'RESTRAINT ACTIVE':e.state==='READY'?'LAUNCH STANDBY':e.state==='DEPLOYED'?'OPERATION ACTIVE':e.state==='POWER_LOST'?'RECOVERY REQUIRED':'MAINTENANCE';
 $('evaScanMode').textContent=e.state==='DEPLOYED'?'SCAN / REALTIME':e.state==='POWER_LOST'?'SCAN / CRITICAL':'SCAN / STANDBY';
 $('evaSync').textContent=e.sync.toFixed(1)+'%';$('evaSyncBar').style.width=Math.max(0,Math.min(100,e.sync))+'%';
 const p=Math.max(0,Math.ceil(e.power));$('evaBattery').textContent=String(Math.floor(p/60)).padStart(2,'0')+':'+String(p%60).padStart(2,'0');$('evaBatteryBar').style.width=p/3+'%';
 $('evaAT').textContent=e.at?'ACTIVE':'STANDBY';$('evaATBar').style.width=e.at?'100%':'5%';
 let magiText='NOT REQUESTED';
 if(approved)magiText='● APPROVED / UNIT-0'+idx;
 else if(S.magi.vote?.eva===idx)magiText=S.magi.vote.approved?'EXPIRED / RECHECK':'DENIED / RECHECK';
 else if(S.magi.approvedFor!==null)magiText='OTHER UNIT APPROVED';
 $('evaMagiState').textContent=magiText;$('evaMagiState').style.color=approved?'#89efa9':'#e8b273';
 $('evaRestraint').textContent=e.state==='HANGAR'||e.state==='MAINTENANCE'?'LOCKED':e.state==='READY'?'RELEASE READY':'RELEASED';
 $('evaUmbDisplay').textContent=isSortie||e.state==='POWER_LOST'?'UMBILICAL / DISCONNECTED':'UMBILICAL / CONNECTED';
 $('evaGrid').textContent=S.infra.power?'ONLINE':'OFFLINE';$('evaGrid').classList.toggle('offline',!S.infra.power);
 $('evaComms').textContent=S.infra.comms?'CONNECTED':'OFFLINE';$('evaComms').classList.toggle('offline',!S.infra.comms);
 $('evaArmor').textContent=S.infra.armor?'DEPLOYED':'STANDBY';
 $('evaPrepare').disabled=e.state!=='HANGAR'||!S.infra.power;
 $('evaLaunch').disabled=e.state!=='READY'||!approved||!S.infra.power||!S.infra.comms;
 $('evaReturn').disabled=!['DEPLOYED','POWER_LOST'].includes(e.state);
 $('evaATButton').disabled=!isSortie||(!e.at&&e.power<10);
 $('evaATButton').innerHTML=(e.at?'⬡ A.T.解除':'⬡ A.T.展開')+'<span>FIELD CONTROL</span>';
 $('evaMaintain').disabled=e.state!=='MAINTENANCE';
 $('evaMagiButton').disabled=e.state!=='READY';
 $('evaNextAction').textContent=EVA_STEPS[e.state]||'STANDBY';
 const notes={HANGAR:S.infra.power?'発進準備 → MAGI審議 → 出撃。':'主電源OFF。都市インフラで復旧してください。',
 READY:approved?'MAGI承認済み。出撃命令を実行できます。':'発進準備完了。MAGI審議で対象ユニットの承認を取得してください。',
 DEPLOYED:'出撃中。内部電源は'+(e.at?'2秒/秒（AT展開中）':'1秒/秒')+'で消費。帰投またはA.T.を操作できます。',
 POWER_LOST:'⚠ 内部電源が枯渇。帰投／回収を指示してください。',MAINTENANCE:'機体回収済み。整備完了で格納状態に復帰し電源を復旧。'};
 $('evaGuidance').textContent=notes[e.state];
 renderLogs('eva');
}
all('[data-eva]').forEach(el=>el.addEventListener('click',()=>{settleEvaPower();S.selectedEva=Number(el.dataset.eva);persist();renderEVA();flashUnitSwitch();sound('select');}));
$('evaPrepare').addEventListener('click',()=>{
 settleEvaPower();const e=selected(),unit=S.selectedEva;
 if(e.state!=='HANGAR')return rejectEva('発進準備は格納中のみ実行できます');
 if(!S.infra.power)return rejectEva('主電源の復旧が必要');
 playSequence('prepare','発進準備シーケンス','EVANGELION UNIT-0'+unit,
  ['格納ケージ接続 / CAGE UPLINK','パイロット信号 / LINK VERIFIED','LCL循環・拘束制御 / CHECK','機体制御権 / READY'],()=>{
   e.state='READY';e.powerUpdatedAt=null;invalidateApproval();addLog('eva','UNIT-0'+unit+' / LAUNCH PREPARED');sound('ok');draw();toast('UNIT-0'+unit+' 発進準備完了');});
});
$('evaLaunch').addEventListener('click',()=>{
 settleEvaPower();const e=selected(),unit=S.selectedEva;
 if(e.state!=='READY')return rejectEva('発進準備を完了してください');
 if(S.magi.approvedFor!==unit){rejectEva('MAGIの対象機体への出撃承認がありません');go('magi');return;}
 if(!S.infra.power||!S.infra.comms)return rejectEva('電力・通信系統を復旧してください');
 playSequence('launch','EVA射出管制','UNIT-0'+unit+' / EJECTION PROTOCOL',
  ['MAGI承認照合 / VERIFIED','アンビリカル・電源経路切替','拘束装置解除 / CAGE RELEASE','射出台上昇 / LAUNCH CONFIRMED'],()=>{
   e.state='DEPLOYED';e.power=300;e.powerUpdatedAt=Date.now();e.at=false;S.magi.approvedFor=null;S.magi.vote=null;
   addLog('eva','UNIT-0'+unit+' / LAUNCHED / INTERNAL POWER 05:00');sound('launch');toast('UNIT-0'+unit+' 出撃');draw();});
});
$('evaATButton').addEventListener('click',()=>{
 settleEvaPower();const e=selected();if(e.state!=='DEPLOYED')return rejectEva('A.T.操作は出撃中のみ可能です');
 if(!e.at&&e.power<10)return rejectEva('内部電源不足。A.T.展開には10秒以上必要');
 e.at=!e.at;addLog('eva','UNIT-0'+S.selectedEva+' / A.T.FIELD '+(e.at?'DEPLOYED':'RELEASED'));sound(e.at?'launch':'tap');draw();
});
$('evaReturn').addEventListener('click',()=>{
 settleEvaPower();const e=selected(),unit=S.selectedEva;
 if(!['DEPLOYED','POWER_LOST'].includes(e.state))return rejectEva('帰投／回収は出撃中か電源喪失時のみ');
 playSequence('recovery','機体回収シーケンス','UNIT-0'+unit+' / RECOVERY',
  ['外部管制モードへ切替','格納ケージ / 回収ルート確保','機体拘束・A.T.FIELD停止','CAGE DOCKED / MAINTENANCE'],()=>{
   e.state='MAINTENANCE';e.at=false;e.powerUpdatedAt=null;
   addLog('eva','UNIT-0'+unit+' / RETURNED / MAINTENANCE REQUIRED');sound('ok');draw();toast('UNIT-0'+unit+' 回収完了');});
});
$('evaMaintain').addEventListener('click',()=>{
 const e=selected();if(e.state!=='MAINTENANCE')return rejectEva('整備完了操作は整備中のみ可能です');
 e.state='HANGAR';e.power=300;e.powerUpdatedAt=null;e.at=false;addLog('eva','UNIT-0'+S.selectedEva+' / MAINTENANCE COMPLETED');sound('ok');draw();
});
function voteInfo(){const e=selected(),i=S.infra;return [
 {name:'BALTHASAR',yes:i.power&&e.state==='READY',reason:'発進態勢・電力供給'},
 {name:'CASPER',yes:i.armor&&i.comms,reason:'都市防護・通信の安全性'},
 {name:'MELCHIOR',yes:i.power&&e.power>=240,reason:'電力と機体稼働条件'}];}
function renderMAGI(){const v=S.magi.vote;const stat=(key,status,sub)=>{$('m'+key+'Status').textContent=status;$('m'+key+'Sub').textContent=sub;};if(v){v.votes.forEach((x,i)=>{const code=['B','C','M'][i];stat(code,x.yes?'APPROVE':'DENY',x.reason.toUpperCase().slice(0,19));});$('magiLiveState').textContent=v.approved?'APPROVED':'REJECTED';$('magiLiveState').style.color=v.approved?'#8ae6a5':'#ff5b63';$('magiDecision').textContent='UNIT-0'+v.eva+' / '+(v.approved?'発進承認':'発進否決')+'  '+v.count+'/3票\n'+v.votes.map(x=>x.name+'：'+(x.yes?'承認':'否決')+' / '+x.reason).join('\n');}else{stat('B','NORMAL','DECISION ENGINE');stat('C','NORMAL','HUMAN SAFETY');stat('M','NORMAL','TECHNICAL LOGIC');$('magiLiveState').textContent='STANDBY';$('magiDecision').textContent='審議開始で現在の都市・機体条件から判定します。';}updateMagiTracks(v?.votes||null);renderLogs('magi');}
$('magiDiagnose').addEventListener('click',()=>{const err=[];if(!S.infra.power)err.push('電力供給停止');if(!S.infra.comms)err.push('通信断');S.evas.forEach((e,i)=>{if(e.state==='POWER_LOST')err.push('UNIT-0'+i+' 電源喪失')});S.magi.diagnosedAt=Date.now();addLog('magi','SELF DIAGNOSTICS / '+(err.length?err.join('; '):'ALL CORE HEALTHY'));sound(err.length?'warning':'scan');toast(err.length?'自己診断：'+err.join(', '):'三基自己診断 完了 / 異常なし');draw();});
$('magiVote').addEventListener('click',()=>{
 settleEvaPower();const unit=S.selectedEva,votes=voteInfo(),count=votes.filter(x=>x.yes).length,approved=count>=2&&S.infra.comms;
 updateMagiTracks(null);
 playSequence('magi','MAGI三基審議','UNIT-0'+unit+' / DEPLOYMENT AUTHORIZATION',
  ['BALTHASAR-2 / STRATEGIC ANALYSIS','CASPER-3 / PERSONNEL SAFETY','MELCHIOR-1 / TECHNICAL LOGIC','CONSENSUS / FINAL DETERMINATION'],()=>{
   S.magi.vote={votes,count,approved,eva:unit,time:Date.now()};S.magi.approvedFor=approved?unit:null;
   addLog('magi','UNIT-0'+unit+' '+(approved?'APPROVED':'DENIED')+' / '+count+'/3');
   sound(approved?'ok':'deny');toast(approved?'MAGI審議承認：EVA出撃可能':'MAGI審議否決：運用条件を確認');draw();
  },votes);
});
all('[data-core]').forEach(btn=>btn.addEventListener('click',()=>{const k=btn.dataset.core,idx={b:0,c:1,m:2}[k],v=voteInfo()[idx];const name={b:'BALTHASAR-2',c:'CASPER-3',m:'MELCHIOR-1'}[k];addLog('magi',name+' / 独立解析 / '+(v.yes?'READY':'CAUTION'));sound('scan');toast(name+'：'+v.reason+' / '+(v.yes?'条件適合':'条件不適合'));renderMAGI();}));
const missionMessages=[
 '模擬シナリオを開始してください。',
 '都市防御を確保。退避区域を閉鎖し、装甲シャッターを展開します。',
 '第3新東京市の電力供給系統を確認し、対使徒作戦へ切り替えます。',
 'EVAを準備し、MAGI審議を経て最低1機を出撃させてください。',
 'レーダーによる照準補正と標的捕捉を行います。',
 '捕捉完了。EVAが出撃中で通信が正常なら射撃指示を送れます。',
 '作戦完了。標的を制圧した模擬判定です。'];
function renderMission(){const n=S.mission.phase;$('missionStep').textContent='PHASE '+String(n).padStart(2,'0')+' / '+(n===0?'STANDBY':n===6?'COMPLETE':'EXECUTING');$('missionReady').textContent=n===6?'SECURE':n===0?'READY':'ALERT';$('missionDescription').textContent=missionMessages[n]||'';$('radarState').textContent=n===0?'STANDBY':n===6?'TARGET LOST':'TRACKING';const labels=['▶ 作戦開始','▣ 都市防御 / 退避','⚡ 電力系統切替','◈ EVA発進確認','⌖ 照準・索敵','◎ 射撃命令','✓ 作戦完了'];$('missionAction').textContent=labels[n];$('missionAction').disabled=n===6;const bars=$('missionPhaseBars');bars.replaceChildren();for(let i=0;i<5;i++){const b=document.createElement('i');b.className=i<n?'active':'';bars.append(b)}renderLogs('mission');}
$('missionAction').addEventListener('click',()=>{const n=S.mission.phase;if(n===0){S.mission.phase=1;addLog('mission','TACTICAL SCENARIO START / TARGET DETECTED');sound('warning');}
 else if(n===1){S.infra.armor=true;S.infra.comms=true;invalidateApproval();S.mission.phase=2;addLog('mission','CITY EVACUATION / ARMOR DEPLOYED');sound('ok');}
 else if(n===2){S.infra.power=true;invalidateApproval();S.mission.phase=3;addLog('mission','POWER SYSTEM / STANDBY RESOURCES CONNECTED');sound('scan');}
 else if(n===3){if(!S.evas.some(e=>e.state==='DEPLOYED')){toast('EVAの発進が必要です。EVA運用へ移動');sound('deny');go('eva');return;}S.mission.phase=4;addLog('mission','EVA DEPLOYMENT / CONFIRMED');sound('ok');}
 else if(n===4){if((S.ops?.currentMissionLocks||0)<1){toast('目標照準ゲームで1回以上ロックしてください');sound('deny');return;}S.mission.phase=5;addLog('mission','TARGET LOCK / FIRE CONTROL READY');sound('scan');}
 else if(n===5){if(!S.infra.comms||!S.evas.some(e=>e.state==='DEPLOYED')){toast('通信回線とEVA出撃状態を確認');sound('deny');return;}S.mission.phase=6;addLog('mission','OPERATION COMPLETE / TARGET NEUTRALIZED (SIM)');sound('done');}
 draw();});
$('missionReset').addEventListener('click',()=>{S.mission.phase=0;addLog('mission','OPERATION RESET');sound('tap');draw();});
function renderTasks(){const list=$('taskList');list.replaceChildren();S.tasks.forEach(t=>{const item=document.createElement('div');item.className='task-line'+(t.done?' complete':'');const ch=document.createElement('button');ch.className='task-check';ch.textContent=t.done?'✓':'□';ch.setAttribute('aria-label','タスク完了状態を切り替え');ch.addEventListener('click',()=>{t.done=!t.done;persist();renderTasks();renderHome();sound(t.done?'ok':'tap');});const title=document.createElement('span');title.className='task-title';title.textContent=t.text;const del=document.createElement('button');del.className='task-delete';del.textContent='×';del.setAttribute('aria-label','タスク削除');del.addEventListener('click',()=>{S.tasks=S.tasks.filter(x=>x.id!==t.id);persist();renderTasks();renderHome();sound('tap')});item.append(ch,title,del);list.append(item);});if(!S.tasks.length){list.innerHTML='<div class="empty">タスクはまだありません。追加すると端末に保存されます。</div>';}const n=S.tasks.filter(t=>!t.done).length;$('tasksSummary').textContent=n+' OPEN / '+(S.tasks.length-n)+' COMPLETED';}
$('taskForm').addEventListener('submit',e=>{e.preventDefault();const input=$('taskInput'),val=input.value.trim();if(!val){toast('タスク名を入力してください');return;}if(S.tasks.length>=80){toast('登録できるタスクは最大80件です');return;}S.tasks.unshift({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),text:val.slice(0,80),done:false});input.value='';persist();renderTasks();renderHome();sound('ok');});
function timerRender(){const m=Math.floor(Math.max(0,focus.remaining)/60),s=Math.max(0,focus.remaining)%60;$('timerTime').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');$('timerCircle').style.strokeDashoffset=427.256*(1-Math.max(0,focus.remaining)/focus.length);$('timerStart').textContent=focus.running?'Ⅱ 一時停止':focus.remaining===0?'▶ 再開':'▶ '+(focus.remaining===focus.length?'開始':'再開');}
all('[data-min]').forEach(btn=>btn.addEventListener('click',()=>{const min=Number(btn.dataset.min);focus={length:min*60,remaining:min*60,deadline:0,running:false};all('[data-min]').forEach(el=>el.classList.toggle('active',el===btn));timerRender();sound('tap');}));
$('timerStart').addEventListener('click',()=>{if(focus.running){focus.remaining=Math.max(0,Math.ceil((focus.deadline-Date.now())/1000));focus.running=false;}else{if(focus.remaining<=0)focus.remaining=focus.length;focus.deadline=Date.now()+focus.remaining*1000;focus.running=true;}timerRender();sound('tap');});
$('timerReset').addEventListener('click',()=>{focus.remaining=focus.length;focus.running=false;focus.deadline=0;timerRender();sound('tap');});
/* v2.4 METEO COMMAND / data is real or explicitly unavailable */
const meteoRegions=[['TOKYO','東京',35.6762,139.6503],['HAKONE','箱根',35.2329,139.1046],['YOKOHAMA','横浜',35.4437,139.638],['OSAKA','大阪',34.6937,135.5023]];
let meteoRegionValues=null,meteoRegionAt=0,meteoRegionPending=false;
let meteoMapCenter={lat:35.2329,lng:139.1046},meteoMapZoom=7,meteoMapMode='hakone',meteoMapLoaded=false;
let meteoRadarManifest=null,meteoRadarLastFetch=0,meteoRadarFrame=0,meteoRadarPlaying=false,meteoRadarInterval=null;
function meteoText(id,v){const e=$(id);if(e)e.textContent=v;}
function meteoNum(n,unit='',digits=0){return Number.isFinite(Number(n))&&n!==null&&n!==undefined?Number(n).toFixed(digits)+unit:'--';}
function meteoClockUpdate(){meteoText('meteoClock',new Date().toLocaleTimeString('ja-JP',{hour12:false}));}
function meteoDrawRisk(){
 const out=$('meteoRiskRows');out.replaceChildren();const c=weatherCurrent(),h=S.weather?.raw?.hourly;
 if(!c){out.innerHTML='<div class="meteo-empty">実気象データ未取得<br>公的警報の代替ではありません</div>';return;}
 const rain=Number(c.precipitation)||0,wind=(Number(c.wind_speed_10m)||0)/3.6;
 const ts=h?.time||[];const i=Math.max(0,ts.findIndex(t=>t>=(c.time||'').slice(0,13)));const prob=Math.max(0,...(h?.precipitation_probability||[]).slice(i,i+6).map(v=>Number(v)||0));
 const inputs=[['降水量','RAIN',rain,[[0.2,2.5,7.5,15]],'mm'],['降水確率','6H PROB.',prob,[[20,40,60,80]],'%'],['風速','WIND',wind,[[3,6,10,15]],'m/s'],['気温','TEMP',Number(c.temperature_2m)||0,[[28,31,35,38]],'°C']];
 inputs.forEach(([name,en,val,[thresholds],unit])=>{const level=thresholds.filter(t=>val>=t).length;const row=document.createElement('div');row.className='meteo-risk-row';const label=document.createElement('span');label.textContent=name;const small=document.createElement('small');small.textContent=en;label.appendChild(small);const leds=document.createElement('div');leds.className='meteo-level-leds';for(let k=0;k<4;k++){const led=document.createElement('i');if(k<level)led.className=level>=3?'hot':level>=2?'mid':'low';leds.append(led)}const value=document.createElement('strong');value.textContent=unit==='mm'?val.toFixed(1):String(Math.round(val));value.title=unit;row.append(label,leds,value);out.append(row)});
}
function meteoRenderAdvice(){const out=$('meteoAdvisories');out.replaceChildren();const c=weatherCurrent(),h=S.weather?.raw?.hourly;
 const entries=[];
 if(!c){entries.push(['現在地の天気を取得してください','Update local observation to enable the advisory panel.']);}
 else{
 const rain=Number(c.precipitation)||0,wind=Number(c.wind_speed_10m)||0,ts=h?.time||[];const idx=Math.max(0,ts.findIndex(t=>t>=(c.time||'').slice(0,13)));const maxProb=Math.max(0,...(h?.precipitation_probability||[]).slice(idx,idx+6).map(x=>Number(x)||0));
 if(rain>=7.5)entries.push(['現在地で強い雨が観測されています','Observed precipitation is elevated. Check official warnings.']);
 else if(rain>0)entries.push(['降雨を観測。周辺の状況に注意','Local precipitation detected.']);
 else entries.push(['現在の降水量は少ない状態です','Low measured precipitation at this location.']);
 if(maxProb>=60)entries.push(['今後6時間の降水確率が高め','Forecast suggests an increased chance of rain.']);
 if(wind>=36)entries.push(['風が強まっています。移動時に注意','High observed wind speed.']);
 entries.push(['公的な警報・避難情報を必ず確認','Consult JMA and local government for official alerts.']);
 }
 entries.push(['河川水位は未連携。公式情報で確認','River levels are not connected to this terminal.']);
 entries.slice(0,5).forEach(([j,en],i)=>{const r=document.createElement('div');r.className='meteo-advice';const n=document.createElement('span');n.textContent=String(i+1).padStart(2,'0');const d=document.createElement('div'),b=document.createElement('b'),s=document.createElement('small');b.textContent=j;s.textContent=en;d.append(b,s);r.append(n,d);out.append(r)});
}
function meteoRenderRegion(){const el=$('meteoRegionRows');if(!el)return;el.replaceChildren();if(!meteoRegionValues){el.innerHTML='<div class="meteo-empty">地域データ未取得 / ONLINE TO UPDATE</div>';return;}
 meteoRegions.forEach(([eng,jp],i)=>{const c=meteoRegionValues[i],row=document.createElement('div');row.className='meteo-region-row';const city=document.createElement('span'),b=document.createElement('b'),sm=document.createElement('small');b.textContent=jp;sm.textContent=eng;city.append(b,sm);const icon=document.createElement('span'),temp=document.createElement('span'),rain=document.createElement('span');icon.textContent=c?fmtWx(c.weather_code)[1]:'--';temp.textContent=c?meteoNum(c.temperature_2m,'°',0):'--';rain.textContent=c?meteoNum(c.precipitation,' mm',1):'--';row.append(city,icon,temp,rain);el.append(row)});
 meteoText('meteoRegionStatus',new Date(meteoRegionAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}));
}
async function meteoUpdateRegions(force=false){if(meteoRegionPending||(!force&&meteoRegionValues&&Date.now()-meteoRegionAt<600000))return;meteoRegionPending=true;meteoText('meteoRegionStatus','CONNECTING');
 try{const resp=await Promise.allSettled(meteoRegions.map(async r=>{const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),11000);try{const url='https://api.open-meteo.com/v1/forecast?latitude='+r[2]+'&longitude='+r[3]+'&current=temperature_2m,precipitation,weather_code&timezone=Asia%2FTokyo';const res=await fetch(url,{signal:ctrl.signal});if(!res.ok)throw Error('HTTP '+res.status);const v=await res.json();return v.current||null;}finally{clearTimeout(timer)}}));
 const values=resp.map(x=>x.status==='fulfilled'?x.value:null);if(!values.some(Boolean))throw Error('region offline');meteoRegionValues=values;meteoRegionAt=Date.now();meteoRenderRegion();}catch(e){meteoText('meteoRegionStatus','OFFLINE');}finally{meteoRegionPending=false;}
}
function meteoRenderCurrent(){const c=weatherCurrent();meteoText('meteoNet',c?'WEATHER ONLINE':'AWAITING DATA');meteoText('meteoRainNow',c?meteoNum(c.precipitation,' mm',1):'--');meteoDrawRisk();meteoRenderAdvice();meteoRenderRegion();}
// Coordinates / raster tiles. Tiles are drawn only from real map data and optional radar observations.
function meteoMercator(lat,lon,z){const scale=256*Math.pow(2,z);const safe=Math.max(-85.0511,Math.min(85.0511,lat));return {x:(lon+180)/360*scale,y:(1-Math.log(Math.tan(safe*Math.PI/180)+1/Math.cos(safe*Math.PI/180))/Math.PI)/2*scale};}
function meteoTileGrid(dst,kind){dst.replaceChildren();const r=$('meteoRadarStage').getBoundingClientRect();const W=Math.max(260,r.width),H=Math.max(230,r.height);const z=meteoMapZoom,scale=Math.pow(2,z),center=meteoMercator(meteoMapCenter.lat,meteoMapCenter.lng,z);let count=0;
 for(let y=Math.floor((center.y-H/2)/256);y<=Math.ceil((center.y+H/2)/256);y++)for(let x=Math.floor((center.x-W/2)/256);x<=Math.ceil((center.x+W/2)/256);x++){
 if(y<0||y>=scale)continue;const realX=(x%scale+scale)%scale;const image=new Image();image.decoding='async';image.loading='eager';image.style.left=Math.round(x*256-center.x+W/2)+'px';image.style.top=Math.round(y*256-center.y+H/2)+'px';
 if(kind==='base'){image.alt='';image.src='https://tile.openstreetmap.org/'+z+'/'+realX+'/'+y+'.png';image.onload=()=>{if(!meteoMapLoaded){meteoMapLoaded=true;meteoText('meteoMapWarning','');$('meteoMapWarning').classList.add('hidden')}};}
 else{const f=meteoRadarManifest?.radar?.past?.[meteoRadarFrame];if(!f)continue;image.alt='';const host=meteoRadarManifest.host;if(!/^https:\/\//.test(host))continue;image.src=host+f.path+'/256/'+z+'/'+realX+'/'+y+'/2/1_1.png';}
 dst.append(image);count++;
 if(count>30)break;
 }
}
function meteoPaintMap(base=true){if(currentPage!=='weather')return;meteoMapLoaded=meteoMapLoaded&& !base;if(base)meteoTileGrid($('meteoBaseTiles'),'base');meteoTileGrid($('meteoRainTiles'),'rain');const f=meteoRadarManifest?.radar?.past?.[meteoRadarFrame];meteoText('meteoRadarTime',f?new Date(f.time*1000).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}):'--:--');}
function meteoRadarTimeline(){const el=$('meteoRadarFrames');el.replaceChildren();const arr=meteoRadarManifest?.radar?.past||[];if(!arr.length){el.textContent='観測データ待機';return;}arr.slice(-8).forEach((f,k)=>{const actual=arr.length-Math.min(8,arr.length)+k,btn=document.createElement('button');btn.type='button';btn.textContent=new Date(f.time*1000).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}).slice(-5);btn.className=actual===meteoRadarFrame?'active':'';btn.addEventListener('click',()=>{meteoRadarFrame=actual;meteoPaintMap(false);meteoRadarTimeline();});el.append(btn)})}
async function meteoLoadRadar(force=false){if(!force&&meteoRadarManifest&&Date.now()-meteoRadarLastFetch<600000){meteoPaintMap(false);return;}
 meteoText('meteoRadarStatus','RAINVIEWER / CONNECTING');try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),11000);let res;try{res=await fetch('https://api.rainviewer.com/public/weather-maps.json',{signal:controller.signal,cache:'no-store'});}finally{clearTimeout(timeout)}if(!res.ok)throw Error('HTTP '+res.status);const json=await res.json();if(!Array.isArray(json?.radar?.past)||!json.radar.past.length||!/^https:\/\//.test(json.host||''))throw Error('Radar dataset unavailable');meteoRadarManifest=json;meteoRadarLastFetch=Date.now();meteoRadarFrame=json.radar.past.length-1;meteoText('meteoRadarUpdated','OBSERVED / 10min HISTORY');meteoText('meteoRadarStatus','RAINVIEWER / 観測済み降雨エコー');meteoPaintMap(false);meteoRadarTimeline();}catch(e){meteoRadarManifest=null;meteoRadarFrame=0;meteoText('meteoRadarStatus','レーダーに接続できません / 地図のみ');meteoText('meteoRadarUpdated','RADAR OFFLINE');meteoRadarTimeline();}}
function meteoRadarPlayToggle(){meteoRadarPlaying=!meteoRadarPlaying;meteoText('meteoRadarPlay',meteoRadarPlaying?'Ⅱ 停止':'▶ 再生');if(meteoRadarInterval)clearInterval(meteoRadarInterval);meteoRadarInterval=null;if(meteoRadarPlaying){meteoRadarInterval=setInterval(()=>{if(currentPage!=='weather'||document.hidden||!S.prefs.motion)return;const n=meteoRadarManifest?.radar?.past?.length||0;if(n){meteoRadarFrame=(meteoRadarFrame+1)%n;meteoPaintMap(false);meteoRadarTimeline();}},1600);}}
function meteoEnter(){meteoClockUpdate();meteoPaintMap(true);meteoLoadRadar();meteoUpdateRegions();}
function meteoSetRegion(key){meteoMapMode=key;if(key==='hakone'){meteoMapCenter={lat:35.2329,lng:139.1046};meteoMapZoom=7;meteoText('meteoMapMark','△ TOKYO-3 / HAKONE');}
 else if(key==='kanto'){meteoMapCenter={lat:35.67,lng:139.65};meteoMapZoom=7;meteoText('meteoMapMark','△ TOKYO / KANTO');}
 else if(key==='me'){const lat=S.weather?.raw?.latitude,lng=S.weather?.raw?.longitude;if(!Number.isFinite(lat)||!Number.isFinite(lng)){toast('現在地は天気を更新してから選択できます');return;}meteoMapCenter={lat,lng};meteoMapZoom=7;meteoText('meteoMapMark','⊕ 現在地 / LOCAL');}
 all('[data-radar-region]').forEach(btn=>btn.classList.toggle('active',btn.dataset.radarRegion===key));meteoPaintMap(true);sound('scan');}
all('[data-radar-region]').forEach(btn=>btn.addEventListener('click',()=>meteoSetRegion(btn.dataset.radarRegion)));
$('meteoZoomIn').addEventListener('click',()=>{meteoMapZoom=Math.min(7,meteoMapZoom+1);meteoPaintMap(true);});
$('meteoZoomOut').addEventListener('click',()=>{meteoMapZoom=Math.max(4,meteoMapZoom-1);meteoPaintMap(true);});
$('meteoRadarPrev').addEventListener('click',()=>{const n=meteoRadarManifest?.radar?.past?.length||0;if(!n)return;meteoRadarFrame=(meteoRadarFrame+n-1)%n;meteoPaintMap(false);meteoRadarTimeline();});
$('meteoRadarNext').addEventListener('click',()=>{const n=meteoRadarManifest?.radar?.past?.length||0;if(!n)return;meteoRadarFrame=(meteoRadarFrame+1)%n;meteoPaintMap(false);meteoRadarTimeline();});
$('meteoRadarPlay').addEventListener('click',meteoRadarPlayToggle);
all('[data-meteo-jump]').forEach(el=>el.addEventListener('click',()=>{$(el.dataset.meteoJump).scrollIntoView({behavior:S.prefs.motion?'smooth':'instant',block:'start'});sound('tap');}));
window.addEventListener('resize',()=>{if(currentPage==='weather')meteoPaintMap(true)});

function tick(){meteoClockUpdate();const d=new Date();$('topClock').textContent=d.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});$('homeHour').textContent=d.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});$('homeDate').textContent=d.toLocaleDateString('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'});$('heroTime').textContent=d.toLocaleTimeString('ja-JP',{hour12:false});
 if(focus.running){focus.remaining=Math.max(0,Math.ceil((focus.deadline-Date.now())/1000));if(focus.remaining===0){focus.running=false;sound('done');toast('集中タイマー終了。お疲れさま！');}timerRender();}
 const changed=settleEvaPower();if((S.evas.some(e=>e.state==='DEPLOYED')||changed)&&currentPage==='eva')renderEVA();if(changed)renderTacticalAlert();
}
$('soundSwitch').addEventListener('click',()=>{S.prefs.sound=!S.prefs.sound;persist();renderSettings();if(S.prefs.sound)sound('ok');});
$('autoWeatherSwitch').addEventListener('click',()=>{S.prefs.autoWeather=!S.prefs.autoWeather;persist();renderSettings();sound('tap');});
$('motionSwitch').addEventListener('click',()=>{S.prefs.motion=!S.prefs.motion;persist();renderSettings();sound('tap');});
$('bootSwitch').addEventListener('click',()=>{S.prefs.showBoot=!S.prefs.showBoot;persist();renderSettings();sound('tap');});
$('clearTasks').addEventListener('click',()=>{const num=S.tasks.length;S.tasks=S.tasks.filter(t=>!t.done);const removed=num-S.tasks.length;persist();renderTasks();renderHome();toast(removed+'件の完了タスクを削除');sound('tap');});
$('resetSim').addEventListener('click',()=>{if(!confirm('都市・EVA・MAGI・作戦の状態を初期化しますか？タスク・天気・設定は保持します。'))return;const d=defaults();S.infra=d.infra;S.evas=d.evas;S.magi=d.magi;S.mission=d.mission;S.logs=d.logs;S.selectedEva=0;S.ops=newOpsDefaults();persist();draw();toast('架空の管制状態を初期化しました');sound('ok');});
function renderSettings(){document.body.classList.toggle('no-motion',!S.prefs.motion);$('soundFlag').textContent=S.prefs.sound?'ON':'OFF';$('motionFlag').textContent=S.prefs.motion?'ON':'OFF';$('bootFlag').textContent=S.prefs.showBoot?'ON':'OFF';$('autoWeatherFlag').textContent=S.prefs.autoWeather?'ON':'OFF';}
function draw(){settleEvaPower();renderHome();renderWeather();renderInfra();renderEVA();renderMAGI();renderMission();renderTacticalAlert();renderTasks();renderSettings();timerRender();persist();}
document.addEventListener('visibilitychange',()=>{if(document.hidden){settleEvaPower();persist();}else{settleEvaPower();draw();}});window.addEventListener('pagehide',()=>{settleEvaPower();persist();});
setInterval(tick,1000);tick();draw();callNative('battery').then(r=>{if(Number.isFinite(r?.level)){battery=Math.max(0,Math.min(100,r.level));charging=!!r.charging;renderBattery();}}).catch(()=>{});

// A genuine pitched vector map: OpenFreeMap tiles + MapLibre. No fabricated basemap.
const HAKONE={lng:139.1046,lat:35.2329};
let mapObj=null,mapPromise=null,map2d=false,mapWhere='hakone',mapReady=false;
function mapNote(msg){const el=$('mapStatus');if(el)el.textContent=msg;}
function requireMapLibre(){if(window.maplibregl)return Promise.resolve();if(mapPromise)return mapPromise;
 mapPromise=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src='https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.js';script.async=true;
   script.onload=()=>window.maplibregl?resolve():reject(Error('地図ライブラリが利用できません'));
   script.onerror=()=>reject(Error('地図ライブラリの通信に失敗'));document.head.appendChild(script);
 });return mapPromise;
}
function mapPosition(p,zoom=15.0){if(!mapObj)return;mapObj.flyTo({center:[p.lng,p.lat],zoom,essential:true,duration:1100,bearing:map2d?0:-23,pitch:map2d?0:55});$('mapCoords').textContent=p.lat.toFixed(3)+'N '+p.lng.toFixed(3)+'E';}
async function ensureMap(){if(mapObj){setTimeout(()=>mapObj.resize(),90);return;}if(mapReady)return;mapReady=true;mapNote('地図ライブラリを接続しています…');
 try{await requireMapLibre();
   mapObj=new maplibregl.Map({container:'realMap',style:'https://tiles.openfreemap.org/styles/liberty',center:[HAKONE.lng,HAKONE.lat],zoom:15,pitch:55,bearing:-23,canvasContextAttributes:{antialias:true},attributionControl:false,dragRotate:true,pitchWithRotate:true});
   mapObj.on('load',()=>{
     const style=mapObj.getStyle();const source=style.sources.openmaptiles?'openmaptiles':Object.keys(style.sources).find(k=>style.sources[k].type==='vector');
     if(source){const labels=style.layers.find(x=>x.type==='symbol'&&x.layout&&x.layout['text-field']);
       try{mapObj.addLayer({id:'nerv3d-building',type:'fill-extrusion',source:source,'source-layer':'building',minzoom:14,
         paint:{'fill-extrusion-color':'#c4a684','fill-extrusion-height':['interpolate',['linear'],['zoom'],14,0,15,['case',['has','render_height'],['to-number',['get','render_height']],['has','height'],['to-number',['get','height']],12]],'fill-extrusion-base':0,'fill-extrusion-opacity':0.79}
       },labels?labels.id:undefined);}catch(err){console.warn('3D extrusions:',err.message)}
     }
     mapNote('実地図 / ドラッグ・ピンチ・回転可');$('mapCoords').textContent='HAKONE / 35.233N 139.105E';
   });
   mapObj.on('error',e=>{console.warn('map error',e.error||e);mapNote('地図の取得に失敗。ネット接続をご確認ください');});
 }catch(e){mapReady=false;mapNote('地図を読み込めません: '+e.message);}
}
$('mapHakone').addEventListener('click',()=>{mapWhere='hakone';if(!mapObj){ensureMap();return;}mapPosition(HAKONE);$('mapExternal').href='https://www.openstreetmap.org/#map=15/35.2329/139.1046';mapNote('箱根 / 現実の地図');sound('tap');});
$('mapLocate').addEventListener('click',async()=>{mapNote('現在地の許可を確認しています…');sound('scan');try{
   const loc=await callNative('mapLocation');if(!Number.isFinite(loc?.lat)||!Number.isFinite(loc?.lng))throw Error(loc?.error||'位置情報を取得できません');
   mapWhere='current';await ensureMap();mapPosition({lat:loc.lat,lng:loc.lng});mapNote('現在地を表示 / 座標は保存しません');$('mapExternal').href='https://www.openstreetmap.org/#map=15/'+loc.lat+'/'+loc.lng;
 }catch(e){mapNote('現在地を取得できません: '+e.message)} });
$('mapPitch').addEventListener('click',()=>{map2d=!map2d;$('mapPitch').textContent=map2d?'2D':'2.5D';$('mapTilt').textContent='PITCH '+(map2d?0:55)+'°';if(mapObj)mapObj.easeTo({pitch:map2d?0:55,bearing:map2d?0:-23,duration:700});sound('tap');});
$('mapNorth').addEventListener('click',()=>{if(mapObj)mapObj.easeTo({bearing:0,duration:550});sound('tap');});
$('mapPlus').addEventListener('click',()=>{if(mapObj)mapObj.zoomIn();sound('tap');});
$('mapMinus').addEventListener('click',()=>{if(mapObj)mapObj.zoomOut();sound('tap');});

// v2.3 TACTICAL ANIMATION ENGINE. SIM state is committed only after a sequence finishes.
let sequenceBusy=false, sequenceTimer=null, finishSequence=null, unitSwitchTimer=null;
function playSequence(kind,title,unit,steps,done,detail){
 if(sequenceBusy)return false;
 const reduced=!S.prefs.motion||(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 if(reduced){done();return true;}
 sequenceBusy=true;document.body.classList.add('sequence-active');
 const screen=$('sequenceOverlay'),heading=$('seqTitle'),sub=$('seqUnit'),stage=$('seqStep'),bar=$('seqProgress'),counter=$('seqCounter'),meta=$('seqState');
 screen.classList.remove('hidden');screen.setAttribute('aria-hidden','false');
 screen.dataset.kind=kind;heading.textContent=title;sub.textContent=unit;
 const diag=kind==='magi'?$('magiLiveTrack'):null;
 if(diag){diag.classList.add('in-progress');$('magiBoard').classList.add('is-voting');$('magiProgress').style.width='0%';}
 let at=0,completed=false;
 function finalize(){
  if(completed)return;completed=true;clearTimeout(sequenceTimer);sequenceTimer=null;finishSequence=null;
  screen.classList.add('hidden');screen.setAttribute('aria-hidden','true');document.body.classList.remove('sequence-active');
  if(diag)$('magiBoard').classList.remove('is-voting');sequenceBusy=false;
  done();
 }
 finishSequence=finalize;
 function step(){
  if(at>=steps.length){finalize();return;}
  stage.textContent=steps[at];bar.style.width=((at+1)/steps.length*100)+'%';
  counter.textContent=String(at+1).padStart(2,'0')+' / '+String(steps.length).padStart(2,'0');
  meta.textContent=at===steps.length-1?'CONFIRMING':'PROCESSING';
  if(kind==='magi'&&detail){
   const vote=detail[at];
   if(vote){const node=$('magiTrack'+at);node.className=vote.yes?'accepted':'denied';node.querySelector('small').textContent=vote.yes?'APPROVE':'DENY';$('magiProgress').style.width=((at+1)/detail.length*100)+'%';}
  }
  at++;
  sequenceTimer=setTimeout(step,kind==='magi'?690:620);
 }
 sound(kind==='magi'?'scan':kind==='launch'?'launch':'select');step();return true;
}
$('seqSkip').addEventListener('click',()=>{if(finishSequence)finishSequence()});
function updateMagiTracks(votes){
 if(!$('magiTrack0'))return;
 for(let i=0;i<3;i++){
  const node=$('magiTrack'+i);node.className=votes?(votes[i].yes?'accepted':'denied'):'';
  node.querySelector('small').textContent=votes?(votes[i].yes?'APPROVE':'DENY'):'WAITING';
 }
 $('magiProgress').style.width=votes?'100%':'0%';
 $('magiTrackSummary').textContent=votes?'DECISION REGISTERED':'THREE-CORE JUDGMENT';
}
function flashUnitSwitch(){
 const art=$('evaArtwork');art.classList.remove('unit-swap');void art.offsetWidth;
 if(S.prefs.motion&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){art.classList.add('unit-swap');clearTimeout(unitSwitchTimer);unitSwitchTimer=setTimeout(()=>art.classList.remove('unit-swap'),540)}
}
function renderTacticalAlert(){
 const critical=!S.infra.power||!S.infra.comms||S.evas.some(e=>e.state==='POWER_LOST');
 const watch=!critical&&S.mission.phase>0&&S.mission.phase<6;
 const level=critical?'critical':watch?'watch':'nominal';
 document.body.dataset.alert=level;
 const ribbon=$('globalAlert'),flag=$('globalAlertFlag'),desc=$('globalAlertText');
 ribbon.classList.toggle('hidden',!critical&&!watch);ribbon.dataset.level=level;
 if(critical){flag.textContent='EMERGENCY';desc.textContent=!S.infra.power?'都市電力供給停止 / 補助系統を確認':!S.infra.comms?'作戦通信系統断 / COMMS OFFLINE':'EVA内部電源喪失 / 回収要請';}
 else if(watch){flag.textContent='TACTICAL';desc.textContent='模擬作戦進行中 / PHASE '+String(S.mission.phase).padStart(2,'0');}
 $('telemetryAlarm').textContent=level==='critical'?'CRITICAL':level==='watch'?'TACTICAL':'NOMINAL';
 $('telemetryAlarm').style.color=critical?'#ff7976':watch?'#ffc171':'#9bf7bd';
 $('heroTacticalState').textContent=critical?'EMERGENCY / SIM':watch?'OPERATION ACTIVE':'READY / STANDBY';
 $('homeSignalCity').textContent=S.infra.power&&S.infra.comms?'ONLINE':'CHECK';
 $('homeSignalEva').textContent=S.evas.filter(e=>e.state==='DEPLOYED').length+' ACTIVE';
 $('homeSignalMission').textContent='PHASE '+String(S.mission.phase).padStart(2,'0');
}

if(!S.prefs.showBoot){openApp(false)}
window.NERV_TEST={meteoRisk:()=>$('meteoRiskRows').textContent,meteoRadar:()=>meteoRadarManifest?.radar?.past?.length||0,getState:()=>JSON.parse(JSON.stringify(S)),open:go,weather:applyWeather,clock:tick,mission:()=>S.mission.phase,sequenceBusy:()=>sequenceBusy,alertLevel:()=>document.body.dataset.alert};
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

// v2.7: tactical handoff + cross-system action links + corrected shield tracking.
const v26DefaultTactics=()=>({attacker:1,defender:0,posture:'balanced',charge:0,heat:0,scans:0,shots:0,history:[]});
S.tactics={...v26DefaultTactics(),...(S.tactics&&typeof S.tactics==='object'?S.tactics:{})};
if(!['balanced','defense','assault'].includes(S.tactics.posture))S.tactics.posture='balanced';
for(const role of ['attacker','defender']){if(![0,1,2].includes(Number(S.tactics[role])))S.tactics[role]=role==='attacker'?1:0;else S.tactics[role]=Number(S.tactics[role]);}
if(S.tactics.attacker===S.tactics.defender)S.tactics.defender=(S.tactics.attacker+1)%3;
S.tactics.charge=Math.min(100,Math.max(0,Number(S.tactics.charge)||0));S.tactics.heat=Math.min(100,Math.max(0,Number(S.tactics.heat)||0));S.tactics.scans=Math.min(3,Math.max(0,Number(S.tactics.scans)||0));S.tactics.shots=Math.max(0,Number(S.tactics.shots)||0);
if(S.mission.phase>=5&&!S.tactics.charge&&!S.tactics.shots)S.tactics.charge=80; // migration of an already advanced v2.5 mission
const v26UnitName=i=>['零号機','初号機','弐号機'][Number(i)]||'不明';
const v26Meter=n=>Math.max(0,Math.min(100,Math.round(Number(n)||0)));
const v26Clamp=(n,l,h)=>Math.min(h,Math.max(l,n));
const v26Loc=(s)=>$(s)||null;
const v26After=(selector,content,position='afterend')=>{const x=qs(selector);if(!x)throw Error('Missing v2.7 anchor: '+selector);x.insertAdjacentHTML(position,content);};
const v26Route=(active)=>`<div class="v26-route" aria-label="管制横断ナビゲーション">
<button data-v26go="mission" class="${active==='mission'?'active-route':''}">⌖ 作戦指揮<small>TACTICAL COMMAND ↗</small></button>
<button data-v26go="eva" class="${active==='eva'?'active-route':''}">◈ EVA運用<small>UNIT OPERATIONS ↗</small></button>
<button data-v26go="magi" class="${active==='magi'?'active-route':''}">△ MAGI審議<small>THREE CORE SYSTEM ↗</small></button></div>`;
function v26Build(){
 // The field is tied to the very same artwork rig, not to the containing page or scan animation.
 v26After('#evaSvg .eva-reference-rig',`<div class="v26-at-field" aria-hidden="true"><svg viewBox="0 0 200 200"><g class="at-axis"><path d="M100 0V200M0 100H200"/></g><polygon class="at-shell outer" points="42,1 158,1 199,42 199,158 158,199 42,199 1,158 1,42"/><polygon class="at-shell" points="48,18 152,18 182,48 182,152 152,182 48,182 18,152 18,48"/><polygon class="at-shell inner" points="58,38 142,38 162,58 162,142 142,162 58,162 38,142 38,58"/><circle cx="100" cy="100" r="22" stroke="#ffe7af" stroke-width="1.3" stroke-dasharray="2 4" fill="none"/></svg><strong>A.T.FIELD / DEPLOYED</strong></div>`, 'beforeend');
 ['home','eva','magi','mission','infra'].forEach(p=>v26After(`.page[data-page="${p}"] .page-top`,v26Route(p)));
 v26After('.page[data-page="home"] .nx-station',`<section class="v26-box" aria-label="作戦概況 / 連携管制">
 <div class="v26-heading"><b>戦術指揮ダイジェスト<small>INTERLOCKED DEFENSE / SIMULATOR</small></b><span id="v26HomePhase">PHASE 00</span></div>
 <div class="v26-readouts"><div><small>作戦即応度</small><b id="v26HomeReady">--</b></div><div><small>陽電子砲蓄電</small><b id="v26HomeCharge">--</b></div><div><small>迎撃要員</small><b id="v26HomeUnits">--</b></div></div>
 <div class="v26-matrix" id="v26HomeNext"></div><div class="v26-row"><button data-v26go="mission">作戦計画を開く ↗</button><button data-v26go="magi">MAGI審議へ ↗</button></div></section>`);
 v26After('.page[data-page="mission"] .threat-card',`<section class="v26-box" id="v26WarRoom"><div class="v26-heading"><b>作戦戦略盤<small>YASHIMA OPERATION / TACTICAL DECISIONS</small></b><span>SIMULATION DATA</span></div>
 <div class="v26-readouts"><div><small>作戦即応度</small><b id="v26Readiness">--</b></div><div><small>迎撃火器蓄電</small><b id="v26Charge">--</b></div><div><small>砲身熱負荷</small><b id="v26Heat">--</b></div></div>
 <div class="v26-radarline"><i></i><span>FUTAGYAMA / TARGET BEARING / SIM</span></div>
 <div class="v26-role-select"><label>攻撃主担当 / ATTACKER<select id="v26Attacker" aria-label="攻撃主担当"></select></label><label>防御支援 / SHIELD<select id="v26Defender" aria-label="防御支援担当"></select></label></div>
 <div class="v26-stage-mark">戦術方針 / DOCTRINE</div>
 <div class="v26-controls" id="v26Postures"><button data-posture="defense">防御優先</button><button data-posture="balanced">均衡運用</button><button data-posture="assault">速攻狙撃</button></div>
 <div class="v26-doctrine" id="v26Doctrine">OPERATIONAL GUIDANCE</div>
 <div class="v26-stage-mark">電力集約 / POWER ROUTING</div><div class="v26-meter" role="meter" aria-label="陽電子砲蓄電率" aria-valuemin="0" aria-valuemax="100" id="v26ChargeMeter"><i id="v26ChargeFill"></i></div>
 <div class="v26-row"><button id="v26ChargeAction">⚡ 集電・充填 / CHARGE</button><button id="v26CoolAction">◌ 放熱・冷却 / COOL</button></div>
 <div class="v26-row"><button id="v26ReconAction">⌖ 対象分析 / SCAN</button><button data-v26go="eva">◈ EVA配置 / MANAGE</button></div>
 <div class="v26-grid-data"><div><small>索敵解析</small><b id="v26Recon">--</b></div><div><small>防御展開</small><b id="v26Defense">--</b></div><div><small>照準補正</small><b id="v26Locks">--</b></div></div>
 <div class="v26-tactical-status" id="v26WarStatus">戦術条件を解析中</div><p class="v26-source">設定資料: ヤシマ作戦の攻撃=初号機、防御=零号機、電力集約。数値・熱負荷・即応度は本アプリ独自の模擬ゲーム値。</p></section>`);
 v26After('.page[data-page="eva"] .eva-display',`<section class="v26-box"><div class="v26-heading"><b>出撃連携・支援配置<small>DEPLOYMENT / ROLE HANDOFF</small></b><span>SIM / LIVE STATE</span></div>
 <div class="v26-readouts"><div><small>現在機の役割</small><b id="v26UnitRole">RESERVE</b></div><div><small>作戦段階</small><b id="v26EvaPhase">00</b></div><div><small>A.T. 防護</small><b id="v26EvaShield">OFFLINE</b></div></div>
 <div class="v26-row"><button data-v26assign="attacker">この機体を攻撃担当に</button><button data-v26assign="defender">この機体を防御担当に</button></div>
 <div class="v26-matrix" id="v26EvaMatrix"></div><div class="v26-row"><button data-v26go="mission">⌖ 作戦へ / RETURN</button><button data-v26go="magi">△ MAGI審議へ</button></div></section>`);
 v26After('.page[data-page="magi"] .magi-live-track',`<section class="v26-box"><div class="v26-heading"><b>作戦承認・整合分析<small>DECISION SUPPORT / TRI-CORE REVIEW</small></b><span>SIMULATED VOTES</span></div>
 <div class="v26-readouts"><div><small>出撃審議対象</small><b id="v26MagiUnit">--</b></div><div><small>攻撃担当</small><b id="v26MagiAttack">--</b></div><div><small>作戦計画</small><b id="v26MagiPosture">--</b></div></div>
 <div class="v26-matrix" id="v26MagiMatrix"></div>
 <div class="v26-row"><button id="v26ChooseAttack">攻撃担当を審議対象に</button><button data-v26go="eva">EVA運用へ戻る ↗</button></div>
 <div class="v26-doctrine">三基合議は作品を参考に再構成。MELCHIOR＝科学者、BALTHASAR＝母、CASPER＝女。各基のゲーム内審議条件は独自ロジック。</div></section>`);
 v26After('.page[data-page="infra"] .nx-infra',`<section class="v26-box"><div class="v26-heading"><b>兵站 / 作戦送電網<small>LOGISTICS / GEOFRONT DEFENSE</small></b><span>SIMULATED</span></div><div class="v26-readouts"><div><small>送電状態</small><b id="v26InfraPower">--</b></div><div><small>作戦蓄電</small><b id="v26InfraCharge">--</b></div><div><small>系統安定</small><b id="v26InfraQuality">--</b></div></div><div class="v26-row"><button data-v26go="mission">⌖ 作戦へ</button><button data-v26go="magi">△ MAGI管制へ</button></div></section>`);
}
function v26SetRows(id,items){const el=$(id);el.replaceChildren();for(const [name,val,ok] of items){const d=document.createElement('div'),a=document.createElement('span'),b=document.createElement('b');a.textContent=name;b.textContent=val;b.classList.toggle('fail',!ok);d.append(a,b);el.append(d)}}
function v26Snapshot(){const t=S.tactics,p=S.mission.phase,attack=S.evas[t.attacker],defense=S.evas[t.defender];
 const readyAttack=attack?.state==='DEPLOYED';const activeShield=defense?.state==='DEPLOYED'&&!!defense.at;
 const aligned=S.infra.power&&S.infra.comms;
 const quality=v26Meter(S.ops.gridQuality||0);
 let score=10+(S.infra.power?13:0)+(S.infra.comms?9:0)+(S.infra.armor?8:0)+(readyAttack?18:0)+(activeShield?9:0)+Math.min(15,Math.round(t.charge*.15))+(S.ops.currentMissionLocks>0?12:0)+Math.min(6,t.scans*2)+(quality>=75?4:0)-Math.floor(t.heat/12);
 score=v26Clamp(score,0,100);
 return {t,p,attack,defense,readyAttack,activeShield,aligned,score,quality};}
function v26Render(){if(!$('v26WarRoom'))return;const o=v26Snapshot(),t=o.t,p=o.p;
 const put=(id,v)=>{const e=$(id);if(e)e.textContent=String(v)};
 put('v26Readiness',o.score+' /100');put('v26Charge',t.charge+'%');put('v26Heat',t.heat+'%');put('v26Recon',Math.min(3,t.scans)+' /3');put('v26Defense',o.activeShield?'FIELD ON':'STANDBY');put('v26Locks',S.ops.currentMissionLocks+' LOCK');
 put('v26HomePhase','PHASE '+String(p).padStart(2,'0'));put('v26HomeReady',o.score+'/100');put('v26HomeCharge',t.charge+'%');put('v26HomeUnits',S.evas.filter(x=>x.state==='DEPLOYED').length+'/3');
 put('v26EvaPhase',String(p).padStart(2,'0'));put('v26EvaShield',selected().at&&selected().state==='DEPLOYED'?'ACTIVE':'STANDBY');
 put('v26UnitRole',t.attacker===S.selectedEva?'ATTACK':t.defender===S.selectedEva?'DEFENSE':'RESERVE');
 put('v26MagiUnit','UNIT-0'+S.selectedEva);put('v26MagiAttack','UNIT-0'+t.attacker);put('v26MagiPosture',{balanced:'BALANCED',defense:'DEFENSIVE',assault:'ASSAULT'}[t.posture]);
 put('v26InfraPower',S.infra.power?'ONLINE':'OFFLINE');put('v26InfraCharge',t.charge+'%');put('v26InfraQuality',o.quality+'%');
 $('v26ChargeFill').style.width=t.charge+'%';$('v26ChargeMeter').setAttribute('aria-valuenow',String(t.charge));
 $('v26Attacker').value=String(t.attacker);$('v26Defender').value=String(t.defender);
 all('[data-posture]').forEach(b=>b.classList.toggle('chosen',b.dataset.posture===t.posture));
 const roleRows=[['攻撃',v26UnitName(t.attacker)+' / '+o.attack.state,o.readyAttack],['防御',v26UnitName(t.defender)+' / '+(o.activeShield?'A.T.展開中':'A.T.待機'),o.activeShield],['審議承認',S.magi.approvedFor===t.attacker?'UNIT-0'+t.attacker+' 承認済み':'攻撃担当の出撃未承認',S.magi.approvedFor===t.attacker],['電源・通信',o.aligned?'ALL GREEN':'配電系統を点検',o.aligned]];
 v26SetRows('v26HomeNext',roleRows.slice(0,3));v26SetRows('v26EvaMatrix',roleRows);v26SetRows('v26MagiMatrix',[['BALTHASAR / 母',S.infra.power&&selected().state==='READY'?'条件適合':'再評価が必要',S.infra.power&&selected().state==='READY'],['CASPER / 女',S.infra.armor&&S.infra.comms?'防護網確保':'防護・通信を要確認',S.infra.armor&&S.infra.comms],['MELCHIOR / 科学者',S.infra.power&&selected().power>=240?'技術条件適合':'電力条件要確認',S.infra.power&&selected().power>=240],['承認の有効範囲','選択中のUNIT-0'+S.selectedEva+' のみ',true]]);
 $('v26Doctrine').textContent={defense:'防御を優先。充電は低発熱、敵に対する防護は強化されるが、狙撃の準備が遅くなる。',balanced:'攻守を均衡。充電速度と熱負荷のバランスを取り、機体配備とA.T.展開を合わせる。',assault:'速攻狙撃。蓄電速度は上がるが熱負荷が増える。放熱管理が必要。'}[t.posture];
 const problems=[];if(!o.aligned)problems.push('都市の電力・通信を復旧');if(!o.readyAttack)problems.push('攻撃担当機を出撃させる');if(t.charge<70)problems.push('陽電子砲に70%以上蓄電');if(t.heat>=80)problems.push('砲身を冷却');if(!S.ops.currentMissionLocks&&p>=4)problems.push('照準をロック');
 $('v26WarStatus').textContent=problems.length?'未達条件：'+problems.join(' / '):'FIRE CONTROL READY / 全必須条件を達成。防御機のA.T.展開で即応評価が向上。';
 $('v26ChargeAction').disabled=!S.infra.power||p<2||p===6||t.charge>=100||t.heat>=95;
 $('v26CoolAction').disabled=t.heat===0;
 $('v26ReconAction').disabled=p===0||p>=6||t.scans>=3;
}
function v26ChargeAction(){const t=S.tactics;if(!S.infra.power||S.mission.phase<2||S.mission.phase>=6)return toast('作戦PHASE 02以降で送電系統を確保してください');
 if(t.heat>=95)return toast('熱負荷上限です。先に冷却してください');
 const base={defense:15,balanced:22,assault:29}[t.posture];const heat={defense:9,balanced:15,assault:24}[t.posture];
 const delta=base+Math.round((S.ops.gridQuality||0)/25);
 t.charge=v26Clamp(t.charge+delta,0,100);t.heat=v26Clamp(t.heat+heat,0,100);
 addLog('mission','POSITRON CHARGE '+t.charge+'% / HEAT '+t.heat+'%');sound(t.heat>=80?'warning':'scan');draw();}
function v26Cool(){const t=S.tactics;t.heat=Math.max(0,t.heat-(t.posture==='defense'?28:22));addLog('mission','COOLING / BARREL THERMAL LOAD '+t.heat+'%');sound('scan');draw()}
function v26Scan(){if(S.mission.phase===0||S.mission.phase>=6)return toast('作戦が進行している場合のみ索敵可能');
 if(S.tactics.scans>=3)return toast('敵性反応の解析は完了しています');S.tactics.scans++;addXP(3,'TARGET SCAN '+S.tactics.scans+'/3');addLog('mission','HOSTILE ANALYSIS / '+S.tactics.scans+' of 3');sound('scan');draw();}
function v26Assign(role,unit){const t=S.tactics;unit=Number(unit);if(!Number.isInteger(unit)||unit<0||unit>2)return;
 if((role==='attacker'&&unit===t.defender)||(role==='defender'&&unit===t.attacker)){toast('攻撃担当と防御担当は別の機体にしてください');sound('deny');v26Render();return}
 t[role]=unit;addLog('mission',(role==='attacker'?'ATTACK':'SHIELD')+' UNIT-0'+unit+' ASSIGNED');sound('ok');persist();draw()}
function v26Init(){v26Build();const ops=[0,1,2].map(i=>`<option value="${i}">UNIT-0${i} / ${v26UnitName(i)}</option>`).join('');$('v26Attacker').innerHTML=ops;$('v26Defender').innerHTML=ops;
 all('[data-v26go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.v26go)));
 all('[data-v26assign]').forEach(b=>b.addEventListener('click',()=>v26Assign(b.dataset.v26assign,S.selectedEva)));
 $('v26Attacker').addEventListener('change',e=>v26Assign('attacker',Number(e.target.value)));
 $('v26Defender').addEventListener('change',e=>v26Assign('defender',Number(e.target.value)));
 all('[data-posture]').forEach(b=>b.addEventListener('click',()=>{S.tactics.posture=b.dataset.posture;addLog('mission','STRATEGY / '+b.dataset.posture.toUpperCase());sound('tap');draw()}));
 $('v26ChargeAction').addEventListener('click',v26ChargeAction);$('v26CoolAction').addEventListener('click',v26Cool);$('v26ReconAction').addEventListener('click',v26Scan);
 $('v26ChooseAttack').addEventListener('click',()=>{S.selectedEva=S.tactics.attacker;sound('select');draw();toast('UNIT-0'+S.selectedEva+' を審議対象に設定しました')});
 // Capture before v2.5 mission event; a fire command now needs actual strategic preparation.
 $('missionAction').addEventListener('click',evt=>{if(S.mission.phase!==5)return;const o=v26Snapshot(),fail=[];
 if(!o.readyAttack)fail.push('攻撃担当EVAが出撃していません');if(o.t.charge<70)fail.push('陽電子砲の蓄電が70%未満です');if(o.t.heat>=80)fail.push('砲身過熱です');
 if(fail.length){evt.preventDefault();evt.stopImmediatePropagation();toast(fail.join(' / '));sound('deny');go('mission');return}
 setTimeout(()=>{if(S.mission.phase===6){S.tactics.shots++;S.tactics.charge=0;S.tactics.heat=35;addLog('mission','POSITRON DISCHARGE / SHOT '+S.tactics.shots+' / COMPLETED');draw()}},0);
 },true);
 $('missionReset').addEventListener('click',()=>{S.tactics.charge=0;S.tactics.heat=0;S.tactics.scans=0;draw()});
 const previous=draw;draw=function(){previous();v26Render()};
 v26Render();
}

if(qs('#evaSvg .eva-reference-rig')) v26Init();
/* ===== v2.7 TACTICAL DEFENSE NETWORK (FICTIONAL / LOCAL) ===== */
const V27_SCENARIOS=[
 {name:'接近型 / INTRUSION VECTOR',code:'UNIDENTIFIED-α',bearing:'北東',hp:115,force:28,dist:5,lane:1},
 {name:'高出力反応 / ENERGY EMITTER',code:'UNIDENTIFIED-β',bearing:'北西',hp:145,force:38,dist:5,lane:0},
 {name:'侵入型 / SUBTERRANEAN',code:'UNIDENTIFIED-γ',bearing:'東側',hp:130,force:33,dist:4,lane:2}
];
const V27_FACILITY=[{name:'西防壁',short:'WEST',max:100},{name:'中央兵装',short:'BATTERY',max:100},{name:'東迎撃区',short:'EAST',max:100},{name:'ジオフロント',short:'HQ',max:100}];
const v27Default=()=>({status:'idle',caseNo:0,round:0,scans:0,selected:1,energy:70,parts:120,spares:2,security:85,breach:0,connected:false,shutdown:false,magivote:null,magiround:-1,enemy:null,city:[{hp:100,armor:false,turret:false},{hp:100,armor:false,turret:false},{hp:100,armor:false,turret:false},{hp:100,armor:true,turret:false}],history:[],wins:0,losses:0,alert:false,usedV27Shot:false,securityPuzzle:0,last:'待機中 / SIMULATION IDLE'});
function v27Normalize(){const raw=(S.defense&&typeof S.defense==='object')?S.defense:{};const d={...v27Default(),...raw};const bounded=(n,lo=0,hi=100)=>Math.round(Math.max(lo,Math.min(hi,Number(n)||0)));
 d.energy=bounded(d.energy);d.parts=bounded(d.parts,0,999);d.spares=bounded(d.spares,0,9);d.security=bounded(d.security);d.scans=bounded(d.scans);d.round=bounded(d.round,0,200);d.breach=bounded(d.breach,0,100);d.selected=bounded(d.selected,0,3);d.caseNo=bounded(d.caseNo,0,999);d.wins=bounded(d.wins,0,999);d.losses=bounded(d.losses,0,999);
 d.city=V27_FACILITY.map((f,i)=>{const c=Array.isArray(raw.city)?raw.city[i]:null;return {hp:bounded(c?.hp??100),armor:!!c?.armor,turret:!!c?.turret};});
 if(!['idle','active','victory','defeat'].includes(d.status))d.status='idle';if(!Array.isArray(d.history))d.history=[];d.history=d.history.slice(0,24);if(d.status==='active'&&!d.enemy)d.status='idle';
 if(d.enemy){d.enemy={...d.enemy,hp:bounded(d.enemy.hp,0,300),maxHp:bounded(d.enemy.maxHp,1,300),dist:bounded(d.enemy.dist,0,9),lane:bounded(d.enemy.lane,0,2),force:bounded(d.enemy.force,0,100)}};
 S.defense=d;return d;}
const v27D=v27Normalize();
const v27Clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const v27Num=(n)=>Math.round(Number(n)||0);
function v27Record(s){const d=S.defense;d.last=s;d.history.unshift({at:hhmmss(),t:d.round,txt:s.slice(0,88)});d.history=d.history.slice(0,24);addLog('mission','CITY DEFENSE / '+s);}
function v27SectorSVG(i,cx,cy){const fac=V27_FACILITY[i];const halfW=i===3?77:57;const halfH=i===3?39:28;const depth=i===3?59:42;const l=cx-halfW,r=cx+halfW,t=cy-halfH,b=cy+halfH;return `<g class="v27-building" data-v27pick="${i}" data-selected="false" role="button" tabindex="0" aria-label="${fac.name}を選択">
 <polygon class="v27-left" points="${l},${cy} ${cx},${b} ${cx},${b+depth} ${l},${cy+depth}"/>
 <polygon class="v27-right" points="${cx},${b} ${r},${cy} ${r},${cy+depth} ${cx},${b+depth}"/>
 <polygon class="v27-top" points="${cx},${t} ${r},${cy} ${cx},${b} ${l},${cy}"/>
 <path d="M${cx-12} ${cy}h24 M${cx} ${cy-10}v20" stroke="#86d7b5" stroke-width="1.5" opacity=".8"/>
 <circle cx="${r-9}" cy="${cy+depth-5}" r="5" fill="#ffb46e" opacity=".7"/>
 <text x="${cx}" y="${b+depth+20}" text-anchor="middle">${fac.short}</text>
 <rect x="${l-4}" y="${t-4}" width="${halfW*2+8}" height="${halfH*2+depth+12}" fill="transparent"/></g>`;}
function v27MapMarkup(){let grid='';for(let x=-400;x<=1000;x+=48)grid+=`<path class="grid-line" d="M${x} 0l430 430M${x} 0l-430 430"/>`;
 return `<svg class="v27-map" id="v27IsoMap" viewBox="0 0 680 445" preserveAspectRatio="xMidYMid meet" role="img" aria-label="第3新東京市の2.5D模擬戦術地図。施設をタップして選択できます">
 <defs><radialGradient id="v27MapHalo"><stop stop-color="#0f3b32"/><stop offset="1" stop-color="#021015"/></radialGradient></defs><rect width="680" height="445" fill="url(#v27MapHalo)"/>${grid}
 <g opacity=".8"><path d="M340 70L618 207 340 355 62 207Z" fill="#07262a" stroke="#388c7c" stroke-width="3"/><path d="M340 90L588 207 340 337 92 207Z" fill="none" stroke="#276963" stroke-dasharray="10 7" stroke-width="2"/></g>
 <circle cx="340" cy="207" r="125" class="v27-threat-ring"/><circle cx="340" cy="207" r="180" class="v27-threat-ring" opacity=".25"/><line x1="340" y1="207" x2="514" y2="207" class="v27-sweep"/>
 <path id="v27PowerLine" class="v27-powerline" d="M340 295L181 209L340 125L500 209L340 295"/>
 ${v27SectorSVG(0,181,198)}${v27SectorSVG(1,340,125)}${v27SectorSVG(2,500,198)}${v27SectorSVG(3,340,278)}
 <g id="v27Enemy" class="v27-enemy v27-visual-off" transform="translate(530 35)"><circle r="29" class="v27-threat-ring"/><polygon points="0,-22 21,0 0,22 -21,0"/><circle r="6" fill="#1a120e"/><path d="M-38 0H38M0 -38V38" stroke="#ff684e" stroke-width="1.6" opacity=".8"/></g>
 <path class="v27-aim" d="M10 58V10H58M622 10h48v48M10 389v46h48M622 435h48v-46"/>
 <text class="v27-map-text" x="15" y="25">NERV / MUNICIPAL TACTICAL GRID</text><text class="v27-map-text" x="15" y="420">RENDER : 2.5D / SIMULATED</text><text class="v27-map-text" x="530" y="420">TOKYO-3</text>
 </svg>`;}
function v27Build(){
 const main=`<section class="v27-plate" id="v27DefenseBoard" aria-label="第3新東京市統合防衛戦術盤"><div class="v27-head"><b>第三新東京市 総合防衛盤<small>TOKYO-3 / TACTICAL DEFENSE NETWORK</small></b><span id="v27Status" class="v27-chip">STANDBY</span></div>
 <div class="v27-kpi"><div><small>敵接近 / ETA</small><strong id="v27ETA">--</strong></div><div><small>都市健全性</small><strong id="v27CityHP">--</strong></div><div><small>防衛電力</small><strong id="v27Energy">--</strong></div><div><small>資材 / SUPPLY</small><strong id="v27Parts">--</strong></div></div>
 ${v27MapMarkup()}
 <div class="v27-readbar"><span id="v27RadarSignal">SIGNAL : NO TARGET</span><b id="v27MapDetail">SCANNING / 0%</b></div>
 <div class="v27-lanes" id="v27Facilities">${V27_FACILITY.map((f,i)=>`<button data-v27pick="${i}">${f.name}<small id="v27Sector${i}">HP 100 / 100</small></button>`).join('')}</div>
 <div class="v27-split"><div class="v27-sub"><label>SELECTED FACILITY</label><b id="v27Selected">---</b><div class="v27-stat bad"><i id="v27SelectedHP"></i></div></div><div class="v27-sub"><label>敵性識別・解析</label><b id="v27EnemyLabel">UNKNOWN</b><div class="v27-stat"><i id="v27ScanBar"></i></div></div></div>
 <div class="v27-tools"><button id="v27Detect">◆ 新規敵性反応 / DETECT</button><button id="v27Scan">⌖ 波形・A.T.分析 / SCAN</button><button id="v27Armor">▣ 装甲を展開 / ARMOR</button><button id="v27Turret">⚑ 迎撃砲台 / DEPLOY</button><button id="v27Power">⚡ 補助電力 / RESERVE</button><button id="v27Repair">✚ 施設の応急修理 / REPAIR</button><button id="v27Cable">⛓ EVA電源ケーブル / CONNECT</button><button id="v27Shot">◎ EVA支援射撃 / SUPPORT</button></div>
 <button class="v27-long" id="v27Advance">▸ 作戦時間を進める / ADVANCE TURN</button><div class="v27-story" aria-live="polite" id="v27Story">命令待機 / DISPATCH IDLE</div>
 <div class="v27-kpi" style="margin-top:8px"><div><small>経過ターン</small><strong id="v27Turn">00</strong></div><div><small>兵装稼働</small><strong id="v27Turrets">0/3</strong></div><div><small>予備送電</small><strong id="v27Reserve">2</strong></div><div><small>MAGIセキュリティ</small><strong id="v27Security">85%</strong></div></div>
 <div class="v27-tools"><button data-v27jump="magi">△ MAGI戦術審議へ ↗</button><button data-v27jump="eva">◈ EVA兵站・運用へ ↗</button><button data-v27jump="mission">⌖ ヤシマ作戦へ ↗</button><button data-v27jump="home">⌂ 統合ホーム ↗</button></div>
 <section class="v27-mini"><h3>作戦履歴 / AFTER ACTION</h3><p id="v27Report">迎撃成功・損害・補給の履歴。施設ダメージは次の作戦へ持ち越されます。</p><div id="v27History" class="v27-history"></div></section>
 <p class="v26-source">非公式ファン制作・全て架空の作戦訓練。気象警報・現実の防災情報とは接続していません。敵の名称・能力・資源量はゲーム独自設定です。</p></section>`;
 const after=(selector,html)=>{const e=qs(selector);if(!e)throw Error('v2.7 missing anchor '+selector);e.insertAdjacentHTML('afterend',html)};
 after('.page[data-page="infra"] .page-top',main);
 after('.page[data-page="home"] .v26-box',`<section class="v27-mini"><h3>◈ 防衛指揮 / TACTICAL DEFENSE</h3><div class="v27-result" id="v27HomeBrief">NO HOSTILE SIGNAL</div><p id="v27HomeState">施設防御状況・敵性反応を監視中</p><button data-v27jump="infra">第3新東京市 戦術マップを開く ↗</button></section>`);
 after('.page[data-page="mission"] .v26-box',`<section class="v27-mini"><h3>◆ TACTICAL INTERLOCK / 都市防衛連携</h3><div id="v27MissionBrief" class="v27-result">IDLE</div><p>射撃支援は攻撃担当EVAの出撃・MAGI承認・充填・照準ロックと連動。</p><button data-v27jump="infra">都市迎撃盤へ / DEFENSE GRID ↗</button></section>`);
 after('.page[data-page="eva"] .v26-box',`<section class="v27-mini"><h3>⛓ 電源ケーブル・兵站情報</h3><div id="v27EvaBrief" class="v27-result">UMBILICAL : STANDBY</div><p>未接続で作戦時間を進めると、出撃中の攻撃担当機の電力が減少する。</p><button data-v27jump="infra">地上設備・接続指揮 ↗</button></section>`);
 after('.page[data-page="magi"] .v26-box',`<section class="v27-mini"><h3>MAGI 戦術審議 / COUNTERINTRUSION</h3><div class="v27-result" id="v27MagiBrief">TRI-CORE : STANDBY</div><div class="v27-split"><div class="v27-sub"><label>MELCHIOR / 科学者</label><b id="v27Vote0">---</b></div><div class="v27-sub"><label>BALTHASAR / 母</label><b id="v27Vote1">---</b></div></div><div class="v27-sub" style="margin-top:5px"><label>CASPER / 女</label><b id="v27Vote2">---</b></div><div class="v27-duo"><button id="v27MagiJudge">三基戦術審議 / VOTE</button><button id="v27SecDetect">侵入トレース / TRACE</button></div><p id="v27SecurityHint">侵入状況は敵の接近時に変化。シグナルの解析によって遮断対象を推定。</p><div class="v27-duo"><button data-v27isolate="0">MELCHIOR隔離</button><button data-v27isolate="1">BALTHASAR隔離</button></div><button data-v27isolate="2" style="margin-top:4px">CASPER隔離 / QUARANTINE</button><button data-v27jump="infra" style="margin-top:4px">都市防衛管制へ戻る ↗</button></section>`);
 all('[data-v27jump]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.v27jump)));
 all('[data-v27pick]').forEach(el=>{el.addEventListener('click',()=>{S.defense.selected=Number(el.dataset.v27pick);sound('select');draw()});if(el.tagName.toLowerCase()==='g')el.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();S.defense.selected=Number(el.dataset.v27pick);draw()}})});
 const handlers={v27Detect:v27Detect,v27Scan:v27Scan,v27Armor:v27Armor,v27Turret:v27Turret,v27Power:v27Power,v27Repair:v27Repair,v27Cable:v27Cable,v27Shot:v27Shot,v27Advance:v27Advance,v27MagiJudge:v27Judge,v27SecDetect:v27Trace};Object.entries(handlers).forEach(([id,fn])=>$(id).addEventListener('click',fn));
 all('[data-v27isolate]').forEach(el=>el.addEventListener('click',()=>v27Isolate(Number(el.dataset.v27isolate))));
}
function v27Profile(){return V27_SCENARIOS[(S.defense.caseNo-1+V27_SCENARIOS.length)%V27_SCENARIOS.length];}
function v27Spend(amount){if(!S.infra.power){toast('都市主電源が停止中。管制画面から復旧してください');sound('deny');return false;}if(S.defense.energy<amount){toast('防衛電力が不足 / '+amount+'必要');sound('deny');return false}S.defense.energy-=amount;return true}
function v27Finish(won,why){const d=S.defense;if(d.status!=='active')return;d.status=won?'victory':'defeat';if(won){d.wins++;d.parts=v27Clamp(d.parts+34,0,999);d.energy=v27Clamp(d.energy+20);addXP(45+Math.round(v27CityIntegrity()/4),'CITY DEFENSE SUCCESS');}else{d.losses++;d.parts=v27Clamp(d.parts+12,0,999);d.breach=v27Clamp(d.breach+20)}v27Record((won?'作戦成功 / ':'防衛失敗 / ')+why);sound(won?'done':'warning');draw();}
function v27Detect(){const d=S.defense;if(d.status==='active'){toast('迎撃作戦進行中。完了後に次の反応を検知できます');return}d.caseNo++;const x=v27Profile();d.status='active';d.round=0;d.scans=0;d.magivote=null;d.magiround=-1;d.shutdown=false;d.usedV27Shot=false;d.enemy={hp:x.hp,maxHp:x.hp,dist:x.dist,force:x.force,lane:x.lane,code:x.code};d.energy=v27Clamp(d.energy+20);d.breach=0;v27Record('敵性反応を検出 / 分析前の推定進路 '+x.bearing+' / CASE '+d.caseNo);sound('warning');draw()}
function v27Scan(){const d=S.defense;if(d.status!=='active')return toast('敵性反応を先に検知してください');if(!v27Spend(12))return;d.scans=v27Clamp(d.scans+34);if(d.scans>=70)S.tactics.scans=Math.max(S.tactics.scans,2);v27Record('多層波形解析 '+d.scans+'% / '+(d.scans>=68?'PATTERN BLUE：確度上昇':'対象未確定'));sound('scan');draw()}
function v27CityIntegrity(){return Math.round(S.defense.city.reduce((a,x)=>a+x.hp,0)/4)}
function v27Armor(){const d=S.defense,c=d.city[d.selected];if(d.status==='active'||d.status==='idle'){if(c.hp<=0)return toast('機能停止。先に修理してください');if(c.armor)return toast('装甲は展開済み');if(!v27Spend(12))return;c.armor=true;v27Record(V27_FACILITY[d.selected].name+' / 防護シャッター展開');sound('ok');draw()}}
function v27Turret(){const d=S.defense,c=d.city[d.selected];if(d.selected===3)return toast('ジオフロント区画には迎撃砲を設置できません');if(c.hp<25)return toast('施設損傷のため稼働不可 / 修復してください');if(c.turret)return toast('砲台はすでに稼働中です');if(d.parts<20)return toast('資材が不足 / 20必要');d.parts-=20;c.turret=true;v27Record(V27_FACILITY[d.selected].name+' / 迎撃砲台配置');sound('launch');draw()}
function v27Power(){const d=S.defense;if(d.spares<=0)return toast('予備送電枠を使い切りました');d.spares--;d.energy=v27Clamp(d.energy+38);v27Record('地下補助系統から緊急送電 / +38');sound('ok');draw()}
function v27Repair(){const d=S.defense,c=d.city[d.selected];if(c.hp>=100)return toast('設備は健全です');if(d.parts<18)return toast('修理資材が不足 / 18必要');d.parts-=18;c.hp=v27Clamp(c.hp+27);v27Record(V27_FACILITY[d.selected].name+' / 緊急修復：HP '+c.hp);sound('ok');draw()}
function v27Cable(){const d=S.defense;if(d.connected){d.connected=false;v27Record('アンビリカルケーブルを解除');draw();return}if(d.status!=='active')return toast('出撃時にケーブル接続可能');if(S.evas[S.tactics.attacker]?.state!=='DEPLOYED')return toast('攻撃担当EVAが出撃していません');if(!v27Spend(7))return;d.connected=true;v27Record('UNIT-0'+S.tactics.attacker+' へアンビリカルケーブル接続');sound('ok');draw()}
function v27Judge(){const d=S.defense;if(d.status!=='active')return toast('敵性信号がありません');if(d.scans<34)return toast('最低1回の波形分析を先に実施してください');const votes=[d.scans>=65&&S.infra.power,d.city[3].hp>=35&&v27CityIntegrity()>=40,d.security>=45&&S.infra.comms];d.magivote=votes;d.magiround=d.round;v27Record('MAGI 戦術判断 '+votes.filter(Boolean).length+'/3 '+(votes.filter(Boolean).length>=2?'承認':'留保'));sound('scan');draw()}
function v27Trace(){const d=S.defense;if(d.status!=='active')return toast('敵性信号を検知してください');if(d.scans<34)return toast('波形解析が必要です');d.securityPuzzle=(d.caseNo+d.round+1)%3;if(!v27Spend(8))return;d.shutdown=true;v27Record('MAGI侵入試行を捕捉 / ノード '+['M','B','C'][d.securityPuzzle]+' に不審通信');sound('warning');draw()}
function v27Isolate(i){const d=S.defense;if(!d.shutdown)return toast('侵入トレースを先に行ってください');d.shutdown=false;if(i===d.securityPuzzle){d.security=v27Clamp(d.security+15);d.parts=v27Clamp(d.parts+6,0,999);v27Record('不正ノード隔離成功 / 三基稼働継続');sound('ok')}else{d.security=v27Clamp(d.security-20);v27Record('隔離対象誤認 / MAGIセキュリティ -20');sound('deny')}d.magivote=null;draw()}
function v27Shot(){const d=S.defense,t=S.tactics;if(d.status!=='active')return toast('迎撃対象がありません');const a=S.evas[t.attacker],errs=[];if(S.mission.phase<4||S.mission.phase>5)errs.push('既存作戦PHASE 04-05');if(a?.state!=='DEPLOYED')errs.push('攻撃担当機の出撃');if(S.magi.approvedFor!==t.attacker)errs.push('EVA出撃承認');if(t.charge<70||t.heat>=80)errs.push('蓄電70%以上・熱負荷80%未満');if(!S.ops.currentMissionLocks)errs.push('照準ロック');if(!d.magivote||d.magivote.filter(Boolean).length<2||d.magiround!==d.round)errs.push('現ターンのMAGI戦術承認');if(errs.length){toast('射撃不可: '+errs.join(' / '));sound('deny');return}const dmg=Math.round(60+d.scans*.33+(d.connected?10:0));d.enemy.hp=v27Clamp(d.enemy.hp-dmg,0,300);d.usedV27Shot=true;t.charge=0;t.heat=v27Clamp(t.heat+20);v27Record('EVA支援射撃 / '+dmg+' DAMAGE / 対象残 '+d.enemy.hp);sound('launch');if(!d.enemy.hp){v27Finish(true,'EVA支援射撃により目標沈黙');return}draw()}
function v27Advance(){const d=S.defense;if(d.status!=='active')return toast('まず新規敵性反応を検知してください');const validVotes=d.magivote?d.magivote.filter(Boolean).length:0;d.round++;d.energy=v27Clamp(d.energy+(S.infra.power?7:0)); // MAGI evaluation applies to this turn only
 const e=d.enemy;let damage=0,shots=0;for(let i=0;i<3;i++){const c=d.city[i];if(c.turret&&c.hp>=25&&d.energy>=5&&S.infra.power){d.energy-=5;damage+=Math.round((11+d.scans/15+(S.infra.comms?3:0))*(validVotes>=2?1.35:validVotes===1?.7:1));shots++}}
 d.magivote=null;d.magiround=-1;if(damage){e.hp=v27Clamp(e.hp-damage,0,300);v27Record('地上迎撃 '+shots+'系統 / 対象損耗 -'+damage+' / 残 '+e.hp)}
 if(e.hp<=0){v27Finish(true,'迎撃砲火により目標撃退');return}
 e.dist=Math.max(0,e.dist-1);if(!d.connected&&S.evas[S.tactics.attacker]?.state==='DEPLOYED'){const ev=S.evas[S.tactics.attacker];ev.power=Math.max(0,Number(ev.power)-32);if(ev.power<=0){ev.state='POWER_LOST';ev.at=false;v27Record('攻撃担当EVA 内部電源喪失')}}
 if(e.dist<=1){const spot=d.round%3===0?3:e.lane;const c=d.city[spot];const absorb=(c.armor?13:0)+(S.infra.armor?5:0);const guard=spot===3&&S.evas[S.tactics.defender]?.at?12:0;const loss=Math.max(5,e.force-absorb-guard);c.hp=v27Clamp(c.hp-loss);d.breach=v27Clamp(d.breach+(spot===3?13:5));d.security=v27Clamp(d.security-(d.scans<35?9:3));v27Record(V27_FACILITY[spot].name+'被弾 / '+loss+' DAMAGE / HP '+c.hp);if(c.hp<25)c.turret=false}
 else v27Record('敵性反応接近 / ETA '+e.dist+' TURNS / 電力配分 +7');
 if(d.city[3].hp<=0||v27CityIntegrity()<=26||d.round>=14){v27Finish(false,'防衛ライン維持不可 / 復旧が必要');return}sound(e.dist<=1?'warning':'scan');draw();}
function v27Render(){const d=S.defense;if(!$('v27DefenseBoard'))return;const active=d.status==='active',e=d.enemy,health=v27CityIntegrity(),votes=d.magivote||[];const txt=(id,v)=>{const el=$(id);if(el)el.textContent=String(v)};
 document.body.dataset.defense=d.status;
 if(d.status==='active' && S.infra.power && S.infra.comms && !S.evas.some(e=>e.state==='POWER_LOST')){const rb=$('globalAlert');rb.classList.remove('hidden');rb.dataset.level='watch';$('globalAlertFlag').textContent='PATTERN ALERT';$('globalAlertText').textContent='模擬敵性反応 / TOKYO-3 防衛作戦 '+String(d.caseNo).padStart(3,'0');$('telemetryAlarm').textContent='ENEMY';$('telemetryAlarm').style.color='#ffb374';$('heroTacticalState').textContent='DEFENSE ACTIVE / SIM';}
 const label={idle:'STANDBY',active:'PATTERN ALERT',victory:'TARGET CLEARED',defeat:'DEFENSE LOST'}[d.status];txt('v27Status',label);$('v27Status').classList.toggle('alert',active);
 txt('v27ETA',active?e.dist+' T':d.status==='victory'?'CLEAR':'--');txt('v27CityHP',health+'%');txt('v27Energy',d.energy+'%');txt('v27Parts',d.parts);
 txt('v27RadarSignal',active?'SIGNAL : '+(d.scans>=65?'PATTERN BLUE':'UNKNOWN')+' / '+v27Profile().bearing:'SIGNAL : NO HOSTILE CONTACT');txt('v27MapDetail',active?`${e.hp}/${e.maxHp} HP / RECON ${d.scans}%`:d.status.toUpperCase());
 txt('v27Selected',V27_FACILITY[d.selected].name);$('v27SelectedHP').style.width=d.city[d.selected].hp+'%';txt('v27EnemyLabel',active?(d.scans>=65?e.code:'UNIDENTIFIED'):'NO CONTACT');$('v27ScanBar').style.width=d.scans+'%';
 const ex=$('v27Enemy');ex.classList.toggle('v27-visual-off',!active);if(active){const coord=[[90,60],[590,68],[600,215]][e.lane];const p=v27Clamp((6-e.dist)/5,0,1);const x=coord[0]+(340-coord[0])*p,y=coord[1]+(210-coord[1])*p;ex.setAttribute('transform',`translate(${Math.round(x)} ${Math.round(y)})`)}
 $('v27PowerLine').classList.toggle('off',!S.infra.power);
 all('[data-v27pick]').forEach(el=>{const i=Number(el.dataset.v27pick);if(el.tagName.toLowerCase()==='button'){el.classList.toggle('sel',d.selected===i);el.classList.toggle('damage',d.city[i].hp<50);}else{el.dataset.selected=d.selected===i?'true':'false';el.dataset.damaged=d.city[i].hp<40?'true':'false';}});
 for(let i=0;i<4;i++)txt('v27Sector'+i,'HP '+d.city[i].hp+' / '+(d.city[i].armor?'装甲':'OPEN')+(d.city[i].turret?' ⚑':''));
 txt('v27Story',d.last);txt('v27Turn',String(d.round).padStart(2,'0'));txt('v27Turrets',d.city.filter(c=>c.turret&&c.hp>=25).length+'/3');txt('v27Reserve',d.spares);txt('v27Security',d.security+'%');
 txt('v27Report',`防衛成功 ${d.wins} / 失敗 ${d.losses} / 継続損耗 ${100-health}% / CASE ${String(d.caseNo).padStart(3,'0')}`);
 $('v27History').replaceChildren();d.history.slice(0,8).forEach(r=>{const el=document.createElement('div'),a=document.createElement('time'),b=document.createElement('span');a.textContent=r.at+' / T'+r.t;b.textContent=r.txt;el.append(a,b);$('v27History').append(el)});if(!d.history.length)$('v27History').textContent='NO BATTLE RECORDS';
 $('v27Detect').disabled=active;$('v27Scan').disabled=!active||d.energy<12||d.scans===100;$('v27Armor').disabled=d.city[d.selected].armor||d.city[d.selected].hp<=0||d.energy<12;$('v27Turret').disabled=d.selected===3||d.city[d.selected].turret||d.city[d.selected].hp<25||d.parts<20;$('v27Power').disabled=d.spares<1;$('v27Repair').disabled=d.parts<18||d.city[d.selected].hp>=100;$('v27Advance').disabled=!active;
 txt('v27Cable',d.connected?'⛓ ケーブル解除 / DISCONNECT':'⛓ EVA電源ケーブル / CONNECT');
 const magiStatus=d.magivote?d.magivote.filter(Boolean).length+'/3 CORES / '+(d.magivote.filter(Boolean).length>=2?'APPROVED':'REJECTED'):'VOTE REQUIRED';
 txt('v27HomeBrief',active?'◆ ENEMY '+e.dist+' T / CITY '+health+'%':label+' / CITY '+health+'%');txt('v27HomeState',d.last);
 txt('v27MissionBrief',`${label} / TARGET ${active?e.hp+'HP':'NONE'} / MAGI ${magiStatus}`);txt('v27EvaBrief',`UMBILICAL : ${d.connected?'CONNECTED':'OFFLINE'} / EVA電力 ${S.evas[S.tactics.attacker].power}s / SECURITY ${d.security}%`);
 txt('v27MagiBrief',`${magiStatus} / SECURITY ${d.security}% / RECON ${d.scans}%`);
 ['v27Vote0','v27Vote1','v27Vote2'].forEach((id,i)=>txt(id,d.magivote?(votes[i]?'APPROVE':'DENY'):'WAIT'));
 txt('v27SecurityHint',d.shutdown?'侵入シグナルを捕捉：'+['MELCHIOR','BALTHASAR','CASPER'][d.securityPuzzle]+' に不審ノード。隔離を選択。':'ノード隔離には先に侵入トレースを実行。誤遮断でセキュリティ低下。');
 $('v27MagiJudge').disabled=!active||d.scans<34;$('v27SecDetect').disabled=!active||d.scans<34;
}
function v27Init(){if(!qs('.page[data-page="infra"] .page-top')?.insertAdjacentHTML)return;v27Build();const v26Draw=draw;draw=function(){v26Draw();v27Render();};window.NERV_V27_TEST={snapshot:()=>JSON.parse(JSON.stringify(S.defense)),detect:v27Detect,scan:v27Scan,advance:v27Advance,judge:v27Judge,shoot:v27Shot,repair:v27Repair,armor:v27Armor,turret:v27Turret,energy:v27Power,sector:(x)=>{S.defense.selected=x;draw()},render:v27Render};v27Render();}
v27Init();

/* v2.8 Personnel / dispatch extension. Runs inside the existing state closure. */
function initPersonnelTerminal(){
 if(!qs('.page[data-page="tools"] .page-top')?.insertAdjacentHTML)return;
 // Preserve the original v2 save once, before adding optional personnel fields.
 if(!window.__SCRIPTABLE__){try{
  const raw=localStorage.getItem('nerv-command-v2');
  if(raw&&!localStorage.getItem('nerv-command-v2-pre-v28'))localStorage.setItem('nerv-command-v2-pre-v28',raw);
 }catch(e){console.warn('Personnel backup unavailable',e.name);}}
 const previous=S.personnel&&typeof S.personnel==='object'?S.personnel:{};
 S.personnel={name:typeof previous.name==='string'?previous.name.slice(0,24):'OPERATOR',
  department:typeof previous.department==='string'?previous.department.slice(0,32):'作戦管制部',
  feed:Array.isArray(previous.feed)?previous.feed.filter(x=>x&&typeof x.text==='string'&&typeof x.at==='number').slice(0,12):[]};
 S.prefs.hqComms=typeof S.prefs.hqComms==='boolean'?S.prefs.hqComms:true;
 S.prefs.hqVoice=S.prefs.hqVoice===true;
 const messages={
  broadcast:[['総務部 / GENERAL AFFAIRS','本日の入館証を携帯してください。模擬訓練区画への入室時は端末認証が必要です。'],
   ['施設管理 / FACILITIES','中央連絡通路の点検を実施中。移動には東側連絡通路をご利用ください。'],
   ['職員支援 / PERSONNEL','休憩時間のお知らせ。交代要員への引き継ぎ後、補給区画をご利用ください。'],
   ['作戦本部 / OPERATIONS','これは館内放送の訓練です。各部署は通常の模擬勤務を継続してください。']],
  radio:[['技術部・整備班 / TECHNICAL','定時連絡。整備班は次回点検の準備に入ります。管制側は機体状況をご確認ください。'],
   ['中央管制 / CENTRAL CONTROL','通信回線の定時確認です。受信した職員は端末の受領確認をお願いします。'],
   ['兵站管理 / LOGISTICS','補給区画より連絡。模擬資材の配分は防衛盤の現在値を参照してください。'],
   ['MAGI運用班 / MAGI OPERATIONS','三基の定期照合を予定しています。戦術判断はMAGI画面で別途実行してください。']]
 };
 const portrait=`<svg viewBox="0 0 100 125" aria-hidden="true"><path d="M0 25h100M0 50h100M0 75h100M0 100h100M25 0v125M50 0v125M75 0v125" stroke="currentColor" opacity=".13"/><circle cx="50" cy="40" r="21" fill="currentColor" opacity=".8"/><path d="M12 120V98c0-24 17-33 38-33s38 9 38 33v22" fill="currentColor" opacity=".8"/><path d="M34 70l16 26 16-26M50 96v29" fill="none" stroke="#d8d5c7" stroke-width="3"/></svg>`;
 eHTML('.page[data-page="home"] .page-top','afterend',`<section class="hq-dispatch" aria-label="本部通信 / ゲーム内演出"><div class="hq-kicker"><span class="hq-led"></span> HQ DISPATCH <span>SIMULATED / 01</span></div><p id="hqDispatchText">本部通信待機中。館内放送・職員連絡はゲーム内の演出です。</p><div class="hq-row"><button data-hq="personnel">職員支援を開く <span>PERSONNEL ↗</span></button><button data-hq="id">職員証 <span>ID CARD ↗</span></button></div></section>`);
 eHTML('.page[data-page="tools"] .page-top','afterend',`<section class="hq-panel" aria-labelledby="hqPersonnelTitle"><header class="hq-panel-head"><div><small>07 / PERSONNEL SERVICES</small><h2 id="hqPersonnelTitle">職員支援室</h2></div><span class="hq-badge">LOCAL / SIM</span></header><div class="hq-personnel-brief"><div class="hq-mini-portrait">${portrait}</div><div><small>AUTHORIZED OPERATOR</small><strong id="hqProfileName">OPERATOR</strong><span id="hqProfileRank">TRAINEE</span></div><button data-hq="id">職員証を提示 <span>VIEW ID ↗</span></button></div><form id="hqProfileForm" class="hq-profile-form"><label>表示名 / CALLSIGN<input id="hqName" maxlength="24" autocomplete="off" required></label><label>所属 / DEPARTMENT<input id="hqDepartment" maxlength="32" autocomplete="off" required></label><button type="submit">職員情報を保存</button><small>架空の職員情報です。実名の入力は不要です。</small></form></section>
 <section class="hq-panel" aria-labelledby="hqInboxTitle"><header class="hq-panel-head"><div><small>INTERNAL NETWORK / SIMULATION</small><h2 id="hqInboxTitle">館内放送・職員通信</h2></div><span id="hqUnread" class="hq-badge">0 NEW</span></header><p class="hq-note">すべて架空の通信です。実際の警報・指示ではありません。</p><div class="hq-row"><button data-hq="broadcast">館内放送を受信 <span>PA SYSTEM</span></button><button data-hq="radio">職員連絡を受信 <span>COMMS</span></button></div><div id="hqCommsFeed" class="hq-feed" aria-live="polite" aria-relevant="additions"></div></section>`);
 eHTML('.page[data-page="settings"] .settings-list','beforeend',`<button id="hqCommsSwitch" class="setting-row"><span><b>ランダム館内通信</b><small>表示中のみ約65〜140秒ごと / ゲーム内演出</small></span><strong id="hqCommsFlag"></strong></button><button id="hqVoiceSwitch" class="setting-row"><span><b>館内放送の読み上げ</b><small>効果音ON時のみ / 対応端末の日本語音声</small></span><strong id="hqVoiceFlag"></strong></button>`);
 eHTML(document.body,'beforeend',`<dialog id="hqIdDialog" class="hq-dialog" aria-labelledby="hqIdTitle"><div class="hq-dialog-head"><div><small>PERSONNEL AUTHENTICATION / SIM</small><h2 id="hqIdTitle">職員身分証明書</h2></div><button data-hq="close" aria-label="職員証を閉じる">×</button></div><article class="hq-id-card" id="hqIdCard"><div class="hq-id-top"><b>NERV</b><span>PERSONNEL IDENTIFICATION<br>第3新東京市 / 作戦本部</span></div><div id="hqIdFront"><div class="hq-id-body"><div class="hq-id-portrait">${portrait}<span>NO PHOTO / SIM</span></div><div class="hq-id-fields"><small>NAME / 氏名</small><strong id="hqIdName"></strong><small>DEPARTMENT / 所属</small><b id="hqIdDepartment"></b><small>GRADE / 模擬階級</small><b id="hqIdRank"></b></div></div><div class="hq-id-serial"><span>NC · 0001 · LOCAL</span><b>ACCESS / SIM ONLY</b></div><div class="hq-barcode" aria-hidden="true"></div></div><div id="hqIdBack" hidden><h3>取扱区分 / LOCAL ONLY</h3><p>このカードは非公式ファン作品内の架空の職員証です。本人確認・実際の入館には使用できません。</p><dl><dt>発行区分</dt><dd>端末内シミュレーション</dd><dt>所属設定</dt><dd>職員支援室から変更可能</dd><dt>認証情報</dt><dd>外部送信なし</dd></dl></div><footer>UNOFFICIAL FAN SIMULATION / 架空職員証</footer></article><div class="hq-row"><button id="hqFlipId">裏面を表示 / REVERSE</button><button data-hq="close">提示を終了 / CLOSE</button></div></dialog>
 <dialog id="hqActionDialog" class="hq-dialog hq-action-dialog" aria-labelledby="hqActionTitle"><div class="hq-dialog-head"><div><small>COMMAND ROUTING / SIMULATION</small><h2 id="hqActionTitle">行動選択</h2></div><button data-hq="close" aria-label="行動選択を閉じる">×</button></div><nav class="hq-breadcrumb" aria-label="選択の階層"><button id="hqActionBack">分類に戻る</button><span id="hqActionPath">01 / CATEGORY</span></nav><div id="hqActionContent"></div><p class="hq-note">確認画面から実行するまで資材・状態は変化しません。</p></dialog>`);
 const categories=[
  {key:'recon',code:'01',title:'索敵・解析',en:'RECONNAISSANCE',hint:'敵性反応を捉え、次の判断へ。',items:['v27Detect','v27Scan']},
  {key:'facility',code:'02',title:'施設・兵站',en:'DEFENSE / LOGISTICS',hint:'選択施設の装甲・兵装・電力・修理。',items:['v27Armor','v27Turret','v27Power','v27Repair']},
  {key:'support',code:'03',title:'EVA支援',en:'EVA SUPPORT',hint:'電源接続と作戦条件を確認。',items:['v27Cable','v27Shot']},
  {key:'turn',code:'04',title:'作戦時間',en:'ADVANCE OPERATION',hint:'迎撃と敵接近が進行します。',items:['v27Advance']}
 ];
 const commandInfo={
  v27Detect:['新規敵性反応','新しい模擬敵性反応を検知。既存の施設損傷は維持されます。','待機中のみ実行可能'],
  v27Scan:['波形・A.T.分析','敵性波形の解析を進め、MAGI戦術審議に備えます。','防衛電力 12 / 都市主電源ON'],
  v27Armor:['装甲を展開','選択施設に防御装甲を展開します。','防衛電力 12 / 都市主電源ON'],
  v27Turret:['迎撃砲台を配備','選択施設にターン迎撃用の兵装を配備します。','資材 20 / 施設HP 25以上 / 地上3施設'],
  v27Power:['補助電力を投入','予備送電を使用して防衛電力を補充します。','予備送電 1'],
  v27Repair:['施設を応急修理','選択施設の損傷を修復します。','資材 18 / 施設HP +27（上限100）'],
  v27Cable:['EVA電源ケーブル','攻撃担当EVAのアンビリカルケーブルを接続・解除します。','接続時：電力 7 / 主電源ON / 作戦中・攻撃担当機出撃'],
  v27Shot:['EVA支援射撃','既存の出撃・作戦・MAGI・蓄電・照準条件を満たして支援射撃。','PHASE 04–05 / 充填70%以上 / 熱80%未満 / 照準・両MAGI承認'],
  v27Advance:['作戦時間を進める','迎撃砲が発砲し、敵が接近。施設の被弾・内部電源消費が発生し得ます。','作戦中のみ / 1ターン進行']
 };
 let actionCategory=null,actionId=null,opener=null,commsTimer=null,lastMessage='',soundHandled=false;
 const originalSound=sound;
 sound=function(kind){soundHandled=true;return originalSound(kind);};
 // Existing per-action sounds take precedence. Only silent controls get a fallback.
 document.addEventListener('click',()=>{soundHandled=false;},true);
 document.addEventListener('change',event=>{if(event.target.matches?.('select,input[type="range"]'))sound('select');});
 const rank=()=>S.ops.xp>=450?'COMMANDER':S.ops.xp>=220?'SECTION CHIEF':S.ops.xp>=90?'OPERATOR':'TRAINEE';
 function setText(id,value){$(id).textContent=value;}
 function updateProfile(){
  setText('hqProfileName',S.personnel.name);setText('hqProfileRank',rank()+' / '+S.ops.xp+' XP');
  setText('hqIdName',S.personnel.name);setText('hqIdDepartment',S.personnel.department);setText('hqIdRank',rank());
  setText('hqCommsFlag',S.prefs.hqComms?'ON':'OFF');setText('hqVoiceFlag',S.prefs.hqVoice?'ON':'OFF');
  $('hqCommsSwitch').setAttribute('aria-pressed',String(S.prefs.hqComms));$('hqVoiceSwitch').setAttribute('aria-pressed',String(S.prefs.hqVoice));
 }
 function openDialog(id,trigger){
  const dialog=$(id);opener=trigger||document.activeElement;
  if(!dialog.open)dialog.showModal();
  dialog.querySelector('button').focus();
 }
 function closeDialog(dialog){dialog.close();if(opener?.isConnected)opener.focus();}
 for(const dialog of [$('hqIdDialog'),$('hqActionDialog')]){
  dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))closeDialog(dialog);});
  dialog.addEventListener('cancel',()=>{if(opener?.isConnected)opener.focus();});
 }
 function blockedReason(id){
  const d=S.defense;
  if(id==='v27Cable'&&!d.connected){if(d.status!=='active')return '敵性反応を検知してください';if(S.evas[S.tactics.attacker].state!=='DEPLOYED')return '攻撃担当EVAが未出撃です';if(!S.infra.power||d.energy<7)return '主電源と防衛電力7が必要です';}
  if(id==='v27Shot'){
   if(d.status!=='active')return '迎撃対象がありません';
   if(S.mission.phase<4||S.mission.phase>5)return '作戦をPHASE 04–05まで進めてください';
   if(S.evas[S.tactics.attacker].state!=='DEPLOYED')return '攻撃担当EVAが未出撃です';
   if(S.magi.approvedFor!==S.tactics.attacker)return 'EVA出撃承認を確認してください';
   if(S.tactics.charge<70||S.tactics.heat>=80)return '充填70%以上・熱80%未満が必要です';
   if(!S.ops.currentMissionLocks)return '照準ロックが必要です';
   if(!d.magivote||d.magivote.filter(Boolean).length<2||d.magiround!==d.round)return '現ターンのMAGI戦術承認が必要です';
  }
  if(id==='v27Armor'&&!['active','idle'].includes(d.status))return '次の敵性反応を検知してから装甲を展開してください';
  if(['v27Scan','v27Armor'].includes(id)&&!S.infra.power)return '都市主電源を復旧してください';
  return $(id).disabled?'現在は実行できません。資材・設備・作戦状態をご確認ください。':'';
 }
 function renderCommands(){
  const container=$('hqActionContent');container.replaceChildren();
  $('hqActionBack').hidden=!actionCategory;setText('hqActionBack',actionId?'指令に戻る':'分類に戻る');setText('hqActionPath',!actionCategory?'01 / CATEGORY':!actionId?'02 / COMMAND':'03 / CONFIRM');
  if(!actionCategory){
   for(const c of categories){const button=document.createElement('button');button.className='hq-route';button.dataset.hqCategory=c.key;button.innerHTML=`<span>${c.code}</span><div><small>${c.en}</small><b>${c.title}</b><p>${c.hint}</p></div><i>↗</i>`;container.append(button);}
  }else if(!actionId){
   for(const id of actionCategory.items){const button=document.createElement('button');button.className='hq-route';button.dataset.hqCommand=id;button.innerHTML='<div><small>COMMAND / '+(blockedReason(id)?'HOLD':'READY')+'</small><b>'+commandInfo[id][0]+'</b></div><i>→</i>';container.append(button);}
  }else{
   const info=commandInfo[actionId],blocked=blockedReason(actionId),d=S.defense;
   container.innerHTML=`<section class="hq-command-detail"><small>SELECTED COMMAND / ${actionCategory.en}</small><h3>${info[0]}</h3><p>${info[1]}</p><div class="hq-command-cost"><small>必要条件 / REQUIREMENTS</small><b>${info[2]}</b></div><dl><dt>選択施設</dt><dd>${V27_FACILITY[d.selected].name}</dd><dt>防衛電力 / 資材</dt><dd>${d.energy}% / ${d.parts}</dd><dt>施設HP / 予備送電</dt><dd>${d.city[d.selected].hp}% / ${d.spares}</dd></dl><p class="hq-command-status ${blocked?'hold':''}" role="status">${blocked?'HOLD / '+blocked:'READY / 実行可能'}</p><button id="hqExecute" ${blocked?'disabled':''}>実行する / EXECUTE →</button></section>`;
  }
 }
 function showCommands(trigger){actionCategory=null;actionId=null;renderCommands();openDialog('hqActionDialog',trigger);}
 const firstTools=qs('#v27DefenseBoard .v27-tools');
 eHTML(firstTools,'beforebegin',`<section class="hq-command-launch"><div><small>COMMAND ROUTER / 3 STEPS</small><h3>次の行動を選択</h3><p>分類 → 指令 → 条件確認・実行</p></div><button id="hqCommandOpen">行動選択 <span>OPEN ROUTER ↗</span></button></section>`);
 // Keep the legacy controls available, including their IDs and original handlers.
 const quick=document.createElement('details');quick.className='hq-quick';const summary=document.createElement('summary');summary.textContent='クイック操作 / DIRECT COMMANDS';quick.append(summary);firstTools.before(quick);quick.append(firstTools);
 $('hqCommandOpen').addEventListener('click',event=>showCommands(event.currentTarget));
 $('hqActionBack').addEventListener('click',()=>{if(actionId)actionId=null;else actionCategory=null;renderCommands();$('hqActionContent').querySelector('button')?.focus();});
 $('hqActionContent').addEventListener('click',event=>{
  const category=event.target.closest('[data-hq-category]'),command=event.target.closest('[data-hq-command]');
  if(category){actionCategory=categories.find(c=>c.key===category.dataset.hqCategory);renderCommands();$('hqActionContent').querySelector('button')?.focus();}
  if(command){actionId=command.dataset.hqCommand;renderCommands();$('hqActionBack').focus();}
  if(event.target.closest('#hqExecute')){if(blockedReason(actionId)){renderCommands();sound('deny');return;}const target=$(actionId);closeDialog($('hqActionDialog'));target.click();}
 });
 function renderFeed(){
  const container=$('hqCommsFeed');container.replaceChildren();
  const feed=S.personnel.feed;
  if(!feed.length){const empty=document.createElement('p');empty.className='hq-note';empty.textContent='NO MESSAGES / 通信待機中';container.append(empty);}
  feed.forEach((entry,index)=>{
   const article=document.createElement('article');article.className='hq-message'+(entry.ack?' read':'');
   const header=document.createElement('header');const label=document.createElement('b');label.textContent=entry.kind==='broadcast'?'PA / 館内放送':'COMMS / 職員連絡';
   const time=document.createElement('time');time.textContent=hhmmss(entry.at);header.append(label,time);
   const source=document.createElement('small');source.textContent=entry.source;const text=document.createElement('p');text.textContent=entry.text;
   const ack=document.createElement('button');ack.dataset.hqAck=String(index);ack.textContent=entry.ack?'受領済み / ACKNOWLEDGED':'受領を確認 / ACK';ack.disabled=!!entry.ack;
   article.append(header,source,text,ack);container.append(article);
  });
  setText('hqUnread',feed.filter(x=>!x.ack).length+' NEW');
  setText('hqDispatchText',feed.length?((feed[0].kind==='broadcast'?'[館内放送] ':'[職員連絡] ')+feed[0].text):'本部通信待機中。館内放送・職員連絡はゲーム内の演出です。');
 }
 function receive(kind){
  const type=kind==='broadcast'?'broadcast':'radio';const candidates=messages[type].filter(x=>x[1]!==lastMessage);const selected=candidates[Math.floor(Math.random()*candidates.length)];lastMessage=selected[1];
  const entry={kind:type,source:selected[0],text:selected[1],at:Date.now(),ack:false};
  S.personnel.feed.unshift(entry);S.personnel.feed.length=Math.min(12,S.personnel.feed.length);persist();renderFeed();sound(type==='broadcast'?'select':'scan');
  if(S.prefs.sound&&S.prefs.hqVoice&&type==='broadcast'&&window.speechSynthesis&&window.SpeechSynthesisUtterance){
   try{window.speechSynthesis.cancel();const speech=new window.SpeechSynthesisUtterance('模擬館内放送。'+entry.text);speech.lang='ja-JP';speech.rate=.92;window.speechSynthesis.speak(speech);}catch(e){toast('読み上げを利用できません。通信ログをご確認ください。');}
  }
 }
 function schedule(){clearTimeout(commsTimer);commsTimer=null;if(!S.prefs.hqComms||document.hidden)return;
  commsTimer=setTimeout(()=>{if(!document.hidden&&S.prefs.hqComms&&!$('shell').classList.contains('hidden'))receive(Math.random()<.4?'broadcast':'radio');schedule();},65000+Math.floor(Math.random()*75000));
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)window.speechSynthesis?.cancel();schedule();});
 $('hqCommsSwitch').addEventListener('click',()=>{S.prefs.hqComms=!S.prefs.hqComms;persist();updateProfile();schedule();});
 $('hqVoiceSwitch').addEventListener('click',()=>{S.prefs.hqVoice=!S.prefs.hqVoice;if(!S.prefs.hqVoice)window.speechSynthesis?.cancel();persist();updateProfile();if(S.prefs.hqVoice)toast('効果音ON・対応端末で館内放送を読み上げます');});
 $('soundSwitch').addEventListener('click',()=>{if(!S.prefs.sound)window.speechSynthesis?.cancel();});
 document.addEventListener('click',event=>{
  const trigger=event.target.closest?.('[data-hq]');
  if(trigger){const action=trigger.dataset.hq;if(action==='personnel')go('tools');if(action==='id'){updateProfile();$('hqIdBack').hidden=true;$('hqIdFront').hidden=false;setText('hqFlipId','裏面を表示 / REVERSE');openDialog('hqIdDialog',trigger);}if(action==='close')closeDialog(trigger.closest('dialog'));if(action==='broadcast'||action==='radio')receive(action);}
  const ack=event.target.closest?.('[data-hq-ack]');if(ack){const entry=S.personnel.feed[Number(ack.dataset.hqAck)];if(entry){entry.ack=true;persist();renderFeed();$('hqCommsFeed').querySelector('button:not(:disabled)')?.focus();}}
 });
 $('hqFlipId').addEventListener('click',()=>{const back=$('hqIdBack');back.hidden=!back.hidden;$('hqIdFront').hidden=!back.hidden;setText('hqFlipId',back.hidden?'裏面を表示 / REVERSE':'表面を表示 / FRONT');});
 $('hqName').value=S.personnel.name;$('hqDepartment').value=S.personnel.department;
 $('hqProfileForm').addEventListener('submit',event=>{event.preventDefault();const name=$('hqName').value.trim(),department=$('hqDepartment').value.trim();if(!name||!department)return;S.personnel.name=name.slice(0,24);S.personnel.department=department.slice(0,32);persist();updateProfile();sound('ok');toast('端末内の架空職員情報を更新しました');});
 const previousDraw=draw;draw=function(){previousDraw();updateProfile();if($('hqActionDialog').open)renderCommands();};
 window.NERV_HQ_TEST={receive,schedule,blockedReason};
 document.addEventListener('click',event=>{
  const control=event.target.closest?.('button, a[href], [role="button"], input[type="checkbox"]');
  const submit=control?.matches('button[type="submit"],form button:not([type])');
  if(control&&!submit&&!control.disabled&&control.getAttribute('aria-disabled')!=='true'&&!soundHandled)sound('tap');
 });
 updateProfile();renderFeed();schedule();
}
initPersonnelTerminal();

})();
