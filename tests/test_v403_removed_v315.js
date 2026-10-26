'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const cfg=JSON.parse(fs.readFileSync('src/build.json','utf8'));
const app=fs.readFileSync('src/browser/v400-command-station.js','utf8');
const boot=fs.readFileSync('src/browser/boot-diagnostics.js','utf8');
const css=fs.readFileSync('src/styles/v400-command-station.css','utf8');
assert.equal(cfg.version,'4.0.3');
assert(!cfg.browser_modules.includes('src/browser/v315-operator-ui.js'),
 'known v315 boot blocker must not be executed by Scriptable or browser');
assert(!cfg.style_modules.includes('src/styles/v315-operator-ui.css'),
 'removed legacy DOM bindings cannot remain in the live style manifest');
const index=cfg.browser_modules.indexOf('src/browser/v400-command-station.js');
assert(index>=0);
assert.equal(cfg.browser_modules[index-1],'src/browser/v314-alert-workflow.js',
 'real alert recovery remains immediately before the standalone v4 screen');
assert.equal(cfg.browser_modules[index+1],'src/browser/v214-route-close.js',
 'routing is still closed after the standalone UI');
assert(!cfg.browser_modules.some(x=>x.includes('v310-operation-surface')));
assert(css.includes('#shell #commandAlert{display:none!important}'));
assert(css.includes('#shell #v226AlertStrip[hidden]'));
assert(app.includes("window.__NERV_V400_RENDERED__=true;"));
assert(app.includes('window.__NERV_V400_INIT_ERROR__='));
assert(boot.includes('v400InitError='));
assert(boot.includes("stage='+String(window.__NERV_BOOT_STAGE__"));
assert(!app.includes('v315SecurityGuide')&&!app.includes('v315CityDesk'));
const build=fs.readFileSync('scripts/build.py','utf8');
assert(build.includes('window.__NERV_BOOT_STAGE__'));
assert(build.includes('window.__NERV_BOOT_BUNDLE_COMPLETE__'));
console.log('PASS v4.0.3: obsolete v315 UI no longer boots; real canonical recovery and v4 station preserve continuous chain');
