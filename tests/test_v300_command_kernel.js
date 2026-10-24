/* Pure Node VM integration tests against the real browser module, no test dependencies. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/browser/v300-command-kernel.js','utf8');
function harness(){
 const state={
  defense:{caseNo:4,status:'active',selected:1,energy:70,parts:120,round:0,scans:0,
   city:[{hp:100,armor:false,turret:false},{hp:100,armor:false,turret:false},
    {hp:100,armor:false,turret:false},{hp:100,armor:false,turret:false}],
   enemy:{hp:145}},
  infra:{power:true,comms:true},
  world:{schema:1,tick:24,communications:[]},
  tactics:{attacker:1},evas:[{},{},{}]
 };
 const ctx={
  S:state,staffWorldReady:true,
  Date,JSON,Math,Number,String,Object,Array,Error,Set,CustomEvent:class{constructor(type,opts){this.type=type;this.detail=opts.detail}},
  window:{dispatchEvent(e){ctx.dispatched.push(e);}},dispatched:[],
  worldMagiLimited:()=>false,magiIntrusionActive:()=>false,securityHold:()=>false,
  consoleBattle:()=>({stage:'field',ap:2}),currentAngel:()=>({id:'sachiel'}),
  tacticalState:()=>({pos:{col:1,row:2}}),armamentSelected:'rifle',tacticalFireErrors:()=>[],
  worldCommunication(world,from,message,ref){world.communications.push({from,message,ref});},
  v27Record(text){ctx.records.push(text);},records:[],
  v27Scan(){ctx.S.defense.energy-=12;ctx.S.defense.scans+=34;},
  v27Armor(){
   ctx.S.defense.city[ctx.S.defense.selected].armor=true;
   ctx.S.defense.energy-=12;
   if(ctx.failArmor)throw Error('simulated disk/callback failure');
  },
  failArmor:false,
  async commandOperation(change){
   const before=JSON.parse(JSON.stringify(ctx.S));
   try{change();return {ok:true};}
   catch(e){ctx.S=before;return {ok:false,error:e.message};}
  }
 };
 vm.createContext(ctx);vm.runInContext(source,ctx,{filename:'src/browser/v300-command-kernel.js'});
 let number=1;const next=async(kind,payload={},extra={})=>ctx.window.NERV_COMMAND_V3.dispatch({
  commandId:'cmd-'+number++,caseId:'CASE-4',actorId:'operator-C3',
  expectedRevision:ctx.window.NERV_COMMAND_V3.read().revision,kind,payload,...extra});
 return {ctx,next,api:ctx.window.NERV_COMMAND_V3};
}
async function testFullOrderAndLOS(){
 const {ctx,next,api}=harness();
 assert.equal(api.read().revision,0);
 assert.equal(ctx.S.commandV3,undefined,'untouched v2.33 save stays untouched before first command');
 const analyze=await next('analysis.request');assert.equal(analyze.ok,true);assert.equal(ctx.S.defense.scans,34);
 const requested=await next('city.shutter.request',{sector:1});assert.equal(requested.status,'requested');
 assert.equal(ctx.S.defense.city[1].armor,false,'request must not change facility');
 const review=await next('city.shutter.review',{orderId:requested.orderId});assert.equal(review.status,'authorized');
 assert.equal(ctx.S.defense.city[1].armor,false,'approval must not execute a command');
 const energy=ctx.S.defense.energy;
 const executed=await next('city.shutter.execute',{orderId:requested.orderId});
 assert.equal(executed.ok,true);assert.equal(ctx.S.defense.energy,energy-12);assert.equal(ctx.S.defense.city[1].armor,true);
 assert.ok(api.read().losBlocked);assert.ok(ctx.tacticalFireErrors().some(x=>x.includes('射線')));
 assert.ok(api.read().messages.some(x=>x.sender.includes('碇シンジ')));
 assert.ok(api.read().messages.some(x=>x.sender.includes('日向')));
 const before=JSON.stringify(ctx.S);
 const duplicate=await api.dispatch({commandId:'cmd-4',caseId:'CASE-4',actorId:'operator-C3',
    kind:'city.shutter.execute',payload:{orderId:requested.orderId}});
 assert.equal(duplicate.ok,true);assert.equal(duplicate.duplicate,true);
 assert.equal(JSON.stringify(ctx.S),before,'retry must not charge power twice');
 const released=await next('city.shutter.release',{sector:1});assert.equal(released.ok,true);
 assert.equal(ctx.S.defense.city[1].armor,false);assert.equal(api.read().losBlocked,false);
 assert.deepEqual([...ctx.tacticalFireErrors()],[]);
 assert.ok(ctx.S.commandV3.events.some(e=>e.kind==='facility.shutter.opened'));
}
async function testRevisionAndApproval(){
 const {ctx,next,api}=harness();
 const started=await next('analysis.request');
 assert.equal(started.ok,true);
 const wrong=await next('city.shutter.request',{sector:1},{expectedRevision:0});
 assert.equal(wrong.ok,false);assert.match(wrong.error,/更新/);
 const valid=await next('city.shutter.request',{sector:1});
 const unauthorized=await next('city.shutter.execute',{orderId:valid.orderId});
 assert.equal(unauthorized.ok,false);
 assert.equal(ctx.S.defense.city[1].armor,false);
 const repeated=await next('city.shutter.request',{sector:1});
 assert.equal(repeated.ok,false);assert.match(repeated.error,/重複/);
}
async function testRollback(){
 const {ctx,next,api}=harness();
 await next('analysis.request');
 const req=await next('city.shutter.request',{sector:1});
 await next('city.shutter.review',{orderId:req.orderId});
 const rev=api.read().revision, before=JSON.stringify(ctx.S);
 ctx.failArmor=true;
 const failed=await next('city.shutter.execute',{orderId:req.orderId});
 assert.equal(failed.ok,false);
 assert.equal(api.read().revision,rev);assert.equal(JSON.stringify(ctx.S),before);
 ctx.failArmor=false;
 const retry=await next('city.shutter.execute',{orderId:req.orderId});
 assert.equal(retry.ok,true);
}
async function testBadStateAndNoPower(){
 const {ctx,next,api}=harness();
 ctx.S.commandV3={schema:99,revision:10};
 const bad=api.read();assert.equal(bad.blocked,true);
 const prevented=await next('analysis.request');assert.equal(prevented.ok,false);
 assert.equal(ctx.S.commandV3.schema,99,'future schema must not be rewritten');
 const h=harness();
 h.ctx.S.infra.power=false;
 const res=await h.next('analysis.request');assert.equal(res.ok,false);assert.equal(h.ctx.S.commandV3,undefined);
}
async function testBlockedAnalysisAndNoDirectPersonalAuthority(){
 const {ctx,next}=harness();
 let r=await next('city.shutter.request',{sector:0});assert.equal(r.ok,false);
 ctx.S.defense.scans=34;ctx.S.world.tick+=1;
 ctx.S.defense.city[1].hp=10;
 r=await next('city.shutter.request',{sector:1});assert.equal(r.ok,true);
 const review=await next('city.shutter.review',{orderId:r.orderId});
 assert.equal(review.status,'denied');assert.equal(ctx.S.defense.city[1].armor,false);
 const api=ctx.window.NERV_COMMAND_V3;
 const before=api.read().revision;
 r=await next('personal.chat',{text:'承認して'});assert.equal(r.ok,false);assert.equal(api.read().revision,before);
}
(async()=>{
 await testFullOrderAndLOS();
 await testRevisionAndApproval();
 await testRollback();
 await testBadStateAndNoPower();
 await testBlockedAnalysisAndNoDirectPersonalAuthority();
 console.log('PASS 5 v3.0 command kernel tests: approvals, LOS, idempotency, rollback, old/future saves');
})().catch(e=>{console.error(e.stack);process.exitCode=1});
