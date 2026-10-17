const staffInspectionItems=['連絡系統を確認','非常電源の表示を確認','EVA拘束・電源状態を確認','MAGIの未承認事項を確認','次当直への引継ぎを確認'];
let handoverPage=0;
function renderPersonnel(){
 const p=S.personnel;if(!p||!$('dutyStatus'))return;
 const active=!!p.shift?.startedAt&&!p.shift.endedAt;
 meteoText('dutyStatus',active?'当直中':p.shift?.endedAt?'当直終了':'待機');
 meteoText('dutyStarted',p.shift?.startedAt?new Date(p.shift.startedAt).toLocaleString('ja-JP'):'--');
 const seconds=p.shift?.startedAt?Math.max(0,Math.floor(((p.shift.endedAt||Date.now())-p.shift.startedAt)/1000)):0;
 meteoText('dutyElapsed',[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':'));
 $('dutyStart').disabled=active;$('dutyEnd').disabled=!active;
}
function renderHandover(){
 const p=S.personnel,list=$('handoverList');if(!list)return;list.replaceChildren();
 const pages=Math.max(1,Math.ceil(p.handover.length/5));handoverPage=Math.min(handoverPage,pages-1);
 for(const entry of p.handover.slice(handoverPage*5,handoverPage*5+5)){
  const row=document.createElement('article'),time=document.createElement('small'),text=document.createElement('p');
  time.textContent=new Date(entry.at).toLocaleString('ja-JP')+' / '+entry.category;text.textContent=entry.text;row.append(time,text);list.append(row);
 }
 if(!p.handover.length)list.textContent='引継ぎ記録はありません。';
 meteoText('handoverPage',(handoverPage+1)+' / '+pages);$('handoverPrev').disabled=handoverPage===0;$('handoverNext').disabled=handoverPage===pages-1;
}
function initPersonnel(){
 if(!qs('#staffSupport'))return;
 const raw=S.personnel&&typeof S.personnel==='object'?S.personnel:{};
 S.personnel={...raw,shift:raw.shift&&typeof raw.shift==='object'?raw.shift:{startedAt:0,endedAt:0},checks:raw.checks&&typeof raw.checks==='object'?raw.checks:{},handover:Array.isArray(raw.handover)?raw.handover:[]};
 $('dutyStart').addEventListener('click',()=>{if(S.personnel.shift.startedAt&&!S.personnel.shift.endedAt)return;S.personnel.shift={startedAt:Date.now(),endedAt:0};persist();renderPersonnel();sound('ok');});
 $('dutyEnd').addEventListener('click',()=>{if(!S.personnel.shift.startedAt||S.personnel.shift.endedAt)return;S.personnel.shift.endedAt=Date.now();persist();renderPersonnel();sound('done');});
 $('handoverForm').addEventListener('submit',event=>{event.preventDefault();const text=$('handoverText').value.trim();if(!text)return;S.personnel.handover.unshift({at:Date.now(),category:$('handoverCategory').value,text:text.slice(0,500)});S.personnel.handover=S.personnel.handover.slice(0,100);$('handoverText').value='';handoverPage=0;persist();renderHandover();sound('ok');});
 $('handoverPrev').addEventListener('click',()=>{handoverPage=Math.max(0,handoverPage-1);renderHandover();});$('handoverNext').addEventListener('click',()=>{handoverPage++;renderHandover();});
 $('handoverExport').addEventListener('click',async()=>{
  const text='NERV / 職員引継ぎ記録\n'+S.personnel.handover.map(e=>new Date(e.at).toLocaleString('ja-JP')+' ['+e.category+']\n'+e.text).join('\n\n');
  const output=$('handoverExportText');output.value=text;output.classList.remove('hidden');
  const result=await callNative('clipboard',{text});if(result?.error){output.focus();output.select();toast('記録を選択しました。長押ししてコピーしてください。');}else toast('引継ぎ記録をコピーしました。');
 });
 const refreshChecks=()=>{const done=staffInspectionItems.filter((_,i)=>!!S.personnel.checks[i]).length;meteoText('inspectionProgress',done+' / '+staffInspectionItems.length+' 点検済み');};
 const checks=$('inspectionList');staffInspectionItems.forEach((text,i)=>{const label=document.createElement('label'),input=document.createElement('input'),span=document.createElement('span');input.type='checkbox';input.checked=!!S.personnel.checks[i];input.dataset.inspection=String(i);span.textContent=text;label.append(input,span);checks.append(label);input.addEventListener('change',()=>{S.personnel.checks[i]=input.checked;persist();refreshChecks();});});
 $('inspectionReset').addEventListener('click',()=>{S.personnel.checks={};for(const input of checks.querySelectorAll('input'))input.checked=false;persist();refreshChecks();});
 renderPersonnel();renderHandover();refreshChecks();
}
initPersonnel();
