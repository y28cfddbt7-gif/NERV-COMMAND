function voteInfo(){const e=selected(),i=S.infra;return [
 {name:'BALTHASAR',yes:i.power&&e.state==='READY',reason:'発進態勢・電力供給'},
 {name:'CASPER',yes:i.armor&&i.comms,reason:'都市防護・通信の安全性'},
 {name:'MELCHIOR',yes:i.power&&e.power>=240,reason:'電力と機体稼働条件'}];}
function renderMAGI(){const v=S.magi.vote;const stat=(key,status,sub)=>{$('m'+key+'Status').textContent=status;$('m'+key+'Sub').textContent=sub;};if(v){v.votes.forEach((x,i)=>{const code=['B','C','M'][i];stat(code,x.yes?'APPROVE':'DENY',x.reason.toUpperCase().slice(0,19));});$('magiLiveState').textContent=v.approved?'APPROVED':'REJECTED';$('magiLiveState').style.color=v.approved?'#8ae6a5':'#ff5b63';$('magiDecision').textContent='UNIT-0'+v.eva+' / '+(v.approved?'発進承認':'発進否決')+'  '+v.count+'/3票\n'+v.votes.map(x=>x.name+'：'+(x.yes?'承認':'否決')+' / '+x.reason).join('\n');}else{stat('B','NORMAL','DECISION ENGINE');stat('C','NORMAL','HUMAN SAFETY');stat('M','NORMAL','TECHNICAL LOGIC');$('magiLiveState').textContent='STANDBY';$('magiDecision').textContent='審議開始で現在の都市・機体条件から判定します。';}updateMagiTracks(v?.votes||null);renderLogs('magi');}
$('magiDiagnose').addEventListener('click',()=>{const err=[];if(!S.infra.power)err.push('電力供給停止');if(!S.infra.comms)err.push('通信断');S.evas.forEach((e,i)=>{if(e.state==='POWER_LOST')err.push('UNIT-0'+i+' 電源喪失')});S.magi.diagnosedAt=Date.now();addLog('magi','SELF DIAGNOSTICS / '+(err.length?err.join('; '):'ALL CORE HEALTHY'));sound(err.length?'warning':'scan');toast(err.length?'自己診断：'+err.join(', '):'三基自己診断 完了 / 異常なし');draw();});
$('magiVote').addEventListener('click',()=>{
 settleEvaPower();const unit=S.selectedEva,votes=voteInfo(),count=votes.filter(x=>x.yes).length,approved=count>=2&&S.infra.comms;
 updateMagiTracks(null);
 playSequence('magi','MAGI三基審議','UNIT-0'+unit+' / DEPLOYMENT AUTHORIZATION',
  ['BALTHASAR-2 / STRATEGIC ANALYSIS','CASPER-3 / PERSONNEL SAFETY','MELCHIOR-1 / TECHNICAL LOGIC','CONSENSUS / FINAL DETERMINATION'],()=>{
   S.magi.vote={votes,count,approved,eva:unit,time:Date.now()};S.magi.approvedFor=approved?unit:null;
   addLog('magi','UNIT-0'+unit+' '+(approved?'APPROVED':'DENIED')+' / '+count+'/3');
   sound(approved?'ok':'deny');toast(approved?'MAGI審議承認：EVA出撃可能':'MAGI審議否決：運用条件を確認');draw();
  },votes);
});
all('[data-core]').forEach(btn=>btn.addEventListener('click',()=>{const k=btn.dataset.core,idx={b:0,c:1,m:2}[k],v=voteInfo()[idx];const name={b:'BALTHASAR-2',c:'CASPER-3',m:'MELCHIOR-1'}[k];addLog('magi',name+' / 独立解析 / '+(v.yes?'READY':'CAUTION'));sound('scan');toast(name+'：'+v.reason+' / '+(v.yes?'条件適合':'条件不適合'));renderMAGI();}));
