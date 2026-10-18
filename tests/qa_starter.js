// Exercise the small delivered starter against actual payload bytes with Scriptable API mocks.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const version=require('../src/build.json').version.replaceAll('.','_'),stem='NERV_COMMAND_v'+version;
const starter=fs.readFileSync(__dirname+'/../'+stem+'_STARTER.js','utf8'),payload=fs.readFileSync(__dirname+'/../'+stem+'_SCRIPTABLE.js','utf8');
const hash=crypto.createHash('sha256').update(payload).digest('hex'),cache='/mock/nerv_runtime_'+hash+'.js',stateFile='/mock/nerv_command_v2_state.json';
const digestBody=fs.readFileSync(__dirname+'/../src/scriptable/starter.js','utf8').split('  function runtimeDigest(text){')[1].split('\n  }\n  try{')[0];
const digest=vm.runInNewContext('(function(text){'+digestBody+'\n})');
for(const value of ['', 'abc','日本語 🌐','x'.repeat(55),'x'.repeat(56),'x'.repeat(64),payload])assert.equal(digest(value),crypto.createHash('sha256').update(value).digest('hex'));
assert(Buffer.byteLength(starter)<20000);assert(!starter.includes('data:image/'));console.log('PASS starter UTF-8 SHA-256 vectors and payload; copy size <20 KB');
async function run(options={}){
 const original=JSON.stringify({tasks:[{id:'saved',text:'keep',done:false}],future:{keep:17},prefs:{showBoot:false}});
 const files=options.files||new Map([[stateFile,original]]);let requests=0,views=0,html='',alerts=0,completions=0,widget=null,cacheReads=0;
 const fm={libraryDirectory:()=>'/mock',joinPath:(a,b)=>a+'/'+b,fileExists:p=>files.has(p),readString:p=>{if(p===cache)cacheReads++;return files.get(p);},writeString:(p,s)=>{if(options.diskFail&&p.includes('nerv_runtime_'))throw Error('disk-full');files.set(p,s);},copy:(a,b)=>{assert(!files.has(b));files.set(b,files.get(a));},remove:p=>files.delete(p)};
 if(options.prune||options.pruneFailure){fm.listContents=()=>{if(options.pruneFailure)throw Error('cleanup-unavailable');return [...files.keys()].filter(p=>p.startsWith('/mock/')).map(p=>p.slice(6));};fm.modificationDate=p=>new Date(p.includes('a'.repeat(64))?100:200);}
 class Request{constructor(url){assert(url.startsWith('https://raw.githubusercontent.com/y28cfddbt7-gif/NERV-COMMAND/'));assert(url.endsWith('/'+stem+'_SCRIPTABLE.js'));}async loadString(){requests++;if(options.offline)throw Error('offline');return options.badDownload?'<!doctype html>error':payload;}}
 class WebView{constructor(){views++;}async loadHTML(s){if(options.webFail)throw Error('web-runtime');html=s;}async evaluateJavaScript(){return [];}async present(){}}
 class Alert{constructor(){alerts++;}addAction(){}async presentAlert(){}}
 class ListWidget{constructor(){this.lines=[];}addText(value){const line={value};this.lines.push(line);return line;}setPadding(){}addSpacer(){}}
 const sandbox={FileManager:{local:()=>fm},Device:{batteryLevel:()=>.5,isCharging:()=>false},Request,WebView,Alert,ListWidget,Color:class{},Font:{boldSystemFont:()=>({}),mediumSystemFont:()=>({})},config:{runsInWidget:!!options.family,widgetFamily:options.family||'medium'},Script:{name:()=> 'NERV STARTER',complete:()=>completions++,setWidget:w=>widget=w},console:{warn(){}},Location:{current(){throw Error('Unexpected location');}}};
 await new vm.Script('(async()=>{'+starter+'\n})()').runInContext(vm.createContext(sandbox));
 await Promise.resolve();
 assert.equal(files.get(stateFile),original,'Installation cannot reset existing progress');
 return {files,requests,views,html,alerts,completions,widget,cacheReads};
}
(async()=>{
 let result=await run();assert.equal(result.requests,1);assert.equal(result.views,1);assert.equal(result.files.get(cache),payload);assert.equal(result.completions,1);assert(result.html.includes('window.__SCRIPTABLE__=true'));assert(result.html.includes('data:image/'));console.log('PASS first download verifies and caches the actual full app and opens native WebView');
 result=await run({files:result.files,offline:true});assert.equal(result.requests,0);assert.equal(result.views,1);console.log('PASS subsequent offline launch uses verified local cache');
 for(const options of [{badDownload:true},{offline:true},{diskFail:true},{webFail:true}]){result=await run(options);assert.equal(result.alerts,1);assert.equal(result.completions,1);if(!options.webFail)assert.equal(result.views,0);console.log('PASS safe failure without state loss: '+Object.keys(options)[0]);}
 const corrupted=new Map([[stateFile,JSON.stringify({tasks:[{id:'saved',text:'keep',done:false}],future:{keep:17},prefs:{showBoot:false}})],[cache,'corrupt']]);result=await run({files:corrupted});assert.equal(result.requests,1);assert.equal(result.files.get(cache),payload);console.log('PASS corrupt runtime cache is replaced only after verified download');
 const keepState=JSON.stringify({tasks:[{id:'saved',text:'keep',done:false}],future:{keep:17},prefs:{showBoot:false}}),oldA='/mock/nerv_runtime_'+'a'.repeat(64)+'.js',oldB='/mock/nerv_runtime_'+'b'.repeat(64)+'.js',temp='/mock/nerv_runtime_'+'c'.repeat(64)+'.js.download';
 const oldCaches=new Map([[stateFile,keepState],[cache,payload],[oldA,'older'],[oldB,'previous'],[temp,'partial'],['/mock/notes.json','preserve']]);result=await run({files:oldCaches,prune:true,offline:true});assert(result.files.has(cache));assert(result.files.has(oldB));assert(!result.files.has(oldA));assert(!result.files.has(temp));assert.equal(result.files.get('/mock/notes.json'),'preserve');console.log('PASS verified runtime cleanup retains current and one previous cache without touching state');
 result=await run({files:result.files,pruneFailure:true,offline:true});assert.equal(result.views,1);assert.equal(result.alerts,0);console.log('PASS cache cleanup failure cannot prevent a verified offline launch');
 for(const family of ['small','medium','large','accessoryCircular','accessoryInline','accessoryRectangular']){result=await run({family,offline:true});assert(result.widget);assert.equal(result.requests,0);assert.equal(result.views,0);assert.equal(result.cacheReads,0);assert.equal(result.completions,1);assert.equal(result.widget.url,'scriptable:///run?scriptName=NERV%20STARTER');console.log('PASS starter widget works offline without full app: '+family);}
})().catch(e=>{console.error(e);process.exitCode=1;});
