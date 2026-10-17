// v2.7: tactical handoff + cross-system action links + corrected shield tracking.
const v26DefaultTactics=()=>({attacker:1,defender:0,posture:'balanced',charge:0,heat:0,scans:0,shots:0,history:[]});
S.tactics={...v26DefaultTactics(),...(S.tactics&&typeof S.tactics==='object'?S.tactics:{})};
if(!['balanced','defense','assault'].includes(S.tactics.posture))S.tactics.posture='balanced';
for(const role of ['attacker','defender']){if(![0,1,2].includes(Number(S.tactics[role])))S.tactics[role]=role==='attacker'?1:0;else S.tactics[role]=Number(S.tactics[role]);}
if(S.tactics.attacker===S.tactics.defender)S.tactics.defender=(S.tactics.attacker+1)%3;
S.tactics.charge=Math.min(100,Math.max(0,Number(S.tactics.charge)||0));S.tactics.heat=Math.min(100,Math.max(0,Number(S.tactics.heat)||0));S.tactics.scans=Math.min(3,Math.max(0,Number(S.tactics.scans)||0));S.tactics.shots=Math.max(0,Number(S.tactics.shots)||0);
if(S.mission.phase>=5&&!S.tactics.charge&&!S.tactics.shots)S.tactics.charge=80; // migration of an already advanced v2.5 mission
const v26UnitName=i=>['零号機','初号機','弐号機'][Number(i)]||'不明';
const v26Meter=n=>Math.max(0,Math.min(100,Math.round(Number(n)||0)));
const v26Clamp=(n,l,h)=>Math.min(h,Math.max(l,n));
const v26Loc=(s)=>$(s)||null;
const v26After=(selector,content,position='afterend')=>{const x=qs(selector);if(!x)throw Error('Missing v2.7 anchor: '+selector);x.insertAdjacentHTML(position,content);};
const v26Route=(active)=>`<div class="v26-route" aria-label="管制横断ナビゲーション">
<button data-v26go="mission" class="${active==='mission'?'active-route':''}">⌖ 作戦指揮<small>TACTICAL COMMAND ↗</small></button>
<button data-v26go="eva" class="${active==='eva'?'active-route':''}">◈ EVA運用<small>UNIT OPERATIONS ↗</small></button>
<button data-v26go="magi" class="${active==='magi'?'active-route':''}">△ MAGI審議<small>THREE CORE SYSTEM ↗</small></button></div>`;
function v26Build(){
 // The field is tied to the very same artwork rig, not to the containing page or scan animation.
 v26After('#evaSvg .eva-reference-rig',`<div class="v26-at-field" aria-hidden="true"><svg viewBox="0 0 200 200"><g class="at-axis"><path d="M100 0V200M0 100H200"/></g><polygon class="at-shell outer" points="42,1 158,1 199,42 199,158 158,199 42,199 1,158 1,42"/><polygon class="at-shell" points="48,18 152,18 182,48 182,152 152,182 48,182 18,152 18,48"/><polygon class="at-shell inner" points="58,38 142,38 162,58 162,142 142,162 58,162 38,142 38,58"/><circle cx="100" cy="100" r="22" stroke="#ffe7af" stroke-width="1.3" stroke-dasharray="2 4" fill="none"/></svg><strong>A.T.FIELD / DEPLOYED</strong></div>`, 'beforeend');
 ['home','eva','magi','mission','infra'].forEach(p=>v26After(`.page[data-page="${p}"] .page-top`,v26Route(p)));
 v26After('.page[data-page="home"] .nx-station',`<section class="v26-box" aria-label="作戦概況 / 連携管制">
 <div class="v26-heading"><b>戦術指揮ダイジェスト<small>INTERLOCKED DEFENSE / SIMULATOR</small></b><span id="v26HomePhase">PHASE 00</span></div>
 <div class="v26-readouts"><div><small>作戦即応度</small><b id="v26HomeReady">--</b></div><div><small>陽電子砲蓄電</small><b id="v26HomeCharge">--</b></div><div><small>迎撃要員</small><b id="v26HomeUnits">--</b></div></div>
 <div class="v26-matrix" id="v26HomeNext"></div><div class="v26-row"><button data-v26go="mission">作戦計画を開く ↗</button><button data-v26go="magi">MAGI審議へ ↗</button></div></section>`);
 v26After('.page[data-page="mission"] .threat-card',`<section class="v26-box" id="v26WarRoom"><div class="v26-heading"><b>作戦戦略盤<small>YASHIMA OPERATION / TACTICAL DECISIONS</small></b><span>SIMULATION DATA</span></div>
 <div class="v26-readouts"><div><small>作戦即応度</small><b id="v26Readiness">--</b></div><div><small>迎撃火器蓄電</small><b id="v26Charge">--</b></div><div><small>砲身熱負荷</small><b id="v26Heat">--</b></div></div>
 <div class="v26-radarline"><i></i><span>FUTAGYAMA / TARGET BEARING / SIM</span></div>
 <div class="v26-role-select"><label>攻撃主担当 / ATTACKER<select id="v26Attacker" aria-label="攻撃主担当"></select></label><label>防御支援 / SHIELD<select id="v26Defender" aria-label="防御支援担当"></select></label></div>
 <div class="v26-stage-mark">戦術方針 / DOCTRINE</div>
 <div class="v26-controls" id="v26Postures"><button data-posture="defense">防御優先</button><button data-posture="balanced">均衡運用</button><button data-posture="assault">速攻狙撃</button></div>
 <div class="v26-doctrine" id="v26Doctrine">OPERATIONAL GUIDANCE</div>
 <div class="v26-stage-mark">電力集約 / POWER ROUTING</div><div class="v26-meter" role="meter" aria-label="陽電子砲蓄電率" aria-valuemin="0" aria-valuemax="100" id="v26ChargeMeter"><i id="v26ChargeFill"></i></div>
 <div class="v26-row"><button id="v26ChargeAction">⚡ 集電・充填 / CHARGE</button><button id="v26CoolAction">◌ 放熱・冷却 / COOL</button></div>
 <div class="v26-row"><button id="v26ReconAction">⌖ 対象分析 / SCAN</button><button data-v26go="eva">◈ EVA配置 / MANAGE</button></div>
 <div class="v26-grid-data"><div><small>索敵解析</small><b id="v26Recon">--</b></div><div><small>防御展開</small><b id="v26Defense">--</b></div><div><small>照準補正</small><b id="v26Locks">--</b></div></div>
 <div class="v26-tactical-status" id="v26WarStatus">戦術条件を解析中</div><p class="v26-source">設定資料: ヤシマ作戦の攻撃=初号機、防御=零号機、電力集約。数値・熱負荷・即応度は本アプリ独自の模擬ゲーム値。</p></section>`);
 v26After('.page[data-page="eva"] .eva-display',`<section class="v26-box"><div class="v26-heading"><b>出撃連携・支援配置<small>DEPLOYMENT / ROLE HANDOFF</small></b><span>SIM / LIVE STATE</span></div>
 <div class="v26-readouts"><div><small>現在機の役割</small><b id="v26UnitRole">RESERVE</b></div><div><small>作戦段階</small><b id="v26EvaPhase">00</b></div><div><small>A.T. 防護</small><b id="v26EvaShield">OFFLINE</b></div></div>
 <div class="v26-row"><button data-v26assign="attacker">この機体を攻撃担当に</button><button data-v26assign="defender">この機体を防御担当に</button></div>
 <div class="v26-matrix" id="v26EvaMatrix"></div><div class="v26-row"><button data-v26go="mission">⌖ 作戦へ / RETURN</button><button data-v26go="magi">△ MAGI審議へ</button></div></section>`);
 v26After('.page[data-page="magi"] .magi-live-track',`<section class="v26-box"><div class="v26-heading"><b>作戦承認・整合分析<small>DECISION SUPPORT / TRI-CORE REVIEW</small></b><span>SIMULATED VOTES</span></div>
 <div class="v26-readouts"><div><small>出撃審議対象</small><b id="v26MagiUnit">--</b></div><div><small>攻撃担当</small><b id="v26MagiAttack">--</b></div><div><small>作戦計画</small><b id="v26MagiPosture">--</b></div></div>
 <div class="v26-matrix" id="v26MagiMatrix"></div>
 <div class="v26-row"><button id="v26ChooseAttack">攻撃担当を審議対象に</button><button data-v26go="eva">EVA運用へ戻る ↗</button></div>
 <div class="v26-doctrine">三基合議は作品を参考に再構成。MELCHIOR＝科学者、BALTHASAR＝母、CASPER＝女。各基のゲーム内審議条件は独自ロジック。</div></section>`);
 v26After('.page[data-page="infra"] .nx-infra',`<section class="v26-box"><div class="v26-heading"><b>兵站 / 作戦送電網<small>LOGISTICS / GEOFRONT DEFENSE</small></b><span>SIMULATED</span></div><div class="v26-readouts"><div><small>送電状態</small><b id="v26InfraPower">--</b></div><div><small>作戦蓄電</small><b id="v26InfraCharge">--</b></div><div><small>系統安定</small><b id="v26InfraQuality">--</b></div></div><div class="v26-row"><button data-v26go="mission">⌖ 作戦へ</button><button data-v26go="magi">△ MAGI管制へ</button></div></section>`);
}
function v26SetRows(id,items){const el=$(id);el.replaceChildren();for(const [name,val,ok] of items){const d=document.createElement('div'),a=document.createElement('span'),b=document.createElement('b');a.textContent=name;b.textContent=val;b.classList.toggle('fail',!ok);d.append(a,b);el.append(d)}}
function v26Snapshot(){const t=S.tactics,p=S.mission.phase,attack=S.evas[t.attacker],defense=S.evas[t.defender];
 const readyAttack=attack?.state==='DEPLOYED';const activeShield=defense?.state==='DEPLOYED'&&!!defense.at;
 const aligned=S.infra.power&&S.infra.comms;
 const quality=v26Meter(S.ops.gridQuality||0);
 let score=10+(S.infra.power?13:0)+(S.infra.comms?9:0)+(S.infra.armor?8:0)+(readyAttack?18:0)+(activeShield?9:0)+Math.min(15,Math.round(t.charge*.15))+(S.ops.currentMissionLocks>0?12:0)+Math.min(6,t.scans*2)+(quality>=75?4:0)-Math.floor(t.heat/12);
 score=v26Clamp(score,0,100);
 return {t,p,attack,defense,readyAttack,activeShield,aligned,score,quality};}
