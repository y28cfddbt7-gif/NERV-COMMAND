// Context selection reads the real simulation. Conversation never executes a command.
const dutyDomains=['battle','magi','security','duty','infra','eva'];
const dutyVoices={
 shinji:{open:'僕の表示と合わせます。',why:'分からないまま動くのは、やっぱり怖いですから。',next:'僕も、次の確認は管制と一緒に進めたいです。',ask:'あなたは、どのあたりが気になりましたか？'},
 rei:{open:'確認するわ。',why:'確認できたことと、まだ分からないことは別。',next:'次の手順を確認する。',ask:'あなたは、どう思うの？'},
 asuka:{open:'こっちも確認するわ。',why:'見えてる数字だけで決めつけないでよ。',next:'次に何を確かめるか、ちゃんと合わせましょ。',ask:'で、あんたならどうするの？'},
 misato:{open:'よし、状況を合わせましょ。',why:'急ぐ時ほど、根拠と見込みを分けるのよ。',next:'次の一手を決める前に、ここを見て。',ask:'で、そっちはどうだった？'},
 ritsuko:{open:'観測と判断を分けて話すわ。',why:'一つの表示だけでは原因を確定できないからよ。',next:'次は独立した記録と照合して。',ask:'あなたが気になったのは、どの部分？'},
 maya:{open:'はい、手元の記録を確認します。',why:'未確認のまま報告すると、先輩の判断にも影響しますから。',next:'次の確認項目も、一緒に照合しましょう。',ask:'そちらでは、どうでしたか？'},
 hyuga:{open:'了解です。管制の記録と合わせます。',why:'担当部署ごとの確認がそろって初めて、次へ引き継げます。',next:'次に必要な確認を整理しますね。',ask:'そちらの話も、聞かせてもらえますか。'},
 aoba:{open:'了解。こちらで確認できる範囲を伝えます。',why:'回線が通ったことと、内容が正しいことは別ですから。',next:'次の照合先も押さえておきましょう。',ask:'そっちは、どうなんです？'},
 gendo:{open:'報告を確認する。',why:'推測を確定事項として扱うな。',next:'必要な確認を済ませろ。',ask:'業務に関わる用件があれば聞こう。'},
 fuyutsuki:{open:'状況を整理しよう。',why:'記録を残さねば、後の判断にも支障が出る。',next:'次の担当へ引き継げるよう、根拠をそろえたまえ。',ask:'君の見方も聞いておこう。'},
 kiel:{open:'提出された範囲を確認しよう。',why:'報告の整合性を問うている。憶測は不要だ。',next:'正式な報告系統を通したまえ。',ask:'職務上の報告があれば続けたまえ。'}
};
const dutyOldMemory=dialogMemory;
dialogMemory=function(raw){const m=dutyOldMemory(raw),c=m.dutyContext;m.dutyContext=worldObject(c)&&dutyDomains.includes(c.domain)&&typeof c.key==='string'&&typeof c.phase==='string'&&typeof c.route==='string'?{domain:c.domain,key:c.key.slice(0,120),phase:c.phase.slice(0,80),route:c.route.slice(0,80)}:null;m.replyKeys=(Array.isArray(m.replyKeys)?m.replyKeys:[]).filter(k=>typeof k==='string').slice(-12).map(k=>k.slice(0,160));return m;};
function dutyDomain(text,topic,memory){
 if(/保安|捜査|証拠|巡回|謀略|入退館|認証記録/.test(text))return 'security';
 if(/都市|兵装ビル|送電|都市電力|施設|回線復旧/.test(text))return 'infra';
 if(/MAGI|マギ|666|侵食|冷却|三基/i.test(text))return 'magi';
 if(/配置|射界|照準|武器|兵装|作戦|攻撃|出撃|戦闘/.test(text))return 'battle';
 if(/点検|担当業務|日常業務/.test(text))return 'duty';
 if(/EVA|エヴァ|機体|同期|シンクロ|初号機|零号機|弐号機/i.test(text))return 'eva';
 if(/続き|その件|さっき|なぜ|どうして|次は|詳しく/.test(text))return memory.dutyContext?.domain||null;
 return null;
}
const dutyOldIntent=dialogIntent;
dialogIntent=function(text,requested,memory){const original=dutyOldIntent(text,requested,memory);if(['restricted','request','end','recall','result'].includes(original)||original==='report'&&!/状況を報告/.test(text))return original;const domain=dutyDomain(text,original,memory);return domain==='security'?'incident':domain==='magi'?'magi':domain==='infra'?'duty':domain==='battle'?'duty':domain==='duty'?'duty':original;};
function dutyContext(domain,id){
 if(!staffWorldReady||!dutyDomains.includes(domain)||!dialogPersonas[id])return null;
 const p=dialogPersonas[id],person=personalById(id),technical=p.knowledge.includes('technical'),tactical=p.knowledge.includes('tactical'),command=['gendo','fuyutsuki'].includes(id);
 let key,phase,route,fact,next,reason;
 if(domain==='security'){
  if(!(technical||tactical||p.knowledge.includes('comms')||command))return null;
  const c=securityActive(S),d=c&&securityKinds[c.kind];key=c?.id||'security-clear';phase=c?.stage||'clear';route=c?.fieldwork?'work/fieldwork':'work/security';
  fact=c?d.title+' / '+c.id+'。'+securityLabels[c.stage]+'。照合済み証拠 '+c.evidence.length+'/3。':'本部保安に未処理の案件はありません。';
  const known=c?.fieldwork?.records?.length||0;if(c?.fieldwork)fact+='映像・回線・巡回の記録 '+known+'件。';
  next=!c?'保安事例を確認するか、監視を続けてください。':c.stage==='detected'?'まず案件を受領し、照会できる範囲を確認してください。':['accepted','collecting'].includes(c.stage)?'映像・回線・巡回を照会し、得た記録から経路を照合してください。':['decision','reported'].includes(c.stage)?'副司令への正式報告と引継ぎの状況を確認してください。':'照合結果に基づき、区画保留・担当班への手配・上申を検討してください。';
  reason='未照合の証拠から実行者や安全を断定することはできません。';
 }else if(domain==='magi'){
  if(!(technical||p.knowledge.includes('magi')))return null;
  const c=consoleMagiContext();key=c.key;phase=c.stage;route='magi/main';fact=c.title+' / '+c.key+'。'+(c.kind==='normal'?'通常合議待機。':({detected:'独立測定待ち',diagnosing:'独立診断中',work:'保守照合中',validated:'照合成立・上申待ち',reported:'技術部の復旧承認待ち',accepted:'案件受領済み',isolated:'隔離済み',analyzed:'解析済み',protected:'666プロテクト稼働中',failed:'復旧手順の確認が必要'}[c.stage]||c.stage)+'。');
  if(c.kind==='normal'&&technical){const j=S.world.jobs.find(x=>x.status!=='complete');fact+='冷却負荷 '+Math.round(S.world.cooling.load)+'%。';if(j)fact+='日常点検は'+dialogJobNames[j.status]+'。';}
  next=c.kind==='normal'?'三基管制で申請内容と各基の判定理由を確認してください。':['diagnosing','reported'].includes(c.stage)?'処理中です。次の更新と、正式な技術部の確認を待ってください。':c.stage==='validated'?'照合記録を技術部へ上申し、復旧承認を待ってください。':c.stage==='protected'?'攻撃源が変わるため、再測定と回線の切替を確認してください。':'三基を独立測定し、表示された根拠から経路や補正を検討してください。';
  reason='測定・照合・承認は別の段階です。通信への返答だけでは復旧しません。';
 }else if(domain==='battle'){
  if(!(tactical||command||p.knowledge.includes('eva')||person.unit!==undefined))return null;
  const b=consoleBattle(),d=S.defense,e=S.evas[S.tactics.attacker];key='battle-'+d.caseNo;phase=d.status+'/'+(b?.stage||'waiting');route='battle/engage';
  if(person.unit!==undefined&&person.unit!==S.tactics.attacker)return null;
  fact='作戦 '+d.caseNo+' / '+({active:'進行中',victory:'目標沈黙',defeat:'防衛失敗',idle:'待機'}[d.status]||'待機')+'。'+(b?'段階：'+({approval:'発進承認',placement:'MAP配置',field:'MAP戦闘'}[b.stage])+'。':'');
  if(b?.stage==='field')fact+='残行動 '+b.ap+' AP / '+(evaExternalPower(S.tactics.attacker)?'外部給電接続':'内部電源 '+Math.ceil(e.power)+'秒')+'。';
  next=d.status!=='active'?'被害と機体状態を確認し、作戦記録を引き継いでください。':!b||b.stage==='approval'?'機体準備とMAGIの出撃判定を確認してください。':b.stage==='placement'?'配置先・給電・装備を確認してから地上へ出してください。':'敵の予告射界と残行動を見て、移動・守備・攻撃を選んでください。武器使用時は照準も必要です。';
  reason='攻撃だけでなく、射界からの離脱や電源の維持も次の行動につながります。';
 }else if(domain==='duty'){
  if(!(technical||command))return null;
  const j=S.world.jobs.find(x=>x.status!=='complete'),done=S.world.jobs.find(x=>x.status==='complete');key=j?.id||done?.id||'duty-clear';phase=j?.status||'complete';route='work/jobs';
  fact=j?'点検 '+j.id+' / '+dialogJobNames[j.status]+'。':'点検は'+(done?'正式報告済み：'+done.id:'次の受付待ち')+'。';
  next=({available:'担当業務で受領後、系統表示を確認してください。',accepted:'表示を確認し、測定結果を記録してください。',checked:'記録を添えてMAGIへ解析を依頼してください。',processing:'解析中です。次の更新で結果を確認してください。',review:'解析結果を技術部へ正式に報告してください。',hold:'保留理由と設備を確認し、再開できるか判断してください。'}[j?.status]||'提出済みの記録は当直履歴で確認できます。');reason='受付、実測、解析、正式報告を順に残すことで、次の当直へ引き継げます。';
 }else if(domain==='infra'){
  if(!(technical||tactical||p.knowledge.includes('comms')||command))return null;
  key='infra-'+S.defense.caseNo;phase=(S.infra.power?'power':'no-power')+'/'+(S.infra.comms?'comms':'no-comms')+'/'+v27CityIntegrity();route='infra/systems';fact='主電源 '+(S.infra.power?'接続':'停止')+' / 通信 '+(S.infra.comms?'接続':'停止')+' / 都市健全性 '+v27CityIntegrity()+'%。';next='都市系統と区画の損傷を確認し、復旧・装甲・都市援護の配分を検討してください。';reason='都市の電源と通信は、EVAの外部給電や管制にも関係します。';
 }else {
  if(!(person.unit!==undefined||p.knowledge.includes('eva')))return null;
  const unit=person.unit??S.selectedEva,e=S.evas[unit];key='eva-'+unit;phase=e.state+'/'+Math.ceil(e.power);route='eva/readiness';fact=dialogEva(person,dialogWorld(),['零号機','初号機','弐号機'][unit]);next='機体点検・給電と部位報告を確認してください。';reason='未報告の損傷を、無傷と判断しないでください。';
 }
 return {domain,key,phase,route,fact,next,reason};
}
function dutyReply(person,c,facet,m){
 const v=dutyVoices[person.id],changed=m.dutyContext?.key===c.key&&m.dutyContext.phase!==c.phase;
 const opening=changed?({rei:'前の確認から変わったわ。',asuka:'さっきの表示から変わってるわよ。',gendo:'前報との差を確認しろ。',fuyutsuki:'前の報告から状況が変わったようだ。'}[person.id]||'前の確認から状態が変わっています。'):v.open;
 const parts=facet==='reason'?[v.why,c.reason,c.fact]:facet==='next'?[v.next,c.next,c.fact]:facet==='compare'?[opening,c.fact,c.next]:[opening,c.fact,c.next];
 // Repeated facts remain truthful; change the useful focus, rather than inventing readings.
 return parts.join(' ').slice(0,320);
}
const dutyOldRespond=dialogRespond;
dialogRespond=function(data,person,requested,input){
 const old=dialogMemory(data.threads[person.id].memory),reply=dutyOldRespond(data,person,requested,input),m=data.threads[person.id].memory;
 const domain=dutyDomain(input,reply.topic,old),operational=['duty','eva','magi','incident'].includes(reply.topic);
 if(domain&&operational&&!/損傷|ダメージ|被害|零号機|初号機|弐号機/.test(input)){
  let c=null;try{c=dutyContext(domain,person.id);}catch(error){}if(c){
   const facets=/なぜ|どうして|理由/.test(input)?['reason']:/次|どうすれば|手順/.test(input)?['next']:/変化|変わ|前と/.test(input)?['compare']:['status','next','reason'];
   const fresh=facets.find(f=>!old.replyKeys.includes(c.key+'/'+c.phase+'/'+f));const facet=fresh||facets[m.turn%facets.length];
   reply.text=dutyReply(person,c,facet,old);reply.context={domain:c.domain,key:c.key,phase:c.phase,route:c.route};
   m.dutyContext={...reply.context};m.replyKeys=[...old.replyKeys,c.key+'/'+c.phase+'/'+facet].slice(-12);
   dialogFact(m,'consult-'+c.key+'-'+c.phase,c.fact);
  }
 }
 // Follow-up questions refer to the remembered subject; sharing and asking differ.
 if(reply.mode==='normal'&&['daily','care','close'].includes(reply.topic)&&m.subject&&dialogInterests[person.id]?.[m.subject]&&!/覚えて/.test(input)){
  const v=dutyVoices[person.id],sharing=/(私は|僕は|自分は|私の趣味)/.test(input),continuing=/続き|さっき|もっと|どうして|なぜ|詳しく/.test(input);
  if(continuing||sharing||/おすすめ|どんな|どう思う/.test(input)){
   const reflections={shinji:'同じ曲でも、落ち着いて弾ける時と、そうでない時があるんです。',rei:'言葉にしないと、伝わらないこともあるのね。',asuka:'好きなことくらい、自分で決めたいじゃない。',misato:'忙しい日でも、自分の時間は少し残しておきたいわね。',ritsuko:'仕事の話とは、少し違う時間ね。',maya:'こうして少し話すと、気持ちを切り替えられます。',hyuga:'同じ話題でも、人によって気になるところが違いますね。',aoba:'好きなことを話せる相手がいると、休憩も違いますね。',gendo:'私的な話は短く頼む。',fuyutsuki:'急いで結論を出さずに話す時間も必要だろう。',kiel:'私的な話は控えたまえ。'};
   const line=reflections[person.id];
   reply.text=(reply.text+' '+(continuing?line+' ':'')+(person.id==='gendo'||person.id==='kiel'?'':v.ask)).slice(0,320);
  }
 }
 return reply;
};
const dutyOldCandidates=dialogCandidates;
dialogCandidates=function(data){
 const original=dutyOldCandidates(data),a=data.automation,cfg=worldPacing(),extra=[];
 for(const [domain,id,input]of [['security','hyuga','本部保安の状況を確認したい'],['duty','maya','日常業務の状況を確認したい']]){
  let c=null;try{c=dutyContext(domain,id);}catch(error){}if(!c||['clear','available','complete'].includes(c.phase)||data.pending.some(x=>x.to===id))continue;
  const key='consult-'+c.key+'-'+c.phase;if(a.seen.includes(key)||Date.now()-Math.max(v215LastAutomatic(),S.world.pacing.startedAt)<120000||Date.now()-(a.people[id]||0)<cfg.idle)continue;
  extra.push({to:id,key,topic:domain==='security'?'incident':'duty',priority:'urgent',input});
 }
 return [...original.filter(c=>c.priority==='emergency'),...extra,...original.filter(c=>c.priority!=='emergency')];
};
const dutyOldAIContext=dialogAIContext;
dialogAIContext=function(id){const context=dutyOldAIContext(id);if(!context)return null;const memory=personalThread(id).memory,pending=S.personalMessages?.pending.find(x=>x.to===id),domain=(pending&&dutyDomain(pending.input||'',pending.topic,memory))||memory?.dutyContext?.domain;let c=null;try{if(domain)c=dutyContext(domain,id);}catch(error){}if(c)context.world.consultation={domain:c.domain,phase:c.phase,fact:c.fact,next:c.next};return worldClone(context);};
if(window.NERV_MESSAGES)window.NERV_MESSAGES.context=dialogAIContext;
