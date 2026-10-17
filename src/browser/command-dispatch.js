// Review-only drilldown. Final dispatch uses the original control handlers.
const dispatchCategories=[
 {id:'sequence',title:'戦術の次の指示',detail:'現在の作戦段階と未達条件を確認',commands:['next']},
 {id:'recon',title:'検知・状況解析',detail:'敵性反応の検知、波形の解析',commands:['detect','scan']},
 {id:'facility',title:'施設・電力管理',detail:'選択施設の防護、配備、送電、修理',commands:['armor','turret','power','repair']},
 {id:'coordination',title:'関連管制へ',detail:'機体運用・MAGI申請・配置の確認',commands:['eva','magi','map']}
];
let dispatchCategory=null,dispatchSelected=null,dispatchConfirmed=null;
function dispatchInfo(id){
 const d=S.defense,c=d.city[d.selected],active=d.status==='active';
 const energy=amount=>!S.infra.power?'都市主電源が停止しています。':d.energy<amount?'防衛電力が'+amount+'必要です。':'';
 const entries={
  next:{title:$('missionAction').textContent,effect:$('staffNextHint').textContent,target:'missionAction',blocked:S.mission.phase===6?'作戦完了。終了操作は元の画面で確認してください。':!S.infra.power||!S.infra.comms?'都市主電源・作戦通信を復旧してください。':''},
  detect:{title:'新規敵性反応を検知',effect:'新しい架空の対象を検知します。防衛電力＋20（上限100）。ターンは進みません。',target:'v27Detect',blocked:active?'迎撃作戦が進行中です。':''},
  scan:{title:'波形・A.T.解析',effect:'防衛電力12を使い、解析率＋34%。',target:'v27Scan',blocked:!active?'先に敵性反応を検知してください。':d.scans>=100?'解析は完了しています。':energy(12)},
  armor:{title:'選択施設の装甲を展開',effect:'防衛電力12を使い、'+V27_FACILITY[d.selected].name+'を防護します。',target:'v27Armor',blocked:!['active','idle'].includes(d.status)?'作戦終了後の復旧を確認してください。':c.hp<=0?'先に施設を修理してください。':c.armor?'装甲は展開済みです。':energy(12)},
  turret:{title:'選択施設へ迎撃砲台を配備',effect:'資材20を使い、'+V27_FACILITY[d.selected].name+'に砲台を配備します。',target:'v27Turret',blocked:d.selected===3?'ジオフロントには砲台を配備できません。':c.hp<25?'施設健全性25以上が必要です。':c.turret?'砲台は配備済みです。':d.parts<20?'資材20が必要です。':''},
  power:{title:'予備送電を実行',effect:'予備送電枠1を使い、防衛電力＋38（上限100）。',target:'v27Power',blocked:d.spares<=0?'予備送電枠を使い切りました。':''},
  repair:{title:'選択施設を応急修理',effect:'資材18を使い、'+V27_FACILITY[d.selected].name+'の健全性＋27（上限100）。',target:'v27Repair',blocked:c.hp>=100?'施設は健全です。':d.parts<18?'資材18が必要です。':''},
  eva:{title:'EVA発進管制を開く',effect:'機体の準備・出撃・回収はEVA運用で指示します。',route:['eva','control'],blocked:''},
  magi:{title:'MAGI審議申請を開く',effect:magiIntrusionActive()?'侵入対処を優先します。通常の審議は停止中です。':'対象機と出撃・迎撃の条件を審議画面で確認します。',route:['magi',magiIntrusionActive()?'intrusion':'request'],blocked:''},
  map:{title:'戦域マップを開く',effect:'現在の出撃位置と敵性反応を確認します。',route:['infra','map'],blocked:''}
 };
 return entries[id];
}
function dispatchSignature(id){const d=S.defense;return JSON.stringify([dispatchInfo(id),S.mission.phase,S.tactics.attacker,S.evas.map(e=>e.state),S.infra,d.selected,d.city[d.selected],d.energy,d.parts,d.spares,d.status,d.scans]);}
function renderDispatch(){
 const step=dispatchSelected?2:dispatchCategory?1:0;
 all('[data-dispatch-step]').forEach(el=>{if(Number(el.dataset.dispatchStep)===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
 meteoText('staffCommandBreadcrumb',dispatchCategory?dispatchCategory.title+(dispatchSelected?' / 実行前確認':' / 指令を選択'):'目的から指令を選択');
 const choices=$('staffCommandChoices');choices.replaceChildren();$('staffCommandReview').hidden=!dispatchSelected;$('staffCommandBack').hidden=!dispatchCategory;
 $('staffCommandBack').textContent=dispatchSelected?'指令一覧へ戻る':'分類へ戻る';
 if(dispatchSelected){
  const info=dispatchInfo(dispatchSelected);dispatchConfirmed=dispatchSignature(dispatchSelected);
  meteoText('staffCommandName',info.title);meteoText('staffCommandEffect',info.effect);meteoText('staffCommandCondition',info.blocked||'確認済み / '+(info.route?'関連画面へ移動します。':'この指令を実行できます。'));
  $('staffCommandCondition').dataset.blocked=String(!!info.blocked);$('staffCommandExecute').disabled=!!info.blocked;$('staffCommandExecute').textContent=info.route?'確認して管制画面へ':'確認して実行';
  const resources=$('staffCommandResources');resources.replaceChildren();
  for(const [name,value] of [['対象施設',V27_FACILITY[S.defense.selected].name],['防衛電力',S.defense.energy+'%'],['資材',S.defense.parts],['予備送電',S.defense.spares+' 枠']]){const row=document.createElement('div'),term=document.createElement('dt'),description=document.createElement('dd');term.textContent=name;description.textContent=value;row.append(term,description);resources.append(row);}
 }else{
  for(const item of dispatchCategory?dispatchCategory.commands.map(id=>({id,...dispatchInfo(id)})):dispatchCategories){
   const button=document.createElement('button'),title=document.createElement('b'),small=document.createElement('small');button.type='button';button.dataset.dispatchChoice=item.id;title.textContent=item.title;small.textContent=item.detail||item.effect;button.append(title,small);
   button.addEventListener('click',()=>{if(dispatchCategory)dispatchSelected=item.id;else dispatchCategory=item;renderDispatch();const focus=dispatchSelected?$('staffCommandExecute'):choices.querySelector('button');(focus?.disabled?$('staffCommandBack'):focus)?.focus();});choices.append(button);
  }
 }
 $('staffCommandDialog').scrollTop=0;
}
function initCommandDispatch(){
 if(!qs('#staffSupport')||!$('staffCommandDialog'))return;
 const dialog=$('staffCommandDialog');let returnFocus;
 wireStaffDialog(dialog);
 $('staffCommandOpen').addEventListener('click',()=>{returnFocus=document.activeElement;dispatchCategory=null;dispatchSelected=null;renderDispatch();dialog.showModal();$('staffCommandClose').focus();});
 $('staffCommandClose').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>returnFocus?.isConnected&&returnFocus.focus());
 $('staffCommandBack').addEventListener('click',()=>{if(dispatchSelected)dispatchSelected=null;else dispatchCategory=null;renderDispatch();$('staffCommandChoices').querySelector('button')?.focus();});
 $('staffCommandExecute').addEventListener('click',()=>{
  const info=dispatchInfo(dispatchSelected);if(dispatchConfirmed!==dispatchSignature(dispatchSelected)){renderDispatch();meteoText('staffCommandCondition','状況が変わりました。表示を更新したので、条件を再確認してください。'+(info.blocked||''));sound('deny');return;}
  if(info.blocked)return;
  dialog.close();if(info.route)window.NERV_MOBILE.open(...info.route);else $(info.target).click();
 });
}
initCommandDispatch();
