// v3.2.2 / NERV-COMMAND live tactical overlay.
// A presentation adapter on the ACTUAL 3x3 command buttons: never fabricate targets,
// change AP, create gameplay timers, or consume pointer events intended for the map.
(function initV322LiveTacticalMap(){
 if(!window.NERV_MOBILE||!document.getElementById('v228SectorGrid'))return;
 const grid=document.getElementById('v228SectorGrid');
 const ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');
 svg.id='v322MapOverlay';svg.classList.add('v322-map-overlay');
 svg.setAttribute('viewBox','0 0 320 190');
 svg.setAttribute('preserveAspectRatio','none');
 svg.setAttribute('role','img');
 svg.setAttribute('aria-label','現在のEVA、敵の予告射界、都市の防御状況');
 svg.setAttribute('focusable','false');
 grid.append(svg);
 const stats={version:'3.2.4',renders:0,updates:0,ownRAF:false,ownTimers:false};
 let signature='';
 const point=(col,row)=>({x:53+Math.max(0,Math.min(2,col))*107,
   y:31+Math.max(0,Math.min(2,row-1))*63});
 const numeric=(value,defaultValue)=>Number.isFinite(Number(value))?Number(value):defaultValue;
 function node(tag,cls,attributes={},str){
  const e=document.createElementNS(ns,tag);
  if(cls)e.setAttribute('class',cls);
  for(const [key,value] of Object.entries(attributes))e.setAttribute(key,String(value));
  if(str!==undefined)e.textContent=String(str);
  return e;
 }
 const add=(root,tag,cls,attrs,text)=>{const n=node(tag,cls,attrs,text);root.append(n);return n};
 function paint(){
  if(typeof staffWorldReady!=='undefined'&&!staffWorldReady)return;
  if(typeof S==='undefined'||!S?.defense)return;
  stats.renders++;
  const t=typeof tacticalState==='function'?tacticalState():null;
  const battle=typeof consoleBattle==='function'?(()=>{try{return consoleBattle()}catch(_){return null}})():null;
  // Draw the city base for every real live field battle. Tactical coordinates
  // may be unavailable briefly during load; don't disappear into a blank 3x3.
  const active=S.defense.status==='active'&&battle?.stage==='field';
  const positionKnown=Number.isInteger(t?.pos?.col)&&Number.isInteger(t?.pos?.row);
  svg.hidden=!active;
  grid.dataset.v322Tactical=String(active);
  if(active)svg.setAttribute('aria-label','EVAの実位置、予測射界、施設の損傷と防壁。使徒の正確な座標は観測されていません。');
  if(!active){signature='';return}
  const pos=positionKnown?{col:t.pos.col,row:t.pos.row}:null;
  const forecast=t?.enemyPlan||{};
  const cols=Array.isArray(forecast.columns)?forecast.columns.filter(v=>Number.isInteger(v)&&v>=0&&v<3):[];
  const rows=Array.isArray(forecast.rows)?forecast.rows.filter(v=>Number.isInteger(v)&&v>=1&&v<=3):[];
  const city=Array.isArray(S.defense.city)?S.defense.city:[];
  const unit=numeric(t?.unit,numeric(S.tactics?.attacker,1));
  const mode=document.querySelector('.mobile-view[data-view=engage]')?.dataset?.v230Mode||'command';
  const next=JSON.stringify([S.defense.caseNo,S.defense.round,S.defense.status,battle?.ap,unit,
    pos?.col??null,pos?.row??null,cols,rows,city.map(c=>[c?.hp,c?.armor,c?.turret]),t?.support,mode]);
  if(signature===next)return;signature=next;stats.updates++;
  grid.dataset.v322Unit=String(unit);
  const color=['#dcc06c','#b89be0','#e17a6e'][unit]||'#ecc27f';
  svg.style.setProperty('--v322-unit-color',color);
  const frag=document.createDocumentFragment();
  // City-shaped schematic from the original UI concept. Not actual geographical coordinates.
  add(frag,'path','v322-cityline',{d:'M0 124 L77 105 L158 130 L235 106 L320 90'});
  add(frag,'path','v322-cityedge',{d:'M0 118 L77 99 L158 124 L235 100 L320 84'});
  // Architectural detail follows the reference composition: one heavy city
  // avenue and two fine district boundaries, not a fake live 2.5D GPS map.
  add(frag,'path','v323-sidewalk',{d:'M0 134 L77 115 L158 140 L235 116 L320 100'});
  add(frag,'path','v323-district',{d:'M18 65 L76 74 L118 66 L161 82 L218 72 L300 79'});
  add(frag,'path','v323-district',{d:'M18 148 L90 136 L165 155 L231 137 L304 133'});
  for(let x=0;x<=320;x+=53.333)add(frag,'line','v322-gridline',{x1:x,y1:0,x2:x,y2:190});
  for(let y=0;y<=190;y+=31.667)add(frag,'line','v322-gridline',{x1:0,y1:y,x2:320,y2:y});
  // Defended, broken and low-HP city sectors share canonical S.defense.city.
  for(let i=0;i<3;i++){
   const c=city[i];if(!c)continue;
   const x=9+i*105,hp=numeric(c.hp,100);
   if(c.armor)add(frag,'line','v322-defended',{x1:x,y1:176,x2:x+35,y2:176});
   if(hp<50)add(frag,'line','v322-damaged',{x1:x,y1:181,x2:x+35,y2:181});
   if(c.turret)add(frag,'rect','v323-turret',{x:x+40,y:171,width:6,height:6});
  }
  const eva=pos?point(pos.col,pos.row):null;
  const danger=cols.flatMap(col=>rows.map(row=>({col,row})));
  // Enemies themselves have no map coordinate in this reducer. Red diamonds
  // represent only the forecast fire zones (not fictional actual enemy positions).
  const main=danger.find(p=>!pos||p.col!==pos.col||p.row!==pos.row)||danger[0];
  if(main&&eva){
   const target=point(main.col,main.row);
   add(frag,'path','v322-path',{d:'M'+eva.x+' '+eva.y+' L'+target.x+' '+target.y});
  }
  for(const cell of danger){
   const p=point(cell.col,cell.row);
   add(frag,'path','v322-target',{d:'M'+p.x+' '+(p.y-14)+' L'+(p.x+16)+' '+p.y+' L'+p.x+' '+(p.y+14)+' L'+(p.x-16)+' '+p.y+'Z'});
   add(frag,'line','v322-target',{x1:p.x-6,y1:p.y,x2:p.x+6,y2:p.y});
   add(frag,'line','v322-target',{x1:p.x,y1:p.y-6,x2:p.x,y2:p.y+6});
  }
  if(eva){
  const evag=add(frag,'g',null,{});
  add(evag,'circle','v322-unit',{cx:eva.x,cy:eva.y,r:14});
  // Minimal helmet/cockpit outline inside the genuine unit-position reticle.
  add(evag,'path','v323-eva-core',{d:'M'+(eva.x-5)+' '+(eva.y-2)+' Q'+eva.x+' '+(eva.y-10)+' '+(eva.x+5)+' '+(eva.y-2)+
   ' L'+(eva.x+4)+' '+(eva.y+5)+' L'+(eva.x-4)+' '+(eva.y+5)+' Z'});
  add(evag,'line','v322-unit',{x1:eva.x-21,y1:eva.y,x2:eva.x-10,y2:eva.y});
  add(evag,'line','v322-unit',{x1:eva.x+10,y1:eva.y,x2:eva.x+21,y2:eva.y});
  add(evag,'line','v322-unit',{x1:eva.x,y1:eva.y-21,x2:eva.x,y2:eva.y-10});
  add(evag,'line','v322-unit',{x1:eva.x,y1:eva.y+10,x2:eva.x,y2:eva.y+21});
  add(frag,'text','v322-unitname',{x:Math.max(32,Math.min(288,eva.x)),y:Math.max(16,eva.y-24),'text-anchor':'middle'},'EVA-0'+unit);
  }else{
   add(frag,'text','v322-unitname',{x:160,y:90,'text-anchor':'middle'},'UNIT POSITION / SYNC');
  }
  if(main){
   const p=point(main.col,main.row);
   add(frag,'text','v322-targetname',{x:Math.max(43,Math.min(275,p.x)),y:Math.max(16,p.y-23),'text-anchor':'middle'},'FIRE ZONE');
  }
  // Enemy coordinates are NOT present in the canonical tactical reducer.
  // This top-right *status legend* conveys tracking without inventing a position.
  add(frag,'text','v323-angel-status',{x:310,y:15,'text-anchor':'end'},'ANGEL / TRACKING');
  add(frag,'text','v323-angel-detail',{x:310,y:26,'text-anchor':'end'},'POSITION UNKNOWN');
  add(frag,'text','v322-tacticallegend',{x:8,y:185},'TOKYO-3 / SEC-02');
  add(frag,'text','v322-tacticallegend',{x:312,y:185,'text-anchor':'end'},'MAP 01 · PREDICTED');
  svg.replaceChildren(frag);
 }
 const previous=draw;
 draw=function(){previous();paint()};
 for(const event of ['nerv-route','nerv-world-ready','nerv-tactical-render','nerv-tactical-turn'])
  window.addEventListener(event,paint);
 window.NERV_V322={snapshot:()=>({...stats,active:!svg.hidden,
  location:svg.isConnected&&svg.parentElement===grid?'real-command-grid':'missing',
  stage:typeof currentPage==='string'?currentPage:null})};
 paint();
})();
