'use strict';
// v3.2.1 contract: real state, single alert, no duplicated staff rail or battle task tabs.
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const cfg=JSON.parse(read('src/build.json'));
assert.equal(cfg.version,'3.2.3');
const ops=read('src/browser/v310-operation-surface.js');
const alert=read('src/browser/v315-operator-ui.js');
const rail=read('src/browser/v231-unified-workstation.js');
const task=read('src/browser/v232-five-station.js');
const css=read('src/styles/v310-operation-surface.css');
assert(ops.includes('id="v320Pattern" type="button"')||ops.includes('id="v320Pattern" type="button"'));
assert(ops.includes("if(b.id==='v320Pattern'){openAlertReview('alert');return;}"));
assert(ops.includes("openAlertReview('end')"),'manual restore dialog must be retained');
assert(ops.includes("const alarm=typeof terminalAlert"),'real alert is read from actual state');
assert(ops.includes("vote=S.magi?.vote")&&ops.includes("Array.isArray(vote?.votes)"));
assert(ops.includes("Number(vote?.eva)===Number(p.unit)"),'do not show another EVA vote');
assert(ops.includes('現在の承認とは限りません'),'stored vote must not be advertised as live authorization');
assert(ops.includes('v321MagiTrio')&&css.includes('.v321-magi-trio'));
assert(alert.includes("const hasOperationRail=currentPage==='battle'"));
assert(alert.includes('strip.hidden=!display||hasOperationRail'),'single alert within operations');
assert(rail.includes('bar.remove()'),'physically remove duplicate old bar');
assert(task.includes("page==='battle')continue"),'no duplicate battle navigation generated');
assert(ops.includes("dispatch(kernel,'city.shutter.execute'"));
assert(ops.includes("dispatch(kernel,'analysis.request'"));
assert(ops.includes('caption.after(ribbon)'),'real communication strip retained');
for(const p of ['src/browser/v219-console-engine.js','src/browser/v314-alert-workflow.js',
 'src/browser/v315-operator-ui.js'])assert(cfg.browser_modules.includes(p),p);
console.log('PASS v3.2.1 single-operation status, actionable real alert, stored MAGI vote, safe commands');
