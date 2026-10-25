'use strict';
// Protect against the v4.0.1 false-fatal "Script error." cover on actual iPhone.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/browser/boot-diagnostics.js','utf8');
const build=fs.readFileSync('scripts/build.py','utf8');
function boot(){
  const timeouts=[],events={};let created=0;
  class Node {
    constructor(tag){this.tag=tag;this.children=[];this.style={};this.textContent='';this.onclick=null;this.id='';}
    setAttribute(k,v){(this.attrs??={})[k]=v;}
    append(...n){this.children.push(...n);}
    remove(){this.removed=true;}
    select(){}
  }
  const body=new Node('body');
  let station=false;
  const document={body,createElement(tag){created++;return new Node(tag);},
    getElementById(id){
      if(id==='v400Station')return station?new Node('section'):null;
      const q=[...body.children];while(q.length){const e=q.shift();if(e.id===id)return e;q.push(...e.children);}
      return null;
    },execCommand(){return true;}};
  const window={addEventListener(kind,handler){(events[kind]??=[]).push(handler);}};
  const ctx={document,window,setTimeout(fn,delay){timeouts.push([fn,delay]);return timeouts.length;},
    Date,Array,Object,String,JSON,console,location:{reload(){}}};
  vm.createContext(ctx);vm.runInContext(source,ctx);
  return {window,body,document,events,timeouts,created:()=>created,setReady(){
    station=true;window.__NERV_BOOT_BUNDLE_COMPLETE__=true;
    window.__NERV_V400_RENDERED__=true;window.NERV_V400={};}};
}
let x=boot();
assert.equal(x.body.children.length,0);
x.events.error[0]({message:'Script error.',filename:'runtime.js',lineno:103,
  colno:7,target:x.window});
assert.equal(x.body.children.length,0,'generic error must not obscure a still-booting app');
assert.equal(x.window.__NERV_BOOT_ERRORS__.length,1);
x.setReady();for(const [fn]of x.timeouts)fn();
assert.equal(x.body.children.length,0,'late successful initialization must discard old transient error');
assert.equal(x.window.__NERV_BOOT_DIAGNOSTICS__.ready(),true);

x=boot();
x.window.__NERV_BOOT_STAGE__='src/browser/v219-console-engine.js';
x.events.error[0]({message:'Script error.',filename:'inline-app.js',lineno:832,colno:2,target:x.window});
assert.equal(x.body.children.length,0,'must not show on first error');
for(const [fn]of x.timeouts)fn();
assert.equal(x.body.children.length,1,'a *real* missing startup completion gets one screen');
const panel=x.body.children[0];
assert.equal(panel.id,'nervBootDiagnostics');
assert.equal(panel.children.length,5);
const info=panel.children[2].textContent;
assert(info.includes('v219-console-engine.js'));
assert(info.includes('Script error.'));
assert(info.includes('bundleComplete=false'));
assert(info.includes('stationRendered=false'));
assert(info.includes('832:2'));
assert(!source.includes('localStorage.setItem')&&!source.includes('callNative('));
assert(build.includes('__NERV_BOOT_STAGE__')&&build.includes('__NERV_BOOT_BUNDLE_COMPLETE__'));
assert(fs.readFileSync('src/browser/v400-command-station.js','utf8').includes('__NERV_V400_RENDERED__=true'));
console.log('PASS v4.0.2: transient errors do not cover loaded app, real stalls show path/line/stack and no save writes');
