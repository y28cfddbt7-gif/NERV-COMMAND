// Exercise the native stack/gradient composition and cached operations state.
'use strict';
const currentVersion=require('../src/build.json').version.replaceAll('.', '_');
const fs=require('node:fs'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../NERV_COMMAND_v'+currentVersion+'_SCRIPTABLE.js','utf8');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
async function run(family,state){
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
  assert(widget.lines.some(l=>l.value==='EMERGENCY / SIM'));
  assert(widget.lines.some(l=>l.value.includes('◷ ')&&l.value.includes('▰ 50%')));
  if(family!=='small')assert(widget.lines.some(l=>l.value==='ORDERS 2 OPEN'));
  if(family==='large')assert(widget.lines.some(l=>l.value==='DUTY MERIT 40 PT')&&widget.lines.some(l=>l.value==='SHINJI / READY'));
 }else assert(widget.lines.some(l=>l.value.includes('警戒')));
 assert.equal(widget.url,'scriptable:///run?scriptName=NERV');
 console.log('PASS native widget layout, cached alert/order/pilot state: '+family);
}
(async()=>{
 const state={tasks:[{done:false}],infra:{power:false},evas:[{state:'HANGAR',sync:70},{state:'READY',sync:82},{state:'POWER_LOST',power:0}],personnel:{dispatch:{merit:40,orders:[{status:'active'},{status:'ready'},{status:'complete'}]}}};
 for(const family of ['small','medium','large','accessoryCircular','accessoryInline','accessoryRectangular'])await run(family,state);
})().catch(e=>{console.error(e);process.exitCode=1;});
