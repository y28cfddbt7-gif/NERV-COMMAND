// Small separate views keep history, persona details and controls off the iPhone composer.
const dialogTopicLabels={daily:'日常',care:'気遣い',close:'個人的な会話',duty:'担当業務',eva:'EVA運用',magi:'MAGI解析',incident:'異常対応',report:'状況報告',request:'依頼・確認',result:'作戦結果',restricted:'情報区分の確認',clarify:'話題の確認',recall:'前の会話',end:'通信終了'};
let dialogMemoryPage=0;
function renderDialogDetails() {
 if(!personalReady||!$('messagePriority')||currentPage!=='messages')return;
 const person=personalById(personalContact),p=dialogPersonas[person.id],thread=personalThread(),m=thread.memory,w=dialogWorld(),pending=S.personalMessages.pending.some(x=>x.to===person.id),latest=[...thread.messages].reverse().find(x=>x.from==='contact');
 const priority=w.mode==='critical'?'emergency':w.mode!=='normal'?'urgent':'routine';
 const panel=qs('.message-thread-panel');panel.dataset.priority=priority;panel.classList.toggle('message-receiving',pending);
 meteoText('messagePriority',{emergency:'非常 / EMERGENCY',urgent:'業務優先 / PRIORITY',routine:'通常 / ROUTINE'}[priority]);
 meteoText('messageLinkState',!S.infra.comms?'回線停止':pending?'送信済 / 相手が状況を確認中':'回線接続 / '+p.code);
 meteoText('messageTyping',pending?'受信待機 / 接続・情報照合中…':!S.infra.comms?'通信回線停止 / 復旧後に送信できます':m.closed?'通信を区切りました。再度送信すると再開します。':(m.topic!=='daily'?'話題：'+dialogTopicLabels[m.topic]+' / ':'')+'端末内会話・オフライン');
 const action=$('messageProposal');action.replaceChildren();
 if(latest?.proposal&&['work/jobs','work/incidents','mission/armament'].includes(latest.proposal.route)) {
  const note=document.createElement('small'),button=document.createElement('button');note.textContent='操作提案 / 未実行';button.textContent=latest.proposal.label+' ↗';button.dataset.opsRoute=latest.proposal.route;button.className='staff-secondary';action.append(note,button);
 }
 if(mobileCurrent.messages==='persona'){
 const info=$('messagePersona');info.replaceChildren();
 const fields=[['通信相手',person.name+' / '+p.code],['所属・担当',p.department+' / '+p.role],['権限',p.authority],['口調',p.pronoun+' / 呼称：'+p.address+'。'+p.tone],['人物像・関係',p.temperament+'。'+p.relations],['現在の勤務', {normal:'通常勤務',watch:'警戒待機',battle:'作戦対応',critical:'非常対応'}[w.mode]+' / '+(w.mode==='normal'?(m.emotion||'平静'):{watch:'緊張 / 待機',battle:'集中 / 作戦優先',critical:'緊迫 / 安全確認'}[w.mode])],['共有する情報',p.knowledge.map(k=>({ownEva:'自機の運用表示',eva:'EVA運用',magi:'MAGI運用',technical:'技術点検',tactical:'戦術情報',comms:'通信状態',public:'公開勤務情報'}[k])).join('・')],['回線の関係',m.relationship>=4?'複数の話題を共有した相手':m.relationship?'会話を交わした相手':'初回連絡 / 職務上の距離']];
 for(const [label,value] of fields){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);info.append(row);}
 }
 if(mobileCurrent.messages==='memory'){
 meteoText('messageMemoryTitle',person.name+' / 通信記憶');
 meteoText('messageMemorySummary','話題：'+dialogTopicLabels[m.topic]+' / '+(m.closed?'いったん終了':'継続可能')+(m.deferred?' / 保留：'+dialogTopicLabels[m.deferred]:'')+'。履歴 '+thread.messages.length+'件（最新24件を保存）。');
 const facts=[...m.facts,...m.userNotes.map((label,i)=>({key:'user-note-'+i,label:'あなたが話したこと：'+label,at:m.lastAt}))].reverse(),pages=Math.max(1,Math.ceil(facts.length/4));dialogMemoryPage=Math.min(dialogMemoryPage,pages-1);const memory=$('messageMemories');memory.replaceChildren();
 for(const f of facts.slice(dialogMemoryPage*4,dialogMemoryPage*4+4)){const row=document.createElement('article'),text=document.createElement('p'),time=document.createElement('small');text.textContent=f.label.startsWith('話した話題：')?'話した話題：'+(dialogTopicLabels[f.label.slice(6)]||f.label.slice(6)):f.label;time.textContent=new Date(f.at).toLocaleString('ja-JP');row.append(text,time);memory.append(row);}
 if(!facts.length)memory.textContent='業務上の重要な記憶はまだありません。話した話題：'+(m.topics.map(t=>dialogTopicLabels[t]).join('・')||'未登録')+'。';
 meteoText('messageMemoryPage',(dialogMemoryPage+1)+' / '+pages);$('messageMemoryPrev').disabled=!dialogMemoryPage;$('messageMemoryNext').disabled=dialogMemoryPage+1>=pages;
 }
}
function initDialogDetails() {
 if(!window.NERV_MESSAGES||!qs('#staffSupport')||!$('messagePersona'))return;
 const priorRender=renderPersonalMessages;renderPersonalMessages=function(){priorRender();renderDialogDetails();};
 const priorOpen=openPersonal;openPersonal=function(id){dialogMemoryPage=0;priorOpen(id);const panel=qs('.message-thread-panel');panel.classList.remove('message-connected');requestAnimationFrame(()=>panel.classList.add('message-connected'));};window.NERV_MESSAGES.open=openPersonal;
 $('messageMemoryPrev').addEventListener('click',()=>{dialogMemoryPage--;renderDialogDetails();});$('messageMemoryNext').addEventListener('click',()=>{dialogMemoryPage++;renderDialogDetails();});
 window.addEventListener('nerv-route',renderDialogDetails);renderDialogDetails();
}
initDialogDetails();
