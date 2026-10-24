// NERV 3.0 Phase 1 / One compact live approval workflow inside Tokyo-3 CITY OPS.
(function initV300OperationsDesk(){
 if(!window.NERV_COMMAND_V3||!window.NERV_MOBILE)return;
 const api=window.NERV_COMMAND_V3;
 const panel=document.createElement('section');panel.id='v300Operations';panel.className='v300-operations';
 panel.setAttribute('aria-label','作戦承認・管制連携');
 panel.innerHTML='<details id="v300Workflow"><summary><span>OPERATIONS LINK / 指揮・通信連携</span><b id="v300State">待機</b></summary>'+
 '<div class="v300-workflow-content">'+
 '<div class="v300-brief"><strong id="v300Case">作戦待機</strong><small id="v300Situation">作戦情報を確認してください。</small></div>'+
 '<div class="v300-sector" role="group" aria-label="防壁の対象区画">'+
 '<button type="button" data-v300-sector="0">西部</button><button type="button" data-v300-sector="1">中央</button><button type="button" data-v300-sector="2">東部</button></div>'+
 '<div class="v300-actions">'+
 '<button type="button" data-v300-command="analysis.request">01 MAGI波形解析</button>'+
 '<button type="button" data-v300-command="city.shutter.request">02 ミサトへ上申</button>'+
 '<button type="button" data-v300-command="city.shutter.review">03 指揮官判断を照合</button>'+
 '<button type="button" data-v300-command="city.shutter.execute">04 承認済み防壁展開</button>'+
 '<button type="button" data-v300-command="city.shutter.release">防壁解除・射線回復</button></div>'+
 '<div class="v300-comms"><header>OPERATIONS RADIO / 作戦通信 <button type="button" id="v300CommsOpen">全通信へ ↗</button></header>'+
 '<div id="v300Messages" aria-live="polite" aria-relevant="additions text"></div></div>'+
 '<p id="v300Feedback" role="status" aria-live="polite">正式命令は上申・審議・実行の3段階です。</p>'+
 '</div></details>';
 const el=id=>panel.querySelector('#'+id);
 const change=(id,v)=>{const n=el(id),s=String(v);if(n&&n.textContent!==s)n.textContent=s};
 let sending=false,selected=1,seq=0,lastSignature='',lastResult='';
 const where=['西部','中央','東部'];
 const activeOrder=(p,sector,statuses)=>[...(p.orders||[])].reverse().find(o=>o.kind==='city.shutter'&&o.sector===sector&&statuses.includes(o.status));
 function render(){
  const p=api.read();if(p.blocked){change('v300Feedback',p.error);return;}
  const active=p.status==='active';
  change('v300State',active?'CASE '+String(S.defense.caseNo).padStart(2,'0')+' / '+(p.phase||'CONTACT'):'STANDBY');
  change('v300Case',active?'第'+S.defense.caseNo+'使徒 / '+where[selected]+'区画':'作戦の待機中');
  const pilotReady=window.NERV_OPS_COMMS?.read?.();
  const field=typeof tacticalState==='function'?tacticalState()?.pos:null;
  const conflict=active&&p.phase==='battle'&&field?.row<=2&&field?.col===selected;
  const clearance=pilotReady&&!pilotReady.blocked&&pilotReady.links?.some(x=>
   x.topic==='shutter-safety'&&x.sector===selected&&x.unit===p.unit&&
   x.round===S.defense.round&&x.status==='acknowledged');
  change('v300Situation',active?
   '解析 '+p.scans+'% / 電力 '+p.energy+' / 通信 '+(p.comms?'ONLINE':'OFFLINE')+
    (conflict&&!clearance?' / パイロットの射線確認が必要':p.losBlocked?' / EVA射線障害あり':''):
    '新しい使徒を検知した後に、都市防壁の正式命令を実行できます。');
  for(const b of panel.querySelectorAll('[data-v300-sector]')){
   const n=Number(b.dataset.v300Sector);b.setAttribute('aria-pressed',String(selected===n));
  }
  const pending=activeOrder(p,selected,['requested']),authorized=activeOrder(p,selected,['authorized']),
    executed=activeOrder(p,selected,['executed']);
  const available={
   'analysis.request':active&&p.power&&p.comms&&p.energy>=12&&p.scans<100&&!p.magiHold&&!p.intrusion&&!p.securityHold,
   'city.shutter.request':active&&p.power&&p.comms&&p.scans>=34&&!pending&&!authorized&&!executed&&
      !p.city[selected].armor&&!p.magiHold&&!p.intrusion&&!p.securityHold,
   'city.shutter.review':active&&!!pending&&p.power&&p.comms&&!p.magiHold&&!p.intrusion&&!p.securityHold,
   'city.shutter.execute':active&&!!authorized&&p.power&&p.comms&&p.energy>=12&&!p.city[selected].armor&&!p.magiHold&&!p.intrusion&&!p.securityHold&&(!conflict||clearance),
   'city.shutter.release':active&&!!executed&&p.city[selected].armor&&p.power&&p.comms&&!p.magiHold&&!p.intrusion&&!p.securityHold
  };
  for(const b of panel.querySelectorAll('[data-v300-command]'))b.disabled=sending||!available[b.dataset.v300Command];
  const box=el('v300Messages'),messages=(p.messages||[]).slice(-3).reverse();
  const signature=messages.map(m=>m.id).join('|');
  if(signature!==lastSignature){
   box.replaceChildren();
   if(!messages.length){const t=document.createElement('p');t.textContent='担当職員からの作戦報告を待機中';box.append(t);}
   for(const m of messages){
    const item=document.createElement('p'),name=document.createElement('strong'),text=document.createElement('span');
    name.textContent=m.sender; text.textContent='：'+m.text;item.append(name,text);box.append(item);
   }
   lastSignature=signature;
  }
 }
 function install(){
  const prev=document.getElementById('v233CityControl');
  if(prev&&panel.previousElementSibling!==prev)prev.after(panel);
  if(!panel.isConnected)return;
 }
 panel.addEventListener('click',async e=>{
  const region=e.target.closest('[data-v300-sector]');
  if(region){selected=Number(region.dataset.v300Sector);render();return;}
  if(e.target.closest('#v300CommsOpen')){
   if(window.NERV_OPS_COMMS_UI){window.NERV_OPS_COMMS_UI.open();return;}
   window.NERV_MOBILE.open('messages','contacts');return;
  }
  const control=e.target.closest('[data-v300-command]');if(!control||control.disabled||sending)return;
  const kind=control.dataset.v300Command,p=api.read();if(!p.ready||!p.caseId)return;
  const order=kind==='city.shutter.review'?activeOrder(p,selected,['requested']):
    kind==='city.shutter.execute'?activeOrder(p,selected,['authorized']):null;
  sending=true;render();change('v300Feedback','指令を照合中 / 変更前の作戦データを保護しています');
  const id='C3-'+Date.now().toString(36)+'-'+(++seq).toString(36);
  try{
   const response=await api.dispatch({commandId:id,actorId:'operator-C3',caseId:p.caseId,
    expectedRevision:p.revision,kind,payload:{sector:selected,orderId:order?.id}});
   lastResult=response.ok?'受領：'+(response.message||kind):'保留：'+response.error;
   change('v300Feedback',lastResult);
  }catch(error){change('v300Feedback','指令エラー：'+error.message);}
  finally{sending=false;render();}
 });
 const prevDraw=draw;
 draw=function(){prevDraw();install();if(panel.isConnected)render();};
 window.addEventListener('nerv-route',()=>{install();render()});
 window.addEventListener('nerv-world-ready',()=>{install();render()});
 window.addEventListener('nerv-command-v3',()=>{install();render()});
 window.NERV_OPERATIONS_V3={open:()=>{install();el('v300Workflow').open=true;render();},snapshot:()=>({mounted:panel.isConnected,selected,sending,lastResult})};
 install();render();
})();
