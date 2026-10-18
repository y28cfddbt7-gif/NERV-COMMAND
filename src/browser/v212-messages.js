// Private, local conversations. No network chat service, authority changes or combat rewards.
const personalContacts=[
 {id:'shinji',name:'碇シンジ',unit:1},{id:'asuka',name:'惣流・アスカ・ラングレー',unit:2},{id:'rei',name:'綾波レイ',unit:0},
 {id:'misato',name:'葛城ミサト',staff:0},{id:'ritsuko',name:'赤木リツコ',staff:1},{id:'maya',name:'伊吹マヤ',staff:2},
 {id:'hyuga',name:'日向マコト',staff:3},{id:'aoba',name:'青葉シゲル',staff:4},
 {id:'gendo',name:'碇ゲンドウ',insignia:'司令'},{id:'fuyutsuki',name:'冬月コウゾウ',insignia:'副司令'},{id:'kiel',name:'キール・ローレンツ',insignia:'01',group:'seele'}
];
let personalReady=false,personalError='',personalContact='shinji',personalPage=0,personalGroup='pilots',personalTimer=0,personalNextRadio=0,personalInitializing=false;
const personalById=id=>personalContacts.find(c=>c.id===id);
function personalNormalize(raw) {
 if(raw&&(Number(raw.schema)>1||Number(raw.automation?.schema)>1||Object.values(raw.threads||{}).some(t=>Number(t?.memory?.schema)>1)))return {future:true};
 const source=raw&&typeof raw==='object'&&!Array.isArray(raw)?JSON.parse(JSON.stringify(raw)):{};
 const result={...source,schema:1,sequence:Math.floor(worldBound(source.sequence,0,1000000000,0)),selected:personalById(source.selected)?source.selected:'shinji',threads:source.threads&&typeof source.threads==='object'&&!Array.isArray(source.threads)?{...source.threads}:{},pending:[],automation:dialogAutomation(source.automation)};
 for(const person of personalContacts) {
  const old=source.threads?.[person.id]||{},seen=new Set();
  const messages=(Array.isArray(old.messages)?old.messages:[]).filter(m=>m&&typeof m.id==='string'&&typeof m.text==='string'&&['self','contact'].includes(m.from)&&!seen.has(m.id)&&seen.add(m.id)).slice(-24).map(m=>({...m,text:m.text.slice(0,320),at:Number.isFinite(m.at)?m.at:Date.now(),read:!!m.read}));
  result.threads[person.id]={...old,messages,memory:dialogMemory(old.memory||{relationship:Math.min(3,Number(old.exchanges)||0),lastAt:messages.at(-1)?.at||0,topic:dialogIntent(messages.filter(m=>m.from==='self').at(-1)?.text||'今日はどう？','free',{topic:'daily',deferred:''}),questions:messages.filter(m=>m.from==='self').slice(-8).map(m=>m.text.replace(/[\s。、？！?!]/g,''))}),exchanges:Math.max(0,Math.min(1000,Number(old.exchanges)||0))};
  for(const m of messages)result.sequence=Math.max(result.sequence,Number(m.id.match(/^pm-(\d+)$/)?.[1])||0);
 }
 const pendingPeople=new Set();
 for(const p of Array.isArray(source.pending)?source.pending:[]) {
  const thread=result.threads[p?.to];
  if(!personalById(p?.to)||!thread||pendingPeople.has(p.to)||typeof p.replyTo!=='string'||typeof p.text!=='string'||thread.messages.some(m=>m.replyTo===p.replyTo))continue;
  if(!thread.messages.some(m=>m.id===p.replyTo&&m.from==='self'))continue;
  pendingPeople.add(p.to);result.pending.push({...p,text:p.text.slice(0,320),...(typeof p.input==='string'?{input:p.input.slice(0,160),topic:['free',...DIALOG_TOPICS].includes(p.topic)?p.topic:'free'}:{}),due:Number.isFinite(p.due)?Math.min(p.due,Date.now()+60000):Date.now()+1500});
 }
 return {value:result,repaired:raw!=null&&JSON.stringify(raw)!==JSON.stringify(result)};
}
function personalThread(id=personalContact){return S.personalMessages?.threads?.[id]||{messages:[],exchanges:0};}
function personalStatus(person) {
 if(!S.infra.comms)return '通信回線停止 / 送信を保留';
 if(person.unit!==undefined&&['DEPLOYED','POWER_LOST'].includes(S.evas[person.unit].state))return '作戦回線優先 / '+stateJP[S.evas[person.unit].state];
 if(terminalAlert().level==='critical')return '非常対応中 / 業務連絡を優先';
 const exchanges=personalThread(person.id).memory?.relationship||0;return exchanges>=4?'信頼する連絡相手':exchanges>=1?'話し慣れた相手':'連絡可能 / 個人回線';
}
function personalReply(person,topic,text,data=S.personalMessages){return dialogRespond(data,person,topic,text).text;}
async function personalSend(text,topic='free') {
 if(!personalReady)return {ok:false,error:personalError||'通信記録を引継ぎ中です'};
 const person=personalById(personalContact),clean=String(text).trim().slice(0,160);if(!['free','daily','care','close','duty'].includes(topic))topic='free';
 if(!clean)return {ok:false,error:'本文を入力してください'};
 const result=await commandOperation(()=>{
  if(!S.infra.comms)throw Error('通信回線を復旧してください');
  const data=S.personalMessages;if(data.pending.some(p=>p.to===person.id))throw Error('この相手からの返答を待っています');
  const id='pm-'+(++data.sequence),thread=data.threads[person.id];
  thread.messages.push({id,at:Date.now(),from:'self',text:clean,read:true});thread.messages=thread.messages.slice(-24);
  data.pending.push({to:person.id,replyTo:id,text:'',input:clean,topic,due:Date.now()+1800});
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
  const reply=dialogRespond(data,person,'daily','今日はどうだった？');
  thread.messages.push({id:'pm-'+(++data.sequence),at:Date.now(),from:'contact',...reply,read:currentPage==='messages'&&mobileCurrent.messages==='thread'&&personalContact===id});thread.messages=thread.messages.slice(-24);
 });
}
async function personalPulse() {
 if(!personalReady||document.hidden)return;
 if(window.NERV_AI)await window.NERV_AI.prepare();
 const due=S.personalMessages.pending.filter(p=>p.due<=Date.now()&&!window.NERV_AI?.holds(p));
 if(due.length&&S.infra.comms) {
  await personalIncoming(data=>{
   for(const p of due){const thread=data.threads[p.to];if(!thread.messages.some(m=>m.replyTo===p.replyTo)){
    let reply=typeof p.input==='string'?dialogRespond(data,personalById(p.to),p.topic,p.input):dialogWorld().mode!=='normal'?dialogRespond(data,personalById(p.to),'duty','担当業務の状況'): {text:p.text,priority:'routine',topic:'daily',mode:'normal'};
    if(window.NERV_AI)reply=window.NERV_AI.take(p,reply);
    thread.messages.push({id:'pm-'+(++data.sequence),replyTo:p.replyTo,at:Date.now(),from:'contact',...reply,read:currentPage==='messages'&&mobileCurrent.messages==='thread'&&personalContact===p.to});thread.messages=thread.messages.slice(-24);thread.exchanges=Math.min(1000,thread.exchanges+1);
   }}
   const ids=new Set(due.map(p=>p.replyTo));data.pending=data.pending.filter(p=>!ids.has(p.replyTo));
  });
 }
 const routineDue=Date.now()>=personalNextRadio;
 if(routineDue)personalNextRadio=Date.now()+90000+Math.random()*90000;
 await dialogProactive(routineDue);
 window.NERV_AI?.prune();
}
function schedulePersonalPulse() {
 clearTimeout(personalTimer);personalTimer=0;if(!personalReady||document.hidden)return;
 personalTimer=setTimeout(async()=>{personalTimer=0;await personalPulse();schedulePersonalPulse();},S.personalMessages.pending.length?1000:5000);
}
function personalFace(person) {
 const face=document.createElement('span');face.className='message-avatar '+(person.unit!==undefined?'pilot-portrait':'command-staff-face');
 if(person.unit!==undefined)face.dataset.portraitUnit=String(person.unit);else if(person.staff!==undefined)face.dataset.staff=String(person.staff);else {face.className='message-avatar command-insignia';face.textContent=person.insignia;}
 face.setAttribute('role','img');face.setAttribute('aria-label',person.name+(person.insignia?'の職務識別章':'の顔'));return face;
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
 meteoText('messageUnread',unread+' 未読');meteoText('launcherMessages','11人の個別トーク / '+unread+' 未読');
 $('messageAutoToggle').setAttribute('aria-pressed',String(S.prefs.pilotRadio!==false));$('messageAutoToggle').textContent='パイロットの自動通信：'+(S.prefs.pilotRadio===false?'OFF':'ON');
 const list=$('messageContacts');list.replaceChildren();
 for(const person of personalContacts.filter(p=>p.group==='seele'?personalGroup==='seele':personalGroup==='pilots'?p.unit!==undefined:personalGroup==='staff'&&p.unit===undefined)) {
  const button=document.createElement('button');button.className='message-contact';button.dataset.messageContact=person.id;
  const body=document.createElement('span'),name=document.createElement('strong'),preview=document.createElement('small'),count=document.createElement('b'),thread=personalThread(person.id);
  name.textContent=person.name;preview.textContent=thread.messages.at(-1)?.text||personalStatus(person);count.textContent=String(thread.messages.filter(m=>m.from==='contact'&&!m.read).length||'');body.append(name,preview);button.append(personalFace(person),body,count);button.addEventListener('click',()=>openPersonal(person.id));list.append(button);
 }
 const person=personalById(personalContact);$('messagePersonFace').replaceChildren(personalFace(person));meteoText('messagePersonName',person.name);meteoText('messagePersonStatus',personalStatus(person));
 const thread=personalThread(),pages=Math.max(1,Math.ceil(thread.messages.length/4));personalPage=Math.max(0,Math.min(personalPage,pages-1));
 const end=thread.messages.length-personalPage*4,display=thread.messages.slice(Math.max(0,end-4),end),signature=JSON.stringify(display);
 if($('messageThread').dataset.signature!==signature){const box=$('messageThread');box.replaceChildren();for(const m of display){const row=document.createElement('article'),text=document.createElement('p'),stamp=document.createElement('small');row.dataset.from=m.from;text.textContent=m.text;stamp.textContent=(m.from==='self'?'送信済み':'受信')+' '+new Date(m.at).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})+(m.transport==='ai'?' / AI':m.transport==='offline-fallback'?' / LOCAL':'');row.append(text,stamp);box.append(row);}if(!display.length)box.textContent='個人回線に接続しました。下の話題から、または文章を入力して話しかけられます。';box.dataset.signature=signature;box.scrollTop=box.scrollHeight;}
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
 mobileGroup('messages',[['contacts','連絡先'],['thread','トーク'],['persona','職員情報'],['memory','通信記憶'],['preferences','通信設定']].map(([id,label])=>({id,label,existing:true})),'contacts');
 const group=document.createElement('nav');group.className='message-contact-groups';group.innerHTML='<button data-personal-group="pilots" aria-pressed="true">パイロット / 3</button><button data-personal-group="staff" aria-pressed="false">司令部 / 7</button><button data-personal-group="seele" aria-pressed="false">ゼーレ / 1</button>';$('messageContacts').before(group);
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
 window.NERV_MESSAGES={send:personalSend,receive:personalReceive,pulse:personalPulse,open:openPersonal,context:dialogAIContext,validateSuggestion:dialogValidateSuggestion,proactive:dialogProactive,snapshot:()=>({ready:personalReady,error:personalError,contact:personalContact,timer:!!personalTimer,state:worldClone(S.personalMessages||null)}),retry:()=>{personalError='';return initializePersonalMessages();}};
 const retry=document.createElement('button');retry.id='messageRetry';retry.className='staff-secondary';retry.textContent='通信記録の引継ぎを再試行';retry.hidden=true;retry.addEventListener('click',()=>{personalError='';initializePersonalMessages();});$('messageRecovery').after(retry);
 const link=document.createElement('button');link.className='staff-secondary';link.dataset.opsRoute='messages/contacts';link.textContent='個別メッセージ・パイロットとの会話 ↗';qs('.page[data-page="hq"] [data-view="comms"]').append(link);
 restore();initializePersonalMessages();
}
initPersonalMessages();
