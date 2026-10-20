/* ===== v2.7 TACTICAL DEFENSE NETWORK (FICTIONAL / LOCAL) ===== */
const V27_SCENARIOS=[
 {name:'接近型 / INTRUSION VECTOR',code:'UNIDENTIFIED-α',bearing:'北東',hp:115,force:28,dist:5,lane:1},
 {name:'高出力反応 / ENERGY EMITTER',code:'UNIDENTIFIED-β',bearing:'北西',hp:145,force:38,dist:5,lane:0},
 {name:'侵入型 / SUBTERRANEAN',code:'UNIDENTIFIED-γ',bearing:'東側',hp:130,force:33,dist:4,lane:2}
];
const V27_FACILITY=[{name:'西防壁',short:'WEST',max:100},{name:'中央兵装',short:'BATTERY',max:100},{name:'東迎撃区',short:'EAST',max:100},{name:'ジオフロント',short:'HQ',max:100}];
const v27Default=()=>({status:'idle',caseNo:0,round:0,scans:0,selected:1,energy:70,parts:120,spares:2,security:85,breach:0,connected:false,shutdown:false,magivote:null,magiround:-1,enemy:null,city:[{hp:100,armor:false,turret:false},{hp:100,armor:false,turret:false},{hp:100,armor:false,turret:false},{hp:100,armor:true,turret:false}],history:[],wins:0,losses:0,alert:false,usedV27Shot:false,securityPuzzle:0,last:'待機中 / SIMULATION IDLE'});
function v27Normalize(){const raw=(S.defense&&typeof S.defense==='object')?S.defense:{};const d={...v27Default(),...raw};const bounded=(n,lo=0,hi=100)=>Math.round(Math.max(lo,Math.min(hi,Number(n)||0)));
 d.energy=bounded(d.energy);d.parts=bounded(d.parts,0,999);d.spares=bounded(d.spares,0,9);d.security=bounded(d.security);d.scans=bounded(d.scans);d.round=bounded(d.round,0,200);d.breach=bounded(d.breach,0,100);d.selected=bounded(d.selected,0,3);d.caseNo=bounded(d.caseNo,0,999);d.wins=bounded(d.wins,0,999);d.losses=bounded(d.losses,0,999);
 d.city=V27_FACILITY.map((f,i)=>{const c=Array.isArray(raw.city)?raw.city[i]:null;return {hp:bounded(c?.hp??100),armor:!!c?.armor,turret:!!c?.turret};});
 if(!['idle','active','victory','defeat'].includes(d.status))d.status='idle';if(!Array.isArray(d.history))d.history=[];d.history=d.history.slice(0,24);if(d.status==='active'&&!d.enemy)d.status='idle';
 if(d.enemy){d.enemy={...d.enemy,hp:bounded(d.enemy.hp,0,300),maxHp:bounded(d.enemy.maxHp,1,300),dist:bounded(d.enemy.dist,0,9),lane:bounded(d.enemy.lane,0,2),force:bounded(d.enemy.force,0,100)}};
 S.defense=d;return d;}
const v27D=v27Normalize();
// Transfer the legacy shared cable flag before a new case resets defense state.
S.evas.forEach((e,i)=>{if(typeof e.umbilical!=='boolean')e.umbilical=!!(v27D.connected&&S.tactics.attacker===i);});
const v27Clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const v27Num=(n)=>Math.round(Number(n)||0);
function v27Record(s){const d=S.defense;d.last=s;d.history.unshift({at:hhmmss(),t:d.round,txt:s.slice(0,88)});d.history=d.history.slice(0,24);addLog('mission','CITY DEFENSE / '+s);}
function v27SectorSVG(i,cx,cy){const fac=V27_FACILITY[i];const halfW=i===3?77:57;const halfH=i===3?39:28;const depth=i===3?59:42;const l=cx-halfW,r=cx+halfW,t=cy-halfH,b=cy+halfH;return `<g class="v27-building" data-v27pick="${i}" data-selected="false" role="button" tabindex="0" aria-label="${fac.name}を選択">
 <polygon class="v27-left" points="${l},${cy} ${cx},${b} ${cx},${b+depth} ${l},${cy+depth}"/>
 <polygon class="v27-right" points="${cx},${b} ${r},${cy} ${r},${cy+depth} ${cx},${b+depth}"/>
 <polygon class="v27-top" points="${cx},${t} ${r},${cy} ${cx},${b} ${l},${cy}"/>
 <path d="M${cx-12} ${cy}h24 M${cx} ${cy-10}v20" stroke="#86d7b5" stroke-width="1.5" opacity=".8"/>
 <circle cx="${r-9}" cy="${cy+depth-5}" r="5" fill="#ffb46e" opacity=".7"/>
 <text x="${cx}" y="${b+depth+20}" text-anchor="middle">${fac.short}</text>
 <rect x="${l-4}" y="${t-4}" width="${halfW*2+8}" height="${halfH*2+depth+12}" fill="transparent"/></g>`;}
