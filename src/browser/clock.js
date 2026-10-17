function tick(){if(typeof renderPersonnel==='function')renderPersonnel();meteoClockUpdate();const d=new Date();$('topClock').textContent=d.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});meteoText('deviceTime',d.toLocaleString('ja-JP'));
 if(focus.running){focus.remaining=Math.max(0,Math.ceil((focus.deadline-Date.now())/1000));if(focus.remaining===0){focus.running=false;sound('done');toast('集中タイマー終了。お疲れさま！');}timerRender();}
 const changed=settleEvaPower();if((S.evas.some(e=>e.state==='DEPLOYED')||changed)&&currentPage==='eva')renderEVA();if(changed)renderTacticalAlert();if(qs('#staffSupport'))renderCommandStreams();
}
