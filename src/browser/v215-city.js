// Attached sketch informs valley/lake/high-rise organization; this is a schematic, not surveyed GIS.
function initV215City(){
 const map=$('v27IsoMap');if(!map||!map.insertBefore)return;const ns='http://www.w3.org/2000/svg',scene=document.createElementNS(ns,'g');scene.id='tokyo3Terrain';scene.classList.add('v215-city-scene');
 let markup='<path class="city-basin" d="M22 151 223 78 458 50 652 200 600 323 303 407 50 318Z"/>';
 for(let layer=0;layer<5;layer++){const shift=layer*10;markup+='<path class="city-contour" d="M0 '+(92+shift)+' 52 '+(52+shift)+' 85 '+(68+shift)+' 133 '+(29+shift)+' 191 '+(65+shift)+' 253 '+(17+shift)+' 310 '+(40+shift)+' 374 '+(8+shift)+' 428 '+(38+shift)+' 486 '+(22+shift)+' 537 '+(65+shift)+' 595 '+(53+shift)+' 680 '+(114+shift)+'"/>';}
 markup+='<path class="city-lake" d="M36 159Q68 132 100 157L154 228Q175 269 126 300L55 323Q24 301 42 275L67 235Q29 209 36 159Z"/><path class="city-lake-shore" d="M43 165Q72 143 95 164L145 232Q160 267 122 291L57 312M51 176 82 182 122 244 113 277 67 299"/>';
 for(let i=0;i<9;i++){const y=103+i*27;markup+='<path class="city-road" d="M'+(143+i*9)+' '+y+' 511 '+(y-43)+' 641 '+(y+39)+'"/>';}
 for(let i=0;i<8;i++){const x=180+i*54;markup+='<path class="city-road" d="M'+x+' 91 '+(x+104)+' 302 '+(x+40)+' 362"/>';}
 markup+='<path class="city-highway" d="M33 392 235 265 451 190 675 155M27 383 231 258 446 183 672 149M116 99 273 226 535 386"/><path class="city-rail" d="M74 363 226 287 351 262 552 186 673 204"/>';
 scene.innerHTML=markup;map.insertBefore(scene,$('v27PowerLine'));const blocks=[];
 for(let row=0;row<7;row++)for(let col=0;col<11;col++){
  const x=176+col*34+row*8,y=111+row*30-col*2,sector=x<265?0:x>470?2:1,width=10+(col*7+row*3)%12,depth=width*.48,height=(row<4&&col>2&&col<8?42:12)+(col*13+row*17)%38;
  if((x<225&&y>215)||(row===6&&col>7))continue;const g=document.createElementNS(ns,'g');g.classList.add('city-block');g.dataset.citySector=String(sector);g.innerHTML='<path class="city-block-left"/><path class="city-block-right"/><path class="city-block-roof"/><path class="city-block-windows"/>';scene.append(g);blocks.push({g,x,y,width,depth,height,sector});
 }
 const marker=document.createElementNS(ns,'g');marker.classList.add('city-geofront-depth');marker.innerHTML='<path d="M340 320 413 362 340 403 267 362Z"/><path d="M340 322v80M267 362h146"/><text x="340" y="423" text-anchor="middle">GEOFRONT / 地下空洞</text>';scene.append(marker);
 const label=document.createElementNS(ns,'g');label.classList.add('city-map-labels');label.innerHTML='<text x="34" y="345">ASHINOKO / 芦ノ湖</text><text x="337" y="64">HAKONE CALDERA / 箱根外輪山</text><text x="198" y="389">TOKYO-3 / 第三新東京市</text>';scene.append(label);
 function geometry(b,ratio){const {g,x,y,width:w,depth:d,height:h}=b,z=h*ratio;g.children[0].setAttribute('d',`M${x-w} ${y-z} ${x} ${y+d-z}V${y+d}L${x-w} ${y}Z`);g.children[1].setAttribute('d',`M${x} ${y+d-z} ${x+w} ${y-z}V${y}L${x} ${y+d}Z`);g.children[2].setAttribute('d',`M${x} ${y-d-z} ${x+w} ${y-z} ${x} ${y+d-z} ${x-w} ${y-z}Z`);let windows='';for(let k=8;k<z-5;k+=8)windows+=`M${x+2} ${y+d-k}l${w-4} ${-d+2}`;g.children[3].setAttribute('d',windows);}
 const ratios=[1,1,1],keys=['','',''];
 function render(){for(let i=0;i<3;i++){const c=S.defense.city[i],key=c.armor+'-'+c.hp;if(keys[i]===key)continue;keys[i]=key;const target=c.hp<=0 ? .08 : c.armor ? .28 : 1;for(const b of blocks.filter(b=>b.sector===i))b.g.dataset.damage=c.hp<40?'critical':c.hp<75?'damaged':'normal';const update=r=>{ratios[i]=r;for(const b of blocks.filter(b=>b.sector===i))geometry(b,r);window.NERV_ARCHITECTURE?.refresh();};if(window.NERV_MOTION)NERV_MOTION.tween('city-sector-'+i,ratios[i],target,update,map,620);else update(target);}map.dataset.cityMode='terrain';map.setAttribute('aria-label','第三新東京市の2.5D地形・市街地・防衛配置。芦ノ湖、箱根外輪山、武装ビル収容と実際の模擬損傷を表示');}
 const oldDraw=draw;draw=function(){oldDraw();render();};window.addEventListener('nerv-route',render);render();
 const note=document.createElement('p');note.className='staff-note city-reference-note';note.textContent='添付構想図を参考にした模式配置。実測地図ではありません。ビル収容は区画の防護状態、色は施設健全性に連動。';(map.closest('.fx-map-stack')||map).after(note);
 for(const [i,x,y]of [[0,181,198],[1,340,125],[2,500,198],[3,340,278]]){const g=map.querySelector('g[data-v27pick="'+i+'"]');if(g)g.setAttribute('transform','translate('+x+' '+y+') scale(.58) translate('+(-x)+' '+(-y)+')');}
 window.NERV_CITY={snapshot:()=>({buildings:blocks.length,ratios:[...ratios],selected:S.defense.selected,health:S.defense.city.map(c=>c.hp)}),refresh:render};
}
initV215City();
