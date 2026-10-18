'use strict';
const currentVersion=require('../src/build.json').version.replaceAll('.', '_');
const fs=require('fs'), assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../NERV_COMMAND_v'+currentVersion+'_SCRIPTABLE.js','utf8');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const families=['small','medium','large','accessoryCircular','accessoryInline','accessoryRectangular'];
async function test(family){
 let widget=null;
 class ListWidget {
  constructor(){this.lines=[]}
  addText(v){const line={value:v,font:null,textColor:null,lineLimit:0,minimumScaleFactor:0};this.lines.push(line);return line}
  addSpacer(){ }setPadding(){ }
 }
 class Color {constructor(x){this.hex=x}}
 const Font={boldSystemFont:x=>({size:x,weight:'bold'}),mediumSystemFont:x=>({size:x,weight:'medium'})};
 const fm={libraryDirectory:()=>'/mock',joinPath:(a,b)=>a+'/'+b,fileExists:()=>false,readString:()=>null};
 const FileManager={local:()=>fm};const Device={batteryLevel:()=>1,isCharging:()=>false};
 const Script={name:()=> 'NERV COMMAND 2.5',setWidget:v=>{widget=v},complete(){} };
 const config={runsInWidget:true,runsInAccessoryWidget:family.startsWith('accessory'),widgetFamily:family};
 const logger={warn:x=>{throw Error(String(x))}};
 await new AsyncFunction('FileManager','Device','ListWidget','Color','Font','config','Script','console',code)(FileManager,Device,ListWidget,Color,Font,config,Script,logger);
 assert(widget);assert(widget.lines.length>0);assert(widget.url.includes('scriptable:///run?scriptName='));
 assert(widget.lines.every(x=>x.font&&x.textColor));
 console.log('PASS widget '+family+' / '+widget.lines.length+' lines');
}
(async()=>{for(const f of families)await test(f)})().catch(e=>{console.error(e);process.exitCode=1});
