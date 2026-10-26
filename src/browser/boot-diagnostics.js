// NERV v4.0.2 / defer fatal UI until initialization is actually known to have failed.
// A generic cross-origin "Script error." during bootstrap is NOT itself a fatal verdict.
// Never writes to the user's saved state, localStorage or Scriptable FileManager.
(function installNervBootDiagnostics(){
 'use strict';
 const errors=[];
 window.__NERV_BOOT_ERRORS__=errors;
 let displayed=false,started=Date.now(),timer=null;
 const ready=()=>!!window.__NERV_BOOT_BUNDLE_COMPLETE__&&!!window.__NERV_V400_RENDERED__&&!!window.NERV_V400&&!!document.getElementById('v400Station');
 function detail(event,kind){
  const error=kind==='rejection'?event.reason:event.error;
  const message=String(error?.message||event.message||error||'No message').slice(0,260);
  const source=event.filename?String(event.filename).split('/').slice(-2).join('/'):'';
  const position=event.lineno?(':'+event.lineno+':'+(event.colno||0)):'';
  const stack=error?.stack?String(error.stack).slice(0,520):'';
  return {kind,message,source,position,stack,at:Date.now()-started,stage:window.__NERV_BOOT_STAGE__||'unmarked'};
 }
 function record(event,kind){
  if(ready())return;
  if(kind==='error'&&event.target&&event.target!==window && !event.message)return; // image/link events
  const item=detail(event,kind);
  errors.push(item);
  if(errors.length>12)errors.shift();
  // No immediate blocking overlay. Later modules may still initialize normally.
 }
 function summary(){
  const last=errors.at(-1);
  const symbols=[
    'stage='+String(window.__NERV_BOOT_STAGE__||'unknown'),
    'elapsed='+String(Date.now()-started)+'ms',
    'NERV_MOBILE='+typeof window.NERV_MOBILE,
    'consoleBattleCommand='+typeof window.NERV_CONSOLE?.battle,
    'v400Station='+!!document.getElementById('v400Station'),
    'NERV_V400='+typeof window.NERV_V400,
    'stationRendered='+!!window.__NERV_V400_RENDERED__,
    'bundleComplete='+!!window.__NERV_BOOT_BUNDLE_COMPLETE__,
    'appVersion=4.0.2',
    'errors='+errors.length,
  ];
  if(last){
    symbols.push('lastError='+last.message);
    symbols.push('source='+last.source+last.position);
    if(last.stack)symbols.push('stack='+last.stack);
  }
  if(errors.length>1) symbols.push('errorHistory='+errors.slice(-5).map(x=>
    '['+x.at+'ms '+x.stage+'] '+x.message).join(' | '));
  return symbols.join('\n');
 }
 function show(){
  if(ready()){const old=document.getElementById('nervBootDiagnostics');old?.remove();return;}
  if(displayed)return;
  displayed=true;
  const panel=document.createElement('section');
  panel.id='nervBootDiagnostics';panel.setAttribute('role','alert');
  panel.style.cssText='position:fixed;inset:0;z-index:2147483640;background:#071016;color:#e9eee8;overflow-y:auto;padding:calc(env(safe-area-inset-top,0px) + 35px) 22px 30px;font:14px/1.65 system-ui,-apple-system,sans-serif';
  const title=document.createElement('h1');title.textContent='NERV / 起動診断';
  title.style.cssText='font:900 21px/1.35 ui-monospace,monospace;color:#f6b36c';
  const info=document.createElement('p');
  info.textContent='初期化が完了しませんでした。保存データには操作していません。起動停止箇所を記録しました。';
  const diagnostics=document.createElement('pre');
  diagnostics.id='nervBootTrace';diagnostics.textContent=summary();
  diagnostics.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;background:#172a30;border:1px solid #a66b4a;padding:12px;color:#ffb9a6;font:12px/1.65 ui-monospace,monospace';
  const copy=document.createElement('button');copy.textContent='診断情報をコピー';
  const retry=document.createElement('button');retry.textContent='画面を再読み込み';
  for(const control of [copy,retry])control.style.cssText='display:block;width:100%;padding:13px;margin-top:12px;background:#314b51;color:#fff3dc;border:1px solid #c7935a;font:750 14px system-ui';
  copy.onclick=()=>{
    const textarea=document.createElement('textarea');textarea.value=summary();document.body.append(textarea);
    textarea.select();try{document.execCommand('copy')}catch(_){}textarea.remove();
    copy.textContent='コピーしました（非対応端末では選択して共有）';
  };
  retry.onclick=()=>location.reload();
  panel.append(title,info,diagnostics,copy,retry);
  document.body.append(panel);
 }
 window.addEventListener('error',event=>record(event,'error'),true);
 window.addEventListener('unhandledrejection',event=>record(event,'rejection'));
 // Do not equate the first incidental script error with failed startup.
 timer=setTimeout(()=>{if(!ready())show()},8500);
 window.__NERV_BOOT_DIAGNOSTICS__={ready,summary,show,
   // Built-in test hook: lets the browser verify that recovery from a generic
   // transient script error never creates a full-screen overlay.
   recordTestError(message){record({message},'error');},
   errors};
})();
