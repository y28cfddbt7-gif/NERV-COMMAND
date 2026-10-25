// A genuine pitched vector map: OpenFreeMap tiles + MapLibre. No fabricated basemap.
const HAKONE={lng:139.1046,lat:35.2329};
let mapObj=null,mapPromise=null,map2d=false,mapWhere='hakone',mapReady=false;
function mapNote(msg){const el=$('mapStatus');if(el)el.textContent=msg;}
function requireMapLibre(){
 if(mapPromise)return mapPromise;
 // 4.0.1: NEVER load map assets in index.html. Slow or blocked cellular CDN
 // access used to keep Scriptable's entire WebView dark during loadHTML.
 const asset=(tag,attributes,label)=>new Promise((resolve,reject)=>{
  const element=document.createElement(tag);
  for(const [key,value] of Object.entries(attributes))element[key]=value;
  element.onload=resolve;
  element.onerror=()=>reject(Error(label+'を取得できません。接続をご確認ください'));
  document.head.appendChild(element);
 });
 mapPromise=Promise.all([
  window.maplibregl?Promise.resolve():asset('script',{
   src:'https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.js',async:true},'地図ライブラリ'),
  asset('link',{rel:'stylesheet',
   href:'https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.css'},'地図表示スタイル')
 ]).then(()=>{if(!window.maplibregl)throw Error('地図ライブラリを開始できません');})
   .catch(error=>{mapPromise=null;throw error;});
 return mapPromise;
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

