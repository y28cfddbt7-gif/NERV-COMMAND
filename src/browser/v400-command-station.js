// NERV COMMAND v4.0 / CLEAN COMMAND: one owned operation surface, no legacy DOM relocation.
(function initV400(){
 'use strict';
 if(!window.NERV_MOBILE||typeof consoleBattleCommand!=='function')return;
 const page=document.querySelector('.page[data-page="battle"]');
 if(!page||document.getElementById('v400Station'))return;
 const root=document.createElement('section');root.id='v400Station';root.className='v400-station';
 root.setAttribute('aria-label','NERV / CENTRAL COMMAND 作戦管制');
 root.innerHTML='<header class="v400-head">'+
  '<div class="v400-brand"><b>NERV / CENTRAL COMMAND</b><span id="v400Case">CASE / STANDBY</span></div>'+
  '<div class="v400-right"><button type="button" id="v400Alert" data-v400-act="alert">ALL SYSTEMS NOMINAL</button><strong id="v400AP">AP --/2</strong></div></header>'+
  '<div class="v400-telemetry" id="v400Telemetry">SYSTEM INITIALIZING</div>'+
  '<div class="v400-map" id="v400Map"><svg id="v400Svg" viewBox="0 0 320 190" preserveAspectRatio="none" aria-label="第3新東京市の実戦術図"></svg>'+
  '<div class="v400-map-taps" role="group" aria-label="移動・配置区画">'+
   [1,2,3].flatMap(row=>[0,1,2].map(col=>'<button type="button" data-v400-cell="'+col+','+row+'" aria-label="'+['西','中央','東'][col]+'区画、距離'+row+'"><span class="v400-sr">区画'+col+row+'</span></button>')).join('')+'</div></div>'+
  '<div class="v400-map-footer"><span id="v400MapText">TOKYO-3 / TACTICAL</span><span>MAP 01</span></div>'+
  '<button type="button" id="v400Radio" data-v400-act="radio" class="v400-radio"><b id="v400RadioName">OPERATIONS RADIO / 日向</b><span id="v400RadioLine">受信待機</span></button>'+
  '<div class="v400-main" id="v400Main">'+
   ['analysis','move','attack','defense'].map((x,i)=>'<button type="button" data-v400-tab="'+x+'">'+['解析','移動','攻撃','防衛'][i]+'</button>').join('')+'</div>'+
  '<section id="v400Panel" class="v400-panel"><header><b id="v400PanelTitle">COMMAND / CONTROL</b><button id="v400Close" data-v400-act="close">閉じる ×</button></header><div id="v400PanelBody"></div></section>'+
  '<p class="v400-feedback" id="v400Feedback" role="status">管制系統同期中</p>'+
  '<div class="v400-footer-actions"><button type="button" id="v400Wait" data-v400-act="wait">手番終了 ▸</button>'+
  '<button type="button" data-v400-act="recovery">警報・復旧</button><button type="button" data-v400-act="home">⌂ HOME</button></div>'+
  '<details class="v400-expert"><summary>専門設備・作戦記録</summary><div>'+
  ['magi','infra','eva','messages','work'].map((p,i)=>'<button type="button" data-v400-route="'+p+'">'+['MAGI','都市設備','EVA整備','通信記録','保安業務'][i]+'</button>').join('')+'</div></details>';
 page.append(root);
 document.body.dataset.v400='active';
 const $=id=>root.querySelector('#'+id);
 const ui={busy:false,tab:'',phase:'',feedback:'',error:'',visualKey:'',renders:0,commands:0,failures:0,serial:0};
 const weaponNames={knife:'ナイフ',rifle:'パレット',positron:'ポジトロン'};
 const incidentKinds={power:[['reserve','予備送電'],['manual','手動調整'],['rush','強行発進']],
  comms:[['relay','副回線'],['manual','直接照合'],['hold','確認待機']],
  sync:[['recalibrate','再同期'],['stabilize','保護'],['rush','緊急接続']]};
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const text=(id,value)=>{const n=$(id),s=String(value??'--');if(n&&n.textContent!==s)n.textContent=s;};
 const button=(key,label,disabled=false)=>'<button type="button" data-v400-act="'+key+'"'+(disabled?' disabled':'')+'>'+esc(label)+'</button>';
 const read=fn=>{try{return fn()}catch(e){ui.error=String(e.message||e);return null;}};
 const battle=()=>read(()=>consoleBattle()),tactical=()=>read(()=>tacticalState());
 function phase(){const b=battle();return S.defense.status==='active'?(b?.stage||'adopt'):
  ['victory','defeat'].includes(S.defense.status)?'result':'idle';}
 const names=['西','中央','東'];const xy=(col,row)=>({x:53+107*col,y:27+63*(row-1)});
 function mapRender(st,b,t){
  const d=S.defense,isField=st==='field',pos=t?.pos;
  const valid=!!pos&&[0,1,2].includes(pos.col)&&[1,2,3].includes(pos.row);
  const columns=Array.isArray(t?.enemyPlan?.columns)?t.enemyPlan.columns.filter(x=>[0,1,2].includes(x)):[];
  const rows=Array.isArray(t?.enemyPlan?.rows)?t.enemyPlan.rows.filter(x=>[1,2,3].includes(x)):[];
  const sig=JSON.stringify([st,d.caseNo,d.round,d.energy,d.selected,d.city?.map(c=>[c.hp,c.armor,c.turret]),pos,columns,rows,b?.ap,ui.tab]);
  if(sig===ui.visualKey)return;ui.visualKey=sig;
  const a=['<g class="v400-gridline">'];
  for(let x=0;x<=320;x+=53.33)a.push('<path d="M'+x+' 0V190"/>');
  for(let y=0;y<=190;y+=31.66)a.push('<path d="M0 '+y+'H320"/>');
  a.push('</g><path class="v400-road" d="M-8 134L79 107L156 130L244 105L329 82"/>',
   '<path class="v400-road-edge" d="M-8 127L79 100L156 123L244 98L329 75"/>',
   '<path class="v400-road-side" d="M5 140L79 116L156 139L244 114L320 91"/>');
  if(isField){
   for(const col of columns)for(const row of rows){const p=xy(col,row);
    a.push('<path class="v400-forecast" d="M'+p.x+' '+(p.y-16)+' l17 16 -17 16 -17 -16Z"/>');}
   if(valid){
    const p=xy(pos.col,pos.row),hue=['#e0bd67','#ad95d6','#e27a71'][t.unit]||'#e0bd67';
    const threat=columns.flatMap(col=>rows.map(row=>({col,row}))).find(q=>q.col!==pos.col||q.row!==pos.row);
    if(threat){const q=xy(threat.col,threat.row);a.push('<path class="v400-path" d="M'+p.x+' '+p.y+'L'+q.x+' '+q.y+'"/>');}
    a.push('<circle class="v400-unit" cx="'+p.x+'" cy="'+p.y+'" r="15" stroke="'+hue+'"/>',
      '<path class="v400-cross" d="M'+p.x+' '+(p.y-24)+'v13m0 22v13M'+(p.x-24)+' '+p.y+'h13m22 0h13" stroke="'+hue+'"/>',
      '<text class="v400-unit-name" x="'+p.x+'" y="'+Math.max(13,p.y-25)+'" text-anchor="middle" fill="'+hue+'">EVA-0'+t.unit+'</text>');
   }else a.push('<text class="v400-centerline" x="160" y="94" text-anchor="middle">UNIT POSITION / SYNC</text>');
  }else a.push('<text class="v400-centerline" x="160" y="94" text-anchor="middle">OPERATIONS / '+st.toUpperCase()+'</text>');
  (d.city||[]).forEach((c,i)=>{
   const x=8+i*77;
   a.push('<path d="M'+x+' 175h60" stroke="'+(c.hp<50?'#e87e72':c.armor?'#edbf70':'#81a09b')+'" stroke-width="3"/>');
   if(c.turret)a.push('<rect x="'+(x+22)+'" y="167" width="10" height="5" fill="#a4cfbb"/>');
  });
  a.push('<text class="v400-legend" x="9" y="186">TOKYO-3 / SEC-02</text>',
   '<text class="v400-legend" x="311" y="186" text-anchor="end">MAP 01</text>',
   '<text class="v400-tracking" x="311" y="15" text-anchor="end">ANGEL / '+(S.defense.status==='active'?'TRACKING':'NO CONTACT')+'</text>',
   '<text class="v400-tracking-detail" x="311" y="26" text-anchor="end">POSITION UNKNOWN</text>');
  $('v400Svg').innerHTML=a.join('');
  for(const cell of root.querySelectorAll('[data-v400-cell]')){
   const [col,row]=cell.dataset.v400Cell.split(',').map(Number);
   const adjacent=valid&&Math.max(Math.abs(col-pos.col),Math.abs(row-pos.row))===1;
   const moving=isField&&ui.tab==='move'&&adjacent&&(b?.ap||0)>0;
   const placing=st==='placement'&&row>=2;
   cell.disabled=ui.busy||!(moving||placing);
   cell.dataset.risk=String(columns.includes(col)&&rows.includes(row));
   cell.dataset.own=String(valid&&col===pos.col&&row===pos.row);
   cell.setAttribute('aria-label',names[col]+'・距離'+row+(moving?' / 移動可能':placing?' / 射出候補':'')+
    (columns.includes(col)&&rows.includes(row)?' / 危険予測':''));
  }
  text('v400MapText',isField?'EVA / 射線・防壁・予告射界':'TOKYO-3 / 都市監視');
 }
 function controls(st,b,t){
  if(st==='idle')return '<p>平時監視。作戦開始には対象を選び、正式に迎撃CASEを開いてください。</p>'+
   '<label>使徒識別 <select id="v400Angel"><option value="sachiel">サキエル</option><option value="shamshel">シャムシエル</option><option value="ramiel">ラミエル</option></select></label>'+
   button('start','新規CASEを開始');
  if(st==='result')return '<p>CASE '+S.defense.caseNo+' / '+(S.defense.status==='victory'?'迎撃成功':'防衛失敗')+'</p>'+
   '<p>'+esc(S.defense.last||'作戦結果を確認')+'</p>'+button('recovery','保存確認後に復旧');
  if(st==='adopt')return '<p>進行中のCASEを、資源と損傷を保持して引き継ぎます。</p>'+button('adopt','作戦を引き継ぐ');
  if(st==='approval'){
   const e=S.evas[b.unit],inc=read(()=>window.NERV_GAME_V229?.get());
   let s='<p>UNIT-0'+b.unit+' / '+esc(e?.state)+'　MAGI '+(S.magi.approvedFor===b.unit?'承認済':'未承認')+'</p>'+
     '<div class="v400-choices">'+[0,1,2].map(i=>button('unit:'+i,'EVA-0'+i,i===b.unit)).join('')+'</div>';
   if(inc?.status==='pending')s+='<div class="v400-incident"><b>発進異常 / '+esc(inc.kind)+'</b><p>対応を確定してから発進承認へ進んでください。</p><div class="v400-choices">'+
     (incidentKinds[inc.kind]||[]).map(([key,label])=>button('incident:'+key,label)).join('')+'</div></div>';
   return s+'<div class="v400-choices">'+button('prepare','機体準備',e?.state!=='HANGAR')+
     button('approve','MAGI出撃審議',e?.state!=='READY')+
     button('placement','承認・MAP配置へ',inc?.status==='pending'||!(e?.state==='DEPLOYED'||e?.state==='READY'&&S.magi.approvedFor===b.unit))+'</div>';
  }
  if(st==='placement')return '<p>射出区画：'+names[b.cell.col]+' / 距離'+b.cell.row+'。マップの中間・後方6区画をタップ。</p>'+
   '<div class="v400-choices">'+Object.entries(weaponNames).map(([w,n])=>button('weapon:'+w,n+(armamentSelected===w?' ✓':''))).join('')+'</div>'+
   '<label><input type="checkbox" id="v400Cable" '+(b.cable?'checked':'')+'> 外部電源ケーブル</label>'+
   button('deploy','EVA射出・MAP配置を確定');
  if(st!=='field')return '<p>状態の同期を確認してください。</p>';
  const warn=typeof tacticalReady==='function'?tacticalReady():[];
  let s=warn.length?'<p class="v400-warning">制限：'+esc(warn.join(' / '))+'</p>':'';
  if(ui.tab==='analysis')s+='<p>使徒解析：'+S.defense.scans+'% / 三基の正式審議</p><div class="v400-choices">'+
    button('scan','MAGI解析 / 1AP')+button('vote','戦術承認審議')+button('recon','先行偵察 / 1AP')+'</div>'+
    '<div class="v400-magi">'+['MELCHIOR','BALTHASAR','CASPER'].map((n,i)=>'<span>'+n+'<b>'+(
      S.magi?.vote?.eva===b.unit&&S.magi.vote?.votes?.[i]?(S.magi.vote.votes[i].yes?'承認記録':'否認記録'):'未審議')+'</b></span>').join('')+'</div>';
  else if(ui.tab==='move')s+='<p>隣接区画をタップして移動。1APを消費。赤い表示は予測射界です。</p>';
  else if(ui.tab==='attack')s+='<p>兵装を選び、下の照準図でコア位置を指定して発射。判定とAPは従来のゲームエンジンが管理します。</p>'+
   '<div class="v400-choices">'+Object.entries(weaponNames).map(([w,n])=>button('weapon:'+w,n+(armamentSelected===w?' ✓':''))).join('')+'</div>'+
   '<div id="v400AimBoard" tabindex="0" role="button" aria-label="タップ位置を照準登録"><i></i><b>TARGET CORE / TAP TO AIM</b></div>'+
   '<div class="v400-choices">'+button('neutralize','敵A.T.中和')+button('at','A.T.制御')+
    button('focus','狙撃姿勢')+button('fire','発射 / 1AP')+'</div>';
  else if(ui.tab==='defense')s+='<p>実際の都市資源を使用して防壁・砲台・送電・修復を指揮。</p>'+
   '<div class="v400-choices">'+['西部','中央','東部','ジオフロント'].map((n,i)=>button('sector:'+i,n+(S.defense.selected===i?' ✓':''))).join('')+'</div>'+
   '<div class="v400-choices">'+button('armor','防壁展開')+button('turret','迎撃砲台')+
    button('repair','応急修復')+button('power','補助送電')+button('guard','A.T.防御')+
    button('support','都市援護切替')+'</div><p>電力 '+S.defense.energy+' / 資材 '+S.defense.parts+' / 予備 '+S.defense.spares+'</p>';
  else if(ui.tab==='radio')s+='<p>本部通信 / 正式な照会を送信し、作戦通信ログへ記録します。</p>'+
   '<div class="v400-choices">'+['hyuga','maya','aoba','ritsuko','misato'].map((id,i)=>
    button('contact:'+id,['日向','マヤ','青葉','リツコ','ミサト'][i])).join('')+'</div>';
  else s+='<p>解析・移動・攻撃・防衛から命令内容を選択。</p>';
  return s;
 }
 function render(){
  if(typeof S==='undefined'||!S?.defense)return;
  ui.renders++;
  const b=battle(),t=tactical(),st=phase(),d=S.defense;
  if(st!==ui.phase){ui.phase=st;ui.tab='';ui.visualKey='';}
  text('v400Case','CASE '+String(d.caseNo||0).padStart(2,'0')+' / '+
    ({idle:'当直',adopt:'引継ぎ',approval:'発進承認',placement:'射出配置',field:'交戦',result:'事後報告'}[st]||'待機')+
    ' / TURN '+(d.round||0));
  const a=read(()=>terminalAlert());
  text('v400Alert',a?.level&&a.level!=='nominal'?'PATTERN BLUE / ALERT':'ALL SYSTEMS NOMINAL');
  text('v400AP','AP '+(b?.ap??'--')+'/2');
  text('v400Telemetry','UNIT-0'+(b?.unit??S.tactics?.attacker??1)+' · ENEMY '+(d.enemy?.hp??'--')+
    ' · POWER '+(d.energy??'--')+'%');
  const k=read(()=>window.NERV_COMMAND_V3?.read()),radio=read(()=>window.NERV_OPS_COMMS?.read());
  const m=[...(k?.operationalMessages||[]),...(radio?.operationalMessages||[])]
    .filter(x=>x?.delivery!=='queued').sort((a,b)=>(a.at||0)-(b.at||0)).at(-1);
  text('v400RadioName','OPERATIONS RADIO / '+(m?.sender||'日向'));
  text('v400RadioLine',m?.text||'管制通信 / 受信待機');
  mapRender(st,b,t);
  $('v400Main').hidden=st!=='field';
  $('v400Wait').hidden=st!=='field';
  for(const p of root.querySelectorAll('[data-v400-tab]'))p.setAttribute('aria-pressed',String(p.dataset.v400Tab===ui.tab));
  const title={analysis:'MAGI / ANALYSIS',move:'EVA / MOVEMENT',attack:'WEAPON / TARGET',
    defense:'TOKYO-3 / DEFENSE',radio:'OPERATIONS / RADIO'};
  text('v400PanelTitle',st==='field'?(title[ui.tab]||'TACTICAL ORDERS'):'OPERATIONS / '+st.toUpperCase());
  $('v400Panel').hidden=st==='field'&&!ui.tab;
  $('v400Close').hidden=st!=='field';
  const html=controls(st,b,t);if($('v400PanelBody').innerHTML!==html)$('v400PanelBody').innerHTML=html;
  text('v400Feedback',ui.feedback||ui.error||t?.last||d.last||'待機');
 }
 async function exec(action){
  if(ui.busy)return;
  if(action==='home'){window.NERV_MOBILE.open('home');return;}
  if(action==='alert'||action==='recovery'){openAlertReview(action==='alert'?'alert':'end');return;}
  if(action==='close'){ui.tab='';render();return;}
  if(action==='radio'){ui.tab='radio';render();return;}
  if(action.startsWith('sector:')){S.defense.selected=Number(action.split(':')[1]);ui.visualKey='';render();return;}
  ui.busy=true;ui.feedback='命令を送信中';render();
  let result={ok:false,error:'現在は未対応'};
  try{
   if(action==='start')result=await consoleBattleCommand('start',{angel:root.querySelector('#v400Angel')?.value||'sachiel'});
   else if(action==='vote')result=await consoleMagiCommand('tacticalVote');
   else if(action.startsWith('incident:'))result=await window.NERV_GAME_V229.resolve(action.slice(9));
   else if(action.startsWith('unit:'))result=await consoleBattleCommand('unit',{unit:Number(action.slice(5))});
   else if(action.startsWith('weapon:'))result=await consoleBattleCommand('weapon',{weapon:action.slice(7)});
   else if(['adopt','prepare','approve','placement','deploy','scan','recon','fire','neutralize',
       'at','focus','guard','support','wait'].includes(action))result=await consoleBattleCommand(action);
   else if(['armor','turret','repair','power'].includes(action)){
    const before=JSON.stringify([S.defense.energy,S.defense.parts,S.defense.spares,S.defense.city]);
    ({armor:v27Armor,turret:v27Turret,repair:v27Repair,power:v27Power}[action])();
    result={ok:before!==JSON.stringify([S.defense.energy,S.defense.parts,S.defense.spares,S.defense.city]),
      error:'命令条件未達',message:'施設へ命令反映'};
   }else if(action.startsWith('contact:')){
    const id=action.slice(8),topics={hyuga:'threat',maya:'eva',aoba:'comms',ritsuko:'magi',misato:'orders'};
    const radio=window.NERV_OPS_COMMS,pre=radio.read();
    result=await radio.dispatch({commandId:'v400-'+Date.now()+'-'+(++ui.serial),caseId:pre.caseId,
      actorId:'operator-C3',expectedRevision:pre.revision,kind:'comms.request',payload:{recipient:id,topic:topics[id]}});
   }
  }catch(e){result={ok:false,error:String(e?.message||e)};}
  ui.busy=false;ui.feedback=result?.ok?(result.message||'命令を記録しました'):'保留 / '+(result?.error||'失敗');
  ui.visualKey='';render();
 }
 async function aim(event){
  const board=$('v400AimBoard');if(!board||ui.busy)return;
  const rect=board.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  const x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
  const y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
  ui.busy=true;
  try{const result=await consoleBattleCommand('aim',{x,y});
   ui.feedback=result.ok?'照準座標登録 / '+Math.round(x*100)+','+Math.round(y*100):result.error;
  }catch(e){ui.feedback=String(e.message||e);}
  ui.busy=false;render();
 }
 root.addEventListener('click',async event=>{
  const board=event.target.closest('#v400AimBoard');if(board)return aim(event);
  const cell=event.target.closest('[data-v400-cell]');
  if(cell&&!cell.disabled){
   const [col,row]=cell.dataset.v400Cell.split(',').map(Number);
   ui.busy=true;try{const res=await consoleBattleCommand(phase()==='placement'?'cell':'move',{col,row});
    ui.feedback=res.ok?'区画を選択 / '+names[col]+row:res.error;
   }catch(e){ui.feedback=String(e.message||e);}
   ui.busy=false;ui.visualKey='';render();return;
  }
  const button=event.target.closest('button');if(!button||button.disabled)return;
  if(button.dataset.v400Tab){ui.tab=button.dataset.v400Tab;ui.visualKey='';render();return;}
  if(button.dataset.v400Route){window.NERV_MOBILE.open(button.dataset.v400Route);return;}
  if(button.dataset.v400Act)await exec(button.dataset.v400Act);
 });
 root.addEventListener('change',async event=>{
  if(event.target.id!=='v400Cable')return;
  ui.busy=true;try{
   const result=await consoleBattleCommand('deploymentCable',{connected:event.target.checked});
   ui.feedback=result.ok?'給電条件を保存':result.error;
  }catch(e){ui.feedback=String(e.message||e);}
  ui.busy=false;render();
 });
 root.addEventListener('keydown',event=>{
  if(event.target.id!=='v400AimBoard'||!['Enter',' '].includes(event.key))return;
  event.preventDefault();const box=event.target.getBoundingClientRect();
  aim({clientX:box.left+box.width*.5,clientY:box.top+box.height*.19});
 });
 const nav=document.querySelector('.bottom-nav');
 if(nav)for(const button of nav.querySelectorAll('[data-nav]')){
  button.hidden=!['home','battle'].includes(button.dataset.nav);
  if(button.dataset.nav==='battle')button.innerHTML='<span aria-hidden="true">⌖</span><small>作戦管制</small>';
 }
 const home=document.querySelector('.page[data-page="home"]');
 if(home&&!document.getElementById('v400DutyLinks')){
  const details=document.createElement('details');details.id='v400DutyLinks';
  details.innerHTML='<summary>職員業務・専門設備</summary><div>'+
   ['weather','work','eva','infra','magi','messages','tools','settings'].map((p,i)=>
    '<button type="button" data-v400-home="'+p+'">'+['天気','保安','EVA整備','都市設備','MAGI','通信','職員ツール','設定'][i]+'</button>').join('')+'</div>';
  home.prepend(details);details.addEventListener('click',event=>{
   const button=event.target.closest('[data-v400-home]');if(button)window.NERV_MOBILE.open(button.dataset.v400Home);
  });
 }
 for(const type of ['nerv-route','nerv-world-ready','nerv-tactical-turn','nerv-tactical-shot','nerv-tactical-render'])
  window.addEventListener(type,render);
 window.NERV_V400={snapshot:()=>({version:'4.0.2',phase:ui.phase,tab:ui.tab,renders:ui.renders,
  independent:!root.querySelector('#v228SectorGrid')&&!root.querySelector('#v310Operations'),
  exists:root.isConnected,error:ui.error})};
 render();
 // This turns true only if the real tactical screen survived first render.
 window.__NERV_V400_RENDERED__=true;
})();
