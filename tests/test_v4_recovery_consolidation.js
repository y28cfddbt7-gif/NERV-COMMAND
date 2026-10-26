'use strict';
// Architecture migration gate: exercise the exact combined runtime, not old v3 files.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/browser/operation-recovery.js','utf8');
const manifest=JSON.parse(fs.readFileSync('src/build.json','utf8'));
const legacy=['v312-recovery-control.js','v313-alert-consistency.js','v314-alert-workflow.js'];
assert.equal(manifest.browser_modules.filter(x=>x.endsWith('/operation-recovery.js')).length,1);
for(const path of legacy)assert.equal(manifest.browser_modules.some(x=>x.endsWith('/'+path)),false,
 'old wrapper cannot remain active: '+path);
assert.equal((source.match(/callNative\('backupState'/g)||[]).length,1,'exactly one native backup owner');
assert.equal((source.match(/callNative\('persist'/g)||[]).length,1,'exactly one native persist owner');
const seq=['installV312CaseRecovery','installV313AlertConsistency','initV314AlertWorkflow'].map(k=>source.indexOf(k));
assert(seq.every(x=>x>=0)&&seq[0]<seq[1]&&seq[1]<seq[2],'original installer order preserved');
function initial(){
 return {infra:{power:false,comms:true},evas:[{state:'DEPLOYED',power:10}],
  magi:{intrusion:{status:'idle'},externalDefense:{status:'idle'},approvedFor:1,vote:[true,true,false]},
  defense:{status:'defeat',caseNo:9,energy:20,parts:13,spares:3,city:[{hp:75},{hp:100}],
   enemy:{hp:3},last:'CASE paused'},
  logs:{infra:[],eva:[],mission:[]},prefs:{},
  world:{tick:70,security:{case:{id:'SEC-3'},archive:[],nextDueTick:12},
   magiOps:{active:{id:'MAGI-4'},archive:[],nextDueTick:12},
   cooling:{mode:'isolated',load:90},pacing:{nextCoolingTick:2},
   angels:{active:{id:'sachiel'}},events:[],history:[]},
  commandV3:{schema:1,activeCaseId:'CASE-9',events:[{id:'old'}]}
 };
}
function harness(){
 const nodes={},requests=[],toasts=[],opens=[],draws=[];
 let busy=false;
 function element(id){
  if(nodes[id])return nodes[id];
  const cl=new Set(id==='alertReview'?['hidden']:[]);
  const el={id,disabled:false,hidden:false,textContent:'',listeners:{},attrs:{},
   classList:{contains:x=>cl.has(x),add:x=>cl.add(x),remove:x=>cl.delete(x)},
   setAttribute(k,v){this.attrs[k]=v},addEventListener(k,fn,capture){
    (this.listeners[k]??=[]).push({fn,capture:!!capture})},
   insertBefore(x){x.parent=this},
   focus(){},
   querySelector(q){
    if(q==='.staff-alert-dialog')return element('dialogPanel');
    if(q==='.staff-reset-note')return element('resetNote');
    return null;
   }};
  nodes[id]=el;return el;
 }
 const clone=x=>JSON.parse(JSON.stringify(x));
 const ctx={S:initial(),window:{NERV_MOBILE:{open(...a){opens.push(a)}}},
  document:{getElementById:element,createElement:tag=>element('made-'+tag+'-'+Object.keys(nodes).length)},
  JSON,Math,Number,String,Date,Error,Promise,console,clearTimeout(){},saveTimeout:0,recoveryBusy:false,
  openAlertReview(){element('alertReview').classList.remove('hidden')},
  closeAlertReview(){element('alertReview').classList.add('hidden')},
  recoveredStaffState(s){const n=clone(s);n.defense.status='idle';n.defense.enemy=null;
   n.defense.city.forEach(c=>c.hp=100);n.infra.power=true;
   n.evas.forEach(e=>e.state='HANGAR');return n;},
  terminalAlert(){return {key:'city-damage',level:'critical',title:'city damaged'}},
  worldActiveIncident(){return null},securityActive:s=>s.world.security.case,
  meteoText(id,s){element(id).textContent=s},
  draw(){draws.push('draw')},sound(){},toast(x){toasts.push(x)},cancelSequence(){},stopSound(){},
  worldLog(w,k,s){w.history.push({k,s})},
  failBackup:false,failPersist:false,
  async callNative(kind,payload){requests.push({kind,payload:clone(payload)});
   if(kind==='backupState'&&ctx.failBackup)return {error:'backup failed'};
   if(kind==='persist'&&ctx.failPersist)return {error:'persist failed'};
   return {ok:true};}
 };
 vm.createContext(ctx);vm.runInContext(source,ctx,{filename:'operation-recovery.js'});
 async function click(id){
  const ev={stopped:false,preventDefault(){},stopImmediatePropagation(){this.stopped=true}};
  for(const listener of element(id).listeners.click||[]){
   await listener.fn(ev);if(ev.stopped)break;
  }
  return ev;
 }
 return {ctx,element,requests,toasts,opens,draws,click,clone};
}
(async()=>{
 // Same three published public APIs are retained even though one module owns them.
 const api=harness();
 for(const n of ['NERV_V312','NERV_V313','NERV_V314'])assert(api.ctx.window[n],n);
 assert.equal(api.ctx.terminalAlert().key,'case-defeat-9');
 assert.equal(api.ctx.window.NERV_V313.integrity(),88);
 api.ctx.openAlertReview('end');
 let ev=await api.click('alertClear');
 assert(ev.stopped);
 assert.deepEqual(api.requests.map(r=>r.kind),['backupState','persist']);
 assert.equal(api.ctx.S.defense.status,'idle');
 assert.equal(api.ctx.S.infra.power,false,'CASE-only retreat does not repair infrastructure');
 assert.deepEqual(api.ctx.S.defense.city.map(c=>c.hp),[75,100],
 'CASE-only retreat preserves genuine city damage');
 assert.equal(api.ctx.S.world.security.case.id,'SEC-3');
 assert.equal(api.ctx.S.commandV3.events[0].id,'old');
 assert.equal(api.ctx.terminalAlert().key,'city-damage');
 // Full recovery archives incidents, still uses the very same atomic commit path.
 const full=harness(),before=JSON.stringify(full.ctx.S);
 full.ctx.openAlertReview('alert');
 assert.equal(full.element('alertClear').disabled,false);
 ev=await full.click('alertClear');assert(ev.stopped);
 assert.deepEqual(full.requests.map(r=>r.kind),['backupState','persist']);
 assert.equal(JSON.stringify(full.requests[0].payload.state),before);
 assert.equal(full.ctx.S.world.security.case,null);
 assert.equal(full.ctx.S.world.security.archive[0].interruption,'operator-manual-recovery');
 assert.equal(full.ctx.S.world.magiOps.archive[0].id,'MAGI-4');
 assert.equal(full.ctx.S.commandV3.activeCaseId,null);
 assert.deepEqual(full.ctx.S.defense.city.map(c=>c.hp),[100,100]);
 for(const method of ['failBackup','failPersist'])for(const mode of ['alert','end']){
  const x=harness(),original=JSON.stringify(x.ctx.S);x.ctx[method]=true;
  x.ctx.openAlertReview(mode);await x.click('alertClear');
  assert.equal(JSON.stringify(x.ctx.S),original,'rollback: '+mode+' / '+method);
  assert.deepEqual(x.requests.map(r=>r.kind),
   method==='failBackup'?['backupState']:['backupState','persist']);
 }
 console.log('PASS v4 architecture: 3 wrappers to 1, original hook order, canonical backup/persist, CASE-only and all-alert flows, rollback');
})().catch(e=>{console.error(e.stack);process.exitCode=1});
