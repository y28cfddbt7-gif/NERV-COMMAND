// Additional architecture; existing facility and weapon illustrations stay intact.
let tokyo3StreetSerial=0;
function tokyo3StreetSVG(){
 const skyId='t3Sky'+(++tokyo3StreetSerial);
 let s='<svg viewBox="0 0 760 340" class="tokyo3-street" role="img" aria-label="兵装ビル・懸垂式高層建築と住宅街の模式眺望"><defs><linearGradient id="t3Sky" x2="0" y2="1"><stop stop-color="#253c50"/><stop offset="1" stop-color="#82968a"/></linearGradient></defs><path fill="url(#t3Sky)" d="M0 0H760V340H0z"/><path fill="#294b40" d="M0 125 70 70 111 95 182 45 235 99 314 39 389 85 480 30 567 94 647 61 760 124V340H0z"/>';
 for(let i=0;i<11;i++){
  const x=15+i*69,h=112+(i*37)%72,y=258-h,w=44,sector=Math.min(2,Math.floor(i/4));
  s+='<g class="street-tower" data-street-sector="'+sector+'"><path fill="#a1aaa2" stroke="#263d3e" d="M'+x+' 258V'+y+'l12-8 44 5v'+(h+3)+'Z"/><path fill="#516674" d="M'+(x+10)+' '+(y+8)+'h25v'+(h-8)+'h-25z"/>';
  s+='<path fill="#697975" d="M'+(x+44)+' '+(y-3)+'l12 5v'+h+'l-12 3Z"/><path fill="none" stroke="#c2c8b8" stroke-width="3" d="M'+(x+4)+' '+(y+24)+'l31 22-31 22 31 22-31 22 31 22"/><path stroke="#40595d" stroke-width="2" d="M'+(x+10)+' '+(y+16)+'h25m-25 24h25m-25 24h25m-25 24h25m-25 24h25"/>';
  s+='<text x="'+(x+2)+'" y="'+(y+17)+'" fill="#33494a" font-size="9">'+String(20+i).padStart(2,'0')+'</text>';
  if(i%2===0)s+='<g class="street-guns" data-street-guns="'+sector+'"><path fill="#344b49" stroke="#9da893" d="M'+(x-5)+' '+(y+2)+'v-18h54v18z"/>'+[0,1,2].map(k=>'<path stroke="#1e3435" stroke-width="5" d="M'+(x+5+k*15)+' '+(y-12)+'l16-29"/><path stroke="#96a38d" stroke-width="1" d="M'+(x+4+k*15)+' '+(y-13)+'l16-29"/>').join('')+'</g>';
  s+='</g>';
 }
 s+='<path fill="#203f32" d="M0 249q60-70 126-11 73-54 144-5 88-55 168-4 93-57 173 7 90-56 149 2v102H0z"/><path fill="#384344" d="M300 340 400 240 456 240 650 340Z"/>';
 for(let i=0;i<8;i++){const x=i*101-25,y=277+(i%2)*13;s+='<g><path fill="#817e6a" stroke="#253a36" d="M'+x+' '+y+'h79v59h-79z"/><path fill="#444f4a" stroke="#b5b19a" d="M'+(x-7)+' '+y+'l45-26 49 26Z"/><path stroke="#273a38" stroke-width="7" d="M'+(x+13)+' '+(y+17)+'h19m12 0h19m-50 22h19m12 0h19"/></g>';}
 s+='<path stroke="#273b36" stroke-width="3" d="M48 168v172M669 148v192"/><path fill="none" stroke="#172f2a" stroke-width="1.6" d="M0 180Q390 260 760 154M0 192Q390 272 760 166M0 204Q390 282 760 178"/></svg>';return s.replaceAll('t3Sky',skyId);
}
function initV216Architecture(){
 if(!window.NERV_CITY)return;
 const map=$('v27IsoMap'),blocks=[...map.querySelectorAll('.city-block')],ns='http://www.w3.org/2000/svg';
 for(const g of blocks){for(const kind of ['facade','battery']){const p=document.createElementNS(ns,'path');p.classList.add('city-'+kind);g.append(p);}}
 let last='';function render(){const key=JSON.stringify(S.defense.city.map(c=>[c.hp,c.turret,c.armor]))+NERV_CITY.snapshot().ratios.join();if(last===key)return;last=key;
  blocks.forEach((g,i)=>{const n=g.children[2].getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number),x=n[0],top=n[1],w=n[2]-x,base=g.children[1].getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number),bottom=base[4],c=S.defense.city[Number(g.dataset.citySector)];
   g.querySelector('.city-facade').setAttribute('d','M'+(x+2)+' '+(top+w*.48+4)+'l'+(w-4)+' 10-'+(w-4)+' 10 '+(w-4)+' 10M'+(x+3)+' '+(top+w*.48+3)+'V'+bottom);g.querySelector('.city-facade').setAttribute('visibility',bottom-top>36?'visible':'hidden');
   const armed=i%5===0&&c.turret&&c.hp>=25;g.querySelector('.city-battery').setAttribute('d',armed?'M'+(x-w*.5)+' '+(top+2)+'l-3-11m7 10-1-15m5 14 2-13':'');
  });
  for(const g of all('[data-street-sector]')){const c=S.defense.city[Number(g.dataset.streetSector)];g.dataset.damage=c.hp<40?'critical':c.hp<75?'damaged':'normal';g.style.transform=c.armor?'translateY(70px)':'';}
  for(const gun of all('[data-street-guns]')){const c=S.defense.city[Number(gun.dataset.streetGuns)];gun.style.opacity=c.turret&&c.hp>=25?'1':'.18';}
 }
 v215Panel('infra','streets','市街眺望','<p class="eyebrow">TOKYO-3 / URBAN ARMAMENT</p><h2>懸垂式高層街区</h2>'+tokyo3StreetSVG()+'<p class="staff-note">住宅街の背後に装甲外装・砲塔を備える高層街区。防護中は収容し、損傷と砲台配備は都市管制の状態を表示します。</p><div class="ops-route-grid"><button data-ops-route="infra/facilities">兵装配備・修復 ↗</button><button data-ops-route="battle/engage">戦闘画面 ↗</button></div>');
 window.NERV_ARCHITECTURE={refresh:render};const old=draw;draw=function(){old();render();};window.addEventListener('nerv-route',render);render();
}
initV216Architecture();

