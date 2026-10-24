/* NERV v3.1.2 - additive CASE-only emergency termination, preserving immutable legacy modules. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const original=fs.readFileSync('src/browser/staff-recovery.js','utf8');
const addon=fs.readFileSync('src/browser/v312-recovery-control.js','utf8');
function oldState(block=true){
 return {infra:{power:false,comms:false,armor:true},
 evas:[{state:'DEPLOYED',power:14,damage:{torso:22},sync:73},{state:'POWER_LOST',power:0,damage:{torso:40},sync:81},{state:'HANGAR',power:300,damage:{torso:0},sync:79}],
 magi:{approvedFor:1,vote:[true,true,false],interceptApproval:{ok:true},intrusion:{status:'idle',progress:0}},
 mission:{phase:5},ops:{currentMissionLocks:3,missionAwarded:true,missions:2},
 tactics:{charge:50,heat:41,scans:2},prefs:{sound:true},
 defense:{status:'defeat',caseNo:8,enemy:{hp:22},round:14,scans:100,breach:30,energy:23,parts:32,spares:0,security:50,
 connected:true,shutdown:false,magivote:[true,true,false],magiround:13,alert:true,usedV27Shot:true,
 city:[{hp:100,armor:false},{hp:96,armor:true},{hp:69,armor:false},{hp:100,armor:true}]},
 world:{schema:1,tick:800,security:{case:null},magiOps:{active:block?{id:'MAGI-OPS-2',kind:'clock',stage:'validated'}:null},
 coolingIncident:null,communications:[{id:'keep',text:'record'}]},
 logs:{infra:[],eva:[],mission:[],magi:[]},commandV3:{schema:1,revision:3,events:[{id:'evt-original'}]}
 };
}
function harness(block=true){
 const elements={};const records=[],opened=[],messages=[];
 function el(id){if(!elements[id]){
 const listeners={};elements[id]={id,disabled:false,textContent:'',listeners,focus(){},
  addEventListener(t,fn,capture){(listeners[t]??=[]).push({fn,capture:!!capture})},
  classList:{add(){},remove(){}},querySelector(){return null}};
 }return elements[id];}
 el('alertReview').querySelector=q=>q==='.staff-reset-note'?el('resetNote'):null;
 const ctx={S:oldState(block),JSON,Date,Number,Math,Error,Promise,console,
  document:{getElementById:el,activeElement:{isConnected:false}},window:{NERV_MOBILE:{open(...args){opened.push(args)}}},
  $:el,terminalAlert:()=>({key:'city-damage',title:'都市防衛網 損傷',message:'対象施設へ'}),
  meteoText(id,txt){el(id).textContent=txt},hhmmss:()=> '16:24:00',
  worldActiveIncident:w=>w.coolingIncident,securityActive:s=>s.world.security.case,
  cancelSequence(){},stopSound(){},clearTimeout(){},saveTimeout:0,draw(){},
  sound(){},toast(x){messages.push(x)},
  failBackup:false,failPersist:false,
  callNative:async(kind,payload)=>{records.push({kind,payload:JSON.parse(JSON.stringify(payload))});
    if(kind==='backupState'&&ctx.failBackup)return {error:'cannot back up'};
    if(kind==='persist'&&ctx.failPersist)return {error:'cannot persist'};return {ok:true};}
 };
 vm.createContext(ctx);
 vm.runInContext(original,ctx,{filename:'staff-recovery.js'});
 // Real legacy wrappers block EVERY recovery button whenever MAGI is pending.
 const prior=ctx.openAlertReview;
 ctx.openAlertReview=function(mode='alert'){
  prior(mode);
  if(ctx.S.world?.magiOps?.active){
   el('alertClear').disabled=true;
   el('alertClear').textContent='MAGI保守の復旧承認が必要';
  }
 };
 vm.runInContext(addon,ctx,{filename:'v312-recovery-control.js'});
 const click=async(id)=>{const ev={defaultPrevented:false,stopped:false,
  preventDefault(){this.defaultPrevented=true},stopImmediatePropagation(){this.stopped=true}};
  for(const cb of el(id).listeners.click??[]){
   if(!cb.capture)continue;
   await cb.fn(ev);
   if(ev.stopped)break;
  }
  return ev;
 };
 return {ctx,el,records,opened,messages,click};
}
async function pendingMAGISafeEnd(){
 const h=harness();
 const before=JSON.stringify(h.ctx.S);
 h.ctx.openAlertReview('alert');
 assert.equal(h.el('alertClear').disabled,true,'original regular alert remains blocked');
 h.ctx.openAlertReview('end');
 assert.equal(h.el('alertClear').disabled,false,'explicit CASE-only retreat now reachable');
 assert.match(h.el('alertClear').textContent,/作戦のみ終了/);
 assert.match(h.el('alertReviewDescription').textContent,/未解決案件/);
 assert.match(h.el('resetNote').textContent,/施設HPを回復させません/);
 assert.match(h.el('alertTarget').textContent,/MAGI保守/);
 const target=await h.click('alertTarget');
 assert.equal(target.stopped,true);
 assert.deepEqual(h.opened[0],['magi','maintenance'],'city damage cannot hide MAGI technician route');
 h.ctx.openAlertReview('end');
 const click=await h.click('alertClear');
 assert.equal(click.stopped,true,'normal global full-reset click must not run');
 assert.equal(h.ctx.S.defense.status,'idle');
 assert.equal(h.ctx.S.defense.enemy,null);
 assert.deepEqual(h.ctx.S.defense.city.map(c=>c.hp),[100,96,69,100]);
 assert.equal(h.ctx.S.infra.power,false);assert.equal(h.ctx.S.infra.comms,false);
 assert.equal(h.ctx.S.defense.energy,23);
 assert.equal(h.ctx.S.world.magiOps.active.stage,'validated');
 assert.equal(h.ctx.S.world.communications[0].id,'keep');
 assert.equal(h.ctx.S.commandV3.events[0].id,'evt-original');
 assert.ok(h.ctx.S.evas.every(e=>e.state==='HANGAR'&&e.power===300));
 assert.equal(h.ctx.S.evas[1].damage.torso,40);
 assert.deepEqual(h.records.map(x=>x.kind),['backupState','persist']);
 assert.equal(JSON.stringify(h.records[0].payload.state),before,'backup captures original save');
}
async function cannotLoseSave(){
 for(const failed of ['failBackup','failPersist']){
  const h=harness();h.ctx.openAlertReview('end');const before=JSON.stringify(h.ctx.S);h.ctx[failed]=true;
  await h.click('alertClear');
  assert.equal(JSON.stringify(h.ctx.S),before,'rollback original on '+failed);
  assert.equal(h.records[0].kind,'backupState');
  if(failed==='failBackup')assert.equal(h.records.length,1);
 }
}
async function normalRecoveryIsUnchanged(){
 const h=harness(false);h.ctx.openAlertReview('end');
 assert.match(h.el('alertClear').textContent,/正常待機/);
 const event=await h.click('alertClear');assert.equal(event.stopped,false,'no fault = original handler unchanged');
 await h.ctx.clearTerminalAlert();
 assert.ok(h.ctx.S.defense.city.every(c=>c.hp===100));
 assert.equal(h.ctx.S.infra.power,true);assert.equal(h.ctx.S.infra.comms,true);
}
(async()=>{
 await pendingMAGISafeEnd();await cannotLoseSave();await normalRecoveryIsUnchanged();
 for(const p of ['staff-recovery.js','world-workflow.js','v214-security-ui.js','v215-operations-ui.js'])
  assert.ok(fs.readFileSync('src/browser/'+p).length>0);
 assert.match(addon,/event.stopImmediatePropagation\(\)/);
 assert.match(fs.readFileSync('src/styles/v310-operation-surface.css','utf8'),/#shell #commandAlert\[data-level="critical"\]/);
 console.log('PASS v3.1.2 safe CASE-only retreat, real MAGI deep link, immutable base module, backup/rollback, ordinary restore unchanged');
})().catch(e=>{console.error(e.stack);process.exitCode=1});
