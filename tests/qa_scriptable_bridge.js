// Scriptable API mocks exercise the shipped export, not iPhone/WebKit itself.
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const code = fs.readFileSync(__dirname + '/../NERV_COMMAND_v2_7_SCRIPTABLE.js', 'utf8');
const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
const statePath = '/mock/nerv_command_v2_state.json';
const backupPath = '/mock/nerv_command_v2_state_pre_v2_7_backup.json';

function storage(files) {
  return {
    libraryDirectory: () => '/mock', joinPath: (a,b) => a+'/'+b,
    fileExists: p => files.has(p), readString: p => files.get(p),
    copy: (a,b) => { assert(!files.has(b), 'Never overwrite an existing backup'); files.set(b,files.get(a)); },
    writeString: (p,s) => files.set(p,s),
  };
}

async function widgets() {
  const stored = {tasks:[{done:false},{done:true}],weather:{raw:{current:{temperature_2m:21.2}}},defense:{status:'victory'}};
  const original = JSON.stringify(stored);
  const files = new Map([[statePath, original]]);
  const fm = storage(files);
  let widget;
  class ListWidget {
    constructor(){this.lines=[];}
    addText(value){const line={value};this.lines.push(line);return line;}
    setPadding(){} addSpacer(){}
  }
  class Color {constructor(hex){this.hex=hex;}}
  const Font={boldSystemFont:size=>({size}),mediumSystemFont:size=>({size})};
  const forbidden=()=>{throw Error('Widgets must not open WebViews, request location or fetch data');};
  const run = new AsyncFunction('FileManager','Device','ListWidget','Color','Font','config','Script','WebView','Request','Location',code);
  for (const family of ['small','medium','large','accessoryCircular','accessoryInline','accessoryRectangular']) {
    await run({local:()=>fm},{batteryLevel:()=>.75,isCharging:()=>false},ListWidget,Color,Font,
      {runsInWidget:true,widgetFamily:family},{name:()=> 'NERV 日本語',setWidget:w=>{widget=w;},complete(){}},
      forbidden,forbidden,{current:forbidden});
    assert(widget.lines.length>0);
    assert.equal(widget.url,'scriptable:///run?scriptName='+encodeURIComponent('NERV 日本語'));
    if(!family.startsWith('accessory')) {
      assert(widget.lines.some(l=>l.value==='TASKS  1 OPEN'));
      assert(widget.lines.some(l=>l.value==='WX 保存値  21°C'));
      assert(widget.lines.some(l=>l.value==='TOKYO-3  VICTORY'));
    }
    assert.equal(files.get(backupPath), original);
    assert.equal(files.get(statePath), original);
    console.log('PASS cached widget '+family+' and non-overwriting save backup');
  }
}

async function bridge() {
  const old={tasks:[{id:'fixture',text:'compatibility',done:false}],marker:'synthetic old save'};
  const files=new Map([[statePath,JSON.stringify(old)]]);
  const state={...old,mission:{phase:3},defense:{status:'active',round:2}};
  const jobs=[
    {id:1,action:'persist',payload:{state}},
    {id:2,action:'battery'},
    {id:3,action:'mapLocation'},
    {id:4,action:'weather'},
    {id:5,action:'persist',payload:{state:{tooLarge:'x'.repeat(200001)}}},
    {id:6,action:'unsupported'},
  ];
  const delivered=new Map();
  let loadedHTML, requested=0, locationCalls=0, complete=false, finish;
  const closed=new Promise(resolve=>{finish=resolve;});
  class WebView {
    async loadHTML(html){loadedHTML=html;}
    async present(){await closed;}
    async evaluateJavaScript(script,callback){
      if(callback){if(!this.fetched){this.fetched=true;return jobs;}await closed;throw Error('closed mock WebView');}
      vm.runInNewContext(script,{window:{__nervDeliver:(id,result)=>{delivered.set(id,result);if(id===6)finish();}}});
    }
  }
  class Request {
    constructor(url){assert(url.startsWith('https://api.open-meteo.com/'));requested++;}
    async loadJSON(){return {current:{temperature_2m:21},hourly:{time:[]}};}
  }
  const Location={setAccuracyToHundredMeters(){},async current(){locationCalls++;return {latitude:35,longitude:139};},
                  async reverseGeocode(){return [{locality:'TEST LOCATION'}];}};
  await new AsyncFunction('FileManager','Device','config','Script','WebView','Location','Request','console',code)(
    {local:()=>storage(files)}, {batteryLevel:()=>.75,isCharging:()=>true}, {runsInWidget:false},
    {complete(){complete=true;}}, WebView,Location,Request,{warn(){}});
  assert(complete);
  assert(loadedHTML.includes('window.__SCRIPTABLE__=true;'));
  const boot=loadedHTML.match(/window.__BOOT__=(.*?);<\/script>/)[1];
  assert.deepEqual(JSON.parse(boot).state,old);
  assert.equal(JSON.parse(boot).battery,75);
  assert.equal(files.get(backupPath),JSON.stringify(old));
  assert.equal(files.get(statePath),JSON.stringify(state));
  assert.equal(delivered.get(1).ok,true);
  assert.equal(delivered.get(2).level,75);
  assert.equal(delivered.get(3).lat,35);
  assert.equal(delivered.get(4).place,'TEST LOCATION');
  assert(delivered.get(5).error.includes('保存容量'));
  assert(delivered.get(6).error.includes('未対応'));
  assert.equal(requested,1);
  assert.equal(locationCalls,2);
  console.log('PASS WebView boot, persist, battery, location, weather and oversized/unsupported job guards (mock APIs)');
}

(async()=>{await widgets();await bridge();})().catch(error=>{console.error(error);process.exitCode=1;});
