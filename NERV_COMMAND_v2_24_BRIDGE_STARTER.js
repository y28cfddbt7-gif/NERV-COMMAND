// NERV COMMAND 2.24 / VERIFIED BRIDGE STARTER
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
  const runtimeURL="https://raw.githubusercontent.com/y28cfddbt7-gif/NERV-COMMAND/545fd38dcf74b5752c7d65a92f8c4ef2eb455bf6/NERV_COMMAND_v2_23_SCRIPTABLE.js",runtimeSHA="9133a3e4c0029579ee7cb0d90a8b6338e5436f90b99c6f218292d2a628b7704f";
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
    // Verify v2.23 before applying the overlay in memory. The cached original is untouched.
    if(!runtime.includes('const htmlSource = ')||!runtime.includes('const bootData = JSON.stringify('))throw Error('v2.23本体との互換性を確認できません。');
    runtime=runtime.replace('const htmlSource = ','let htmlSource = ');
    runtime=runtime.replace('const bootData = JSON.stringify(',"htmlSource=htmlSource.replace('TERMINAL 2.23','TERMINAL 2.24').replace('</head>','<style>'+\"/* v2.24: pure overlay/readout styling. NEVER modify original artwork or its renderers. */\\n.v224-command-deck{--v224-edge:#527078;position:relative;isolation:isolate;margin:4px 0 12px;max-width:100%;min-width:0;padding:9px 10px 10px;color:#dbe8db;background:linear-gradient(110deg,#0c1b23ee,#0c151bee);border:1px solid #42616f;box-shadow:inset 0 0 0 1px #122b35,0 4px 12px #0005;font-family:var(--ui-font,system-ui)}\\n.v224-command-deck[data-condition=watch]{--v224-edge:#dc9848;border-color:#946a38}.v224-command-deck[data-condition=critical]{--v224-edge:#f05a4b;border-color:#a7473e}\\n.v224-title{display:flex;justify-content:space-between;align-items:center;gap:8px;border-bottom:1px solid #42616f78;padding:0 0 6px;font:750 10px ui-monospace,monospace;letter-spacing:.09em;color:#b2d4d4}\\n.v224-title small{font:9px ui-monospace,monospace;letter-spacing:0;color:#7caca8;margin-left:3px}.v224-title b{font:800 9px ui-monospace,monospace;color:var(--v224-edge);white-space:nowrap}\\n.v224-main{display:grid;grid-template-columns:104px minmax(0,1fr);gap:11px;align-items:center;margin:9px 0}\\n.v224-scope{height:102px;width:102px;position:relative;overflow:hidden;border:1px solid #52736a;border-radius:50%;background:repeating-radial-gradient(circle at 50% 50%,transparent 0 21px,#62d5b224 22px 23px,transparent 24px 37px),linear-gradient(90deg,transparent 49.6%,#4abaaa30 50%,transparent 50.4%),linear-gradient(#12242c,#061115);box-shadow:inset 0 0 25px #0009,0 0 12px #22695e36}\\n.v224-scope:before,.v224-scope:after{content:'';position:absolute;inset:0;pointer-events:none}.v224-scope:before{background:linear-gradient(90deg,transparent 49.5%,#87fbd658 50%,transparent 50.5%)}.v224-scope:after{background:linear-gradient(transparent 49.5%,#87fbd658 50%,transparent 50.5%)}\\n.v224-scope-grid{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 13px,#88e4ba12 14px,transparent 15px)}\\n.v224-scope-beam{position:absolute;inset:-3px;border-radius:50%;background:conic-gradient(from 0deg,transparent 0 282deg,#1d826a10 295deg,#63ebaf75 359deg,transparent 360deg);animation:v224-rotate 5.5s linear infinite}\\n.v224-scope-ping{position:absolute;width:7px;height:7px;top:26%;left:65%;border-radius:50%;background:#dba75d;box-shadow:0 0 8px 3px #d68a4488;animation:v224-ping 2.9s ease-in-out infinite}\\n.v224-scope strong{position:absolute;bottom:13px;left:0;right:0;text-align:center;font:800 10px ui-monospace,monospace;color:#addbc0;text-shadow:0 1px 8px #000}\\n.v224-readouts{display:grid;grid-template-columns:1fr 1fr;gap:7px;min-width:0}.v224-readouts>div{min-width:0;border-left:2px solid #406778;padding:3px 3px 3px 7px;background:linear-gradient(90deg,#54707017,transparent)}\\n.v224-readouts small{display:block;font:8px ui-monospace,monospace;color:#85b3bc;line-height:1.3;letter-spacing:.03em}\\n.v224-readouts b{display:block;margin-top:4px;font:700 10px/1.4 var(--ui-font,system-ui);overflow-wrap:anywhere;color:#d6e6df}\\n.v224-control{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}\\n.v224-control button{min-height:44px!important;margin:0!important;padding:7px 2px!important;border:1px solid #557583!important;background:linear-gradient(#233b49,#132731)!important;color:#def1dc!important;font:750 10px/1.2 var(--ui-font,system-ui)!important;touch-action:manipulation}\\n.v224-control button:active{background:#365669!important}.v224-control button:focus-visible{outline:2px solid #eeb77c;outline-offset:2px}\\n.v224-dispatch{border-top:1px solid #4d646b80;min-height:16px;margin:7px 0 0!important;padding:6px 0 0;font:9px/1.45 ui-monospace,monospace;color:#b4cec3}\\n.v224-map-layer{position:absolute;z-index:6;pointer-events:none;overflow:hidden;isolation:isolate;border:1px solid #47b2a735;box-sizing:border-box}\\n.v224-map-sweep{position:absolute;inset:-60%;background:conic-gradient(from 0deg,transparent 0 260deg,#4edcb009 305deg,#53e9c542 352deg,transparent 360deg);animation:v224-rotate 9s linear infinite;opacity:.65}\\n.v224-map-reticle{position:absolute;inset:6px;border:1px dashed #9ef1cb30;background:linear-gradient(90deg,transparent 49.8%,#71ceab35 50%,transparent 50.2%),linear-gradient(transparent 49.8%,#71ceab35 50%,transparent 50.2%)}\\n.v224-map-layer[data-condition=critical]{border-color:#fa6c585c}.v224-map-layer[data-condition=critical] .v224-map-reticle{border-color:#ff8f624d}\\n@keyframes v224-rotate{to{transform:rotate(360deg)}}@keyframes v224-ping{0%,100%{opacity:.32;transform:scale(.7)}42%{opacity:1;transform:scale(1.18)}}\\nbody[data-v224-motion=off] .v224-command-deck *,body[data-v224-motion=off] .v224-map-layer *{animation-play-state:paused!important;transition:none!important}\\n@media(prefers-reduced-motion:reduce){.v224-command-deck *,.v224-map-layer *{animation:none!important}}\\n@media(max-width:350px){.v224-main{grid-template-columns:82px minmax(0,1fr);gap:7px}.v224-scope{width:80px;height:80px}.v224-readouts{gap:4px}.v224-readouts b{font-size:9px}.v224-control button{font-size:9px!important}}\\n\"+'</style></head>').replace('</body>','<script>'+\"// v2.24: presentation-only command dynamics. Read simulation state; never mutate it.\\n// Uses the shared Anime.js/NERV_FX scheduler. No independent RAF, timer or network calls.\\nfunction initV224CommandDynamics(){\\n if(!document.body||!document.getElementById('shell')||!window.NERV_MOTION||!window.NERV_MOBILE)return;\\n const shell=document.getElementById('shell');\\n const deck=document.createElement('section');\\n deck.id='v224CommandDeck';deck.className='v224-command-deck';deck.setAttribute('aria-label','管制テレメトリ / 模擬訓練');\\n deck.innerHTML='<div class=\\\"v224-title\\\"><span>TACTICAL DATA LINK <small>SIMULATION / 訓練データ</small></span><b id=\\\"v224Condition\\\">STANDBY</b></div>'+\\n  '<div class=\\\"v224-main\\\"><div class=\\\"v224-scope\\\" aria-hidden=\\\"true\\\"><i class=\\\"v224-scope-grid\\\"></i><i class=\\\"v224-scope-beam\\\"></i><i class=\\\"v224-scope-ping\\\"></i><strong id=\\\"v224ScopeTarget\\\">00</strong></div>'+\\n  '<div class=\\\"v224-readouts\\\"><div><small>TACTICAL TRACK / 目標</small><b id=\\\"v224Track\\\">監視待機</b></div>'+\\n  '<div><small>MAGI / 三基管制</small><b id=\\\"v224Magi\\\">照合待機</b></div>'+\\n  '<div><small>EVA / 作戦配備</small><b id=\\\"v224Eva\\\">0 / 3 配備</b></div>'+\\n  '<div><small>COMMS / 通信</small><b id=\\\"v224Link\\\">LINK READY</b></div></div></div>'+\\n  '<div class=\\\"v224-control\\\"><button type=\\\"button\\\" data-v224-jump=\\\"infra/map\\\">戦術MAP</button>'+\\n  '<button type=\\\"button\\\" data-v224-jump=\\\"magi/main\\\">MAGI審議</button>'+\\n  '<button type=\\\"button\\\" data-v224-jump=\\\"battle/engage\\\">作戦指揮</button>'+\\n  '<button type=\\\"button\\\" data-v224-jump=\\\"work/communications\\\">通信</button></div>'+\\n  '<p class=\\\"v224-dispatch\\\" id=\\\"v224Dispatch\\\" role=\\\"status\\\" aria-live=\\\"polite\\\">当直端末と同期 / 操作は各担当画面で実行</p>';\\n const $v=id=>deck.querySelector('#'+id);\\n const values=new Map();const layers=new Map();let changeCount=0,signalCount=0,routeCount=0,lastSignature=null,lastCondition=null;\\n function put(id,text){const e=$v(id),v=String(text);if(e&&values.get(id)!==v){e.textContent=v;values.set(id,v);}}\\n function moving(){return !document.hidden&&typeof isMoving==='function'&&isMoving()&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches;}\\n function phaseName(x){return {approval:'発進承認',placement:'MAP配置',field:'交戦中'}[x]||'状況監視';}\\n function current(){\\n  if(typeof S==='undefined'||!S||!S.defense||!Array.isArray(S.evas))return null;\\n  const d=S.defense,b=S.operatorConsole?.battle||null,m=S.magi||{},x=S.infra||{};\\n  const stage=b&&b.caseNo===d.caseNo?b.stage:null;\\n  const attack=d.status==='active',lost=S.evas.some(e=>e.state==='POWER_LOST'),risk=!x.power||!x.comms||lost;\\n  const intrusive=typeof magiIntrusionActive==='function'&&magiIntrusionActive();\\n  const critical=risk||intrusive||d.status==='defeat';\\n  const level=critical?'critical':attack?'watch':'normal';\\n  const track=attack?'CASE '+String(d.caseNo||0).padStart(3,'0')+' / 接近 '+String(d.enemy?.dist??'--'):d.status==='victory'?'直近迎撃完了':'敵性反応なし';\\n  const magi=intrusive?'侵入警報 / 隔離要':m.approvedFor!=null?'UNIT-0'+m.approvedFor+' 承認':'三基監視 / '+(m.vote?'審議記録あり':'待機');\\n  const n=S.evas.filter(e=>e.state==='DEPLOYED').length;\\n  const eva=n+'/3 配備'+(stage?' / '+phaseName(stage):'');\\n  const link=x.comms?'LINK / CONNECTED':'LINK / LOST';\\n  const signature=[level,d.caseNo,d.status,d.enemy?.dist,d.scans,d.round,stage,b?.ap,m.approvedFor,Boolean(m.vote),intrusive,n,x.comms,x.power,S.mission?.phase].join('|');\\n  return {level,track,magi,eva,link,attack,caseNo:d.caseNo||0,signature,stage,critical};\\n }\\n function activeOwner(){\\n  const page=typeof currentPage==='string'?currentPage:'';\\n  if(!['infra','battle','magi','eva','mission','work','messages'].includes(page))return null;\\n  return document.querySelector('.page.active .mobile-view:not([hidden])')||document.querySelector('.page.active');\\n }\\n function mount(){\\n  const owner=activeOwner();\\n  if(!owner){deck.remove();return false;}\\n  if(deck.parentElement!==owner){owner.insertBefore(deck,owner.firstChild);routeCount++;}\\n  return true;\\n }\\n function dispatch(message,animate){\\n  put('v224Dispatch',message);\\n  if(animate&&moving()&&deck.isConnected){\\n   window.NERV_MOTION.animate('v224-dispatch',$v('v224Dispatch'),{opacity:[.45,1],translateY:[5,0],duration:340,ease:'outCubic',composition:'replace'},$v('v224Dispatch'));\\n  }\\n }\\n function render(){\\n  if(!mount())return;\\n  const snapshot=current();if(!snapshot)return;\\n  deck.dataset.condition=snapshot.level;\\n  document.body.dataset.v224Motion=moving()?'on':'off';\\n  put('v224Condition',snapshot.level==='critical'?'EMERGENCY':snapshot.level==='watch'?'TACTICAL ALERT':'ALL SYSTEMS');\\n  put('v224Track',snapshot.track);put('v224Magi',snapshot.magi);put('v224Eva',snapshot.eva);put('v224Link',snapshot.link);\\n  put('v224ScopeTarget',snapshot.attack?'CASE '+String(snapshot.caseNo).padStart(3,'0'):'SCAN');\\n  if(lastSignature!==null&&snapshot.signature!==lastSignature){\\n   changeCount++;\\n   const label=snapshot.critical?'警戒情報を更新':snapshot.attack?'戦術情報を更新':'系統状態を更新';\\n   dispatch(label+' / '+snapshot.track+' / '+snapshot.magi,true);\\n   const badge=$v('v224Condition');\\n   if(moving()&&badge){window.NERV_MOTION.animate('v224-condition',badge,{opacity:[.3,1],scale:[.96,1],duration:410,ease:'outQuart',composition:'replace'},badge);}\\n  }\\n  lastSignature=snapshot.signature;lastCondition=snapshot.level;\\n  for(const [canvas,overlay] of layers){\\n   if(!canvas.isConnected||!overlay.isConnected){overlay.remove();layers.delete(canvas);continue;}\\n   const parent=canvas.parentElement;if(!parent)continue;\\n   const r=canvas.getBoundingClientRect(),pr=parent.getBoundingClientRect();\\n   const left=Math.round(r.left-pr.left+parent.scrollLeft),top=Math.round(r.top-pr.top+parent.scrollTop);\\n   if(r.width>0&&r.height>0){\\n    const css=[left+'px',top+'px',Math.round(r.width)+'px',Math.round(r.height)+'px'];\\n    ['left','top','width','height'].forEach((k,i)=>{if(overlay.style[k]!==css[i])overlay.style[k]=css[i];});\\n   }\\n   overlay.hidden=r.width===0||r.height===0;\\n   overlay.dataset.condition=snapshot.level;\\n  }\\n }\\n function attachScopes(){\\n  // Strictly additive overlays. Never touch bitmap/canvas sources or rendering CSS.\\n  for(const id of ['consoleDeployMap','tokyoCanvasMap','tokyoCityCanvas','tokyoStreetCanvas']){\\n   const canvas=document.getElementById(id);\\n   if(!canvas||layers.has(canvas)||!canvas.parentElement)continue;\\n   const parent=canvas.parentElement;if(getComputedStyle(parent).position==='static')parent.style.position='relative';\\n   const layer=document.createElement('div');layer.className='v224-map-layer';layer.setAttribute('aria-hidden','true');\\n   layer.innerHTML='<i class=\\\"v224-map-sweep\\\"></i><i class=\\\"v224-map-reticle\\\"></i>';\\n   parent.append(layer);layers.set(canvas,layer);signalCount++;\\n  }\\n }\\n const allowed={'infra/map':true,'magi/main':true,'battle/engage':true,'work/communications':true};\\n document.addEventListener('click',event=>{\\n  const target=event.target;if(!target||typeof target.closest!=='function')return;\\n  const jump=target.closest('[data-v224-jump]');\\n  if(jump&&deck.contains(jump)){\\n   const route=jump.dataset.v224Jump;if(!allowed[route])return;\\n   const parts=route.split('/');\\n   dispatch('業務画面を開く / '+jump.textContent.trim(),true);\\n   window.NERV_MOBILE.open(parts[0],parts[1]);return;\\n  }\\n  const action=target.closest('button[data-console-battle],button[data-console-magi],button[data-city-weapon],button[data-v27pick],button[data-console-mode],button[data-console-cell],button[data-route]');\\n  if(!action||action.disabled||!action.closest('.page.active'))return;\\n  const label=(action.textContent||action.getAttribute('aria-label')||'').replace(/\\\\s+/g,' ').trim().slice(0,42);\\n  if(!label)return;\\n  // A click is not proof of command completion; only the redraw/state change can confirm it.\\n  dispatch('操作受付 / '+label+' ・結果は管制画面で照合',true);\\n },false);\\n window.addEventListener('nerv-route',()=>{attachScopes();render();});\\n window.addEventListener('nerv-world-ready',()=>{attachScopes();render();});\\n window.addEventListener('nerv-fx-quality',render);\\n document.addEventListener('visibilitychange',render);\\n const previousDraw=draw;\\n draw=function(){previousDraw();attachScopes();render();};\\n window.NERV_COMMAND_DYNAMICS={version:'2.24',snapshot:()=>({changeCount,signalCount,routeCount,condition:lastCondition,mapLayers:layers.size,ownRAF:false,ownTimers:false,protectedArtworkUntouched:true})};\\n attachScopes();render();\\n}\\ninitV224CommandDynamics();\\n\"+'</script></body>');\nconst bootData = JSON.stringify(");
    // Direct eval preserves Scriptable API bindings; the async scope isolates app constants.
    await eval('(async function(){\n'+runtime+'\n})()');
  }catch(error){
    const notice=new Alert();notice.title='NERV / 起動を完了できません';notice.message=String(error.message||error).slice(0,500)+'\n\n初回はインターネット接続が必要です。保存済みの業務データは削除していません。';notice.addAction('閉じる');await notice.presentAlert();Script.complete();
  }
}