function v26Render(){if(!$('v26WarRoom'))return;const o=v26Snapshot(),t=o.t,p=o.p;
 const put=(id,v)=>{const e=$(id);if(e)e.textContent=String(v)};
 put('v26Readiness',o.score+' /100');put('v26Charge',t.charge+'%');put('v26Heat',t.heat+'%');put('v26Recon',Math.min(3,t.scans)+' /3');put('v26Defense',o.activeShield?'FIELD ON':'STANDBY');put('v26Locks',S.ops.currentMissionLocks+' LOCK');
 put('v26HomePhase','PHASE '+String(p).padStart(2,'0'));put('v26HomeReady',o.score+'/100');put('v26HomeCharge',t.charge+'%');put('v26HomeUnits',S.evas.filter(x=>x.state==='DEPLOYED').length+'/3');
 put('v26EvaPhase',String(p).padStart(2,'0'));put('v26EvaShield',selected().at&&selected().state==='DEPLOYED'?'ACTIVE':'STANDBY');
 put('v26UnitRole',t.attacker===S.selectedEva?'ATTACK':t.defender===S.selectedEva?'DEFENSE':'RESERVE');
 put('v26MagiUnit','UNIT-0'+S.selectedEva);put('v26MagiAttack','UNIT-0'+t.attacker);put('v26MagiPosture',{balanced:'BALANCED',defense:'DEFENSIVE',assault:'ASSAULT'}[t.posture]);
 put('v26InfraPower',S.infra.power?'ONLINE':'OFFLINE');put('v26InfraCharge',t.charge+'%');put('v26InfraQuality',o.quality+'%');
 $('v26ChargeFill').style.width=t.charge+'%';$('v26ChargeMeter').setAttribute('aria-valuenow',String(t.charge));
 $('v26Attacker').value=String(t.attacker);$('v26Defender').value=String(t.defender);
 all('[data-posture]').forEach(b=>b.classList.toggle('chosen',b.dataset.posture===t.posture));
 const roleRows=[['攻撃',v26UnitName(t.attacker)+' / '+o.attack.state,o.readyAttack],['防御',v26UnitName(t.defender)+' / '+(o.activeShield?'A.T.展開中':'A.T.待機'),o.activeShield],['審議承認',S.magi.approvedFor===t.attacker?'UNIT-0'+t.attacker+' 承認済み':'攻撃担当の出撃未承認',S.magi.approvedFor===t.attacker],['電源・通信',o.aligned?'ALL GREEN':'配電系統を点検',o.aligned]];
 v26SetRows('v26HomeNext',roleRows.slice(0,3));v26SetRows('v26EvaMatrix',roleRows);v26SetRows('v26MagiMatrix',[['BALTHASAR / 母',S.infra.power&&selected().state==='READY'?'条件適合':'再評価が必要',S.infra.power&&selected().state==='READY'],['CASPER / 女',S.infra.armor&&S.infra.comms?'防護網確保':'防護・通信を要確認',S.infra.armor&&S.infra.comms],['MELCHIOR / 科学者',S.infra.power&&selected().power>=240?'技術条件適合':'電力条件要確認',S.infra.power&&selected().power>=240],['承認の有効範囲','選択中のUNIT-0'+S.selectedEva+' のみ',true]]);
 $('v26Doctrine').textContent={defense:'防御を優先。充電は低発熱、敵に対する防護は強化されるが、狙撃の準備が遅くなる。',balanced:'攻守を均衡。充電速度と熱負荷のバランスを取り、機体配備とA.T.展開を合わせる。',assault:'速攻狙撃。蓄電速度は上がるが熱負荷が増える。放熱管理が必要。'}[t.posture];
 const problems=[];if(!o.aligned)problems.push('都市の電力・通信を復旧');if(!o.readyAttack)problems.push('攻撃担当機を出撃させる');if(t.charge<70)problems.push('陽電子砲に70%以上蓄電');if(t.heat>=80)problems.push('砲身を冷却');if(!S.ops.currentMissionLocks&&p>=4)problems.push('照準をロック');
 $('v26WarStatus').textContent=problems.length?'未達条件：'+problems.join(' / '):'FIRE CONTROL READY / 全必須条件を達成。防御機のA.T.展開で即応評価が向上。';
 $('v26ChargeAction').disabled=!S.infra.power||p<2||p===6||t.charge>=100||t.heat>=95;
 $('v26CoolAction').disabled=t.heat===0;
 $('v26ReconAction').disabled=p===0||p>=6||t.scans>=3;
}
function v26ChargeAction(){const t=S.tactics;if(!S.infra.power||S.mission.phase<2||S.mission.phase>=6)return toast('作戦PHASE 02以降で送電系統を確保してください');
 if(t.heat>=95)return toast('熱負荷上限です。先に冷却してください');
 const base={defense:15,balanced:22,assault:29}[t.posture];const heat={defense:9,balanced:15,assault:24}[t.posture];
 const delta=base+Math.round((S.ops.gridQuality||0)/25);
 t.charge=v26Clamp(t.charge+delta,0,100);t.heat=v26Clamp(t.heat+heat,0,100);
 addLog('mission','POSITRON CHARGE '+t.charge+'% / HEAT '+t.heat+'%');sound(t.heat>=80?'warning':'scan');draw();}
