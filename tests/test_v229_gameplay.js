// v2.29 executable reducer tests, extracted from actual production JS.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const js=fs.readFileSync(path.join(__dirname,'../src/browser/v229-gameplay.js'),'utf8');
function part(from,to){const a=js.indexOf(from),b=js.indexOf(to,a);assert(a>=0&&b>a,'source marker '+from);return js.slice(a,b);}
const cases=part(' const kinds=[','\n const ids=');
const incident=part(' function applyResponse(choice){','\n // Called through the current');
const planner=part(' const previousPlan=tacticalPlan;','\n function action(order,b){');
const tactic=part(' function action(order,b){','\n function kind(){');
function game({kind='power',energy=60,scans=30,integrity=80,dist=4,sync=55}={}){
 const p={schema:1,caseNo:2,unit:0,kind,status:'pending',choice:null};
 const S={defense:{status:'active',caseNo:2,round:1,energy,scans,enemy:{dist}},tactics:{attacker:0},evas:[{tacticalIntegrity:integrity,sync,at:false}]};
 const b={stage:'approval',unit:0,ap:2},t={pos:{col:1,row:2},unit:0,v229Enabled:true,enemyPlan:{columns:[1],rows:[1,2]}};
 const ctx=vm.createContext({S,get:()=>p,consoleBattle:()=>b,consoleRecord:()=>{},
 currentAngel:()=>({id:'shamshel'}),tacticalState:()=>t,tacticalReady:()=>[],
 tacticalPlan:()=>({round:S.defense.round+1,columns:[1],rows:[1,2],name:'old'}),
 v27Record:()=>{}});
 vm.runInContext(cases,ctx);
 const applyResponse=vm.runInContext('('+incident.trim()+')',ctx);
 vm.runInContext(planner,ctx);
 const tacticalAction=vm.runInContext('('+tactic.trim()+')',ctx);
 return {p,S,b,t,ctx,applyResponse,tacticalAction};
}
let x=game();x.applyResponse('reserve');assert.equal(x.S.defense.energy,50);assert.equal(x.p.status,'resolved');
assert.throws(()=>x.applyResponse('reserve'),/未処理/,'cannot apply launch costs twice');
x=game({kind:'power'});x.applyResponse('rush');assert.equal(x.S.evas[0].tacticalIntegrity,68);assert.equal(x.S.defense.enemy.dist,3);
x=game({kind:'comms'});x.applyResponse('relay');assert.equal(x.S.defense.energy,53);assert.equal(x.S.defense.scans,38);
x=game({kind:'sync'});x.applyResponse('recalibrate');assert.equal(x.S.defense.energy,48);assert.equal(x.S.evas[0].sync,63);
x=game({energy:5});assert.throws(()=>x.applyResponse('reserve'),/不足/);assert.equal(x.p.status,'pending');
x=game();x.tacticalAction('recon',{stage:'field',ap:2});assert.equal(x.S.defense.scans,48);assert.equal(x.S.defense.energy,51);
x=game();x.tacticalAction('feint',{stage:'field',ap:2});assert.equal(x.S.defense.energy,53);
assert.equal(x.t.v229Decoy.round,2);assert.equal(x.t.enemyPlan.columns[0],x.t.v229Decoy.col,'real saved enemy fire lane redirected');
x=game();x.tacticalAction('fortify',{stage:'field',ap:2});assert.equal(x.S.defense.energy,53);
assert.equal(x.S.evas[0].at,true);assert.equal(x.t.guardUntil,2);
x=game();x.tacticalAction('recon',{stage:'field',ap:2});x.S.defense.round=2;
assert.ok([0,1,2].includes(vm.runInContext('tacticalPlan',x.ctx)(x.t).columns[0]),'new turn plan valid lane');
console.log('PASS 9 v2.29 real game simulation assertions: incident gates, resource costs, enemy targeting, defense');
