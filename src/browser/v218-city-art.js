// Original painted city atlases. One decode per state; shared by every city view.
// Existing portraits, equipment, facilities and EVA sprite sheets are never altered.
function initV218CityArt(){
 if(!window.NERV_FX||typeof Image==='undefined')return;
 const images={},names=['normal','armed','sheltered'],lastPaint={},stats={revision:0,paints:0,ready:false,failed:[]};
 function publish(){stats.revision++;stats.ready=names.every(n=>images[n]?.complete&&images[n].naturalWidth>0);window.dispatchEvent(new Event('nerv-city-art-ready'));}
 for(const name of names){const image=new Image();images[name]=image;image.decoding='async';image.onload=publish;image.onerror=()=>{stats.failed.push(name);publish();};const value=getComputedStyle(document.documentElement).getPropertyValue('--tokyo-art-'+name).trim();image.src=value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');}
 function paint(canvas,mode='street'){
  if(!stats.ready)return false;const g=canvas.getContext('2d');if(!g)return false;const w=canvas.width,h=canvas.height,row=mode==='map'?1:mode==='battle'?2:0;
  g.clearRect(0,0,w,h);g.fillStyle='#142a2d';g.fillRect(0,0,w,h);
  const footer=mode==='battle'?0:56,available=h-footer,atlas=images.normal,sw=atlas.naturalWidth,sh=atlas.naturalHeight/3,scale=mode==='map'?Math.min(w/sw,available/sh):Math.max(w/sw,available/sh),dw=sw*scale,dh=sh*scale,dx=(w-dw)/2,dy=(available-dh)/2;
  const states=S.defense.city.slice(0,3).map(c=>c.armor||c.hp<=0?'sheltered':c.turret&&c.hp>=25?'armed':'normal');
  // Each district selects the corresponding deployment state in the same view.
  for(let sector=0;sector<3;sector++){
   const c=S.defense.city[sector],image=images[states[sector]],width=image.naturalWidth,height=image.naturalHeight/3;
   g.save();g.beginPath();g.rect(sector*w/3,0,w/3,available);g.clip();g.drawImage(image,0,row*height,width,height,dx,dy,dw,dh);
   if(c.hp<75){const loss=(100-c.hp)/100,x=w*(sector+.5)/3,y=mode==='map'?h*.53:h*.48,r=Math.min(w/3,h*.65),smoke=g.createRadialGradient(x,y,2,x,y,r);smoke.addColorStop(0,'rgba(42,31,23,'+(.48*loss)+')');smoke.addColorStop(.5,'rgba(65,51,38,'+(.24*loss)+')');smoke.addColorStop(1,'rgba(25,32,29,0)');g.fillStyle=smoke;g.fillRect(sector*w/3,0,w/3,available);}
   g.restore();
  }
  if(!S.infra.power){g.fillStyle='#07172a70';g.fillRect(0,0,w,available);}
  if(mode==='map'&&!window.NERV_V232_MODE){
   for(const [label,x,y,i] of [['WEST',195,220,0],['BATTERY',407,120,1],['EAST',641,220,2],['GEOFRONT',435,available-28,3]]){const c=S.defense.city[i],text=label+' '+c.hp+'%';g.font='24px monospace';const width=Math.max(190,Math.ceil(g.measureText(text).width)+20);g.fillStyle='#06171be8';g.fillRect(x-width/2,y-24,width,48);g.strokeStyle=S.defense.selected===i?'#ffcf7c':'#90c4b0';g.lineWidth=1.5;g.strokeRect(x-width/2,y-24,width,48);g.fillStyle=c.hp<40?'#ffad84':'#e2edcf';g.fillText(text,x-width/2+10,y+8);}
  }
  if(footer){g.fillStyle='#061417ee';g.fillRect(0,h-footer,w,footer);g.font='24px monospace';
  for(let i=0;i<3;i++){const c=S.defense.city[i];g.fillStyle=c.hp<40?'#ffa17f':'#d8d7ad';g.font='22px monospace';g.fillText(['WEST','CENTRAL','EAST'][i]+' '+c.hp+'%',i*w/3+12,h-32);g.font='18px monospace';g.fillText(states[i]==='sheltered'?'SHELTERED / 収容':states[i]==='armed'?'ARMED / 展開':'NORMAL / 通常',i*w/3+12,h-9);}}
  canvas.dataset.artwork='raster';canvas.dataset.artMode=mode;canvas.dataset.artStates=states.join(',');stats.paints++;lastPaint[mode]={states:[...states],health:S.defense.city.map(c=>c.hp),power:!!S.infra.power};return true;
 }
 window.NERV_CITY_ART={paint,revision:()=>stats.revision,snapshot:()=>({...stats,failed:[...stats.failed],images:Object.fromEntries(names.map(n=>[n,{width:images[n].naturalWidth,height:images[n].naturalHeight,loaded:images[n].complete&&images[n].naturalWidth>0}])),lastPaint:JSON.parse(JSON.stringify(lastPaint)),ownRAF:false})};
}
initV218CityArt();
