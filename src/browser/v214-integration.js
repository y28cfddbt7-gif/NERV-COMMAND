// Shared security state reaches dialogue without disclosing uncollected evidence or hidden scenario truth.
const v214PriorIntent=dialogIntent;
dialogIntent=function(text,requested,memory){const topic=v214PriorIntent(text,requested,memory);return !['restricted','request'].includes(topic)&&/保安|不審|謀略|監査|改ざん|偽装|入退館|通行証/.test(text)?'incident':topic;};
const v214PriorOperational=dialogOperational;
dialogOperational=function(person,topic,text,w){
 const c=securityActive(S),p=dialogPersonas[person.id];
 if(c&&['incident','duty'].includes(topic)&&!/損傷|被害|ダメージ/.test(text)){
  if(person.unit!==undefined)return p.watch+' 本部保安の照合中。パイロット回線では原因や実行者を断定できません。';
  if(person.id==='kiel')return '監査回線の記録を保全したまえ。認証が揃わない資料を転送してはならない。正式な報告系統で扱うことだ。';
  return securityKinds[c.kind].title+' / '+c.id+'。現在は'+securityLabels[c.stage]+'。証拠 '+c.evidence.length+'件を照合済み。'+(c.stage==='failed'?'証拠保全と緊急上申を優先してください。':c.stage==='analyzing'?'MAGIの照合結果を待っています。':'本部保安から証拠を確認し、上級職員へ報告してください。')+' 個人回線から通行や転送を承認することはありません。';
 }
 return v214PriorOperational(person,topic,text,w);
};
const v214PriorRespond=dialogRespond;
dialogRespond=function(data,person,topic,input){const reply=v214PriorRespond(data,person,topic,input),c=securityActive(S);if(c&&person.unit===undefined&&['incident','duty'].includes(reply.topic))dialogFact(data.threads[person.id].memory,'security-'+c.id+'-'+c.stage,'本部保安：'+securityKinds[c.kind].title+' / '+securityLabels[c.stage]);return reply;};
const v214PriorCandidates=dialogCandidates;
dialogCandidates=function(data){const list=v214PriorCandidates(data),c=securityActive(S);if(!c)return list;const id=securityKinds[c.kind].contact,key='security-'+c.id+'-'+c.stage,a=data.automation,priority=c.stage==='failed'?'emergency':'urgent';if(!a.seen.includes(key)&&!data.pending.some(p=>p.to===id)&&Date.now()-a.lastAt>=(priority==='emergency'?30000:90000)&&Date.now()-(a.people[id]||0)>=(priority==='emergency'?60000:300000))list.unshift({to:id,key,topic:'incident',priority,input:'本部保安の状況を確認'});return list;};
const v214PriorAIContext=dialogAIContext;
dialogAIContext=function(id){const context=v214PriorAIContext(id);if(!context)return null;const c=securityActive(S);if(c)context.world.security={id:c.id,title:securityKinds[c.kind].title,stage:c.stage,verifiedEvidence:c.evidence.length,contained:c.contained};return context;};
if(window.NERV_MESSAGES)window.NERV_MESSAGES.context=dialogAIContext;
