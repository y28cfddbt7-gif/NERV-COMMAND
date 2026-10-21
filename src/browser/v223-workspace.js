// One public route per function. Keep legacy DOM, IDs and reducers for old saves.
const dutyAliases={
 'mission/orders':'battle/setup','mission/status':'battle/engage','mission/log':'battle/records',
 'infra/armory':'infra/weapons','eva/telemetry':'eva/neural',
 'hq/comms':'work/communications','tools/communications':'work/communications',
 'work/departments':'work/brief','work/security-history':'work/history'
};
function initDutyWorkspace(){
 if(!window.NERV_MESSAGES||!mobileGroups.work)return;
 const merged=new Map(),groups=new Map(),initialFold=history.state?.dutyFold;let restoredFold=null,queuedRestore=null;
 function rememberFold(alias){const state={...(history.state||{})};if(alias)state.dutyFold=alias;else delete state.dutyFold;history.replaceState(state,'',location.href);}
 function fold(from,to,label){const [fp,fv]=from.split('/'),[tp,tv]=to.split('/'),source=mobileSection(fp,fv),target=mobileSection(tp,tv);if(!source||!target)return;
  if(!groups.has(to)){const main=document.createElement('details'),title=document.createElement('summary');main.className='duty-merged';main.open=true;title.textContent=target.getAttribute('aria-label')||'現在の業務';main.append(title);while(target.firstChild)main.append(target.firstChild);target.append(main);groups.set(to,[main]);}
  const details=document.createElement('details'),summary=document.createElement('summary');details.className='duty-merged';summary.textContent=label;details.append(summary);while(source.firstChild)details.append(source.firstChild);target.append(details);groups.get(to).push(details);merged.set(from,details);
 }
 fold('mission/log','battle/records','指揮記録を確認');fold('infra/armory','infra/weapons','配備兵装の稼働監視');fold('eva/telemetry','eva/neural','機体の詳細数値');
 fold('hq/comms','work/communications','発令所の職員通信');fold('tools/communications','work/communications','館内放送・当直通信');fold('work/departments','work/brief','部署・設備の稼働状況');fold('work/security-history','work/history','保安案件の引継ぎ履歴');
 for(const [route,list]of groups)for(const panel of list)panel.addEventListener('toggle',()=>{if(panel.open){for(const other of list)if(other!==panel)other.open=false;if(currentPage+'/'+mobileCurrent[currentPage]===route)rememberFold([...merged].find(([,node])=>node===panel)?.[0]);}});
 // The general dispatch remains available; actual sortie controls live on battle/setup.
 const dispatch=$('staffCommandOpen');if(dispatch)mobileSection('work','brief')?.prepend(dispatch);
 for(const alias of Object.keys(dutyAliases)){const [page,view]=alias.split('/');mobileGroups[page]?.nav.querySelector('[data-mobile-tab="'+alias+'"]')?.remove();}
 mobileGroups.mission.defaultView='armament';
 for(const [route,label]of [['work/communications','部署・館内通信'],['work/history','当直・保安履歴'],['infra/weapons','兵装選択・監視'],['eva/neural','神経・数値監視']]){const [page]=route.split('/');const b=mobileGroups[page]?.nav.querySelector('[data-mobile-tab="'+route+'"]');if(b)b.textContent=label;}
 const navigate=mobileNavigate;let openingFold=false;
 mobileNavigate=function(page,view,push=true){
  const from=page+'/'+(view||mobileGroups[page]?.defaultView),alias=dutyAliases[from];
  if(!alias){if(!openingFold&&groups.has(from)){const list=groups.get(from);for(const item of list)item.open=item===list[0];}const result=navigate(page,view,push);if(!openingFold)rememberFold(null);return result;}
  if(from==='infra/armory'&&S.defense.selected===3){S.defense.selected=1;draw();}
  const [nextPage,nextView]=alias.split('/');if(merged.has(from)){for(const item of groups.get(alias)||[])item.open=item===merged.get(from);}
  if(nextPage===page){const result=navigate(page,nextView,push);rememberFold(merged.has(from)?from:null);return result;}
  const previousPush=history.pushState;if(!push)history.pushState=function(s,t,u){history.replaceState(s,t,u);};openingFold=true;try{NERV_MOBILE.open(nextPage,nextView);rememberFold(merged.has(from)?from:null);}finally{openingFold=false;history.pushState=previousPush;}
 };
 const card=document.createElement('aside');card.id='dutyContactCard';card.className='duty-contact';card.hidden=true;card.setAttribute('aria-label','担当者への状況相談');
 card.innerHTML='<div class="duty-contact-heading"><span id="dutyContactFace"></span><div><small>DEPARTMENT LIAISON / 担当回線</small><strong id="dutyContactName"></strong></div></div><p id="dutyContactBrief"></p><button id="dutyContactOpen" class="staff-secondary">担当者に相談 ↗</button>';
 mobileSection('work','jobs').prepend(card);
 const context=document.createElement('details');context.id='messageDutyContext';context.className='duty-context';context.hidden=true;
 context.innerHTML='<summary id="messageDutySummary">業務相談・担当画面へ</summary><small>状況は受信時に再確認</small><p id="messageDutyBrief"></p><div class="duty-questions"><button data-duty-question="status">現在の状況</button><button data-duty-question="next">次に確認すること</button><button data-duty-question="reason">判断の理由</button></div><button id="messageDutyReturn" class="staff-secondary">担当画面へ戻る ↗</button>';
 $('messageProposal').before(context);
 let active=null,selected=null;
 const titles={battle:'作戦管制',magi:'MAGI照合',security:'本部保安',duty:'日常業務',infra:'都市系統',eva:'機体運用'};
 const prompts={battle:'作戦の状況',magi:'MAGIの状況',security:'本部保安の状況',duty:'日常業務の状況',infra:'都市系統の状況',eva:'EVAの運用状況'};
 function routeContext(){
  const page=currentPage,view=mobileCurrent[page];
  if(page==='battle')return {domain:'battle',id:['rei','shinji','asuka'][S.tactics.attacker]||'misato'};
  if(page==='magi')return {domain:'magi',id:'ritsuko'};
  if(page==='work'&&['security','evidence','decision','fieldwork','field-records','security-control','security-response','case-library'].includes(view))return {domain:'security',id:view==='decision'?'fuyutsuki':'hyuga'};
  if(page==='work'&&['brief','jobs'].includes(view))return {domain:'duty',id:'maya'};
  if(page==='infra')return {domain:'infra',id:'aoba'};
  if(page==='eva')return {domain:'eva',id:['rei','shinji','asuka'][S.selectedEva]};
  return null;
 }
 function render(){
  active=routeContext();card.hidden=true;$('evaSelector')?.classList.remove('duty-has-contact');
  document.body.dataset.liaisonDomain=active?.domain||'';
  if(active&&staffWorldReady){let c=null;try{c=dutyContext(active.domain,active.id);}catch(error){}const panel=mobileSection(currentPage,mobileCurrent[currentPage]);if(c&&panel){const header=currentPage==='magi'&&mobileCurrent.magi==='main'?qs('.console-magi-header'):currentPage==='eva'?$('evaSelector'):currentPage==='battle'?qs('.battle-top'):$('terminalContext'),host=header||panel;if(card.parentNode!==host){if(header)host.append(card);else host.prepend(card);}if(currentPage==='eva')$('evaSelector').classList.add('duty-has-contact');card.dataset.inline=String(!!header);card.hidden=false;const person=personalById(active.id);meteoText('dutyContactName',person.name);meteoText('dutyContactBrief',c.fact);const face=$('dutyContactFace');if(face.dataset.contact!==person.id){face.replaceChildren(personalFace(person));face.dataset.contact=person.id;}meteoText('dutyContactOpen',currentPage==='eva'?'搭乗者相談 ↗':({rei:'レイ',shinji:'シンジ',asuka:'アスカ',ritsuko:'リツコ',maya:'マヤ',hyuga:'日向',aoba:'青葉',fuyutsuki:'冬月'}[person.id]||'担当')+'相談 ↗');$('dutyContactOpen').setAttribute('aria-label',person.name+'に'+titles[active.domain]+'を相談');$('dutyContactOpen').disabled=!personalReady||!S.infra.comms;}}
  context.hidden=true;
  if(currentPage==='messages'&&mobileCurrent.messages==='thread'&&personalReady){
   const stored=personalThread(personalContact).memory?.dutyContext,choice=selected?.id===personalContact?selected:stored?{id:personalContact,domain:stored.domain}:null;let c=null;try{if(choice)c=dutyContext(choice.domain,personalContact);}catch(error){}
   if(c){context.hidden=false;meteoText('messageDutySummary',titles[c.domain]+' / 相談・担当画面へ');meteoText('messageDutyBrief',c.fact);context.dataset.domain=c.domain;context.dataset.dutyRoute=c.route;context.querySelectorAll('[data-duty-question]').forEach(b=>b.disabled=!S.infra.comms||S.personalMessages.pending.some(x=>x.to===personalContact));}
  }
 }
 $('dutyContactOpen').addEventListener('click',()=>{if(!active)return;selected={...active};openPersonal(active.id);context.open=true;render();$('messageDutyContext')?.scrollIntoView({block:'nearest'});});
 context.addEventListener('click',event=>{const b=event.target.closest('[data-duty-question]');if(!b||b.disabled)return;const domain=context.dataset.domain;if(!dutyDomains.includes(domain))return;const text=prompts[domain]+({status:'を教えてください。',next:'について、次に確認する手順は？',reason:'について、判断の理由は？'}[b.dataset.dutyQuestion]||'を確認したい。');personalSend(text);});
 $('messageDutyReturn').addEventListener('click',()=>{const [page,view]=context.dataset.dutyRoute.split('/');NERV_MOBILE.open(page,view);});
 const previousRender=renderPersonalMessages;renderPersonalMessages=function(){previousRender();render();};const previousDraw=draw;draw=function(){previousDraw();render();};
 window.addEventListener('nerv-route',render);window.addEventListener('nerv-world-ready',render);
 const restoreFold=alias=>{const route=dutyAliases[alias],node=merged.get(alias);if(!node||route!==currentPage+'/'+mobileCurrent[currentPage])return;for(const panel of groups.get(route)||[])panel.open=panel===node;rememberFold(alias);};
 for(const eventName of ['popstate','hashchange']){window.addEventListener(eventName,e=>{if(eventName==='popstate'){restoredFold=e.state?.dutyFold;queuedRestore={url:location.href,alias:restoredFold};}else{restoredFold=queuedRestore?.url===e.newURL?queuedRestore.alias:history.state?.dutyFold;queuedRestore=null;}},true);window.addEventListener(eventName,()=>{restoreFold(restoredFold);restoredFold=null;});}
 window.NERV_LIAISON={snapshot:()=>({aliases:{...dutyAliases},active:active?{...active}:null,selected:selected?{...selected}:null}),context:(domain,id)=>{try{return worldClone(dutyContext(domain,id));}catch(error){return null;}}};
 // v214FinishRoutes runs after this module, then canonicalizes the saved route.
 const [initialPage,initialView]=location.hash.slice(1).split('/');if(dutyAliases[initialPage+'/'+initialView])NERV_MOBILE.open(initialPage,initialView);
 else restoreFold(initialFold);
 render();
}
initDutyWorkspace();