function v26Cool(){const t=S.tactics;t.heat=Math.max(0,t.heat-(t.posture==='defense'?28:22));addLog('mission','COOLING / BARREL THERMAL LOAD '+t.heat+'%');sound('scan');draw()}
function v26Scan(){if(S.mission.phase===0||S.mission.phase>=6)return toast('作戦が進行している場合のみ索敵可能');
 if(S.tactics.scans>=3)return toast('敵性反応の解析は完了しています');S.tactics.scans++;addXP(3,'TARGET SCAN '+S.tactics.scans+'/3');addLog('mission','HOSTILE ANALYSIS / '+S.tactics.scans+' of 3');sound('scan');draw();}
function v26Assign(role,unit){const t=S.tactics;unit=Number(unit);if(!Number.isInteger(unit)||unit<0||unit>2)return;
 if((role==='attacker'&&unit===t.defender)||(role==='defender'&&unit===t.attacker)){toast('攻撃担当と防御担当は別の機体にしてください');sound('deny');v26Render();return}
 t[role]=unit;addLog('mission',(role==='attacker'?'ATTACK':'SHIELD')+' UNIT-0'+unit+' ASSIGNED');sound('ok');persist();draw()}
function v26Init(){v26Build();const ops=[0,1,2].map(i=>`<option value="${i}">UNIT-0${i} / ${v26UnitName(i)}</option>`).join('');$('v26Attacker').innerHTML=ops;$('v26Defender').innerHTML=ops;
 all('[data-v26go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.v26go)));
 all('[data-v26assign]').forEach(b=>b.addEventListener('click',()=>v26Assign(b.dataset.v26assign,S.selectedEva)));
 $('v26Attacker').addEventListener('change',e=>v26Assign('attacker',Number(e.target.value)));
 $('v26Defender').addEventListener('change',e=>v26Assign('defender',Number(e.target.value)));
 all('[data-posture]').forEach(b=>b.addEventListener('click',()=>{S.tactics.posture=b.dataset.posture;addLog('mission','STRATEGY / '+b.dataset.posture.toUpperCase());sound('tap');draw()}));
 $('v26ChargeAction').addEventListener('click',v26ChargeAction);$('v26CoolAction').addEventListener('click',v26Cool);$('v26ReconAction').addEventListener('click',v26Scan);
 $('v26ChooseAttack').addEventListener('click',()=>{S.selectedEva=S.tactics.attacker;sound('select');draw();toast('UNIT-0'+S.selectedEva+' を審議対象に設定しました')});
 // Capture before v2.5 mission event; a fire command now needs actual strategic preparation.
 $('missionAction').addEventListener('click',evt=>{if(S.mission.phase!==5)return;const o=v26Snapshot(),fail=[];
 if(!o.readyAttack)fail.push('攻撃担当EVAが出撃していません');if(o.t.charge<70)fail.push('陽電子砲の蓄電が70%未満です');if(o.t.heat>=80)fail.push('砲身過熱です');
 if(fail.length){evt.preventDefault();evt.stopImmediatePropagation();toast(fail.join(' / '));sound('deny');go('mission');return}
 setTimeout(()=>{if(S.mission.phase===6){S.tactics.shots++;S.tactics.charge=0;S.tactics.heat=35;addLog('mission','POSITRON DISCHARGE / SHOT '+S.tactics.shots+' / COMPLETED');draw()}},0);
 },true);
 $('missionReset').addEventListener('click',()=>{S.tactics.charge=0;S.tactics.heat=0;S.tactics.scans=0;draw()});
 const previous=draw;draw=function(){previous();v26Render()};
 v26Render();
}

if(qs('#evaSvg .eva-reference-rig')) v26Init();
