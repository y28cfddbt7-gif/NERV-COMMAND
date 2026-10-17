// Independent, addressable sections keep one iPhone task on screen at a time.
const mobileGroups={},mobileCurrent={};
function mobileSection(page,id){return mobileGroups[page]?.panels.find(p=>p.dataset.view===id);}
function mobileNavigate(page,view,push=true){
 const group=mobileGroups[page];
 if(group){view=mobileSection(page,view)?view:group.defaultView;mobileCurrent[page]=view;
  for(const panel of group.panels)panel.hidden=panel.dataset.view!==view;
  for(const button of group.nav.querySelectorAll('button')){const active=button.dataset.mobileTab===page+'/'+view;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;}
  group.nav.hidden=page==='tools'&&view==='desk';
 }
 const route=page+(group?'/'+view:'');
 if(push&&location.hash!=='#'+route)history.pushState({},'', '#'+route);
 if(page==='infra'&&view==='geography')ensureMap();
 if(page==='weather'&&view==='radar')setTimeout(()=>meteoPaintMap(true),0);
 window.scrollTo({top:0,behavior:'instant'});
 window.dispatchEvent(new CustomEvent('nerv-route',{detail:{page,view}}));
}
function mobileGroup(pageName,definitions,defaultView){
 const page=qs('.page[data-page="'+pageName+'"]');if(!page)return;
 const nav=document.createElement('nav');nav.className='mobile-tabs';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','表示内容');
 const panels=[];
 for(const definition of definitions){
  let panel=definition.existing?page.querySelector('[data-view="'+definition.id+'"]'):document.createElement('section');
  if(!panel)continue;
  if(!definition.existing){panel.className='mobile-view';panel.dataset.view=definition.id;for(const selector of definition.selectors)for(const node of [...page.querySelectorAll(selector)])panel.append(node);page.append(panel);}
  panel.id='mobile-'+pageName+'-'+definition.id;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-label',definition.label);panel.hidden=true;panels.push(panel);
  const button=document.createElement('button');button.type='button';button.dataset.mobileTab=pageName+'/'+definition.id;button.textContent=definition.label;button.setAttribute('role','tab');button.setAttribute('aria-controls',panel.id);button.addEventListener('click',()=>mobileNavigate(pageName,definition.id));nav.append(button);
 }
 const anchor=page.querySelector('.page-top')||page.querySelector('.meteo-notice');if(anchor)anchor.after(nav);else page.prepend(nav);
 nav.addEventListener('keydown',event=>{const buttons=[...nav.querySelectorAll('button')],index=buttons.indexOf(document.activeElement);if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowLeft'?-1:1)+buttons.length)%buttons.length;buttons[next].click();buttons[next].focus();});
 mobileGroups[pageName]={panels,nav,defaultView};mobileNavigate(pageName,defaultView,false);
}
function initMobileViews(){
 if(!qs('#staffSupport'))return;
 mobileGroup('tools',[['desk','一覧'],['identity','職員証'],['communications','通信'],['device','端末'],['tasks','タスク'],['duty','当直'],['handover','引継ぎ'],['inspection','点検'],['timer','タイマー']].map(([id,label])=>({id,label,existing:true})),'desk');
 mobileGroup('eva',[
  {id:'monitor',label:'機体監視',selectors:['.eva-display']},
  {id:'control',label:'発進管制',selectors:['.eva-ops-header','.eva-action-grid','#evaGuidance']},
  {id:'readiness',label:'機体点検・給電',selectors:['#evaReadiness']},
  {id:'telemetry',label:'数値監視',selectors:['.eva-magi-readout','.eva-stats','.eva-systems']},
  {id:'log',label:'運用記録',selectors:['.eva-log-heading','#evaLog']}
 ],'monitor');
 mobileGroup('magi',[
  {id:'request',label:'審議申請',selectors:['#magiRequestPanel']},
  {id:'consensus',label:'三基合議',selectors:['#magiBoard']},
  {id:'intrusion',label:'侵入対処',selectors:['#magiIntrusionPanel']},
  {id:'log',label:'決議履歴',selectors:['#magiLog']}
 ],'request');
 mobileGroup('mission',[
  {id:'orders',label:'指揮',selectors:['#missionOrdersPanel']},
  {id:'status',label:'状況',selectors:['#missionStatusPanel']},
  {id:'checks',label:'実行条件',selectors:['#staffChecklist']},
  {id:'strategy',label:'防衛方針',selectors:['#missionStrategyPanel']},
  {id:'log',label:'記録',selectors:['#missionLogPanel']}
 ],'orders');
 mobileGroup('infra',[
  {id:'map',label:'防衛地図',selectors:['.v27-head','.v27-kpi:not(#defenseTurnStats)','#v27IsoMap','.v27-readbar','#v27Facilities']},
  {id:'facilities',label:'施設・迎撃',selectors:['#v27DefenseBoard']},
  {id:'systems',label:'都市系統',selectors:['#infraSystems']},
  {id:'geography',label:'実地図',selectors:['.infra-status']},
  {id:'log',label:'記録',selectors:['#infraRecords','#v27DefenseBoard .v27-mini']}
 ],'map');
 mobileGroup('weather',[
  {id:'current',label:'現在・予報',selectors:['#meteoCurrentPanel','.meteo-hourly','#weatherFetch','#weatherStatus']},
  {id:'radar',label:'雨雲',selectors:['#meteoRadarPanel']},
  {id:'region',label:'地域',selectors:['#meteoRegionalPanel','.meteo-river']},
  {id:'advice',label:'参考情報',selectors:['#meteoAlertPanel','.meteo-guidance']}
 ],'current');
 const oldWeatherNav=qs('.meteo-nav');if(oldWeatherNav)oldWeatherNav.hidden=true;
 const weatherGrid=qs('.meteo-grid');if(weatherGrid&&!weatherGrid.children.length)weatherGrid.remove();
 mobileGroup('settings',[
  {id:'display',label:'表示・音',selectors:['#soundSwitch','.setting-audio','#motionSwitch','#bootSwitch']},
  {id:'data',label:'通信・データ',selectors:['#autoWeatherSwitch','#clearTasks','#resetSim','.privacy']}
 ],'display');
 const priorGo=go;go=function(page){const from=currentPage;priorGo(page);const initial=page==='magi'&&magiIntrusionActive()?'intrusion':page==='eva'&&['mission','magi'].includes(from)?'control':mobileGroups[page]?.defaultView;mobileNavigate(page,initial);};
 window.NERV_TEST.open=go;
 window.NERV_MOBILE={open:(page,view)=>{if(currentPage!==page)priorGo(page);mobileNavigate(page,view);},view:page=>mobileCurrent[page]};
 for(const button of all('[data-mobile-go]'))button.addEventListener('click',()=>{const [page,view]=button.dataset.mobileGo.split('/');window.NERV_MOBILE.open(page,view);});
 let lastVote=S.magi.vote?.time;
 const priorDraw=draw;draw=function(){priorDraw();if(S.magi.vote?.time&&S.magi.vote.time!==lastVote&&currentPage==='magi')mobileNavigate('magi','consensus');lastVote=S.magi.vote?.time;};
 const restore=()=>{const [page,view]=location.hash.slice(1).split('/');if(!['home','weather','infra','eva','magi','mission','tools','settings'].includes(page))return;priorGo(page);mobileNavigate(page,view,false);};
 window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
 if(location.hash)restore();else mobileNavigate(currentPage,mobileGroups[currentPage]?.defaultView);
}
initMobileViews();
