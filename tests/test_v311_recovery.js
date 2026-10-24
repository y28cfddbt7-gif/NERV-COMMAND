/* v3.1.1 regression: 100% CITY health does not disable safe CASE recovery. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync('src/browser/staff-recovery.js','utf8');
const v310=fs.readFileSync('src/browser/v310-operation-surface.js','utf8');
const ctx={JSON,Number,Error,Date,
 hhmmss:()=> '15:30:00',
 recoveryBusy:false,alertReturnFocus:null,document:{activeElement:{isConnected:true,focus(){}}},
 terminalAlert:()=>({title:'正常待機へ復帰',message:'すべての端末系統を復旧します'}),
 texts:{},meteoText(id,txt){ctx.texts[id]=txt},
 elems: {
  alertReview:{classList:{remove(){ctx.dialogOpened=true}}},
  alertContinue:{focus(){ctx.focused=true}}
 },
 $:id=>ctx.elems[id],
 dialogOpened:false,focused:false
};
vm.createContext(ctx);vm.runInContext(code,ctx,{filename:'staff-recovery.js'});
function state(status,hp){
 return {
  infra:{power:false,comms:false,armor:true},
  evas:[0,1,2].map(i=>({state:i===1?'POWER_LOST':'DEPLOYED',power:13,at:true,umbilical:false})),
  magi:{approvedFor:1,vote:{yes:true},interceptApproval:{ok:true}},
  mission:{phase:5},
  ops:{currentMissionLocks:12,missionAwarded:true},
  tactics:{charge:100,heat:45,scans:4},
  defense:{status,enemy:{hp:0},round:14,scans:100,breach:67,energy:15,security:42,connected:true,
    shutdown:true,magivote:[true,true,false],magiround:12,alert:true,usedV27Shot:true,last:'战',
    city:[{hp,armor:true},{hp,armor:true},{hp,armor:true},{hp,armor:true}]},
  logs:{infra:[],eva:[],magi:[],mission:[]},
  commandV3:{schema:1,revision:2,events:[{id:'old-event'}]}
 };
}
for(const status of ['active','defeat','victory','idle']){
 const before=state(status,100),orig=JSON.stringify(before);
 const next=ctx.recoveredStaffState(before);
 assert.equal(next.defense.status,'idle');
 assert.equal(next.defense.energy,100);
 assert.equal(next.defense.city.reduce((a,c)=>a+c.hp,0)/4,100);
 assert.equal(next.infra.power,true);assert.equal(next.infra.comms,true);
 assert.ok(next.evas.every(e=>e.state==='HANGAR'&&e.power===300));
 assert.equal(JSON.stringify(before),orig,'source save must stay unchanged before persist');
 assert.equal(next.commandV3.schema,1);
 assert.equal(next.commandV3.events[0].id,'old-event');
}
ctx.openAlertReview('end');
assert.equal(ctx.dialogOpened,true);
assert.equal(ctx.focused,true);
assert.equal(ctx.texts.alertReviewTitle,'作戦終了の確認');
assert.match(ctx.texts.alertReviewDescription,/作戦を終了/);
assert.ok(v310.includes("id=\\"v310Recovery\\""));
assert.ok(v310.includes("openAlertReview('end')"));
assert.ok(!v310.includes("recoveredStaffState(S)"),'UI may only open modal');
assert.ok(v310.includes("totalHealth===100?' / 施設修復不要"));
console.log('PASS v3.1.1 100% integrity repair/recovery distinction, modal confirmation and rollback-friendly reset');
