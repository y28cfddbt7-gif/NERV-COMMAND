// Canvas city scenes: no visible SVG streets, including no-WebGL fallbacks.
function paintTokyo3(canvas,mode='street'){
 const w=mode==='map'?840:1000,h=mode==='map'?520:450;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 const g=canvas.getContext('2d');if(!g)return;g.clearRect(0,0,w,h);
 const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#244659');sky.addColorStop(.55,'#8ba7a0');sky.addColorStop(1,'#263b35');g.fillStyle=sky;g.fillRect(0,0,w,h);
 function polygon(points,color,stroke){g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fillStyle=color;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=1;g.stroke();}}
 for(let layer=0;layer<3;layer++){const pts=[[0,h]];for(let i=0;i<19;i++)pts.push([i*w/18,80+layer*46+Math.sin(i*1.7+layer)*27+Math.cos(i*.78)*32]);pts.push([w,h]);polygon(pts,['#385c5a','#375849','#2a483c'][layer]);}
 if(mode==='map'){
  polygon([[45,265],[405,82],[800,275],[439,487]],'#46604c','#c6b87e');
  g.fillStyle='#3b7c84';g.beginPath();g.ellipse(155,331,115,55,-.3,0,7);g.fill();
  for(let i=0;i<7;i++){g.strokeStyle='#9eab8d';g.lineWidth=9;g.beginPath();g.moveTo(70+i*52,245-i*24);g.lineTo(458+i*50,432-i*24);g.stroke();g.strokeStyle='#b5b095';g.lineWidth=5;g.beginPath();g.moveTo(123+i*55,305+i*25);g.lineTo(500+i*44,120+i*24);g.stroke();}
  for(let row=0;row<7;row++)for(let col=0;col<9;col++){
   const sector=col<3?0:col>5?2:1,c=S.defense.city[sector],x=174+col*37+row*20,y=213+row*24-col*14,base=(20+(row*17+col*23)%78),height=base*(c.hp<=0?.08:c.armor?.28:1),bw=17+(col%2)*6;
   polygon([[x,y],[x+bw,y+10],[x+bw,y-height+10],[x,y-height]],c.hp<40?'#6b5044':'#83968e','#263f3b');polygon([[x+bw,y+10],[x+bw+13,y+3],[x+bw+13,y-height+3],[x+bw,y-height+10]],'#465c5b','#294240');polygon([[x,y-height],[x+13,y-height-7],[x+bw+13,y-height+3],[x+bw,y-height+10]],'#c0c7b0','#3c5048');
   g.strokeStyle='#466777';g.lineWidth=3;for(let k=10;k<height;k+=9){g.beginPath();g.moveTo(x+4,y-k);g.lineTo(x+bw-2,y-k+6);g.stroke();}
  }
  [['WEST',195,292,0],['BATTERY',407,182,1],['EAST',641,307,2],['GEOFRONT',435,433,3]].forEach(([label,x,y,i])=>{const c=S.defense.city[i];g.fillStyle='rgba(4,16,18,.9)';g.fillRect(x-55,y-14,112,32);g.strokeStyle=S.defense.selected===i?'#ffbd68':'#628e7b';g.strokeRect(x-55,y-14,112,32);g.font='12px monospace';g.fillStyle=c.hp<40?'#ff8069':'#c9e2c2';g.fillText(label+' '+c.hp+'%',x-49,y+6);});
 }else{
  // Recessed glass, suspended armored towers, gun batteries, and low housing.
  for(let i=0;i<14;i++){
   const sector=Math.min(2,Math.floor(i/5)),c=S.defense.city[sector],x=12+i*73,height=(145+(i*43)%110)*(c.hp<=0?.12:c.armor?.35:1),y=329-height,bw=46;
   polygon([[x,329],[x,y],[x+14,y-10],[x+bw+13,y-5],[x+bw+13,328]],c.hp<40?'#705a4a':'#a5b5ad','#293e3b');polygon([[x+bw,y-6],[x+bw+13,y-5],[x+bw+13,328],[x+bw,329]],'#526c6c','#334c48');
   const glass=g.createLinearGradient(x,0,x+bw,0);glass.addColorStop(0,'#345a72');glass.addColorStop(.5,'#668d9e');glass.addColorStop(1,'#3e657e');g.fillStyle=glass;g.fillRect(x+10,y+11,27,Math.max(0,height-12));
   g.strokeStyle='#9db9bd';g.lineWidth=1;for(let k=24;k<height;k+=15){g.beginPath();g.moveTo(x+11,y+k);g.lineTo(x+36,y+k);g.stroke();}
   g.strokeStyle='#d0d0b7';g.lineWidth=3;for(let k=30;k<height-20;k+=48){g.beginPath();g.moveTo(x+3,y+k);g.lineTo(x+7,y+k+14);g.lineTo(x+37,y+k+37);g.lineTo(x+40,y+k+47);g.stroke();}
   g.fillStyle='#3a4b43';g.font='bold 13px monospace';g.fillText(String(20+i),x+1,y+24);
   if(i%3===0&&c.turret&&c.hp>=25){polygon([[x-8,y+2],[x-8,y-22],[x+53,y-24],[x+55,y]],'#4b5a4c','#a7b19c');for(let k=0;k<4;k++){g.strokeStyle='#1b302b';g.lineWidth=9;g.beginPath();g.moveTo(x+k*15,y-15);g.lineTo(x+21+k*15,y-65);g.stroke();g.strokeStyle='#8d9e8b';g.lineWidth=2;g.stroke();}}
  }
  polygon([[0,338],[85,288],[172,324],[241,299],[338,339],[428,293],[561,335],[703,290],[823,329],[930,298],[1000,338],[1000,h],[0,h]],'#274a35');
  polygon([[410,h],[520,313],[565,313],[825,h]],'#68706a');g.strokeStyle='#ced0b5';g.lineWidth=2;g.beginPath();g.moveTo(600,h);g.lineTo(544,325);g.stroke();
  for(let i=0;i<12;i++){const x=i*100-20,y=354+(i%3)*18;g.fillStyle='#a19e81';g.fillRect(x,y,81,68);polygon([[x-8,y],[x+37,y-28],[x+88,y]],'#56615b','#c6c2aa');g.fillStyle='#283e3a';for(let k=0;k<3;k++){g.fillRect(x+8+k*24,y+15,15,15);g.fillRect(x+8+k*24,y+39,15,17);}}
  for(const x of [48,850]){g.strokeStyle='#283a35';g.lineWidth=5;g.beginPath();g.moveTo(x,215);g.lineTo(x,h);g.moveTo(x-28,230);g.lineTo(x+26,230);g.stroke();}for(let k=0;k<4;k++){g.strokeStyle='#1b302c';g.lineWidth=1.5;g.beginPath();g.moveTo(0,225+k*9);g.quadraticCurveTo(460,310+k*9,1000,204+k*9);g.stroke();}
 }
 g.fillStyle='rgba(3,15,17,.85)';g.fillRect(0,h-26,w,26);g.fillStyle='#d6d1ab';g.font='12px monospace';g.fillText('TOKYO-3 / '+(mode==='map'?'MUNICIPAL DEFENSE GRID':'SUSPENDED CITY & ARMORED BATTERIES')+' / SIMULATION',14,h-9);
}
function initV216Architecture(){
 if(!window.NERV_CITY)return;
 const oldMap=$('v27IsoMap');oldMap.style.display='none';oldMap.setAttribute('aria-hidden','true');
 const holder=document.createElement('div');holder.id='tokyoCanvasMap';holder.className='tokyo-canvas-map';
 const map=document.createElement('canvas');map.id='tokyoCityCanvas';map.setAttribute('role','img');map.setAttribute('aria-label','第3新東京市の街区・兵装・施設損傷を反映するCanvas地図');holder.append(map);oldMap.before(holder);
 for(let unit=0;unit<3;unit++){const marker=document.createElement('button');marker.id='canvasEva'+unit;marker.className='tokyo-map-unit';marker.dataset.unit=unit;marker.innerHTML='<span class="eva-sprite" data-unit="'+unit+'"></span>';marker.addEventListener('click',()=>{S.selectedEva=unit;persist();NERV_MOBILE.open('eva','monitor');});holder.append(marker);}
 const target=document.createElement('span');target.id='canvasEnemy';target.className='tokyo-map-enemy';holder.append(target);
 map.addEventListener('click',event=>{const r=map.getBoundingClientRect(),x=(event.clientX-r.left)/r.width,y=(event.clientY-r.top)/r.height;S.defense.selected=y>.7?3:x<.34?0:x>.65?2:1;draw();});
 v215Panel('infra','streets','市街眺望','<p class="eyebrow">TOKYO-3 / URBAN ARMAMENT</p><h2>懸垂式高層街区</h2><canvas id="tokyoStreetCanvas" class="tokyo3-street" role="img" aria-label="装甲高層街区と多連装砲塔、住宅街のCanvas眺望"></canvas><p class="staff-note">装甲外装・ガラス面・多連装砲塔・住宅街を描画。防護中は収容し、施設の損傷と砲台の配備を共通状態から反映します。</p><div class="ops-route-grid"><button data-ops-route="infra/facilities">兵装配備・修復 ↗</button><button data-ops-route="battle/engage">戦闘画面 ↗</button></div>');
 let key='';function render(){const next=JSON.stringify(S.defense.city)+S.defense.selected+currentPage+'/'+mobileCurrent.infra+S.evas.map((e,i)=>e.state+evaMapSector(i)).join()+S.defense.enemy?.dist+S.defense.status+S.defense.scans;if(key===next)return;key=next;paintTokyo3(map,'map');paintTokyo3($('tokyoStreetCanvas'));for(const [unit,marker] of [...holder.querySelectorAll('.tokyo-map-unit')].entries()){const sector=evaMapSector(unit),p=[[.24,.48],[.48,.29],[.76,.52],[.5,.78]][sector]||[.5,.78];marker.style.left=p[0]*100+'%';marker.style.top=p[1]*100+'%';marker.hidden=!['DEPLOYED','POWER_LOST'].includes(S.evas[unit].state);marker.setAttribute('aria-label',$('mapEva'+unit).getAttribute('aria-label')||'UNIT-0'+unit);}
 target.hidden=S.defense.status!=='active';target.style.left=(.82-(6-(S.defense.enemy?.dist||6))*.035)*100+'%';target.style.top='15%';target.textContent=S.defense.scans>=34?S.defense.enemy?.code:'UNKNOWN';}
 window.NERV_ARCHITECTURE={refresh:()=>{key='';render();},renderer:'canvas'};const old=draw;draw=function(){old();render();};window.addEventListener('nerv-route',render);render();
}
initV216Architecture();

