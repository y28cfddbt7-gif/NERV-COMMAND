'use strict';
// v4.0 clean-architecture guardrails: verify actual source ownership, removal and native persistence.
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const c=JSON.parse(read('src/build.json'));
const src=read('src/browser/v400-command-station.js');
const css=read('src/styles/v400-command-station.css');
const native=read('src/scriptable/webview.js');
const templates=read('src/ui/index.html');
assert.equal(c.version,'4.0.2');
const legacy=['v229-gameplay-ui.js','v230-compact-battle.js','v231-unified-workstation.js','v232-five-station.js',
'v233-city-commands.js','v300-operations-desk.js','v301-comms-ui.js','v310-operation-surface.js','v322-live-tactical-map.js'];
for(const name of legacy)assert(!c.browser_modules.some(p=>p.endsWith('/'+name)),'old UI still included: '+name);
for(const name of ['v229-gameplay.css','v230-compact-battle.css','v231-unified-workstation.css',
'v232-five-station.css','v233-navigation-city.css','v300-operations.css','v301-operations-radio.css',
'v310-operation-surface.css'])assert(!c.style_modules.some(p=>p.endsWith('/'+name)),'old CSS included: '+name);
for(const p of ['src/browser/v217-tactical-engine.js','src/browser/v219-console-engine.js',
'src/browser/v229-gameplay.js','src/browser/v300-command-kernel.js','src/browser/v301-operational-comms.js',
'src/browser/v314-alert-workflow.js','src/browser/v400-command-station.js'])assert(c.browser_modules.includes(p),'real engine lost: '+p);
assert(c.style_modules.includes('src/styles/v400-command-station.css'));
for(const s of ["root.id='v400Station'",'v400Svg','v400-map-taps','v400Radio','v400Main',
'data-v400-tab','v400Panel','v400Feedback','NERV_V400','consoleBattleCommand(',
'consoleMagiCommand(', 'window.NERV_OPS_COMMS', "openAlertReview("])assert(src.includes(s),s);
assert(src.includes("['analysis','move','attack','defense']"));
assert(!src.includes("draw=function"),'v4 screen must not wrap draw');
assert(!src.includes('v228SectorGrid')||src.includes('independent:'),'legacy map not allowed');
assert(!src.includes('.append(field)')&&!src.includes('.append(sheet)'),'legacy DOM relocation forbidden');
assert(!src.includes('requestAnimationFrame(')&&!src.includes('setInterval('),'no new timers');
assert(css.includes('.v400-map-taps')&&css.includes('#v400Station .v400-map'));
assert(css.includes('position:absolute')&&css.includes('grid-template-columns:repeat(4,minmax(0,1fr))'));
assert(css.includes('.page[data-page="battle"] > :not(#v400Station){display:none!important}'));
assert(templates.includes('4.0.2'));
assert(native.includes('if(snapshot.length>2000000)')&&native.includes('if(s.length>2000000)'));
assert(!native.includes('if(s.length>200000)'),'obsolete blocking limit');
console.log('PASS v4.0: 17 legacy UI styles/modules retired, independent tactical board, canonical reducers, guarded native persistence');
