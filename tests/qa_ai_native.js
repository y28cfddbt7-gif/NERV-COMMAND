// Full-export Scriptable mocks: native Keychain, async API requests, and a responsive persistence bridge.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const v=require('../src/build.json').version.replaceAll('.','_'),code=fs.readFileSync(__dirname+'/../NERV_COMMAND_v'+v+'_SCRIPTABLE.js','utf8');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const keyName='nerv.command.ai.key',configName='nerv.command.ai.config',fixtureKey='synthetic-test-key-not-a-real-credential';
const context={schema:1,character:{id:'shinji',name:'碇シンジ'},persona:{pronoun:'僕'},world:{mode:'normal'},history:[],memory:{schema:1}};
const input={id:'pm-1:shinji',input:'今日はどう？',context};
const responses=text=>({output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(text)}]}]});
async function run({jobs,key=fixtureKey,config={schema:1,endpoint:'https://api.openai.com/v1/responses',model:'gpt-4.1-mini',enabled:true},response=responses({text:'少し話せます。',suggestion:null}),http=200,throwRequest=false,delayed=false,alerts=[]}={}){
 const files=new Map([['/mock/nerv_command_v2_state.json',JSON.stringify({tasks:[],marker:'synthetic'})]]),secure=new Map();if(key)secure.set(keyName,key);if(config)secure.set(configName,JSON.stringify(config));
 const requests=[],deliveries=[],forms=[];let html,posted=false,resolveNetwork,finish,completed=false;const done=new Promise(r=>finish=r);
 const fm={libraryDirectory:()=>'/mock',joinPath:(a,b)=>a+'/'+b,fileExists:p=>files.has(p),readString:p=>files.get(p),writeString:(p,v)=>files.set(p,v),copy:(a,b)=>files.set(b,files.get(a))};
 const Keychain={contains:k=>secure.has(k),get:k=>secure.get(k),set:(k,v)=>secure.set(k,v),remove:k=>secure.delete(k)};
 class Alert{constructor(){this.actions=[];this.fields=[];forms.push(this);}addAction(s){this.actions.push(s);}addCancelAction(){}addDestructiveAction(s){this.actions.push(s);}addTextField(p,v){this.fields.push({secure:false,value:v});}addSecureTextField(p,v){this.fields.push({secure:true,value:v});}async presentAlert(){this.answer=alerts.shift()||{choice:-1};return this.answer.choice;}textFieldValue(i){return this.answer.values?.[i]??this.fields[i]?.value??'';}}
 class Request{constructor(url){this.url=url;this.response={statusCode:http};requests.push(this);}async loadJSON(){if(throwRequest)throw Error(fixtureKey+' sensitive-server-message');if(delayed)return new Promise(r=>resolveNetwork=()=>r(response));return response;}}
 class WebView{
  async loadHTML(value){html=value;}
  async evaluateJavaScript(source){
   if(source.includes('__nervQueue')){if(posted){await new Promise(r=>setImmediate(r));return [];}posted=true;return jobs||[];}
   const m=source.match(/window\.__nervDeliver\((\d+),([\s\S]*)\);$/);assert(m,source.slice(0,80));const delivery={id:Number(m[1]),result:JSON.parse(m[2])};deliveries.push(delivery);
   if(delivery.id===2&&resolveNetwork)resolveNetwork();if(deliveries.length===(jobs||[]).length)finish();return null;
  }
  async present(){if(jobs?.length)await done;}
 }
 await new AsyncFunction('FileManager','Device','config','Script','WebView','Request','Keychain','Alert','console',code)({local:()=>fm},{batteryLevel:()=>.5,isCharging:()=>false},{runsInWidget:false},{complete(){completed=true;}},WebView,Request,Keychain,Alert,{warn(){}});
 assert(completed);assert(!html.includes(fixtureKey));assert(!JSON.stringify(deliveries).includes(fixtureKey));assert(![...files.values()].some(v=>v.includes(fixtureKey)));
 return {files,secure,requests,deliveries,forms};
}
(async()=>{
 let r=await run({jobs:[{id:1,action:'aiStatus'}]});assert(r.deliveries[0].result.enabled);assert(!JSON.stringify(r.deliveries).includes('Authorization'));console.log('PASS native status exposes no key');
 r=await run({jobs:[{id:1,action:'aiReply',payload:input}]});assert.equal(r.deliveries[0].result.reply.text,'少し話せます。');assert.equal(r.requests[0].headers.Authorization,'Bearer '+fixtureKey);assert.equal(r.requests[0].timeoutInterval,12);const body=JSON.parse(r.requests[0].body);assert.equal(body.store,false);assert.equal(body.text.format.type,'json_schema');console.log('PASS Responses transport uses Keychain, bounded timeout and strict structured output');
 r=await run({config:{schema:1,endpoint:'https://provider.example/v1/chat/completions',model:'compatible-model',enabled:true},response:{choices:[{message:{content:JSON.stringify({text:'了解しました。',suggestion:'analysis-review'})}}]},jobs:[{id:1,action:'aiReply',payload:input}]});assert(r.deliveries[0].result.ok);assert.equal(JSON.parse(r.requests[0].body).response_format.type,'json_object');console.log('PASS compatible chat-completions transport and suggestion parsing');
 for(const settings of [{key:null},{config:{schema:1,enabled:false}},{config:{schema:1,endpoint:'http://unsafe.example/responses',enabled:true}}]){r=await run({...settings,jobs:[{id:1,action:'aiReply',payload:input}]});assert(r.deliveries[0].result.error);assert.equal(r.requests.length,0);}console.log('PASS unconfigured, OFF and insecure endpoints do not send requests');
 r=await run({delayed:true,jobs:[{id:1,action:'aiReply',payload:input},{id:2,action:'persist',payload:{state:{tasks:[],marker:'persisted while AI waits'}}}]});assert.deepEqual(r.deliveries.map(d=>d.id),[2,1]);assert.equal(JSON.parse(r.files.get('/mock/nerv_command_v2_state.json')).marker,'persisted while AI waits');console.log('PASS persistence completes before a delayed AI response');
 for(const raw of [{text:'発令した',suggestion:'launch'},{text:'x'.repeat(321),suggestion:null},{text:'ok',suggestion:null,state:{power:true}}]){r=await run({response:responses(raw),jobs:[{id:1,action:'aiReply',payload:input}]});assert(r.deliveries[0].result.error);}console.log('PASS invalid, oversized and state-mutation outputs are rejected');
 for(const options of [{http:429},{throwRequest:true},{response:{output:[{content:[{type:'refusal',refusal:'no'}]}]}}]){r=await run({...options,jobs:[{id:1,action:'aiReply',payload:input}]});assert(r.deliveries[0].result.error);}console.log('PASS HTTP/network/refusal errors remain sanitized for offline fallback');
 r=await run({delayed:true,jobs:[{id:1,action:'aiReply',payload:input},{id:3,action:'aiReply',payload:{...input,id:'pm-2:rei'}},{id:2,action:'persist',payload:{state:{tasks:[]}}}]});assert.equal(r.requests.length,1);assert(r.deliveries.find(d=>d.id===3).result.error);console.log('PASS only one native AI request runs at a time');
 r=await run({delayed:true,jobs:[{id:1,action:'aiReply',payload:input},{id:3,action:'aiConfigure'},{id:2,action:'persist',payload:{state:{tasks:[]}}}],alerts:[{choice:1}]});assert(r.deliveries.find(d=>d.id===1).result.error);assert.equal(r.requests.length,1);console.log('PASS configuration changes invalidate an in-flight native reply');
 r=await run({jobs:[{id:1,action:'aiConfigure'}],alerts:[{choice:1}]});assert.equal(r.deliveries[0].result.enabled,false);assert(r.secure.has(keyName));console.log('PASS external sending can be disabled without exposing/deleting the key');
 r=await run({jobs:[{id:1,action:'aiConfigure'}],alerts:[{choice:2}]});assert(!r.secure.has(keyName));assert.equal(r.deliveries[0].result.enabled,false);console.log('PASS key deletion affects only owned Keychain records');
 r=await run({key:null,config:null,jobs:[{id:1,action:'aiConfigure'}],alerts:[{choice:0},{choice:0,values:['https://api.openai.com/v1/responses','gpt-4.1-mini',fixtureKey]},{choice:0}]});assert(r.deliveries[0].result.enabled);assert.equal(r.secure.get(keyName),fixtureKey);assert(r.forms[1].fields[2].secure);assert.equal(r.forms[1].fields[2].value,'');console.log('PASS native secure-field setup requires explicit destination/ON confirmation');
 r=await run({jobs:[{id:1,action:'aiConfigure'}],alerts:[{choice:0},{choice:0,values:['https://localhost/v1/responses','model',fixtureKey]}]});assert(r.deliveries[0].result.error);assert.equal(r.requests.length,0);console.log('PASS local/private endpoint configuration is rejected');
})().catch(e=>{console.error(e);process.exitCode=1;});
