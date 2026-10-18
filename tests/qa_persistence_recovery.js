// Native Scriptable recovery uses the delivered full export and synthetic local files only.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const version=require('../src/build.json').version.replaceAll('.','_'),code=fs.readFileSync(__dirname+'/../NERV_COMMAND_v'+version+'_SCRIPTABLE.js','utf8');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const statePath='/mock/nerv_command_v2_state.json',goodPath='/mock/nerv_command_v2_state_last_good.json',worldPath='/mock/nerv_command_v2_state_before_world.json';
async function run({raw,good,jobs=[],quarantineFailure=false,partialFailure=false}){
 const files=new Map();if(raw!==undefined)files.set(statePath,raw);if(good!==undefined)files.set(goodPath,good);let html,completed=0,posted=false,failed=false,finish;const deliveries=[];const done=new Promise(r=>finish=r);
 const fm={libraryDirectory:()=>'/mock',joinPath:(a,b)=>a+'/'+b,fileExists:p=>files.has(p),readString:p=>files.get(p),copy:(a,b)=>{assert(!files.has(b));if(quarantineFailure&&b.includes('corrupt_'))throw Error('backup-failed');files.set(b,files.get(a));},writeString:(p,s)=>{if(partialFailure&&!failed&&p===statePath){failed=true;files.set(p,'{partial');throw Error('partial-write');}files.set(p,s);}};
 class WebView{async loadHTML(value){html=value;}async evaluateJavaScript(source){if(source.includes('__nervQueue')){if(posted)return [];posted=true;return jobs;}const m=source.match(/window\.__nervDeliver\((\d+),([\s\S]*)\);$/);assert(m);deliveries.push({id:Number(m[1]),result:JSON.parse(m[2])});if(deliveries.length===jobs.length)finish();return null;}async present(){if(jobs.length)await done;}}
 const script=new AsyncFunction('FileManager','Device','config','Script','WebView','console',code);
 await script({local:()=>fm},{batteryLevel:()=>.5,isCharging:()=>false},{runsInWidget:false},{complete:()=>completed++},WebView,{warn(){}});await Promise.resolve();
 const match=html.match(/window\.__BOOT__=([\s\S]*?);<\/script>/);assert(match);assert.equal(completed,1);return {files,boot:JSON.parse(match[1]),deliveries};
}
(async()=>{
 const old={tasks:[{id:'retained',text:'saved',done:false}],future:{keep:5}},rawGood=JSON.stringify(old);
 let r=await run({raw:'{broken-json',good:rawGood});assert.deepEqual(r.boot.state,old);assert.equal(r.boot.recovery.source,'last-good');assert([...r.files].some(([p,v])=>p.includes('corrupt_')&&v==='{broken-json'));console.log('PASS native invalid JSON quarantined and last good state recovered');
 for(const invalid of ['[]','42','null']){r=await run({raw:invalid,good:rawGood});assert.deepEqual(r.boot.state,old);assert([...r.files].some(([p,v])=>p.includes('corrupt_')&&v===invalid));}console.log('PASS native wrong-root saves preserved before fallback');
 r=await run({raw:'{bad',quarantineFailure:true,jobs:[{id:1,action:'persist',payload:{state:old}}]});assert(r.boot.recovery.blocked);assert.equal(r.files.get(statePath),'{bad');assert(r.deliveries[0].result.error);console.log('PASS failed quarantine blocks native overwrite');
 const next={...old,world:{schema:1,tick:3}};r=await run({raw:rawGood,jobs:[{id:1,action:'persist',payload:{state:next}}]});assert.equal(r.files.get(goodPath),rawGood);assert.deepEqual(JSON.parse(r.files.get(statePath)),next);assert(r.deliveries[0].result.ok);console.log('PASS native successful write retains a last-good copy');
 r=await run({raw:rawGood,partialFailure:true,jobs:[{id:1,action:'persist',payload:{state:next}}]});assert.equal(r.files.get(statePath),rawGood);assert.equal(r.files.get(goodPath),rawGood);assert(r.deliveries[0].result.error);console.log('PASS partial native write rolls back to preserved prior save');
 r=await run({raw:rawGood,jobs:[{id:1,action:'backupWorld',payload:{state:old}},{id:2,action:'backupWorld',payload:{state:next}},{id:3,action:'backupWorld',payload:{state:next,quarantine:true}},{id:4,action:'backupWorld',payload:{state:old,quarantine:true}}]});assert.equal(r.files.get(worldPath),rawGood);assert.equal([...r.files.keys()].filter(p=>p.includes('.repair-')).length,2);assert(r.deliveries.every(d=>d.result.ok));console.log('PASS world migration backup never overwrites and repair quarantines remain separate');
})().catch(e=>{console.error(e);process.exitCode=1;});
