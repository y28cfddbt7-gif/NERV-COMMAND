// NERV-COMMAND v3.1.5 / actionable alert, guided security and interactive painted city.
// A presentation/control adapter only. All mutations delegate to original buttons/reducers.
(function initV315OperatorInterface(){
 if(!window.NERV_MOBILE||!document.querySelector?.('#shell')||
    !document.getElementById('v226AlertStrip')||
    !document.getElementById('tokyoCanvasMap'))return;
 const $=id=>document.getElementById(id);
 const names=['西防壁','中央兵装','東迎撃区','ジオフロント'];
 const city=S=>S?.defense?.city||[];
 const state={alertKey:'',acknowledged:'',selected:null,renders:0,actions:0,routes:0};
 document.body.dataset.v315Ui='on';
 const strip=$('v226AlertStrip');
 strip.setAttribute('aria-label','警報確認：タップで復旧・詳細確認');
 strip.setAttribute('role','button');strip.tabIndex=0;
 const action=document.createElement('button');
 action.id='v315AlarmAction';action.type='button';action.textContent='対処へ ▸';
 action.setAttribute('aria-label','警報の対象業務を開く');strip.append(action);
 const securityGuide=document.createElement('section');
 securityGuide.id='v315SecurityGuide';securityGuide.className='v315-guide';
 securityGuide.setAttribute('aria-label','保安案件の進行手順');
 securityGuide.innerHTML='<div class="v315-guide-head"><b>保安処理 / 次の操作</b><span id="v315SecurityCount">0 / 5</span></div>'+
  '<strong id="v315SecurityNext">保安監視中</strong><p id="v315SecurityWhy"></p>'+
  '<div class="v315-steps" aria-label="保安ミッションの進捗">'+
  ['受領','記録収集','経路・MAGI','方針決定','正式報告'].map((x,i)=>'<span data-v315-step="'+i+'">'+(i+1)+' '+x+'</span>').join('')+
  '</div><button id="v315SecurityProceed" type="button">次の画面を開く ▸</button>';
 const cityHost=$('tokyoCanvasMap'),mapWindow=$('v232MapWindow');
 const markers=document.createElement('div');markers.id='v315CityHotspots';
 markers.setAttribute('aria-label','都市施設の区画選択（写真地図に重ねた模式位置）');
 markers.innerHTML=names.map((name,i)=>'<button type="button" data-v315-pick="'+i+
  '" aria-label="'+name+'の詳細を選択"><b>'+name+'</b><small data-v315-hp="'+i+'">HP --%</small></button>').join('');
 cityHost.append(markers);
 const pane=document.createElement('section');pane.id='v315CityDesk';
 pane.className='v315-city-desk';pane.setAttribute('aria-label','地図に連動する都市管制');
 pane.innerHTML='<div class="v315-city-title"><div><small>MAP-LINK / FACILITY CONTROL</small>'+
 '<strong id="v315CityName">都市施設を選択</strong><p id="v315CityHint"></p></div>'+
 '<b id="v315CityHP">--%</b></div>'+
 '<div class="v315-city-buttons">'+
 '<button data-v315-order="repair">応急修復<small>資材18 / HP+27</small></button>'+
 '<button data-v315-order="armor">防壁展開<small>電力12</small></button>'+
 '<button data-v315-order="turret">迎撃砲配備<small>資材20</small></button>'+
 '<button data-v315-order="reserve">補助送電<small>予備枠1</small></button>'+
 '</div><div class="v315-system-buttons">'+
 '<button data-v315-order="power">主電源 <small id="v315PowerStatus">--</small></button>'+
 '<button data-v315-order="comms">通信 <small id="v315CommsStatus">--</small></button>'+
 '<button data-v315-order="diagnose">設備診断</button></div>'+
 '<p id="v315CityFeedback" role="status" aria-live="polite">マップの施設を選択。命令結果は実際の都市状態に反映されます。</p>'+
 '<small class="v315-legend">● 正常　● 注意　● 損傷　/ 地図上の位置は模式的な区画選択です</small>';
 if(mapWindow)mapWindow.after(pane);
 const routeTo=(page,view)=>{if(window.NERV_MOBILE?.open){
   state.routes++;window.NERV_MOBILE.open(page,view);
 }};
 const securityCurrent=()=>{
   const c=S?.world?.security?.case||null;
   return c&&typeof securityKinds==='object'?c:null;
 };
 function securityNext(c){
   if(!c)return {step:0,title:'現在、保安案件はありません',why:'新規の警報は本部保安盤に表示されます。',view:'security'};
   const f=c.fieldwork,items=typeof securityKinds==='object'?securityKinds[c.kind]?.evidence||[]:[];
   const missing=items.filter(x=>!c.evidence?.includes(x[0])).map(x=>x[1]);
   if(c.stage==='detected')return {step:0,title:'案件を受領する',why:'まず受領を確定してから現場照会を開始します。',view:f?'fieldwork':'security'};
   if(c.stage==='failed')return {step:4,title:'証拠保全・緊急上申を実行',why:'対応期限超過。保安上申画面で「証拠保全・緊急上申」を選択します。',view:'decision'};
   if(c.stage==='reported')return {step:4,title:'副司令の確認待ち',why:'報告は送信済み。次の30秒更新で承認結果を確認します。',view:'decision'};
   if(c.stage==='analyzing')return {step:2,title:'MAGI照合の結果を確認',why:'解析を依頼済みです。次の30秒更新まで操作待機。',view:f?'security-control':'evidence'};
   if(c.stage==='decision')return {step:4,title:'冬月副司令へ正式報告',why:'対応方針が確定しています。報告ボタンを実行してください。',view:'decision'};
   if(c.stage==='analyzed')return {step:3,title:'現場対応を決定する',why:f?
     f.pendingResolution?'現場担当の確認待ち。処理完了後、正式報告へ進めます。':
     '記録保全・隔離または担当者への引継ぎを選びます。':
     '照合結果を確認し、一時保留・認証確認・上申から判断します。',
     view:f?.pendingResolution?'security-response':f?'security-response':'decision'};
   if(f){
    if(missing.length)return {step:1,title:'不足している現場記録を収集',why:'残り：'+missing.join(' / ')+
      '。区画を選び「映像照会」「回線追跡」「巡回照会」を実行。巡回は次の30秒更新で届きます。',view:'fieldwork'};
    if(!f.verified)return {step:2,title:'記録の経路をマップで照合',why:
      '区画制御盤で「経路を描く」を選び、取得した3記録の順に3区画をタップして「3記録と照合」を実行。'+
      (f.planned?.length?' 現在 '+f.planned.length+'/3区画':''),
      view:'security-control'};
    return {step:2,title:'MAGIへ経路照合を依頼',why:'経路一致を確認済み。区画制御盤のMAGI解析ボタンを実行してください。',view:'security-control'};
   }
   if((c.evidence||[]).length<2)return {step:1,title:'証拠を2種類以上照合',why:'証拠画面で未照合の記録を選び、各カードの「証拠を確認」を実行。',view:'evidence'};
   return {step:2,title:'MAGIへ証拠照合を依頼',why:'2種類以上の証拠が揃いました。解析開始を選択します。',view:'evidence'};
 }
 function alarmDestination(alert){
   const key=String(alert?.key||'');
   const c=securityCurrent();
   if(key.startsWith('security-')||alert?.page==='work'&&c)return ['work',c?securityNext(c).view:'security'];
   if(key.startsWith('world-'))return ['work','incidents'];
   if(key.startsWith('magiops-'))return ['magi','maintenance'];
   if(key.startsWith('external-magi-'))return ['magi','external'];
   if(key.startsWith('magi-'))return ['magi','intrusion'];
   if(key.startsWith('eva-'))return ['eva','control'];
   if(key.startsWith('city-')||key==='power'||key==='comms')return ['infra',key==='power'||key==='comms'?'systems':'map'];
   if(key.startsWith('case-')||key.startsWith('enemy-')||alert?.page==='battle')return ['battle','setup'];
   if(alert?.page==='mission')return ['battle','setup'];
   return [alert?.page||'home',null];
 }
 function openAlarm(){state.acknowledged=state.alertKey;openAlertReview('alert');renderAlarm();}
 function openTarget(){
   const alert=typeof terminalAlert==='function'?terminalAlert():null;
   if(!alert||alert.level==='nominal')return;
   state.acknowledged=state.alertKey;
   const [p,v]=alarmDestination(alert);routeTo(p,v);
 }
 strip.addEventListener('click',e=>{if(e.target.closest?.('#v315AlarmAction'))return;openAlarm();});
 strip.addEventListener('keydown',e=>{if(e.target!==strip||!['Enter',' '].includes(e.key))return;e.preventDefault();openAlarm();});
 action.addEventListener('click',e=>{e.stopPropagation();openTarget();});
 const navNext=$('v315SecurityProceed');navNext.addEventListener('click',()=>{
   routeTo('work',securityNext(securityCurrent()).view);
 });
 // Actions are the original real command buttons, not private state changes.
 const commands={repair:'v27Repair',armor:'v27Armor',turret:'v27Turret',
  reserve:'v27Power',power:'powerToggle',comms:'commsToggle',diagnose:'infraDiag'};
 pane.addEventListener('click',e=>{
   const b=e.target.closest?.('[data-v315-order]');if(!b||b.disabled)return;
   const id=commands[b.dataset.v315Order],source=$(id);
   if(!source||source.disabled){
    $('v315CityFeedback').textContent='操作不可：元の管制装置の実行条件を確認してください。';return;
   }
   const before=JSON.stringify({defense:S.defense,infra:S.infra});
   source.click();state.actions++;
   const after=JSON.stringify({defense:S.defense,infra:S.infra});
   $('v315CityFeedback').textContent=before===after?
      '設備診断・操作を要求しました。実行結果を記録で確認してください。':
      names[S.defense.selected]+'：命令を反映しました。地図と施設データを更新。';
   renderCity();
 });
 markers.addEventListener('click',e=>{
   const b=e.target.closest?.('[data-v315-pick]');if(!b)return;
   select(Number(b.dataset.v315Pick));
 });
 function select(i){
   if(!Number.isInteger(i)||i<0||i>3)return;
   S.defense.selected=i;state.selected=i;
   draw(); // same saved selection used by the original city-defense reducer
 }
 function renderAlarm(){
   const a=typeof terminalAlert==='function'?terminalAlert():null;
   if(!a||!strip)return;
   const key=String(a.key||'nominal');
   if(key!==state.alertKey){state.alertKey=key;state.acknowledged='';}
   const dest=alarmDestination(a),activeView=typeof currentPage==='string'?
     currentPage+'/'+(mobileCurrent?.[currentPage]||''):'';
   const onTarget=dest[0]+'/'+(dest[1]||'')===activeView;
   const display=a.level!=='nominal'&&!onTarget;
   strip.hidden=!display;
   strip.dataset.v315Acknowledged=String(state.acknowledged===key);
   action.textContent=state.acknowledged===key?'担当盤へ ▸':'対処へ ▸';
   strip.title='タップ：警報復旧の確認 / 対処へ：担当画面';
 }
 function renderSecurityGuide(){
   if(typeof currentPage!=='string'||currentPage!=='work')return;
   const view=mobileCurrent?.work||'';
   if(!['security','evidence','decision','fieldwork','field-records','security-control',
       'security-response','case-library'].includes(view))return;
   const parent=mobileSection('work',view)?.querySelector?.('.staff-panel');
   if(!parent)return;
   if(securityGuide.parentElement!==parent)parent.prepend(securityGuide);
   const c=securityCurrent(),next=securityNext(c);
   const put=(id,txt)=>{const n=$(id);if(n&&n.textContent!==String(txt))n.textContent=String(txt)};
   put('v315SecurityCount',c?(next.step+1)+'/5':'待機');
   put('v315SecurityNext',next.title);
   put('v315SecurityWhy',next.why);
   const btn=$('v315SecurityProceed');btn.disabled=!c||view===next.view;
   btn.textContent=!c?'案件待機':view===next.view?'現在の画面で操作 ▸':'次の操作画面へ ▸';
   for(const n of securityGuide.querySelectorAll('[data-v315-step]')){
     const i=Number(n.dataset.v315Step);
     n.dataset.state=i<next.step?'done':i===next.step?'now':'future';
   }
 }
 function renderCity(){
   if(!S?.defense?.city||!cityHost?.isConnected)return;
   const d=S.defense,sector=Number.isInteger(d.selected)?Math.max(0,Math.min(3,d.selected)):0,
     c=d.city[sector];if(!c)return;
   const h=String(c.hp)+'%',power=!!S.infra.power;
   if(state.selected===null)state.selected=sector;
   const put=(id,txt)=>{const n=$(id);if(n&&n.textContent!==String(txt))n.textContent=String(txt)};
   put('v315CityName',names[sector]);put('v315CityHP',h);
   put('v315CityHint','防壁 '+(c.armor?'展開':'未展開')+' / 砲台 '+(c.turret?'配備':'なし')+
       ' / 資材 '+d.parts+' / 防衛電力 '+d.energy+'% / '+(d.status==='active'?'作戦中':'待機'));
   put('v315PowerStatus',power?'ON':'OFF');put('v315CommsStatus',S.infra.comms?'接続':'切断');
   for(const node of markers.querySelectorAll('[data-v315-pick]')){
     const i=Number(node.dataset.v315Pick),x=d.city[i],hp=Number(x.hp)||0;
     node.dataset.severity=hp<=0?'offline':hp<50?'danger':hp<85?'watch':'nominal';
     node.setAttribute('aria-pressed',String(sector===i));
     const small=node.querySelector('small');if(small)small.textContent='HP '+hp+'%';
   }
   const run=['idle','active'].includes(d.status);
   const available={
     repair:c.hp<100&&d.parts>=18,armor:run&&c.hp>0&&!c.armor&&power&&d.energy>=12,
     turret:sector!==3&&c.hp>=25&&!c.turret&&d.parts>=20,
     reserve:d.spares>0&&d.energy<100,power:true,comms:true,diagnose:true
   };
   for(const b of pane.querySelectorAll('[data-v315-order]')){
     const order=b.dataset.v315Order;
     b.disabled=!available[order];b.setAttribute('aria-disabled',String(!available[order]));
     b.title=!available[order]?{
      repair:c.hp>=100?'施設健全のため修復不要':'修復資材18が不足',
      armor:!run?'作戦終了状態では展開できません':c.armor?'防壁展開済み':!power?'主電源を復旧':'HPまたは電力が不足',
      turret:sector===3?'ジオフロントは砲台配備対象外':c.turret?'すでに配備済み':'HPまたは資材が不足',
      reserve:d.spares<=0?'予備送電枠不足':'電力満充填'}[order]||'': '';
   }
 }
 // Additional shortcuts from the existing visual city map and old facility cards
 // keep all selection surfaces bound to exactly the same saved index.
 document.addEventListener('click',e=>{
   const b=e.target.closest?.('[data-v27pick]');
   if(b&&typeof draw==='function')renderCity();
 });
 const priorDraw=draw;
 draw=function(){priorDraw();renderAlarm();renderSecurityGuide();renderCity();state.renders++;};
 window.addEventListener('nerv-route',()=>{renderAlarm();renderSecurityGuide();renderCity();});
 window.addEventListener('nerv-world-ready',()=>{renderAlarm();renderSecurityGuide();renderCity();});
 renderAlarm();renderSecurityGuide();renderCity();
 window.NERV_V315={version:'3.1.5',snapshot:()=>({
   alertKey:state.alertKey,acknowledged:state.acknowledged,
   selected:S?.defense?.selected,securityStep:securityNext(securityCurrent()).step,
   actions:state.actions,routes:state.routes,renders:state.renders,
   mapControls:!!$('v315CityDesk'),alertClickable:true}),
  securityStep:c=>securityNext(c)};
})();
