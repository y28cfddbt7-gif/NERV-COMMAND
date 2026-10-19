// Exercise the native stack/gradient composition and cached operations state.
'use strict';
const currentVersion=require('../src/build.json').version.replaceAll('.', '_');
const fs=require('node:fs'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../NERV_COMMAND_v'+currentVersion+'_SCRIPTABLE.js','utf8');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
async function run(family,state,expectedCritical=true,expectedWatch=false){
 let widget;const roots=[];
 class Stack{
  constructor(root){this.root=root||this;this.lines=[];this.children=[];roots.push(this);}
  addText(value){const item={value};this.root.lines.push(item);return item;}
  addStack(){const stack=new Stack(this.root);this.children.push(stack);return stack;}
  addSpacer(){}setPadding(...padding){this.padding=padding;}
  layoutHorizontally(){this.direction='horizontal';}layoutVertically(){this.direction='vertical';}
 }
 class ListWidget extends Stack{}class Color{constructor(hex){this.hex=hex;}}class LinearGradient{}
 const Font={boldSystemFont:size=>({size}),mediumSystemFont:size=>({size}),boldMonospacedSystemFont:size=>({size,mono:true}),monospacedSystemFont:size=>({size,mono:true})};
 const files=new Map(state?[['/mock/nerv_command_v2_state.json',JSON.stringify(state)]]:[]);
 const fm={libraryDirectory:()=>'/mock',joinPath:(a,b)=>a+'/'+b,fileExists:p=>files.has(p),readString:p=>files.get(p),copy:(a,b)=>files.set(b,files.get(a))};
 const forbidden=()=>{throw Error('Network/WebView/location forbidden in cached widgets');};
 await new AsyncFunction('FileManager','Device','ListWidget','Color','Font','LinearGradient','config','Script','WebView','Request','Location','console',code)(
  {local:()=>fm},{batteryLevel:()=>.5,isCharging:()=>false},ListWidget,Color,Font,LinearGradient,
  {runsInWidget:true,widgetFamily:family},{name:()=> 'NERV',setWidget:w=>widget=w,complete(){}},forbidden,forbidden,{current:forbidden},{warn:forbidden});
 assert(widget);assert(widget.backgroundGradient instanceof LinearGradient);assert.deepEqual(widget.backgroundGradient.locations,[0,1]);assert(widget.lines.every(x=>x.font.mono&&x.textColor));
 if(!family.startsWith('accessory')){
  assert(widget.children.length>=2);assert(widget.children[0].direction==='horizontal');
  assert(widget.lines.some(l=>l.value===(expectedCritical?'EMERGENCY / SIM':expectedWatch?'SECURITY / SIM':'LOCAL / SAVED')));
  assert(widget.lines.some(l=>l.value.includes('◷ ')&&l.value.includes('▰ 50%')));
  if(family!=='small')assert(widget.lines.some(l=>l.value==='ORDERS 2 OPEN'));
  if(family==='large')assert(widget.lines.some(l=>l.value==='DUTY MERIT 40 PT')&&widget.lines.some(l=>l.value==='SHINJI / READY'));
 }else {
  assert.equal(widget.lines.some(l=>l.value.includes('警戒')),expectedCritical);
  assert.equal(widget.lines.some(l=>l.value.includes('保安照合')),expectedWatch&&!expectedCritical);
 }
 assert.equal(widget.url,'scriptable:///run?scriptName=NERV');
 console.log('PASS native widget layout, cached alert/order/pilot state: '+family+' / '+(state.magi?.externalDefense?.status||'legacy-critical'));
}
(async()=>{
 const state={tasks:[{done:false}],infra:{power:false},evas:[{state:'HANGAR',sync:70},{state:'READY',sync:82},{state:'POWER_LOST',power:0}],personnel:{dispatch:{merit:40,orders:[{status:'active'},{status:'ready'},{status:'complete'}]}}};
 for(const family of ['small','medium','large','accessoryCircular','accessoryInline','accessoryRectangular']){
  await run(family,state);
  const external={...state,infra:{power:true,comms:true},evas:state.evas.map(e=>({...e,state:e.state==='POWER_LOST'?'HANGAR':e.state})),magi:{externalDefense:{status:'protected'}}};
  await run(family,external);
  external.magi.externalDefense.status='contained';
  await run(family,external,false);
  external.world={security:{case:{kind:'access',stage:'collecting'}}};
  await run(family,external,false,true);
  external.world.security.case.stage='failed';
  await run(family,external,true);
  external.world.security.case=null;
  await run(family,external,false);
  external.world.magiOps={active:{kind:'clock',stage:'work'}};await run(family,external,true);external.world.magiOps.active=null;
  external.defense={status:'active',caseNo:7};external.world.angels={active:{id:'sachiel',caseNo:7}};await run(family,external,true);
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
