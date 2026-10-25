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
  const before=clone(S);let changed=false;
  try{
   const backup=await callNative('backupState',{state:clone(before)});
   if(backup?.error)throw Error('事前バックアップ：'+backup.error);
   cancelSequence();stopSound();clearTimeout(saveTimeout);
   S=stage(before);changed=true;
   const result=await callNative('persist',{state:clone(S)});
   if(result?.error)throw Error('復旧状態の保存：'+result.error);
   dialog.classList.add('hidden');draw();sound('ok');
   toast('警報復旧完了。未解決案件は手動中断として記録しました。');
  }catch(error){
   if(changed){S=before;draw();}
   meteoText('alertReviewDescription','復旧を中止しました。'+error.message);
   toast('保存できないため警報状態を保持しました。');
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
