// Presentation only. Fixed artwork, state, permissions and combat rules are untouched.
function initV222Interface(){
 if(!window.NERV_MOTION||!window.NERV_MOBILE)return;
 const legacy=qs('#cityWeaponsPanel .city-weapon-drawing'),battery=document.createElement('div');
 battery.id='cityBatteryArt';battery.className='city-battery-art';battery.setAttribute('role','img');legacy.before(battery);legacy.setAttribute('hidden','');legacy.setAttribute('aria-hidden','true');
 const guide=document.createElement('details');guide.className='city-battery-guide';guide.innerHTML='<summary>兵装仕様・運用の注意</summary>';const panel=legacy.parentElement,note=panel.querySelector(':scope > .staff-note'),link=panel.querySelector(':scope > .staff-secondary');panel.append(guide);if(note)guide.append(note);if(link)guide.append(link);
 let lastMode='',entries=0,selections=0,swaps=0,fitted=0;
 function fitWeapons(){
  fitted=0;
  for(const art of all('.page.active .weapon-art')){
   const icon=art.querySelector('[data-weapon-art]'),r=art.getBoundingClientRect();if(!icon||!r.width||!r.height)continue;
   const css=getComputedStyle(art),w=r.width-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight),h=r.height-parseFloat(css.paddingTop)-parseFloat(css.paddingBottom),ratio=1774/({knife:224,rifle:372,positron:291}[icon.dataset.weaponArt]||291),width=Math.floor(Math.max(0,Math.min(w,h*ratio))*2)/2;
   const value=width+'px';if(icon.style.getPropertyValue('--weapon-fit')!==value)icon.style.setProperty('--weapon-fit',value);fitted++;
  }
 }
 function motion(key,elements,parameters){
  const targets=[...elements].filter(el=>{const r=el.getBoundingClientRect();return r.width&&r.height&&r.bottom>0&&r.top<innerHeight;}).slice(0,5);if(!targets.length)return;
  const originals=targets.map(el=>[el,el.style.opacity,el.style.transform]);
  return NERV_MOTION.animate(key,targets,{...parameters,onComplete:()=>{for(const [el,opacity,transform]of originals){el.style.opacity=opacity;el.style.transform=transform;}}},targets[0]);
 }
 function enter(){
  NERV_MOTION.stopAll();fitWeapons();
  const owner=qs('.page.active .mobile-view:not([hidden])')||qs('.page.active');if(!owner)return;
  const candidates=currentPage==='home'?[...$('commandLauncher').querySelectorAll('button')]:[...owner.querySelectorAll(':scope > .staff-panel,:scope > .v27-head,:scope > .v27-kpi,:scope > .fx-map-stack,:scope > .v27-lanes,:scope > .v215-panel,:scope > .ops-route-grid')];
  if(motion('interface-enter',candidates,{opacity:[.55,1],translateY:[12,0],delay:anime.stagger(45),duration:430,ease:'outExpo',composition:'replace'}))entries++;
 }
 function render(){
  document.body.dataset.interfaceView=currentPage+'/'+(mobileCurrent[currentPage]||'');
  const sector=Number($('weaponSector').value)||0,mode=S.cityArmament?.modes?.[sector]||'cannon',name=mode==='missile'?'誘導弾発射ビル':'多連装機関砲ビル';
  battery.dataset.mode=mode;battery.setAttribute('aria-label',name+'の精細な参考画像。実際の配備と損傷は下の管制情報に表示。');
  if(lastMode&&lastMode!==mode&&currentPage==='infra'&&mobileCurrent.infra==='weapons'){if(motion('battery-select',[battery],{opacity:[.45,1],translateX:[8,0],duration:350,ease:'outQuart',composition:'replace'}))swaps++;}
  lastMode=mode;fitWeapons();
 }
 const reset=document.createElement('button');reset.id='weaponFit';reset.type='button';reset.className='staff-secondary';reset.textContent='画面に合わせる';
 const zoom=$('weaponDetailZoom'),label=qs('label[for="weaponDetailZoom"]'),row=document.createElement('div');row.className='weapon-fit-controls';label.before(row);row.append(label,reset);
 function resetZoom(){zoom.value='1';zoom.dispatchEvent(new Event('input',{bubbles:true}));fitWeapons();}
 reset.addEventListener('click',resetZoom);zoom.addEventListener('input',fitWeapons);
 document.addEventListener('click',event=>{
  const button=event.target.closest?.('button[data-city-weapon],button[data-detail-weapon],button[data-armament],button[data-console-weapon],button[data-v27pick],button[data-personal-group]');if(!button||button.disabled)return;
  if(button.hasAttribute('data-detail-weapon'))resetZoom();
  if(motion('interface-selection',[button],{scale:[.96,1],duration:270,ease:'outBack(1.3)',composition:'replace'}))selections++;
 });
 const oldDraw=draw;draw=function(){oldDraw();render();};
 window.addEventListener('nerv-route',()=>{if(currentPage==='mission'&&mobileCurrent.mission==='weapon-detail')resetZoom();render();enter();});
 window.addEventListener('resize',fitWeapons);window.addEventListener('nerv-world-ready',render);
 if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(fitWeapons);observer.observe($('shell'));observer.observe($('weaponDetailImage'));}
 window.NERV_INTERFACE={fit:fitWeapons,snapshot:()=>({version:'2.22',entries,selections,swaps,fitted,ownRAF:false,batteryMode:battery.dataset.mode})};render();
}
initV222Interface();
