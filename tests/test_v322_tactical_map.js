'use strict';
// v3.2.2 actual SVG-tactical map smoke test (Node VM without a browser).
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const content=fs.readFileSync('src/browser/v322-live-tactical-map.js','utf8');
const cfg=JSON.parse(fs.readFileSync('src/build.json','utf8'));
assert.equal(cfg.version,'3.2.4');
assert(cfg.browser_modules.includes('src/browser/v322-live-tactical-map.js'));
class Node{
 constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.dataset={};this.classList={add:()=>{}};this.style={setProperty:(k,v)=>{this.css[k]=v}};this.css={};this.isConnected=true;this.hidden=false;this.parentElement=null;this.textContent='';}
 setAttribute(k,v){this.attributes[k]=String(v)}
 append(...nodes){for(const n of nodes){n.parentElement=this;this.children.push(n)}}
 replaceChildren(...nodes){this.children=[];this.append(...nodes)}
}
const grid=new Node('div');let routed=[],draws=0;
const live={pos:{col:1,row:2},unit:1,enemyPlan:{columns:[2],rows:[1]},support:false};
const S={defense:{status:'active',caseNo:12,round:3,city:[{hp:100,armor:false},{hp:40,armor:true},{hp:100,armor:false}]},
 tactics:{attacker:1}};
const listeners={};
const window={NERV_MOBILE:{},addEventListener:(type,fn)=>{(listeners[type]??=[]).push(fn)}};
const document={getElementById:id=>id==='v228SectorGrid'?grid:null,
 createElementNS:(_,tag)=>new Node(tag),
 createDocumentFragment:()=>new Node('fragment'),
 querySelector:()=>({dataset:{v230Mode:'command'}})};
const ctx={window,document,console,Math,Number,String,JSON,Object,Array,Set,Date,S,
 staffWorldReady:true,tacticalState:()=>live,consoleBattle:()=>({stage:'field',ap:2}),
 draw(){draws++}};
vm.createContext(ctx);
vm.runInContext(content,ctx);
assert.equal(grid.children.length,1);
const svg=grid.children[0];
assert.equal(svg.id,'v322MapOverlay'); // ID is assigned as a property on the real SVG node.
assert.equal(svg.hidden,false);
assert.equal(ctx.window.NERV_V322.snapshot().location,'real-command-grid');
function flat(n){return [n,...n.children.flatMap(flat)]}
let tags=flat(svg).filter(x=>x.tag==='text').map(x=>x.textContent);
assert(tags.includes('EVA-01'), 'EVA location must come from real tacticalState');
assert(tags.includes('FIRE ZONE'), 'forecast must be labeled, never presented as an enemy position');
assert(!tags.includes('ANGEL'), 'no invented coordinate for unknown enemy position');
assert(tags.includes('ANGEL / TRACKING'), 'track unknown angel without claiming a position');
const first=ctx.window.NERV_V322.snapshot().updates;
ctx.draw();assert.equal(ctx.window.NERV_V322.snapshot().updates,first,'same battle state must not redraw graphics');
live.pos.col=0;ctx.draw();
assert(ctx.window.NERV_V322.snapshot().updates>first,'EVA move must update the SVG');
tags=flat(svg).filter(x=>x.tag==='text').map(x=>x.textContent);
assert(tags.includes('EVA-01'));
S.defense.status='idle';ctx.draw();assert.equal(svg.hidden,true,'idle has no fake tactical map');
assert.equal(grid.children.length,1,'overlay is never duplicated');
assert(!content.includes('setInterval('));
assert(!content.includes('requestAnimationFrame('));
assert(!content.includes('S.defense ='));
assert(!content.includes('consoleBattleCommand('),'SVG layer cannot issue real commands');
console.log('PASS v3.2.2 tactical overlay stays on interactive 3x3 grid, tracks actual EVA and forecast, no fake enemy and no state mutation');
