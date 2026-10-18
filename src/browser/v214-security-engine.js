// Original, fictional NERV security procedures. Canon supplies roles, not these scenarios.
const securityKinds={
 access:{title:'本部への侵入者検知',zone:'中央昇降路 / 認証区画',contact:'hyuga',evidence:[['badge','入退館証の照合'],['camera','監視映像の確認'],['route','通行許可の照合']],findings:[['入退館証の識別子と使用部署が一致しません。','監視映像は単独通行。同行者の登録がありません。','該当経路の通行許可が失効しています。'],['一時通行証の更新が遅延。同行担当者の記録は有効です。','物資搬入担当が登録職員の付き添いで移動しています。','通行許可は搬入時間帯と区画に一致しています。']]},
 sabotage:{title:'整備指令の偽装疑惑',zone:'地下送電 / 整備管制',contact:'maya',evidence:[['signature','整備指令の署名照合'],['relay','送電系統の履歴確認'],['handover','当直引継ぎとの照合']],findings:[['整備指令の署名が登録された技術部のものと一致しません。','同じ識別子で、相反する切替指令が記録されています。','正規の引継ぎに当該作業の記載がありません。'],['指令の署名と技術部の登録が一致しています。','送電履歴は予定された点検手順の範囲です。','当直の引継ぎにも同じ作業番号が記録されています。']]},
 audit:{title:'監査回線・文書改ざん疑惑',zone:'本部文書庫 / 監査中継',contact:'fuyutsuki',evidence:[['seal','監査文書の封印照合'],['hash','原本と配布版の比較'],['channel','照会回線の認証確認']],findings:[['配布版の封印情報に原本と異なる項目があります。','原本と配布版の要約が一致しません。','登録外の回線から再送を求める連絡が届いています。'],['封印情報は原本と一致しています。','変更履歴に認証済みの訂正版が記録されています。','照会は登録された監査回線からのものです。']]}
};
const securityActive=state=>state.world?.security?.case||null;
function securityHold(state=S){const c=securityActive(state);return !!c&&(c.stage==='failed'||c.kind==='sabotage'&&c.variant===0&&['analyzed','decision','reported'].includes(c.stage));}
function securityDefaults(tick){return {schema:1,sequence:0,auto:true,nextDueTick:tick+6,case:null,archive:[],integrity:100,trust:100};}
function securityNormalize(raw,tick){
 if(raw&&Number(raw.schema)>1)return {future:true};const base=securityDefaults(tick),s=worldObject(raw)?worldClone(raw):{};
 const result={...base,...s,schema:1,sequence:Math.floor(worldBound(s.sequence,0,1e9,0)),auto:s.auto!==false,nextDueTick:Math.floor(worldBound(s.nextDueTick,0,1e9,tick+6)),integrity:worldBound(s.integrity,0,100,100),trust:worldBound(s.trust,0,100,100),archive:Array.isArray(s.archive)?s.archive.filter(c=>worldObject(c)&&securityKinds[c.kind]&&typeof c.id==='string').slice(0,6):[],case:null};
 if(s.case&&securityKinds[s.case.kind]&&typeof s.case.id==='string'&&['detected','accepted','collecting','analyzing','analyzed','decision','reported','failed'].includes(s.case.stage)){
  const c=s.case;result.case={...c,variant:c.variant===1?1:0,evidence:[...new Set((Array.isArray(c.evidence)?c.evidence:[]).filter(e=>securityKinds[c.kind].evidence.some(([id])=>id===e)))],createdTick:Math.floor(worldBound(c.createdTick,0,1e9,tick)),deadlineTick:Math.floor(worldBound(c.deadlineTick,0,1e9,tick+8)),contained:!!c.contained,penaltyApplied:!!c.penaltyApplied};
  if(c.stage==='analyzing'&&!Number.isFinite(c.analysisDue))result.case.stage='collecting';if(c.stage==='reported'&&!Number.isFinite(c.approvalDue))result.case.stage='decision';
 }
 return {value:result,repaired:JSON.stringify(raw)!==JSON.stringify(result)};
}
const securityPriorNormalize=worldNormalize;
worldNormalize=function(raw,now){const result=securityPriorNormalize(raw,now);if(result.future)return result;const normalized=securityNormalize(result.world.security,result.world.tick);if(normalized.future)return {future:true};result.world.security=normalized.value;result.repaired=result.repaired||normalized.repaired;return result;};
function securityNewCase(state,kind,tick,training=false){
 const s=state.world.security;if(s.case)throw Error('対応中の保安案件を先に引き継いでください');const names=Object.keys(securityKinds);kind=securityKinds[kind]?kind:names[s.sequence%names.length];s.sequence++;
 s.case={id:'SEC-'+s.sequence,kind,variant:Math.floor((s.sequence-1)/3)%2,stage:'detected',createdTick:tick,deadlineTick:tick+8,evidence:[],contained:false,penaltyApplied:false,decision:null,training};
 worldLog(state.world,'保安受付',securityKinds[kind].title+'。認証・証拠を確認し、指揮系統へ上申してください。',s.case.id);worldCommunication(state.world,'中央管制 / 保安連絡',securityKinds[kind].zone+'に照合が必要な事象。未確認のまま通行・転送を承認しないでください。',s.case.id);
}
function securityFailure(state,c,reason){
 if(!c.penaltyApplied){state.world.security.integrity=Math.max(0,state.world.security.integrity-18);state.world.security.trust=Math.max(0,state.world.security.trust-8);if(state.defense.spares>0)state.defense.spares--;c.penaltyApplied=true;worldLog(state.world,'保安警戒',reason+'。照合のやり直しに予備部材1を使用（在庫がある場合）。',c.id);}
 c.stage='failed';c.contained=true;
}
function securityTick(state,tick){
 const w=state.world,s=w.security;if(!s||s.schema!==1)return;let c=s.case;
 if(!c){if(s.auto&&tick>=s.nextDueTick&&state.infra.power&&state.infra.comms)securityNewCase(state,null,tick);return;}
 if(c.stage==='analyzing'&&tick>=c.analysisDue&&state.infra.power&&state.infra.comms&&!securityPriorObserve(state).intrusion&&!securityPriorObserve(state).magiHold){c.stage='analyzed';worldLog(w,'保安解析',c.id+' の証拠照合が完了。通行保留・認証確認・上申を選択できます。',c.id);}
 if(c.stage==='reported'&&tick>=c.approvalDue&&state.infra.power&&state.infra.comms){
  const correct=c.decision==='escalate'||c.decision==='hold'&&c.variant===0||c.decision==='release'&&c.variant===1;
  c.assessment=correct?'証拠と対応が整合':'安全確保済み / 不要な保留を再確認';if(!correct)s.trust=Math.max(0,s.trust-5);s.integrity=Math.min(100,s.integrity+8);c.stage='resolved';c.resolvedTick=tick;c.authorizedBy='冬月コウゾウ / 副司令';
  s.archive.unshift(worldClone(c));s.archive=s.archive.slice(0,6);s.case=null;s.nextDueTick=tick+10;
  worldLog(w,'保安引継ぎ',c.id+'：'+c.assessment+'。副司令系統が受領し、担当部署へ引き継ぎました。',c.id);worldCommunication(w,'冬月コウゾウ / 副司令','報告を受領した。'+c.assessment+'。当該区画の扱いは担当部署へ引き継ぐ。',c.id);return;
 }
 if(!c.contained&&!['reported','failed'].includes(c.stage)&&tick>=c.deadlineTick)securityFailure(state,c,'対応期限を経過。保安情報の整合性が低下しました');
}
const securityPriorAdvance=worldAdvance;
worldAdvance=function(state,now){const before=state.world?.tick||0,limited=securityHold(state),changed=securityPriorAdvance(state,now);if(state.world?.security)for(let tick=before+1;tick<=state.world.tick;tick++)securityTick(state,tick);if(state===S&&!limited&&securityHold(state)){cancelSequence();staffInvalidateDecision();}return changed;};
const securityPriorObserve=worldObserve;
worldObserve=function(state){const observed=securityPriorObserve(state),c=securityActive(state);if(c){observed.alert=c.stage==='failed'?'非常':observed.alert==='非常'?'非常':'警戒';observed.security={id:c.id,kind:c.kind,title:securityKinds[c.kind].title,stage:c.stage,evidence:c.evidence.length,contained:c.contained};}else observed.security=null;return observed;};
const securityPriorDispatch=worldDispatch;
worldDispatch=function(state,action){
 if(!action.startsWith('security.'))return securityPriorDispatch(state,action);
 const w=state.world,s=w.security;let c=s.case;const [,op,param]=action.split('.');
 if(op==='toggle'){s.auto=!s.auto;s.nextDueTick=Math.max(s.nextDueTick,w.tick+6);return;}
 if(op==='start'){securityNewCase(state,param,w.tick,true);return;}
 if(!c)throw Error('対応中の保安案件はありません');
 if(!state.infra.power||!state.infra.comms)throw Error('主電源・通信を先に復旧してください');
 if(op==='accept'){if(c.stage!=='detected')throw Error('受領済みです');c.stage='accepted';}
 else if(op==='evidence'){
  if(!['accepted','collecting'].includes(c.stage)||!securityKinds[c.kind].evidence.some(([id])=>id===param))throw Error('証拠の受付手順を確認してください');if(c.evidence.includes(param))throw Error('この証拠は照合済みです');c.evidence.push(param);c.stage='collecting';
 }else if(op==='analyze'){
  if(c.stage!=='collecting'||c.evidence.length<2)throw Error('異なる証拠を2種類以上確認してください');if(securityPriorObserve(state).intrusion)throw Error('MAGI侵入対処を先に完了してください');if(securityPriorObserve(state).magiHold)throw Error('冷却系統の復旧承認を先に確認してください');c.stage='analyzing';c.analysisDue=w.tick+1;
 }else if(['hold','release','escalate'].includes(op)){
  if(c.stage!=='analyzed'&&!(op==='escalate'&&['accepted','collecting'].includes(c.stage)&&c.evidence.length))throw Error('証拠照合後に選択してください');
  if(op==='release'&&c.variant===0){securityFailure(state,c,'照合不一致のまま通行・文書転送を許可しました');return;}
  c.decision=op;c.contained=op!=='release';c.stage='decision';
 }else if(op==='report'){
  if(c.stage!=='decision')throw Error('対応方針を選択してください');c.stage='reported';c.approvalDue=w.tick+1;
 }else if(op==='recover'){
  if(c.stage!=='failed')throw Error('緊急上申が必要な案件はありません');c.decision='escalate';c.stage='reported';c.approvalDue=w.tick+2;
 }else throw Error('管制補助の保安手順にない操作です');
 worldLog(w,'保安処理',c.id+' / '+{accept:'案件受領',evidence:'証拠照合',analyze:'MAGIへ照合依頼',hold:'手順書による当該区画の一時保留',release:'認証済み通行・文書を確認',escalate:'不確定要素を上級職員へ引継ぎ',report:'副司令へ正式報告',recover:'証拠保全・緊急上申'}[op]+(param?' / '+param:''),c.id);
 if(state===S&&securityHold(state)){cancelSequence();staffInvalidateDecision();}
};
const securityPriorVote=voteInfo,securityPriorIntercept=staffInterceptVotes,securityPriorApproval=staffInterceptApproved,securityPriorCombat=combatBasics;
voteInfo=function(){const votes=securityPriorVote();return securityHold()?votes.map(v=>({...v,yes:false,reason:'保安案件の照合・上級職員の確認待ち'})):votes;};
staffInterceptVotes=function(){const votes=securityPriorIntercept();return securityHold()?votes.map(v=>({...v,yes:false,reason:'保安確認の完了が必要'})):votes;};
staffInterceptApproved=function(){return !securityHold()&&securityPriorApproval();};
combatBasics=function(){const reasons=securityPriorCombat();if(securityHold())reasons.push('保安案件の上級職員による確認');return reasons;};
