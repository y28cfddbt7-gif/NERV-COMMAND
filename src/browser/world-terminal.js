// Additional environments and operator readouts leave the approved EVA sheet intact.
function registerTerminalView(page,id,label){
 const group=mobileGroups[page],panel=qs('.page[data-page="'+page+'"] [data-view="'+id+'"]');
 if(!group||!panel)return;
 panel.id=panel.id||'mobile-'+page+'-'+id;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-label',label);panel.hidden=true;group.panels.push(panel);
 const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.mobileTab=page+'/'+id;button.setAttribute('role','tab');button.setAttribute('aria-controls',panel.id);button.setAttribute('aria-selected','false');button.tabIndex=-1;button.addEventListener('click',()=>mobileNavigate(page,id));group.nav.append(button);
}
const pilotNames=['綾波レイ','碇シンジ','惣流・アスカ・ラングレー'];
function renderWorldTerminal(){
 const d=S.defense,hq=d.city[3],e=selected(),unit=S.selectedEva,armed=d.city.filter((c,i)=>i<3&&c.turret&&c.hp>=25).length;
 meteoText('geofrontState',hq.hp<40?'DAMAGE / SIM':'HQ / SIM');meteoText('geofrontIntegrity',hq.hp+'%');meteoText('geofrontPower',S.infra.power?'給電中':'停電');meteoText('geofrontComms',S.infra.comms?'接続':'通信停止');meteoText('geofrontArmor',hq.armor?'展開':'開放');
 $('geofrontPanel').dataset.power=String(S.infra.power);$('geofrontPanel').dataset.damaged=String(hq.hp<40);
 const index=Math.min(2,d.selected),c=d.city[index];meteoText('armorySector',V27_FACILITY[index].name);meteoText('armoryIntegrity',c.hp+'%');meteoText('armoryTurret',!c.turret?'格納・未配備':c.hp<25?'損傷・停止':S.infra.power&&d.energy>0?'迎撃待機':'給電待機');meteoText('armoryEnergy',d.energy+'%');meteoText('armoryState',armed+' / 3 配備');$('armoryPanel').dataset.deployed=String(c.turret&&c.hp>=25);$('armoryPanel').dataset.power=String(S.infra.power&&d.energy>0);
 all('[data-armory-sector]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.armorySector)===index)));
 const phase={HANGAR:['待機','格納区画・当直待機','発進準備の指示を待機'],READY:['搭乗準備','プラグ接続・待機','MAGI出撃承認と機体条件を確認'],DEPLOYED:['作戦参加中','エントリープラグ内','給電・同期・回収条件を監視'],POWER_LOST:['緊急回収待機','機内・内部電源喪失','EVA運用で回収を指示'],MAINTENANCE:['休息・整備連携','回収後の待機','機体整備の完了を確認']}[e.state]||['状態未取得','未確認','機体運用を確認'];
 meteoText('pilotName',pilotNames[unit]);meteoText('pilotCode',['FIRST CHILDREN','THIRD CHILDREN','SECOND CHILDREN'][unit]);meteoText('pilotUnit','UNIT-0'+unit);meteoText('pilotSync',Number(e.sync).toFixed(1)+'%');meteoText('pilotStatus',phase[0]);meteoText('pilotEntry',phase[1]);meteoText('pilotNext',phase[2]);meteoText('pilotNeural',['READY','DEPLOYED'].includes(e.state)?(e.sync>=50?'接続成立':'同期低下'):'待機・接続対象外');meteoText('pilotSupply',evaExternalPower(unit)?'外部給電':'内部電源 '+Math.ceil(e.power)+'秒');
 $('pilotGauge').style.setProperty('--pilot-sync',Math.max(0,Math.min(100,Number(e.sync)||0))+'%');$('pilotPanel').dataset.state=e.state;
 const operation=$('operationWorld');if(operation){operation.dataset.world=d.selected===3?'headquarters':'armament';operation.dataset.power=String(S.infra.power);}
 all('[data-pilot]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.pilot)===unit)));
 meteoText('bootText','LOCAL SYSTEM READY / 開始操作待ち');meteoText('bootLocalMode',window.__SCRIPTABLE__?'SCRIPTABLE / LOCAL':'BROWSER / LOCAL');meteoText('bootMagiState',magiIntrusionActive()?'侵入対処・審議停止':'三基・審議受付');meteoText('bootEvaState',S.evas.filter(e=>e.state==='DEPLOYED').length+' / 3 出撃');
}
function initWorldTerminal(){
 if(!qs('#staffSupport'))return;
 const source=$('worldPanelTemplates');for(const [id,page] of [['geofrontPanel','infra'],['armoryPanel','infra'],['pilotPanel','eva']])qs('.page[data-page="'+page+'"]').append($(id));source.remove();
 registerTerminalView('infra','geofront','本部・地下施設');registerTerminalView('infra','armory','兵装監視');registerTerminalView('eva','pilots','搭乗者監視');
 const operation=document.createElement('div');operation.id='operationWorld';operation.className='operation-world-panel world-viewport';operation.setAttribute('role','img');operation.setAttribute('aria-label','状態が変化した設備のセル塗り描画');operation.innerHTML='<span class="world-annotation">SYSTEM RESPONSE / SIMULATION</span>';$('operationVisual').append(operation);
 all('[data-pilot]').forEach(b=>b.addEventListener('click',()=>{S.selectedEva=Number(b.dataset.pilot);draw();}));all('[data-armory-sector]').forEach(b=>b.addEventListener('click',()=>{S.defense.selected=Number(b.dataset.armorySector);draw();}));
 $('pilotConfirm').addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('nerv-duty-evidence',{detail:{kind:'pilot',unit:S.selectedEva}}));toast(pilotNames[S.selectedEva]+' / '+$('pilotStatus').textContent+'を確認しました。');});
 $('geofrontInspect').addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('nerv-duty-evidence',{detail:{kind:'geofront'}}));toast('本部健全性 '+S.defense.city[3].hp+'% / 電源・通信の表示を確認しました。');});
 // Replace only the infrastructure glyphs, retaining selection and map markers.
 const hq=qs('#v27IsoMap g[data-v27pick="3"]');hq.querySelector('.v27-top').setAttribute('points','262,285 340,223 418,285 340,318');hq.querySelector('.v27-left').setAttribute('points','262,285 340,223 340,318');hq.querySelector('.v27-right').setAttribute('points','340,223 418,285 340,318');
 for(let i=0;i<3;i++){const group=qs('#v27IsoMap g[data-v27pick="'+i+'"]'),gun=document.createElementNS('http://www.w3.org/2000/svg','g');gun.classList.add('map-armament');gun.dataset.battery=String(i);const x=[181,340,500][i],y=[198,125,198][i];gun.innerHTML='<path d="M'+(x-17)+' '+(y-8)+'l17-8 17 8v15l-17 9-17-9z"/><path class="battery-barrel" d="M'+(x-5)+' '+(y-14)+'l24-34 9 6-24 34z M'+(x+5)+' '+(y-10)+'l24-34 9 6-24 34z"/>';group.append(gun);}
 const oldDraw=draw;draw=function(){oldDraw();renderWorldTerminal();};const oldEva=renderEVA;renderEVA=function(){oldEva();renderWorldTerminal();};
 const updateBatteries=()=>all('[data-battery]').forEach(g=>g.dataset.active=String(S.defense.city[Number(g.dataset.battery)].turret&&S.defense.city[Number(g.dataset.battery)].hp>=25));const oldWorld=renderWorldTerminal;renderWorldTerminal=function(){oldWorld();updateBatteries();};
 document.addEventListener('visibilitychange',()=>document.body.classList.toggle('terminal-hidden',document.hidden));
 window.addEventListener('nerv-route',event=>{if(event.detail.page==='infra'&&event.detail.view==='armory'&&S.defense.selected===3){S.defense.selected=1;draw();}});
 renderWorldTerminal();const [page,view]=location.hash.slice(1).split('/');if(['geofront','armory','pilots'].includes(view))window.NERV_MOBILE.open(page,view);
}
initWorldTerminal();
