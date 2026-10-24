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
  const before=JSON.parse(JSON.stringify(S));let changed=false;
  try{
   const backup=await callNative('backupState',{state:before});
   if(backup?.error)throw Error('事前バックアップ：'+backup.error);
   cancelSequence();stopSound();clearTimeout(saveTimeout);
   S=stage(before);changed=true;
   const saved=await callNative('persist',{state:JSON.parse(JSON.stringify(S))});
   if(saved?.error)throw Error('復旧状態の保存：'+saved.error);
   dialog.classList.add('hidden');draw();sound('ok');
   toast('作戦を終了・EVA回収。MAGI・保安案件と都市設備の未復旧状態を保持しました。');
  }catch(error){
   if(changed){S=before;draw();}
   meteoText('alertReviewDescription','作戦中断を取り消しました。'+error.message);
   toast('保存失敗のため作戦状態を維持しました。');
  }finally{
   busy=false;recoveryBusy=false;clear.disabled=false;$('alertContinue').disabled=false;target.disabled=false;
  }
 },true);
 // Source art, old state schema and every other warning/clear handler are intact.
 window.NERV_V312={version:'3.1.2',snapshot:()=>({mode,pending:pending().map(x=>x.name),busy}),
  dryRun:s=>stage(JSON.parse(JSON.stringify(s)))};
})();
