// Node-only mock DOM harness. Verifies app state reducers, not browser layout or WebKit.
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const app=fs.readFileSync(__dirname+'/../app.js','utf8');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const ids=[...new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]))];
const time={now:1760521200000};
const events={};
function node(id='',data={}){
 const classes=new Set();return {
  id,dataset:data,style:{},disabled:false,value:'',children:[],textContent:'',innerHTML:'',className:'',
  classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),toggle:(k,b)=>{if(b===undefined? !classes.has(k):b)classes.add(k);else classes.delete(k);},contains:k=>classes.has(k)},
  attrs:{},handlers:{},setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k]},
  addEventListener(k,fn){this.handlers[k]=fn},click(){if(this.disabled)return;this.emit('click')},emit(k,e={}){return this.handlers[k]?.({...e,preventDefault(){}})},
  append(...args){this.children.push(...args)},appendChild(el){this.children.push(el)},querySelector(sel){return node(sel)},replaceChildren(...args){this.children=[...args]},
  get childNodes(){return [{textContent:''}]},getAttributeNames(){return Object.keys(this.attrs)}
 };
}
const els=Object.fromEntries(ids.map(id=>[id,node(id)]));
const selectors={
 '[data-eva]':[0,1,2].map(x=>node('',{eva:String(x)})),
 '[data-core]':['b','c','m'].map(x=>node('',{core:x})),
 '[data-min]':[5,15,25].map(x=>node('',{min:String(x)})),
 '[data-open]':['home','weather','infra','eva','magi','mission','tools','settings'].map(x=>node('',{open:x})),
 '[data-nav]':['home','weather','infra','eva','tools'].map(x=>node('',{nav:x})),
 '.unit-model':[0,1,2].map(x=>node('',{model:String(x)})),
 '.page':['home','weather','infra','eva','magi','mission','tools','settings'].map(x=>node('',{page:x})),
};
function setup(state){
 const local={val:state||null};let id=1;const later={};
 class FakeDate extends Date{constructor(...args){super(...(args.length?args:[time.now]))}static now(){return time.now}}
 const document={
  body:node('body'),
  getElementById(k){return els[k]||(els[k]=node(k))},
  querySelector(sel){if(sel==='.eva-display')return els['eva-display']||(els['eva-display']=node('eva-display'));if(sel.startsWith('.page[data-page='))return selectors['.page'].find(x=>sel.includes('"'+x.dataset.page+'"'))||null;return null},
  querySelectorAll(sel){return selectors[sel]||[]},
  createElement(){return node()},createTextNode(s){return {textContent:s}},
  addEventListener(name,fn){events[name]=fn}
 };
 const sandbox={document,console:{warn(){}},Date:FakeDate,Math,JSON,Promise,Number,String,Array,Error,NaN,Set,
  setTimeout(fn){const key=id++;later[key]=fn;return key},clearTimeout(key){delete later[key]},setInterval(fn){events.interval=fn;return id++},
  navigator:{},localStorage:{getItem(){return local.val?JSON.stringify(local.val):null},setItem(k,v){local.val=JSON.parse(v)}},
  confirm(){return true},window:{__BOOT__:state?{state}:null,matchMedia(){return {matches:true}},scrollTo(){},addEventListener(k,fn){events['window.'+k]=fn}},
 };
 sandbox.window.document=document;
 vm.runInNewContext(app,sandbox,{filename:'app.js'});
 const flush=()=>{for(const key of Object.keys(later)){const fn=later[key];delete later[key];fn()}};
 return {S:()=>sandbox.window.NERV_TEST.getState(),els,selectors,flush,tick:()=>sandbox.window.NERV_TEST.clock(),open:page=>sandbox.window.NERV_TEST.open(page),click:id=>els[id].emit('click')};
}
let pass=0;function test(name,fn){try{fn();console.log('PASS',name);pass++}catch(e){console.error('FAIL',name,e.message);process.exitCode=1}}
const h=setup();
test('8 screens and EVA selectors present',()=>{assert.equal(selectors['.page'].length,8);assert.equal(selectors['[data-eva]'].length,3);assert.equal(els.evaMagiState!==undefined,true)});
test('unit switch correctly updates drawing/readout',()=>{
 h.open('eva');[0,1,2,0,2].forEach(i=>{selectors['[data-eva]'][i].emit('click');assert.equal(h.S().selectedEva,i);assert.equal(els.evaUnitLabel.textContent,'EVANGELION UNIT-0'+i);assert.equal(els.evaArtwork.dataset.unit,String(i));assert.equal(els.evaPaintMode.textContent,['AZURE / PROTOTYPE','VIOLET / TEST TYPE','SCARLET / PRODUCTION'][i]);});
});
test('launch without MAGI approval rejected',()=>{h.click('evaPrepare');assert.equal(h.S().evas[2].state,'READY');h.click('evaLaunch');assert.equal(h.S().evas[2].state,'READY');});
test('MAGI 2 of 3 permits target unit launch',()=>{h.click('magiVote');assert.equal(h.S().magi.approvedFor,2);h.click('evaLaunch');assert.equal(h.S().evas[2].state,'DEPLOYED');assert.equal(h.S().magi.approvedFor,null);assert.equal(h.S().evas[2].power,300);});
test('normal power drains real elapsed seconds',()=>{time.now+=6000;h.tick();assert.equal(h.S().evas[2].power,294)});
test('AT activation doubles consumption only after toggle',()=>{time.now+=4000;h.click('evaATButton');assert.equal(h.S().evas[2].power,290);assert.equal(h.S().evas[2].at,true);time.now+=3000;h.tick();assert.equal(h.S().evas[2].power,284);});
test('AT release stops double drain immediately',()=>{h.click('evaATButton');time.now+=5000;h.tick();assert.equal(h.S().evas[2].power,279);});
test('recovered EVA needs maintenance before reset',()=>{h.click('evaReturn');assert.equal(h.S().evas[2].state,'MAINTENANCE');h.click('evaMaintain');assert.equal(h.S().evas[2].power,300);assert.equal(h.S().evas[2].state,'HANGAR')});
test('offscreen elapsed time computed at reload',()=>{
 selectors['[data-eva]'][1].emit('click');h.click('evaPrepare');h.click('magiVote');h.click('evaLaunch');h.flush();const saved=h.S();time.now+=23000;const second=setup(saved);assert.equal(second.S().evas[1].power,277);});
test('old deployed save missing timestamp does not over-debit',()=>{
 const old=h.S();old.evas[0]={state:'DEPLOYED',power:197,sync:71,at:true};time.now+=500000;
 const second=setup(old);assert.equal(second.S().evas[0].power,197);assert.equal(second.S().evas[0].state,'DEPLOYED');
});
test('power exhaustion transitions once to POWER_LOST',()=>{
 const old=h.S();old.evas[0]={state:'DEPLOYED',power:5,sync:71,at:true,powerUpdatedAt:time.now-5000};
 const x=setup(old);assert.equal(x.S().evas[0].power,0);assert.equal(x.S().evas[0].state,'POWER_LOST');const n=x.S().logs.eva.length;x.tick();assert.equal(x.S().logs.eva.length,n);
});
test('infrastructure change invalidates MAGI',()=>{
 const x=setup();x.click('evaPrepare');x.click('magiVote');assert.equal(x.S().magi.approvedFor,0);x.click('powerToggle');assert.equal(x.S().magi.approvedFor,null);
});
console.log('TOTAL',pass,'tests');if(process.exitCode)process.exit(process.exitCode);
