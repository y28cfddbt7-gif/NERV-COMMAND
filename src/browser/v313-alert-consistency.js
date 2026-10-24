// v3.1.3: display real city damage separately from an unfinished defeated CASE.
// Presentation-only adapter. No save changes, game reset, image, scheduler or authority bypass.
(function installV313AlertConsistency(){
 if(typeof terminalAlert!=='function')return;
 const originalAlert=terminalAlert;
 const names=['西部','中央','東部','ジオフロント'];
 const health=s=>{
  const city=s?.defense?.city||[];
  return city.length?Math.round(city.reduce((sum,c)=>sum+Math.max(0,Number(c.hp)||0),0)/city.length):null;
 };
 const failed=s=>(s?.defense?.city||[]).flatMap((c,i)=>Number(c.hp)<=0?[names[i]||'区画'+i]:[]);
 terminalAlert=function(){
  const original=originalAlert();
  if(original?.key!=='city-damage')return original; // Keep power, comms, EVA, MAGI, security precedence.
  const stopped=failed(S),average=health(S);
  if(stopped.length){
   return {level:'critical',key:'city-facility-offline',title:'都市施設 機能停止',
    message:stopped.join('・')+'の施設HPが0%。都市健全性 '+average+
     '%。対象施設の点検と修復を行ってください。作戦敗北と施設損傷は別の状態です。',page:'infra'};
  }
  if(S.defense?.status==='defeat'){
   return {level:'critical',key:'case-defeat-'+String(S.defense.caseNo||0),
    title:'迎撃作戦 敗北 / 終了待ち',
    message:'CASE '+String(S.defense.caseNo||0)+' は敗北のまま未終結です。都市施設はHP '+
     average+'%で機能停止していません。「作戦終了・復旧の確認」から正式に終了してください。',page:'battle'};
  }
  return original;
 };
 const button=document.getElementById('commandAlertOpen');
 const enemy=document.getElementById('v232CityEnemy');
 const summary=document.getElementById('launcherInfra');
 function sync(){
  const state=terminalAlert(),defense=S.defense||{},ending=state?.key?.startsWith('case-defeat-');
  if(button){
   button.textContent=ending?'作戦終了・復旧の確認 ↗':'警報を確認する ↗';
   button.setAttribute('aria-label',ending?'CASEの終了・復旧を確認する':'警報を確認する');
  }
  if(enemy){
   const status=defense.status;
   const label=status==='defeat'?'作戦敗北':status==='victory'?'迎撃成功':status==='active'?'探知':'なし';
   if(enemy.textContent!==label)enemy.textContent=label;
  }
  if(summary&&defense.status==='defeat')summary.textContent='CASE '+String(defense.caseNo||0)+' / 敗北・終了待ち';
 }
 if(button)button.addEventListener('click',event=>{
  if(!terminalAlert()?.key?.startsWith('case-defeat-'))return;
  // Explicit user confirmation. The v3.1.2 CASE-only/normal recovery modal owns mutations.
  event.preventDefault();event.stopImmediatePropagation();
  openAlertReview('end');
 },true);
 if(typeof draw==='function'){
  const previousDraw=draw;
  draw=function(){previousDraw();sync();};
 }
 sync();
 window.NERV_V313={version:'3.1.3',alert:()=>terminalAlert(),integrity:()=>health(S),failed:()=>failed(S)};
})();
