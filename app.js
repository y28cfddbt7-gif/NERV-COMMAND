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
  if(action==='backupUpgrade'){try{const key='nerv-command-v2-before-visual-upgrade';if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(payload.state));return Promise.resolve({ok:true});}catch(e){return Promise.resolve({error:String(e)})}}
  if(action==='backupState'){try{localStorage.setItem('nerv-command-v2-before-alert-clear',JSON.stringify(payload.state));return Promise.resolve({ok:true});}catch(e){return Promise.resolve({error:String(e)})}}
  if(action==='clipboard')return navigator.clipboard?.writeText?navigator.clipboard.writeText(String(payload.text||'')).then(()=>({ok:true})).catch(e=>({error:String(e)})):Promise.resolve({error:'Clipboard unavailable'});
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
// Procedural electronic cues; no downloaded recordings or voice assets.
let soundBus=null, soundLimiter=null;
const soundVoices=new Set(), soundLastAt={};
const soundScore={
 tap:[[840,0,.045,'sine',.2,680],[1260,.04,.035,'sine',.13,1260]],
 select:[[360,0,.1,'triangle',.3,540],[720,.065,.14,'sine',.2,1080],[1440,.14,.08,'sine',.1,1200]],
 ok:[[520,0,.12,'sine',.32,520],[780,.09,.15,'sine',.26,780],[1040,.18,.28,'triangle',.2,1040]],
 warning:[[220,0,.22,'square',.16,180],[440,0,.22,'sine',.3,360],[220,.32,.26,'square',.16,180],[440,.32,.26,'sine',.3,360]],
 alarm:[[740,0,.36,'sawtooth',.13,480],[148,.02,.38,'sine',.38,110],[740,.46,.38,'sawtooth',.13,480],[148,.48,.4,'sine',.38,110],[980,.85,.17,'triangle',.18,660]],
 launch:[[70,0,.58,'sine',.36,240],[140,.12,.5,'sawtooth',.12,560],[440,.48,.2,'triangle',.22,880],[1320,.66,.22,'sine',.13,1760]],
 scan:[[1500,0,.085,'sine',.17,850],[1900,.11,.085,'sine',.16,1050],[2300,.22,.12,'triangle',.15,1400]],
 deny:[[260,0,.16,'triangle',.35,180],[195,.2,.22,'triangle',.32,120]],
 done:[[440,0,.38,'sine',.22,440],[554,.08,.4,'sine',.18,554],[660,.16,.44,'sine',.18,660],[880,.28,.5,'triangle',.16,880]]
};
function soundLevel(){return Math.max(0,Math.min(100,Number(S.prefs.soundVolume??55)||0))/100*.22;}
function prepareSound(){
 const Context=window.AudioContext||window.webkitAudioContext;
 if(!Context)return false;
 if(!audio){audio=new Context();soundBus=audio.createGain();soundLimiter=audio.createDynamicsCompressor();
  soundLimiter.threshold.value=-18;soundLimiter.knee.value=18;soundLimiter.ratio.value=8;
  soundBus.connect(soundLimiter);soundLimiter.connect(audio.destination);}
 soundBus.gain.setTargetAtTime(soundLevel(),audio.currentTime,.025);
 if(audio.state==='suspended'){const resumed=audio.resume();if(resumed?.catch)resumed.catch(()=>{});}
 return true;
}
function stopSound(){
 for(const voice of soundVoices){try{voice.stop();}catch(e){}}
 soundVoices.clear();
}
function sound(kind='tap'){
 if(!S.prefs.sound||document.hidden)return;
 const now=Date.now(),gap=kind==='alarm'?1400:kind==='warning'?300:55;
 if(soundLastAt[kind]!=null&&now-soundLastAt[kind]<gap)return;
 try{
  if(!prepareSound())return;
  soundLastAt[kind]=now;
  const start=audio.currentTime;
  for(const [frequency,offset,duration,wave,gain,end] of soundScore[kind]||soundScore.tap){
   if(soundVoices.size>=24)break;
   const oscillator=audio.createOscillator(),envelope=audio.createGain(),at=start+offset;
   oscillator.type=wave;oscillator.frequency.setValueAtTime(frequency,at);
   oscillator.frequency.exponentialRampToValueAtTime(end,at+duration);
   envelope.gain.setValueAtTime(.0001,at);envelope.gain.exponentialRampToValueAtTime(gain,at+.012);
   envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);
   oscillator.connect(envelope);envelope.connect(soundBus);soundVoices.add(oscillator);
   oscillator.onended=()=>{soundVoices.delete(oscillator);oscillator.disconnect();envelope.disconnect();};
   oscillator.start(at);oscillator.stop(at+duration+.025);
  }
 }catch(e){console.warn('audio',e)}
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
function browserWeather(){return new Promise(resolve=>{if(!navigator.geolocation)return resolve({error:'このブラウザでは位置情報を利用できません'});navigator.geolocation.getCurrentPosition(async p=>{try{const lat=p.coords.latitude,lon=p.coords.longitude;const resp=await fetch(weatherUrl(lat,lon));if(!resp.ok)throw Error('HTTP '+resp.status);const raw=await resp.json();resolve({weather:raw,place:'現在地',position:{lat,lon},updated:Date.now()});}catch(e){resolve({error:'通信エラー: '+e.message});}},e=>resolve({error:'位置情報エラー: '+e.message}),{timeout:12000,enableHighAccuracy:false,maximumAge:300000});});}
function applyWeather(result){if(!result?.weather?.current||!result.weather.hourly){toast('気象データが不正です');return false;}S.weather={raw:result.weather,place:result.place||'現在地',updated:result.updated||Date.now(),position:result.position||null};persist();renderWeather();renderHome();if(typeof meteoMapMode!=='undefined'&&meteoMapMode==='me'&&weatherPosition())meteoSetRegion('me');meteoUpdateRegions(true);return true;}
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

let weatherEntryAttempted=false;
function weatherPosition(){const lat=S.weather?.position?.lat??S.weather?.raw?.latitude, lng=S.weather?.position?.lon??S.weather?.raw?.longitude;return Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180?{lat,lng}:null;}
function weatherOnEntry(){if(weatherEntryAttempted)return;weatherEntryAttempted=true;if(busyWeather)return;loadWeather();}
function renderBattery(){const meter=$('deviceBatteryMeter'),known=Number.isFinite(battery);if(meter){meter.dataset.known=String(known);if(known)meter.setAttribute('aria-valuenow',String(Math.max(0,Math.min(100,battery))));else meter.removeAttribute?.('aria-valuenow');}meteoText('homeBattery',known?Math.round(Math.max(0,Math.min(100,battery)))+'%':'--%');meteoText('batterySub',known?(charging?'充電中':'バッテリー残量'):'取得できません');if($('batteryFill'))$('batteryFill').style.width=known?Math.max(0,Math.min(100,battery))+'%':'0%';}
function renderHome(){renderBattery();renderLauncher();}
function renderInfra(){const a=S.infra,ready=40+ (a.power?25:0)+(a.comms?20:0)+(a.armor?15:0);$('cityReady').textContent=ready+'%';$('cityPower').textContent=a.power?'ON':'OFF';$('cityArmor').textContent=a.armor?'CLOSED':'OPEN';$('powerState').textContent=a.power?'主電源供給中':'主電源停止';$('armorState').textContent=a.armor?'装甲閉鎖済':'装甲開放中';$('commsState').textContent=a.comms?'通信回線正常':'通信回線断';$('infraAlert').textContent=a.power&&a.comms?'NOMINAL':'ALERT';$('infraAlert').style.color=a.power&&a.comms?'#88dcaa':'#ff5353';renderLogs('infra');}
function invalidateApproval(){if(S.magi.approvedFor!==null){addLog('magi','インフラ状態変更：既存の出撃承認を失効');}S.magi.approvedFor=null;S.magi.vote=null;S.magi.interceptApproval=null;if(S.defense){S.defense.magivote=null;S.defense.magiround=-1;}}
['power','armor','comms'].forEach(key=>{$(key+'Toggle').addEventListener('click',()=>{settleEvaPower();S.infra[key]=!S.infra[key];if(key==='power')S.evas.forEach(e=>{if(e.state==='DEPLOYED')e.powerUpdatedAt=Date.now();});invalidateApproval();addLog('infra',key.toUpperCase()+' / '+(S.infra[key]?'ONLINE':'OFFLINE'));renderInfra();renderEVA();renderMAGI();renderHome();renderTacticalAlert();sound(S.infra[key]?'ok':'warning');toast(key.toUpperCase()+' を '+(S.infra[key]?'有効':'無効')+' に変更');});});
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
  if(evaExternalPower(i)){e.powerUpdatedAt=now;return;}
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
 const shell=qs('.eva-display'),figure=$('evaArtwork');shell.dataset.unit=String(idx);shell.dataset.state=e.state;figure.dataset.unit=String(idx);if(qs('.eva-redrawn'))qs('.eva-redrawn').dataset.unit=String(idx);figure.dataset.state=e.state;
 figure.classList.toggle('at-on',isSortie&&e.at);
 $('evaSvg').setAttribute('aria-label','EVANGELION UNIT-0'+idx+' / '+EVA_NAMES[idx]+' / '+e.state+' / 生体機体全身スキャン');
 $('evaUnitLabel').textContent='EVANGELION UNIT-0'+idx;
 $('evaUnitDesignation').textContent=EVA_NAMES[idx]+' / UNIT-0'+idx;
 $('evaPaintMode').textContent=['AZURE / PROTOTYPE','VIOLET / TEST TYPE','SCARLET / PRODUCTION'][idx];
 $('evaTargetLock').textContent=e.state==='DEPLOYED'?'TRACKING / ACTIVE':'RESERVE / SECURE';
 $('evaNumSync').textContent=Number(e.sync).toFixed(1)+'%';$('evaNumMode').textContent=e.state==='DEPLOYED'?'ARMED / FIELD READY':'BIO-SCAN / STANDBY';
 $('evaFigureStamp').textContent='UNIT-0'+idx+' / BIO-MONITOR';
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
 DEPLOYED:evaExternalPower(idx)?'外部給電中。内部電源を温存しています。機体点検・給電でケーブルを操作できます。':'内部電源で稼働中。'+(e.at?'2秒/秒（A.T.展開中）':'1秒/秒')+'で消費。機体点検・給電で外部給電へ切り替えられます。',
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
   e.state='DEPLOYED';e.umbilical=false;if(unit===S.tactics?.attacker&&S.defense)S.defense.connected=false;e.power=300;e.powerUpdatedAt=Date.now();e.at=false;S.magi.approvedFor=null;S.magi.vote=null;
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
 {name:'BALTHASAR',yes:i.power&&e.state==='READY',reason:e.state==='READY'?'機体の発進準備完了':'EVA管理で発進準備が必要'},
 {name:'CASPER',yes:i.armor&&i.comms,reason:i.armor&&i.comms?'都市防護・通信を確保':'都市装甲または通信の確認が必要'},
 {name:'MELCHIOR',yes:i.power&&e.power>=240,reason:i.power&&e.power>=240?'主電源・機体電力が正常':'主電源または機体電力が不足'}];}
function staffInterceptVotes(){const t=S.tactics,d=S.defense;return [
 {name:'BALTHASAR',yes:S.evas[t.attacker].state==='DEPLOYED'&&S.evas[t.attacker].power>=60,reason:S.evas[t.attacker].state!=='DEPLOYED'?'攻撃担当機の出撃が必要':S.evas[t.attacker].power>=60?'出撃済み・機体電力に余裕あり':'機体電力が60秒未満 / 安全余力が不足'},
 {name:'CASPER',yes:!!(S.infra.comms&&d?.status==='active'&&d.scans>=34),reason:S.infra.comms&&d?.status==='active'&&d.scans>=34?'目標・通信を確認':'目標検知・解析・通信の確認が必要'},
 {name:'MELCHIOR',yes:!!(S.infra.power&&t.charge>=70&&t.heat<80&&S.ops?.currentMissionLocks>0),reason:S.infra.power&&t.charge>=70&&t.heat<80&&S.ops?.currentMissionLocks>0?'迎撃電力・照準・熱負荷が正常':'迎撃電力70%以上・照準確定・冷却が必要'}];}
