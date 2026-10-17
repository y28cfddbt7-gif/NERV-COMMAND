// Preserve v2.6 tactical fields for old saves; replace the UI with guided staff orders.
const v26DefaultTactics=()=>({attacker:1,defender:0,posture:'balanced',charge:0,heat:0,scans:0,shots:0,history:[]});
S.tactics={...v26DefaultTactics(),...(S.tactics&&typeof S.tactics==='object'?S.tactics:{})};
for(const role of ['attacker','defender']){if(![0,1,2].includes(Number(S.tactics[role])))S.tactics[role]=role==='attacker'?1:0;else S.tactics[role]=Number(S.tactics[role]);}
if(S.tactics.attacker===S.tactics.defender)S.tactics.defender=(S.tactics.attacker+1)%3;
S.tactics.charge=Math.min(100,Math.max(0,Number(S.tactics.charge)||0));S.tactics.heat=Math.min(100,Math.max(0,Number(S.tactics.heat)||0));
if(S.mission.phase>=5&&!S.tactics.charge&&!S.tactics.shots)S.tactics.charge=80;
function staffInvalidateDecision(){S.magi.approvedFor=null;S.magi.vote=null;S.magi.interceptApproval=null;if(S.defense){S.defense.magivote=null;S.defense.magiround=-1;}}
function staffMagiRequest(purpose){S.magi.purpose=purpose;if(purpose==='intercept')S.selectedEva=S.tactics.attacker;go('magi');}
if(qs('#staffAttackUnit')){
 $('staffAttackUnit').addEventListener('change',event=>{if(S.defense?.connected&&typeof S.evas[S.tactics.attacker].umbilical!=='boolean')S.evas[S.tactics.attacker].umbilical=true;S.tactics.attacker=Number(event.target.value);if(S.defense)S.defense.connected=!!S.evas[S.tactics.attacker].umbilical;if(S.tactics.defender===S.tactics.attacker)S.tactics.defender=(S.tactics.attacker+1)%3;staffInvalidateDecision();addLog('mission','攻撃担当をUNIT-0'+S.tactics.attacker+'に変更');draw();});
 $('staffMissionMagi').addEventListener('click',()=>staffMagiRequest('intercept'));
 // Retain the existing alignment: the field is a child of the artwork rig.
 qs('#evaSvg .eva-reference-rig').insertAdjacentHTML('beforeend','<div class="v26-at-field" aria-hidden="true"><svg viewBox="0 0 200 200"><polygon class="at-shell outer" points="42,1 158,1 199,42 199,158 158,199 42,199 1,158 1,42"/><polygon class="at-shell inner" points="58,38 142,38 162,58 162,142 142,162 58,162 38,142 38,58"/></svg><strong>A.T.FIELD / DEPLOYED</strong></div>');
}