function v27MapMarkup(){let grid='';for(let x=-400;x<=1000;x+=48)grid+=`<path class="grid-line" d="M${x} 0l430 430M${x} 0l-430 430"/>`;
 return `<svg class="v27-map" id="v27IsoMap" viewBox="0 0 680 445" preserveAspectRatio="xMidYMid meet" role="group" aria-label="第3新東京市の2.5D模擬戦術地図。施設をタップして選択できます">
 <defs><radialGradient id="v27MapHalo"><stop stop-color="#0f3b32"/><stop offset="1" stop-color="#021015"/></radialGradient></defs><rect width="680" height="445" fill="url(#v27MapHalo)"/>${grid}
 <g opacity=".8"><path d="M340 70L618 207 340 355 62 207Z" fill="#07262a" stroke="#388c7c" stroke-width="3"/><path d="M340 90L588 207 340 337 92 207Z" fill="none" stroke="#276963" stroke-dasharray="10 7" stroke-width="2"/></g>
 <circle cx="340" cy="207" r="125" class="v27-threat-ring"/><circle cx="340" cy="207" r="180" class="v27-threat-ring" opacity=".25"/><line x1="340" y1="207" x2="514" y2="207" class="v27-sweep"/>
 <path id="v27PowerLine" class="v27-powerline" d="M340 295L181 209L340 125L500 209L340 295"/>
 ${v27SectorSVG(0,181,198)}${v27SectorSVG(1,340,125)}${v27SectorSVG(2,500,198)}${v27SectorSVG(3,340,278)}
 <g id="v27Enemy" class="v27-enemy v27-visual-off" transform="translate(530 35)"><text id="mapEnemyName" class="map-enemy-label" text-anchor="middle" y="-44">HOSTILE</text><circle r="29" class="v27-threat-ring"/><polygon points="0,-22 21,0 0,22 -21,0"/><circle r="6" fill="#1a120e"/><path d="M-38 0H38M0 -38V38" stroke="#ff684e" stroke-width="1.6" opacity=".8"/></g>
 <path class="v27-aim" d="M10 58V10H58M622 10h48v48M10 389v46h48M622 435h48v-46"/>
 <text class="v27-map-text" x="15" y="25">NERV / MUNICIPAL TACTICAL GRID</text><text class="v27-map-text" x="15" y="420">RENDER : 2.5D / SIMULATED</text><text class="v27-map-text" x="530" y="420">TOKYO-3</text>
 </svg>`;}
