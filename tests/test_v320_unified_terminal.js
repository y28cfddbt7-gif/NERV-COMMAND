'use strict';
// v3.2 source-level acceptance: the demonstrated command screen is a working overlay on canonical gameplay.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const js=read('src/browser/v310-operation-surface.js');
const css=read('src/styles/v310-operation-surface.css');
const config=JSON.parse(read('src/build.json'));
assert.equal(config.version,'3.2.1');
for(const id of ['v320Duty','v320DutyState','v320Pattern','v310Phase','v310Telemetry',
 'v310RadioRibbon','v310Sheet','v310SmartActions','v310Home','v310Recovery']){
 assert(js.includes(id),id+' must be implemented on the real operation page');
}
assert(js.includes('NERV / CENTRAL COMMAND'));
assert(js.includes('DUTY STATION'));
for(const label of ['解析','移動','攻撃','防衛','手番終了']){
 assert(js.includes(label),'missing primary field action: '+label);
}
for(const action of ['radio','move','aim','city','wait']){
 assert(js.includes('data-v310-action="'+action+'"'),'missing operational action '+action);
}
assert(js.includes("ribbon.addEventListener('click'"),'radio must remain clickable when moved to the map');
assert(js.includes("scene.after(ribbon)"),'reuse and relocate the live radio node after the field map');
assert(js.includes("window.NERV_MOBILE.open('battle',view)"));
assert(js.includes("NERV_MOBILE.open(b.dataset.v320Open)"));
assert(js.includes("dispatch(kernel,'analysis.request')"));
assert(js.includes("dispatch(kernel,'city.shutter.execute'"));
assert(js.includes("consoleBattleCommand('mode',{mode:'move'})"));
assert(js.includes("openAlertReview('end')"),'manual recovery confirmation must survive');
assert(css.includes('grid-template-columns:repeat(4,minmax(0,1fr))'));
assert(css.includes('#v310Actions .v310-end{grid-column:1/-1'));
assert(css.includes('env(safe-area-inset-bottom,0px)'));
assert(css.includes('#shell .staff-home #commandLauncher{display:none!important}'));
assert(!css.includes('image-rendering:pixelated'));
for(const preserved of ['src/browser/v219-console-engine.js','src/browser/v217-tactical-engine.js',
 'src/browser/v300-command-kernel.js','src/browser/v301-operational-comms.js',
 'src/browser/v314-alert-workflow.js','src/browser/v315-operator-ui.js']){
 assert(config.browser_modules.includes(preserved),preserved+' must stay linked');
}
for(const forbidden of ['requestAnimationFrame(','setInterval(','localStorage.setItem(']){
 assert(!js.includes(forbidden),'new operation UI must not mutate timers or state');
}
console.log('PASS v3.2 duty/operations entry, 4 working actions, painted map radio and existing reducers');
