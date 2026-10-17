$('soundSwitch').addEventListener('click',()=>{S.prefs.sound=!S.prefs.sound;persist();renderSettings();if(S.prefs.sound)sound('ok');else stopSound();});
$('autoWeatherSwitch').addEventListener('click',()=>{S.prefs.autoWeather=!S.prefs.autoWeather;persist();renderSettings();sound('tap');});
$('motionSwitch').addEventListener('click',()=>{S.prefs.motion=!S.prefs.motion;persist();renderSettings();sound('tap');});
$('bootSwitch').addEventListener('click',()=>{S.prefs.showBoot=!S.prefs.showBoot;persist();renderSettings();sound('tap');});
$('clearTasks').addEventListener('click',()=>{const num=S.tasks.length;S.tasks=S.tasks.filter(t=>!t.done);const removed=num-S.tasks.length;persist();renderTasks();renderHome();toast(removed+'件の完了タスクを削除');sound('tap');});
$('resetSim').addEventListener('click',()=>{if(!confirm('都市・EVA・MAGI・作戦の状態を初期化しますか？タスク・天気・設定は保持します。'))return;const d=defaults();S.infra=d.infra;S.evas=d.evas;S.magi=d.magi;S.mission=d.mission;S.logs=d.logs;S.selectedEva=0;S.ops=newOpsDefaults();persist();draw();toast('架空の管制状態を初期化しました');sound('ok');});
function renderSettings(){document.body.classList.toggle('no-motion',!S.prefs.motion);$('soundFlag').textContent=S.prefs.sound?'ON':'OFF';$('motionFlag').textContent=S.prefs.motion?'ON':'OFF';$('bootFlag').textContent=S.prefs.showBoot?'ON':'OFF';$('autoWeatherFlag').textContent=S.prefs.autoWeather?'ON':'OFF';}
