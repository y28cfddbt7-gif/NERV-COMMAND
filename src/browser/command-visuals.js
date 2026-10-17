// One shared, transparent drawing sheet serves monitors, small mechanisms and map markers.
function evaMapSector(index){const value=S.evas[index].mapSector;return [0,1,2,3].includes(value)?value:index===S.tactics.defender?3:index===S.tactics.attacker?1:2;}
async function setEvaMapSector(index,sector){
 if(![0,1,2].includes(index)||![0,1,2,3].includes(sector))return;
 if(!await backupVisualUpgrade()){renderCommandMap();return;}
 const e=S.evas[index];settleEvaPower();
 if(e.state!=='DEPLOYED'||!S.infra.comms){toast('移動不可 / 出撃状態と都市通信を確認してください。');renderCommandMap();return;}
 e.mapSector=sector;addLog('eva','UNIT-0'+index+' を '+V27_FACILITY[sector].name+' へ移動');sound('select');draw();
}
function commandMessage(page){
 const e=selected(),d=S.defense,v=S.magi.vote,s=intrusionState();
 if(page==='magi'){if(magiIntrusionActive()||(s.status==='contained'&&!v))return s.message;return v?$('magiDecision').textContent.replace(/\n/g,' ／ '):'審議内容と対象機を選択 → 決議を実行 → 三基の賛否と理由を確認';}
 if(page==='eva')return 'UNIT-0'+S.selectedEva+' ／ '+stateJP[e.state]+' ／ '+(e.state==='DEPLOYED'?(evaExternalPower(S.selectedEva)?'外部給電':'内部電源 '+Math.ceil(e.power)+'秒')+' ／ 配置：'+V27_FACILITY[evaMapSector(S.selectedEva)].name:$('evaGuidance').textContent);
 if(page==='infra')return d.status==='active'?'敵性反応 '+d.enemy.code+' ／ 接近 '+d.enemy.dist+'ターン ／ '+d.last:'都市健全性 '+v27CityIntegrity()+'% ／ '+d.last;
 if(page==='mission')return staffStageNames[S.mission.phase]+' ／ 次の指示：'+$('missionAction').textContent+' ／ '+$('staffNextHint').textContent;
 if(page==='weather')return busyWeather?'現在地と気象を取得しています。位置情報の許可を確認してください。':weatherCurrent()?(S.weather.place||'現在地')+' ／ '+$('wxFresh').textContent+' ／ '+$('wxDescription').textContent+' '+$('wxTemp').textContent+'℃ ／ '+($('weatherStatus').textContent||''):'現在地の気象が未取得です。位置情報を許可し、更新してください。';
 if(page==='tools')return '職員支援 ／ '+(S.personnel?.shift?.startedAt&&!S.personnel.shift.endedAt?'当直中':'当直待機')+' ／ タスク・引継ぎ・点検は端末内へ保存';
 return '端末設定 ／ 効果音 '+(S.prefs.sound?'ON':'OFF')+' ／ 動的表示 '+(S.prefs.motion?'ON':'OFF');
}
let commandAnnouncements={};
function announceCommand(text,page=currentPage){commandAnnouncements[page]={text,at:Date.now()};renderCommandStreams();}
function renderCommandStreams(){
 for(const page of ['weather','infra','eva','magi','mission','tools','settings']){
  const stream=qs('[data-command-stream="'+page+'"]');if(!stream)continue;
  const announcement=commandAnnouncements[page],recent=announcement&&Date.now()-announcement.at<10000?announcement.text+' ／ ':'';
  const value=recent+commandMessage(page);if(stream.dataset.message===value)continue;
  stream.dataset.message=value;for(const node of stream.querySelectorAll('.stream-text'))node.textContent=value;
  const reader=stream.querySelector('.stream-reader'),now=Date.now();if(!reader.textContent||!stream.dataset.readAt||now-Number(stream.dataset.readAt)>=10000){reader.textContent=value;stream.dataset.readAt=String(now);}
  stream.style.setProperty('--stream-duration',Math.max(18,Math.min(60,value.length*.3))+'s');
 }
}
function renderCommandMap(){
 const d=S.defense;let deployed=0;
 for(let index=0;index<3;index++){
  const e=S.evas[index],marker=$('mapEva'+index),row=qs('[data-map-unit="'+index+'"]');
  const visible=['DEPLOYED','POWER_LOST'].includes(e.state);marker.classList.toggle('v27-visual-off',!visible);row.hidden=!visible;
  if(!visible)continue;deployed++;
  const sector=evaMapSector(index),positions=[[175,248],[340,190],[520,248],[330,340]],point=positions[sector];
  const x=point[0]+(index-1)*20,y=point[1]+index*8;marker.style.transform='translate('+x+'px,'+y+'px)';marker.dataset.state=e.state;
  marker.setAttribute('aria-label','UNIT-0'+index+' / '+V27_FACILITY[sector].name+' / '+stateJP[e.state]+'。機体監視を開く');
  row.querySelector('select').value=String(sector);row.querySelector('select').disabled=e.state!=='DEPLOYED'||!S.infra.comms;
  row.querySelector('strong').textContent='UNIT-0'+index+' / '+stateJP[e.state];
 }
 meteoText('mapDefenseHint','配置変更には作戦通信が必要です。防御担当 UNIT-0'+S.tactics.defender+' のA.T.展開は、配置区画の被害を12軽減します（方針倍率前）。');
 $('mapNoEva').hidden=deployed>0;meteoText('mapEnemyName',d.status==='active'?(d.scans>=34?d.enemy.code:'UNIDENTIFIED'):'');
 meteoText('mapTargetStatus',d.status==='active'?'敵性反応：'+d.enemy.code+' / '+d.enemy.dist+'ターンで接近':d.status==='victory'?'敵性反応：沈黙を確認':'敵性反応：未検知');
}
function renderNeuralWaves(){
 const e=selected();for(const [index,wave] of all('.neural-wave').entries()){
  let path='';for(let y=0;y<=180;y+=3){const amplitude=Math.max(3,Math.min(21,e.sync/5));const x=28+Math.sin(y*.16+index+S.selectedEva)*amplitude*Math.sin(y*.053+index);path+=(y?'L':'M')+x.toFixed(1)+' '+y+' ';}wave.querySelector('path').setAttribute('d',path);
 }
}
function initCommandVisuals(){
 if(!qs('#staffSupport'))return;
 // Capture the pre-upgrade state once; explicit new persistent actions await it.
 backupVisualUpgrade();
 const map=$('v27IsoMap');
 for(let i=0;i<3;i++){
  const group=document.createElementNS('http://www.w3.org/2000/svg','g');group.id='mapEva'+i;group.classList.add('map-eva','v27-visual-off');group.setAttribute('role','button');group.setAttribute('tabindex','0');
  group.innerHTML='<rect x="-45" y="-130" width="90" height="160" fill="transparent"/><ellipse class="map-unit-platform" cx="0" cy="0" rx="32" ry="12"/><foreignObject x="-35" y="-135" width="70" height="140"><div xmlns="http://www.w3.org/1999/xhtml" class="eva-sprite" data-unit="'+i+'"></div></foreignObject><text class="map-unit-label" text-anchor="middle" y="22">UNIT-0'+i+'</text>';
  const open=()=>{S.selectedEva=i;persist();window.NERV_MOBILE.open('eva','monitor');};group.addEventListener('click',open);group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});map.append(group);
 }
 const dispatch=document.createElement('section');dispatch.id='mapDispatch';dispatch.className='map-dispatch';dispatch.innerHTML='<p id="mapTargetStatus"></p><h2>出撃機の配置 / DEPLOYMENT</h2><p id="mapDefenseHint"></p><p id="mapNoEva">出撃機なし。EVA管制で発進後、この地図に表示します。</p>';
 for(let i=0;i<3;i++){
  const row=document.createElement('div');row.className='map-unit-row';row.dataset.mapUnit=String(i);row.innerHTML='<span class="map-unit-mini eva-sprite" data-unit="'+i+'" aria-hidden="true"></span><strong>UNIT-0'+i+'</strong><label><span class="sr-only">UNIT-0'+i+'の配置</span><select data-map-sector="'+i+'">'+V27_FACILITY.map((f,j)=>'<option value="'+j+'">'+f.name+'</option>').join('')+'</select></label>';
  row.querySelector('select').addEventListener('change',event=>{setEvaMapSector(i,Number(event.target.value));});dispatch.append(row);
 }
 const routes=document.createElement('nav');routes.className='staff-route';routes.innerHTML='<button data-route="eva/control">EVA発進管制 ↗</button><button data-route="infra/facilities">施設・迎撃操作 ↗</button>';dispatch.append(routes);
 // A dedicated dispatch tab keeps the mobile map short even with all three units deployed.
 const infra=mobileGroups.infra,panel=document.createElement('section');panel.className='mobile-view';panel.dataset.view='deployment';panel.id='mobile-infra-deployment';panel.setAttribute('role','tabpanel');panel.setAttribute('aria-label','機体配置');panel.hidden=true;panel.append(dispatch);qs('.page[data-page="infra"]').append(panel);infra.panels.push(panel);
 const tab=document.createElement('button');tab.type='button';tab.dataset.mobileTab='infra/deployment';tab.textContent='機体配置';tab.setAttribute('role','tab');tab.setAttribute('aria-controls',panel.id);tab.setAttribute('aria-selected','false');tab.tabIndex=-1;tab.addEventListener('click',()=>mobileNavigate('infra','deployment'));infra.nav.insertBefore(tab,infra.nav.children[1]);
 const mapLinks=document.createElement('nav');mapLinks.className='staff-route map-links';mapLinks.innerHTML='<button data-route="infra/deployment">機体配置・移動 ↗</button><button data-route="infra/facilities">施設・迎撃 ↗</button>';map.after(mapLinks);
 // All new route controls share one handler and target actual page/subsection pairs.
 document.addEventListener('click',event=>{const link=event.target.closest('[data-route]');if(!link)return;const [page,view]=link.dataset.route.split('/');window.NERV_MOBILE.open(page,view);});
 for(const page of ['weather','infra','eva','magi','mission','tools','settings']){
  const root=qs('.page[data-page="'+page+'"]'),stream=document.createElement('section');stream.className='command-stream';stream.dataset.commandStream=page;stream.setAttribute('aria-label','現在の状況');
  stream.innerHTML='<div class="stream-tag">STATUS</div><div class="stream-window" tabindex="0" aria-label="状況テキスト。停止ボタンで横流れを停止できます"><div class="stream-track" aria-hidden="true"><span class="stream-text"></span><span class="stream-text"></span></div></div><p class="stream-reader sr-only" role="status" aria-live="polite"></p><button class="stream-stop" aria-label="状況の横流れを停止" aria-pressed="false">Ⅱ</button>';
  const nav=root.querySelector('.mobile-tabs');nav.after(stream);
  stream.querySelector('button').addEventListener('click',event=>{const paused=stream.classList.toggle('stream-paused');event.currentTarget.setAttribute('aria-pressed',String(paused));event.currentTarget.setAttribute('aria-label',paused?'状況の横流れを再開':'状況の横流れを停止');event.currentTarget.textContent=paused?'▶':'Ⅱ';});
 }
 const splash=document.createElement('div');splash.id='commandSplash';splash.className='command-splash hidden';splash.setAttribute('aria-hidden','true');splash.innerHTML='<i></i><small>NERV / CONTROL LINK</small><strong></strong>';qs('#shell').append(splash);
 let splashTimer=null,lastPage=currentPage;
 window.addEventListener('nerv-route',event=>{const page=event.detail.page;renderCommandStreams();renderCommandMap();if(isMoving()&&lastPage!==page&&page!=='home'){splash.querySelector('strong').textContent=qs('.page[data-page="'+page+'"] h1')?.textContent?.split('/')[0]||'気象監視';splash.classList.remove('hidden','splash-running');void splash.offsetWidth;splash.classList.add('splash-running');clearTimeout(splashTimer);splashTimer=setTimeout(()=>splash.classList.add('hidden'),550);}lastPage=page;});
 const oldDraw=draw;draw=function(){oldDraw();renderCommandMap();renderMagiIntrusion();renderCommandStreams();};
 const oldToast=toast;toast=function(text){oldToast(text);announceCommand(text);};
 const oldLog=addLog;addLog=function(type,text){oldLog(type,text);if(['infra','eva','magi','mission'].includes(type))announceCommand(text,type);};
 // Tiny EVA displays use precisely the same three drawings as the large monitor.
 for(const path of all('.op-eva'))path.remove();
 for(const holder of all('#operationVisual,.sequence-mechanical')){const unit=document.createElement('div');unit.className='mechanism-eva eva-sprite';unit.dataset.unit=String(S.selectedEva);unit.setAttribute('aria-hidden','true');holder.append(unit);}
 for(const side of ['left','right']){const wave=document.createElementNS('http://www.w3.org/2000/svg','svg');wave.setAttribute('viewBox','0 0 56 180');wave.setAttribute('aria-hidden','true');wave.classList.add('neural-wave','neural-'+side);wave.innerHTML='<path fill="none"/><line class="neural-sweep" x1="0" y1="0" x2="56" y2="0"/>';qs('#evaArtwork').append(wave);}
 const oldEva=renderEVA;renderEVA=function(){oldEva();for(const unit of all('.mechanism-eva'))unit.dataset.unit=unit.closest('#operationVisual')?($('operationVisual').dataset.unit||String(S.selectedEva)):String(S.selectedEva);renderNeuralWaves();renderCommandStreams();};renderNeuralWaves();
 renderCommandMap();renderCommandStreams();renderMagiIntrusion();
 // A restored URL can address the dynamically added deployment tab.
 if(location.hash==='#infra/deployment')window.NERV_MOBILE.open('infra','deployment');
}
initCommandVisuals();
