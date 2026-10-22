// NERV v2.26.1 / restore WebAudio after iOS foreground interruptions.
// Additive compatibility layer: preserve original sound score, volume, game state and saved settings.
function initV2261AudioRecovery(){
 if(typeof prepareSound!=='function'||typeof stopSound!=='function')return;
 let needsReopen=false,returnEvents=0,rebuilds=0,attempts=0,failures=0;
 let resumePending=null;
 const context=()=>typeof audio==='undefined'?null:audio;
 const enabled=()=>typeof S!=='undefined'&&Boolean(S?.prefs?.sound);
 function attemptResume(){
  const ctx=context();
  if(!enabled()||document.hidden||!ctx||ctx.state==='running'||ctx.state==='closed')return;
  if(resumePending)return;
  attempts++;
  try{
   const p=ctx.resume();
   if(p?.then){
    resumePending=p;
    p.catch(()=>{failures++;}).finally(()=>{if(resumePending===p)resumePending=null;});
   }
  }catch(e){failures++;}
 }
 // If iOS paused the window, the old context can report "running" despite being silent.
 // Rebuild it ONCE, on the next real user gesture. No autoplay or background sound.
 function recoverOnGesture(){
  if(document.hidden||!enabled())return;
  if(needsReopen){
   needsReopen=false;
   const previous=context();
   if(previous){
    stopSound();
    audio=null;soundBus=null;soundLimiter=null;
    try{if(previous.state!=='closed'){const closing=previous.close();closing?.catch?.(()=>{});}}catch(e){}
    rebuilds++;
   }
   resumePending=null;
  }
  try{prepareSound();}catch(e){failures++;}
  attemptResume();
 }
 function markInterrupted(){
  const ctx=context();
  if(ctx&&ctx.state!=='closed'){needsReopen=true;stopSound();}
 }
 function onForeground(){
  if(document.hidden)return;
  returnEvents++;
  // Restart an interrupted context when supported. Gesture fallback reconstructs
  // audio if the iOS WebKit context stays silent despite reporting "running".
  attemptResume();
 }
 const originalPrepare=prepareSound;
 prepareSound=function(){
  const ok=originalPrepare();
  if(ok&&context()?.state==='interrupted')attemptResume();
  return ok;
 };
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden)markInterrupted();else onForeground();
 });
 window.addEventListener('pagehide',markInterrupted);
 window.addEventListener('pageshow',onForeground);
 window.addEventListener('blur',markInterrupted);
 window.addEventListener('focus',onForeground);
 document.addEventListener('pointerdown',recoverOnGesture,true);
 if(!('PointerEvent' in window))document.addEventListener('touchstart',recoverOnGesture,{capture:true,passive:true});
 document.addEventListener('keydown',event=>{
  if(event.isTrusted&&['Enter',' ','Spacebar'].includes(event.key))recoverOnGesture();
 },true);
 window.NERV_AUDIO_RECOVERY={
  version:'2.26.1',
  snapshot:()=>({contextState:context()?.state||'uninitialized',needsReopen,rebuilds,returnEvents,attempts,failures,soundEnabled:enabled()}),
  onForeground
 };
}
initV2261AudioRecovery();
