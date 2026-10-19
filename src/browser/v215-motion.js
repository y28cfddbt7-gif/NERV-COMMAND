// Anime.js 4.5.0 is vendored under MIT. Its own RAF loop is disabled.
function initV215Motion(){
 if(!window.NERV_FX||!window.anime)return;const live=new Map();let ticks=0;
 function stop(key){const item=live.get(key);if(!item)return;item.animation.complete();item.animation.cancel();live.delete(key);}
 function stopAll(){for(const key of [...live.keys()])stop(key);}
 function visible(owner){const r=owner?.getBoundingClientRect();return !!r&&r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight;}
 function tween(key,from,to,update,owner,duration=480){
  stop(key);if(document.hidden||!isMoving()||!visible(owner)){update(to);return false;}
  if(live.size>=6)stop(live.keys().next().value);const value={progress:from};
  const animation=window.anime.animate(value,{progress:to,duration:Math.min(800,Math.max(100,duration)),ease:'outCubic',onUpdate:()=>update(value.progress),onComplete:()=>{update(to);live.delete(key);}});
  live.set(key,{animation,owner});window.NERV_FX.refresh();return true;
 }
 window.NERV_FX.registerHook(()=>{for(const [key,item]of live)if(!visible(item.owner))stop(key);window.anime.engine.fps=S.prefs.fxQuality==='low'?20:60;window.anime.engine.update();ticks++;},()=>live.size>0&&!document.hidden&&isMoving());
 window.addEventListener('nerv-route',()=>{stopAll();const panel=qs('.page.active .mobile-view:not([hidden]) .v215-panel');if(panel)tween('panel-open',0,1,v=>{panel.style.opacity=String(.6+v*.4);panel.style.transform=v===1?'':'translateY('+(4*(1-v))+'px)';},panel,260);});
 document.addEventListener('visibilitychange',stopAll);window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',stopAll);$('motionSwitch').addEventListener('click',stopAll);
 window.NERV_MOTION={tween,stopAll,snapshot:()=>({library:'Anime.js',version:'4.5.0',active:live.size,ticks,ownRAF:window.anime.engine.reqId,defaultMainLoop:window.anime.engine.useDefaultMainLoop})};
}
initV215Motion();
