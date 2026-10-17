// Local staff identity and fictional messages; never grants authority or changes combat.
const staffMessages={
 broadcast:[
  ['本部業務連絡','交代当直の職員は、引継ぎ記録と担当系統の表示を確認してください。'],
  ['館内設備案内','通路・昇降設備の点検確認は職員支援の点検一覧へ記録してください。'],
  ['当直終了の案内','未完了事項は引継ぎ記録に残してください。通信の受領だけでは業務は完了しません。']
 ],
 radio:[
  ['技術部より','端末の表示確認を依頼します。機体状態と給電の確認はEVA運用へ。これは架空の連絡です。'],
  ['管制当直より','次の担当者への連絡事項があれば、引継ぎ記録に区分と内容を登録してください。'],
  ['施設担当より','点検記録の確認をお願いします。この通信では設備や資材の状態は変化しません。']
 ]
};
let staffRadioTimer=0,staffServiceBusy=false;
function wireStaffDialog(dialog){
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const controls=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"]')].filter(el=>el.getClientRects().length);
  const first=controls[0],last=controls[controls.length-1];
  if(!first){event.preventDefault();return;}
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
}
function staffProfile(){const raw=S.personnel,p=raw.profile;return {name:typeof p?.name==='string'?p.name:typeof raw.name==='string'?raw.name:'当直職員',department:typeof p?.department==='string'?p.department:typeof raw.department==='string'?raw.department:'本部管制部'};}
function staffCommsEnabled(){return typeof S.prefs.staffComms==='boolean'?S.prefs.staffComms:S.prefs.hqComms!==false;}
function staffFeed(){
 const p=S.personnel;
 if(Array.isArray(p.messages))return p.messages.filter(m=>m&&typeof m.text==='string').slice(0,12);
 // The separate v2.8 lineage stored name/department/feed/hqComms. Read it
 // without discarding the original fields or rewriting an old backup.
 return (Array.isArray(p.feed)?p.feed:[]).filter(m=>m&&typeof m.text==='string').slice(0,12).map((m,i)=>({...m,id:'legacy-'+m.at+'-'+i,title:m.title||m.source||'職員連絡',read:!!m.ack}));
}
async function updateStaffService(change){
 if(staffServiceBusy)return false;staffServiceBusy=true;
 try{
  if(!await backupVisualUpgrade())throw Error('変更前バックアップを保存できません。');
  // Commit only fields owned by this extension; duty/checks and combat keep their state.
  const next=JSON.parse(JSON.stringify(S));change(next);
  const result=await callNative('persist',{state:next});if(result?.error)throw Error(result.error);
  for(const key of ['profile','messages','dispatch'])if(Object.hasOwn(next.personnel,key))S.personnel[key]=next.personnel[key];
  if(Object.hasOwn(next.prefs,'staffComms'))S.prefs.staffComms=next.prefs.staffComms;
  persist();renderStaffServices();return true;
 }catch(error){meteoText('staffCommsResult','記録できませんでした：'+error.message);meteoText('staffProfileResult','保存できませんでした：'+error.message);toast('職員情報の保存を中止しました。'+error.message);sound('deny');return false;}
 finally{staffServiceBusy=false;}
}
function renderStaffServices(){
 const focusedAck=document.activeElement?.dataset?.staffAck;
 const profile=staffProfile(),active=S.personnel.shift.startedAt&&!S.personnel.shift.endedAt;
 meteoText('staffCardName',profile.name);meteoText('staffCardDepartment',profile.department);meteoText('staffCardDuty',active?'当直中':'待機');
 const feed=staffFeed();meteoText('staffUnread',feed.filter(m=>!m.read).length+' 未受領');
 const enabled=staffCommsEnabled();meteoText('staffCommsFlag',enabled?'ON':'OFF');$('staffCommsToggle').setAttribute('aria-pressed',String(enabled));
 const list=$('staffRadioList');list.replaceChildren();
 for(const message of feed.slice(0,12)){
  const row=document.createElement('article'),time=document.createElement('small'),title=document.createElement('h3'),text=document.createElement('p'),ack=document.createElement('button');
  row.dataset.read=String(!!message.read);time.textContent=(message.kind==='broadcast'?'館内放送':'職員通信')+' / '+new Date(message.at).toLocaleTimeString('ja-JP');title.textContent=message.title;text.textContent=message.text;ack.type='button';ack.dataset.staffAck=message.id;ack.textContent=message.read?'受領済み':'受領を記録';ack.disabled=!!message.read;ack.setAttribute('data-own-sound','');
  ack.addEventListener('click',async()=>{if(await updateStaffService(next=>{next.personnel.messages=staffFeed().map(m=>m.id===message.id?{...m,read:true}:m);})){list.focus();sound('ok');}});
  row.append(time,title,text,ack);list.append(row);
 }
 if(!feed.length)list.textContent='通信待機 / 受信した架空の連絡をここに保存します。';
 if(focusedAck){const target=[...list.querySelectorAll('[data-staff-ack]')].find(b=>b.dataset.staffAck===focusedAck);if(target&&!target.disabled)target.focus({preventScroll:true});else list.focus({preventScroll:true});}
}
async function receiveStaffMessage(kind){
 if(document.hidden||!staffMessages[kind])return false;
 const samples=staffMessages[kind],[title,text]=samples[Math.floor(Math.random()*samples.length)];
 const objectiveKinds=kind==='broadcast'?['inspection','geofront','handover']:['pilot','geofront','inspection'];
 const assignment={kind:objectiveKinds[Math.floor(Math.random()*objectiveKinds.length)],unit:Math.floor(Math.random()*3)};
 const message={assignment,id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),at:Date.now(),kind,title,text,read:false};
 const saved=await updateStaffService(next=>{next.personnel.messages=[message,...staffFeed()].slice(0,12);});
 if(saved){window.dispatchEvent(new CustomEvent('nerv-staff-message',{detail:{id:message.id}}));meteoText('staffCommsResult',(kind==='broadcast'?'館内放送':'職員通信')+'を受信：'+title+'（架空）');announceCommand('架空の職員連絡：'+title+' ／ 職員支援の通信で確認できます。','tools');sound('scan');}
 return saved;
}
function scheduleStaffRadio(){
 clearTimeout(staffRadioTimer);staffRadioTimer=0;
 if(document.hidden||!staffCommsEnabled())return;
 staffRadioTimer=setTimeout(async()=>{if(staffCommsEnabled()&&!document.hidden)await receiveStaffMessage(Math.random()<.35?'broadcast':'radio');scheduleStaffRadio();},90000+Math.random()*90000);
}
function initStaffServices(){
 if(!qs('#staffSupport')||!$('staffIdDialog'))return;
 const profile=staffProfile();$('staffDisplayName').value=profile.name;$('staffDepartment').value=profile.department;
 $('staffProfileForm').addEventListener('submit',async event=>{
  event.preventDefault();const name=$('staffDisplayName').value.trim(),department=$('staffDepartment').value.trim();if(!name||!department)return;
  if(await updateStaffService(next=>{next.personnel.profile={...next.personnel.profile,name:name.slice(0,32),department:department.slice(0,32)};})){meteoText('staffProfileResult','登録情報を端末に保存しました。');sound('ok');}
 });
 const modal=$('staffIdDialog');let returnFocus;
 wireStaffDialog(modal);
 $('staffIdOpen').addEventListener('click',()=>{returnFocus=document.activeElement;renderStaffServices();$('staffIdFront').hidden=false;$('staffIdBack').hidden=true;$('personnelCard').dataset.side='front';$('staffIdFlip').textContent='裏面を表示';$('staffIdFlip').setAttribute('aria-pressed','false');modal.showModal();$('staffIdClose').focus();});
 $('staffIdClose').addEventListener('click',()=>modal.close());modal.addEventListener('close',()=>returnFocus?.isConnected&&returnFocus.focus());
 $('staffIdFlip').addEventListener('click',()=>{const back=$('staffIdBack').hidden;$('staffIdFront').hidden=back;$('staffIdBack').hidden=!back;$('personnelCard').dataset.side=back?'back':'front';$('staffIdFlip').textContent=back?'表面を表示':'裏面を表示';$('staffIdFlip').setAttribute('aria-pressed',String(back));});
 $('staffBroadcast').addEventListener('click',()=>receiveStaffMessage('broadcast'));$('staffRadio').addEventListener('click',()=>receiveStaffMessage('radio'));
 $('staffCommsToggle').addEventListener('click',async()=>{if(await updateStaffService(next=>{next.prefs.staffComms=!staffCommsEnabled();})){scheduleStaffRadio();sound('select');}});
 document.addEventListener('visibilitychange',scheduleStaffRadio);window.addEventListener('pagehide',()=>clearTimeout(staffRadioTimer));window.addEventListener('pageshow',scheduleStaffRadio);
 renderStaffServices();scheduleStaffRadio();
}
initStaffServices();
