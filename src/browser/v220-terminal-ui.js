// Presentation only: route through existing navigation; never mutate simulation/save data.
function initV220Terminal(){
 if(!window.NERV_MOBILE||!document.body||!$('shell'))return;
 const destinations=[
  ['work','当直・職員業務','STAFF DUTY','受付 点検 異常 業務'],['hq','NERV司令部','COMMAND CENTER','本部 ジオフロント 展望'],
  ['messages','メッセージ','PERSONAL LINE','会話 通信 パイロット'],['battle','EVA戦闘管制','TACTICAL CONTROL','出撃 発進 武器 照準'],
  ['eva','EVA管理','UNIT OPERATIONS','機体 同期 整備 損傷 パイロット'],['magi','MAGIシステム','TRI-CORE SYSTEM','666 侵入 保守 冷却 審議'],
  ['infra','都市インフラ','TOKYO-3 SYSTEMS','街並み 地図 電源 通信 施設'],['mission','作戦照会','OPERATIONS DESK','兵装 武器 資料 指揮'],
  ['weather','気象確認','WEATHER / REAL DATA','天候 雨 レーダー'],['tools','職員支援','PERSONNEL SUPPORT','タスク 時計 タイマー'],
  ['settings','アプリ設定','CONFIGURATION','音 映像 保存 復旧'],['home','機能選択','TERMINAL INDEX','ホーム']
 ];
 const names=Object.fromEntries(destinations.map(d=>[d[0],d]));
 const context=document.createElement('div');context.id='terminalContext';context.className='terminal-context';
 context.innerHTML='<div><small id="terminalSectionCode">NERV / PERSONNEL TERMINAL</small><strong id="terminalSectionName">機能選択</strong></div><button type="button" data-terminal-menu aria-haspopup="dialog" aria-expanded="false" aria-controls="terminalMenu">機能一覧 <span aria-hidden="true">▦</span></button>';
 $('pageContainer').before(context);
 const menu=document.createElement('div');menu.id='terminalMenu';menu.className='terminal-menu';menu.hidden=true;menu.setAttribute('role','dialog');menu.setAttribute('aria-modal','true');menu.setAttribute('aria-labelledby','terminalMenuTitle');
 menu.innerHTML='<div class="terminal-menu-panel"><header><div><small>NERV / ACCESS DIRECTORY</small><h2 id="terminalMenuTitle">管制機能を選択</h2></div><button type="button" id="terminalMenuClose" aria-label="機能一覧を閉じる">閉じる ×</button></header><label class="terminal-search">機能を探す<input id="terminalSearch" type="search" placeholder="機体、通信、電源、666…" autocomplete="off"></label><p id="terminalMenuCount" role="status" aria-live="polite"></p><div class="terminal-destinations">'+destinations.map(([id,jp,en],i)=>'<button type="button" data-terminal-destination="'+id+'"><small>'+String(i+1).padStart(2,'0')+' / '+en+'</small><strong>'+jp+'</strong><span aria-hidden="true">↗</span></button>').join('')+'</div><p id="terminalMenuEmpty" hidden>該当する機能がありません。別の語句で検索してください。</p><footer>LOCAL TERMINAL / 選択だけでは業務や作戦は進みません</footer></div>';
 $('shell').after(menu);
 let opener=null,previousOverflow='',shellWasInert=false;
 function filter(){const q=$('terminalSearch').value.trim().toLocaleLowerCase();let count=0;for(const b of menu.querySelectorAll('[data-terminal-destination]')){const d=names[b.dataset.terminalDestination];b.hidden=!d.join(' ').toLocaleLowerCase().includes(q);if(!b.hidden)count++;}$('terminalMenuCount').textContent=count+' / '+destinations.length+' 機能';$('terminalMenuEmpty').hidden=count>0;}
 function close(restore=true){if(menu.hidden)return;menu.hidden=true;document.body.style.overflow=previousOverflow;if(!shellWasInert)$('shell').removeAttribute('inert');for(const el of document.querySelectorAll('[data-terminal-menu]'))el.setAttribute('aria-expanded','false');if(restore&&opener?.isConnected)opener.focus({preventScroll:true});}
 function open(source){if(!menu.hidden)return;opener=source;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';shellWasInert=$('shell').hasAttribute('inert');$('shell').setAttribute('inert','');$('terminalSearch').value='';filter();update();menu.hidden=false;for(const el of document.querySelectorAll('[data-terminal-menu]'))el.setAttribute('aria-expanded','true');$('terminalMenuClose').focus({preventScroll:true});}
 function update(){
  const page=currentPage,group=mobileGroups[page],view=mobileCurrent[page],tab=group?.nav.querySelector('[aria-selected="true"]');
  const name=names[page]||names.home;meteoText('terminalSectionCode',name[2]+' / '+(page==='weather'?'REAL DATA':['tools','settings'].includes(page)?'LOCAL DATA':'SIM'));
  meteoText('terminalSectionName',name[1]+(tab?' / '+tab.textContent:''));
  document.body.dataset.terminalPage=page;
  for(const button of all('[data-terminal-destination]')){const active=button.dataset.terminalDestination===page;if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');}
  for(const button of all('.bottom-nav [data-nav]')){if(button.classList.contains('active'))button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');}
 }
 document.addEventListener('click',event=>{const source=event.target.closest?.('[data-terminal-menu]');if(source){event.preventDefault();open(source);return;}const button=event.target.closest?.('[data-terminal-destination]');if(button){const page=button.dataset.terminalDestination;close(false);NERV_MOBILE.open(page,page==='battle'?'engage':undefined);const heading=qs('.page.active h1')||qs('.page.active [role="tablist"]');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}return;}if(event.target===menu||event.target.closest?.('#terminalMenuClose'))close();});
 $('terminalSearch').addEventListener('input',filter);
 menu.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return;}if(event.key!=='Tab')return;const controls=[...menu.querySelectorAll('button,input')].filter(el=>!el.hidden&&!el.disabled&&el.getClientRects().length),first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
 function inlineMenu(parent,first=false){if(!parent)return;const button=document.createElement('button');button.type='button';button.className='terminal-inline-menu';button.dataset.terminalMenu='';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','terminalMenu');button.setAttribute('aria-expanded','false');button.textContent=first?'機能検索 ▦':'機能 ▦';if(first)parent.prepend(button);else parent.append(button);}
 inlineMenu($('commandLauncher'),true);inlineMenu(qs('.battle-top'));inlineMenu(qs('.console-magi-header'));
 window.addEventListener('nerv-route',()=>{close(false);update();});window.addEventListener('nerv-world-ready',update);
 const priorGo=go;go=function(page){priorGo(page);update();};
 update();window.NERV_TERMINAL_UI={version:'2.20',snapshot:()=>({page:currentPage,view:mobileCurrent[currentPage],menuOpen:!menu.hidden,visibleDestinations:[...menu.querySelectorAll('[data-terminal-destination]:not([hidden])')].map(b=>b.dataset.terminalDestination)})};
}
initV220Terminal();