function createTokyo3BattleStage(owner){
 // A single lazy GPU context, <= 7 instanced batches, shared geometry/materials.
 // No render loop: the common NERV_FX scheduler calls this dirty surface.
 const fallback=document.createElement('div');fallback.className='battle-city-fallback';fallback.innerHTML=tokyo3StreetSVG();owner.prepend(fallback);
 let renderer=null,scene,camera,canvas,records=[],meshes=[],resources=[],dirty=true,failed=false,lost=false,key='',frames=0,calls=0,sizeKey='',resizes=0;
 const visible=()=>currentPage==='battle'&&mobileCurrent.battle==='engage'&&!document.hidden&&owner.getBoundingClientRect().bottom>0&&owner.getBoundingClientRect().top<innerHeight;
 function dispose(){if(renderer){renderer.dispose();for(const r of resources)r.dispose?.();canvas.remove();}renderer=null;records=[];meshes=[];resources=[];sizeKey='';owner.dataset.renderer='svg';dirty=true;}
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
   canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;owner.dataset.renderer='svg';NERV_MOTION.stopAll();NERV_FX.refresh();});
   canvas.addEventListener('webglcontextrestored',()=>{lost=false;key='';dirty=true;sync();NERV_FX.refresh();});
  }catch(error){dispose();failed=true;owner.dataset.renderer='svg';}
 }
 function sync(){
  if(!visible())return;if(S.prefs.fxQuality==='low'){owner.dataset.renderer='svg';return;}
  create();if(!renderer||lost)return;owner.dataset.renderer='webgl';
  const next=JSON.stringify(S.defense.city.map(c=>[c.hp,c.turret,c.armor]));if(key===next)return;key=next;
  const moving=[];for(const r of records){const c=S.defense.city[r.sector],ratio=r.retract?(c.hp<=0?.08:c.armor?.28:1):1,hidden=r.armed&&(!c.turret||c.hp<25);r.targetScale=hidden?0:r.h*ratio;r.targetY=r.y*ratio;moving.push(r.proxy);r.mesh.setColorAt(r.index,new THREE.Color(c.hp<40?0xa6563e:c.hp<75?0x64715c:0xffffff));if(r.mesh.instanceColor)r.mesh.instanceColor.needsUpdate=true;}
  const byProxy=new Map(records.map(r=>[r.proxy,r]));NERV_MOTION.animate('battle-city-retract',moving,{scaleY:t=>byProxy.get(t).targetScale,y:t=>byProxy.get(t).targetY,duration:680,ease:anime.cubicBezier(.22,.68,.2,1),composition:'none',onUpdate:()=>{dirty=true;},onComplete:()=>{for(const m of meshes)NERV_THREE_INSTANCES.commitChanges(m);dirty=true;}},owner);dirty=true;
 }
 function paint(){if(!visible()||S.prefs.fxQuality==='low'||lost)return;sync();if(!renderer||!dirty)return;try{const rect=owner.getBoundingClientRect(),dpr=Math.min(S.prefs.fxQuality==='high'?1.5:1.25,devicePixelRatio||1),size=rect.width+':'+rect.height+':'+dpr;if(size!==sizeKey){if(renderer.getPixelRatio()!==dpr)renderer.setPixelRatio(dpr);renderer.setSize(rect.width,rect.height,false);camera.left=-85;camera.right=85;camera.top=85*rect.height/rect.width;camera.bottom=-camera.top;camera.updateProjectionMatrix();sizeKey=size;resizes++;}renderer.render(scene,camera);frames++;calls=renderer.info.render.calls;dirty=false;}catch(error){failed=true;dispose();}}
 NERV_FX.registerHook(paint,()=>visible()&&S.prefs.fxQuality!=='low'&&!lost&&!failed&&(dirty||NERV_MOTION.snapshot().active>0));
 const invalidate=()=>{dirty=true;sync();NERV_FX.refresh();};window.addEventListener('nerv-route',invalidate);window.addEventListener('resize',invalidate);window.addEventListener('nerv-fx-quality',invalidate);document.addEventListener('visibilitychange',invalidate);window.addEventListener('pagehide',dispose);window.addEventListener('pageshow',()=>{lost=false;key='';invalidate();});let wasVisible=false;window.addEventListener('scroll',()=>{const now=visible();if(now!==wasVisible){wasVisible=now;invalidate();}},{passive:true});
 return {sync:()=>{sync();dirty=true;},snapshot:()=>{let matrix=null;if(records.length){const m=new THREE.Matrix4();records[0].mesh.getMatrixAt(0,m);matrix={y:m.elements[13],height:m.elements[5]};}return {renderer:owner.dataset.renderer||'svg',instances:records.length,batches:meshes.length,frames,drawCalls:calls,resizes,firstMatrix:matrix,lost,failed,ownRAF:false};},loseContext:()=>renderer?.getContext().getExtension('WEBGL_lose_context')?.loseContext()};
}
