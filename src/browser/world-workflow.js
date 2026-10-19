// Stage-one UI/controller: one authoritative S, transactional writes and visible role boundaries.
let staffWorldReady=false,staffWorldBusy=false,staffWorldError='',worldHistoryPage=0,worldCommPage=0;
function worldMagiLimited(){return staffWorldReady&&S.world?.schema===1&&worldObserve(S).magiHold;}
function worldMagiBlockText(){const fault=worldObserve(S).magiFault;return fault?fault.title+' / 技術部の復旧承認が必要':'冷却枝系統を点検中 / 技術部の復旧承認を待機';}
function renderWorldTelemetry(){
 if(!staffWorldReady)return;const level=terminalAlert().level,alarm=$('telemetryAlarm');
 if(alarm){alarm.textContent=level==='critical'?'CRITICAL':level==='watch'?'TACTICAL':'NOMINAL';alarm.style.color=level==='critical'?'#ff7976':level==='watch'?'#ffc171':'#9bf7bd';}
}
const worldPriorVoteInfo=voteInfo,worldPriorInterceptVotes=staffInterceptVotes,worldPriorApproved=staffInterceptApproved,worldPriorJudge=v27Judge,worldPriorBasics=combatBasics;
voteInfo=function(){const votes=worldPriorVoteInfo();return worldMagiLimited()?votes.map(v=>({...v,yes:false,reason:worldMagiBlockText()})):votes;};
staffInterceptVotes=function(){const votes=worldPriorInterceptVotes();return worldMagiLimited()?votes.map(v=>({...v,yes:false,reason:worldMagiBlockText()})):votes;};
staffInterceptApproved=function(){return !worldMagiLimited()&&worldPriorApproved();};
v27Judge=function(){if(worldMagiLimited()){toast(worldMagiBlockText());return;}return worldPriorJudge();};
combatBasics=function(){const reasons=worldPriorBasics();if(worldMagiLimited())reasons.push(worldMagiBlockText());return reasons;};
const worldPriorTerminalAlert=terminalAlert;
terminalAlert=function(){const previous=worldPriorTerminalAlert();if(!staffWorldReady)return previous;const observed=worldObserve(S),event=observed.incident;if(event&&(previous.level==='nominal'||(observed.magiHold&&previous.level!=='critical')))return {level:observed.magiHold?'critical':'watch',key:'world-'+event.id,title:'MAGI 冷却枝系統異常',message:'負荷 '+Math.round(S.world.cooling.load)+'% / 当直業務で受領・隔離・診断・技術部への報告を進めてください。',page:'work'};return previous;};
function worldApplyHold(previous){const limited=worldMagiLimited();if(limited!==previous||limited&&S.magi.approvedFor!==null){cancelSequence();staffInvalidateDecision();}}
async function worldAction(action){
 if(!staffWorldReady)return {ok:false,error:staffWorldError||'当直データを引継ぎ中です'};
 return commandOperation(()=>{const before=worldMagiLimited();worldAdvance(S,Date.now());worldDispatch(S,action);worldApplyHold(before);});
}
async function worldPulse(now=Date.now()){
 if(staffWorldBusy||document.hidden||!staffWorldReady||now>=S.world.lastSimAt&&now-S.world.lastSimAt<WORLD_STEP)return {ok:false,pending:true};
 staffWorldBusy=true;
 try{return await commandOperation(()=>{const before=worldMagiLimited();worldAdvance(S,now);worldApplyHold(before);});}finally{staffWorldBusy=false;}
}
const worldStatusLabels={available:'受付',accepted:'受領済み',checked:'確認済み',processing:'解析中',review:'報告待ち',complete:'完了',hold:'保留',detected:'未受領',isolated:'枝系統隔離',diagnosing:'診断中',reported:'技術部の承認待ち',resolved:'解決'};
function worldButton(container,action,label){const b=document.createElement('button');b.type='button';b.className='staff-primary';b.dataset.worldAction=action;b.textContent=label;container.append(b);}
function worldRenderPaged(target,entries,page,size,kind){
 const pages=Math.max(1,Math.ceil(entries.length/size));page=Math.max(0,Math.min(pages-1,page));const list=$(target);list.replaceChildren();
 for(const record of entries.slice(page*size,(page+1)*size)){const row=document.createElement('article'),label=document.createElement('small'),text=document.createElement('p');label.textContent=kind==='communications'?record.from+(record.read?' / 受領済み':' / 未読'):record.kind+' / '+new Date(record.at).toLocaleTimeString('ja-JP');text.textContent=record.text;row.append(label,text);list.append(row);}
 if(!entries.length)list.textContent='記録なし / 引継ぎ待機';return {page,pages};
}
function renderStaffWorld(){
 if(!$('worldBrief'))return;
 const recovery=window.__NERV_STATE_RECOVERY__,warning=staffWorldError||recovery?.message||'';
 $('worldRecovery').hidden=!warning;meteoText('worldRecovery',warning);
 if(!staffWorldReady||S.world?.schema!==1){meteoText('worldBrief',staffWorldError||'当直データのバックアップと引継ぎを確認しています。');all('[data-world-readout]').forEach(n=>n.textContent='引継ぎ待ち');return;}
 const w=S.world,observed=worldObserve(S),job=w.jobs.find(j=>j.status!=='complete'),event=observed.incident;
 renderWorldTelemetry();
 document.body.dataset.worldAlert=observed.alert==='非常'?'critical':observed.alert==='警戒'?'watch':'normal';
 all('[data-world-readout]').forEach(n=>n.textContent={alert:observed.alert,magi:observed.magi,load:Math.round(w.cooling.load)+'%'}[n.dataset.worldReadout]);
 meteoText('launcherWorld',observed.alert+' / '+(event?'未処理の異常あり':job?'担当業務 '+worldStatusLabels[job.status]:'次の点検を待機'));
 meteoText('launcherComms','司令部の5人 / 部署連絡 '+w.communications.filter(c=>!c.read).length+'未読');
 meteoText('launcher666',externalMagiActive()?'外部侵入対処中 / 666へ':'外部防御の監視・開始・対処');
 meteoText('worldBrief',event?'冷却枝系統の負荷から異常案件が発生しています。異常対応の手順を確認してください。':job?'技術局から冷却系統の定期点検が届いています。担当業務を受領してください。':'報告を引き継ぎました。設備は継続監視中です。次の点検受付を待ちます。');
 meteoText('worldMagiReason',observed.magi+' / '+(event?'冷却系統：'+worldStatusLabels[event.status]:'日常業務：'+(job?worldStatusLabels[job.status]:'完了・次の受付待ち')));
 meteoText('worldJobStatus',job?worldStatusLabels[job.status]:'完了');
 const steps=$('worldJobSteps');steps.replaceChildren();const stages=['受付','受領','確認','解析','報告'];const step=job?({available:0,accepted:1,checked:2,processing:3,review:4,hold:0}[job.status]??0):5;
 stages.forEach((label,i)=>{const li=document.createElement('li');li.textContent=label;li.dataset.done=String(i<step);li.dataset.current=String(i===step);steps.append(li);});
 meteoText('worldJobEvidence',job?.evidence?'点検時の冷却負荷 '+Math.round(job.evidence.load)+'% / 主電源 '+(job.evidence.power?'接続':'停止')+' / 通信 '+(job.evidence.comms?'接続':'停止')+(job.status==='processing'?'。MAGIで照合中。次の30秒更新を待機。':job.status==='review'?'。解析結果を技術部へ報告できます。':'。解析依頼へ進めます。'):job?'受領後に表示確認を実施します。点検・分析・報告の順に処理します。':'点検報告は提出済み。報告に基づく予防整備を技術部へ引き継ぎました。');
 const actions=$('worldJobActions');actions.replaceChildren();
 for(const [action,label] of ({available:[['accept','点検業務を受領']],hold:[['accept','保留した業務を再開']],accepted:[['inspect','系統表示を確認'],['hold','業務を保留']],checked:[['analyze','MAGIへ解析を依頼'],['hold','業務を保留']],review:[['report','技術部へ点検結果を報告']]}[job?.status]||[]))worldButton(actions,action,label);
 meteoText('worldIncidentStatus',event?worldStatusLabels[event.status]:'異常なし');$('worldLoadFill').style.width=w.cooling.load+'%';
 meteoText('worldIncidentCause',event?'原因：MAGI稼働に伴う冷却負荷の蓄積 '+Math.round(w.cooling.load)+'%。'+(observed.magiHold?'通常審議を保留しています。':'進行すると通常審議へ影響します。'):'現在の模擬冷却負荷 '+Math.round(w.cooling.load)+'%。70%で異常案件、90%で通常審議を保留します。点検報告による予防整備で負荷を軽減できます。');
 meteoText('worldIncidentProcedure',event?({detected:'1. 案件を受領し、手順書の範囲を確認。',accepted:'2. 許可された冷却枝系統だけを隔離。',isolated:'3. 技術部へ独立診断を依頼。',diagnosing:'診断中。次の30秒更新を待機。',review:'4. 診断結果を赤木リツコへ報告。',reported:'技術部が整備・再接続を判断中。次の30秒更新を待機。'}[event.status]):'発生は負荷と稼働状態に依存します。表示だけのランダム警報は生成しません。');
 const eventActions=$('worldIncidentActions');eventActions.replaceChildren();for(const [action,label] of ({detected:[['incidentAccept','異常案件を受領']],accepted:[['isolate','手順書に基づき枝系統を隔離']],isolated:[['diagnose','技術部へ独立診断を依頼']],review:[['incidentReport','赤木リツコへ診断結果を報告']]}[event?.status]||[]))worldButton(eventActions,action,label);
 const depts=$('worldDepartmentList');depts.replaceChildren();
 for(const [name,text] of [['技術開発部 / MAGI',observed.magi+' / 冷却負荷 '+Math.round(w.cooling.load)+'%'],['EVA運用・パイロット',observed.evas.map(e=>'0'+e.unit+' '+stateJP[e.state]+' / SYNC '+Number(e.sync).toFixed(1)+'%').join(' ・ ')],['施設・都市防衛','主電源 '+(observed.power?'接続':'停止')+' / 通信 '+(observed.comms?'接続':'停止')+' / 都市健全性 '+v27CityIntegrity()+'%'],['戦術作戦部',S.defense.status==='active'?'敵性反応を監視中 / CASE '+S.defense.caseNo:'作戦状況：'+S.defense.status]]){const row=document.createElement('article'),title=document.createElement('strong'),p=document.createElement('p');title.textContent=name;p.textContent=text;row.append(title,p);depts.append(row);}
 const history=worldRenderPaged('worldHistory',w.history,worldHistoryPage,4,'history');worldHistoryPage=history.page;meteoText('worldHistoryPage',(history.page+1)+' / '+history.pages);$('worldHistoryPrev').disabled=!history.page;$('worldHistoryNext').disabled=history.page+1>=history.pages;
 const comms=worldRenderPaged('worldCommunications',w.communications,worldCommPage,3,'communications');worldCommPage=comms.page;meteoText('worldCommPage',(comms.page+1)+' / '+comms.pages);$('worldCommPrev').disabled=!comms.page;$('worldCommNext').disabled=comms.page+1>=comms.pages;meteoText('worldUnread',w.communications.filter(c=>!c.read).length+' 未読');
 if(observed.magiHold){$('magiVote').disabled=true;meteoText('magiLiveState','冷却系統点検 / 通常審議保留');meteoText('magiDecision','当直業務の異常案件を技術部へ報告してください。復旧承認後に再申請できます。');}
}
async function initializeStaffWorld(){
 if(staffWorldReady||staffWorldBusy)return;staffWorldBusy=true;
 try{
  if(window.__NERV_STATE_RECOVERY__?.blocked)throw Error(window.__NERV_STATE_RECOVERY__.message);
  const normalized=worldNormalize(S.world,Date.now());if(normalized.future)throw Error('この世界状態は新しい版の形式です。現在のデータを保持して引継ぎを停止しました。');
  const backup=await callNative('backupWorld',{state:worldClone(S),quarantine:normalized.repaired});if(backup?.error)throw Error('当直状態の事前保存に失敗：'+backup.error);
  const result=await commandOperation(()=>{S.world=normalized.world;worldAdvance(S,Date.now());if(worldObserve(S).magiHold){cancelSequence();staffInvalidateDecision();}});
  if(!result.ok)throw Error(result.error);staffWorldReady=true;staffWorldError='';draw();window.dispatchEvent(new CustomEvent('nerv-world-ready'));
 }catch(error){staffWorldError=error.message;staffWorldReady=false;renderStaffWorld();}
 finally{staffWorldBusy=false;}
}
function initWorldWorkflow(){
 if(!qs('.page[data-page="work"]'))return;
 mobileGroup('work',[['brief','当直'],['jobs','担当業務'],['incidents','異常対応'],['departments','部署・設備'],['communications','部署通信'],['history','履歴']].map(([id,label])=>({id,label,existing:true})),'brief');
 qs('.page[data-page="magi"]').append($('worldMagiPanel'));$('worldWorkflowTemplate').remove();registerTerminalView('magi','workflow','当直連携');
 for(const button of all('#v27MagiJudge')){button.removeEventListener('click',worldPriorJudge);button.addEventListener('click',v27Judge);}if(window.NERV_V27_TEST)window.NERV_V27_TEST.judge=v27Judge;
 document.addEventListener('click',event=>{const b=event.target.closest('[data-world-action]');if(b&&!b.disabled)worldAction(b.dataset.worldAction);});
 $('alertTarget').addEventListener('click',event=>{if(terminalAlert().key?.startsWith('world-')){event.stopImmediatePropagation();closeAlertReview();window.NERV_MOBILE.open('work','incidents');}},true);
 $('worldHistoryPrev').addEventListener('click',()=>{worldHistoryPage--;renderStaffWorld();});$('worldHistoryNext').addEventListener('click',()=>{worldHistoryPage++;renderStaffWorld();});$('worldCommPrev').addEventListener('click',()=>{worldCommPage--;renderStaffWorld();});$('worldCommNext').addEventListener('click',()=>{worldCommPage++;renderStaffWorld();});
 const priorReview=openAlertReview,normalClearLabel=$('alertClear').textContent;openAlertReview=function(mode='alert'){priorReview(mode);const incident=staffWorldReady&&worldActiveIncident(S.world);$('alertClear').disabled=!!incident;$('alertClear').textContent=incident?'技術部の復旧承認が必要':normalClearLabel;if(incident)meteoText('alertReviewDescription','管制補助の権限では全系統を復旧できません。「対象画面」から異常案件を受領し、診断結果を技術部へ報告してください。');};
 const priorDraw=draw;draw=function(){priorDraw();renderStaffWorld();};
 const priorAlert=renderTacticalAlert;renderTacticalAlert=function(){priorAlert();renderWorldTelemetry();};
 const priorMagi=renderMAGI;renderMAGI=function(){priorMagi();if(staffWorldReady)renderStaffWorld();};
 const priorMessage=commandMessage;commandMessage=function(page){if(page==='magi'&&worldMagiLimited())return '冷却枝系統の点検中 / 当直業務で技術部へ診断結果を報告してください。';return priorMessage(page);};
 const restore=()=>{const [page,view]=location.hash.slice(1).split('/');if(page==='work'||page==='magi'&&view==='workflow')window.NERV_MOBILE.open(page,view);};
 window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
 window.addEventListener('nerv-route',event=>{if(event.detail.page==='work'&&event.detail.view==='control'&&staffWorldReady&&worldActiveIncident(S.world))mobileNavigate('work','incidents');renderStaffWorld();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)worldPulse();});
 window.addEventListener('pagehide',()=>{if(staffWorldReady)persist();});
 setInterval(()=>{if(staffWorldReady)worldPulse();else if(!staffWorldError)initializeStaffWorld();},5000);
 window.NERV_WORLD={act:worldAction,advance:worldPulse,snapshot:()=>({ready:staffWorldReady,error:staffWorldError,world:worldClone(S.world||null),observed:staffWorldReady?worldClone(worldObserve(S)):null}),retry:()=>{staffWorldError='';return initializeStaffWorld();}};
 renderStaffWorld();restore();initializeStaffWorld();
}
initWorldWorkflow();
