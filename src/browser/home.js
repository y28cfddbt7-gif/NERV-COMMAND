function renderBattery(){if(battery==null){meteoText('homeBattery','--%');meteoText('batterySub','取得できません');return;}meteoText('homeBattery',battery+'%');if($('batteryFill'))$('batteryFill').style.width=battery+'%';meteoText('batterySub',charging?'充電中':'バッテリー残量');}
function renderHome(){renderBattery();renderLauncher();}
