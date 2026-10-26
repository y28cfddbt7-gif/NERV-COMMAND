// v4 architecture recovery: one atomic native backup -> transition -> persist path.
// UI controllers can have different policies but NEVER duplicate persistence semantics.
(function initNervRecoveryController(){
 'use strict';
 async function commitRecovery(stage, dialog, settings){
  const clone=x=>JSON.parse(JSON.stringify(x));
  const before=clone(S);
  let applied=false;
  try{
   const backup=await callNative('backupState',{state:clone(before)});
   if(backup?.error)throw Error('事前バックアップ：'+backup.error);
   cancelSequence();stopSound();clearTimeout(saveTimeout);
   S=stage(before);applied=true;
   const persisted=await callNative('persist',{state:clone(S)});
   if(persisted?.error)throw Error(settings.persistLabel+persisted.error);
   dialog.classList.add('hidden');draw();sound('ok');toast(settings.success);
   return true;
  }catch(error){
   if(applied){S=before;draw();}
   meteoText('alertReviewDescription',settings.errorLabel+String(error?.message||error));
   toast(settings.failure);
   return false;
  }
 }
// NERV-COMMAND v3.1.2 / independent, additive CASE termination controller.
// The original staff-recovery.js, MAGI/security reducer and native bridge remain byte-identical.
(function installV312CaseRecovery(){
 if(!window.NERV_MOBILE||typeof openAlertReview!=='function'||typeof recoveredStaffState!=='function')return;
 const $=id=>document.getElementById(id);
 const clear=$('alertClear'),target=$('alertTarget'),dialog=$('alertReview');if(!clear||!target||!dialog)return;
 let mode='alert',busy=false;
 function pending(s=S){
  const w=s.world,issues=[];
  if(w?.magiOps?.active)issues.push({name:'MAGI保守',route:['magi','maintenance']});
  if(typeof worldActiveIncident==='function'&&w&&worldActiveIncident(w))issues.push({name:'冷却系統',route:['work','incidents']});
  if(typeof securityActive==='function'&&w&&securityActive(s))issues.push({name:'本部保安',route:['work','security']});
  if(['detected','isolated','analyzed','countermeasure','failed'].includes(s.magi?.intrusion?.status))
   issues.push({name:'MAGI侵入',route:['magi','intrusion']});
  return issues;
 }
 function stage(s){
  // This preserves the original record/angel transition and its side effects
  // on a CLONED previous state, not the real in-memory save.
  const next=recoveredStaffState(s);
  next.infra=JSON.parse(JSON.stringify(s.infra));
  next.magi={...JSON.parse(JSON.stringify(s.magi)),approvedFor:null,vote:null,interceptApproval:null};
  next.defense.city=JSON.parse(JSON.stringify(s.defense.city));
  for(const key of ['energy','parts','spares','security','breach'])
   if(s.defense[key]!==undefined)next.defense[key]=s.defense[key];
  next.defense.last='CASE中断・EVA回収 / 技術・保安の未処理案件は継続';
  for(const kind of ['infra','eva','mission'])if(next.logs[kind]?.[0])
   next.logs[kind][0].text='作戦のみ終了・EVA回収 / 都市損傷・MAGI・保安案件は保持';
  return next;
 }
 function details(){
  const issues=pending(),isEnd=mode==='end',blocked=issues.length>0;
  const names=issues.map(x=>x.name).join('・');
  const note=dialog.querySelector('.staff-reset-note');
  if(isEnd){
   // The earlier-world wrappers block NORMAL restoration. In explicit END
   // mode they may not prevent operator retreat with unresolved incidents.
   clear.disabled=busy;
   clear.textContent=blocked?'作戦のみ終了・EVA回収':'作戦終了・正常待機へ';
   meteoText('alertReviewTitle',blocked?'作戦中断・EVA回収の確認':'作戦終了の確認');
   meteoText('alertReviewDescription',blocked?
    '現在の作戦だけを中断します。'+names+'の未解決案件と施設損傷は保持し、正式復旧の承認は代行しません。':
    '進行中の作戦を終了して正常待機へ戻しますか。');
   if(note)note.textContent=blocked?
    'EVAを回収しますが都市電力・通信・施設HPを回復させません。MAGI保守と保安手続きは継続し、履歴と保存データを保持します。':
    '都市の電力・通信・施設と全EVAを正常待機に復帰します。操作前に保存状態をバックアップします。';
  }else if(note){
   note.textContent='技術・保安案件が未解決の場合、全系統の復旧は承認まで実行できません。元の警報内容を確認してください。';
  }
  const first=issues[0]?.route;
  target.textContent=first?
   (first[0]==='magi'?'MAGI保守・異常対処盤を開く ↗':first[1]==='incidents'?'冷却異常の対応盤を開く ↗':'本部保安盤を開く ↗'):
   '対象の管制画面を開く ↗';
 }
 const previousOpen=openAlertReview;
 openAlertReview=function(requested='alert'){
  mode=requested;
  previousOpen(requested);
  details();
 };
 target.addEventListener('click',event=>{
  const first=pending()[0]?.route;if(!first)return;
  // The city-damage alert may outrank MAGI trouble. Open the REAL desk
  // rather than routing back to city equipment.
  event.preventDefault();event.stopImmediatePropagation();
  closeAlertReview();window.NERV_MOBILE.open(first[0],first[1]);
 },true);
 clear.addEventListener('click',async event=>{
  const issues=pending();
  if(mode!=='end'||!issues.length)return; // original full reset remains authoritative
  event.preventDefault();event.stopImmediatePropagation();
  if(busy||recoveryBusy)return;
  busy=true;recoveryBusy=true;
  clear.disabled=true;$('alertContinue').disabled=true;target.disabled=true;
  try{
   await commitRecovery(stage,dialog,{
    persistLabel:'復旧状態の保存：',
    success:'作戦を終了・EVA回収。MAGI・保安案件と都市設備の未復旧状態を保持しました。',
    errorLabel:'作戦中断を取り消しました。',
    failure:'保存失敗のため作戦状態を維持しました。'
   });
  }finally{
   busy=false;recoveryBusy=false;clear.disabled=false;$('alertContinue').disabled=false;target.disabled=false;
  }
 },true);
 // Source art, old state schema and every other warning/clear handler are intact.
 window.NERV_V312={version:'3.1.2',snapshot:()=>({mode,pending:pending().map(x=>x.name),busy}),
  dryRun:s=>stage(JSON.parse(JSON.stringify(s)))};
})();

// NERV-COMMAND v3.1.4: the operator may restore the simulation from ANY alert.
// Restoration is explicitly confirmed and backed up. Outstanding technical/security
// cases are archived as OPERATOR-INTERRUPTED, never impersonated as approved.
(function initV314AlertWorkflow(){
 if(typeof openAlertReview!=='function'||typeof recoveredStaffState!=='function')return;
 const get=id=>document.getElementById(id);
 const dialog=get('alertReview'),clear=get('alertClear'),target=get('alertTarget'),
  continueButton=get('alertContinue');
 const panel=dialog?.querySelector('.staff-alert-dialog');
 if(!panel||!clear||!target||!continueButton||typeof panel.insertBefore!=='function')return;
 const note=dialog.querySelector('.staff-reset-note');
 const guidance=document.createElement('p');guidance.id='v314Guidance';
 guidance.setAttribute('role','status');panel.insertBefore(guidance,continueButton);
 const leave=document.createElement('button');leave.id='v314CaseOnly';leave.type='button';
 leave.className='staff-secondary';leave.textContent='作戦のみ終了・EVA回収を選ぶ';
 panel.insertBefore(leave,target);
 const force=document.createElement('button');force.id='v314FullRecovery';force.type='button';
 force.className='staff-primary';force.textContent='警報復旧（全系統・手動）';
 panel.insertBefore(force,target);
 let mode='alert',busy=false;
 const clone=x=>JSON.parse(JSON.stringify(x));
 function pending(s=S){
  const w=s?.world,issues=[];
  if(w?.security?.case)issues.push({name:'本部保安',id:w.security.case.id});
  if(w&&typeof worldActiveIncident==='function'){
   const incident=worldActiveIncident(w);
   if(incident)issues.push({name:'冷却系統',id:incident.id});
  }
  if(w?.magiOps?.active)issues.push({name:'MAGI保守',id:w.magiOps.active.id});
  if(['detected','isolated','analyzed','countermeasure','failed'].includes(s?.magi?.intrusion?.status))
   issues.push({name:'MAGI侵入'});
  if(['detected','analyzed','protected','failed'].includes(s?.magi?.externalDefense?.status))
   issues.push({name:'MAGI外部防御'});
  return issues;
 }
 const caseOpen=s=>['active','victory','defeat'].includes(s?.defense?.status);
 function stage(s){
  const next=recoveredStaffState(s),w=next.world,old=s.world;
  if(next.commandV3?.schema===1)next.commandV3.activeCaseId=null;
  if(w&&old){
   const archive=(bucket,item)=>{
    if(!bucket||!item)return;
    const entry=clone(item);
    // The case was cancelled by a MANUAL simulation reset, not authorized by a department.
    entry.interruption='operator-manual-recovery';
    entry.interruptedAtTick=w.tick;
    bucket.unshift(entry);if(bucket.length>6)bucket.length=6;
   };
   if(w.security?.case){archive(w.security.archive,w.security.case);w.security.case=null;
    w.security.nextDueTick=Math.max(w.security.nextDueTick||0,(w.tick||0)+10);}
   if(w.magiOps?.active){archive(w.magiOps.archive,w.magiOps.active);w.magiOps.active=null;
    w.magiOps.nextDueTick=Math.max(w.magiOps.nextDueTick||0,(w.tick||0)+10);}
   for(const event of (w.events||[])){
    if(event.kind==='magi-cooling'&&event.status!=='resolved'){
     event.status='resolved';event.resolution='operator-manual-recovery';
     event.resolvedTick=w.tick;delete event.authorizedBy;
    }
   }
   if(w.cooling){w.cooling.mode='normal';w.cooling.load=20;w.cooling.serviceDue=null;}
   if(w.pacing)w.pacing.nextCoolingTick=Math.max(w.pacing.nextCoolingTick||0,(w.tick||0)+10);
   if(w.angels?.active)w.angels.active=null;
   if(typeof worldLog==='function')worldLog(w,'手動警報復旧',
    '管制官が全系統の模擬状態を復旧。未完了の保安・MAGI・冷却案件は承認扱いにせず、操作中断として保存。');
  }
  if(next.magi?.externalDefense&&next.magi.externalDefense.status!=='idle')
   next.magi.externalDefense={...next.magi.externalDefense,status:'idle',
    message:'管制官の手動警報復旧により演習中断'};
  next.defense.last='管制官による手動警報復旧 / 未解決案件は中断履歴へ';
  return next;
 }
 function describe(){
  const issues=pending(),hasPending=issues.length>0;
  const label=hasPending?issues.map(i=>i.name+(i.id?' '+i.id:'')).join('・'):'なし';
  const ending=mode==='end';
  // Every category can initiate full recovery; no wrapper can leave it disabled.
  force.hidden=!ending||!hasPending;
  force.disabled=busy;clear.disabled=busy;
  leave.hidden=ending||!caseOpen(S);
  if(ending){
   guidance.textContent=hasPending?
    '未処理案件：'+label+'。作戦だけ中断するか、下の「警報復旧」で全系統を手動復旧できます。':
    '未処理案件なし。作戦終了・正常待機へ復帰できます。';
   return;
  }
  clear.textContent='警報復旧（全系統・手動）';
  meteoText('alertReviewTitle','警報復旧 / 管制官の最終確認');
  meteoText('alertReviewDescription','現在の警報・作戦・都市系統を手動復旧しますか。確認するまでは状態を変更しません。');
  if(note)note.textContent=hasPending?
   '未処理案件：'+label+'。実行すると模擬系統を正常待機に戻し、これらの案件は「承認済み」ではなく「手動中断」として履歴へ記録します。保存前にバックアップを作成します。':
   '模擬系統を正常待機に戻します。保存前にバックアップを作成し、既存の累計記録・設定を残します。';
  guidance.textContent=hasPending?
   '未解決 '+issues.length+' 件。手順を続けるなら担当盤へ。今すぐ復旧するなら上記の中断記録を確認して「警報復旧」を選択してください。':
   '未処理の技術・保安案件なし。警報復旧はいつでも実行できます。';
 }
 const oldOpen=openAlertReview;
 openAlertReview=function(requested='alert'){
  mode=requested;oldOpen(requested);
  if(!dialog.classList.contains('hidden'))describe();
 };
 async function fullRecovery(event){
  event?.preventDefault();event?.stopImmediatePropagation();
  if(busy||recoveryBusy)return;
  busy=true;recoveryBusy=true;
  for(const button of [clear,continueButton,target,force,leave])button.disabled=true;
  try{
   await commitRecovery(stage,dialog,{
    persistLabel:'復旧状態の保存：',
    success:'警報復旧完了。未解決案件は手動中断として記録しました。',
    errorLabel:'復旧を中止しました。',
    failure:'保存できないため警報状態を保持しました。'
   });
  }finally{
   busy=false;recoveryBusy=false;
   for(const button of [continueButton,target,force,leave])button.disabled=false;
   clear.disabled=false;
  }
 }
 // In ordinary warning mode the old handler must never bypass the backup/archival flow.
 clear.addEventListener('click',event=>{
  if(mode!=='alert')return; // v3.1.2 owns end-CASE; keep its confirmed CASE-only behavior.
  return fullRecovery(event);
 },true);
 force.addEventListener('click',event=>fullRecovery(event));
 leave.addEventListener('click',()=>{
  if(!caseOpen(S)||busy)return;openAlertReview('end');
 });
 window.NERV_V314={version:'3.1.4',snapshot:()=>({mode,busy,pending:pending().map(x=>x.name),
  fullRecoveryAvailable:!busy,caseOnlyVisible:!leave.hidden}),
  preview:s=>stage(clone(s))};
})();

})();
