// Operator jobs are local game objectives, independent of real notifications/combat.
const dutyObjectives={
 pilot:{label:'搭乗者の状態確認',route:['eva','pilots'],instruction:unit=>'UNIT-0'+unit+'の搭乗者監視で「搭乗者の状態を確認」を実行。'},
 geofront:{label:'本部系統の照合',route:['infra','geofront'],instruction:()=> '本部・地下施設で健全性・電源・通信を確認し、「本部の系統表示を確認」を実行。'},
 inspection:{label:'当直5項目の点検',route:['tools','inspection'],instruction:()=> '点検一覧の5項目を確認して「点検結果を照合」を実行。'},
 handover:{label:'引継ぎ記録の登録',route:['tools','handover'],instruction:()=> '受命後に新しい引継ぎ記録を1件登録。'}
};
let visibleStaffMessage=null,staffSignalDismissed=false,pendingStaffMessage=null,pendingStaffCount=0;
function dutyLedger(){const raw=S.personnel.dispatch||{};return {...raw,merit:Math.max(0,Number(raw.merit)||0),completed:Math.max(0,Number(raw.completed)||0),completedIds:Array.isArray(raw.completedIds)?raw.completedIds:[],orders:Array.isArray(raw.orders)?raw.orders.filter(o=>o&&typeof o==='object'):[]};}
function activeDutyOrders(){return dutyLedger().orders.filter(o=>['active','ready'].includes(o.status));}
function orderForMessage(id){const ledger=dutyLedger();return ledger.orders.find(o=>o.id===id)||(ledger.completedIds||[]).includes(id)&&{status:'complete'};}
function setSignalExpanded(expanded){$('staffSignalBody').hidden=!expanded;$('staffSignalExpand').setAttribute('aria-expanded',String(expanded));$('staffSignalExpand').textContent=expanded?'通信を畳む':'通信を開く';document.body.classList.toggle('staff-signal-expanded',expanded);}
function renderStaffSignal(){
 const m=visibleStaffMessage,signal=$('staffSignal');if(!m||staffSignalDismissed)return;
 meteoText('staffSignalTitle',m.title+' / '+(m.assignment?'業務依頼':'館内連絡'));meteoText('staffSignalText',m.text);
 const assignment=m.assignment,order=orderForMessage(m.id),known=assignment&&dutyObjectives[assignment.kind];meteoText('staffSignalObjective',known?dutyObjectives[assignment.kind].instruction(assignment.unit):'内容を確認してください。');
 $('staffSignalAccept').hidden=!known||!!order;$('staffSignalAccept').disabled=activeDutyOrders().length>=3;$('staffSignalWork').textContent=order?'受命済み・業務を確認 ↗':'受命一覧を開く ↗';
 signal.hidden=false;document.body.classList.add('has-staff-signal');
}
function showStaffSignal(message){if(!$('staffSignal').hidden&&!$('staffSignalBody').hidden){pendingStaffMessage=message;pendingStaffCount++;$('staffSignalPending').hidden=false;meteoText('staffSignalPending','新着通信 '+pendingStaffCount+'件 / 通信履歴に保存しました。');return;}pendingStaffMessage=null;pendingStaffCount=0;$('staffSignalPending').hidden=true;staffSignalDismissed=false;visibleStaffMessage=message;setSignalExpanded(false);renderStaffSignal();}
async function acceptDutyMessage(message){
 if(!message?.assignment||!dutyObjectives[message.assignment.kind])return false;
 const saved=await updateStaffService(next=>{
  const ledger=dutyLedger();if(orderForMessage(message.id))throw Error('この業務は受命済みです。');if(activeDutyOrders().length>=3)throw Error('同時受命は3件までです。');
  const order={id:message.id,kind:message.assignment.kind,unit:message.assignment.unit,status:'active',acceptedAt:Date.now(),handoverAt:S.personnel.handover[0]?.at||0};
  const active=activeDutyOrders(),retained=[...active,...ledger.orders.filter(o=>o.status==='complete').slice(0,11-active.length)];next.personnel.dispatch={...ledger,orders:[order,...retained]};
 });
 if(saved){renderDutyDispatch();renderStaffSignal();meteoText('dutyDispatchResult','受命しました。対象画面で確認後、完了を報告してください。');sound('ok');}
 return saved;
}
async function recordDutyEvidence(detail){
 const eligible=activeDutyOrders().filter(o=>o.status==='active'&&o.kind===detail.kind&&(o.kind!=='pilot'||o.unit===detail.unit)&&(o.kind!=='handover'||detail.registered===true));
 if(!eligible.length)return;
 const ids=eligible.map(o=>o.id);if(await updateStaffService(next=>{const ledger=dutyLedger();next.personnel.dispatch={...ledger,orders:ledger.orders.map(o=>ids.includes(o.id)&&o.status==='active'?{...o,status:'ready',verifiedAt:Date.now()}:o)};})){renderDutyDispatch();meteoText('dutyDispatchResult','作業を確認しました。受命一覧で完了を報告できます。');announceCommand('職員業務の確認完了 / 受命一覧から完了報告できます。',currentPage);}
}
async function reportDutyOrder(id){
 if(await updateStaffService(next=>{const ledger=dutyLedger(),order=ledger.orders.find(o=>o.id===id);if(!order||order.status!=='ready')throw Error('先に対象画面で業務を確認してください。');next.personnel.dispatch={...ledger,merit:ledger.merit+10,completed:ledger.completed+1,completedIds:[id,...(ledger.completedIds||[])].slice(0,200),orders:ledger.orders.map(o=>o.id===id?{...o,status:'complete',completedAt:Date.now()}:o)};})){renderDutyDispatch();renderStaffSignal();meteoText('dutyDispatchResult','完了報告を記録しました。勤務評価＋10PT。');sound('done');}
}
function renderDutyDispatch(){
 const ledger=dutyLedger();meteoText('dutyMerit',ledger.merit+' PT / '+ledger.completed+'件完了');const list=$('dutyOrderList');if(!list)return;list.replaceChildren();
 for(const order of ledger.orders){const info=dutyObjectives[order.kind];if(!info)continue;
  const article=document.createElement('article'),heading=document.createElement('h3'),status=document.createElement('b'),text=document.createElement('p'),work=document.createElement('button'),report=document.createElement('button');article.dataset.order=order.id;article.dataset.status=order.status;heading.textContent=info.label+(order.kind==='pilot'?' / UNIT-0'+order.unit:'');status.textContent={active:'作業待ち',ready:'報告待ち',complete:'報告済み'}[order.status]||'確認';text.textContent=info.instruction(order.unit);work.type='button';work.textContent='対象画面で作業 ↗';work.hidden=order.status==='complete';work.addEventListener('click',()=>{if(order.kind==='pilot'){S.selectedEva=order.unit;draw();}window.NERV_MOBILE.open(...info.route);});report.type='button';report.setAttribute('data-own-sound','');report.textContent=order.status==='complete'?'完了済み':'完了を報告 / ＋10PT';report.disabled=order.status!=='ready';report.addEventListener('click',()=>reportDutyOrder(order.id));article.append(heading,status,text,work,report);list.append(article);
 }
 if(!ledger.orders.length)list.textContent='受命はありません。館内通信の業務依頼から受命できます。';
}
function initDutyDispatch(){
 if(!qs('#staffSupport'))return;
 qs('.page[data-page="tools"]').append($('dutyAssignments'));registerTerminalView('tools','assignments','受命一覧');$('pageContainer').before($('staffSignal'));
 const hub=document.createElement('button');hub.innerHTML='<strong>受命・勤務評価</strong><small>DUTY ASSIGNMENTS ↗</small>';hub.addEventListener('click',()=>window.NERV_MOBILE.open('tools','assignments'));qs('.support-grid').append(hub);
 const inspect=document.createElement('button');inspect.id='inspectionVerify';inspect.className='staff-secondary';inspect.textContent='点検結果を照合';inspect.addEventListener('click',()=>{if(!staffInspectionItems.every((_,i)=>S.personnel.checks[i]))return toast('5項目すべてを点検してから照合してください。');recordDutyEvidence({kind:'inspection'});toast('5項目の点検結果を確認しました。');});$('inspectionList').after(inspect);
 const handoverBefore=new WeakMap();$('handoverForm').addEventListener('submit',event=>handoverBefore.set(event,JSON.stringify(S.personnel.handover)),true);$('handoverForm').addEventListener('submit',event=>{if(handoverBefore.get(event)!==JSON.stringify(S.personnel.handover))recordDutyEvidence({kind:'handover',registered:true});});window.addEventListener('nerv-duty-evidence',event=>recordDutyEvidence(event.detail));window.addEventListener('nerv-staff-message',event=>{const message=staffFeed().find(m=>m.id===event.detail.id);if(message)showStaffSignal(message);});
 $('staffSignalExpand').addEventListener('click',()=>{const expand=$('staffSignalBody').hidden;setSignalExpanded(expand);if(!expand&&pendingStaffMessage)showStaffSignal(pendingStaffMessage);});$('staffSignalDismiss').addEventListener('click',()=>{staffSignalDismissed=true;$('staffSignal').hidden=true;document.body.classList.remove('has-staff-signal','staff-signal-expanded');});
 $('staffSignalAccept').addEventListener('click',()=>acceptDutyMessage(visibleStaffMessage));$('staffSignalWork').addEventListener('click',()=>{setSignalExpanded(false);window.NERV_MOBILE.open('tools','assignments');});
 // Each retained request can be accepted later, even after its floating notice closes.
 const oldRender=renderStaffServices;renderStaffServices=function(){const focused=document.activeElement?.classList.contains('duty-accept-message')?document.activeElement.dataset.messageId:null;oldRender();for(const [i,article] of [...$('staffRadioList').children].entries()){const message=staffFeed()[i];if(!message?.assignment||!dutyObjectives[message.assignment.kind])continue;const button=document.createElement('button');button.type='button';button.setAttribute('data-own-sound','');button.className='duty-accept-message';button.dataset.messageId=message.id;button.textContent=orderForMessage(message.id)?'受命済み':'この業務を受命';button.disabled=!!orderForMessage(message.id)||activeDutyOrders().length>=3;button.addEventListener('click',()=>acceptDutyMessage(message));article.append(button);}if(focused){const target=[...$('staffRadioList').querySelectorAll('.duty-accept-message')].find(b=>b.dataset.messageId===focused);(target&&!target.disabled?target:$('staffRadioList')).focus({preventScroll:true});}};
 renderStaffServices();renderDutyDispatch();if(location.hash==='#tools/assignments')window.NERV_MOBILE.open('tools','assignments');
}
initDutyDispatch();
