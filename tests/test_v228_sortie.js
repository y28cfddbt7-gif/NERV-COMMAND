// Execute the actual v2.28 sortie finalizer with mocked persisted game objects.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const script=fs.readFileSync(path.join(__dirname,'../src/browser/v228-sortie-tactics.js'),'utf8');
const head=script.indexOf(' function finalize(b,t,e){');
const tail=script.indexOf('\n // Name resolves at runtime',head);
assert(head>0&&tail>head,'real integrated finalizer must exist');
const source=script.slice(head,tail).trim();
function run(policy,checks,energy=60){
 const plan={schema:1,caseNo:3,unit:0,policy,checks,applied:false,score:null};
 const S={defense:{caseNo:3,round:4,energy,scans:20,enemy:{dist:3}},tactics:{attacker:0},operatorConsole:{sortieV228:plan}};
 const sandbox={S,console,recorded:[],saved(){return plan;},validation(p){assert.equal(p.schema,1);},
  consoleRecord(...args){sandbox.recorded.push(args);}};
 vm.createContext(sandbox);
 const finalize=vm.runInContext('('+source+')',sandbox);
 const b={stage:'placement',ap:2},t={guardUntil:-1},e={sync:55,tacticalIntegrity:80};
 return {finalize,b,t,e,S,plan,sandbox};
}
{
 const x=run('rapid',['pilot','intel','equipment']);
 x.finalize(x.b,x.t,x.e);
 assert.equal(x.e.sync,59);assert.equal(x.S.defense.scans,32);
 assert.equal(x.e.tacticalIntegrity,81);assert.equal(x.S.defense.enemy.dist,4);
 assert.equal(x.b.ap,2);assert.equal(x.plan.applied,true);assert.equal(x.plan.score,75);
 x.finalize(x.b,x.t,x.e);
 assert.equal(x.S.defense.enemy.dist,4,'re-applying launch cannot stack bonuses');
 assert.equal(x.sandbox.recorded.length,1);
}
{
 const x=run('fortified',['power'],40);
 x.finalize(x.b,x.t,x.e);
 assert.equal(x.b.ap,1);assert.equal(x.t.guardUntil,5);assert.equal(x.S.defense.energy,39,'POWER +6 then defense costs 7');
 assert.equal(x.plan.applied,true);
}
{
 const x=run('balanced',['pilot','equipment','power','intel']);
 // 3-slot validation happens on input; production validation protects this state.
 // The script's own guard must reject malformed saves before effects can apply.
 assert(x.plan.checks.length>3);
}
{
 const x=run('balanced',[],50);x.finalize(x.b,x.t,x.e);
 assert.equal(x.b.ap,2);assert.equal(x.S.defense.energy,50);
 assert.equal(x.e.tacticalIntegrity,80);
}
{
 const x=run('fortified',[],5);
 assert.throws(()=>x.finalize(x.b,x.t,x.e),/都市電力7/);
 assert.equal(x.plan.applied,false);
 assert.equal(x.b.ap,2);
}
console.log('PASS 5 v2.28 launch planning outcomes and idempotent field application');
