function voteInfo(){const e=selected(),i=S.infra;return [
 {name:'BALTHASAR',yes:i.power&&e.state==='READY',reason:e.state==='READY'?'機体の発進準備完了':'EVA管理で発進準備が必要'},
 {name:'CASPER',yes:i.armor&&i.comms,reason:i.armor&&i.comms?'都市防護・通信を確保':'都市装甲または通信の確認が必要'},
 {name:'MELCHIOR',yes:i.power&&e.power>=240,reason:i.power&&e.power>=240?'主電源・機体電力が正常':'主電源または機体電力が不足'}];}
function staffInterceptVotes(){const t=S.tactics,d=S.defense;return [
 {name:'BALTHASAR',yes:S.evas[t.attacker].state==='DEPLOYED'&&S.evas[t.attacker].power>=60,reason:S.evas[t.attacker].state!=='DEPLOYED'?'攻撃担当機の出撃が必要':S.evas[t.attacker].power>=60?'出撃済み・機体電力に余裕あり':'機体電力が60秒未満 / 安全余力が不足'},
 {name:'CASPER',yes:!!(S.infra.comms&&d?.status==='active'&&d.scans>=34),reason:S.infra.comms&&d?.status==='active'&&d.scans>=34?'目標・通信を確認':'目標検知・解析・通信の確認が必要'},
 {name:'MELCHIOR',yes:!!(S.infra.power&&t.charge>=70&&t.heat<80&&S.ops?.currentMissionLocks>0),reason:S.infra.power&&t.charge>=70&&t.heat<80&&S.ops?.currentMissionLocks>0?'迎撃電力・照準・熱負荷が正常':'迎撃電力70%以上・照準確定・冷却が必要'}];}
