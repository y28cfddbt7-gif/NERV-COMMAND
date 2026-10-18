// v2.9 presentation on the 07f2242 workflow. No alternate EVA or game reducers.
function initV29Presentation(){
 if(!qs('#staffSupport'))return;
 const circuit=$('intrusionCircuit'),panel=document.createElement('div');
 panel.className='magi-666-program';panel.id='magi666Program';
 panel.innerHTML='<b>666</b><div><strong>PROTECT PROGRAM</strong><span id="magi666State" class="sr-only">外部防壁 / 待機</span></div>';
 circuit.before(panel);
 panel.querySelector('div').append(circuit);
 const previous=renderMagiIntrusion;
 renderMagiIntrusion=function(){
  previous();const s=intrusionState();
  const active=['isolated','analyzed','countermeasure'].includes(s.status);
  panel.dataset.active=String(active);
  meteoText('magi666State',active?'外部経路を隔離中 / 内部侵食は別途対処':s.status==='failed'?'侵食限界 / 警報復旧が必要':'外部防壁 / 待機');
  const isolate=qs('[data-intrusion-action="isolate"] b');
  if(isolate)isolate.textContent='MAGI外部回線を隔離 / 666 PROTECT';
 };
 renderMagiIntrusion();
}
initV29Presentation();