function staffInterceptApproved(){if(magiIntrusionActive())return false;const a=S.magi.interceptApproval,d=S.defense,t=S.tactics;if(!d||!t)return false;return !!(a?.approved&&a.caseNo===d?.caseNo&&a.round===d.round&&a.attacker===t.attacker&&S.magi.approvedFor===t.attacker&&d.magivote?.filter(Boolean).length>=2&&d.magiround===d.round&&S.infra.power&&S.infra.comms&&d.status==='active'&&d.scans>=34&&S.evas[t.attacker].state==='DEPLOYED'&&t.charge>=70&&t.heat<80&&S.ops?.currentMissionLocks>0);}
function renderMAGI(){
 const purpose=S.magi.purpose||'sortie',intercept=purpose==='intercept';
 const v=S.magi.vote,valid=v&&v.eva===S.selectedEva&&(v.purpose||'sortie')===purpose;
 const codes={BALTHASAR:'B',CASPER:'C',MELCHIOR:'M'};
 for(const name of Object.keys(codes)){const vote=valid?v.votes.find(x=>x.name===name):null;meteoText('m'+codes[name]+'Status',vote?(vote.yes?'賛成':'否決'):'待機');meteoText('m'+codes[name]+'Sub',vote?vote.reason:({BALTHASAR:'機体・人員の安全を評価',CASPER:'作戦の成立条件を評価',MELCHIOR:'技術条件を評価'}[name]));const cell=$('m'+codes[name]+'Status')?.parentElement;if(cell)cell.dataset.vote=vote?(vote.yes?'approved':'denied'):'pending';}
 const expired=valid&&v.approved&&intercept&&!staffInterceptApproved();
 meteoText('magiLiveState',expired?'承認失効 / 再審議':valid?(v.approved?'承認':'否決'):'審議待ち');
 if($('magiDecision'))$('magiDecision').dataset.decision=expired?'expired':valid?(v.approved?'approved':'denied'):'pending';
 meteoText('magiDecision',valid?(expired?'承認失効 / 再審議':v.approved?'承認':'否決')+' / '+v.count+'対'+(3-v.count)+'\n'+(intercept?'迎撃実行':'UNIT-0'+v.eva+' 出撃')+'\n'+(v.blockers?.length?'未達条件：'+v.blockers.join(' / '):'必要な運用条件を確認しました。'):'審議内容と対象を選び、「決議を実行」を押してください。');
 const reasonList=$('magiReasons');if(reasonList){reasonList.replaceChildren();if(valid)for(const vote of v.votes){const li=document.createElement('li');li.textContent=vote.name+'：'+vote.reason;reasonList.append(li);}}
 const purposeEl=$('magiPurpose');if(purposeEl)purposeEl.value=purpose;
 const unitEl=$('magiUnit');if(unitEl){unitEl.value=String(intercept?(S.tactics?.attacker??1):S.selectedEva);unitEl.disabled=intercept;}
 meteoText('magiRequestHint',intercept?'戦術指揮で電力・出撃・照準を準備してから迎撃実行を審議します。対象は攻撃担当機です。':'EVA管理で対象機を発進準備 → ここで決議 → EVA管理で出撃、の順に操作します。');
 meteoText('magiReturn',intercept?'戦術指揮へ戻る ↗':'EVA運用へ戻る ↗');renderLogs('magi');
}
$('magiVote').addEventListener('click',()=>{
 if(magiIntrusionActive()){toast('MAGI侵食中 / 侵入対処で復旧してください。通常の承認は停止中です。');return;}
 settleEvaPower();const purpose=S.magi.purpose||'sortie';if(purpose==='intercept')S.selectedEva=S.tactics.attacker;
 const unit=S.selectedEva,votes=purpose==='intercept'?staffInterceptVotes():voteInfo(),count=votes.filter(v=>v.yes).length;
 const blockers=[];if(!S.infra.power)blockers.push('主電源の復旧');if(!S.infra.comms)blockers.push('通信の復旧');
 if(purpose==='sortie'&&selected().state!=='READY')blockers.push('対象機の発進準備');
 if(purpose==='intercept'){
  if(S.evas[S.tactics.attacker].state!=='DEPLOYED')blockers.push('攻撃担当機の出撃');
  if(S.defense?.status!=='active'||S.defense.scans<34)blockers.push('迎撃対象の検知・解析');
  if(S.tactics.charge<70||S.tactics.heat>=80||!(S.ops.currentMissionLocks>0))blockers.push('迎撃電力70%以上・照準確定・冷却');
  if(![4,5].includes(S.mission.phase))blockers.push('戦術指揮で迎撃準備を進めてください');
 }
 const approved=count>=2&&blockers.length===0;
 playSequence('magi','MAGIシステム',purpose==='intercept'?'迎撃実行承認':'UNIT-0'+unit+' / 出撃承認',
 ['MELCHIOR-1 / 技術評価','BALTHASAR-2 / 安全評価','CASPER-3 / 作戦評価','CONSENSUS / 決議確定'],()=>{
  S.magi.vote={votes,count,approved,eva:unit,purpose,blockers,time:Date.now()};S.magi.approvedFor=approved?unit:null;
  if(purpose==='intercept'){
   S.magi.interceptApproval={approved,attacker:unit,caseNo:S.defense.caseNo,round:S.defense.round};
   S.defense.magivote=votes.map(v=>v.yes);S.defense.magiround=S.defense.round;
  }
  addLog('magi',(purpose==='intercept'?'迎撃実行':'UNIT-0'+unit+' 出撃')+' / '+(approved?'承認':'否決')+' / '+count+'対'+(3-count));
  sound(approved?'ok':'deny');draw();
 },votes);
});
if(qs('#magiPurpose')){
 $('magiPurpose').addEventListener('change',e=>{S.magi.purpose=e.target.value;staffInvalidateDecision();if(e.target.value==='intercept')S.selectedEva=S.tactics.attacker;persist();draw();});
 $('magiUnit').addEventListener('change',e=>{S.selectedEva=Number(e.target.value);renderMAGI();persist();});
 $('magiReturn').addEventListener('click',()=>go(S.magi.purpose==='intercept'?'mission':'eva'));
}
const staffStageNames=['待機','都市防護','迎撃電力','EVA出撃','目標解析','迎撃判断','作戦完了'];
function renderMission(){
 if(!S.tactics||!S.ops||![0,1,2].includes(S.tactics.attacker))return;
 const p=S.mission.phase,d=S.defense,t=S.tactics,active=d?.status==='active';
 const checks=[['都市の主電源・通信・装甲',S.infra.power&&S.infra.comms&&S.infra.armor],['迎撃電力70%以上',t.charge>=70],['攻撃担当 UNIT-0'+t.attacker+' の出撃',S.evas[t.attacker].state==='DEPLOYED'],['対象の解析・照準確定',active&&d.scans>=34&&S.ops.currentMissionLocks>0],['今回の迎撃に対するMAGI承認',staffInterceptApproved()]];
 const explanations=['敵性反応の検知から迎撃まで、必要な指示を順番に出します。','都市装甲を展開し、防衛態勢へ移行します。','迎撃に必要な電力を集約します。','EVA管理で発進準備、MAGIの出撃承認、出撃を実行してください。','対象の波形を解析し、照準を確定します。','条件を確認してMAGIへ迎撃実行を申請します。承認後に迎撃できます。','迎撃結果は都市防衛と指揮記録に保存されています。終了すると正常待機へ戻ります。'];
 let action=['訓練を開始','都市防護を展開','迎撃電力を確保','EVA管理へ / 出撃を確認','目標を解析・照準確定','迎撃を実行','作戦完了'][p]||'状況を確認';
 if(p===3&&S.evas[t.attacker].state==='DEPLOYED')action='出撃を確認して次へ';
 if(p===5){if(!active)action='対象を再検知';else if(t.charge<70)action='迎撃電力を再確保';else if(!staffInterceptApproved())action='MAGIに迎撃承認を申請';}
 meteoText('missionStep',String(p).padStart(2,'0')+' / '+staffStageNames[p]);meteoText('missionDescription',explanations[p]);meteoText('missionReady',p===0?'正常待機':p===6?'迎撃終了':'作戦進行中');
 meteoText('staffTarget',active?d.enemy.code+' / 残存 '+d.enemy.hp:d?.status==='victory'?'目標沈黙':'未検知');meteoText('staffCity',d?Math.round(d.city.reduce((n,c)=>n+c.hp,0)/4)+'%':'--');
 meteoText('staffAttacker','UNIT-0'+t.attacker+' / '+stateJP[S.evas[t.attacker].state]);meteoText('staffCharge',t.charge+'%');
 meteoText('staffNextHint',p===5?checks.filter(x=>!x[1]).map(x=>'要確認：'+x[0]).join(' / ')||'すべての必須条件が成立。迎撃を実行できます。':explanations[p]);
 meteoText('missionAction',action);$('missionAction').disabled=p===6;
 const list=$('staffChecklist');if(list?.replaceChildren){list.replaceChildren();for(const [text,ok] of checks){const row=document.createElement('li');row.textContent=(ok?'確認済：':'未完了：')+text;row.dataset.complete=String(ok);list.append(row);}}
 if($('staffAttackUnit'))$('staffAttackUnit').value=String(t.attacker);renderLogs('mission');
}
$('missionAction').addEventListener('click',()=>{
 const p=S.mission.phase,t=S.tactics;
 if(!S.infra.power||!S.infra.comms){toast('主電源・通信の異常を復旧するか、警報確認からクリアしてください。');go('infra');return;}
 if(p===0){if(S.defense.status!=='active')v27Detect();S.mission.phase=1;S.ops.currentMissionLocks=0;S.ops.missionAwarded=false;staffInvalidateDecision();addLog('mission','都市防衛・迎撃訓練を開始');}
 else if(p===1){S.infra.armor=true;staffInvalidateDecision();S.mission.phase=2;addLog('mission','都市装甲を展開 / 防護態勢確保');}
 else if(p===2){t.charge=80;t.heat=0;staffInvalidateDecision();S.mission.phase=3;addLog('mission','迎撃電力を80%確保');}
 else if(p===3){if(S.evas[t.attacker].state!=='DEPLOYED'){S.selectedEva=t.attacker;S.magi.purpose='sortie';go('eva');return;}S.mission.phase=4;addLog('mission','UNIT-0'+t.attacker+' の出撃を確認');}
 else if(p===4){
  if(S.defense.status!=='active'){v27Detect();}
  const scans=Math.max(0,Math.ceil((68-S.defense.scans)/34));
  if(S.defense.energy<scans*12){toast('都市防衛の予備送電で解析用の電力を確保してください。');go('infra');return;}
  for(let i=0;i<scans;i++)v27Scan();S.ops.currentMissionLocks=1;S.ops.locks++;t.scans=Math.max(t.scans,2);S.mission.phase=5;staffInvalidateDecision();addLog('mission','対象の波形解析・照準を確定');
 }else if(p===5){
  if(S.defense.status!=='active'){v27Detect();staffInvalidateDecision();draw();return;}
  if(t.charge<70){t.charge=80;t.heat=Math.max(0,t.heat-20);staffInvalidateDecision();addLog('mission','迎撃電力を再確保 / MAGI再審議が必要');draw();return;}
  if(!staffInterceptApproved()){staffMagiRequest('intercept');return;}
  const before=S.defense.enemy.hp;v27Shot();
  if(S.defense.enemy.hp<before){t.shots++;staffInvalidateDecision();addLog('mission','迎撃実行 / 目標残存 '+S.defense.enemy.hp);}
  if(S.defense.status==='victory'){S.mission.phase=6;if(!S.ops.missionAwarded){S.ops.missions++;S.ops.missionAwarded=true;}addLog('mission','迎撃完了 / 作戦記録を保存');}
 }
 sound('ok');draw();
});
$('missionReset').addEventListener('click',()=>openAlertReview('end'));
function renderTasks(){const list=$('taskList');list.replaceChildren();S.tasks.forEach(t=>{const item=document.createElement('div');item.className='task-line'+(t.done?' complete':'');const ch=document.createElement('button');ch.className='task-check';ch.textContent=t.done?'✓':'□';ch.setAttribute('aria-label','タスク完了状態を切り替え');ch.addEventListener('click',()=>{t.done=!t.done;persist();renderTasks();renderHome();sound(t.done?'ok':'tap');});const title=document.createElement('span');title.className='task-title';title.textContent=t.text;const del=document.createElement('button');del.className='task-delete';del.textContent='×';del.setAttribute('aria-label','タスク削除');del.addEventListener('click',()=>{S.tasks=S.tasks.filter(x=>x.id!==t.id);persist();renderTasks();renderHome();sound('tap')});item.append(ch,title,del);list.append(item);});if(!S.tasks.length){list.innerHTML='<div class="empty">タスクはまだありません。追加すると端末に保存されます。</div>';}const n=S.tasks.filter(t=>!t.done).length;$('tasksSummary').textContent=n+' OPEN / '+(S.tasks.length-n)+' COMPLETED';}
$('taskForm').addEventListener('submit',e=>{e.preventDefault();const input=$('taskInput'),val=input.value.trim();if(!val){toast('タスク名を入力してください');return;}if(S.tasks.length>=80){toast('登録できるタスクは最大80件です');return;}S.tasks.unshift({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),text:val.slice(0,80),done:false});input.value='';persist();renderTasks();renderHome();sound('ok');});
function timerRender(){const m=Math.floor(Math.max(0,focus.remaining)/60),s=Math.max(0,focus.remaining)%60;$('timerTime').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');$('timerCircle').style.strokeDashoffset=427.256*(1-Math.max(0,focus.remaining)/focus.length);$('timerStart').textContent=focus.running?'Ⅱ 一時停止':focus.remaining===0?'▶ 再開':'▶ '+(focus.remaining===focus.length?'開始':'再開');}
all('[data-min]').forEach(btn=>btn.addEventListener('click',()=>{const min=Number(btn.dataset.min);focus={length:min*60,remaining:min*60,deadline:0,running:false};all('[data-min]').forEach(el=>el.classList.toggle('active',el===btn));timerRender();sound('tap');}));
$('timerStart').addEventListener('click',()=>{if(focus.running){focus.remaining=Math.max(0,Math.ceil((focus.deadline-Date.now())/1000));focus.running=false;}else{if(focus.remaining<=0)focus.remaining=focus.length;focus.deadline=Date.now()+focus.remaining*1000;focus.running=true;}timerRender();sound('tap');});
$('timerReset').addEventListener('click',()=>{focus.remaining=focus.length;focus.running=false;focus.deadline=0;timerRender();sound('tap');});
/* v2.4 METEO COMMAND / data is real or explicitly unavailable */
const meteoRegions=[['TOKYO','東京',35.6762,139.6503],['HAKONE','箱根',35.2329,139.1046],['YOKOHAMA','横浜',35.4437,139.638],['OSAKA','大阪',34.6937,135.5023]];
let meteoRegionValues=null,meteoRegionAt=0,meteoRegionPending=false;
let meteoMapCenter={lat:0,lng:0},meteoMapZoom=7,meteoMapMode='me',meteoMapLoaded=false;
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
function meteoPaintMap(base=true){if(currentPage!=='weather')return;if(meteoMapMode==='me'&&!weatherPosition()){meteoText('meteoMapWarning','現在地未取得 / 位置情報の許可と気象更新が必要です');$('meteoMapWarning').classList.remove('hidden');return;}meteoMapLoaded=meteoMapLoaded&& !base;if(base)meteoTileGrid($('meteoBaseTiles'),'base');meteoTileGrid($('meteoRainTiles'),'rain');const f=meteoRadarManifest?.radar?.past?.[meteoRadarFrame];meteoText('meteoRadarTime',f?new Date(f.time*1000).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}):'--:--');}
function meteoRadarTimeline(){const el=$('meteoRadarFrames');el.replaceChildren();const arr=meteoRadarManifest?.radar?.past||[];if(!arr.length){el.textContent='観測データ待機';return;}arr.slice(-8).forEach((f,k)=>{const actual=arr.length-Math.min(8,arr.length)+k,btn=document.createElement('button');btn.type='button';btn.textContent=new Date(f.time*1000).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}).slice(-5);btn.className=actual===meteoRadarFrame?'active':'';btn.addEventListener('click',()=>{meteoRadarFrame=actual;meteoPaintMap(false);meteoRadarTimeline();});el.append(btn)})}
async function meteoLoadRadar(force=false){if(!force&&meteoRadarManifest&&Date.now()-meteoRadarLastFetch<600000){meteoPaintMap(false);return;}
 meteoText('meteoRadarStatus','RAINVIEWER / CONNECTING');try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),11000);let res;try{res=await fetch('https://api.rainviewer.com/public/weather-maps.json',{signal:controller.signal,cache:'no-store'});}finally{clearTimeout(timeout)}if(!res.ok)throw Error('HTTP '+res.status);const json=await res.json();if(!Array.isArray(json?.radar?.past)||!json.radar.past.length||!/^https:\/\//.test(json.host||''))throw Error('Radar dataset unavailable');meteoRadarManifest=json;meteoRadarLastFetch=Date.now();meteoRadarFrame=json.radar.past.length-1;meteoText('meteoRadarUpdated','OBSERVED / 10min HISTORY');meteoText('meteoRadarStatus','RAINVIEWER / 観測済み降雨エコー');meteoPaintMap(false);meteoRadarTimeline();}catch(e){meteoRadarManifest=null;meteoRadarFrame=0;meteoText('meteoRadarStatus','レーダーに接続できません / 地図のみ');meteoText('meteoRadarUpdated','RADAR OFFLINE');meteoRadarTimeline();}}
function meteoRadarPlayToggle(){meteoRadarPlaying=!meteoRadarPlaying;meteoText('meteoRadarPlay',meteoRadarPlaying?'Ⅱ 停止':'▶ 再生');if(meteoRadarInterval)clearInterval(meteoRadarInterval);meteoRadarInterval=null;if(meteoRadarPlaying){meteoRadarInterval=setInterval(()=>{if(currentPage!=='weather'||document.hidden||!S.prefs.motion)return;const n=meteoRadarManifest?.radar?.past?.length||0;if(n){meteoRadarFrame=(meteoRadarFrame+1)%n;meteoPaintMap(false);meteoRadarTimeline();}},1600);}}
function meteoEnter(){meteoClockUpdate();if(meteoMapMode==='me'&&weatherPosition())meteoSetRegion('me');else meteoPaintMap(true);meteoLoadRadar();meteoUpdateRegions();weatherOnEntry();}
function meteoSetRegion(key){meteoMapMode=key;if(key==='hakone'){meteoMapCenter={lat:35.2329,lng:139.1046};meteoMapZoom=7;meteoText('meteoMapMark','△ TOKYO-3 / HAKONE');}
 else if(key==='kanto'){meteoMapCenter={lat:35.67,lng:139.65};meteoMapZoom=7;meteoText('meteoMapMark','△ TOKYO / KANTO');}
 else if(key==='me'){const pos=weatherPosition(),lat=pos?.lat,lng=pos?.lng;if(!Number.isFinite(lat)||!Number.isFinite(lng)){meteoText('meteoMapMark','⊕ 現在地 / 取得待機');$('meteoBaseTiles').replaceChildren();$('meteoRainTiles').replaceChildren();all('[data-radar-region]').forEach(btn=>btn.classList.toggle('active',btn.dataset.radarRegion==='me'));meteoPaintMap(true);toast('現在地は天気を更新してから選択できます');return;}meteoMapCenter={lat,lng};meteoMapZoom=7;meteoText('meteoMapMark','⊕ 現在地 / LOCAL');}
 all('[data-radar-region]').forEach(btn=>btn.classList.toggle('active',btn.dataset.radarRegion===key));meteoPaintMap(true);sound('scan');}
all('[data-radar-region]').forEach(btn=>btn.addEventListener('click',()=>meteoSetRegion(btn.dataset.radarRegion)));
$('meteoZoomIn').addEventListener('click',()=>{meteoMapZoom=Math.min(7,meteoMapZoom+1);meteoPaintMap(true);});
$('meteoZoomOut').addEventListener('click',()=>{meteoMapZoom=Math.max(4,meteoMapZoom-1);meteoPaintMap(true);});
$('meteoRadarPrev').addEventListener('click',()=>{const n=meteoRadarManifest?.radar?.past?.length||0;if(!n)return;meteoRadarFrame=(meteoRadarFrame+n-1)%n;meteoPaintMap(false);meteoRadarTimeline();});
$('meteoRadarNext').addEventListener('click',()=>{const n=meteoRadarManifest?.radar?.past?.length||0;if(!n)return;meteoRadarFrame=(meteoRadarFrame+1)%n;meteoPaintMap(false);meteoRadarTimeline();});
$('meteoRadarPlay').addEventListener('click',meteoRadarPlayToggle);
all('[data-meteo-jump]').forEach(el=>el.addEventListener('click',()=>{$(el.dataset.meteoJump).scrollIntoView({behavior:S.prefs.motion?'smooth':'instant',block:'start'});sound('tap');}));
window.addEventListener('resize',()=>{if(currentPage==='weather')meteoPaintMap(true)});

function tick(){if(typeof renderPersonnel==='function')renderPersonnel();meteoClockUpdate();const d=new Date();$('topClock').textContent=d.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});meteoText('deviceTime',d.toLocaleString('ja-JP'));
 if(focus.running){focus.remaining=Math.max(0,Math.ceil((focus.deadline-Date.now())/1000));if(focus.remaining===0){focus.running=false;sound('done');toast('集中タイマー終了。お疲れさま！');}timerRender();}
 const changed=settleEvaPower();if((S.evas.some(e=>e.state==='DEPLOYED')||changed)&&currentPage==='eva')renderEVA();if(changed)renderTacticalAlert();if(qs('#staffSupport'))renderCommandStreams();
}
$('soundSwitch').addEventListener('click',()=>{S.prefs.sound=!S.prefs.sound;persist();renderSettings();if(S.prefs.sound)sound('ok');else stopSound();});
$('autoWeatherSwitch').addEventListener('click',()=>{S.prefs.autoWeather=!S.prefs.autoWeather;persist();renderSettings();sound('tap');});
$('motionSwitch').addEventListener('click',()=>{S.prefs.motion=!S.prefs.motion;persist();renderSettings();sound('tap');});
$('bootSwitch').addEventListener('click',()=>{S.prefs.showBoot=!S.prefs.showBoot;persist();renderSettings();sound('tap');});
$('clearTasks').addEventListener('click',()=>{const num=S.tasks.length;S.tasks=S.tasks.filter(t=>!t.done);const removed=num-S.tasks.length;persist();renderTasks();renderHome();toast(removed+'件の完了タスクを削除');sound('tap');});
$('resetSim').addEventListener('click',()=>openAlertReview('end'));
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
async function ensureMap(){if(qs('[data-page="infra"] [data-view="geography"]')?.hidden)return;if(mapObj){setTimeout(()=>mapObj.resize(),90);return;}if(mapReady)return;mapReady=true;mapNote('地図ライブラリを接続しています…');
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
 for(const core of all('.sequence-magi-core')){core.dataset.vote='pending';core.querySelector('b').textContent='待機';}
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
   const vote=detail.find(v=>v.name===['MELCHIOR','BALTHASAR','CASPER'][at]);
   if(vote){const core=qs('.sequence-magi-core[data-core="'+vote.name+'"]');if(core){core.dataset.vote=vote.yes?'approved':'denied';core.querySelector('b').textContent=vote.yes?'賛成':'否決';}}
   if(vote){const node=$('magiTrack'+at);if(node){node.className=vote.yes?'accepted':'denied';node.querySelector('small').textContent=vote.yes?'APPROVE':'DENY';}if($('magiProgress'))$('magiProgress').style.width=((at+1)/detail.length*100)+'%';}
  }
  at++;
  sequenceTimer=setTimeout(step,kind==='magi'?690:620);
 }
 sound(kind==='magi'?'scan':kind==='launch'?'launch':'select');step();return true;
}
function cancelSequence(){clearTimeout(sequenceTimer);sequenceTimer=null;finishSequence=null;sequenceBusy=false;document.body.classList.remove('sequence-active');const overlay=$('sequenceOverlay');if(overlay){overlay.classList.add('hidden');overlay.setAttribute('aria-hidden','true');}}
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
 const critical=!S.infra.power||!S.infra.comms||S.evas.some(e=>e.state==='POWER_LOST')||magiIntrusionActive();
 const watch=!critical&&S.mission.phase>0&&S.mission.phase<6;
 const level=critical?'critical':watch?'watch':'nominal';
 document.body.dataset.alert=level;
 const ribbon=$('globalAlert'),flag=$('globalAlertFlag'),desc=$('globalAlertText');
 ribbon.classList.toggle('hidden',!critical&&!watch);ribbon.dataset.level=level;
 if(critical){flag.textContent='EMERGENCY';desc.textContent=!S.infra.power?'都市電力供給停止 / 補助系統を確認':!S.infra.comms?'作戦通信系統断 / COMMS OFFLINE':magiIntrusionActive()?'MAGI侵食検知 / 侵入対処が必要':'EVA内部電源喪失 / 回収要請';}
 else if(watch){flag.textContent='TACTICAL';desc.textContent='模擬作戦進行中 / PHASE '+String(S.mission.phase).padStart(2,'0');}
 $('telemetryAlarm').textContent=level==='critical'?'CRITICAL':level==='watch'?'TACTICAL':'NOMINAL';
 $('telemetryAlarm').style.color=critical?'#ff7976':watch?'#ffc171':'#9bf7bd';
 meteoText('heroTacticalState',critical?'EMERGENCY / SIM':watch?'OPERATION ACTIVE':'READY / STANDBY');
 meteoText('homeSignalCity',S.infra.power&&S.infra.comms?'ONLINE':'CHECK');
 meteoText('homeSignalEva',S.evas.filter(e=>e.state==='DEPLOYED').length+' ACTIVE');
 meteoText('homeSignalMission','PHASE '+String(S.mission.phase).padStart(2,'0'));
}