function createTokyo3BattleStage(owner){
 // A single lazy GPU context, <= 7 instanced batches, shared geometry/materials.
 // No render loop: the common NERV_FX scheduler calls this dirty surface.
 const fallback=document.createElement('div');fallback.className='battle-city-fallback';const street=document.createElement('canvas');street.className='tokyo3-street';fallback.append(street);paintTokyo3(street);owner.prepend(fallback);
 let streetKey='';let renderer=null,scene,camera,canvas,records=[],meshes=[],resources=[],dirty=true,failed=false,lost=false,key='',frames=0,calls=0,sizeKey='',resizes=0;
 const visible=()=>currentPage==='battle'&&mobileCurrent.battle==='engage'&&!document.hidden&&owner.getBoundingClientRect().bottom>0&&owner.getBoundingClientRect().top<innerHeight;
 function dispose(){if(renderer){renderer.dispose();for(const r of resources)r.dispose?.();canvas.remove();}renderer=null;records=[];meshes=[];resources=[];sizeKey='';owner.dataset.renderer='canvas';dirty=true;}
 function create(){
  if(renderer||failed||!window.THREE||S.prefs.fxQuality==='low')return;
  const T=window.THREE;canvas=document.createElement('canvas');canvas.className='battle-city-webgl';canvas.setAttribute('aria-hidden','true');
  try{
   const context=canvas.getContext('webgl2',{alpha:true,antialias:false,powerPreference:'low-power'})||canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});if(!context||(!context.drawArraysInstanced&&!context.getExtension('ANGLE_instanced_arrays')))throw Error('WebGL instancing unavailable');
   renderer=new T.WebGLRenderer({canvas,context,alpha:true,antialias:false});renderer.setClearColor(0x182d36,1);scene=new T.Scene();scene.fog=new T.Fog(0x182d36,110,245);camera=new T.OrthographicCamera(-85,85,45,-45,.1,400);camera.position.set(100,75,120);camera.lookAt(0,12,0);scene.add(new T.HemisphereLight(0xcbd8de,0x26392c,2.1));const light=new T.DirectionalLight(0xffe2ae,2);light.position.set(-60,100,30);scene.add(light);
   const box=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(.13,.2,1,6),roof=new T.ConeGeometry(1,1,4);resources.push(box,cylinder,roof);
   function batch(geometry,color,items){const material=new T.MeshLambertMaterial({color,flatShading:true}),mesh=new T.InstancedMesh(geometry,material,items.length);resources.push(material);meshes.push(mesh);scene.add(mesh);const matrix=new T.Matrix4(),q=new T.Quaternion(),v=new T.Vector3(),scale=new T.Vector3();items.forEach((data,i)=>{q.setFromAxisAngle(new T.Vector3(0,0,1),data.angle||0);v.set(data.x,data.y,data.z);scale.set(data.w,data.h,data.d);matrix.compose(v,q,scale);mesh.setMatrixAt(i,matrix);});mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);const proxies=NERV_THREE_INSTANCES.getInstances(mesh);items.forEach((data,i)=>records.push({...data,mesh,index:i,proxy:proxies[i]}));return mesh;}
   const towers=[],glass=[],braces=[],homes=[],roofs=[],guns=[];
   for(let row=0;row<6;row++)for(let col=0;col<10;col++){const x=-53+col*12,z=-45+row*15,h=22+(col*13+row*17)%32,sector=x<-20?0:x>23?2:1,w=5+(col%3);towers.push({x,y:h/2,z,w,h,d:6,sector,retract:true});glass.push({x:x+.2,y:h*.52,z:z+3.03,w:w*.46,h:h*.83,d:.12,sector,retract:true});if(col%3===0)braces.push({x:x-w*.3,y:h*.5,z:z+3.18,w:.45,h:h*.8,d:.35,angle:.15,sector,retract:true});if(row===1&&col%2===0)for(let k=0;k<3;k++)guns.push({x:x+(k-1)*1.3,y:h+2,z,w:1,h:6,d:1,angle:-.7,sector,retract:true,armed:true});}
   for(let i=0;i<24;i++){const x=-68+(i%12)*12,z=53+Math.floor(i/12)*15,sector=x<-20?0:x>23?2:1;homes.push({x,y:3,z,w:8,h:6,d:7,sector});roofs.push({x,y:7,z,w:6.8,h:3.5,d:6,sector});}
   batch(box,0x8c9992,towers);batch(box,0x37586d,glass);batch(box,0xb3b7a7,braces);batch(box,0x767562,homes);batch(roof,0x3c4d47,roofs);batch(cylinder,0x3a4c44,guns);
   const groundGeometry=new T.PlaneGeometry(190,180),groundMaterial=new T.MeshLambertMaterial({color:0x314b3b}),ground=new T.Mesh(groundGeometry,groundMaterial);ground.rotation.x=-Math.PI/2;ground.position.y=-.2;scene.add(ground);resources.push(groundGeometry,groundMaterial);
   owner.append(canvas);owner.dataset.renderer='webgl';
   canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;owner.dataset.renderer='canvas';NERV_MOTION.stopAll();NERV_FX.refresh();});
   canvas.addEventListener('webglcontextrestored',()=>{lost=false;key='';dirty=true;sync();NERV_FX.refresh();});
  }catch(error){dispose();failed=true;owner.dataset.renderer='canvas';}
 }
 function sync(){
  if(!visible())return;const sk=JSON.stringify(S.defense.city);if(sk!==streetKey){paintTokyo3(street);streetKey=sk;}if(S.prefs.fxQuality==='low'){owner.dataset.renderer='canvas';return;}
  create();if(!renderer||lost)return;owner.dataset.renderer='webgl';
  const next=JSON.stringify(S.defense.city.map(c=>[c.hp,c.turret,c.armor]));if(key===next)return;key=next;
  const moving=[];for(const r of records){const c=S.defense.city[r.sector],ratio=r.retract?(c.hp<=0?.08:c.armor?.28:1):1,hidden=r.armed&&(!c.turret||c.hp<25);r.targetScale=hidden?0:r.h*ratio;r.targetY=r.y*ratio;moving.push(r.proxy);r.mesh.setColorAt(r.index,new THREE.Color(c.hp<40?0xa6563e:c.hp<75?0x64715c:0xffffff));if(r.mesh.instanceColor)r.mesh.instanceColor.needsUpdate=true;}
  const byProxy=new Map(records.map(r=>[r.proxy,r]));NERV_MOTION.animate('battle-city-retract',moving,{scaleY:t=>byProxy.get(t).targetScale,y:t=>byProxy.get(t).targetY,duration:680,ease:anime.cubicBezier(.22,.68,.2,1),composition:'none',onUpdate:()=>{dirty=true;},onComplete:()=>{for(const m of meshes)NERV_THREE_INSTANCES.commitChanges(m);dirty=true;}},owner);dirty=true;
 }
 function paint(){if(!visible()||S.prefs.fxQuality==='low'||lost)return;sync();if(!renderer||!dirty)return;try{const rect=owner.getBoundingClientRect(),dpr=Math.min(S.prefs.fxQuality==='high'?1.5:1.25,devicePixelRatio||1),size=rect.width+':'+rect.height+':'+dpr;if(size!==sizeKey){if(renderer.getPixelRatio()!==dpr)renderer.setPixelRatio(dpr);renderer.setSize(rect.width,rect.height,false);camera.left=-85;camera.right=85;camera.top=85*rect.height/rect.width;camera.bottom=-camera.top;camera.updateProjectionMatrix();sizeKey=size;resizes++;}renderer.render(scene,camera);frames++;calls=renderer.info.render.calls;dirty=false;}catch(error){failed=true;dispose();}}
 NERV_FX.registerHook(paint,()=>visible()&&S.prefs.fxQuality!=='low'&&!lost&&!failed&&(dirty||NERV_MOTION.snapshot().active>0));
 const invalidate=()=>{dirty=true;sync();NERV_FX.refresh();};window.addEventListener('nerv-route',invalidate);window.addEventListener('resize',invalidate);window.addEventListener('nerv-fx-quality',invalidate);document.addEventListener('visibilitychange',invalidate);window.addEventListener('pagehide',dispose);window.addEventListener('pageshow',()=>{lost=false;key='';invalidate();});let wasVisible=false;window.addEventListener('scroll',()=>{const now=visible();if(now!==wasVisible){wasVisible=now;invalidate();}},{passive:true});
 return {sync:()=>{sync();dirty=true;},snapshot:()=>{let matrix=null;if(records.length){const m=new THREE.Matrix4();records[0].mesh.getMatrixAt(0,m);matrix={y:m.elements[13],height:m.elements[5]};}return {renderer:owner.dataset.renderer||'canvas',instances:records.length,batches:meshes.length,frames,drawCalls:calls,resizes,firstMatrix:matrix,lost,failed,ownRAF:false};},loseContext:()=>renderer?.getContext().getExtension('WEBGL_lose_context')?.loseContext()};
}
