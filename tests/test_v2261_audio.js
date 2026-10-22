// Simulated iOS WebKit AudioContext life cycle test; no Scriptable native APIs.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(path.join(__dirname,'../src/browser/v2261-audio-recovery.js'),'utf8');
function target(){
 const events={};
 return {
  hidden:false,
  addEventListener(type,fn){(events[type]||=([])).push(fn);},
  emit(type,event={}){for(const fn of events[type]||[])fn(event);}
 };
}
const sandbox={Promise,console,document:target(),window:target(),
 S:{prefs:{sound:true}},audio:null,soundBus:null,soundLimiter:null,
 created:0,closed:0,resumes:0,stopped:0};
sandbox.window.PointerEvent=function(){};
sandbox.prepareSound=function(){
 if(!sandbox.audio){
  sandbox.audio={state:'suspended',
   resume(){sandbox.resumes++;this.state='running';return Promise.resolve();},
   close(){sandbox.closed++;this.state='closed';return Promise.resolve();}};
  sandbox.soundBus={};sandbox.soundLimiter={};sandbox.created++;
 }
 if(sandbox.audio.state==='suspended')sandbox.audio.resume();
 return true;
};
sandbox.stopSound=function(){sandbox.stopped++;};
vm.createContext(sandbox);
vm.runInContext(src,sandbox,{filename:'v2261-audio-recovery.js'});
sandbox.prepareSound();assert.equal(sandbox.created,1);
sandbox.document.hidden=true;sandbox.document.emit('visibilitychange');
assert.equal(sandbox.window.NERV_AUDIO_RECOVERY.snapshot().needsReopen,true);
sandbox.document.hidden=false;sandbox.document.emit('visibilitychange');
assert.equal(sandbox.created,1,'foreground event does not autoplay');
sandbox.document.emit('pointerdown');
assert.equal(sandbox.created,2,'next touch re-creates an AudioContext');
assert.equal(sandbox.closed,1,'old context is closed once');
assert.equal(sandbox.window.NERV_AUDIO_RECOVERY.snapshot().rebuilds,1);
sandbox.document.emit('pointerdown');
assert.equal(sandbox.created,2,'normal touches do not create new contexts');
sandbox.audio.state='interrupted';
sandbox.document.emit('visibilitychange');
assert.ok(sandbox.resumes>=2,'interrupted context resumes');
sandbox.document.hidden=true;sandbox.document.emit('visibilitychange');
sandbox.S.prefs.sound=false;
sandbox.document.hidden=false;sandbox.document.emit('visibilitychange');
sandbox.document.emit('pointerdown');
assert.equal(sandbox.created,2,'mute setting prevents recovery autoplay');
console.log('PASS iOS WebAudio restore/recreate on gesture and mute respected');
