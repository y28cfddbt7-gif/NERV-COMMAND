// NERV COMMAND TERMINAL v2.9 / 07f2242 VISUAL COMMAND BASELINE - Single-file Scriptable edition
// 生活データ: 現在時刻・端末電池・現在地の実天気・ユーザーのタスク。
// 第3新東京市/EVA/MAGI/作戦は架空のローカルシミュレーション。
// 天気更新の位置情報は操作時（またはユーザーが有効化した次回起動時）のみ利用。
const fm = FileManager.local();
const statePath = fm.joinPath(fm.libraryDirectory(), 'nerv_command_v2_state.json');
const backupPath = fm.joinPath(fm.libraryDirectory(), 'nerv_command_v2_state_pre_v2_7_backup.json');
try { if (fm.fileExists(statePath) && !fm.fileExists(backupPath)) fm.copy(statePath, backupPath); } catch (e) { console.warn('State backup failed: '+e); }
const lastGoodPath=fm.joinPath(fm.libraryDirectory(),'nerv_command_v2_state_last_good.json');
const worldBackupPath=fm.joinPath(fm.libraryDirectory(),'nerv_command_v2_state_before_world.json');
let storedState=null,stateRecovery=null;
function nativeValidState(raw){try{const value=JSON.parse(raw);return value&&typeof value==='object'&&!Array.isArray(value)?value:null;}catch(error){return null;}}
try{
 if(fm.fileExists(statePath)){
  const raw=fm.readString(statePath);storedState=nativeValidState(raw);
  if(!storedState){
   let quarantine=fm.joinPath(fm.libraryDirectory(),'nerv_command_corrupt_'+Date.now()+'.txt'),i=0;while(fm.fileExists(quarantine))quarantine=fm.joinPath(fm.libraryDirectory(),'nerv_command_corrupt_'+Date.now()+'_'+(++i)+'.txt');
   try{
    fm.copy(statePath,quarantine);
    if(fm.fileExists(lastGoodPath))storedState=nativeValidState(fm.readString(lastGoodPath));
    stateRecovery={recovered:true,blocked:false,source:storedState?'last-good':'defaults',message:storedState?'破損データを別保存し、直前の正常保存から復旧しました。':'破損データを別保存しました。正常な控えがないため初期状態で開いています。'};
   }catch(error){stateRecovery={blocked:true,message:'破損データを退避できないため、元の保存ファイルへの書込みを停止しています。'};}
  }
 }
}catch(error){stateRecovery={blocked:true,message:'保存ファイルを読み取れないため、書込みを停止しています。'};}
function getBatteryInfo() {
  try { return {level:Math.round(Device.batteryLevel()*100),charging:Device.isCharging()}; }
  catch(e){return {level:null,charging:false};}
}
const deviceInfo = getBatteryInfo();
