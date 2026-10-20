// Extend the existing combat resolver; old knife/rifle/city-defense rules are retained.
let armamentSelected='knife';
const v212PreviousCombat=evaCombatAction,v212PreviousConditions=evaCombatConditions;
// A small, explicitly simulated contact-damage report accompanies a real enemy turn.
// It does not replace the original city-defense resolver or invent injuries while idle.
const v212PreviousAdvance=v27Advance;
v27Advance=function(){
 const before=S.defense.round,unit=S.tactics.attacker,c=evaCombatState(),contact=S.defense.status==='active'&&c.range===1&&S.evas[unit].state==='DEPLOYED';
 v212PreviousAdvance();
 const d=S.defense,e=S.evas[unit];
 if(!(typeof tacticalActive==='function'&&tacticalActive())&&contact&&d.status==='active'&&d.round>before&&d.enemy.hp>0&&d.enemy.dist<=2){
  const parts=['head','torso','leftArm','rightArm','leftLeg','rightLeg'],part=parts[(d.round+unit)%parts.length],damage=e.damage&&typeof e.damage==='object'&&!Array.isArray(e.damage)?{...e.damage}:Object.fromEntries(parts.map(p=>[p,0]));
  const old=Math.max(0,Math.min(100,Number(damage[part])||0)),amount=Math.max(1,Math.round(d.enemy.force/(e.at?16:8)));
  if(old<20){damage[part]=Math.min(20,old+amount);e.damage=damage;e.damageSource='近接戦闘からの軽微損傷推定 / SIM';addLog('eva','UNIT-0'+unit+' / 接触損傷報告 '+part+' '+damage[part]+'% / 整備時に確認');}
 }
};
const v212PreviousRecovery=recoveredStaffState;
recoveredStaffState=function(previous){const next=v212PreviousRecovery(previous);if(next.evaCombat){next.evaCombat.positronCharge=0;next.evaCombat.positronUnit=null;next.evaCombat.positronRound=null;}for(const e of next.evas)if(e.damage){e.damage=Object.fromEntries(Object.keys(e.damage).map(k=>[k,0]));e.damageSource='明示的な全系統復旧 / SIM';}return next;};

