// Runs before the legacy state reader; preserve damaged input before defaults can be saved.
window.__NERV_STATE_RECOVERY__=window.__BOOT__?.recovery||null;
if(!window.__SCRIPTABLE__&&document.querySelector('#staffSupport')){
 try{
  const key='nerv-command-v2',raw=localStorage.getItem(key);
  if(raw!==null){
   let valid=false;try{const parsed=JSON.parse(raw);valid=!!parsed&&typeof parsed==='object'&&!Array.isArray(parsed);}catch(error){}
   if(!valid){
    let backup=key+'-corrupt-'+Date.now(),i=0;while(localStorage.getItem(backup)!==null)backup=key+'-corrupt-'+Date.now()+'-'+(++i);
    try{
     localStorage.setItem(backup,raw);
     const previous=localStorage.getItem(key+'-last-good');let recovered=null;
     try{const value=JSON.parse(previous);if(value&&typeof value==='object'&&!Array.isArray(value))recovered=value;}catch(error){}
     if(recovered)localStorage.setItem(key,JSON.stringify(recovered));
     window.__NERV_STATE_RECOVERY__={recovered:true,blocked:false,backup,source:recovered?'last-good':'defaults',message:recovered?'破損データを別保存し、直前の正常保存から復旧しました。':'破損データを別保存しました。正常な控えがないため初期状態で開いています。'};
    }catch(error){window.__NERV_STATE_RECOVERY__={recovered:false,blocked:true,message:'破損データの退避に失敗。元データを保護するため保存を停止しています。'};}
   }
  }
 }catch(error){window.__NERV_STATE_RECOVERY__={blocked:true,message:'保存領域を読み取れないため、保存を停止しています。'};}
}
