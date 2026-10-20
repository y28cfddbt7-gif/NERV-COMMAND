// Public navigation is consolidated. Legacy panels stay mounted for saved data,
// old renderers and historical reducer tests; old URLs resolve to the common console.
function initConsoleNavigation(){
 if(!mobileGroups.battle||!mobileGroups.magi)return;
 const legacyNavigate=mobileNavigate;let restoringHistory=false;const markRestore=()=>{restoringHistory=true;};window.addEventListener('popstate',markRestore,true);window.addEventListener('hashchange',markRestore,true);
 const combatAliases=new Set(['combat','engage','engagement','angels','weapon-control','checks']);
 mobileNavigate=function(page,view,push=true){
  if(restoringHistory)push=false;const requestedPage=page,requestedView=view;
  if(page==='mission'&&view==='strategy'){page='infra';view='facilities';}
  if(page==='work'&&view==='incidents'){page='magi';view='main';}
  if(page==='mission'&&combatAliases.has(view||'orders')){page='battle';view='engage';}
  if(page==='magi'){view=['log','maintenance-history'].includes(view)?'log':['config','maintenance-settings'].includes(view)?'config':'main';}
  if(page==='battle'){
   if(view==='targets')view='setup';if(!['setup','deploy','engage','records'].includes(view))view='engage';
   if(['engage','deploy'].includes(view)){let b=null;try{b=consoleBattle();}catch(error){}if(!b||b.stage==='approval')view='setup';else if(b.stage==='placement')view='deploy';else if(view==='deploy')view='engage';}
  }
  if(page!==requestedPage){const previousPush=history.pushState;if(!push)history.pushState=function(s,t,u){history.replaceState(s,t,u);};try{NERV_MOBILE.open(page,view);}finally{history.pushState=previousPush;}return;}
  legacyNavigate(page,view,push);
  if(!push&&(requestedView!==view||location.hash!==('#'+page+'/'+view))&&mobileGroups[page])history.replaceState({},'','#'+page+'/'+view);
  if(page==='battle'&&view==='deploy'){const b=qs('[data-mobile-tab="battle/engage"]');b?.setAttribute('aria-selected','true');if(b)b.tabIndex=0;}
 };
 function compact(page,allowed,labels){const group=mobileGroups[page];group.defaultView=allowed[0];for(const b of [...group.nav.querySelectorAll('button')]){const view=b.dataset.mobileTab.split('/')[1];if(!allowed.includes(view))b.remove();else if(labels[view])b.textContent=labels[view];}for(const id of allowed){const b=group.nav.querySelector('[data-mobile-tab="'+page+'/'+id+'"]');if(b)group.nav.append(b);}}
 compact('battle',['setup','engage','records'],{setup:'発進承認',engage:'MAP・戦闘',records:'作戦記録'});
 compact('magi',['main','log','config'],{main:'三基管制',log:'処理履歴',config:'演習・設定'});
 const mission=mobileGroups.mission;for(const b of [...mission.nav.querySelectorAll('button')])if(combatAliases.has(b.dataset.mobileTab.split('/')[1])||b.dataset.mobileTab==='mission/strategy')b.remove();mission.defaultView='orders';
 for(const b of [...mobileGroups.work.nav.querySelectorAll('[data-mobile-tab="work/incidents"]')])b.remove();
 const entry=document.createElement('button');entry.className='staff-primary';entry.dataset.opsRoute='battle/engage';entry.textContent='発進承認・MAP戦闘管制 ↗';mobileSection('mission','status')?.prepend(entry);
 // Keep facility dispatch and equipment documentation without a second combat loop.
 const missionTitle=qs('.page[data-page="mission"] .page-top h1');if(missionTitle)missionTitle.textContent='作戦照会 / OPERATIONS DESK';const missionIntro=qs('.page[data-page="mission"] .page-top .intro');if(missionIntro)missionIntro.textContent='作戦状況・職員照会・兵装資料を確認します。';
 const orders=$('missionOrdersPanel');if(orders){for(const node of [...orders.children])if(node.id!=='staffCommandOpen')node.hidden=true;const title=document.createElement('h2');title.textContent='職員指揮・作戦照会';orders.prepend(title);const link=document.createElement('button');link.className='staff-primary';link.dataset.opsRoute='battle/engage';link.textContent='発進承認・MAP戦闘管制 ↗';orders.append(link);}
 const priorDispatch=dispatchInfo;dispatchInfo=function(id){if(['next','detect','scan'].includes(id))return {title:id==='detect'?'接近目標を確認':'統合戦闘管制を確認',effect:'発進承認・MAP配置・2AP戦闘は共通コンソールで操作します。照会だけでは資源を消費しません。',route:['battle',id==='detect'?'setup':'engage'],blocked:''};return priorDispatch(id);};
 const doctrine=document.createElement('details');doctrine.className='console-doctrine';doctrine.innerHTML='<summary>都市援護の防衛方針・予測</summary>';for(const selector of ['.doctrine-options','#strategyForecast']){const node=qs(selector);if(node)doctrine.append(node);}mobileSection('infra','facilities')?.append(doctrine);
 for(const id of ['positronCharge','positronSupply','positronFire']){const node=$(id);if(node)node.hidden=true;}
 const equipment=mobileSection('mission','armament');if(equipment){const use=equipment.querySelector('[data-ops-route="mission/weapon-control"]');if(use)use.textContent='この兵装で統合戦闘管制へ ↗';const link=document.createElement('button');link.className='staff-primary';link.dataset.opsRoute='battle/engage';link.textContent='兵装の使用は統合戦闘管制へ ↗';equipment.append(link);}
 const renderStatus=()=>{if(!staffWorldReady)return;let b=null;try{b=consoleBattle();}catch(error){}meteoText('missionStep',S.defense.status==='active'?(b?({approval:'発進承認',placement:'MAP配置',field:'MAP戦闘 / '+b.ap+' AP'}[b.stage]):'作戦引継ぎ待ち'):S.defense.status==='victory'?'目標沈黙':S.defense.status==='defeat'?'回収・復旧待ち':'接近報告待機');meteoText('missionDescription','発進・位置取り・照準は統合戦闘管制で実施。施設配備・兵装資料・職員照会はこの画面群で確認できます。');meteoText('staffCharge',S.defense.energy+'% / 都市電力');if($('staffAttackUnit'))$('staffAttackUnit').disabled=!!b&&b.stage!=='approval';};const priorDraw=draw;draw=function(){priorDraw();renderStatus();};window.addEventListener('nerv-route',renderStatus);window.addEventListener('nerv-world-ready',renderStatus);
 // Capture city turn controls before old direct listeners: one real enemy phase
 // through the same persisted AP controller when a unified battle is active.
 document.addEventListener('click',event=>{const b=event.target.closest?.('#v27Advance,#strategyAdvance');if(!b)return;let active=false;try{active=!!consoleBattle();}catch(error){event.stopImmediatePropagation();toast(error.message);return;}if(active){event.preventDefault();event.stopImmediatePropagation();consoleBattleCommand('wait');}},true);
 for(const id of ['v27Detect','v27Scan','v27Shot','v27Magi','v27Advance']){const control=$(id);if(control)control.hidden=true;}
 const cityEntry=document.createElement('button');cityEntry.className='staff-primary';cityEntry.dataset.opsRoute='battle/engage';cityEntry.textContent='迎撃作戦は統合戦闘管制へ ↗';$('defenseTools')?.before(cityEntry);
 window.addEventListener('popstate',()=>{restoringHistory=false;});window.addEventListener('hashchange',()=>{restoringHistory=false;});
 const [page,view]=location.hash.slice(1).split('/');if(mobileGroups[page]||page==='home')NERV_MOBILE.open(page,view);
}
initConsoleNavigation();
