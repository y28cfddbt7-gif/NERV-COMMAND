'use strict';
// v3.1.4: manual alarm recovery must remain operator-selectable for every
// technical/security alert, preserve the preflight backup and truthfully archive interruptions.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=fs.readFileSync('src/browser/staff-recovery.js','utf8');
const retreat=fs.readFileSync('src/browser/v312-recovery-control.js','utf8');
const universal=fs.readFileSync('src/browser/v314-alert-workflow.js','utf8');
function state(){
 return {prefs:{},infra:{power:true,comms:true,armor:true},
  evas:[{state:'DEPLOYED',power:17,damage:{torso:13}},{state:'POWER_LOST',power:0,damage:{torso:45}},{state:'HANGAR',power:300,damage:{torso:0}}],
  magi:{intrusion:{status:'detected',phase:2,progress:47},externalDefense:{status:'detected',caseNo:4,turn:2}},
  mission:{phase:4},ops:{currentMissionLocks:3,missionAwarded:true,missions:2},
  tactics:{charge:30,heat:7,scans:3},logs:{infra:[],eva:[],mission:[],magi:[]},
  defense:{status:'defeat',caseNo:12,enemy:{hp:3},round:13,scans:100,breach:90,energy:8,parts:26,spares:1,security:30,connected:true,
   shutdown:false,magivote:[true,true,false],magiround:12,alert:true,usedV27Shot:true,
   city:[{hp:100,armor:false},{hp:60,armor:true},{hp:90,armor:false},{hp:42,armor:true}]},
  commandV3:{schema:1,activeCaseId:'CASE-12',revision:4,sequence:3,events:[{id:'previous'}]},
  world:{schema:1,tick:52,lastSimAt:3000,sequence:2,history:[{id:'original-record'}],communications:[{id:'original-comm'}],
   security:{case:{id:'SEC-9',kind:'relay',stage:'failed'},archive:[],nextDueTick:50},
   magiOps:{active:{id:'MAGI-OPS-3',kind:'clock',stage:'validated'},archive:[],nextDueTick:50},
   cooling:{mode:'isolated',load:96},pacing:{nextCoolingTick:42},
   angels:{active:{id:'sachiel',caseNo:12}},
   events:[{kind:'magi-cooling',id:'COOL-8',status:'review',severity:'critical'}]}
 };
}
function harness(){
 const nodes={},records=[],alerts=[],messages=[];
 function element(id){
  if(nodes[id])return nodes[id];
  const renamed=Object.values(nodes).find(n=>n.id===id);
  if(renamed)return renamed;
  const listeners={};const attrs={};const classes=new Set(['hidden']);
  nodes[id]={id,disabled:false,hidden:false,textContent:'',attrs,listeners,
   classList:{contains:c=>classes.has(c),add:c=>classes.add(c),remove:c=>classes.delete(c)},
   setAttribute:(k,v)=>{attrs[k]=v},focus(){},isConnected:true,
   addEventListener(type,fn,capture){(listeners[type]??=[]).push({fn,capture:!!capture})},
   insertBefore(child){child.parent=this},
   querySelector(selector){
    if(selector==='.staff-alert-dialog')return element('dialogPanel');
    if(selector==='.staff-reset-note')return element('resetNote');
    return null;
   }};
  return nodes[id];
 }
 const ctx={S:state(),window:{NERV_MOBILE:{open(){}}},
  document:{getElementById:element,createElement:tag=>element('dynamic-'+tag+'-'+Object.keys(nodes).length),
   activeElement:{isConnected:false}},
  Math,Number,String,Array,JSON,Date,Error,Promise,console,
  $:element,hhmmss:()=> '13:24:00',
  meteoText:(id,value)=>{element(id).textContent=value},
  worldActiveIncident:w=>w.events.find(e=>e.kind==='magi-cooling'&&e.status!=='resolved'),
  securityActive:s=>s.world.security.case,
  terminalAlert:()=>({level:'critical',key:'security-SEC-9',title:'非正規中継器・盗聴回線の検知',message:'保安案件を確認'}),
  cancelSequence(){},stopSound(){},clearTimeout(){},saveTimeout:0,
  draw(){alerts.push('draw')},sound(){},toast:t=>messages.push(t),
  worldLog(w,kind,text){w.sequence++;w.history.unshift({id:'record-'+w.sequence,kind,text})},
  failBackup:false,failPersist:false,
  callNative:async(kind,payload)=>{records.push({kind,payload:JSON.parse(JSON.stringify(payload))});
   if(kind==='backupState'&&ctx.failBackup)return {error:'backup failed'};
   if(kind==='persist'&&ctx.failPersist)return {error:'persist failed'};
   return {ok:true};
  }};
 vm.createContext(ctx);
 vm.runInContext(core,ctx);
 const oldOpen=ctx.openAlertReview;
 ctx.openAlertReview=function(requested='alert'){
  oldOpen(requested);
  // Simulate the real cooling/MAGI/security wrappers that all disable the legacy button.
  if(ctx.S.world.security.case||ctx.S.world.magiOps.active){
   element('alertClear').disabled=true;element('alertClear').textContent='保安案件の引継ぎが必要';
  }
 };
 vm.runInContext(retreat,ctx);
 vm.runInContext(universal,ctx);
 async function click(id){
  const event={prevented:false,stopped:false,preventDefault(){this.prevented=true},
   stopImmediatePropagation(){this.stopped=true}};
  for(const cb of element(id).listeners.click||[]){
   if(!cb.capture)continue;
   await cb.fn(event);if(event.stopped)break;
  }
  return event;
 }
 return {ctx,element,records,alerts,messages,click};
}
async function allWarningsRecover(){
 const h=harness(),original=JSON.stringify(h.ctx.S);
 h.ctx.openAlertReview('alert');
 assert.equal(h.element('alertClear').disabled,false,'ALL warning restore paths must allow a choice');
 assert.match(h.element('alertClear').textContent,/警報復旧/);
 assert.match(h.element('v314Guidance').textContent,/未解決 5 件/);
 const result=await h.click('alertClear');
 assert.equal(result.stopped,true,'global original reset listener must never run');
 assert.deepEqual(h.records.map(x=>x.kind),['backupState','persist']);
 assert.equal(JSON.stringify(h.records[0].payload.state),original,'backup contains exact original');
 const next=h.ctx.S;
 assert.equal(next.defense.status,'idle');assert.equal(next.defense.enemy,null);
 assert.deepEqual(next.defense.city.map(c=>c.hp),[100,100,100,100]);
 assert.equal(next.infra.power,true);assert.equal(next.infra.comms,true);
 assert.equal(next.world.security.case,null);
 assert.equal(next.world.security.archive[0].interruption,'operator-manual-recovery');
 assert.equal(next.world.security.archive[0].id,'SEC-9');
 assert.equal(next.world.magiOps.active,null);
 assert.equal(next.world.magiOps.archive[0].interruption,'operator-manual-recovery');
 assert.equal(next.world.events[0].status,'resolved');
 assert.equal(next.world.events[0].resolution,'operator-manual-recovery');
 assert.equal(next.world.events[0].authorizedBy,undefined);
 assert.equal(next.world.cooling.mode,'normal');
 assert.equal(next.magi.intrusion.status,'idle');
 assert.equal(next.magi.externalDefense.status,'idle');
 assert.equal(next.commandV3.events[0].id,'previous');
 assert.equal(next.commandV3.activeCaseId,null);
 assert.ok(next.evas.every(e=>e.state==='HANGAR'&&e.power===300));
 assert.equal(next.evas[1].damage.torso,45);
 assert.equal(next.world.communications[0].id,'original-comm');
 assert.match(next.world.history[0].text,/中断/);
 assert.deepEqual(h.ctx.NERV_V314.snapshot().pending,[]);
}
async function everyWarningType(){
 const categories=['security','magi','cooling','intrusion','external'];
 for(const only of categories){
  const h=harness(),s=h.ctx.S;
  if(only!=='security')s.world.security.case=null;
  if(only!=='magi')s.world.magiOps.active=null;
  if(only!=='cooling')s.world.events[0].status='resolved';
  if(only!=='intrusion')s.magi.intrusion.status='idle';
  if(only!=='external')s.magi.externalDefense.status='idle';
  s.defense.status='idle';
  h.ctx.openAlertReview('alert');
  assert.equal(h.element('alertClear').disabled,false,only+' warning must be selectable');
  assert.equal(h.ctx.NERV_V314.snapshot().pending.length,1);
  await h.click('alertClear');
  assert.deepEqual(h.records.map(x=>x.kind),['backupState','persist']);
  assert.equal(h.ctx.NERV_V314.snapshot().pending.length,0);
 }
}
async function failuresRollBack(){
 for(const fault of ['failBackup','failPersist']){
  const h=harness(),before=JSON.stringify(h.ctx.S);h.ctx[fault]=true;
  h.ctx.openAlertReview('alert');await h.click('alertClear');
  assert.equal(JSON.stringify(h.ctx.S),before,fault+' must never destroy data');
  assert.deepEqual(h.records.map(x=>x.kind),fault==='failBackup'?['backupState']:['backupState','persist']);
 }
}
async function canStillRetreat(){
 const h=harness();h.ctx.openAlertReview('alert');
 assert.equal(h.element('v314CaseOnly').hidden,false);
 // Direct user action, not a legacy capture listener.
 const handler=h.element('v314CaseOnly').listeners.click[0].fn;await handler();
 assert.equal(h.element('v314FullRecovery').hidden,false);
 assert.match(h.element('alertClear').textContent,/作戦のみ終了/);
 await h.click('v314FullRecovery');
 assert.equal(h.ctx.S.world.security.case,null);
 assert.equal(h.ctx.S.defense.status,'idle');
}
(async()=>{
 await allWarningsRecover();await everyWarningType();await failuresRollBack();await canStillRetreat();
 console.log('PASS v3.1.4 universal warning recovery, operator confirmation, honest interrupted archives, preserved records and backup/rollback');
})().catch(e=>{console.error(e.stack);process.exitCode=1});
