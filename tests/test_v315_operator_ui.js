'use strict';
// v3.1.5 direct VM UI regression: current user screenshot symptoms, routes, real sector controls.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const js=fs.readFileSync('src/browser/v315-operator-ui.js','utf8');
const css=fs.readFileSync('src/styles/v315-operator-ui.css','utf8');
function mock(){
 const nodes={},created=[],opened=[],reviews=[],orders=[];
 class Node{
  constructor(id=''){this.id=id;this.dataset={};this.style={};this.textContent='';this.hidden=false;
   this.disabled=false;this.children=[];this.listeners={};this.attrs={};this.parentElement=null;
   this.isConnected=true;this.className='';}
  setAttribute(k,v){this.attrs[k]=String(v);}
  getAttribute(k){return this.attrs[k];}
  addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}
  fire(k,target=this){let e={target,preventDefault(){},stopPropagation(){},key:'Enter'};for(const fn of this.listeners[k]||[])fn(e);}
  append(...nodes){for(const n of nodes){n.parentElement=this;this.children.push(n);}}
  after(n){n.parentElement=this.parentElement;}
  prepend(n){n.parentElement=this;this.children.unshift(n);}
  querySelector(sel){if(sel==='small')return this.small||(this.small=new Node('small'));if(sel==='.staff-panel')return get('work-staff-panel');return null;}
  querySelectorAll(sel){
   if(this.id==='v315CityHotspots'&&sel==='[data-v315-pick]')return [0,1,2,3].map(i=>{let n=get('city-marker-'+i);n.dataset.v315Pick=String(i);return n;});
   if(this.id==='v315CityDesk'&&sel==='[data-v315-order]')return ['repair','armor','turret','reserve','power','comms','diagnose'].map(x=>{let n=get('order-'+x);n.dataset.v315Order=x;return n;});
   if(this.id==='v315SecurityGuide'&&sel==='[data-v315-step]')return [0,1,2,3,4].map(i=>{let n=get('step-'+i);n.dataset.v315Step=String(i);return n;});
   return [];
  }
  click(){if(!this.disabled)this.fire('click');}
 }
 function get(id){return created.find(n=>n.id===id)||(nodes[id]??=new Node(id));}
 const S={infra:{power:true,comms:true},defense:{
  status:'idle',selected:1,energy:75,parts:100,spares:2,
  city:[{hp:100,armor:false,turret:false},{hp:50,armor:false,turret:false},
   {hp:100,armor:false,turret:false},{hp:100,armor:true,turret:false}]},
  world:{security:{case:{id:'SEC-3',kind:'relay',stage:'detected',evidence:[],fieldwork:{
   selected:0,budget:12,verified:false,planned:[],records:[],gates:[]}}}}
 };
 let currentPage='home',mobileCurrent={home:'',work:'security',infra:'map'};
 const w={NERV_MOBILE:{open(page,view){opened.push([page,view]);currentPage=page;mobileCurrent[page]=view;}},addEventListener(){}};
 const document={body:{dataset:{}},querySelector:s=>s==='#shell'?get('shell'):null,
  getElementById:get,createElement:tag=>{const n=new Node('new-'+tag);created.push(n);return n;},
  addEventListener(){}};
 // original command action operates on the same selection state
 get('v27Repair').click=()=>{orders.push(['repair',S.defense.selected]);S.defense.city[S.defense.selected].hp+=27;};
 get('v27Armor').click=()=>{orders.push(['armor',S.defense.selected]);S.defense.city[S.defense.selected].armor=true;};
 get('v27Turret').click=()=>{orders.push(['turret',S.defense.selected]);S.defense.city[S.defense.selected].turret=true;};
 get('v27Power').click=()=>{orders.push(['reserve',S.defense.selected]);S.defense.spares--;S.defense.energy+=10;};
 get('powerToggle').click=()=>{orders.push(['power']);S.infra.power=!S.infra.power;};
 get('commsToggle').click=()=>{orders.push(['comms']);S.infra.comms=!S.infra.comms;};
 get('infraDiag').click=()=>orders.push(['diag']);
 const types={relay:{evidence:[['signal','波形'],['hop','中継ホップ'],['patrol','巡回']]}};
 const ctx={document,window:w,S,console,Number,Math,String,JSON,Array,Set,
  currentPage,mobileCurrent,securityKinds:types,fieldRoute:()=>[0,2,5],fieldNodeNames:['搬入口','中央昇降路','整備通路','退避経路','文書庫','送電区画'],
  terminalAlert:()=>({level:'watch',key:'security-SEC-3',page:'work',title:'非正規中継器・盗聴回線の検知'}),
  openAlertReview:mode=>reviews.push(mode),
  mobileSection:(page,view)=>page==='work'?{querySelector:()=>get('work-staff-panel')}:null,
  draw(){}};
 vm.createContext(ctx);vm.runInContext(js,ctx);
 return {ctx,get,S,opened,reviews,orders,w,document};
}
const h=mock(),strip=h.get('v226AlertStrip');
assert.equal(h.w.NERV_V315.version,'3.1.5');
assert.equal(strip.hidden,false);
assert.match(h.get('v315SecurityNext').textContent,/案件を受領/);
strip.fire('click',{closest:()=>null});
assert.deepEqual(h.reviews,['alert'],'top warning must open real recovery confirmation');
h.get('v315AlarmAction').fire('click');
assert.deepEqual(h.opened.at(-1),['work','fieldwork'],'alarm shortcut opens next actionable security workspace');
assert.equal(strip.hidden,true,'warning bar collapses inside target workstation');
const guide=h.get('v315SecurityGuide');assert.equal(guide.parentElement?.id,'work-staff-panel');
assert.match(h.get('v315SecurityNext').textContent,/案件を受領/);
h.S.world.security.case.stage='accepted';h.ctx.draw();
assert.match(h.get('v315SecurityWhy').textContent,/搬入口/);
assert.match(h.get('v315SecurityWhy').textContent,/映像照会/);
h.S.world.security.case.stage='collecting';
h.S.world.security.case.evidence=['signal','hop','patrol'];
h.S.world.security.case.fieldwork.verified=false;
h.ctx.draw();assert.match(h.get('v315SecurityNext').textContent,/経路/);
h.S.world.security.case.fieldwork.verified=true;
h.ctx.draw();assert.match(h.get('v315SecurityNext').textContent,/MAGI/);
h.S.world.security.case.stage='decision';
h.ctx.draw();assert.match(h.get('v315SecurityNext').textContent,/冬月/);
h.get('city-marker-0').dataset.v315Pick='0';
h.get('v315CityHotspots').fire('click',{closest:q=>q==='[data-v315-pick]'?h.get('city-marker-0'):null});
assert.equal(h.S.defense.selected,0,'map pin synchronizes canonical selected sector');
h.S.defense.selected=1;h.ctx.draw();
assert.equal(h.get('v315CityName').textContent,'中央兵装');
assert.equal(h.get('city-marker-1').attrs['aria-pressed'],'true');
assert.equal(h.get('order-repair').disabled,false);
h.get('v315CityDesk').fire('click',{closest:q=>q==='[data-v315-order]'?h.get('order-repair'):null});
assert.deepEqual(h.orders.at(-1),['repair',1]);
assert.equal(h.S.defense.city[1].hp,77,'same real defense object is modified');
assert.equal(h.get('city-marker-1').small.textContent,'HP 77%');
h.S.defense.city[1].hp=100;h.ctx.draw();assert.equal(h.get('order-repair').disabled,true);
assert.ok(css.includes('#shell #commandAlert{display:none!important}'),'large blank warning panel suppressed');
assert.ok(css.includes('#v315AlarmAction'),'functional compact alert styled');
console.log('PASS v3.1.5 compact clickable alert, security next step / route, city photograph 4 sectors and canonical city commands');
