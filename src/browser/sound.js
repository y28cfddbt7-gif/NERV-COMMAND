// Procedural electronic cues; no downloaded recordings or voice assets.
let soundBus=null, soundLimiter=null;
const soundVoices=new Set(), soundLastAt={};
const soundScore={
 tap:[[840,0,.045,'sine',.2,680],[1260,.04,.035,'sine',.13,1260]],
 select:[[360,0,.1,'triangle',.3,540],[720,.065,.14,'sine',.2,1080],[1440,.14,.08,'sine',.1,1200]],
 ok:[[520,0,.12,'sine',.32,520],[780,.09,.15,'sine',.26,780],[1040,.18,.28,'triangle',.2,1040]],
 warning:[[220,0,.22,'square',.16,180],[440,0,.22,'sine',.3,360],[220,.32,.26,'square',.16,180],[440,.32,.26,'sine',.3,360]],
 alarm:[[740,0,.36,'sawtooth',.13,480],[148,.02,.38,'sine',.38,110],[740,.46,.38,'sawtooth',.13,480],[148,.48,.4,'sine',.38,110],[980,.85,.17,'triangle',.18,660]],
 launch:[[70,0,.58,'sine',.36,240],[140,.12,.5,'sawtooth',.12,560],[440,.48,.2,'triangle',.22,880],[1320,.66,.22,'sine',.13,1760]],
 scan:[[1500,0,.085,'sine',.17,850],[1900,.11,.085,'sine',.16,1050],[2300,.22,.12,'triangle',.15,1400]],
 deny:[[260,0,.16,'triangle',.35,180],[195,.2,.22,'triangle',.32,120]],
 done:[[440,0,.38,'sine',.22,440],[554,.08,.4,'sine',.18,554],[660,.16,.44,'sine',.18,660],[880,.28,.5,'triangle',.16,880]]
};
function soundLevel(){return Math.max(0,Math.min(100,Number(S.prefs.soundVolume??55)||0))/100*.22;}
function prepareSound(){
 const Context=window.AudioContext||window.webkitAudioContext;
 if(!Context)return false;
 if(!audio){audio=new Context();soundBus=audio.createGain();soundLimiter=audio.createDynamicsCompressor();
  soundLimiter.threshold.value=-18;soundLimiter.knee.value=18;soundLimiter.ratio.value=8;
  soundBus.connect(soundLimiter);soundLimiter.connect(audio.destination);}
 soundBus.gain.setTargetAtTime(soundLevel(),audio.currentTime,.025);
 if(audio.state==='suspended'){const resumed=audio.resume();if(resumed?.catch)resumed.catch(()=>{});}
 return true;
}
function stopSound(){
 for(const voice of soundVoices){try{voice.stop();}catch(e){}}
 soundVoices.clear();
}
function sound(kind='tap'){
 if(!S.prefs.sound||document.hidden)return;
 const now=Date.now(),gap=kind==='alarm'?1400:kind==='warning'?300:55;
 if(soundLastAt[kind]!=null&&now-soundLastAt[kind]<gap)return;
 try{
  if(!prepareSound())return;
  soundLastAt[kind]=now;
  const start=audio.currentTime;
  for(const [frequency,offset,duration,wave,gain,end] of soundScore[kind]||soundScore.tap){
   if(soundVoices.size>=24)break;
   const oscillator=audio.createOscillator(),envelope=audio.createGain(),at=start+offset;
   oscillator.type=wave;oscillator.frequency.setValueAtTime(frequency,at);
   oscillator.frequency.exponentialRampToValueAtTime(end,at+duration);
   envelope.gain.setValueAtTime(.0001,at);envelope.gain.exponentialRampToValueAtTime(gain,at+.012);
   envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);
   oscillator.connect(envelope);envelope.connect(soundBus);soundVoices.add(oscillator);
   oscillator.onended=()=>{soundVoices.delete(oscillator);oscillator.disconnect();envelope.disconnect();};
   oscillator.start(at);oscillator.stop(at+duration+.025);
  }
 }catch(e){console.warn('audio',e)}
}
