// NERV COMMAND TERMINAL v2.7 TACTICAL DEFENSE NETWORK - Single-file Scriptable edition
// 生活データ: 現在時刻・端末電池・現在地の実天気・ユーザーのタスク。
// 第3新東京市/EVA/MAGI/作戦は架空のローカルシミュレーション。
// 天気更新の位置情報は操作時（またはユーザーが有効化した次回起動時）のみ利用。
const fm = FileManager.local();
const statePath = fm.joinPath(fm.libraryDirectory(), 'nerv_command_v2_state.json');
const backupPath = fm.joinPath(fm.libraryDirectory(), 'nerv_command_v2_state_pre_v2_7_backup.json');
try { if (fm.fileExists(statePath) && !fm.fileExists(backupPath)) fm.copy(statePath, backupPath); } catch (e) { console.warn('State backup failed: '+e); }
let storedState = null;
try { if (fm.fileExists(statePath)) storedState = JSON.parse(fm.readString(statePath)); } catch (e) { console.warn('State read failed: '+e); }
function getBatteryInfo() {
  try { return {level:Math.round(Device.batteryLevel()*100),charging:Device.isCharging()}; }
  catch(e){return {level:null,charging:false};}
}
const deviceInfo = getBatteryInfo();
