// Make implemented features visible from the first home screen and strengthen real-state effects.
function createProtectProjection(canvas){
 let gl;try{gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});}catch(error){}
 const fallback=()=>{canvas.dataset.renderer='css';return {refresh(){}};};if(!gl)return fallback();
 let program,buffer,frame=0,lost=false;
 try{
  const compile=(kind,source)=>{const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('compile');return s;};
  const vertex=compile(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
  const fragment=compile(gl.FRAGMENT_SHADER,'precision mediump float;uniform vec2 size;uniform float clock;uniform float pressure;uniform float barrier;void main(){vec2 uv=gl_FragCoord.xy/size;vec2 q=uv*vec2(15.,4.);q.x+=mod(floor(q.y),2.)*.5;vec2 a=abs(fract(q)-.5);float h=max(a.x*.86+a.y*.5,a.y);float edge=smoothstep(.42,.47,h)*(1.-smoothstep(.48,.5,h));float scan=exp(-abs(uv.x-fract(clock*.16))*32.);vec3 red=vec3(1.,.23,.08),green=vec3(.15,1.,.7);vec3 color=mix(red,green,barrier);float alpha=edge*(.16+pressure*.22)+scan*.22;gl_FragColor=vec4(color*alpha,alpha);}');
  program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 }catch(error){if(program)gl.deleteProgram(program);if(buffer)gl.deleteBuffer(buffer);return fallback();}
 const u={};for(const name of ['size','clock','pressure','barrier'])u[name]=gl.getUniformLocation(program,name);const p=gl.getAttribLocation(program,'p');canvas.dataset.renderer='webgl';
 const visible=()=>!document.hidden&&currentPage==='magi'&&mobileCurrent.magi==='external';
 function paint(now=0){frame=0;if(lost||gl.isContextLost()||!visible())return;const r=canvas.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,1.5);canvas.width=Math.max(1,Math.round(r.width*ratio));canvas.height=Math.max(1,Math.round(r.height*ratio));const state=externalMagiState();gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);gl.uniform2f(u.size,canvas.width,canvas.height);gl.uniform1f(u.clock,isMoving()?now/1000:0);gl.uniform1f(u.pressure,Math.max(...state.pressure)/100);gl.uniform1f(u.barrier,['protected','contained'].includes(state.status)?1:0);gl.drawArrays(gl.TRIANGLES,0,6);if(isMoving())frame=requestAnimationFrame(paint);}
 function refresh(){if(frame)cancelAnimationFrame(frame);frame=0;if(visible())paint(performance.now());}
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;if(frame)cancelAnimationFrame(frame);canvas.dataset.renderer='css';});document.addEventListener('visibilitychange',refresh);window.addEventListener('resize',refresh);window.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change',refresh);return {refresh};
}
function initV211Discovery(){
 if(!qs('#staffSupport'))return;
 const showGroup=group=>{for(const panel of all('[data-launcher-set]'))panel.hidden=panel.dataset.launcherSet!==group;for(const b of all('[data-home-group]')){const active=b.dataset.homeGroup===group;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;}};
 all('[data-home-group]').forEach(b=>b.addEventListener('click',()=>showGroup(b.dataset.homeGroup)));
 qs('.home-group-tabs').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const group=event.key==='End'?'systems':event.key==='Home'?'duty':qs('[data-home-group="duty"]').getAttribute('aria-selected')==='true'?'systems':'duty';showGroup(group);qs('[data-home-group="'+group+'"]').focus();});
 const canvas=document.createElement('canvas');canvas.id='magiProtectProjection';canvas.setAttribute('aria-hidden','true');$('external666').prepend(canvas);const protect=createProtectProjection(canvas);
 function labels(){
  const hq=$('hqProjection'),mode=hq?.dataset.renderer==='webgl'?'WebGL投影':'軽量投影';meteoText('hqProjectionState',mode+' / '+(isMoving()?'LIVE':'静止'));
  const d=S.defense,loss=100-v27CityIntegrity();meteoText('hqDamageSummary',loss?'都市損傷 '+loss+'% / 本部健全性 '+d.city[3].hp+'%。被害状況から区画を選んで確認。':'地上・本部は損傷なし。被害が発生すると眺望・区画表示へ連動します。');
  if(staffWorldReady&&worldMagiLimited())document.body.dataset.worldAlert='critical';protect.refresh();
 }
 const oldDraw=draw;draw=function(){oldDraw();labels();};
 window.addEventListener('nerv-route',event=>{if(event.detail.page==='home')showGroup('duty');labels();if(event.detail.page==='hq'&&event.detail.view==='comms'&&staffCommsEnabled()&&!headquartersMessages().length)headquartersTalk(0,true);});
 document.addEventListener('click',event=>{const face=event.target.closest('[data-hq-staff]');if(face&&staffCommsEnabled()){const unit=Number(face.dataset.hqStaff);if(!headquartersMessages().some(m=>m.staff===unit))headquartersTalk(unit,false);}});
 showGroup('duty');labels();
}
initV211Discovery();
