if (config.runsInWidget || config.runsInAccessoryWidget) {
  // Native terminal composition, cached local state only; no WebView or requests.
  const w = new ListWidget();
  w.backgroundColor = new Color('#060e0a');
  if(typeof LinearGradient!=='undefined'){
    const gradient=new LinearGradient();gradient.colors=[new Color('#18251a'),new Color('#030906')];gradient.locations=[0,1];w.backgroundGradient=gradient;
  }
  const family = String(config.widgetFamily || 'medium');
  const accessory = family.indexOf('accessory') === 0;
  const addLine = (value,size,color,bold,parent=w)=>{
    const x=parent.addText(String(value));
    x.font=bold?(Font.boldMonospacedSystemFont||Font.boldSystemFont)(size):(Font.monospacedSystemFont||Font.mediumSystemFont)(size);
    x.textColor=new Color(color);x.lineLimit=1;x.minimumScaleFactor=.65;return x;
  };
  const state=storedState||{},units=Array.isArray(state.evas)?state.evas:[],intrusion=state.magi?.intrusion;
  const critical=state.infra?.power===false||state.infra?.comms===false||units.some(e=>e?.state==='POWER_LOST')||['detected','isolated','analyzed','countermeasure','failed'].includes(intrusion?.status);
  const operating=state.defense?.status==='active'||units.some(e=>e?.state==='DEPLOYED');
  const accent=critical?'#ff704d':operating?'#ffb34d':'#a6d5aa';
  const status=!storedState?'NO SAVED DATA':critical?'EMERGENCY / SIM':operating?'OPERATION / SIM':'LOCAL / SAVED';
  const dutyOrders=Array.isArray(state.personnel?.dispatch?.orders)?state.personnel.dispatch.orders.filter(o=>o&&['active','ready'].includes(o.status)).length:0;
  const count=Array.isArray(state.tasks)?state.tasks.filter(t=>t&&!t.done).length:0;
  const group=(parent,horizontal)=>{if(!parent.addStack)return parent;const stack=parent.addStack();if(horizontal)stack.layoutHorizontally();else stack.layoutVertically();return stack;};
  try {
    if (accessory) {
      w.setPadding(0,0,0,0);
      if(family==='accessoryCircular'){
        addLine('NERV',12,'#ffe0ae',true);
        addLine(critical?'警戒':dutyOrders?'受命 '+dutyOrders:storedState?'保存値':'未取得',10,accent,true);
      }else if(family==='accessoryInline'){
        addLine('NERV | '+(critical?'警戒 / SIM':dutyOrders?'受命 '+dutyOrders:'COMMAND'),12,'#f4c188',true);
      }else{
        addLine('NERV / '+(critical?'警戒 SIM':'COMMAND'),12,'#f6ba70',true);
        addLine('TASK '+count+' / ORDER '+dutyOrders,11,'#a8e6bd',false);
      }
    }else{
      const small=family==='small';w.setPadding(small?11:14,12,11,12);
      const header=group(w,true);header.backgroundColor=new Color('#28331c');if(header.setPadding)header.setPadding(5,6,5,6);
      addLine('▰ NERV / CENTRAL',small?11:13,'#ffc174',true,header);
      w.addSpacer(small?5:8);addLine(status,9,accent,true);
      const body=group(w,!small),left=group(body,false);
      addLine('TASKS  '+count+' OPEN',small?11:12,'#a9e0b4',true,left);
      const current=storedState?.weather?.raw?.current;
      if(current && Number.isFinite(current.temperature_2m)){
        left.addSpacer(3);
        addLine('WX 保存値  '+Math.round(current.temperature_2m)+'°C',10,'#d6ad75',false,left);
      }
      const city=storedState?.defense;
      if(city && city.status) addLine('TOKYO-3  '+String(city.status).toUpperCase(),small?9:10,'#95e4c0',true,left);
      if(small){if(dutyOrders)addLine('受命 '+dutyOrders+' 件',10,'#ffbc6c',true);}
      else{
        body.addSpacer(10);const right=group(body,false);addLine('ORDERS '+dutyOrders+' OPEN',11,'#ffbd6e',true,right);
        const selected=Number.isInteger(state.selectedEva)?state.selectedEva:0,e=units[selected];
        addLine('UNIT-0'+selected+' / '+(e?.state||'未取得'),9,'#aec9b0',false,right);
        if(Number.isFinite(e?.sync))addLine('SYNC '+e.sync.toFixed(1)+'% / SIM',9,'#aec9b0',false,right);
        if(family==='large'){
          w.addSpacer(10);addLine('PILOT INTERFACE / SIM',10,'#ffc174',true);
          for(let i=0;i<3;i++)addLine(['REI','SHINJI','ASUKA'][i]+' / '+(units[i]?.state||'未取得'),11,'#b2d4b6',false);
          const merit=Number(state.personnel?.dispatch?.merit)||0;w.addSpacer(6);addLine('DUTY MERIT '+merit+' PT',10,'#ffc174',true);
        }
        w.addSpacer(5);addLine('LOCAL SNAPSHOT / 保存状態',8,'#9d9d79',false);
      }
    }
    w.url = 'scriptable:///run?scriptName=' + encodeURIComponent(Script.name());
    w.refreshAfterDate = new Date(Date.now()+30*60*1000);
    Script.setWidget(w);
  } catch (widgetError) {
    // An unexpected data/layout error must not leave an empty widget.
    const fallback = new ListWidget();
    fallback.backgroundColor = new Color('#151510');
    const label = fallback.addText('NERV COMMAND');
    label.font = Font.boldSystemFont(14);label.textColor = new Color('#ffd19e');
    fallback.url='scriptable:///run?scriptName='+encodeURIComponent(Script.name());
    Script.setWidget(fallback);
    console.warn('Widget fallback: '+String(widgetError));
  }
