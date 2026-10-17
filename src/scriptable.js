// NERV COMMAND TERMINAL v2.8 PERSONNEL & COMMAND - Single-file Scriptable edition
// 生活データ: 現在時刻・端末電池・現在地の実天気・ユーザーのタスク。
// 第3新東京市/EVA/MAGI/作戦は架空のローカルシミュレーション。
// 天気更新の位置情報は操作時（またはユーザーが有効化した次回起動時）のみ利用。
const fm = FileManager.local();
const statePath = fm.joinPath(fm.libraryDirectory(), 'nerv_command_v2_state.json');
const backupPath = fm.joinPath(fm.libraryDirectory(), 'nerv_command_v2_state_pre_v2_7_backup.json');
try { if (fm.fileExists(statePath) && !fm.fileExists(backupPath)) fm.copy(statePath, backupPath); } catch (e) { console.warn('State backup failed: '+e); }
const personnelBackupPath = fm.joinPath(fm.libraryDirectory(), 'nerv_command_v2_state_pre_v2_8_backup.json');
try { if (fm.fileExists(statePath) && !fm.fileExists(personnelBackupPath)) fm.copy(statePath, personnelBackupPath); } catch (e) { console.warn('Personnel state backup failed: '+e); }
let storedState = null;
try { if (fm.fileExists(statePath)) storedState = JSON.parse(fm.readString(statePath)); } catch (e) { console.warn('State read failed: '+e); }
function getBatteryInfo() {
  try { return {level:Math.round(Device.batteryLevel()*100),charging:Device.isCharging()}; }
  catch(e){return {level:null,charging:false};}
}
const deviceInfo = getBatteryInfo();
const htmlSource = @@HTML_JSON@@;
const bootData = JSON.stringify({state:storedState,battery:deviceInfo.level,charging:deviceInfo.charging});
const bootScript = '<script>window.__SCRIPTABLE__=true;window.__BOOT__='+bootData.replace(/</g,'\\u003c')+';<'+ '/script>';
const html = htmlSource.replace('<script>',bootScript+'<script>');
if (config.runsInWidget || config.runsInAccessoryWidget) {
  // Lightweight fail-safe widget; family-aware, no WebView or network request.
  const w = new ListWidget();
  w.backgroundColor = new Color('#11140f');
  const family = String(config.widgetFamily || 'medium');
  const accessory = family.indexOf('accessory') === 0;
  const addLine = (value,size,color,bold)=>{
    const x=w.addText(String(value));
    x.font=bold?Font.boldSystemFont(size):Font.mediumSystemFont(size);
    x.textColor=new Color(color);x.lineLimit=1;x.minimumScaleFactor=.65;return x;
  };
  try {
    if (accessory) {
      w.setPadding(0,0,0,0);
      if(family==='accessoryCircular'){
        addLine('NERV',12,'#ffe0ae',true);
      }else if(family==='accessoryInline'){
        addLine('NERV | COMMAND',12,'#f4c188',true);
      }else{
        addLine('NERV / COMMAND',12,'#f6ba70',true);
        const n=Array.isArray(storedState?.tasks)?storedState.tasks.filter(t=>!t.done).length:0;
        addLine('TASK '+n+' OPEN',11,'#a8e6bd',false);
      }
    }else{
      w.setPadding(family==='small'?12:16,14,12,14);
      addLine('◆ NERV / OPERATIONS',family==='small'?12:14,'#ffb55c',true);
      w.addSpacer(6);
      addLine('COMMAND TERMINAL',family==='small'?12:19,'#f8d4a0',true);
      w.addSpacer(4);
      const count=Array.isArray(storedState?.tasks)?storedState.tasks.filter(t=>t&&!t.done).length:0;
      addLine('TASKS  '+count+' OPEN',12,'#94dfae',true);
      const current=storedState?.weather?.raw?.current;
      if(current && Number.isFinite(current.temperature_2m)){
        w.addSpacer(4);
        addLine('WX 保存値  '+Math.round(current.temperature_2m)+'°C',11,'#d6ad75',false);
      }
      const city=storedState?.defense;
      if(city && city.status) addLine('TOKYO-3  '+String(city.status).toUpperCase(),11,'#95e4c0',true);
      if(family!=='small'){
        w.addSpacer(6);
        addLine('TOKYO-3 / PERSONAL TERMINAL',10,'#9d8b70',false);
      }
    }
    w.url = 'scriptable:///run?scriptName=' + encodeURIComponent(Script.name());
    w.refreshAfterDate = new Date(Date.now()+30*60*1000);
    Script.setWidget(w);
  } catch (widgetError) {
    // An unexpected data/layout error must not leave an empty widget.
    const fallback = new ListWidget();
    fallback.backgroundColor = new Color('#151510');
    const label = fallback.addText('NERV COMMAND');
    label.font = Font.boldSystemFont(14);label.textColor = new Color('#ffd19e');
    fallback.url='scriptable:///run?scriptName='+encodeURIComponent(Script.name());
    Script.setWidget(fallback);
    console.warn('Widget fallback: '+String(widgetError));
  }
} else {
  const web = new WebView();
  await web.loadHTML(html);
  let shown = true;
  async function weatherFromCurrentLocation(){
    Location.setAccuracyToHundredMeters();
    const loc=await Location.current();
    const lat=loc.latitude,lon=loc.longitude;
    if (!Number.isFinite(lat)||!Number.isFinite(lon)) throw new Error('有効な位置情報が取得できません');
    const api='https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(lat)+'&longitude='+encodeURIComponent(lon)+'&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code&forecast_days=2&timezone=auto';
    const r=new Request(api);r.timeoutInterval=18;
    const data=await r.loadJSON();
    if(!data?.current || !data?.hourly)throw new Error('気象APIから有効なデータを取得できません');
    let place='現在地';
    try{const geos=await Location.reverseGeocode(lat,lon,'ja-JP');if(geos?.length){const g=geos[0];place=g.locality||g.subLocality||g.administrativeArea||'現在地';}}catch(e){}
    return {weather:data,place,updated:Date.now()};
  }
  async function handle(job){
    if(job.action==='persist'){
      const s=JSON.stringify(job.payload?.state||{});
      if(s.length>200000)return {error:'保存容量を超過しました'};
      fm.writeString(statePath,s);return {ok:true};
    }
    if(job.action==='weather')return await weatherFromCurrentLocation();
    if(job.action==='mapLocation'){
      Location.setAccuracyToHundredMeters();
      const loc=await Location.current();
      if(!Number.isFinite(loc.latitude)||!Number.isFinite(loc.longitude))throw Error('緯度経度を取得できません');
      return {lat:loc.latitude,lng:loc.longitude};
    }
    if(job.action==='battery')return getBatteryInfo();
    return {error:'未対応操作です'};
  }
  const bridge=(async()=>{
    while(shown){
      let jobs=[];
      try {jobs=await web.evaluateJavaScript('setTimeout(function(){ completion(window.__nervQueue ? window.__nervQueue.splice(0,12) : []); }, 400);',true);}
      catch(e){if(shown)console.warn('Bridge paused: '+e);break;}
      if(!Array.isArray(jobs))continue;
      for(const job of jobs){
        let result;
        try{result=await handle(job);}catch(e){result={error:String(e.message||e)};}
        try{await web.evaluateJavaScript('window.__nervDeliver('+JSON.stringify(job.id)+','+JSON.stringify(result).replace(/</g,'\\u003c')+');',false);}
        catch(e){if(shown)console.warn('Deliver failed: '+e);}
      }
    }
  })();
  try {await web.present(false);}finally{shown=false;}
}
Script.complete();
