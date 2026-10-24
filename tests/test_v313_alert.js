'use strict';
// v3.1.3: a 100%-healthy city must not be reported as damaged by a defeated CASE.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const original=fs.readFileSync('src/browser/terminal-effects.js','utf8');
const adapter=fs.readFileSync('src/browser/v313-alert-consistency.js','utf8');
const legacy=original.slice(original.indexOf('function terminalAlert()'),original.indexOf('function renderLauncher()'));
function setup(){
 const nodes={},reviews=[],events=[];
 const el=id=>(nodes[id]??={textContent:'',attrs:{},listeners:{},
  setAttribute(k,v){this.attrs[k]=v},
  addEventListener(type,fn,capture){(this.listeners[type]??=[]).push({fn,capture})}});
 const S={infra:{power:true,comms:true},
  evas:[{state:'HANGAR'},{state:'HANGAR'},{state:'HANGAR'}],
  mission:{phase:0},
  defense:{status:'defeat',caseNo:9,city:[{hp:100},{hp:100},{hp:100},{hp:100}]}
 };
 const ctx={S,Math,Number,String,Array,JSON,console,
  document:{getElementById:el},window:{},
  magiIntrusionActive:()=>false,
  openAlertReview:mode=>reviews.push(mode),
  draw:()=>events.push('draw')};
 vm.createContext(ctx);
 vm.runInContext(legacy,ctx,{filename:'terminal-effects legacy alert'});
 vm.runInContext(adapter,ctx,{filename:'v313-alert-consistency.js'});
 const click=()=>{const event={preventDefault(){this.prevented=true},stopImmediatePropagation(){this.stopped=true}};
  for(const listener of el('commandAlertOpen').listeners.click||[])
   if(listener.capture&&!event.stopped)listener.fn(event);
  return event;
 };
 return {ctx,el,reviews,events,click};
}
let h=setup(),before=JSON.stringify(h.ctx.S);
assert.equal(h.ctx.terminalAlert().key,'case-defeat-9');
assert.equal(h.ctx.terminalAlert().title,'迎撃作戦 敗北 / 終了待ち');
assert.match(h.ctx.terminalAlert().message,/都市施設はHP 100%で機能停止していません/);
assert.equal(h.el('v232CityEnemy').textContent,'作戦敗北');
assert.match(h.el('commandAlertOpen').textContent,/終了・復旧/);
let event=h.click();assert.deepEqual(h.reviews,['end']);assert.equal(event.stopped,true);
assert.equal(JSON.stringify(h.ctx.S),before,'banner must never silently mutate save');
h.ctx.S.defense.status='idle';h.ctx.draw();
assert.equal(h.ctx.terminalAlert().level,'nominal','after real state recovery, stale defeat alarm disappears');
assert.equal(h.el('v232CityEnemy').textContent,'なし');
assert.equal(h.el('commandAlertOpen').textContent,'警報を確認する ↗');
h=setup();h.ctx.S.defense.city[1].hp=0;h.ctx.draw();
assert.equal(h.ctx.terminalAlert().key,'city-facility-offline');
assert.match(h.ctx.terminalAlert().message,/中央の施設HPが0%/);
assert.match(h.ctx.terminalAlert().message,/75%/);
assert.equal(h.click().stopped,undefined,'facility damage does not secretly initiate CASE reset');
h=setup();h.ctx.S.infra.power=false;
assert.equal(h.ctx.terminalAlert().key,'power','physical fault outranks CASE loss');
assert.equal(h.click().stopped,undefined);
h=setup();h.ctx.S.defense.status='victory';h.ctx.draw();
assert.equal(h.el('v232CityEnemy').textContent,'迎撃成功');
console.log('PASS v3.1.3: true HP vs CASE defeat, city map state, explicit end dialog, safety precedence, cleared alert');
