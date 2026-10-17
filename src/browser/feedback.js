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
