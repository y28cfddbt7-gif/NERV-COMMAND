// Opt-in native AI, bounded and asynchronous. No secret crosses the WebView bridge.
function initPersonnelAI(){
 if(!window.NERV_MESSAGES||!qs('#staffSupport'))return;
 let status={available:false,configured:false,enabled:false,model:'',generation:0},preparing=false,configuring=false,lastError='';
 const active=new Set(),replies=new Map();
 const key=p=>p.to+':'+p.replyTo;
 function aiCall(action,payload={}){
  if(!window.__SCRIPTABLE__)return Promise.resolve({error:'API設定はScriptableで利用できます',available:false,enabled:false});
  if(action!=='aiReply')return callNative(action,payload);
  return new Promise(resolve=>{const id=nextBridgeId++;let timer=setTimeout(()=>{delete bridgeCallbacks[id];resolve({error:'応答待ち時間を超えました / オフラインで継続'});},15000);bridgeCallbacks[id]=result=>{clearTimeout(timer);resolve(result);};window.__nervQueue.push({id,action,payload});});
 }
 async function refresh(){const result=await aiCall('aiStatus');status={...status,...result};render();return snapshot();}
 function signature(id){const c=dialogAIContext(id);return JSON.stringify({world:c?.world,character:id,generation:status.generation});}
 function allowed(p){const m=personalThread(p.to).memory,topic=dialogIntent(p.input||'','free',m);return status.enabled&&dialogWorld().mode==='normal'&&typeof p.input==='string'&&!['restricted','request','end'].includes(topic);}
 async function prepare(){
  if(preparing||!personalReady||document.hidden||!S.infra.comms||active.size)return;
  const p=S.personalMessages.pending.find(p=>p.due<=Date.now()&&!p.aiAttempted&&allowed(p));if(!p)return;
  preparing=true;active.add(key(p));
  try{
   // Persist the attempt first. Restarting never repeats a potentially billable request.
   const result=await personalIncoming(data=>{const current=data.pending.find(x=>x.replyTo===p.replyTo);if(!current)throw Error('送信を取り消しました');current.aiAttempted=true;});
   if(!result.ok){active.delete(key(p));return;}
   const worldSignature=signature(p.to),context=dialogAIContext(p.to);context.character={id:p.to,name:personalById(p.to).name};context.mode='ai';
   aiCall('aiReply',{id:p.replyTo+':'+p.to,input:p.input,context}).then(result=>{
    const validated=result?.ok?dialogValidateSuggestion(result.reply):null;
    replies.set(key(p),validated?{validated,signature:worldSignature,model:dialogText(result.model,80)}:{error:dialogText(result?.error||'API応答を確認できません',160)});
    active.delete(key(p));lastError=validated?'':replies.get(key(p)).error;render();
    if(!document.hidden)personalPulse();
   }).catch(()=>{active.delete(key(p));replies.set(key(p),{error:'API接続エラー'});lastError='API接続エラー';if(!document.hidden)personalPulse();});
  }finally{preparing=false;render();}
 }
 function take(p,offline){
  const r=replies.get(key(p));
  if(r?.validated&&status.enabled&&r.signature===signature(p.to)&&dialogWorld().mode==='normal'){
   const suggestion=r.validated.suggestion;
   return {...offline,text:r.validated.text,transport:'ai',model:r.model,proposal:suggestion?{kind:suggestion.kind,route:suggestion.route,label:'担当画面で要件を確認'}:null};
  }
  return {...offline,transport:p.aiAttempted?'offline-fallback':'offline'};
 }
 function prune(){const pending=new Set(S.personalMessages?.pending?.map(p=>key(p))||[]);for(const id of replies.keys())if(!pending.has(id))replies.delete(id);render();}
 async function configure(){if(configuring)return;configuring=true;render();try{const result=await aiCall('aiConfigure');status={...status,...result};lastError=result.error||'';if(!status.enabled)replies.clear();}finally{configuring=false;render();if(personalReady)personalPulse();}}
 function snapshot(){return {status:{...status},busy:active.size>0,configuring,error:lastError,pendingRequests:active.size};}
 function render(){
  if(!$('personnelAIState'))return;
  meteoText('personnelAIState',status.enabled?'AI会話 ON / '+status.model:status.configured?'API設定済み / 外部送信 OFF':'オフライン会話 / API未設定');
  meteoText('personnelAIEndpoint',status.available?status.host||'Scriptable / Keychain':'ブラウザ表示ではAPIキーを保存しません。Scriptableで設定してください。');
  meteoText('personnelAIActivity',active.size?'API応答待ち / 他の管制操作は継続できます':lastError||'未設定・障害・警戒時はオフライン会話を使用します。');
  $('personnelAIConfigure').disabled=configuring||!window.__SCRIPTABLE__;$('personnelAIConfigure').textContent=configuring?'ネイティブ設定を開いています…':'接続先・モデル・APIキーを設定';
  const pending=Array.isArray(S.personalMessages?.pending)?S.personalMessages.pending:[];
  const selected=pending.find(p=>p?.to===personalContact);if(selected&&active.has(key(selected)))meteoText('messageTyping','外部AIに接続中 / 回答を照合しています…');
 }
 const panel=document.createElement('section');panel.className='mobile-view';panel.dataset.view='ai';panel.innerHTML='<div class="staff-panel"><p class="eyebrow">PERSONNEL / AI CONNECTION</p><h2>動的AI会話</h2><p id="personnelAIState" class="staff-guide"></p><p id="personnelAIEndpoint" class="staff-note"></p><button id="personnelAIConfigure" class="staff-primary">接続先・モデル・APIキーを設定</button><p id="personnelAIActivity" class="staff-note" role="status"></p><p class="staff-note">キーはScriptableのKeychainだけに保存します。OpenAI Responsesと互換Chat CompletionsのHTTPS接続先・モデルを設定できます。</p><p class="staff-note">ON時だけ、選択相手の人格・公開状態・最新12メッセージ・記憶を設定先へ送ります。API利用料金が発生する場合があります。自発通信はオフライン処理です。</p><p class="staff-note">発令・業務処理は担当画面で確認します。AIは内部状態を変更しません。設定画面から外部送信OFF・キー削除も行えます。</p><button class="staff-secondary" data-ops-route="messages/thread">トークへ ↗</button></div>';
 qs('.page[data-page="messages"]').append(panel);registerTerminalView('messages','ai','AI設定');$('personnelAIConfigure').addEventListener('click',configure);
 for(const target of [qs('.page[data-page="messages"] [data-view="preferences"] .staff-panel'),qs('.page[data-page="settings"] [data-view="data"]')]){const b=document.createElement('button');b.className='staff-secondary';b.dataset.opsRoute='messages/ai';b.textContent='動的AI会話・API設定 ↗';target?.append(b);}
 const priorRender=renderPersonalMessages;renderPersonalMessages=function(){priorRender();render();};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&window.__SCRIPTABLE__)refresh();});
 window.NERV_AI={refresh,configure,prepare,holds:p=>status.enabled&&active.has(key(p)),take,prune,snapshot};
 refresh();
}
initPersonnelAI();
