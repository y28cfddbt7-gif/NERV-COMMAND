// v2.33 / Continuous navigation + REAL city orders on the map.
// All actions delegate to existing defense and infrastructure listeners.
// No duplicated game state, images, physics, timers or requestAnimationFrame.
function initV233CityCommandDeck(){
 if(!window.NERV_V232_MODE||!window.NERV_MOBILE)return;
 const $=id=>document.getElementById(id);
 const stats={version:'2.33',installs:0,orders:0,denied:0,rendered:0,home:0,ownRAF:false,ownTimers:false};
 const names=['西防壁','中央兵装','東迎撃区','ジオフロント'];
 const root=document.createElement('section');root.id='v233CityControl';root.className='v233-city-control';
 root.setAttribute('aria-label','選択施設への管制命令');
 root.innerHTML=
  '<div class="v233-city-header"><div><small>DEFENSE AUTHORITY / CITY OPS</small>'+
  '<strong id="v233Facility">対象施設：--</strong><span id="v233Condition">地図の施設を選択</span></div>'+
  '<button type="button" id="v233Diagnose">設備診断</button></div>'+
  '<div class="v233-city-resources" aria-label="利用可能な作戦資源">'+
  '<span>防衛電力 <b id="v233Energy">--</b></span>'+
  '<span>資材 <b id="v233Parts">--</b></span>'+
  '<span>予備系統 <b id="v233Spares">--</b></span></div>'+
  '<div class="v233-order-grid">'+
  '<button type="button" data-v233-order="armor"><strong>防壁展開</strong><small id="v233ArmorCost">電力 −12</small></button>'+
  '<button type="button" data-v233-order="turret"><strong>迎撃砲配備</strong><small id="v233TurretCost">資材 −20</small></button>'+
  '<button type="button" data-v233-order="repair"><strong>応急修復</strong><small id="v233RepairCost">資材 −18</small></button>'+
  '<button type="button" data-v233-order="reserve" id="v233Reserve"><strong id="v233ReserveTitle">補助送電</strong><small id="v233ReserveCost">予備枠 −1 / 電力 +38</small></button></div>'+
  '<p id="v233Feedback" role="status" aria-live="polite">地図をタップして施設を選択。命令は現在の保存状態に直接反映されます。</p>';
 const sel=id=>root.querySelector('#'+id);
 const output=(id,value)=>{const target=sel(id);if(target&&target.textContent!==String(value))target.textContent=String(value);};
 const controls=Object.fromEntries([...root.querySelectorAll('[data-v233-order]')].map(b=>[b.dataset.v233Order,b]));
 function target(){
  const d=S?.defense,sector=Math.max(0,Math.min(3,Number(d?.selected)||0));
  return {d,sector,c:d?.city?.[sector]};
 }
 function stateBefore(){
  const {d,sector,c}=target();
  return JSON.stringify({power:S.infra.power,comms:S.infra.comms,energy:d.energy,parts:d.parts,spares:d.spares,
   selected:sector,sectorState:{hp:c.hp,armor:c.armor,turret:c.turret}});
 }
 function render(){
  if(!staffWorldReady||!S?.defense||!root.isConnected)return;
  stats.rendered++;
  const {d,sector,c}=target();if(!c)return;
  output('v233Facility',names[sector]||'施設');
  output('v233Condition','HP '+c.hp+'% · 装甲 '+(c.armor?'展開':'未展開')+' · 迎撃砲 '+(c.turret?'配備':'未配備'));
  output('v233Energy',d.energy+'%');output('v233Parts',d.parts);output('v233Spares',d.spares+'枠');
  const run=d.status==='active'||d.status==='idle';
  const possible={
   armor:run&&c.hp>0&&!c.armor&&S.infra.power&&d.energy>=12,
   turret:sector!==3&&c.hp>=25&&!c.turret&&d.parts>=20,
   repair:c.hp<100&&d.parts>=18,
   reserve:!S.infra.power||!S.infra.comms||d.spares>0&&d.energy<100
  };
  for(const [k,b]of Object.entries(controls)){
   b.disabled=!possible[k];
   b.setAttribute('aria-disabled',String(!possible[k]));
  }
  output('v233ArmorCost',c.armor?'展開済み':!S.infra.power?'主電源が必要':'電力 −12');
  output('v233TurretCost',c.turret?'配備済み':sector===3?'配備不可':'資材 −20');
  output('v233RepairCost',c.hp===100?'健全': '資材 −18 / HP +27');
  const system=!S.infra.power?'powerToggle':!S.infra.comms?'commsToggle':'v27Power';
  root.dataset.systemAction=system;
  output('v233ReserveTitle',system==='powerToggle'?'主電源復旧':system==='commsToggle'?'通信回線復旧':'補助送電');
  output('v233ReserveCost',system==='v27Power'?'予備枠 −1 / 電力 +38':'都市系統の切替');
  const reasons={
   armor:!run?'作戦終了・復旧後に操作可能':c.hp<=0?'施設停止。修復が必要':c.armor?'装甲展開済み':!S.infra.power?'都市主電源が停止':d.energy<12?'防衛電力不足':'',
   turret:sector===3?'ジオフロントに砲台は配備不可':c.hp<25?'施設健全性が不足':c.turret?'迎撃砲配備済み':d.parts<20?'資材不足':'',
   repair:c.hp>=100?'施設は健全':d.parts<18?'修復資材不足':'',
   reserve:system==='v27Power'&&(d.spares<=0?'予備送電枠なし':d.energy>=100?'防衛電力満充填':'')
  };
  for(const [k,b] of Object.entries(controls))b.title=reasons[k]||'';
 }
 function install(){
  const map=$('v232MapWindow');
  if(map&&root.previousElementSibling!==map){
   map.after(root);stats.installs++;
  }
  const nav=document.querySelector('.bottom-nav [data-nav="home"]');
  if(nav){nav.setAttribute('aria-label','ホームへ戻る');nav.title='ホームへ戻る';}
 }
 const selectAction={armor:'v27Armor',turret:'v27Turret',repair:'v27Repair'};
 root.addEventListener('click',e=>{
  const b=e.target.closest('[data-v233-order],#v233Diagnose');
  if(!b||b.disabled)return;
  let id=b.dataset.v233Order?selectAction[b.dataset.v233Order]:null;
  if(b.dataset.v233Order==='reserve')id=root.dataset.systemAction;
  if(b.id==='v233Diagnose')id='infraDiag';
  const source=$(id);
  if(!source||source.disabled){
   stats.denied++;output('v233Feedback','操作できません。都市設備の状態を確認してください。');return;
  }
  const before=stateBefore();
  const {sector}=target();
  source.click(); // Existing saved-world action, not a simulated UI-only change.
  if(id==='powerToggle'||id==='commsToggle')draw();
  const after=stateBefore();
  if(after!==before){stats.orders++;output('v233Feedback',names[sector]+'：命令を実行しました。資源と施設状態を更新。');}
  else if(id==='infraDiag')output('v233Feedback','設備診断を実施しました。結果は既存の診断記録にも反映。');
  else{stats.denied++;output('v233Feedback','実行条件を再確認してください。変更は行われていません。');}
  render();
 });
 const previousDraw=draw;
 draw=function(){previousDraw();install();render();};
 window.addEventListener('nerv-route',()=>{install();render();});
 window.addEventListener('nerv-world-ready',()=>{install();render();});
 window.NERV_CITY_COMMANDS={snapshot:()=>({...stats,selected:S?.defense?.selected??null,mounted:root.isConnected,realActions:true})};
 install();render();
}
initV233CityCommandDeck();
