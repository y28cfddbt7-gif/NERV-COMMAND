/* NERV v3.1.2: genuine fault-vs-CASE-end recovery regression. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('src/browser/staff-recovery.js','utf8');
function state(block=true){
 return {
 infra:{power:false,comms:false,armor:true},
 evas:[{state:'DEPLOYED',power:14,damage:{torso:22},sync:73},{state:'POWER_LOST',power:0,damage:{torso:40},sync:81},{state:'HANGAR',power:300,damage:{torso:0},sync:79}],
 magi:{approvedFor:1,vote:[true,true,false],interceptApproval:{ok:true},intrusion:{status:'idle',progress:0}},
 mission:{phase:5},ops:{currentMissionLocks:3,missionAwarded:true,missions:2},
 tactics:{charge:50,heat:41,scans:2},prefs:{sound:true},
 defense:{status:'defeat',caseNo:8,enemy:{hp:22},round:14,scans:100,breach:30,energy:23,parts:32,spares:0,security:50,
  connected:true,shutdown:false,magivote:[true,true,false],magiround:13,alert:true,usedV27Shot:true,
  city:[{hp:100,armor:false},{hp:96,armor:true},{hp:69,armor:false},{hp:100,armor:true}]},
 world:{schema:1,tick:800,security:{case:null},magiOps:{active:block?{id:'MAGI-OPS-2',kind:'clock',stage:'validated'}:null},coolingIncident:null,
  communications:[{id:'keep',text:'record'}]},
 logs:{infra:[],eva:[],mission:[],magi:[]},commandV3:{schema:1,revision:3,events:[{id:'evt-original'}]}
 };
}
function setup(block=true){
 const elements={};
 function e(id){return elements[id]??(elements[id]={textContent:'',disabled:false,hidden:false,
   listeners:[],focus(){},classList:{add(){},remove(){}},addEventListener(type,fn){this.listeners.push(fn)}});}
 const S=state(block);
 const events=[],records=[],links=[];
 const ctx={S,JSON,Date,Number,Math,Error,Promise,console,
  document:{activeElement:{isConnected:false},},
  $,meteoText(id,text){e(id).textContent=text;},
  terminalAlert:()=>({level:'critical',key:'city-damage',title:'都市防衛網 損傷',message:'損傷を確認'}),
  worldActiveIncident(w){return w.coolingIncident;},securityActive(s){return s.world.security.case;},
  hhmmss:()=> '16:24:00',
  cancelSequence(){events.push('sequence.cancel')},stopSound(){events.push('audio.stop')},clearTimeout(){},saveTimeout:0,
  draw(){events.push('draw')},sound(){},toast(msg){events.push('toast:'+msg)},
  window:{NERV_MOBILE:{open(...args){links.push(args)}}},
  callNative:async(kind,payload)=>{records.push({kind,payload:JSON.parse(JSON.stringify(payload))});
    if(ctx.failBackup&&kind==='backupState')return {error:'backup refused'};
    if(ctx.failPersist&&kind==='persist')return {error:'persist refused'};
    return {ok:true};},
  failBackup:false,failPersist:false
 };
 function $(id){return e(id);}
 e('alertReview').querySelector=selector=>selector==='.staff-reset-note'?e('resetNote'):null;
 vm.createContext(ctx);vm.runInContext(code,ctx);
 return {ctx,e,events,records,links};
}
async function blockedNormalClear(){
 const {ctx,e,records}=setup();
 ctx.openAlertReview('alert');
 assert.equal(e('alertClear').disabled,false,'base starts enabled, wrappers block regular mode');
 await ctx.clearTerminalAlert();
 assert.equal(records.length,0,'programmatic full reset cannot bypass technical authorizations');
 assert.equal(ctx.S.defense.status,'defeat');assert.equal(ctx.S.world.magiOps.active.stage,'validated');
 assert.match(e('alertReviewDescription').textContent,/復旧承認/);
}
async function confirmedCaseOnly(){
 const {ctx,e,records,links}=setup();
 const before=JSON.stringify(ctx.S);
 ctx.openAlertReview('end');
 assert.equal(e('alertClear').disabled,false);
 assert.match(e('alertClear').textContent,/作戦のみ終了/);
 assert.match(e('alertReviewDescription').textContent,/未処理/);
 assert.match(e('resetNote').textContent,/保守/);
 assert.match(e('alertTarget').textContent,/MAGI保守盤/);
 let stopped=false;const event={preventDefault(){},stopImmediatePropagation(){stopped=true}};
 e('alertTarget').listeners[0](event);
 assert.ok(stopped);assert.deepEqual(links[0],['magi','maintenance'],
  'a dominant CITY-DAMAGE alert must lead to the real MAGI maintenance panel');
 ctx.openAlertReview('end');
 await ctx.clearTerminalAlert();
 assert.equal(ctx.S.defense.status,'idle');
 assert.equal(ctx.S.defense.enemy,null);
 assert.deepEqual(ctx.S.defense.city.map(x=>x.hp),[100,96,69,100],'repairs do not magically occur');
 assert.equal(ctx.S.defense.energy,23,'resource use remains accountable');
 assert.equal(ctx.S.infra.power,false,'interrupted operation is not pretend infrastructure restoration');
 assert.equal(ctx.S.infra.comms,false);
 assert.equal(ctx.S.world.magiOps.active.stage,'validated','MAGI fault not forged as approved');
 assert.equal(ctx.S.world.communications[0].id,'keep');
 assert.equal(ctx.S.commandV3.events[0].id,'evt-original');
 assert.ok(ctx.S.evas.every(x=>x.state==='HANGAR'&&x.power===300));
 assert.equal(ctx.S.evas[1].damage.torso,40,'pilot/EVA injury does not disappear');
 assert.equal(ctx.S.mission.phase,0);
 assert.deepEqual(records.map(x=>x.kind),['backupState','persist']);
 assert.equal(JSON.stringify(records[0].payload.state),before,'backup must be original before mutation');
 assert.match(e('alertClear').textContent,/作戦のみ終了/);
}
async function saveFailures(){
 for(const k of ['failBackup','failPersist']){
  const {ctx,records}=setup();ctx.openAlertReview('end');const original=JSON.stringify(ctx.S);ctx[k]=true;
  await ctx.clearTerminalAlert();
  assert.equal(JSON.stringify(ctx.S),original,'no in-memory damage after failed '+k);
  assert.equal(records[0].kind,'backupState');
  if(k==='failBackup')assert.equal(records.length,1,'persist cannot happen after backup fails');
 }
}
async function fullRecoveryWithoutBlockers(){
 const {ctx,e}=setup(false);
 ctx.openAlertReview('end');
 assert.match(e('alertClear').textContent,/正常待機/);
 await ctx.clearTerminalAlert();
 assert.equal(ctx.S.defense.status,'idle');
 assert.ok(ctx.S.defense.city.every(x=>x.hp===100));
 assert.equal(ctx.S.infra.power,true);assert.equal(ctx.S.infra.comms,true);
}
(async()=>{
 await blockedNormalClear();await confirmedCaseOnly();await saveFailures();await fullRecoveryWithoutBlockers();
 for(const name of ['world-workflow','v214-security-ui','v215-operations-ui']){
  const s=fs.readFileSync('src/browser/'+name+'.js','utf8');
  assert.match(s,/if\(mode==='end'\)return/,'wrapper must not block case-only end: '+name);
 }
 assert.match(fs.readFileSync('src/styles/v310-operation-surface.css','utf8'),/#shell #commandAlert\[data-level="critical"\]/);
 console.log('PASS v3.1.2 fault-aware end: actionable MAGI route, actual backup, rollback, outstanding fault preservation, full-reset authorization');
})().catch(e=>{console.error(e.stack);process.exitCode=1});
