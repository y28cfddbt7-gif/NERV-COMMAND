// Command-center views and original staff dialogue. All imagery is additive.
const commandStaff=[
 {name:'葛城ミサト',role:'戦術作戦部 / 作戦指揮',normal:'配置を確認したら、目標の解析を進めて。出撃承認と攻撃の判断は分けて確認するわよ。',battle:'通常兵器は牽制に使うわ。EVAを接近させてA.T.フィールドを中和、コアを狙って。',damage:'被害区画を確認して、防護と修復を優先。機体の回収ルートも確保して。',intrusion:'通常審議は停止。技術部の対処を優先して、作戦通信は維持して。'},
 {name:'赤木リツコ',role:'技術開発部 / MAGI管理',normal:'三基の判断にはそれぞれ理由があるわ。承認の対象と有効なターンを確認して。',battle:'中和できるのは近接したEVAのA.T.フィールド。ライフルの有効打も、その機会を使うのよ。',damage:'給電が切れれば内部電源へ移行するわ。都市主電源とアンビリカルを別々に確認して。',intrusion:'外部ハッキングには666プロテクトを構築するわ。適応する内部侵食には別の対抗処理が必要よ。'},
 {name:'伊吹マヤ',role:'技術局 / 機体・パイロット監視',normal:'三機の同期率と給電状態、確認できます。搭乗者監視の表示も更新されています。',battle:'攻撃担当機の内部電源を監視中です。接近と攻撃の消費分を残してください。',damage:'損傷区画の表示を更新しました。無理な継戦の前に、帰投と修復の判断をお願いします。',intrusion:'三基の侵入圧を監視しています。演算資源には限りがあります、解析と防御の配分をお願いします。'},
 {name:'日向マコト',role:'戦術作戦部 / 作戦情報',normal:'地上区画とジオフロントの連絡、正常です。指示は各管制画面へ送れます。',battle:'敵性反応の進路を更新しました。都市武装の支援がなくても、EVAでの撃破は可能です。',damage:'防衛地図の被害情報を集約しました。修復資材と補助送電枠をご確認ください。',intrusion:'外部侵入中の承認は失効しています。封じ込め後に、必要な審議を再申請してください。'},
 {name:'青葉シゲル',role:'調査部情報局 / 通信・索敵',normal:'索敵回線、待機中。地上の兵装ビルは区画ごとに稼働状態を確認できます。',battle:'進路データを共有しました。誘導弾は高出力ですが、機関砲より電力を使います。',damage:'地上通信の状態を監視中。停電と施設の損傷は、都市系統で切り分けてください。',intrusion:'外部からの接続を検知。選択したコアの経路隔離は、ほかの系統にも負荷を移します。'}
];
const coolingDialogue=['冷却枝系統の異常は技術部へ引き継いで。管制では案件の受領と診断結果の報告を進めて。','異常枝系統を隔離して、診断結果を報告してください。整備と再接続の判断は技術部が行うわ。','冷却負荷と通常審議の保留状態は、当直業務とMAGIの画面で共通表示されています。','通常業務と異常対応の記録を引き継ぎます。必要な承認が戻るまでは指示の再申請を待ってください。','都市の作戦通信は維持しています。冷却枝系統だけの隔離なので、通信全体の遮断は不要です。'];
commandStaff.forEach((staff,i)=>staff.cooling=coolingDialogue[i]);
let hqSelectedStaff=0,hqAutoDialogueAt=0;
function headquartersMessages(){return Array.isArray(S.headquarters?.messages)?S.headquarters.messages.slice(0,12):[];}
async function headquartersTalk(index=hqSelectedStaff,automatic=false){
 if(![0,1,2,3,4].includes(index))return {ok:false,error:'通信対象が不正です'};
 if(automatic&&(!staffCommsEnabled()||document.hidden))return {ok:false};
 const staff=commandStaff[index];
 const context=(Array.isArray(S.world?.events)&&S.world.events.some(e=>e.kind==='magi-cooling'&&e.status!=='resolved'))?'cooling':magiIntrusionActive()?'intrusion':v27CityIntegrity()<80?'damage':S.defense.status==='active'?'battle':'normal';
 const result=await commandOperation(()=>{
  const message={id:Date.now().toString(36),at:Date.now(),staff:index,context,text:staff[context],ack:false};
  S.headquarters={...S.headquarters,messages:[message,...headquartersMessages()].slice(0,12)};
 });
 if(result.ok){hqSelectedStaff=index;renderHeadquarters();if(automatic)toast(staff.name+'：司令部通信を受信しました');sound('scan');}
 return result;
}
function renderHeadquarters(){
 if(!$('hqBrief'))return;
 const d=S.defense,messages=headquartersMessages(),latest=messages.find(m=>m.staff===hqSelectedStaff),staff=commandStaff[hqSelectedStaff],hq=d.city[3];
 const context=terminalAlert();
 meteoText('hqCondition',context.level==='nominal'?'NORMAL':context.level==='critical'?'EMERGENCY':'TACTICAL ALERT');
 meteoText('hqBrief',context.level==='nominal'?'全系統待機 / 地上・地下監視を継続。職員通信で次の業務を確認できます。':context.title+' / '+context.message);
 meteoText('launcherHQ','本部 '+hq.hp+'% / '+(magiIntrusionActive()?'MAGI要対処':'地上・地下監視'));
 meteoText('hqCityBrief','都市健全性 '+v27CityIntegrity()+'% / 配備 '+d.city.slice(0,3).filter(c=>c.turret&&c.hp>=25).length+'/3区画 / '+(S.infra.power?'主電源ONLINE':'停電'));
 meteoText('hqGeoBrief','本部健全性 '+hq.hp+'% / '+(hq.armor?'本部防護 展開':'本部防護 開放')+' / 通信 '+(S.infra.comms?'接続':'停止'));
 for(const [view,health] of [['city',Math.round(d.city.slice(0,3).reduce((n,c)=>n+c.hp,0)/3)],['geofront',hq.hp]]){
  const scene=qs('.page[data-page="hq"] [data-view="'+view+'"] .hq-scene');scene.dataset.damage=health<35?'critical':health<75?'damaged':'normal';scene.dataset.power=String(S.infra.power);scene.style.setProperty('--hq-damage',String((100-health)/100));
 }
 const bars=$('hqCityBars');bars.replaceChildren();
 d.city.slice(0,3).forEach((c,i)=>{const row=document.createElement('div'),label=document.createElement('span'),track=document.createElement('span'),fill=document.createElement('i');label.textContent=V27_FACILITY[i].name+' '+c.hp+'%';fill.style.width=c.hp+'%';track.append(fill);row.append(label,track);row.dataset.damaged=String(c.hp<50);bars.append(row);});
 const list=$('hqDamageList');list.replaceChildren();
 d.city.forEach((c,i)=>{const row=document.createElement('article'),name=document.createElement('strong'),detail=document.createElement('p'),b=document.createElement('button');name.textContent=V27_FACILITY[i].name+' / '+c.hp+'%';detail.textContent=(c.hp<25?'機能停止':c.hp<75?'損傷あり':'健全')+' / '+(c.armor?'防護展開':'防護開放')+(i<3?' / '+(c.turret&&c.hp>=25?'武装稼働':'武装停止'):'');b.type='button';b.textContent='この区画の修復へ ↗';b.addEventListener('click',()=>{S.defense.selected=i;draw();window.NERV_MOBILE.open('infra','facilities');});row.dataset.damaged=String(c.hp<50);row.append(name,detail,b);list.append(row);});
 meteoText('hqStaffName',staff.name);meteoText('hqStaffRole',staff.role);meteoText('hqDialogue',latest?.text||'通信待機。「状況報告を受ける」で、この職員から報告を受信します。');
 $('hqStaffFace').dataset.staff=String(hqSelectedStaff);$('hqStaffFace').setAttribute('aria-label',staff.name+'の顔イラスト');
 all('[data-hq-staff]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.hqStaff)===hqSelectedStaff)));
 $('hqAcknowledge').disabled=!latest||latest.ack;$('hqAcknowledge').textContent=latest?.ack?'了解・受領済み':'了解 / 応答を記録';
 if(hqProjection)hqProjection.refresh();
}
// Optional procedural WebGL projection, never changes gameplay. CSS artwork is the fallback.
let hqProjection=null;
function createHQProjection(canvas){
 let gl=null,program=null,buffer=null,frame=0,disposed=false;
 try{gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});}catch(error){}
 if(!gl){canvas.dataset.renderer='css';return {refresh(){}};}
 const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw Error('projection shader');}return shader;};
 try{
  const vertex=compile(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
  const fragment=compile(gl.FRAGMENT_SHADER,'precision mediump float;uniform vec2 size;uniform float time;uniform float damage;uniform float alert;uniform float load;void main(){vec2 uv=gl_FragCoord.xy/size;vec2 grid=abs(fract(uv*vec2(18.,9.))-.5);float line=smoothstep(.46,.5,max(grid.x,grid.y));float sweep=exp(-abs(uv.x-fract(time*.12))*65.);float halo=(1.-smoothstep(.1,.5,length((uv-vec2(.27,.35))*vec2(1.,1.4))));float a=(line*.32+sweep*.45)*(.35+halo*.65);vec3 tint=mix(vec3(1.,.58,.16),vec3(1.,.12,.06),max(max(damage,alert),load*.65));gl_FragColor=vec4(tint*a,a);}');
  program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('projection link');
  buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 }catch(error){if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);canvas.dataset.renderer='css';return {refresh(){}};}
 canvas.dataset.renderer='webgl';
 const uniforms={size:gl.getUniformLocation(program,'size'),time:gl.getUniformLocation(program,'time'),damage:gl.getUniformLocation(program,'damage'),alert:gl.getUniformLocation(program,'alert'),load:gl.getUniformLocation(program,'load')};
 const position=gl.getAttribLocation(program,'p');
 const visible=()=>!document.hidden&&currentPage==='hq'&&mobileCurrent.hq==='bridge';
 function paint(now=0){
  frame=0;if(disposed||gl.isContextLost()||!visible())return;
  const rect=canvas.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,1.5),width=Math.max(1,Math.round(rect.width*ratio)),height=Math.max(1,Math.round(rect.height*ratio));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  gl.viewport(0,0,width,height);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);gl.uniform2f(uniforms.size,width,height);gl.uniform1f(uniforms.time,isMoving()?now/1000:0);gl.uniform1f(uniforms.damage,(100-S.defense.city[3].hp)/100);gl.uniform1f(uniforms.alert,magiIntrusionActive()||S.world?.cooling?.mode==='isolated'?1:0);gl.uniform1f(uniforms.load,(Number(S.world?.cooling?.load)||0)/100);gl.drawArrays(gl.TRIANGLES,0,6);
  if(isMoving())frame=requestAnimationFrame(paint);
 }
 const refresh=()=>{if(frame)cancelAnimationFrame(frame);frame=0;if(visible())paint(performance.now());};
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();disposed=true;if(frame)cancelAnimationFrame(frame);frame=0;canvas.dataset.renderer='css';});
 canvas.addEventListener('webglcontextrestored',()=>{hqProjection=createHQProjection(canvas);hqProjection.refresh();},{once:true});
 document.addEventListener('visibilitychange',refresh);window.addEventListener('resize',refresh);window.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change',refresh);
 return {refresh};
}
function initHeadquarters(){
 if(!qs('.page[data-page="hq"]'))return;
 mobileGroup('hq',[['bridge','発令所'],['city','第三新東京市'],['geofront','ジオフロント'],['damage','被害状況'],['comms','職員通信']].map(([id,label])=>({id,label,existing:true})),'bridge');
 commandStaff.forEach((staff,i)=>{const b=document.createElement('button');b.type='button';b.dataset.hqStaff=String(i);const face=document.createElement('span');face.className='command-staff-face';face.dataset.staff=String(i);face.setAttribute('aria-hidden','true');const name=document.createElement('small');name.textContent=staff.name;b.append(face,name);b.addEventListener('click',()=>{hqSelectedStaff=i;renderHeadquarters();});qs('.hq-staff-picker').append(b);});
 $('hqTalk').addEventListener('click',()=>headquartersTalk());
 $('hqAcknowledge').addEventListener('click',()=>commandOperation(()=>{const latest=headquartersMessages().find(m=>m.staff===hqSelectedStaff);if(latest&&!latest.ack)S.headquarters={...S.headquarters,messages:headquartersMessages().map(m=>m.id===latest.id?{...m,ack:true}:m)};}));
 const restore=()=>{const [page,view]=location.hash.slice(1).split('/');if(page==='hq')window.NERV_MOBILE.open('hq',view);};
 window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
 window.addEventListener('nerv-route',event=>{
  if(hqProjection)hqProjection.refresh();
  if(event.detail.page==='hq'&&['bridge','city','geofront'].includes(event.detail.view)&&staffCommsEnabled()&&!document.hidden&&Date.now()-hqAutoDialogueAt>60000&&Math.random()<.4){hqAutoDialogueAt=Date.now();headquartersTalk(Math.floor(Math.random()*commandStaff.length),true);}
 });
 window.addEventListener('nerv-combat-action',()=>{
  if(isMoving()){$('evaEngagePanel').classList.remove('combat-impact');void $('evaEngagePanel').offsetWidth;$('evaEngagePanel').classList.add('combat-impact');}
 });
 hqProjection=createHQProjection($('hqProjection'));
 const priorDraw=draw;draw=function(){priorDraw();renderHeadquarters();};
 window.NERV_OPERATIONS.talk=headquartersTalk;
 renderHeadquarters();restore();
}
initHeadquarters();
