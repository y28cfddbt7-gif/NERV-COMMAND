// NERV-COMMAND v3.1.4 / common alert-review workflow, all alert categories.
// The original game, technical approvals and v3.1.2 atomic CASE-retreat remain authoritative.
(function initV314AlertWorkflow(){
 if(typeof openAlertReview!=='function'||typeof terminalAlert!=='function')return;
 const get=id=>document.getElementById(id),dialog=get('alertReview'),clear=get('alertClear'),
  target=get('alertTarget'),continueButton=get('alertContinue');
 const panel=dialog?.querySelector('.staff-alert-dialog');
 if(!panel||!clear||!target||!continueButton)return;
 const guidance=document.createElement('p');guidance.id='v314Guidance';guidance.setAttribute('role','status');
 const leave=document.createElement('button');leave.id='v314CaseOnly';leave.type='button';
 leave.className='staff-secondary';leave.textContent='作戦のみ終了・EVA回収の確認';leave.hidden=true;
 panel.insertBefore(guidance,continueButton);
 panel.insertBefore(leave,target);
 const securitySteps={
  detected:'案件を受領',accepted:'現場で証拠を収集',
  collecting:'現場記録と経路を照合',analyzing:'解析完了を確認',
  analyzed:'隔離・引継ぎ方針を決定',decision:'副司令へ正式報告',
  reported:'副司令の承認を確認',failed:'証拠を保全して緊急上申'
 };
 const magiSteps={
  detected:'独立診断を開始',diagnosing:'診断の結果を確認',work:'三基の測定値を補正',
  validated:'技術部に正式報告',reported:'技術部の復旧承認を確認'
 };
 const coolingSteps={
  detected:'異常案件を受領',accepted:'冷却枝系統を隔離',isolated:'独立診断を依頼',
  review:'技術部に診断結果を報告',reported:'承認結果を確認'
 };
 let mode='alert';
 function tickets(s=S){
  const results=[],w=s?.world;
  // These use the existing real world/approval state. A past log is not an open ticket.
  if(w?.security?.case){
   const c=w.security.case;
   results.push({name:'本部保安',step:securitySteps[c.stage]||'案件を確認',route:'本部保安盤 → 現場捜査'});
  }
  if(w&&typeof worldActiveIncident==='function'){
   const c=worldActiveIncident(w);
   if(c)results.push({name:'冷却系統',step:coolingSteps[c.status]||'異常案件を確認',route:'当直 → 冷却異常'});
  }
  if(w?.magiOps?.active){
   const a=w.magiOps.active;
   results.push({name:'MAGI保守',step:magiSteps[a.stage]||'保守状態を確認',route:'MAGI → 保守監視'});
  }
  if(['detected','isolated','analyzed','countermeasure','failed'].includes(s?.magi?.intrusion?.status))
   results.push({name:'MAGI侵入',step:'侵入対処の承認を完了',route:'MAGI → 侵入対処'});
  return results;
 }
 const caseIsOpen=s=>['active','defeat','victory'].includes(s?.defense?.status);
 function describe(){
  const active=tickets(),pending=active.length>0;
  leave.hidden=mode!=='alert'||!pending||!caseIsOpen(S);
  if(mode==='end'){
   guidance.textContent=pending?
    '作戦だけを中断できます。'+active.map(x=>x.name).join('・')+
      'の承認と施設状態はそのまま残ります。下の確定操作前に保存状態をバックアップします。':
    '終了操作は確認後に実行。未解決案件がない場合に限り全系統を正常待機に復帰します。';
   return;
  }
  // Legacy wrappers each disable the same full-reset control. Never silently grant that authority.
  if(pending){
   clear.disabled=true;clear.textContent='全系統復旧：未解決案件の承認待ち';
   const steps=active.map(x=>x.name+'：'+x.step+'（'+x.route+'）').join(' / ');
   guidance.textContent='未解決 '+active.length+' 件。'+steps+
     '。全系統復旧は承認後に可能です。'+
     (caseIsOpen(S)?'作戦の中断・EVA回収は別の確認ボタンから実行できます。':
      '現在終了対象の迎撃CASEはありません。保安・技術案件を担当盤で処理してください。');
   target.textContent=active[0]?.name==='本部保安'?'本部保安盤を開く ↗':
    active[0]?.name==='冷却系統'?'冷却異常の対応盤を開く ↗':
    active[0]?.name==='MAGI保守'?'MAGI保守監視を開く ↗':'MAGI侵入対処盤を開く ↗';
  }else{
   guidance.textContent='保安・技術の未解決案件はありません。復旧は確認操作後に実行されます。警報の表示だけでは保存状態を変更しません。';
  }
 }
 const earlierOpen=openAlertReview;
 openAlertReview=function(requested='alert'){
  mode=requested;
  earlierOpen(requested);
  if(!dialog.classList.contains('hidden'))describe();
 };
 leave.addEventListener('click',()=>{
  if(leave.hidden||mode!=='alert'||!caseIsOpen(S)||!tickets().length)return;
  // The confirmed v3.1.2 flow handles backup, persist, rollback and preserves unresolved tickets.
  openAlertReview('end');
 });
 clear.addEventListener('click',event=>{
  if(mode!=='alert'||!tickets().length)return;
  // Defensive guard: even if a stale legacy draw re-enables the button, an unresolved
  // technical/security ticket can never trigger the old global reset listener.
  event.preventDefault();event.stopImmediatePropagation();describe();
 },true);
 window.NERV_V314={version:'3.1.4',snapshot:()=>({
  mode,pending:tickets().map(x=>x.name),canEndCase:caseIsOpen(S),
  fullRestoreBlocked:tickets().length>0,caseOnlyVisible:!leave.hidden
 })};
})();
