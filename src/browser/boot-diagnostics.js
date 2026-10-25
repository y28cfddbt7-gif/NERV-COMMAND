// NERV / early WebView boot watchdog. Zero persistent-state writes.
(function installNervBootDiagnostics(){
 'use strict';
 const errors=[];
 window.__NERV_BOOT_ERRORS__=errors;
 function record(reason){
  const text=String(reason?.message||reason||'原因不明').slice(0,280);
  if(errors[errors.length-1]!==text)errors.push(text);
  if(errors.length>6)errors.shift();
  // Report after the current JS turn. Do not make recoverable optional-map
  // errors block an already-mounted command workstation.
  setTimeout(()=>{
   if(document.getElementById('v400Station')&&window.NERV_V400)return;
   reveal(text);
  },0);
 }
 function reveal(reason){
  if(document.getElementById('nervBootDiagnostics'))return;
  const panel=document.createElement('section');panel.id='nervBootDiagnostics';
  panel.setAttribute('role','alert');
  panel.style.cssText='position:fixed;inset:0;z-index:2147483640;background:#071016;color:#e9eee8;overflow-y:auto;padding:calc(env(safe-area-inset-top,0px) + 35px) 22px 30px;font:14px/1.65 system-ui,-apple-system,sans-serif';
  const title=document.createElement('h1');title.textContent='NERV / 起動系統異常';
  title.style.cssText='font:900 21px/1.35 ui-monospace,monospace;color:#f6b36c;letter-spacing:.04em';
  const info=document.createElement('p');
  info.textContent='WebViewの初期化に失敗しました。保存データには操作していません。';
  const code=document.createElement('pre');code.textContent=reason;
  code.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;background:#172a30;border:1px solid #a66b4a;padding:15px;color:#ffb9a6';
  const action=document.createElement('button');action.type='button';action.textContent='画面を再読み込み';
  action.style.cssText='display:block;width:100%;padding:14px;margin-top:25px;background:#314b51;color:#fff3dc;border:1px solid #c7935a;font:750 15px system-ui';
  action.addEventListener('click',()=>location.reload());
  panel.append(title,info,code,action);
  document.body.append(panel);
 }
 window.addEventListener('error',event=>record(event.error||event.message),true);
 window.addEventListener('unhandledrejection',event=>record(event.reason));
 // Covers scripts that silently skip initialization (old loader, WebKit memory
 // pressure, missing dependencies) without an uncaught exception.
 setTimeout(()=>{
  if(!window.NERV_V400||!document.getElementById('v400Station')){
   reveal(errors.at(-1)||'作戦管制の初期化が完了しませんでした。');
  }
 },6500);
})();
