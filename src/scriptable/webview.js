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
    return {weather:data,place,position:{lat,lon},updated:Date.now()};
  }
  async function handle(job){
    if(job.action==='clipboard'){Pasteboard.copyString(String(job.payload?.text||''));return {ok:true};}
    if(job.action==='backupWorld'){
      const snapshot=JSON.stringify(job.payload?.state||{});if(snapshot.length>200000)return {error:'当直バックアップ容量を超過しました'};
      const base=worldBackupPath+(job.payload?.extension==='v212-messages'?'.v212-messages':'');let path=base;
      if(job.payload?.quarantine){path=base+'.repair-'+Date.now();let i=0;while(fm.fileExists(path))path=base+'.repair-'+Date.now()+'-'+(++i);}
      if(!fm.fileExists(path))fm.writeString(path,snapshot);return {ok:true};
    }
    if(job.action==='backupUpgrade'){
      const snapshot=JSON.stringify(job.payload?.state||{});if(snapshot.length>200000)return {error:'バックアップ容量を超過しました'};
      const path=fm.joinPath(fm.libraryDirectory(),'nerv_command_v2_state_before_visual_upgrade.json');if(!fm.fileExists(path))fm.writeString(path,snapshot);return {ok:true};
    }
    if(job.action==='backupState'){
      const snapshot=JSON.stringify(job.payload?.state||{});
      if(snapshot.length>200000)return {error:'バックアップ容量を超過しました'};
      fm.writeString(fm.joinPath(fm.libraryDirectory(),'nerv_command_v2_state_before_alert_clear.json'),snapshot);return {ok:true};
    }
    if(job.action==='persist'){
      const s=JSON.stringify(job.payload?.state||{});
      if(s.length>200000)return {error:'保存容量を超過しました'};
      if(stateRecovery?.blocked)return {error:stateRecovery.message};
      const previous=fm.fileExists(statePath)?fm.readString(statePath):null;
      if(previous&&nativeValidState(previous))fm.writeString(lastGoodPath,previous);
      try{fm.writeString(statePath,s);}catch(error){if(previous&&nativeValidState(previous)){try{fm.writeString(statePath,previous);}catch(restoreError){}}throw error;}
      return {ok:true};
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
