// v2.29 / Stand-alone action-oriented sortie incident desk and tactical orders.
// The v2.28 explanatory panels are folded away, not deleted, for fallback operation.
function initV229Workstation(){
 if(!window.NERV_GAME_V229||!window.NERV_MOBILE)return;
 const api=window.NERV_GAME_V229;
 const root=document.createElement('section');root.id='v229Sortie';root.className='v229-sortie';root.hidden=true;
 root.innerHTML='<header class="v229-header"><span>発進異常対処 / SORTIE DECISION</span><b id="v229Status">STANDBY</b></header>'+
 '<div class="v229-event"><small id="v229Index">CLASSIFIED / INCIDENT</small>'+
 '<strong id="v229Title">異常報告待機</strong><p id="v229Description"></p></div>'+
 '<div class="v229-telemetry"><span>都市電力 <b id="v229Power">--</b></span><span>敵接近距離 <b id="v229Distance">--</b></span>'+
 '<span>EVA状態 <b id="v229Integrity">--</b></span></div>'+
 '<div class="v229-decisions" id="v229Choices" aria-label="作戦対応の選択肢"></div>'+
 '<div class="v229-result" id="v229Result" role="status" aria-live="polite">異常に対処するまで、次の発進手続きは開始できません。</div>';
 const arm=document.createElement('div');arm.id='v229CombatOrders';arm.className='v229-orders';arm.innerHTML=
 '<div class="v229-orders-head"><strong>OPERATOR COMMANDS</strong><small>資源とAPを使って状況を変える</small></div>'+
 '<div class="v229-orders-grid">'+[
 ['recon','先行解析','MAGI +18 / 電力 -9'],
 ['feint','陽動配置','敵射界を変更 / 電力 -7'],
 ['fortify','局地防御','A.T.被害軽減 / 電力 -7']
 ].map(([key,label,description])=>'<button type="button" data-v229-order="'+key+'"><b>'+label+'</b><small>'+description+'</small></button>').join('')+'</div>'+
 '<p id="v229OrderResult" role="status">1指令につき1AP。手番終了で敵も行動します。</p>';
 const legacy=document.createElement('details');legacy.id='v229Legacy';legacy.className='v229-legacy';
 legacy.innerHTML='<summary>従来の発進方針・点検を表示</summary>';
 let renderedKey='',pending=false,completed=0,issued=0,errors=0,animations=0;
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 function text(id,value){const el=root.querySelector('#'+id);if(el&&el.textContent!==String(value))el.textContent=String(value);}
 function cue(name,targets,owner){
  if(document.hidden||reduced?.matches||typeof isMoving!=='function'||!isMoving()||!owner?.isConnected)return;
  if(window.NERV_MOTION.animate('v229-'+name,targets,{opacity:[.35,1],translateY:[8,0],
   delay:window.anime.stagger(75),duration:520,ease:'outExpo',composition:'replace',
   onComplete:()=>Array.from(targets).forEach(x=>{x.style.removeProperty('opacity');x.style.removeProperty('transform');})},owner))animations++;
 }
 function attach(){
  const old=document.querySelector('.v228-sortie');
  if(old&&root.parentNode!==old.parentNode)old.before(root);
  if(old&&!legacy.contains(old)){
   old.before(legacy);legacy.append(old);
  }
  const field=document.querySelector('.v228-field');
  if(field&&!field.contains(arm)){
   const head=field.querySelector('.v228-field-state');
   if(head)head.after(arm);else field.prepend(arm);
  }
 }
 async function choose(value){
  if(pending)return;pending=true;
  try{
   const result=await api.resolve(value);
   if(result.ok){completed++;text('v229Result','指令を保存。次の工程で「承認を照合してMAP配置へ」を実行できます。');
    const cards=[...root.querySelectorAll('[data-v229-response]')];cue('resolve',cards,root);
   }else{errors++;text('v229Result',result.error||'対処を実行できませんでした');}
  }catch(e){errors++;text('v229Result',e.message);}finally{pending=false;render();}
 }
 root.addEventListener('click',event=>{
  const btn=event.target.closest('button[data-v229-response]');if(!btn||btn.disabled)return;
  choose(btn.dataset.v229Response);
 });
 arm.addEventListener('click',async event=>{
  const btn=event.target.closest('button[data-v229-order]');if(!btn||btn.disabled||pending)return;
  pending=true;const key=btn.dataset.v229Order;
  try{
   const result=await consoleBattleCommand(key);
   if(result.ok){issued++;const labels={recon:'先行解析完了',feint:'陽動地点を設定',fortify:'局地防御態勢を構築'};
    arm.querySelector('#v229OrderResult').textContent=labels[key]+' / 戦況を更新';
    cue('order',[...arm.querySelectorAll('[data-v229-order]')],arm);
   }else{errors++;arm.querySelector('#v229OrderResult').textContent=result.error||'命令が実行できませんでした';}
  }catch(e){errors++;arm.querySelector('#v229OrderResult').textContent=e.message;}
  finally{pending=false;render();}
 });
 function render(){
  if(!staffWorldReady)return;
  attach();
  let p=null,kind=null,b=null;
  try{p=api.get();kind=api.kind();b=consoleBattle();}catch(e){text('v229Result',e.message);}
  root.hidden=!p||!b||b.stage==='field';
  legacy.hidden=false;if(!p&&!legacy.open)legacy.open=true;
  if(p&&kind&&b){if(legacy.open&&renderedKey==='')legacy.open=false;
   const e=S.evas[b.unit],stage=p.status;
   root.dataset.state=stage;
   text('v229Status',stage==='pending'?'DECISION REQUIRED':'CLEARANCE GRANTED');
   text('v229Index','CASE '+String(p.caseNo).padStart(3,'0')+' / '+kind.id.toUpperCase());
   text('v229Title',kind.title);
   text('v229Description',kind.text);
   text('v229Power',S.defense.energy+'%');
   text('v229Distance',S.defense.enemy?.dist??'--');
   text('v229Integrity',(Number.isFinite(e.tacticalIntegrity)?e.tacticalIntegrity:100)+'%');
   if(p.status==='resolved')text('v229Result','異常対処済み：'+kind.options.find(x=>x[0]===p.choice)?.[1]+'。正式承認・機体状態を照合して配置へ。');
   const key=p.caseNo+'|'+p.unit+'|'+p.kind+'|'+p.status;
   if(renderedKey!==key){
    root.querySelector('#v229Choices').innerHTML=kind.options.map(([id,title,description],index)=>'<button type="button" data-v229-response="'+id+'">'+
     '<span>0'+(index+1)+' / COMMAND</span><strong>'+title+'</strong><small>'+description+'</small></button>').join('');
    if(renderedKey)cue('incident',[...root.querySelectorAll('[data-v229-response]')],root);
    renderedKey=key;
   }
   for(const btn of root.querySelectorAll('[data-v229-response]')){
    btn.disabled=pending||p.status==='resolved'||b.stage!=='approval';
    btn.setAttribute('aria-pressed',String(btn.dataset.v229Response===p.choice));
   }
   const old=document.querySelector('.v228-sortie');
   if(old)old.hidden=b.stage==='field';
  }
  if(arm.isConnected){
   const valid=b?.stage==='field'&&!!tacticalState()?.v229Enabled&&S.defense.status==='active';
   arm.hidden=!valid;
   for(const btn of arm.querySelectorAll('[data-v229-order]')){
    const cost=btn.dataset.v229Order==='recon'?9:7;
    btn.disabled=pending||!valid||b.ap<1||S.defense.energy<cost||tacticalReady().length>0;
   }
  }
 }
 const originalDraw=draw;draw=function(){originalDraw();render();};
 window.addEventListener('nerv-route',render);window.addEventListener('nerv-world-ready',render);
 window.NERV_V229_UI={snapshot:()=>({completed,issued,errors,animations,pending,visible:!root.hidden,legacyCollapsed:!legacy.open})};
 render();
}
initV229Workstation();
