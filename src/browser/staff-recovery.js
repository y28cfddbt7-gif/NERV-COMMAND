// Explicit operator recovery: backup first, cancel pending commands, persist, then acknowledge.
let recoveryBusy=false,alertReturnFocus=null,alertReviewMode='alert';
function staffRecoveryBlockers(state=S){
 const w=state.world,issues=[];
 if(w?.magiOps?.active)issues.push('MAGI保守');
 if(typeof worldActiveIncident==='function'&&w&&worldActiveIncident(w))issues.push('冷却系統');
 if(typeof securityActive==='function'&&w&&securityActive(state))issues.push('本部保安');
 if(['detected','isolated','analyzed','countermeasure','failed'].includes(state.magi?.intrusion?.status))issues.push('MAGI侵入');
 return issues;
}
function staffRecoveryDestination(state=S){
 const w=state.world;
 if(w?.magiOps?.active)return ['magi','maintenance'];
 if(typeof worldActiveIncident==='function'&&w&&worldActiveIncident(w))return ['work','incidents'];
 if(typeof securityActive==='function'&&w&&securityActive(state))return ['work','security'];
 return null;
}
// If city-damage outranks MAGI in the global alert, the generic target points
// to city facilities and strands the operator. Route to the blocking desk.
$('alertTarget')?.addEventListener('click',event=>{
 const dest=staffRecoveryDestination();
 if(!dest)return;
 event.preventDefault();event.stopImmediatePropagation();
 closeAlertReview();
 window.NERV_MOBILE?.open(...dest);
},true);
function openAlertReview(mode='alert'){
 if(recoveryBusy)return;
 alertReviewMode=mode;
 const alert=terminalAlert(),modal=$('alertReview');if(!modal)return;
 alertReturnFocus=document.activeElement;
 meteoText('alertReviewTitle',mode==='end'?'作戦終了の確認':alert.title||'正常待機への復帰');
 const blockers=staffRecoveryBlockers();
 meteoText('alertReviewDescription',mode==='end'&&blockers.length?
  '現在の作戦のみ終了してEVAを回収します。'+blockers.join('・')+
  'の未処理案件と設備損傷は保持され、復旧承認が済むまでMAGIは停止したままです。':
  mode==='end'?'進行中の作戦を終了して正常待機へ戻しますか。':alert.message||'全系統を正常待機へ戻します。');
 const dest=staffRecoveryDestination();
 if(dest)$('alertTarget').textContent=dest[0]==='magi'?'MAGI保守盤を開く ↗':dest[1]==='incidents'?'冷却異常の対応盤を開く ↗':'本部保安盤を開く ↗';
 else $('alertTarget').textContent='対象の管制画面を開く ↗';
 const action=$('alertClear');
 const unresolved=blockers.length>0;
 action.disabled=false;
 action.textContent=mode==='end'?(unresolved?'作戦のみ終了・EVA回収':'作戦終了・正常待機へ'):'警報をクリアして正常待機へ';
 const note=modal.querySelector?.('.staff-reset-note');
 if(note)note.textContent=mode==='end'&&unresolved?
 'MAGI・冷却・保安案件の未処理状況と設備損傷を保持したまま、現在の作戦だけを中断してEVAを回収します。技術部の復旧承認を代行せず、案件は引き続き対応が必要です。':
 '全系統復旧を確定すると、作戦を終了し都市の電力・通信・設備を復旧、EVAを回収します。タスク・気象・設定・累計記録を保持し、操作前にバックアップを作成します。';
 modal.classList.remove('hidden');$('alertContinue').focus();
}
function closeAlertReview(){if(recoveryBusy)return;$('alertReview').classList.add('hidden');if(alertReturnFocus?.isConnected)alertReturnFocus.focus();}
function recoveredStaffState(previous){
 const next=JSON.parse(JSON.stringify(previous));
 next.infra={...next.infra,power:true,comms:true,armor:false};
 next.evas=next.evas.map(e=>({...e,state:'HANGAR',power:300,at:false,umbilical:true,powerUpdatedAt:null}));
 next.magi={...next.magi,approvedFor:null,vote:null,interceptApproval:null};
 if(next.magi.intrusion)next.magi.intrusion={...next.magi.intrusion,status:'idle',progress:0,phase:0,affected:[],message:'警報クリア / MAGI正常待機'};
 next.mission={...next.mission,phase:0};next.ops={...next.ops,currentMissionLocks:0,missionAwarded:false};
 next.tactics={...next.tactics,charge:0,heat:0,scans:0};
 const d=next.defense;
 Object.assign(d,{status:'idle',enemy:null,round:0,scans:0,breach:0,energy:100,security:100,connected:false,shutdown:false,magivote:null,magiround:-1,alert:false,usedV27Shot:false,last:'警報クリア / 全系統正常待機'});
 d.city=d.city.map((c,i)=>({...c,hp:100,armor:i===3}));
 const entry={time:hhmmss(),text:'警報クリア / 都市復旧・全EVA回収・作戦終了'};
 for(const type of ['infra','eva','mission'])next.logs[type]=[entry,...(next.logs[type]||[])].slice(0,35);
 return next;
}
// Recovery hold and termination are different operations. This safely ends only
// the fictional CASE without forging technical/commander clearance or healing assets.
function endedStaffCaseState(previous){
 const next=recoveredStaffState(previous);
 next.infra=JSON.parse(JSON.stringify(previous.infra));
 next.magi={...JSON.parse(JSON.stringify(previous.magi)),approvedFor:null,vote:null,interceptApproval:null};
 next.defense.city=JSON.parse(JSON.stringify(previous.defense.city));
 for(const key of ['energy','parts','spares','security','breach'])
  if(previous.defense[key]!==undefined)next.defense[key]=previous.defense[key];
 next.defense.last='作戦中断 / EVA回収 / 未処理の技術・保安案件は継続';
 for(const type of ['infra','eva','mission'])if(next.logs[type]?.[0])
  next.logs[type][0].text='作戦のみ終了 / EVA回収。設備の損傷・MAGI・保安案件は引き継ぎ';
 return next;
}
async function clearTerminalAlert(){
 if(recoveryBusy)return;
 // Authority is enforced here too; a programmatic call must never bypass
 // the technical signoff rules by skipping the disabled modal button.
 const outstanding=staffRecoveryBlockers(S);
 if(alertReviewMode!=='end'&&outstanding.some(x=>['MAGI保守','冷却系統','本部保安'].includes(x))){
  meteoText('alertReviewDescription',outstanding.join('・')+
   'の正式な引継ぎ・復旧承認が必要です。作戦だけを中断する場合は「終了・復旧」を使用してください。');
  return;
 }
 recoveryBusy=true;$('alertClear').disabled=true;$('alertContinue').disabled=true;$('alertTarget').disabled=true;
 const previous=JSON.parse(JSON.stringify(S));let changed=false;
 const interrupted=alertReviewMode==='end'&&staffRecoveryBlockers(previous).length>0;
 try{
  const backup=await callNative('backupState',{state:previous});if(backup?.error)throw Error('事前バックアップ：'+backup.error);
  cancelSequence();stopSound();clearTimeout(saveTimeout);
  S=interrupted?endedStaffCaseState(previous):recoveredStaffState(previous);changed=true;
  const result=await callNative('persist',{state:JSON.parse(JSON.stringify(S))});if(result?.error)throw Error('復旧状態の保存：'+result.error);
  $('alertReview').classList.add('hidden');draw();sound('ok');toast(interrupted?'作戦を終了・EVA回収。未処理MAGI・保安案件は継続中です。':'警報をクリアしました。都市・全EVAは正常待機です。');
  if(alertReturnFocus?.isConnected)alertReturnFocus.focus();
 }catch(error){
  if(changed){S=previous;draw();}
  meteoText('alertReviewDescription','クリアを中止しました。'+error.message);toast('状態を保存できないため、警報を維持します。');
 }finally{recoveryBusy=false;$('alertClear').disabled=false;$('alertContinue').disabled=false;$('alertTarget').disabled=false;}
}
