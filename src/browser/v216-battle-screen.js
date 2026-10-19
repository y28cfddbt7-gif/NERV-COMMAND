// A dedicated major page, sharing the existing EVA/MAGI/combat transactions.
function initV216Battle(){
 if(!window.NERV_ENGAGEMENT||!window.NERV_FX)return;
 const weapons={knife:'プログレッシブナイフ',rifle:'パレットガン',positron:'ポジトロンライフル'};
 const page=document.createElement('section');page.className='page battle-page';page.dataset.page='battle';
 page.innerHTML='<div class="battle-top page-top"><button data-ops-route="home">⌂ ホーム</button><h1>EVA戦闘管制</h1><button id="battleAlertReview">警報確認</button></div>'+
 '<section class="mobile-view" data-view="engage"><div class="battle-contact"><div><small id="battleCase">ENGAGEMENT / SIM</small><h2 id="battleEnemyName"></h2></div><div><strong id="battleEnemyHP"></strong><meter id="battleHPBar" min="0" max="100" value="100" aria-label="使徒の残存戦力"></meter></div></div>'+
 '<div class="battle-stage" id="battleStage"><div class="battle-stage-lines"></div><div class="battle-eva"><span class="eva-sprite" id="battleEvaSprite" data-unit="1"></span></div><span id="battleAngelSprite" class="angel-art" role="img"></span><div class="battle-stage-data"><b id="battleStageUnit"></b><span id="battleStageRange"></span></div><span id="battleImpact" class="battle-impact" aria-hidden="true"></span></div>'+
 '<ol class="battle-phases"><li>1 出撃</li><li>2 攻撃準備</li><li>3 武器攻撃</li><li>4 結果</li></ol><div class="battle-weapons">'+Object.entries(weapons).map(([key,name])=>'<button data-battle-weapon="'+key+'" aria-label="'+name+'を装備"><span class="weapon-art"><i data-weapon-art="'+key+'"></i></span><b>'+({knife:'ナイフ',rifle:'パレット',positron:'ポジトロン'}[key])+'</b></button>').join('')+'</div>'+
 '<div class="battle-orders"><p id="battleOrderTitle"></p><p id="battleOrderDetail"></p><button id="battleDo" class="staff-primary"></button><p id="battleFeedback" role="status" aria-live="polite"></p></div><div class="battle-footer"><button data-ops-route="battle/setup">担当機・給電</button><button data-ops-route="battle/records">戦闘記録</button></div></section>'+
 '<section class="mobile-view" data-view="setup"><div class="staff-panel"><p class="eyebrow">EVA / READINESS</p><h2>担当機・給電</h2><label class="staff-label" for="battleUnit">攻撃担当機</label><select id="battleUnit"><option value="0">零号機 / 綾波レイ</option><option value="1">初号機 / 碇シンジ</option><option value="2">弐号機 / 惣流・アスカ・ラングレー</option></select><div id="battleUnitState" class="battle-system-readout"></div><button id="battleCable" class="staff-secondary"></button><div id="battleVotes" class="battle-votes"></div><p class="staff-note">出撃準備・出撃審議・射出は交戦画面の案内から一手ずつ実行できます。担当変更で戦術承認は失効します。</p><button class="staff-primary" data-ops-route="battle/engage">交戦画面へ戻る</button><button class="staff-secondary" data-ops-route="eva/damage">部位別損傷報告 ↗</button></div></section>'+
 '<section class="mobile-view" data-view="targets"><div class="staff-panel"><p class="eyebrow">ANGEL / SURVEILLANCE</p><h2>使徒監視</h2><div class="angel-roster">'+Object.values(angelProfiles).map(p=>'<button data-battle-target="'+p.id+'"><span class="angel-art" data-angel="'+p.id+'" role="img" aria-label="'+p.name+'"></span><b>'+p.name+'</b></button>').join('')+'</div><p id="battleTargetIntel" class="staff-guide"></p><button id="battleStart" class="staff-primary"></button><p id="battleStartReason" role="status" class="staff-note"></p><button class="staff-secondary" data-ops-route="battle/engage">交戦画面へ</button></div></section>'+
 '<section class="mobile-view" data-view="records"><div class="staff-panel"><p class="eyebrow">OPERATIONS / RECEIVED RECORDS</p><h2>戦闘結果・経過</h2><p id="battleResult" class="staff-guide"></p><div id="battleRecords" class="battle-records"></div><button class="staff-primary" data-ops-route="battle/engage">交戦画面へ戻る</button><button class="staff-secondary" data-ops-route="battle/targets">次の使徒を確認</button><button id="battleCloseOperation" class="staff-secondary">作戦終了・復旧の確認</button></div></section>';
 $('pageContainer').append(page);mobileGroup('battle',[['engage','交戦'],['setup','担当機'],['targets','使徒監視'],['records','記録']].map(([id,label])=>({id,label,existing:true})),'engage');
 let selectedTarget='sachiel',busy=false,feedback='',lastRecord='',hitSerial=0,currentPlan=null;const effect={recoil:0,flash:0};
 const stage=createTokyo3BattleStage($('battleStage'));
 function plan(){
  const d=S.defense,unit=S.tactics.attacker,e=S.evas[unit];
  if(d.status!=='active')return {kind:'route',route:'battle/'+(['victory','defeat'].includes(d.status)?'records':'targets'),label:d.status==='victory'?'戦闘結果を見る':d.status==='defeat'?'結果・復旧を確認':'使徒監視を開く',detail:d.status==='victory'?'目標の沈黙を確認しました。次の攻撃は実行されません。':'対象を選択して迎撃を開始します。'};
  if(worldMagiLimited()||magiIntrusionActive()||securityHold())return {kind:'route',route:securityHold()?'work/security':S.world.magiOps?.active?'magi/maintenance':worldActiveIncident(S.world)?'work/incidents':externalMagiActive()?'magi/firewall':'magi/intrusion',label:'保安・MAGIの保留を確認',detail:'審議を保留中です。未処理案件を正式な経路で引き継いでください。'};
  if(!S.infra.power||!S.infra.comms)return {kind:'route',route:'infra/systems',label:'電源・通信を復旧',detail:'停電・通信断のまま出撃や攻撃はできません。'};
  if(e.state==='HANGAR')return {kind:'prepare',label:'1. 担当機の発進準備',detail:'UNIT-0'+unit+'の搭乗信号・拘束系を確認します。敵ターンは進みません。'};
  if(e.state==='READY')return S.magi.approvedFor===unit?{kind:'launch',label:'3. UNIT-0'+unit+'を射出',detail:'出撃承認を照合して射出します。射出後は外部給電を接続します。'}:{kind:'sortie',label:'2. MAGIへ出撃審議を申請',detail:'三基の賛否と電力・通信・機体条件を確認します。否決時は担当機画面に理由を表示。'};
  if(e.state!=='DEPLOYED')return {kind:'route',route:'eva/control',label:'機体の回収・整備を確認',detail:stateJP[e.state]+'。回収・整備完了後に交戦画面へ戻ってください。'};
  if(!evaExternalPower(unit))return {kind:'cable',label:'外部給電を接続',detail:'アンビリカルで内部電源の消費を抑えます。都市主電源が必要です。'};
  const n=NERV_ENGAGEMENT.next();if(n){if(n.route)return {kind:'route',...n,detail:'条件を確認し、戦闘画面へ戻ってください。'};if(n.weapon)return {kind:'weapon',...n,detail:'ラミエルには遠距離の陽電子狙撃が必要です。'};const descriptions={scan:'解析を34%進めます。電力12を消費。敵ターンは進みません。',approach:'間合いを1縮めます。敵も行動し、都市や機体が損傷する場合があります。',at:'担当機のA.T.フィールドを展開します。敵ターンは進みません。',neutralize:'敵A.T.を中和します。電力12を消費、敵も1回行動します。',authorize:'現ターンと担当機だけに有効な戦術承認を申請します。',positronCharge:'特別送電で50%充填します。電力22を消費し、敵も1回行動します。',positronSupply:'予備枠1を使って電力38を補給します。',wait:'電力配分を待ちます。敵も1回行動するため、被害に注意してください。'};return {kind:'combat',...n,detail:descriptions[n.action]||'現在の状態で許可された一操作を実行します。'};}
  if(armamentSelected==='rifle'&&evaCombatState().ammo<1)return {kind:'weapon',weapon:'knife',label:'残弾0：ナイフへ切り替える',detail:'新しい弾を無条件に補充しません。現在の機体で近接攻撃へ移行します。'};
  const errors=evaCombatConditions(armamentSelected);return {kind:'fire',label:weapons[armamentSelected]+'で攻撃',detail:errors.length?'未成立：'+errors[0]:'準備完了。命令は1回の攻撃と敵の1行動です。',disabled:!!errors.length};
 }
 async function execute(){
  if(busy)return;const next=plan();if(next.disabled)return;busy=true;render();let r;
  try{
   if(next.kind==='route'){const [p,v]=next.route.split('/');if(p==='eva'){S.selectedEva=S.tactics.attacker;renderEVA();}NERV_MOBILE.open(p,v);return;}
   if(next.kind==='weapon'){await setWeapon(next.weapon);return;}
   if(next.kind==='combat'||next.kind==='fire')r=next.action==='wait'?await commandOperation(()=>v27Advance()):await evaCombatAction(next.kind==='fire'?armamentSelected:next.action);
   else r=await commandOperation(()=>{
    if(worldMagiLimited()||magiIntrusionActive()||securityHold()||S.defense.status!=='active')throw Error('作戦状態が変化しました。条件を再確認してください');
    const unit=S.tactics.attacker;S.selectedEva=unit;
    if(next.kind==='prepare')prepareEvaState(unit);
    else if(next.kind==='sortie'){S.magi.purpose='sortie';recordSortieDecision(sortieDecision(unit));}
    else if(next.kind==='launch')launchEvaState(unit);
    else if(next.kind==='cable'){if(!S.infra.power||S.evas[unit].state!=='DEPLOYED')throw Error('出撃状態と主電源を確認してください');if(!evaUmbilicalConnected(unit))toggleEvaCable(unit);}
   });
   if(!(r?.ok&&next.kind==='fire'))feedback=r?.ok?(next.kind==='sortie'&&!S.magi.vote?.approved?'MAGI出撃審議は否決。担当機画面で理由を確認してください。':next.label+' / 記録済み'):r?.error||'処理できませんでした。';
  }finally{busy=false;render();}
 }
 function render(){
  if(!staffWorldReady)return;const d=S.defense,a=currentAngel(),e=S.evas[S.tactics.attacker],c=evaCombatState();currentPlan=plan();
  document.body.classList.toggle('battle-active',currentPage==='battle');
  meteoText('battleEnemyName',a?a.name:d.status==='idle'?'対象待機':d.enemy?.code||'対象未検知');meteoText('battleCase','CASE '+d.caseNo+' / '+({idle:'STANDBY',active:'ENGAGEMENT',victory:'TARGET SILENT',defeat:'RECOVERY REQUIRED'}[d.status])+' / SIM');
  meteoText('battleEnemyHP',d.enemy?'目標 '+d.enemy.hp+' / '+d.enemy.maxHp:'未検知');$('battleHPBar').value=d.enemy?100*d.enemy.hp/Math.max(1,d.enemy.maxHp):0;
  const sprite=$('battleEvaSprite');sprite.dataset.unit=String(S.tactics.attacker);sprite.parentElement.dataset.deployed=String(e.state==='DEPLOYED');$('battleAngelSprite').hidden=!a;if(a){$('battleAngelSprite').dataset.angel=a.id;$('battleAngelSprite').setAttribute('aria-label',a.name);}
  meteoText('battleStageUnit','UNIT-0'+S.tactics.attacker+' / '+stateJP[e.state]);meteoText('battleStageRange','距離 '+c.range+' / 解析 '+d.scans+'% / 電力 '+d.energy+'%');
  const phase=d.status==='victory'||d.status==='defeat'?3:e.state!=='DEPLOYED'?0:currentPlan.kind==='fire'?2:1;all('.battle-phases li').forEach((li,i)=>li.dataset.active=String(i===phase));
  all('[data-battle-weapon]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.battleWeapon===armamentSelected)));
  meteoText('battleOrderTitle','装備：'+weapons[armamentSelected]+(armamentSelected==='rifle'?' / 残弾 '+c.ammo:armamentSelected==='positron'?' / 充填 '+positronChargeState()+'%':''));
  meteoText('battleOrderDetail',currentPlan.detail);$('battleDo').disabled=busy||!!currentPlan.disabled;$('battleDo').textContent=busy?'命令を記録中…':currentPlan.label;meteoText('battleFeedback',feedback);
  if(document.activeElement!==$('battleUnit'))$('battleUnit').value=String(S.tactics.attacker);
  meteoText('battleUnitState','UNIT-0'+S.tactics.attacker+' / '+stateJP[e.state]+' / SYNC '+Number(e.sync).toFixed(1)+'%\n'+(evaExternalPower(S.tactics.attacker)?'外部給電中 / 内部電源を保持':'内部電源 '+Math.ceil(e.power)+'秒')+'\n都市電力 '+d.energy+'% / 通信 '+(S.infra.comms?'接続':'断'));
  $('battleCable').disabled=e.state!=='DEPLOYED'||busy;$('battleCable').textContent=evaUmbilicalConnected(S.tactics.attacker)?'アンビリカルを解除':'アンビリカルを接続';
  const vote=S.magi.vote?.eva===S.tactics.attacker&&S.magi.vote?.purpose==='sortie'?S.magi.vote:null;$('battleVotes').replaceChildren();for(const v of vote?.votes||[]){const p=document.createElement('p');p.textContent=v.name+' / '+(v.yes?'賛成':'否決')+'：'+v.reason;$('battleVotes').append(p);}for(const text of vote?.blockers||[]){const p=document.createElement('p');p.textContent='未成立：'+text;$('battleVotes').append(p);}
  const target=angelProfiles[selectedTarget];all('[data-battle-target]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.battleTarget===selectedTarget)));meteoText('battleTargetIntel','第'+target.number+'使徒 '+target.name+' / '+target.tactic);const held=worldObserve(S).magiHold||!!S.world.security.case;$('battleStart').disabled=busy||held&&d.status!=='active';$('battleStart').textContent=d.status==='active'?'現在の交戦へ戻る':target.name+'の接近を受信';meteoText('battleStartReason',held?'進行中の保安・MAGI案件を引き継いでください。':'現在の都市・EVAの資源と損傷を引き継ぐ独自シミュレーションです。');
  meteoText('battleResult',({victory:'目標沈黙 / '+(a?.name||d.enemy?.code||'')+' / '+d.last,defeat:'防衛失敗 / '+d.last,active:'迎撃進行中 / '+d.last,idle:'作戦待機 / 保存済みの経過を表示'}[d.status]));
  const recordKey=JSON.stringify(d.history);if(lastRecord!==recordKey){lastRecord=recordKey;$('battleRecords').replaceChildren();for(const row of d.history.slice(0,8)){const p=document.createElement('p');p.textContent='T'+row.t+' / '+row.txt;$('battleRecords').append(p);}}
  stage.sync();
 }
 $('battleDo').addEventListener('click',execute);
 async function setWeapon(choice){const previous=armamentSelected;const r=await commandOperation(()=>{armamentSelected=choice;S.prefs.selectedWeapon=choice;});if(!r.ok)armamentSelected=previous;feedback=r.ok?'装備：'+weapons[armamentSelected]:r.error;renderArmament();render();return r;}
 all('[data-battle-weapon]').forEach(b=>b.addEventListener('click',()=>{if(!busy)setWeapon(b.dataset.battleWeapon);}));
 $('battleUnit').addEventListener('change',async e=>{const unit=Number(e.target.value);if(![0,1,2].includes(unit))return;await commandOperation(()=>{if(S.defense.connected&&typeof S.evas[S.tactics.attacker].umbilical!=='boolean')S.evas[S.tactics.attacker].umbilical=true;S.tactics.attacker=unit;S.selectedEva=unit;S.defense.connected=!!S.evas[unit].umbilical;if(S.tactics.defender===unit)S.tactics.defender=(unit+1)%3;staffInvalidateDecision();});render();});
 $('battleCable').addEventListener('click',()=>commandOperation(()=>toggleEvaCable(S.tactics.attacker)));
 all('[data-battle-target]').forEach(b=>b.addEventListener('click',()=>{selectedTarget=b.dataset.battleTarget;render();}));
 $('battleStart').addEventListener('click',async()=>{if(busy)return;if(S.defense.status==='active'){NERV_MOBILE.open('battle','engage');return;}busy=true;render();try{const r=await worldAction('angel.start.'+selectedTarget);if(r.ok){feedback='対象を受信。装備と担当機を確認して手順を開始してください。';NERV_MOBILE.open('battle','engage');}}finally{busy=false;render();}});
 for(const id of ['battleAlertReview','battleCloseOperation'])$(id).addEventListener('click',openAlertReview);
 const entry=document.createElement('button');entry.id='battleEntrance';entry.className='staff-primary';entry.dataset.opsRoute='battle/engage';entry.textContent='EVA戦闘専用画面 ↗';$('commandLauncher').prepend(entry);
 for(const b of all('[data-ops-route="mission/engagement"]'))b.dataset.opsRoute='battle/engage';
 $('angelStart').addEventListener('click',async event=>{event.stopImmediatePropagation();if(S.defense.status==='active'){NERV_MOBILE.open('battle','engage');return;}const chosen=qs('[data-angel-select][aria-pressed="true"]')?.dataset.angelSelect||'sachiel';const r=await worldAction('angel.start.'+chosen);if(r.ok)NERV_MOBILE.open('battle','engage');},true);
 document.addEventListener('click',event=>{const target=event.target.closest?.('#alertTarget');if(!target)return;const alert=terminalAlert();if(alert.key==='enemy-'+S.defense.caseNo||alert.key?.startsWith('angel-')){event.preventDefault();event.stopImmediatePropagation();closeAlertReview();NERV_MOBILE.open('battle','engage');}},true);
 const oldDraw=draw;draw=function(){oldDraw();render();};window.addEventListener('nerv-route',()=>{render();if(currentPage==='battle'){const panel=qs('.battle-page .mobile-view:not([hidden])');NERV_MOTION.tween('battle-panel',0,1,v=>{panel.style.opacity=String(.7+.3*v);panel.style.transform=v===1?'':'translateY('+(5*(1-v))+'px)';},panel,260,{ease:anime.eases.out(3),composition:'replace'});}});window.addEventListener('nerv-world-ready',render);
 window.addEventListener('nerv-confirmed-hit',event=>{if(currentPage!=='battle')return;const hit=event.detail;feedback='命中 '+hit.damage+' / 目標残 '+hit.remaining;render();NERV_MOTION.animate('battle-hit-'+(++hitSerial),effect,{recoil:[-5,0],flash:[1,0],duration:560,ease:'outExpo',composition:'blend',onUpdate:()=>{$('battleEvaSprite').parentElement.style.transform='translateX('+effect.recoil+'px)';$('battleImpact').style.opacity=String(Math.min(1,effect.flash));},onComplete:()=>{if(!NERV_MOTION.snapshot().active){effect.recoil=0;effect.flash=0;}$('battleEvaSprite').parentElement.style.transform='';$('battleImpact').style.opacity='0';}},$('battleStage'));});
 function restore(){const [p,v]=location.hash.slice(1).split('/');if(p==='battle')NERV_MOBILE.open('battle',v);}
 window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
 window.NERV_BATTLE={snapshot:()=>({page:currentPage,view:mobileCurrent.battle,plan:currentPlan?{...currentPlan}:null,busy,stage:stage.snapshot()}),execute};render();restore();
 v215Panel('settings','motion','補間・速度','<h2>UI演出の速度</h2><p class="staff-note">パネル展開・街区収容・命中の補間速度だけを変更します。敵ターン・業務・通信・内部電源の時間は変わりません。</p><div class="cadence-presets">'+[.5,1,1.5].map(v=>'<button data-motion-speed="'+v+'">'+v+'×</button>').join('')+'</div><p id="motionSpeedReadout" class="staff-guide"></p><p class="staff-note">画面外・非表示中は停止。低モーションでは状態を静止表示します。描画が重い場合は映像品質の省電力を使用してください。</p><button class="staff-secondary" data-ops-route="settings/effects">映像品質 ↗</button>');
 function speedRender(){for(const b of all('[data-motion-speed]'))b.setAttribute('aria-pressed',String(Number(b.dataset.motionSpeed)===NERV_MOTION.speed()));meteoText('motionSpeedReadout','演出速度 '+NERV_MOTION.speed()+'× / '+(isMoving()?'補間表示':'低モーション・静止表示'));}
 all('[data-motion-speed]').forEach(b=>b.addEventListener('click',async()=>{await commandOperation(()=>{S.prefs.fxSpeed=Number(b.dataset.motionSpeed);});window.dispatchEvent(new Event('nerv-motion-speed'));speedRender();}));window.addEventListener('nerv-route',speedRender);speedRender();
}
initV216Battle();
