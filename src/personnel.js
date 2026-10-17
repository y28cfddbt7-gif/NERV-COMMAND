/* v2.8 Personnel / dispatch extension. Runs inside the existing state closure. */
function initPersonnelTerminal(){
 if(!qs('.page[data-page="tools"] .page-top')?.insertAdjacentHTML)return;
 // Preserve the original v2 save once, before adding optional personnel fields.
 if(!window.__SCRIPTABLE__){try{
  const raw=localStorage.getItem('nerv-command-v2');
  if(raw&&!localStorage.getItem('nerv-command-v2-pre-v28'))localStorage.setItem('nerv-command-v2-pre-v28',raw);
 }catch(e){console.warn('Personnel backup unavailable',e.name);}}
 const previous=S.personnel&&typeof S.personnel==='object'?S.personnel:{};
 S.personnel={name:typeof previous.name==='string'?previous.name.slice(0,24):'OPERATOR',
  department:typeof previous.department==='string'?previous.department.slice(0,32):'作戦管制部',
  feed:Array.isArray(previous.feed)?previous.feed.filter(x=>x&&typeof x.text==='string'&&typeof x.at==='number').slice(0,12):[]};
 S.prefs.hqComms=typeof S.prefs.hqComms==='boolean'?S.prefs.hqComms:true;
 S.prefs.hqVoice=S.prefs.hqVoice===true;
 const messages={
  broadcast:[['総務部 / GENERAL AFFAIRS','本日の入館証を携帯してください。模擬訓練区画への入室時は端末認証が必要です。'],
   ['施設管理 / FACILITIES','中央連絡通路の点検を実施中。移動には東側連絡通路をご利用ください。'],
   ['職員支援 / PERSONNEL','休憩時間のお知らせ。交代要員への引き継ぎ後、補給区画をご利用ください。'],
   ['作戦本部 / OPERATIONS','これは館内放送の訓練です。各部署は通常の模擬勤務を継続してください。']],
  radio:[['技術部・整備班 / TECHNICAL','定時連絡。整備班は次回点検の準備に入ります。管制側は機体状況をご確認ください。'],
   ['中央管制 / CENTRAL CONTROL','通信回線の定時確認です。受信した職員は端末の受領確認をお願いします。'],
   ['兵站管理 / LOGISTICS','補給区画より連絡。模擬資材の配分は防衛盤の現在値を参照してください。'],
   ['MAGI運用班 / MAGI OPERATIONS','三基の定期照合を予定しています。戦術判断はMAGI画面で別途実行してください。']]
 };
 const portrait=`<svg viewBox="0 0 100 125" aria-hidden="true"><path d="M0 25h100M0 50h100M0 75h100M0 100h100M25 0v125M50 0v125M75 0v125" stroke="currentColor" opacity=".13"/><circle cx="50" cy="40" r="21" fill="currentColor" opacity=".8"/><path d="M12 120V98c0-24 17-33 38-33s38 9 38 33v22" fill="currentColor" opacity=".8"/><path d="M34 70l16 26 16-26M50 96v29" fill="none" stroke="#d8d5c7" stroke-width="3"/></svg>`;
 eHTML('.page[data-page="home"] .page-top','afterend',`<section class="hq-dispatch" aria-label="本部通信 / ゲーム内演出"><div class="hq-kicker"><span class="hq-led"></span> HQ DISPATCH <span>SIMULATED / 01</span></div><p id="hqDispatchText">本部通信待機中。館内放送・職員連絡はゲーム内の演出です。</p><div class="hq-row"><button data-hq="personnel">職員支援を開く <span>PERSONNEL ↗</span></button><button data-hq="id">職員証 <span>ID CARD ↗</span></button></div></section>`);
 eHTML('.page[data-page="tools"] .page-top','afterend',`<section class="hq-panel" aria-labelledby="hqPersonnelTitle"><header class="hq-panel-head"><div><small>07 / PERSONNEL SERVICES</small><h2 id="hqPersonnelTitle">職員支援室</h2></div><span class="hq-badge">LOCAL / SIM</span></header><div class="hq-personnel-brief"><div class="hq-mini-portrait">${portrait}</div><div><small>AUTHORIZED OPERATOR</small><strong id="hqProfileName">OPERATOR</strong><span id="hqProfileRank">TRAINEE</span></div><button data-hq="id">職員証を提示 <span>VIEW ID ↗</span></button></div><form id="hqProfileForm" class="hq-profile-form"><label>表示名 / CALLSIGN<input id="hqName" maxlength="24" autocomplete="off" required></label><label>所属 / DEPARTMENT<input id="hqDepartment" maxlength="32" autocomplete="off" required></label><button type="submit">職員情報を保存</button><small>架空の職員情報です。実名の入力は不要です。</small></form></section>
 <section class="hq-panel" aria-labelledby="hqInboxTitle"><header class="hq-panel-head"><div><small>INTERNAL NETWORK / SIMULATION</small><h2 id="hqInboxTitle">館内放送・職員通信</h2></div><span id="hqUnread" class="hq-badge">0 NEW</span></header><p class="hq-note">すべて架空の通信です。実際の警報・指示ではありません。</p><div class="hq-row"><button data-hq="broadcast">館内放送を受信 <span>PA SYSTEM</span></button><button data-hq="radio">職員連絡を受信 <span>COMMS</span></button></div><div id="hqCommsFeed" class="hq-feed" aria-live="polite" aria-relevant="additions"></div></section>`);
 eHTML('.page[data-page="settings"] .settings-list','beforeend',`<button id="hqCommsSwitch" class="setting-row"><span><b>ランダム館内通信</b><small>表示中のみ約65〜140秒ごと / ゲーム内演出</small></span><strong id="hqCommsFlag"></strong></button><button id="hqVoiceSwitch" class="setting-row"><span><b>館内放送の読み上げ</b><small>効果音ON時のみ / 対応端末の日本語音声</small></span><strong id="hqVoiceFlag"></strong></button>`);
 eHTML(document.body,'beforeend',`<dialog id="hqIdDialog" class="hq-dialog" aria-labelledby="hqIdTitle"><div class="hq-dialog-head"><div><small>PERSONNEL AUTHENTICATION / SIM</small><h2 id="hqIdTitle">職員身分証明書</h2></div><button data-hq="close" aria-label="職員証を閉じる">×</button></div><article class="hq-id-card" id="hqIdCard"><div class="hq-id-top"><b>NERV</b><span>PERSONNEL IDENTIFICATION<br>第3新東京市 / 作戦本部</span></div><div id="hqIdFront"><div class="hq-id-body"><div class="hq-id-portrait">${portrait}<span>NO PHOTO / SIM</span></div><div class="hq-id-fields"><small>NAME / 氏名</small><strong id="hqIdName"></strong><small>DEPARTMENT / 所属</small><b id="hqIdDepartment"></b><small>GRADE / 模擬階級</small><b id="hqIdRank"></b></div></div><div class="hq-id-serial"><span>NC · 0001 · LOCAL</span><b>ACCESS / SIM ONLY</b></div><div class="hq-barcode" aria-hidden="true"></div></div><div id="hqIdBack" hidden><h3>取扱区分 / LOCAL ONLY</h3><p>このカードは非公式ファン作品内の架空の職員証です。本人確認・実際の入館には使用できません。</p><dl><dt>発行区分</dt><dd>端末内シミュレーション</dd><dt>所属設定</dt><dd>職員支援室から変更可能</dd><dt>認証情報</dt><dd>外部送信なし</dd></dl></div><footer>UNOFFICIAL FAN SIMULATION / 架空職員証</footer></article><div class="hq-row"><button id="hqFlipId">裏面を表示 / REVERSE</button><button data-hq="close">提示を終了 / CLOSE</button></div></dialog>
 <dialog id="hqActionDialog" class="hq-dialog hq-action-dialog" aria-labelledby="hqActionTitle"><div class="hq-dialog-head"><div><small>COMMAND ROUTING / SIMULATION</small><h2 id="hqActionTitle">行動選択</h2></div><button data-hq="close" aria-label="行動選択を閉じる">×</button></div><nav class="hq-breadcrumb" aria-label="選択の階層"><button id="hqActionBack">分類に戻る</button><span id="hqActionPath">01 / CATEGORY</span></nav><div id="hqActionContent"></div><p class="hq-note">確認画面から実行するまで資材・状態は変化しません。</p></dialog>`);
 const categories=[
  {key:'recon',code:'01',title:'索敵・解析',en:'RECONNAISSANCE',hint:'敵性反応を捉え、次の判断へ。',items:['v27Detect','v27Scan']},
  {key:'facility',code:'02',title:'施設・兵站',en:'DEFENSE / LOGISTICS',hint:'選択施設の装甲・兵装・電力・修理。',items:['v27Armor','v27Turret','v27Power','v27Repair']},
  {key:'support',code:'03',title:'EVA支援',en:'EVA SUPPORT',hint:'電源接続と作戦条件を確認。',items:['v27Cable','v27Shot']},
  {key:'turn',code:'04',title:'作戦時間',en:'ADVANCE OPERATION',hint:'迎撃と敵接近が進行します。',items:['v27Advance']}
 ];
 const commandInfo={
  v27Detect:['新規敵性反応','新しい模擬敵性反応を検知。既存の施設損傷は維持されます。','待機中のみ実行可能'],
  v27Scan:['波形・A.T.分析','敵性波形の解析を進め、MAGI戦術審議に備えます。','防衛電力 12 / 都市主電源ON'],
  v27Armor:['装甲を展開','選択施設に防御装甲を展開します。','防衛電力 12 / 都市主電源ON'],
  v27Turret:['迎撃砲台を配備','選択施設にターン迎撃用の兵装を配備します。','資材 20 / 施設HP 25以上 / 地上3施設'],
  v27Power:['補助電力を投入','予備送電を使用して防衛電力を補充します。','予備送電 1'],
  v27Repair:['施設を応急修理','選択施設の損傷を修復します。','資材 18 / 施設HP +27（上限100）'],
  v27Cable:['EVA電源ケーブル','攻撃担当EVAのアンビリカルケーブルを接続・解除します。','接続時：電力 7 / 主電源ON / 作戦中・攻撃担当機出撃'],
  v27Shot:['EVA支援射撃','既存の出撃・作戦・MAGI・蓄電・照準条件を満たして支援射撃。','PHASE 04–05 / 充填70%以上 / 熱80%未満 / 照準・両MAGI承認'],
  v27Advance:['作戦時間を進める','迎撃砲が発砲し、敵が接近。施設の被弾・内部電源消費が発生し得ます。','作戦中のみ / 1ターン進行']
 };
 let actionCategory=null,actionId=null,opener=null,commsTimer=null,lastMessage='',soundHandled=false;
 const originalSound=sound;
 sound=function(kind){soundHandled=true;return originalSound(kind);};
 // Existing per-action sounds take precedence. Only silent controls get a fallback.
 document.addEventListener('click',()=>{soundHandled=false;},true);
 document.addEventListener('change',event=>{if(event.target.matches?.('select,input[type="range"]'))sound('select');});
 const rank=()=>S.ops.xp>=450?'COMMANDER':S.ops.xp>=220?'SECTION CHIEF':S.ops.xp>=90?'OPERATOR':'TRAINEE';
 function setText(id,value){$(id).textContent=value;}
 function updateProfile(){
  setText('hqProfileName',S.personnel.name);setText('hqProfileRank',rank()+' / '+S.ops.xp+' XP');
  setText('hqIdName',S.personnel.name);setText('hqIdDepartment',S.personnel.department);setText('hqIdRank',rank());
  setText('hqCommsFlag',S.prefs.hqComms?'ON':'OFF');setText('hqVoiceFlag',S.prefs.hqVoice?'ON':'OFF');
  $('hqCommsSwitch').setAttribute('aria-pressed',String(S.prefs.hqComms));$('hqVoiceSwitch').setAttribute('aria-pressed',String(S.prefs.hqVoice));
 }
 function openDialog(id,trigger){
  const dialog=$(id);opener=trigger||document.activeElement;
  if(!dialog.open)dialog.showModal();
  dialog.querySelector('button').focus();
 }
 function closeDialog(dialog){dialog.close();if(opener?.isConnected)opener.focus();}
 for(const dialog of [$('hqIdDialog'),$('hqActionDialog')]){
  dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))closeDialog(dialog);});
  dialog.addEventListener('cancel',()=>{if(opener?.isConnected)opener.focus();});
 }
 function blockedReason(id){
  const d=S.defense;
  if(id==='v27Cable'&&!d.connected){if(d.status!=='active')return '敵性反応を検知してください';if(S.evas[S.tactics.attacker].state!=='DEPLOYED')return '攻撃担当EVAが未出撃です';if(!S.infra.power||d.energy<7)return '主電源と防衛電力7が必要です';}
  if(id==='v27Shot'){
   if(d.status!=='active')return '迎撃対象がありません';
   if(S.mission.phase<4||S.mission.phase>5)return '作戦をPHASE 04–05まで進めてください';
   if(S.evas[S.tactics.attacker].state!=='DEPLOYED')return '攻撃担当EVAが未出撃です';
   if(S.magi.approvedFor!==S.tactics.attacker)return 'EVA出撃承認を確認してください';
   if(S.tactics.charge<70||S.tactics.heat>=80)return '充填70%以上・熱80%未満が必要です';
   if(!S.ops.currentMissionLocks)return '照準ロックが必要です';
   if(!d.magivote||d.magivote.filter(Boolean).length<2||d.magiround!==d.round)return '現ターンのMAGI戦術承認が必要です';
  }
  if(id==='v27Armor'&&!['active','idle'].includes(d.status))return '次の敵性反応を検知してから装甲を展開してください';
  if(['v27Scan','v27Armor'].includes(id)&&!S.infra.power)return '都市主電源を復旧してください';
  return $(id).disabled?'現在は実行できません。資材・設備・作戦状態をご確認ください。':'';
 }
 function renderCommands(){
  const container=$('hqActionContent');container.replaceChildren();
  $('hqActionBack').hidden=!actionCategory;setText('hqActionBack',actionId?'指令に戻る':'分類に戻る');setText('hqActionPath',!actionCategory?'01 / CATEGORY':!actionId?'02 / COMMAND':'03 / CONFIRM');
  if(!actionCategory){
   for(const c of categories){const button=document.createElement('button');button.className='hq-route';button.dataset.hqCategory=c.key;button.innerHTML=`<span>${c.code}</span><div><small>${c.en}</small><b>${c.title}</b><p>${c.hint}</p></div><i>↗</i>`;container.append(button);}
  }else if(!actionId){
   for(const id of actionCategory.items){const button=document.createElement('button');button.className='hq-route';button.dataset.hqCommand=id;button.innerHTML='<div><small>COMMAND / '+(blockedReason(id)?'HOLD':'READY')+'</small><b>'+commandInfo[id][0]+'</b></div><i>→</i>';container.append(button);}
  }else{
   const info=commandInfo[actionId],blocked=blockedReason(actionId),d=S.defense;
   container.innerHTML=`<section class="hq-command-detail"><small>SELECTED COMMAND / ${actionCategory.en}</small><h3>${info[0]}</h3><p>${info[1]}</p><div class="hq-command-cost"><small>必要条件 / REQUIREMENTS</small><b>${info[2]}</b></div><dl><dt>選択施設</dt><dd>${V27_FACILITY[d.selected].name}</dd><dt>防衛電力 / 資材</dt><dd>${d.energy}% / ${d.parts}</dd><dt>施設HP / 予備送電</dt><dd>${d.city[d.selected].hp}% / ${d.spares}</dd></dl><p class="hq-command-status ${blocked?'hold':''}" role="status">${blocked?'HOLD / '+blocked:'READY / 実行可能'}</p><button id="hqExecute" ${blocked?'disabled':''}>実行する / EXECUTE →</button></section>`;
  }
 }
 function showCommands(trigger){actionCategory=null;actionId=null;renderCommands();openDialog('hqActionDialog',trigger);}
 const firstTools=qs('#v27DefenseBoard .v27-tools');
 eHTML(firstTools,'beforebegin',`<section class="hq-command-launch"><div><small>COMMAND ROUTER / 3 STEPS</small><h3>次の行動を選択</h3><p>分類 → 指令 → 条件確認・実行</p></div><button id="hqCommandOpen">行動選択 <span>OPEN ROUTER ↗</span></button></section>`);
 // Keep the legacy controls available, including their IDs and original handlers.
 const quick=document.createElement('details');quick.className='hq-quick';const summary=document.createElement('summary');summary.textContent='クイック操作 / DIRECT COMMANDS';quick.append(summary);firstTools.before(quick);quick.append(firstTools);
 $('hqCommandOpen').addEventListener('click',event=>showCommands(event.currentTarget));
 $('hqActionBack').addEventListener('click',()=>{if(actionId)actionId=null;else actionCategory=null;renderCommands();$('hqActionContent').querySelector('button')?.focus();});
 $('hqActionContent').addEventListener('click',event=>{
  const category=event.target.closest('[data-hq-category]'),command=event.target.closest('[data-hq-command]');
  if(category){actionCategory=categories.find(c=>c.key===category.dataset.hqCategory);renderCommands();$('hqActionContent').querySelector('button')?.focus();}
  if(command){actionId=command.dataset.hqCommand;renderCommands();$('hqActionBack').focus();}
  if(event.target.closest('#hqExecute')){if(blockedReason(actionId)){renderCommands();sound('deny');return;}const target=$(actionId);closeDialog($('hqActionDialog'));target.click();}
 });
 function renderFeed(){
  const container=$('hqCommsFeed');container.replaceChildren();
  const feed=S.personnel.feed;
  if(!feed.length){const empty=document.createElement('p');empty.className='hq-note';empty.textContent='NO MESSAGES / 通信待機中';container.append(empty);}
  feed.forEach((entry,index)=>{
   const article=document.createElement('article');article.className='hq-message'+(entry.ack?' read':'');
   const header=document.createElement('header');const label=document.createElement('b');label.textContent=entry.kind==='broadcast'?'PA / 館内放送':'COMMS / 職員連絡';
   const time=document.createElement('time');time.textContent=hhmmss(entry.at);header.append(label,time);
   const source=document.createElement('small');source.textContent=entry.source;const text=document.createElement('p');text.textContent=entry.text;
   const ack=document.createElement('button');ack.dataset.hqAck=String(index);ack.textContent=entry.ack?'受領済み / ACKNOWLEDGED':'受領を確認 / ACK';ack.disabled=!!entry.ack;
   article.append(header,source,text,ack);container.append(article);
  });
  setText('hqUnread',feed.filter(x=>!x.ack).length+' NEW');
  setText('hqDispatchText',feed.length?((feed[0].kind==='broadcast'?'[館内放送] ':'[職員連絡] ')+feed[0].text):'本部通信待機中。館内放送・職員連絡はゲーム内の演出です。');
 }
 function receive(kind){
  const type=kind==='broadcast'?'broadcast':'radio';const candidates=messages[type].filter(x=>x[1]!==lastMessage);const selected=candidates[Math.floor(Math.random()*candidates.length)];lastMessage=selected[1];
  const entry={kind:type,source:selected[0],text:selected[1],at:Date.now(),ack:false};
  S.personnel.feed.unshift(entry);S.personnel.feed.length=Math.min(12,S.personnel.feed.length);persist();renderFeed();sound(type==='broadcast'?'select':'scan');
  if(S.prefs.sound&&S.prefs.hqVoice&&type==='broadcast'&&window.speechSynthesis&&window.SpeechSynthesisUtterance){
   try{window.speechSynthesis.cancel();const speech=new window.SpeechSynthesisUtterance('模擬館内放送。'+entry.text);speech.lang='ja-JP';speech.rate=.92;window.speechSynthesis.speak(speech);}catch(e){toast('読み上げを利用できません。通信ログをご確認ください。');}
  }
 }
 function schedule(){clearTimeout(commsTimer);commsTimer=null;if(!S.prefs.hqComms||document.hidden)return;
  commsTimer=setTimeout(()=>{if(!document.hidden&&S.prefs.hqComms&&!$('shell').classList.contains('hidden'))receive(Math.random()<.4?'broadcast':'radio');schedule();},65000+Math.floor(Math.random()*75000));
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)window.speechSynthesis?.cancel();schedule();});
 $('hqCommsSwitch').addEventListener('click',()=>{S.prefs.hqComms=!S.prefs.hqComms;persist();updateProfile();schedule();});
 $('hqVoiceSwitch').addEventListener('click',()=>{S.prefs.hqVoice=!S.prefs.hqVoice;if(!S.prefs.hqVoice)window.speechSynthesis?.cancel();persist();updateProfile();if(S.prefs.hqVoice)toast('効果音ON・対応端末で館内放送を読み上げます');});
 $('soundSwitch').addEventListener('click',()=>{if(!S.prefs.sound)window.speechSynthesis?.cancel();});
 document.addEventListener('click',event=>{
  const trigger=event.target.closest?.('[data-hq]');
  if(trigger){const action=trigger.dataset.hq;if(action==='personnel')go('tools');if(action==='id'){updateProfile();$('hqIdBack').hidden=true;$('hqIdFront').hidden=false;setText('hqFlipId','裏面を表示 / REVERSE');openDialog('hqIdDialog',trigger);}if(action==='close')closeDialog(trigger.closest('dialog'));if(action==='broadcast'||action==='radio')receive(action);}
  const ack=event.target.closest?.('[data-hq-ack]');if(ack){const entry=S.personnel.feed[Number(ack.dataset.hqAck)];if(entry){entry.ack=true;persist();renderFeed();$('hqCommsFeed').querySelector('button:not(:disabled)')?.focus();}}
 });
 $('hqFlipId').addEventListener('click',()=>{const back=$('hqIdBack');back.hidden=!back.hidden;$('hqIdFront').hidden=!back.hidden;setText('hqFlipId',back.hidden?'裏面を表示 / REVERSE':'表面を表示 / FRONT');});
 $('hqName').value=S.personnel.name;$('hqDepartment').value=S.personnel.department;
 $('hqProfileForm').addEventListener('submit',event=>{event.preventDefault();const name=$('hqName').value.trim(),department=$('hqDepartment').value.trim();if(!name||!department)return;S.personnel.name=name.slice(0,24);S.personnel.department=department.slice(0,32);persist();updateProfile();sound('ok');toast('端末内の架空職員情報を更新しました');});
 const previousDraw=draw;draw=function(){previousDraw();updateProfile();if($('hqActionDialog').open)renderCommands();};
 window.NERV_HQ_TEST={receive,schedule,blockedReason};
 document.addEventListener('click',event=>{
  const control=event.target.closest?.('button, a[href], [role="button"], input[type="checkbox"]');
  const submit=control?.matches('button[type="submit"],form button:not([type])');
  if(control&&!submit&&!control.disabled&&control.getAttribute('aria-disabled')!=='true'&&!soundHandled)sound('tap');
 });
 updateProfile();renderFeed();schedule();
}
initPersonnelTerminal();
