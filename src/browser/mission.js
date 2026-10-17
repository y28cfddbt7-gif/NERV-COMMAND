const staffStageNames=['待機','都市防護','迎撃電力','EVA出撃','目標解析','迎撃判断','作戦完了'];
function renderMission(){
 if(!S.tactics||!S.ops||![0,1,2].includes(S.tactics.attacker))return;
 const p=S.mission.phase,d=S.defense,t=S.tactics,active=d?.status==='active';
 const checks=[['都市の主電源・通信・装甲',S.infra.power&&S.infra.comms&&S.infra.armor],['迎撃電力70%以上',t.charge>=70],['攻撃担当 UNIT-0'+t.attacker+' の出撃',S.evas[t.attacker].state==='DEPLOYED'],['対象の解析・照準確定',active&&d.scans>=34&&S.ops.currentMissionLocks>0],['今回の迎撃に対するMAGI承認',staffInterceptApproved()]];
 const explanations=['敵性反応の検知から迎撃まで、必要な指示を順番に出します。','都市装甲を展開し、防衛態勢へ移行します。','迎撃に必要な電力を集約します。','EVA管理で発進準備、MAGIの出撃承認、出撃を実行してください。','対象の波形を解析し、照準を確定します。','条件を確認してMAGIへ迎撃実行を申請します。承認後に迎撃できます。','迎撃結果は都市防衛と指揮記録に保存されています。終了すると正常待機へ戻ります。'];
 let action=['訓練を開始','都市防護を展開','迎撃電力を確保','EVA管理へ / 出撃を確認','目標を解析・照準確定','迎撃を実行','作戦完了'][p]||'状況を確認';
 if(p===3&&S.evas[t.attacker].state==='DEPLOYED')action='出撃を確認して次へ';
 if(p===5){if(!active)action='対象を再検知';else if(t.charge<70)action='迎撃電力を再確保';else if(!staffInterceptApproved())action='MAGIに迎撃承認を申請';}
 meteoText('missionStep',String(p).padStart(2,'0')+' / '+staffStageNames[p]);meteoText('missionDescription',explanations[p]);meteoText('missionReady',p===0?'正常待機':p===6?'迎撃終了':'作戦進行中');
 meteoText('staffTarget',active?d.enemy.code+' / 残存 '+d.enemy.hp:d?.status==='victory'?'目標沈黙':'未検知');meteoText('staffCity',d?Math.round(d.city.reduce((n,c)=>n+c.hp,0)/4)+'%':'--');
 meteoText('staffAttacker','UNIT-0'+t.attacker+' / '+stateJP[S.evas[t.attacker].state]);meteoText('staffCharge',t.charge+'%');
 meteoText('staffNextHint',p===5?checks.filter(x=>!x[1]).map(x=>'要確認：'+x[0]).join(' / ')||'すべての必須条件が成立。迎撃を実行できます。':explanations[p]);
 meteoText('missionAction',action);$('missionAction').disabled=p===6;
 const list=$('staffChecklist');if(list?.replaceChildren){list.replaceChildren();for(const [text,ok] of checks){const row=document.createElement('li');row.textContent=(ok?'確認済：':'未完了：')+text;row.dataset.complete=String(ok);list.append(row);}}
 if($('staffAttackUnit'))$('staffAttackUnit').value=String(t.attacker);renderLogs('mission');
}
$('missionAction').addEventListener('click',()=>{
 const p=S.mission.phase,t=S.tactics;
 if(!S.infra.power||!S.infra.comms){toast('主電源・通信の異常を復旧するか、警報確認からクリアしてください。');go('infra');return;}
 if(p===0){if(S.defense.status!=='active')v27Detect();S.mission.phase=1;S.ops.currentMissionLocks=0;S.ops.missionAwarded=false;staffInvalidateDecision();addLog('mission','都市防衛・迎撃訓練を開始');}
 else if(p===1){S.infra.armor=true;staffInvalidateDecision();S.mission.phase=2;addLog('mission','都市装甲を展開 / 防護態勢確保');}
 else if(p===2){t.charge=80;t.heat=0;staffInvalidateDecision();S.mission.phase=3;addLog('mission','迎撃電力を80%確保');}
 else if(p===3){if(S.evas[t.attacker].state!=='DEPLOYED'){S.selectedEva=t.attacker;S.magi.purpose='sortie';go('eva');return;}S.mission.phase=4;addLog('mission','UNIT-0'+t.attacker+' の出撃を確認');}
 else if(p===4){
  if(S.defense.status!=='active'){v27Detect();}
  const scans=Math.max(0,Math.ceil((68-S.defense.scans)/34));
  if(S.defense.energy<scans*12){toast('都市防衛の予備送電で解析用の電力を確保してください。');go('infra');return;}
  for(let i=0;i<scans;i++)v27Scan();S.ops.currentMissionLocks=1;S.ops.locks++;t.scans=Math.max(t.scans,2);S.mission.phase=5;staffInvalidateDecision();addLog('mission','対象の波形解析・照準を確定');
 }else if(p===5){
  if(S.defense.status!=='active'){v27Detect();staffInvalidateDecision();draw();return;}
  if(t.charge<70){t.charge=80;t.heat=Math.max(0,t.heat-20);staffInvalidateDecision();addLog('mission','迎撃電力を再確保 / MAGI再審議が必要');draw();return;}
  if(!staffInterceptApproved()){staffMagiRequest('intercept');return;}
  const before=S.defense.enemy.hp;v27Shot();
  if(S.defense.enemy.hp<before){t.shots++;staffInvalidateDecision();addLog('mission','迎撃実行 / 目標残存 '+S.defense.enemy.hp);}
  if(S.defense.status==='victory'){S.mission.phase=6;if(!S.ops.missionAwarded){S.ops.missions++;S.ops.missionAwarded=true;}addLog('mission','迎撃完了 / 作戦記録を保存');}
 }
 sound('ok');draw();
});
$('missionReset').addEventListener('click',()=>openAlertReview('end'));
