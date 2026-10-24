// Phase 2 / Formal traffic lives INSIDE existing communications contacts tab.
// No separate subpage. Private chats, character memories, and AI remain untouched.
(function initV301OperationalRadioUI(){
 const api=window.NERV_OPS_COMMS;if(!api||!window.NERV_MOBILE)return;
 const root=document.createElement('section');root.id='v301Radio';root.className='v301-radio';
 root.setAttribute('aria-label','作戦連絡とパイロットの受領確認');
 root.innerHTML='<details id="v301RadioFold">'+
 '<summary><b>作戦通信 / OPERATIONS RADIO</b><span id="v301RadioStatus">待機</span></summary>'+
 '<div class="v301-radio-body"><div class="v301-radio-status" id="v301RadioCase">作戦待機</div>'+
 '<div class="v301-radio-fields">'+
 '<label>連絡先<select id="v301Recipient"></select></label>'+
 '<label>正式照会<select id="v301Topic"></select></label>'+
 '<label id="v301SectorLabel">対象区画<select id="v301Sector">'+
 '<option value="0">西部</option><option value="1">中央</option><option value="2">東部</option></select></label></div>'+
 '<div class="v301-radio-buttons"><button type="button" id="v301Request">照会送信</button>'+
 '<button type="button" id="v301Flush">保留通信を再送</button></div>'+
 '<div id="v301Requests" class="v301-radio-requests" aria-label="未完了の作戦通信"></div>'+
 '<header class="v301-radio-log-title">作戦記録 / 正式通信のみ</header>'+
 '<div class="v301-radio-log" id="v301RadioLog"></div>'+
 '<p id="v301RadioFeedback" role="status" aria-live="polite">業務指令の受領確認は、私的会話とは独立して記録されます。</p>'+
 '</div></details>';
 const $=id=>root.querySelector('#'+id);
 const ids=['hyuga','maya','aoba','ritsuko','misato','rei','shinji','asuka'];
 const topicNames={threat:'敵影・進路情報',eva:'EVA状態照会',comms:'回線状況',magi:'MAGI技術確認',
  orders:'正式命令の照会',position:'現在配置の報告','shutter-safety':'防壁展開前の射線確認'};
 const contacts=api.contacts;
 let busy=false,serial=0,picked='hyuga',topic='threat',lastSig='';
 for(const id of ids){const option=document.createElement('option');option.value=id;option.textContent=contacts[id].name;$('v301Recipient').append(option);}
 const updateTopics=()=>{
  const select=$('v301Topic'),old=topic;select.replaceChildren();
  for(const t of contacts[picked].topics){const option=document.createElement('option');option.value=t;option.textContent=topicNames[t]||t;select.append(option);}
  topic=contacts[picked].topics.includes(old)?old:contacts[picked].topics[0];select.value=topic;
  $('v301SectorLabel').hidden=topic!=='shutter-safety';
 };
 $('v301Recipient').value=picked;updateTopics();
 const statuses={queued:'送信保留',awaiting_reply:'返信待ち',replied:'返信受信',acknowledged:'受領確認済み',stale:'期限切れ'};
 function place(){
  const panel=typeof mobileSection==='function'?mobileSection('messages','contacts'):null;
  if(panel&&!panel.contains(root)){panel.prepend(root);}
 }
 function render(){
  if(!root.isConnected)return;
  const d=api.read();if(d.blocked){$('v301RadioFeedback').textContent=d.error||'作戦情報が読み取れません';return;}
  const active=d.status==='active';
  $('v301RadioStatus').textContent=!active?'待機':d.comms?'回線接続':'回線断 / 保留';
  $('v301RadioCase').textContent=active?'CASE '+S.defense.caseNo+' / '+d.phase+' / 波形解析 '+d.scans+'%':'使徒迎撃作戦の開始後に、正式な照会が可能になります';
  $('v301Request').disabled=busy||!active;
  $('v301Flush').disabled=busy||!active||!d.comms||!d.queued;
  $('v301Flush').textContent=d.queued?'保留 '+d.queued+' 件を再送':'保留通信なし';
  const requestBox=$('v301Requests');requestBox.replaceChildren();
  for(const r of d.transmissions.slice(-7).reverse()){
   const line=document.createElement('div');line.className='v301-radio-item';line.dataset.status=r.status;
   const info=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('small');
   title.textContent=(contacts[r.recipient]?.name||r.recipient)+' / '+(topicNames[r.topic]||r.topic);
   detail.textContent=(statuses[r.status]||r.status)+(r.sector!=null?' / '+['西部','中央','東部'][r.sector]:'');
   info.append(title,detail);line.append(info);
   if(r.status==='awaiting_reply'||r.status==='replied'){
    const action=document.createElement('button');action.type='button';
    action.textContent=r.status==='awaiting_reply'?'返信を受信':'受領確認';
    action.dataset.transmissionId=r.id;action.dataset.kind=r.status==='awaiting_reply'?'comms.reply':'comms.acknowledge';
    action.disabled=busy||(r.status==='awaiting_reply'&&!d.comms);
    line.append(action);
   }
   requestBox.append(line);
  }
  if(!d.transmissions.length){const p=document.createElement('p');p.textContent='未処理の業務照会はありません';requestBox.append(p);}
  const radio=$('v301RadioLog'),list=d.operationalMessages||[];
  const sig=list.slice(-6).map(m=>m.id+':'+m.delivery).join('|');
  if(sig!==lastSig){
   radio.replaceChildren();
   for(const m of list.slice(-6).reverse()){
    const line=document.createElement('p'),name=document.createElement('strong'),msg=document.createElement('span');
    name.textContent=m.sender;msg.textContent='：'+m.text+(m.delivery==='queued'?'［未送信］':'');
    line.append(name,msg);radio.append(line);
   }
   if(!list.length){const p=document.createElement('p');p.textContent='正式な通信ログはまだありません';radio.append(p);}
   lastSig=sig;
  }
 }
 async function send(kind,payload={}){
  if(busy)return;
  const state=api.read();if(state.blocked||state.status!=='active')return;
  const commandId='C3R-'+Date.now().toString(36)+'-'+(++serial).toString(36);
  busy=true;render();
  try{
   const result=await api.dispatch({commandId,caseId:state.caseId,actorId:'operator-C3',kind,
    expectedRevision:state.revision,payload});
   $('v301RadioFeedback').textContent=(result.ok?'受領：':'保留：')+(result.message||result.error||kind);
  }catch(error){$('v301RadioFeedback').textContent='通信処理に失敗：'+error.message;}
  finally{busy=false;render();}
 }
 $('v301Recipient').addEventListener('change',e=>{picked=e.target.value;updateTopics();render();});
 $('v301Topic').addEventListener('change',e=>{topic=e.target.value;updateTopics();render();});
 $('v301Request').addEventListener('click',()=>send('comms.request',{
  recipient:picked,topic,sector:topic==='shutter-safety'?Number($('v301Sector').value):undefined}));
 $('v301Flush').addEventListener('click',()=>send('comms.flush'));
 $('v301Requests').addEventListener('click',e=>{
  const b=e.target.closest('[data-transmission-id]');if(!b||b.disabled)return;
  send(b.dataset.kind,{transmissionId:b.dataset.transmissionId});
 });
 const priorDraw=draw;
 draw=function(){priorDraw();place();render();};
 window.addEventListener('nerv-route',()=>{place();render();});
 window.addEventListener('nerv-world-ready',()=>{place();render();});
 window.addEventListener('nerv-command-v3',()=>{place();render();});
 window.NERV_OPS_COMMS_UI={open:()=>{
   place();window.NERV_MOBILE.open('messages','contacts');$('v301RadioFold').open=true;render();
  },snapshot:()=>({mounted:root.isConnected,busy,recipient:picked,topic,open:$('v301RadioFold').open})};
 place();render();
})();
