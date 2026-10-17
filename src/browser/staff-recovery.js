// Explicit operator recovery: backup first, cancel pending commands, persist, then acknowledge.
let recoveryBusy=false,alertReturnFocus=null;
function openAlertReview(mode='alert'){
 if(recoveryBusy)return;
 const alert=terminalAlert(),modal=$('alertReview');if(!modal)return;
 alertReturnFocus=document.activeElement;
 meteoText('alertReviewTitle',mode==='end'?'作戦終了の確認':alert.title||'正常待機への復帰');
 meteoText('alertReviewDescription',mode==='end'?'進行中の作戦を終了して正常待機へ戻しますか。':alert.message||'全系統を正常待機へ戻します。');
 modal.classList.remove('hidden');$('alertContinue').focus();
}
function closeAlertReview(){if(recoveryBusy)return;$('alertReview').classList.add('hidden');if(alertReturnFocus?.isConnected)alertReturnFocus.focus();}
function recoveredStaffState(previous){
 const next=JSON.parse(JSON.stringify(previous));
 next.infra={...next.infra,power:true,comms:true,armor:false};
 next.evas=next.evas.map(e=>({...e,state:'HANGAR',power:300,at:false,umbilical:true,powerUpdatedAt:null}));
 next.magi={...next.magi,approvedFor:null,vote:null,interceptApproval:null};
 next.mission={...next.mission,phase:0};next.ops={...next.ops,currentMissionLocks:0,missionAwarded:false};
 next.tactics={...next.tactics,charge:0,heat:0,scans:0};
 const d=next.defense;
 Object.assign(d,{status:'idle',enemy:null,round:0,scans:0,breach:0,energy:100,security:100,connected:false,shutdown:false,magivote:null,magiround:-1,alert:false,usedV27Shot:false,last:'警報クリア / 全系統正常待機'});
 d.city=d.city.map((c,i)=>({...c,hp:100,armor:i===3}));
 const entry={time:hhmmss(),text:'警報クリア / 都市復旧・全EVA回収・作戦終了'};
 for(const type of ['infra','eva','mission'])next.logs[type]=[entry,...(next.logs[type]||[])].slice(0,35);
 return next;
}
async function clearTerminalAlert(){
 if(recoveryBusy)return;
 recoveryBusy=true;$('alertClear').disabled=true;$('alertContinue').disabled=true;$('alertTarget').disabled=true;
 const previous=JSON.parse(JSON.stringify(S));let changed=false;
 try{
  const backup=await callNative('backupState',{state:previous});if(backup?.error)throw Error('事前バックアップ：'+backup.error);
  cancelSequence();stopSound();clearTimeout(saveTimeout);
  S=recoveredStaffState(previous);changed=true;
  const result=await callNative('persist',{state:JSON.parse(JSON.stringify(S))});if(result?.error)throw Error('復旧状態の保存：'+result.error);
  $('alertReview').classList.add('hidden');draw();sound('ok');toast('警報をクリアしました。都市・全EVAは正常待機です。');
  if(alertReturnFocus?.isConnected)alertReturnFocus.focus();
 }catch(error){
  if(changed){S=previous;draw();}
  meteoText('alertReviewDescription','クリアを中止しました。'+error.message);toast('状態を保存できないため、警報を維持します。');
 }finally{recoveryBusy=false;$('alertClear').disabled=false;$('alertContinue').disabled=false;$('alertTarget').disabled=false;}
}
