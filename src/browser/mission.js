const missionMessages=[
 '模擬シナリオを開始してください。',
 '都市防御を確保。退避区域を閉鎖し、装甲シャッターを展開します。',
 '第3新東京市の電力供給系統を確認し、対使徒作戦へ切り替えます。',
 'EVAを準備し、MAGI審議を経て最低1機を出撃させてください。',
 'レーダーによる照準補正と標的捕捉を行います。',
 '捕捉完了。EVAが出撃中で通信が正常なら射撃指示を送れます。',
 '作戦完了。標的を制圧した模擬判定です。'];
function renderMission(){const n=S.mission.phase;$('missionStep').textContent='PHASE '+String(n).padStart(2,'0')+' / '+(n===0?'STANDBY':n===6?'COMPLETE':'EXECUTING');$('missionReady').textContent=n===6?'SECURE':n===0?'READY':'ALERT';$('missionDescription').textContent=missionMessages[n]||'';$('radarState').textContent=n===0?'STANDBY':n===6?'TARGET LOST':'TRACKING';const labels=['▶ 作戦開始','▣ 都市防御 / 退避','⚡ 電力系統切替','◈ EVA発進確認','⌖ 照準・索敵','◎ 射撃命令','✓ 作戦完了'];$('missionAction').textContent=labels[n];$('missionAction').disabled=n===6;const bars=$('missionPhaseBars');bars.replaceChildren();for(let i=0;i<5;i++){const b=document.createElement('i');b.className=i<n?'active':'';bars.append(b)}renderLogs('mission');}
$('missionAction').addEventListener('click',()=>{const n=S.mission.phase;if(n===0){S.mission.phase=1;addLog('mission','TACTICAL SCENARIO START / TARGET DETECTED');sound('warning');}
 else if(n===1){S.infra.armor=true;S.infra.comms=true;invalidateApproval();S.mission.phase=2;addLog('mission','CITY EVACUATION / ARMOR DEPLOYED');sound('ok');}
 else if(n===2){S.infra.power=true;invalidateApproval();S.mission.phase=3;addLog('mission','POWER SYSTEM / STANDBY RESOURCES CONNECTED');sound('scan');}
 else if(n===3){if(!S.evas.some(e=>e.state==='DEPLOYED')){toast('EVAの発進が必要です。EVA運用へ移動');sound('deny');go('eva');return;}S.mission.phase=4;addLog('mission','EVA DEPLOYMENT / CONFIRMED');sound('ok');}
 else if(n===4){if((S.ops?.currentMissionLocks||0)<1){toast('目標照準ゲームで1回以上ロックしてください');sound('deny');return;}S.mission.phase=5;addLog('mission','TARGET LOCK / FIRE CONTROL READY');sound('scan');}
 else if(n===5){if(!S.infra.comms||!S.evas.some(e=>e.state==='DEPLOYED')){toast('通信回線とEVA出撃状態を確認');sound('deny');return;}S.mission.phase=6;addLog('mission','OPERATION COMPLETE / TARGET NEUTRALIZED (SIM)');sound('done');}
 draw();});
$('missionReset').addEventListener('click',()=>{S.mission.phase=0;addLog('mission','OPERATION RESET');sound('tap');draw();});
