// NERV-COMMAND v2.30 / task-focused compact battle presentation.
// No combat reducer, saves, image bytes, battle Canvas or launch validation changed.
function initV230CompactBattle(){
 if(!window.NERV_MOBILE||!document.getElementById('shell'))return;
 const stats={version:'2.30',modes:0,turns:0,details:0,renders:0,errors:0,ownRAF:false,ownTimers:false};
 const state={mode:'command',motion:false,caseNo:null,busy:false};
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const $=id=>document.getElementById(id);
 const status=(message)=>{const n=$('v230Feedback');if(n)n.textContent=message;};
 const wrap=(element,id,summary)=>{
  if(!element)return null;
  let outer=$(id);
  if(!outer){outer=document.createElement('details');outer.id=id;outer.className='v230-detail';
   const head=document.createElement('summary');head.textContent=summary;outer.append(head);
   element.before(outer);outer.append(element);
  }
  return outer;
 };
 const header=document.createElement('div');header.id='v230BattleToolbar';header.className='v230-toolbar';header.hidden=true;
 header.innerHTML=
  '<div class="v230-tabs" role="group" aria-label="戦闘表示モード">'+
  '<button type="button" data-v230-mode="command" aria-pressed="true">指揮マップ</button>'+
  '<button type="button" data-v230-mode="precision" aria-pressed="false">精密照準・兵装</button></div>'+
  '<button type="button" data-v230-action="wait" class="v230-wait">手番終了</button>'+
  '<p id="v230Feedback" role="status" aria-live="polite"></p>';
 const motionBtn=document.createElement('button');motionBtn.id='v230MotionToggle';
 motionBtn.className='v230-motion-toggle';motionBtn.type='button';
 motionBtn.setAttribute('aria-expanded','false');motionBtn.textContent='作戦テレメトリを表示 ▾';
 const change=(next,immediate=false)=>{
  if(!['command','precision'].includes(next))return;
  if(state.mode!==next){state.mode=next;stats.modes++;}
  const engage=typeof mobileSection==='function'?mobileSection('battle','engage'):null;
  if(engage)engage.dataset.v230Mode=state.mode;
  for(const btn of header.querySelectorAll('[data-v230-mode]')){
   btn.setAttribute('aria-pressed',String(btn.dataset.v230Mode===next));
  }
  const map=$('v228SectorGrid'),canvas=$('battleTacticalCanvas');
  if(!immediate&&!document.hidden&&!reduced?.matches&&typeof isMoving==='function'&&isMoving()){
   const target=next==='command'?map:canvas;
   if(target?.isConnected)window.NERV_MOTION?.animate?.('v230-switch',target,
    {opacity:[.55,1],scale:[.985,1],duration:310,ease:'outQuart',composition:'replace',
    onComplete:()=>{target.style.removeProperty('opacity');target.style.removeProperty('transform');}},target);
  }
 };
 function install(){
  const engage=typeof mobileSection==='function'?mobileSection('battle','engage'):null;
  const setup=typeof mobileSection==='function'?mobileSection('battle','setup'):null;
  if(setup){
   wrap($('battleVotes'),'v230VoteDetails','MAGIの審議理由と記録を表示');
  }
  const main=$('v228SectorGrid'),field=main?.closest('.v228-field');
  if(engage&&field&&!header.isConnected){
   field.before(header);
   engage.dataset.v230Mode=state.mode;
  }
  // The old giant TACTICAL COMMAND is retained and updated, but replaced with
  // a single user-controlled disclosure instead of a 300px repeated dashboard.
  for(const panel of [setup,engage]){
   if(!panel)continue;
   if(panel.querySelector('#v225Ops')&&!panel.querySelector('#v230MotionToggle'))panel.insertBefore(motionBtn,panel.firstElementChild);
   const extra=panel.querySelector('#v226DataLink');
   if(extra?.parentElement===panel&&extra!==panel.lastElementChild)panel.append(extra);
  }
 }
 function visiblePage(){
  return typeof currentPage==='string'&&currentPage==='battle';
 }
 function render(){
  if(!staffWorldReady)return;
  stats.renders++;
  install();
  let b=null;
  try{b=consoleBattle();}catch(e){}
  const active=!!b&&S.defense?.status==='active';
  const canFight=active&&b.stage==='field';
  header.hidden=!canFight;
  if(canFight){
   if(state.caseNo!==S.defense.caseNo){state.caseNo=S.defense.caseNo;state.mode='command';}
   change(state.mode,true);
   const wait=header.querySelector('[data-v230-action=wait]');
   const blocked=typeof tacticalReady==='function'?tacticalReady():[];
   wait.disabled=state.busy||blocked.length>0;
   wait.title=blocked.join(' / ');
   const label=state.mode==='command'?'区画タップで実際に移動 / APを使って指令':'戦術盤で照準・武器を操作';
   if(!state.busy&&!$('v230Feedback')?.textContent)status(label);
  }
  const view=typeof mobileSection==='function'?mobileSection('battle',mobileCurrent?.battle||'setup'):null;
  if(view){
   view.dataset.v230Motion=String(state.motion);
  }
  const toggle=$('v230MotionToggle');
  if(toggle){toggle.setAttribute('aria-expanded',String(state.motion));toggle.textContent=state.motion?'作戦テレメトリを閉じる ▴':'作戦テレメトリを表示 ▾';}
 }
 header.addEventListener('click',async event=>{
  const btn=event.target.closest('button');if(!btn||btn.disabled)return;
  if(btn.dataset.v230Mode){change(btn.dataset.v230Mode);status(btn.dataset.v230Mode==='command'?'指揮マップ：区画、敵の射界、APを確認':'精密照準：機体と兵装の専用画面へ切替');return;}
  if(btn.dataset.v230Action!=='wait'||state.busy)return;
  state.busy=true;
  try{
   const result=await consoleBattleCommand('wait');
   if(result.ok){stats.turns++;status('手番終了。敵の行動と新たな予告射界を確認。');}
   else{stats.errors++;status(result.error||'手番終了できません');}
  }catch(e){stats.errors++;status(e.message);}
  finally{state.busy=false;render();}
 });
 motionBtn.addEventListener('click',()=>{
  state.motion=!state.motion;stats.details++;render();
 });
 const prevDraw=draw;
 draw=function(){prevDraw();render();};
 window.addEventListener('nerv-route',render);
 window.addEventListener('nerv-world-ready',render);
 window.addEventListener('nerv-tactical-turn',render);
 window.NERV_COMPACT_BATTLE={snapshot:()=>({...stats,mode:state.mode,motionOpen:state.motion,toolbarVisible:!header.hidden})};
 render();
}
initV230CompactBattle();