const v212PreviousCombatState=evaCombatState;
evaCombatState=function(){const state=v212PreviousCombatState();if(S.evaCombat?.caseNo!==S.defense.caseNo){state.positronCharge=0;state.positronUnit=null;state.positronRound=null;}return state;};
function positronChargeState() {
 const c=evaCombatState();
 return S.evaCombat?.caseNo===S.defense.caseNo&&c.positronUnit===S.tactics.attacker&&Number.isFinite(c.positronRound)&&S.defense.round-c.positronRound<=3?Math.max(0,Math.min(100,Number(c.positronCharge)||0)):0;
}
evaCombatConditions=function(action) {
 if(action==='positronSupply'){const errors=combatBasics();if(S.defense.spares<1)errors.push('予備送電枠が必要');if(S.defense.energy>=100)errors.push('都市電力は充足しています');return errors;}
 if(!['positronCharge','positron'].includes(action))return v212PreviousConditions(action);
 const errors=combatBasics(),charge=positronChargeState(),cost=action==='positronCharge'?22:40;
 if(!evaExternalPower(S.tactics.attacker))errors.push('担当機のアンビリカルを接続 / 特別高出力送電');
 if(S.defense.scans<68)errors.push('対象を2回解析 / 解析68以上');
 if(S.defense.energy<cost)errors.push('都市電力'+cost+'必要');
 if(action==='positronCharge'&&charge>=100)errors.push('充填は完了しています');
 if(action==='positron'&&charge<100)errors.push('2段階充填を完了 / '+charge+'%');
 if(action==='positron'&&!combatApproved())errors.push('現ターンのMAGI戦術承認');
 return errors;
};
function applyHighPowerCombatAction(action){
  const errors=evaCombatConditions(action);if(errors.length)throw Error(errors.join(' / '));
  if(action==='positronSupply'){v27Power();return;}
  const d=S.defense,c=evaCombatState(),charge=positronChargeState();
  c.positronUnit=S.tactics.attacker;c.approval=null;
  if(action==='positronCharge') {
   d.energy-=22;c.positronCharge=Math.min(100,charge+50);c.positronRound=d.round+1;
   S.evaCombat=c;v27Record('ポジトロンライフル / 特別送電・充填 '+c.positronCharge+'%');v27Advance();
  } else {
   d.energy-=40;const damage=Math.round(200+d.scans*.4+S.evas[S.tactics.attacker].sync*.2);
   d.enemy.hp=Math.max(0,d.enemy.hp-damage);d.lastAttackSource='eva-positron';c.positronCharge=0;c.attacks++;
   S.evaCombat=c;v27Record('UNIT-0'+S.tactics.attacker+' / ポジトロンライフル / '+damage+' DAMAGE');addLog('eva','高出力陽電子射撃 / '+damage+' DAMAGE');
   if(d.enemy.hp<=0){evaCombatFinishing=true;try{v27Finish(true,'EVA高出力陽電子射撃で目標を撃破');}finally{evaCombatFinishing=false;}}
   else v27Advance();
  }
}
evaCombatAction=async function(action) {
 const before={hp:S.defense.enemy?.hp||0,caseNo:S.defense.caseNo,unit:S.tactics.attacker,sync:S.evas[S.tactics.attacker].sync,scans:S.defense.scans};
 const result=['positronSupply','positronCharge','positron'].includes(action)?await commandOperation(()=>{
  applyHighPowerCombatAction(action);
 }):await v212PreviousCombat(action);
 if(result.ok&&before.hp>0&&S.defense.enemy?.hp<before.hp&&['knife','rifle','positron'].includes(action)&&S.defense.caseNo===before.caseNo&&S.defense.lastAttackSource==='eva-'+action) {
  const raw=action==='knife'?Math.round(52+before.sync*.22):action==='rifle'?Math.round(30+before.scans*.18+before.sync*.08):Math.round(200+before.scans*.4+before.sync*.2);
  window.dispatchEvent(new CustomEvent('nerv-confirmed-hit',{detail:{weapon:action,unit:before.unit,caseNo:before.caseNo,damage:Math.min(before.hp,raw),remaining:S.defense.enemy.hp,maxHp:S.defense.enemy.maxHp}}));
 }
 return result;
};
function renderArmament() {
 if(!$('armamentPlate'))return;
 const c=evaCombatState(),positron=armamentSelected==='positron',name={knife:'プログレッシブナイフ',rifle:'パレットライフル',positron:'ポジトロンライフル'}[armamentSelected];
 if($('armamentPlate').dataset.weapon!==armamentSelected){$('armamentPlate').innerHTML=nervWeaponPlate(armamentSelected);$('armamentPlate').dataset.weapon=armamentSelected;const small=$('armamentControlPlate');if(small)small.innerHTML=nervWeaponPlate(armamentSelected).replaceAll('weaponPlateGrid','weaponControlGrid');}
 all('[data-armament]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.armament===armamentSelected)));
 meteoText('armamentName',name);meteoText('armamentSupply','UNIT-0'+S.tactics.attacker+' / '+(evaExternalPower(S.tactics.attacker)?'EXT':'INT')+' / ENERGY '+S.defense.energy+'%');
 const info={knife:'高周波振動刃。近接し、A.T.を中和してコアを攻撃。',rifle:'実体弾。敵A.T.の中和中に射撃。残弾 '+c.ammo+'/6。',positron:'外部給電・2段階充填で敵A.T.を貫通。充填 '+positronChargeState()+'% / 有効3ターン。'};
 meteoText('armamentDescription',info[armamentSelected]);
 const errors=evaCombatConditions(armamentSelected);$('armamentFire').disabled=!!errors.length;$('armamentFire').textContent=name+'で攻撃';
 meteoText('armamentRequirements',errors.length?'必要：'+errors.join(' / '):'条件成立 / 攻撃を実行できます。');
 $('positronSupply').hidden=!positron;$('positronSupply').disabled=!!evaCombatConditions('positronSupply').length;$('positronCharge').hidden=!positron;$('positronCharge').disabled=!!evaCombatConditions('positronCharge').length;
 $('armamentPlate').dataset.charged=String(positron&&positronChargeState()===100);$('armamentControlPlate').dataset.charged=$('armamentPlate').dataset.charged;
}
function initV212Combat() {
 if(!qs('#staffSupport')||!$('evaEngagePanel'))return;
 const panel=document.createElement('section');panel.className='mobile-view';panel.dataset.view='armament';panel.id='armamentPanel';
 panel.innerHTML='<div class="staff-panel"><div class="staff-panel-title"><h2>携行兵装 / ARMAMENT</h2><b>SIM</b></div><div class="armament-picker"><button data-armament="knife">ナイフ</button><button data-armament="rifle">パレット</button><button data-armament="positron">ポジトロン</button></div><div id="armamentPlate"></div><h3 id="armamentName"></h3><p id="armamentSupply" class="staff-note"></p><p id="armamentDescription" class="staff-guide"></p><p id="armamentRequirements" class="staff-note" role="status"></p><button id="positronCharge" class="staff-secondary">特別送電・充填 / 電力22・1ターン</button><button class="staff-secondary" data-combat="authorize">現ターンのMAGI戦術承認</button><button id="armamentFire" class="staff-primary">攻撃</button><div class="ops-route-grid"><button data-ops-route="mission/combat">接近・A.T.中和 ↗</button><button data-ops-route="eva/readiness" id="armamentPowerLink">外部給電へ ↗</button></div></div>';
 qs('.page[data-page="mission"]').append(panel);registerTerminalView('mission','armament','携行兵装');
 const control=document.createElement('section');control.className='mobile-view';control.dataset.view='weapon-control';control.id='weaponControlPanel';control.innerHTML='<div class="staff-panel"><div class="staff-panel-title"><h2>携行兵装 / 使用指示</h2><b>SIM</b></div><div id="armamentControlPlate"></div><div id="weaponPowerActions" class="weapon-power-actions"></div></div>';
 qs('.page[data-page="mission"]').append(control);registerTerminalView('mission','weapon-control','武器使用');
 const commands=control.querySelector('.staff-panel');commands.insertBefore($('armamentRequirements'),$('weaponPowerActions'));
 const supply=document.createElement('button');supply.id='positronSupply';supply.className='staff-secondary';supply.textContent='補助送電 / 予備枠1・電力+38';supply.addEventListener('click',()=>evaCombatAction('positronSupply'));$('weaponPowerActions').append(supply,$('positronCharge'),panel.querySelector('[data-combat="authorize"]'));commands.append($('armamentFire'),panel.querySelector('.ops-route-grid'));
 const use=document.createElement('button');use.className='staff-primary';use.dataset.opsRoute='mission/weapon-control';use.textContent='選択武器の使用条件・攻撃へ ↗';panel.querySelector('.staff-panel').append(use);

 all('[data-armament]').forEach(b=>b.addEventListener('click',()=>{armamentSelected=b.dataset.armament;renderArmament();window.dispatchEvent(new CustomEvent('nerv-equipment-selected',{detail:{weapon:armamentSelected}}));}));
 $('armamentFire').addEventListener('click',()=>evaCombatAction(armamentSelected));$('positronCharge').addEventListener('click',()=>evaCombatAction('positronCharge'));
 $('armamentPowerLink').addEventListener('click',()=>{S.selectedEva=S.tactics.attacker;renderEVA();});
 for(const target of [$('evaEngagePanel'),$('evaCombatPanel')]){const b=document.createElement('button');b.className='staff-secondary';b.dataset.opsRoute='mission/armament';b.textContent='武器のイメージ・ナイフ・ポジトロン ↗';target.append(b);}
 const oldDraw=draw;draw=function(){oldDraw();renderArmament();};window.addEventListener('nerv-route',()=>renderArmament());
 window.NERV_OPERATIONS.combat=evaCombatAction;window.NERV_OPERATIONS.combatConditions=evaCombatConditions;
 $('evaMaintain').addEventListener('click',event=>{if(selected().state!=='MAINTENANCE')return;event.stopImmediatePropagation();const unit=S.selectedEva;commandOperation(()=>{const e=S.evas[unit];if(e.state!=='MAINTENANCE')throw Error('整備対象を再確認してください');e.state='HANGAR';e.power=300;delete e.tacticalIntegrity;e.powerUpdatedAt=null;e.at=false;if(e.damage)e.damage=Object.fromEntries(Object.keys(e.damage).map(k=>[k,0]));e.damageSource='整備完了・部位確認済み / SIM';addLog('eva','UNIT-0'+unit+' / MAINTENANCE COMPLETED / 部位報告更新');});},true);
 const restore=()=>{if(['#mission/armament','#mission/weapon-control'].includes(location.hash))window.NERV_MOBILE.open('mission',location.hash.split('/')[1]);};window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);restore();renderArmament();
}
initV212Combat();
