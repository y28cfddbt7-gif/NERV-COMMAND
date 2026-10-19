// TV-era named Angels; threat values and repeat encounters are original simulation rules.
const angelProfiles={
 sachiel:{id:'sachiel',name:'サキエル',number:3,code:'SACHIEL-03',bearing:'北東',hp:145,force:31,dist:6,lane:1,feature:'白い仮面・赤いコア / 接近型',tactic:'接近してA.T.を中和し、コアへ攻撃。通常武器でも撃破可能。'},
 shamshel:{id:'shamshel',name:'シャムシェル',number:4,code:'SHAMSHEL-04',bearing:'北西',hp:132,force:38,dist:5,lane:0,feature:'長い胴体と二本の光の鞭',tactic:'中距離は光の鞭の射程。A.T.を展開し、接近・中和後にコアを狙う。'},
 ramiel:{id:'ramiel',name:'ラミエル',number:5,code:'RAMIEL-05',bearing:'東側',hp:155,force:46,dist:6,lane:2,feature:'青い正八面体 / 高出力加粒子砲',tactic:'近接は高出力射界に阻まれる。外部給電・二段階充填・承認を経て陽電子狙撃。'}
};
function currentAngel(state=S){const a=state.world?.angels?.active;return a&&a.caseNo===state.defense.caseNo?angelProfiles[a.id]||null:null;}
const v215PriorProfile=v27Profile;
v27Profile=function(){return currentAngel()||v215PriorProfile();};
const v215PriorDetect=v27Detect;
v27Detect=function(){const a=S.world?.angels?.active;if(a&&a.caseNo!==S.defense.caseNo+1&&S.defense.status!=='active')S.world.angels.active=null;return v215PriorDetect();};
function angelStart(state,id){
 const w=state.world,p=angelProfiles[id];if(state!==S||!p)throw Error('対応する使徒を選択してください');if(state.defense.status==='active')throw Error('現在の防衛作戦を先に完了してください');
 if(worldObserve(state).magiHold||w.security?.case)throw Error('MAGI保守・保安案件を先に引き継いでください');
 w.angels.sequence++;w.angels.active={id,caseNo:state.defense.caseNo+1,stage:'detected',startedTick:w.tick,serial:w.angels.sequence};
 v27Detect();state.defense.last='第'+p.number+'使徒 '+p.name+' 接近。対象解析とEVA運用を開始してください。';worldLog(w,'使徒接近','第'+p.number+'使徒 '+p.name+' / '+p.tactic,'angel-'+w.angels.sequence);worldCommunication(w,'葛城ミサト / 戦術作戦部','パターン青。'+p.name+'の迎撃へ。担当機と装備を確認して、承認手順どおりに進めて。','angel-'+w.angels.sequence);cancelSequence();staffInvalidateDecision();
}
const v215PriorAngelDispatch=worldDispatch;
worldDispatch=function(state,action){if(!action.startsWith('angel.'))return v215PriorAngelDispatch(state,action);const [,op,id]=action.split('.');if(op==='start')return angelStart(state,id);if(op==='toggle'){state.world.angels.auto=!state.world.angels.auto;state.world.angels.nextDueTick=state.world.tick+120;return;}throw Error('使徒監視の操作を確認してください');};
const v215PriorAngelAdvance=worldAdvance;
worldAdvance=function(state,now){const changed=v215PriorAngelAdvance(state,now),w=state.world,a=w?.angels;if(changed&&state===S&&a?.auto&&w.tick>=a.nextDueTick&&state.defense.status==='idle'&&!w.security?.case&&!w.magiOps?.active&&!worldActiveIncident(w)&&!worldObserve(state).magiHold&&state.infra.power&&state.infra.comms){angelStart(state,Object.keys(angelProfiles)[a.sequence%3]);a.nextDueTick=w.tick+180;}return changed;};
const v215PriorAngelConditions=evaCombatConditions;
evaCombatConditions=function(action){const errors=v215PriorAngelConditions(action);if(currentAngel()?.id==='ramiel'&&['approach','neutralize','knife','rifle'].includes(action))errors.push('ラミエルの高出力射界 / 遠距離のポジトロンライフルを選択');return errors;};
const v215PriorAngelForecast=defenseForecast;
defenseForecast=function(){const result=v215PriorAngelForecast(),a=currentAngel();if(a&&S.defense.status==='active')result.damage=a.id==='ramiel'?0:Math.round(result.damage*.35);return result;};
const v215PriorAngelTurn=v27Advance;
v27Advance=function(){const d=S.defense,before=d.round,a=currentAngel(),unit=S.tactics.attacker,range=evaCombatState().range;v215PriorAngelTurn();if(a?.id==='shamshel'&&d.round>before&&d.status==='active'&&range===2&&S.evas[unit].state==='DEPLOYED'){const e=S.evas[unit],parts=['head','torso','leftArm','rightArm','leftLeg','rightLeg'];if(!worldObject(e.damage))e.damage=Object.fromEntries(parts.map(p=>[p,0]));e.damage.leftArm=Math.min(100,(Number(e.damage.leftArm)||0)+(e.at?2:5));e.damageSource='シャムシェルの光の鞭 / 作中使徒の独自戦闘モデル';v27Record('光の鞭が中距離へ到達 / UNIT-0'+unit+' 左腕損傷 '+e.damage.leftArm+'%');}};
const v215PriorAngelFinish=v27Finish;
v27Finish=function(won,why){const a=currentAngel(),active=S.defense.status==='active';v215PriorAngelFinish(won,why);if(a&&active){const w=S.world,c=w.angels.active;c.stage=won?'victory':'defeat';const id=c.serial+'-'+a.id;if(!w.angels.history.some(x=>x.id===id))w.angels.history.unshift({id,angel:a.id,name:a.name,caseNo:c.caseNo,result:c.stage,tick:w.tick,weapon:S.defense.lastAttackSource||'city'});w.angels.history=w.angels.history.slice(0,6);w.angels.nextDueTick=w.tick+180;worldLog(w,'使徒作戦記録',a.name+' / '+(won?'目標沈黙':'作戦中断・復旧が必要'),id);}};
const v215PriorAngelRecovery=recoveredStaffState;
recoveredStaffState=function(previous){const next=v215PriorAngelRecovery(previous);if(next.world?.angels){next.world.angels.active=null;next.world.angels.nextDueTick=next.world.tick+120;}return next;};