if(!S.prefs.showBoot){openApp(false)}
window.NERV_TEST={meteoRisk:()=>$('meteoRiskRows').textContent,meteoRadar:()=>meteoRadarManifest?.radar?.past?.length||0,getState:()=>JSON.parse(JSON.stringify(S)),open:go,weather:applyWeather,clock:tick,mission:()=>S.mission.phase,sequenceBusy:()=>sequenceBusy,alertLevel:()=>document.body.dataset.alert};
// Retain historical operator records while replacing score/timing games with staff commands.
const newOpsDefaults=()=>({xp:0,missions:0,successfulChecks:0,checkIndex:0,calibrations:0,gridBalance:50,gridQuality:0,locks:0,currentMissionLocks:0,lockBest:0,magiPredictions:0,magiMatches:0,missionAwarded:false,gridRewardKeys:[],magiRewardKeys:[],lastActions:[]});
S.ops={...newOpsDefaults(),...(S.ops&&typeof S.ops==='object'?S.ops:{})};
const isMoving=()=>S.prefs.motion&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function addXP(n,reason){S.ops.xp=Math.max(0,S.ops.xp+n);S.ops.lastActions.unshift({at:hhmmss(),reason,points:n});S.ops.lastActions=S.ops.lastActions.slice(0,8);persist();}
// Preserve v2.6 tactical fields for old saves; replace the UI with guided staff orders.
const v26DefaultTactics=()=>({attacker:1,defender:0,posture:'balanced',charge:0,heat:0,scans:0,shots:0,history:[]});
S.tactics={...v26DefaultTactics(),...(S.tactics&&typeof S.tactics==='object'?S.tactics:{})};
for(const role of ['attacker','defender']){if(![0,1,2].includes(Number(S.tactics[role])))S.tactics[role]=role==='attacker'?1:0;else S.tactics[role]=Number(S.tactics[role]);}
if(S.tactics.attacker===S.tactics.defender)S.tactics.defender=(S.tactics.attacker+1)%3;
S.tactics.charge=Math.min(100,Math.max(0,Number(S.tactics.charge)||0));S.tactics.heat=Math.min(100,Math.max(0,Number(S.tactics.heat)||0));
if(S.mission.phase>=5&&!S.tactics.charge&&!S.tactics.shots)S.tactics.charge=80;
function staffInvalidateDecision(){S.magi.approvedFor=null;S.magi.vote=null;S.magi.interceptApproval=null;if(S.defense){S.defense.magivote=null;S.defense.magiround=-1;}}
function staffMagiRequest(purpose){S.magi.purpose=purpose;if(purpose==='intercept')S.selectedEva=S.tactics.attacker;go('magi');}
if(qs('#staffAttackUnit')){
 $('staffAttackUnit').addEventListener('change',event=>{if(S.defense?.connected&&typeof S.evas[S.tactics.attacker].umbilical!=='boolean')S.evas[S.tactics.attacker].umbilical=true;S.tactics.attacker=Number(event.target.value);if(S.defense)S.defense.connected=!!S.evas[S.tactics.attacker].umbilical;if(S.tactics.defender===S.tactics.attacker)S.tactics.defender=(S.tactics.attacker+1)%3;staffInvalidateDecision();addLog('mission','攻撃担当をUNIT-0'+S.tactics.attacker+'に変更');draw();});
 $('staffMissionMagi').addEventListener('click',()=>staffMagiRequest('intercept'));
 // Retain the existing alignment: the field is a child of the artwork rig.
 qs('#evaSvg .eva-reference-rig').insertAdjacentHTML('beforeend','<div class="v26-at-field" aria-hidden="true"><svg viewBox="0 0 200 200"><polygon class="at-shell outer" points="42,1 158,1 199,42 199,158 158,199 42,199 1,158 1,42"/><polygon class="at-shell inner" points="58,38 142,38 162,58 162,142 142,162 58,162 38,142 38,58"/></svg><strong>A.T.FIELD / DEPLOYED</strong></div>');
}
// Original, deterministic doctrine trade-offs inspired by turn-based resource planning.
const NERV_DOCTRINES={defense:{label:'防御優先',cost:4,fire:.85,loss:.75},balanced:{label:'均衡運用',cost:5,fire:1,loss:1},assault:{label:'火力集中',cost:7,fire:1.35,loss:1.1}};
function defenseForecast(){
 const d=S.defense,rule=NERV_DOCTRINES[S.tactics?.posture]||NERV_DOCTRINES.balanced;
 let energy=v27Clamp(d.energy+(S.infra.power?7:0)),damage=0,shots=0;
 const votes=d.magivote?.filter(Boolean).length||0;
 for(const c of d.city.slice(0,3)){if(c.turret&&c.hp>=25&&energy>=rule.cost&&S.infra.power){energy-=rule.cost;shots++;damage+=Math.round((11+d.scans/15+(S.infra.comms?3:0))*(votes>=2?1.35:votes===1?.7:1)*rule.fire);}}
 const enemy=d.enemy;
 const sector=enemy?((d.round+1)%3===0?3:enemy.lane):null;
 let loss=0;
 if(enemy&&enemy.dist<=2&&enemy.hp>damage){const c=d.city[sector],absorb=(c.armor?13:0)+(S.infra.armor?5:0),guard=S.evas[S.tactics.defender]?.state==='DEPLOYED'&&S.evas[S.tactics.defender]?.at&&evaMapSector(S.tactics.defender)===sector?12:0;loss=Math.max(5,Math.round(Math.max(5,enemy.force-absorb-guard)*rule.loss));}
 damage=enemy?Math.min(enemy.hp,damage):0;if(sector!==null)loss=Math.min(d.city[sector].hp,loss);
 return {energy,damage,shots,sector,loss,rule};
}
function renderStrategy(){
 if(!$('strategyForecast')||!S.defense)return;
 const d=S.defense,f=defenseForecast();
 for(const button of all('[data-doctrine]')){const chosen=(S.tactics.posture||'balanced')===button.dataset.doctrine;button.setAttribute('aria-pressed',String(chosen));}
 const prediction=d.status==='active'?f.shots+'系統が迎撃 / 予測損耗 '+f.damage+' / 迎撃後電力（報酬前） '+f.energy+'%\n'+(d.scans<34?'敵の詳細な行動は未解析です。波形解析で見通しを確認できます。':f.loss?V27_FACILITY[f.sector].name+'への被害見込み '+f.loss+' / 次ターン':'次ターンの施設被害見込みなし'):'敵性反応を検知すると、次ターンの電力・迎撃・被害見通しを表示します。';
 meteoText('strategyForecast',f.rule.label+'\n'+prediction);$('strategyAdvance').disabled=d.status!=='active';
}
function initStrategy(){if(!qs('#staffSupport'))return;for(const button of all('[data-doctrine]'))button.addEventListener('click',()=>{S.tactics.posture=button.dataset.doctrine;staffInvalidateDecision();addLog('mission','防衛方針 / '+NERV_DOCTRINES[S.tactics.posture].label);draw();});$('strategyAdvance').addEventListener('click',v27Advance);}
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
// Transfer the legacy shared cable flag before a new case resets defense state.
S.evas.forEach((e,i)=>{if(typeof e.umbilical!=='boolean')e.umbilical=!!(v27D.connected&&S.tactics.attacker===i);});
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
 return `<svg class="v27-map" id="v27IsoMap" viewBox="0 0 680 445" preserveAspectRatio="xMidYMid meet" role="group" aria-label="第3新東京市の2.5D模擬戦術地図。施設をタップして選択できます">
 <defs><radialGradient id="v27MapHalo"><stop stop-color="#0f3b32"/><stop offset="1" stop-color="#021015"/></radialGradient></defs><rect width="680" height="445" fill="url(#v27MapHalo)"/>${grid}
 <g opacity=".8"><path d="M340 70L618 207 340 355 62 207Z" fill="#07262a" stroke="#388c7c" stroke-width="3"/><path d="M340 90L588 207 340 337 92 207Z" fill="none" stroke="#276963" stroke-dasharray="10 7" stroke-width="2"/></g>
 <circle cx="340" cy="207" r="125" class="v27-threat-ring"/><circle cx="340" cy="207" r="180" class="v27-threat-ring" opacity=".25"/><line x1="340" y1="207" x2="514" y2="207" class="v27-sweep"/>
 <path id="v27PowerLine" class="v27-powerline" d="M340 295L181 209L340 125L500 209L340 295"/>
 ${v27SectorSVG(0,181,198)}${v27SectorSVG(1,340,125)}${v27SectorSVG(2,500,198)}${v27SectorSVG(3,340,278)}
 <g id="v27Enemy" class="v27-enemy v27-visual-off" transform="translate(530 35)"><text id="mapEnemyName" class="map-enemy-label" text-anchor="middle" y="-44">HOSTILE</text><circle r="29" class="v27-threat-ring"/><polygon points="0,-22 21,0 0,22 -21,0"/><circle r="6" fill="#1a120e"/><path d="M-38 0H38M0 -38V38" stroke="#ff684e" stroke-width="1.6" opacity=".8"/></g>
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
 <div class="v27-tools" id="defenseTools"><button id="v27Detect">◆ 新規敵性反応 / DETECT</button><button id="v27Scan">⌖ 波形・A.T.分析 / SCAN</button><button id="v27Armor">▣ 装甲を展開 / ARMOR</button><button id="v27Turret">⚑ 迎撃砲台 / DEPLOY</button><button id="v27Power">⚡ 補助電力 / RESERVE</button><button id="v27Repair">✚ 施設の応急修理 / REPAIR</button><button id="v27Cable">⛓ EVA電源ケーブル / CONNECT</button><button id="v27Shot">◎ EVA支援射撃 / SUPPORT</button></div>
 <button class="v27-long" id="v27Advance">▸ 作戦時間を進める / ADVANCE TURN</button><div class="v27-story" aria-live="polite" id="v27Story">命令待機 / DISPATCH IDLE</div>
 <div class="v27-kpi" id="defenseTurnStats" style="margin-top:8px"><div><small>経過ターン</small><strong id="v27Turn">00</strong></div><div><small>兵装稼働</small><strong id="v27Turrets">0/3</strong></div><div><small>予備送電</small><strong id="v27Reserve">2</strong></div><div><small>MAGIセキュリティ</small><strong id="v27Security">85%</strong></div></div>
 <div class="v27-tools" id="defenseLinks"><button data-v27jump="magi">△ MAGIシステムへ ↗</button><button data-v27jump="eva">◈ EVA兵站・運用へ ↗</button><button data-v27jump="mission">⌖ ヤシマ作戦へ ↗</button><button data-v27jump="home">⌂ 統合ホーム ↗</button></div>
 <section class="v27-mini"><h3>作戦履歴 / AFTER ACTION</h3><p id="v27Report">迎撃成功・損害・補給の履歴。施設ダメージは次の作戦へ持ち越されます。</p><div id="v27History" class="v27-history"></div></section>
 <p class="v26-source">非公式ファン制作・全て架空の作戦訓練。気象警報・現実の防災情報とは接続していません。敵の名称・能力・資源量はゲーム独自設定です。</p></section>`;
 const after=(selector,html)=>{const e=qs(selector);if(!e)throw Error('v2.7 missing anchor '+selector);e.insertAdjacentHTML('afterend',html)};
 after('.page[data-page="infra"] .page-top',main);
 all('[data-v27jump]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.v27jump)));
 all('[data-v27pick]').forEach(el=>{el.addEventListener('click',()=>{S.defense.selected=Number(el.dataset.v27pick);sound('select');draw()});if(el.tagName.toLowerCase()==='g')el.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();S.defense.selected=Number(el.dataset.v27pick);draw()}})});
 const handlers={v27Detect:v27Detect,v27Scan:v27Scan,v27Armor:v27Armor,v27Turret:v27Turret,v27Power:v27Power,v27Repair:v27Repair,v27Cable:v27Cable,v27Shot:v27Shot,v27Advance:v27Advance,v27MagiJudge:v27Judge,v27SecDetect:v27Trace};Object.entries(handlers).forEach(([id,fn])=>$(id)?.addEventListener('click',fn));
 all('[data-v27isolate]').forEach(el=>el.addEventListener('click',()=>v27Isolate(Number(el.dataset.v27isolate))));
}
function v27Profile(){return V27_SCENARIOS[(S.defense.caseNo-1+V27_SCENARIOS.length)%V27_SCENARIOS.length];}
function v27Spend(amount){if(!S.infra.power){toast('都市主電源が停止中。管制画面から復旧してください');sound('deny');return false;}if(S.defense.energy<amount){toast('防衛電力が不足 / '+amount+'必要');sound('deny');return false}S.defense.energy-=amount;return true}
function v27Finish(won,why){const d=S.defense;if(d.status!=='active')return;d.status=won?'victory':'defeat';if(won&&S.mission.phase>0&&S.mission.phase<6){S.mission.phase=6;if(!S.ops.missionAwarded){S.ops.missions++;S.ops.missionAwarded=true;}addLog('mission','地上迎撃・EVA連携 / 作戦完了');}if(won){d.wins++;d.parts=v27Clamp(d.parts+34,0,999);d.energy=v27Clamp(d.energy+20);addXP(45+Math.round(v27CityIntegrity()/4),'CITY DEFENSE SUCCESS');}else{d.losses++;d.parts=v27Clamp(d.parts+12,0,999);d.breach=v27Clamp(d.breach+20)}v27Record((won?'作戦成功 / ':'防衛失敗 / ')+why);sound(won?'done':'warning');draw();}
function v27Detect(){const d=S.defense;if(d.status==='active'){toast('迎撃作戦進行中。完了後に次の反応を検知できます');return}d.caseNo++;const x=v27Profile();d.status='active';d.round=0;d.scans=0;d.magivote=null;d.magiround=-1;d.shutdown=false;d.usedV27Shot=false;d.enemy={hp:x.hp,maxHp:x.hp,dist:x.dist,force:x.force,lane:x.lane,code:x.code};d.energy=v27Clamp(d.energy+20);d.breach=0;v27Record('敵性反応を検出 / 分析前の推定進路 '+x.bearing+' / CASE '+d.caseNo);sound('warning');draw()}
function v27Scan(){const d=S.defense;if(d.status!=='active')return toast('敵性反応を先に検知してください');if(!v27Spend(12))return;d.scans=v27Clamp(d.scans+34);if(d.scans>=70)S.tactics.scans=Math.max(S.tactics.scans,2);v27Record('多層波形解析 '+d.scans+'% / '+(d.scans>=68?'PATTERN BLUE：確度上昇':'対象未確定'));sound('scan');draw()}
function v27CityIntegrity(){return Math.round(S.defense.city.reduce((a,x)=>a+x.hp,0)/4)}
function v27Armor(){const d=S.defense,c=d.city[d.selected];if(d.status==='active'||d.status==='idle'){if(c.hp<=0)return toast('機能停止。先に修理してください');if(c.armor)return toast('装甲は展開済み');if(!v27Spend(12))return;c.armor=true;v27Record(V27_FACILITY[d.selected].name+' / 防護シャッター展開');sound('ok');draw()}}
function v27Turret(){const d=S.defense,c=d.city[d.selected];if(d.selected===3)return toast('ジオフロント区画には迎撃砲を設置できません');if(c.hp<25)return toast('施設損傷のため稼働不可 / 修復してください');if(c.turret)return toast('砲台はすでに稼働中です');if(d.parts<20)return toast('資材が不足 / 20必要');d.parts-=20;c.turret=true;v27Record(V27_FACILITY[d.selected].name+' / 迎撃砲台配置');sound('launch');draw()}
function v27Power(){const d=S.defense;if(d.spares<=0)return toast('予備送電枠を使い切りました');d.spares--;d.energy=v27Clamp(d.energy+38);v27Record('地下補助系統から緊急送電 / +38');sound('ok');draw()}
function v27Repair(){const d=S.defense,c=d.city[d.selected];if(c.hp>=100)return toast('設備は健全です');if(d.parts<18)return toast('修理資材が不足 / 18必要');d.parts-=18;c.hp=v27Clamp(c.hp+27);v27Record(V27_FACILITY[d.selected].name+' / 緊急修復：HP '+c.hp);sound('ok');draw()}
function v27Cable(){toggleEvaCable(S.tactics.attacker);}
function v27Judge(){if(magiIntrusionActive())return toast('MAGI侵入対処中 / 通常審議を停止しています');const d=S.defense;if(d.status!=='active')return toast('敵性信号がありません');if(d.scans<34)return toast('最低1回の波形分析を先に実施してください');const votes=[d.scans>=65&&S.infra.power,d.city[3].hp>=35&&v27CityIntegrity()>=40,d.security>=45&&S.infra.comms];d.magivote=votes;d.magiround=d.round;v27Record('MAGI 戦術判断 '+votes.filter(Boolean).length+'/3 '+(votes.filter(Boolean).length>=2?'承認':'留保'));sound('scan');draw()}
function v27Trace(){const d=S.defense;if(d.status!=='active')return toast('敵性信号を検知してください');if(d.scans<34)return toast('波形解析が必要です');d.securityPuzzle=(d.caseNo+d.round+1)%3;if(!v27Spend(8))return;d.shutdown=true;v27Record('MAGI侵入試行を捕捉 / ノード '+['M','B','C'][d.securityPuzzle]+' に不審通信');sound('warning');draw()}
function v27Isolate(i){const d=S.defense;if(!d.shutdown)return toast('侵入トレースを先に行ってください');d.shutdown=false;if(i===d.securityPuzzle){d.security=v27Clamp(d.security+15);d.parts=v27Clamp(d.parts+6,0,999);v27Record('不正ノード隔離成功 / 三基稼働継続');sound('ok')}else{d.security=v27Clamp(d.security-20);v27Record('隔離対象誤認 / MAGIセキュリティ -20');sound('deny')}d.magivote=null;draw()}
function v27Shot(){const d=S.defense,t=S.tactics;if(d.status!=='active')return toast('迎撃対象がありません');const a=S.evas[t.attacker],errs=[];if(S.mission.phase<4||S.mission.phase>5)errs.push('既存作戦PHASE 04-05');if(a?.state!=='DEPLOYED')errs.push('攻撃担当機の出撃');if(S.magi.approvedFor!==t.attacker)errs.push('EVA出撃承認');if(t.charge<70||t.heat>=80)errs.push('蓄電70%以上・熱負荷80%未満');if(!S.ops.currentMissionLocks)errs.push('照準ロック');if(!d.magivote||d.magivote.filter(Boolean).length<2||d.magiround!==d.round)errs.push('現ターンのMAGI戦術承認');if(errs.length){toast('射撃不可: '+errs.join(' / '));sound('deny');return}const dmg=Math.round(60+d.scans*.33+(evaExternalPower(t.attacker)?10:0));d.enemy.hp=v27Clamp(d.enemy.hp-dmg,0,300);d.usedV27Shot=true;t.charge=0;t.heat=v27Clamp(t.heat+20);v27Record('EVA支援射撃 / '+dmg+' DAMAGE / 対象残 '+d.enemy.hp);sound('launch');if(!d.enemy.hp){v27Finish(true,'EVA支援射撃により目標沈黙');return}draw()}
function v27Advance(){const d=S.defense;if(d.status!=='active')return toast('まず新規敵性反応を検知してください');const forecast=defenseForecast();d.round++;d.energy=forecast.energy;
 const e=d.enemy,damage=forecast.damage,shots=forecast.shots;
 d.magivote=null;d.magiround=-1;if(damage){e.hp=v27Clamp(e.hp-damage,0,300);v27Record('地上迎撃 '+shots+'系統 / 対象損耗 -'+damage+' / 残 '+e.hp)}
 if(e.hp<=0){v27Finish(true,'迎撃砲火により目標撃退');return}
 e.dist=Math.max(0,e.dist-1);if(!evaExternalPower(S.tactics.attacker)&&S.evas[S.tactics.attacker]?.state==='DEPLOYED'){const ev=S.evas[S.tactics.attacker];ev.power=Math.max(0,Number(ev.power)-32);if(ev.power<=0){ev.state='POWER_LOST';ev.at=false;v27Record('攻撃担当EVA 内部電源喪失')}}
 if(e.dist<=1){const spot=d.round%3===0?3:e.lane;const c=d.city[spot],loss=forecast.loss;c.hp=v27Clamp(c.hp-loss);d.breach=v27Clamp(d.breach+(spot===3?13:5));d.security=v27Clamp(d.security-(d.scans<35?9:3));v27Record(V27_FACILITY[spot].name+'被弾 / '+loss+' DAMAGE / HP '+c.hp);if(c.hp<25)c.turret=false}
 else v27Record('敵性反応接近 / ETA '+e.dist+' TURNS / 電力配分 +7');
 if(d.city[3].hp<=0||v27CityIntegrity()<=26||d.round>=14){v27Finish(false,'防衛ライン維持不可 / 復旧が必要');return}sound(e.dist<=1?'warning':'scan');draw();}
