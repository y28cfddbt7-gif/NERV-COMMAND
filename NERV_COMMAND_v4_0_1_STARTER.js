// NERV COMMAND 4.0.1 / SMALL STARTER
// Copy this small script. The full illustrated app is downloaded once and kept locally.
// Widgets use the native code below and never download or evaluate the large app.
// NERV COMMAND TERMINAL v2.9 / 07f2242 VISUAL COMMAND BASELINE - Single-file Scriptable edition
// 生活データ: 現在時刻・端末電池・現在地の実天気・ユーザーのタスク。
// 第3新東京市/EVA/MAGI/作戦は架空のローカルシミュレーション。
// 天気更新の位置情報は操作時（またはユーザーが有効化した次回起動時）のみ利用。
const fm = FileManager.local();
const statePath = fm.joinPath(fm.libraryDirectory(), 'nerv_command_v2_state.json');
const backupPath = fm.joinPath(fm.libraryDirectory(), 'nerv_command_v2_state_pre_v2_7_backup.json');
try { if (fm.fileExists(statePath) && !fm.fileExists(backupPath)) fm.copy(statePath, backupPath); } catch (e) { console.warn('State backup failed: '+e); }
const lastGoodPath=fm.joinPath(fm.libraryDirectory(),'nerv_command_v2_state_last_good.json');
const worldBackupPath=fm.joinPath(fm.libraryDirectory(),'nerv_command_v2_state_before_world.json');
let storedState=null,stateRecovery=null;
function nativeValidState(raw){try{const value=JSON.parse(raw);return value&&typeof value==='object'&&!Array.isArray(value)?value:null;}catch(error){return null;}}
try{
 if(fm.fileExists(statePath)){
  const raw=fm.readString(statePath);storedState=nativeValidState(raw);
  if(!storedState){
   let quarantine=fm.joinPath(fm.libraryDirectory(),'nerv_command_corrupt_'+Date.now()+'.txt'),i=0;while(fm.fileExists(quarantine))quarantine=fm.joinPath(fm.libraryDirectory(),'nerv_command_corrupt_'+Date.now()+'_'+(++i)+'.txt');
   try{
    fm.copy(statePath,quarantine);
    if(fm.fileExists(lastGoodPath))storedState=nativeValidState(fm.readString(lastGoodPath));
    stateRecovery={recovered:true,blocked:false,source:storedState?'last-good':'defaults',message:storedState?'破損データを別保存し、直前の正常保存から復旧しました。':'破損データを別保存しました。正常な控えがないため初期状態で開いています。'};
   }catch(error){stateRecovery={blocked:true,message:'破損データを退避できないため、元の保存ファイルへの書込みを停止しています。'};}
  }
 }
}catch(error){stateRecovery={blocked:true,message:'保存ファイルを読み取れないため、書込みを停止しています。'};}
function getBatteryInfo() {
  try { return {level:Math.round(Device.batteryLevel()*100),charging:Device.isCharging()}; }
  catch(e){return {level:null,charging:false};}
}
const deviceInfo = getBatteryInfo();
if (config.runsInWidget || config.runsInAccessoryWidget) {
  // Native terminal composition, cached local state only; no WebView or requests.
  const w = new ListWidget();
  w.backgroundColor = new Color('#060e0a');
  if(typeof LinearGradient!=='undefined'){
    const gradient=new LinearGradient();gradient.colors=[new Color('#18251a'),new Color('#030906')];gradient.locations=[0,1];w.backgroundGradient=gradient;
  }
  const family = String(config.widgetFamily || 'medium');
  const accessory = family.indexOf('accessory') === 0;
  const addLine = (value,size,color,bold,parent=w)=>{
    const x=parent.addText(String(value));
    x.font=bold?(Font.boldMonospacedSystemFont||Font.boldSystemFont)(size):(Font.monospacedSystemFont||Font.mediumSystemFont)(size);
    x.textColor=new Color(color);x.lineLimit=1;x.minimumScaleFactor=.65;return x;
  };
  const state=storedState||{},units=Array.isArray(state.evas)?state.evas:[],intrusion=state.magi?.intrusion;
  const security=state.world?.security?.case,securityWatch=!!security&&['detected','accepted','collecting','analyzing','analyzed','decision','reported','failed'].includes(security.stage);
  const critical=!!state.world?.magiOps?.active||!!(state.world?.angels?.active&&state.defense?.status==='active'&&state.world.angels.active.caseNo===state.defense.caseNo)||security?.stage==='failed'||state.infra?.power===false||state.infra?.comms===false||units.some(e=>e?.state==='POWER_LOST')||['detected','isolated','analyzed','countermeasure','failed'].includes(intrusion?.status)||['detected','analyzed','protected','failed'].includes(state.magi?.externalDefense?.status)||!!(Array.isArray(state.world?.events)&&state.world.events.some(e=>e?.kind==='magi-cooling'&&e.status!=='resolved')&&(state.world?.cooling?.mode==='isolated'||state.world?.cooling?.load>=90));
  const operating=state.defense?.status==='active'||units.some(e=>e?.state==='DEPLOYED');
  const accent=critical?'#ff704d':operating||securityWatch?'#ffb34d':'#a6d5aa';
  const status=!storedState?'NO SAVED DATA':critical?'EMERGENCY / SIM':operating?'OPERATION / SIM':securityWatch?'SECURITY / SIM':'LOCAL / SAVED';
  const dutyOrders=Array.isArray(state.personnel?.dispatch?.orders)?state.personnel.dispatch.orders.filter(o=>o&&['active','ready'].includes(o.status)).length:0;
  const count=Array.isArray(state.tasks)?state.tasks.filter(t=>t&&!t.done).length:0;
  const group=(parent,horizontal)=>{if(!parent.addStack)return parent;const stack=parent.addStack();if(horizontal)stack.layoutHorizontally();else stack.layoutVertically();return stack;};
  try {
    if (accessory) {
      w.setPadding(0,0,0,0);
      if(family==='accessoryCircular'){
        addLine('NERV',12,'#ffe0ae',true);
        addLine(critical?'警戒':securityWatch?'保安照合':dutyOrders?'受命 '+dutyOrders:storedState?'保存値':'未取得',10,accent,true);
      }else if(family==='accessoryInline'){
        addLine('NERV | '+(critical?'警戒 / SIM':securityWatch?'保安照合 / SIM':dutyOrders?'受命 '+dutyOrders:'COMMAND'),12,'#f4c188',true);
      }else{
        addLine('NERV / '+(critical?'警戒 SIM':securityWatch?'保安照合 SIM':'COMMAND'),12,'#f6ba70',true);
        addLine('TASK '+count+' / ORDER '+dutyOrders,11,'#a8e6bd',false);
      }
    }else{
      const small=family==='small';w.setPadding(small?11:14,12,11,12);
      const header=group(w,true);header.backgroundColor=new Color('#28331c');if(header.setPadding)header.setPadding(5,6,5,6);
      addLine('▰ NERV / CENTRAL',small?11:13,'#ffc174',true,header);
      w.addSpacer(small?5:8);addLine(status,9,accent,true);
      const clock=new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
      const charge=Number.isFinite(deviceInfo.level)?deviceInfo.level+'%':'--%';
      addLine('◷ '+clock+'   ▰ '+charge+(deviceInfo.charging?' ϟ':''),small?10:11,'#c3d8b6',false);

      const body=group(w,!small),left=group(body,false);
      addLine('TASKS  '+count+' OPEN',small?11:12,'#a9e0b4',true,left);
      const current=storedState?.weather?.raw?.current;
      if(current && Number.isFinite(current.temperature_2m)){
        left.addSpacer(3);
        addLine((current.weather_code===0?'☀ ':Number.isFinite(current.weather_code)?'☁ ':'◌ ')+'WX 保存値  '+Math.round(current.temperature_2m)+'°C',10,'#d6ad75',false,left);
      }
      const city=storedState?.defense;
      if(city && city.status) addLine('TOKYO-3  '+String(city.status).toUpperCase(),small?9:10,'#95e4c0',true,left);
      if(small){if(dutyOrders)addLine('受命 '+dutyOrders+' 件',10,'#ffbc6c',true);}
      else{
        body.addSpacer(10);const right=group(body,false);addLine('ORDERS '+dutyOrders+' OPEN',11,'#ffbd6e',true,right);
        const selected=Number.isInteger(state.selectedEva)?state.selectedEva:0,e=units[selected];
        addLine('UNIT-0'+selected+' / '+(e?.state||'未取得'),9,'#aec9b0',false,right);
        if(Number.isFinite(e?.sync))addLine('SYNC '+e.sync.toFixed(1)+'% / SIM',9,'#aec9b0',false,right);
        if(family==='large'){
          w.addSpacer(10);addLine('PILOT INTERFACE / SIM',10,'#ffc174',true);
          for(let i=0;i<3;i++)addLine(['REI','SHINJI','ASUKA'][i]+' / '+(units[i]?.state||'未取得'),11,'#b2d4b6',false);
          const merit=Number(state.personnel?.dispatch?.merit)||0;w.addSpacer(6);addLine('DUTY MERIT '+merit+' PT',10,'#ffc174',true);
        }
        w.addSpacer(5);addLine('LOCAL SNAPSHOT / 保存状態',8,'#9d9d79',false);
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

  Script.complete();
} else {
  const runtimeURL="https://raw.githubusercontent.com/y28cfddbt7-gif/NERV-COMMAND/da7f4bdaab5b4e3576db36ca01f2dda28cd955de/NERV_COMMAND_v4_0_1_SCRIPTABLE.js",runtimeSHA="916f76a11b7e333e2b97aefe8571ccd9f50b8f2b9f71340d3298929048d9df0d";
  const cachePath=fm.joinPath(fm.libraryDirectory(),'nerv_runtime_'+runtimeSHA+'.js');
  // SHA-256 over UTF-8 using 64-byte compression blocks. No external library.
  function runtimeDigest(text){
    const input=unescape(encodeURIComponent(text));
    const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],W=new Int32Array(64);
    const rotate=(n,b)=>(n>>>b)|(n<<(32-b)),length=input.length,total=Math.ceil((length+9)/64)*64;
    for(let offset=0;offset<total;offset+=64){
      for(let i=0;i<16;i++){
        let word=0;for(let j=0;j<4;j++){const at=offset+i*4+j;let byte=at<length?input.charCodeAt(at):at===length?128:0;
          if(at>=total-8){const bits=length*8;byte=at<total-4?Math.floor(bits/4294967296)>>>((total-5-at)*8)&255:(bits>>>((total-1-at)*8))&255;}
          word=(word<<8)|byte;
        }W[i]=word;
      }
      for(let i=16;i<64;i++){const a=W[i-15],b=W[i-2];W[i]=(W[i-16]+(rotate(a,7)^rotate(a,18)^(a>>>3))+W[i-7]+(rotate(b,17)^rotate(b,19)^(b>>>10)))|0;}
      let [a,b,c,d,e,f,g,h]=H;
      for(let i=0;i<64;i++){const t1=(h+(rotate(e,6)^rotate(e,11)^rotate(e,25))+((e&f)^(~e&g))+K[i]+W[i])|0,t2=((rotate(a,2)^rotate(a,13)^rotate(a,22))+((a&b)^(a&c)^(b&c)))|0;h=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0;}
      [a,b,c,d,e,f,g,h].forEach((v,i)=>H[i]=(H[i]+v)|0);
    }
    return H.map(n=>(n>>>0).toString(16).padStart(8,'0')).join('');
  }
  try{
    let runtime=fm.fileExists(cachePath)?fm.readString(cachePath):null;
    if(runtime===null||runtimeDigest(runtime)!==runtimeSHA){
      const request=new Request(runtimeURL);request.timeoutInterval=90;
      const downloaded=await request.loadString();
      if(runtimeDigest(downloaded)!==runtimeSHA)throw Error('本体の検証に失敗しました。通信を確認し、最新の起動版をコピーしてください。');
      const temporary=cachePath+'.download';fm.writeString(temporary,downloaded);
      if(runtimeDigest(fm.readString(temporary))!==runtimeSHA)throw Error('本体の保存を検証できませんでした。空き容量を確認してください。');
      fm.writeString(cachePath,downloaded);if(fm.remove)fm.remove(temporary);runtime=downloaded;
    }
    // Keep the verified current runtime and one previous runtime; never touch save/backup files.
    try {
      if(fm.listContents&&fm.modificationDate&&fm.remove){
        const root=fm.libraryDirectory();
        for(const name of fm.listContents(root).filter(name=>/^nerv_runtime_[0-9a-f]{64}\.js\.download$/.test(name)))fm.remove(fm.joinPath(root,name));
        const previous=fm.listContents(root).filter(name=>/^nerv_runtime_[0-9a-f]{64}\.js$/.test(name)).map(name=>fm.joinPath(root,name)).filter(path=>path!==cachePath).sort((a,b)=>Number(fm.modificationDate(b))-Number(fm.modificationDate(a)));
        for(const path of previous.slice(1))fm.remove(path);
      }
    } catch(cacheCleanupError) { /* Cleanup failure never blocks a verified launch. */ }
    // Direct eval preserves Scriptable API bindings; the async scope isolates app constants.
    await eval('(async function(){\n'+runtime+'\n})()');
  }catch(error){
    const notice=new Alert();notice.title='NERV / 起動を完了できません';notice.message=String(error.message||error).slice(0,500)+'\n\n初回はインターネット接続が必要です。保存済みの業務データは削除していません。';notice.addAction('閉じる');await notice.presentAlert();Script.complete();
  }
}
