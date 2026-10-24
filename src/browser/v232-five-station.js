// v2.32 / Five-station operational UI. Presentation restructuring only.
// Existing game commands, painted atlases, saves and WebAudio are unchanged.
function initV232FiveStation(){
 if(!window.NERV_MOBILE||!window.NERV_V232_MODE)return;
 const stats={version:'2.32',menus:0,steps:0,layout:0,maps:0,animations:0,errors:0,ownRAF:false,ownTimers:false};
 const $=id=>document.getElementById(id);
 const names={
  battle:{setup:'発進',engage:'戦闘',records:'記録'},
  infra:{map:'都市地図',systems:'都市設備',facilities:'防衛',deployment:'機体配置',weapons:'兵装',geography:'実地図',log:'記録'},
  eva:{monitor:'機体',control:'発進',readiness:'整備',neural:'機体数値',log:'記録'},
  magi:{main:'三基解析',config:'異常対処',log:'履歴'},
  work:{brief:'当直',communications:'通信',history:'履歴'},
  mission:{orders:'作戦',status:'状況',armament:'兵装'},
  settings:{display:'表示・音',data:'データ'},
  weather:{current:'天候',radar:'雨雲',region:'地域'}
 };
 const priorities={battle:['setup','engage'],infra:['map','systems'],eva:['monitor','control'],magi:['main','config'],work:['brief','communications']};
 const state={launchStep:'prepare',lastCase:null,mapFit:false,details:false};
 const menus={};
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const create=(tag,cls)=>{const n=document.createElement(tag);n.className=cls;return n;};
 function optional(id,title,element,before){
  if(!element)return null;
  let node=$(id);
  if(!node){node=create('details','v232-disclosure');node.id=id;const head=create('summary','');head.textContent=title;node.append(head);(before||element).before(node);node.append(element);stats.layout++;}
  return node;
 }
 function navigation(){
  for(const [page,group] of Object.entries(mobileGroups)){
   if(!group?.nav||!group.panels?.length||page==='tools')continue;
   let nav=menus[page];
   if(!nav){
    nav=create('nav','v232-task-nav');nav.dataset.page=page;nav.setAttribute('aria-label','現在の業務の切り替え');
    const available=[...group.nav.querySelectorAll('[data-mobile-tab]')].map(x=>({v:x.dataset.mobileTab.split('/')[1],name:x.textContent}));
    const preferred=(priorities[page]||available.slice(0,2).map(x=>x.v)).filter(v=>available.some(a=>a.v===v)).slice(0,2);
    for(const v of preferred){
     const b=create('button','v232-nav-button');b.type='button';b.dataset.v232View=v;
     b.textContent=names[page]?.[v]||available.find(a=>a.v===v)?.name||v;
     b.addEventListener('click',()=>window.NERV_MOBILE.open(page,v));
     nav.append(b);
    }
    const extra=available.filter(x=>!preferred.includes(x.v));
    if(extra.length){
     const more=create('details','v232-more');more.innerHTML='<summary>その他 ▾</summary><div class="v232-menu-choices"></div>';
     for(const x of extra){
      const b=create('button','');b.type='button';b.textContent=names[page]?.[x.v]||x.name;
      b.addEventListener('click',()=>{more.open=false;window.NERV_MOBILE.open(page,x.v);stats.menus++;});
      more.querySelector('.v232-menu-choices').append(b);
     }
     nav.append(more);
    }
    group.nav.before(nav);menus[page]=nav;stats.layout++;
   }
   const view=mobileCurrent[page]||group.defaultView;
   for(const b of nav.querySelectorAll('[data-v232-view]'))b.setAttribute('aria-current',b.dataset.v232View===view?'page':'false');
  }
 }
 const launchNav=create('nav','v232-launch-steps');
 launchNav.id='v232LaunchSteps';launchNav.setAttribute('aria-label','発進の三段階');
 launchNav.innerHTML='<button type="button" data-v232-step="prepare">01 機体準備</button>'+
  '<button type="button" data-v232-step="review">02 出撃審議</button>'+
  '<button type="button" data-v232-step="deploy">03 射出実行</button>';
 launchNav.addEventListener('click',e=>{
  const b=e.target.closest('[data-v232-step]');if(!b||b.disabled)return;
  const next=b.dataset.v232Step;
  if(next==='deploy'){window.NERV_MOBILE.open('battle','deploy');return;}
  state.launchStep=next;stats.steps++;update();
 });
 const citySummary=create('div','v232-city-summary');
 citySummary.id='v232CitySummary';
 citySummary.innerHTML='<span>都市健全性 <b id="v232CityHealth">--</b></span>'+
 '<span>主電源 <b id="v232CityPower">--</b></span><span>通信 <b id="v232CityComms">--</b></span>'+
 '<span>敵影 <b id="v232CityEnemy">--</b></span>';
 const fitBtn=create('button','v232-map-toggle');fitBtn.type='button';fitBtn.id='v232MapToggle';
 fitBtn.addEventListener('click',()=>{state.mapFit=!state.mapFit;stats.maps++;update();});
 const phaseLabel=create('span','v232-phase-code');phaseLabel.id='v232BattlePhase';phaseLabel.textContent='PHASE';
 function place(){
  navigation();
  const setup=mobileSection('battle','setup'),deploy=mobileSection('battle','deploy');
  const panel=setup?.querySelector('.staff-panel'),approval=$('consoleApproval');
  if(panel&&launchNav.parentElement!==panel){
   const incident=$('v229Sortie');
   if(incident)incident.before(launchNav);else panel.prepend(launchNav);
   stats.layout++;
  }
  const legacy=$('v229Legacy');
  if(legacy&&!legacy.dataset.v232Initialized){legacy.open=false;legacy.dataset.v232Initialized='1';}
  const vote=$('battleVotes');
  if(vote&&!vote.closest('#v230VoteDetails')&&!vote.closest('#v232VoteRecord'))
   optional('v232VoteRecord','三基の判定理由・測定記録',vote,approval?.closest('.console-approval-actions')||vote);
  // Keep the original 3-step operation commands and all detailed controls.
  const launchForm=$('consoleTargets');
  if(launchForm&&!launchForm.closest('#v232CaseDetail'))optional('v232CaseDetail','目標選択・受理記録',launchForm);
  const deploymentGrid=$('consoleCells');
  if(deploymentGrid&&!deploymentGrid.closest('#v232LaunchLocations'))optional('v232LaunchLocations','配置区画をリストから指定',deploymentGrid);
  const field=$('v228SectorGrid')?.closest('.v228-field');
  if(field){
   const facts=field.querySelector('.v228-field-state');
   if(facts&&!phaseLabel.parentElement){const box=create('span','v232-phase-fact');box.append('PHASE ',phaseLabel);facts.append(box);stats.layout++;}
   const skills=$('v229CombatOrders'),grid=$('v228SectorGrid');
   if(skills&&grid&&skills.previousElementSibling!==grid){grid.after(skills);stats.layout++;}
   const actions=field.querySelector('.v228-actions');
   if(actions&&!actions.closest('#v232MapTools'))optional('v232MapTools','作戦支援・照準・詳細操作',actions);
  }
  const map=$('tokyoCanvasMap');
  if(map){
   if(!map.closest('#v232MapWindow')){
    const windowMap=create('div','v232-map-window');
    windowMap.id='v232MapWindow';map.before(windowMap);windowMap.append(map);
    const tools=create('div','v232-map-toolbar');
    tools.append(citySummary,fitBtn);windowMap.before(tools);stats.layout++;
   }
  }
  // Original illustrated unit art stays on the EVA page. The 2018-era
  // decorative STATUS overlay is disabled by CSS to avoid low-quality inserts.
  const systems=$('infraSystems');
  if(systems&&$('citySystemsVisual'))$('citySystemsVisual').setAttribute('aria-hidden','true');
 }
 function update(){
  if(!staffWorldReady)return;
  place();
  const battle=typeof consoleBattle==='function'?(()=>{try{return consoleBattle();}catch(e){return null;}})():null;
  if(S?.defense?.caseNo!==state.lastCase){state.lastCase=S.defense.caseNo;state.launchStep='prepare';}
  const activeEva=S.evas?.[S.tactics?.attacker||0];
  let incidentPending=false;
  try{incidentPending=window.NERV_GAME_V229?.get?.()?.status==='pending';}catch(e){}
  if(battle?.stage==='approval'&&state.launchStep==='prepare'&&
     ['READY','DEPLOYED'].includes(activeEva?.state)&&!incidentPending)state.launchStep='review';
  const step=battle?.stage==='placement'?'deploy':battle?.stage==='field'?'field':state.launchStep;
  const setup=mobileSection('battle','setup');
  if(setup)setup.dataset.v232Step=step;
  const deploy=mobileSection('battle','deploy');
  if(deploy)deploy.dataset.v232Step=step;
  for(const b of launchNav.querySelectorAll('button')){
   const item=b.dataset.v232Step;
   b.setAttribute('aria-current',item===step?'step':'false');
   b.disabled=item==='deploy'&&battle?.stage!=='placement'&&battle?.stage!=='field';
  }
  const caseDetail=$('v232CaseDetail');
  if(caseDetail&&!caseDetail.dataset.v232Initialized){caseDetail.open=S.defense.status!=='active';caseDetail.dataset.v232Initialized='1';}
  const evt=$('v229Sortie'),eventPending=incidentPending||evt?.dataset.state==='pending';
  if(setup)setup.dataset.v232Incident=eventPending?'pending':'resolved';
  if(state.launchStep==='review'&&eventPending){state.launchStep='prepare';if(setup)setup.dataset.v232Step='prepare';}
  const code=$('v232BattlePhase'),page=mobileCurrent.battle||'';
  if(code){code.textContent=battle?.stage==='field'?'交戦':battle?.stage==='placement'?'射出':'発進';}
  const details=$('v232MapTools');
  if(details?.open&&page==='engage'&&document.body.dataset.v232Map==='compact')details.open=false;
  const score=S.defense.city||[];
  const health=score.length?Math.round(score.reduce((v,x)=>v+(Number(x.hp)||0),0)/score.length):0;
  for(const [key,val] of [['v232CityHealth',health+'%'],['v232CityPower',S.infra.power?'正常':'障害'],['v232CityComms',S.infra.comms?'接続':'切断'],['v232CityEnemy',S.defense.status==='active'?'探知':'なし']]){
   const node=$(key);if(node&&node.textContent!==val)node.textContent=val;
  }
  const city=mobileSection('infra','map');if(city)city.dataset.v232City=true;
  const view=$('v232MapWindow');if(view){
   view.dataset.fit=String(state.mapFit);
   fitBtn.textContent=state.mapFit?'地図を拡大 ↗':'全域を表示 ↗';
  }
  // The v2.30 task-switch is the only battle mode switch.
  const combat=mobileSection('battle','engage');
  if(combat)combat.dataset.v232Battle=true;
  stats.layout++;
 }
 const previous=draw;
 draw=function(){previous();update();};
 window.addEventListener('nerv-route',update);
 window.addEventListener('nerv-world-ready',update);
 window.addEventListener('nerv-city-art-ready',update);
 window.NERV_V232={snapshot:()=>({...stats,launchStep:state.launchStep,mapFit:state.mapFit,artworkReencoded:false})};
 update();
}
initV232FiveStation();
