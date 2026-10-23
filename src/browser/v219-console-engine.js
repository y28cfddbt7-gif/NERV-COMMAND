// v2.19: one persistent operator console, sharing the real combat/maintenance reducers.
// AP, routing puzzles and simulation signatures are original game rules.
function consoleRoot(create=false){
 const raw=S.operatorConsole;if(raw!==undefined&&(!worldObject(raw)||raw.schema!==1))throw Error('管制コンソールの保存形式に対応していません。データを保持して処理を停止しました。');
 if(!raw){if(!create)return {schema:1,battle:null,magi:null,history:[]};S.operatorConsole={schema:1,battle:null,magi:null,history:[]};}
 const s=S.operatorConsole;if(!Array.isArray(s.history)||s.history.length>128||s.history.some(r=>!worldObject(r)||typeof r.system!=='string'||typeof r.text!=='string'||!Number.isFinite(r.at)))throw Error('管制履歴が破損しています。バックアップ付き復旧を確認してください。');return s;
}
function consoleRecord(system,text){const s=consoleRoot(true);s.history.unshift({system,text,at:Date.now(),caseNo:S.defense.caseNo});s.history=s.history.slice(0,24);}
function consoleBattle(){const b=consoleRoot().battle;if(!b)return null;if(b.schema!==1||!['approval','placement','field'].includes(b.stage)||![0,1,2].includes(b.ap)||!['move','attack','guard'].includes(b.mode)||![0,1,2].includes(b.cell?.col)||![2,3].includes(b.cell?.row))throw Error('戦闘コンソールの保存形式・座標が不正です。処理を停止しました。');if(b.caseNo!==S.defense.caseNo||b.unit!==S.tactics.attacker)return null;return b;}
function consoleBattleCreate(){const root=consoleRoot(true);if(!consoleBattle())root.battle={schema:1,caseNo:S.defense.caseNo,unit:S.tactics.attacker,stage:'approval',ap:2,mode:'move',cell:{col:1,row:3},cable:true};return root.battle;}
let consoleDeferEnemy=false;
const consoleEnemyTurn=v27Advance;
v27Advance=function(){if(consoleDeferEnemy)return;return consoleEnemyTurn();};
const consoleClassicTactical=tacticalCommand;
function consoleCombatBefore(){return {hp:S.defense.enemy?.hp||0,round:S.defense.round,caseNo:S.defense.caseNo,weapon:armamentSelected,sync:S.evas[S.tactics.attacker].sync,scans:S.defense.scans};}
async function consoleBattleCommand(action,payload={}){
 const before=consoleCombatBefore(),previousWeapon=armamentSelected;let shot=null;
 const result=await commandOperation(()=>{
  if(!staffWorldReady)throw Error('世界状態の復元を待ってください');consoleRoot(true);
  if(action==='start'){if(S.defense.status==='active')throw Error('進行中の作戦を引き継いでください');angelStart(S,payload.angel);tacticalActivate();consoleBattleCreate();window.NERV_GAME_V229?.onStart();consoleRecord('battle','接近受信 / 発進承認待ち');return;}
  if(action==='weapon'){if(!['knife','rifle','positron'].includes(payload.weapon))throw Error('兵装を選択してください');armamentSelected=payload.weapon;S.prefs.selectedWeapon=payload.weapon;const t=tacticalState();if(t)t.aim=null;return;}
  if(S.defense.status!=='active')throw Error('進行中の交戦が必要です');
  if(action==='adopt'){tacticalActivate();const b=consoleBattleCreate();b.stage=S.evas[b.unit].state==='DEPLOYED'?'placement':'approval';consoleRecord('battle','既存作戦を資源・損傷を保ったまま引継ぎ');return;}
  const b=consoleBattle();if(!b)throw Error('既存作戦を管制コンソールへ引き継いでください');const e=S.evas[b.unit];
  if(action==='unit'){if(b.stage!=='approval')throw Error('配置後の担当変更はできません');const n=Number(payload.unit);if(![0,1,2].includes(n))throw Error('担当機が不正です');S.tactics.attacker=n;S.selectedEva=n;if(S.tactics.defender===n)S.tactics.defender=(n+1)%3;staffInvalidateDecision();tacticalActivate();consoleRoot(true).battle=null;consoleBattleCreate();if(window.NERV_GAME_V229?.get())window.NERV_GAME_V229.onStart();return;}
  if(action==='prepare'||action==='approve'||action==='placement'){
   if(b.stage!=='approval')throw Error('発進承認工程は完了しています');
   if(action==='prepare')prepareEvaState(b.unit);
   if(action==='approve'){S.selectedEva=b.unit;S.magi.purpose='sortie';recordSortieDecision(sortieDecision(b.unit));}
   if(action==='placement'){window.NERV_GAME_V229?.beforeNext();if(e.state!=='DEPLOYED'&&(e.state!=='READY'||S.magi.approvedFor!==b.unit))throw Error('機体準備とMAGI出撃承認を確認してください');b.stage='placement';}
   return;
  }
  if(action==='cell'||action==='deploymentCable'||action==='deploy'){
   if(b.stage!=='placement')throw Error('先に発進承認を完了してください');
   if(action==='cell'){if(![0,1,2].includes(payload.col)||![2,3].includes(payload.row))throw Error('後方・中間の射出区画を選択してください');b.cell={col:payload.col,row:payload.row};}
   if(action==='deploymentCable')b.cable=payload.connected===true;
   if(action==='deploy'){
    window.NERV_GAME_V229?.beforeNext();
    if(!S.infra.power||!S.infra.comms||worldMagiLimited()||magiIntrusionActive()||securityHold())throw Error('主電源・通信・MAGI・保安の保留を確認');
    if(armamentSelected==='positron'&&!b.cable)throw Error('ポジトロンライフルは外部給電が必要です');
    if(e.state!=='DEPLOYED')launchEvaState(b.unit);
    if(evaUmbilicalConnected(b.unit)!==b.cable)toggleEvaCable(b.unit);
    const t=tacticalState();tacticalValidate(t);t.pos={...b.cell};e.mapSector=b.cell.row===3?3:b.cell.col;S.evaCombat.range=b.cell.row;t.aim=null;t.enemyPlan=tacticalPlan(t);b.stage='field';b.ap=2;if(window.NERV_SORTIE_HOOK)window.NERV_SORTIE_HOOK.finalize(b,t,e);consoleRecord('battle','MAP配置確定 / '+['西','中央','東'][b.cell.col]+b.cell.row+' / '+armamentSelected);
   }return;
  }
  if(action==='cable'){applyTacticalAction(action,payload,before);consoleRecord('battle','外部給電の接続を確認');return;}
  if(b.stage!=='field')throw Error('MAP配置と兵装を確定してから戦闘を開始してください');
  if(action==='mode'){if(!['move','attack','guard'].includes(payload.mode))throw Error('行動を選択してください');b.mode=payload.mode;return;}
  const costs={move:1,scan:1,neutralize:1,charge:1,supply:1,focus:1,fire:1,recon:1,feint:1,fortify:1,at:0,aim:0,support:0,cable:0,guard:0,wait:0};if(!(action in costs))throw Error('不明な戦術操作');
  if(b.ap<costs[action])throw Error('行動力が不足しています');
  if(['recon','feint','fortify'].includes(action)){
   if(!window.NERV_GAME_V229)throw Error('管制戦術システムが未起動です');
   window.NERV_GAME_V229.action(action,b);b.ap-=1;
   if(S.defense.status==='active'&&b.ap===0){consoleEnemyTurn();b.ap=2;}
   consoleRecord('battle','戦術命令 '+action+' / AP '+b.ap+' / TURN '+S.defense.round);return;
  }
  consoleDeferEnemy=true;try{shot=applyTacticalAction(action,payload,before)||null;}finally{consoleDeferEnemy=false;}
  if(action==='aim')b.mode='attack';if(action==='move'){b.mode='move';e.mapSector=tacticalState().pos.row===3?3:tacticalState().pos.col;}b.ap-=costs[action];
  if(S.defense.status==='active'&&(b.ap===0||action==='guard'||action==='wait')){const focus=tacticalState()?.focus||0;consoleEnemyTurn();if(action==='focus'&&tacticalState())tacticalState().focus=focus;b.ap=2;}
  consoleRecord('battle',action+' / AP '+b.ap+' / TURN '+S.defense.round);
 });
 if(!result.ok)armamentSelected=previousWeapon;
 if(result.ok){if(shot)window.dispatchEvent(new CustomEvent('nerv-tactical-shot',{detail:shot}));if(S.defense.caseNo===before.caseNo&&S.defense.round>before.round)window.dispatchEvent(new CustomEvent('nerv-tactical-turn',{detail:{...tacticalState()?.lastTurn}}));}
 return result;
}
tacticalCommand=async function(action,payload={}){let b;try{b=consoleBattle();}catch(error){toast(error.message);return {ok:false,error:error.message};}return b?consoleBattleCommand(action,payload):consoleClassicTactical(action,payload);};
window.NERV_TACTICAL.act=tacticalCommand;
if(window.NERV_ENGAGEMENT)window.NERV_ENGAGEMENT.selectWeapon=weapon=>consoleBattleCommand('weapon',{weapon});
function consoleMagiContext(){
 const x=externalMagiState(),i=intrusionState(),a=S.world?.magiOps?.active,c=S.world&&worldActiveIncident(S.world);
 if(['detected','analyzed','protected','failed'].includes(x.status))return {kind:'external',key:'external-'+x.caseNo,stage:x.status,data:x,title:'外部分散侵入 / 666 PROTECT'};
 if(['detected','isolated','analyzed','countermeasure','failed'].includes(i.status))return {kind:'adaptive',key:'adaptive-'+(i.caseSerial??i.resolved+1),stage:i.status,data:i,title:'自己進化型侵食 / CASPER COUNTERMEASURE'};
 if(a)return {kind:a.kind,key:a.id,stage:a.stage,data:a,title:magiFaultKinds[a.kind].title};
 if(c)return {kind:'cooling',key:c.id,stage:c.status,data:c,title:'冷却枝系統 / 流量調整'};
 return {kind:'normal',key:'normal',stage:'operational',data:null,title:'MAGI SYSTEM / 三基合議'};
}
function consoleMagiDefault(ctx){return {schema:1,caseKey:ctx.key,selected:0,observed:[],routes:ctx.kind==='power'||ctx.kind==='cooling'?[0,1,1]:[0,0,0],mask:0,allocation:[30,0,0],flows:[70,20],program:[],traced:[],feedback:'三基を選択し、独立測定で原因を切り分けてください。'};}
function consoleMagiSession(create=false){const c=consoleMagiContext(),root=consoleRoot(create);let m=root.magi;if(m&&m.schema!==1)throw Error('新しいMAGI調整記録です。対応版で開いてください');if(!m||m.caseKey!==c.key){m=consoleMagiDefault(c);if(create)root.magi=m;}if(m.schema!==1||![0,1,2].includes(m.selected)||!Array.isArray(m.observed)||new Set(m.observed).size!==m.observed.length||m.observed.some(i=>![0,1,2].includes(i))||!Array.isArray(m.routes)||m.routes.length!==3||m.routes.some(n=>![0,1,2].includes(n))||!Array.isArray(m.allocation)||m.allocation.length!==3||m.allocation.some(n=>!Number.isInteger(n)||n<0||n>30)||!Array.isArray(m.flows)||m.flows.length!==2||m.flows.some(n=>!Number.isInteger(n)||n<0||n>100)||!Array.isArray(m.program)||m.program.length>3||m.program.some(t=>!['bound','observe','terminate'].includes(t))||!Array.isArray(m.traced)||new Set(m.traced).size!==m.traced.length||m.traced.some(i=>![0,1,2].includes(i))||m.voteUnit!==undefined&&![0,1,2].includes(m.voteUnit)||m.decision!==undefined&&(!Array.isArray(m.decision)||m.decision.length!==3||m.decision.some(v=>!worldObject(v)||typeof v.name!=='string'||typeof v.reason!=='string'||typeof v.yes!=='boolean'))||!Number.isInteger(m.mask)||m.mask<0||m.mask>7)throw Error('MAGI調整記録を読み取れません。元データを保持して操作を停止しました。');return m;}
function consoleFaultPort(ctx=consoleMagiContext()){if(ctx.kind==='power')return ctx.data.damagedBus;if(ctx.kind==='external')return (ctx.data.caseNo+ctx.data.hold)%3;return Array.from(ctx.key).reduce((n,ch)=>n+ch.charCodeAt(0),0)%3;}
function consolePatchValid(ctx,m){const bad=consoleFaultPort(ctx);if(ctx.kind==='power'||ctx.kind==='cooling'){const good=[0,1,2].filter(i=>i!==bad);return m.routes[bad]===2&&new Set(good.map(i=>m.routes[i])).size===2&&good.every(i=>m.routes[i]<2);}return m.routes.every((out,i)=>i===bad?out===1:out===0);}
function consoleObserve(ctx,index){const d=ctx.data;
 if(ctx.kind==='clock')return '時刻偏差 '+(d.offsets[index]>0?'+':'')+d.offsets[index]+' ms / 補正後 '+(d.offsets[index]+d.adjustments[index])+' ms';
 if(ctx.kind==='checksum')return '複製 '+(index+1)+' / '+(index===2?'ROOT-214 / 原本不一致':'ROOT-215 / 署名一致');
 if(ctx.kind==='power')return 'BUS '+(index+1)+' / '+(index===d.damagedBus?'絶縁ノイズ / 要保守':'基準電圧 / 健全')+' / '+(d.feeds[index]?'給電中':'切離し');
 if(ctx.kind==='cooling')return '枝 '+(index+1)+' / '+(index===consoleFaultPort(ctx)?'流量低下 / 要隔離':'流路健全')+' / 総冷却負荷 '+S.world.cooling.load+'%';
 if(ctx.kind==='adaptive')return '回線 '+(index+1)+' / '+(index===consoleFaultPort(ctx)?'適応波形 011 / 隔離対象':'正常署名 '+(index===0?'001':'010'))+' / '+(d.affected.includes(['MELCHIOR','BALTHASAR','CASPER'][index])?'侵食検出':'独立領域を保持');
 if(ctx.kind==='external')return '回線 '+(index+1)+' / '+(index===consoleFaultPort(ctx)?'攻撃流入 / 要隔離':'正常応答')+' / 侵入圧 '+d.pressure[index]+'%';
 const vote=(consoleMagiSession().decision||S.magi.vote?.votes)?.find(v=>v.name.startsWith(['MELCHIOR','BALTHASAR','CASPER'][index]));return vote?(vote.yes?'賛成':'否決')+' / '+vote.reason:'独立系正常 / 次の審議要求を待機';
}
async function consoleMagiCommand(action,payload={}){return commandOperation(()=>{
 if(!staffWorldReady)throw Error('世界状態の復元を待ってください');consoleRoot(true);const held=worldMagiLimited();
 if(action==='start'){
  if(consoleMagiContext().kind!=='normal')throw Error('進行中の異常を先に解決してください');
  if(['clock','power','checksum'].includes(payload.kind))worldDispatch(S,'magiops.start.'+payload.kind);
  else if(payload.kind==='external')applyExternalMagiAction('start');
  else if(payload.kind==='adaptive'){const old=intrusionState();S.magi.intrusion={...old,caseSerial:(old.caseSerial||0)+1,status:'detected',phase:1,progress:20,affected:['MELCHIOR'],securityBefore:S.defense.security,message:'独立試験系で自己進化型侵食を検出。経路切替と署名照合が必要です。'};S.defense.security=Math.max(0,S.defense.security-20);staffInvalidateDecision();}
  else if(payload.kind==='cooling'){const w=S.world;w.eventSequence++;w.cooling.load=Math.max(80,w.cooling.load);w.events.unshift({id:'cooling-anomaly-'+w.eventSequence,kind:'magi-cooling',status:'detected',severity:'watch',createdTick:w.tick,diagnosticDue:null,approvalDue:null});w.events=w.events.slice(0,12);}
  else throw Error('演習種別が不正です');worldApplyHold(held);consoleMagiSession(true);consoleRecord('magi','独立演習 / '+payload.kind);return;
 }
 const ctx=consoleMagiContext(),m=consoleMagiSession(true),index=payload.index===undefined?m.selected:Number(payload.index),d=ctx.data;
 if(['select','observe','route','adjust','allocation','copy'].includes(action)&&![0,1,2].includes(index))throw Error('対象コア・回線が不正です');
 if(action==='select'){m.selected=index;return;}
 if(action==='observe'){if(!m.observed.includes(index))m.observed.push(index);m.selected=index;m.feedback=consoleObserve(ctx,index);consoleRecord('magi','独立測定 / '+externalCoreNames[index]+' / '+m.feedback);return;}
 if(action==='route'){const out=Number(payload.value);if(![0,1,2].includes(out))throw Error('出力先が不正です');m.routes[index]=out;m.feedback='回線 '+(index+1)+' を出力 '+(out+1)+' へ接続。健全系の継続運転も照合してください。';return;}
 if(action==='allocation'){const n=Number(payload.value);if(!Number.isInteger(n)||n<0||n>30)throw Error('演算配分は0～30です');m.allocation[index]=n;return;}
 if(action==='flow'){const i=Number(payload.index),n=Number(payload.value);if(![0,1].includes(i)||!Number.isInteger(n)||n<0||n>100)throw Error('流量設定が不正です');m.flows[i]=n;return;}
 if(action==='mask'){const bit=Number(payload.bit);if(![1,2,4].includes(bit))throw Error('署名ビットが不正です');m.mask^=bit;return;}
 if(action==='program'){if(payload.token==='clear')m.program=[];else{if(!['bound','observe','terminate'].includes(payload.token)||m.program.length>=3)throw Error('命令列は3スロットです。消去して再構成できます');m.program.push(payload.token);}return;}
 if(ctx.stage==='failed')throw Error('防御失敗。警報確認からバックアップ付き復旧が必要です');
 if(action==='voteUnit'){if(ctx.kind!=='normal'||![0,1,2].includes(Number(payload.index)))throw Error('審議対象機を確認してください');m.voteUnit=Number(payload.index);S.selectedEva=m.voteUnit;delete m.decision;staffInvalidateDecision();return;}
 if(action==='tacticalVote'){if(ctx.kind!=='normal'||S.defense.status!=='active'||S.defense.scans<34)throw Error('進行中の交戦と解析34%以上が必要です');applyEvaCombatAction('authorize');m.decision=externalCoreNames.map((name,i)=>({name,yes:!!S.defense.magivote[i],reason:['解析65%以上・主電源','本部35%以上・都市健全性40%以上','保安45%以上・通信'][i]}));m.feedback='現在の作戦・担当機・手番に対する実戦術承認を記録しました';consoleRecord('magi',m.feedback);return;}
 if(action==='vote'){if(ctx.kind!=='normal')throw Error('異常対応中の通常合議は保留です');S.selectedEva=m.voteUnit??S.selectedEva;S.magi.purpose='sortie';recordSortieDecision(sortieDecision(S.selectedEva));m.decision=S.magi.vote.votes;m.feedback=S.magi.vote.approved?'三基の実判定により出撃承認':'出撃否決 / 各基の理由を確認してください';consoleRecord('magi',m.feedback);return;}
 const requireObserved=()=>{if(m.observed.length!==3)throw Error('三基すべての独立測定が必要です');};
 const requirePatch=()=>{requireObserved();if(!consolePatchValid(ctx,m))throw Error('経路照合不成立。異常回線の隔離と健全系の接続を見直してください');};
 if(['clock','power','checksum'].includes(ctx.kind)){
  if(action==='diagnose'){requireObserved();worldDispatch(S,'magiops.diagnose');}
  else if(action==='adjust'){worldDispatch(S,'magiops.adjust.'+index+'.'+Number(payload.value));}
  else if(action==='copy'){requireObserved();for(const i of m.observed)worldDispatch(S,'magiops.inspect.'+i);worldDispatch(S,'magiops.copy.'+index);}
  else if(action==='validate'){requireObserved();if(ctx.kind==='power'){requirePatch();for(let i=0;i<3;i++)if(d.feeds[i]!== (m.routes[i]<2))worldDispatch(S,'magiops.feed.'+i);}worldDispatch(S,'magiops.validate');}
  else if(action==='report')worldDispatch(S,'magiops.report');else throw Error('現在の障害では使用できない操作です');m.feedback=S.world.magiOps.active?.feedback||'技術部への処理を記録しました。';
 }else if(ctx.kind==='cooling'){
  if(action==='accept'){requireObserved();worldDispatch(S,'incidentAccept');}
  else if(action==='isolate'){requirePatch();worldDispatch(S,'isolate');}
  else if(action==='diagnose'){requirePatch();if(m.flows.some(n=>n<35)||m.flows.reduce((a,b)=>a+b,0)>100)throw Error('健全な2流路を各35以上、合計100以内に配分してください');worldDispatch(S,'diagnose');}
  else if(action==='report')worldDispatch(S,'incidentReport');else throw Error('現在の冷却手順では使用できない操作です');m.feedback='冷却系の処理を記録 / 独立診断・復旧承認は30秒更新を待機';
 }else if(ctx.kind==='adaptive'){
  if(action==='isolate'){if(ctx.stage!=='detected')throw Error('隔離の受付工程ではありません');requirePatch();magiIntrusionAction('isolate');}
  else if(action==='analyze'){if(ctx.stage!=='isolated')throw Error('経路隔離が先です');requirePatch();if(m.mask!==3)throw Error('正常署名001・010を通し、複合署名011だけを検出するANDマスクが必要です');magiIntrusionAction('analyze');}
  else if(action==='compile'){if(ctx.stage!=='analyzed')throw Error('波形解析が先です');requirePatch();if(m.selected!==2||m.program.join(',')!=='bound,observe,terminate')throw Error('独立したCASPERを選び、境界固定→進化観測→終端誘導の順に命令列を組んでください');magiIntrusionAction('reverse');}
  else if(action==='execute'){if(ctx.stage!=='countermeasure'||m.selected!==2)throw Error('CASPERの対抗処理構築を確認してください');requirePatch();magiIntrusionAction('execute');}else throw Error('現在の侵食手順では使用できない操作です');m.feedback=intrusionState().message;
 }else if(ctx.kind==='external'){
  if(action==='trace'){requireObserved();if(m.traced.includes(m.selected))throw Error('同じ測定源です。別のコアを選び独立経路を解析してください');applyExternalMagiAction('select',m.selected);applyExternalMagiAction('trace');m.traced.push(m.selected);}
  else if(action==='partition'){requireObserved();applyExternalMagiAction('select',m.selected);applyExternalMagiAction('partition');}
  else if(action==='compile'){requirePatch();if(m.allocation.reduce((a,b)=>a+b,0)!==30||m.allocation.some((n,i)=>n<Math.ceil(d.pressure[i]/8)))throw Error('演算枠は合計30。各基の配分は侵入圧÷8の切上げ以上が必要です');applyExternalMagiAction('compile');S.magi.externalDefense.pressure=S.magi.externalDefense.pressure.map((n,i)=>Math.max(0,n-Math.floor(m.allocation[i]/2)));}
  else if(action==='maintain'){requirePatch();const max=Math.max(...d.pressure);if(d.pressure[m.selected]!==max)throw Error('侵入圧が最大のコアを選択して優先遮断してください');applyExternalMagiAction('maintain');const n=externalMagiState();if(n.status==='protected'){const port=(n.caseNo+n.hold)%3;n.pressure=n.pressure.map((p,i)=>Math.min(100,p+(i===port?45:8)));S.magi.externalDefense=n;m.observed=[];}}
  else throw Error('現在の外部防御では使用できない操作です');m.feedback=externalMagiState().message;
 }else throw Error('稼働中です。審議または演習を選択してください');
 worldApplyHold(held);consoleRecord('magi',ctx.key+' / '+action+' / '+consoleMagiContext().stage);
 });}
window.NERV_CONSOLE={battle:consoleBattleCommand,magi:consoleMagiCommand,snapshot:()=>{try{return {schema:1,battle:worldClone(consoleBattle()),magi:{context:worldClone(consoleMagiContext()),session:worldClone(consoleMagiSession())},history:worldClone(consoleRoot().history),error:''};}catch(error){return {error:error.message};}}};
// Explicit recovery alone resets active console work, after the existing backup.
// Future schemas remain intact; valid cumulative records and unknown fields survive.
const consolePriorRecovery=recoveredStaffState;
recoveredStaffState=function(previous){const next=consolePriorRecovery(previous),c=next.operatorConsole;if(c?.schema===1){const valid=Array.isArray(c.history)&&c.history.every(r=>worldObject(r)&&typeof r.system==='string'&&typeof r.text==='string'&&Number.isFinite(r.at));next.operatorConsole={...c,battle:null,magi:null,history:valid?c.history.slice(0,24):[],...(!valid?{preservedInvalidHistory:worldClone(c.history??null)}:{})};}return next;};
