// A local story simulation inspired by episode 13's evolving MAGI contamination.
// It never receives external commands or contacts an actual hostile system.
let visualUpgradeBackup=null;
async function backupVisualUpgrade(){
 if(!visualUpgradeBackup)visualUpgradeBackup=callNative('backupUpgrade',{state:JSON.parse(JSON.stringify(S))});
 const result=await visualUpgradeBackup;
 if(result?.error){visualUpgradeBackup=null;toast('変更前の保存に失敗しました：'+result.error);return false;}
 return true;
}
function magiIntrusionActive(){return ['detected','isolated','analyzed','countermeasure','failed'].includes(S.magi?.intrusion?.status);}
function intrusionState(){const defaults={status:'idle',phase:0,progress:0,affected:[],resolved:0,failures:0,message:'MAGI三基は正常稼働。通常の出撃・迎撃審議が可能です。'};const raw=S.magi.intrusion;if(!raw||typeof raw!=='object')return defaults;return {...defaults,...raw,affected:Array.isArray(raw.affected)?raw.affected:[],progress:Math.max(0,Math.min(100,Number(raw.progress)||0)),phase:Math.max(0,Math.min(5,Number(raw.phase)||0))};}
const intrusionActions={
 isolate:{label:'MAGI外部回線を隔離',effect:'侵入経路を遮断。都市の作戦通信は維持します。'},
 restart:{label:'通常再起動を試す',effect:'適応する侵食には無効。侵食率が25%増加します。'},
 analyze:{label:'侵食波形を解析',effect:'侵食率＋10%。適応・進化の仕組みを特定します。'},
 firewall:{label:'通常防壁を更新',effect:'侵食側が適応。侵食率が20%増加します。'},
 reverse:{label:'進化経路を逆算',effect:'CASPERの未侵食領域で対抗プログラムを構成します。'},
 execute:{label:'CASPERから対抗処理を実行',effect:'進化を終端へ誘導。侵食を封じ込め、三基を復旧します。'}
};
async function startMagiIntrusion(){
 if(magiIntrusionActive())return;
 if(!await backupVisualUpgrade())return;
 // Recheck after the asynchronous backup to prevent a double-tap starting twice.
 if(magiIntrusionActive())return;
 const old=intrusionState();S.magi.intrusion={...old,status:'detected',phase:1,progress:20,affected:['MELCHIOR'],securityBefore:S.defense.security,message:'外部試験系から侵食を検知。MELCHIORに異常。通常審議を停止しました。'};
 S.defense.security=Math.max(0,S.defense.security-20);staffInvalidateDecision();
 addLog('magi','侵入訓練開始 / 外部試験系から進化型の侵食を検知');sound('warning');draw();window.scrollTo({top:0,behavior:'instant'});
}
function magiIntrusionAction(action){
 const s=intrusionState();if(!magiIntrusionActive()||s.status==='failed')return;
 const allowed={detected:['isolate','restart'],isolated:['analyze','restart'],analyzed:['reverse','firewall'],countermeasure:['execute','firewall']}[s.status]||[];
 if(!allowed.includes(action))return;S.magi.intrusion=s;
 if(action==='isolate'){s.status='isolated';s.phase=2;s.message='外部回線を隔離。都市作戦通信を維持。侵食はMAGI内部で適応を続けています。';}
 if(action==='analyze'){s.status='analyzed';s.phase=3;s.progress+=10;s.affected=['MELCHIOR','BALTHASAR'];s.message='侵食波形を解析。通常防壁に適応する進化型と判明。CASPERは未侵食です。';}
 if(action==='reverse'){s.status='countermeasure';s.phase=4;s.message='進化経路を逆算。CASPERで対抗処理の準備完了。実行すると三基の復旧を試みます。';}
 if(action==='restart'||action==='firewall'){s.progress+=action==='restart'?25:20;s.message=action==='restart'?'通常再起動に侵食が適応。侵食率＋25%。外部回線の隔離と波形解析が必要です。':'通常防壁に侵食が適応。侵食率＋20%。進化経路の逆算で対抗してください。';}
 if(action==='execute'){s.status='contained';s.phase=5;s.progress=0;s.affected=[];s.resolved=(Number(s.resolved)||0)+1;s.message='対抗処理が成功。侵食を封じ込め、MAGI三基を復旧。通常審議を再申請できます。';S.defense.security=Math.max(S.defense.security,s.securityBefore||0);staffInvalidateDecision();}
 s.progress=Math.min(100,s.progress);
 if(s.progress>=100){s.status='failed';s.affected=['MELCHIOR','BALTHASAR','CASPER'];s.failures=(Number(s.failures)||0)+1;s.message='三基の侵食が限界に到達。審議を停止しています。警報確認から正常待機への復旧を選択してください。';}
 addLog('magi',s.message);sound(s.status==='contained'?'done':s.status==='failed'?'warning':'scan');draw();
}
function renderMagiIntrusion(){
 const panel=$('magiIntrusionPanel');if(!panel)return;
 const s=intrusionState(),active=magiIntrusionActive();panel.dataset.status=s.status;
 meteoText('intrusionPhase',String(s.phase).padStart(2,'0')+' / 05');meteoText('intrusionMessage',s.message);meteoText('intrusionPercent',s.progress+'%');
 $('intrusionRing').style.setProperty('--intrusion-progress',s.progress+'%');
 meteoText('intrusionCircuit',s.status==='idle'||s.status==='contained'?'外部回線：正常':s.status==='detected'?'外部回線：未隔離':'MAGI外部回線：隔離中 / 都市通信：維持');
 const names=['MELCHIOR','BALTHASAR','CASPER'];
 for(const name of names){const node=qs('[data-intrusion-core="'+name+'"]'),hit=s.affected.includes(name);node.dataset.infected=String(hit);node.querySelector('b').textContent=hit?'侵食':active?'保全中':'正常';}
 const actions=$('intrusionActions');actions.replaceChildren();
 const keys={detected:['isolate','restart'],isolated:['analyze','restart'],analyzed:['reverse','firewall'],countermeasure:['execute','firewall']}[s.status]||[];
 for(const key of keys){const info=intrusionActions[key],button=document.createElement('button'),b=document.createElement('b'),small=document.createElement('span');button.type='button';button.dataset.intrusionAction=key;b.textContent=info.label;small.textContent=info.effect;button.append(b,small);button.addEventListener('click',()=>magiIntrusionAction(key));actions.append(button);}
 $('intrusionStart').hidden=active;$('intrusionRecover').hidden=s.status!=='failed';
 meteoText('intrusionStart',s.status==='contained'?'侵入訓練をもう一度開始':'侵入訓練を開始');
 $('magiVote').disabled=active;
 if(active)meteoText('magiLiveState','侵食検知 / 通常審議停止');
 // Current core impairment remains visible on the consensus board as well.
 for(const name of names){const code={MELCHIOR:'M',BALTHASAR:'B',CASPER:'C'}[name],node=$('m'+code+'Status')?.parentElement;if(node){node.dataset.infected=String(active&&s.affected.includes(name));if(active&&s.affected.includes(name))meteoText('m'+code+'Status','侵食');}}
}
function initMagiIntrusion(){
 if(!qs('#staffSupport'))return;
 const panel=document.createElement('section');panel.id='magiIntrusionPanel';panel.className='staff-panel intrusion-panel';
 panel.innerHTML='<div class="staff-panel-title"><h2>MAGI侵入対処</h2><b id="intrusionPhase">00 / 05</b></div><p class="staff-note">SIMULATION / 第拾参話「使徒、侵入」をモチーフにした独自訓練。選択時に進行する訓練です。</p><div class="intrusion-instruments"><div class="intrusion-ring" id="intrusionRing"><i></i><strong id="intrusionPercent">0%</strong><small>CONTAMINATION</small></div><div class="intrusion-cores"><div data-intrusion-core="MELCHIOR">MELCHIOR-1<b>正常</b></div><div data-intrusion-core="BALTHASAR">BALTHASAR-2<b>正常</b></div><div data-intrusion-core="CASPER">CASPER-3<b>正常</b></div></div></div><p id="intrusionCircuit" class="intrusion-circuit"></p><p id="intrusionMessage" class="intrusion-message" role="status"></p><div id="intrusionActions" class="intrusion-actions"></div><button id="intrusionStart" class="staff-primary">侵入訓練を開始</button><button id="intrusionRecover" class="staff-primary">警報確認・正常復旧へ</button><nav class="staff-route"><button data-route="magi/request">通常の審議申請へ ↗</button><button data-route="infra/systems">都市系統を確認 ↗</button></nav>';
 qs('.page[data-page="magi"]').append(panel);
 $('intrusionStart').addEventListener('click',startMagiIntrusion);$('intrusionRecover').addEventListener('click',()=>openAlertReview());
 const priorMagi=renderMAGI;renderMAGI=function(){priorMagi();renderMagiIntrusion();};
 renderMagiIntrusion();
}
initMagiIntrusion();
