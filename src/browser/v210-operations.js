// v2.10 adds ordinary EVA combat and external MAGI defense to the 07f2242 workflow.
// Numerical combat/firewall rules below are local game design, not canonical specifications.
let commandOperationsBusy=false,evaCombatFinishing=false;
const v210PriorFinish=v27Finish;
v27Finish=function(won,why){if(S.defense.status==='active'&&won)S.defense.victoryCause=evaCombatFinishing?S.defense.lastAttackSource:'support';v210PriorFinish(won,why);};
const externalCoreNames=['MELCHIOR-1','BALTHASAR-2','CASPER-3'];
function externalMagiState(){
 const raw=S.magi.externalDefense||{};
 return {status:'idle',caseNo:0,turn:0,budget:100,analysis:0,pressure:[20,12,8],hold:0,selected:0,resolved:0,failures:0,message:'外部侵入なし。666プロテクトは外部からのハッキングに使用します。',...raw,pressure:[0,1,2].map(i=>v27Clamp(raw.pressure?.[i]??[20,12,8][i]))};
}
function externalMagiActive(){return ['detected','analyzed','protected','failed'].includes(externalMagiState().status);}
const v210PriorIntrusionActive=magiIntrusionActive;
magiIntrusionActive=function(){return v210PriorIntrusionActive()||externalMagiActive();};
const v210PriorRecoveredState=recoveredStaffState;
recoveredStaffState=function(previous){
 const next=v210PriorRecoveredState(previous);
 if(next.magi.externalDefense)next.magi.externalDefense={...next.magi.externalDefense,status:'idle',turn:0,budget:100,analysis:0,pressure:[0,0,0],hold:0,message:'明示的な警報クリア / 外部侵入を終了'};
 if(next.evaCombat)next.evaCombat={...next.evaCombat,approval:null};
 return next;
};
const v210PriorTerminalAlert=terminalAlert;
terminalAlert=function(){
 const alert=v210PriorTerminalAlert();
 if(externalMagiActive()&&['magi-intrusion','enemy-'+S.defense.caseNo,'mission','nominal'].includes(alert.key))return {level:'critical',key:'external-magi-'+externalMagiState().caseNo,title:'MAGI 外部ハッキング',message:'外部防御で666プロテクトを構築し、三基への侵入を遮断してください。通常審議を停止しています。',page:'magi'};
 return alert;
};
// Back up before the first extension mutation. Native persistence failures roll back the action.
async function commandOperation(change){
 if(commandOperationsBusy||recoveryBusy||sequenceBusy||staffServiceBusy)return {ok:false,error:'別の指示を処理中です'};
 commandOperationsBusy=true;recoveryBusy=true;
 const shell=$('shell');let previous=null;
 if(shell)shell.inert=true;
 try{
  if(!await backupVisualUpgrade())throw Error('変更前バックアップを保存できません');
  settleEvaPower();previous=JSON.parse(JSON.stringify(S));
  change();clearTimeout(saveTimeout);
  const result=await callNative('persist',{state:JSON.parse(JSON.stringify(S))});
  if(result?.error)throw Error(result.error);
  draw();return {ok:true};
 }catch(error){
  if(previous)S=previous;
  clearTimeout(saveTimeout);draw();clearTimeout(saveTimeout);
  toast('指示を中止：'+error.message);sound('deny');return {ok:false,error:error.message};
 }finally{commandOperationsBusy=false;recoveryBusy=false;if(shell)shell.inert=false;}
}
function evaCombatState(){
 const raw=S.evaCombat||{},same=raw.caseNo===S.defense.caseNo;
 return {...raw,caseNo:S.defense.caseNo,range:same?v27Clamp(raw.range??3,1,3):3,ammo:same?v27Clamp(raw.ammo??6,0,6):6,exposedUntil:same?(Number(raw.exposedUntil)||-1):-1,approval:same?raw.approval:null,attacks:same?(Number(raw.attacks)||0):0};
}
function combatBasics(){
 const d=S.defense,e=S.evas[S.tactics.attacker],errors=[];
 if(d.status!=='active')errors.push('敵性反応を検知');
 if(!S.infra.power)errors.push('都市主電源を復旧');
 if(!S.infra.comms)errors.push('作戦通信を復旧');
 if(magiIntrusionActive())errors.push('MAGI侵入を封じ込め');
 if(e.state!=='DEPLOYED')errors.push('担当機を発進準備→MAGI出撃承認→出撃');
 if(e.power<40&&!evaExternalPower(S.tactics.attacker))errors.push('外部給電または機体電力40秒以上を確保');
 if(d.scans<34)errors.push('対象を解析');
 return errors;
}
function combatApproved(){const a=evaCombatState().approval,d=S.defense;return a?.unit===S.tactics.attacker&&a?.caseNo===d.caseNo&&a?.round===d.round&&d.magivote?.filter(Boolean).length>=2&&d.magiround===d.round;}
const evaCombatWeapons={
 approach:{label:'接近 / APPROACH',detail:'間合い −1 / 機体8秒 / 都市電力4 / 1ターン',power:8,energy:4},
 neutralize:{label:'A.T.中和 / NEUTRALIZE',detail:'近接・A.T.展開が必要 / 機体20秒・電力12 / 1ターン',power:20,energy:12},
 knife:{label:'プログレッシブナイフ',detail:'近接・中和中にコア攻撃 / 機体12秒・電力8 / 1ターン',power:12,energy:8},
 rifle:{label:'パレットライフル',detail:'中和後に射撃 / 弾1・機体6秒・電力6 / 1ターン',power:6,energy:6}
};
function evaCombatConditions(action){
 const errors=combatBasics(),c=evaCombatState(),e=S.evas[S.tactics.attacker],w=evaCombatWeapons[action];
 if(!w)return errors;
 if(e.power<w.power+(typeof tacticalActive==='function'&&tacticalActive()?10:32)&&!evaExternalPower(S.tactics.attacker))errors.push('行動・敵ターン分の内部電源を確保');
 if(S.defense.energy<w.energy)errors.push('都市電力'+w.energy+'必要');
 if(action==='approach'&&c.range===1)errors.push('既に近接位置');
 if(action==='neutralize'){if(c.range>1)errors.push('近接位置へ接近');if(!e.at)errors.push('担当機のA.T.を展開');if(c.exposedUntil>S.defense.round)errors.push('中和は有効中');}
 if(['knife','rifle'].includes(action)&&!combatApproved())errors.push('現ターンのMAGI戦術承認');
 if(action==='knife'){if(c.range>1)errors.push('近接位置へ接近');if(!e.at)errors.push('担当機のA.T.を展開');if(c.exposedUntil<=S.defense.round)errors.push('敵A.T.を中和');}
 if(action==='rifle'){if(c.ammo<1)errors.push('弾倉を使い切りました。近接戦闘へ');if(c.exposedUntil<=S.defense.round)errors.push('敵A.T.が有効。先に近接して中和');}
 return errors;
}
async function evaCombatAction(action){return commandOperation(()=>applyEvaCombatAction(action));}
function applyEvaCombatAction(action){
 if(action==='detect'){if(S.defense.status==='active')throw Error('作戦は進行中です');v27Detect();S.evaCombat=evaCombatState();return;}
 if(action==='scan'){if(S.defense.status!=='active'||S.defense.scans>=100||S.defense.energy<12||!S.infra.power)throw Error('解析対象・都市電力12・主電源を確認');v27Scan();return;}
 const errors=combatBasics();if(errors.length)throw Error(errors.join(' / '));
 const c=evaCombatState(),d=S.defense,e=S.evas[S.tactics.attacker];
 if(action==='at'){if(e.power<10&&!evaExternalPower(S.tactics.attacker))throw Error('A.T.展開に必要な電源がありません');e.at=!e.at;addLog('eva','UNIT-0'+S.tactics.attacker+' / A.T. '+(e.at?'展開':'解除'));return;}
 if(action==='authorize'){
  v27Judge();if(d.magivote?.filter(Boolean).length<2)throw Error('MAGIが留保 / 解析・本部健全性・セキュリティを確認');
  c.approval={unit:S.tactics.attacker,caseNo:d.caseNo,round:d.round};S.evaCombat=c;addLog('magi','EVA通常武器 / UNIT-0'+S.tactics.attacker+' / 現ターン承認');return;
 }
 if(!evaCombatWeapons[action])throw Error('不明な戦闘指示');
 const blockers=evaCombatConditions(action);if(blockers.length)throw Error(blockers.join(' / '));
 const w=evaCombatWeapons[action];if(!evaExternalPower(S.tactics.attacker))e.power=Math.max(0,e.power-w.power);d.energy-=w.energy;
 if(action==='approach'){c.range--;v27Record('EVA接近 / 間合い '+c.range);}
 if(action==='neutralize'){c.exposedUntil=d.round+3;v27Record('UNIT-0'+S.tactics.attacker+' / A.T.中和成功：続く2行動が有効');}
 if(action==='knife'||action==='rifle'){
  const exposed=c.exposedUntil>d.round;
  const damage=action==='knife'?Math.round(52+e.sync*.22):Math.round(30+d.scans*.18+e.sync*.08);
  if(action==='rifle')c.ammo--;c.attacks++;c.approval=null;
  d.enemy.hp=Math.max(0,d.enemy.hp-damage);d.lastAttackSource='eva-'+action;
  v27Record('UNIT-0'+S.tactics.attacker+' / '+w.label+' / '+damage+' DAMAGE / 残 '+d.enemy.hp+(exposed?' / A.T.中和中':' / A.T.による減衰'));
  addLog('eva',w.label+' / '+damage+' DAMAGE');
 }
 S.evaCombat=c;sound(action==='approach'?'scan':'launch');
 if(d.enemy.hp<=0){evaCombatFinishing=true;try{v27Finish(true,'EVA通常武器でコアを破壊 / '+w.label);}finally{evaCombatFinishing=false;}}
 else v27Advance();
 window.dispatchEvent(new CustomEvent('nerv-combat-action',{detail:{action}}));
}
const externalActions={
 trace:{label:'侵入経路を解析',cost:12,hint:'解析 +50 / 三基への侵入圧 +16・14・12'},
 partition:{label:'選択コアの経路を隔離',cost:10,hint:'選択コア −35 / 他二基 +10'},
 compile:{label:'666プロテクトを構築',cost:30,hint:'解析100・三基の侵入圧90未満が必要'},
 maintain:{label:'遮断を維持',cost:8,hint:'全コア侵入圧 −30 / 3回維持で成功'},
 reboot:{label:'通常再起動',cost:8,hint:'外部経路に再接続 / 全コア+25・666解除（危険）'}
};
function externalConditions(action){
 const s=externalMagiState(),x=externalActions[action],errors=[];
 if(!externalMagiActive()||s.status==='failed')errors.push('進行中の外部侵入が必要');
 if(!S.infra.power)errors.push('主電源を復旧');
 if(x&&s.budget<x.cost)errors.push('演算資源が不足');
 if(action==='trace'&&(s.analysis>=100||s.status==='protected'))errors.push('解析は完了しています');
 if(action==='partition'&&s.status==='protected')errors.push('666による遮断を維持してください');
 if(action==='compile'&&(s.analysis<100||s.pressure.some(n=>n>=90)||s.status==='protected'))errors.push('解析100・三基90未満で構築');
 if(action==='maintain'&&s.status!=='protected')errors.push('666プロテクトを先に構築');
 return errors;
}
function applyExternalMagiAction(action,index){
 const old=externalMagiState();
 if(action==='start'){
  if(magiIntrusionActive())throw Error('既存の侵入対処を完了してください');
  S.magi.externalDefense={...old,status:'detected',caseNo:old.caseNo+1,turn:0,budget:100,analysis:0,pressure:[20,12,8],hold:0,selected:0,securityBefore:S.defense.security,message:'外部分散系から三基にハッキング。経路解析と666構築を指示してください。'};
  S.defense.security=Math.max(0,S.defense.security-20);staffInvalidateDecision();
 }else if(action==='select'){
  if(![0,1,2].includes(index))throw Error('対象コアが不正です');S.magi.externalDefense={...old,selected:index};
 }else{
  if(!externalActions[action])throw Error('不明な防御指示');
  const errors=externalConditions(action);if(errors.length)throw Error(errors.join(' / '));
  const s={...old,pressure:[...old.pressure]};s.budget-=externalActions[action].cost;s.turn++;
  if(action==='trace'){s.analysis=Math.min(100,s.analysis+50);s.pressure=s.pressure.map((n,i)=>v27Clamp(n+[16,14,12][i]));s.status=s.analysis===100?'analyzed':'detected';s.message='外部攻撃の解析 '+s.analysis+'%。666構築には三基の侵入圧90未満も必要です。';}
  if(action==='partition'){s.pressure=s.pressure.map((n,i)=>v27Clamp(n+(i===s.selected?-35:10)));s.message=externalCoreNames[s.selected]+'の外部経路を隔離。他系統への負荷を監視してください。';}
  if(action==='compile'){s.status='protected';s.pressure=s.pressure.map(n=>Math.max(0,n-15));s.message='666 PROTECT PROGRAM 展開。遮断を3回維持して外部侵入を排除します。';}
  if(action==='maintain'){s.hold++;s.pressure=s.pressure.map(n=>Math.max(0,n-30));s.message='666遮断維持 '+s.hold+'/3。残演算資源 '+s.budget+'。';if(s.hold>=3){s.status='contained';s.resolved++;s.message='666プロテクト成功 / 外部侵入を遮断。通常審議を再申請できます。';S.defense.security=Math.max(S.defense.security,s.securityBefore||0);addXP(25,'MAGI EXTERNAL DEFENSE');staffInvalidateDecision();}}
  if(action==='reboot'){s.status=s.analysis===100?'analyzed':'detected';s.hold=0;s.pressure=s.pressure.map(n=>v27Clamp(n+25));s.message='外部経路へ再接続し666を解除。全コアの侵入圧＋25。666の再構築が必要です。';}
  if(s.status!=='contained'&&(s.pressure.filter(n=>n>=100).length>=2||s.budget<8)){s.status='failed';s.failures++;s.message='外部防御失敗 / 三基の合議を停止。警報確認で事前バックアップ付きの正常復旧を実行してください。';}
  S.magi.externalDefense=s;
 }
 if(action!=='select'){addLog('magi',externalMagiState().message);sound(externalMagiState().status==='contained'?'done':'scan');}
}
async function externalMagiAction(action,index){return commandOperation(()=>applyExternalMagiAction(action,index));}
// A shared forecast drives both the armament readout and the original turn resolver.
const v210PriorForecast=defenseForecast;
defenseForecast=function(){
 const modes=S.cityArmament?.modes;if(!modes?.includes('missile'))return v210PriorForecast();
 const d=S.defense,rule=NERV_DOCTRINES[S.tactics?.posture]||NERV_DOCTRINES.balanced;
 let energy=v27Clamp(d.energy+(S.infra.power?7:0)),damage=0,shots=0;
 const votes=d.magivote?.filter(Boolean).length||0;
 d.city.slice(0,3).forEach((c,i)=>{const missile=modes[i]==='missile',cost=rule.cost+(missile?2:0);if(c.turret&&c.hp>=25&&energy>=cost&&S.infra.power){energy-=cost;shots++;damage+=Math.round((11+d.scans/15+(S.infra.comms?3:0))*(votes>=2?1.35:votes===1?.7:1)*rule.fire*(missile?1.4:1));}});
 const enemy=d.enemy,sector=enemy?((d.round+1)%3===0?3:enemy.lane):null;let loss=0;
 if(enemy&&enemy.dist<=2&&enemy.hp>damage){const c=d.city[sector],guard=S.evas[S.tactics.defender]?.state==='DEPLOYED'&&S.evas[S.tactics.defender]?.at&&evaMapSector(S.tactics.defender)===sector?12:0;loss=Math.max(5,Math.round(Math.max(5,enemy.force-(c.armor?13:0)-(S.infra.armor?5:0)-guard)*rule.loss));}
 if(sector!==null)loss=Math.min(d.city[sector].hp,loss);
 return {energy,damage:enemy?Math.min(enemy.hp,damage):0,shots,sector,loss,rule};
};
function evaCombatGuidance(){
 const d=S.defense,c=evaCombatState(),errors=combatBasics();
 if(d.status==='victory')return 'TARGET SILENCED / '+(d.victoryCause?.startsWith('eva-')?'EVA通常武器で撃破。':'作戦成功。')+' 次の敵性反応を検知できます。';
 return errors.length?errors.join(' → '):c.range>1?'接近を2回 → A.T.展開 → 中和 → 戦術承認 → ナイフ攻撃。各行動後は敵も接近・攻撃します。':c.exposedUntil<=d.round?'担当機のA.T.を展開し、敵A.T.を中和してください。':combatApproved()?'通常武器で攻撃できます。A.T.中和の残り '+(c.exposedUntil-d.round)+'行動。':'攻撃前に現ターンのMAGI戦術承認を取得してください。';
}
const v210PriorCommandMessage=commandMessage;
commandMessage=function(page){
 if(page==='magi'&&(externalMagiActive()||['external','firewall'].includes(mobileCurrent.magi)))return externalMagiState().message;
 if(page==='mission'&&['combat','engage'].includes(mobileCurrent.mission))return 'EVA通常戦闘 / UNIT-0'+S.tactics.attacker+' / '+evaCombatGuidance();
 return v210PriorCommandMessage(page);
};
function renderCommandOperations(){
 if(!$('evaCombatPanel'))return;
 const d=S.defense,c=evaCombatState(),e=S.evas[S.tactics.attacker],active=d.status==='active';
 $('combatUnit').value=String(S.tactics.attacker);
 const evaRoute=$('evaCombatPanel').querySelector('[data-ops-route^="eva/"]');evaRoute.dataset.opsRoute=e.state==='DEPLOYED'?'eva/readiness':'eva/control';evaRoute.textContent=e.state==='DEPLOYED'?'外部給電管制 ↗':'出撃管制 ↗';
 meteoText('combatStatus',active?'TURN '+d.round:d.status.toUpperCase());
 meteoText('combatHP',active?d.enemy.hp+' / '+d.enemy.maxHp:'--');
 meteoText('combatRange',c.range+' / '+(c.exposedUntil>d.round?'中和中':'健在'));
 meteoText('combatSupply',c.ammo+' / '+d.energy+'%');
 const errors=combatBasics();
 const hint=evaCombatGuidance();
 meteoText('combatHint',d.status==='victory'?'TARGET SILENCED / '+(d.victoryCause?.startsWith('eva-')?'EVA通常武器で撃破。':'作戦成功。')+' 次の敵性反応を検知できます。':hint);
 meteoText('engageTarget',active?d.enemy.hp+' HP / '+c.range+' RANGE':d.status.toUpperCase());meteoText('engageHint',d.status==='victory'?(d.victoryCause?.startsWith('eva-')?'EVA通常武器による作戦成功。':'目標沈黙 / 作戦成功。')+'戦闘管制から次の敵性反応を検知できます。':hint);
 const actions=$('combatActions');
 for(const [key,w] of Object.entries(evaCombatWeapons)){
  const b=actions.querySelector('[data-combat="'+key+'"]'),errs=evaCombatConditions(key);
  b.disabled=errs.length>0;b.title=errs.join(' / ');b.querySelector('small').textContent=errs.length?'必要：'+errs[0]:w.detail;
 }
 all('[data-combat="authorize"],[data-combat="at"]').forEach(b=>b.disabled=errors.length>0);
 all('[data-combat="authorize"]').forEach(b=>b.textContent=combatApproved()?'MAGI戦術承認済み / '+S.defense.magivote.filter(Boolean).length+'/3':'現ターンのMAGI戦術承認を取得');
 qs('[data-combat="detect"]').disabled=active;qs('[data-combat="scan"]').disabled=!active||d.energy<12||d.scans>=100||!S.infra.power;
 const f=defenseForecast();meteoText('combatForecast','機体電源 '+Math.ceil(e.power)+'秒 / '+(evaExternalPower(S.tactics.attacker)?'外部給電':'内部給電')+'。次ターン：都市武装 '+f.damage+'損耗 / 施設被害 '+f.loss+'。武器操作にも電力を使用。');
 const x=externalMagiState(),externalActive=externalMagiActive();$('externalMagiPanel').dataset.status=x.status;
 meteoText('externalState',x.status.toUpperCase());$('external666').dataset.active=String(x.status==='protected'||x.status==='contained');
 meteoText('external666Status',x.status==='protected'?'遮断維持 '+x.hold+'/3':x.status==='contained'?'EXTERNAL CONNECTION BLOCKED':'外部侵入に対する遮断防壁');
 meteoText('externalBudget','TURN '+x.turn+' / 演算資源 '+x.budget+' / 解析 '+x.analysis+'% / 三基侵入圧 '+x.pressure.join('・')+'%');
 meteoText('externalControlState','SIM / '+(x.status==='protected'?'666 '+x.hold+'/3':x.status.toUpperCase()));meteoText('externalControlBudget','演算資源 '+x.budget+' / 解析 '+x.analysis+'% / 隔離対象：'+externalCoreNames[x.selected]);meteoText('externalMessage',x.message);
 all('[data-external-core]').forEach((b,i)=>{b.setAttribute('aria-pressed',String(x.selected===i));b.querySelector('strong').textContent=x.pressure[i]+'%';b.querySelector('i').style.width=x.pressure[i]+'%';b.dataset.compromised=String(x.pressure[i]>=90);});
 for(const b of all('[data-external-action]')){const key=b.dataset.externalAction;const errors=externalConditions(key);b.disabled=errors.length>0;b.title=errors.join(' / ');b.hidden=!externalActive||x.status==='failed'||(key==='trace'&&(x.analysis>=100||x.status==='protected'))||(key==='compile'&&(x.analysis<100||x.status==='protected'))||(key==='maintain'&&x.status!=='protected')||(key==='partition'&&x.status==='protected');}
 $('externalStart').hidden=externalActive;$('externalStart').disabled=magiIntrusionActive();
 if(x.status==='failed'){$('externalStart').hidden=false;$('externalStart').textContent='警報確認・正常復旧へ';$('externalStart').disabled=false;}else $('externalStart').textContent=x.status==='contained'?'外部防御を再訓練':'外部ハッキング訓練を開始';
 if(externalActive){$('magiVote').disabled=true;meteoText('magiLiveState','外部侵入 / 通常審議停止');for(let i=0;i<3;i++){const id=['M','B','C'][i];meteoText('m'+id+'Status',x.pressure[i]>=90?'侵入危険':x.status==='protected'?'666防御中':'外部侵入');}meteoText('magiDecision','外部侵入中は通常審議を停止。外部防御で666プロテクトを構築してください。');}
 const sector=Number($('weaponSector').value),facility=d.city[sector],mode=S.cityArmament?.modes?.[sector]||'cannon';
 meteoText('weaponReadout',V27_FACILITY[sector].name+' / 健全性 '+facility.hp+'% / '+(facility.turret?'配備済み':'未配備')+' / '+(mode==='missile'?'誘導弾':'機関砲')+'。次ターン全兵装：損耗 '+f.damage+'・電力 '+f.energy+'%。');
 all('[data-city-weapon]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cityWeapon===mode)));
 $('weaponDeploy').disabled=facility.turret||facility.hp<25||d.parts<20;
}
function initCommandOperations(){
 if(!qs('#staffSupport')||!$('operationsTemplates'))return;
 for(const [id,page,label] of [['evaCombatPanel','mission','EVA直接戦闘'],['evaEngagePanel','mission','EVA交戦指示'],['externalMagiPanel','magi','外部防御 / 666'],['externalControlPanel','magi','666防御指示'],['cityWeaponsPanel','infra','兵装選択']]){const panel=$(id);qs('.page[data-page="'+page+'"]').append(panel);registerTerminalView(page,panel.dataset.view,label);}
 $('operationsTemplates').remove();
 for(const [key,w] of Object.entries(evaCombatWeapons)){const b=document.createElement('button');b.type='button';b.dataset.combat=key;const strong=document.createElement('b'),small=document.createElement('small');strong.textContent=w.label;b.append(strong,small);$('combatActions').append(b);}
 externalCoreNames.forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.dataset.externalCore=String(i);b.innerHTML='<small>'+name+'</small><strong></strong><span><i></i></span>';b.addEventListener('click',()=>externalMagiAction('select',i));$('externalCores').append(b);});
 for(const [key,x] of Object.entries(externalActions)){const b=document.createElement('button');b.type='button';b.dataset.externalAction=key;const label=document.createElement('b'),hint=document.createElement('small');label.textContent=x.label+' / '+x.cost;hint.textContent=x.hint;b.append(label,hint);b.addEventListener('click',()=>externalMagiAction(key));$('externalActions').append(b);}
 $('externalStart').addEventListener('click',()=>externalMagiState().status==='failed'?openAlertReview():externalMagiAction('start'));
 $('combatUnit').addEventListener('change',event=>{const unit=Number(event.target.value);commandOperation(()=>{if(![0,1,2].includes(unit))throw Error('対象機が不正です');$('staffAttackUnit').value=String(unit);$('staffAttackUnit').dispatchEvent(new Event('change',{bubbles:true}));S.selectedEva=unit;if(S.evaCombat)S.evaCombat.approval=null;});});
 document.addEventListener('click',event=>{const b=event.target.closest('[data-combat]');if(b&&!b.disabled)evaCombatAction(b.dataset.combat);const route=event.target.closest('[data-ops-route]');if(route){const [page,view]=route.dataset.opsRoute.split('/');if(page==='eva'&&route.closest('#evaCombatPanel')){S.selectedEva=S.tactics.attacker;draw();}window.NERV_MOBILE.open(page,view);}});
 $('weaponSector').addEventListener('change',renderCommandOperations);
 all('[data-city-weapon]').forEach(b=>b.addEventListener('click',()=>commandOperation(()=>{const modes=[0,1,2].map(i=>S.cityArmament?.modes?.[i]||'cannon');modes[Number($('weaponSector').value)]=b.dataset.cityWeapon;S.cityArmament={...S.cityArmament,modes};v27Record('兵装変更 / '+V27_FACILITY[Number($('weaponSector').value)].name+' / '+b.textContent.trim());})));
 $('weaponDeploy').addEventListener('click',()=>commandOperation(()=>{S.defense.selected=Number($('weaponSector').value);v27Turret();}));
 const link=(target,label,route)=>{const b=document.createElement('button');b.className='staff-secondary';b.textContent=label;b.dataset.opsRoute=route;target.prepend(b);};
 link($('missionOrdersPanel'),'EVA通常武器で戦う ↗','mission/combat');link($('armoryPanel'),'機関砲・誘導弾を選択 ↗','infra/weapons');link($('magiRequestPanel'),'外部ハッキング対処 / 666 ↗','magi/external');
 const priorDraw=draw;draw=function(){priorDraw();renderCommandOperations();};
 window.addEventListener('nerv-route',event=>{document.body.dataset.opsView=event.detail.page+'/'+event.detail.view;if((event.detail.page==='mission'&&['combat','engage'].includes(event.detail.view))||(event.detail.page==='magi'&&['external','firewall'].includes(event.detail.view))){delete commandAnnouncements[event.detail.page];renderCommandStreams();}if(event.detail.page==='magi'&&event.detail.view==='intrusion'&&externalMagiActive())mobileNavigate('magi','external');});
 window.NERV_OPERATIONS={combat:evaCombatAction,combatState:()=>JSON.parse(JSON.stringify(evaCombatState())),combatConditions:evaCombatConditions,external:externalMagiAction,externalState:()=>JSON.parse(JSON.stringify(externalMagiState())),forecast:()=>JSON.parse(JSON.stringify(defenseForecast()))};
 renderCommandOperations();
 const [page,view]=location.hash.slice(1).split('/');if(['combat','engage','external','firewall','weapons'].includes(view))window.NERV_MOBILE.open(page,view);
}
initCommandOperations();