function staffInterceptApproved(){const a=S.magi.interceptApproval,d=S.defense,t=S.tactics;if(!d||!t)return false;return !!(a?.approved&&a.caseNo===d?.caseNo&&a.round===d.round&&a.attacker===t.attacker&&S.magi.approvedFor===t.attacker&&d.magivote?.filter(Boolean).length>=2&&d.magiround===d.round&&S.infra.power&&S.infra.comms&&d.status==='active'&&d.scans>=34&&S.evas[t.attacker].state==='DEPLOYED'&&t.charge>=70&&t.heat<80&&S.ops?.currentMissionLocks>0);}
function renderMAGI(){
 const purpose=S.magi.purpose||'sortie',intercept=purpose==='intercept';
 const v=S.magi.vote,valid=v&&v.eva===S.selectedEva&&(v.purpose||'sortie')===purpose;
 const codes={BALTHASAR:'B',CASPER:'C',MELCHIOR:'M'};
 for(const name of Object.keys(codes)){const vote=valid?v.votes.find(x=>x.name===name):null;meteoText('m'+codes[name]+'Status',vote?(vote.yes?'賛成':'否決'):'待機');meteoText('m'+codes[name]+'Sub',vote?vote.reason:({BALTHASAR:'機体・人員の安全を評価',CASPER:'作戦の成立条件を評価',MELCHIOR:'技術条件を評価'}[name]));const cell=$('m'+codes[name]+'Status')?.parentElement;if(cell)cell.dataset.vote=vote?(vote.yes?'approved':'denied'):'pending';}
 const expired=valid&&v.approved&&intercept&&!staffInterceptApproved();
 meteoText('magiLiveState',expired?'承認失効 / 再審議':valid?(v.approved?'承認':'否決'):'審議待ち');
 if($('magiDecision'))$('magiDecision').dataset.decision=expired?'expired':valid?(v.approved?'approved':'denied'):'pending';
 meteoText('magiDecision',valid?(expired?'承認失効 / 再審議':v.approved?'承認':'否決')+' / '+v.count+'対'+(3-v.count)+'\n'+(intercept?'迎撃実行':'UNIT-0'+v.eva+' 出撃')+'\n'+(v.blockers?.length?'未達条件：'+v.blockers.join(' / '):'必要な運用条件を確認しました。'):'審議内容と対象を選び、「決議を実行」を押してください。');
 const reasonList=$('magiReasons');if(reasonList){reasonList.replaceChildren();if(valid)for(const vote of v.votes){const li=document.createElement('li');li.textContent=vote.name+'：'+vote.reason;reasonList.append(li);}}
 const purposeEl=$('magiPurpose');if(purposeEl)purposeEl.value=purpose;
 const unitEl=$('magiUnit');if(unitEl){unitEl.value=String(intercept?(S.tactics?.attacker??1):S.selectedEva);unitEl.disabled=intercept;}
 meteoText('magiRequestHint',intercept?'戦術指揮で電力・出撃・照準を準備してから迎撃実行を審議します。対象は攻撃担当機です。':'EVA管理で対象機を発進準備 → ここで決議 → EVA管理で出撃、の順に操作します。');
 meteoText('magiReturn',intercept?'戦術指揮へ戻る ↗':'EVA運用へ戻る ↗');renderLogs('magi');
}
$('magiVote').addEventListener('click',()=>{
 settleEvaPower();const purpose=S.magi.purpose||'sortie';if(purpose==='intercept')S.selectedEva=S.tactics.attacker;
 const unit=S.selectedEva,votes=purpose==='intercept'?staffInterceptVotes():voteInfo(),count=votes.filter(v=>v.yes).length;
 const blockers=[];if(!S.infra.power)blockers.push('主電源の復旧');if(!S.infra.comms)blockers.push('通信の復旧');
 if(purpose==='sortie'&&selected().state!=='READY')blockers.push('対象機の発進準備');
 if(purpose==='intercept'){
  if(S.evas[S.tactics.attacker].state!=='DEPLOYED')blockers.push('攻撃担当機の出撃');
  if(S.defense?.status!=='active'||S.defense.scans<34)blockers.push('迎撃対象の検知・解析');
  if(S.tactics.charge<70||S.tactics.heat>=80||!(S.ops.currentMissionLocks>0))blockers.push('迎撃電力70%以上・照準確定・冷却');
  if(![4,5].includes(S.mission.phase))blockers.push('戦術指揮で迎撃準備を進めてください');
 }
 const approved=count>=2&&blockers.length===0;
 playSequence('magi','MAGIシステム',purpose==='intercept'?'迎撃実行承認':'UNIT-0'+unit+' / 出撃承認',
 ['MELCHIOR-1 / 技術評価','BALTHASAR-2 / 安全評価','CASPER-3 / 作戦評価','CONSENSUS / 決議確定'],()=>{
  S.magi.vote={votes,count,approved,eva:unit,purpose,blockers,time:Date.now()};S.magi.approvedFor=approved?unit:null;
  if(purpose==='intercept'){
   S.magi.interceptApproval={approved,attacker:unit,caseNo:S.defense.caseNo,round:S.defense.round};
   S.defense.magivote=votes.map(v=>v.yes);S.defense.magiround=S.defense.round;
  }
  addLog('magi',(purpose==='intercept'?'迎撃実行':'UNIT-0'+unit+' 出撃')+' / '+(approved?'承認':'否決')+' / '+count+'対'+(3-count));
  sound(approved?'ok':'deny');draw();
 },votes);
});
if(qs('#magiPurpose')){
 $('magiPurpose').addEventListener('change',e=>{S.magi.purpose=e.target.value;staffInvalidateDecision();if(e.target.value==='intercept')S.selectedEva=S.tactics.attacker;persist();draw();});
 $('magiUnit').addEventListener('change',e=>{S.selectedEva=Number(e.target.value);renderMAGI();persist();});
 $('magiReturn').addEventListener('click',()=>go(S.magi.purpose==='intercept'?'mission':'eva'));
}