function v27Render(){const d=S.defense;if(!$('v27DefenseBoard'))return;const active=d.status==='active',e=d.enemy,health=v27CityIntegrity(),votes=d.magivote||[];const txt=(id,v)=>{const el=$(id);if(el)el.textContent=String(v)};
 document.body.dataset.defense=d.status;
 if(d.status==='active' && S.infra.power && S.infra.comms && !S.evas.some(e=>e.state==='POWER_LOST') && !magiIntrusionActive()){const rb=$('globalAlert');rb.classList.remove('hidden');rb.dataset.level='watch';$('globalAlertFlag').textContent='PATTERN ALERT';$('globalAlertText').textContent='模擬敵性反応 / TOKYO-3 防衛作戦 '+String(d.caseNo).padStart(3,'0');$('telemetryAlarm').textContent='ENEMY';$('telemetryAlarm').style.color='#ffb374';meteoText('heroTacticalState','DEFENSE ACTIVE / SIM');}
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
 txt('v27Cable',evaUmbilicalConnected(S.tactics.attacker)?'⛓ ケーブル解除 / DISCONNECT':'⛓ EVA電源ケーブル / CONNECT');
 const magiStatus=d.magivote?d.magivote.filter(Boolean).length+'/3 CORES / '+(d.magivote.filter(Boolean).length>=2?'APPROVED':'REJECTED'):'VOTE REQUIRED';
 txt('v27HomeBrief',active?'◆ ENEMY '+e.dist+' T / CITY '+health+'%':label+' / CITY '+health+'%');txt('v27HomeState',d.last);
 txt('v27MissionBrief',`${label} / TARGET ${active?e.hp+'HP':'NONE'} / MAGI ${magiStatus}`);txt('v27EvaBrief',`UMBILICAL : ${evaUmbilicalConnected(S.tactics.attacker)?'CONNECTED':'OFFLINE'} / EVA電力 ${S.evas[S.tactics.attacker].power}s / SECURITY ${d.security}%`);
 txt('v27MagiBrief',`${magiStatus} / SECURITY ${d.security}% / RECON ${d.scans}%`);
 ['v27Vote0','v27Vote1','v27Vote2'].forEach((id,i)=>txt(id,d.magivote?(votes[i]?'APPROVE':'DENY'):'WAIT'));
 txt('v27SecurityHint',d.shutdown?'侵入シグナルを捕捉：'+['MELCHIOR','BALTHASAR','CASPER'][d.securityPuzzle]+' に不審ノード。隔離を選択。':'ノード隔離には先に侵入トレースを実行。誤遮断でセキュリティ低下。');
 if($('v27MagiJudge'))$('v27MagiJudge').disabled=!active||d.scans<34;if($('v27SecDetect'))$('v27SecDetect').disabled=!active||d.scans<34;
}
function v27Init(){if(!qs('.page[data-page="infra"] .page-top')?.insertAdjacentHTML)return;v27Build();const v26Draw=draw;draw=function(){v26Draw();v27Render();};window.NERV_V27_TEST={snapshot:()=>JSON.parse(JSON.stringify(S.defense)),detect:v27Detect,scan:v27Scan,advance:v27Advance,judge:v27Judge,shoot:v27Shot,repair:v27Repair,armor:v27Armor,turret:v27Turret,energy:v27Power,sector:(x)=>{S.defense.selected=x;draw()},render:v27Render};v27Render();}
v27Init();

