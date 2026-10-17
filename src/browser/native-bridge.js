let nextBridgeId=1;const bridgeCallbacks={};window.__nervQueue=[];
window.__nervDeliver=(id,result)=>{const entry=bridgeCallbacks[id];if(entry){delete bridgeCallbacks[id];entry(result);}};
function callNative(action,payload={}){
  if(window.__SCRIPTABLE__){return new Promise((resolve)=>{const id=nextBridgeId++;bridgeCallbacks[id]=resolve;window.__nervQueue.push({id,action,payload});});}
  if(action==='persist'){try{localStorage.setItem('nerv-command-v2',JSON.stringify(payload.state));return Promise.resolve({ok:true});}catch(e){return Promise.resolve({error:String(e)})}}
  if(action==='backupState'){try{localStorage.setItem('nerv-command-v2-before-alert-clear',JSON.stringify(payload.state));return Promise.resolve({ok:true});}catch(e){return Promise.resolve({error:String(e)})}}
  if(action==='battery'){return navigator.getBattery?navigator.getBattery().then(b=>({level:Math.round(b.level*100),charging:b.charging})):Promise.resolve({level:null,charging:false});}
  if(action==='weather'){return browserWeather();}
  if(action==='mapLocation'){return new Promise(resolve=>{if(!navigator.geolocation)return resolve({error:'現在地に非対応の環境です'});navigator.geolocation.getCurrentPosition(p=>resolve({lat:p.coords.latitude,lng:p.coords.longitude}),e=>resolve({error:e.message}),{timeout:12000,enableHighAccuracy:false,maximumAge:120000});});}
  return Promise.resolve({error:'Unsupported action'});
}
