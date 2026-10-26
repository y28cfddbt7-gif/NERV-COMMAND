'use strict';
// v4.0.4 regression: bundled application must never enter v3.1.5
// monkeypatched draw() adapter that blocked WKWebView ahead of clean v4 screen.
const assert=require('node:assert/strict'),fs=require('node:fs');
const cfg=JSON.parse(fs.readFileSync('src/build.json','utf8'));
const entry=cfg.browser_modules;
const stylesheet=cfg.style_modules;
const code=fs.readFileSync('src/browser/v400-command-station.js','utf8');
const diagnostics=fs.readFileSync('src/browser/boot-diagnostics.js','utf8');
assert.equal(cfg.version,'4.0.4');
assert(!entry.includes('src/browser/v315-operator-ui.js'));
assert(!stylesheet.includes('src/styles/v315-operator-ui.css'));
const target=entry.indexOf('src/browser/v400-command-station.js');
assert(target>0);
assert(entry.slice(0,target).includes('src/browser/operation-recovery.js'));
assert(entry.includes('src/browser/v301-operational-comms.js'));
assert(entry.includes('src/browser/v229-gameplay.js'));
assert(entry.includes('src/browser/v226-context-stations.js'));
assert(code.includes("root.id='v400Station'"));
assert(code.includes('consoleBattleCommand('));
assert(code.includes('window.__NERV_V400_RENDERED__=true'));
assert(code.includes('window.__NERV_V400_INIT_ERROR__'));
assert(diagnostics.includes('v400InitError='));
assert(!entry.some(x=>/v31[05]-operation-surface|v322-live-tactical-map/.test(x)));
assert(!code.includes('const priorDraw=draw'));
console.log('PASS v4.0.4: no v315 runtime/color style, no draw monkeypatch, independent v4 station and original state engines preserved');