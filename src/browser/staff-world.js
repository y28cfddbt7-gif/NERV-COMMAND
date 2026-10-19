// Stage one: bounded, causal local simulation. Canon informs roles; numerical rules are original.
const WORLD_STEP=30000,WORLD_MAX_STEPS=12;
const worldClone=value=>JSON.parse(JSON.stringify(value));
const worldObject=value=>value&&typeof value==='object'&&!Array.isArray(value);
const worldBound=(value,low,high,fallback)=>Number.isFinite(Number(value))?Math.min(high,Math.max(low,Number(value))):fallback;
const worldActiveIncident=w=>(w.events||[]).find(e=>e.kind==='magi-cooling'&&e.status!=='resolved');
function worldLog(w,kind,text,ref=''){
 w.sequence++;w.history.unshift({id:'record-'+w.sequence,at:w.lastSimAt,tick:w.tick,kind,text,ref});w.history=w.history.slice(0,48);
}
function worldCommunication(w,from,text,ref=''){
 w.sequence++;w.communications.unshift({id:'comm-'+w.sequence,at:w.lastSimAt,from,text,ref,read:false});w.communications=w.communications.slice(0,16);
}
function worldNewJob(w){
 w.jobSequence++;const job={id:'cooling-check-'+w.jobSequence,kind:'cooling-inspection',status:'available',createdTick:w.tick,evidence:null,analysisDue:null};
 w.jobs.unshift(job);w.jobs=w.jobs.slice(0,12);worldLog(w,'受付','技術部からMAGI冷却系統の定期点検を受け付けました。',job.id);
 worldCommunication(w,'伊吹マヤ / 技術局','冷却系統の表示確認をお願いします。点検結果を照合し、解析依頼後に技術部へ報告してください。',job.id);
}
function worldInitial(now){
 const w={schema:1,tick:0,lastSimAt:now,sequence:0,jobSequence:0,eventSequence:0,nextInspectionTick:worldPacing().jobTicks,cooling:{load:20,mode:'normal',serviceDue:null},jobs:[],events:[],history:[],communications:[],reconciledSeconds:0};
 worldNewJob(w);return w;
}
function worldNormalize(raw,now){
 if(!worldObject(raw))return {world:worldInitial(now),repaired:raw!=null};
 if(Number(raw.schema)>1)return {world:null,repaired:false,future:true};
 let repaired=false;const w=worldClone(raw); // Normalize a copy; the untouched input must reach quarantine first.
 for(const [key,fallback,max] of [['tick',0,1e9],['sequence',0,1e9],['jobSequence',0,1e9],['eventSequence',0,1e9],['nextInspectionTick',10,1e9],['reconciledSeconds',0,1e12]]){
  const value=Math.floor(worldBound(w[key],0,max,fallback));if(w[key]!==value)repaired=true;w[key]=value;
 }
 w.schema=1;if(!Number.isFinite(w.lastSimAt)||w.lastSimAt<1)repaired=true;w.lastSimAt=worldBound(w.lastSimAt,1,1e15,now);
 if(!worldObject(w.cooling)){w.cooling={};repaired=true;}
 if(!Number.isFinite(w.cooling.load)||w.cooling.load<0||w.cooling.load>100||!['normal','isolated'].includes(w.cooling.mode))repaired=true;
 w.cooling={...w.cooling,load:worldBound(w.cooling.load,0,100,20),mode:['normal','isolated'].includes(w.cooling.mode)?w.cooling.mode:'normal',serviceDue:Number.isFinite(w.cooling.serviceDue)?w.cooling.serviceDue:null};
 const allowed={jobs:['available','accepted','checked','processing','review','complete','hold'],events:['detected','accepted','isolated','diagnosing','review','reported','resolved']};
 for(const key of ['jobs','events','history','communications']){
  const original=w[key];w[key]=Array.isArray(original)?original.filter(e=>worldObject(e)&&typeof e.id==='string'&&(!allowed[key]||allowed[key].includes(e.status))):[];
  if(!Array.isArray(original)||w[key].length!==original.length)repaired=true;
  // Duplicate identifiers never create two unresolved copies or duplicate completions.
  const seen=new Set();w[key]=w[key].filter(e=>{if(seen.has(e.id)){repaired=true;return false;}seen.add(e.id);return true;}).slice(0,{jobs:12,events:12,history:48,communications:16}[key]);
 }
 let activeSeen=false;w.events=w.events.filter(e=>{if(e.kind==='magi-cooling'&&e.status!=='resolved'){if(activeSeen){repaired=true;return false;}activeSeen=true;}return true;});
 for(const job of w.jobs){if(['checked','processing','review'].includes(job.status)&&!worldObject(job.evidence)){job.status='accepted';job.evidence=null;repaired=true;}if(job.status==='processing'&&!Number.isFinite(job.analysisDue)){job.status='checked';repaired=true;}}
 const incident=worldActiveIncident(w);if(incident){if(incident.status==='diagnosing'&&!Number.isFinite(incident.diagnosticDue)){incident.status='isolated';repaired=true;}if(incident.status==='reported'&&!Number.isFinite(incident.approvalDue)){incident.status='review';repaired=true;}const mode=['isolated','diagnosing','review','reported'].includes(incident.status)?'isolated':'normal';if(w.cooling.mode!==mode){w.cooling.mode=mode;repaired=true;}}else if(w.cooling.mode==='isolated'){w.cooling.mode='normal';repaired=true;}
 w.jobSequence=Math.max(w.jobSequence,...w.jobs.map(j=>Number(j.id.split('-').pop())||0));w.eventSequence=Math.max(w.eventSequence,...w.events.map(e=>Number(e.id.split('-').pop())||0));
 if(!w.jobs.length)worldNewJob(w);
 if(repaired)worldLog(w,'復元','世界状態の不正な項目・重複を補完しました。既存の機体・都市・業務記録は保持しています。');
 return {world:w,repaired};
}
function worldObserve(state){
 const w=state.world,e=w&&worldActiveIncident(w),intrusion=['detected','isolated','analyzed','countermeasure','failed'].includes(state.magi?.intrusion?.status)||['detected','analyzed','protected','failed'].includes(state.magi?.externalDefense?.status);
 const coolingHold=!!(e&&(w.cooling.mode==='isolated'||w.cooling.load>=90));
 const emergency=state.infra?.power===false||state.infra?.comms===false||intrusion||state.evas?.some(e=>e.state==='POWER_LOST')||state.defense?.status==='defeat'||state.defense?.city?.some(c=>c.hp<=0)||coolingHold;
 const watch=e||state.defense?.status==='active'||state.mission?.phase>0&&state.mission.phase<6;
 return {alert:emergency?'非常':watch?'警戒':'通常',magi:intrusion?'侵入対処中':coolingHold?'冷却系統点検・通常審議保留':w?.jobs?.some(j=>j.status==='processing')?'点検データ解析中':'三基稼働',magiHold:coolingHold,intrusion,power:state.infra?.power!==false,comms:state.infra?.comms!==false,city:state.defense?.city?.map(c=>c.hp)||[],evas:state.evas?.map((e,i)=>({unit:i,state:e.state,power:e.power,sync:e.sync,at:!!e.at}))||[],incident:e||null};
}
function worldAdvance(state,now){
 const w=state.world;if(!w||w.schema!==1)return false;
 if(now<w.lastSimAt){w.lastSimAt=now;worldLog(w,'時刻補正','端末時刻が戻りました。経過時間の二重処理を防ぎます。');return true;}
 const elapsed=now-w.lastSimAt,steps=Math.min(WORLD_MAX_STEPS,Math.floor(elapsed/WORLD_STEP));if(!steps)return false;
 if(elapsed>WORLD_MAX_STEPS*WORLD_STEP+WORLD_STEP){const held=Math.floor((elapsed-steps*WORLD_STEP)/1000);w.reconciledSeconds+=held;w.lastSimAt=now-steps*WORLD_STEP-(elapsed%WORLD_STEP);worldLog(w,'引継ぎ','長時間の離席を検出。6分相当まで引継ぎ、超過 '+held+'秒は保留しました。');}
 for(let i=0;i<steps;i++){
  w.tick++;w.lastSimAt+=WORLD_STEP;const observed=worldObserve(state),incident=worldActiveIncident(w);
  const analysis=w.jobs.some(j=>j.status==='processing')||incident?.status==='diagnosing';
  const load=observed.power?(analysis||observed.intrusion?6:state.defense?.status==='active'?3:worldPacing(state).idleLoad):0;
  w.cooling.load=Math.min(100,Math.max(0,w.cooling.load+(w.cooling.mode==='isolated'?-2:load)));
  if(w.cooling.serviceDue!==null&&w.tick>=w.cooling.serviceDue){if(!incident){w.cooling.load=Math.max(10,w.cooling.load-12);worldLog(w,'設備','技術部が点検報告に基づく予防整備を実施。冷却負荷を軽減しました。');}w.cooling.serviceDue=null;}
  for(const job of w.jobs){if(job.status==='processing'&&w.tick>=job.analysisDue){if(!observed.power||observed.intrusion||observed.magiHold)continue;job.status='review';worldLog(w,'解析','MAGIの点検データ照合が完了。上級職員への報告を待っています。',job.id);worldCommunication(w,'赤木リツコ / 技術開発部','点検データを照合したわ。内容を確認して報告を提出してください。復旧や発令の判断はこちらで行います。',job.id);}}
  if(!worldActiveIncident(w)&&w.cooling.load>=70&&worldCoolingReady(state)){
   w.eventSequence++;const e={id:'cooling-anomaly-'+w.eventSequence,kind:'magi-cooling',status:'detected',severity:w.cooling.load>=90?'critical':'watch',createdTick:w.tick,diagnosticDue:null,approvalDue:null};w.events.unshift(e);w.events=w.events.slice(0,12);
   worldLog(w,'異常','冷却負荷 '+Math.round(w.cooling.load)+'%から枝系統の流量異常を検出。模擬設備の点検が必要です。',e.id);worldCommunication(w,'伊吹マヤ / 技術局','MAGI冷却枝系統の負荷上昇を検知しました。案件を受領し、手順書に従って枝系統を隔離してください。',e.id);
  }
  const active=worldActiveIncident(w);
  if(active){
   if(w.cooling.load>=90&&active.severity!=='critical'){active.severity='critical';worldLog(w,'警戒移行','冷却負荷が90%に到達。通常審議を保留し、技術部への対応を優先します。',active.id);}
   if(active.status==='diagnosing'&&w.tick>=active.diagnosticDue&&observed.power&&!observed.intrusion){active.status='review';worldLog(w,'診断','枝系統の診断完了。流量低下を確認し、技術部への報告を待機。',active.id);worldCommunication(w,'赤木リツコ / 技術開発部','原因は冷却枝系統の流量低下。隔離は維持して、診断結果を報告してください。再接続は技術部が判断するわ。',active.id);}
   if(active.status==='reported'&&w.tick>=active.approvalDue&&observed.power&&!observed.intrusion){active.status='resolved';active.resolvedTick=w.tick;active.authorizedBy='赤木リツコ / 技術開発部';if(w.pacing)w.pacing.nextCoolingTick=w.tick+worldPacing(state).magiInterval;w.cooling.load=24;w.cooling.mode='normal';worldLog(w,'復旧承認','技術部が枝系統の整備・再接続を承認。MAGIの通常運用を再開しました。',active.id);worldCommunication(w,'赤木リツコ / 技術開発部','報告を受領。技術部で整備と再接続を完了したわ。通常の審議は改めて申請してください。',active.id);}
  }
  if(w.tick>=w.nextInspectionTick&&!w.jobs.some(j=>j.status!=='complete')){worldNewJob(w);w.nextInspectionTick=w.tick+worldPacing(state).jobTicks;}
 }
 return true;
}
function worldDispatch(state,action){
 const w=state.world;if(!w||w.schema!==1)throw Error('世界状態の引継ぎを完了してください');
 const observed=worldObserve(state),job=w.jobs.find(j=>j.status!=='complete'),incident=worldActiveIncident(w);
 const requireSystems=()=>{if(!observed.power||!observed.comms)throw Error('主電源・作戦通信の復旧が必要です');if(observed.intrusion)throw Error('MAGI侵入対処を先に完了してください');};
 if(action==='accept'){
  if(!job||!['available','hold'].includes(job.status))throw Error('受領できる日常業務がありません');job.status=job.evidence?'checked':'accepted';worldLog(w,'受領','冷却系統点検を受領。管制補助の権限内で表示確認を行います。',job.id);
 }else if(action==='inspect'){
  if(job?.status!=='accepted')throw Error('点検業務を先に受領してください');job.evidence={tick:w.tick,load:w.cooling.load,power:observed.power,comms:observed.comms,mode:w.cooling.mode};job.status='checked';worldLog(w,'点検','冷却系統・主電源・通信の実際の模擬表示を確認しました。',job.id);
 }else if(action==='analyze'){
  requireSystems();if(job?.status!=='checked')throw Error('点検結果の確認が先です');if(observed.magiHold)throw Error('冷却異常の対処中。通常解析を保留します');job.status='processing';job.analysisDue=w.tick+1;worldLog(w,'解析依頼','MAGIへ点検データの照合を依頼。次の30秒更新で完了予定。',job.id);
 }else if(action==='report'){
  requireSystems();if(job?.status!=='review')throw Error('解析結果の到着を待ってください');job.status='complete';job.completedTick=w.tick;w.nextInspectionTick=w.tick+worldPacing(state).jobTicks;w.cooling.serviceDue=w.tick+1;worldLog(w,'報告完了','点検・解析結果を技術部へ提出。予防整備の判断を引き継ぎました。',job.id);worldCommunication(w,'伊吹マヤ / 技術局','点検報告を受領しました。次の当直へ記録を共有します。',job.id);
 }else if(action==='hold'){
  if(!job||['complete','processing','review'].includes(job.status))throw Error('この業務は保留できません');job.status='hold';worldLog(w,'保留','点検業務を保留。受領し直して再開できます。',job.id);
 }else if(action==='incidentAccept'){
  if(incident?.status!=='detected')throw Error('未受領の異常案件はありません');incident.status='accepted';worldLog(w,'異常受領','冷却枝系統の異常案件を受領。隔離手順を確認します。',incident.id);
 }else if(action==='isolate'){
  if(incident?.status!=='accepted')throw Error('異常案件を先に受領してください');w.cooling.mode='isolated';incident.status='isolated';worldLog(w,'枝系統隔離','手順書で許可された異常枝系統のみを隔離。通常審議を保留しました。',incident.id);
 }else if(action==='diagnose'){
  requireSystems();if(incident?.status!=='isolated')throw Error('枝系統の隔離が先です');incident.status='diagnosing';incident.diagnosticDue=w.tick+1;worldLog(w,'診断依頼','隔離系統の独立診断を技術部へ依頼。次の30秒更新を待機。',incident.id);
 }else if(action==='incidentReport'){
  requireSystems();if(incident?.status!=='review')throw Error('診断結果を待ってください');incident.status='reported';incident.approvalDue=w.tick+1;worldLog(w,'上申','診断結果を赤木リツコへ報告。復旧承認を待機します。',incident.id);
 }else if(action==='readCommunications'){
  w.communications=w.communications.map(c=>({...c,read:true}));worldLog(w,'通信受領','部署間の未読連絡を受領しました。');
 }else throw Error('管制補助 C-3 の許可された業務ではありません');
}
