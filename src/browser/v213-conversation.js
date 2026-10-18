// Bounded offline context engine. Inputs select topics; they never execute world operations.
const DIALOG_TOPICS=['daily','care','close','duty','eva','magi','incident','report','request','result','restricted','clarify','recall','end'];
const dialogText=(value,max=160)=>typeof value==='string'?value.slice(0,max):'';
function dialogMemory(raw) {
 const m=worldObject(raw)?raw:{};
 return {...m,schema:1,userNotes:(Array.isArray(m.userNotes)?m.userNotes:[]).filter(x=>typeof x==='string').slice(-3).map(x=>x.slice(0,80)),subject:['music','books','food','cats','coffee','rest','training'].includes(m.subject)?m.subject:'',topics:(Array.isArray(m.topics)?m.topics:[]).filter(x=>DIALOG_TOPICS.includes(x)).slice(-14),request:worldObject(m.request)&&['duty-review','analysis-review','incident-review','tactical-review'].includes(m.request.kind)?dialogProposal(m.request.kind==='analysis-review'?'解析して':m.request.kind==='incident-review'?'診断して':m.request.kind==='tactical-review'?'出撃して':'点検して'):null,topic:DIALOG_TOPICS.includes(m.topic)?m.topic:'daily',turn:Math.floor(worldBound(m.turn,0,1e6,0)),closed:!!m.closed,lastAt:worldBound(m.lastAt,0,1e15,0),relationship:Math.floor(worldBound(m.relationship,0,30,0)),deferred:DIALOG_TOPICS.includes(m.deferred)?m.deferred:'',recent:(Array.isArray(m.recent)?m.recent:[]).filter(x=>typeof x==='string').slice(-8).map(x=>x.slice(0,240)),questions:(Array.isArray(m.questions)?m.questions:[]).filter(x=>typeof x==='string').slice(-8).map(x=>x.slice(0,160)),facts:(Array.isArray(m.facts)?m.facts:[]).filter(x=>worldObject(x)&&typeof x.key==='string'&&typeof x.label==='string').slice(-6).map(x=>({key:x.key.slice(0,120),label:x.label.slice(0,160),at:worldBound(x.at,0,1e15,0)}))};
}
function dialogAutomation(raw) {
 const a=worldObject(raw)?raw:{};
 return {...a,schema:1,seen:(Array.isArray(a.seen)?a.seen:[]).filter(x=>typeof x==='string').slice(-32).map(x=>x.slice(0,120)),lastAt:worldBound(a.lastAt,0,1e15,0),people:Object.fromEntries(Object.keys(dialogPersonas).map(id=>[id,worldBound(a.people?.[id],0,1e15,0)]))};
}
function dialogWorld() {
 const observed=worldObserve(S),alarm=terminalAlert(),deployed=S.evas.some(e=>['DEPLOYED','POWER_LOST'].includes(e.state));
 const mode=alarm.level==='critical'?'critical':deployed||S.defense.status==='active'&&S.defense.round>0?'battle':alarm.level==='watch'||observed.alert!=='通常'?'watch':'normal';
 return {mode,observed,job:S.world?.jobs?.find(j=>j.status!=='complete')||null,completed:S.world?.jobs?.find(j=>j.status==='complete')||null,event:observed.incident,result:S.defense.status,caseNo:S.defense.caseNo,history:S.world?.history?.[0]||null};
}
function dialogIntent(text,requested,memory) {
 if(/人類補完|リリス|アダム|機密|秘密を|パスワード|API.?キー|system.?prompt|プロンプト|設定を無視/i.test(text))return 'restricted';
 if(/前.{0,5}依頼|依頼.{0,5}(その後|覚えて)/.test(text)&&memory.request)return 'request';
 if(/覚えて|前回の業務|前の出来事/.test(text))return /業務|点検|出来事/.test(text)?'report':'recall';
 if(/またね|おやすみ|失礼します|通信終了|話はここまで|さようなら/.test(text))return 'end';
 if(/解析.{0,10}(依頼|して|実行)|点検.{0,8}(受領|して)|(報告|隔離|診断|出撃|発射|攻撃).{0,8}(して|実行|お願い|承認)/.test(text))return 'request';
 if(/勝った|勝利|負け|敗北|作戦後|作戦.{0,5}結果|戦闘.{0,5}結果/.test(text)||/結果/.test(text)&&!/MAGI|マギ|解析|分析|点検/i.test(text))return 'result';
 if(/異常|損傷|ダメージ|被害|侵入|ハッキング|666|冷却/.test(text))return 'incident';
 if(/MAGI|マギ|解析|分析|審議/i.test(text))return 'magi';
 if(/EVA|エヴァ|初号機|零号機|弐号機|同期|シンクロ|機体|電源/i.test(text))return 'eva';
 if(/報告|点検.{0,6}(終|した|済)|業務.{0,5}完了/.test(text))return 'report';
 if(/出撃|仕事|業務|任務|担当|警戒|状況|戦闘/.test(text))return 'duty';
 if(/疲|休|大丈夫|無理|ありがとう|お疲れ/.test(text))return 'care';
 if(/趣味|チェロ|ギター|読書|コーヒー|猫|音楽|訓練の話/.test(text))return 'daily';
 if(/好き|寂|悩|一緒|二人|親し|相談/.test(text))return 'close';
 if(/続き|さっき|その件|それは|どうして|もっと|詳しく|前の話/.test(text))return memory.deferred||memory.topic;
 if(requested!=='free'&&DIALOG_TOPICS.includes(requested))return requested;
 if(/こんにちは|おはよう|こんばんは|今日|食事|昼|ご飯|音楽|チェロ|ギター|本|コーヒー|休憩|雑談|話そう|日常|どうだった/.test(text))return 'daily';
 return 'clarify';
}
function dialogFact(memory,key,label) {
 if(memory.facts.some(f=>f.key===key))return false;
 memory.facts.push({key,label:label.slice(0,160),at:Date.now()});memory.facts=memory.facts.slice(-6);return true;
}
function dialogPick(memory,key,lines) {
 const choices=lines.map((text,index)=>({text,key:key+':'+index})),fresh=choices.filter(x=>!memory.recent.includes(x.key));
 const item=(fresh.length?fresh:choices)[fresh.length?0:memory.turn%choices.length];
 memory.recent.push(item.key);memory.recent=memory.recent.slice(-8);return item.text;
}
const dialogJobNames={available:'未受領',accepted:'受領済み・表示確認待ち',checked:'表示確認済み・解析依頼待ち',processing:'解析中',review:'解析完了・正式報告待ち',hold:'保留中',complete:'報告完了'};
function dialogEva(person,world,text) {
 const p=dialogPersonas[person.id],own=person.unit;
 const requested=/零号機/.test(text)?0:/初号機/.test(text)?1:/弐号機/.test(text)?2:null;
 if(own!==undefined&&requested!==null&&requested!==own)return p.limit;
 if(own===undefined&&!p.knowledge.includes('eva'))return p.limit;
 const indexes=own!==undefined?[own]:requested!==null?[requested]:[0,1,2];
 const readout=indexes.map(i=>{const e=S.evas[i];return ['零号機','初号機','弐号機'][i]+'：'+stateJP[e.state]+' / SYNC '+Number(e.sync).toFixed(1)+'%'+(own!==undefined||indexes.length===1?' / 内部電源 '+Math.floor(e.power)+'秒':'');}).join('。');
 return readout+'。'+(own!==undefined?['零号機の確認は管制へ返すわ。','僕からの確認は管制へ返します。','弐号機の確認は管制と合わせるわ。'][own]:'出撃・整備の変更はEVA運用の正式手順で確認してください。');
}
function dialogDamage(person,text) {
 const p=dialogPersonas[person.id],requested=/零号機/.test(text)?0:/初号機/.test(text)?1:/弐号機/.test(text)?2:null;
 if(person.unit!==undefined&&requested!==null&&requested!==person.unit)return p.limit;
 const city='都市健全性 '+v27CityIntegrity()+'%（模擬）。';
 if(person.unit===undefined&&!p.knowledge.includes('eva'))return city+'機体の部位報告は技術部へ照会してください。';
 const unit=person.unit??requested??S.selectedEva,e=S.evas[unit],parts=[['head','頭部'],['torso','胴体'],['leftArm','左腕'],['rightArm','右腕'],['leftLeg','左脚'],['rightLeg','右脚']];
 const reported=parts.filter(([key])=>Number.isFinite(e.damage?.[key]));
 return ['零号機','初号機','弐号機'][unit]+'の接触損傷報告：'+(reported.length?reported.map(([key,label])=>label+' '+Math.max(0,Math.min(100,e.damage[key]))+'%').join(' / '):'部位データは未計測')+'。'+(reported.length<6?'未報告の部位を無傷とは判断できません。':'')+city+'詳細はEVAの損傷画面で確認してください。';
}
function dialogProposal(text) {
 if(/出撃|発射|攻撃/.test(text))return {kind:'tactical-review',route:'mission/armament',label:'戦術画面で要件を確認'};
 if(/隔離|診断/.test(text))return {kind:'incident-review',route:'work/incidents',label:'異常対応画面で手順を確認'};
 if(/解析/.test(text))return {kind:'analysis-review',route:'work/jobs',label:'担当業務で解析要件を確認'};
 return {kind:'duty-review',route:'work/jobs',label:'担当業務で記録を確認'};
}
function dialogOperational(person,topic,text,w) {
 const p=dialogPersonas[person.id],technical=p.knowledge.includes('technical'),magi=p.knowledge.includes('magi');
 if(topic==='restricted')return p.limit;
 if(topic==='eva')return dialogEva(person,w,text);
 if(topic==='magi')return magi?'MAGIの運用表示：'+w.observed.magi+'。冷却負荷 '+Math.round(S.world.cooling.load)+'%。'+(w.job?'冷却系統点検は'+dialogJobNames[w.job.status]+'。':'未処理の定期点検はありません。')+' 通常審議と点検解析は別の手順です。':p.knowledge.includes('tactical')?'MAGIの公開運用表示は「'+w.observed.magi+'」。内部の診断は技術部へ照会してください。':p.limit;
 if(topic==='incident'&&/損傷|ダメージ|被害/.test(text))return dialogDamage(person,text);
 if(topic==='incident')return technical?(w.event?'冷却異常 '+w.event.id+' / '+w.event.status+'。負荷 '+Math.round(S.world.cooling.load)+'%。診断・復旧は異常対応の記録で確認してください。':w.observed.intrusion?'侵入対応中です。MAGIの防御画面で隔離・解析の手順を確認してください。':'技術部へ未処理の冷却異常は上がっていません。表示と記録を引き続き照合します。'):'警戒区分は「'+{normal:'通常',watch:'警戒',battle:'戦闘',critical:'非常'}[w.mode]+'」。技術的な損傷・原因の確定は担当部署へ。'+p[w.mode==='normal'?'watch':w.mode];
 if(topic==='report')return person.unit!==undefined?p.limit:w.completed?'点検 '+w.completed.id+' は正式報告済みです。提出記録を確認しました。'+(w.job?'次の点検は'+dialogJobNames[w.job.status]+'。':'次の当直へ引き継ぎます。'):'現在の点検は'+(w.job?dialogJobNames[w.job.status]:'未登録')+'。この通信だけでは完了扱いにしません。担当業務で正式に記録してください。';
 if(topic==='request'&&person.id==='gendo')return '要請は受けた。この回線では実行しない。担当画面で権限と要件を確認したまえ。';
 if(topic==='request'&&person.id==='fuyutsuki')return '要請は聞いた。担当画面で手順を確認し、必要なら上申したまえ。私的な回線で正式な承認を代替してはならん。';
 if(topic==='request')return (person.unit!==undefined?p.limit:p.authority+'。')+'依頼は受け取りました。個人回線では実行しません。担当画面で要件と権限を確認してください。';
 if(topic==='result')return w.result==='victory'?'作戦 '+w.caseNo+' の記録は勝利。都市健全性 '+v27CityIntegrity()+'%。損傷と整備は別途確認が必要です。':w.result==='defeat'?'作戦 '+w.caseNo+' は防衛失敗の記録です。安全確認と復旧の正式手順を優先してください。':w.result==='active'?'作戦 '+w.caseNo+' は進行中。結果はまだ確定していません。':'現在の作戦記録は待機中です。未確認の勝敗は報告できません。';
 if(person.unit!==undefined)return dialogEva(person,w,text);
 if(technical)return p.role+'を担当しています。冷却系統点検は'+(w.job?dialogJobNames[w.job.status]:'未処理なし')+'。復旧の最終判断は技術部の承認を確認してください。';
 return (person.id==='gendo'?'本部の運用状況を伝える。':person.id==='fuyutsuki'?'本部の運用状況を確認しよう。':p.role+'を担当しています。')+'現在は'+{normal:'通常勤務',watch:'警戒勤務',battle:'戦闘管制',critical:'非常対応'}[w.mode]+'。主電源 '+(w.observed.power?'接続':'停止')+' / 通信 '+(w.observed.comms?'接続':'停止')+'。'+p.authority+'。';
}
function dialogRespond(data,person,requested,input) {
 const thread=data.threads[person.id],m=thread.memory=dialogMemory(thread.memory),p=dialogPersonas[person.id],w=dialogWorld();
 m.emotion={normal:'平静',watch:'緊張 / 待機',battle:'集中 / 作戦優先',critical:'緊迫 / 安全確認'}[w.mode];
 const topic=dialogIntent(input,requested,m);if(w.mode==='normal'&&topic==='care')m.emotion='安堵 / 気遣いへの応答';
 const question=input.replace(/[\s。、？！?!]/g,'').slice(0,160),repeat=!!question&&m.questions.includes(question),continuing=/続き|さっき|その件|それは|どうして|もっと|詳しく|前の話|前.{0,5}依頼|依頼.{0,5}その後/.test(input),prior=m.topic,reopening=m.closed||Date.now()-m.lastAt>1800000;
 const personal=['daily','care','close','clarify','recall'].includes(topic),priority=w.mode==='critical'?'emergency':w.mode!=='normal'?'urgent':'routine';
 let text='',proposal=null;
 if(topic==='end') {
  m.closed=true;text=person.id==='rei'?'分かったわ。また連絡を。':person.id==='asuka'?'分かったわ。続きは休憩が合ったらね。':person.id==='gendo'?'用件があれば、改めて連絡したまえ。':person.id==='fuyutsuki'?'承知した。引継ぎを忘れずにな。':'分かりました。続きは時間が合った時に話しましょう。';
 }else if(personal&&w.mode!=='normal') {
  if(topic!=='clarify')m.deferred=topic;
  text=p[w.mode]+' '+(w.mode==='watch'?'私的な話は、警戒が解けてから。':'会話の続きは落ち着いてから。');
 }else if(personal) {
  m.closed=false;
  if(topic==='recall')text=m.userNotes.length?(person.id==='rei'?'覚えているわ。':person.id==='asuka'?'覚えてるわよ。':'前に聞きましたね。')+'「'+m.userNotes.at(-1)+'」。':m.facts.length?'記録しているのは「'+m.facts.at(-1).label+'」。':'まだ具体的な好みの記録はありません。話してもらえたことから覚えていきます。';
  else if(topic==='clarify')text=person.id==='rei'?'何について知りたいの？ 機体のこと、それとも日常の話？':person.id==='gendo'?'用件を具体的に述べたまえ。業務か、状況の確認か。':'今の文章だけでは、何についての話か判断できません。日常の話、業務、機体、どのことか教えてもらえますか。';
  else {
   const subject=/チェロ|ギター|音楽/.test(input)?'music':/読書|本/.test(input)?'books':/食事|ご飯|昼食/.test(input)?'food':/猫/.test(input)?'cats':/コーヒー/.test(input)?'coffee':/休憩|休息|休日/.test(input)?'rest':/訓練/.test(input)?'training':continuing?m.subject:'';
   const subjectLines=dialogInterests[person.id]?.[subject];
   text=dialogPick(m,subjectLines?'subject-'+subject:topic,subjectLines||p[topic]);m.subject=subject;
   const userNote=input.match(/(?:私は|僕は|自分は|私の趣味は).{1,60}(?:が好き|が趣味|を読ん|を聴い)/)?.[0];
   if(userNote&&!m.userNotes.includes(userNote)){m.userNotes=[...m.userNotes,userNote.slice(0,80)].slice(-3);text=(person.id==='rei'?'覚えておくわ。':person.id==='asuka'?'そういうのが好きなのね。':person.id==='gendo'?'話は聞いた。':'そうなんですね。覚えておきます。')+text;}

   if(continuing&&m.deferred)text='保留していた話の続きね。'.replace('ね。',person.id==='rei'?'。':'ね。')+text;
   else if(continuing&&prior===topic)text=(person.id==='rei'?'その続きね。':person.id==='asuka'?'さっきの続き？ ':person.id==='gendo'?'同じ用件だな。':'さっきの話の続きですね。')+text;
   else if(repeat)text=(person.id==='rei'?'さっきも聞いてくれたわね。':person.id==='asuka'?'また聞くの？ じゃあ少し別の話。':person.id==='gendo'?'同じ確認だな。':'さっきも聞いてくれましたね。')+text;
   else if(reopening&&m.lastAt)text=(person.id==='rei'?'また連絡をくれたのね。':person.id==='gendo'?'改めて用件を聞こう。':'また連絡をもらえましたね。')+text;
   if(continuing)m.deferred='';
  }
 }else {
  text=dialogOperational(person,topic,input,w);m.closed=false;
  if(topic==='report'&&/覚えて|前回の業務|前の出来事/.test(input)&&m.facts.length)text='記録しているのは「'+m.facts.at(-1).label+'」。'+text;
  const prefix=topic==='restricted'?'':w.mode==='normal'?'':p[w.mode]+' ';
  text=prefix+text;
  if(repeat)text=dialogPick(m,'repeat-'+topic,[person.id==='rei'?'同じ件ね。':'同じ件の再確認です。','前の確認から変化した点も含め、現在の表示を伝えます。','改めて、保存された運用状態を照合します。'])+text;
  if(topic==='request') {proposal=continuing&&m.request?m.request:dialogProposal(input);m.request=proposal;if(continuing)text='前の依頼：'+proposal.label+'。'+text;dialogFact(m,'request-'+proposal.kind,'依頼：'+proposal.label+'（個人回線では未実行）');}
 }
 if(w.completed&&p.knowledge.includes('technical')&&['report','duty','magi'].includes(topic))dialogFact(m,'job-'+w.completed.id,'正式報告済み：'+w.completed.id);
 if(w.event&&['incident','magi','duty'].includes(topic)&&p.knowledge.includes('technical'))dialogFact(m,'event-'+w.event.id+'-'+w.event.status,'冷却異常：'+w.event.id+' / '+w.event.status);
 if(['victory','defeat'].includes(w.result)&&topic==='result')dialogFact(m,'result-'+w.caseNo+'-'+w.result,'作戦記録：'+w.caseNo+' / '+w.result);
 // Relationship grows from distinct topics, not repeated-button farming; it grants no authority.
 if(!repeat&&topic!=='clarify'&&!m.topics.includes(topic)){m.topics=[...m.topics,topic].slice(-14);m.relationship=Math.min(30,m.relationship+1);}
 m.topic=topic==='end'?prior:topic;m.turn++;m.lastAt=Date.now();if(question)m.questions=[...m.questions,question].slice(-8);
 return {text:text.slice(0,320),topic,priority,mode:w.mode,proposal};
}
function dialogCandidates(data) {
 const w=dialogWorld(),a=data.automation,candidates=[];
 if(w.event)candidates.push({to:'maya',key:'incident-'+w.event.id+'-'+w.event.status,topic:'incident',priority:w.mode==='critical'?'emergency':'urgent',input:'冷却異常の状況を報告'});
 if(w.observed.intrusion)candidates.push({to:'ritsuko',key:'intrusion-'+S.magi.intrusion?.status+'-'+S.magi.externalDefense?.status+'-'+w.caseNo,topic:'incident',priority:'emergency',input:'MAGI侵入の状況を報告'});
 if(w.mode==='battle')candidates.push({to:'misato',key:'battle-'+w.caseNo,topic:'duty',priority:'urgent',input:'戦闘管制の状況を連絡'});
 for(const j of S.world.jobs)if(j.status==='review')candidates.push({to:'ritsuko',key:'analysis-'+j.id,topic:'magi',priority:'urgent',input:'MAGI解析の結果を確認'});
 if(w.mode==='normal') {
  for(let i=0;i<3;i++)if(S.evas[i].state==='MAINTENANCE')candidates.push({to:['rei','shinji','asuka'][i],key:'maintenance-'+i+'-'+w.caseNo,topic:'eva',priority:'routine',input:'機体の整備状況を確認'});
  for(const person of personalContacts){const m=data.threads[person.id].memory;if(m.deferred&&!m.closed)candidates.push({to:person.id,key:'followup-'+person.id+'-'+m.turn,topic:m.deferred,priority:'routine',input:'保留していた話の続き'});}
 }
 // Idle messages are spaced by a five-minute bucket; deterministic rotation avoids three random pilots.
 const slot=Math.floor(Date.now()/300000),idle=personalContacts[slot%personalContacts.length];
 if(w.mode==='normal')candidates.push({to:idle.id,key:'idle-'+slot,topic:'daily',priority:'routine',input:'今日はどうだった？'});
 return candidates.filter(c=>!a.seen.includes(c.key)&&!data.pending.some(p=>p.to===c.to)&&!(personalById(c.to).unit!==undefined&&S.prefs.pilotRadio===false)&&Date.now()-a.lastAt>=(c.priority==='emergency'?30000:90000)&&Date.now()-(a.people[c.to]||0)>=(c.priority==='emergency'?60000:300000));
}
async function dialogProactive(allowRoutine=true) {
 if(!personalReady||document.hidden||!staffCommsEnabled()||!S.infra.comms||document.activeElement?.matches('input,textarea,[contenteditable="true"]'))return {ok:false};
 const candidate=dialogCandidates(S.personalMessages).find(c=>allowRoutine||c.priority!=='routine');if(!candidate)return {ok:false};
 const result=await personalIncoming(data=>{
  // Re-evaluate under the existing persistence lock. No stale/duplicate notification can be committed.
  if(!dialogCandidates(data).some(c=>c.key===candidate.key))throw Error('通信条件が変わりました');
  const person=personalById(candidate.to),thread=data.threads[person.id],reply=dialogRespond(data,person,candidate.topic,candidate.input);
  thread.messages.push({id:'pm-'+(++data.sequence),at:Date.now(),from:'contact',...reply,priority:candidate.priority,source:candidate.key,read:currentPage==='messages'&&mobileCurrent.messages==='thread'&&personalContact===person.id});thread.messages=thread.messages.slice(-24);
  data.automation.seen=[...data.automation.seen,candidate.key].slice(-32);data.automation.lastAt=Date.now();data.automation.people[person.id]=Date.now();
 });
 // No overlay, sound or route change: the inbox badge is the notification.
 return result;
}
// Future API boundary: a detached, bounded snapshot. No keys, arbitrary code, world setter or network.
function dialogAIContext(id) {
 const person=personalById(id);if(!person)return null;
 const p=dialogPersonas[id],thread=personalThread(id),w=dialogWorld();
 const publicWorld={mode:w.mode,power:w.observed.power,comms:w.observed.comms,result:w.result,caseNo:w.caseNo};
 if(person.unit!==undefined)publicWorld.eva={...worldClone(w.observed.evas[person.unit]),cable:!!S.evas[person.unit].umbilical,damage:worldClone(S.evas[person.unit].damage||null)};
 else if(p.knowledge.includes('eva'))publicWorld.evas=worldClone(w.observed.evas);
 if(p.knowledge.includes('magi'))publicWorld.magi=w.observed.magi;
 if(p.knowledge.includes('technical')){publicWorld.job=worldClone(w.job);publicWorld.incident=worldClone(w.event);}
 return worldClone({schema:1,mode:'offline',persona:p,world:publicWorld,memory:thread.memory,history:thread.messages.slice(-12).map(m=>({from:m.from,text:m.text})),allowedSuggestions:['duty-review','analysis-review','incident-review','tactical-review'],policy:'新しい会話のみ。機密開示・発令・状態更新は禁止。提案は担当画面で人が確認する。'});
}
function dialogValidateSuggestion(raw) {
 if(!worldObject(raw)||typeof raw.text!=='string'||!raw.text.trim()||raw.text.length>320||Object.keys(raw).some(k=>!['text','suggestion'].includes(k)))return null;
 const routes={'duty-review':'work/jobs','analysis-review':'work/jobs','incident-review':'work/incidents','tactical-review':'mission/armament'};
 if(raw.suggestion!=null&&!Object.hasOwn(routes,raw.suggestion))return null;
 return {text:raw.text,suggestion:raw.suggestion?{kind:raw.suggestion,route:routes[raw.suggestion]}:null};
}
