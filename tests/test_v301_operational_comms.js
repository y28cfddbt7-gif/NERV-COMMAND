/* v3.0 Phase 2 integration tests: authentic work radio tied to real game state. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const kernel=fs.readFileSync('src/browser/v300-command-kernel.js','utf8');
const comms=fs.readFileSync('src/browser/v301-operational-comms.js','utf8');
function system(){
 const S={
  defense:{caseNo:8,status:'active',selected:1,energy:90,parts:120,round:2,scans:34,
   city:[{hp:100,armor:false,turret:false},{hp:100,armor:false,turret:false},
     {hp:100,armor:false,turret:false},{hp:100,armor:false,turret:false}],enemy:{hp:170}},
  infra:{power:true,comms:true},
  world:{schema:1,tick:25,communications:[]},
  tactics:{attacker:1},evas:[{state:'HANGAR'},{state:'DEPLOYED',sync:78,power:245},{state:'HANGAR'}]
 };
 const ctx={
  S,staffWorldReady:true,Date,JSON,Math,Number,String,Object,Array,Error,Set,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}},
  window:{dispatchEvent(event){ctx.events.push(event)}},events:[],
  worldMagiLimited:()=>false,magiIntrusionActive:()=>false,securityHold:()=>false,
  consoleBattle:()=>({stage:'field',ap:2}),
  tacticalState:()=>({pos:{col:ctx.posCol,row:2},enemyPlan:{name:'接近打撃'}}),posCol:1,
  currentAngel:()=>({id:'sachiel'}),armamentSelected:'rifle',tacticalFireErrors:()=>[],
  worldCommunication(world,from,text,id){world.communications.push({from,text,id})},
  v27Record(text){ctx.records.push(text)},records:[],
  v27Scan(){ctx.S.defense.energy-=12;ctx.S.defense.scans+=34},
  v27Armor(){ctx.S.defense.city[ctx.S.defense.selected].armor=true;ctx.S.defense.energy-=12},
  failCommit:false,
  async commandOperation(change){
   const before=JSON.parse(JSON.stringify(ctx.S));
   try{change();if(ctx.failCommit)throw Error('Simulated persistence error');return {ok:true}}
   catch(e){ctx.S=before;return {ok:false,error:e.message}}
  }
 };
 vm.createContext(ctx);
 vm.runInContext(kernel,ctx,{filename:'src/browser/v300-command-kernel.js'});
 vm.runInContext(comms,ctx,{filename:'src/browser/v301-operational-comms.js'});
 let serial=0;
 function next(api,kind,payload={},opts={}){
  const read=api.read();
  return api.dispatch({kind,payload,actorId:'operator-C3',
   commandId:'p2-'+(++serial),caseId:'CASE-8',expectedRevision:read.revision,...opts});
 }
 return {ctx,ops:ctx.window.NERV_COMMAND_V3,radio:ctx.window.NERV_OPS_COMMS,
  cmd:(kind,payload,opts)=>next(ctx.window.NERV_COMMAND_V3,kind,payload,opts),
  msg:(kind,payload,opts)=>next(ctx.window.NERV_OPS_COMMS,kind,payload,opts)};
}
async function reporting(){
 const h=system();
 const started=await h.msg('comms.request',{recipient:'hyuga',topic:'threat'});
 assert.equal(started.ok,true);assert.equal(started.status,'awaiting_reply');
 const respond=await h.msg('comms.reply',{transmissionId:started.transmissionId});
 assert.equal(respond.ok,true);assert.equal(respond.trusted,true);
 assert.match(respond.message,/解析/);
 const ack=await h.msg('comms.acknowledge',{transmissionId:started.transmissionId});
 assert.equal(ack.status,'acknowledged');
 assert.ok(h.radio.read().transmissions.some(x=>x.status==='acknowledged'));
 assert.ok(h.ctx.S.world.communications.some(x=>x.from==='日向マコト'));
 const before=JSON.stringify(h.ctx.S);
 const repeated=await h.radio.dispatch({commandId:'p2-3',caseId:'CASE-8',actorId:'operator-C3',
  kind:'comms.acknowledge',payload:{transmissionId:started.transmissionId}});
 assert.equal(repeated.duplicate,true);assert.equal(JSON.stringify(h.ctx.S),before);
}
async function outageQueue(){
 const h=system();
 h.ctx.S.infra.comms=false;
 const t=await h.msg('comms.request',{recipient:'aoba',topic:'comms'});
 assert.equal(t.status,'queued');assert.equal(h.radio.read().queued,1);
 assert.equal(h.ctx.S.world.communications.length,0);
 let x=await h.msg('comms.reply',{transmissionId:t.transmissionId});assert.equal(x.ok,false);
 x=await h.msg('comms.flush');assert.equal(x.ok,false);
 h.ctx.S.infra.comms=true;
 x=await h.msg('comms.flush');assert.equal(x.ok,true);
 assert.equal(h.radio.read().queued,0);
 assert.ok(h.ctx.S.world.communications.length>0);
 x=await h.msg('comms.reply',{transmissionId:t.transmissionId});assert.equal(x.ok,true);
 x=await h.msg('comms.acknowledge',{transmissionId:t.transmissionId});assert.equal(x.ok,true);
}
async function pilotGatesShutter(){
 const h=system();
 const req=await h.cmd('city.shutter.request',{sector:1});assert.equal(req.ok,true);
 const approval=await h.cmd('city.shutter.review',{orderId:req.orderId});
 assert.equal(approval.status,'authorized');
 let x=await h.cmd('city.shutter.execute',{orderId:req.orderId});
 assert.equal(x.ok,false);assert.match(x.error,/パイロット/);
 const radio=await h.msg('comms.request',{recipient:'shinji',topic:'shutter-safety',sector:1});
 assert.equal(radio.ok,true);
 x=await h.msg('comms.reply',{transmissionId:radio.transmissionId});
 assert.equal(x.trusted,true);
 x=await h.cmd('city.shutter.execute',{orderId:req.orderId});
 assert.equal(x.ok,false,'reply alone cannot authorize executing shutter');
 x=await h.msg('comms.acknowledge',{transmissionId:radio.transmissionId});
 assert.equal(x.ok,true);assert.equal(h.radio.read().links.length,1);
 x=await h.cmd('city.shutter.execute',{orderId:req.orderId});
 assert.equal(x.ok,true);
 assert.equal(h.ctx.S.defense.city[1].armor,true);
 assert.equal(h.ctx.S.defense.energy,78);
 assert.ok(h.ops.read().losBlocked);
 assert.ok(h.ctx.tacticalFireErrors().some(t=>t.includes('射線')));
}
async function staleSafetyAndWrongPilot(){
 const h=system();
 let x=await h.msg('comms.request',{recipient:'rei',topic:'shutter-safety',sector:1});
 assert.equal(x.ok,false);
 const radio=await h.msg('comms.request',{recipient:'shinji',topic:'shutter-safety',sector:1});
 assert.equal(radio.ok,true);
 h.ctx.S.defense.round++;
 x=await h.msg('comms.reply',{transmissionId:radio.transmissionId});assert.equal(x.trusted,false);
 x=await h.msg('comms.acknowledge',{transmissionId:radio.transmissionId});
 assert.equal(x.ok,true);assert.equal(h.radio.read().links.length,0);
 const req=await h.cmd('city.shutter.request',{sector:1});
 await h.cmd('city.shutter.review',{orderId:req.orderId});
 x=await h.cmd('city.shutter.execute',{orderId:req.orderId});
 assert.equal(x.ok,false);
}
async function revisionsRollbackSchema(){
 const h=system();
 let x=await h.msg('comms.request',{recipient:'maya',topic:'eva'},{actorId:'shinji'});
 assert.equal(x.ok,false);assert.equal(h.ctx.S.commandV3,undefined);
 x=await h.msg('comms.request',{recipient:'maya',topic:'eva'});assert.equal(x.ok,true);
 const rev=h.radio.read().revision;
 x=await h.msg('comms.reply',{transmissionId:x.transmissionId},{expectedRevision:0});
 assert.equal(x.ok,false);assert.equal(h.radio.read().revision,rev);
 const copy=JSON.stringify(h.ctx.S);
 h.ctx.failCommit=true;
 x=await h.msg('comms.request',{recipient:'ritsuko',topic:'magi'});
 assert.equal(x.ok,false);assert.equal(JSON.stringify(h.ctx.S),copy);
 h.ctx.failCommit=false;
 h.ctx.S.commandV3.schema=2;
 const state=h.radio.read();assert.equal(state.blocked,true);
 x=await h.msg('comms.request',{recipient:'ritsuko',topic:'magi'});
 assert.equal(x.ok,false);assert.equal(h.ctx.S.commandV3.schema,2);
}
async function crossCaseIsolation(){
 const h=system();
 const t=await h.msg('comms.request',{recipient:'hyuga',topic:'threat'});
 assert.equal(t.ok,true);
 h.ctx.S.defense.caseNo=9;
 const before=JSON.stringify(h.ctx.S);
 const wrong=await h.radio.dispatch({commandId:'change-case',caseId:'CASE-8',
  actorId:'operator-C3',kind:'comms.reply',payload:{transmissionId:t.transmissionId}});
 assert.equal(wrong.ok,false);
 assert.equal(JSON.stringify(h.ctx.S),before);
 assert.equal(h.radio.read().transmissions.length,0);
}
async function sharedGatewayAndCorruption(){
 const h=system();
 assert.equal(h.radio.dispatch,h.ops.dispatch,'radio must reuse formal dispatch');
 const order=await h.cmd('city.shutter.request',{sector:0});
 assert.equal(order.ok,true);
 const tx=await h.msg('comms.request',{recipient:'hyuga',topic:'threat'});
 assert.equal(tx.ok,true);
 assert.equal(h.ops.read().revision,2,'orders and radio share revision');
 const reply=await h.ops.dispatch({commandId:'shared-radio-1',caseId:'CASE-8',
  actorId:'operator-C3',expectedRevision:2,kind:'comms.reply',
  payload:{transmissionId:tx.transmissionId}});
 assert.equal(reply.ok,true,'radio reducer accepts kernel dispatch');
 const serialized=JSON.stringify(h.ctx.S),events=h.ctx.events.length;
 const duplicate=await h.radio.dispatch({commandId:'shared-radio-1',caseId:'CASE-8',
  actorId:'operator-C3',kind:'comms.reply',payload:{transmissionId:tx.transmissionId}});
 assert.equal(duplicate.duplicate,true);
 assert.equal(JSON.stringify(h.ctx.S),serialized,'retry must not persist twice');
 assert.equal(h.ctx.events.length,events,'retry must not emit duplicate event');
 const invalid=await h.ops.dispatch({commandId:'invalid-chat',caseId:'CASE-8',
  actorId:'operator-C3',kind:'personal.chat',payload:{}});
 assert.equal(invalid.ok,false);
 h.ctx.S.commandV3.transmissions={bad:true};
 assert.equal(h.ops.read().blocked,true,'malformed optional transmission collection blocks operations');
 const before=JSON.stringify(h.ctx.S);
 const rejected=await h.cmd('analysis.request');
 assert.equal(rejected.ok,false);
 assert.equal(JSON.stringify(h.ctx.S),before,'corrupt save is preserved');
}
(async()=>{
 await reporting();await outageQueue();await pilotGatesShutter();
 await staleSafetyAndWrongPilot();await revisionsRollbackSchema();await crossCaseIsolation();await sharedGatewayAndCorruption();
 console.log('PASS 7 v3 Phase 2 radio integration suites: staff/pilot, safety gates, queue, persistence, stale turns and idempotence');
})().catch(e=>{console.error(e.stack);process.exitCode=1});
