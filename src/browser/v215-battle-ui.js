function initV215BattleUI(){
 if(!qs('#staffSupport'))return;let selectedAngel='sachiel',nextCommand=null;
 if(['knife','rifle','positron'].includes(S.prefs.selectedWeapon))armamentSelected=S.prefs.selectedWeapon;
 const labels={knife:'ナイフ',rifle:'パレット',positron:'ポジトロン'},names={knife:'プログレッシブナイフ',rifle:'パレットガン',positron:'ポジトロンライフル'};
 v215Panel('mission','angels','使徒監視','<p class="eyebrow">ANGEL SURVEILLANCE / TV SERIES</p><h2>使徒接近・迎撃記録</h2><div class="angel-roster">'+Object.values(angelProfiles).map(p=>'<button data-angel-select="'+p.id+'"><span class="angel-art" data-angel="'+p.id+'" role="img" aria-label="'+p.name+'の外観"></span><small>第'+p.number+'使徒</small><b>'+p.name+'</b></button>').join('')+'</div><p id="angelIntel" class="staff-guide"></p><p id="angelStartReason" class="staff-note" role="status"></p><button id="angelStart" class="staff-primary"></button><button class="staff-secondary" data-ops-route="mission/engagement">交戦管制へ ↗</button><p class="staff-note">作中の使徒を再現する独自シナリオ。既存の通常訓練も利用できます。</p>');
 v215Panel('mission','engagement','交戦管制','<p class="eyebrow">EVA / ENGAGEMENT CONTROL</p><div class="engagement-target" id="engagementTarget"><span class="angel-art" id="engagementPortrait" role="img"></span><div><h2 id="engagementEnemy"></h2><p id="engagementEnemyHP"></p><label class="staff-label" for="engagementUnit">攻撃担当機</label><select id="engagementUnit"><option value="0">零号機</option><option value="1">初号機</option><option value="2">弐号機</option></select></div></div><div class="engagement-weapons">'+Object.entries(labels).map(([id,label])=>'<button data-engagement-weapon="'+id+'"><span class="weapon-art"><i data-weapon-art="'+id+'"></i></span><b>'+label+'</b></button>').join('')+'</div><p id="engagementSelected" class="staff-guide"></p><p id="engagementProgress" class="staff-note"></p><button id="engagementNext" class="staff-secondary"></button><p id="engagementBlockers" class="staff-note" role="status"></p><button id="engagementFire" class="staff-primary"></button><div class="ops-route-grid"><button data-ops-route="mission/weapon-detail">装備図 ↗</button><button data-ops-route="infra/defense">戦域マップ ↗</button></div>');
 function chooseWeapon(id){armamentSelected=id;S.prefs.selectedWeapon=id;persist();renderArmament();window.dispatchEvent(new CustomEvent('nerv-equipment-selected',{detail:{weapon:id}}));}
 all('[data-angel-select]').forEach(b=>b.addEventListener('click',()=>{selectedAngel=b.dataset.angelSelect;render();}));all('[data-engagement-weapon]').forEach(b=>b.addEventListener('click',()=>chooseWeapon(b.dataset.engagementWeapon)));
 $('angelStart').addEventListener('click',async()=>{if(S.defense.status==='active'){NERV_MOBILE.open('mission','engagement');return;}const r=await worldAction('angel.start.'+selectedAngel);if(r.ok)NERV_MOBILE.open('mission','engagement');});
 $('engagementUnit').addEventListener('change',e=>commandOperation(()=>{S.tactics.attacker=Number(e.target.value);S.selectedEva=S.tactics.attacker;staffInvalidateDecision();}));
 $('engagementNext').addEventListener('click',async()=>{const command=nextCommand;if(!command)return;if(command.weapon){chooseWeapon(command.weapon);return;}if(command.route){if(command.route.startsWith('eva/')){S.selectedEva=S.tactics.attacker;renderEVA();}const [p,v]=command.route.split('/');NERV_MOBILE.open(p,v);return;}if(command.action==='wait')await commandOperation(()=>v27Advance());else await evaCombatAction(command.action);});
 $('engagementFire').addEventListener('click',()=>evaCombatAction(armamentSelected));
 function nextStep(){
  const d=S.defense,e=S.evas[S.tactics.attacker],c=evaCombatState(),w=armamentSelected;
  if(d.status!=='active')return {label:'使徒監視で対象を確認する ↗',route:'mission/angels'};
  if(!S.infra.power||!S.infra.comms)return {label:'主電源・通信を復旧する ↗',route:'infra/systems'};
  if(worldMagiLimited())return {label:'MAGI保守・異常対応を確認する ↗',route:S.world.magiOps.active?'magi/maintenance':'work/incidents'};
  if(securityHold())return {label:'保安案件を引き継ぐ ↗',route:'work/security'};
  if(e.state!=='DEPLOYED')return {label:'担当機の発進準備・出撃承認へ ↗',route:'eva/control'};
  if(!evaExternalPower(S.tactics.attacker)&&e.power<40)return {label:'担当機の給電を確認する ↗',route:'eva/readiness'};
  if(d.scans<(w==='positron'?68:34))return {label:'対象を解析する / 電力12',action:'scan'};
  if(currentAngel()?.id==='ramiel'&&w!=='positron')return {label:'対ラミエル：ポジトロンへ切り替える',weapon:'positron'};
  if(w==='positron'&&!evaExternalPower(S.tactics.attacker))return {label:'アンビリカル・外部給電を接続する ↗',route:'eva/readiness'};
  const required=w==='positron'?(positronChargeState()<100?22:40):c.range>1?4:c.exposedUntil<=d.round?12:evaCombatWeapons[w].energy;
  if(d.energy<required)return d.spares>0?{label:'補助送電 / 予備枠1・電力+38',action:'positronSupply'}:{label:'電力配分を待つ / 1ターン・敵も行動',action:'wait'};
  if(w==='positron'&&positronChargeState()<100)return {label:'特別送電・充填 / 電力22・1ターン',action:'positronCharge'};
  if(w!=='positron'&&c.range>1)return {label:'担当機を接近させる / 1ターン',action:'approach'};
  if(w!=='positron'&&!e.at)return {label:'担当機のA.T.フィールドを展開',action:'at'};
  if(w!=='positron'&&c.exposedUntil<=d.round)return {label:'敵A.T.を中和する / 1ターン',action:'neutralize'};
  if(!combatApproved())return {label:'現ターンのMAGI戦術承認を申請',action:'authorize'};
  return null;
 }
 function render(){
  if(!staffWorldReady)return;const p=angelProfiles[selectedAngel],d=S.defense,a=currentAngel(),e=S.evas[S.tactics.attacker],c=evaCombatState();
  all('[data-angel-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.angelSelect===selectedAngel)));meteoText('angelIntel','第'+p.number+'使徒 '+p.name+' / '+p.feature+'。'+p.tactic);
  const blocked=!!S.world.security.case||worldObserve(S).magiHold;meteoText('angelStartReason',d.status==='active'?'現在の迎撃を継続してください。':blocked?'進行中の保安・MAGI保守を引き継いでから受信できます。':'EVA・都市の現在の損傷や資源を引き継いで迎撃します。');$('angelStart').disabled=blocked&&d.status!=='active';$('angelStart').textContent=d.status==='active'?'現在の交戦管制へ ↗':'第'+p.number+'使徒の接近を受信';
  meteoText('engagementEnemy',a?a.name:d.status==='active'?d.enemy.code:'対象未検知');meteoText('engagementEnemyHP',d.enemy?'目標 '+d.enemy.hp+'/'+d.enemy.maxHp+' / '+({active:'交戦中',victory:'目標沈黙',defeat:'防衛失敗',idle:'待機'}[d.status]):'使徒監視または通常訓練で対象を検知');const face=$('engagementPortrait');face.hidden=!a;if(a){face.dataset.angel=a.id;face.setAttribute('aria-label',a.name+'の外観');}
  if(document.activeElement!==$('engagementUnit'))$('engagementUnit').value=String(S.tactics.attacker);all('[data-engagement-weapon]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.engagementWeapon===armamentSelected)));
  meteoText('engagementSelected','UNIT-0'+S.tactics.attacker+' / '+names[armamentSelected]);meteoText('engagementProgress','解析 '+d.scans+'% / 距離 '+c.range+' / '+(armamentSelected==='positron'?'充填 '+positronChargeState()+'%':'A.T.中和 '+(c.exposedUntil>d.round?'有効':'未実施'))+' / 都市電力 '+d.energy+'%');
  nextCommand=nextStep();$('engagementNext').hidden=!nextCommand;if(nextCommand)$('engagementNext').textContent=nextCommand.label;const errors=evaCombatConditions(armamentSelected);$('engagementFire').disabled=!!errors.length;$('engagementFire').textContent='UNIT-0'+S.tactics.attacker+' / '+names[armamentSelected]+'で攻撃';meteoText('engagementBlockers',errors.length?'未成立：'+errors[0]:'準備完了。攻撃命令で1回だけ実行します。');
  const sprite=$('angelMapSprite');if(sprite){sprite.hidden=!a||d.scans<34||d.status!=='active';if(a)sprite.dataset.angel=a.id;const enemy=$('v27Enemy');if(a&&d.scans>=34&&d.status==='active')enemy.dataset.angel=a.id;else delete enemy.dataset.angel;}
  const warning=qs('#commandAlert .command-alert-code b');if(warning)warning.textContent=a&&d.status==='active'?'FICTION / 作中使徒の迎撃':'SIMULATION / 架空の訓練警報';
 }
 const mapEnemy=$('v27Enemy');if(mapEnemy){const foreign=document.createElementNS('http://www.w3.org/2000/svg','foreignObject');foreign.setAttribute('x','-28');foreign.setAttribute('y','-60');foreign.setAttribute('width','56');foreign.setAttribute('height','88');foreign.setAttribute('pointer-events','none');foreign.innerHTML='<span xmlns="http://www.w3.org/1999/xhtml" id="angelMapSprite" class="angel-art" hidden></span>';mapEnemy.append(foreign);}
 for(const [selector,label,route]of [['#commandLauncher','使徒監視・迎撃 ↗','mission/angels'],['#armamentPanel .staff-panel','選択武器の交戦ガイド ↗','mission/engagement'],['#weaponControlPanel .staff-panel','武器選択と次の準備を確認 ↗','mission/engagement'],['#evaCombatPanel','交戦管制・武器を選択 ↗','mission/engagement']]){const b=document.createElement('button');b.className='staff-secondary v215-guide-link';b.dataset.opsRoute=route;b.textContent=label;qs(selector)?.append(b);}
 qs('#armamentPanel [data-ops-route="mission/weapon-detail"]')?.remove();
 const priorArmament=renderArmament;renderArmament=function(){priorArmament();render();};const oldDraw=draw;draw=function(){oldDraw();render();};window.addEventListener('nerv-route',render);window.addEventListener('nerv-world-ready',render);
 window.addEventListener('nerv-confirmed-hit',()=>{const card=$('engagementTarget');NERV_MOTION?.tween('angel-hit',1,0,v=>{card.style.boxShadow=v?'inset 0 0 '+(15*v)+'px rgba(232,156,83,'+(v*.4)+')':'';},card,520);});
 const oldAlert=terminalAlert;terminalAlert=function(){const previous=oldAlert(),a=currentAngel();if(a&&S.defense.status==='active'&&previous.level!=='critical')return {level:'critical',key:'angel-'+S.defense.caseNo,title:a.name+'接近',message:'EVAの担当機・武器を確認し、交戦管制の準備手順を進めてください。',page:'mission'};return previous;};
 $('alertTarget').addEventListener('click',event=>{if(terminalAlert().key?.startsWith('angel-')){event.stopImmediatePropagation();closeAlertReview();NERV_MOBILE.open('mission','engagement');}},true);
 window.addEventListener('nerv-equipment-selected',event=>{if(['knife','rifle','positron'].includes(event.detail?.weapon)){S.prefs.selectedWeapon=event.detail.weapon;persist();}});
 window.NERV_ENGAGEMENT={selectWeapon:chooseWeapon,next:()=>nextCommand?{...nextCommand}:null,snapshot:()=>({weapon:armamentSelected,angel:currentAngel()?.id||null,ready:evaCombatConditions(armamentSelected).length===0})};render();
}
initV215BattleUI();
