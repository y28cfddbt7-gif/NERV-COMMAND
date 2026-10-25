'use strict';
// v3.2.4 / Regression written from the actual iPhone 17 Pro screenshot.
// A drawn SVG must occupy the map, warning strips may not duplicate,
// the facility panel cannot cover the map, and old "従来" copy is retired.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const get=p=>fs.readFileSync(p,'utf8');
const cfg=JSON.parse(get('src/build.json'));
const css=get('src/styles/v310-operation-surface.css');
const ops=get('src/browser/v310-operation-surface.js');
const station=get('src/browser/v226-context-stations.js');
const map=get('src/browser/v322-live-tactical-map.js');
const legacy=get('src/browser/v229-gameplay-ui.js');
assert.equal(cfg.version,'3.2.4');
assert(station.includes("level!=='nominal'&&currentPage!=='battle'"),
 'the old global alert must NOT reappear in the battle header');
assert(station.includes('alarm.remove()'),'old global alert is physically unmounted');
assert(!legacy.includes('従来の発進方針・点検を表示'),
 'retired starter copy should not appear in the UI');
assert(legacy.includes('発進準備の詳細・点検記録'));
assert(ops.includes('frame.append(sheet)'),'city panel must remain inside canonical mission card');
assert(!ops.includes('engage.append(sheet)'),'no fixed overlay across the map');
assert(ops.includes('v324AuxOperations'),'auxiliary battle controls must be folded');
for(const selector of [
 '#shell #v323Frame #v228SectorGrid .v322-map-overlay',
 '#shell #v323Frame .v320-identity small',
 '#shell #v323Frame #v310Sheet',
 '#shell #v310Sheet[hidden]',
 '#shell #v323Frame #v310Sheet{order:6!important',
]){
 assert(css.includes(selector),'missing decisive screenshot fix: '+selector);
}
assert(css.includes('position:absolute!important;inset:0!important'),
 'SVG position must be ABSOLUTE, not another grid child');
assert(css.includes('pointer-events:none!important'),'SVG must not intercept move taps');
assert(css.includes('position:relative!important;top:auto!important;bottom:auto!important'),
 'city details should be inline, not blocking the mission map');
assert(css.includes('overflow-wrap:anywhere!important'),'title and alert cannot collide');

// Boot a deliberately incomplete but active case in a minimal DOM.
// City contours must paint even before the position telemetry arrives.
class Elem {
 constructor(tag){this.tag=tag;this.id=null;this.parentElement=null;this.children=[];
 this.dataset={};this.hidden=false;this.textContent='';
 this.classList={add:()=>{}};this.attrs={};
 this.style={setProperty:()=>{}};this.isConnected=true;}
 setAttribute(k,v){this.attrs[k]=String(v)}
 append(...x){for(const c of x){c.parentElement=this;this.children.push(c)}}
 replaceChildren(...x){this.children=[];this.append(...x)}
}
const grid=new Elem('div');
const window={NERV_MOBILE:{},addEventListener(){}};
const document={getElementById(id){return id==='v228SectorGrid'?grid:null},
 createElementNS(_ns,tag){return new Elem(tag)},
 createDocumentFragment(){return new Elem('fragment')},
 querySelector(){return {dataset:{v230Mode:'command'}}}};
const world={defense:{status:'active',caseNo:46,round:1,
 city:[{hp:100},{hp:100},{hp:100}]},tactics:{attacker:1}};
const ctx={window,document,S:world,staffWorldReady:true,
 consoleBattle:()=>({stage:'field',ap:1}),tacticalState:()=>({pos:null,enemyPlan:null,unit:1}),
 draw(){},Number,Math,Array,JSON,Object,String,Date,console};
vm.createContext(ctx);vm.runInContext(map,ctx);
const svg=grid.children[0];
assert(svg&&!svg.hidden,'SVG still needs to be painted during position-sync');
assert(window.NERV_V322.snapshot().active);
function descendants(node){return [node,...node.children.flatMap(descendants)]}
const items=descendants(svg);
assert(items.some(n=>n.attrs.class==='v322-cityline'),'city basemap must exist');
assert(items.some(n=>n.textContent==='UNIT POSITION / SYNC'),
 'absence of EVA telemetry must be marked honestly');
assert(!items.some(n=>n.textContent==='EVA-01'),'no fake current unit position');
assert(!items.some(n=>n.textContent==='FIRE ZONE'),'no fabricated danger polygon');
world.defense.status='idle';ctx.draw();assert(svg.hidden,'overlay hides after combat');
console.log('PASS v3.2.4 user screenshot: visible map SVG, no fake location, no alarm/banner overlap, no old label');
