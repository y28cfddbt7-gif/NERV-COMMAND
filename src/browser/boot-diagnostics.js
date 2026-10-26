// NERV v4.0.2 / Stage-aware boot watchdog. NEVER modifies local saved state.
// A generic "Script error." is NOT proof that the entire app failed.
(function installNervBootDiagnostics(){
 'use strict';
 const errors=[],started=Date.now();
 window.__NERV_BOOT_ERRORS__=errors;
 window.__NERV_BOOT_STAGE__='watchdog-installed';
 const ready=()=>!!window.NERV_V400&&!!document.getElementById('v400Station');
 let displayed=false;
 function eventInfo(e,kind){
  const err=kind==='rejection'?e.reason:e.error;
  const message=String(err?.message||e.message||err||'unknown').slice(0,280);
  const file=String(e.filename||'');const line=e.lineno||0;const column=e.colno||0;
  return {kind,message,file:file.split('/').slice(-2).join('/'),line,column,stack:String(err?.stack||'').slice(0,450),stage:String(window.__NERV_BOOT_STAGE__||'unknown'),ms:Date.now()-started};
 }
 function record(e,kind){
  if(ready())return;
  if(kind==='error'&&e.target&&e.target!==window&&!e.message)return;
  errors.push(eventInfo(e,kind));
  if(errors.length>10)errors.shift();
  // Errors may be nonfatal. Never block startup synchronously from an event handler.
 }
 function trace(){
  const a=['stage: '+String(window.__NERV_BOOT_STAGE__||'unknown'),
   'elapsed: '+String(Date.now()-started)+'ms',
   'NERV_MOBILE: '+typeof window.NERV_MOBILE,
   'NERV_CONSOLE: '+typeof window.NERV_CONSOLE,
   'station: '+Boolean(document.getElementById('v400Station')),
   'v4 API: '+typeof window.NERV_V400,
   'script errors: '+errors.length];
  for(const err of errors.slice(-6))a.push(err.ms+'ms ['+err.stage+'] '+err.kind+' '+err.message+
   (err.file?' @'+err.file+':'+err.line+':'+err.column:'')+(err.stack?'\n'+err.stack:''));
  return a.join('\n');
 }
 function show(){
  if(ready()){document.getElementById('nervBootDiagnostics')?.remove();return;}
  if(displayed)return;
  displayed=true;
  const el=document.createElement('section');el.id='nervBootDiagnostics';el.setAttribute('role','alert');
  el.style.cssText='position:fixed;inset:0;z-index:2147483640;background:#071016;color:#e9eee8;overflow:auto;padding:calc(env(safe-area-inset-top,0px) + 35px) 22px 30px;font:14px/1.6 system-ui,-apple-system,sans-serif';
  const heading=document.createElement('h1');heading.textContent='NERV / 起動診断';
  heading.style.cssText='font:900 21px/1.35 ui-monospace,monospace;color:#f6b36c';
  const detail=document.createElement('p');
  detail.textContent='初期化が完了しませんでした。保存データは変更せず、停止位置を記録しています。';
  const pre=document.createElement('pre');pre.id='nervBootTrace';pre.textContent=trace();
  pre.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;background:#172a30;border:1px solid #a66b4a;padding:12px;font:12px/1.5 ui-monospace,monospace;color:#ffb9a6';
  const copy=document.createElement('button');copy.type='button';copy.textContent='診断情報をコピー';
  const reload=document.createElement('button');reload.type='button';reload.textContent='再読み込み';
  for(const btn of [copy,reload])btn.style.cssText='display:block;width:100%;padding:14px;margin-top:15px;background:#314b51;color:#fff3dc;border:1px solid #c7935a;font:800 14px system-ui';
  copy.onclick=()=>{const ta=document.createElement('textarea');ta.value=trace();document.body.append(ta);ta.select();try{document.execCommand('copy')}catch(_){ }ta.remove();};
  reload.onclick=()=>location.reload();
  el.append(heading,detail,pre,copy,reload);document.body.append(el);
 }
 window.addEventListener('error',e=>record(e,'error'),true);
 window.addEventListener('unhandledrejection',e=>record(e,'rejection'));
 setTimeout(()=>{if(!ready())show()},8500);
 window.__NERV_BOOT_DIAGNOSTICS__={ready,trace,show,errors,recordTestError:(msg)=>record({message:msg},'error')};
})();
