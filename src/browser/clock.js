function tick(){meteoClockUpdate();const d=new Date();$('topClock').textContent=d.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});$('homeHour').textContent=d.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});$('homeDate').textContent=d.toLocaleDateString('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'});$('heroTime').textContent=d.toLocaleTimeString('ja-JP',{hour12:false});
 if(focus.running){focus.remaining=Math.max(0,Math.ceil((focus.deadline-Date.now())/1000));if(focus.remaining===0){focus.running=false;sound('done');toast('集中タイマー終了。お疲れさま！');}timerRender();}
 const changed=settleEvaPower();if((S.evas.some(e=>e.state==='DEPLOYED')||changed)&&currentPage==='eva')renderEVA();if(changed)renderTacticalAlert();
}
