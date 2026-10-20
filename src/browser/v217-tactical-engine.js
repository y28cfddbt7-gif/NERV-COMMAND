// Turn-based field control. All values are original local simulation rules.
// World/power time is never tied to animation time. Existing classic routes remain.
function tacticalActive(){const t=S.evaCombat?.tactical;return t?.schema===1&&t.enabled===true&&t.caseNo===S.defense?.caseNo&&t.unit===S.tactics?.attacker;}
function tacticalState(){return tacticalActive()?S.evaCombat.tactical:null;}
function tacticalThreat(t=tacticalState()){const p=t?.enemyPlan;return !!p&&p.columns.includes(t.pos.col)&&p.rows.includes(t.pos.row);}
function tacticalPlan(t){const id=currentAngel()?.id,col=t.pos.col;return {round:S.defense.round+1,columns:id==='shamshel'?[col,(col+1)%3]:[col],rows:id==='ramiel'?[1,2,3]:[1,2],name:id==='ramiel'?'加粒子砲 / 直線射界':id==='shamshel'?'光の鞭 / 二列薙ぎ払い':'接近打撃 / 前方二列'};}
function tacticalActivate(){
 if(S.evaCombat?.tactical?.schema>1)throw Error('新しい戦術データです。対応版で開いてください。');
 if(S.defense.status!=='active')throw Error('交戦対象が必要です');
 if(tacticalActive())return;
 const c=evaCombatState(),unit=S.tactics.attacker,e=S.evas[unit];
 const t={schema:1,enabled:true,caseNo:S.defense.caseNo,unit,pos:{col:1,row:c.range},aim:null,support:false,guardUntil:-1,focus:0,stats:{moves:0,hits:0,misses:0,evades:0},last:'戦術管制開始 / 都市援護射撃は保留'};
 t.enemyPlan=tacticalPlan(t);c.tactical=t;S.evaCombat=c;
 if(!Number.isFinite(e.tacticalIntegrity)){const damage=worldObject(e.damage)?Object.values(e.damage).filter(Number.isFinite):[];e.tacticalIntegrity=v27Clamp(100-Math.max(0,...damage));}
 e.powerUpdatedAt=Date.now();v27Record(t.last);
}
function tacticalValidate(t){
 if(!t||![0,1,2].includes(t.pos?.col)||![1,2,3].includes(t.pos?.row)||!Array.isArray(t.enemyPlan?.columns)||!Array.isArray(t.enemyPlan?.rows)||!t.stats||!['moves','hits','misses','evades'].every(k=>Number.isFinite(t.stats[k])&&t.stats[k]>=0))throw Error('戦術記録を読み取れません。警報確認からバックアップ付き復旧を実施してください。');
}
function tacticalPoint(col,row){return {x:.5+(col-1)*(.17+row*.045),y:.34+row*.17};}
function tacticalTarget(){return {x:.5,y:.19};}
function tacticalRadius(){return ({knife:.095,rifle:.06,positron:.043}[armamentSelected]||.06)+(tacticalState()?.focus||0)*.012;}
const v217PriorForecast=defenseForecast;
defenseForecast=function(){
 const f=v217PriorForecast();if(!tacticalActive()||tacticalState().support)return f;
 const d=S.defense,enemy=d.enemy,sector=enemy?((d.round+1)%3===0?3:enemy.lane):null;let loss=0;
 if(enemy&&enemy.dist<=2&&enemy.hp>0){const c=d.city[sector],defender=S.evas[S.tactics.defender],guard=defender?.state==='DEPLOYED'&&defender.at&&evaMapSector(S.tactics.defender)===sector?12:0;loss=Math.min(c.hp,Math.max(5,Math.round(Math.max(5,enemy.force-(c.armor?13:0)-(S.infra.armor?5:0)-guard)*f.rule.loss)));}
 return {...f,energy:v27Clamp(d.energy+(S.infra.power?7:0)),damage:0,shots:0,sector,loss};
};
const v217PriorTurn=v27Advance;
v27Advance=function(){
 if(!tacticalActive()||S.defense.status!=='active')return v217PriorTurn();
 const t=tacticalState();tacticalValidate(t);const before=S.defense.round,e=S.evas[t.unit],threat=tacticalThreat(t),cover=t.pos.row===2&&t.pos.col!==1,guard=t.guardUntil>=before+1;
 v217PriorTurn();if(S.defense.round===before)return;
 let loss=0;
 if(threat){loss=Math.max(2,Math.round(S.defense.enemy.force*.64*(cover?.55:1)*(guard?.25:e.at?.8:1)));e.tacticalIntegrity=Math.max(0,(Number.isFinite(e.tacticalIntegrity)?e.tacticalIntegrity:100)-loss);const parts=['head','torso','leftArm','rightArm','leftLeg','rightLeg'];if(!worldObject(e.damage))e.damage=Object.fromEntries(parts.map(p=>[p,0]));e.damage.torso=Math.min(100,(Number(e.damage.torso)||0)+loss);e.damageSource='予告射界への被弾 / 戦術シミュレーション';t.last=(guard?'A.T.防御':cover?'建物遮蔽':'被弾')+' / 機体損傷 '+loss+' / 健全性 '+e.tacticalIntegrity;}
 else{t.stats.evades++;t.last='予告攻撃を回避 / 機体損傷なし';}
 t.lastTurn={round:S.defense.round,threat,cover,guard,loss,columns:[...t.enemyPlan.columns],rows:[...t.enemyPlan.rows]};
 t.aim=null;t.focus=0;t.guardUntil=-1;t.enemyPlan=tacticalPlan(t);e.powerUpdatedAt=Date.now();v27Record(t.last);
 if(e.tacticalIntegrity<=0&&S.defense.status==='active')v27Finish(false,'攻撃担当EVAが行動不能 / 回収・整備が必要');
};
function tacticalReady(){
 const errors=[];if(S.defense.status!=='active')errors.push('交戦は終了しています');
 if(!tacticalActive())errors.push('戦術操作へ移行してください');
 if(!S.infra.power||!S.infra.comms)errors.push('電源・通信を復旧');
 if(worldMagiLimited()||magiIntrusionActive()||securityHold())errors.push('保安・MAGIの保留を解消');
 if((S.evas[S.tactics.attacker].tacticalIntegrity??100)<=0)errors.push('機体が行動不能。回収・整備が必要');
 if(S.evas[S.tactics.attacker].state!=='DEPLOYED')errors.push('出撃または外部給電を確認');
 if(tacticalActive()){try{tacticalValidate(tacticalState());}catch(e){errors.push(e.message);}}
 return errors;
}
function tacticalCost(power,energy){const e=S.evas[S.tactics.attacker];if(S.defense.energy<energy)throw Error('都市電力 '+energy+' が必要');if(!evaExternalPower(S.tactics.attacker)&&e.power<power+10)throw Error('内部電源 '+(power+10)+'秒が必要。外部給電を接続してください');S.defense.energy-=energy;if(!evaExternalPower(S.tactics.attacker))e.power-=power;}
function tacticalFireErrors(){const errors=evaCombatConditions(armamentSelected).filter(s=>s!=='現ターンのMAGI戦術承認');const t=tacticalState();if(!t?.aim||t.aim.round!==S.defense.round||t.aim.weapon!==armamentSelected)errors.push('コアをタップして照準を指定');return errors;}
async function tacticalCommand(action,payload={}){
 const before={hp:S.defense.enemy?.hp||0,round:S.defense.round,caseNo:S.defense.caseNo,weapon:armamentSelected,sync:S.evas[S.tactics.attacker].sync,scans:S.defense.scans};let detail=null;
 const result=await commandOperation(()=>{
  if(action==='start'){angelStart(S,payload.angel);tacticalActivate();return;}
  if(action==='activate'){tacticalActivate();return;}
  if(action==='cable'){
   const e=S.evas[S.tactics.attacker];if(!['DEPLOYED','POWER_LOST'].includes(e.state)||!S.infra.power||!S.infra.comms)throw Error('出撃機と主電源・通信を確認');
   if(!evaExternalPower(S.tactics.attacker)||e.state==='POWER_LOST')toggleEvaCable(S.tactics.attacker);
   return;
  }
  const errs=tacticalReady();if(errs.length)throw Error(errs.join(' / '));
  const t=tacticalState(),c=evaCombatState(),d=S.defense,e=S.evas[S.tactics.attacker];
  if(action==='aim'){
   if(d.scans<34)throw Error('対象を解析してコアを特定してください');
   if(!Number.isFinite(payload.x)||!Number.isFinite(payload.y)||payload.x<0||payload.x>1||payload.y<0||payload.y>1)throw Error('照準座標が不正です');
   t.aim={x:payload.x,y:payload.y,round:d.round,weapon:armamentSelected};return;
  }
  if(action==='move'){
   const {col,row}=payload;if(![0,1,2].includes(col)||![1,2,3].includes(row)||Math.max(Math.abs(col-t.pos.col),Math.abs(row-t.pos.row))!==1)throw Error('隣接する区画へドラッグしてください');
   if(currentAngel()?.id==='ramiel'&&row<2)throw Error('加粒子砲の近接禁制域です。中・遠距離を維持');
   tacticalCost(8,4);t.pos={col,row};c.range=row;t.stats.moves++;t.aim=null;S.evaCombat=c;v27Record('EVA移動 / '+['西','中央','東'][col]+'・距離 '+row);v27Advance();return;
  }
  if(action==='support'){t.support=!t.support;v27Record('都市援護射撃 '+(t.support?'許可':'保留'));return;}
  if(action==='wait'){tacticalCost(0,0);v27Record('待機 / 敵の行動を監視');v27Advance();return;}
  if(action==='guard'){tacticalCost(0,6);e.at=true;t.guardUntil=d.round+1;v27Record('A.T.防御姿勢 / 次の一撃を軽減');v27Advance();return;}
  if(action==='focus'){tacticalCost(0,0);t.focus=Math.min(2,t.focus+1);const focus=t.focus;v27Record('狙撃姿勢を固定 / 敵行動あり');v27Advance();t.focus=focus;return;}
  if(action==='scan'||action==='at'||action==='neutralize'){applyEvaCombatAction(action);return;}
  if(action==='supply'||action==='charge'){applyHighPowerCombatAction(action==='supply'?'positronSupply':'positronCharge');return;}
  if(action!=='fire')throw Error('不明な戦術操作');
  const blockers=tacticalFireErrors();if(blockers.length)throw Error(blockers.join(' / '));
  // Approval is a real current-turn MAGI vote, not an unconditional bypass.
  if(!combatApproved())applyEvaCombatAction('authorize');
  const target=tacticalTarget(),hit=Math.hypot(t.aim.x-target.x,t.aim.y-target.y)<=tacticalRadius();
  const from=tacticalPoint(t.pos.col,t.pos.row),to={x:t.aim.x,y:t.aim.y};
  if(hit){t.stats.hits++;if(armamentSelected==='positron')applyHighPowerCombatAction('positron');else applyEvaCombatAction(armamentSelected);}
  else{
   const w=evaCombatWeapons[armamentSelected];if(w){tacticalCost(w.power,w.energy);if(armamentSelected==='rifle')c.ammo--;}else{tacticalCost(0,40);c.positronCharge=0;}
   c.attacks++;c.approval=null;t.stats.misses++;S.evaCombat=c;d.lastAttackSource='eva-miss';v27Record('照準外 / '+armamentSelected+' / 攻撃は外れました');v27Advance();
  }
  t.aim=null;detail={weapon:before.weapon,hit,from,to,damage:hit?Math.min(before.hp,Math.round(before.weapon==='knife'?52+before.sync*.22:before.weapon==='rifle'?30+before.scans*.18+before.sync*.08:200+before.scans*.4+before.sync*.2)):0,remaining:d.enemy.hp,caseNo:d.caseNo};
 });
 if(result.ok){
  if(detail)window.dispatchEvent(new CustomEvent('nerv-tactical-shot',{detail}));
  if(S.defense.caseNo===before.caseNo&&S.defense.round>before.round)window.dispatchEvent(new CustomEvent('nerv-tactical-turn',{detail:{...tacticalState()?.lastTurn}}));
 }
 return result;
}
const v217Recovered=recoveredStaffState;
recoveredStaffState=function(previous){const next=v217Recovered(previous);if(next.evaCombat)delete next.evaCombat.tactical;for(const e of next.evas)delete e.tacticalIntegrity;return next;};
window.NERV_TACTICAL={act:tacticalCommand,snapshot:()=>({active:tacticalActive(),state:tacticalState()?JSON.parse(JSON.stringify(tacticalState())):null,errors:tacticalReady(),fireErrors:tacticalFireErrors(),target:tacticalTarget(),radius:tacticalRadius(),turnSeconds:10,ownRAF:false})};

// Classic UI can inspect this case, but cannot bypass a manual shot or move
// the distance without moving the shared field position.
const v217ClassicCombat=evaCombatAction;
evaCombatAction=async function(action){
 if(!tacticalActive())return v217ClassicCombat(action);
 if(['knife','rifle','positron'].includes(action)){
  if(action!==armamentSelected)return {ok:false,error:'戦術盤で装備と照準を確認してください'};
  return tacticalCommand('fire');
 }
 if(action==='approach'){toast('戦闘専用画面の機体をドラッグして移動してください');return {ok:false,error:'戦術盤で移動してください'};}
 if(['scan','at','neutralize'].includes(action))return tacticalCommand(action);
 if(action==='positronCharge'||action==='positronSupply')return tacticalCommand(action==='positronCharge'?'charge':'supply');
 return v217ClassicCombat(action);
};
if(window.NERV_OPERATIONS)window.NERV_OPERATIONS.combat=evaCombatAction;