function v27Build(){
 const main=`<section class="v27-plate" id="v27DefenseBoard" aria-label="第3新東京市統合防衛戦術盤"><div class="v27-head"><b>第三新東京市 総合防衛盤<small>TOKYO-3 / TACTICAL DEFENSE NETWORK</small></b><span id="v27Status" class="v27-chip">STANDBY</span></div>
 <div class="v27-kpi"><div><small>敵接近 / ETA</small><strong id="v27ETA">--</strong></div><div><small>都市健全性</small><strong id="v27CityHP">--</strong></div><div><small>防衛電力</small><strong id="v27Energy">--</strong></div><div><small>資材 / SUPPLY</small><strong id="v27Parts">--</strong></div></div>
 ${v27MapMarkup()}
 <div class="v27-readbar"><span id="v27RadarSignal">SIGNAL : NO TARGET</span><b id="v27MapDetail">SCANNING / 0%</b></div>
 <div class="v27-lanes" id="v27Facilities">${V27_FACILITY.map((f,i)=>`<button data-v27pick="${i}">${f.name}<small id="v27Sector${i}">HP 100 / 100</small></button>`).join('')}</div>
 <div class="v27-split"><div class="v27-sub"><label>SELECTED FACILITY</label><b id="v27Selected">---</b><div class="v27-stat bad"><i id="v27SelectedHP"></i></div></div><div class="v27-sub"><label>敵性識別・解析</label><b id="v27EnemyLabel">UNKNOWN</b><div class="v27-stat"><i id="v27ScanBar"></i></div></div></div>
 <div class="v27-tools" id="defenseTools"><button id="v27Detect">◆ 新規敵性反応 / DETECT</button><button id="v27Scan">⌖ 波形・A.T.分析 / SCAN</button><button id="v27Armor">▣ 装甲を展開 / ARMOR</button><button id="v27Turret">⚑ 迎撃砲台 / DEPLOY</button><button id="v27Power">⚡ 補助電力 / RESERVE</button><button id="v27Repair">✚ 施設の応急修理 / REPAIR</button><button id="v27Cable">⛓ EVA電源ケーブル / CONNECT</button><button id="v27Shot">◎ EVA支援射撃 / SUPPORT</button></div>
 <button class="v27-long" id="v27Advance">▸ 作戦時間を進める / ADVANCE TURN</button><div class="v27-story" aria-live="polite" id="v27Story">命令待機 / DISPATCH IDLE</div>
 <div class="v27-kpi" id="defenseTurnStats" style="margin-top:8px"><div><small>経過ターン</small><strong id="v27Turn">00</strong></div><div><small>兵装稼働</small><strong id="v27Turrets">0/3</strong></div><div><small>予備送電</small><strong id="v27Reserve">2</strong></div><div><small>MAGIセキュリティ</small><strong id="v27Security">85%</strong></div></div>
 <div class="v27-tools" id="defenseLinks"><button data-v27jump="magi">△ MAGIシステムへ ↗</button><button data-v27jump="eva">◈ EVA兵站・運用へ ↗</button><button data-v27jump="mission">⌖ ヤシマ作戦へ ↗</button><button data-v27jump="home">⌂ 統合ホーム ↗</button></div>
 <section class="v27-mini"><h3>作戦履歴 / AFTER ACTION</h3><p id="v27Report">迎撃成功・損害・補給の履歴。施設ダメージは次の作戦へ持ち越されます。</p><div id="v27History" class="v27-history"></div></section>
 <p class="v26-source">非公式ファン制作・全て架空の作戦訓練。気象警報・現実の防災情報とは接続していません。敵の名称・能力・資源量はゲーム独自設定です。</p></section>`;
 const after=(selector,html)=>{const e=qs(selector);if(!e)throw Error('v2.7 missing anchor '+selector);e.insertAdjacentHTML('afterend',html)};
 after('.page[data-page="infra"] .page-top',main);
 all('[data-v27jump]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.v27jump)));
 all('[data-v27pick]').forEach(el=>{el.addEventListener('click',()=>{S.defense.selected=Number(el.dataset.v27pick);sound('select');draw()});if(el.tagName.toLowerCase()==='g')el.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();S.defense.selected=Number(el.dataset.v27pick);draw()}})});
 const handlers={v27Detect:v27Detect,v27Scan:v27Scan,v27Armor:v27Armor,v27Turret:v27Turret,v27Power:v27Power,v27Repair:v27Repair,v27Cable:v27Cable,v27Shot:v27Shot,v27Advance:v27Advance,v27MagiJudge:v27Judge,v27SecDetect:v27Trace};Object.entries(handlers).forEach(([id,fn])=>$(id)?.addEventListener('click',fn));
 all('[data-v27isolate]').forEach(el=>el.addEventListener('click',()=>v27Isolate(Number(el.dataset.v27isolate))));
}
function v27Profile(){return V27_SCENARIOS[(S.defense.caseNo-1+V27_SCENARIOS.length)%V27_SCENARIOS.length];}
function v27Spend(amount){if(!S.infra.power){toast('都市主電源が停止中。管制画面から復旧してください');sound('deny');return false;}if(S.defense.energy<amount){toast('防衛電力が不足 / '+amount+'必要');sound('deny');return false}S.defense.energy-=amount;return true}
function v27Finish(won,why){const d=S.defense;if(d.status!=='active')return;d.status=won?'victory':'defeat';if(won&&S.mission.phase>0&&S.mission.phase<6){S.mission.phase=6;if(!S.ops.missionAwarded){S.ops.missions++;S.ops.missionAwarded=true;}addLog('mission','地上迎撃・EVA連携 / 作戦完了');}if(won){d.wins++;d.parts=v27Clamp(d.parts+34,0,999);d.energy=v27Clamp(d.energy+20);addXP(45+Math.round(v27CityIntegrity()/4),'CITY DEFENSE SUCCESS');}else{d.losses++;d.parts=v27Clamp(d.parts+12,0,999);d.breach=v27Clamp(d.breach+20)}v27Record((won?'作戦成功 / ':'防衛失敗 / ')+why);sound(won?'done':'warning');draw();}
function v27Detect(){const d=S.defense;if(d.status==='active'){toast('迎撃作戦進行中。完了後に次の反応を検知できます');return}d.caseNo++;const x=v27Profile();d.status='active';d.round=0;d.scans=0;d.magivote=null;d.magiround=-1;d.shutdown=false;d.usedV27Shot=false;d.enemy={hp:x.hp,maxHp:x.hp,dist:x.dist,force:x.force,lane:x.lane,code:x.code};d.energy=v27Clamp(d.energy+20);d.breach=0;v27Record('敵性反応を検出 / 分析前の推定進路 '+x.bearing+' / CASE '+d.caseNo);sound('warning');draw()}
function v27Scan(){const d=S.defense;if(d.status!=='active')return toast('敵性反応を先に検知してください');if(!v27Spend(12))return;d.scans=v27Clamp(d.scans+34);if(d.scans>=70)S.tactics.scans=Math.max(S.tactics.scans,2);v27Record('多層波形解析 '+d.scans+'% / '+(d.scans>=68?'PATTERN BLUE：確度上昇':'対象未確定'));sound('scan');draw()}
function v27CityIntegrity(){return Math.round(S.defense.city.reduce((a,x)=>a+x.hp,0)/4)}
function v27Armor(){const d=S.defense,c=d.city[d.selected];if(d.status==='active'||d.status==='idle'){if(c.hp<=0)return toast('機能停止。先に修理してください');if(c.armor)return toast('装甲は展開済み');if(!v27Spend(12))return;c.armor=true;v27Record(V27_FACILITY[d.selected].name+' / 防護シャッター展開');sound('ok');draw()}}
function v27Turret(){const d=S.defense,c=d.city[d.selected];if(d.selected===3)return toast('ジオフロント区画には迎撃砲を設置できません');if(c.hp<25)return toast('施設損傷のため稼働不可 / 修復してください');if(c.turret)return toast('砲台はすでに稼働中です');if(d.parts<20)return toast('資材が不足 / 20必要');d.parts-=20;c.turret=true;v27Record(V27_FACILITY[d.selected].name+' / 迎撃砲台配置');sound('launch');draw()}
function v27Power(){const d=S.defense;if(d.spares<=0)return toast('予備送電枠を使い切りました');d.spares--;d.energy=v27Clamp(d.energy+38);v27Record('地下補助系統から緊急送電 / +38');sound('ok');draw()}
function v27Repair(){const d=S.defense,c=d.city[d.selected];if(c.hp>=100)return toast('設備は健全です');if(d.parts<18)return toast('修理資材が不足 / 18必要');d.parts-=18;c.hp=v27Clamp(c.hp+27);v27Record(V27_FACILITY[d.selected].name+' / 緊急修復：HP '+c.hp);sound('ok');draw()}
function v27Cable(){toggleEvaCable(S.tactics.attacker);}
function v27Judge(){if(magiIntrusionActive())return toast('MAGI侵入対処中 / 通常審議を停止しています');const d=S.defense;if(d.status!=='active')return toast('敵性信号がありません');if(d.scans<34)return toast('最低1回の波形分析を先に実施してください');const votes=[d.scans>=65&&S.infra.power,d.city[3].hp>=35&&v27CityIntegrity()>=40,d.security>=45&&S.infra.comms];d.magivote=votes;d.magiround=d.round;v27Record('MAGI 戦術判断 '+votes.filter(Boolean).length+'/3 '+(votes.filter(Boolean).length>=2?'承認':'留保'));sound('scan');draw()}
function v27Trace(){const d=S.defense;if(d.status!=='active')return toast('敵性信号を検知してください');if(d.scans<34)return toast('波形解析が必要です');d.securityPuzzle=(d.caseNo+d.round+1)%3;if(!v27Spend(8))return;d.shutdown=true;v27Record('MAGI侵入試行を捕捉 / ノード '+['M','B','C'][d.securityPuzzle]+' に不審通信');sound('warning');draw()}
function v27Isolate(i){const d=S.defense;if(!d.shutdown)return toast('侵入トレースを先に行ってください');d.shutdown=false;if(i===d.securityPuzzle){d.security=v27Clamp(d.security+15);d.parts=v27Clamp(d.parts+6,0,999);v27Record('不正ノード隔離成功 / 三基稼働継続');sound('ok')}else{d.security=v27Clamp(d.security-20);v27Record('隔離対象誤認 / MAGIセキュリティ -20');sound('deny')}d.magivote=null;draw()}
function v27Shot(){const d=S.defense,t=S.tactics;if(d.status!=='active')return toast('迎撃対象がありません');const a=S.evas[t.attacker],errs=[];if(S.mission.phase<4||S.mission.phase>5)errs.push('既存作戦PHASE 04-05');if(a?.state!=='DEPLOYED')errs.push('攻撃担当機の出撃');if(S.magi.approvedFor!==t.attacker)errs.push('EVA出撃承認');if(t.charge<70||t.heat>=80)errs.push('蓄電70%以上・熱負荷80%未満');if(!S.ops.currentMissionLocks)errs.push('照準ロック');if(!d.magivote||d.magivote.filter(Boolean).length<2||d.magiround!==d.round)errs.push('現ターンのMAGI戦術承認');if(errs.length){toast('射撃不可: '+errs.join(' / '));sound('deny');return}const dmg=Math.round(60+d.scans*.33+(evaExternalPower(t.attacker)?10:0));d.enemy.hp=v27Clamp(d.enemy.hp-dmg,0,300);d.usedV27Shot=true;t.charge=0;t.heat=v27Clamp(t.heat+20);v27Record('EVA支援射撃 / '+dmg+' DAMAGE / 対象残 '+d.enemy.hp);sound('launch');if(!d.enemy.hp){v27Finish(true,'EVA支援射撃により目標沈黙');return}draw()}
function v27Advance(){const d=S.defense;if(d.status!=='active')return toast('まず新規敵性反応を検知してください');const forecast=defenseForecast();d.round++;d.energy=forecast.energy;
 const e=d.enemy,damage=forecast.damage,shots=forecast.shots;
 d.magivote=null;d.magiround=-1;if(damage){e.hp=v27Clamp(e.hp-damage,0,300);v27Record('地上迎撃 '+shots+'系統 / 対象損耗 -'+damage+' / 残 '+e.hp)}
 if(e.hp<=0){v27Finish(true,'迎撃砲火により目標撃退');return}
 e.dist=Math.max(0,e.dist-1);if(!evaExternalPower(S.tactics.attacker)&&S.evas[S.tactics.attacker]?.state==='DEPLOYED'){const ev=S.evas[S.tactics.attacker];ev.power=Math.max(0,Number(ev.power)-(typeof tacticalActive==='function'&&tacticalActive()?10:32));if(ev.power<=0){ev.state='POWER_LOST';ev.at=false;v27Record('攻撃担当EVA 内部電源喪失')}}
 if(e.dist<=1){const spot=d.round%3===0?3:e.lane;const c=d.city[spot],loss=forecast.loss;c.hp=v27Clamp(c.hp-loss);d.breach=v27Clamp(d.breach+(spot===3?13:5));d.security=v27Clamp(d.security-(d.scans<35?9:3));v27Record(V27_FACILITY[spot].name+'被弾 / '+loss+' DAMAGE / HP '+c.hp);if(c.hp<25)c.turret=false}
 else v27Record('敵性反応接近 / ETA '+e.dist+' TURNS / 電力配分 +7');
 if(d.city[3].hp<=0||v27CityIntegrity()<=26||d.round>=14){v27Finish(false,'防衛ライン維持不可 / 復旧が必要');return}sound(e.dist<=1?'warning':'scan');draw();}
