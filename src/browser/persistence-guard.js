// Additive bridge support. Existing save keys and unknown state fields stay intact.
const worldPreviousNative=callNative;
callNative=function(action,payload={}){
 const recovery=window.__NERV_STATE_RECOVERY__;
 if(action==='persist'&&recovery?.blocked)return Promise.resolve({error:recovery.message});
 if(!window.__SCRIPTABLE__){
  if(action==='backupWorld'){
   try{
    const base='nerv-command-v2-before-world',snapshot=JSON.stringify(payload.state||{});
    let key=base;if(payload.quarantine){key=base+'-repair-'+Date.now();let i=0;while(localStorage.getItem(key)!==null)key=base+'-repair-'+Date.now()+'-'+(++i);}
    if(localStorage.getItem(key)===null)localStorage.setItem(key,snapshot);
    return Promise.resolve({ok:true});
   }catch(error){return Promise.resolve({error:String(error)});}
  }
  if(action==='persist'&&document.querySelector('#staffSupport')){
   try{
    const raw=localStorage.getItem('nerv-command-v2');
    if(raw){let value=null;try{value=JSON.parse(raw);}catch(error){}if(value&&typeof value==='object'&&!Array.isArray(value))localStorage.setItem('nerv-command-v2-last-good',raw);}
   }catch(error){return Promise.resolve({error:'正常保存の控えを作成できません：'+error.message});}
  }
 }
 return worldPreviousNative(action,payload);
};
