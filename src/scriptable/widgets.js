if (config.runsInWidget || config.runsInAccessoryWidget) {
  // Lightweight fail-safe widget; family-aware, no WebView or network request.
  const w = new ListWidget();
  w.backgroundColor = new Color('#11140f');
  const family = String(config.widgetFamily || 'medium');
  const accessory = family.indexOf('accessory') === 0;
  const addLine = (value,size,color,bold)=>{
    const x=w.addText(String(value));
    x.font=bold?Font.boldSystemFont(size):Font.mediumSystemFont(size);
    x.textColor=new Color(color);x.lineLimit=1;x.minimumScaleFactor=.65;return x;
  };
  try {
    if (accessory) {
      w.setPadding(0,0,0,0);
      if(family==='accessoryCircular'){
        addLine('NERV',12,'#ffe0ae',true);
      }else if(family==='accessoryInline'){
        addLine('NERV | COMMAND',12,'#f4c188',true);
      }else{
        addLine('NERV / COMMAND',12,'#f6ba70',true);
        const n=Array.isArray(storedState?.tasks)?storedState.tasks.filter(t=>!t.done).length:0;
        addLine('TASK '+n+' OPEN',11,'#a8e6bd',false);
      }
    }else{
      w.setPadding(family==='small'?12:16,14,12,14);
      addLine('◆ NERV / OPERATIONS',family==='small'?12:14,'#ffb55c',true);
      w.addSpacer(6);
      addLine('COMMAND TERMINAL',family==='small'?12:19,'#f8d4a0',true);
      w.addSpacer(4);
      const count=Array.isArray(storedState?.tasks)?storedState.tasks.filter(t=>t&&!t.done).length:0;
      addLine('TASKS  '+count+' OPEN',12,'#94dfae',true);
      const current=storedState?.weather?.raw?.current;
      if(current && Number.isFinite(current.temperature_2m)){
        w.addSpacer(4);
        addLine('WX 保存値  '+Math.round(current.temperature_2m)+'°C',11,'#d6ad75',false);
      }
      const city=storedState?.defense;
      if(city && city.status) addLine('TOKYO-3  '+String(city.status).toUpperCase(),11,'#95e4c0',true);
      if(family!=='small'){
        w.addSpacer(6);
        addLine('TOKYO-3 / PERSONAL TERMINAL',10,'#9d8b70',false);
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
