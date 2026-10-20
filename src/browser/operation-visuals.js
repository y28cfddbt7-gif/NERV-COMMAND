function evaUmbilicalConnected(index){const e=S.evas[index];if(!['DEPLOYED','POWER_LOST'].includes(e.state))return !!S.infra.power;return typeof e.umbilical==='boolean'?e.umbilical:!!(S.defense?.connected&&S.tactics?.attacker===index);}
function evaExternalPower(index){return !!S.infra.power&&evaUmbilicalConnected(index);}
function toggleEvaCable(index=S.selectedEva){
 settleEvaPower();const e=S.evas[index];if(!['DEPLOYED','POWER_LOST'].includes(e.state)){toast('出撃中・電源喪失の機体を選択してください。');return;}
 if(!S.infra.power||!S.infra.comms){toast('主電源と通信を復旧してください。');return;}
 e.umbilical=e.state==='POWER_LOST'?true:!evaUmbilicalConnected(index);if(e.umbilical&&e.state==='POWER_LOST')e.state='DEPLOYED';e.powerUpdatedAt=Date.now();if(S.evaCombat)S.evaCombat.approval=null;if(index===S.tactics.attacker)S.defense.connected=e.umbilical;
 addLog('eva','UNIT-0'+index+' / アンビリカル '+(e.umbilical?'接続':'解除'));sound('select');draw();
}
function renderEvaOperations(){
 if(!$('evaReadinessList'))return;
 const e=selected(),prepared=['READY','DEPLOYED','POWER_LOST'].includes(e.state);
 const checks=[['主電源・通信',S.infra.power&&S.infra.comms],['エントリープラグ・LCL準備',prepared],['神経接続 / SYNC '+e.sync+'% (SIM)',prepared&&e.sync>=50],['MAGI出撃承認',e.state==='DEPLOYED'||S.magi.approvedFor===S.selectedEva],['拘束解除・射出待機',e.state==='READY'||e.state==='DEPLOYED']];
 const list=$('evaReadinessList');list.replaceChildren();for(const [label,ok] of checks){const li=document.createElement('li');li.textContent=(ok?'確認済：':'未確認：')+label;li.dataset.complete=String(ok);list.append(li);}
 const connected=evaUmbilicalConnected(S.selectedEva);
 $('evaCable').disabled=!['DEPLOYED','POWER_LOST'].includes(e.state)||!S.infra.power||!S.infra.comms;meteoText('evaCable',connected?'アンビリカルを解除':'アンビリカルを接続');
 meteoText('evaCableHint',e.state==='DEPLOYED'?(evaExternalPower(S.selectedEva)?'外部給電中。内部電源の時間消費を停止しています。':'内部電源で稼働。A.T.展開中は消費が増加します。'):'格納ケージ給電。出撃中は機体ごとにケーブルを切り替えられます。');
 meteoText('evaUmbDisplay',connected?(S.infra.power?'UMBILICAL / EXTERNAL POWER':'UMBILICAL / SUPPLY OFFLINE'):'UMBILICAL / INTERNAL POWER');
 meteoText('evaGrid',evaExternalPower(S.selectedEva)?'EXTERNAL':S.infra.power?'INTERNAL':'SUPPLY OFFLINE');
}
function initOperationVisuals(){
 if(!qs('#staffSupport'))return;
 const graphic='<svg viewBox="0 0 320 120" aria-hidden="true"><defs><pattern id="opHatch" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><rect width="6" height="12" fill="#dca04b"/></pattern></defs><rect x="5" y="5" width="310" height="110" fill="#091612" stroke="#568a70"/><path class="op-power" d="M15 100H90V40H230V100H305" fill="none" stroke="#77e5c3" stroke-width="3"/><g class="op-city"><path d="M75 105V65H110V105M125 105V40H165V105M180 105V55H220V105M230 105V70H260V105" fill="#1d4d40" stroke="#b3d6b2"/></g><g class="op-gate-left"><rect x="12" y="12" width="148" height="96" fill="#50331f" stroke="#ffbe6a"/><rect x="20" y="18" width="132" height="10" fill="url(#opHatch)"/><path d="M30 42h100M30 58h100M30 74h100M30 90h100" stroke="#b07839"/></g><g class="op-gate-right"><rect x="160" y="12" width="148" height="96" fill="#50331f" stroke="#ffbe6a"/><rect x="168" y="18" width="132" height="10" fill="url(#opHatch)"/><path d="M184 42h100M184 58h100M184 74h100M184 90h100" stroke="#b07839"/></g><g class="op-eva"><path d="M152 28l8-8 8 8-3 13 12 18-5 7-9-15 2 28 10 26h-9l-9-24-7 24h-9l11-28 2-25-10 13-6-7 14-19z" fill="#d9b56e" stroke="#e4f0ba"/></g><path class="op-beam" d="M170 50L300 15" stroke="#b9fbec" stroke-width="5"/></svg>';
 const scene=document.createElement('div');scene.id='operationVisual';scene.className='operation-visual hidden';scene.setAttribute('role','status');scene.innerHTML='<b id="operationVisualLabel"></b>'+graphic;qs('#shell').append(scene);
 const system=document.createElement('div');system.id='citySystemsVisual';system.className='city-system-visual';system.innerHTML='<div class="panel-overline">ARMOR / POWER GRID <b id="cityVisualState"></b></div>'+graphic.replaceAll('opHatch','systemHatch');$('infraSystems').prepend(system);
 const emblem=qs('.seq-emblem');if(emblem){emblem.classList.add('sequence-mechanism');emblem.innerHTML='<div class="sequence-mechanical">'+graphic.replaceAll('opHatch','sequenceHatch')+'</div><div class="sequence-magi-display"><div class="sequence-magi-core" data-core="MELCHIOR">MELCHIOR-1<b>待機</b></div><div class="sequence-magi-core" data-core="BALTHASAR">BALTHASAR-2<b>待機</b></div><div class="sequence-magi-core" data-core="CASPER">CASPER-3<b>待機</b></div></div>';}
 let previous=null,hideTimer=null;
 const snapshot=()=>({armor:S.infra.armor,power:S.infra.power,comms:S.infra.comms,round:S.defense.round,scans:S.defense.scans,energy:S.defense.energy,city:S.defense.city.map(c=>[c.hp,c.armor,c.turret]),units:S.evas.map(e=>[e.state,e.at,e.umbilical,e.mapSector]),charge:S.tactics.charge,vote:S.magi.vote?.time});
 function renderVisuals(){
  system.dataset.closed=String(S.infra.armor);system.dataset.power=String(S.infra.power);meteoText('cityVisualState',S.infra.armor?'SHUTTERS CLOSED':'SHUTTERS OPEN');
  const now=snapshot();if(!previous){previous=now;return;}const old=previous;previous=now;
  let kind='',label='';
  if(now.armor!==old.armor){kind=now.armor?'armor-close':'armor-open';label=now.armor?'装甲防壁を閉鎖':'装甲防壁を開放';}
  else if(now.power!==old.power||now.comms!==old.comms){kind='power';label=now.power&&now.comms?'電源・通信系統 接続':'系統切替 / 状態更新';}
  else if(now.units.some((u,i)=>JSON.stringify(u)!==JSON.stringify(old.units[i]))){const index=now.units.findIndex((u,i)=>JSON.stringify(u)!==JSON.stringify(old.units[i]));scene.dataset.unit=String(index);const sprite=scene.querySelector('.mechanism-eva');if(sprite)sprite.dataset.unit=String(index);kind='eva';label='UNIT-0'+index+' / 機体・配置・電源経路を更新';}
  else if(now.city.some((c,i)=>c[1]!==old.city[i][1])){kind='armor-close';label='防衛区画の装甲を展開';}
  else if(now.city.some((c,i)=>c[2]!==old.city[i][2])){kind='combat';label='迎撃砲台を配備';}
  else if(now.city.some((c,i)=>c[0]>old.city[i][0])){kind='repair';label='施設の復旧・修理';}
  else if(now.round!==old.round){kind='combat';label='防衛ターン更新 / 迎撃・接近';}
  else if(now.scans!==old.scans){kind='scan';label='対象波形を解析';}
  else if(now.energy!==old.energy||now.charge!==old.charge){kind='power';label='電力を配分・充填';}
  else if(now.vote!==old.vote){kind='scan';label='MAGIシステム / 決議を確定';}
  if(!kind)return;
  scene.dataset.operation=kind;scene.classList.remove('hidden','operation-running');void scene.offsetWidth;scene.classList.add('operation-running');meteoText('operationVisualLabel',label);clearTimeout(hideTimer);hideTimer=setTimeout(()=>scene.classList.add('hidden'),1700);
 }
 const oldDraw=draw;draw=function(){oldDraw();renderEvaOperations();renderStrategy();renderVisuals();};
 const oldInfra=renderInfra;renderInfra=function(){oldInfra();renderVisuals();};
 const oldEva=renderEVA;renderEVA=function(){oldEva();renderEvaOperations();};
 $('evaCable').addEventListener('click',()=>commandOperation(()=>toggleEvaCable()));
 initStrategy();renderEvaOperations();renderStrategy();renderVisuals();
}
initOperationVisuals();
