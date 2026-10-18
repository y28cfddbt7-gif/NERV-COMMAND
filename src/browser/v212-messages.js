// Private, local conversations. No network chat service, authority changes or combat rewards.
const personalContacts=[
 {id:'shinji',name:'碇シンジ',unit:1,daily:['今日はチェロの練習を少し。音を合わせていると、落ち着くんです。','食事の片付け、今日は僕の番なんです。あなたも休めましたか。'],care:['ありがとうございます。そう言ってもらえると、少し気が楽です。','無理していないつもりでしたけど……少し休もうと思います。'],close:['話を聞いてもらえるだけでも、うれしいです。','また、こうして話してもいいですか。あなたには少し話しやすいんです。'],duty:'初号機の信号は確認できます。出撃の判断は、ミサトさんたちの指示を待ちます。'},
 {id:'asuka',name:'惣流・アスカ・ラングレー',unit:2,daily:['今日の訓練、あたしの記録もちゃんと見た？ 次はもっと上げてみせるわ。','休憩くらい自分で取れるわよ。……そっちは、もう昼食べたの？'],care:['分かってるわよ。……でも、気にしてくれてるのは受け取っとく。','あたしは大丈夫。そっちも根を詰めすぎないこと。いい？'],close:['話くらいなら付き合ってあげる。休憩が終わるまでよ。','あんた、案外ちゃんと話を聞くのね。……また休憩が合ったら、連絡して。'],duty:'弐号機の状態は管制で確認して。実戦の指示は、作戦指揮を通しなさいよ。'},
 {id:'rei',name:'綾波レイ',unit:0,daily:['今日は本を読んでいたわ。静かな場所は、落ち着くから。','食事は済ませたわ。あなたは、まだなの？'],care:['分かったわ。……ありがとう。あなたも休んで。','体調は安定しているわ。気にかけてくれたのね。'],close:['少しなら。話したいことがあるの？','また話してもいいわ。……連絡、待っているから。'],duty:'零号機の接続を確認するわ。出撃の指示は、管制から受ける。'},
 {id:'misato',name:'葛城ミサト',staff:0,daily:['休憩、ちゃんと取った？ ずっと端末に張り付いてちゃ判断も鈍るわよ。','今日は食事の時間を確保できそうね。当直の引継ぎも忘れずに。'],care:['気遣いありがと。あなたも、抱え込む前に声をかけなさい。','そうね、ひと息入れましょ。続きは引継ぎを確認してから。'],close:['業務の話じゃなくても構わないわよ。聞くくらいなら、できるから。','あなたには助けられてるわ。今日は少し、肩の力を抜いて話しましょ。'],duty:'作戦指示は戦術管制から確認して。ここでの個人的な連絡だけで、出撃承認にはならないわ。'},
 {id:'ritsuko',name:'赤木リツコ',staff:1,daily:['コーヒーを淹れ直したところよ。冷める前に少し休憩するわ。','猫の本を借りたの。業務と関係のない読書も、時には必要ね。'],care:['ありがとう。あなたも睡眠は削らないこと。集中力は有限よ。','気を回してくれたのね。休憩が終わったら、系統の表示を確認しましょう。'],close:['急ぐ話でなければ、少し付き合うわ。何を話したいの？','率直に話せる相手がいるのは悪くないわね。あなたも、無理に言葉を選ばなくていい。'],duty:'設備の異常は当直業務の案件として報告してください。私的な通信からMAGIの承認を変更することはないわ。'},
 {id:'maya',name:'伊吹マヤ',staff:2,daily:['休憩室、今は空いていましたよ。お茶を飲むなら、ちょうどよさそうです。','今日は早めに引継ぎをまとめられそうです。あなたの当直はどうですか？'],care:['ありがとうございます。気づいたら画面を見続けてしまって……少し休みます。','あなたもお疲れさまです。一緒に、少しだけ息をつきませんか。'],close:['はい。業務以外のお話も、少ししてみたいです。','あなたと話すと落ち着きます。また時間が合ったら、声をかけてください。'],duty:'機体と同期率はEVA監視、冷却系統は当直業務で照合できます。正式な記録もお願いします。'},
 {id:'hyuga',name:'日向マコト',staff:3,daily:['休憩に読むものを持ってきたんですが、まだ開けていなくて。そちらはどうです？','今日の食堂、まだ間に合うみたいですよ。交代の時間を確認しておきます。'],care:['ありがとうございます。交代まであと少しです。あなたも無理のないように。','そうですね、少し目を休めます。気にかけてもらえて助かります。'],close:['もちろんです。当直の話ばかりじゃ、息が詰まりますからね。','いつも連絡をもらえると、ほっとします。今日はゆっくり聞きますよ。'],duty:'作戦の変更は指揮系統へ上申しましょう。確認事項なら一緒に整理できます。'},
 {id:'aoba',name:'青葉シゲル',staff:4,daily:['今日は帰ったらギターに触るつもりです。音を出せる時間が残るといいんですが。','少し静かになりましたね。今のうちに休憩を取っておきましょう。'],care:['どうも。そっちも、疲れてる時は交代を頼んでください。','助かります。少し目を離すので、引継ぎだけ確認してきます。'],close:['ええ、少し話しましょう。何か聞きたいことでも？','気軽に連絡をもらえるのは、うれしいですね。こっちからも声をかけますよ。'],duty:'索敵と通信の状況は管制表示を見てください。私的な回線と作戦指示は分けておきましょう。'}
];
let personalReady=false,personalError='',personalContact='shinji',personalPage=0,personalGroup='pilots',personalTimer=0,personalNextRadio=0,personalInitializing=false;
const personalById=id=>personalContacts.find(c=>c.id===id);
function personalNormalize(raw) {
 if(raw&&Number(raw.schema)>1)return {future:true};
 const source=raw&&typeof raw==='object'&&!Array.isArray(raw)?JSON.parse(JSON.stringify(raw)):{};
 const result={...source,schema:1,sequence:Math.floor(worldBound(source.sequence,0,1000000000,0)),selected:personalById(source.selected)?source.selected:'shinji',threads:source.threads&&typeof source.threads==='object'&&!Array.isArray(source.threads)?{...source.threads}:{},pending:[]};
 for(const person of personalContacts) {
  const old=source.threads?.[person.id]||{},seen=new Set();
  const messages=(Array.isArray(old.messages)?old.messages:[]).filter(m=>m&&typeof m.id==='string'&&typeof m.text==='string'&&['self','contact'].includes(m.from)&&!seen.has(m.id)&&seen.add(m.id)).slice(-24).map(m=>({...m,text:m.text.slice(0,320),at:Number.isFinite(m.at)?m.at:Date.now(),read:!!m.read}));
  result.threads[person.id]={...old,messages,exchanges:Math.max(0,Math.min(1000,Number(old.exchanges)||0))};
  for(const m of messages)result.sequence=Math.max(result.sequence,Number(m.id.match(/^pm-(\d+)$/)?.[1])||0);
 }
 const pendingPeople=new Set();
 for(const p of Array.isArray(source.pending)?source.pending:[]) {
  const thread=result.threads[p?.to];
  if(!thread||pendingPeople.has(p.to)||typeof p.replyTo!=='string'||typeof p.text!=='string'||thread.messages.some(m=>m.replyTo===p.replyTo))continue;
  if(!thread.messages.some(m=>m.id===p.replyTo&&m.from==='self'))continue;
  pendingPeople.add(p.to);result.pending.push({...p,text:p.text.slice(0,320),due:Number.isFinite(p.due)?Math.min(p.due,Date.now()+60000):Date.now()+1500});
 }
 return {value:result,repaired:raw!=null&&JSON.stringify(raw)!==JSON.stringify(result)};
}
function personalThread(id=personalContact){return S.personalMessages?.threads?.[id]||{messages:[],exchanges:0};}
function personalStatus(person) {
 if(!S.infra.comms)return '通信回線停止 / 送信を保留';
 if(person.unit!==undefined&&['DEPLOYED','POWER_LOST'].includes(S.evas[person.unit].state))return '作戦回線優先 / '+stateJP[S.evas[person.unit].state];
 if(terminalAlert().level==='critical')return '非常対応中 / 業務連絡を優先';
 const exchanges=personalThread(person.id).exchanges;return exchanges>=4?'信頼する連絡相手':exchanges>=1?'話し慣れた相手':'連絡可能 / 個人回線';
}
function personalReply(person,topic,text) {
 if(person.unit!==undefined&&['DEPLOYED','POWER_LOST'].includes(S.evas[person.unit].state))return ['通信は届いているわ。今は零号機の管制連絡を優先する。戻ってから、続きを。','連絡、受け取りました。今は初号機の作戦中なので、戻ったら話しましょう。','通信、受け取ったわ。今は弐号機の作戦に集中するから、続きは帰ってからね。'][person.unit];
 if(terminalAlert().level==='critical')return person.unit!==undefined?'連絡は受け取った。今は管制の指示を待つ。落ち着いたら、また話そう。':person.duty+' 今は非常対応を優先します。';
 if(topic==='free')topic=/疲|休|大丈夫|無理|ありがとう/.test(text)?'care':/出撃|機体|MAGI|仕事|業務|任務/.test(text)?'duty':/話|一緒|好き|寂|また/.test(text)?'close':'daily';
 if(topic==='duty')return person.duty;
 const lines=person[topic]||person.daily,exchange=personalThread(person.id).exchanges;
 return topic==='close'?lines[exchange>=2?1:0]:lines[exchange%lines.length];
}
async function personalSend(text,topic='free') {
 if(!personalReady)return {ok:false,error:personalError||'通信記録を引継ぎ中です'};
 const person=personalById(personalContact),clean=String(text).trim().slice(0,160);if(!['free','daily','care','close','duty'].includes(topic))topic='free';
 if(!clean)return {ok:false,error:'本文を入力してください'};
 const result=await commandOperation(()=>{
  if(!S.infra.comms)throw Error('通信回線を復旧してください');
  const data=S.personalMessages;if(data.pending.some(p=>p.to===person.id))throw Error('この相手からの返答を待っています');
  const reply=personalReply(person,topic,clean),id='pm-'+(++data.sequence),thread=data.threads[person.id];
  thread.messages.push({id,at:Date.now(),from:'self',text:clean,read:true});thread.messages=thread.messages.slice(-24);
  data.pending.push({to:person.id,replyTo:id,text:reply,due:Date.now()+1800});
 });
 if(result.ok){personalPage=0;renderPersonalMessages();schedulePersonalPulse();}return result;
}
// Preserve a message draft and keyboard focus while accepting an incoming reply.
// Merge only this extension's fields after the confirmed write, like existing personnel services.
async function personalIncoming(change) {
 if(currentPage!=='messages'||document.activeElement?.id!=='messageText')return commandOperation(()=>change(S.personalMessages));
 if(staffServiceBusy||commandOperationsBusy||recoveryBusy||sequenceBusy)return {ok:false};
 staffServiceBusy=true;
 try {
  if(!await backupVisualUpgrade())throw Error('受信前の控えを保存できません');
  const next=worldClone(S);change(next.personalMessages);
  const saved=await callNative('persist',{state:next});if(saved?.error)throw Error(saved.error);
  S.personalMessages=next.personalMessages;persist();renderPersonalMessages();return {ok:true};
 }catch(error){toast('通信受信を保留：'+error.message);return {ok:false,error:error.message};}
 finally{staffServiceBusy=false;}
}
async function personalReceive(id,automatic=false) {
 const person=personalById(id);if(!person||!personalReady||document.hidden)return {ok:false};
 if(automatic&&document.activeElement?.matches('input,textarea,[contenteditable="true"]'))return {ok:false};
 if(automatic&&(!staffCommsEnabled()||S.prefs.pilotRadio===false||terminalAlert().level!=='nominal'))return {ok:false};
 return personalIncoming(data=>{
  if(!S.infra.comms)throw Error('通信回線を復旧してください');
  const thread=data.threads[id];
  const busy=terminalAlert().level==='critical'||person.unit!==undefined&&['DEPLOYED','POWER_LOST'].includes(S.evas[person.unit].state);const text=busy?personalReply(person,'daily',''):person.daily[Math.floor(Math.random()*person.daily.length)];
  thread.messages.push({id:'pm-'+(++data.sequence),at:Date.now(),from:'contact',text,read:currentPage==='messages'&&mobileCurrent.messages==='thread'&&personalContact===id});thread.messages=thread.messages.slice(-24);
 });
}
async function personalPulse() {
 if(!personalReady||document.hidden)return;
 const due=S.personalMessages.pending.filter(p=>p.due<=Date.now());
 if(due.length&&S.infra.comms) {
  await personalIncoming(data=>{
   for(const p of due){const thread=data.threads[p.to];if(!thread.messages.some(m=>m.replyTo===p.replyTo)){thread.messages.push({id:'pm-'+(++data.sequence),replyTo:p.replyTo,at:Date.now(),from:'contact',text:terminalAlert().level==='critical'||personalById(p.to).unit!==undefined&&['DEPLOYED','POWER_LOST'].includes(S.evas[personalById(p.to).unit].state)?personalReply(personalById(p.to),'duty',''):p.text,read:currentPage==='messages'&&mobileCurrent.messages==='thread'&&personalContact===p.to});thread.messages=thread.messages.slice(-24);thread.exchanges=Math.min(1000,thread.exchanges+1);}}
   const ids=new Set(due.map(p=>p.replyTo));data.pending=data.pending.filter(p=>!ids.has(p.replyTo));
  });
 }
 if(Date.now()>=personalNextRadio) {
  personalNextRadio=Date.now()+90000+Math.random()*90000;
  const person=personalContacts[Math.floor(Math.random()*3)];const result=await personalReceive(person.id,true);
  if(result.ok){toast(person.name+'から通信 / メッセージで確認できます');sound('scan');}
 }
}
function schedulePersonalPulse() {
 clearTimeout(personalTimer);personalTimer=0;if(!personalReady||document.hidden)return;
 personalTimer=setTimeout(async()=>{personalTimer=0;await personalPulse();schedulePersonalPulse();},S.personalMessages.pending.length?1000:5000);
}
function personalFace(person) {
 const face=document.createElement('span');face.className='message-avatar '+(person.unit!==undefined?'pilot-portrait':'command-staff-face');
 if(person.unit!==undefined)face.dataset.portraitUnit=String(person.unit);else face.dataset.staff=String(person.staff);
 face.setAttribute('role','img');face.setAttribute('aria-label',person.name+'の顔');return face;
}
function openPersonal(id) {
 if(!personalById(id)||!personalReady)return;personalContact=id;personalPage=0;
 window.NERV_MOBILE.open('messages','thread');
 commandOperation(()=>{S.personalMessages.selected=id;for(const m of personalThread(id).messages)m.read=true;});
}
function renderPersonalMessages() {
 if(!qs('#staffSupport')||!$('messageContacts'))return;meteoText('messageRecovery',personalError||(!personalReady?'通信記録を確認しています。':''));$('messageRetry').hidden=!personalError;
 if(!personalReady)return;
 const unread=personalContacts.reduce((n,p)=>n+personalThread(p.id).messages.filter(m=>m.from==='contact'&&!m.read).length,0);
 meteoText('messageUnread',unread+' 未読');meteoText('launcherMessages','8人の個別トーク / '+unread+' 未読');
 $('messageAutoToggle').setAttribute('aria-pressed',String(S.prefs.pilotRadio!==false));$('messageAutoToggle').textContent='パイロットの自動通信：'+(S.prefs.pilotRadio===false?'OFF':'ON');
 const list=$('messageContacts');list.replaceChildren();
 for(const person of personalContacts.filter(p=>(p.unit!==undefined)===(personalGroup==='pilots'))) {
  const button=document.createElement('button');button.className='message-contact';button.dataset.messageContact=person.id;
  const body=document.createElement('span'),name=document.createElement('strong'),preview=document.createElement('small'),count=document.createElement('b'),thread=personalThread(person.id);
  name.textContent=person.name;preview.textContent=thread.messages.at(-1)?.text||personalStatus(person);count.textContent=String(thread.messages.filter(m=>m.from==='contact'&&!m.read).length||'');body.append(name,preview);button.append(personalFace(person),body,count);button.addEventListener('click',()=>openPersonal(person.id));list.append(button);
 }
 const person=personalById(personalContact);$('messagePersonFace').replaceChildren(personalFace(person));meteoText('messagePersonName',person.name);meteoText('messagePersonStatus',personalStatus(person));
 const thread=personalThread(),pages=Math.max(1,Math.ceil(thread.messages.length/4));personalPage=Math.max(0,Math.min(personalPage,pages-1));
 const end=thread.messages.length-personalPage*4,display=thread.messages.slice(Math.max(0,end-4),end),signature=JSON.stringify(display);
 if($('messageThread').dataset.signature!==signature){const box=$('messageThread');box.replaceChildren();for(const m of display){const row=document.createElement('article'),text=document.createElement('p'),stamp=document.createElement('small');row.dataset.from=m.from;text.textContent=m.text;stamp.textContent=(m.from==='self'?'送信済み':'受信')+' '+new Date(m.at).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});row.append(text,stamp);box.append(row);}if(!display.length)box.textContent='個人回線に接続しました。下の話題から、または文章を入力して話しかけられます。';box.dataset.signature=signature;box.scrollTop=box.scrollHeight;}
 const pending=S.personalMessages.pending.some(p=>p.to===personalContact);meteoText('messageTyping',pending?'返答を待っています…':!S.infra.comms?'通信回線停止 / 復旧後に送信できます':'');
 meteoText('messagePage',(personalPage+1)+' / '+pages);$('messageOlder').disabled=personalPage>=pages-1;$('messageNewer').disabled=!personalPage;
 all('#messageComposer button,[data-message-topic]').forEach(b=>b.disabled=pending||!S.infra.comms);
}
async function initializePersonalMessages() {
 if(personalReady||personalInitializing)return;personalInitializing=true;
 try {
  if(!window.NERV_WORLD?.snapshot().ready)return;
  const normalized=personalNormalize(S.personalMessages);if(normalized.future)throw Error('新しい版の通信記録です。現在の記録を保持して通信を停止しました。');
  if(!S.personalMessages||normalized.repaired){const backup=await callNative('backupWorld',{state:worldClone(S),extension:'v212-messages',quarantine:normalized.repaired});if(backup?.error)throw Error('通信記録の控えを保存できません：'+backup.error);const result=await commandOperation(()=>{S.personalMessages=normalized.value;});if(!result.ok)throw Error(result.error);}
  personalReady=true;personalContact=personalById(location.hash.split('/')[2])?.id||S.personalMessages.selected;personalNextRadio=Date.now()+90000+Math.random()*90000;renderPersonalMessages();schedulePersonalPulse();
 }catch(error){personalError=error.message;renderPersonalMessages();}finally{personalInitializing=false;}
}
function initPersonalMessages() {
 if(!qs('#staffSupport')||!$('messageContacts'))return;
 mobileGroup('messages',[['contacts','連絡先'],['thread','トーク'],['preferences','通信設定']].map(([id,label])=>({id,label,existing:true})),'contacts');
 const group=document.createElement('nav');group.className='message-contact-groups';group.innerHTML='<button data-personal-group="pilots" aria-pressed="true">パイロット / 3</button><button data-personal-group="staff" aria-pressed="false">司令部 / 5</button>';$('messageContacts').before(group);
 for(const b of all('[data-personal-group]'))b.addEventListener('click',()=>{personalGroup=b.dataset.personalGroup;all('[data-personal-group]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderPersonalMessages();});
 const priorNavigate=mobileNavigate;mobileNavigate=function(page,view,push=true){if(page==='messages'&&view==='thread'){priorNavigate(page,view,false);const route='#messages/thread/'+personalContact;if(push&&location.hash!==route)history.pushState({},'',route);}else priorNavigate(page,view,push);};
 const restore=()=>{const [page,view,id]=location.hash.slice(1).split('/');if(page!=='messages')return;if(personalById(id))personalContact=id;window.NERV_MOBILE.open(page,view);renderPersonalMessages();};window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
 $('messageComposer').addEventListener('submit',async e=>{e.preventDefault();if((await personalSend($('messageText').value)).ok)$('messageText').value='';});
 const prompts={daily:'今日はどんな一日だった？',care:'無理していない？ 少し休んでね。',close:'もう少し、二人で話してもいい？',duty:'担当の仕事について、相談してもいい？'};
 all('[data-message-topic]').forEach(b=>b.addEventListener('click',()=>personalSend(prompts[b.dataset.messageTopic],b.dataset.messageTopic)));
 $('messageOlder').addEventListener('click',()=>{personalPage++;renderPersonalMessages();});$('messageNewer').addEventListener('click',()=>{personalPage--;renderPersonalMessages();});
 $('pilotRadioRequest').addEventListener('click',async()=>{const p=personalContacts[Math.floor(Math.random()*3)];const result=await personalReceive(p.id);if(result.ok){toast(p.name+'から通信を受信しました');sound('scan');}});
 $('messageAutoToggle').addEventListener('click',()=>commandOperation(()=>{S.prefs.pilotRadio=S.prefs.pilotRadio===false;}));
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(personalTimer);personalTimer=0;}else{personalNextRadio=Date.now()+90000+Math.random()*90000;schedulePersonalPulse();}});
 const oldDraw=draw;draw=function(){oldDraw();renderPersonalMessages();};
 window.addEventListener('nerv-world-ready',initializePersonalMessages);
 window.NERV_MESSAGES={send:personalSend,receive:personalReceive,pulse:personalPulse,open:openPersonal,snapshot:()=>({ready:personalReady,error:personalError,contact:personalContact,timer:!!personalTimer,state:worldClone(S.personalMessages||null)}),retry:()=>{personalError='';return initializePersonalMessages();}};
 const retry=document.createElement('button');retry.id='messageRetry';retry.className='staff-secondary';retry.textContent='通信記録の引継ぎを再試行';retry.hidden=true;retry.addEventListener('click',()=>{personalError='';initializePersonalMessages();});$('messageRecovery').after(retry);
 const link=document.createElement('button');link.className='staff-secondary';link.dataset.opsRoute='messages/contacts';link.textContent='個別メッセージ・パイロットとの会話 ↗';qs('.page[data-page="hq"] [data-view="comms"]').append(link);
 restore();initializePersonalMessages();
}
initPersonalMessages();
