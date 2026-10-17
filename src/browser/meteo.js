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