function v27Render(){const d=S.defense;if(!$('v27DefenseBoard'))return;const active=d.status==='active',e=d.enemy,health=v27CityIntegrity(),votes=d.magivote||[];const txt=(id,v)=>{const el=$(id);if(el)el.textContent=String(v)};
 document.body.dataset.defense=d.status;
 if(d.status==='active' && S.infra.power && S.infra.comms && !S.evas.some(e=>e.state==='POWER_LOST') && !magiIntrusionActive()){const rb=$('globalAlert');rb.classList.remove('hidden');rb.dataset.level='watch';$('globalAlertFlag').textContent='PATTERN ALERT';$('globalAlertText').textContent='模擬敵性反応 / TOKYO-3 防衛作戦 '+String(d.caseNo).padStart(3,'0');$('telemetryAlarm').textContent='ENEMY';$('telemetryAlarm').style.color='#ffb374';meteoText('heroTacticalState','DEFENSE ACTIVE / SIM');}
 const label={idle:'STANDBY',active:'PATTERN ALERT',victory:'TARGET CLEARED',defeat:'DEFENSE LOST'}[d.status];txt('v27Status',label);$('v27Status').classList.toggle('alert',active);
 txt('v27ETA',active?e.dist+' T':d.status==='victory'?'CLEAR':'--');txt('v27CityHP',health+'%');txt('v27Energy',d.energy+'%');txt('v27Parts',d.parts);
 txt('v27RadarSignal',active?'SIGNAL : '+(d.scans>=65?'PATTERN BLUE':'UNKNOWN')+' / '+v27Profile().bearing:'SIGNAL : NO HOSTILE CONTACT');txt('v27MapDetail',active?`${e.hp}/${e.maxHp} HP / RECON ${d.scans}%`:d.status.toUpperCase());
 txt('v27Selected',V27_FACILITY[d.selected].name);$('v27SelectedHP').style.width=d.city[d.selected].hp+'%';txt('v27EnemyLabel',active?(d.scans>=65?e.code:'UNIDENTIFIED'):'NO CONTACT');$('v27ScanBar').style.width=d.scans+'%';
 const ex=$('v27Enemy');ex.classList.toggle('v27-visual-off',!active);if(active){const coord=[[90,60],[590,68],[600,215]][e.lane];const p=v27Clamp((6-e.dist)/5,0,1);const x=coord[0]+(340-coord[0])*p,y=coord[1]+(210-coord[1])*p;ex.setAttribute('transform',`translate(${Math.round(x)} ${Math.round(y)})`)}
 $('v27PowerLine').classList.toggle('off',!S.infra.power);
 all('[data-v27pick]').forEach(el=>{const i=Number(el.dataset.v27pick);if(el.tagName.toLowerCase()==='button'){el.classList.toggle('sel',d.selected===i);el.classList.toggle('damage',d.city[i].hp<50);}else{el.dataset.selected=d.selected===i?'true':'false';el.dataset.damaged=d.city[i].hp<40?'true':'false';}});
 for(let i=0;i<4;i++)txt('v27Sector'+i,'HP '+d.city[i].hp+' / '+(d.city[i].armor?'装甲':'OPEN')+(d.city[i].turret?' ⚑':''));
 txt('v27Story',d.last);txt('v27Turn',String(d.round).padStart(2,'0'));txt('v27Turrets',d.city.filter(c=>c.turret&&c.hp>=25).length+'/3');txt('v27Reserve',d.spares);txt('v27Security',d.security+'%');
 txt('v27Report',`防衛成功 ${d.wins} / 失敗 ${d.losses} / 継続損耗 ${100-health}% / CASE ${String(d.caseNo).padStart(3,'0')}`);
 $('v27History').replaceChildren();d.history.slice(0,8).forEach(r=>{const el=document.createElement('div'),a=document.createElement('time'),b=document.createElement('span');a.textContent=r.at+' / T'+r.t;b.textContent=r.txt;el.append(a,b);$('v27History').append(el)});if(!d.history.length)$('v27History').textContent='NO BATTLE RECORDS';
 $('v27Detect').disabled=active;$('v27Scan').disabled=!active||d.energy<12||d.scans===100;$('v27Armor').disabled=d.city[d.selected].armor||d.city[d.selected].hp<=0||d.energy<12;$('v27Turret').disabled=d.selected===3||d.city[d.selected].turret||d.city[d.selected].hp<25||d.parts<20;$('v27Power').disabled=d.spares<1;$('v27Repair').disabled=d.parts<18||d.city[d.selected].hp>=100;$('v27Advance').disabled=!active;
 txt('v27Cable',evaUmbilicalConnected(S.tactics.attacker)?'⛓ ケーブル解除 / DISCONNECT':'⛓ EVA電源ケーブル / CONNECT');
 const magiStatus=d.magivote?d.magivote.filter(Boolean).length+'/3 CORES / '+(d.magivote.filter(Boolean).length>=2?'APPROVED':'REJECTED'):'VOTE REQUIRED';
 txt('v27HomeBrief',active?'◆ ENEMY '+e.dist+' T / CITY '+health+'%':label+' / CITY '+health+'%');txt('v27HomeState',d.last);
 txt('v27MissionBrief',`${label} / TARGET ${active?e.hp+'HP':'NONE'} / MAGI ${magiStatus}`);txt('v27EvaBrief',`UMBILICAL : ${evaUmbilicalConnected(S.tactics.attacker)?'CONNECTED':'OFFLINE'} / EVA電力 ${S.evas[S.tactics.attacker].power}s / SECURITY ${d.security}%`);
 txt('v27MagiBrief',`${magiStatus} / SECURITY ${d.security}% / RECON ${d.scans}%`);
 ['v27Vote0','v27Vote1','v27Vote2'].forEach((id,i)=>txt(id,d.magivote?(votes[i]?'APPROVE':'DENY'):'WAIT'));
 txt('v27SecurityHint',d.shutdown?'侵入シグナルを捕捉：'+['MELCHIOR','BALTHASAR','CASPER'][d.securityPuzzle]+' に不審ノード。隔離を選択。':'ノード隔離には先に侵入トレースを実行。誤遮断でセキュリティ低下。');
 if($('v27MagiJudge'))$('v27MagiJudge').disabled=!active||d.scans<34;if($('v27SecDetect'))$('v27SecDetect').disabled=!active||d.scans<34;
}
function v27Init(){if(!qs('.page[data-page="infra"] .page-top')?.insertAdjacentHTML)return;v27Build();const v26Draw=draw;draw=function(){v26Draw();v27Render();};window.NERV_V27_TEST={snapshot:()=>JSON.parse(JSON.stringify(S.defense)),detect:v27Detect,scan:v27Scan,advance:v27Advance,judge:v27Judge,shoot:v27Shot,repair:v27Repair,armor:v27Armor,turret:v27Turret,energy:v27Power,sector:(x)=>{S.defense.selected=x;draw()},render:v27Render};v27Render();}
v27Init();