// A local story simulation inspired by episode 13's evolving MAGI contamination.
// It never receives external commands or contacts an actual hostile system.
let visualUpgradeBackup=null;
async function backupVisualUpgrade(){
 if(!visualUpgradeBackup)visualUpgradeBackup=callNative('backupUpgrade',{state:JSON.parse(JSON.stringify(S))});
 const result=await visualUpgradeBackup;
 if(result?.error){visualUpgradeBackup=null;toast('変更前の保存に失敗しました：'+result.error);return false;}
 return true;
}
function magiIntrusionActive(){return ['detected','isolated','analyzed','countermeasure','failed'].includes(S.magi?.intrusion?.status);}
function intrusionState(){const defaults={status:'idle',phase:0,progress:0,affected:[],resolved:0,failures:0,message:'MAGI三基は正常稼働。通常の出撃・迎撃審議が可能です。'};const raw=S.magi.intrusion;if(!raw||typeof raw!=='object')return defaults;return {...defaults,...raw,affected:Array.isArray(raw.affected)?raw.affected:[],progress:Math.max(0,Math.min(100,Number(raw.progress)||0)),phase:Math.max(0,Math.min(5,Number(raw.phase)||0))};}
const intrusionActions={
 isolate:{label:'MAGI外部回線を隔離',effect:'侵入経路を遮断。都市の作戦通信は維持します。'},
 restart:{label:'通常再起動を試す',effect:'適応する侵食には無効。侵食率が25%増加します。'},
 analyze:{label:'侵食波形を解析',effect:'侵食率＋10%。適応・進化の仕組みを特定します。'},
 firewall:{label:'通常防壁を更新',effect:'侵食側が適応。侵食率が20%増加します。'},
 reverse:{label:'進化経路を逆算',effect:'CASPERの未侵食領域で対抗プログラムを構成します。'},
 execute:{label:'CASPERから対抗処理を実行',effect:'進化を終端へ誘導。侵食を封じ込め、三基を復旧します。'}
};
async function startMagiIntrusion(){
 if(magiIntrusionActive())return;
 if(!await backupVisualUpgrade())return;
 // Recheck after the asynchronous backup to prevent a double-tap starting twice.
 if(magiIntrusionActive())return;
 const old=intrusionState();S.magi.intrusion={...old,status:'detected',phase:1,progress:20,affected:['MELCHIOR'],securityBefore:S.defense.security,message:'外部試験系から侵食を検知。MELCHIORに異常。通常審議を停止しました。'};
 S.defense.security=Math.max(0,S.defense.security-20);staffInvalidateDecision();
 addLog('magi','侵入訓練開始 / 外部試験系から進化型の侵食を検知');sound('warning');draw();window.scrollTo({top:0,behavior:'instant'});
}
function magiIntrusionAction(action){
 const s=intrusionState();if(!magiIntrusionActive()||s.status==='failed')return;
 const allowed={detected:['isolate','restart'],isolated:['analyze','restart'],analyzed:['reverse','firewall'],countermeasure:['execute','firewall']}[s.status]||[];
 if(!allowed.includes(action))return;S.magi.intrusion=s;
 if(action==='isolate'){s.status='isolated';s.phase=2;s.message='外部回線を隔離。都市作戦通信を維持。侵食はMAGI内部で適応を続けています。';}
 if(action==='analyze'){s.status='analyzed';s.phase=3;s.progress+=10;s.affected=['MELCHIOR','BALTHASAR'];s.message='侵食波形を解析。通常防壁に適応する進化型と判明。CASPERは未侵食です。';}
 if(action==='reverse'){s.status='countermeasure';s.phase=4;s.message='進化経路を逆算。CASPERで対抗処理の準備完了。実行すると三基の復旧を試みます。';}
 if(action==='restart'||action==='firewall'){s.progress+=action==='restart'?25:20;s.message=action==='restart'?'通常再起動に侵食が適応。侵食率＋25%。外部回線の隔離と波形解析が必要です。':'通常防壁に侵食が適応。侵食率＋20%。進化経路の逆算で対抗してください。';}
 if(action==='execute'){s.status='contained';s.phase=5;s.progress=0;s.affected=[];s.resolved=(Number(s.resolved)||0)+1;s.message='対抗処理が成功。侵食を封じ込め、MAGI三基を復旧。通常審議を再申請できます。';S.defense.security=Math.max(S.defense.security,s.securityBefore||0);staffInvalidateDecision();}
 s.progress=Math.min(100,s.progress);
 if(s.progress>=100){s.status='failed';s.affected=['MELCHIOR','BALTHASAR','CASPER'];s.failures=(Number(s.failures)||0)+1;s.message='三基の侵食が限界に到達。審議を停止しています。警報確認から正常待機への復旧を選択してください。';}
 addLog('magi',s.message);sound(s.status==='contained'?'done':s.status==='failed'?'warning':'scan');draw();
}
function renderMagiIntrusion(){
 const panel=$('magiIntrusionPanel');if(!panel)return;
 const s=intrusionState(),active=magiIntrusionActive();panel.dataset.status=s.status;
 meteoText('intrusionPhase',String(s.phase).padStart(2,'0')+' / 05');meteoText('intrusionMessage',s.message);meteoText('intrusionPercent',s.progress+'%');
 $('intrusionRing').style.setProperty('--intrusion-progress',s.progress+'%');
 meteoText('intrusionCircuit',s.status==='idle'||s.status==='contained'?'外部回線：正常':s.status==='detected'?'外部回線：未隔離':'MAGI外部回線：隔離中 / 都市通信：維持');
 const names=['MELCHIOR','BALTHASAR','CASPER'];
 for(const name of names){const node=qs('[data-intrusion-core="'+name+'"]'),hit=s.affected.includes(name);node.dataset.infected=String(hit);node.querySelector('b').textContent=hit?'侵食':active?'保全中':'正常';}
 const actions=$('intrusionActions');actions.replaceChildren();
 const keys={detected:['isolate','restart'],isolated:['analyze','restart'],analyzed:['reverse','firewall'],countermeasure:['execute','firewall']}[s.status]||[];
 for(const key of keys){const info=intrusionActions[key],button=document.createElement('button'),b=document.createElement('b'),small=document.createElement('span');button.type='button';button.dataset.intrusionAction=key;b.textContent=info.label;small.textContent=info.effect;button.append(b,small);button.addEventListener('click',()=>magiIntrusionAction(key));actions.append(button);}
 $('intrusionStart').hidden=active;$('intrusionRecover').hidden=s.status!=='failed';
 meteoText('intrusionStart',s.status==='contained'?'侵入訓練をもう一度開始':'侵入訓練を開始');
 $('magiVote').disabled=active;
 if(active)meteoText('magiLiveState','侵食検知 / 通常審議停止');
 // Current core impairment remains visible on the consensus board as well.
 for(const name of names){const code={MELCHIOR:'M',BALTHASAR:'B',CASPER:'C'}[name],node=$('m'+code+'Status')?.parentElement;if(node){node.dataset.infected=String(active&&s.affected.includes(name));if(active&&s.affected.includes(name))meteoText('m'+code+'Status','侵食');}}
}
function initMagiIntrusion(){
 if(!qs('#staffSupport'))return;
 const panel=document.createElement('section');panel.id='magiIntrusionPanel';panel.className='staff-panel intrusion-panel';
 panel.innerHTML='<div class="staff-panel-title"><h2>MAGI侵入対処</h2><b id="intrusionPhase">00 / 05</b></div><p class="staff-note">SIMULATION / 第拾参話「使徒、侵入」をモチーフにした独自訓練。選択時に進行する訓練です。</p><div class="intrusion-instruments"><div class="intrusion-ring" id="intrusionRing"><i></i><strong id="intrusionPercent">0%</strong><small>CONTAMINATION</small></div><div class="intrusion-cores"><div data-intrusion-core="MELCHIOR">MELCHIOR-1<b>正常</b></div><div data-intrusion-core="BALTHASAR">BALTHASAR-2<b>正常</b></div><div data-intrusion-core="CASPER">CASPER-3<b>正常</b></div></div></div><p id="intrusionCircuit" class="intrusion-circuit"></p><p id="intrusionMessage" class="intrusion-message" role="status"></p><div id="intrusionActions" class="intrusion-actions"></div><button id="intrusionStart" class="staff-primary">侵入訓練を開始</button><button id="intrusionRecover" class="staff-primary">警報確認・正常復旧へ</button><nav class="staff-route"><button data-route="magi/request">通常の審議申請へ ↗</button><button data-route="infra/systems">都市系統を確認 ↗</button></nav>';
 qs('.page[data-page="magi"]').append(panel);
 $('intrusionStart').addEventListener('click',startMagiIntrusion);$('intrusionRecover').addEventListener('click',()=>openAlertReview());
 const priorMagi=renderMAGI;renderMAGI=function(){priorMagi();renderMagiIntrusion();};
 renderMagiIntrusion();
}
initMagiIntrusion();
// Explicit operator recovery: backup first, cancel pending commands, persist, then acknowledge.
let recoveryBusy=false,alertReturnFocus=null;
function openAlertReview(mode='alert'){
 if(recoveryBusy)return;
 const alert=terminalAlert(),modal=$('alertReview');if(!modal)return;
 alertReturnFocus=document.activeElement;
 meteoText('alertReviewTitle',mode==='end'?'作戦終了の確認':alert.title||'正常待機への復帰');
 meteoText('alertReviewDescription',mode==='end'?'進行中の作戦を終了して正常待機へ戻しますか。':alert.message||'全系統を正常待機へ戻します。');
 modal.classList.remove('hidden');$('alertContinue').focus();
}
function closeAlertReview(){if(recoveryBusy)return;$('alertReview').classList.add('hidden');if(alertReturnFocus?.isConnected)alertReturnFocus.focus();}
function recoveredStaffState(previous){
 const next=JSON.parse(JSON.stringify(previous));
 next.infra={...next.infra,power:true,comms:true,armor:false};
 next.evas=next.evas.map(e=>({...e,state:'HANGAR',power:300,at:false,umbilical:true,powerUpdatedAt:null}));
 next.magi={...next.magi,approvedFor:null,vote:null,interceptApproval:null};
 if(next.magi.intrusion)next.magi.intrusion={...next.magi.intrusion,status:'idle',progress:0,phase:0,affected:[],message:'警報クリア / MAGI正常待機'};
 next.mission={...next.mission,phase:0};next.ops={...next.ops,currentMissionLocks:0,missionAwarded:false};
 next.tactics={...next.tactics,charge:0,heat:0,scans:0};
 const d=next.defense;
 Object.assign(d,{status:'idle',enemy:null,round:0,scans:0,breach:0,energy:100,security:100,connected:false,shutdown:false,magivote:null,magiround:-1,alert:false,usedV27Shot:false,last:'警報クリア / 全系統正常待機'});
 d.city=d.city.map((c,i)=>({...c,hp:100,armor:i===3}));
 const entry={time:hhmmss(),text:'警報クリア / 都市復旧・全EVA回収・作戦終了'};
 for(const type of ['infra','eva','mission'])next.logs[type]=[entry,...(next.logs[type]||[])].slice(0,35);
 return next;
}
async function clearTerminalAlert(){
 if(recoveryBusy)return;
 recoveryBusy=true;$('alertClear').disabled=true;$('alertContinue').disabled=true;$('alertTarget').disabled=true;
 const previous=JSON.parse(JSON.stringify(S));let changed=false;
 try{
  const backup=await callNative('backupState',{state:previous});if(backup?.error)throw Error('事前バックアップ：'+backup.error);
  cancelSequence();stopSound();clearTimeout(saveTimeout);
  S=recoveredStaffState(previous);changed=true;
  const result=await callNative('persist',{state:JSON.parse(JSON.stringify(S))});if(result?.error)throw Error('復旧状態の保存：'+result.error);
  $('alertReview').classList.add('hidden');draw();sound('ok');toast('警報をクリアしました。都市・全EVAは正常待機です。');
  if(alertReturnFocus?.isConnected)alertReturnFocus.focus();
 }catch(error){
  if(changed){S=previous;draw();}
  meteoText('alertReviewDescription','クリアを中止しました。'+error.message);toast('状態を保存できないため、警報を維持します。');
 }finally{recoveryBusy=false;$('alertClear').disabled=false;$('alertContinue').disabled=false;$('alertTarget').disabled=false;}
}
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
// Independent, addressable sections keep one iPhone task on screen at a time.
const mobileGroups={},mobileCurrent={};
function mobileSection(page,id){return mobileGroups[page]?.panels.find(p=>p.dataset.view===id);}
function mobileNavigate(page,view,push=true){
 const group=mobileGroups[page];
 if(group){view=mobileSection(page,view)?view:group.defaultView;mobileCurrent[page]=view;
  for(const panel of group.panels)panel.hidden=panel.dataset.view!==view;
  for(const button of group.nav.querySelectorAll('button')){const active=button.dataset.mobileTab===page+'/'+view;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;}
  group.nav.hidden=page==='tools'&&view==='desk';
 }
 const route=page+(group?'/'+view:'');
 if(push&&location.hash!=='#'+route)history.pushState({},'', '#'+route);
 if(page==='infra'&&view==='geography')ensureMap();
 if(page==='weather'&&view==='radar')setTimeout(()=>meteoPaintMap(true),0);
 window.scrollTo({top:0,behavior:'instant'});
 window.dispatchEvent(new CustomEvent('nerv-route',{detail:{page,view}}));
}
function mobileGroup(pageName,definitions,defaultView){
 const page=qs('.page[data-page="'+pageName+'"]');if(!page)return;
 const nav=document.createElement('nav');nav.className='mobile-tabs';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','表示内容');
 const panels=[];
 for(const definition of definitions){
  let panel=definition.existing?page.querySelector('[data-view="'+definition.id+'"]'):document.createElement('section');
  if(!panel)continue;
  if(!definition.existing){panel.className='mobile-view';panel.dataset.view=definition.id;for(const selector of definition.selectors)for(const node of [...page.querySelectorAll(selector)])panel.append(node);page.append(panel);}
  panel.id='mobile-'+pageName+'-'+definition.id;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-label',definition.label);panel.hidden=true;panels.push(panel);
  const button=document.createElement('button');button.type='button';button.dataset.mobileTab=pageName+'/'+definition.id;button.textContent=definition.label;button.setAttribute('role','tab');button.setAttribute('aria-controls',panel.id);button.addEventListener('click',()=>mobileNavigate(pageName,definition.id));nav.append(button);
 }
 const anchor=page.querySelector('.page-top')||page.querySelector('.meteo-notice');if(anchor)anchor.after(nav);else page.prepend(nav);
 nav.addEventListener('keydown',event=>{const buttons=[...nav.querySelectorAll('button')],index=buttons.indexOf(document.activeElement);if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowLeft'?-1:1)+buttons.length)%buttons.length;buttons[next].click();buttons[next].focus();});
 mobileGroups[pageName]={panels,nav,defaultView};mobileNavigate(pageName,defaultView,false);
}
function initMobileViews(){
 if(!qs('#staffSupport'))return;
 mobileGroup('tools',[['desk','一覧'],['device','端末'],['tasks','タスク'],['duty','当直'],['handover','引継ぎ'],['inspection','点検'],['timer','タイマー']].map(([id,label])=>({id,label,existing:true})),'desk');
 mobileGroup('eva',[
  {id:'monitor',label:'機体監視',selectors:['.eva-display']},
  {id:'control',label:'発進管制',selectors:['.eva-ops-header','.eva-action-grid','#evaGuidance']},
  {id:'readiness',label:'機体点検・給電',selectors:['#evaReadiness']},
  {id:'telemetry',label:'数値監視',selectors:['.eva-magi-readout','.eva-stats','.eva-systems']},
  {id:'log',label:'運用記録',selectors:['.eva-log-heading','#evaLog']}
 ],'monitor');
 mobileGroup('magi',[
  {id:'request',label:'審議申請',selectors:['#magiRequestPanel']},
  {id:'consensus',label:'三基合議',selectors:['#magiBoard']},
  {id:'intrusion',label:'侵入対処',selectors:['#magiIntrusionPanel']},
  {id:'log',label:'決議履歴',selectors:['#magiLog']}
 ],'request');
 mobileGroup('mission',[
  {id:'orders',label:'指揮',selectors:['#missionOrdersPanel']},
  {id:'status',label:'状況',selectors:['#missionStatusPanel']},
  {id:'checks',label:'実行条件',selectors:['#staffChecklist']},
  {id:'strategy',label:'防衛方針',selectors:['#missionStrategyPanel']},
  {id:'log',label:'記録',selectors:['#missionLogPanel']}
 ],'orders');
 mobileGroup('infra',[
  {id:'map',label:'防衛地図',selectors:['.v27-head','.v27-kpi:not(#defenseTurnStats)','#v27IsoMap','.v27-readbar','#v27Facilities']},
  {id:'facilities',label:'施設・迎撃',selectors:['#v27DefenseBoard']},
  {id:'systems',label:'都市系統',selectors:['#infraSystems']},
  {id:'geography',label:'実地図',selectors:['.infra-status']},
  {id:'log',label:'記録',selectors:['#infraRecords','#v27DefenseBoard .v27-mini']}
 ],'map');
 mobileGroup('weather',[
  {id:'current',label:'現在・予報',selectors:['#meteoCurrentPanel','.meteo-hourly','#weatherFetch','#weatherStatus']},
  {id:'radar',label:'雨雲',selectors:['#meteoRadarPanel']},
  {id:'region',label:'地域',selectors:['#meteoRegionalPanel','.meteo-river']},
  {id:'advice',label:'参考情報',selectors:['#meteoAlertPanel','.meteo-guidance']}
 ],'current');
 const oldWeatherNav=qs('.meteo-nav');if(oldWeatherNav)oldWeatherNav.hidden=true;
 const weatherGrid=qs('.meteo-grid');if(weatherGrid&&!weatherGrid.children.length)weatherGrid.remove();
 mobileGroup('settings',[
  {id:'display',label:'表示・音',selectors:['#soundSwitch','.setting-audio','#motionSwitch','#bootSwitch']},
  {id:'data',label:'通信・データ',selectors:['#autoWeatherSwitch','#clearTasks','#resetSim','.privacy']}
 ],'display');
 const priorGo=go;go=function(page){const from=currentPage;priorGo(page);const initial=page==='magi'&&magiIntrusionActive()?'intrusion':page==='eva'&&['mission','magi'].includes(from)?'control':mobileGroups[page]?.defaultView;mobileNavigate(page,initial);};
 window.NERV_TEST.open=go;
 window.NERV_MOBILE={open:(page,view)=>{if(currentPage!==page)priorGo(page);mobileNavigate(page,view);},view:page=>mobileCurrent[page]};
 for(const button of all('[data-mobile-go]'))button.addEventListener('click',()=>{const [page,view]=button.dataset.mobileGo.split('/');window.NERV_MOBILE.open(page,view);});
 let lastVote=S.magi.vote?.time;
 const priorDraw=draw;draw=function(){priorDraw();if(S.magi.vote?.time&&S.magi.vote.time!==lastVote&&currentPage==='magi')mobileNavigate('magi','consensus');lastVote=S.magi.vote?.time;};
 const restore=()=>{const [page,view]=location.hash.slice(1).split('/');if(!['home','weather','infra','eva','magi','mission','tools','settings'].includes(page))return;priorGo(page);mobileNavigate(page,view,false);};
 window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
 if(location.hash)restore();else mobileNavigate(currentPage,mobileGroups[currentPage]?.defaultView);
}
initMobileViews();
const staffInspectionItems=['連絡系統を確認','非常電源の表示を確認','EVA拘束・電源状態を確認','MAGIの未承認事項を確認','次当直への引継ぎを確認'];
let handoverPage=0;
function renderPersonnel(){
 const p=S.personnel;if(!p||!$('dutyStatus'))return;
 const active=!!p.shift?.startedAt&&!p.shift.endedAt;
 meteoText('dutyStatus',active?'当直中':p.shift?.endedAt?'当直終了':'待機');
 meteoText('dutyStarted',p.shift?.startedAt?new Date(p.shift.startedAt).toLocaleString('ja-JP'):'--');
 const seconds=p.shift?.startedAt?Math.max(0,Math.floor(((p.shift.endedAt||Date.now())-p.shift.startedAt)/1000)):0;
 meteoText('dutyElapsed',[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':'));
 $('dutyStart').disabled=active;$('dutyEnd').disabled=!active;
}
function renderHandover(){
 const p=S.personnel,list=$('handoverList');if(!list)return;list.replaceChildren();
 const pages=Math.max(1,Math.ceil(p.handover.length/5));handoverPage=Math.min(handoverPage,pages-1);
 for(const entry of p.handover.slice(handoverPage*5,handoverPage*5+5)){
  const row=document.createElement('article'),time=document.createElement('small'),text=document.createElement('p');
  time.textContent=new Date(entry.at).toLocaleString('ja-JP')+' / '+entry.category;text.textContent=entry.text;row.append(time,text);list.append(row);
 }
 if(!p.handover.length)list.textContent='引継ぎ記録はありません。';
 meteoText('handoverPage',(handoverPage+1)+' / '+pages);$('handoverPrev').disabled=handoverPage===0;$('handoverNext').disabled=handoverPage===pages-1;
}
function initPersonnel(){
 if(!qs('#staffSupport'))return;
 const raw=S.personnel&&typeof S.personnel==='object'?S.personnel:{};
 S.personnel={...raw,shift:raw.shift&&typeof raw.shift==='object'?raw.shift:{startedAt:0,endedAt:0},checks:raw.checks&&typeof raw.checks==='object'?raw.checks:{},handover:Array.isArray(raw.handover)?raw.handover:[]};
 $('dutyStart').addEventListener('click',()=>{if(S.personnel.shift.startedAt&&!S.personnel.shift.endedAt)return;S.personnel.shift={startedAt:Date.now(),endedAt:0};persist();renderPersonnel();sound('ok');});
 $('dutyEnd').addEventListener('click',()=>{if(!S.personnel.shift.startedAt||S.personnel.shift.endedAt)return;S.personnel.shift.endedAt=Date.now();persist();renderPersonnel();sound('done');});
 $('handoverForm').addEventListener('submit',event=>{event.preventDefault();const text=$('handoverText').value.trim();if(!text)return;S.personnel.handover.unshift({at:Date.now(),category:$('handoverCategory').value,text:text.slice(0,500)});S.personnel.handover=S.personnel.handover.slice(0,100);$('handoverText').value='';handoverPage=0;persist();renderHandover();sound('ok');});
 $('handoverPrev').addEventListener('click',()=>{handoverPage=Math.max(0,handoverPage-1);renderHandover();});$('handoverNext').addEventListener('click',()=>{handoverPage++;renderHandover();});
 $('handoverExport').addEventListener('click',async()=>{
  const text='NERV / 職員引継ぎ記録\n'+S.personnel.handover.map(e=>new Date(e.at).toLocaleString('ja-JP')+' ['+e.category+']\n'+e.text).join('\n\n');
  const output=$('handoverExportText');output.value=text;output.classList.remove('hidden');
  const result=await callNative('clipboard',{text});if(result?.error){output.focus();output.select();toast('記録を選択しました。長押ししてコピーしてください。');}else toast('引継ぎ記録をコピーしました。');
 });
 const refreshChecks=()=>{const done=staffInspectionItems.filter((_,i)=>!!S.personnel.checks[i]).length;meteoText('inspectionProgress',done+' / '+staffInspectionItems.length+' 点検済み');};
 const checks=$('inspectionList');staffInspectionItems.forEach((text,i)=>{const label=document.createElement('label'),input=document.createElement('input'),span=document.createElement('span');input.type='checkbox';input.checked=!!S.personnel.checks[i];input.dataset.inspection=String(i);span.textContent=text;label.append(input,span);checks.append(label);input.addEventListener('change',()=>{S.personnel.checks[i]=input.checked;persist();refreshChecks();});});
 $('inspectionReset').addEventListener('click',()=>{S.personnel.checks={};for(const input of checks.querySelectorAll('input'))input.checked=false;persist();refreshChecks();});
 renderPersonnel();renderHandover();refreshChecks();
}
initPersonnel();
function evaUmbilicalConnected(index){const e=S.evas[index];if(!['DEPLOYED','POWER_LOST'].includes(e.state))return !!S.infra.power;return typeof e.umbilical==='boolean'?e.umbilical:!!(S.defense?.connected&&S.tactics?.attacker===index);}
function evaExternalPower(index){return !!S.infra.power&&evaUmbilicalConnected(index);}
function toggleEvaCable(index=S.selectedEva){
 settleEvaPower();const e=S.evas[index];if(e.state!=='DEPLOYED'){toast('ケーブル切替は出撃中の機体で実行します。');return;}
 e.umbilical=!evaUmbilicalConnected(index);e.powerUpdatedAt=Date.now();if(index===S.tactics.attacker)S.defense.connected=e.umbilical;
 addLog('eva','UNIT-0'+index+' / アンビリカル '+(e.umbilical?'接続':'解除'));sound('select');draw();
}
function renderEvaOperations(){
 if(!$('evaReadinessList'))return;
 const e=selected(),prepared=['READY','DEPLOYED','POWER_LOST'].includes(e.state);
 const checks=[['主電源・通信',S.infra.power&&S.infra.comms],['エントリープラグ・LCL準備',prepared],['神経接続 / SYNC '+e.sync+'% (SIM)',prepared&&e.sync>=50],['MAGI出撃承認',e.state==='DEPLOYED'||S.magi.approvedFor===S.selectedEva],['拘束解除・射出待機',e.state==='READY'||e.state==='DEPLOYED']];
 const list=$('evaReadinessList');list.replaceChildren();for(const [label,ok] of checks){const li=document.createElement('li');li.textContent=(ok?'確認済：':'未確認：')+label;li.dataset.complete=String(ok);list.append(li);}
 const connected=evaUmbilicalConnected(S.selectedEva);
 $('evaCable').disabled=e.state!=='DEPLOYED';meteoText('evaCable',connected?'アンビリカルを解除':'アンビリカルを接続');
 meteoText('evaCableHint',e.state==='DEPLOYED'?(evaExternalPower(S.selectedEva)?'外部給電中。内部電源の時間消費を停止しています。':'内部電源で稼働。A.T.展開中は消費が増加します。'):'格納ケージ給電。出撃中は機体ごとにケーブルを切り替えられます。');
 meteoText('evaUmbDisplay',connected?(S.infra.power?'UMBILICAL / EXTERNAL POWER':'UMBILICAL / SUPPLY OFFLINE'):'UMBILICAL / INTERNAL POWER');
 meteoText('evaGrid',evaExternalPower(S.selectedEva)?'EXTERNAL':S.infra.power?'INTERNAL':'SUPPLY OFFLINE');
}
function initOperationVisuals(){
 if(!qs('#staffSupport'))return;
 const graphic='<svg viewBox="0 0 320 120" aria-hidden="true"><defs><pattern id="opHatch" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><rect width="6" height="12" fill="#dca04b"/></pattern></defs><rect x="5" y="5" width="310" height="110" fill="#091612" stroke="#568a70"/><path class="op-power" d="M15 100H90V40H230V100H305" fill="none" stroke="#77e5c3" stroke-width="3"/><g class="op-city"><path d="M75 105V65H110V105M125 105V40H165V105M180 105V55H220V105M230 105V70H260V105" fill="#1d4d40" stroke="#b3d6b2"/></g><g class="op-gate-left"><rect x="12" y="12" width="148" height="96" fill="#50331f" stroke="#ffbe6a"/><rect x="20" y="18" width="132" height="10" fill="url(#opHatch)"/><path d="M30 42h100M30 58h100M30 74h100M30 90h100" stroke="#b07839"/></g><g class="op-gate-right"><rect x="160" y="12" width="148" height="96" fill="#50331f" stroke="#ffbe6a"/><rect x="168" y="18" width="132" height="10" fill="url(#opHatch)"/><path d="M184 42h100M184 58h100M184 74h100M184 90h100" stroke="#b07839"/></g><g class="op-eva"><path d="M152 28l8-8 8 8-3 13 12 18-5 7-9-15 2 28 10 26h-9l-9-24-7 24h-9l11-28 2-25-10 13-6-7 14-19z" fill="#d9b56e" stroke="#e4f0ba"/></g><path class="op-beam" d="M170 50L300 15" stroke="#b9fbec" stroke-width="5"/></svg>';
 const scene=document.createElement('div');scene.id='operationVisual';scene.className='operation-visual hidden';scene.setAttribute('role','status');scene.innerHTML='<b id="operationVisualLabel"></b>'+graphic;qs('#shell').append(scene);
 const system=document.createElement('div');system.id='citySystemsVisual';system.className='city-system-visual';system.innerHTML='<div class="panel-overline">ARMOR / POWER GRID <b id="cityVisualState"></b></div>'+graphic.replaceAll('opHatch','systemHatch');$('infraSystems').prepend(system);
 const emblem=qs('.seq-emblem');if(emblem){emblem.classList.add('sequence-mechanism');emblem.innerHTML='<div class="sequence-mechanical">'+graphic.replaceAll('opHatch','sequenceHatch')+'</div><div class="sequence-magi-display"><div class="sequence-magi-core" data-core="MELCHIOR">MELCHIOR-1<b>待機</b></div><div class="sequence-magi-core" data-core="BALTHASAR">BALTHASAR-2<b>待機</b></div><div class="sequence-magi-core" data-core="CASPER">CASPER-3<b>待機</b></div></div>';}
 let previous=null,hideTimer=null;
 const snapshot=()=>({armor:S.infra.armor,power:S.infra.power,comms:S.infra.comms,round:S.defense.round,scans:S.defense.scans,energy:S.defense.energy,city:S.defense.city.map(c=>[c.hp,c.armor,c.turret]),units:S.evas.map(e=>[e.state,e.at,e.umbilical,e.mapSector]),charge:S.tactics.charge,vote:S.magi.vote?.time});
 function renderVisuals(){
  system.dataset.closed=String(S.infra.armor);system.dataset.power=String(S.infra.power);meteoText('cityVisualState',S.infra.armor?'SHUTTERS CLOSED':'SHUTTERS OPEN');
  const now=snapshot();if(!previous){previous=now;return;}const old=previous;previous=now;
  let kind='',label='';
  if(now.armor!==old.armor){kind=now.armor?'armor-close':'armor-open';label=now.armor?'装甲防壁を閉鎖':'装甲防壁を開放';}
  else if(now.power!==old.power||now.comms!==old.comms){kind='power';label=now.power&&now.comms?'電源・通信系統 接続':'系統切替 / 状態更新';}
  else if(now.units.some((u,i)=>JSON.stringify(u)!==JSON.stringify(old.units[i]))){const index=now.units.findIndex((u,i)=>JSON.stringify(u)!==JSON.stringify(old.units[i]));scene.dataset.unit=String(index);const sprite=scene.querySelector('.mechanism-eva');if(sprite)sprite.dataset.unit=String(index);kind='eva';label='UNIT-0'+index+' / 機体・配置・電源経路を更新';}
  else if(now.city.some((c,i)=>c[1]!==old.city[i][1])){kind='armor-close';label='防衛区画の装甲を展開';}
  else if(now.city.some((c,i)=>c[2]!==old.city[i][2])){kind='combat';label='迎撃砲台を配備';}
  else if(now.city.some((c,i)=>c[0]>old.city[i][0])){kind='repair';label='施設の復旧・修理';}
  else if(now.round!==old.round){kind='combat';label='防衛ターン更新 / 迎撃・接近';}
  else if(now.scans!==old.scans){kind='scan';label='対象波形を解析';}
  else if(now.energy!==old.energy||now.charge!==old.charge){kind='power';label='電力を配分・充填';}
  else if(now.vote!==old.vote){kind='scan';label='MAGIシステム / 決議を確定';}
  if(!kind)return;
  scene.dataset.operation=kind;scene.classList.remove('hidden','operation-running');void scene.offsetWidth;scene.classList.add('operation-running');meteoText('operationVisualLabel',label);clearTimeout(hideTimer);hideTimer=setTimeout(()=>scene.classList.add('hidden'),1700);
 }
 const oldDraw=draw;draw=function(){oldDraw();renderEvaOperations();renderStrategy();renderVisuals();};
 const oldInfra=renderInfra;renderInfra=function(){oldInfra();renderVisuals();};
 const oldEva=renderEVA;renderEVA=function(){oldEva();renderEvaOperations();};
 $('evaCable').addEventListener('click',()=>toggleEvaCable());
 initStrategy();renderEvaOperations();renderStrategy();renderVisuals();
}
initOperationVisuals();
// One shared, transparent drawing sheet serves monitors, small mechanisms and map markers.
function evaMapSector(index){const value=S.evas[index].mapSector;return [0,1,2,3].includes(value)?value:index===S.tactics.defender?3:index===S.tactics.attacker?1:2;}
async function setEvaMapSector(index,sector){
 if(![0,1,2].includes(index)||![0,1,2,3].includes(sector))return;
 if(!await backupVisualUpgrade()){renderCommandMap();return;}
 const e=S.evas[index];settleEvaPower();
 if(e.state!=='DEPLOYED'||!S.infra.comms){toast('移動不可 / 出撃状態と都市通信を確認してください。');renderCommandMap();return;}
 e.mapSector=sector;addLog('eva','UNIT-0'+index+' を '+V27_FACILITY[sector].name+' へ移動');sound('select');draw();
}
function commandMessage(page){
 const e=selected(),d=S.defense,v=S.magi.vote,s=intrusionState();
 if(page==='magi'){if(magiIntrusionActive()||(s.status==='contained'&&!v))return s.message;return v?$('magiDecision').textContent.replace(/\n/g,' ／ '):'審議内容と対象機を選択 → 決議を実行 → 三基の賛否と理由を確認';}
 if(page==='eva')return 'UNIT-0'+S.selectedEva+' ／ '+stateJP[e.state]+' ／ '+(e.state==='DEPLOYED'?(evaExternalPower(S.selectedEva)?'外部給電':'内部電源 '+Math.ceil(e.power)+'秒')+' ／ 配置：'+V27_FACILITY[evaMapSector(S.selectedEva)].name:$('evaGuidance').textContent);
 if(page==='infra')return d.status==='active'?'敵性反応 '+d.enemy.code+' ／ 接近 '+d.enemy.dist+'ターン ／ '+d.last:'都市健全性 '+v27CityIntegrity()+'% ／ '+d.last;
 if(page==='mission')return staffStageNames[S.mission.phase]+' ／ 次の指示：'+$('missionAction').textContent+' ／ '+$('staffNextHint').textContent;
 if(page==='weather')return busyWeather?'現在地と気象を取得しています。位置情報の許可を確認してください。':weatherCurrent()?(S.weather.place||'現在地')+' ／ '+$('wxFresh').textContent+' ／ '+$('wxDescription').textContent+' '+$('wxTemp').textContent+'℃ ／ '+($('weatherStatus').textContent||''):'現在地の気象が未取得です。位置情報を許可し、更新してください。';
 if(page==='tools')return '職員支援 ／ '+(S.personnel?.shift?.startedAt&&!S.personnel.shift.endedAt?'当直中':'当直待機')+' ／ タスク・引継ぎ・点検は端末内へ保存';
 return '端末設定 ／ 効果音 '+(S.prefs.sound?'ON':'OFF')+' ／ 動的表示 '+(S.prefs.motion?'ON':'OFF');
}
let commandAnnouncements={};
function announceCommand(text,page=currentPage){commandAnnouncements[page]={text,at:Date.now()};renderCommandStreams();}
function renderCommandStreams(){
 for(const page of ['weather','infra','eva','magi','mission','tools','settings']){
  const stream=qs('[data-command-stream="'+page+'"]');if(!stream)continue;
  const announcement=commandAnnouncements[page],recent=announcement&&Date.now()-announcement.at<10000?announcement.text+' ／ ':'';
  const value=recent+commandMessage(page);if(stream.dataset.message===value)continue;
  stream.dataset.message=value;for(const node of stream.querySelectorAll('.stream-text'))node.textContent=value;
  const reader=stream.querySelector('.stream-reader'),now=Date.now();if(!reader.textContent||!stream.dataset.readAt||now-Number(stream.dataset.readAt)>=10000){reader.textContent=value;stream.dataset.readAt=String(now);}
  stream.style.setProperty('--stream-duration',Math.max(18,Math.min(60,value.length*.3))+'s');
 }
}
function renderCommandMap(){
 const d=S.defense;let deployed=0;
 for(let index=0;index<3;index++){
  const e=S.evas[index],marker=$('mapEva'+index),row=qs('[data-map-unit="'+index+'"]');
  const visible=['DEPLOYED','POWER_LOST'].includes(e.state);marker.classList.toggle('v27-visual-off',!visible);row.hidden=!visible;
  if(!visible)continue;deployed++;
  const sector=evaMapSector(index),positions=[[175,248],[340,190],[520,248],[330,340]],point=positions[sector];
  const x=point[0]+(index-1)*20,y=point[1]+index*8;marker.style.transform='translate('+x+'px,'+y+'px)';marker.dataset.state=e.state;
  marker.setAttribute('aria-label','UNIT-0'+index+' / '+V27_FACILITY[sector].name+' / '+stateJP[e.state]+'。機体監視を開く');
  row.querySelector('select').value=String(sector);row.querySelector('select').disabled=e.state!=='DEPLOYED'||!S.infra.comms;
  row.querySelector('strong').textContent='UNIT-0'+index+' / '+stateJP[e.state];
 }
 meteoText('mapDefenseHint','配置変更には作戦通信が必要です。防御担当 UNIT-0'+S.tactics.defender+' のA.T.展開は、配置区画の被害を12軽減します（方針倍率前）。');
 $('mapNoEva').hidden=deployed>0;meteoText('mapEnemyName',d.status==='active'?(d.scans>=34?d.enemy.code:'UNIDENTIFIED'):'');
 meteoText('mapTargetStatus',d.status==='active'?'敵性反応：'+d.enemy.code+' / '+d.enemy.dist+'ターンで接近':d.status==='victory'?'敵性反応：沈黙を確認':'敵性反応：未検知');
}
function renderNeuralWaves(){
 const e=selected();for(const [index,wave] of all('.neural-wave').entries()){
  let path='';for(let y=0;y<=180;y+=3){const amplitude=Math.max(3,Math.min(21,e.sync/5));const x=28+Math.sin(y*.16+index+S.selectedEva)*amplitude*Math.sin(y*.053+index);path+=(y?'L':'M')+x.toFixed(1)+' '+y+' ';}wave.querySelector('path').setAttribute('d',path);
 }
}
function initCommandVisuals(){
 if(!qs('#staffSupport'))return;
 // Capture the pre-upgrade state once; explicit new persistent actions await it.
 backupVisualUpgrade();
 const map=$('v27IsoMap');
 for(let i=0;i<3;i++){
  const group=document.createElementNS('http://www.w3.org/2000/svg','g');group.id='mapEva'+i;group.classList.add('map-eva','v27-visual-off');group.setAttribute('role','button');group.setAttribute('tabindex','0');
  group.innerHTML='<rect x="-45" y="-130" width="90" height="160" fill="transparent"/><ellipse class="map-unit-platform" cx="0" cy="0" rx="32" ry="12"/><foreignObject x="-35" y="-135" width="70" height="140"><div xmlns="http://www.w3.org/1999/xhtml" class="eva-sprite" data-unit="'+i+'"></div></foreignObject><text class="map-unit-label" text-anchor="middle" y="22">UNIT-0'+i+'</text>';
  const open=()=>{S.selectedEva=i;persist();window.NERV_MOBILE.open('eva','monitor');};group.addEventListener('click',open);group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});map.append(group);
 }
 const dispatch=document.createElement('section');dispatch.id='mapDispatch';dispatch.className='map-dispatch';dispatch.innerHTML='<p id="mapTargetStatus"></p><h2>出撃機の配置 / DEPLOYMENT</h2><p id="mapDefenseHint"></p><p id="mapNoEva">出撃機なし。EVA管制で発進後、この地図に表示します。</p>';
 for(let i=0;i<3;i++){
  const row=document.createElement('div');row.className='map-unit-row';row.dataset.mapUnit=String(i);row.innerHTML='<span class="map-unit-mini eva-sprite" data-unit="'+i+'" aria-hidden="true"></span><strong>UNIT-0'+i+'</strong><label><span class="sr-only">UNIT-0'+i+'の配置</span><select data-map-sector="'+i+'">'+V27_FACILITY.map((f,j)=>'<option value="'+j+'">'+f.name+'</option>').join('')+'</select></label>';
  row.querySelector('select').addEventListener('change',event=>{setEvaMapSector(i,Number(event.target.value));});dispatch.append(row);
 }
 const routes=document.createElement('nav');routes.className='staff-route';routes.innerHTML='<button data-route="eva/control">EVA発進管制 ↗</button><button data-route="infra/facilities">施設・迎撃操作 ↗</button>';dispatch.append(routes);
 // A dedicated dispatch tab keeps the mobile map short even with all three units deployed.
 const infra=mobileGroups.infra,panel=document.createElement('section');panel.className='mobile-view';panel.dataset.view='deployment';panel.id='mobile-infra-deployment';panel.setAttribute('role','tabpanel');panel.setAttribute('aria-label','機体配置');panel.hidden=true;panel.append(dispatch);qs('.page[data-page="infra"]').append(panel);infra.panels.push(panel);
 const tab=document.createElement('button');tab.type='button';tab.dataset.mobileTab='infra/deployment';tab.textContent='機体配置';tab.setAttribute('role','tab');tab.setAttribute('aria-controls',panel.id);tab.setAttribute('aria-selected','false');tab.tabIndex=-1;tab.addEventListener('click',()=>mobileNavigate('infra','deployment'));infra.nav.insertBefore(tab,infra.nav.children[1]);
 const mapLinks=document.createElement('nav');mapLinks.className='staff-route map-links';mapLinks.innerHTML='<button data-route="infra/deployment">機体配置・移動 ↗</button><button data-route="infra/facilities">施設・迎撃 ↗</button>';map.after(mapLinks);
 // All new route controls share one handler and target actual page/subsection pairs.
 document.addEventListener('click',event=>{const link=event.target.closest('[data-route]');if(!link)return;const [page,view]=link.dataset.route.split('/');window.NERV_MOBILE.open(page,view);});
 for(const page of ['weather','infra','eva','magi','mission','tools','settings']){
  const root=qs('.page[data-page="'+page+'"]'),stream=document.createElement('section');stream.className='command-stream';stream.dataset.commandStream=page;stream.setAttribute('aria-label','現在の状況');
  stream.innerHTML='<div class="stream-tag">STATUS</div><div class="stream-window" tabindex="0" aria-label="状況テキスト。停止ボタンで横流れを停止できます"><div class="stream-track" aria-hidden="true"><span class="stream-text"></span><span class="stream-text"></span></div></div><p class="stream-reader sr-only" role="status" aria-live="polite"></p><button class="stream-stop" aria-label="状況の横流れを停止" aria-pressed="false">Ⅱ</button>';
  const nav=root.querySelector('.mobile-tabs');nav.after(stream);
  stream.querySelector('button').addEventListener('click',event=>{const paused=stream.classList.toggle('stream-paused');event.currentTarget.setAttribute('aria-pressed',String(paused));event.currentTarget.setAttribute('aria-label',paused?'状況の横流れを再開':'状況の横流れを停止');event.currentTarget.textContent=paused?'▶':'Ⅱ';});
 }
 const splash=document.createElement('div');splash.id='commandSplash';splash.className='command-splash hidden';splash.setAttribute('aria-hidden','true');splash.innerHTML='<i></i><small>NERV / CONTROL LINK</small><strong></strong>';qs('#shell').append(splash);
 let splashTimer=null,lastPage=currentPage;
 window.addEventListener('nerv-route',event=>{const page=event.detail.page;renderCommandStreams();renderCommandMap();if(isMoving()&&lastPage!==page&&page!=='home'){splash.querySelector('strong').textContent=qs('.page[data-page="'+page+'"] h1')?.textContent?.split('/')[0]||'気象監視';splash.classList.remove('hidden','splash-running');void splash.offsetWidth;splash.classList.add('splash-running');clearTimeout(splashTimer);splashTimer=setTimeout(()=>splash.classList.add('hidden'),550);}lastPage=page;});
 const oldDraw=draw;draw=function(){oldDraw();renderCommandMap();renderMagiIntrusion();renderCommandStreams();};
 const oldToast=toast;toast=function(text){oldToast(text);announceCommand(text);};
 const oldLog=addLog;addLog=function(type,text){oldLog(type,text);if(['infra','eva','magi','mission'].includes(type))announceCommand(text,type);};
 // Tiny EVA displays use precisely the same three drawings as the large monitor.
 for(const path of all('.op-eva'))path.remove();
 for(const holder of all('#operationVisual,.sequence-mechanical')){const unit=document.createElement('div');unit.className='mechanism-eva eva-sprite';unit.dataset.unit=String(S.selectedEva);unit.setAttribute('aria-hidden','true');holder.append(unit);}
 for(const side of ['left','right']){const wave=document.createElementNS('http://www.w3.org/2000/svg','svg');wave.setAttribute('viewBox','0 0 56 180');wave.setAttribute('aria-hidden','true');wave.classList.add('neural-wave','neural-'+side);wave.innerHTML='<path fill="none"/><line class="neural-sweep" x1="0" y1="0" x2="56" y2="0"/>';qs('#evaArtwork').append(wave);}
 const oldEva=renderEVA;renderEVA=function(){oldEva();for(const unit of all('.mechanism-eva'))unit.dataset.unit=unit.closest('#operationVisual')?($('operationVisual').dataset.unit||String(S.selectedEva)):String(S.selectedEva);renderNeuralWaves();renderCommandStreams();};renderNeuralWaves();
 renderCommandMap();renderCommandStreams();renderMagiIntrusion();
 // A restored URL can address the dynamically added deployment tab.
 if(location.hash==='#infra/deployment')window.NERV_MOBILE.open('infra','deployment');
}
initCommandVisuals();
})();
