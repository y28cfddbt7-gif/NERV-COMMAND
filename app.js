/*
The MIT License

Copyright (c) 2025 Julian Garnier

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
if(typeof window!=="undefined" && typeof document.createElementNS==="function" && typeof requestAnimationFrame==="function"){
/**
 * Anime.js - UMD minified bundle
 * @version v4.5.0
 * @license MIT
 * @copyright 2026 - Julian Garnier
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).anime={})}(this,function(t){"use strict";const e="undefined"!=typeof window,s=e?window:null,i=e?document:null,r={replace:0,none:1,blend:2},n=Symbol(),o=Symbol(),a=Symbol(),l=Symbol(),h=Symbol(),d=1e-11,c=1e12,u=1e3,p="",m=[],f=(()=>{const t=new Map;return t.set("x","translateX"),t.set("y","translateY"),t.set("z","translateZ"),t})(),g=["perspective","translateX","translateY","translateZ","rotate","rotateX","rotateY","rotateZ","scale","scaleX","scaleY","scaleZ","skew","skewX","skewY"],y=g.reduce((t,e)=>({...t,[e]:e+"("}),{}),_=()=>{},b=/\)\s*[-.\d]/,v=/(^#([\da-f]{3}){1,2}$)|(^#([\da-f]{4}){1,2}$)/i,T=/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i,x=/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i,S=/hsl\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*\)/i,w=/hsla\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i,$=/[-+]?\d*\.?\d+(?:e[-+]?\d)?/gi,C=/^([-+]?\d*\.?\d+(?:e[-+]?\d+)?)([a-z]+|%)$/i,E=/([a-z])([A-Z])/g,k=/(\*=|\+=|-=)/,N=/var\(\s*(--[\w-]+)(?:\s*,\s*([^)]+))?\s*\)/,D={id:null,keyframes:null,playbackEase:null,playbackRate:1,frameRate:240,loop:0,reversed:!1,alternate:!1,autoplay:!0,persist:!1,duration:u,delay:0,loopDelay:0,ease:"out(2)",composition:r.replace,modifier:t=>t,onBegin:_,onBeforeUpdate:_,onUpdate:_,onLoop:_,onPause:_,onComplete:_,onRender:_},A={current:null,root:i},I={defaults:D,precision:4,timeScale:1,tickThreshold:200,editor:null},R={version:"4.5.0",engine:null};e&&(s.AnimeJS||(s.AnimeJS=[]),s.AnimeJS.push(R));const L=t=>t.replace(E,"$1-$2").toLowerCase(),B=(t,e)=>0===t.indexOf(e),P=Date.now,F=Array.isArray,M=t=>t&&t.constructor===Object,V=t=>"number"==typeof t&&!isNaN(t),O=t=>"string"==typeof t,z=t=>"function"==typeof t,H=t=>void 0===t,X=t=>H(t)||null===t,Y=t=>e&&t instanceof SVGElement,W=t=>v.test(t),U=t=>B(t,"rgb"),q=t=>B(t,"hsl"),j=t=>!I.defaults.hasOwnProperty(t),G=["opacity","rotate","overflow","color"],Z=t=>O(t)?parseFloat(t):t,Q=Math.pow,J=Math.sqrt,K=Math.sin,tt=Math.cos,et=Math.abs,st=Math.exp,it=Math.ceil,rt=Math.floor,nt=Math.asin,ot=Math.max,at=Math.atan2,lt=Math.PI,ht=Math.round,dt=(t,e,s)=>t<e?e:t>s?s:t,ct=(t,e)=>{if(e<0)return t;if(!e)return ht(t);const s=10**e;return ht(t*s)/s},ut=(t,e)=>F(e)?e.reduce((e,s)=>et(s-t)<et(e-t)?s:e):e?ht(t/e)*e:t,pt=(t,e,s)=>1===s?e:0===s?t:t+(e-t)*s,mt=t=>t===1/0?c:t===-1/0?-c:t,ft=t=>t<=d?d:mt(ct(t,11)),gt=t=>F(t)?[...t]:t,yt=(t,e)=>{const s={...t};for(let i in e){const r=t[i];s[i]=H(r)?e[i]:r}return s},_t=(t,e,s,i="_prev",r="_next")=>{let n=t._head,o=r;for(s&&(n=t._tail,o=i);n;){const t=n[o];e(n),n=t}},bt=(t,e,s="_prev",i="_next")=>{const r=e[s],n=e[i];r?r[i]=n:t._head=n,n?n[s]=r:t._tail=r,e[s]=null,e[i]=null},vt=(t,e,s,i="_prev",r="_next")=>{let n=t._tail;for(;n&&s&&s(n,e);)n=n[i];const o=n?n[r]:t._head;n?n[r]=e:t._head=e,o?o[i]=e:t._tail=e,e[i]=n,e[r]=o},Tt=t=>{let e=p;for(let s=0,i=g.length;s<i;s++){const i=g[s],r=t[i];if(void 0!==r){if("translateX"===i){const i=t.translateY;if(void 0!==i){const n=t.translateZ;void 0!==n?(e+=`translate3d(${r},${i},${n}) `,s+=2):(e+=`translate(${r},${i}) `,s+=1);continue}}if("scaleX"===i&&void 0===t.scale){const i=t.scaleY;if(void 0!==i){const n=t.scaleZ;void 0!==n?(e+=`scale3d(${r},${i},${n}) `,s+=2):(e+=`scale(${r},${i}) `,s+=1);continue}}e+=`${y[i]}${r}) `}"rotateZ"===i&&void 0!==t.rotate3d&&(e+=`rotate3d(${t.rotate3d}) `)}return void 0!==t.matrix&&(e+=`matrix(${t.matrix}) `),void 0!==t.matrix3d&&(e+=`matrix3d(${t.matrix3d}) `),e},xt=[];function St(t,e){if(!t)return null;const s=xt.length;t:for(let i=0;i<s;i++){const s=xt[i];if(s.detect&&!s.detect(t))continue;const r=s.targetAdapters;for(let s=0,i=r.length;s<i;s++){const i=r[s];if(i.detect(t)){const s=i.props[e];if(s&&(!s.gate||s.gate(t)))return s;break t}}}for(let i=0;i<s;i++){const s=xt[i];if(s.detect&&!s.detect(t))continue;const r=s.propertyResolvers;for(let s=0,i=r.length;s<i;s++){const i=r[s](t,e);if(i)return i}}return null}const wt=(t,e,s)=>(s<0&&(s+=1),s>1&&(s-=1),s<1/6?t+6*(e-t)*s:s<.5?e:s<2/3?t+(e-t)*(2/3-s)*6:t),$t=(t,e)=>H(t)?e:t,Ct=(t,e)=>{const s=t.match(N),i=e[o]?e:document.documentElement;let r=getComputedStyle(i)?.getPropertyValue(s[1]);return r&&r.trim()!==p||!s[2]||(r=s[2].trim()),r||0},Et=(t,e,s,i,r,n)=>{if(z(t)){if(!r){const r=t(e,s,i,n);return isNaN(+r)?r||0:+r}const o=()=>{const r=t(e,s,i,n);return isNaN(+r)?r||0:+r};return r.func=o,o()}if(O(t)&&B(t,"var(")){if(!r)return Ct(t,e);const s=()=>Ct(t,e);return r.func=s,s()}return t},kt=(t,e)=>t[o]?t[a]&&((t,e)=>{if(G.includes(e))return!1;if(t.getAttribute(e)||e in t){if("scale"===e){const e=t.parentNode;return e&&"filter"===e.tagName}return!0}})(t,e)?1:g.includes(e)||f.get(e)?3:B(e,"--")?4:e in t.style?2:e in t?0:1:0,Nt=(t,e,s)=>{const i=t.style[e];i&&s&&(s[e]=i);const r=i||getComputedStyle(t[h]||t).getPropertyValue(e);return"auto"===r?"0":r},Dt=(t,e,s,i)=>{const r=H(s)?kt(t,e):s,n=St(t,e);if(n){const s=n.get(t);return s&&i&&(i[e]=s),null==s?0:s}if(0===r){const s=t[e];return s&&i&&(i[e]=s),s||0}if(1===r){const s=t.getAttribute(e);return s&&i&&(i[e]=s),s}return 3===r?((t,e,s)=>{const i=t.style.transform;if(i){const r=t[l];let n=0;const o=i.length;let a;for(;n<o;){for(;n<o&&32===i.charCodeAt(n);)n++;if(n>=o)break;const t=n;for(;n<o&&40!==i.charCodeAt(n);)n++;if(n>=o)break;const e=i.substring(t,n);let s=1;const l=n+1;let h=-1,d=-1;for(n++;n<o&&s>0;){const t=i.charCodeAt(n);40===t?s++:41===t?s--:44===t&&1===s&&(-1===h?h=n:-1===d&&(d=n)),n++}const c=n-1;"translate"===e||"translate3d"===e?(-1===h?r.translateX=i.substring(l,c).trim():(r.translateX=i.substring(l,h).trim(),-1===d?r.translateY=i.substring(h+1,c).trim():(r.translateY=i.substring(h+1,d).trim(),r.translateZ=i.substring(d+1,c).trim())),a=i.substring(l,c)):"scale"===e||"scale3d"===e?-1===h?r.scale=i.substring(l,c).trim():(r.scaleX=i.substring(l,h).trim(),-1===d?r.scaleY=i.substring(h+1,c).trim():(r.scaleY=i.substring(h+1,d).trim(),r.scaleZ=i.substring(d+1,c).trim())):r[e]=i.substring(l,c)}if("translate3d"===e&&a)return s&&(s[e]=a),a;const h=r[e];if(!H(h))return s&&(s[e]=h),h}return"translate3d"===e?"0px, 0px, 0px":"rotate3d"===e?"0, 0, 0, 0deg":B(e,"scale")?"1":B(e,"rotate")||B(e,"skew")?"0deg":"0px"})(t,e,i):4===r?Nt(t,e,i).trimStart():Nt(t,e,i)},At=(t,e,s)=>"-"===s?t-e:"+"===s?t+e:t*e,It=(t,e)=>{if(e.t=0,e.n=0,e.u=null,e.o=null,e.d=null,e.s=null,!t)return e;const s=+t;if(!isNaN(s))return e.n=s,e;let i=t;"="===i[1]&&(e.o=i[0],i=i.slice(2));const r=!i.includes(" ")&&C.exec(i);if(r)return e.t=1,e.n=+r[1],e.u=r[2],e;if(e.o)return e.n=+i,e;if(W(o=i)||(U(o)||q(o))&&(")"===o[o.length-1]||!b.test(o)))return e.t=2,e.d=U(n=i)?(t=>{const e=T.exec(t)||x.exec(t),s=H(e[4])?1:+e[4];return[+e[1],+e[2],+e[3],s]})(n):W(n)?(t=>{const e=t.length,s=4===e||5===e;return[+("0x"+t[1]+t[s?1:2]),+("0x"+t[s?2:3]+t[s?2:4]),+("0x"+t[s?3:5]+t[s?3:6]),5===e||9===e?+(+("0x"+t[s?4:7]+t[s?4:8])/255).toFixed(3):1]})(n):q(n)?(t=>{const e=S.exec(t)||w.exec(t),s=+e[1]/360,i=+e[2]/100,r=+e[3]/100,n=H(e[4])?1:+e[4];let o,a,l;if(0===i)o=a=l=r;else{const t=r<.5?r*(1+i):r+i-r*i,e=2*r-t;o=ct(255*wt(e,t,s+1/3),0),a=ct(255*wt(e,t,s),0),l=ct(255*wt(e,t,s-1/3),0)}return[o,a,l,n]})(n):[0,0,0,1],e;var n,o;{const t=i.match($);return e.t=3,e.d=t?t.map(Number):[],e.s=i.split($)||[],e}},Rt=(t,e)=>(e.t=t._valueType,e.n=t._toNumber,e.u=t._unit,e.o=null,e.d=gt(t._toNumbers),e.s=gt(t._strings),e),Lt={t:0,n:0,u:null,o:null,d:null,s:null},Bt=(t,e,s)=>{const i=t._modifier,r=t._fromNumbers,n=t._toNumbers,o=t._strings;let a=o[0];for(let l=0,h=n.length;l<h;l++){const h=i(ct(pt(r[l],n[l],e),s)),d=o[l+1];a+=`${d?h+d:h}`,t._numbers[l]=h}return a},Pt=(t,e,s,i,n)=>{const o=t.parent,a=t.duration,h=t.completed,c=t.iterationDuration,u=t.iterationCount,p=t._currentIteration,m=t._loopDelay,f=t._reversed,g=t._alternate,y=t._hasChildren,_=t._delay,b=t._currentTime,v=_+c,T=e-_,x=dt(b,-_,a),S=dt(T,-_,a),w=T-b,$=S>0,C=S>=a,E=a<=d,k=2===n;let N=0,D=T,A=0;if(u>1){const e=c+(C?0:m),s=~~(S/e);t._currentIteration=dt(s,0,u),C&&t._currentIteration--,N=t._currentIteration%2,D=S-s*e||0}const R=f^(g&&N),L=t._ease;let B=C?R?0:a:R?c-D:D;L&&(B=c*L(B/c)||0);const P=(o?o.backwards:T<b)?!R:!!R;if(t._currentTime=T,t._iterationTime=B,t.backwards=P,$&&!t.began?(t.began=!0,s||o&&(P||!o.began)||t.onBegin(t)):T<=0&&(t.began=!1),s||y||!$||t._currentIteration===p||t.onLoop(t),k||1===n&&(e>=(o&&_>0?0:_)&&e<=v||e<=_&&x>_||e>=v&&x!==a)||B>=v&&x!==a||B<=_&&x>0&&!C||e<=x&&x===a&&h||C&&!h&&E){if($&&(t.computeDeltaTime(x),s||t.onBeforeUpdate(t)),!y){const e=k||(P?-1*w:w)>=I.tickThreshold,n=ct(t._offset+(o?o._offset:0)+_+B,12);let a,h,d,c,u=t._head,p=0;for(;u;){const t=u._composition,s=u._currentTime,o=u._changeDuration,m=u._absoluteStartTime+u._changeDuration,f=u._nextRep,g=u._prevRep,y=t!==r.none,_=g?g._absoluteStartTime+g._changeDuration:0,b=g&&g.parent!==u.parent,v=!f||f._isOverridden?m:f.parent===u.parent?m+f._delay:f._absoluteStartTime<f._absoluteUpdateStartTime?f._absoluteStartTime:f._absoluteUpdateStartTime;if((e||(s!==o||n<=v||g&&!b&&(!f||f.parent!==u.parent))&&(0!==s||n>=u._absoluteStartTime||b&&!u._hasFromValue&&!g._isOverridden&&n>=_||f&&!f._isOverridden&&f.parent===u.parent&&0!==f._currentTime&&B<f._startTime))&&(!g||b||B>=u._startTime)&&(!y||!u._isOverridden&&(!u._isOverlapped||n<=m)&&(!f||f._isOverridden||n<=v)&&(!g||g._isOverridden||(b?n>=u._absoluteStartTime||!u._hasFromValue&&n>=_:n>=_+u._delay)))){const e=u._currentTime=dt(B-u._startTime,0,o),s=u._ease(e/u._updateDuration),n=u._modifier,m=u._valueType,f=u._tweenType,g=0===f,_=0===m,b=_&&g||0===s||1===s?-1:I.precision;let v,T;if(_)v=T=n(ct(pt(u._fromNumber,u._toNumber,s),b));else if(1===m)T=n(ct(pt(u._fromNumber,u._toNumber,s),b)),v=`${T}${u._unit}`;else if(2===m){const t=u._numbers,e=u._fromNumbers,r=u._toNumbers,o=1-s,a=e[0],l=e[1],h=e[2],d=r[0],c=r[1],p=r[2];t[0]=n(Math.sqrt(a*a*o+d*d*s)),t[1]=n(Math.sqrt(l*l*o+c*c*s)),t[2]=n(Math.sqrt(h*h*o+p*p*s)),t[3]=n(pt(e[3],r[3],s)),u._setter&&!i||(v=`rgba(${ct(t[0],0)},${ct(t[1],0)},${ct(t[2],0)},${t[3]})`)}else 3===m&&(v=Bt(u,s,b));if(y&&(u._number=T),i||t===r.blend)u._value=v;else{const t=u.property;a=u.target,u._setter?u._setter(a,T,u):g?a[t]=v:1===f?a.setAttribute(t,v):(h=a.style,3===f?(a!==d&&(d=a,c=a[l]),c[t]=v,p=1):2===f?h[t]=v:4===f&&h.setProperty(t,v)),$&&(A=1)}}else s&&g&&!b&&B<u._startTime&&(u._currentTime=0);p&&u._renderTransforms&&(h.transform=Tt(c),p=0),u=u._next}!s&&A&&t.onRender(t)}!s&&$&&t.onUpdate(t)}return o&&E?!s&&(o.began&&!P&&T>0&&!h||P&&T<=d&&h)&&(t.onComplete(t),t.completed=!P):$&&C?u===1/0?t._startTime+=t.duration:t._currentIteration>=u-1&&(t.paused=!0,h||y||(t.completed=!0,s||o&&(P||!o.began)||(t.onComplete(t),t._resolve(t)))):t.completed=!1,A},Ft=(t,e,s,i,r)=>{const n=t._currentIteration;if(Pt(t,e,s,i,r),t._hasChildren){const o=t,a=o.backwards,l=i?e:o._iterationTime,h=P();let c=0,u=!0;if(!i&&o._currentIteration!==n){const t=o.iterationDuration;_t(o,e=>{if(a){const i=e.duration,r=e._offset+e._delay;s||!(i<=d)||r&&r+i!==t||e.onComplete(e)}else!e.completed&&!e.backwards&&e._currentTime<e.iterationDuration&&Pt(e,t,s,1,2),e.began=!1,e.completed=!1}),s||o.onLoop(o)}_t(o,t=>{const e=ct((l-t._offset)*t._speed,12);if(a&&e>t._delay+t.duration)return;const n=t._fps<o._fps?t.requestTick(h):r;c+=Pt(t,e,s,i,n),!t.completed&&u&&(u=!1)},a),!s&&c&&o.onRender(o),(u||a)&&o._currentTime>=o.duration&&(o.paused=!0,o.completed||(o.completed=!0,s||(o.onComplete(o),o._resolve(o))))}},Mt={},Vt=(t,e,s)=>{if(3===s)return f.get(t)||t;if(2===s||1===s&&Y(e)&&t in e.style){const e=Mt[t];if(e)return e;{const e=t?L(t):t;return Mt[t]=e,e}}return t},Ot=(t,e=!1)=>{if(t._hasChildren)_t(t,t=>Ot(t,e),!0);else{const s=t;s.pause(),_t(s,t=>{const i=t.property,r=t.target,n=t._tweenType,a=t._inlineValue,h=X(a)||a===p;if(t._setter){if(!e&&!h){if(It(a,Lt),Lt.d){const e=Lt.d,s=t._numbers;for(let t=0,i=e.length;t<i;t++)s[t]=e[t]}else t._number=Lt.n;t._setter(t.target,t._number,t)}}else if(0===n)e||h||(r[i]=a);else if(r[o])if(1===n)e||(h?r.removeAttribute(i):r.setAttribute(i,a));else{const e=r.style;if(3===n){const s=r[l];h?delete s[i]:s[i]=a,t._renderTransforms&&(Object.keys(s).length?e.transform=Tt(s):e.removeProperty("transform"))}else h?e.removeProperty(L(i)):e[i]=a}r[o]&&s._tail===t&&s.targets.forEach(t=>{t.getAttribute&&t.getAttribute("style")===p&&t.removeAttribute("style")})})}return t},zt=t=>Ot(t,!0);class Ht{constructor(t=0){this.deltaTime=0,this._currentTime=t,this._lastTickTime=t,this._startTime=t,this._lastTime=t,this._frameDuration=u/240,this._fps=240,this._speed=1,this._hasChildren=!1,this._head=null,this._tail=null}get fps(){return this._fps}set fps(t){const e=+t,s=e<d?d:e,i=u/s;s>D.frameRate&&(D.frameRate=s),this._fps=s,this._frameDuration=i}get speed(){return this._speed}set speed(t){const e=+t;this._speed=e<d?d:e}requestTick(t){const e=this._frameDuration,s=t-this._lastTickTime,i=.25*e;return s+(i<4?i:4)<e?0:(this._lastTickTime=s>=e?t-s%e:t,1)}computeDeltaTime(t){const e=t-this._lastTime;return this.deltaTime=e,this._lastTime=t,e}}const Xt={animation:null,update:_},Yt=(()=>e?requestAnimationFrame:setImmediate)(),Wt=(()=>e?cancelAnimationFrame:clearImmediate)();class Ut extends Ht{constructor(t){super(t),this.useDefaultMainLoop=!0,this.pauseOnDocumentHidden=!0,this.defaults=D,this.paused=!0,this.reqId=0}update(){const t=this._currentTime=P();if(this.requestTick(t)){this.computeDeltaTime(t);const e=this._speed,s=this._fps;let i=this._head;for(;i;){const r=i._next;i.paused?(bt(this,i),this._hasChildren=!!this._tail,i._running=!1,i.completed&&!i._cancelled&&i.cancel()):Ft(i,(t-i._startTime)*i._speed*e,0,0,i._fps<s?i.requestTick(t):1),i=r}Xt.update()}}wake(){return this.useDefaultMainLoop&&!this.reqId&&(this.requestTick(P()),this.reqId=Yt(jt)),this}pause(){if(this.reqId)return this.paused=!0,Gt()}resume(){if(this.paused)return this.paused=!1,_t(this,t=>t.resetTime()),this.wake()}get speed(){return this._speed*(1===I.timeScale?1:u)}set speed(t){const e=t*I.timeScale;this._speed!==e&&(this._speed=e,_t(this,t=>t.speed=t._speed))}get timeUnit(){return 1===I.timeScale?"ms":"s"}set timeUnit(t){const e="s"===t,s=e?.001:1;if(I.timeScale!==s){I.timeScale=s,I.tickThreshold=200*s;const t=e?.001:u;this.defaults.duration*=t,this._speed*=t}}get precision(){return I.precision}set precision(t){I.precision=t}}const qt=(()=>{const t=new Ut(P());return e&&(R.engine=t,i.addEventListener("visibilitychange",()=>{t.pauseOnDocumentHidden&&(i.hidden?t.pause():t.resume())})),t})(),jt=()=>{qt._head?(qt.reqId=Yt(jt),qt.update()):qt.reqId=0},Gt=()=>(Wt(qt.reqId),qt.reqId=0,qt),Zt={_rep:new WeakMap,_add:new Map},Qt=(t,e,s="_rep")=>{const i=Zt[s];let r=i.get(t);return r||(r={},i.set(t,r)),r[e]?r[e]:r[e]={_head:null,_tail:null}},Jt=(t,e)=>t._isOverridden||t._absoluteStartTime>e._absoluteStartTime,Kt=t=>{t._isOverlapped=1,t._isOverridden=1,t._changeDuration=d,t._currentTime=d},te=(t,e)=>{const s=t._composition;if(s===r.replace){const s=t._absoluteStartTime;vt(e,t,Jt,"_prevRep","_nextRep");const i=t._prevRep;if(i){const e=i.parent,r=i._absoluteEndTime;if(t.parent.id!==e.id&&e.iterationCount>1&&r+(e.duration-e.iterationDuration)>s){Kt(i);let t=i._prevRep;for(;t&&t.parent.id===e.id;)Kt(t),t=t._prevRep}const n=t._absoluteUpdateStartTime;if(r>n){const t=i._startTime,e=r-(t+i._updateDuration),s=ct(n-e-t,12);i._changeDuration=s,i._currentTime=s,i._isOverlapped=1,s<d&&Kt(i)}const o=t.parent.parent;if(!o||o!==e.parent){let t=!0;if(_t(e,e=>{e._isOverlapped||(t=!1)}),t){const t=e.parent;if(t){let s=!0;_t(t,t=>{t!==e&&_t(t,t=>{t._isOverlapped||(s=!1)})}),s&&t.cancel()}else e.cancel()}}}}else if(s===r.blend){const e=Qt(t.target,t.property,"_add"),s=(t=>{let e=Xt.animation;return e||(e={duration:d,computeDeltaTime:_,_offset:0,_delay:0,_head:null,_tail:null},Xt.animation=e,Xt.update=()=>{t.forEach(t=>{for(let e in t){const s=t[e],i=s._head;if(i){const t=i._valueType,e=3===t||2===t?gt(i._fromNumbers):null;let r=i._fromNumber,n=s._tail;for(;n&&n!==i;){if(e)for(let t=0,s=n._numbers.length;t<s;t++)e[t]+=n._numbers[t];else r+=n._number;n=n._prevAdd}i._toNumber=r,i._toNumbers=e}}}),Pt(e,1,1,0,2)}),e})(Zt._add);let i=e._head;i||(i={...t},i._composition=r.replace,i._updateDuration=d,i._startTime=0,i._numbers=gt(t._fromNumbers),i._number=0,i._next=null,i._prev=null,vt(e,i),vt(s,i));const n=t._toNumber;if(t._fromNumber=i._fromNumber-n,t._toNumber=0,t._numbers=gt(t._fromNumbers),t._number=0,i._fromNumber=n,t._toNumbers.length){const e=gt(t._toNumbers);e.forEach((e,s)=>{t._fromNumbers[s]=i._fromNumbers[s]-e,t._toNumbers[s]=0}),i._fromNumbers=e}vt(e,t,null,"_prevAdd","_nextAdd")}return t},ee=t=>{const e=t._composition;if(e!==r.none){const s=t.target,i=t.property,n=Zt._rep.get(s)[i];if(bt(n,t,"_prevRep","_nextRep"),e===r.blend){const e=Zt._add,r=e.get(s);if(!r)return;const n=r[i],o=Xt.animation;bt(n,t,"_prevAdd","_nextAdd");const a=n._head;if(a&&a===n._tail){bt(n,a,"_prevAdd","_nextAdd"),bt(o,a);let t=!0;for(let e in r)if(r[e]._head){t=!1;break}t&&e.delete(s)}}}return t},se=(t,e,s)=>{let i=!1;return _t(e,r=>{const n=r.target;if(t.includes(n)){const t=r.property,o=r._tweenType,a=Vt(s,n,o);(!a||a&&a===t)&&(r.parent._tail===r&&3===r._tweenType&&r._prev&&3===r._prev._tweenType&&(r._prev._renderTransforms=1),bt(e,r),ee(r),i=!0)}},!0),i},ie=(t,e,s)=>{const i=e||qt;let r;if(i._hasChildren){let e=0;_t(i,n=>{if(!n._hasChildren)if(r=se(t,n,s),r&&!n._head)n.cancel(),bt(i,n);else{const t=n._offset+n._delay+n.duration;t>e&&(e=t)}n._head?ie(t,n,s):n._hasChildren=!1},!0),H(i.iterationDuration)||(i.iterationDuration=e)}else r=se(t,i,s);r&&!i._head&&(i._hasChildren=!1,i.cancel&&i.cancel())},re=t=>(t.paused=!0,t.began=!1,t.completed=!1,t),ne=t=>t._cancelled?(t._hasChildren?_t(t,ne):_t(t,t=>{t._composition!==r.none&&te(t,Qt(t.target,t.property))}),t._cancelled=0,t):t;let oe=0;const ae=(t,e)=>t._priority>e._priority;class le extends Ht{constructor(t={},e=null,s=0){super(0),++oe;const{id:i,delay:r,duration:n,reversed:o,alternate:a,loop:l,loopDelay:h,autoplay:c,frameRate:u,playbackRate:p,priority:m,onComplete:f,onLoop:g,onPause:y,onBegin:b,onBeforeUpdate:v,onUpdate:T}=t;A.current&&A.current.register(this);const x=e?0:qt._lastTickTime,S=e?e.defaults:I.defaults,w=z(r)||H(r)?S.delay:+r,$=z(n)||H(n)?1/0:+n,C=$t(l,S.loop),E=$t(h,S.loopDelay);let k=!0===C||C===1/0||C<0?1/0:C+1,N=0;e?N=s:(qt.reqId||qt.requestTick(P()),N=(qt._lastTickTime-qt._startTime)*I.timeScale),this.id=H(i)?oe:i,this.parent=e,this.duration=mt(($+E)*k-E)||d,this.backwards=!1,this.paused=!0,this.began=!1,this.completed=!1,this.onBegin=b||S.onBegin,this.onBeforeUpdate=v||S.onBeforeUpdate,this.onUpdate=T||S.onUpdate,this.onLoop=g||S.onLoop,this.onPause=y||S.onPause,this.onComplete=f||S.onComplete,this.iterationDuration=$,this.iterationCount=k,this._autoplay=!e&&$t(c,S.autoplay),this._offset=N,this._delay=w,this._loopDelay=E,this._iterationTime=0,this._currentIteration=0,this._resolve=_,this._running=!1,this._reversed=+$t(o,S.reversed),this._reverse=this._reversed,this._cancelled=0,this._alternate=$t(a,S.alternate),this._prev=null,this._next=null,this._lastTickTime=x,this._startTime=x,this._lastTime=x,this._fps=$t(u,S.frameRate),this._speed=$t(p,S.playbackRate),this._priority=+$t(m,1)}get cancelled(){return!!this._cancelled}set cancelled(t){t?this.cancel():this.reset(!0).play()}get currentTime(){return dt(ct(this._currentTime,I.precision),-this._delay,this.duration)}set currentTime(t){const e=this.paused;this.pause().seek(+t),e||this.resume()}get iterationCurrentTime(){return dt(ct(this._iterationTime,I.precision),0,this.iterationDuration)}set iterationCurrentTime(t){this.currentTime=this.iterationDuration*this._currentIteration+t}get progress(){return dt(ct(this._currentTime/this.duration,10),0,1)}set progress(t){this.currentTime=this.duration*t}get iterationProgress(){return dt(ct(this._iterationTime/this.iterationDuration,10),0,1)}set iterationProgress(t){const e=this.iterationDuration;this.currentTime=e*this._currentIteration+e*t}get currentIteration(){return this._currentIteration}set currentIteration(t){this.currentTime=this.iterationDuration*dt(+t,0,this.iterationCount-1)}get reversed(){return!!this._reversed}set reversed(t){t?this.reverse():this.play()}get speed(){return super.speed}set speed(t){super.speed=t,this.resetTime()}reset(t=!1){return ne(this),this._reversed&&!this._reverse&&(this.reversed=!1),this._iterationTime=this.iterationDuration,Ft(this,0,1,~~t,2),re(this),this._hasChildren&&_t(this,re),this}init(t=!1){this.fps=this._fps,this.speed=this._speed,!t&&this._hasChildren&&Ft(this,this.duration,1,~~t,2),this.reset(t);const e=this._autoplay;return!0===e?this.resume():e&&!H(e.linked)&&e.link(this),this}resetTime(){const t=1/(this._speed*qt._speed);return this._startTime=P()-(this._currentTime+this._delay)*t,this}pause(){return this.paused||(this.paused=!0,this.onPause(this)),this}resume(){return this.paused?(this.paused=!1,this.duration<=d&&!this._hasChildren?Ft(this,d,0,0,2):(this._running||(vt(qt,this,ae),qt._hasChildren=!0,this._running=!0),this.resetTime(),this._startTime-=12,qt.wake()),this):this}restart(){return this.reset().resume()}seek(t,e=0,s=0){ne(this),this.completed=!1;const i=this.paused;return this.paused=!0,Ft(this,t+this._delay,~~e,~~s,1),i?this:this.resume()}alternate(){const t=this._reversed,e=this.iterationCount,s=this.iterationDuration,i=e===1/0?rt(c/s):e;return this._reversed=+(!this._alternate||i%2?!t:t),e===1/0?this.iterationProgress=this._reversed?1-this.iterationProgress:this.iterationProgress:this.seek(s*i-this._currentTime),this.resetTime(),this}play(){return this._reversed&&this.alternate(),this.resume()}reverse(){return this._reversed||this.alternate(),this.resume()}cancel(){return this._hasChildren?_t(this,t=>t.cancel(),!0):_t(this,ee),this._cancelled=1,this.pause()}stretch(t){const e=this.duration,s=ft(t);if(e===s)return this;const i=t/e,r=t<=d;return this.duration=r?d:s,this.iterationDuration=r?d:ft(this.iterationDuration*i),this._offset*=i,this._delay*=i,this._loopDelay*=i,this}revert(){Ft(this,0,1,0,1);const t=this._autoplay;return t&&t.linked&&t.linked===this&&t.revert(),this.cancel()}complete(t=0){return this.seek(this.duration,t).cancel()}then(t=_){const e=this.then,s=()=>{this.then=null,t(this),this.then=e,this._resolve=_};return new Promise(t=>(this._resolve=()=>t(s()),this.completed&&this._resolve(),this))}}function he(t){const e=O(t)?A.root.querySelectorAll(t):t;if(e instanceof NodeList||e instanceof HTMLCollection)return e}function de(t){if(X(t))return[];if(!e)return F(t)&&t.flat(1/0)||[t];if(F(t)){const e=t.flat(1/0),s=[];for(let t=0,i=e.length;t<i;t++){const i=e[t];if(!X(i)){const t=he(i);if(t)for(let e=0,i=t.length;e<i;e++){const i=t[e];if(!X(i)){let t=!1;for(let e=0,r=s.length;e<r;e++)if(s[e]===i){t=!0;break}t||s.push(i)}}else{let t=!1;for(let e=0,r=s.length;e<r;e++)if(s[e]===i){t=!0;break}t||s.push(i)}}}return s}const s=he(t);return s?Array.from(s):[t]}function ce(t){const e=de(t),s=e.length;for(let t=0;t<s;t++){const s=e[t];if(!s[n]){s[n]=!0;const t=Y(s);(s.nodeType||t)&&(s[o]=!0,s[a]=t,s[l]={})}}return e}const ue={deg:1,rad:180/lt,turn:360},pe={},me=(t,e,s,r=!1)=>{const n=e.u,o=e.n;if(1===e.t&&n===s)return e;const a=o+n+s,l=pe[a];if(H(l)||r){let r;if(n in ue)r=o*ue[n]/ue[s];else{const e=100,a=t.cloneNode(),l=t.parentNode,h=l&&l!==i?l:i.body;h.appendChild(a);const d=a.style;d.width=e+n;const c=a.offsetWidth||e;d.width=e+s;const u=c/(a.offsetWidth||e);h.removeChild(a),r=u*o}e.n=r,pe[a]=r}else e.n=l;return e.t,e.u=s,e},fe=t=>t,ge=(t=1.68)=>e=>Q(e,+t),ye={in:t=>e=>t(e),out:t=>e=>1-t(1-e),inOut:t=>e=>e<.5?t(2*e)/2:1-t(-2*e+2)/2,outIn:t=>e=>e<.5?(1-t(1-2*e))/2:(t(2*e-1)+1)/2},_e=lt/2,be=2*lt,ve={[p]:ge,Quad:ge(2),Cubic:ge(3),Quart:ge(4),Quint:ge(5),Sine:t=>1-tt(t*_e),Circ:t=>1-J(1-t*t),Expo:t=>t?Q(2,10*t-10):0,Bounce:t=>{let e,s=4;for(;t<((e=Q(2,--s))-1)/11;);return 1/Q(4,3-s)-7.5625*Q((3*e-2)/22-t,2)},Back:(t=1.7)=>e=>(+t+1)*e*e*e-+t*e*e,Elastic:(t=1,e=.3)=>{const s=dt(+t,1,10),i=dt(+e,d,2),r=i/be*nt(1/s),n=be/i;return t=>0===t||1===t?t:-s*Q(2,-10*(1-t))*K((1-t-r)*n)}},Te=(()=>{const t={linear:fe,none:fe};for(let e in ye)for(let s in ve){const i=ve[s],r=ye[e];t[e+s]=s===p||"Back"===s||"Elastic"===s?(t,e)=>r(i(t,e)):r(i)}return t})(),xe={linear:fe,none:fe},Se=t=>{if(xe[t])return xe[t];if(t.indexOf("(")<=-1){const e=ye[t]||t.includes("Back")||t.includes("Elastic")?Te[t]():Te[t];return e?xe[t]=e:fe}{const e=t.slice(0,-1).split("("),s=Te[e[0]];return s?xe[t]=s(...e[1].split(",")):fe}},we=["steps(","irregular(","linear(","cubicBezier("],$e=t=>{if(O(t))for(let e=0,s=we.length;e<s;e++)if(B(t,we[e]))return console.warn(`String syntax for \`ease: "${t}"\` has been removed from the core and replaced by importing and passing the easing function directly: \`ease: ${t}\``),fe;return z(t)?t:O(t)?Se(t):fe},Ce={t:0,n:0,u:null,o:null,d:null,s:null},Ee={t:0,n:0,u:null,o:null,d:null,s:null},ke={},Ne={func:null},De={func:null},Ae=[null],Ie=[null,null],Re={to:null};let Le,Be,Pe=0,Fe=0;class Me extends le{constructor(t,e,s,i,n=!1,o=0,a){super(e,s,i),this._head,this._tail,++Fe;const l=ce(t),h=l.length,c=e.keyframes,p=c?yt(((t,e)=>{const s={};if(F(t)){const e=[].concat(...t.map(t=>Object.keys(t))).filter(j);for(let i=0,r=e.length;i<r;i++){const r=e[i],n=t.map(t=>{const e={};for(let s in t){const i=t[s];j(s)?s===r&&(e.to=i):e[s]=i}return e});s[r]=n}}else{const i=$t(e.duration,I.defaults.duration),r=Object.keys(t).map(e=>({o:parseFloat(e)/100,p:t[e]})).sort((t,e)=>t.o-e.o);r.forEach(t=>{const e=t.o,r=t.p;for(let t in r)if(j(t)){let n=s[t];n||(n=s[t]=[]);const o=e*i;let a=n.length,l=n[a-1];const h={to:r[t]};let d=0;for(let t=0;t<a;t++)d+=n[t].duration;1===a&&(h.from=l.to),r.ease&&(h.ease=r.ease),h.duration=o-(a?d:0),n.push(h)}return t});for(let t in s){const e=s[t];let i;for(let t=0,s=e.length;t<s;t++){const s=e[t],r=s.ease;s.ease=i||void 0,i=r}e[0].duration||e.shift()}}return s})(c,e),e):e,{id:f,delay:g,duration:y,ease:_,playbackEase:b,modifier:v,composition:T,onRender:x}=p,S=s?s.defaults:I.defaults,w=$t(_,S.ease),$=$t(b,S.playbackEase),C=$?$e($):null,E=!H(w.ease),k=E?w.ease:$t(_,C?"linear":S.ease),N=E?w.settlingDuration:$t(y,S.duration),D=$t(g,S.delay),A=v||S.modifier,R=H(T)&&h>=u?r.none:H(T)?S.composition:T,L=this._offset+(s?s._offset:0);E&&(w.parent=this);let B=NaN,P=NaN,Y=0,W=0;for(let t=0;t<h;t++){const e=l[t],i=o||t,h=a||l;let c=NaN,u=NaN;for(let t in p)if(j(t)){const o=kt(e,t),a=St(e,t),l=Vt(t,e,o);let f=p[t];const g=F(f);if(n&&!g&&(Ie[0]=f,Ie[1]=f,f=Ie),g){const t=f.length,e=!M(f[0]);2===t&&e?(Re.to=f,Ae[0]=Re,Le=Ae):t>2&&e?(Le=[],f.forEach((t,e)=>{e?1===e?(Ie[1]=t,Le.push(Ie)):Le.push(t):Ie[0]=t})):Le=f}else Ae[0]=f,Le=Ae;let y=null,_=null,b=NaN,v=0,T=0;for(let t=Le.length;T<t;T++){const n=Le[T];M(n)?Be=n:(Re.to=n,Be=Re),Ne.func=null,De.func=null;const c=Et($t(Be.composition,R),e,i,h,null,null),u=V(c)?c:r[c];y||u===r.none||(y=Qt(e,l));const p=y?y._tail:null,f=s&&p&&p.parent.parent===s?p:_,g=Et(Be.to,e,i,h,Ne,f);let x;M(g)&&!H(g.to)?(Be=g,x=g.to):x=g;const S=Et(Be.from,e,i,h,De,f),w=Be.ease||k,$=Et(w,e,i,h,null,f),C=z($)||O($)?$:w,E=!H(C)&&!H(C.ease),I=E?C.ease:C,B=E?C.settlingDuration:Et($t(Be.duration,t>1?Et(N,e,i,h,null,f)/t:N),e,i,h,null,f),P=Et($t(Be.delay,T?0:D),e,i,h,null,f),U=Be.modifier||A,q=!H(S),j=!H(x),G=F(x),Z=G||q&&j,Q=_?v:0,J=_?v+P:P,K=ct(L+J,12),tt=ct(L+Q,12);W||!q&&!G||(W=1);let et=_;if(u!==r.none){let t=y._head;for(;t&&t._absoluteStartTime<=K;)if(t._isOverridden||(et=t),t=t._nextRep,t&&t._absoluteStartTime>=K)for(;t;)Kt(t),t=t._nextRep}if(Z){It(G?Et(x[0],e,i,h,De,f):S,Ce),It(G?Et(x[1],e,i,h,Ne,f):x,Ee);const t=Dt(e,l,o,ke);0===Ce.t&&(et?1===et._valueType&&(Ce.t=1,Ce.u=et._unit):(It(t,Lt),1===Lt.t&&(Ce.t=1,Ce.u=Lt.u)))}else j?It(x,Ee):_?Rt(_,Ee):It(s&&et&&et.parent.parent===s?et._value:Dt(e,l,o,ke),Ee),q?It(S,Ce):_?Rt(_,Ce):It(s&&et&&et.parent.parent===s?et._value:Dt(e,l,o,ke),Ce);if(Ce.o&&(Ce.n=At(et?et._toNumber:It(Dt(e,l,o,ke),Lt).n,Ce.n,Ce.o)),Ee.o&&(Ee.n=At(Ce.n,Ee.n,Ee.o)),Ce.t!==Ee.t)if(3===Ce.t||3===Ee.t){const t=3===Ce.t?Ce:Ee,e=3===Ce.t?Ee:Ce;e.t=3,e.s=gt(t.s),e.d=t.d.map(()=>e.n)}else if(1===Ce.t||1===Ee.t){const t=1===Ce.t?Ce:Ee,e=1===Ce.t?Ee:Ce;e.t=1,e.u=t.u}else if(2===Ce.t||2===Ee.t){const t=2===Ce.t?Ce:Ee,e=2===Ce.t?Ee:Ce;e.t=2,e.d=t.d.map(()=>0)}if(Ce.u!==Ee.u){let t=Ee.u?Ce:Ee;t=me(e,t,Ee.u?Ee.u:Ce.u,!1)}if(Ee.d&&Ce.d&&Ee.d.length!==Ce.d.length){const t=Ce.d.length>Ee.d.length?Ce:Ee,e=t===Ce?Ee:Ce;e.d=t.d.map((t,s)=>H(e.d[s])?0:e.d[s]),e.s=gt(t.s)}const st=ct(+B||d,12);let it=ke[l];X(it)||(ke[l]=null);const rt=a?a.set:null;v=ct(J+st,12);const nt=Ce.d,ot=Ee.d,at=Ee.s,lt={parent:this,id:Pe++,property:l,target:e,_value:null,_toFunc:Ne.func,_fromFunc:De.func,_ease:$e(I),_fromNumbers:nt?gt(nt):m,_toNumbers:ot?gt(ot):m,_strings:at?gt(at):m,_fromNumber:Ce.n,_toNumber:Ee.n,_numbers:nt?gt(nt):m,_number:Ce.n,_unit:Ee.u,_modifier:U,_currentTime:0,_startTime:J,_delay:+P,_updateDuration:st,_changeDuration:st,_absoluteStartTime:K,_absoluteUpdateStartTime:tt,_absoluteEndTime:ct(L+v,12),_hasFromValue:q||G?1:0,_tweenType:o,_setter:rt,_valueType:Ee.t,_composition:u,_isOverlapped:0,_isOverridden:0,_renderTransforms:0,_inlineValue:it,_prevRep:null,_nextRep:null,_prevAdd:null,_nextAdd:null,_prev:null,_next:null};u!==r.none&&te(lt,y);const ht=lt._valueType;if(3===ht)lt._value=Bt(lt,1,-1);else if(1===ht)lt._value=`${U(lt._toNumber)}${lt._unit}`;else if(2===ht){const t=Ee.d;lt._value=`rgba(${ct(t[0],0)},${ct(t[1],0)},${ct(t[2],0)},${t[3]})`}else lt._value=U(lt._toNumber);isNaN(b)&&(b=lt._startTime),_=lt,Y++,vt(this,lt)}(isNaN(P)||b<P)&&(P=b),(isNaN(B)||v>B)&&(B=v),3===o&&(c=Y-T,u=Y)}if(!isNaN(c)){let t=0;_t(this,e=>{t>=c&&t<u&&(e._renderTransforms=1,e._composition===r.blend&&_t(Xt.animation,t=>{t.id===e.id&&(t._renderTransforms=1)})),t++})}}h||console.warn("No target found. Make sure the element you're trying to animate is accessible before creating your animation."),P?(_t(this,t=>{t._startTime-t._delay||(t._delay-=P),t._startTime-=P}),B-=P):P=0,B||(B=d,this.iterationCount=0),this.targets=l,this.id=H(f)?Fe:f,this.duration=B===d?d:mt((B+this._loopDelay)*this.iterationCount-this._loopDelay)||d,this.onRender=x||S.onRender,this._ease=C,this._delay=P,this.iterationDuration=B,!this._autoplay&&W&&this.onRender(this)}stretch(t){const e=this.duration;if(e===ft(t))return this;const s=t/e;return _t(this,t=>{t._updateDuration=ft(t._updateDuration*s),t._changeDuration=ft(t._changeDuration*s),t._currentTime*=s,t._delay*=s,t._startTime*=s,t._absoluteStartTime*=s,t._absoluteUpdateStartTime*=s,t._absoluteEndTime*=s}),super.stretch(t)}refresh(){return _t(this,t=>{const e=t._toFunc,s=t._fromFunc;(e||s)&&(s?(It(s(),Ce),Ce.u!==t._unit&&t.target[o]&&me(t.target,Ce,t._unit,!0),t._fromNumbers=gt(Ce.d),t._fromNumber=Ce.n):e&&(It(Dt(t.target,t.property,t._tweenType),Lt),t._fromNumbers=gt(Lt.d),t._fromNumber=Lt.n),e&&(It(e(),Ee),t._toNumbers=gt(Ee.d),t._strings=gt(Ee.s),t._toNumber=Ee.o?At(t._fromNumber,Ee.n,Ee.o):Ee.n))}),this.duration===d&&this.restart(),this}revert(){return super.revert(),Ot(this)}then(t){return super.then(t)}}const Ve=(t,e)=>{let s=t.iterationDuration;if(s===d&&(s=0),H(e))return s;if(V(+e))return+e;const i=e,r=t?t.labels:null,n=!X(r),o=((t,e)=>{if(B(e,"<")){const s="<"===e[1],i=t._tail,r=i?i._offset+i._delay:0;return s?r:r+i.duration}})(t,i),a=!H(o),l=k.exec(i);if(l){const t=l[0],e=i.split(t),h=n&&e[0]?r[e[0]]:s,d=a?o:n?h:s,c=+e[1];return At(d,c,t[0])}return a?o:n?H(r[i])?s:r[i]:s};function Oe(t,e,s,i,r,n){const o=V(t.duration)&&t.duration<=d?s-d:s;e.composition&&Ft(e,o,1,1,1);const a=i?new Me(i,t,e,o,!1,r,n):new le(t,e,o);return e.composition&&a.init(!0),vt(e,a),_t(e,t=>{const s=t._offset+t._delay+t.duration;s>e.iterationDuration&&(e.iterationDuration=s)}),e.duration=function(t){return mt((t.iterationDuration+t._loopDelay)*t.iterationCount-t._loopDelay)||d}(e),e}let ze=0;class He extends le{constructor(t={}){super(t,null,0),++ze,this.id=H(t.id)?ze:t.id,this.duration=0,this.labels={};const e=t.defaults,s=I.defaults;this.defaults=e?yt(e,s):s,this.composition=$t(t.composition,!0),this.onRender=t.onRender||s.onRender;const i=$t(t.playbackEase,s.playbackEase);this._ease=i?$e(i):null,this.iterationDuration=0}add(t,e,s){const i=M(e),r=M(t);if(i||r){if(this._hasChildren=!0,i){const i=e,r=I.editor&&I.editor.addTimelineChild,n=s&&"Stagger"===s.type&&I.editor,o=z(s)?s:null;if(o||n){const e=de(t),n=this.duration,a=this.iterationDuration,l=i.id;let h=0;const d=e.length,c=r?r(t,i,this.id,s,d):null,u=o||I.editor.resolveStagger(s.defaultValue);e.forEach(t=>{const s={...c||i};this.duration=n,this.iterationDuration=a,H(l)||(s.id=l+"-"+h),Oe(s,this,Ve(this,u(t,h,e,null,this)),t,h,e),h++})}else{const e=r?r(t,i,this.id,s):i,n=s&&s.type?s.defaultValue:s;Oe(e,this,Ve(this,n),t)}}else Oe(t,this,Ve(this,e));return this.composition&&this.init(!0),this}}sync(t,e){if(H(t)||t&&H(t.pause))return this;t.pause();const s=+(t.effect?t.effect.getTiming().duration:t.duration);H(t)||H(t.persist)||(t.persist=!0);const i=I.editor,r=i&&i.addTimelineChild;i&&i.addTimelineSync&&(e=i.addTimelineSync(t,e,this.id),i.addTimelineChild=null);const n=this.add(t,{currentTime:[0,s],duration:s,delay:0,ease:"linear",playbackEase:"linear"},e);return i&&(i.addTimelineChild=r),n}set(t,e,s){return H(e)?this:(e.duration=d,e.composition=r.replace,this.add(t,e,s))}call(t,e){return H(t)||t&&!z(t)?this:(I.editor&&I.editor.addTimelineCall&&(e=I.editor.addTimelineCall(t,e,this.id)),this.add({duration:0,delay:0,onComplete:()=>t(this)},e))}label(t,e){return H(t)||t&&!O(t)||(I.editor&&I.editor.addTimelineLabel&&(e=I.editor.addTimelineLabel(t,e,this.id)),this.labels[t]=Ve(this,e)),this}remove(t,e){return ie(de(t),this,e),this}stretch(t){const e=this.duration;if(e===ft(t))return this;const s=t/e,i=this.labels;_t(this,t=>t.stretch(t.duration*s));for(let t in i)i[t]*=s;return super.stretch(t)}refresh(){return _t(this,t=>{t.refresh&&t.refresh()}),this}revert(){return super.revert(),_t(this,t=>t.revert,!0),Ot(this)}then(t){return super.then(t)}}const Xe=t=>I.editor?I.editor.addTimeline(t):new He(t).init();class Ye{constructor(t,e){A.current&&A.current.register(this);const s=()=>{if(this.callbacks.completed)return;let t=!0;for(let e in this.animations)if(!this.animations[e].paused&&t){t=!1;break}t&&this.callbacks.complete()},i={onBegin:()=>{this.callbacks.completed&&this.callbacks.reset(),this.callbacks.play()},onComplete:s,onPause:s},n={v:1,autoplay:!1},o={};if(this.targets=[],this.animations={},this.callbacks=null,!H(t)&&!H(e)){for(let t in e){const s=e[t];j(t)?o[t]=s:B(t,"on")?n[t]=s:i[t]=s}this.callbacks=new Me({v:0},n);for(let e in o){const s=o[e],n=M(s);let a={},l="+=0";if(n){const t=s.unit;O(t)&&(l+=t)}else a.duration=s;a[e]=n?yt({to:l},s):l;const h=yt(i,a);h.composition=r.replace,h.autoplay=!1;const d=this.animations[e]=new Me(t,h,null,0,!1).init();this.targets.length||this.targets.push(...d.targets),this[e]=(t,e,s)=>{const i=d._head;if(H(t)&&i){const t=i._numbers;return t&&t.length?t:i._modifier(i._number)}return _t(d,e=>{if(F(t))for(let s=0,i=t.length;s<i;s++)H(e._numbers[s])||(e._fromNumbers[s]=e._modifier(e._numbers[s]),e._toNumbers[s]=t[s]);else e._fromNumber=e._modifier(e._number),e._toNumber=t;H(s)||(e._ease=$e(s)),e._currentTime=0}),H(e)||d.stretch(e),d.reset(!0).resume(),this}}}}revert(){for(let t in this.animations)this[t]=_,this.animations[t].revert();return this.animations={},this.targets.length=0,this.callbacks&&this.callbacks.revert(),this}}const We=(t,e,s,i,r)=>i+(t-e)/(s-e)*(r-i);var Ue=Object.freeze({__proto__:null,clamp:dt,damp:(t,e,s,i)=>i?1===i?e:pt(t,e,1-Math.exp(-i*s*.1)):t,degToRad:t=>t*Math.PI/180,lerp:pt,mapRange:We,padEnd:(t,e,s)=>`${t}`.padEnd(e,s),padStart:(t,e,s)=>`${t}`.padStart(e,s),radToDeg:t=>180*t/Math.PI,round:ct,roundPad:(t,e)=>(+t).toFixed(e),snap:ut,wrap:(t,e,s)=>((t-e)%(s-e)+(s-e))%(s-e)+e});const qe=10*u;class je{constructor(t={}){const e=!H(t.bounce)||!H(t.duration);this.timeStep=.02,this.restThreshold=5e-4,this.restDuration=200,this.maxDuration=6e4,this.maxRestSteps=this.restDuration/this.timeStep/u,this.maxIterations=this.maxDuration/this.timeStep/u,this.bn=dt($t(t.bounce,.5),-1,1),this.pd=dt($t(t.duration,628),10*I.timeScale,qe*I.timeScale),this.m=dt($t(t.mass,1),1,qe),this.s=dt($t(t.stiffness,100),d,qe),this.d=dt($t(t.damping,10),d,qe),this.v=dt($t(t.velocity,0),-1e4,qe),this.w0=0,this.zeta=0,this.wd=0,this.b=0,this.completed=!1,this.solverDuration=0,this.settlingDuration=0,this.parent=null,this.onComplete=t.onComplete||_,e&&this.calculateSDFromBD(),this.compute(),this.ease=t=>{const e=t*this.settlingDuration,s=this.completed,i=this.pd;return e>=i&&!s&&(this.completed=!0,this.onComplete(this.parent)),e<i&&s&&(this.completed=!1),0===t||1===t?t:this.solve(t*this.solverDuration)}}solve(t){const{zeta:e,w0:s,wd:i,b:r}=this;let n=t;return n=e<1?st(-n*e*s)*(1*tt(i*n)+r*K(i*n)):1===e?(1+r*n)*st(-n*s):((1+r)*st((-e*s+i)*n)+(1-r)*st((-e*s-i)*n))/2,1-n}calculateSDFromBD(){const t=1===I.timeScale?this.pd/u:this.pd;this.m=1,this.v=0,this.s=Q(2*lt/t,2),this.bn>=0?this.d=4*(1-this.bn)*lt/t:this.d=4*lt/(t*(1+this.bn)),this.s=ct(dt(this.s,d,qe),3),this.d=ct(dt(this.d,d,300),3)}calculateBDFromSD(){const t=2*lt/J(this.s);this.pd=t*(1===I.timeScale?u:1);const e=this.d/(2*J(this.s));this.bn=e<=1?1-this.d*t/(4*lt):4*lt/(this.d*t)-1,this.bn=ct(dt(this.bn,-1,1),3),this.pd=ct(dt(this.pd,10*I.timeScale,qe*I.timeScale),3)}compute(){const{maxRestSteps:t,maxIterations:e,restThreshold:s,timeStep:i,m:r,d:n,s:o,v:a}=this,l=this.w0=dt(J(o/r),d,u),h=this.zeta=n/(2*J(o*r));h<1?(this.wd=l*J(1-h*h),this.b=(h*l-a)/this.wd):1===h?(this.wd=0,this.b=-a+l):(this.wd=l*J(h*h-1),this.b=(h*l-a)/this.wd);let c=0,p=0,m=0;for(;p<=t&&m<=e;)et(1-this.solve(c))<s?p++:p=0,this.solverDuration=c,c+=i,m++;this.settlingDuration=ct(this.solverDuration*u,0)*I.timeScale}get bounce(){return this.bn}set bounce(t){this.bn=dt($t(t,1),-1,1),this.calculateSDFromBD(),this.compute()}get duration(){return this.pd}set duration(t){this.pd=dt($t(t,1),10*I.timeScale,qe*I.timeScale),this.calculateSDFromBD(),this.compute()}get stiffness(){return this.s}set stiffness(t){this.s=dt($t(t,100),d,qe),this.calculateBDFromSD(),this.compute()}get damping(){return this.d}set damping(t){this.d=dt($t(t,10),d,qe),this.calculateBDFromSD(),this.compute()}get mass(){return this.m}set mass(t){this.m=dt($t(t,1),1,qe),this.compute()}get velocity(){return this.v}set velocity(t){this.v=dt($t(t,0),-1e4,qe),this.compute()}}const Ge=t=>new je(t),Ze=t=>(console.warn("createSpring() is deprecated use spring() instead"),new je(t)),Qe={_head:null,_tail:null},Je=(t,e,s)=>{let i,r=Qe._head;for(;r;){const n=r._next,o=r.$el===t,a=!e||r.property===e,l=!s||r.parent===s;if(o&&a&&l){i=r.animation;try{i.commitStyles()}catch{}i.cancel(),bt(Qe,r);const t=r.parent;t&&(t._completed++,t.animations.length===t._completed&&(t.completed=!0,t.paused=!0,t.muteCallbacks||(t.onComplete(t),t._resolve(t))))}r=n}return i},Ke=(t,e,s,i,r)=>{const n=e.animate(i,r),o=r.delay+ +r.duration*r.iterations;n.playbackRate=t._speed,t.paused&&n.pause(),t.duration<o&&(t.duration=o,t.controlAnimation=n),t.animations.push(n),Je(e,s),vt(Qe,{parent:t,animation:n,$el:e,property:s,_next:null,_prev:null});const a=()=>Je(e,s,t);return n.oncancel=a,n.onremove=a,t.persist||(n.onfinish=a),n};function ts(t,e,s){const i=ce(t);if(!i.length)return;const[r]=i,n=kt(r,e),o=Vt(e,r,n);let a=Dt(r,o);if(H(s))return a;if(It(a,Lt),0===Lt.t||1===Lt.t){if(!1===s)return Lt.n;{const t=me(r,Lt,s,!1);return`${ct(t.n,I.precision)}${t.u}`}}}const es=(t,e)=>{if(!H(e))return I.editor&&I.editor.addSet?I.editor.addSet(t,e):(e.duration=d,e.composition=$t(e.composition,r.none),new Me(t,e,null,0,!0).resume())},ss=(t,e,s)=>{const i=de(t);for(let t=0,r=i.length;t<r;t++)Je(i[t],s,e&&e.controlAnimation&&e);return ie(i,e,s),i},is=t=>{t.cancelable&&t.preventDefault()};class rs{constructor(t){this.el=t,this.zIndex=0,this.parentElement=null,this.classList={add:_,remove:_}}get x(){return this.el.x||0}set x(t){this.el.x=t}get y(){return this.el.y||0}set y(t){this.el.y=t}get width(){return this.el.width||0}set width(t){this.el.width=t}get height(){return this.el.height||0}set height(t){this.el.height=t}getBoundingClientRect(){return{top:this.y,right:this.x,bottom:this.y+this.height,left:this.x+this.width}}}class ns{constructor(t){this.$el=t,this.inlineTransforms=[],this.point=new DOMPoint,this.inversedMatrix=this.getMatrix().inverse()}normalizePoint(t,e){return this.point.x=t,this.point.y=e,this.point.matrixTransform(this.inversedMatrix)}traverseUp(t){let e=this.$el.parentElement,s=0;for(;e&&e!==i;)t(e,s),e=e.parentElement,s++}getMatrix(){const t=new DOMMatrix;return this.traverseUp(e=>{const s=getComputedStyle(e).transform;if(s){const e=new DOMMatrix(s);t.preMultiplySelf(e)}}),t}remove(){this.traverseUp((t,e)=>{this.inlineTransforms[e]=t.style.transform,t.style.transform="none"})}revert(){this.traverseUp((t,e)=>{const s=this.inlineTransforms[e];""===s?t.style.removeProperty("transform"):t.style.transform=s})}}const os=(t,e)=>t&&z(t)?t(e):t;let as=0;class ls{constructor(t,e={}){if(!t)return;A.current&&A.current.register(this);const r=e.x,n=e.y,o=e.trigger,a=e.modifier,l=e.releaseEase,h=l&&$e(l),d=!H(l)&&!H(l.ease),u=M(r)&&!H(r.mapTo)?r.mapTo:"translateX",p=M(n)&&!H(n.mapTo)?n.mapTo:"translateY",m=os(e.container,this);this.containerArray=F(m)?m:null,this.$container=m&&!this.containerArray?de(m)[0]:i.body,this.useWin=this.$container===i.body,this.$scrollContainer=this.useWin?s:this.$container,this.$target=M(t)?new rs(t):de(t)[0],this.$trigger=de(o||t)[0],this.fixed="fixed"===ts(this.$target,"position"),this.isFinePointer=!0,this.containerPadding=[0,0,0,0],this.containerFriction=0,this.releaseContainerFriction=0,this.snapX=0,this.snapY=0,this.scrollSpeed=0,this.scrollThreshold=0,this.dragSpeed=0,this.dragThreshold=3,this.maxVelocity=0,this.minVelocity=0,this.velocityMultiplier=0,this.cursor=!1,this.releaseXSpring=d?l:Ge({mass:$t(e.releaseMass,1),stiffness:$t(e.releaseStiffness,80),damping:$t(e.releaseDamping,20)}),this.releaseYSpring=d?l:Ge({mass:$t(e.releaseMass,1),stiffness:$t(e.releaseStiffness,80),damping:$t(e.releaseDamping,20)}),this.releaseEase=h||Te.outQuint,this.hasReleaseSpring=d,this.onGrab=e.onGrab||_,this.onDrag=e.onDrag||_,this.onRelease=e.onRelease||_,this.onUpdate=e.onUpdate||_,this.onSettle=e.onSettle||_,this.onSnap=e.onSnap||_,this.onResize=e.onResize||_,this.onAfterResize=e.onAfterResize||_,this.disabled=[0,0];const f={};if(a&&(f.modifier=a),H(r)||!0===r)f[u]=0;else if(M(r)){const t=r,e={};t.modifier&&(e.modifier=t.modifier),t.composition&&(e.composition=t.composition),f[u]=e}else!1===r&&(f[u]=0,this.disabled[0]=1);if(H(n)||!0===n)f[p]=0;else if(M(n)){const t=n,e={};t.modifier&&(e.modifier=t.modifier),t.composition&&(e.composition=t.composition),f[p]=e}else!1===n&&(f[p]=0,this.disabled[1]=1);this.animate=new Ye(this.$target,f),this.xProp=u,this.yProp=p,this.destX=0,this.destY=0,this.deltaX=0,this.deltaY=0,this.scroll={x:0,y:0},this.coords=[this.x,this.y,0,0],this.snapped=[0,0],this.pointer=[0,0,0,0,0,0,0,0],this.scrollView=[0,0],this.dragArea=[0,0,0,0],this.containerBounds=[-c,c,c,-c],this.scrollBounds=[0,0,0,0],this.targetBounds=[0,0,0,0],this.window=[0,0],this.velocityStack=[0,0,0],this.velocityStackIndex=0,this.velocityTime=P(),this.velocity=0,this.angle=0,this.cursorStyles=null,this.triggerStyles=null,this.bodyStyles=null,this.targetStyles=null,this.touchActionStyles=null,this.transforms=new ns(this.$target),this.overshootCoords={x:0,y:0},this.overshootTicker=new le({autoplay:!1,onUpdate:()=>{this.updated=!0,this.manual=!0,this.disabled[0]||this.animate[this.xProp](this.overshootCoords.x,1),this.disabled[1]||this.animate[this.yProp](this.overshootCoords.y,1)},onComplete:()=>{this.manual=!1,this.disabled[0]||this.animate[this.xProp](this.overshootCoords.x,0),this.disabled[1]||this.animate[this.yProp](this.overshootCoords.y,0)}},null,0).init(),this.updateTicker=new le({autoplay:!1,onUpdate:()=>this.update()},null,0).init(),this.contained=!H(m),this.manual=!1,this.grabbed=!1,this.dragged=!1,this.updated=!1,this.released=!1,this.canScroll=!1,this.enabled=!1,this.initialized=!1,this.activeProp=this.disabled[1]?u:p,this.animate.callbacks.onRender=()=>{const t=this.updated,e=!(this.grabbed&&t)&&this.released,s=this.x,i=this.y,r=s-this.coords[2],n=i-this.coords[3];this.deltaX=r,this.deltaY=n,this.coords[2]=s,this.coords[3]=i,t&&(r||n)&&this.onUpdate(this),e?(this.computeVelocity(r,n),this.angle=at(n,r)):this.updated=!1},this.animate.callbacks.onComplete=()=>{!this.grabbed&&this.released&&(this.released=!1),this.manual||(this.deltaX=0,this.deltaY=0,this.velocity=0,this.velocityStack[0]=0,this.velocityStack[1]=0,this.velocityStack[2]=0,this.velocityStackIndex=0,this.onSettle(this))},this.resizeTicker=new le({autoplay:!1,duration:150*I.timeScale,onComplete:()=>{this.onResize(this),this.refresh(),this.onAfterResize(this)}}).init(),this.parameters=e,this.resizeObserver=new ResizeObserver(()=>{this.initialized?this.resizeTicker.restart():this.initialized=!0}),this.enable(),this.refresh(),this.resizeObserver.observe(this.$container),M(t)||this.resizeObserver.observe(this.$target)}computeVelocity(t,e){const s=this.velocityTime,i=P(),r=i-s;if(r<17)return this.velocity;this.velocityTime=i;const n=this.velocityStack,o=this.velocityMultiplier,a=this.minVelocity,l=this.maxVelocity,h=this.velocityStackIndex;n[h]=ct(dt(J(t*t+e*e)/r*o,a,l),5);const d=ot(n[0],n[1],n[2]);return this.velocity=d,this.velocityStackIndex=(h+1)%3,d}setX(t,e=!1){if(this.disabled[0])return;const s=ct(t,5);return this.overshootTicker.pause(),this.manual=!0,this.updated=!e,this.destX=s,this.snapped[0]=ut(s,this.snapX),this.animate[this.xProp](s,0),this.manual=!1,this}setY(t,e=!1){if(this.disabled[1])return;const s=ct(t,5);return this.overshootTicker.pause(),this.manual=!0,this.updated=!e,this.destY=s,this.snapped[1]=ut(s,this.snapY),this.animate[this.yProp](s,0),this.manual=!1,this}get x(){return ct(this.animate[this.xProp](),I.precision)}set x(t){this.setX(t,!1)}get y(){return ct(this.animate[this.yProp](),I.precision)}set y(t){this.setY(t,!1)}get progressX(){return We(this.x,this.containerBounds[3],this.containerBounds[1],0,1)}set progressX(t){this.setX(We(t,0,1,this.containerBounds[3],this.containerBounds[1]),!1)}get progressY(){return We(this.y,this.containerBounds[0],this.containerBounds[2],0,1)}set progressY(t){this.setY(We(t,0,1,this.containerBounds[0],this.containerBounds[2]),!1)}updateScrollCoords(){const t=ct(this.useWin?s.scrollX:this.$container.scrollLeft,0),e=ct(this.useWin?s.scrollY:this.$container.scrollTop,0),[i,r,n,o]=this.containerPadding,a=this.scrollThreshold;this.scroll.x=t,this.scroll.y=e,this.scrollBounds[0]=e-this.targetBounds[0]+i-a,this.scrollBounds[1]=t-this.targetBounds[1]-r+a,this.scrollBounds[2]=e-this.targetBounds[2]-n+a,this.scrollBounds[3]=t-this.targetBounds[3]+o-a}updateBoundingValues(){const t=this.$container;if(!t)return;const e=this.x,r=this.y,n=this.coords[2],o=this.coords[3];this.coords[2]=0,this.coords[3]=0,this.setX(0,!0),this.setY(0,!0),this.transforms.remove();const a=this.window[0]=s.innerWidth,l=this.window[1]=s.innerHeight,h=this.useWin,d=t.scrollWidth,c=t.scrollHeight,u=this.fixed,p=t.getBoundingClientRect(),[m,f,g,y]=this.containerPadding;this.dragArea[0]=h?0:p.left,this.dragArea[1]=h?0:p.top,this.scrollView[0]=h?dt(d,a,d):d,this.scrollView[1]=h?dt(c,l,c):c,this.updateScrollCoords();const{width:_,height:b,left:v,top:T,right:x,bottom:S}=t.getBoundingClientRect();this.dragArea[2]=ct(h?dt(_,a,a):_,0),this.dragArea[3]=ct(h?dt(b,l,l):b,0);const w=ts(t,"overflow"),$="visible"===w,C="hidden"===w;if(this.canScroll=!u&&this.contained&&(t===i.body&&$||!C&&!$)&&(d>this.dragArea[2]+y-f||c>this.dragArea[3]+m-g)&&(!this.containerArray||this.containerArray&&!F(this.containerArray)),this.contained){const e=this.scroll.x,s=this.scroll.y,i=this.canScroll,r=this.$target.getBoundingClientRect(),n=i?h?0:t.scrollLeft:0,o=i?h?0:t.scrollTop:0,d=i?this.scrollView[0]-n-_:0,c=i?this.scrollView[1]-o-b:0;this.targetBounds[0]=ct(r.top+s-(h?0:T),0),this.targetBounds[1]=ct(r.right+e-(h?a:x),0),this.targetBounds[2]=ct(r.bottom+s-(h?l:S),0),this.targetBounds[3]=ct(r.left+e-(h?0:v),0),this.containerArray?(this.containerBounds[0]=this.containerArray[0]+m,this.containerBounds[1]=this.containerArray[1]-f,this.containerBounds[2]=this.containerArray[2]-g,this.containerBounds[3]=this.containerArray[3]+y):(this.containerBounds[0]=-ct(r.top-(u?dt(T,0,l):T)+o-m,0),this.containerBounds[1]=-ct(r.right-(u?dt(x,0,a):x)-d+f,0),this.containerBounds[2]=-ct(r.bottom-(u?dt(S,0,l):S)-c+g,0),this.containerBounds[3]=-ct(r.left-(u?dt(v,0,a):v)+n-y,0))}this.transforms.revert(),this.coords[2]=n,this.coords[3]=o,this.setX(e,!0),this.setY(r,!0)}isOutOfBounds(t,e,s){if(!this.contained)return 0;const[i,r,n,o]=t,[a,l]=this.disabled,h=!a&&e<o||!a&&e>r,d=!l&&s<i||!l&&s>n;return h&&!d?1:!h&&d?2:h&&d?3:0}refresh(){const t=this.parameters,e=t.x,r=t.y,n=os(t.container,this),o=os(t.containerPadding,this)||0,a=F(o)?o:[o,o,o,o],l=this.x,h=this.y,d=os(t.cursor,this),c={onHover:"grab",onGrab:"grabbing"};if(d){const{onHover:t,onGrab:e}=d;t&&(c.onHover=t),e&&(c.onGrab=e)}const u=os(t.dragThreshold,this),p={mouse:3,touch:7};if(V(u))p.mouse=u,p.touch=u;else if(u){const{mouse:t,touch:e}=u;H(t)||(p.mouse=t),H(e)||(p.touch=e)}this.containerArray=F(n)?n:null,this.$container=n&&!this.containerArray?de(n)[0]:i.body,this.useWin=this.$container===i.body,this.$scrollContainer=this.useWin?s:this.$container,this.isFinePointer=matchMedia("(pointer:fine)").matches,this.containerPadding=$t(a,[0,0,0,0]),this.containerFriction=dt($t(os(t.containerFriction,this),.8),0,1),this.releaseContainerFriction=dt($t(os(t.releaseContainerFriction,this),this.containerFriction),0,1),this.snapX=os(M(e)&&!H(e.snap)?e.snap:t.snap,this),this.snapY=os(M(r)&&!H(r.snap)?r.snap:t.snap,this),this.scrollSpeed=$t(os(t.scrollSpeed,this),1.5),this.scrollThreshold=$t(os(t.scrollThreshold,this),20),this.dragSpeed=$t(os(t.dragSpeed,this),1),this.dragThreshold=this.isFinePointer?p.mouse:p.touch,this.minVelocity=$t(os(t.minVelocity,this),0),this.maxVelocity=$t(os(t.maxVelocity,this),50),this.velocityMultiplier=$t(os(t.velocityMultiplier,this),1),this.cursor=!1!==d&&c,this.updateBoundingValues();const[m,f,g,y]=this.containerBounds;this.setX(dt(l,y,f),!0),this.setY(dt(h,m,g),!0)}update(){if(this.updateScrollCoords(),this.canScroll){const[t,e,s,i]=this.containerPadding,[r,n]=this.scrollView,o=this.dragArea[2],a=this.dragArea[3],l=this.scroll.x,h=this.scroll.y,d=this.$container.scrollWidth,c=this.$container.scrollHeight,u=this.useWin?dt(d,this.window[0],d):d,p=this.useWin?dt(c,this.window[1],c):c,m=r-u,f=n-p;this.dragged&&m>0&&(this.coords[0]-=m,this.scrollView[0]=u),this.dragged&&f>0&&(this.coords[1]-=f,this.scrollView[1]=p);const g=10*this.scrollSpeed,y=this.scrollThreshold,[_,b]=this.coords,[v,T,x,S]=this.scrollBounds,w=ct(dt((b-v+t)/y,-1,0)*g,0),$=ct(dt((_-T-e)/y,0,1)*g,0),C=ct(dt((b-x-s)/y,0,1)*g,0),E=ct(dt((_-S+i)/y,-1,0)*g,0);if(w||C||E||$){const[t,e]=this.disabled;let s=l,i=h;t||(s=ct(dt(l+(E||$),0,r-o),0),this.coords[0]-=l-s),e||(i=ct(dt(h+(w||C),0,n-a),0),this.coords[1]-=h-i),this.useWin?this.$scrollContainer.scrollBy(-(l-s),-(h-i)):this.$scrollContainer.scrollTo(s,i)}}const[t,e,s,i]=this.containerBounds,[r,n,o,a,l,h]=this.pointer;this.coords[0]+=(r-l)*this.dragSpeed,this.coords[1]+=(n-h)*this.dragSpeed,this.pointer[4]=r,this.pointer[5]=n;const[d,c]=this.coords,[u,p]=this.snapped,m=(1-this.containerFriction)*this.dragSpeed;this.setX(d>e?e+(d-e)*m:d<i?i+(d-i)*m:d,!1),this.setY(c>s?s+(c-s)*m:c<t?t+(c-t)*m:c,!1),this.computeVelocity(r-l,n-h),this.angle=at(n-a,r-o);const[f,g]=this.snapped;(f!==u&&this.snapX||g!==p&&this.snapY)&&this.onSnap(this)}stop(){this.updateTicker.pause(),this.overshootTicker.pause();for(let t in this.animate.animations)this.animate.animations[t].pause();return ie([this],null,"x"),ie([this],null,"y"),ie([this],null,"progressX"),ie([this],null,"progressY"),ie([this.scroll]),ie([this.overshootCoords]),this}scrollInView(t,e=0,s=Te.inOutQuad){this.updateScrollCoords();const i=this.destX,r=this.destY,n=this.scroll,o=this.scrollBounds,a=this.canScroll;if(!this.containerArray&&this.isOutOfBounds(o,i,r)){const[l,h,d,u]=o,p=ct(dt(r-l,-c,0),0),m=ct(dt(i-h,0,c),0),f=ct(dt(r-d,0,c),0),g=ct(dt(i-u,-c,0),0);new Me(n,{x:ct(n.x+(g?g-e:m?m+e:0),0),y:ct(n.y+(p?p-e:f?f+e:0),0),duration:H(t)?350*I.timeScale:t,ease:s,onUpdate:()=>{this.canScroll=!1,this.$scrollContainer.scrollTo(n.x,n.y)}}).init().then(()=>{this.canScroll=a})}return this}handleHover(){this.isFinePointer&&this.cursor&&!this.cursorStyles&&(this.cursorStyles=es(this.$trigger,{cursor:this.cursor.onHover}))}animateInView(t,e=0,s=Te.inOutQuad){this.stop(),this.updateBoundingValues();const i=this.x,r=this.y,[n,o,a,l]=this.containerPadding,h=this.scroll.y-this.targetBounds[0]+n+e,d=this.scroll.x-this.targetBounds[1]-o-e,c=this.scroll.y-this.targetBounds[2]-a-e,u=this.scroll.x-this.targetBounds[3]+l+e,p=this.isOutOfBounds([h,d,c,u],i,r);if(p){const[e,n]=this.disabled,o=dt(ut(i,this.snapX),u,d),a=dt(ut(r,this.snapY),h,c),l=H(t)?350*I.timeScale:t;e||1!==p&&3!==p||this.animate[this.xProp](o,l,s),n||2!==p&&3!==p||this.animate[this.yProp](a,l,s)}return this}handleDown(t){const e=t.target;if(this.grabbed||"range"===e.type)return;t.stopPropagation(),this.grabbed=!0,this.released=!1,this.stop(),this.updateBoundingValues();const s=t.changedTouches,r=s?s[0].clientX:t.clientX,n=s?s[0].clientY:t.clientY,{x:o,y:a}=this.transforms.normalizePoint(r,n),[l,h,d,c]=this.containerBounds,u=(1-this.containerFriction)*this.dragSpeed,p=this.x,m=this.y;this.coords[0]=this.coords[2]=u?p>h?h+(p-h)/u:p<c?c+(p-c)/u:p:p,this.coords[1]=this.coords[3]=u?m>d?d+(m-d)/u:m<l?l+(m-l)/u:m:m,this.pointer[0]=o,this.pointer[1]=a,this.pointer[2]=o,this.pointer[3]=a,this.pointer[4]=o,this.pointer[5]=a,this.pointer[6]=o,this.pointer[7]=a,this.deltaX=0,this.deltaY=0,this.velocity=0,this.velocityStack[0]=0,this.velocityStack[1]=0,this.velocityStack[2]=0,this.velocityStackIndex=0,this.angle=0,this.targetStyles&&(this.targetStyles.revert(),this.targetStyles=null);const f=ts(this.$target,"zIndex",!1);as=(f>as?f:as)+1,this.targetStyles=es(this.$target,{zIndex:as}),this.triggerStyles&&(this.triggerStyles.revert(),this.triggerStyles=null),this.cursorStyles&&(this.cursorStyles.revert(),this.cursorStyles=null),this.isFinePointer&&this.cursor&&(this.bodyStyles=es(i.body,{cursor:this.cursor.onGrab})),this.scrollInView(100,0,Te.out(3)),this.onGrab(this),i.addEventListener("touchmove",this),i.addEventListener("touchend",this),i.addEventListener("touchcancel",this),i.addEventListener("mousemove",this),i.addEventListener("mouseup",this),i.addEventListener("selectstart",this)}handleMove(t){if(!this.grabbed)return;const e=t.changedTouches,s=e?e[0].clientX:t.clientX,i=e?e[0].clientY:t.clientY,{x:r,y:n}=this.transforms.normalizePoint(s,i),o=r-this.pointer[6],a=n-this.pointer[7];let l=t.target,h=!1,d=!1,c=!1;for(;e&&l&&l!==this.$trigger;){const t=ts(l,"overflow-y");if("hidden"!==t&&"visible"!==t){const{scrollTop:t,scrollHeight:e,clientHeight:s}=l;if(e>s){c=!0,h=t<=3,d=t>=e-s-3;break}}l=l.parentElement}c&&(!h&&!d||h&&a<0||d&&a>0)?(this.pointer[0]=r,this.pointer[1]=n,this.pointer[2]=r,this.pointer[3]=n,this.pointer[4]=r,this.pointer[5]=n,this.pointer[6]=r,this.pointer[7]=n):(is(t),this.triggerStyles||(this.triggerStyles=es(this.$trigger,{pointerEvents:"none"})),this.$trigger.addEventListener("touchstart",is,{passive:!1}),this.$trigger.addEventListener("touchmove",is,{passive:!1}),this.$trigger.addEventListener("touchend",is),(this.dragged||!this.disabled[0]&&et(o)>this.dragThreshold||!this.disabled[1]&&et(a)>this.dragThreshold)&&(this.updateTicker.resume(),this.pointer[2]=this.pointer[0],this.pointer[3]=this.pointer[1],this.pointer[0]=r,this.pointer[1]=n,this.dragged=!0,this.released=!1,this.onDrag(this)))}handleUp(){if(!this.grabbed)return;this.updateTicker.pause(),this.triggerStyles&&(this.triggerStyles.revert(),this.triggerStyles=null),this.bodyStyles&&(this.bodyStyles.revert(),this.bodyStyles=null);const[t,e]=this.disabled,[s,n,o,a,l,h]=this.pointer,[d,c,u,p]=this.containerBounds,[m,f]=this.snapped,g=this.releaseXSpring,y=this.releaseYSpring,_=this.releaseEase,b=this.hasReleaseSpring,v=this.overshootCoords,T=this.x,x=this.y,S=this.computeVelocity(s-l,n-h),w=this.angle=at(n-a,s-o),$=150*S,C=(1-this.releaseContainerFriction)*this.dragSpeed,E=T+tt(w)*$,k=x+K(w)*$,N=E>c?c+(E-c)*C:E<p?p+(E-p)*C:E,D=k>u?u+(k-u)*C:k<d?d+(k-d)*C:k,A=this.destX=dt(ct(ut(N,this.snapX),5),p,c),R=this.destY=dt(ct(ut(D,this.snapY),5),d,u),L=this.isOutOfBounds(this.containerBounds,E,k);let B=0,P=0,F=_,M=_,V=0;if(v.x=T,v.y=x,!t){const t=A===c?T>c?-1:1:T<p?-1:1,s=ct(T-A,0);g.velocity=e&&b?s?$*t/et(s):0:S;const{ease:i,settlingDuration:r,restDuration:n}=g;B=T===A?0:b?r:r-n*I.timeScale,b&&(F=i),B>V&&(V=B)}if(!e){const e=R===u?x>u?-1:1:x<d?-1:1,s=ct(x-R,0);y.velocity=t&&b?s?$*e/et(s):0:S;const{ease:i,settlingDuration:r,restDuration:n}=y;P=x===R?0:b?r:r-n*I.timeScale,b&&(M=i),P>V&&(V=P)}if(!b&&L&&C&&(B||P)){const t=r.blend;new Me(v,{x:{to:N,duration:.65*B},y:{to:D,duration:.65*P},ease:_,composition:t}).init(),new Me(v,{x:{to:A,duration:B},y:{to:R,duration:P},ease:_,composition:t}).init(),this.overshootTicker.stretch(ot(B,P)).restart()}else t||this.animate[this.xProp](A,B,F),e||this.animate[this.yProp](R,P,M);this.scrollInView(V,this.scrollThreshold,_);let O=!1;A!==m&&(this.snapped[0]=A,this.snapX&&(O=!0)),R!==f&&this.snapY&&(this.snapped[1]=R,this.snapY&&(O=!0)),O&&this.onSnap(this),this.grabbed=!1,this.dragged=!1,this.updated=!0,this.released=!0,this.onRelease(this),this.$trigger.removeEventListener("touchstart",is),this.$trigger.removeEventListener("touchmove",is),this.$trigger.removeEventListener("touchend",is),i.removeEventListener("touchmove",this),i.removeEventListener("touchend",this),i.removeEventListener("touchcancel",this),i.removeEventListener("mousemove",this),i.removeEventListener("mouseup",this),i.removeEventListener("selectstart",this)}reset(){return this.stop(),this.resizeTicker.pause(),this.grabbed=!1,this.dragged=!1,this.updated=!1,this.released=!1,this.canScroll=!1,this.setX(0,!0),this.setY(0,!0),this.coords[0]=0,this.coords[1]=0,this.pointer[0]=0,this.pointer[1]=0,this.pointer[2]=0,this.pointer[3]=0,this.pointer[4]=0,this.pointer[5]=0,this.pointer[6]=0,this.pointer[7]=0,this.velocity=0,this.velocityStack[0]=0,this.velocityStack[1]=0,this.velocityStack[2]=0,this.velocityStackIndex=0,this.angle=0,this}enable(){return this.enabled||(this.enabled=!0,this.$target.classList.remove("is-disabled"),this.touchActionStyles=es(this.$trigger,{touchAction:this.disabled[0]?"pan-x":this.disabled[1]?"pan-y":"none"}),this.$trigger.addEventListener("touchstart",this,{passive:!0}),this.$trigger.addEventListener("mousedown",this,{passive:!0}),this.$trigger.addEventListener("mouseenter",this)),this}disable(){return this.enabled=!1,this.grabbed=!1,this.dragged=!1,this.updated=!1,this.released=!1,this.canScroll=!1,this.touchActionStyles.revert(),this.cursorStyles&&(this.cursorStyles.revert(),this.cursorStyles=null),this.triggerStyles&&(this.triggerStyles.revert(),this.triggerStyles=null),this.bodyStyles&&(this.bodyStyles.revert(),this.bodyStyles=null),this.targetStyles&&(this.targetStyles.revert(),this.targetStyles=null),this.$target.classList.add("is-disabled"),this.$trigger.removeEventListener("touchstart",this),this.$trigger.removeEventListener("mousedown",this),this.$trigger.removeEventListener("mouseenter",this),i.removeEventListener("touchmove",this),i.removeEventListener("touchend",this),i.removeEventListener("touchcancel",this),i.removeEventListener("mousemove",this),i.removeEventListener("mouseup",this),i.removeEventListener("selectstart",this),this}revert(){return this.reset(),this.disable(),this.$target.classList.remove("is-disabled"),this.updateTicker.revert(),this.overshootTicker.revert(),this.resizeTicker.revert(),this.animate.revert(),this.resizeObserver.disconnect(),this}handleEvent(t){switch(t.type){case"mousedown":case"touchstart":this.handleDown(t);break;case"mousemove":case"touchmove":this.handleMove(t);break;case"mouseup":case"touchend":case"touchcancel":this.handleUp();break;case"mouseenter":this.handleHover();break;case"selectstart":is(t)}}}const hs=(t=_)=>new le({duration:1*I.timeScale,onComplete:t},null,0).resume(),ds=t=>{let e;return(...s)=>{let i,r,n,o,a;e&&(i=e.currentIteration,r=e.iterationProgress,n=e.reversed,o=e._alternate,a=e._startTime,e.revert());const l=t(...s);return l&&!z(l)&&l.revert&&(e=l),H(r)||(e.currentIteration=i,e.iterationProgress=(o&&i%2?!n:n)?1-r:r,e._startTime=a),l||_}};class cs{constructor(t={}){A.current&&A.current.register(this);const e=t.root;let r=i;e&&(r=e.current||e.nativeElement||de(e)[0]||i);const n=t.defaults,o=I.defaults,a=t.mediaQueries;if(this.defaults=n?yt(n,o):o,this.root=r,this.constructors=[],this.revertConstructors=[],this.revertibles=[],this.constructorsOnce=[],this.revertConstructorsOnce=[],this.revertiblesOnce=[],this.once=!1,this.onceIndex=0,this.methods={},this.matches={},this.mediaQueryLists={},this.data={},a)for(let t in a){const e=s.matchMedia(a[t]);this.mediaQueryLists[t]=e,e.addEventListener("change",this)}}register(t){(this.once?this.revertiblesOnce:this.revertibles).push(t)}execute(t){let e=A.current,s=A.root,i=I.defaults;A.current=this,A.root=this.root,I.defaults=this.defaults;const r=this.mediaQueryLists;for(let t in r)this.matches[t]=r[t].matches;const n=t(this);return A.current=e,A.root=s,I.defaults=i,n}refresh(){return this.onceIndex=0,this.execute(()=>{let t=this.revertibles.length,e=this.revertConstructors.length;for(;t--;)this.revertibles[t].revert();for(;e--;)this.revertConstructors[e](this);this.revertibles.length=0,this.revertConstructors.length=0,this.constructors.forEach(t=>{const e=t(this);z(e)&&this.revertConstructors.push(e)})}),this}add(t,e){if(this.once=!1,z(t)){const e=t;this.constructors.push(e),this.execute(()=>{const t=e(this);z(t)&&this.revertConstructors.push(t)})}else this.methods[t]=(...t)=>this.execute(()=>e(...t));return this}addOnce(t){if(this.once=!0,z(t)){const e=this.onceIndex++;if(this.constructorsOnce[e])return this;const s=t;this.constructorsOnce[e]=s,this.execute(()=>{const t=s(this);z(t)&&this.revertConstructorsOnce.push(t)})}return this}keepTime(t){this.once=!0;const e=this.onceIndex++,s=this.constructorsOnce[e];if(z(s))return s(this);const i=ds(t);let r;return this.constructorsOnce[e]=i,this.execute(()=>{r=i(this)}),r}handleEvent(t){"change"===t.type&&this.refresh()}revert(){const t=this.revertibles,e=this.revertConstructors,s=this.revertiblesOnce,i=this.revertConstructorsOnce,r=this.mediaQueryLists;let n=t.length,o=e.length,a=s.length,l=i.length;for(;n--;)t[n].revert();for(;o--;)e[o](this);for(;a--;)s[a].revert();for(;l--;)i[l](this);for(let t in r)r[t].removeEventListener("change",this);t.length=0,e.length=0,this.constructors.length=0,s.length=0,i.length=0,this.constructorsOnce.length=0,this.onceIndex=0,this.matches={},this.methods={},this.mediaQueryLists={},this.data={}}}const us=(t,e)=>t&&z(t)?t(e):t,ps=new Map;class ms{constructor(t){this.element=t,this.useWin=this.element===i.body,this.winWidth=0,this.winHeight=0,this.width=0,this.height=0,this.left=0,this.top=0,this.scale=1,this.zIndex=0,this.scrollX=0,this.scrollY=0,this.prevScrollX=0,this.prevScrollY=0,this.scrollWidth=0,this.scrollHeight=0,this.velocity=0,this.backwardX=!1,this.backwardY=!1,this.scrollTicker=new le({autoplay:!1,onBegin:()=>this.dataTimer.resume(),onUpdate:()=>{const t=this.backwardX||this.backwardY;_t(this,t=>t.handleScroll(),t)},onComplete:()=>this.dataTimer.pause()}).init(),this.dataTimer=new le({autoplay:!1,frameRate:30,onUpdate:t=>{const e=t.deltaTime,s=this.prevScrollX,i=this.prevScrollY,r=this.scrollX,n=this.scrollY,o=s-r,a=i-n;this.prevScrollX=r,this.prevScrollY=n,o&&(this.backwardX=s>r),a&&(this.backwardY=i>n),this.velocity=ct(e>0?Math.sqrt(o*o+a*a)/e:0,5)}}).init(),this.resizeTicker=new le({autoplay:!1,duration:250*I.timeScale,onComplete:()=>{this.updateWindowBounds(),this.refreshScrollObservers(),this.handleScroll()}}).init(),this.wakeTicker=new le({autoplay:!1,duration:500*I.timeScale,onBegin:()=>{this.scrollTicker.resume()},onComplete:()=>{this.scrollTicker.pause()}}).init(),this._head=null,this._tail=null,this.updateScrollCoords(),this.updateWindowBounds(),this.updateBounds(),this.refreshScrollObservers(),this.handleScroll(),this.resizeObserver=new ResizeObserver(()=>this.resizeTicker.restart()),this.resizeObserver.observe(this.element),(this.useWin?s:this.element).addEventListener("scroll",this,!1)}updateScrollCoords(){const t=this.useWin,e=this.element;this.scrollX=ct(t?s.scrollX:e.scrollLeft,0),this.scrollY=ct(t?s.scrollY:e.scrollTop,0)}updateWindowBounds(){this.winWidth=s.innerWidth,this.winHeight=(()=>{const t=i.createElement("div");i.body.appendChild(t),t.style.height="100lvh";const e=t.offsetHeight;return i.body.removeChild(t),e})()}updateBounds(){const t=getComputedStyle(this.element),e=this.element;let s,i;if(this.scrollWidth=e.scrollWidth+parseFloat(t.marginLeft)+parseFloat(t.marginRight),this.scrollHeight=e.scrollHeight+parseFloat(t.marginTop)+parseFloat(t.marginBottom),this.updateWindowBounds(),this.useWin)s=this.winWidth,i=this.winHeight;else{const t=e.getBoundingClientRect();s=e.clientWidth,i=e.clientHeight,this.top=t.top,this.left=t.left,this.scale=t.width?s/t.width:t.height?i/t.height:1}this.width=s,this.height=i}refreshScrollObservers(){_t(this,t=>{t.ready&&t._debug&&t.removeDebug()}),this.updateBounds(),_t(this,t=>{t.ready&&(t.refresh(),t.onResize(t),t._debug&&t.debug())})}refresh(){this.updateWindowBounds(),this.updateBounds(),this.refreshScrollObservers(),this.handleScroll()}handleScroll(){this.updateScrollCoords(),this.wakeTicker.restart()}handleEvent(t){"scroll"===t.type&&this.handleScroll()}revert(){this.scrollTicker.cancel(),this.dataTimer.cancel(),this.resizeTicker.cancel(),this.wakeTicker.cancel(),this.resizeObserver.disconnect(),(this.useWin?s:this.element).removeEventListener("scroll",this),ps.delete(this.element)}}const fs=(t,e,s,i,r)=>{const n="min"===e,o="max"===e,a="top"===e||"left"===e||"start"===e||n?0:"bottom"===e||"right"===e||"end"===e||o?"100%":"center"===e?"50%":e,{n:l,u:h}=It(a,Lt);let d=l;return"%"===h?d=l/100*s:h&&(d=me(t,Lt,"px",!0).n),o&&i<0&&(d+=i),n&&r>0&&(d+=r),d},gs=(t,e,s,i,r)=>{let n;if(O(e)){const o=k.exec(e);if(o){const a=o[0],l=a[0],h=e.split(a),d="min"===h[0],c="max"===h[0],u=fs(t,h[0],s,i,r),p=fs(t,h[1],s,i,r);if(d){const e=At(fs(t,"min",s),p,l);n=e<u?u:e}else if(c){const e=At(fs(t,"max",s),p,l);n=e>u?u:e}else n=At(u,p,l)}else n=fs(t,e,s,i,r)}else n=e;return ct(n,0)},ys=t=>{let e;const s=t.targets;for(let t=0,i=s.length;t<i;t++){const i=s[t];if(i[o]){e=i;break}}return e};let _s=0;const bs=["#FF4B4B","#FF971B","#FFC730","#F9F640","#7AFF5A","#18FF74","#17E09B","#3CFFEC","#05DBE9","#33B3F1","#638CF9","#C563FE","#FF4FCF","#F93F8A"];class vs{constructor(t={}){A.current&&A.current.register(this);const e=$t(t.sync,"play pause"),s=e?$e(e):null,r=e&&("linear"===e||e===fe),n=e&&!(s===fe&&!r),o=e&&(V(e)||!0===e||r),a=e&&O(e)&&!n&&!o,l=a?e.split(" ").map(t=>()=>{const e=this.linked;return e&&e[t]?e[t]():null}):null,h=a&&l.length>2;this.index=_s++,this.id=H(t.id)?this.index:t.id,this.container=(t=>{const e=t&&de(t)[0]||i.body;let s=ps.get(e);return s||(s=new ms(e),ps.set(e,s)),s})(t.container),this.target=null,this.linked=null,this.repeat=null,this.horizontal=null,this.enter=null,this.leave=null,this.sync=n||o||!!l,this.syncEase=n?s:null,this.syncSmooth=o?!0===e||r?1:e:null,this.onSyncEnter=l&&!h&&l[0]?l[0]:_,this.onSyncLeave=l&&!h&&l[1]?l[1]:_,this.onSyncEnterForward=l&&h&&l[0]?l[0]:_,this.onSyncLeaveForward=l&&h&&l[1]?l[1]:_,this.onSyncEnterBackward=l&&h&&l[2]?l[2]:_,this.onSyncLeaveBackward=l&&h&&l[3]?l[3]:_,this.onEnter=t.onEnter||_,this.onLeave=t.onLeave||_,this.onEnterForward=t.onEnterForward||_,this.onLeaveForward=t.onLeaveForward||_,this.onEnterBackward=t.onEnterBackward||_,this.onLeaveBackward=t.onLeaveBackward||_,this.onUpdate=t.onUpdate||_,this.onResize=t.onResize||_,this.onSyncComplete=t.onSyncComplete||_,this.reverted=!1,this.ready=!1,this.completed=!1,this.began=!1,this.isInView=!1,this.forceEnter=!1,this.hasEntered=!1,this.offset=0,this.offsetStart=0,this.offsetEnd=0,this.distance=0,this.prevProgress=0,this.thresholds=["start","end","end","start"],this.coords=[0,0,0,0],this.debugStyles=null,this.$debug=null,this._params=t,this._debug=$t(t.debug,!1),this._next=null,this._prev=null,vt(this.container,this),hs(()=>{if(!this.reverted){if(!this.target){const e=de(t.target)[0];this.target=e||i.body,this.refresh()}this._debug&&this.debug()}})}link(t){if(t&&(t.pause(),this.linked=t,H(t)||H(t.persist)||(t.persist=!0),!this._params.target)){let e;H(t.targets)?_t(t,t=>{t.targets&&!e&&(e=ys(t))}):e=ys(t),this.target=e||i.body,this.refresh()}return this}get velocity(){return this.container.velocity}get backward(){return this.horizontal?this.container.backwardX:this.container.backwardY}get scroll(){return this.horizontal?this.container.scrollX:this.container.scrollY}get progress(){const t=(this.scroll-this.offsetStart)/this.distance;return t===1/0||isNaN(t)?0:ct(dt(t,0,1),6)}refresh(){this.ready=!0,this.reverted=!1;const t=this._params;return this.repeat=$t(us(t.repeat,this),!0),this.horizontal="x"===$t(us(t.axis,this),"y"),this.enter=$t(us(t.enter,this),"end start"),this.leave=$t(us(t.leave,this),"start end"),this.updateBounds(),this.handleScroll(),this}removeDebug(){return this.$debug&&(this.$debug.parentNode.removeChild(this.$debug),this.$debug=null),this.debugStyles&&(this.debugStyles.revert(),this.$debug=null),this}debug(){this.removeDebug();const t=this.container,e=this.horizontal,s=t.element.querySelector(":scope > .animejs-onscroll-debug"),r=i.createElement("div"),n=i.createElement("div"),o=i.createElement("div"),a=bs[this.index%bs.length],l=t.useWin,h=l?t.winWidth:t.width,d=l?t.winHeight:t.height,c=t.scrollWidth,u=t.scrollHeight,p=this.container.width>360?320:260,m=e?0:10,f=e?10:0,g=e?24:p/2,y=e?g:15,_=e?60:g,b=e?_:y,v=e?"repeat-x":"repeat-y",T=t=>e?"0px "+t+"px":t+"px 2px",x=t=>`linear-gradient(${e?90:0}deg, ${t} 2px, transparent 1px)`,S=(t,e,s,i,r)=>`position:${t};left:${e}px;top:${s}px;width:${i}px;height:${r}px;`;r.style.cssText=`${S("absolute",m,f,e?c:p,e?p:u)}\n      pointer-events: none;\n      z-index: ${this.container.zIndex++};\n      display: flex;\n      flex-direction: ${e?"column":"row"};\n      filter: drop-shadow(0px 1px 0px rgba(0,0,0,.75));\n    `,n.style.cssText=`${S("sticky",0,0,e?h:g,e?g:d)}`,s||(n.style.cssText+=`background:\n        ${x("#FFFF")}${T(g-10)} / 100px 100px ${v},\n        ${x("#FFF8")}${T(g-10)} / 10px 10px ${v};\n      `),o.style.cssText=`${S("relative",0,0,e?c:g,e?g:u)}`,s||(o.style.cssText+=`background:\n        ${x("#FFFF")}${T(0)} / ${e?"100px 10px":"10px 100px"} ${v},\n        ${x("#FFF8")}${T(0)} / ${e?"10px 0px":"0px 10px"} ${v};\n      `);const w=[" enter: "," leave: "];this.coords.forEach((t,s)=>{const r=s>1,l=(r?0:this.offset)+t,m=s%2,f=l<b,g=l>(r?e?h:d:e?c:u)-b,v=(r?m&&!f:!m&&!f)||g,T=i.createElement("div"),x=i.createElement("div"),$=e?v?"right":"left":v?"bottom":"top",C=v?(e?_:y)+(r?e?-1:g?0:-2:e?-1:-2):e?1:0;x.innerHTML=`${this.id}${w[m]}${this.thresholds[s]}`,T.style.cssText=`${S("absolute",0,0,_,y)}\n        display: flex;\n        flex-direction: ${e?"column":"row"};\n        justify-content: flex-${r?"start":"end"};\n        align-items: flex-${v?"end":"start"};\n        border-${$}: 2px solid ${a};\n      `,x.style.cssText=`\n        overflow: hidden;\n        max-width: ${p/2-10}px;\n        height: ${y};\n        margin-${e?v?"right":"left":v?"bottom":"top"}: -2px;\n        padding: 1px;\n        font-family: ui-monospace, monospace;\n        font-size: 10px;\n        letter-spacing: -.025em;\n        line-height: 9px;\n        font-weight: 600;\n        text-align: ${e&&v||!e&&!r?"right":"left"};\n        white-space: pre;\n        text-overflow: ellipsis;\n        color: ${m?a:"rgba(0,0,0,.75)"};\n        background-color: ${m?"rgba(0,0,0,.65)":a};\n        border: 2px solid ${m?a:"transparent"};\n        border-${e?v?"top-left":"top-right":v?"top-left":"bottom-left"}-radius: 5px;\n        border-${e?v?"bottom-left":"bottom-right":v?"top-right":"bottom-right"}-radius: 5px;\n      `,T.appendChild(x);let E=l-C+(e?1:0);T.style[e?"left":"top"]=`${E}px`,(r?n:o).appendChild(T)}),r.appendChild(n),r.appendChild(o),t.element.appendChild(r),s||r.classList.add("animejs-onscroll-debug"),this.$debug=r,"static"===ts(t.element,"position")&&(this.debugStyles=es(t.element,{position:"relative "}))}updateBounds(){let t;this._debug&&this.removeDebug();const e=this.target,s=this.container,r=this.horizontal,n=this.linked;let o,a=e;for(n&&(o=n.currentTime,n.seek(0,!0));a&&a!==s.element&&a!==i.body;){const e="sticky"===ts(a,"position")&&es(a,{position:"static"});a=a.parentElement,e&&(t||(t=[]),t.push(e))}const l=e.getBoundingClientRect(),h=s.scale,d=(r?l.left+s.scrollX-s.left:l.top+s.scrollY-s.top)*h,c=(r?l.width:l.height)*h,u=r?s.width:s.height,p=(r?s.scrollWidth:s.scrollHeight)-u,m=this.enter,f=this.leave;let g="start",y="end",_="end",b="start";if(O(m)){const t=m.split(" ");_=t[0],g=t.length>1?t[1]:g}else if(M(m)){const t=m;H(t.container)||(_=t.container),H(t.target)||(g=t.target)}else V(m)&&(_=m);if(O(f)){const t=f.split(" ");b=t[0],y=t.length>1?t[1]:y}else if(M(f)){const t=f;H(t.container)||(b=t.container),H(t.target)||(y=t.target)}else V(f)&&(b=f);const v=gs(e,g,c),T=gs(e,y,c),x=v+d-u,S=T+d-p,w=gs(e,_,u,x,S),$=gs(e,b,u,x,S),C=v+d-w,E=T+d-$,k=E-C;this.offset=d,this.offsetStart=C,this.offsetEnd=E,this.distance=k<=0?0:k,this.thresholds=[g,y,_,b],this.coords=[v,T,w,$],t&&t.forEach(t=>t.revert()),n&&n.seek(o,!0),this._debug&&this.debug()}handleScroll(){if(!this.ready)return;const t=this.linked,e=this.sync,s=this.syncEase,i=this.syncSmooth,r=t&&(s||i),n=this.horizontal,o=this.container,a=this.scroll,l=a<=this.offsetStart,h=a>=this.offsetEnd,d=!l&&!h,c=a===this.offsetStart||a===this.offsetEnd,u=!this.hasEntered&&c,p=this._debug&&this.$debug;let m=!1,f=!1,g=this.progress;if(l&&this.began&&(this.began=!1),g>0&&!this.began&&(this.began=!0),r){const e=t.progress;if(i&&V(i)){if(i<1){const t=1e-4,s=e<g&&1===g?t:e>g&&!g?-t:0;g=ct(pt(e,g,pt(.01,.2,i))+s,6)}}else s&&(g=s(g));m=g!==this.prevProgress,f=1===e,m&&!f&&i&&e&&o.wakeTicker.restart()}if(p){const t=n?o.scrollY:o.scrollX;p.style[n?"top":"left"]=t+10+"px"}(d&&!this.isInView||u&&!this.forceEnter&&!this.hasEntered)&&(d&&(this.isInView=!0),this.forceEnter&&this.hasEntered?d&&(this.forceEnter=!1):(p&&d&&(p.style.zIndex=""+this.container.zIndex++),this.onSyncEnter(this),this.onEnter(this),this.backward?(this.onSyncEnterBackward(this),this.onEnterBackward(this)):(this.onSyncEnterForward(this),this.onEnterForward(this)),this.hasEntered=!0,u&&(this.forceEnter=!0))),(d||!d&&this.isInView)&&(m=!0),m&&(r&&t.seek(t.duration*g),this.onUpdate(this)),!d&&this.isInView&&(this.isInView=!1,this.onSyncLeave(this),this.onLeave(this),this.backward?(this.onSyncLeaveBackward(this),this.onLeaveBackward(this)):(this.onSyncLeaveForward(this),this.onLeaveForward(this)),e&&!i&&(f=!0)),g>=1&&this.began&&!this.completed&&(e&&f||!e)&&(e&&this.onSyncComplete(this),this.completed=!0,(!this.repeat&&!t||!this.repeat&&t&&t.completed)&&this.revert()),g<1&&this.completed&&(this.completed=!1),this.prevProgress=g}revert(){if(this.reverted)return;const t=this.container;return bt(t,this),t._head||t.revert(),this._debug&&this.removeDebug(),this.reverted=!0,this.ready=!1,this}}const Ts=(t,e,s)=>(((1-3*s+3*e)*t+(3*s-6*e))*t+3*e)*t,xs=(t=.5,e=0,s=.5,i=1)=>t===e&&s===i?fe:r=>0===r||1===r?r:Ts(((t,e,s)=>{let i,r,n=0,o=1,a=0;do{r=n+(o-n)/2,i=Ts(r,e,s)-t,i>0?o=r:n=r}while(et(i)>1e-7&&++a<100);return r})(r,t,s),e,i),Ss=(t=10,e)=>{const s=e?it:rt;return e=>s(dt(e,0,1)*t)*(1/t)},ws=(...t)=>{const e=t.length;if(!e)return fe;const s=e-1,i=t[0],r=t[s],n=[0],o=[Z(i)];for(let e=1;e<s;e++){const i=t[e],r=O(i)?i.trim().split(" "):[i],a=r[0],l=r[1];n.push(H(l)?e/s:Z(l)/100),o.push(Z(a))}return o.push(Z(r)),n.push(1),function(t){for(let e=1,s=n.length;e<s;e++){const s=n[e];if(t<=s){const i=n[e-1],r=o[e-1];return r+(o[e]-r)*(t-i)/(s-i)}}return o[o.length-1]}},$s=(t=10,e=1)=>{const s=[0],i=t-1;for(let t=1;t<i;t++){const r=s[t-1],n=t/i,o=n*(1-e)+(n+((t+1)/i-n)*Math.random())*e;s.push(dt(o,r,1))}return s.push(1),ws(...s)};var Cs=Object.freeze({__proto__:null,Spring:je,createSpring:Ze,cubicBezier:xs,eases:Te,irregular:$s,linear:ws,spring:Ge,steps:Ss});const Es=(t,e=100)=>{const s=[];for(let i=0;i<=e;i++)s.push(ct(t(i/e),4));return`linear(${s.join(", ")})`},ks={},Ns=t=>{let e=ks[t];if(e)return e;if(e="linear",O(t)){if(B(t,"linear")||B(t,"cubic-")||B(t,"steps")||B(t,"ease"))e=t;else if(B(t,"cubicB"))e=L(t);else{const s=Se(t);z(s)&&(e=s===fe?"linear":Es(s))}ks[t]=e}else if(z(t)){const s=Es(t);s&&(e=s)}else t.ease&&(e=Es(t.ease));return e},Ds=["x","y","z"],As=["perspective","width","height","margin","padding","top","right","bottom","left","borderWidth","fontSize","borderRadius",...Ds],Is=(()=>[...Ds,...g.filter(t=>["X","Y","Z"].some(e=>t.endsWith(e)))])();let Rs=null;const Ls=(t,e,s,i,r)=>{let n=O(e)?e:Et(e,s,i,r,null,null);return V(n)?As.includes(t)||B(t,"translate")?`${n}px`:B(t,"rotate")||B(t,"skew")?`${n}deg`:`${n}`:n},Bs=(t,e,s,i,r,n)=>{let o="0";const a=H(i)?getComputedStyle(t)[e]:Ls(e,i,t,r,n);return o=H(s)?F(i)?i.map(s=>Ls(e,s,t,r,n)):a:[Ls(e,s,t,r,n),a],o};class Ps{constructor(t,s){A.current&&A.current.register(this),X(Rs)&&(!e||!H(CSS)&&Object.hasOwnProperty.call(CSS,"registerProperty")?(g.forEach(t=>{const e=B(t,"skew"),s=B(t,"scale"),i=B(t,"rotate"),r=B(t,"translate"),n=i||e,o=n?"<angle>":s?"<number>":r?"<length-percentage>":"*";try{CSS.registerProperty({name:"--"+t,syntax:o,inherits:!1,initialValue:r?"0px":n?"0deg":s?"1":"0"})}catch{}}),Rs=!0):Rs=!1);const i=ce(t);i.length||console.warn("No target found. Make sure the element you're trying to animate is accessible before creating your animation.");const r=$t(s.autoplay,I.defaults.autoplay),n=!(!r||!r.link)&&r,o=s.alternate&&!0===s.alternate,a=s.reversed&&!0===s.reversed,h=$t(s.loop,I.defaults.loop),d=!0===h||h===1/0?1/0:V(h)?h+1:1,c=o?a?"alternate-reverse":"alternate":a?"reverse":"normal",m=1===I.timeScale?1:u;this.targets=i,this.animations=[],this.controlAnimation=null,this.onComplete=s.onComplete||I.defaults.onComplete,this.duration=0,this.muteCallbacks=!1,this.completed=!1,this.paused=!r||!1!==n,this.reversed=a,this.persist=$t(s.persist,I.defaults.persist),this.autoplay=r,this._speed=$t(s.playbackRate,I.defaults.playbackRate),this._resolve=_,this._completed=0,this._inlineStyles=[],i.forEach((t,e)=>{const r=t[l],n=Is.some(t=>s.hasOwnProperty(t)),o=t.style,a=this._inlineStyles[e]={},h=$t(s.ease,I.defaults.ease),u=Et(h,t,e,i,null,null),_=z(u)||O(u)?u:h,b=h.ease&&h,v=Ns(_),T=(b?b.settlingDuration:Et($t(s.duration,I.defaults.duration),t,e,i,null,null))*m,x=Et($t(s.delay,I.defaults.delay),t,e,i,null,null)*m,S=$t(s.composition,"replace");for(let l in s){if(!j(l))continue;const h={},u={iterations:d,direction:c,fill:"both",easing:v,duration:T,delay:x,composite:S},p=s[l],y=!!n&&(g.includes(l)?l:f.get(l)),_=y?"transform":l;let b;if(a[_]||(a[_]=o[_]),M(p)){const s=p,n=$t(s.ease,v),a=n.ease&&n,d=s.to,c=s.from;if(u.duration=(a?a.settlingDuration:Et($t(s.duration,T),t,e,i,null,null))*m,u.delay=Et($t(s.delay,x),t,e,i,null,null)*m,u.composite=$t(s.composition,S),u.easing=Ns(n),b=Bs(t,l,c,d,e,i),y?(h[`--${y}`]=b,r[y]=b):h[l]=Bs(t,l,c,d,e,i),Ke(this,t,l,h,u),!H(c))if(y){const t=`--${y}`;o.setProperty(t,h[t][0])}else o[l]=h[l][0]}else b=F(p)?p.map(s=>Ls(l,s,t,e,i)):Ls(l,p,t,e,i),y?(h[`--${y}`]=b,r[y]=b):h[l]=b,Ke(this,t,l,h,u)}if(n){let t=p;for(let e in r)t+=`${y[e]}var(--${e})) `;o.transform=t}}),n&&this.autoplay.link(this)}forEach(t){try{const e=O(t)?e=>e[t]():t;this.animations.forEach(e)}catch{}return this}get speed(){return this._speed}set speed(t){this._speed=+t,this.forEach(e=>e.playbackRate=t)}get currentTime(){const t=this.controlAnimation,e=I.timeScale;return this.completed?this.duration:t?+t.currentTime*(1===e?1:e):0}set currentTime(t){const e=t*(1===I.timeScale?1:u);this.forEach(t=>{!this.persist&&e>=this.duration&&t.play(),t.currentTime=e})}get progress(){return this.currentTime/this.duration}set progress(t){this.forEach(e=>e.currentTime=t*this.duration||0)}resume(){return this.paused?(this.paused=!1,this.forEach("play")):this}pause(){return this.paused?this:(this.paused=!0,this.forEach("pause"))}alternate(){return this.reversed=!this.reversed,this.forEach("reverse"),this.paused&&this.forEach("pause"),this}play(){return this.reversed&&this.alternate(),this.resume()}reverse(){return this.reversed||this.alternate(),this.resume()}seek(t,e=!1){return e&&(this.muteCallbacks=!0),t<this.duration&&(this.completed=!1),this.currentTime=t,this.muteCallbacks=!1,this.paused&&this.pause(),this}restart(){return this.completed=!1,this.seek(0,!0).resume()}commitStyles(){return this.forEach("commitStyles")}complete(){return this.seek(this.duration)}cancel(){return this.muteCallbacks=!0,this.commitStyles().forEach("cancel"),this.animations.length=0,requestAnimationFrame(()=>{this.targets.forEach(t=>{"none"===t.style.transform&&t.style.removeProperty("transform")})}),this}revert(){return this.cancel().targets.forEach((t,e)=>{const s=t.style,i=this._inlineStyles[e];for(let e in i){const r=i[e];H(r)||r===p?s.removeProperty(L(e)):t.style[e]=r}t.getAttribute("style")===p&&t.removeAttribute("style")}),this}then(t=_){const e=this.then,s=()=>{this.then=null,t(this),this.then=e,this._resolve=_};return new Promise(t=>(this._resolve=()=>t(s()),this.completed&&this._resolve(),this))}}const Fs={animate:(t,e)=>new Ps(t,e),convertEase:Es};let Ms=0,Vs=0;const Os=(t,e)=>!(!t||!e)&&(t===e||t.contains(e)),zs=t=>{if(!t)return null;const e=t.style,s=e.transition||"";return e.setProperty("transition","none","important"),s},Hs=(t,e)=>{if(!t)return;const s=t.style;e?s.transition=e:s.removeProperty("transition")},Xs=t=>{const e=t.layout.transitionMuteStore,s=t.$el,i=t.$measure;s&&!e.has(s)&&e.set(s,zs(s)),i&&!e.has(i)&&e.set(i,zs(i))},Ys=t=>{t.forEach((t,e)=>Hs(e,t)),t.clear()},Ws={display:"none",visibility:"hidden",opacity:"0",transform:"none",position:"static"},Us=t=>{if(!t)return;const e=t.parentNode;e&&(e._head===t&&(e._head=t._next),e._tail===t&&(e._tail=t._prev),t._prev&&(t._prev._next=t._next),t._next&&(t._next._prev=t._prev),t._prev=null,t._next=null,t.parentNode=null)},qs=(t,e,s,i)=>{let r=t.dataset.layoutId;r||(r=t.dataset.layoutId="node-"+Vs++);const n=i||{};return n.$el=t,n.$measure=t,n.id=r,n.index=0,n.targets=null,n.delay=0,n.duration=0,n.ease=null,n.state=s,n.layout=s.layout,n.parentNode=e||null,n.isTarget=!1,n.isEntering=!1,n.isLeaving=!1,n.isInlined=!1,n.hasTransform=!1,n.inlineStyles=[],n.inlineTransforms=null,n.inlineTransition=null,n.branchAdded=!1,n.branchRemoved=!1,n.branchNotRendered=!1,n.sizeChanged=!1,n.hasVisibilitySwap=!1,n.hasDisplayNone=!1,n.hasVisibilityHidden=!1,n.measuredInlineTransform=null,n.measuredInlineTransition=null,n.measuredDisplay=null,n.measuredVisibility=null,n.measuredPosition=null,n.measuredHasDisplayNone=!1,n.measuredHasVisibilityHidden=!1,n.measuredIsVisible=!1,n.measuredIsRemoved=!1,n.measuredIsInsideRoot=!1,n.properties={transform:"none",x:0,y:0,left:0,top:0,clientLeft:0,clientTop:0,width:0,height:0},n.layout.properties.forEach(t=>n.properties[t]=0),n._head=null,n._tail=null,n._prev=null,n._next=null,n},js=(t,e,s,i)=>{const r=t.$el,n=t.layout.root,o=n===r,a=t.properties,l=t.state.rootNode,h=t.parentNode,d=s.transform,c=r.style.transform,u=!!h&&h.measuredIsRemoved,p=s.position;o&&(t.layout.absoluteCoords="fixed"===p||"absolute"===p),t.$measure=e,t.inlineTransforms=c,t.hasTransform=d&&"none"!==d,t.measuredIsInsideRoot=Os(n,e),t.measuredInlineTransform=null,t.measuredDisplay=s.display,t.measuredVisibility=s.visibility,t.measuredPosition=p,t.measuredHasDisplayNone="none"===s.display,t.measuredHasVisibilityHidden="hidden"===s.visibility,t.measuredIsVisible=!(t.measuredHasDisplayNone||t.measuredHasVisibilityHidden),t.measuredIsRemoved=t.measuredHasDisplayNone||t.measuredHasVisibilityHidden||u;let m=!1,f=r.previousSibling;for(;f&&(f.nodeType===Node.COMMENT_NODE||f.nodeType===Node.TEXT_NODE&&!f.textContent.trim());)f=f.previousSibling;if(f&&f.nodeType===Node.TEXT_NODE)m=!0;else{for(f=r.nextSibling;f&&(f.nodeType===Node.COMMENT_NODE||f.nodeType===Node.TEXT_NODE&&!f.textContent.trim());)f=f.nextSibling;m=null!==f&&f.nodeType===Node.TEXT_NODE}if(t.isInlined=m,t.hasTransform&&!i){const s=t.layout.transitionMuteStore;s.get(r)||(t.inlineTransition=zs(r)),e===r?r.style.transform="none":(s.get(e)||(t.measuredInlineTransition=zs(e)),t.measuredInlineTransform=e.style.transform,e.style.transform="none")}let g,y,_=0,b=0,v=0,T=0;if(!i){const t=e.getBoundingClientRect();_=t.left,b=t.top,v=t.width,T=t.height}for(let t in a){const e="transform"===t?d:s[t]||s.getPropertyValue&&s.getPropertyValue(t);H(e)||(a[t]=e)}if(a.left=_,a.top=b,a.clientLeft=i?0:e.clientLeft,a.clientTop=i?0:e.clientTop,o)t.layout.absoluteCoords?(g=_,y=b):(g=0,y=0);else{const e=h||l,s=e.properties.left,i=e.properties.top,r=e.properties.clientLeft,n=e.properties.clientTop;if(t.layout.absoluteCoords)g=_-s-r,y=b-i-n;else if(e===l){const t=l.properties.left,e=l.properties.top;g=_-t-l.properties.clientLeft,y=b-e-l.properties.clientTop}else g=_-s-r,y=b-i-n}return a.x=g,a.y=y,a.width=v,a.height=T,t},Gs=(t,e)=>{if(e)for(let s in e)t.properties[s]=e[s]},Zs=(t,e)=>{const s=Et(e.ease,t.$el,t.index,t.targets,null,null),i=z(s)?s:e.ease,r=!H(i)&&!H(i.ease);t.ease=r?i.ease:i,t.duration=r?i.settlingDuration:Et(e.duration,t.$el,t.index,t.targets,null,null),t.delay=Et(e.delay,t.$el,t.index,t.targets,null,null)},Qs=t=>{const e=t.$el.style,s=t.inlineStyles;s.length=0,t.layout.recordedProperties.forEach(t=>{s.push(t,e[t]||"")})},Js=t=>{const e=t.$el.style,s=t.inlineStyles;for(let t=0,i=s.length;t<i;t+=2){const i=s[t],r=s[t+1];r&&""!==r?e[i]=r:(e[i]="",e.removeProperty(i))}},Ks=t=>{const e=t.inlineTransforms,s=t.$el.style;!t.hasTransform||!e||t.hasTransform&&"none"===s.transform||e&&"none"===e?s.removeProperty("transform"):e&&(s.transform=e);const i=t.$measure;if(t.hasTransform&&i!==t.$el){const e=i.style,s=t.measuredInlineTransform;s&&""!==s?e.transform=s:e.removeProperty("transform")}t.measuredInlineTransform=null,null!==t.inlineTransition&&(Hs(t.$el,t.inlineTransition),t.inlineTransition=null),i!==t.$el&&null!==t.measuredInlineTransition&&(Hs(i,t.measuredInlineTransition),t.measuredInlineTransition=null)},ti=t=>{(t.measuredIsRemoved||t.hasVisibilitySwap)&&(t.$el.style.removeProperty("display"),t.$el.style.removeProperty("visibility"),t.hasVisibilitySwap&&(t.$measure.style.removeProperty("display"),t.$measure.style.removeProperty("visibility"))),t.layout.pendingRemoval.delete(t.$el)},ei=(t,e,s)=>(e.properties={...t.properties},e.state=s,e.isTarget=t.isTarget,e.hasTransform=t.hasTransform,e.inlineTransforms=t.inlineTransforms,e.measuredIsVisible=t.measuredIsVisible,e.measuredDisplay=t.measuredDisplay,e.measuredIsRemoved=t.measuredIsRemoved,e.measuredHasDisplayNone=t.measuredHasDisplayNone,e.measuredHasVisibilityHidden=t.measuredHasVisibilityHidden,e.hasDisplayNone=t.hasDisplayNone,e.isInlined=t.isInlined,e.hasVisibilityHidden=t.hasVisibilityHidden,e);class si{constructor(t){this.layout=t,this.rootNode=null,this.rootNodes=new Set,this.nodes=new Map,this.scrollX=0,this.scrollY=0}revert(){return this.forEachNode(t=>{this.layout.pendingRemoval.delete(t.$el),t.$el.removeAttribute("data-layout-id"),t.$measure.removeAttribute("data-layout-id")}),this.rootNode=null,this.rootNodes.clear(),this.nodes.clear(),this}getNode(t){if(t&&t.dataset)return this.nodes.get(t.dataset.layoutId)}getComputedValue(t,e){const s=this.getNode(t);if(s)return s.properties[e]}forEach(t,e){let s=t,i=0;for(;s;)if(e(s,i++),s._head)s=s._head;else if(s._next)s=s._next;else{for(;s&&!s._next;)s=s.parentNode;s&&(s=s._next)}}forEachRootNode(t){this.forEach(this.rootNode,t)}forEachNode(t){for(const e of this.rootNodes)this.forEach(e,t)}registerElement(t,e){if(!t||1!==t.nodeType)return null;this.layout.transitionMuteStore.has(t)||this.layout.transitionMuteStore.set(t,zs(t));const s=[t,e],i=this.layout.root;let r=null;for(;s.length;){const t=s.pop(),e=s.pop();if(!e||1!==e.nodeType||Y(e))continue;const n=!!t&&t.measuredIsRemoved,o=n?Ws:getComputedStyle(e),a=!!n||"none"===o.display,l=!!n||"hidden"===o.visibility,h=!a&&!l,d=e.dataset.layoutId,c=Os(i,e);let u=d?this.nodes.get(d):null;if(u&&u.$el!==e){const a=Os(i,u.$el),l=u.measuredIsVisible;if(a||!c&&(c||l||!h)){if(a&&!l&&h){js(u,e,o,n);let t=e.lastElementChild;for(;t;)s.push(t,u),t=t.previousElementSibling;r||(r=u);continue}{let i=e.lastElementChild;for(;i;)s.push(i,t),i=i.previousElementSibling;r||(r=u);continue}}Us(u),u=qs(e,t,this,u)}else u=qs(e,t,this,u);u.branchAdded=!1,u.branchRemoved=!1,u.branchNotRendered=!1,u.isTarget=!1,u.sizeChanged=!1,u.hasVisibilityHidden=l,u.hasDisplayNone=a,u.hasVisibilitySwap=l&&!u.measuredHasVisibilityHidden||a&&!u.measuredHasDisplayNone,this.nodes.set(u.id,u),u.parentNode=t||null,u._prev=null,u._next=null,t?(this.rootNodes.delete(u),t._head?(t._tail._next=u,u._prev=t._tail,t._tail=u):(t._head=u,t._tail=u)):this.rootNodes.add(u),js(u,u.$el,o,n);let p=e.lastElementChild;for(;p;)s.push(p,u),p=p.previousElementSibling;r||(r=u)}return r}ensureDetachedNode(t,e){if(!t||t===this.layout.root)return null;const s=t.dataset.layoutId,i=s?this.nodes.get(s):null;if(i&&i.$el===t)return i;let r=null,n=t.parentElement;for(;n&&n!==this.layout.root;){if(e.has(n)){r=this.ensureDetachedNode(n,e);break}n=n.parentElement}return this.registerElement(t,r)}record(){const t=this.layout,e=t.children,s=t.root,i=F(e)?e:[e],r=[],n="*"===e?s:A.root,o=[];let a=s.parentElement;for(;a&&1===a.nodeType;){const t=getComputedStyle(a);if(t.transform&&"none"!==t.transform){const t=a.style.transform||"",e=zs(a);o.push(a,t,e),a.style.transform="none"}a=a.parentElement}for(let t=0,e=i.length;t<e;t++){const e=i[t];r[t]=O(e)?n.querySelectorAll(e):e}const l=ce(r);this.nodes.clear(),this.rootNodes.clear();const h=this.registerElement(s,null);h.isTarget=!0,this.rootNode=h;const d=new Set;let c=0;const u=[];this.nodes.forEach(t=>{u.push(t.$el)}),this.nodes.forEach((t,e)=>{t.index=c++,t.targets=u,t&&t.measuredIsInsideRoot&&d.add(e)});const p=new Set,m=[];for(let t=0,e=l.length;t<e;t++){const e=l[t];if(e&&1===e.nodeType&&e!==s){if(!Os(s,e)){const t=e.dataset.layoutId;if(!t||!d.has(t))continue}p.has(e)||(p.add(e),m.push(e))}}for(let t=0,e=m.length;t<e;t++)this.ensureDetachedNode(m[t],p);for(let t=0,e=l.length;t<e;t++){const e=l[t],s=this.getNode(e);if(s){let t=s;for(;t&&!t.isTarget;)t.isTarget=!0,t=t.parentNode}}this.scrollX=window.scrollX,this.scrollY=window.scrollY,this.forEachNode(Ks);for(let t=0,e=o.length;t<e;t+=3){const e=o[t],s=o[t+1],i=o[t+2];s&&""!==s?e.style.transform=s:e.style.removeProperty("transform"),Hs(e,i)}return this}}function ii(t){const e={},s={};for(let i in t){const r=t[i];"duration"===i||"delay"===i||"ease"===i?s[i]=r:e[i]=r}return[e,s]}class ri{constructor(t,e={}){A.current&&A.current.register(this);const s=ii(e.swapAt),i=ii(e.enterFrom),r=ii(e.leaveTo),n=e.properties;if(e.duration=$t(e.duration,350),e.delay=$t(e.delay,0),e.ease=$t(e.ease,"inOut(3.5)"),this.params=e,this.root=ce(t)[0],this.id=e.id||Ms++,this.children=e.children||"*",this.absoluteCoords=!1,this.swapAtParams=yt(e.swapAt||{opacity:0},{ease:"inOut(1.75)"}),this.enterFromParams=e.enterFrom||{opacity:0},this.leaveToParams=e.leaveTo||{opacity:0},this.properties=new Set(["opacity","fontSize","color","backgroundColor","borderRadius","border","filter","clipPath"]),s[0])for(let t in s[0])this.properties.add(t);if(i[0])for(let t in i[0])this.properties.add(t);if(r[0])for(let t in r[0])this.properties.add(t);if(n)for(let t=0,e=n.length;t<e;t++)this.properties.add(n[t]);this.recordedProperties=new Set(["display","visibility","translate","position","left","top","marginLeft","marginTop","width","height","maxWidth","maxHeight","minWidth","minHeight"]),this.properties.forEach(t=>this.recordedProperties.add(t)),this.pendingRemoval=new WeakSet,this.transitionMuteStore=new Map,this.oldState=new si(this),this.newState=new si(this),this.timeline=null,this.transformAnimation=null,this.animating=[],this.swapping=[],this.leaving=[],this.entering=[],this.oldState.record(),Ys(this.transitionMuteStore)}revert(){return this.root.classList.remove("is-animated"),this.timeline&&(this.timeline.complete(),this.timeline=null),this.transformAnimation&&(this.transformAnimation.complete(),this.transformAnimation=null),this.animating.length=this.swapping.length=this.leaving.length=this.entering.length=0,this.oldState.revert(),this.newState.revert(),requestAnimationFrame(()=>Ys(this.transitionMuteStore)),this}record(){return this.transformAnimation&&(this.transformAnimation.cancel(),this.transformAnimation=null),this.oldState.record(),this.timeline&&(this.timeline.cancel(),this.timeline=null),this.newState.forEachRootNode(Js),this}animate(t={}){const e={ease:$t(t.ease,this.params.ease),delay:$t(t.delay,this.params.delay),duration:$t(t.duration,this.params.duration)},s={id:this.id},i=$t(t.onComplete,this.params.onComplete),r=$t(t.onPause,this.params.onPause);for(let e in D)"ease"!==e&&"duration"!==e&&"delay"!==e&&(H(t[e])?H(this.params[e])||(s[e]=this.params[e]):s[e]=t[e]);s.onComplete=()=>{const e=t.autoplay,s=I.editor;if(e&&e.linked||s&&s.showPanel)i&&i(this.timeline);else{this.transformAnimation&&this.transformAnimation.cancel(),f.forEachRootNode(t=>{ti(t),Js(t)});for(let t=0,e=S.length;t<e;t++){const e=S[t];e.style.transform=f.getComputedValue(e,"transform")}this.root.classList.contains("is-animated")&&(this.root.classList.remove("is-animated"),i&&i(this.timeline)),requestAnimationFrame(()=>{this.root.classList.contains("is-animated")||Ys(this.transitionMuteStore)})}},s.onPause=()=>{const e=t.autoplay;if(e&&e.linked)return i&&i(this.timeline),void(r&&r(this.timeline));this.root.classList.contains("is-animated")&&(this.transformAnimation&&this.transformAnimation.cancel(),f.forEachRootNode(ti),this.root.classList.remove("is-animated"),i&&i(this.timeline),r&&r(this.timeline))},s.composition=!1;const n=yt(yt(t.swapAt||{},this.swapAtParams),e),o=yt(yt(t.enterFrom||{},this.enterFromParams),e),a=yt(yt(t.leaveTo||{},this.leaveToParams),e),[l,h]=ii(n),[d,c]=ii(o),[u,p]=ii(a),m=this.oldState,f=this.newState,g=this.animating,y=this.swapping,_=this.entering,b=this.leaving,v=this.pendingRemoval;g.length=y.length=_.length=b.length=0,m.forEachRootNode(Xs),f.record(),f.forEachRootNode(Qs);const T=[],x=[],S=[],w=[],$=f.rootNode,C=$.$el;f.forEachRootNode(t=>{const e=t.$el,s=t.id,i=t.parentNode,r=!!i&&i.branchAdded,n=!!i&&i.branchRemoved,o=!!i&&i.branchNotRendered;let a=m.nodes.get(s);const l=!a;l?(a=ei(t,{},m),m.nodes.set(s,a),a.measuredIsRemoved=!0):a.measuredIsRemoved&&!t.measuredIsRemoved&&(ei(t,a,m),a.measuredIsRemoved=!0);const h=a.parentNode,c=(h?h.id:null)!==(i?i.id:null),p=a.$el!==t.$el,y=a.measuredIsRemoved,x=t.measuredIsRemoved;if(!a.measuredIsRemoved&&!x&&!l&&(c||p)){const t=a.properties.left,e=a.properties.top,s=i||f.rootNode,r=s.id?m.nodes.get(s.id):null,n=r?r.properties.left:s.properties.left,o=r?r.properties.top:s.properties.top,l=r?r.properties.clientLeft:s.properties.clientLeft,h=r?r.properties.clientTop:s.properties.clientTop;a.properties.x=t-n-l,a.properties.y=e-o-h}t.hasVisibilitySwap&&(t.hasVisibilityHidden&&(t.$el.style.visibility="visible",t.$measure.style.visibility="hidden"),t.hasDisplayNone&&(t.$el.style.display=a.measuredDisplay||t.measuredDisplay||"",t.$measure.style.visibility="hidden"));const S=v.has(e),w=a.measuredIsVisible,C=t.measuredIsVisible,E=!w&&C&&!o,k=!x&&(y||S)&&!r,N=x&&!y&&!n,D=N||x&&S&&!n;t.branchAdded=r||k,t.branchRemoved=n||D,t.branchNotRendered=o||x,x&&w&&(t.$el.style.display=a.measuredDisplay,t.$el.style.visibility="visible",ei(a,t,f)),N?(t.isTarget&&(b.push(e),t.isLeaving=!0),v.add(e)):!x&&S&&v.delete(e),k&&!o||E?(Gs(a,d),t.isTarget&&(_.push(e),t.isEntering=!0)):D&&!o&&Gs(t,u),t===$||!t.isTarget||t.isEntering||t.isLeaving||g.push(e),T.push(e)});let E=0,k=0,N=0;f.forEachRootNode(t=>{const s=t.$el,i=t.parentNode,r=m.nodes.get(t.id),n=t.properties,o=r.properties;let a=i!==$&&i;for(;a&&!a.isTarget&&a!==$;)a=a.parentNode;t===$?(t.index=0,t.targets=g,Zs(t,e)):t.isEntering?(t.index=a?a.index:E,t.targets=a?g:_,Zs(t,c),E++):t.isLeaving?(t.index=a?a.index:k,t.targets=a?g:b,k++,Zs(t,p)):t.isTarget?(t.index=N++,t.targets=g,Zs(t,e)):(t.index=a?a.index:0,t.targets=g,Zs(t,h)),r.index=t.index,r.targets=t.targets;for(let e in n)n[e]=Et(n[e],s,t.index,t.targets,null,null),o[e]=Et(o[e],s,r.index,r.targets,null,null);const d=Math.abs(n.width-o.width)>1,u=Math.abs(n.height-o.height)>1;if(t.sizeChanged=d||u,t.isTarget&&(!t.measuredIsRemoved&&r.measuredIsVisible||t.measuredIsRemoved&&t.measuredIsVisible)){"none"===n.transform&&"none"===o.transform||(t.hasTransform=!0,S.push(s));for(let t in n)if("transform"!==t&&n[t]!==o[t]){x.push(s);break}}t.isTarget||(y.push(s),t.sizeChanged&&i&&i.isTarget&&i.sizeChanged&&(l.transform&&(t.hasTransform=!0,S.push(s)),w.push(s)))});const A={delay:t=>f.getNode(t).delay,duration:t=>f.getNode(t).duration,ease:t=>f.getNode(t).ease};if(s.defaults=A,this.timeline=Xe(s),!x.length&&!S.length&&!y.length)return Ys(this.transitionMuteStore),this.timeline.complete();if(T.length){this.root.classList.add("is-animated");for(let t=0,e=T.length;t<e;t++){const e=T[t],s=e.dataset.layoutId,i=m.nodes.get(s),r=f.nodes.get(s),n=i.properties;r.isInlined||("grid"!==i.measuredDisplay&&"grid"!==r.measuredDisplay||e.style.setProperty("display","block","important"),(e!==C||this.absoluteCoords)&&(e.style.position=this.absoluteCoords?"fixed":"absolute",e.style.left="0px",e.style.top="0px",e.style.marginLeft="0px",e.style.marginTop="0px",e.style.translate=`${n.x}px ${n.y}px`),e===C&&"static"===r.measuredPosition&&(e.style.position="relative",e.style.left="0px",e.style.top="0px")),e.style.width=`${n.width}px`,e.style.height=`${n.height}px`,e.style.minWidth="auto",e.style.minHeight="auto",e.style.maxWidth="none",e.style.maxHeight="none"}m.scrollX===window.scrollX&&m.scrollY===window.scrollY||requestAnimationFrame(()=>window.scrollTo(m.scrollX,m.scrollY));for(let t=0,e=x.length;t<e;t++){const e=x[t],s=e.dataset.layoutId,i=m.nodes.get(s),r=f.nodes.get(s),n=i.properties,o=r.properties;let a=!1;const l={composition:"none"};n.width!==o.width&&(l.width=[n.width,o.width],a=!0),n.height!==o.height&&(l.height=[n.height,o.height],a=!0),r.hasTransform||r.isInlined||(l.translate=[`${n.x}px ${n.y}px`,`${o.x}px ${o.y}px`],a=!0),this.properties.forEach(t=>{const e=n[t],s=o[t];"transform"!==t&&e!==s&&(l[t]=[e,s],a=!0)}),a&&this.timeline.add(e,l,0)}}if(y.length){for(let t=0,e=y.length;t<e;t++){const e=y[t],s=m.getNode(e),i=s.properties;e.style.width=`${i.width}px`,e.style.height=`${i.height}px`,e.style.minWidth="auto",e.style.minHeight="auto",e.style.maxWidth="none",e.style.maxHeight="none",s.isInlined||(e.style.translate=`${i.x}px ${i.y}px`),this.properties.forEach(t=>{"transform"!==t&&(e.style[t]=`${m.getComputedValue(e,t)}`)})}for(let t=0,e=y.length;t<e;t++){const e=y[t],s=f.getNode(e),i=s.properties;this.timeline.call(()=>{e.style.width=`${i.width}px`,e.style.height=`${i.height}px`,e.style.minWidth="auto",e.style.minHeight="auto",e.style.maxWidth="none",e.style.maxHeight="none",s.isInlined||(e.style.translate=`${i.x}px ${i.y}px`),this.properties.forEach(t=>{"transform"!==t&&(e.style[t]=`${f.getComputedValue(e,t)}`)})},s.delay+s.duration/2)}if(w.length){const t=$e(f.nodes.get(w[0].dataset.layoutId).ease),e=e=>1-t(1-e),s={};if(l)for(let t in l)"transform"!==t&&(s[t]=[{from:e=>m.getComputedValue(e,t),to:l[t]},{from:l[t],to:e=>f.getComputedValue(e,t),ease:e}]);this.timeline.add(w,s,0)}}const R=S.length;if(R){for(let t=0;t<R;t++){const e=S[t],s=f.getNode(e);s.isInlined||(e.style.translate=`${m.getComputedValue(e,"x")}px ${m.getComputedValue(e,"y")}px`),e.style.transform=m.getComputedValue(e,"transform"),w.includes(e)&&(s.ease=Et(n.ease,e,s.index,s.targets,null,null),s.duration=Et(n.duration,e,s.index,s.targets,null,null))}this.transformAnimation=Fs.animate(S,{translate:t=>f.getNode(t).isInlined?"0px 0px":`${f.getComputedValue(t,"x")}px ${f.getComputedValue(t,"y")}px`,transform:t=>{const e=f.getComputedValue(t,"transform");if(!w.includes(t))return e;const s=m.getComputedValue(t,"transform"),i=f.getNode(t);return[s,Et(l.transform,t,i.index,i.targets,null,null),e]},autoplay:!1,...A}),this.timeline.sync(this.transformAnimation,0)}return this.timeline.init()}update(t,e={}){return this.record(),t(this),this.animate(e)}}const ni=Ue,oi={},ai=t=>(...e)=>{const s=t(...e);return new Proxy(_,{apply:(t,e,[i])=>s(i),get:(t,e)=>{if(oi[e])return ai((...t)=>{const i=oi[e](...t);return t=>i(s(t))})}})},li=(t,e,s=0)=>{const i=(...t)=>(t.length<e.length?ai(((t,e=0)=>(...s)=>e?e=>t(...s,e):e=>t(e,...s))(e,s)):e)(...t);return oi[t]||(oi[t]=i),i},hi=li("roundPad",ni.roundPad),di=li("padStart",ni.padStart),ci=li("padEnd",ni.padEnd),ui=li("wrap",ni.wrap),pi=li("mapRange",ni.mapRange),mi=li("degToRad",ni.degToRad),fi=li("radToDeg",ni.radToDeg),gi=li("snap",ni.snap),yi=li("clamp",ni.clamp),_i=li("round",ni.round),bi=li("lerp",ni.lerp,1),vi=li("damp",ni.damp,1),Ti=(t=0,e=1,s=0)=>{const i=10**s;return Math.floor((Math.random()*(e-t+1/i)+t)*i)/i};let xi=0;const Si=(t,e=0,s=1,i=0)=>{let r=void 0===t?xi++:t;return(t=e,n=s,o=i)=>{r+=1831565813,r=Math.imul(r^r>>>15,1|r),r^=r+Math.imul(r^r>>>7,61|r);const a=10**o;return Math.floor((((r^r>>>14)>>>0)/4294967296*(n-t+1/a)+t)*a)/a}},wi=t=>t[Ti(0,t.length-1)],$i=(t,e=Ti)=>{let s,i,r=t.length;for(;r;)i=e(0,--r),s=t[r],t[r]=t[i],t[i]=s;return t},Ci=(t,e={})=>{let s,i=[],r=0,n=null;const o=e.from,a=e.reversed,l=e.ease,h=!H(l),d=h&&!H(l.ease)?l.ease:h?$e(l):null,c=e.grid,u=!0===c,m=e.axis,f=e.total,g=H(o)||0===o||"first"===o,y="center"===o,_="last"===o,b="random"===o,v=F(o),T=F(t),x=e.use,S=Z(T?t[0]:t),w=T?Z(t[1]):0,$=C.exec((T?t[1]:t)+p),E=e.start||0+(T?S:0),k=e.seed,N=H(k)||!1===k?Ti:Si(!0===k?0:k),D=e.jitter,A=!H(D),I=F(D),R=I?D[0]:D||0,L=I?D[1]:D||0;let B=g?0:V(o)?o:0;return(t,l,h,p,g)=>{const[C]=ce(t),k=H(f)?h.length:f,D=!H(x)&&(z(x)?x(C,l,k):Dt(C,x)),I=V(D)||O(D)&&V(+D)?+D:l,P=I>=0&&I<k?I:l;if(y&&(B=(k-1)/2),_&&(B=k-1),!i.length){if(u){let t=!0,e=!1,s=1/0,r=1/0,n=1/0,a=-1/0,l=-1/0,d=-1/0;const c=[],u=[],p=[];for(let i=0;i<k;i++){const o=h[i];let m=0,f=0,g=0,y=!1;if(o&&z(o.getBoundingClientRect)){const t=o.getBoundingClientRect();m=t.left+t.width/2,f=t.top+t.height/2,y=!0}else{const t=o;t&&V(t.x)&&V(t.y)&&(m=t.x,f=t.y,V(t.z)&&(g=t.z,e=!0),y=!0)}if(!y){t=!1;break}c.push(m),u.push(f),p.push(g),m<s&&(s=m),f<r&&(r=f),g<n&&(n=g),m>a&&(a=m),f>l&&(l=f),g>d&&(d=g)}if(t){let t=c[0],h=u[0],f=p[0];v?(t=s+o[0]*(a-s),h=r+o[1]*(l-r),f=e?n+(o.length>=3?o[2]:.5)*(d-n):0):y?(t=(s+a)/2,h=(r+l)/2,f=(n+d)/2):_?(t=c[k-1],h=u[k-1],f=p[k-1]):V(o)&&(t=c[o],h=u[o],f=p[o]);for(let s=0;s<k;s++){const r=t-c[s],n=h-u[s],o=f-p[s];let a=J(r*r+n*n+(e?o*o:0));"x"===m&&(a=-r),"y"===m&&(a=-n),"z"===m&&(a=-o),i.push(a)}let g=1/0;for(let t=0;t<k;t++){const e=et(i[t]);e>0&&e<g&&(g=e)}if(g>0&&g<1/0)for(let t=0;t<k;t++)i[t]=i[t]/g}else for(let t=0;t<k;t++)i.push(et(B-t))}else for(let t=0;t<k;t++)if(c){const e=c.length,s=c[0]*c[1];let r,n,a;v?(r=o[0]*(c[0]-1),n=o[1]*(c[1]-1),a=3===e?(o.length>=3?o[2]:.5)*(c[2]-1):0):y?(r=(c[0]-1)/2,n=(c[1]-1)/2,a=3===e?(c[2]-1)/2:0):(r=B%c[0],n=rt(B/c[0])%c[1],a=3===e?rt(B/s):0);const l=r-t%c[0],h=n-rt(t/c[0])%c[1],d=a-(3===e?rt(t/s):0);let u=J(l*l+h*h+(3===e?d*d:0));"x"===m&&(u=-l),"y"===m&&(u=-h),"z"===m&&(u=-d),i.push(u)}else i.push(et(B-t));r=i[0];for(let t=1;t<k;t++)i[t]>r&&(r=i[t]);if(d||a)for(let t=0;t<k;t++){let e=i[t];d&&(e=d(e/r)*r),a&&(e=m?-e:et(r-e)),i[t]=e}if(A){n=new Array(k);for(let t=0;t<k;t++)n[t]=N(-1,1,4)}b&&(i=$i(i,N))}const F=T?(w-S)/r:S;H(s)&&(s=g?Ve(g,H(e.start)?g.iterationDuration:E):E);let M=s+(F*ct(i[P],2)||0);if(A){const t=r?i[P]/r:0,e=R+(L-R)*t;M+=n[P]*e}return e.modifier&&(M=e.modifier(M)),$&&(M=`${M}${$[2]}`),M}};var Ei=Object.freeze({__proto__:null,$:ce,addChild:vt,clamp:yi,cleanInlineStyles:zt,createSeededRandom:Si,damp:vi,degToRad:mi,forEachChildren:_t,get:ts,keepTime:ds,lerp:bi,mapRange:pi,padEnd:ci,padStart:di,radToDeg:fi,random:Ti,randomPick:wi,remove:ss,removeChild:bt,round:_i,roundPad:hi,set:es,shuffle:$i,snap:gi,stagger:Ci,sync:hs,wrap:ui});const ki=t=>{const e=de(t)[0];return e&&Y(e)?e:console.warn(`${t} is not a valid SVGGeometryElement`)},Ni=(t,e,s,i,r)=>{const n=s+i,o=r?Math.max(0,Math.min(n,e)):(n%e+e)%e;return t.getPointAtLength(o)},Di=(t,e,s=0)=>i=>{const r=+t.getTotalLength(),n=i[a],o=t.getCTM(),l=0===s;return{from:0,to:r,modifier:i=>{const a=i+s*r;if("a"===e){const e=Ni(t,r,a,-1,l),s=Ni(t,r,a,1,l);return 180*at(s.y-e.y,s.x-e.x)/lt}{const s=Ni(t,r,a,0,l);return"x"===e?n||!o?s.x:s.x*o.a+s.y*o.c+o.e:n||!o?s.y:s.x*o.b+s.y*o.d+o.f}}}},Ai=(t,e=0)=>{const s=ki(t);if(s)return{translateX:Di(s,"x",e),translateY:Di(s,"y",e),rotate:Di(s,"a",e)}},Ii=(t,e=0,s=0)=>de(t).map(t=>((t,e,s)=>{const i=u,r=getComputedStyle(t),n=r.strokeLinecap,o="non-scaling-stroke"===r.vectorEffect?t:null;let a=n;const l=new Proxy(t,{get(t,e){const s=t[e];return e===h?t:"setAttribute"===e?(...e)=>{if("draw"===e[0]){const s=e[1].split(" "),r=+s[0],l=+s[1],h=(t=>{let e=1;if(t&&t.getCTM){const s=t.getCTM();s&&(e=(J(s.a*s.a+s.b*s.b)+J(s.c*s.c+s.d*s.d))/2)}return e})(o),d=-1e3*r*h,c=l*i*h+d,u=i*h+(0===r&&1===l||1===r&&0===l?0:10*h)-c;if("butt"!==n){const e=r===l?"butt":n;a!==e&&(t.style.strokeLinecap=`${e}`,a=e)}t.setAttribute("stroke-dashoffset",`${d}`),t.setAttribute("stroke-dasharray",`${c} ${u}`)}return Reflect.apply(s,t,e)}:z(s)?(...e)=>Reflect.apply(s,t,e):s}});return"1000"!==t.getAttribute("pathLength")&&(t.setAttribute("pathLength","1000"),l.setAttribute("draw",`${e} ${s}`)),l})(t,e,s)),Ri=(t,e=.33)=>(s,i,r,n)=>{if(!(s.tagName||"").toLowerCase().match(/^(path|polygon|polyline)$/))throw new Error(`Can't morph a <${s.tagName}> SVG element. Use <path>, <polygon> or <polyline>.`);const o=ki(t);if(!o)throw new Error("Can't morph to an invalid target. 'path2' must resolve to an existing <path>, <polygon> or <polyline> SVG element.");if(!(o.tagName||"").toLowerCase().match(/^(path|polygon|polyline)$/))throw new Error(`Can't morph a <${o.tagName}> SVG element. Use <path>, <polygon> or <polyline>.`);const a="path"===s.tagName,l=a?" ":",",h=n?n._value:null;h&&s.setAttribute(a?"d":"points",h);let d="",c="";if(e){const t=s.getTotalLength(),i=o.getTotalLength(),r=Math.max(Math.ceil(t*e),Math.ceil(i*e));for(let e=0;e<r;e++){const n=e/(r-1),h=s.getPointAtLength(t*n),u=o.getPointAtLength(i*n),p=a?0===e?"M":"L":"";d+=p+ct(h.x,3)+l+h.y+" ",c+=p+ct(u.x,3)+l+u.y+" "}}else d=s.getAttribute(a?"d":"points"),c=o.getAttribute(a?"d":"points");return[d,c]};var Li=Object.freeze({__proto__:null,createDrawable:Ii,createMotionPath:Ai,morphTo:Ri});const Bi="undefined"!=typeof Intl&&Intl.Segmenter,Pi=/\{value\}/g,Fi=/\{i\}/g,Mi=/(\s+)/,Vi=/^\s+$/,Oi="line",zi="word",Hi="char",Xi="data-line";let Yi=null,Wi=null,Ui=null;const qi=t=>t.isWordLike||" "===t.segment||V(+t.segment),ji=t=>t.setAttribute("aria-hidden","true"),Gi=(t,e)=>[...t.querySelectorAll(`[data-${e}]:not([data-${e}] [data-${e}])`)],Zi={line:"#00D672",word:"#FF4B4B",char:"#5A87FF"},Qi=t=>{if(!t.childElementCount&&!t.textContent.trim()){const e=t.parentElement;t.remove(),e&&Qi(e)}},Ji=(t,e,s)=>{const i=t.getAttribute(Xi);if(null!==i&&+i!==e||"BR"===t.tagName){s.add(t);const e=t.previousSibling,i=t.nextSibling;e&&3===e.nodeType&&Vi.test(e.textContent)&&s.add(e),i&&3===i.nodeType&&Vi.test(i.textContent)&&s.add(i)}let r=t.childElementCount;for(;r--;)Ji(t.children[r],e,s);return s},Ki=(t,e={})=>{let s="";e||(e={});const i=O(e.class)?` class="${e.class}"`:"",r=$t(e.clone,!1),n=$t(e.wrap,!1),o=n?!0===n?"clip":n:!!r&&"clip";return n&&(s+=`<span${o?` style="overflow:${o};"`:""}>`),s+=`<span${i}${r?' style="position:relative;"':""} data-${t}="{i}">`,r?(s+="<span>{value}</span>",s+=`<span inert style="position:absolute;top:${"top"===r?"-100%":"bottom"===r?"100%":"0"};left:${"left"===r?"-100%":"right"===r?"100%":"0"};white-space:nowrap;">{value}</span>`):s+="{value}",s+="</span>",n&&(s+="</span>"),s},tr=(t,e,s,i,r,n,o,a,l)=>{const h=r===Oi,d=r===Hi,c=`_${r}_`,u=z(t)?t(s):t,p=h?"block":"inline-block";Ui.innerHTML=u.replace(Pi,`<i class="${c}"></i>`).replace(Fi,`${d?l:h?o:a}`);const m=Ui.content,f=m.firstElementChild,g=m.querySelector(`[data-${r}]`)||f,y=m.querySelectorAll(`i.${c}`),_=y.length;if(_){f.style.display=p,g.style.display=p,g.setAttribute(Xi,`${o}`),h||(g.setAttribute("data-word",`${a}`),d&&g.setAttribute("data-char",`${l}`));let t=_;for(;t--;){const e=y[t],i=e.parentElement;i.style.display=p,h?i.innerHTML=s.innerHTML:i.replaceChild(s.cloneNode(!0),e)}e.push(g),i.appendChild(m)}else console.warn('The expression "{value}" is missing from the provided template.');return n&&(f.style.outline=`1px dotted ${Zi[r]}`),f};class er{constructor(t,s={}){Yi||(Yi=Bi?new Bi([],{granularity:zi}):{segment:t=>{const e=[],s=t.split(Mi);for(let t=0,i=s.length;t<i;t++){const i=s[t];e.push({segment:i,isWordLike:!Vi.test(i)})}return e}}),Wi||(Wi=Bi?new Bi([],{granularity:"grapheme"}):{segment:t=>[...t].map(t=>({segment:t}))}),!Ui&&e&&(Ui=i.createElement("template")),A.current&&A.current.register(this);const{words:r,chars:n,lines:o,accessible:a,includeSpaces:l,debug:h}=s,d=(t=F(t)?t[0]:t)&&t.nodeType?t:(he(t)||[])[0],c=!0===o?{}:o,u=!0===r||H(r)?{}:r,p=!0===n?{}:n;this.debug=$t(h,!1),this.includeSpaces=$t(l,!1),this.accessible=$t(a,!0),this.linesOnly=c&&!u&&!p,this.lineTemplate=M(c)?Ki(Oi,c):c,this.wordTemplate=M(u)||this.linesOnly?Ki(zi,u):u,this.charTemplate=M(p)?Ki(Hi,p):p,this.$target=d,this.html=d&&d.innerHTML,this.lines=[],this.words=[],this.chars=[],this.effects=[],this.effectsCleanups=[],this.cache=null,this.ready=!1,this.width=0,this.resizeTimeout=null;const m=()=>this.html&&(c||u||p)&&this.split();this.resizeObserver=new ResizeObserver(()=>{clearTimeout(this.resizeTimeout),this.resizeTimeout=setTimeout(()=>{const t=d.offsetWidth;t!==this.width&&(this.width=t,m())},150)}),this.lineTemplate&&!this.ready?i.fonts.ready.then(m):m(),d?this.resizeObserver.observe(d):console.warn("No Text Splitter target found.")}addEffect(t){if(!z(t))return console.warn("Effect must return a function."),this;const e=ds(t);return this.effects.push(e),this.ready&&(this.effectsCleanups[this.effects.length-1]=e(this)),this}revert(){return clearTimeout(this.resizeTimeout),this.lines.length=this.words.length=this.chars.length=0,this.resizeObserver.disconnect(),this.effectsCleanups.forEach(t=>z(t)?t(this):t.revert&&t.revert()),this.$target.innerHTML=this.html,this}splitNode(t){const e=this.wordTemplate,s=this.charTemplate,r=this.includeSpaces,n=this.debug,o=t.nodeType;if(3===o){const o=t.nodeValue;if(o.trim()){const a=[],l=this.words,h=this.chars,d=Yi.segment(o),c=i.createDocumentFragment();let u=null;for(const t of d){const e=t.segment,s=qi(t);if(!u||s&&u&&qi(u))a.push(e);else{const t=a.length-1,s=a[t];Mi.test(s)||Mi.test(e)?a.push(e):a[t]+=e}u=t}for(let t=0,o=a.length;t<o;t++){const o=a[t];if(o.trim()){const d=a[t+1],u=r&&d&&!d.trim(),p=o,m=s?Wi.segment(p):null,f=s?i.createDocumentFragment():i.createTextNode(u?o+" ":o);if(s){const t=[...m];for(let e=0,r=t.length;e<r;e++){const o=t[e],a=e===r-1&&u?o.segment+" ":o.segment,d=i.createTextNode(a);tr(s,h,d,f,Hi,n,-1,l.length,h.length)}}e?tr(e,l,f,c,zi,n,-1,l.length,h.length):s?c.appendChild(f):c.appendChild(i.createTextNode(o)),u&&t++}else{if(t&&r)continue;c.appendChild(i.createTextNode(o))}}t.parentNode.replaceChild(c,t)}}else if(1===o){const e=[...t.childNodes];for(let t=0,s=e.length;t<s;t++)this.splitNode(e[t])}}split(t=!1){const e=this.$target,s=!!this.cache&&!t,r=this.lineTemplate,n=this.wordTemplate,o=this.charTemplate,a="loading"!==i.fonts.status,l=r&&a;this.ready=!r||a,(l||t)&&this.effectsCleanups.forEach(t=>z(t)&&t(this)),s||(t&&(e.innerHTML=this.html,this.words.length=this.chars.length=0),this.splitNode(e),this.cache=e.innerHTML),l&&(s&&(e.innerHTML=this.cache),this.lines.length=0,n&&(this.words=Gi(e,zi))),o&&(l||n)&&(this.chars=Gi(e,Hi));const h=this.words.length?this.words:this.chars;let d,c=0;for(let t=0,e=h.length;t<e;t++){const e=h[t],{top:s,height:i}=e.getBoundingClientRect();!H(d)&&s-d>.5*i&&c++,e.setAttribute(Xi,`${c}`);const r=e.querySelectorAll(`[${Xi}]`);let n=r.length;for(;n--;)r[n].setAttribute(Xi,`${c}`);d=s}if(l){const t=i.createDocumentFragment(),s=new Set,a=[];for(let t=0;t<c+1;t++){const i=e.cloneNode(!0);Ji(i,t,new Set).forEach(t=>{const e=t.parentNode;e&&(1===t.nodeType&&s.add(e),e.removeChild(t))}),a.push(i)}s.forEach(Qi);for(let e=0,s=a.length;e<s;e++)tr(r,this.lines,a[e],t,Oi,this.debug,e);e.innerHTML="",e.appendChild(t),n&&(this.words=Gi(e,zi)),o&&(this.chars=Gi(e,Hi))}if(this.linesOnly){const t=this.words;let e=t.length;for(;e--;){const s=t[e];s.replaceWith(s.textContent)}t.length=0}if(this.accessible&&(l||!s)){const t=i.createElement("span");t.style.cssText="position:absolute;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);width:1px;height:1px;white-space:nowrap;",t.innerHTML=this.html,e.insertBefore(t,e.firstChild),this.lines.forEach(ji),this.words.forEach(ji),this.chars.forEach(ji)}return this.width=e.offsetWidth,(l||t)&&this.effects.forEach((t,e)=>this.effectsCleanups[e]=t(this)),this}refresh(){this.split(!0)}}const sr=(t,e)=>new er(t,e),ir=(t,e)=>(console.warn("text.split() is deprecated, import splitText() directly, or text.splitText()"),new er(t,e)),rr=t=>{let e="";for(let s=0,i=t.length;s<i;s++)if(s+2<i&&"-"===t[s+1]&&t.charCodeAt(s)<t.charCodeAt(s+2)){const i=t.charCodeAt(s),r=t.charCodeAt(s+2);for(let t=i;t<=r;t++)e+=String.fromCharCode(t);s+=2}else e+=t[s];return e},nr={lowercase:"a-z",uppercase:"A-Z",numbers:"0-9",symbols:"!%#_|*+=",braille:"⠀-⣿",blocks:"▀-▟",shades:"░-▓"},or=new WeakMap,ar=(t={})=>{t||(t={});const e=t.chars,s=$e(t.ease||"linear"),i=t.text,r=t.from,n=t.reversed||!1,o=t.perturbation||0,a=t.cursor,l=!0===a?"_":"number"==typeof a?String.fromCharCode(a):"string"==typeof a?a:"",h=l.length,d=t.seed||0,c=void 0===t.override||t.override,u=t.revealRate||60,p=1e3*I.timeScale/u,m=t.settleDuration||300*I.timeScale,f=t.settleRate||30,g=t.duration,y=t.revealDelay,b=t.delay,v=t.onChange||_;return(t,a,u,_)=>{const T="function"==typeof e?e(t,a,u):e||"a-zA-Z0-9!%#_",x=rr(nr[T]||T),S=x.length-1,w="function"==typeof g?g(t,a,u):g,$="function"==typeof y?y(t,a,u):y||0,C="function"==typeof b?b(t,a,u):b||0,E=d?Si(d):Si();or.has(t)||or.set(t,t.textContent);const k=_?_._value:t.textContent,N=void 0!==i?"function"==typeof i?i(t,a,u):i:_?_._value:or.get(t),D=" "===N||"&nbsp;"===N?" ":N,A=" "===k?0:k.length,R=D.length,L=!0===c?x:"string"==typeof c&&c.length>0?rr(nr[c]||c):null,B=L?L.length-1:0,P=" "===c?" ":null,F=""===c?R:Math.max(A,R),M=w>0?w:(F-1)*p+m,V=ct((M+$)/I.timeScale,0)*I.timeScale,O=$>0?ct($/V,12):0,z=void 0===r||"auto"===r?R<A?"right":"left":r,H=new Int32Array(F);if("random"===z){for(let t=0;t<F;t++)H[t]=t;for(let t=F-1;t>0;t--){const e=E(0,t),s=H[t];H[t]=H[e],H[e]=s}}else{const t="right"===z?(""!==c&&A?A:F)-1:"center"===z?((""!==c&&A?A:F)-1)/2:"number"==typeof z?z:0,e=Math.abs,s=new Array(F);for(let t=0;t<F;t++)s[t]=t;s.sort((s,i)=>e(s-t)-e(i-t));for(let t=0;t<F;t++)H[s[t]]=t}if(n){const t=F-1;for(let e=0;e<F;e++)H[e]=t-H[e]}const X=ct(m/M,12),Y=ct((1-X)/F,12),W=h*Y,U=ct(1e3*I.timeScale/(f*V),12),q=new Float32Array(F),j=new Float32Array(F),G=o>0?o*X:0;for(let t=0;t<F;t++){const e=G>0?(E(0,2e3)-1e3)/1e3*G:0,s=G>0?(E(0,2e3)-1e3)/1e3*G:0;q[t]=H[t]*Y+e,j[t]=Math.ceil((q[t]+X+s)/U)*U}if(R<F&&"left"!==z&&"right"!==z&&"random"!==z){let t=0;for(let e=R;e<F;e++)j[e]>t&&(t=j[e]);const e=new Array(R);for(let t=0;t<R;t++)e[t]=t;e.sort((t,e)=>H[t]-H[e]);const s=(1-t)/R;for(let i=0;i<R;i++){const r=t+i*s;r>j[e[i]]&&(j[e[i]]=r)}}const Z=new Array(F);for(let t=0;t<F;t++)Z[t]=x[E(0,S)];const Q=L?L===x?Z:new Array(F):null;if(Q&&Q!==Z)for(let t=0;t<F;t++)Q[t]=P||L[E(0,L.length-1)];let J=k;if(!_)if(""===c)J="";else if(L){J="";for(let t=0;t<A;t++)J+=" "===k[t]?" ":Q[t]}let K=-1,tt=-1,et="";const st=""!==c,it=!!L,rt=h>0;return{from:0,to:1,duration:V,delay:C,ease:"linear",modifier:t=>{if(t===K)return et;if(K=t,C>0&&t<=0)return et=k,k;if(t<=0)return et=J,J;if(t>=1)return et=D,D;et="";const e=t/U|0,i=e!==tt;i&&(tt=e);const r=O>0?(t-O)/(1-O):t,n=r>0?s(r):0;for(let t=0;t<F;t++){const e=q[t];n>=j[t]?t<R&&(et+=D[t]):n<=0||n<e?st&&t<A&&(it?" "===k[t]?et+=" ":(i&&(Q[t]=P||L[E(0,B)]),et+=Q[t]):et+=k[t]):t<R&&" "===D[t]||t<A&&" "===k[t]?et+=" ":rt&&n-e<W?et+=l[h-1-((n-e)/Y|0)]:(i&&(Z[t]=x[E(0,S)]),et+=Z[t])}return i&&v(et,n),et}}}};var lr=Object.freeze({__proto__:null,TextSplitter:er,scrambleText:ar,split:ir,splitText:sr});t.$=ce,t.Animatable=Ye,t.AutoLayout=ri,t.Draggable=ls,t.JSAnimation=Me,t.Scope=cs,t.ScrollObserver=vs,t.Spring=je,t.TextSplitter=er,t.Timeline=He,t.Timer=le,t.WAAPIAnimation=Ps,t.addChild=vt,t.animate=(t,e)=>I.editor?I.editor.addAnimation(t,e):new Me(t,e,null,0,!1).init(),t.clamp=yi,t.cleanInlineStyles=zt,t.createAnimatable=(t,e)=>new Ye(t,e),t.createDraggable=(t,e)=>new ls(t,e),t.createDrawable=Ii,t.createLayout=(t,e)=>new ri(t,e),t.createMotionPath=Ai,t.createScope=t=>new cs(t),t.createSeededRandom=Si,t.createSpring=Ze,t.createTimeline=Xe,t.createTimer=t=>new le(t,null,0).init(),t.cubicBezier=xs,t.damp=vi,t.degToRad=mi,t.eases=Te,t.easings=Cs,t.engine=qt,t.forEachChildren=_t,t.get=ts,t.globals=I,t.irregular=$s,t.keepTime=ds,t.lerp=bi,t.linear=ws,t.mapRange=pi,t.morphTo=Ri,t.onScroll=(t={})=>new vs(t),t.padEnd=ci,t.padStart=di,t.radToDeg=fi,t.random=Ti,t.randomPick=wi,t.remove=ss,t.removeChild=bt,t.round=_i,t.roundPad=hi,t.scrambleText=ar,t.scrollContainers=ps,t.set=es,t.shuffle=$i,t.snap=gi,t.split=ir,t.splitText=sr,t.spring=Ge,t.stagger=Ci,t.steps=Ss,t.svg=Li,t.sync=hs,t.text=lr,t.utils=Ei,t.waapi=Fs,t.wrap=ui});

window.anime.engine.useDefaultMainLoop=false;
}
'use strict';
(()=>{
// Preserve new deep links while older modules mount their own panels synchronously.
const v214InitialHash=typeof location==='object'?location.hash:'';
const v214NewRoute=/^#(?:work\/(?:security|evidence|decision|security-history|security-settings|fieldwork|field-records|security-control|security-response|case-library)|messages\/ai|magi\/(?:system|maintenance|maintenance-tools|maintenance-settings|maintenance-history)|mission\/(?:weapon-detail|angels|engagement)|hq\/(?:directorate|seele|observatory)|settings\/(?:visual-index|cadence))$/.test(v214InitialHash);
let v214FinishRoutes=()=>{};
if(v214NewRoute&&typeof history==='object'){
 const push=history.pushState;history.pushState=function(){};
 v214FinishRoutes=()=>{history.pushState=push;history.replaceState({},'',v214InitialHash);const [page,view]=v214InitialHash.slice(1).split('/');window.NERV_MOBILE?.open(page,view);};
}
// Runs before the legacy state reader; preserve damaged input before defaults can be saved.
window.__NERV_STATE_RECOVERY__=window.__BOOT__?.recovery||null;
if(!window.__SCRIPTABLE__&&document.querySelector('#staffSupport')){
 try{
  const key='nerv-command-v2',raw=localStorage.getItem(key);
  if(raw!==null){
   let valid=false;try{const parsed=JSON.parse(raw);valid=!!parsed&&typeof parsed==='object'&&!Array.isArray(parsed);}catch(error){}
   if(!valid){
    let backup=key+'-corrupt-'+Date.now(),i=0;while(localStorage.getItem(backup)!==null)backup=key+'-corrupt-'+Date.now()+'-'+(++i);
    try{
     localStorage.setItem(backup,raw);
     const previous=localStorage.getItem(key+'-last-good');let recovered=null;
     try{const value=JSON.parse(previous);if(value&&typeof value==='object'&&!Array.isArray(value))recovered=value;}catch(error){}
     if(recovered)localStorage.setItem(key,JSON.stringify(recovered));
     window.__NERV_STATE_RECOVERY__={recovered:true,blocked:false,backup,source:recovered?'last-good':'defaults',message:recovered?'破損データを別保存し、直前の正常保存から復旧しました。':'破損データを別保存しました。正常な控えがないため初期状態で開いています。'};
    }catch(error){window.__NERV_STATE_RECOVERY__={recovered:false,blocked:true,message:'破損データの退避に失敗。元データを保護するため保存を停止しています。'};}
   }
  }
 }catch(error){window.__NERV_STATE_RECOVERY__={blocked:true,message:'保存領域を読み取れないため、保存を停止しています。'};}
}
const $=id=>document.getElementById(id);
const qs=s=>document.querySelector(s);
const all=s=>Array.from(document.querySelectorAll(s));
const defaults=()=>({
  prefs:{sound:false,motion:true,showBoot:true,autoWeather:false},
  tasks:[],
  weather:null,
  infra:{power:true,armor:false,comms:true},
  evas:[{state:'HANGAR',sync:71.6,power:300,at:false},{state:'HANGAR',sync:83.4,power:300,at:false},{state:'HANGAR',sync:79.2,power:300,at:false}],
  magi:{approvedFor:null,vote:null,diagnosedAt:null},
  mission:{phase:0},logs:{infra:[],eva:[],magi:[],mission:[]},selectedEva:0
});
let S=defaults();
try{const b=window.__BOOT__?.state||JSON.parse(localStorage.getItem('nerv-command-v2')||'null');if(b&&typeof b==='object'){
  S={...S,...b,prefs:{...S.prefs,...b.prefs},infra:{...S.infra,...b.infra},magi:{...S.magi,...b.magi},mission:{...S.mission,...b.mission},logs:{...S.logs,...b.logs}};
  if(!Array.isArray(S.tasks))S.tasks=[];if(!Array.isArray(S.evas)||S.evas.length!==3)S.evas=defaults().evas;
  S.evas=S.evas.map((e,i)=>({...defaults().evas[i],...e}));
}}catch(e){console.warn('state parse',e)}
let currentPage='home',audio=null,toastTimeout=0,saveTimeout=0,busyWeather=false;
let battery=window.__BOOT__?.battery??null,charging=window.__BOOT__?.charging??false;
let focus={length:1500,remaining:1500,deadline:0,running:false};
let nextBridgeId=1;const bridgeCallbacks={};window.__nervQueue=[];
window.__nervDeliver=(id,result)=>{const entry=bridgeCallbacks[id];if(entry){delete bridgeCallbacks[id];entry(result);}};
function callNative(action,payload={}){
  if(window.__SCRIPTABLE__){return new Promise((resolve)=>{const id=nextBridgeId++;bridgeCallbacks[id]=resolve;window.__nervQueue.push({id,action,payload});});}
  if(action==='persist'){try{localStorage.setItem('nerv-command-v2',JSON.stringify(payload.state));return Promise.resolve({ok:true});}catch(e){return Promise.resolve({error:String(e)})}}
  if(action==='backupUpgrade'){try{const key='nerv-command-v2-before-visual-upgrade';if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(payload.state));return Promise.resolve({ok:true});}catch(e){return Promise.resolve({error:String(e)})}}
  if(action==='backupState'){try{localStorage.setItem('nerv-command-v2-before-alert-clear',JSON.stringify(payload.state));return Promise.resolve({ok:true});}catch(e){return Promise.resolve({error:String(e)})}}
  if(action==='clipboard')return navigator.clipboard?.writeText?navigator.clipboard.writeText(String(payload.text||'')).then(()=>({ok:true})).catch(e=>({error:String(e)})):Promise.resolve({error:'Clipboard unavailable'});
  if(action==='battery'){return navigator.getBattery?navigator.getBattery().then(b=>({level:Math.round(b.level*100),charging:b.charging})):Promise.resolve({level:null,charging:false});}
  if(action==='weather'){return browserWeather();}
  if(action==='mapLocation'){return new Promise(resolve=>{if(!navigator.geolocation)return resolve({error:'現在地に非対応の環境です'});navigator.geolocation.getCurrentPosition(p=>resolve({lat:p.coords.latitude,lng:p.coords.longitude}),e=>resolve({error:e.message}),{timeout:12000,enableHighAccuracy:false,maximumAge:120000});});}
  return Promise.resolve({error:'Unsupported action'});
}
// Additive bridge support. Existing save keys and unknown state fields stay intact.
const worldPreviousNative=callNative;
callNative=function(action,payload={}){
 const recovery=window.__NERV_STATE_RECOVERY__;
 if(action==='persist'&&recovery?.blocked)return Promise.resolve({error:recovery.message});
 if(!window.__SCRIPTABLE__){
  if(action==='backupWorld'){
   try{
    const base='nerv-command-v2-before-world'+(payload.extension==='v212-messages'?'-v212-messages':''),snapshot=JSON.stringify(payload.state||{});
    let key=base;if(payload.quarantine){key=base+'-repair-'+Date.now();let i=0;while(localStorage.getItem(key)!==null)key=base+'-repair-'+Date.now()+'-'+(++i);}
    if(localStorage.getItem(key)===null)localStorage.setItem(key,snapshot);
    return Promise.resolve({ok:true});
   }catch(error){return Promise.resolve({error:String(error)});}
  }
  if(action==='persist'&&document.querySelector('#staffSupport')){
   try{
    const raw=localStorage.getItem('nerv-command-v2');
    if(raw){let value=null;try{value=JSON.parse(raw);}catch(error){}if(value&&typeof value==='object'&&!Array.isArray(value))localStorage.setItem('nerv-command-v2-last-good',raw);}
   }catch(error){return Promise.resolve({error:'正常保存の控えを作成できません：'+error.message});}
  }
 }
 return worldPreviousNative(action,payload);
};
function persist(){clearTimeout(saveTimeout);saveTimeout=setTimeout(()=>{const data=JSON.parse(JSON.stringify(S));callNative('persist',{state:data}).then(r=>{if(r?.error)toast('保存できませんでした: '+r.error);});},180);}
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.remove('hidden');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.add('hidden'),3800);}
function hhmmss(ts=Date.now()){return new Date(ts).toLocaleTimeString('ja-JP',{hour12:false});}
function addLog(type,text){const list=S.logs[type]||(S.logs[type]=[]);list.unshift({time:hhmmss(),text});if(list.length>35)list.length=35;persist();}
function renderLogs(type){const e=$(type+'Log');if(!e)return;e.replaceChildren();(S.logs[type]||[]).slice(0,9).forEach(x=>{const div=document.createElement('div');div.className='log-entry';const t=document.createElement('time');t.textContent='['+x.time+']';div.append(t,document.createTextNode(x.text));e.appendChild(div)});if(!e.children.length)e.textContent='// NO RECORDS / STANDBY';}
// Procedural electronic cues; no downloaded recordings or voice assets.
let soundBus=null, soundLimiter=null;
let soundRequestSerial=0;
const soundVoices=new Set(), soundLastAt={};
const soundScore={
 tap:[[840,0,.045,'sine',.2,680],[1260,.04,.035,'sine',.13,1260]],
 select:[[360,0,.1,'triangle',.3,540],[720,.065,.14,'sine',.2,1080],[1440,.14,.08,'sine',.1,1200]],
 ok:[[520,0,.12,'sine',.32,520],[780,.09,.15,'sine',.26,780],[1040,.18,.28,'triangle',.2,1040]],
 warning:[[220,0,.22,'square',.16,180],[440,0,.22,'sine',.3,360],[220,.32,.26,'square',.16,180],[440,.32,.26,'sine',.3,360]],
 alarm:[[740,0,.36,'sawtooth',.13,480],[148,.02,.38,'sine',.38,110],[740,.46,.38,'sawtooth',.13,480],[148,.48,.4,'sine',.38,110],[980,.85,.17,'triangle',.18,660]],
 launch:[[70,0,.58,'sine',.36,240],[140,.12,.5,'sawtooth',.12,560],[440,.48,.2,'triangle',.22,880],[1320,.66,.22,'sine',.13,1760]],
 scan:[[1500,0,.085,'sine',.17,850],[1900,.11,.085,'sine',.16,1050],[2300,.22,.12,'triangle',.15,1400]],
 deny:[[260,0,.16,'triangle',.35,180],[195,.2,.22,'triangle',.32,120]],
 done:[[440,0,.38,'sine',.22,440],[554,.08,.4,'sine',.18,554],[660,.16,.44,'sine',.18,660],[880,.28,.5,'triangle',.16,880]]
};
function soundLevel(){return Math.max(0,Math.min(100,Number(S.prefs.soundVolume??55)||0))/100*.22;}
function prepareSound(){
 const Context=window.AudioContext||window.webkitAudioContext;
 if(!Context)return false;
 if(!audio){audio=new Context();soundBus=audio.createGain();soundLimiter=audio.createDynamicsCompressor();
  soundLimiter.threshold.value=-18;soundLimiter.knee.value=18;soundLimiter.ratio.value=8;
  soundBus.connect(soundLimiter);soundLimiter.connect(audio.destination);}
 soundBus.gain.setTargetAtTime(soundLevel(),audio.currentTime,.025);
 if(audio.state==='suspended'){const resumed=audio.resume();if(resumed?.catch)resumed.catch(()=>{});}
 return true;
}
function stopSound(){
 for(const voice of soundVoices){try{voice.stop();}catch(e){}}
 soundVoices.clear();
}
function sound(kind='tap'){
 soundRequestSerial++;
 if(!S.prefs.sound||document.hidden)return;
 const now=Date.now(),gap=kind==='alarm'?1400:kind==='warning'?300:55;
 if(soundLastAt[kind]!=null&&now-soundLastAt[kind]<gap)return;
 try{
  if(!prepareSound())return;
  soundLastAt[kind]=now;
  const start=audio.currentTime;
  for(const [frequency,offset,duration,wave,gain,end] of soundScore[kind]||soundScore.tap){
   if(soundVoices.size>=24)break;
   const oscillator=audio.createOscillator(),envelope=audio.createGain(),at=start+offset;
   oscillator.type=wave;oscillator.frequency.setValueAtTime(frequency,at);
   oscillator.frequency.exponentialRampToValueAtTime(end,at+duration);
   envelope.gain.setValueAtTime(.0001,at);envelope.gain.exponentialRampToValueAtTime(gain,at+.012);
   envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);
   oscillator.connect(envelope);envelope.connect(soundBus);soundVoices.add(oscillator);
   oscillator.onended=()=>{soundVoices.delete(oscillator);oscillator.disconnect();envelope.disconnect();};
   oscillator.start(at);oscillator.stop(at+duration+.025);
  }
 }catch(e){console.warn('audio',e)}
}
// Wait until handlers and a form's default submit action have completed. Preserve
// their dedicated cue, and fill only controls which never requested a sound.
const controlSoundStarts=new WeakMap();
document.addEventListener('click',event=>controlSoundStarts.set(event,soundRequestSerial),true);
document.addEventListener('click',event=>{
 const button=event.target.closest?.('button,[role="button"],input[type="checkbox"]');
 const before=controlSoundStarts.get(event);
 if(!button||button.disabled||button.hasAttribute('data-own-sound')||before!==soundRequestSerial)return;
 setTimeout(()=>{if(soundRequestSerial===before)sound('tap');},0);
});
function go(page){settleEvaPower();if(!qs('.page[data-page="'+page+'"]'))return;currentPage=page;all('.page').forEach(el=>el.classList.toggle('active',el.dataset.page===page));all('[data-nav]').forEach(el=>el.classList.toggle('active',el.dataset.nav===page));$('topMode').textContent=page==='weather'||page==='tools'?'● REAL DATA':'● '+(page==='home'?'ACTIVE':'SIMULATION');$('topMode').style.color=page==='weather'||page==='tools'?'#8cdfa4':'#f9ad54';window.scrollTo({top:0,behavior:'instant'});draw();if(page==='infra')setTimeout(ensureMap,100);if(page==='weather')setTimeout(meteoEnter,80);else if(meteoRadarPlaying)meteoRadarPlayToggle();renderTacticalAlert();sound('tap');}
function openApp(skip){$('boot').classList.add('hidden');$('shell').classList.remove('hidden');if(skip){S.prefs.showBoot=false;persist();}draw();if(S.prefs.autoWeather && !window.__weatherTriggered){window.__weatherTriggered=true;setTimeout(loadWeather,500);}}
$('bootEnter').addEventListener('click',()=>{openApp(false);sound('ok')});$('bootSkip').addEventListener('click',()=>{openApp(true);toast('次回から起動演出を省略します')});
$('bootBar').style.width='100%';$('bootText').textContent='SYSTEM READY // AWAITING AUTHORIZATION';

all('[data-open]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.open)));
all('[data-nav]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.nav)));
$('quickSettings').addEventListener('click',()=>go('settings'));$('goHome').addEventListener('click',()=>go('home'));$('goHome').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go('home')}});
function fmtWx(code){if(code==null)return['--','◌'];if(code===0)return['快晴','☀'];if(code<4)return['晴れ・曇り','◕'];if(code===45||code===48)return['霧','≋'];if(code<60)return['霧雨','☂'];if(code<70)return['雨','☂'];if(code<80)return['雪','❄'];if(code<83)return['にわか雨','☁'];if(code<87)return['にわか雪','❄'];if(code<=99)return['雷雨','ϟ'];return['不明','◌'];}
function weatherUrl(lat,lon){return 'https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(lat)+'&longitude='+encodeURIComponent(lon)+'&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code&forecast_days=2&timezone=auto';}
function browserWeather(){return new Promise(resolve=>{if(!navigator.geolocation)return resolve({error:'このブラウザでは位置情報を利用できません'});navigator.geolocation.getCurrentPosition(async p=>{try{const lat=p.coords.latitude,lon=p.coords.longitude;const resp=await fetch(weatherUrl(lat,lon));if(!resp.ok)throw Error('HTTP '+resp.status);const raw=await resp.json();resolve({weather:raw,place:'現在地',position:{lat,lon},updated:Date.now()});}catch(e){resolve({error:'通信エラー: '+e.message});}},e=>resolve({error:'位置情報エラー: '+e.message}),{timeout:12000,enableHighAccuracy:false,maximumAge:300000});});}
function applyWeather(result){if(!result?.weather?.current||!result.weather.hourly){toast('気象データが不正です');return false;}S.weather={raw:result.weather,place:result.place||'現在地',updated:result.updated||Date.now(),position:result.position||null};persist();renderWeather();renderHome();if(typeof meteoMapMode!=='undefined'&&meteoMapMode==='me'&&weatherPosition())meteoSetRegion('me');meteoUpdateRegions(true);return true;}
async function loadWeather(){if(busyWeather)return;busyWeather=true;$('weatherFetch').disabled=true;$('weatherFetch').textContent='◎ 現在地と気象データを取得中';$('weatherStatus').textContent='位置情報を取得し、気象サービスに照会しています…';sound('scan');try{const r=await callNative('weather');if(r?.error){$('weatherStatus').textContent=r.error+'。最後の取得値がある場合は保存値として表示します。';toast('天候の更新に失敗: '+r.error);sound('deny');}else if(applyWeather(r)){$('weatherStatus').textContent='気象データを更新しました。';toast('現在地の気象情報を更新');sound('ok');}}catch(e){$('weatherStatus').textContent='通信に失敗: '+e.message;}finally{busyWeather=false;$('weatherFetch').disabled=false;$('weatherFetch').textContent='◎ 現在地の天気を取得・更新';renderWeather();if(currentPage==='weather')meteoLoadRadar(true);}}
$('weatherFetch').addEventListener('click',loadWeather);
function weatherCurrent(){return S.weather?.raw?.current||null;}
function renderWeather(){const c=weatherCurrent(),w=S.weather;
 if(!c){meteoText('wxLocation','現在地未取得');meteoText('wxFresh','未取得');meteoText('wxTemp','--');meteoText('wxGlyph','◌');meteoText('wxDescription','気象データ未取得');['wxFeels','wxHumidity','wxWind','wxPressure'].forEach(id=>meteoText(id,'--'));$('forecast').innerHTML='<div class="meteo-empty">気象データを取得してください</div>';meteoRenderCurrent();return;}
 const [desc,glyph]=fmtWx(c.weather_code);meteoText('wxLocation',w.place||'現在地');meteoText('wxGlyph',glyph);meteoText('wxTemp',Number.isFinite(c.temperature_2m)?Math.round(c.temperature_2m):'--');meteoText('wxDescription',desc);
 meteoText('wxFeels',meteoNum(c.apparent_temperature,'°C',1));meteoText('wxHumidity',meteoNum(c.relative_humidity_2m,'%',0));meteoText('wxWind',meteoNum(c.wind_speed_10m,'km/h',1));meteoText('wxPressure',meteoNum(c.pressure_msl,'hPa',0));
 const minutes=Math.max(0,Math.floor((Date.now()-w.updated)/60000)),fresh=minutes<=30;meteoText('wxFresh',fresh?'取得 '+new Date(w.updated).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}):'保存値 '+minutes+'分前');$('wxFresh').style.color=fresh?'#83e3b2':'#ffbb73';
 const forecast=$('forecast');forecast.replaceChildren();const h=w.raw.hourly||{},times=h.time||[];const currentHour=(c.time||'').slice(0,13);let index=times.findIndex(t=>t.slice(0,13)>=currentHour);if(index<0)index=0;
 times.slice(index,index+6).forEach((time,i)=>{const k=index+i,el=document.createElement('div');el.className='forecast-cell';const hour=document.createElement('time');hour.textContent=time.slice(11,16);const icon=document.createElement('span');icon.className='f-icon';icon.textContent=fmtWx(h.weather_code?.[k])[1];const tmp=document.createElement('b');tmp.textContent=Number.isFinite(h.temperature_2m?.[k])?Math.round(h.temperature_2m[k])+'°':'--';const rain=document.createElement('small');const p=h.precipitation_probability?.[k];rain.textContent=p==null?'--%':p+'%';const bar=document.createElement('span');bar.className='precip-track';const fill=document.createElement('i');fill.style.width=Math.min(100,Math.max(0,Number(p)||0))+'%';bar.append(fill);el.append(hour,icon,tmp,bar,rain);forecast.append(el);});meteoRenderCurrent();}

let weatherEntryAttempted=false;
function weatherPosition(){const lat=S.weather?.position?.lat??S.weather?.raw?.latitude, lng=S.weather?.position?.lon??S.weather?.raw?.longitude;return Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180?{lat,lng}:null;}
function weatherOnEntry(){if(weatherEntryAttempted)return;weatherEntryAttempted=true;if(busyWeather)return;loadWeather();}
function renderBattery(){const meter=$('deviceBatteryMeter'),known=Number.isFinite(battery);if(meter){meter.dataset.known=String(known);if(known)meter.setAttribute('aria-valuenow',String(Math.max(0,Math.min(100,battery))));else meter.removeAttribute?.('aria-valuenow');}meteoText('homeBattery',known?Math.round(Math.max(0,Math.min(100,battery)))+'%':'--%');meteoText('batterySub',known?(charging?'充電中':'バッテリー残量'):'取得できません');if($('batteryFill'))$('batteryFill').style.width=known?Math.max(0,Math.min(100,battery))+'%':'0%';}
function renderHome(){renderBattery();renderLauncher();}
function renderInfra(){const a=S.infra,ready=40+ (a.power?25:0)+(a.comms?20:0)+(a.armor?15:0);$('cityReady').textContent=ready+'%';$('cityPower').textContent=a.power?'ON':'OFF';$('cityArmor').textContent=a.armor?'CLOSED':'OPEN';$('powerState').textContent=a.power?'主電源供給中':'主電源停止';$('armorState').textContent=a.armor?'装甲閉鎖済':'装甲開放中';$('commsState').textContent=a.comms?'通信回線正常':'通信回線断';$('infraAlert').textContent=a.power&&a.comms?'NOMINAL':'ALERT';$('infraAlert').style.color=a.power&&a.comms?'#88dcaa':'#ff5353';renderLogs('infra');}
function invalidateApproval(){if(S.magi.approvedFor!==null){addLog('magi','インフラ状態変更：既存の出撃承認を失効');}S.magi.approvedFor=null;S.magi.vote=null;S.magi.interceptApproval=null;if(S.defense){S.defense.magivote=null;S.defense.magiround=-1;}}
['power','armor','comms'].forEach(key=>{$(key+'Toggle').addEventListener('click',()=>{settleEvaPower();S.infra[key]=!S.infra[key];if(key==='power')S.evas.forEach(e=>{if(e.state==='DEPLOYED')e.powerUpdatedAt=Date.now();});invalidateApproval();addLog('infra',key.toUpperCase()+' / '+(S.infra[key]?'ONLINE':'OFFLINE'));renderInfra();renderEVA();renderMAGI();renderHome();renderTacticalAlert();sound(S.infra[key]?'ok':'warning');toast(key.toUpperCase()+' を '+(S.infra[key]?'有効':'無効')+' に変更');});});
$('infraDiag').addEventListener('click',()=>{const bad=Object.entries(S.infra).filter(([,v])=>!v).map(([k])=>k.toUpperCase());addLog('infra','自動診断 / '+(bad.length?'要確認 '+bad.join(', '):'3系統異常なし'));renderInfra();sound(bad.length?'warning':'scan');toast(bad.length?'診断結果：'+bad.join(' / ')+' に注意':'都市インフラ3系統の診断完了');});
const stateJP={HANGAR:'格納中',READY:'発進準備完了',DEPLOYED:'出撃中',MAINTENANCE:'整備中',POWER_LOST:'電源喪失'};
function selected(){return S.evas[S.selectedEva];}
const EVA_STATES=['HANGAR','READY','DEPLOYED','POWER_LOST','MAINTENANCE'];
let lastPowerSave=Date.now();
// Migration does NOT debit undocumented time from pre-v2.2 saves.
function migrateEvaClocks(now=Date.now()){
 S.evas.forEach(e=>{
  if(!Number.isFinite(e.power))e.power=300;
  e.power=Math.max(0,Math.min(300,Math.floor(e.power)));
  if(!EVA_STATES.includes(e.state))e.state='HANGAR';
  if(e.state==='DEPLOYED'){
   if(!Number.isFinite(e.powerUpdatedAt)||e.powerUpdatedAt<=0)e.powerUpdatedAt=now;
  }else{e.powerUpdatedAt=null; if(e.state==='POWER_LOST'){e.power=0;e.at=false;}}
 });
}
function settleEvaPower(now=Date.now()){
 let dirty=false,emergency=false;
 S.evas.forEach((e,i)=>{
  if(e.state!=='DEPLOYED')return;
  if(evaExternalPower(i)){e.powerUpdatedAt=now;return;}
  let anchor=e.powerUpdatedAt;
  if(!Number.isFinite(anchor)||anchor<=0||anchor>now){e.powerUpdatedAt=now;return;}
  const seconds=Math.floor((now-anchor)/1000);
  if(seconds<1)return;
  const old=e.power;
  e.power=Math.max(0,old-seconds*(e.at?2:1));
  e.powerUpdatedAt=anchor+seconds*1000;
  if(e.power!==old)dirty=true;
  if(e.power===0){e.state='POWER_LOST';e.at=false;e.powerUpdatedAt=null;
   S.magi.approvedFor=S.magi.approvedFor===i?null:S.magi.approvedFor;
   addLog('eva','UNIT-0'+i+' / EMERGENCY INTERNAL POWER LOST');emergency=true;
  }
 });
 if(emergency){sound('warning');persist();}
 else if(dirty&&now-lastPowerSave>=15000){lastPowerSave=now;persist();}
 return dirty;
}
migrateEvaClocks();settleEvaPower();
const EVA_NAMES=['PROTOTYPE','TEST TYPE','PRODUCTION'];
const EVA_STEPS={HANGAR:'01 / PREPARE',READY:'02 / MAGI AUTHORIZE',DEPLOYED:'03 / ACTIVE CONTROL',POWER_LOST:'04 / RECOVER',MAINTENANCE:'05 / MAINTAIN'};
function rejectEva(why){toast(why);sound('deny');renderEVA();}
function renderEVA(){
 const idx=S.selectedEva,e=selected(),isSortie=e.state==='DEPLOYED',approved=S.magi.approvedFor===idx&&e.state==='READY';
 all('[data-eva]').forEach(b=>{const active=Number(b.dataset.eva)===idx;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 const shell=qs('.eva-display'),figure=$('evaArtwork');shell.dataset.unit=String(idx);shell.dataset.state=e.state;figure.dataset.unit=String(idx);if(qs('.eva-redrawn'))qs('.eva-redrawn').dataset.unit=String(idx);figure.dataset.state=e.state;
 figure.classList.toggle('at-on',isSortie&&e.at);
 $('evaSvg').setAttribute('aria-label','EVANGELION UNIT-0'+idx+' / '+EVA_NAMES[idx]+' / '+e.state+' / 生体機体全身スキャン');
 $('evaUnitLabel').textContent='EVANGELION UNIT-0'+idx;
 $('evaUnitDesignation').textContent=EVA_NAMES[idx]+' / UNIT-0'+idx;
 $('evaPaintMode').textContent=['AZURE / PROTOTYPE','VIOLET / TEST TYPE','SCARLET / PRODUCTION'][idx];
 $('evaTargetLock').textContent=e.state==='DEPLOYED'?'TRACKING / ACTIVE':'RESERVE / SECURE';
 $('evaNumSync').textContent=Number(e.sync).toFixed(1)+'%';$('evaNumMode').textContent=e.state==='DEPLOYED'?'ARMED / FIELD READY':'BIO-SCAN / STANDBY';
 $('evaFigureStamp').textContent='UNIT-0'+idx+' / BIO-MONITOR';
 $('evaStatusTag').textContent=e.state==='POWER_LOST'?'⚠ POWER LOST':e.state;
 $('evaActiveMode').textContent=e.state==='HANGAR'?'RESTRAINT ACTIVE':e.state==='READY'?'LAUNCH STANDBY':e.state==='DEPLOYED'?'OPERATION ACTIVE':e.state==='POWER_LOST'?'RECOVERY REQUIRED':'MAINTENANCE';
 $('evaScanMode').textContent=e.state==='DEPLOYED'?'SCAN / REALTIME':e.state==='POWER_LOST'?'SCAN / CRITICAL':'SCAN / STANDBY';
 $('evaSync').textContent=e.sync.toFixed(1)+'%';$('evaSyncBar').style.width=Math.max(0,Math.min(100,e.sync))+'%';
 const p=Math.max(0,Math.ceil(e.power));$('evaBattery').textContent=String(Math.floor(p/60)).padStart(2,'0')+':'+String(p%60).padStart(2,'0');$('evaBatteryBar').style.width=p/3+'%';
 $('evaAT').textContent=e.at?'ACTIVE':'STANDBY';$('evaATBar').style.width=e.at?'100%':'5%';
 let magiText='NOT REQUESTED';
 if(approved)magiText='● APPROVED / UNIT-0'+idx;
 else if(S.magi.vote?.eva===idx)magiText=S.magi.vote.approved?'EXPIRED / RECHECK':'DENIED / RECHECK';
 else if(S.magi.approvedFor!==null)magiText='OTHER UNIT APPROVED';
 $('evaMagiState').textContent=magiText;$('evaMagiState').style.color=approved?'#89efa9':'#e8b273';
 $('evaRestraint').textContent=e.state==='HANGAR'||e.state==='MAINTENANCE'?'LOCKED':e.state==='READY'?'RELEASE READY':'RELEASED';
 $('evaUmbDisplay').textContent=isSortie||e.state==='POWER_LOST'?'UMBILICAL / DISCONNECTED':'UMBILICAL / CONNECTED';
 $('evaGrid').textContent=S.infra.power?'ONLINE':'OFFLINE';$('evaGrid').classList.toggle('offline',!S.infra.power);
 $('evaComms').textContent=S.infra.comms?'CONNECTED':'OFFLINE';$('evaComms').classList.toggle('offline',!S.infra.comms);
 $('evaArmor').textContent=S.infra.armor?'DEPLOYED':'STANDBY';
 $('evaPrepare').disabled=e.state!=='HANGAR'||!S.infra.power;
 $('evaLaunch').disabled=e.state!=='READY'||!approved||!S.infra.power||!S.infra.comms;
 $('evaReturn').disabled=!['DEPLOYED','POWER_LOST'].includes(e.state);
 $('evaATButton').disabled=!isSortie||(!e.at&&e.power<10);
 $('evaATButton').innerHTML=(e.at?'⬡ A.T.解除':'⬡ A.T.展開')+'<span>FIELD CONTROL</span>';
 $('evaMaintain').disabled=e.state!=='MAINTENANCE';
 $('evaMagiButton').disabled=e.state!=='READY';
 $('evaNextAction').textContent=EVA_STEPS[e.state]||'STANDBY';
 const notes={HANGAR:S.infra.power?'発進準備 → MAGI審議 → 出撃。':'主電源OFF。都市インフラで復旧してください。',
 READY:approved?'MAGI承認済み。出撃命令を実行できます。':'発進準備完了。MAGI審議で対象ユニットの承認を取得してください。',
 DEPLOYED:evaExternalPower(idx)?'外部給電中。内部電源を温存しています。機体点検・給電でケーブルを操作できます。':'内部電源で稼働中。'+(e.at?'2秒/秒（A.T.展開中）':'1秒/秒')+'で消費。機体点検・給電で外部給電へ切り替えられます。',
 POWER_LOST:'⚠ 内部電源が枯渇。帰投／回収を指示してください。',MAINTENANCE:'機体回収済み。整備完了で格納状態に復帰し電源を復旧。'};
 $('evaGuidance').textContent=notes[e.state];
 renderLogs('eva');
}
all('[data-eva]').forEach(el=>el.addEventListener('click',()=>{settleEvaPower();S.selectedEva=Number(el.dataset.eva);persist();renderEVA();flashUnitSwitch();sound('select');}));
$('evaPrepare').addEventListener('click',()=>{
 settleEvaPower();const e=selected(),unit=S.selectedEva;
 if(e.state!=='HANGAR')return rejectEva('発進準備は格納中のみ実行できます');
 if(!S.infra.power)return rejectEva('主電源の復旧が必要');
 playSequence('prepare','発進準備シーケンス','EVANGELION UNIT-0'+unit,
  ['格納ケージ接続 / CAGE UPLINK','パイロット信号 / LINK VERIFIED','LCL循環・拘束制御 / CHECK','機体制御権 / READY'],()=>{
   e.state='READY';e.powerUpdatedAt=null;invalidateApproval();addLog('eva','UNIT-0'+unit+' / LAUNCH PREPARED');sound('ok');draw();toast('UNIT-0'+unit+' 発進準備完了');});
});
$('evaLaunch').addEventListener('click',()=>{
 settleEvaPower();const e=selected(),unit=S.selectedEva;
 if(e.state!=='READY')return rejectEva('発進準備を完了してください');
 if(S.magi.approvedFor!==unit){rejectEva('MAGIの対象機体への出撃承認がありません');go('magi');return;}
 if(!S.infra.power||!S.infra.comms)return rejectEva('電力・通信系統を復旧してください');
 playSequence('launch','EVA射出管制','UNIT-0'+unit+' / EJECTION PROTOCOL',
  ['MAGI承認照合 / VERIFIED','アンビリカル・電源経路切替','拘束装置解除 / CAGE RELEASE','射出台上昇 / LAUNCH CONFIRMED'],()=>{
   e.state='DEPLOYED';e.umbilical=false;if(unit===S.tactics?.attacker&&S.defense)S.defense.connected=false;e.power=300;e.powerUpdatedAt=Date.now();e.at=false;S.magi.approvedFor=null;S.magi.vote=null;
   addLog('eva','UNIT-0'+unit+' / LAUNCHED / INTERNAL POWER 05:00');sound('launch');toast('UNIT-0'+unit+' 出撃');draw();});
});
$('evaATButton').addEventListener('click',()=>{
 settleEvaPower();const e=selected();if(e.state!=='DEPLOYED')return rejectEva('A.T.操作は出撃中のみ可能です');
 if(!e.at&&e.power<10)return rejectEva('内部電源不足。A.T.展開には10秒以上必要');
 e.at=!e.at;addLog('eva','UNIT-0'+S.selectedEva+' / A.T.FIELD '+(e.at?'DEPLOYED':'RELEASED'));sound(e.at?'launch':'tap');draw();
});
$('evaReturn').addEventListener('click',()=>{
 settleEvaPower();const e=selected(),unit=S.selectedEva;
 if(!['DEPLOYED','POWER_LOST'].includes(e.state))return rejectEva('帰投／回収は出撃中か電源喪失時のみ');
 playSequence('recovery','機体回収シーケンス','UNIT-0'+unit+' / RECOVERY',
  ['外部管制モードへ切替','格納ケージ / 回収ルート確保','機体拘束・A.T.FIELD停止','CAGE DOCKED / MAINTENANCE'],()=>{
   e.state='MAINTENANCE';e.at=false;e.powerUpdatedAt=null;
   addLog('eva','UNIT-0'+unit+' / RETURNED / MAINTENANCE REQUIRED');sound('ok');draw();toast('UNIT-0'+unit+' 回収完了');});
});
$('evaMaintain').addEventListener('click',()=>{
 const e=selected();if(e.state!=='MAINTENANCE')return rejectEva('整備完了操作は整備中のみ可能です');
 e.state='HANGAR';e.power=300;e.powerUpdatedAt=null;e.at=false;addLog('eva','UNIT-0'+S.selectedEva+' / MAINTENANCE COMPLETED');sound('ok');draw();
});
function voteInfo(){const e=selected(),i=S.infra;return [
 {name:'BALTHASAR',yes:i.power&&e.state==='READY',reason:e.state==='READY'?'機体の発進準備完了':'EVA管理で発進準備が必要'},
 {name:'CASPER',yes:i.armor&&i.comms,reason:i.armor&&i.comms?'都市防護・通信を確保':'都市装甲または通信の確認が必要'},
 {name:'MELCHIOR',yes:i.power&&e.power>=240,reason:i.power&&e.power>=240?'主電源・機体電力が正常':'主電源または機体電力が不足'}];}
function staffInterceptVotes(){const t=S.tactics,d=S.defense;return [
 {name:'BALTHASAR',yes:S.evas[t.attacker].state==='DEPLOYED'&&S.evas[t.attacker].power>=60,reason:S.evas[t.attacker].state!=='DEPLOYED'?'攻撃担当機の出撃が必要':S.evas[t.attacker].power>=60?'出撃済み・機体電力に余裕あり':'機体電力が60秒未満 / 安全余力が不足'},
 {name:'CASPER',yes:!!(S.infra.comms&&d?.status==='active'&&d.scans>=34),reason:S.infra.comms&&d?.status==='active'&&d.scans>=34?'目標・通信を確認':'目標検知・解析・通信の確認が必要'},
 {name:'MELCHIOR',yes:!!(S.infra.power&&t.charge>=70&&t.heat<80&&S.ops?.currentMissionLocks>0),reason:S.infra.power&&t.charge>=70&&t.heat<80&&S.ops?.currentMissionLocks>0?'迎撃電力・照準・熱負荷が正常':'迎撃電力70%以上・照準確定・冷却が必要'}];}
function staffInterceptApproved(){if(magiIntrusionActive())return false;const a=S.magi.interceptApproval,d=S.defense,t=S.tactics;if(!d||!t)return false;return !!(a?.approved&&a.caseNo===d?.caseNo&&a.round===d.round&&a.attacker===t.attacker&&S.magi.approvedFor===t.attacker&&d.magivote?.filter(Boolean).length>=2&&d.magiround===d.round&&S.infra.power&&S.infra.comms&&d.status==='active'&&d.scans>=34&&S.evas[t.attacker].state==='DEPLOYED'&&t.charge>=70&&t.heat<80&&S.ops?.currentMissionLocks>0);}
function renderMAGI(){
 const purpose=S.magi.purpose||'sortie',intercept=purpose==='intercept';
 const v=S.magi.vote,valid=v&&v.eva===S.selectedEva&&(v.purpose||'sortie')===purpose;
 const codes={BALTHASAR:'B',CASPER:'C',MELCHIOR:'M'};
 for(const name of Object.keys(codes)){const vote=valid?v.votes.find(x=>x.name===name):null;meteoText('m'+codes[name]+'Status',vote?(vote.yes?'賛成':'否決'):'待機');meteoText('m'+codes[name]+'Sub',vote?vote.reason:({BALTHASAR:'機体・人員の安全を評価',CASPER:'作戦の成立条件を評価',MELCHIOR:'技術条件を評価'}[name]));const cell=$('m'+codes[name]+'Status')?.parentElement;if(cell)cell.dataset.vote=vote?(vote.yes?'approved':'denied'):'pending';}
 const expired=valid&&v.approved&&intercept&&!staffInterceptApproved();
 meteoText('magiLiveState',expired?'承認失効 / 再審議':valid?(v.approved?'承認':'否決'):'審議待ち');
 if($('magiDecision'))$('magiDecision').dataset.decision=expired?'expired':valid?(v.approved?'approved':'denied'):'pending';
 meteoText('magiDecision',valid?(expired?'承認失効 / 再審議':v.approved?'承認':'否決')+' / '+v.count+'対'+(3-v.count)+'\n'+(intercept?'迎撃実行':'UNIT-0'+v.eva+' 出撃')+'\n'+(v.blockers?.length?'未達条件：'+v.blockers.join(' / '):'必要な運用条件を確認しました。'):'審議内容と対象を選び、「決議を実行」を押してください。');
 const reasonList=$('magiReasons');if(reasonList){reasonList.replaceChildren();if(valid)for(const vote of v.votes){const li=document.createElement('li');li.textContent=vote.name+'：'+vote.reason;reasonList.append(li);}}
 const purposeEl=$('magiPurpose');if(purposeEl)purposeEl.value=purpose;
 const unitEl=$('magiUnit');if(unitEl){unitEl.value=String(intercept?(S.tactics?.attacker??1):S.selectedEva);unitEl.disabled=intercept;}
 meteoText('magiRequestHint',intercept?'戦術指揮で電力・出撃・照準を準備してから迎撃実行を審議します。対象は攻撃担当機です。':'EVA管理で対象機を発進準備 → ここで決議 → EVA管理で出撃、の順に操作します。');
 meteoText('magiReturn',intercept?'戦術指揮へ戻る ↗':'EVA運用へ戻る ↗');renderLogs('magi');
}
$('magiVote').addEventListener('click',()=>{
 if(magiIntrusionActive()){toast('MAGI侵食中 / 侵入対処で復旧してください。通常の承認は停止中です。');return;}
 settleEvaPower();const purpose=S.magi.purpose||'sortie';if(purpose==='intercept')S.selectedEva=S.tactics.attacker;
 const unit=S.selectedEva,votes=purpose==='intercept'?staffInterceptVotes():voteInfo(),count=votes.filter(v=>v.yes).length;
 const blockers=[];if(!S.infra.power)blockers.push('主電源の復旧');if(!S.infra.comms)blockers.push('通信の復旧');
 if(purpose==='sortie'&&selected().state!=='READY')blockers.push('対象機の発進準備');
 if(purpose==='intercept'){
  if(S.evas[S.tactics.attacker].state!=='DEPLOYED')blockers.push('攻撃担当機の出撃');
  if(S.defense?.status!=='active'||S.defense.scans<34)blockers.push('迎撃対象の検知・解析');
  if(S.tactics.charge<70||S.tactics.heat>=80||!(S.ops.currentMissionLocks>0))blockers.push('迎撃電力70%以上・照準確定・冷却');
  if(![4,5].includes(S.mission.phase))blockers.push('戦術指揮で迎撃準備を進めてください');
 }
 const approved=count>=2&&blockers.length===0;
 playSequence('magi','MAGIシステム',purpose==='intercept'?'迎撃実行承認':'UNIT-0'+unit+' / 出撃承認',
 ['MELCHIOR-1 / 技術評価','BALTHASAR-2 / 安全評価','CASPER-3 / 作戦評価','CONSENSUS / 決議確定'],()=>{
  S.magi.vote={votes,count,approved,eva:unit,purpose,blockers,time:Date.now()};S.magi.approvedFor=approved?unit:null;
  if(purpose==='intercept'){
   S.magi.interceptApproval={approved,attacker:unit,caseNo:S.defense.caseNo,round:S.defense.round};
   S.defense.magivote=votes.map(v=>v.yes);S.defense.magiround=S.defense.round;
  }
  addLog('magi',(purpose==='intercept'?'迎撃実行':'UNIT-0'+unit+' 出撃')+' / '+(approved?'承認':'否決')+' / '+count+'対'+(3-count));
  sound(approved?'ok':'deny');draw();
 },votes);
});
if(qs('#magiPurpose')){
 $('magiPurpose').addEventListener('change',e=>{S.magi.purpose=e.target.value;staffInvalidateDecision();if(e.target.value==='intercept')S.selectedEva=S.tactics.attacker;persist();draw();});
 $('magiUnit').addEventListener('change',e=>{S.selectedEva=Number(e.target.value);renderMAGI();persist();});
 $('magiReturn').addEventListener('click',()=>go(S.magi.purpose==='intercept'?'mission':'eva'));
}
const staffStageNames=['待機','都市防護','迎撃電力','EVA出撃','目標解析','迎撃判断','作戦完了'];
function renderMission(){
 if(!S.tactics||!S.ops||![0,1,2].includes(S.tactics.attacker))return;
 const p=S.mission.phase,d=S.defense,t=S.tactics,active=d?.status==='active';
 const checks=[['都市の主電源・通信・装甲',S.infra.power&&S.infra.comms&&S.infra.armor],['迎撃電力70%以上',t.charge>=70],['攻撃担当 UNIT-0'+t.attacker+' の出撃',S.evas[t.attacker].state==='DEPLOYED'],['対象の解析・照準確定',active&&d.scans>=34&&S.ops.currentMissionLocks>0],['今回の迎撃に対するMAGI承認',staffInterceptApproved()]];
 const explanations=['敵性反応の検知から迎撃まで、必要な指示を順番に出します。','都市装甲を展開し、防衛態勢へ移行します。','迎撃に必要な電力を集約します。','EVA管理で発進準備、MAGIの出撃承認、出撃を実行してください。','対象の波形を解析し、照準を確定します。','条件を確認してMAGIへ迎撃実行を申請します。承認後に迎撃できます。','迎撃結果は都市防衛と指揮記録に保存されています。終了すると正常待機へ戻ります。'];
 let action=['訓練を開始','都市防護を展開','迎撃電力を確保','EVA管理へ / 出撃を確認','目標を解析・照準確定','迎撃を実行','作戦完了'][p]||'状況を確認';
 if(p===3&&S.evas[t.attacker].state==='DEPLOYED')action='出撃を確認して次へ';
 if(p===5){if(!active)action='対象を再検知';else if(t.charge<70)action='迎撃電力を再確保';else if(!staffInterceptApproved())action='MAGIに迎撃承認を申請';}
 meteoText('missionStep',String(p).padStart(2,'0')+' / '+staffStageNames[p]);meteoText('missionDescription',explanations[p]);meteoText('missionReady',p===0?'正常待機':p===6?'迎撃終了':'作戦進行中');
 meteoText('staffTarget',active?d.enemy.code+' / 残存 '+d.enemy.hp:d?.status==='victory'?'目標沈黙':'未検知');meteoText('staffCity',d?Math.round(d.city.reduce((n,c)=>n+c.hp,0)/4)+'%':'--');
 meteoText('staffAttacker','UNIT-0'+t.attacker+' / '+stateJP[S.evas[t.attacker].state]);meteoText('staffCharge',t.charge+'%');
 meteoText('staffNextHint',p===5?checks.filter(x=>!x[1]).map(x=>'要確認：'+x[0]).join(' / ')||'すべての必須条件が成立。迎撃を実行できます。':explanations[p]);
 meteoText('missionAction',action);$('missionAction').disabled=p===6;
 const list=$('staffChecklist');if(list?.replaceChildren){list.replaceChildren();for(const [text,ok] of checks){const row=document.createElement('li');row.textContent=(ok?'確認済：':'未完了：')+text;row.dataset.complete=String(ok);list.append(row);}}
 if($('staffAttackUnit'))$('staffAttackUnit').value=String(t.attacker);renderLogs('mission');
}
$('missionAction').addEventListener('click',()=>{
 const p=S.mission.phase,t=S.tactics;
 if(!S.infra.power||!S.infra.comms){toast('主電源・通信の異常を復旧するか、警報確認からクリアしてください。');go('infra');return;}
 if(p===0){if(S.defense.status!=='active')v27Detect();S.mission.phase=1;S.ops.currentMissionLocks=0;S.ops.missionAwarded=false;staffInvalidateDecision();addLog('mission','都市防衛・迎撃訓練を開始');}
 else if(p===1){S.infra.armor=true;staffInvalidateDecision();S.mission.phase=2;addLog('mission','都市装甲を展開 / 防護態勢確保');}
 else if(p===2){t.charge=80;t.heat=0;staffInvalidateDecision();S.mission.phase=3;addLog('mission','迎撃電力を80%確保');}
 else if(p===3){if(S.evas[t.attacker].state!=='DEPLOYED'){S.selectedEva=t.attacker;S.magi.purpose='sortie';go('eva');return;}S.mission.phase=4;addLog('mission','UNIT-0'+t.attacker+' の出撃を確認');}
 else if(p===4){
  if(S.defense.status!=='active'){v27Detect();}
  const scans=Math.max(0,Math.ceil((68-S.defense.scans)/34));
  if(S.defense.energy<scans*12){toast('都市防衛の予備送電で解析用の電力を確保してください。');go('infra');return;}
  for(let i=0;i<scans;i++)v27Scan();S.ops.currentMissionLocks=1;S.ops.locks++;t.scans=Math.max(t.scans,2);S.mission.phase=5;staffInvalidateDecision();addLog('mission','対象の波形解析・照準を確定');
 }else if(p===5){
  if(S.defense.status!=='active'){v27Detect();staffInvalidateDecision();draw();return;}
  if(t.charge<70){t.charge=80;t.heat=Math.max(0,t.heat-20);staffInvalidateDecision();addLog('mission','迎撃電力を再確保 / MAGI再審議が必要');draw();return;}
  if(!staffInterceptApproved()){staffMagiRequest('intercept');return;}
  const before=S.defense.enemy.hp;v27Shot();
  if(S.defense.enemy.hp<before){t.shots++;staffInvalidateDecision();addLog('mission','迎撃実行 / 目標残存 '+S.defense.enemy.hp);}
  if(S.defense.status==='victory'){S.mission.phase=6;if(!S.ops.missionAwarded){S.ops.missions++;S.ops.missionAwarded=true;}addLog('mission','迎撃完了 / 作戦記録を保存');}
 }
 sound('ok');draw();
});
$('missionReset').addEventListener('click',()=>openAlertReview('end'));
function renderTasks(){const list=$('taskList');list.replaceChildren();S.tasks.forEach(t=>{const item=document.createElement('div');item.className='task-line'+(t.done?' complete':'');const ch=document.createElement('button');ch.className='task-check';ch.textContent=t.done?'✓':'□';ch.setAttribute('aria-label','タスク完了状態を切り替え');ch.addEventListener('click',()=>{t.done=!t.done;persist();renderTasks();renderHome();sound(t.done?'ok':'tap');});const title=document.createElement('span');title.className='task-title';title.textContent=t.text;const del=document.createElement('button');del.className='task-delete';del.textContent='×';del.setAttribute('aria-label','タスク削除');del.addEventListener('click',()=>{S.tasks=S.tasks.filter(x=>x.id!==t.id);persist();renderTasks();renderHome();sound('tap')});item.append(ch,title,del);list.append(item);});if(!S.tasks.length){list.innerHTML='<div class="empty">タスクはまだありません。追加すると端末に保存されます。</div>';}const n=S.tasks.filter(t=>!t.done).length;$('tasksSummary').textContent=n+' OPEN / '+(S.tasks.length-n)+' COMPLETED';}
$('taskForm').addEventListener('submit',e=>{e.preventDefault();const input=$('taskInput'),val=input.value.trim();if(!val){toast('タスク名を入力してください');return;}if(S.tasks.length>=80){toast('登録できるタスクは最大80件です');return;}S.tasks.unshift({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),text:val.slice(0,80),done:false});input.value='';persist();renderTasks();renderHome();sound('ok');});
function timerRender(){const m=Math.floor(Math.max(0,focus.remaining)/60),s=Math.max(0,focus.remaining)%60;$('timerTime').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');$('timerCircle').style.strokeDashoffset=427.256*(1-Math.max(0,focus.remaining)/focus.length);$('timerStart').textContent=focus.running?'Ⅱ 一時停止':focus.remaining===0?'▶ 再開':'▶ '+(focus.remaining===focus.length?'開始':'再開');}
all('[data-min]').forEach(btn=>btn.addEventListener('click',()=>{const min=Number(btn.dataset.min);focus={length:min*60,remaining:min*60,deadline:0,running:false};all('[data-min]').forEach(el=>el.classList.toggle('active',el===btn));timerRender();sound('tap');}));
$('timerStart').addEventListener('click',()=>{if(focus.running){focus.remaining=Math.max(0,Math.ceil((focus.deadline-Date.now())/1000));focus.running=false;}else{if(focus.remaining<=0)focus.remaining=focus.length;focus.deadline=Date.now()+focus.remaining*1000;focus.running=true;}timerRender();sound('tap');});
$('timerReset').addEventListener('click',()=>{focus.remaining=focus.length;focus.running=false;focus.deadline=0;timerRender();sound('tap');});
/* v2.4 METEO COMMAND / data is real or explicitly unavailable */
const meteoRegions=[['TOKYO','東京',35.6762,139.6503],['HAKONE','箱根',35.2329,139.1046],['YOKOHAMA','横浜',35.4437,139.638],['OSAKA','大阪',34.6937,135.5023]];
let meteoRegionValues=null,meteoRegionAt=0,meteoRegionPending=false;
let meteoMapCenter={lat:0,lng:0},meteoMapZoom=7,meteoMapMode='me',meteoMapLoaded=false;
let meteoRadarManifest=null,meteoRadarLastFetch=0,meteoRadarFrame=0,meteoRadarPlaying=false,meteoRadarInterval=null;
function meteoText(id,v){const e=$(id);if(e)e.textContent=v;}
function meteoNum(n,unit='',digits=0){return Number.isFinite(Number(n))&&n!==null&&n!==undefined?Number(n).toFixed(digits)+unit:'--';}
function meteoClockUpdate(){meteoText('meteoClock',new Date().toLocaleTimeString('ja-JP',{hour12:false}));}
function meteoDrawRisk(){
 const out=$('meteoRiskRows');out.replaceChildren();const c=weatherCurrent(),h=S.weather?.raw?.hourly;
 if(!c){out.innerHTML='<div class="meteo-empty">実気象データ未取得<br>公的警報の代替ではありません</div>';return;}
 const rain=Number(c.precipitation)||0,wind=(Number(c.wind_speed_10m)||0)/3.6;
 const ts=h?.time||[];const i=Math.max(0,ts.findIndex(t=>t>=(c.time||'').slice(0,13)));const prob=Math.max(0,...(h?.precipitation_probability||[]).slice(i,i+6).map(v=>Number(v)||0));
 const inputs=[['降水量','RAIN',rain,[[0.2,2.5,7.5,15]],'mm'],['降水確率','6H PROB.',prob,[[20,40,60,80]],'%'],['風速','WIND',wind,[[3,6,10,15]],'m/s'],['気温','TEMP',Number(c.temperature_2m)||0,[[28,31,35,38]],'°C']];
 inputs.forEach(([name,en,val,[thresholds],unit])=>{const level=thresholds.filter(t=>val>=t).length;const row=document.createElement('div');row.className='meteo-risk-row';const label=document.createElement('span');label.textContent=name;const small=document.createElement('small');small.textContent=en;label.appendChild(small);const leds=document.createElement('div');leds.className='meteo-level-leds';for(let k=0;k<4;k++){const led=document.createElement('i');if(k<level)led.className=level>=3?'hot':level>=2?'mid':'low';leds.append(led)}const value=document.createElement('strong');value.textContent=unit==='mm'?val.toFixed(1):String(Math.round(val));value.title=unit;row.append(label,leds,value);out.append(row)});
}
function meteoRenderAdvice(){const out=$('meteoAdvisories');out.replaceChildren();const c=weatherCurrent(),h=S.weather?.raw?.hourly;
 const entries=[];
 if(!c){entries.push(['現在地の天気を取得してください','Update local observation to enable the advisory panel.']);}
 else{
 const rain=Number(c.precipitation)||0,wind=Number(c.wind_speed_10m)||0,ts=h?.time||[];const idx=Math.max(0,ts.findIndex(t=>t>=(c.time||'').slice(0,13)));const maxProb=Math.max(0,...(h?.precipitation_probability||[]).slice(idx,idx+6).map(x=>Number(x)||0));
 if(rain>=7.5)entries.push(['現在地で強い雨が観測されています','Observed precipitation is elevated. Check official warnings.']);
 else if(rain>0)entries.push(['降雨を観測。周辺の状況に注意','Local precipitation detected.']);
 else entries.push(['現在の降水量は少ない状態です','Low measured precipitation at this location.']);
 if(maxProb>=60)entries.push(['今後6時間の降水確率が高め','Forecast suggests an increased chance of rain.']);
 if(wind>=36)entries.push(['風が強まっています。移動時に注意','High observed wind speed.']);
 entries.push(['公的な警報・避難情報を必ず確認','Consult JMA and local government for official alerts.']);
 }
 entries.push(['河川水位は未連携。公式情報で確認','River levels are not connected to this terminal.']);
 entries.slice(0,5).forEach(([j,en],i)=>{const r=document.createElement('div');r.className='meteo-advice';const n=document.createElement('span');n.textContent=String(i+1).padStart(2,'0');const d=document.createElement('div'),b=document.createElement('b'),s=document.createElement('small');b.textContent=j;s.textContent=en;d.append(b,s);r.append(n,d);out.append(r)});
}
function meteoRenderRegion(){const el=$('meteoRegionRows');if(!el)return;el.replaceChildren();if(!meteoRegionValues){el.innerHTML='<div class="meteo-empty">地域データ未取得 / ONLINE TO UPDATE</div>';return;}
 meteoRegions.forEach(([eng,jp],i)=>{const c=meteoRegionValues[i],row=document.createElement('div');row.className='meteo-region-row';const city=document.createElement('span'),b=document.createElement('b'),sm=document.createElement('small');b.textContent=jp;sm.textContent=eng;city.append(b,sm);const icon=document.createElement('span'),temp=document.createElement('span'),rain=document.createElement('span');icon.textContent=c?fmtWx(c.weather_code)[1]:'--';temp.textContent=c?meteoNum(c.temperature_2m,'°',0):'--';rain.textContent=c?meteoNum(c.precipitation,' mm',1):'--';row.append(city,icon,temp,rain);el.append(row)});
 meteoText('meteoRegionStatus',new Date(meteoRegionAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}));
}
async function meteoUpdateRegions(force=false){if(meteoRegionPending||(!force&&meteoRegionValues&&Date.now()-meteoRegionAt<600000))return;meteoRegionPending=true;meteoText('meteoRegionStatus','CONNECTING');
 try{const resp=await Promise.allSettled(meteoRegions.map(async r=>{const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),11000);try{const url='https://api.open-meteo.com/v1/forecast?latitude='+r[2]+'&longitude='+r[3]+'&current=temperature_2m,precipitation,weather_code&timezone=Asia%2FTokyo';const res=await fetch(url,{signal:ctrl.signal});if(!res.ok)throw Error('HTTP '+res.status);const v=await res.json();return v.current||null;}finally{clearTimeout(timer)}}));
 const values=resp.map(x=>x.status==='fulfilled'?x.value:null);if(!values.some(Boolean))throw Error('region offline');meteoRegionValues=values;meteoRegionAt=Date.now();meteoRenderRegion();}catch(e){meteoText('meteoRegionStatus','OFFLINE');}finally{meteoRegionPending=false;}
}
function meteoRenderCurrent(){const c=weatherCurrent();meteoText('meteoNet',c?'WEATHER ONLINE':'AWAITING DATA');meteoText('meteoRainNow',c?meteoNum(c.precipitation,' mm',1):'--');meteoDrawRisk();meteoRenderAdvice();meteoRenderRegion();}
// Coordinates / raster tiles. Tiles are drawn only from real map data and optional radar observations.
function meteoMercator(lat,lon,z){const scale=256*Math.pow(2,z);const safe=Math.max(-85.0511,Math.min(85.0511,lat));return {x:(lon+180)/360*scale,y:(1-Math.log(Math.tan(safe*Math.PI/180)+1/Math.cos(safe*Math.PI/180))/Math.PI)/2*scale};}
function meteoTileGrid(dst,kind){dst.replaceChildren();const r=$('meteoRadarStage').getBoundingClientRect();const W=Math.max(260,r.width),H=Math.max(230,r.height);const z=meteoMapZoom,scale=Math.pow(2,z),center=meteoMercator(meteoMapCenter.lat,meteoMapCenter.lng,z);let count=0;
 for(let y=Math.floor((center.y-H/2)/256);y<=Math.ceil((center.y+H/2)/256);y++)for(let x=Math.floor((center.x-W/2)/256);x<=Math.ceil((center.x+W/2)/256);x++){
 if(y<0||y>=scale)continue;const realX=(x%scale+scale)%scale;const image=new Image();image.decoding='async';image.loading='eager';image.style.left=Math.round(x*256-center.x+W/2)+'px';image.style.top=Math.round(y*256-center.y+H/2)+'px';
 if(kind==='base'){image.alt='';image.src='https://tile.openstreetmap.org/'+z+'/'+realX+'/'+y+'.png';image.onload=()=>{if(!meteoMapLoaded){meteoMapLoaded=true;meteoText('meteoMapWarning','');$('meteoMapWarning').classList.add('hidden')}};}
 else{const f=meteoRadarManifest?.radar?.past?.[meteoRadarFrame];if(!f)continue;image.alt='';const host=meteoRadarManifest.host;if(!/^https:\/\//.test(host))continue;image.src=host+f.path+'/256/'+z+'/'+realX+'/'+y+'/2/1_1.png';}
 dst.append(image);count++;
 if(count>30)break;
 }
}
function meteoPaintMap(base=true){if(currentPage!=='weather')return;if(meteoMapMode==='me'&&!weatherPosition()){meteoText('meteoMapWarning','現在地未取得 / 位置情報の許可と気象更新が必要です');$('meteoMapWarning').classList.remove('hidden');return;}meteoMapLoaded=meteoMapLoaded&& !base;if(base)meteoTileGrid($('meteoBaseTiles'),'base');meteoTileGrid($('meteoRainTiles'),'rain');const f=meteoRadarManifest?.radar?.past?.[meteoRadarFrame];meteoText('meteoRadarTime',f?new Date(f.time*1000).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}):'--:--');}
function meteoRadarTimeline(){const el=$('meteoRadarFrames');el.replaceChildren();const arr=meteoRadarManifest?.radar?.past||[];if(!arr.length){el.textContent='観測データ待機';return;}arr.slice(-8).forEach((f,k)=>{const actual=arr.length-Math.min(8,arr.length)+k,btn=document.createElement('button');btn.type='button';btn.textContent=new Date(f.time*1000).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}).slice(-5);btn.className=actual===meteoRadarFrame?'active':'';btn.addEventListener('click',()=>{meteoRadarFrame=actual;meteoPaintMap(false);meteoRadarTimeline();});el.append(btn)})}
async function meteoLoadRadar(force=false){if(!force&&meteoRadarManifest&&Date.now()-meteoRadarLastFetch<600000){meteoPaintMap(false);return;}
 meteoText('meteoRadarStatus','RAINVIEWER / CONNECTING');try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),11000);let res;try{res=await fetch('https://api.rainviewer.com/public/weather-maps.json',{signal:controller.signal,cache:'no-store'});}finally{clearTimeout(timeout)}if(!res.ok)throw Error('HTTP '+res.status);const json=await res.json();if(!Array.isArray(json?.radar?.past)||!json.radar.past.length||!/^https:\/\//.test(json.host||''))throw Error('Radar dataset unavailable');meteoRadarManifest=json;meteoRadarLastFetch=Date.now();meteoRadarFrame=json.radar.past.length-1;meteoText('meteoRadarUpdated','OBSERVED / 10min HISTORY');meteoText('meteoRadarStatus','RAINVIEWER / 観測済み降雨エコー');meteoPaintMap(false);meteoRadarTimeline();}catch(e){meteoRadarManifest=null;meteoRadarFrame=0;meteoText('meteoRadarStatus','レーダーに接続できません / 地図のみ');meteoText('meteoRadarUpdated','RADAR OFFLINE');meteoRadarTimeline();}}
function meteoRadarPlayToggle(){meteoRadarPlaying=!meteoRadarPlaying;meteoText('meteoRadarPlay',meteoRadarPlaying?'Ⅱ 停止':'▶ 再生');if(meteoRadarInterval)clearInterval(meteoRadarInterval);meteoRadarInterval=null;if(meteoRadarPlaying){meteoRadarInterval=setInterval(()=>{if(currentPage!=='weather'||document.hidden||!S.prefs.motion)return;const n=meteoRadarManifest?.radar?.past?.length||0;if(n){meteoRadarFrame=(meteoRadarFrame+1)%n;meteoPaintMap(false);meteoRadarTimeline();}},1600);}}
function meteoEnter(){meteoClockUpdate();if(meteoMapMode==='me'&&weatherPosition())meteoSetRegion('me');else meteoPaintMap(true);meteoLoadRadar();meteoUpdateRegions();weatherOnEntry();}
function meteoSetRegion(key){meteoMapMode=key;if(key==='hakone'){meteoMapCenter={lat:35.2329,lng:139.1046};meteoMapZoom=7;meteoText('meteoMapMark','△ TOKYO-3 / HAKONE');}
 else if(key==='kanto'){meteoMapCenter={lat:35.67,lng:139.65};meteoMapZoom=7;meteoText('meteoMapMark','△ TOKYO / KANTO');}
 else if(key==='me'){const pos=weatherPosition(),lat=pos?.lat,lng=pos?.lng;if(!Number.isFinite(lat)||!Number.isFinite(lng)){meteoText('meteoMapMark','⊕ 現在地 / 取得待機');$('meteoBaseTiles').replaceChildren();$('meteoRainTiles').replaceChildren();all('[data-radar-region]').forEach(btn=>btn.classList.toggle('active',btn.dataset.radarRegion==='me'));meteoPaintMap(true);toast('現在地は天気を更新してから選択できます');return;}meteoMapCenter={lat,lng};meteoMapZoom=7;meteoText('meteoMapMark','⊕ 現在地 / LOCAL');}
 all('[data-radar-region]').forEach(btn=>btn.classList.toggle('active',btn.dataset.radarRegion===key));meteoPaintMap(true);sound('scan');}
all('[data-radar-region]').forEach(btn=>btn.addEventListener('click',()=>meteoSetRegion(btn.dataset.radarRegion)));
$('meteoZoomIn').addEventListener('click',()=>{meteoMapZoom=Math.min(7,meteoMapZoom+1);meteoPaintMap(true);});
$('meteoZoomOut').addEventListener('click',()=>{meteoMapZoom=Math.max(4,meteoMapZoom-1);meteoPaintMap(true);});
$('meteoRadarPrev').addEventListener('click',()=>{const n=meteoRadarManifest?.radar?.past?.length||0;if(!n)return;meteoRadarFrame=(meteoRadarFrame+n-1)%n;meteoPaintMap(false);meteoRadarTimeline();});
$('meteoRadarNext').addEventListener('click',()=>{const n=meteoRadarManifest?.radar?.past?.length||0;if(!n)return;meteoRadarFrame=(meteoRadarFrame+1)%n;meteoPaintMap(false);meteoRadarTimeline();});
$('meteoRadarPlay').addEventListener('click',meteoRadarPlayToggle);
all('[data-meteo-jump]').forEach(el=>el.addEventListener('click',()=>{$(el.dataset.meteoJump).scrollIntoView({behavior:S.prefs.motion?'smooth':'instant',block:'start'});sound('tap');}));
window.addEventListener('resize',()=>{if(currentPage==='weather')meteoPaintMap(true)});

function tick(){if(typeof renderPersonnel==='function')renderPersonnel();meteoClockUpdate();const d=new Date();$('topClock').textContent=d.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});meteoText('deviceTime',d.toLocaleString('ja-JP'));
 if(focus.running){focus.remaining=Math.max(0,Math.ceil((focus.deadline-Date.now())/1000));if(focus.remaining===0){focus.running=false;sound('done');toast('集中タイマー終了。お疲れさま！');}timerRender();}
 const changed=settleEvaPower();if((S.evas.some(e=>e.state==='DEPLOYED')||changed)&&currentPage==='eva')renderEVA();if(changed)renderTacticalAlert();if(qs('#staffSupport'))renderCommandStreams();
}
$('soundSwitch').addEventListener('click',()=>{S.prefs.sound=!S.prefs.sound;persist();renderSettings();if(S.prefs.sound)sound('ok');else stopSound();});
$('autoWeatherSwitch').addEventListener('click',()=>{S.prefs.autoWeather=!S.prefs.autoWeather;persist();renderSettings();sound('tap');});
$('motionSwitch').addEventListener('click',()=>{S.prefs.motion=!S.prefs.motion;persist();renderSettings();sound('tap');});
$('bootSwitch').addEventListener('click',()=>{S.prefs.showBoot=!S.prefs.showBoot;persist();renderSettings();sound('tap');});
$('clearTasks').addEventListener('click',()=>{const num=S.tasks.length;S.tasks=S.tasks.filter(t=>!t.done);const removed=num-S.tasks.length;persist();renderTasks();renderHome();toast(removed+'件の完了タスクを削除');sound('tap');});
$('resetSim').addEventListener('click',()=>openAlertReview('end'));
function renderSettings(){document.body.classList.toggle('no-motion',!S.prefs.motion);$('soundFlag').textContent=S.prefs.sound?'ON':'OFF';$('motionFlag').textContent=S.prefs.motion?'ON':'OFF';$('bootFlag').textContent=S.prefs.showBoot?'ON':'OFF';$('autoWeatherFlag').textContent=S.prefs.autoWeather?'ON':'OFF';}
function draw(){settleEvaPower();renderHome();renderWeather();renderInfra();renderEVA();renderMAGI();renderMission();renderTacticalAlert();renderTasks();renderSettings();timerRender();persist();}
document.addEventListener('visibilitychange',()=>{if(document.hidden){settleEvaPower();persist();}else{settleEvaPower();draw();}});window.addEventListener('pagehide',()=>{settleEvaPower();persist();});
setInterval(tick,1000);tick();draw();callNative('battery').then(r=>{if(Number.isFinite(r?.level)){battery=Math.max(0,Math.min(100,r.level));charging=!!r.charging;renderBattery();}}).catch(()=>{});

// A genuine pitched vector map: OpenFreeMap tiles + MapLibre. No fabricated basemap.
const HAKONE={lng:139.1046,lat:35.2329};
let mapObj=null,mapPromise=null,map2d=false,mapWhere='hakone',mapReady=false;
function mapNote(msg){const el=$('mapStatus');if(el)el.textContent=msg;}
function requireMapLibre(){if(window.maplibregl)return Promise.resolve();if(mapPromise)return mapPromise;
 mapPromise=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src='https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.js';script.async=true;
   script.onload=()=>window.maplibregl?resolve():reject(Error('地図ライブラリが利用できません'));
   script.onerror=()=>reject(Error('地図ライブラリの通信に失敗'));document.head.appendChild(script);
 });return mapPromise;
}
function mapPosition(p,zoom=15.0){if(!mapObj)return;mapObj.flyTo({center:[p.lng,p.lat],zoom,essential:true,duration:1100,bearing:map2d?0:-23,pitch:map2d?0:55});$('mapCoords').textContent=p.lat.toFixed(3)+'N '+p.lng.toFixed(3)+'E';}
async function ensureMap(){if(qs('[data-page="infra"] [data-view="geography"]')?.hidden)return;if(mapObj){setTimeout(()=>mapObj.resize(),90);return;}if(mapReady)return;mapReady=true;mapNote('地図ライブラリを接続しています…');
 try{await requireMapLibre();
   mapObj=new maplibregl.Map({container:'realMap',style:'https://tiles.openfreemap.org/styles/liberty',center:[HAKONE.lng,HAKONE.lat],zoom:15,pitch:55,bearing:-23,canvasContextAttributes:{antialias:true},attributionControl:false,dragRotate:true,pitchWithRotate:true});
   mapObj.on('load',()=>{
     const style=mapObj.getStyle();const source=style.sources.openmaptiles?'openmaptiles':Object.keys(style.sources).find(k=>style.sources[k].type==='vector');
     if(source){const labels=style.layers.find(x=>x.type==='symbol'&&x.layout&&x.layout['text-field']);
       try{mapObj.addLayer({id:'nerv3d-building',type:'fill-extrusion',source:source,'source-layer':'building',minzoom:14,
         paint:{'fill-extrusion-color':'#c4a684','fill-extrusion-height':['interpolate',['linear'],['zoom'],14,0,15,['case',['has','render_height'],['to-number',['get','render_height']],['has','height'],['to-number',['get','height']],12]],'fill-extrusion-base':0,'fill-extrusion-opacity':0.79}
       },labels?labels.id:undefined);}catch(err){console.warn('3D extrusions:',err.message)}
     }
     mapNote('実地図 / ドラッグ・ピンチ・回転可');$('mapCoords').textContent='HAKONE / 35.233N 139.105E';
   });
   mapObj.on('error',e=>{console.warn('map error',e.error||e);mapNote('地図の取得に失敗。ネット接続をご確認ください');});
 }catch(e){mapReady=false;mapNote('地図を読み込めません: '+e.message);}
}
$('mapHakone').addEventListener('click',()=>{mapWhere='hakone';if(!mapObj){ensureMap();return;}mapPosition(HAKONE);$('mapExternal').href='https://www.openstreetmap.org/#map=15/35.2329/139.1046';mapNote('箱根 / 現実の地図');sound('tap');});
$('mapLocate').addEventListener('click',async()=>{mapNote('現在地の許可を確認しています…');sound('scan');try{
   const loc=await callNative('mapLocation');if(!Number.isFinite(loc?.lat)||!Number.isFinite(loc?.lng))throw Error(loc?.error||'位置情報を取得できません');
   mapWhere='current';await ensureMap();mapPosition({lat:loc.lat,lng:loc.lng});mapNote('現在地を表示 / 座標は保存しません');$('mapExternal').href='https://www.openstreetmap.org/#map=15/'+loc.lat+'/'+loc.lng;
 }catch(e){mapNote('現在地を取得できません: '+e.message)} });
$('mapPitch').addEventListener('click',()=>{map2d=!map2d;$('mapPitch').textContent=map2d?'2D':'2.5D';$('mapTilt').textContent='PITCH '+(map2d?0:55)+'°';if(mapObj)mapObj.easeTo({pitch:map2d?0:55,bearing:map2d?0:-23,duration:700});sound('tap');});
$('mapNorth').addEventListener('click',()=>{if(mapObj)mapObj.easeTo({bearing:0,duration:550});sound('tap');});
$('mapPlus').addEventListener('click',()=>{if(mapObj)mapObj.zoomIn();sound('tap');});
$('mapMinus').addEventListener('click',()=>{if(mapObj)mapObj.zoomOut();sound('tap');});

// v2.3 TACTICAL ANIMATION ENGINE. SIM state is committed only after a sequence finishes.
let sequenceBusy=false, sequenceTimer=null, finishSequence=null, unitSwitchTimer=null;
function playSequence(kind,title,unit,steps,done,detail){
 if(sequenceBusy)return false;
 const reduced=!S.prefs.motion||(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 if(reduced){done();return true;}
 sequenceBusy=true;document.body.classList.add('sequence-active');
 const screen=$('sequenceOverlay'),heading=$('seqTitle'),sub=$('seqUnit'),stage=$('seqStep'),bar=$('seqProgress'),counter=$('seqCounter'),meta=$('seqState');
 screen.classList.remove('hidden');screen.setAttribute('aria-hidden','false');
 screen.dataset.kind=kind;heading.textContent=title;sub.textContent=unit;
 for(const core of all('.sequence-magi-core')){core.dataset.vote='pending';core.querySelector('b').textContent='待機';}
 const diag=kind==='magi'?$('magiLiveTrack'):null;
 if(diag){diag.classList.add('in-progress');$('magiBoard').classList.add('is-voting');$('magiProgress').style.width='0%';}
 let at=0,completed=false;
 function finalize(){
  if(completed)return;completed=true;clearTimeout(sequenceTimer);sequenceTimer=null;finishSequence=null;
  screen.classList.add('hidden');screen.setAttribute('aria-hidden','true');document.body.classList.remove('sequence-active');
  if(diag)$('magiBoard').classList.remove('is-voting');sequenceBusy=false;
  done();
 }
 finishSequence=finalize;
 function step(){
  if(at>=steps.length){finalize();return;}
  stage.textContent=steps[at];bar.style.width=((at+1)/steps.length*100)+'%';
  counter.textContent=String(at+1).padStart(2,'0')+' / '+String(steps.length).padStart(2,'0');
  meta.textContent=at===steps.length-1?'CONFIRMING':'PROCESSING';
  if(kind==='magi'&&detail){
   const vote=detail.find(v=>v.name===['MELCHIOR','BALTHASAR','CASPER'][at]);
   if(vote){const core=qs('.sequence-magi-core[data-core="'+vote.name+'"]');if(core){core.dataset.vote=vote.yes?'approved':'denied';core.querySelector('b').textContent=vote.yes?'賛成':'否決';}}
   if(vote){const node=$('magiTrack'+at);if(node){node.className=vote.yes?'accepted':'denied';node.querySelector('small').textContent=vote.yes?'APPROVE':'DENY';}if($('magiProgress'))$('magiProgress').style.width=((at+1)/detail.length*100)+'%';}
  }
  at++;
  sequenceTimer=setTimeout(step,kind==='magi'?690:620);
 }
 sound(kind==='magi'?'scan':kind==='launch'?'launch':'select');step();return true;
}
function cancelSequence(){clearTimeout(sequenceTimer);sequenceTimer=null;finishSequence=null;sequenceBusy=false;document.body.classList.remove('sequence-active');const overlay=$('sequenceOverlay');if(overlay){overlay.classList.add('hidden');overlay.setAttribute('aria-hidden','true');}}
$('seqSkip').addEventListener('click',()=>{if(finishSequence)finishSequence()});
function updateMagiTracks(votes){
 if(!$('magiTrack0'))return;
 for(let i=0;i<3;i++){
  const node=$('magiTrack'+i);node.className=votes?(votes[i].yes?'accepted':'denied'):'';
  node.querySelector('small').textContent=votes?(votes[i].yes?'APPROVE':'DENY'):'WAITING';
 }
 $('magiProgress').style.width=votes?'100%':'0%';
 $('magiTrackSummary').textContent=votes?'DECISION REGISTERED':'THREE-CORE JUDGMENT';
}
function flashUnitSwitch(){
 const art=$('evaArtwork');art.classList.remove('unit-swap');void art.offsetWidth;
 if(S.prefs.motion&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){art.classList.add('unit-swap');clearTimeout(unitSwitchTimer);unitSwitchTimer=setTimeout(()=>art.classList.remove('unit-swap'),540)}
}
function renderTacticalAlert(){
 const critical=!S.infra.power||!S.infra.comms||S.evas.some(e=>e.state==='POWER_LOST')||magiIntrusionActive();
 const watch=!critical&&S.mission.phase>0&&S.mission.phase<6;
 const level=critical?'critical':watch?'watch':'nominal';
 document.body.dataset.alert=level;
 const ribbon=$('globalAlert'),flag=$('globalAlertFlag'),desc=$('globalAlertText');
 ribbon.classList.toggle('hidden',!critical&&!watch);ribbon.dataset.level=level;
 if(critical){flag.textContent='EMERGENCY';desc.textContent=!S.infra.power?'都市電力供給停止 / 補助系統を確認':!S.infra.comms?'作戦通信系統断 / COMMS OFFLINE':magiIntrusionActive()?'MAGI侵食検知 / 侵入対処が必要':'EVA内部電源喪失 / 回収要請';}
 else if(watch){flag.textContent='TACTICAL';desc.textContent='模擬作戦進行中 / PHASE '+String(S.mission.phase).padStart(2,'0');}
 $('telemetryAlarm').textContent=level==='critical'?'CRITICAL':level==='watch'?'TACTICAL':'NOMINAL';
 $('telemetryAlarm').style.color=critical?'#ff7976':watch?'#ffc171':'#9bf7bd';
 meteoText('heroTacticalState',critical?'EMERGENCY / SIM':watch?'OPERATION ACTIVE':'READY / STANDBY');
 meteoText('homeSignalCity',S.infra.power&&S.infra.comms?'ONLINE':'CHECK');
 meteoText('homeSignalEva',S.evas.filter(e=>e.state==='DEPLOYED').length+' ACTIVE');
 meteoText('homeSignalMission','PHASE '+String(S.mission.phase).padStart(2,'0'));
}

if(!S.prefs.showBoot){openApp(false)}
window.NERV_TEST={meteoRisk:()=>$('meteoRiskRows').textContent,meteoRadar:()=>meteoRadarManifest?.radar?.past?.length||0,getState:()=>JSON.parse(JSON.stringify(S)),open:go,weather:applyWeather,clock:tick,mission:()=>S.mission.phase,sequenceBusy:()=>sequenceBusy,alertLevel:()=>document.body.dataset.alert};
// Retain historical operator records while replacing score/timing games with staff commands.
const newOpsDefaults=()=>({xp:0,missions:0,successfulChecks:0,checkIndex:0,calibrations:0,gridBalance:50,gridQuality:0,locks:0,currentMissionLocks:0,lockBest:0,magiPredictions:0,magiMatches:0,missionAwarded:false,gridRewardKeys:[],magiRewardKeys:[],lastActions:[]});
S.ops={...newOpsDefaults(),...(S.ops&&typeof S.ops==='object'?S.ops:{})};
const isMoving=()=>S.prefs.motion&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function addXP(n,reason){S.ops.xp=Math.max(0,S.ops.xp+n);S.ops.lastActions.unshift({at:hhmmss(),reason,points:n});S.ops.lastActions=S.ops.lastActions.slice(0,8);persist();}
// Preserve v2.6 tactical fields for old saves; replace the UI with guided staff orders.
const v26DefaultTactics=()=>({attacker:1,defender:0,posture:'balanced',charge:0,heat:0,scans:0,shots:0,history:[]});
S.tactics={...v26DefaultTactics(),...(S.tactics&&typeof S.tactics==='object'?S.tactics:{})};
for(const role of ['attacker','defender']){if(![0,1,2].includes(Number(S.tactics[role])))S.tactics[role]=role==='attacker'?1:0;else S.tactics[role]=Number(S.tactics[role]);}
if(S.tactics.attacker===S.tactics.defender)S.tactics.defender=(S.tactics.attacker+1)%3;
S.tactics.charge=Math.min(100,Math.max(0,Number(S.tactics.charge)||0));S.tactics.heat=Math.min(100,Math.max(0,Number(S.tactics.heat)||0));
if(S.mission.phase>=5&&!S.tactics.charge&&!S.tactics.shots)S.tactics.charge=80;
function staffInvalidateDecision(){S.magi.approvedFor=null;S.magi.vote=null;S.magi.interceptApproval=null;if(S.defense){S.defense.magivote=null;S.defense.magiround=-1;}}
function staffMagiRequest(purpose){S.magi.purpose=purpose;if(purpose==='intercept')S.selectedEva=S.tactics.attacker;go('magi');}
if(qs('#staffAttackUnit')){
 $('staffAttackUnit').addEventListener('change',event=>{if(S.defense?.connected&&typeof S.evas[S.tactics.attacker].umbilical!=='boolean')S.evas[S.tactics.attacker].umbilical=true;S.tactics.attacker=Number(event.target.value);if(S.defense)S.defense.connected=!!S.evas[S.tactics.attacker].umbilical;if(S.tactics.defender===S.tactics.attacker)S.tactics.defender=(S.tactics.attacker+1)%3;staffInvalidateDecision();addLog('mission','攻撃担当をUNIT-0'+S.tactics.attacker+'に変更');draw();});
 $('staffMissionMagi').addEventListener('click',()=>staffMagiRequest('intercept'));
 // Retain the existing alignment: the field is a child of the artwork rig.
 qs('#evaSvg .eva-reference-rig').insertAdjacentHTML('beforeend','<div class="v26-at-field" aria-hidden="true"><svg viewBox="0 0 200 200"><polygon class="at-shell outer" points="42,1 158,1 199,42 199,158 158,199 42,199 1,158 1,42"/><polygon class="at-shell inner" points="58,38 142,38 162,58 162,142 142,162 58,162 38,142 38,58"/></svg><strong>A.T.FIELD / DEPLOYED</strong></div>');
}
// Original, deterministic doctrine trade-offs inspired by turn-based resource planning.
const NERV_DOCTRINES={defense:{label:'防御優先',cost:4,fire:.85,loss:.75},balanced:{label:'均衡運用',cost:5,fire:1,loss:1},assault:{label:'火力集中',cost:7,fire:1.35,loss:1.1}};
function defenseForecast(){
 const d=S.defense,rule=NERV_DOCTRINES[S.tactics?.posture]||NERV_DOCTRINES.balanced;
 let energy=v27Clamp(d.energy+(S.infra.power?7:0)),damage=0,shots=0;
 const votes=d.magivote?.filter(Boolean).length||0;
 for(const c of d.city.slice(0,3)){if(c.turret&&c.hp>=25&&energy>=rule.cost&&S.infra.power){energy-=rule.cost;shots++;damage+=Math.round((11+d.scans/15+(S.infra.comms?3:0))*(votes>=2?1.35:votes===1?.7:1)*rule.fire);}}
 const enemy=d.enemy;
 const sector=enemy?((d.round+1)%3===0?3:enemy.lane):null;
 let loss=0;
 if(enemy&&enemy.dist<=2&&enemy.hp>damage){const c=d.city[sector],absorb=(c.armor?13:0)+(S.infra.armor?5:0),guard=S.evas[S.tactics.defender]?.state==='DEPLOYED'&&S.evas[S.tactics.defender]?.at&&evaMapSector(S.tactics.defender)===sector?12:0;loss=Math.max(5,Math.round(Math.max(5,enemy.force-absorb-guard)*rule.loss));}
 damage=enemy?Math.min(enemy.hp,damage):0;if(sector!==null)loss=Math.min(d.city[sector].hp,loss);
 return {energy,damage,shots,sector,loss,rule};
}
function renderStrategy(){
 if(!$('strategyForecast')||!S.defense)return;
 const d=S.defense,f=defenseForecast();
 for(const button of all('[data-doctrine]')){const chosen=(S.tactics.posture||'balanced')===button.dataset.doctrine;button.setAttribute('aria-pressed',String(chosen));}
 const prediction=d.status==='active'?f.shots+'系統が迎撃 / 予測損耗 '+f.damage+' / 迎撃後電力（報酬前） '+f.energy+'%\n'+(d.scans<34?'敵の詳細な行動は未解析です。波形解析で見通しを確認できます。':f.loss?V27_FACILITY[f.sector].name+'への被害見込み '+f.loss+' / 次ターン':'次ターンの施設被害見込みなし'):'敵性反応を検知すると、次ターンの電力・迎撃・被害見通しを表示します。';
 meteoText('strategyForecast',f.rule.label+'\n'+prediction);$('strategyAdvance').disabled=d.status!=='active';
}
function initStrategy(){if(!qs('#staffSupport'))return;for(const button of all('[data-doctrine]'))button.addEventListener('click',()=>{S.tactics.posture=button.dataset.doctrine;staffInvalidateDecision();addLog('mission','防衛方針 / '+NERV_DOCTRINES[S.tactics.posture].label);draw();});$('strategyAdvance').addEventListener('click',v27Advance);}
/* ===== v2.7 TACTICAL DEFENSE NETWORK (FICTIONAL / LOCAL) ===== */
const V27_SCENARIOS=[
 {name:'接近型 / INTRUSION VECTOR',code:'UNIDENTIFIED-α',bearing:'北東',hp:115,force:28,dist:5,lane:1},
 {name:'高出力反応 / ENERGY EMITTER',code:'UNIDENTIFIED-β',bearing:'北西',hp:145,force:38,dist:5,lane:0},
 {name:'侵入型 / SUBTERRANEAN',code:'UNIDENTIFIED-γ',bearing:'東側',hp:130,force:33,dist:4,lane:2}
];
const V27_FACILITY=[{name:'西防壁',short:'WEST',max:100},{name:'中央兵装',short:'BATTERY',max:100},{name:'東迎撃区',short:'EAST',max:100},{name:'ジオフロント',short:'HQ',max:100}];
const v27Default=()=>({status:'idle',caseNo:0,round:0,scans:0,selected:1,energy:70,parts:120,spares:2,security:85,breach:0,connected:false,shutdown:false,magivote:null,magiround:-1,enemy:null,city:[{hp:100,armor:false,turret:false},{hp:100,armor:false,turret:false},{hp:100,armor:false,turret:false},{hp:100,armor:true,turret:false}],history:[],wins:0,losses:0,alert:false,usedV27Shot:false,securityPuzzle:0,last:'待機中 / SIMULATION IDLE'});
function v27Normalize(){const raw=(S.defense&&typeof S.defense==='object')?S.defense:{};const d={...v27Default(),...raw};const bounded=(n,lo=0,hi=100)=>Math.round(Math.max(lo,Math.min(hi,Number(n)||0)));
 d.energy=bounded(d.energy);d.parts=bounded(d.parts,0,999);d.spares=bounded(d.spares,0,9);d.security=bounded(d.security);d.scans=bounded(d.scans);d.round=bounded(d.round,0,200);d.breach=bounded(d.breach,0,100);d.selected=bounded(d.selected,0,3);d.caseNo=bounded(d.caseNo,0,999);d.wins=bounded(d.wins,0,999);d.losses=bounded(d.losses,0,999);
 d.city=V27_FACILITY.map((f,i)=>{const c=Array.isArray(raw.city)?raw.city[i]:null;return {hp:bounded(c?.hp??100),armor:!!c?.armor,turret:!!c?.turret};});
 if(!['idle','active','victory','defeat'].includes(d.status))d.status='idle';if(!Array.isArray(d.history))d.history=[];d.history=d.history.slice(0,24);if(d.status==='active'&&!d.enemy)d.status='idle';
 if(d.enemy){d.enemy={...d.enemy,hp:bounded(d.enemy.hp,0,300),maxHp:bounded(d.enemy.maxHp,1,300),dist:bounded(d.enemy.dist,0,9),lane:bounded(d.enemy.lane,0,2),force:bounded(d.enemy.force,0,100)}};
 S.defense=d;return d;}
const v27D=v27Normalize();
// Transfer the legacy shared cable flag before a new case resets defense state.
S.evas.forEach((e,i)=>{if(typeof e.umbilical!=='boolean')e.umbilical=!!(v27D.connected&&S.tactics.attacker===i);});
const v27Clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const v27Num=(n)=>Math.round(Number(n)||0);
function v27Record(s){const d=S.defense;d.last=s;d.history.unshift({at:hhmmss(),t:d.round,txt:s.slice(0,88)});d.history=d.history.slice(0,24);addLog('mission','CITY DEFENSE / '+s);}
function v27SectorSVG(i,cx,cy){const fac=V27_FACILITY[i];const halfW=i===3?77:57;const halfH=i===3?39:28;const depth=i===3?59:42;const l=cx-halfW,r=cx+halfW,t=cy-halfH,b=cy+halfH;return `<g class="v27-building" data-v27pick="${i}" data-selected="false" role="button" tabindex="0" aria-label="${fac.name}を選択">
 <polygon class="v27-left" points="${l},${cy} ${cx},${b} ${cx},${b+depth} ${l},${cy+depth}"/>
 <polygon class="v27-right" points="${cx},${b} ${r},${cy} ${r},${cy+depth} ${cx},${b+depth}"/>
 <polygon class="v27-top" points="${cx},${t} ${r},${cy} ${cx},${b} ${l},${cy}"/>
 <path d="M${cx-12} ${cy}h24 M${cx} ${cy-10}v20" stroke="#86d7b5" stroke-width="1.5" opacity=".8"/>
 <circle cx="${r-9}" cy="${cy+depth-5}" r="5" fill="#ffb46e" opacity=".7"/>
 <text x="${cx}" y="${b+depth+20}" text-anchor="middle">${fac.short}</text>
 <rect x="${l-4}" y="${t-4}" width="${halfW*2+8}" height="${halfH*2+depth+12}" fill="transparent"/></g>`;}
function v27MapMarkup(){let grid='';for(let x=-400;x<=1000;x+=48)grid+=`<path class="grid-line" d="M${x} 0l430 430M${x} 0l-430 430"/>`;
 return `<svg class="v27-map" id="v27IsoMap" viewBox="0 0 680 445" preserveAspectRatio="xMidYMid meet" role="group" aria-label="第3新東京市の2.5D模擬戦術地図。施設をタップして選択できます">
 <defs><radialGradient id="v27MapHalo"><stop stop-color="#0f3b32"/><stop offset="1" stop-color="#021015"/></radialGradient></defs><rect width="680" height="445" fill="url(#v27MapHalo)"/>${grid}
 <g opacity=".8"><path d="M340 70L618 207 340 355 62 207Z" fill="#07262a" stroke="#388c7c" stroke-width="3"/><path d="M340 90L588 207 340 337 92 207Z" fill="none" stroke="#276963" stroke-dasharray="10 7" stroke-width="2"/></g>
 <circle cx="340" cy="207" r="125" class="v27-threat-ring"/><circle cx="340" cy="207" r="180" class="v27-threat-ring" opacity=".25"/><line x1="340" y1="207" x2="514" y2="207" class="v27-sweep"/>
 <path id="v27PowerLine" class="v27-powerline" d="M340 295L181 209L340 125L500 209L340 295"/>
 ${v27SectorSVG(0,181,198)}${v27SectorSVG(1,340,125)}${v27SectorSVG(2,500,198)}${v27SectorSVG(3,340,278)}
 <g id="v27Enemy" class="v27-enemy v27-visual-off" transform="translate(530 35)"><text id="mapEnemyName" class="map-enemy-label" text-anchor="middle" y="-44">HOSTILE</text><circle r="29" class="v27-threat-ring"/><polygon points="0,-22 21,0 0,22 -21,0"/><circle r="6" fill="#1a120e"/><path d="M-38 0H38M0 -38V38" stroke="#ff684e" stroke-width="1.6" opacity=".8"/></g>
 <path class="v27-aim" d="M10 58V10H58M622 10h48v48M10 389v46h48M622 435h48v-46"/>
 <text class="v27-map-text" x="15" y="25">NERV / MUNICIPAL TACTICAL GRID</text><text class="v27-map-text" x="15" y="420">RENDER : 2.5D / SIMULATED</text><text class="v27-map-text" x="530" y="420">TOKYO-3</text>
 </svg>`;}
function v27Build(){
 const main=`<section class="v27-plate" id="v27DefenseBoard" aria-label="第3新東京市統合防衛戦術盤"><div class="v27-head"><b>第三新東京市 総合防衛盤<small>TOKYO-3 / TACTICAL DEFENSE NETWORK</small></b><span id="v27Status" class="v27-chip">STANDBY</span></div>
 <div class="v27-kpi"><div><small>敵接近 / ETA</small><strong id="v27ETA">--</strong></div><div><small>都市健全性</small><strong id="v27CityHP">--</strong></div><div><small>防衛電力</small><strong id="v27Energy">--</strong></div><div><small>資材 / SUPPLY</small><strong id="v27Parts">--</strong></div></div>
 ${v27MapMarkup()}
 <div class="v27-readbar"><span id="v27RadarSignal">SIGNAL : NO TARGET</span><b id="v27MapDetail">SCANNING / 0%</b></div>
 <div class="v27-lanes" id="v27Facilities">${V27_FACILITY.map((f,i)=>`<button data-v27pick="${i}">${f.name}<small id="v27Sector${i}">HP 100 / 100</small></button>`).join('')}</div>
 <div class="v27-split"><div class="v27-sub"><label>SELECTED FACILITY</label><b id="v27Selected">---</b><div class="v27-stat bad"><i id="v27SelectedHP"></i></div></div><div class="v27-sub"><label>敵性識別・解析</label><b id="v27EnemyLabel">UNKNOWN</b><div class="v27-stat"><i id="v27ScanBar"></i></div></div></div>
 <div class="v27-tools" id="defenseTools"><button id="v27Detect">◆ 新規敵性反応 / DETECT</button><button id="v27Scan">⌖ 波形・A.T.分析 / SCAN</button><button id="v27Armor">▣ 装甲を展開 / ARMOR</button><button id="v27Turret">⚑ 迎撃砲台 / DEPLOY</button><button id="v27Power">⚡ 補助電力 / RESERVE</button><button id="v27Repair">✚ 施設の応急修理 / REPAIR</button><button id="v27Cable">⛓ EVA電源ケーブル / CONNECT</button><button id="v27Shot">◎ EVA支援射撃 / SUPPORT</button></div>
 <button class="v27-long" id="v27Advance">▸ 作戦時間を進める / ADVANCE TURN</button><div class="v27-story" aria-live="polite" id="v27Story">命令待機 / DISPATCH IDLE</div>
 <div class="v27-kpi" id="defenseTurnStats" style="margin-top:8px"><div><small>経過ターン</small><strong id="v27Turn">00</strong></div><div><small>兵装稼働</small><strong id="v27Turrets">0/3</strong></div><div><small>予備送電</small><strong id="v27Reserve">2</strong></div><div><small>MAGIセキュリティ</small><strong id="v27Security">85%</strong></div></div>
 <div class="v27-tools" id="defenseLinks"><button data-v27jump="magi">△ MAGIシステムへ ↗</button><button data-v27jump="eva">◈ EVA兵站・運用へ ↗</button><button data-v27jump="mission">⌖ ヤシマ作戦へ ↗</button><button data-v27jump="home">⌂ 統合ホーム ↗</button></div>
 <section class="v27-mini"><h3>作戦履歴 / AFTER ACTION</h3><p id="v27Report">迎撃成功・損害・補給の履歴。施設ダメージは次の作戦へ持ち越されます。</p><div id="v27History" class="v27-history"></div></section>
 <p class="v26-source">非公式ファン制作・全て架空の作戦訓練。気象警報・現実の防災情報とは接続していません。敵の名称・能力・資源量はゲーム独自設定です。</p></section>`;
 const after=(selector,html)=>{const e=qs(selector);if(!e)throw Error('v2.7 missing anchor '+selector);e.insertAdjacentHTML('afterend',html)};
 after('.page[data-page="infra"] .page-top',main);
 all('[data-v27jump]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.v27jump)));
 all('[data-v27pick]').forEach(el=>{el.addEventListener('click',()=>{S.defense.selected=Number(el.dataset.v27pick);sound('select');draw()});if(el.tagName.toLowerCase()==='g')el.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();S.defense.selected=Number(el.dataset.v27pick);draw()}})});
 const handlers={v27Detect:v27Detect,v27Scan:v27Scan,v27Armor:v27Armor,v27Turret:v27Turret,v27Power:v27Power,v27Repair:v27Repair,v27Cable:v27Cable,v27Shot:v27Shot,v27Advance:v27Advance,v27MagiJudge:v27Judge,v27SecDetect:v27Trace};Object.entries(handlers).forEach(([id,fn])=>$(id)?.addEventListener('click',fn));
 all('[data-v27isolate]').forEach(el=>el.addEventListener('click',()=>v27Isolate(Number(el.dataset.v27isolate))));
}
function v27Profile(){return V27_SCENARIOS[(S.defense.caseNo-1+V27_SCENARIOS.length)%V27_SCENARIOS.length];}
function v27Spend(amount){if(!S.infra.power){toast('都市主電源が停止中。管制画面から復旧してください');sound('deny');return false;}if(S.defense.energy<amount){toast('防衛電力が不足 / '+amount+'必要');sound('deny');return false}S.defense.energy-=amount;return true}
function v27Finish(won,why){const d=S.defense;if(d.status!=='active')return;d.status=won?'victory':'defeat';if(won&&S.mission.phase>0&&S.mission.phase<6){S.mission.phase=6;if(!S.ops.missionAwarded){S.ops.missions++;S.ops.missionAwarded=true;}addLog('mission','地上迎撃・EVA連携 / 作戦完了');}if(won){d.wins++;d.parts=v27Clamp(d.parts+34,0,999);d.energy=v27Clamp(d.energy+20);addXP(45+Math.round(v27CityIntegrity()/4),'CITY DEFENSE SUCCESS');}else{d.losses++;d.parts=v27Clamp(d.parts+12,0,999);d.breach=v27Clamp(d.breach+20)}v27Record((won?'作戦成功 / ':'防衛失敗 / ')+why);sound(won?'done':'warning');draw();}
function v27Detect(){const d=S.defense;if(d.status==='active'){toast('迎撃作戦進行中。完了後に次の反応を検知できます');return}d.caseNo++;const x=v27Profile();d.status='active';d.round=0;d.scans=0;d.magivote=null;d.magiround=-1;d.shutdown=false;d.usedV27Shot=false;d.enemy={hp:x.hp,maxHp:x.hp,dist:x.dist,force:x.force,lane:x.lane,code:x.code};d.energy=v27Clamp(d.energy+20);d.breach=0;v27Record('敵性反応を検出 / 分析前の推定進路 '+x.bearing+' / CASE '+d.caseNo);sound('warning');draw()}
function v27Scan(){const d=S.defense;if(d.status!=='active')return toast('敵性反応を先に検知してください');if(!v27Spend(12))return;d.scans=v27Clamp(d.scans+34);if(d.scans>=70)S.tactics.scans=Math.max(S.tactics.scans,2);v27Record('多層波形解析 '+d.scans+'% / '+(d.scans>=68?'PATTERN BLUE：確度上昇':'対象未確定'));sound('scan');draw()}
function v27CityIntegrity(){return Math.round(S.defense.city.reduce((a,x)=>a+x.hp,0)/4)}
function v27Armor(){const d=S.defense,c=d.city[d.selected];if(d.status==='active'||d.status==='idle'){if(c.hp<=0)return toast('機能停止。先に修理してください');if(c.armor)return toast('装甲は展開済み');if(!v27Spend(12))return;c.armor=true;v27Record(V27_FACILITY[d.selected].name+' / 防護シャッター展開');sound('ok');draw()}}
function v27Turret(){const d=S.defense,c=d.city[d.selected];if(d.selected===3)return toast('ジオフロント区画には迎撃砲を設置できません');if(c.hp<25)return toast('施設損傷のため稼働不可 / 修復してください');if(c.turret)return toast('砲台はすでに稼働中です');if(d.parts<20)return toast('資材が不足 / 20必要');d.parts-=20;c.turret=true;v27Record(V27_FACILITY[d.selected].name+' / 迎撃砲台配置');sound('launch');draw()}
function v27Power(){const d=S.defense;if(d.spares<=0)return toast('予備送電枠を使い切りました');d.spares--;d.energy=v27Clamp(d.energy+38);v27Record('地下補助系統から緊急送電 / +38');sound('ok');draw()}
function v27Repair(){const d=S.defense,c=d.city[d.selected];if(c.hp>=100)return toast('設備は健全です');if(d.parts<18)return toast('修理資材が不足 / 18必要');d.parts-=18;c.hp=v27Clamp(c.hp+27);v27Record(V27_FACILITY[d.selected].name+' / 緊急修復：HP '+c.hp);sound('ok');draw()}
function v27Cable(){toggleEvaCable(S.tactics.attacker);}
function v27Judge(){if(magiIntrusionActive())return toast('MAGI侵入対処中 / 通常審議を停止しています');const d=S.defense;if(d.status!=='active')return toast('敵性信号がありません');if(d.scans<34)return toast('最低1回の波形分析を先に実施してください');const votes=[d.scans>=65&&S.infra.power,d.city[3].hp>=35&&v27CityIntegrity()>=40,d.security>=45&&S.infra.comms];d.magivote=votes;d.magiround=d.round;v27Record('MAGI 戦術判断 '+votes.filter(Boolean).length+'/3 '+(votes.filter(Boolean).length>=2?'承認':'留保'));sound('scan');draw()}
function v27Trace(){const d=S.defense;if(d.status!=='active')return toast('敵性信号を検知してください');if(d.scans<34)return toast('波形解析が必要です');d.securityPuzzle=(d.caseNo+d.round+1)%3;if(!v27Spend(8))return;d.shutdown=true;v27Record('MAGI侵入試行を捕捉 / ノード '+['M','B','C'][d.securityPuzzle]+' に不審通信');sound('warning');draw()}
function v27Isolate(i){const d=S.defense;if(!d.shutdown)return toast('侵入トレースを先に行ってください');d.shutdown=false;if(i===d.securityPuzzle){d.security=v27Clamp(d.security+15);d.parts=v27Clamp(d.parts+6,0,999);v27Record('不正ノード隔離成功 / 三基稼働継続');sound('ok')}else{d.security=v27Clamp(d.security-20);v27Record('隔離対象誤認 / MAGIセキュリティ -20');sound('deny')}d.magivote=null;draw()}
function v27Shot(){const d=S.defense,t=S.tactics;if(d.status!=='active')return toast('迎撃対象がありません');const a=S.evas[t.attacker],errs=[];if(S.mission.phase<4||S.mission.phase>5)errs.push('既存作戦PHASE 04-05');if(a?.state!=='DEPLOYED')errs.push('攻撃担当機の出撃');if(S.magi.approvedFor!==t.attacker)errs.push('EVA出撃承認');if(t.charge<70||t.heat>=80)errs.push('蓄電70%以上・熱負荷80%未満');if(!S.ops.currentMissionLocks)errs.push('照準ロック');if(!d.magivote||d.magivote.filter(Boolean).length<2||d.magiround!==d.round)errs.push('現ターンのMAGI戦術承認');if(errs.length){toast('射撃不可: '+errs.join(' / '));sound('deny');return}const dmg=Math.round(60+d.scans*.33+(evaExternalPower(t.attacker)?10:0));d.enemy.hp=v27Clamp(d.enemy.hp-dmg,0,300);d.usedV27Shot=true;t.charge=0;t.heat=v27Clamp(t.heat+20);v27Record('EVA支援射撃 / '+dmg+' DAMAGE / 対象残 '+d.enemy.hp);sound('launch');if(!d.enemy.hp){v27Finish(true,'EVA支援射撃により目標沈黙');return}draw()}
function v27Advance(){const d=S.defense;if(d.status!=='active')return toast('まず新規敵性反応を検知してください');const forecast=defenseForecast();d.round++;d.energy=forecast.energy;
 const e=d.enemy,damage=forecast.damage,shots=forecast.shots;
 d.magivote=null;d.magiround=-1;if(damage){e.hp=v27Clamp(e.hp-damage,0,300);v27Record('地上迎撃 '+shots+'系統 / 対象損耗 -'+damage+' / 残 '+e.hp)}
 if(e.hp<=0){v27Finish(true,'迎撃砲火により目標撃退');return}
 e.dist=Math.max(0,e.dist-1);if(!evaExternalPower(S.tactics.attacker)&&S.evas[S.tactics.attacker]?.state==='DEPLOYED'){const ev=S.evas[S.tactics.attacker];ev.power=Math.max(0,Number(ev.power)-32);if(ev.power<=0){ev.state='POWER_LOST';ev.at=false;v27Record('攻撃担当EVA 内部電源喪失')}}
 if(e.dist<=1){const spot=d.round%3===0?3:e.lane;const c=d.city[spot],loss=forecast.loss;c.hp=v27Clamp(c.hp-loss);d.breach=v27Clamp(d.breach+(spot===3?13:5));d.security=v27Clamp(d.security-(d.scans<35?9:3));v27Record(V27_FACILITY[spot].name+'被弾 / '+loss+' DAMAGE / HP '+c.hp);if(c.hp<25)c.turret=false}
 else v27Record('敵性反応接近 / ETA '+e.dist+' TURNS / 電力配分 +7');
 if(d.city[3].hp<=0||v27CityIntegrity()<=26||d.round>=14){v27Finish(false,'防衛ライン維持不可 / 復旧が必要');return}sound(e.dist<=1?'warning':'scan');draw();}
function v27Render(){const d=S.defense;if(!$('v27DefenseBoard'))return;const active=d.status==='active',e=d.enemy,health=v27CityIntegrity(),votes=d.magivote||[];const txt=(id,v)=>{const el=$(id);if(el)el.textContent=String(v)};
 document.body.dataset.defense=d.status;
 if(d.status==='active' && S.infra.power && S.infra.comms && !S.evas.some(e=>e.state==='POWER_LOST') && !magiIntrusionActive()){const rb=$('globalAlert');rb.classList.remove('hidden');rb.dataset.level='watch';$('globalAlertFlag').textContent='PATTERN ALERT';$('globalAlertText').textContent='模擬敵性反応 / TOKYO-3 防衛作戦 '+String(d.caseNo).padStart(3,'0');$('telemetryAlarm').textContent='ENEMY';$('telemetryAlarm').style.color='#ffb374';meteoText('heroTacticalState','DEFENSE ACTIVE / SIM');}
 const label={idle:'STANDBY',active:'PATTERN ALERT',victory:'TARGET CLEARED',defeat:'DEFENSE LOST'}[d.status];txt('v27Status',label);$('v27Status').classList.toggle('alert',active);
 txt('v27ETA',active?e.dist+' T':d.status==='victory'?'CLEAR':'--');txt('v27CityHP',health+'%');txt('v27Energy',d.energy+'%');txt('v27Parts',d.parts);
 txt('v27RadarSignal',active?'SIGNAL : '+(d.scans>=65?'PATTERN BLUE':'UNKNOWN')+' / '+v27Profile().bearing:'SIGNAL : NO HOSTILE CONTACT');txt('v27MapDetail',active?`${e.hp}/${e.maxHp} HP / RECON ${d.scans}%`:d.status.toUpperCase());
 txt('v27Selected',V27_FACILITY[d.selected].name);$('v27SelectedHP').style.width=d.city[d.selected].hp+'%';txt('v27EnemyLabel',active?(d.scans>=65?e.code:'UNIDENTIFIED'):'NO CONTACT');$('v27ScanBar').style.width=d.scans+'%';
 const ex=$('v27Enemy');ex.classList.toggle('v27-visual-off',!active);if(active){const coord=[[90,60],[590,68],[600,215]][e.lane];const p=v27Clamp((6-e.dist)/5,0,1);const x=coord[0]+(340-coord[0])*p,y=coord[1]+(210-coord[1])*p;ex.setAttribute('transform',`translate(${Math.round(x)} ${Math.round(y)})`)}
 $('v27PowerLine').classList.toggle('off',!S.infra.power);
 all('[data-v27pick]').forEach(el=>{const i=Number(el.dataset.v27pick);if(el.tagName.toLowerCase()==='button'){el.classList.toggle('sel',d.selected===i);el.classList.toggle('damage',d.city[i].hp<50);}else{el.dataset.selected=d.selected===i?'true':'false';el.dataset.damaged=d.city[i].hp<40?'true':'false';}});
 for(let i=0;i<4;i++)txt('v27Sector'+i,'HP '+d.city[i].hp+' / '+(d.city[i].armor?'装甲':'OPEN')+(d.city[i].turret?' ⚑':''));
 txt('v27Story',d.last);txt('v27Turn',String(d.round).padStart(2,'0'));txt('v27Turrets',d.city.filter(c=>c.turret&&c.hp>=25).length+'/3');txt('v27Reserve',d.spares);txt('v27Security',d.security+'%');
 txt('v27Report',`防衛成功 ${d.wins} / 失敗 ${d.losses} / 継続損耗 ${100-health}% / CASE ${String(d.caseNo).padStart(3,'0')}`);
 $('v27History').replaceChildren();d.history.slice(0,8).forEach(r=>{const el=document.createElement('div'),a=document.createElement('time'),b=document.createElement('span');a.textContent=r.at+' / T'+r.t;b.textContent=r.txt;el.append(a,b);$('v27History').append(el)});if(!d.history.length)$('v27History').textContent='NO BATTLE RECORDS';
 $('v27Detect').disabled=active;$('v27Scan').disabled=!active||d.energy<12||d.scans===100;$('v27Armor').disabled=d.city[d.selected].armor||d.city[d.selected].hp<=0||d.energy<12;$('v27Turret').disabled=d.selected===3||d.city[d.selected].turret||d.city[d.selected].hp<25||d.parts<20;$('v27Power').disabled=d.spares<1;$('v27Repair').disabled=d.parts<18||d.city[d.selected].hp>=100;$('v27Advance').disabled=!active;
 txt('v27Cable',evaUmbilicalConnected(S.tactics.attacker)?'⛓ ケーブル解除 / DISCONNECT':'⛓ EVA電源ケーブル / CONNECT');
 const magiStatus=d.magivote?d.magivote.filter(Boolean).length+'/3 CORES / '+(d.magivote.filter(Boolean).length>=2?'APPROVED':'REJECTED'):'VOTE REQUIRED';
 txt('v27HomeBrief',active?'◆ ENEMY '+e.dist+' T / CITY '+health+'%':label+' / CITY '+health+'%');txt('v27HomeState',d.last);
 txt('v27MissionBrief',`${label} / TARGET ${active?e.hp+'HP':'NONE'} / MAGI ${magiStatus}`);txt('v27EvaBrief',`UMBILICAL : ${evaUmbilicalConnected(S.tactics.attacker)?'CONNECTED':'OFFLINE'} / EVA電力 ${S.evas[S.tactics.attacker].power}s / SECURITY ${d.security}%`);
 txt('v27MagiBrief',`${magiStatus} / SECURITY ${d.security}% / RECON ${d.scans}%`);
 ['v27Vote0','v27Vote1','v27Vote2'].forEach((id,i)=>txt(id,d.magivote?(votes[i]?'APPROVE':'DENY'):'WAIT'));
 txt('v27SecurityHint',d.shutdown?'侵入シグナルを捕捉：'+['MELCHIOR','BALTHASAR','CASPER'][d.securityPuzzle]+' に不審ノード。隔離を選択。':'ノード隔離には先に侵入トレースを実行。誤遮断でセキュリティ低下。');
 if($('v27MagiJudge'))$('v27MagiJudge').disabled=!active||d.scans<34;if($('v27SecDetect'))$('v27SecDetect').disabled=!active||d.scans<34;
}
function v27Init(){if(!qs('.page[data-page="infra"] .page-top')?.insertAdjacentHTML)return;v27Build();const v26Draw=draw;draw=function(){v26Draw();v27Render();};window.NERV_V27_TEST={snapshot:()=>JSON.parse(JSON.stringify(S.defense)),detect:v27Detect,scan:v27Scan,advance:v27Advance,judge:v27Judge,shoot:v27Shot,repair:v27Repair,armor:v27Armor,turret:v27Turret,energy:v27Power,sector:(x)=>{S.defense.selected=x;draw()},render:v27Render};v27Render();}
v27Init();

// A local story simulation inspired by episode 13's evolving MAGI contamination.
// It never receives external commands or contacts an actual hostile system.
let visualUpgradeBackup=null;
async function backupVisualUpgrade(){
 if(!visualUpgradeBackup)visualUpgradeBackup=callNative('backupUpgrade',{state:JSON.parse(JSON.stringify(S))});
 const result=await visualUpgradeBackup;
 if(result?.error){visualUpgradeBackup=null;toast('変更前の保存に失敗しました：'+result.error);return false;}
 return true;
}
function magiIntrusionActive(){return ['detected','isolated','analyzed','countermeasure','failed'].includes(S.magi?.intrusion?.status);}
function intrusionState(){const defaults={status:'idle',phase:0,progress:0,affected:[],resolved:0,failures:0,message:'MAGI三基は正常稼働。通常の出撃・迎撃審議が可能です。'};const raw=S.magi.intrusion;if(!raw||typeof raw!=='object')return defaults;return {...defaults,...raw,affected:Array.isArray(raw.affected)?raw.affected:[],progress:Math.max(0,Math.min(100,Number(raw.progress)||0)),phase:Math.max(0,Math.min(5,Number(raw.phase)||0))};}
const intrusionActions={
 isolate:{label:'MAGI外部回線を隔離',effect:'侵入経路を遮断。都市の作戦通信は維持します。'},
 restart:{label:'通常再起動を試す',effect:'適応する侵食には無効。侵食率が25%増加します。'},
 analyze:{label:'侵食波形を解析',effect:'侵食率＋10%。適応・進化の仕組みを特定します。'},
 firewall:{label:'通常防壁を更新',effect:'侵食側が適応。侵食率が20%増加します。'},
 reverse:{label:'進化経路を逆算',effect:'CASPERの未侵食領域で対抗プログラムを構成します。'},
 execute:{label:'CASPERから対抗処理を実行',effect:'進化を終端へ誘導。侵食を封じ込め、三基を復旧します。'}
};
async function startMagiIntrusion(){
 if(magiIntrusionActive())return;
 if(!await backupVisualUpgrade())return;
 // Recheck after the asynchronous backup to prevent a double-tap starting twice.
 if(magiIntrusionActive())return;
 const old=intrusionState();S.magi.intrusion={...old,status:'detected',phase:1,progress:20,affected:['MELCHIOR'],securityBefore:S.defense.security,message:'外部試験系から侵食を検知。MELCHIORに異常。通常審議を停止しました。'};
 S.defense.security=Math.max(0,S.defense.security-20);staffInvalidateDecision();
 addLog('magi','侵入訓練開始 / 外部試験系から進化型の侵食を検知');sound('warning');draw();window.scrollTo({top:0,behavior:'instant'});
}
function magiIntrusionAction(action){
 const s=intrusionState();if(!magiIntrusionActive()||s.status==='failed')return;
 const allowed={detected:['isolate','restart'],isolated:['analyze','restart'],analyzed:['reverse','firewall'],countermeasure:['execute','firewall']}[s.status]||[];
 if(!allowed.includes(action))return;S.magi.intrusion=s;
 if(action==='isolate'){s.status='isolated';s.phase=2;s.message='外部回線を隔離。都市作戦通信を維持。侵食はMAGI内部で適応を続けています。';}
 if(action==='analyze'){s.status='analyzed';s.phase=3;s.progress+=10;s.affected=['MELCHIOR','BALTHASAR'];s.message='侵食波形を解析。通常防壁に適応する進化型と判明。CASPERは未侵食です。';}
 if(action==='reverse'){s.status='countermeasure';s.phase=4;s.message='進化経路を逆算。CASPERで対抗処理の準備完了。実行すると三基の復旧を試みます。';}
 if(action==='restart'||action==='firewall'){s.progress+=action==='restart'?25:20;s.message=action==='restart'?'通常再起動に侵食が適応。侵食率＋25%。外部回線の隔離と波形解析が必要です。':'通常防壁に侵食が適応。侵食率＋20%。進化経路の逆算で対抗してください。';}
 if(action==='execute'){s.status='contained';s.phase=5;s.progress=0;s.affected=[];s.resolved=(Number(s.resolved)||0)+1;s.message='対抗処理が成功。侵食を封じ込め、MAGI三基を復旧。通常審議を再申請できます。';S.defense.security=Math.max(S.defense.security,s.securityBefore||0);staffInvalidateDecision();}
 s.progress=Math.min(100,s.progress);
 if(s.progress>=100){s.status='failed';s.affected=['MELCHIOR','BALTHASAR','CASPER'];s.failures=(Number(s.failures)||0)+1;s.message='三基の侵食が限界に到達。審議を停止しています。警報確認から正常待機への復旧を選択してください。';}
 addLog('magi',s.message);sound(s.status==='contained'?'done':s.status==='failed'?'warning':'scan');draw();
}
function renderMagiIntrusion(){
 const panel=$('magiIntrusionPanel');if(!panel)return;
 const s=intrusionState(),active=magiIntrusionActive();panel.dataset.status=s.status;
 meteoText('intrusionPhase',String(s.phase).padStart(2,'0')+' / 05');meteoText('intrusionMessage',s.message);meteoText('intrusionPercent',s.progress+'%');
 $('intrusionRing').style.setProperty('--intrusion-progress',s.progress+'%');
 meteoText('intrusionCircuit',s.status==='idle'||s.status==='contained'?'外部回線：正常':s.status==='detected'?'外部回線：未隔離':'MAGI外部回線：隔離中 / 都市通信：維持');
 const names=['MELCHIOR','BALTHASAR','CASPER'];
 for(const name of names){const node=qs('[data-intrusion-core="'+name+'"]'),hit=s.affected.includes(name);node.dataset.infected=String(hit);node.querySelector('b').textContent=hit?'侵食':active?'保全中':'正常';}
 const actions=$('intrusionActions');actions.replaceChildren();
 const keys={detected:['isolate','restart'],isolated:['analyze','restart'],analyzed:['reverse','firewall'],countermeasure:['execute','firewall']}[s.status]||[];
 for(const key of keys){const info=intrusionActions[key],button=document.createElement('button'),b=document.createElement('b'),small=document.createElement('span');button.type='button';button.dataset.intrusionAction=key;b.textContent=info.label;small.textContent=info.effect;button.append(b,small);button.addEventListener('click',()=>magiIntrusionAction(key));actions.append(button);}
 $('intrusionStart').hidden=active;$('intrusionRecover').hidden=s.status!=='failed';
 meteoText('intrusionStart',s.status==='contained'?'侵入訓練をもう一度開始':'侵入訓練を開始');
 $('magiVote').disabled=active;
 if(active)meteoText('magiLiveState','侵食検知 / 通常審議停止');
 // Current core impairment remains visible on the consensus board as well.
 for(const name of names){const code={MELCHIOR:'M',BALTHASAR:'B',CASPER:'C'}[name],node=$('m'+code+'Status')?.parentElement;if(node){node.dataset.infected=String(active&&s.affected.includes(name));if(active&&s.affected.includes(name))meteoText('m'+code+'Status','侵食');}}
}
function initMagiIntrusion(){
 if(!qs('#staffSupport'))return;
 const panel=document.createElement('section');panel.id='magiIntrusionPanel';panel.className='staff-panel intrusion-panel';
 panel.innerHTML='<div class="staff-panel-title"><h2>MAGI侵入対処</h2><b id="intrusionPhase">00 / 05</b></div><p class="staff-note">SIMULATION / 第拾参話「使徒、侵入」をモチーフにした独自訓練。選択時に進行する訓練です。</p><div class="intrusion-instruments"><div class="intrusion-ring" id="intrusionRing"><i></i><strong id="intrusionPercent">0%</strong><small>CONTAMINATION</small></div><div class="intrusion-cores"><div data-intrusion-core="MELCHIOR">MELCHIOR-1<b>正常</b></div><div data-intrusion-core="BALTHASAR">BALTHASAR-2<b>正常</b></div><div data-intrusion-core="CASPER">CASPER-3<b>正常</b></div></div></div><p id="intrusionCircuit" class="intrusion-circuit"></p><p id="intrusionMessage" class="intrusion-message" role="status"></p><div id="intrusionActions" class="intrusion-actions"></div><button id="intrusionStart" class="staff-primary">侵入訓練を開始</button><button id="intrusionRecover" class="staff-primary">警報確認・正常復旧へ</button><nav class="staff-route"><button data-route="magi/request">通常の審議申請へ ↗</button><button data-route="infra/systems">都市系統を確認 ↗</button></nav>';
 qs('.page[data-page="magi"]').append(panel);
 $('intrusionStart').addEventListener('click',startMagiIntrusion);$('intrusionRecover').addEventListener('click',()=>openAlertReview());
 const priorMagi=renderMAGI;renderMAGI=function(){priorMagi();renderMagiIntrusion();};
 renderMagiIntrusion();
}
initMagiIntrusion();
// Explicit operator recovery: backup first, cancel pending commands, persist, then acknowledge.
let recoveryBusy=false,alertReturnFocus=null;
function openAlertReview(mode='alert'){
 if(recoveryBusy)return;
 const alert=terminalAlert(),modal=$('alertReview');if(!modal)return;
 alertReturnFocus=document.activeElement;
 meteoText('alertReviewTitle',mode==='end'?'作戦終了の確認':alert.title||'正常待機への復帰');
 meteoText('alertReviewDescription',mode==='end'?'進行中の作戦を終了して正常待機へ戻しますか。':alert.message||'全系統を正常待機へ戻します。');
 modal.classList.remove('hidden');$('alertContinue').focus();
}
function closeAlertReview(){if(recoveryBusy)return;$('alertReview').classList.add('hidden');if(alertReturnFocus?.isConnected)alertReturnFocus.focus();}
function recoveredStaffState(previous){
 const next=JSON.parse(JSON.stringify(previous));
 next.infra={...next.infra,power:true,comms:true,armor:false};
 next.evas=next.evas.map(e=>({...e,state:'HANGAR',power:300,at:false,umbilical:true,powerUpdatedAt:null}));
 next.magi={...next.magi,approvedFor:null,vote:null,interceptApproval:null};
 if(next.magi.intrusion)next.magi.intrusion={...next.magi.intrusion,status:'idle',progress:0,phase:0,affected:[],message:'警報クリア / MAGI正常待機'};
 next.mission={...next.mission,phase:0};next.ops={...next.ops,currentMissionLocks:0,missionAwarded:false};
 next.tactics={...next.tactics,charge:0,heat:0,scans:0};
 const d=next.defense;
 Object.assign(d,{status:'idle',enemy:null,round:0,scans:0,breach:0,energy:100,security:100,connected:false,shutdown:false,magivote:null,magiround:-1,alert:false,usedV27Shot:false,last:'警報クリア / 全系統正常待機'});
 d.city=d.city.map((c,i)=>({...c,hp:100,armor:i===3}));
 const entry={time:hhmmss(),text:'警報クリア / 都市復旧・全EVA回収・作戦終了'};
 for(const type of ['infra','eva','mission'])next.logs[type]=[entry,...(next.logs[type]||[])].slice(0,35);
 return next;
}
async function clearTerminalAlert(){
 if(recoveryBusy)return;
 recoveryBusy=true;$('alertClear').disabled=true;$('alertContinue').disabled=true;$('alertTarget').disabled=true;
 const previous=JSON.parse(JSON.stringify(S));let changed=false;
 try{
  const backup=await callNative('backupState',{state:previous});if(backup?.error)throw Error('事前バックアップ：'+backup.error);
  cancelSequence();stopSound();clearTimeout(saveTimeout);
  S=recoveredStaffState(previous);changed=true;
  const result=await callNative('persist',{state:JSON.parse(JSON.stringify(S))});if(result?.error)throw Error('復旧状態の保存：'+result.error);
  $('alertReview').classList.add('hidden');draw();sound('ok');toast('警報をクリアしました。都市・全EVAは正常待機です。');
  if(alertReturnFocus?.isConnected)alertReturnFocus.focus();
 }catch(error){
  if(changed){S=previous;draw();}
  meteoText('alertReviewDescription','クリアを中止しました。'+error.message);toast('状態を保存できないため、警報を維持します。');
 }finally{recoveryBusy=false;$('alertClear').disabled=false;$('alertContinue').disabled=false;$('alertTarget').disabled=false;}
}
// Presentation only: derive readouts and warnings from the existing game state.
function terminalAlert(){
 if(!S.infra.power)return {level:'critical',key:'power',title:'主電源停止',message:'都市の電力供給が停止しています。補助系統・主電源を確認してください。',page:'infra'};
 if(!S.infra.comms)return {level:'critical',key:'comms',title:'通信回線断',message:'作戦通信がオフラインです。都市インフラの通信系統を復旧してください。',page:'infra'};
 const lost=S.evas.findIndex(e=>e.state==='POWER_LOST');
 if(lost>=0)return {level:'critical',key:'eva-'+lost,title:'EVA 電源喪失',message:'UNIT-0'+lost+' の内部電源が枯渇。機体の帰投・回収を指示してください。',page:'eva'};
 if(magiIntrusionActive())return {level:'critical',key:'magi-intrusion',title:'MAGI 外部侵入',message:'MAGIへの侵食を検知。通常審議を停止しています。侵入対処で封じ込めてください。',page:'magi'};
 if(S.defense?.status==='defeat'||S.defense?.city?.some(c=>c.hp<=0))return {level:'critical',key:'city-damage',title:'都市防衛網 損傷',message:'都市施設の機能停止を検知。都市管制で状態を確認するか、警報クリアで正常待機へ復旧してください。',page:'infra'};
 if(S.defense?.status==='active')return {level:'watch',key:'enemy-'+S.defense.caseNo,title:'敵性反応 接近',message:'都市防衛 CASE '+String(S.defense.caseNo).padStart(3,'0')+' / 接近まで '+S.defense.enemy.dist+' ターン。波形解析・MAGI戦術審議を確認。',page:'infra'};
 if(S.mission.phase>0&&S.mission.phase<6)return {level:'watch',key:'mission',title:'作戦進行中',message:'PHASE '+String(S.mission.phase).padStart(2,'0')+' / EVA・MAGI・作戦管制の連携条件を確認してください。',page:'mission'};
 return {level:'nominal',key:'nominal'};
}
function renderLauncher(){
 const put=(id,value)=>{const el=$(id);if(el)el.textContent=value;};
 const weather=weatherCurrent();
 const temperature=Number.isFinite(weather?.temperature_2m)?Math.round(weather.temperature_2m)+'°':'--°';
 put('launcherWeather',weather?'保存気象 '+temperature+' / '+(S.weather.place||'現在地'):'気象データ未取得');
 put('launcherInfra',S.defense?.status==='active'?'敵性反応 / 都市防衛中':!S.infra.power||!S.infra.comms?'系統異常 / 要確認':'都市防衛 / '+({idle:'待機中',victory:'迎撃成功',defeat:'復旧待ち'}[S.defense?.status]||'待機中'));
 put('launcherEva','出撃 '+S.evas.filter(e=>e.state==='DEPLOYED').length+' / 3');
 put('launcherMission',staffStageNames[S.mission.phase]||'状況確認');
 put('launcherMagi',magiIntrusionActive()?'侵食検知 / 審議停止中':S.magi.approvedFor!=null?'UNIT-0'+S.magi.approvedFor+' / 出撃承認済':'三基審議 / 待機中');
 put('launcherTools','未完了タスク '+S.tasks.filter(t=>!t.done).length);
 put('launcherSettings','効果音 '+(S.prefs.sound?'ON':'OFF')+' / 演出 '+(S.prefs.motion?'ON':'OFF'));
 const slider=$('soundVolume');if(slider){slider.value=String(S.prefs.soundVolume??55);$('soundVolumeValue').textContent=slider.value+'%';}
}
function initTerminalEffects(){
 const launcher=qs('#commandLauncher');if(!launcher)return; // Node-only DOM harness has no mounted UI.
 const ambient=document.createElement('div');ambient.className='terminal-ambient';ambient.setAttribute('aria-hidden','true');
 ambient.innerHTML='<i class="ambient-scan"></i><i class="ambient-rail"></i>';qs('#shell').prepend(ambient);
 let alertKey=null,alertPage='infra';
 function renderTerminalAlert(){
  const state=terminalAlert(),panel=$('commandAlert'),visible=state.level!=='nominal';
  const put=(id,text)=>{const el=$(id);if(el.textContent!==text)el.textContent=text;};
  panel.classList.toggle('hidden',!visible);panel.dataset.level=state.level;
  document.body.dataset.alert=state.level;
  if(visible){
   put('commandAlertCode',state.level==='critical'?'EMERGENCY / SYSTEM FAILURE':'TACTICAL / CONDITION ALERT');
   put('commandAlertTitle',state.title);put('commandAlertMessage',state.message);alertPage=state.page;
  }
  // One finite cue on a new incident; redraws and navigation never restart it.
  if(alertKey!==null&&alertKey!==state.key&&visible)sound(state.level==='critical'?'alarm':'warning');
  alertKey=state.key;
 }
 const priorDraw=draw;draw=function(){priorDraw();renderLauncher();renderTerminalAlert();};
 const priorAlert=renderTacticalAlert;renderTacticalAlert=function(){priorAlert();renderTerminalAlert();};
 const priorSettings=renderSettings;renderSettings=function(){priorSettings();renderLauncher();};
 const priorGo=go;go=function(page){
  if(page==='magi'&&currentPage==='eva')S.magi.purpose='sortie';
  if(page==='magi'&&currentPage==='infra')S.magi.purpose='intercept';
  priorGo(page);document.body.dataset.page=currentPage;
  if(isMoving()){
   const active=qs('.page.active');active.classList.remove('terminal-enter');void active.offsetWidth;active.classList.add('terminal-enter');
  }
 };
 window.NERV_TEST.open=go;
 $('commandAlertOpen').addEventListener('click',()=>openAlertReview());
 $('alertContinue').addEventListener('click',closeAlertReview);
 $('alertClear').addEventListener('click',clearTerminalAlert);
 $('alertTarget').addEventListener('click',()=>{if(recoveryBusy)return;closeAlertReview();go(alertPage);if(window.NERV_MOBILE)window.NERV_MOBILE.open(alertPage,alertPage==='infra'?(S.infra.power&&S.infra.comms?'facilities':'systems'):alertPage==='magi'?'intrusion':'control');});
 $('alertReview').addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();closeAlertReview();}
  if(event.key==='Tab'){const buttons=all('#alertReview button:not(:disabled)');if(!buttons.length){event.preventDefault();return;}const first=buttons[0],last=buttons[buttons.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
 });
 window.NERV_TEST.reviewAlert=openAlertReview;
 document.body.dataset.page=currentPage;
 $('soundVolume').addEventListener('input',event=>{
  S.prefs.soundVolume=Number(event.target.value);$('soundVolumeValue').textContent=event.target.value+'%';
  if(audio&&soundBus)soundBus.gain.setTargetAtTime(soundLevel(),audio.currentTime,.025);persist();
 });
 $('soundPreview').addEventListener('click',()=>{if(S.prefs.sound)sound('launch');else toast('効果音をONにしてから確認してください');});
 document.addEventListener('pointerdown',event=>{
  if(S.prefs.sound){try{prepareSound();}catch(e){}}
  const button=event.target.closest('button');
  if(button&&isMoving()){button.classList.remove('terminal-press');void button.offsetWidth;button.classList.add('terminal-press');}
 },{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSound();});
 const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const motionChange=()=>{if(media?.matches)all('.terminal-enter,.terminal-press').forEach(el=>el.classList.remove('terminal-enter','terminal-press'));};
 if(media?.addEventListener)media.addEventListener('change',motionChange);
 renderLauncher();renderTerminalAlert();
}
initTerminalEffects();
// Independent, addressable sections keep one iPhone task on screen at a time.
const mobileGroups={},mobileCurrent={};
function mobileSection(page,id){return mobileGroups[page]?.panels.find(p=>p.dataset.view===id);}
function mobileNavigate(page,view,push=true){
 const group=mobileGroups[page];
 if(group){view=mobileSection(page,view)?view:group.defaultView;mobileCurrent[page]=view;
  for(const panel of group.panels)panel.hidden=panel.dataset.view!==view;
  for(const button of group.nav.querySelectorAll('button')){const active=button.dataset.mobileTab===page+'/'+view;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;}
  group.nav.hidden=page==='tools'&&view==='desk';
  const selectedTab=group.nav.querySelector('[aria-selected="true"]');if(selectedTab)group.nav.scrollLeft=Math.max(0,selectedTab.offsetLeft-group.nav.offsetLeft-(group.nav.clientWidth-selectedTab.clientWidth)/2);
 }
 const route=page+(group?'/'+view:'');
 if(push&&location.hash!=='#'+route)history.pushState({},'', '#'+route);
 if(page==='infra'&&view==='geography')ensureMap();
 if(page==='weather'&&view==='radar')setTimeout(()=>meteoPaintMap(true),0);
 window.scrollTo({top:0,behavior:'instant'});
 window.dispatchEvent(new CustomEvent('nerv-route',{detail:{page,view}}));
}
function mobileGroup(pageName,definitions,defaultView){
 const page=qs('.page[data-page="'+pageName+'"]');if(!page)return;
 const nav=document.createElement('nav');nav.className='mobile-tabs';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','表示内容');
 const panels=[];
 for(const definition of definitions){
  let panel=definition.existing?page.querySelector('[data-view="'+definition.id+'"]'):document.createElement('section');
  if(!panel)continue;
  if(!definition.existing){panel.className='mobile-view';panel.dataset.view=definition.id;for(const selector of definition.selectors)for(const node of [...page.querySelectorAll(selector)])panel.append(node);page.append(panel);}
  panel.id='mobile-'+pageName+'-'+definition.id;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-label',definition.label);panel.hidden=true;panels.push(panel);
  const button=document.createElement('button');button.type='button';button.dataset.mobileTab=pageName+'/'+definition.id;button.textContent=definition.label;button.setAttribute('role','tab');button.setAttribute('aria-controls',panel.id);button.addEventListener('click',()=>mobileNavigate(pageName,definition.id));nav.append(button);
 }
 const anchor=page.querySelector('.page-top')||page.querySelector('.meteo-notice');if(anchor)anchor.after(nav);else page.prepend(nav);
 nav.addEventListener('keydown',event=>{const buttons=[...nav.querySelectorAll('button')],index=buttons.indexOf(document.activeElement);if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowLeft'?-1:1)+buttons.length)%buttons.length;buttons[next].click();buttons[next].focus();});
 mobileGroups[pageName]={panels,nav,defaultView};mobileNavigate(pageName,defaultView,false);
}
function initMobileViews(){
 if(!qs('#staffSupport'))return;
 mobileGroup('tools',[['desk','一覧'],['identity','職員証'],['communications','通信'],['device','端末'],['tasks','タスク'],['duty','当直'],['handover','引継ぎ'],['inspection','点検'],['timer','タイマー']].map(([id,label])=>({id,label,existing:true})),'desk');
 mobileGroup('eva',[
  {id:'monitor',label:'機体監視',selectors:['.eva-display']},
  {id:'control',label:'発進管制',selectors:['.eva-ops-header','.eva-action-grid','#evaGuidance']},
  {id:'readiness',label:'機体点検・給電',selectors:['#evaReadiness']},
  {id:'telemetry',label:'数値監視',selectors:['.eva-magi-readout','.eva-stats','.eva-systems']},
  {id:'log',label:'運用記録',selectors:['.eva-log-heading','#evaLog']}
 ],'monitor');
 mobileGroup('magi',[
  {id:'request',label:'審議申請',selectors:['#magiRequestPanel']},
  {id:'consensus',label:'三基合議',selectors:['#magiBoard']},
  {id:'intrusion',label:'侵入対処',selectors:['#magiIntrusionPanel']},
  {id:'log',label:'決議履歴',selectors:['#magiLog']}
 ],'request');
 mobileGroup('mission',[
  {id:'orders',label:'指揮',selectors:['#missionOrdersPanel']},
  {id:'status',label:'状況',selectors:['#missionStatusPanel']},
  {id:'checks',label:'実行条件',selectors:['#staffChecklist']},
  {id:'strategy',label:'防衛方針',selectors:['#missionStrategyPanel']},
  {id:'log',label:'記録',selectors:['#missionLogPanel']}
 ],'orders');
 mobileGroup('infra',[
  {id:'map',label:'防衛地図',selectors:['.v27-head','.v27-kpi:not(#defenseTurnStats)','#v27IsoMap','.v27-readbar','#v27Facilities']},
  {id:'facilities',label:'施設・迎撃',selectors:['#v27DefenseBoard']},
  {id:'systems',label:'都市系統',selectors:['#infraSystems']},
  {id:'geography',label:'実地図',selectors:['.infra-status']},
  {id:'log',label:'記録',selectors:['#infraRecords','#v27DefenseBoard .v27-mini']}
 ],'map');
 mobileGroup('weather',[
  {id:'current',label:'現在・予報',selectors:['#meteoCurrentPanel','.meteo-hourly','#weatherFetch','#weatherStatus']},
  {id:'radar',label:'雨雲',selectors:['#meteoRadarPanel']},
  {id:'region',label:'地域',selectors:['#meteoRegionalPanel','.meteo-river']},
  {id:'advice',label:'参考情報',selectors:['#meteoAlertPanel','.meteo-guidance']}
 ],'current');
 const oldWeatherNav=qs('.meteo-nav');if(oldWeatherNav)oldWeatherNav.hidden=true;
 const weatherGrid=qs('.meteo-grid');if(weatherGrid&&!weatherGrid.children.length)weatherGrid.remove();
 mobileGroup('settings',[
  {id:'display',label:'表示・音',selectors:['#soundSwitch','.setting-audio','#motionSwitch','#bootSwitch']},
  {id:'data',label:'通信・データ',selectors:['#autoWeatherSwitch','#clearTasks','#resetSim','.privacy']}
 ],'display');
 const priorGo=go;go=function(page){const from=currentPage;priorGo(page);const initial=page==='magi'&&magiIntrusionActive()?'intrusion':page==='eva'&&['mission','magi'].includes(from)?'control':mobileGroups[page]?.defaultView;mobileNavigate(page,initial);};
 window.NERV_TEST.open=go;
 window.NERV_MOBILE={open:(page,view)=>{if(currentPage!==page)priorGo(page);mobileNavigate(page,view);},view:page=>mobileCurrent[page]};
 for(const button of all('[data-mobile-go]'))button.addEventListener('click',()=>{const [page,view]=button.dataset.mobileGo.split('/');window.NERV_MOBILE.open(page,view);});
 let lastVote=S.magi.vote?.time;
 const priorDraw=draw;draw=function(){priorDraw();if(S.magi.vote?.time&&S.magi.vote.time!==lastVote&&currentPage==='magi')mobileNavigate('magi','consensus');lastVote=S.magi.vote?.time;};
 const restore=()=>{const [page,view]=location.hash.slice(1).split('/');if(!['home','weather','infra','eva','magi','mission','tools','settings'].includes(page))return;priorGo(page);mobileNavigate(page,view,false);};
 window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
 if(location.hash)restore();else mobileNavigate(currentPage,mobileGroups[currentPage]?.defaultView);
}
initMobileViews();
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
function evaUmbilicalConnected(index){const e=S.evas[index];if(!['DEPLOYED','POWER_LOST'].includes(e.state))return !!S.infra.power;return typeof e.umbilical==='boolean'?e.umbilical:!!(S.defense?.connected&&S.tactics?.attacker===index);}
function evaExternalPower(index){return !!S.infra.power&&evaUmbilicalConnected(index);}
function toggleEvaCable(index=S.selectedEva){
 settleEvaPower();const e=S.evas[index];if(e.state!=='DEPLOYED'){toast('ケーブル切替は出撃中の機体で実行します。');return;}
 e.umbilical=!evaUmbilicalConnected(index);e.powerUpdatedAt=Date.now();if(index===S.tactics.attacker)S.defense.connected=e.umbilical;
 addLog('eva','UNIT-0'+index+' / アンビリカル '+(e.umbilical?'接続':'解除'));sound('select');draw();
}
function renderEvaOperations(){
 if(!$('evaReadinessList'))return;
 const e=selected(),prepared=['READY','DEPLOYED','POWER_LOST'].includes(e.state);
 const checks=[['主電源・通信',S.infra.power&&S.infra.comms],['エントリープラグ・LCL準備',prepared],['神経接続 / SYNC '+e.sync+'% (SIM)',prepared&&e.sync>=50],['MAGI出撃承認',e.state==='DEPLOYED'||S.magi.approvedFor===S.selectedEva],['拘束解除・射出待機',e.state==='READY'||e.state==='DEPLOYED']];
 const list=$('evaReadinessList');list.replaceChildren();for(const [label,ok] of checks){const li=document.createElement('li');li.textContent=(ok?'確認済：':'未確認：')+label;li.dataset.complete=String(ok);list.append(li);}
 const connected=evaUmbilicalConnected(S.selectedEva);
 $('evaCable').disabled=e.state!=='DEPLOYED';meteoText('evaCable',connected?'アンビリカルを解除':'アンビリカルを接続');
 meteoText('evaCableHint',e.state==='DEPLOYED'?(evaExternalPower(S.selectedEva)?'外部給電中。内部電源の時間消費を停止しています。':'内部電源で稼働。A.T.展開中は消費が増加します。'):'格納ケージ給電。出撃中は機体ごとにケーブルを切り替えられます。');
 meteoText('evaUmbDisplay',connected?(S.infra.power?'UMBILICAL / EXTERNAL POWER':'UMBILICAL / SUPPLY OFFLINE'):'UMBILICAL / INTERNAL POWER');
 meteoText('evaGrid',evaExternalPower(S.selectedEva)?'EXTERNAL':S.infra.power?'INTERNAL':'SUPPLY OFFLINE');
}
function initOperationVisuals(){
 if(!qs('#staffSupport'))return;
 const graphic='<svg viewBox="0 0 320 120" aria-hidden="true"><defs><pattern id="opHatch" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><rect width="6" height="12" fill="#dca04b"/></pattern></defs><rect x="5" y="5" width="310" height="110" fill="#091612" stroke="#568a70"/><path class="op-power" d="M15 100H90V40H230V100H305" fill="none" stroke="#77e5c3" stroke-width="3"/><g class="op-city"><path d="M75 105V65H110V105M125 105V40H165V105M180 105V55H220V105M230 105V70H260V105" fill="#1d4d40" stroke="#b3d6b2"/></g><g class="op-gate-left"><rect x="12" y="12" width="148" height="96" fill="#50331f" stroke="#ffbe6a"/><rect x="20" y="18" width="132" height="10" fill="url(#opHatch)"/><path d="M30 42h100M30 58h100M30 74h100M30 90h100" stroke="#b07839"/></g><g class="op-gate-right"><rect x="160" y="12" width="148" height="96" fill="#50331f" stroke="#ffbe6a"/><rect x="168" y="18" width="132" height="10" fill="url(#opHatch)"/><path d="M184 42h100M184 58h100M184 74h100M184 90h100" stroke="#b07839"/></g><g class="op-eva"><path d="M152 28l8-8 8 8-3 13 12 18-5 7-9-15 2 28 10 26h-9l-9-24-7 24h-9l11-28 2-25-10 13-6-7 14-19z" fill="#d9b56e" stroke="#e4f0ba"/></g><path class="op-beam" d="M170 50L300 15" stroke="#b9fbec" stroke-width="5"/></svg>';
 const scene=document.createElement('div');scene.id='operationVisual';scene.className='operation-visual hidden';scene.setAttribute('role','status');scene.innerHTML='<b id="operationVisualLabel"></b>'+graphic;qs('#shell').append(scene);
 const system=document.createElement('div');system.id='citySystemsVisual';system.className='city-system-visual';system.innerHTML='<div class="panel-overline">ARMOR / POWER GRID <b id="cityVisualState"></b></div>'+graphic.replaceAll('opHatch','systemHatch');$('infraSystems').prepend(system);
 const emblem=qs('.seq-emblem');if(emblem){emblem.classList.add('sequence-mechanism');emblem.innerHTML='<div class="sequence-mechanical">'+graphic.replaceAll('opHatch','sequenceHatch')+'</div><div class="sequence-magi-display"><div class="sequence-magi-core" data-core="MELCHIOR">MELCHIOR-1<b>待機</b></div><div class="sequence-magi-core" data-core="BALTHASAR">BALTHASAR-2<b>待機</b></div><div class="sequence-magi-core" data-core="CASPER">CASPER-3<b>待機</b></div></div>';}
 let previous=null,hideTimer=null;
 const snapshot=()=>({armor:S.infra.armor,power:S.infra.power,comms:S.infra.comms,round:S.defense.round,scans:S.defense.scans,energy:S.defense.energy,city:S.defense.city.map(c=>[c.hp,c.armor,c.turret]),units:S.evas.map(e=>[e.state,e.at,e.umbilical,e.mapSector]),charge:S.tactics.charge,vote:S.magi.vote?.time});
 function renderVisuals(){
  system.dataset.closed=String(S.infra.armor);system.dataset.power=String(S.infra.power);meteoText('cityVisualState',S.infra.armor?'SHUTTERS CLOSED':'SHUTTERS OPEN');
  const now=snapshot();if(!previous){previous=now;return;}const old=previous;previous=now;
  let kind='',label='';
  if(now.armor!==old.armor){kind=now.armor?'armor-close':'armor-open';label=now.armor?'装甲防壁を閉鎖':'装甲防壁を開放';}
  else if(now.power!==old.power||now.comms!==old.comms){kind='power';label=now.power&&now.comms?'電源・通信系統 接続':'系統切替 / 状態更新';}
  else if(now.units.some((u,i)=>JSON.stringify(u)!==JSON.stringify(old.units[i]))){const index=now.units.findIndex((u,i)=>JSON.stringify(u)!==JSON.stringify(old.units[i]));scene.dataset.unit=String(index);const sprite=scene.querySelector('.mechanism-eva');if(sprite)sprite.dataset.unit=String(index);kind='eva';label='UNIT-0'+index+' / 機体・配置・電源経路を更新';}
  else if(now.city.some((c,i)=>c[1]!==old.city[i][1])){kind='armor-close';label='防衛区画の装甲を展開';}
  else if(now.city.some((c,i)=>c[2]!==old.city[i][2])){kind='combat';label='迎撃砲台を配備';}
  else if(now.city.some((c,i)=>c[0]>old.city[i][0])){kind='repair';label='施設の復旧・修理';}
  else if(now.round!==old.round){kind='combat';label='防衛ターン更新 / 迎撃・接近';}
  else if(now.scans!==old.scans){kind='scan';label='対象波形を解析';}
  else if(now.energy!==old.energy||now.charge!==old.charge){kind='power';label='電力を配分・充填';}
  else if(now.vote!==old.vote){kind='scan';label='MAGIシステム / 決議を確定';}
  if(!kind)return;
  scene.dataset.operation=kind;scene.classList.remove('hidden','operation-running');void scene.offsetWidth;scene.classList.add('operation-running');meteoText('operationVisualLabel',label);clearTimeout(hideTimer);hideTimer=setTimeout(()=>scene.classList.add('hidden'),1700);
 }
 const oldDraw=draw;draw=function(){oldDraw();renderEvaOperations();renderStrategy();renderVisuals();};
 const oldInfra=renderInfra;renderInfra=function(){oldInfra();renderVisuals();};
 const oldEva=renderEVA;renderEVA=function(){oldEva();renderEvaOperations();};
 $('evaCable').addEventListener('click',()=>toggleEvaCable());
 initStrategy();renderEvaOperations();renderStrategy();renderVisuals();
}
initOperationVisuals();
// One shared, transparent drawing sheet serves monitors, small mechanisms and map markers.
function evaMapSector(index){const value=S.evas[index].mapSector;return [0,1,2,3].includes(value)?value:index===S.tactics.defender?3:index===S.tactics.attacker?1:2;}
async function setEvaMapSector(index,sector){
 if(![0,1,2].includes(index)||![0,1,2,3].includes(sector))return;
 if(!await backupVisualUpgrade()){renderCommandMap();return;}
 const e=S.evas[index];settleEvaPower();
 if(e.state!=='DEPLOYED'||!S.infra.comms){toast('移動不可 / 出撃状態と都市通信を確認してください。');renderCommandMap();return;}
 e.mapSector=sector;addLog('eva','UNIT-0'+index+' を '+V27_FACILITY[sector].name+' へ移動');sound('select');draw();
}
function commandMessage(page){
 const e=selected(),d=S.defense,v=S.magi.vote,s=intrusionState();
 if(page==='magi'){if(magiIntrusionActive()||(s.status==='contained'&&!v))return s.message;return v?$('magiDecision').textContent.replace(/\n/g,' ／ '):'審議内容と対象機を選択 → 決議を実行 → 三基の賛否と理由を確認';}
 if(page==='eva')return 'UNIT-0'+S.selectedEva+' ／ '+stateJP[e.state]+' ／ '+(e.state==='DEPLOYED'?(evaExternalPower(S.selectedEva)?'外部給電':'内部電源 '+Math.ceil(e.power)+'秒')+' ／ 配置：'+V27_FACILITY[evaMapSector(S.selectedEva)].name:$('evaGuidance').textContent);
 if(page==='infra')return d.status==='active'?'敵性反応 '+d.enemy.code+' ／ 接近 '+d.enemy.dist+'ターン ／ '+d.last:'都市健全性 '+v27CityIntegrity()+'% ／ '+d.last;
 if(page==='mission')return staffStageNames[S.mission.phase]+' ／ 次の指示：'+$('missionAction').textContent+' ／ '+$('staffNextHint').textContent;
 if(page==='weather')return busyWeather?'現在地と気象を取得しています。位置情報の許可を確認してください。':weatherCurrent()?(S.weather.place||'現在地')+' ／ '+$('wxFresh').textContent+' ／ '+$('wxDescription').textContent+' '+$('wxTemp').textContent+'℃ ／ '+($('weatherStatus').textContent||''):'現在地の気象が未取得です。位置情報を許可し、更新してください。';
 if(page==='tools')return '職員支援 ／ '+(S.personnel?.shift?.startedAt&&!S.personnel.shift.endedAt?'当直中':'当直待機')+' ／ タスク・引継ぎ・点検は端末内へ保存';
 return '端末設定 ／ 効果音 '+(S.prefs.sound?'ON':'OFF')+' ／ 動的表示 '+(S.prefs.motion?'ON':'OFF');
}
let commandAnnouncements={};
function announceCommand(text,page=currentPage){commandAnnouncements[page]={text,at:Date.now()};renderCommandStreams();}
function renderCommandStreams(){
 for(const page of ['weather','infra','eva','magi','mission','tools','settings']){
  const stream=qs('[data-command-stream="'+page+'"]');if(!stream)continue;
  const announcement=commandAnnouncements[page],recent=announcement&&Date.now()-announcement.at<10000?announcement.text+' ／ ':'';
  const value=recent+commandMessage(page);if(stream.dataset.message===value)continue;
  stream.dataset.message=value;for(const node of stream.querySelectorAll('.stream-text'))node.textContent=value;
  const reader=stream.querySelector('.stream-reader'),now=Date.now();if(!reader.textContent||!stream.dataset.readAt||now-Number(stream.dataset.readAt)>=10000){reader.textContent=value;stream.dataset.readAt=String(now);}
  stream.style.setProperty('--stream-duration',Math.max(18,Math.min(60,value.length*.3))+'s');
 }
}
function renderCommandMap(){
 const d=S.defense;let deployed=0;
 for(let index=0;index<3;index++){
  const e=S.evas[index],marker=$('mapEva'+index),row=qs('[data-map-unit="'+index+'"]');
  const visible=['DEPLOYED','POWER_LOST'].includes(e.state);marker.classList.toggle('v27-visual-off',!visible);row.hidden=!visible;
  if(!visible)continue;deployed++;
  const sector=evaMapSector(index),positions=[[175,248],[340,190],[520,248],[330,340]],point=positions[sector];
  const x=point[0]+(index-1)*20,y=point[1]+index*8;marker.style.transform='translate('+x+'px,'+y+'px)';marker.dataset.state=e.state;
  marker.setAttribute('aria-label','UNIT-0'+index+' / '+V27_FACILITY[sector].name+' / '+stateJP[e.state]+'。機体監視を開く');
  row.querySelector('select').value=String(sector);row.querySelector('select').disabled=e.state!=='DEPLOYED'||!S.infra.comms;
  row.querySelector('strong').textContent='UNIT-0'+index+' / '+stateJP[e.state];
 }
 meteoText('mapDefenseHint','配置変更には作戦通信が必要です。防御担当 UNIT-0'+S.tactics.defender+' のA.T.展開は、配置区画の被害を12軽減します（方針倍率前）。');
 $('mapNoEva').hidden=deployed>0;meteoText('mapEnemyName',d.status==='active'?(d.scans>=34?d.enemy.code:'UNIDENTIFIED'):'');
 meteoText('mapTargetStatus',d.status==='active'?'敵性反応：'+d.enemy.code+' / '+d.enemy.dist+'ターンで接近':d.status==='victory'?'敵性反応：沈黙を確認':'敵性反応：未検知');
}
function renderNeuralWaves(){
 const e=selected();for(const [index,wave] of all('.neural-wave').entries()){
  let path='';for(let y=0;y<=180;y+=3){const amplitude=Math.max(3,Math.min(21,e.sync/5));const x=28+Math.sin(y*.16+index+S.selectedEva)*amplitude*Math.sin(y*.053+index);path+=(y?'L':'M')+x.toFixed(1)+' '+y+' ';}wave.querySelector('path').setAttribute('d',path);
 }
}
function initCommandVisuals(){
 if(!qs('#staffSupport'))return;
 // Capture the pre-upgrade state once; explicit new persistent actions await it.
 backupVisualUpgrade();
 const map=$('v27IsoMap');
 for(let i=0;i<3;i++){
  const group=document.createElementNS('http://www.w3.org/2000/svg','g');group.id='mapEva'+i;group.classList.add('map-eva','v27-visual-off');group.setAttribute('role','button');group.setAttribute('tabindex','0');
  group.innerHTML='<rect x="-45" y="-130" width="90" height="160" fill="transparent"/><ellipse class="map-unit-platform" cx="0" cy="0" rx="32" ry="12"/><foreignObject x="-35" y="-135" width="70" height="140"><div xmlns="http://www.w3.org/1999/xhtml" class="eva-sprite" data-unit="'+i+'"></div></foreignObject><text class="map-unit-label" text-anchor="middle" y="22">UNIT-0'+i+'</text>';
  const open=()=>{S.selectedEva=i;persist();window.NERV_MOBILE.open('eva','monitor');};group.addEventListener('click',open);group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});map.append(group);
 }
 const dispatch=document.createElement('section');dispatch.id='mapDispatch';dispatch.className='map-dispatch';dispatch.innerHTML='<p id="mapTargetStatus"></p><h2>出撃機の配置 / DEPLOYMENT</h2><p id="mapDefenseHint"></p><p id="mapNoEva">出撃機なし。EVA管制で発進後、この地図に表示します。</p>';
 for(let i=0;i<3;i++){
  const row=document.createElement('div');row.className='map-unit-row';row.dataset.mapUnit=String(i);row.innerHTML='<span class="map-unit-mini eva-sprite" data-unit="'+i+'" aria-hidden="true"></span><strong>UNIT-0'+i+'</strong><label><span class="sr-only">UNIT-0'+i+'の配置</span><select data-map-sector="'+i+'">'+V27_FACILITY.map((f,j)=>'<option value="'+j+'">'+f.name+'</option>').join('')+'</select></label>';
  row.querySelector('select').addEventListener('change',event=>{setEvaMapSector(i,Number(event.target.value));});dispatch.append(row);
 }
 const routes=document.createElement('nav');routes.className='staff-route';routes.innerHTML='<button data-route="eva/control">EVA発進管制 ↗</button><button data-route="infra/facilities">施設・迎撃操作 ↗</button>';dispatch.append(routes);
 // A dedicated dispatch tab keeps the mobile map short even with all three units deployed.
 const infra=mobileGroups.infra,panel=document.createElement('section');panel.className='mobile-view';panel.dataset.view='deployment';panel.id='mobile-infra-deployment';panel.setAttribute('role','tabpanel');panel.setAttribute('aria-label','機体配置');panel.hidden=true;panel.append(dispatch);qs('.page[data-page="infra"]').append(panel);infra.panels.push(panel);
 const tab=document.createElement('button');tab.type='button';tab.dataset.mobileTab='infra/deployment';tab.textContent='機体配置';tab.setAttribute('role','tab');tab.setAttribute('aria-controls',panel.id);tab.setAttribute('aria-selected','false');tab.tabIndex=-1;tab.addEventListener('click',()=>mobileNavigate('infra','deployment'));infra.nav.insertBefore(tab,infra.nav.children[1]);
 const mapLinks=document.createElement('nav');mapLinks.className='staff-route map-links';mapLinks.innerHTML='<button data-route="infra/deployment">機体配置・移動 ↗</button><button data-route="infra/facilities">施設・迎撃 ↗</button>';map.after(mapLinks);
 // All new route controls share one handler and target actual page/subsection pairs.
 document.addEventListener('click',event=>{const link=event.target.closest('[data-route]');if(!link)return;const [page,view]=link.dataset.route.split('/');window.NERV_MOBILE.open(page,view);});
 for(const page of ['weather','infra','eva','magi','mission','tools','settings']){
  const root=qs('.page[data-page="'+page+'"]'),stream=document.createElement('section');stream.className='command-stream';stream.dataset.commandStream=page;stream.setAttribute('aria-label','現在の状況');
  stream.innerHTML='<div class="stream-tag">STATUS</div><div class="stream-window" tabindex="0" aria-label="状況テキスト。停止ボタンで横流れを停止できます"><div class="stream-track" aria-hidden="true"><span class="stream-text"></span><span class="stream-text"></span></div></div><p class="stream-reader sr-only" role="status" aria-live="polite"></p><button class="stream-stop" aria-label="状況の横流れを停止" aria-pressed="false">Ⅱ</button>';
  const nav=root.querySelector('.mobile-tabs');nav.after(stream);
  stream.querySelector('button').addEventListener('click',event=>{const paused=stream.classList.toggle('stream-paused');event.currentTarget.setAttribute('aria-pressed',String(paused));event.currentTarget.setAttribute('aria-label',paused?'状況の横流れを再開':'状況の横流れを停止');event.currentTarget.textContent=paused?'▶':'Ⅱ';});
 }
 const splash=document.createElement('div');splash.id='commandSplash';splash.className='command-splash hidden';splash.setAttribute('aria-hidden','true');splash.innerHTML='<i></i><small>NERV / CONTROL LINK</small><strong></strong>';qs('#shell').append(splash);
 let splashTimer=null,lastPage=currentPage;
 window.addEventListener('nerv-route',event=>{const page=event.detail.page;renderCommandStreams();renderCommandMap();if(isMoving()&&lastPage!==page&&page!=='home'){splash.querySelector('strong').textContent=qs('.page[data-page="'+page+'"] h1')?.textContent?.split('/')[0]||'気象監視';splash.classList.remove('hidden','splash-running');void splash.offsetWidth;splash.classList.add('splash-running');clearTimeout(splashTimer);splashTimer=setTimeout(()=>splash.classList.add('hidden'),550);}lastPage=page;});
 const oldDraw=draw;draw=function(){oldDraw();renderCommandMap();renderMagiIntrusion();renderCommandStreams();};
 const oldToast=toast;toast=function(text){oldToast(text);announceCommand(text);};
 const oldLog=addLog;addLog=function(type,text){oldLog(type,text);if(['infra','eva','magi','mission'].includes(type))announceCommand(text,type);};
 // Tiny EVA displays use precisely the same three drawings as the large monitor.
 for(const path of all('.op-eva'))path.remove();
 for(const holder of all('#operationVisual,.sequence-mechanical')){const unit=document.createElement('div');unit.className='mechanism-eva eva-sprite';unit.dataset.unit=String(S.selectedEva);unit.setAttribute('aria-hidden','true');holder.append(unit);}
 for(const side of ['left','right']){const wave=document.createElementNS('http://www.w3.org/2000/svg','svg');wave.setAttribute('viewBox','0 0 56 180');wave.setAttribute('aria-hidden','true');wave.classList.add('neural-wave','neural-'+side);wave.innerHTML='<path fill="none"/><line class="neural-sweep" x1="0" y1="0" x2="56" y2="0"/>';qs('#evaArtwork').append(wave);}
 const oldEva=renderEVA;renderEVA=function(){oldEva();for(const unit of all('.mechanism-eva'))unit.dataset.unit=unit.closest('#operationVisual')?($('operationVisual').dataset.unit||String(S.selectedEva)):String(S.selectedEva);renderNeuralWaves();renderCommandStreams();};renderNeuralWaves();
 renderCommandMap();renderCommandStreams();renderMagiIntrusion();
 // A restored URL can address the dynamically added deployment tab.
 if(location.hash==='#infra/deployment')window.NERV_MOBILE.open('infra','deployment');
}
initCommandVisuals();
// Local staff identity and fictional messages; never grants authority or changes combat.
const staffMessages={
 broadcast:[
  ['本部業務連絡','交代当直の職員は、引継ぎ記録と担当系統の表示を確認してください。'],
  ['館内設備案内','通路・昇降設備の点検確認は職員支援の点検一覧へ記録してください。'],
  ['当直終了の案内','未完了事項は引継ぎ記録に残してください。通信の受領だけでは業務は完了しません。']
 ],
 radio:[
  ['技術部より','端末の表示確認を依頼します。機体状態と給電の確認はEVA運用へ。これは架空の連絡です。'],
  ['管制当直より','次の担当者への連絡事項があれば、引継ぎ記録に区分と内容を登録してください。'],
  ['施設担当より','点検記録の確認をお願いします。この通信では設備や資材の状態は変化しません。']
 ]
};
let staffRadioTimer=0,staffServiceBusy=false;
function wireStaffDialog(dialog){
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const controls=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"]')].filter(el=>el.getClientRects().length);
  const first=controls[0],last=controls[controls.length-1];
  if(!first){event.preventDefault();return;}
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
}
function staffProfile(){const raw=S.personnel,p=raw.profile;return {name:typeof p?.name==='string'?p.name:typeof raw.name==='string'?raw.name:'当直職員',department:typeof p?.department==='string'?p.department:typeof raw.department==='string'?raw.department:'本部管制部'};}
function staffCommsEnabled(){return typeof S.prefs.staffComms==='boolean'?S.prefs.staffComms:S.prefs.hqComms!==false;}
function staffFeed(){
 const p=S.personnel;
 if(Array.isArray(p.messages))return p.messages.filter(m=>m&&typeof m.text==='string').slice(0,12);
 // The separate v2.8 lineage stored name/department/feed/hqComms. Read it
 // without discarding the original fields or rewriting an old backup.
 return (Array.isArray(p.feed)?p.feed:[]).filter(m=>m&&typeof m.text==='string').slice(0,12).map((m,i)=>({...m,id:'legacy-'+m.at+'-'+i,title:m.title||m.source||'職員連絡',read:!!m.ack}));
}
async function updateStaffService(change){
 if(staffServiceBusy)return false;staffServiceBusy=true;
 try{
  if(!await backupVisualUpgrade())throw Error('変更前バックアップを保存できません。');
  // Commit only fields owned by this extension; duty/checks and combat keep their state.
  const next=JSON.parse(JSON.stringify(S));change(next);
  const result=await callNative('persist',{state:next});if(result?.error)throw Error(result.error);
  for(const key of ['profile','messages','dispatch'])if(Object.hasOwn(next.personnel,key))S.personnel[key]=next.personnel[key];
  if(Object.hasOwn(next.prefs,'staffComms'))S.prefs.staffComms=next.prefs.staffComms;
  persist();renderStaffServices();return true;
 }catch(error){meteoText('staffCommsResult','記録できませんでした：'+error.message);meteoText('staffProfileResult','保存できませんでした：'+error.message);toast('職員情報の保存を中止しました。'+error.message);sound('deny');return false;}
 finally{staffServiceBusy=false;}
}
function renderStaffServices(){
 const focusedAck=document.activeElement?.dataset?.staffAck;
 const profile=staffProfile(),active=S.personnel.shift.startedAt&&!S.personnel.shift.endedAt;
 meteoText('staffCardName',profile.name);meteoText('staffCardDepartment',profile.department);meteoText('staffCardDuty',active?'当直中':'待機');
 const feed=staffFeed();meteoText('staffUnread',feed.filter(m=>!m.read).length+' 未受領');
 const enabled=staffCommsEnabled();meteoText('staffCommsFlag',enabled?'ON':'OFF');$('staffCommsToggle').setAttribute('aria-pressed',String(enabled));
 const list=$('staffRadioList');list.replaceChildren();
 for(const message of feed.slice(0,12)){
  const row=document.createElement('article'),time=document.createElement('small'),title=document.createElement('h3'),text=document.createElement('p'),ack=document.createElement('button');
  row.dataset.read=String(!!message.read);time.textContent=(message.kind==='broadcast'?'館内放送':'職員通信')+' / '+new Date(message.at).toLocaleTimeString('ja-JP');title.textContent=message.title;text.textContent=message.text;ack.type='button';ack.dataset.staffAck=message.id;ack.textContent=message.read?'受領済み':'受領を記録';ack.disabled=!!message.read;ack.setAttribute('data-own-sound','');
  ack.addEventListener('click',async()=>{if(await updateStaffService(next=>{next.personnel.messages=staffFeed().map(m=>m.id===message.id?{...m,read:true}:m);})){list.focus();sound('ok');}});
  row.append(time,title,text,ack);list.append(row);
 }
 if(!feed.length)list.textContent='通信待機 / 受信した架空の連絡をここに保存します。';
 if(focusedAck){const target=[...list.querySelectorAll('[data-staff-ack]')].find(b=>b.dataset.staffAck===focusedAck);if(target&&!target.disabled)target.focus({preventScroll:true});else list.focus({preventScroll:true});}
}
async function receiveStaffMessage(kind){
 if(document.hidden||!staffMessages[kind])return false;
 const samples=staffMessages[kind],[title,text]=samples[Math.floor(Math.random()*samples.length)];
 const objectiveKinds=kind==='broadcast'?['inspection','geofront','handover']:['pilot','geofront','inspection'];
 const assignment={kind:objectiveKinds[Math.floor(Math.random()*objectiveKinds.length)],unit:Math.floor(Math.random()*3)};
 const message={assignment,id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),at:Date.now(),kind,title,text,read:false};
 const saved=await updateStaffService(next=>{next.personnel.messages=[message,...staffFeed()].slice(0,12);});
 if(saved){window.dispatchEvent(new CustomEvent('nerv-staff-message',{detail:{id:message.id}}));meteoText('staffCommsResult',(kind==='broadcast'?'館内放送':'職員通信')+'を受信：'+title+'（架空）');announceCommand('架空の職員連絡：'+title+' ／ 職員支援の通信で確認できます。','tools');sound('scan');}
 return saved;
}
function scheduleStaffRadio(){
 clearTimeout(staffRadioTimer);staffRadioTimer=0;
 if(document.hidden||!staffCommsEnabled())return;
 staffRadioTimer=setTimeout(async()=>{if(staffCommsEnabled()&&!document.hidden)await receiveStaffMessage(Math.random()<.35?'broadcast':'radio');scheduleStaffRadio();},90000+Math.random()*90000);
}
function initStaffServices(){
 if(!qs('#staffSupport')||!$('staffIdDialog'))return;
 const profile=staffProfile();$('staffDisplayName').value=profile.name;$('staffDepartment').value=profile.department;
 $('staffProfileForm').addEventListener('submit',async event=>{
  event.preventDefault();const name=$('staffDisplayName').value.trim(),department=$('staffDepartment').value.trim();if(!name||!department)return;
  if(await updateStaffService(next=>{next.personnel.profile={...next.personnel.profile,name:name.slice(0,32),department:department.slice(0,32)};})){meteoText('staffProfileResult','登録情報を端末に保存しました。');sound('ok');}
 });
 const modal=$('staffIdDialog');let returnFocus;
 wireStaffDialog(modal);
 $('staffIdOpen').addEventListener('click',()=>{returnFocus=document.activeElement;renderStaffServices();$('staffIdFront').hidden=false;$('staffIdBack').hidden=true;$('personnelCard').dataset.side='front';$('staffIdFlip').textContent='裏面を表示';$('staffIdFlip').setAttribute('aria-pressed','false');modal.showModal();$('staffIdClose').focus();});
 $('staffIdClose').addEventListener('click',()=>modal.close());modal.addEventListener('close',()=>returnFocus?.isConnected&&returnFocus.focus());
 $('staffIdFlip').addEventListener('click',()=>{const back=$('staffIdBack').hidden;$('staffIdFront').hidden=back;$('staffIdBack').hidden=!back;$('personnelCard').dataset.side=back?'back':'front';$('staffIdFlip').textContent=back?'表面を表示':'裏面を表示';$('staffIdFlip').setAttribute('aria-pressed',String(back));});
 $('staffBroadcast').addEventListener('click',()=>receiveStaffMessage('broadcast'));$('staffRadio').addEventListener('click',()=>receiveStaffMessage('radio'));
 $('staffCommsToggle').addEventListener('click',async()=>{if(await updateStaffService(next=>{next.prefs.staffComms=!staffCommsEnabled();})){scheduleStaffRadio();sound('select');}});
 document.addEventListener('visibilitychange',scheduleStaffRadio);window.addEventListener('pagehide',()=>clearTimeout(staffRadioTimer));window.addEventListener('pageshow',scheduleStaffRadio);
 renderStaffServices();scheduleStaffRadio();
}
initStaffServices();
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
// Additional environments and operator readouts leave the approved EVA sheet intact.
function registerTerminalView(page,id,label){
 const group=mobileGroups[page],panel=qs('.page[data-page="'+page+'"] [data-view="'+id+'"]');
 if(!group||!panel)return;
 panel.id=panel.id||'mobile-'+page+'-'+id;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-label',label);panel.hidden=true;group.panels.push(panel);
 const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.mobileTab=page+'/'+id;button.setAttribute('role','tab');button.setAttribute('aria-controls',panel.id);button.setAttribute('aria-selected','false');button.tabIndex=-1;button.addEventListener('click',()=>mobileNavigate(page,id));group.nav.append(button);
}
const pilotNames=['綾波レイ','碇シンジ','惣流・アスカ・ラングレー'];
function renderWorldTerminal(){
 const d=S.defense,hq=d.city[3],e=selected(),unit=S.selectedEva,armed=d.city.filter((c,i)=>i<3&&c.turret&&c.hp>=25).length;
 meteoText('geofrontState',hq.hp<40?'DAMAGE / SIM':'HQ / SIM');meteoText('geofrontIntegrity',hq.hp+'%');meteoText('geofrontPower',S.infra.power?'給電中':'停電');meteoText('geofrontComms',S.infra.comms?'接続':'通信停止');meteoText('geofrontArmor',hq.armor?'展開':'開放');
 $('geofrontPanel').dataset.power=String(S.infra.power);$('geofrontPanel').dataset.damaged=String(hq.hp<40);
 const index=Math.min(2,d.selected),c=d.city[index];meteoText('armorySector',V27_FACILITY[index].name);meteoText('armoryIntegrity',c.hp+'%');meteoText('armoryTurret',!c.turret?'格納・未配備':c.hp<25?'損傷・停止':S.infra.power&&d.energy>0?'迎撃待機':'給電待機');meteoText('armoryEnergy',d.energy+'%');meteoText('armoryState',armed+' / 3 配備');$('armoryPanel').dataset.deployed=String(c.turret&&c.hp>=25);$('armoryPanel').dataset.power=String(S.infra.power&&d.energy>0);
 all('[data-armory-sector]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.armorySector)===index)));
 const phase={HANGAR:['待機','格納区画・当直待機','発進準備の指示を待機'],READY:['搭乗準備','プラグ接続・待機','MAGI出撃承認と機体条件を確認'],DEPLOYED:['作戦参加中','エントリープラグ内','給電・同期・回収条件を監視'],POWER_LOST:['緊急回収待機','機内・内部電源喪失','EVA運用で回収を指示'],MAINTENANCE:['休息・整備連携','回収後の待機','機体整備の完了を確認']}[e.state]||['状態未取得','未確認','機体運用を確認'];
 meteoText('pilotName',pilotNames[unit]);meteoText('pilotCode',['FIRST CHILDREN','THIRD CHILDREN','SECOND CHILDREN'][unit]);meteoText('pilotUnit','UNIT-0'+unit);meteoText('pilotSync',Number(e.sync).toFixed(1)+'%');meteoText('pilotStatus',phase[0]);meteoText('pilotEntry',phase[1]);meteoText('pilotNext',phase[2]);meteoText('pilotNeural',['READY','DEPLOYED'].includes(e.state)?(e.sync>=50?'接続成立':'同期低下'):'待機・接続対象外');meteoText('pilotSupply',evaExternalPower(unit)?'外部給電':'内部電源 '+Math.ceil(e.power)+'秒');
 $('pilotGauge').style.setProperty('--pilot-sync',Math.max(0,Math.min(100,Number(e.sync)||0))+'%');$('pilotPanel').dataset.state=e.state;
 const operation=$('operationWorld');if(operation){operation.dataset.world=d.selected===3?'headquarters':'armament';operation.dataset.power=String(S.infra.power);}
 all('[data-pilot]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.pilot)===unit)));
 meteoText('bootText','LOCAL SYSTEM READY / 開始操作待ち');meteoText('bootLocalMode',window.__SCRIPTABLE__?'SCRIPTABLE / LOCAL':'BROWSER / LOCAL');meteoText('bootMagiState',magiIntrusionActive()?'侵入対処・審議停止':'三基・審議受付');meteoText('bootEvaState',S.evas.filter(e=>e.state==='DEPLOYED').length+' / 3 出撃');
}
function initWorldTerminal(){
 if(!qs('#staffSupport'))return;
 const source=$('worldPanelTemplates');for(const [id,page] of [['geofrontPanel','infra'],['armoryPanel','infra'],['pilotPanel','eva']])qs('.page[data-page="'+page+'"]').append($(id));source.remove();
 registerTerminalView('infra','geofront','本部・地下施設');registerTerminalView('infra','armory','兵装監視');registerTerminalView('eva','pilots','搭乗者監視');
 const operation=document.createElement('div');operation.id='operationWorld';operation.className='operation-world-panel world-viewport';operation.setAttribute('role','img');operation.setAttribute('aria-label','状態が変化した設備のセル塗り描画');operation.innerHTML='<span class="world-annotation">SYSTEM RESPONSE / SIMULATION</span>';$('operationVisual').append(operation);
 all('[data-pilot]').forEach(b=>b.addEventListener('click',()=>{S.selectedEva=Number(b.dataset.pilot);draw();}));all('[data-armory-sector]').forEach(b=>b.addEventListener('click',()=>{S.defense.selected=Number(b.dataset.armorySector);draw();}));
 $('pilotConfirm').addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('nerv-duty-evidence',{detail:{kind:'pilot',unit:S.selectedEva}}));toast(pilotNames[S.selectedEva]+' / '+$('pilotStatus').textContent+'を確認しました。');});
 $('geofrontInspect').addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('nerv-duty-evidence',{detail:{kind:'geofront'}}));toast('本部健全性 '+S.defense.city[3].hp+'% / 電源・通信の表示を確認しました。');});
 // Replace only the infrastructure glyphs, retaining selection and map markers.
 const hq=qs('#v27IsoMap g[data-v27pick="3"]');hq.querySelector('.v27-top').setAttribute('points','262,285 340,223 418,285 340,318');hq.querySelector('.v27-left').setAttribute('points','262,285 340,223 340,318');hq.querySelector('.v27-right').setAttribute('points','340,223 418,285 340,318');
 for(let i=0;i<3;i++){const group=qs('#v27IsoMap g[data-v27pick="'+i+'"]'),gun=document.createElementNS('http://www.w3.org/2000/svg','g');gun.classList.add('map-armament');gun.dataset.battery=String(i);const x=[181,340,500][i],y=[198,125,198][i];gun.innerHTML='<path d="M'+(x-17)+' '+(y-8)+'l17-8 17 8v15l-17 9-17-9z"/><path class="battery-barrel" d="M'+(x-5)+' '+(y-14)+'l24-34 9 6-24 34z M'+(x+5)+' '+(y-10)+'l24-34 9 6-24 34z"/>';group.append(gun);}
 const oldDraw=draw;draw=function(){oldDraw();renderWorldTerminal();};const oldEva=renderEVA;renderEVA=function(){oldEva();renderWorldTerminal();};
 const updateBatteries=()=>all('[data-battery]').forEach(g=>g.dataset.active=String(S.defense.city[Number(g.dataset.battery)].turret&&S.defense.city[Number(g.dataset.battery)].hp>=25));const oldWorld=renderWorldTerminal;renderWorldTerminal=function(){oldWorld();updateBatteries();};
 document.addEventListener('visibilitychange',()=>document.body.classList.toggle('terminal-hidden',document.hidden));
 window.addEventListener('nerv-route',event=>{if(event.detail.page==='infra'&&event.detail.view==='armory'&&S.defense.selected===3){S.defense.selected=1;draw();}});
 renderWorldTerminal();const [page,view]=location.hash.slice(1).split('/');if(['geofront','armory','pilots'].includes(view))window.NERV_MOBILE.open(page,view);
}
initWorldTerminal();
// Operator jobs are local game objectives, independent of real notifications/combat.
const dutyObjectives={
 pilot:{label:'搭乗者の状態確認',route:['eva','pilots'],instruction:unit=>'UNIT-0'+unit+'の搭乗者監視で「搭乗者の状態を確認」を実行。'},
 geofront:{label:'本部系統の照合',route:['infra','geofront'],instruction:()=> '本部・地下施設で健全性・電源・通信を確認し、「本部の系統表示を確認」を実行。'},
 inspection:{label:'当直5項目の点検',route:['tools','inspection'],instruction:()=> '点検一覧の5項目を確認して「点検結果を照合」を実行。'},
 handover:{label:'引継ぎ記録の登録',route:['tools','handover'],instruction:()=> '受命後に新しい引継ぎ記録を1件登録。'}
};
let visibleStaffMessage=null,staffSignalDismissed=false,pendingStaffMessage=null,pendingStaffCount=0;
function dutyLedger(){const raw=S.personnel.dispatch||{};return {...raw,merit:Math.max(0,Number(raw.merit)||0),completed:Math.max(0,Number(raw.completed)||0),completedIds:Array.isArray(raw.completedIds)?raw.completedIds:[],orders:Array.isArray(raw.orders)?raw.orders.filter(o=>o&&typeof o==='object'):[]};}
function activeDutyOrders(){return dutyLedger().orders.filter(o=>['active','ready'].includes(o.status));}
function orderForMessage(id){const ledger=dutyLedger();return ledger.orders.find(o=>o.id===id)||(ledger.completedIds||[]).includes(id)&&{status:'complete'};}
function setSignalExpanded(expanded){$('staffSignalBody').hidden=!expanded;$('staffSignalExpand').setAttribute('aria-expanded',String(expanded));$('staffSignalExpand').textContent=expanded?'通信を畳む':'通信を開く';document.body.classList.toggle('staff-signal-expanded',expanded);}
function renderStaffSignal(){
 const m=visibleStaffMessage,signal=$('staffSignal');if(!m||staffSignalDismissed)return;
 meteoText('staffSignalTitle',m.title+' / '+(m.assignment?'業務依頼':'館内連絡'));meteoText('staffSignalText',m.text);
 const assignment=m.assignment,order=orderForMessage(m.id),known=assignment&&dutyObjectives[assignment.kind];meteoText('staffSignalObjective',known?dutyObjectives[assignment.kind].instruction(assignment.unit):'内容を確認してください。');
 $('staffSignalAccept').hidden=!known||!!order;$('staffSignalAccept').disabled=activeDutyOrders().length>=3;$('staffSignalWork').textContent=order?'受命済み・業務を確認 ↗':'受命一覧を開く ↗';
 signal.hidden=false;document.body.classList.add('has-staff-signal');
}
function showStaffSignal(message){if(!$('staffSignal').hidden&&!$('staffSignalBody').hidden){pendingStaffMessage=message;pendingStaffCount++;$('staffSignalPending').hidden=false;meteoText('staffSignalPending','新着通信 '+pendingStaffCount+'件 / 通信履歴に保存しました。');return;}pendingStaffMessage=null;pendingStaffCount=0;$('staffSignalPending').hidden=true;staffSignalDismissed=false;visibleStaffMessage=message;setSignalExpanded(false);renderStaffSignal();}
async function acceptDutyMessage(message){
 if(!message?.assignment||!dutyObjectives[message.assignment.kind])return false;
 const saved=await updateStaffService(next=>{
  const ledger=dutyLedger();if(orderForMessage(message.id))throw Error('この業務は受命済みです。');if(activeDutyOrders().length>=3)throw Error('同時受命は3件までです。');
  const order={id:message.id,kind:message.assignment.kind,unit:message.assignment.unit,status:'active',acceptedAt:Date.now(),handoverAt:S.personnel.handover[0]?.at||0};
  const active=activeDutyOrders(),retained=[...active,...ledger.orders.filter(o=>o.status==='complete').slice(0,11-active.length)];next.personnel.dispatch={...ledger,orders:[order,...retained]};
 });
 if(saved){renderDutyDispatch();renderStaffSignal();meteoText('dutyDispatchResult','受命しました。対象画面で確認後、完了を報告してください。');sound('ok');}
 return saved;
}
async function recordDutyEvidence(detail){
 const eligible=activeDutyOrders().filter(o=>o.status==='active'&&o.kind===detail.kind&&(o.kind!=='pilot'||o.unit===detail.unit)&&(o.kind!=='handover'||detail.registered===true));
 if(!eligible.length)return;
 const ids=eligible.map(o=>o.id);if(await updateStaffService(next=>{const ledger=dutyLedger();next.personnel.dispatch={...ledger,orders:ledger.orders.map(o=>ids.includes(o.id)&&o.status==='active'?{...o,status:'ready',verifiedAt:Date.now()}:o)};})){renderDutyDispatch();meteoText('dutyDispatchResult','作業を確認しました。受命一覧で完了を報告できます。');announceCommand('職員業務の確認完了 / 受命一覧から完了報告できます。',currentPage);}
}
async function reportDutyOrder(id){
 if(await updateStaffService(next=>{const ledger=dutyLedger(),order=ledger.orders.find(o=>o.id===id);if(!order||order.status!=='ready')throw Error('先に対象画面で業務を確認してください。');next.personnel.dispatch={...ledger,merit:ledger.merit+10,completed:ledger.completed+1,completedIds:[id,...(ledger.completedIds||[])].slice(0,200),orders:ledger.orders.map(o=>o.id===id?{...o,status:'complete',completedAt:Date.now()}:o)};})){renderDutyDispatch();renderStaffSignal();meteoText('dutyDispatchResult','完了報告を記録しました。勤務評価＋10PT。');sound('done');}
}
function renderDutyDispatch(){
 const ledger=dutyLedger();meteoText('dutyMerit',ledger.merit+' PT / '+ledger.completed+'件完了');const list=$('dutyOrderList');if(!list)return;list.replaceChildren();
 for(const order of ledger.orders){const info=dutyObjectives[order.kind];if(!info)continue;
  const article=document.createElement('article'),heading=document.createElement('h3'),status=document.createElement('b'),text=document.createElement('p'),work=document.createElement('button'),report=document.createElement('button');article.dataset.order=order.id;article.dataset.status=order.status;heading.textContent=info.label+(order.kind==='pilot'?' / UNIT-0'+order.unit:'');status.textContent={active:'作業待ち',ready:'報告待ち',complete:'報告済み'}[order.status]||'確認';text.textContent=info.instruction(order.unit);work.type='button';work.textContent='対象画面で作業 ↗';work.hidden=order.status==='complete';work.addEventListener('click',()=>{if(order.kind==='pilot'){S.selectedEva=order.unit;draw();}window.NERV_MOBILE.open(...info.route);});report.type='button';report.setAttribute('data-own-sound','');report.textContent=order.status==='complete'?'完了済み':'完了を報告 / ＋10PT';report.disabled=order.status!=='ready';report.addEventListener('click',()=>reportDutyOrder(order.id));article.append(heading,status,text,work,report);list.append(article);
 }
 if(!ledger.orders.length)list.textContent='受命はありません。館内通信の業務依頼から受命できます。';
}
function initDutyDispatch(){
 if(!qs('#staffSupport'))return;
 qs('.page[data-page="tools"]').append($('dutyAssignments'));registerTerminalView('tools','assignments','受命一覧');$('pageContainer').before($('staffSignal'));
 const hub=document.createElement('button');hub.innerHTML='<strong>受命・勤務評価</strong><small>DUTY ASSIGNMENTS ↗</small>';hub.addEventListener('click',()=>window.NERV_MOBILE.open('tools','assignments'));qs('.support-grid').append(hub);
 const inspect=document.createElement('button');inspect.id='inspectionVerify';inspect.className='staff-secondary';inspect.textContent='点検結果を照合';inspect.addEventListener('click',()=>{if(!staffInspectionItems.every((_,i)=>S.personnel.checks[i]))return toast('5項目すべてを点検してから照合してください。');recordDutyEvidence({kind:'inspection'});toast('5項目の点検結果を確認しました。');});$('inspectionList').after(inspect);
 const handoverBefore=new WeakMap();$('handoverForm').addEventListener('submit',event=>handoverBefore.set(event,JSON.stringify(S.personnel.handover)),true);$('handoverForm').addEventListener('submit',event=>{if(handoverBefore.get(event)!==JSON.stringify(S.personnel.handover))recordDutyEvidence({kind:'handover',registered:true});});window.addEventListener('nerv-duty-evidence',event=>recordDutyEvidence(event.detail));window.addEventListener('nerv-staff-message',event=>{const message=staffFeed().find(m=>m.id===event.detail.id);if(message)showStaffSignal(message);});
 $('staffSignalExpand').addEventListener('click',()=>{const expand=$('staffSignalBody').hidden;setSignalExpanded(expand);if(!expand&&pendingStaffMessage)showStaffSignal(pendingStaffMessage);});$('staffSignalDismiss').addEventListener('click',()=>{staffSignalDismissed=true;$('staffSignal').hidden=true;document.body.classList.remove('has-staff-signal','staff-signal-expanded');});
 $('staffSignalAccept').addEventListener('click',()=>acceptDutyMessage(visibleStaffMessage));$('staffSignalWork').addEventListener('click',()=>{setSignalExpanded(false);window.NERV_MOBILE.open('tools','assignments');});
 // Each retained request can be accepted later, even after its floating notice closes.
 const oldRender=renderStaffServices;renderStaffServices=function(){const focused=document.activeElement?.classList.contains('duty-accept-message')?document.activeElement.dataset.messageId:null;oldRender();for(const [i,article] of [...$('staffRadioList').children].entries()){const message=staffFeed()[i];if(!message?.assignment||!dutyObjectives[message.assignment.kind])continue;const button=document.createElement('button');button.type='button';button.setAttribute('data-own-sound','');button.className='duty-accept-message';button.dataset.messageId=message.id;button.textContent=orderForMessage(message.id)?'受命済み':'この業務を受命';button.disabled=!!orderForMessage(message.id)||activeDutyOrders().length>=3;button.addEventListener('click',()=>acceptDutyMessage(message));article.append(button);}if(focused){const target=[...$('staffRadioList').querySelectorAll('.duty-accept-message')].find(b=>b.dataset.messageId===focused);(target&&!target.disabled?target:$('staffRadioList')).focus({preventScroll:true});}};
 renderStaffServices();renderDutyDispatch();if(location.hash==='#tools/assignments')window.NERV_MOBILE.open('tools','assignments');
}
initDutyDispatch();
// v2.9 presentation on the 07f2242 workflow. No alternate EVA or game reducers.
function initV29Presentation(){
 if(!qs('#staffSupport'))return;
 const circuit=$('intrusionCircuit'),panel=document.createElement('div');
 panel.className='magi-666-program';panel.id='magi666Program';
 panel.innerHTML='<b>NET</b><div><strong>EXTERNAL ISOLATION</strong><span id="magi666State" class="sr-only">外部防壁 / 待機</span></div>';
 circuit.before(panel);
 panel.querySelector('div').append(circuit);
 const previous=renderMagiIntrusion;
 renderMagiIntrusion=function(){
  previous();const s=intrusionState();
  const active=['isolated','analyzed','countermeasure'].includes(s.status);
  panel.dataset.active=String(active);
  meteoText('magi666State',active?'外部経路を隔離中 / 内部侵食は別途対処':s.status==='failed'?'侵食限界 / 警報復旧が必要':'外部防壁 / 待機');
  const isolate=qs('[data-intrusion-action="isolate"] b');
  if(isolate)isolate.textContent='MAGI外部回線を隔離';
 };
 renderMagiIntrusion();
}
initV29Presentation();
// v2.10 adds ordinary EVA combat and external MAGI defense to the 07f2242 workflow.
// Numerical combat/firewall rules below are local game design, not canonical specifications.
let commandOperationsBusy=false,evaCombatFinishing=false;
const v210PriorFinish=v27Finish;
v27Finish=function(won,why){if(S.defense.status==='active'&&won)S.defense.victoryCause=evaCombatFinishing?S.defense.lastAttackSource:'support';v210PriorFinish(won,why);};
const externalCoreNames=['MELCHIOR-1','BALTHASAR-2','CASPER-3'];
function externalMagiState(){
 const raw=S.magi.externalDefense||{};
 return {status:'idle',caseNo:0,turn:0,budget:100,analysis:0,pressure:[20,12,8],hold:0,selected:0,resolved:0,failures:0,message:'外部侵入なし。666プロテクトは外部からのハッキングに使用します。',...raw,pressure:[0,1,2].map(i=>v27Clamp(raw.pressure?.[i]??[20,12,8][i]))};
}
function externalMagiActive(){return ['detected','analyzed','protected','failed'].includes(externalMagiState().status);}
const v210PriorIntrusionActive=magiIntrusionActive;
magiIntrusionActive=function(){return v210PriorIntrusionActive()||externalMagiActive();};
const v210PriorRecoveredState=recoveredStaffState;
recoveredStaffState=function(previous){
 const next=v210PriorRecoveredState(previous);
 if(next.magi.externalDefense)next.magi.externalDefense={...next.magi.externalDefense,status:'idle',turn:0,budget:100,analysis:0,pressure:[0,0,0],hold:0,message:'明示的な警報クリア / 外部侵入を終了'};
 if(next.evaCombat)next.evaCombat={...next.evaCombat,approval:null};
 return next;
};
const v210PriorTerminalAlert=terminalAlert;
terminalAlert=function(){
 const alert=v210PriorTerminalAlert();
 if(externalMagiActive()&&['magi-intrusion','enemy-'+S.defense.caseNo,'mission','nominal'].includes(alert.key))return {level:'critical',key:'external-magi-'+externalMagiState().caseNo,title:'MAGI 外部ハッキング',message:'外部防御で666プロテクトを構築し、三基への侵入を遮断してください。通常審議を停止しています。',page:'magi'};
 return alert;
};
// Back up before the first extension mutation. Native persistence failures roll back the action.
async function commandOperation(change){
 if(commandOperationsBusy||recoveryBusy||sequenceBusy||staffServiceBusy)return {ok:false,error:'別の指示を処理中です'};
 commandOperationsBusy=true;recoveryBusy=true;
 const shell=$('shell');let previous=null;
 if(shell)shell.inert=true;
 try{
  if(!await backupVisualUpgrade())throw Error('変更前バックアップを保存できません');
  settleEvaPower();previous=JSON.parse(JSON.stringify(S));
  change();clearTimeout(saveTimeout);
  const result=await callNative('persist',{state:JSON.parse(JSON.stringify(S))});
  if(result?.error)throw Error(result.error);
  draw();return {ok:true};
 }catch(error){
  if(previous)S=previous;
  clearTimeout(saveTimeout);draw();clearTimeout(saveTimeout);
  toast('指示を中止：'+error.message);sound('deny');return {ok:false,error:error.message};
 }finally{commandOperationsBusy=false;recoveryBusy=false;if(shell)shell.inert=false;}
}
function evaCombatState(){
 const raw=S.evaCombat||{},same=raw.caseNo===S.defense.caseNo;
 return {...raw,caseNo:S.defense.caseNo,range:same?v27Clamp(raw.range??3,1,3):3,ammo:same?v27Clamp(raw.ammo??6,0,6):6,exposedUntil:same?(Number(raw.exposedUntil)||-1):-1,approval:same?raw.approval:null,attacks:same?(Number(raw.attacks)||0):0};
}
function combatBasics(){
 const d=S.defense,e=S.evas[S.tactics.attacker],errors=[];
 if(d.status!=='active')errors.push('敵性反応を検知');
 if(!S.infra.power)errors.push('都市主電源を復旧');
 if(!S.infra.comms)errors.push('作戦通信を復旧');
 if(magiIntrusionActive())errors.push('MAGI侵入を封じ込め');
 if(e.state!=='DEPLOYED')errors.push('担当機を発進準備→MAGI出撃承認→出撃');
 if(e.power<40&&!evaExternalPower(S.tactics.attacker))errors.push('外部給電または機体電力40秒以上を確保');
 if(d.scans<34)errors.push('対象を解析');
 return errors;
}
function combatApproved(){const a=evaCombatState().approval,d=S.defense;return a?.unit===S.tactics.attacker&&a?.caseNo===d.caseNo&&a?.round===d.round&&d.magivote?.filter(Boolean).length>=2&&d.magiround===d.round;}
const evaCombatWeapons={
 approach:{label:'接近 / APPROACH',detail:'間合い −1 / 機体8秒 / 都市電力4 / 1ターン',power:8,energy:4},
 neutralize:{label:'A.T.中和 / NEUTRALIZE',detail:'近接・A.T.展開が必要 / 機体20秒・電力12 / 1ターン',power:20,energy:12},
 knife:{label:'プログレッシブナイフ',detail:'近接・中和中にコア攻撃 / 機体12秒・電力8 / 1ターン',power:12,energy:8},
 rifle:{label:'パレットライフル',detail:'中和後に射撃 / 弾1・機体6秒・電力6 / 1ターン',power:6,energy:6}
};
function evaCombatConditions(action){
 const errors=combatBasics(),c=evaCombatState(),e=S.evas[S.tactics.attacker],w=evaCombatWeapons[action];
 if(!w)return errors;
 if(e.power<w.power+32&&!evaExternalPower(S.tactics.attacker))errors.push('行動・敵ターン分の内部電源を確保');
 if(S.defense.energy<w.energy)errors.push('都市電力'+w.energy+'必要');
 if(action==='approach'&&c.range===1)errors.push('既に近接位置');
 if(action==='neutralize'){if(c.range>1)errors.push('近接位置へ接近');if(!e.at)errors.push('担当機のA.T.を展開');if(c.exposedUntil>S.defense.round)errors.push('中和は有効中');}
 if(['knife','rifle'].includes(action)&&!combatApproved())errors.push('現ターンのMAGI戦術承認');
 if(action==='knife'){if(c.range>1)errors.push('近接位置へ接近');if(!e.at)errors.push('担当機のA.T.を展開');if(c.exposedUntil<=S.defense.round)errors.push('敵A.T.を中和');}
 if(action==='rifle'){if(c.ammo<1)errors.push('弾倉を使い切りました。近接戦闘へ');if(c.exposedUntil<=S.defense.round)errors.push('敵A.T.が有効。先に近接して中和');}
 return errors;
}
async function evaCombatAction(action){return commandOperation(()=>{
 if(action==='detect'){if(S.defense.status==='active')throw Error('作戦は進行中です');v27Detect();S.evaCombat=evaCombatState();return;}
 if(action==='scan'){if(S.defense.status!=='active'||S.defense.scans>=100||S.defense.energy<12||!S.infra.power)throw Error('解析対象・都市電力12・主電源を確認');v27Scan();return;}
 const errors=combatBasics();if(errors.length)throw Error(errors.join(' / '));
 const c=evaCombatState(),d=S.defense,e=S.evas[S.tactics.attacker];
 if(action==='at'){if(e.power<10)throw Error('A.T.展開に必要な電源がありません');e.at=!e.at;addLog('eva','UNIT-0'+S.tactics.attacker+' / A.T. '+(e.at?'展開':'解除'));return;}
 if(action==='authorize'){
  v27Judge();if(d.magivote?.filter(Boolean).length<2)throw Error('MAGIが留保 / 解析・本部健全性・セキュリティを確認');
  c.approval={unit:S.tactics.attacker,caseNo:d.caseNo,round:d.round};S.evaCombat=c;addLog('magi','EVA通常武器 / UNIT-0'+S.tactics.attacker+' / 現ターン承認');return;
 }
 if(!evaCombatWeapons[action])throw Error('不明な戦闘指示');
 const blockers=evaCombatConditions(action);if(blockers.length)throw Error(blockers.join(' / '));
 const w=evaCombatWeapons[action];if(!evaExternalPower(S.tactics.attacker))e.power=Math.max(0,e.power-w.power);d.energy-=w.energy;
 if(action==='approach'){c.range--;v27Record('EVA接近 / 間合い '+c.range);}
 if(action==='neutralize'){c.exposedUntil=d.round+3;v27Record('UNIT-0'+S.tactics.attacker+' / A.T.中和成功：続く2行動が有効');}
 if(action==='knife'||action==='rifle'){
  const exposed=c.exposedUntil>d.round;
  const damage=action==='knife'?Math.round(52+e.sync*.22):Math.round(30+d.scans*.18+e.sync*.08);
  if(action==='rifle')c.ammo--;c.attacks++;c.approval=null;
  d.enemy.hp=Math.max(0,d.enemy.hp-damage);d.lastAttackSource='eva-'+action;
  v27Record('UNIT-0'+S.tactics.attacker+' / '+w.label+' / '+damage+' DAMAGE / 残 '+d.enemy.hp+(exposed?' / A.T.中和中':' / A.T.による減衰'));
  addLog('eva',w.label+' / '+damage+' DAMAGE');
 }
 S.evaCombat=c;sound(action==='approach'?'scan':'launch');
 if(d.enemy.hp<=0){evaCombatFinishing=true;try{v27Finish(true,'EVA通常武器でコアを破壊 / '+w.label);}finally{evaCombatFinishing=false;}}
 else v27Advance();
 window.dispatchEvent(new CustomEvent('nerv-combat-action',{detail:{action}}));
});}
const externalActions={
 trace:{label:'侵入経路を解析',cost:12,hint:'解析 +50 / 三基への侵入圧 +16・14・12'},
 partition:{label:'選択コアの経路を隔離',cost:10,hint:'選択コア −35 / 他二基 +10'},
 compile:{label:'666プロテクトを構築',cost:30,hint:'解析100・三基の侵入圧90未満が必要'},
 maintain:{label:'遮断を維持',cost:8,hint:'全コア侵入圧 −30 / 3回維持で成功'},
 reboot:{label:'通常再起動',cost:8,hint:'外部経路に再接続 / 全コア+25・666解除（危険）'}
};
function externalConditions(action){
 const s=externalMagiState(),x=externalActions[action],errors=[];
 if(!externalMagiActive()||s.status==='failed')errors.push('進行中の外部侵入が必要');
 if(!S.infra.power)errors.push('主電源を復旧');
 if(x&&s.budget<x.cost)errors.push('演算資源が不足');
 if(action==='trace'&&(s.analysis>=100||s.status==='protected'))errors.push('解析は完了しています');
 if(action==='partition'&&s.status==='protected')errors.push('666による遮断を維持してください');
 if(action==='compile'&&(s.analysis<100||s.pressure.some(n=>n>=90)||s.status==='protected'))errors.push('解析100・三基90未満で構築');
 if(action==='maintain'&&s.status!=='protected')errors.push('666プロテクトを先に構築');
 return errors;
}
async function externalMagiAction(action,index){return commandOperation(()=>{
 const old=externalMagiState();
 if(action==='start'){
  if(magiIntrusionActive())throw Error('既存の侵入対処を完了してください');
  S.magi.externalDefense={...old,status:'detected',caseNo:old.caseNo+1,turn:0,budget:100,analysis:0,pressure:[20,12,8],hold:0,selected:0,securityBefore:S.defense.security,message:'外部分散系から三基にハッキング。経路解析と666構築を指示してください。'};
  S.defense.security=Math.max(0,S.defense.security-20);staffInvalidateDecision();
 }else if(action==='select'){
  if(![0,1,2].includes(index))throw Error('対象コアが不正です');S.magi.externalDefense={...old,selected:index};
 }else{
  if(!externalActions[action])throw Error('不明な防御指示');
  const errors=externalConditions(action);if(errors.length)throw Error(errors.join(' / '));
  const s={...old,pressure:[...old.pressure]};s.budget-=externalActions[action].cost;s.turn++;
  if(action==='trace'){s.analysis=Math.min(100,s.analysis+50);s.pressure=s.pressure.map((n,i)=>v27Clamp(n+[16,14,12][i]));s.status=s.analysis===100?'analyzed':'detected';s.message='外部攻撃の解析 '+s.analysis+'%。666構築には三基の侵入圧90未満も必要です。';}
  if(action==='partition'){s.pressure=s.pressure.map((n,i)=>v27Clamp(n+(i===s.selected?-35:10)));s.message=externalCoreNames[s.selected]+'の外部経路を隔離。他系統への負荷を監視してください。';}
  if(action==='compile'){s.status='protected';s.pressure=s.pressure.map(n=>Math.max(0,n-15));s.message='666 PROTECT PROGRAM 展開。遮断を3回維持して外部侵入を排除します。';}
  if(action==='maintain'){s.hold++;s.pressure=s.pressure.map(n=>Math.max(0,n-30));s.message='666遮断維持 '+s.hold+'/3。残演算資源 '+s.budget+'。';if(s.hold>=3){s.status='contained';s.resolved++;s.message='666プロテクト成功 / 外部侵入を遮断。通常審議を再申請できます。';S.defense.security=Math.max(S.defense.security,s.securityBefore||0);addXP(25,'MAGI EXTERNAL DEFENSE');staffInvalidateDecision();}}
  if(action==='reboot'){s.status=s.analysis===100?'analyzed':'detected';s.hold=0;s.pressure=s.pressure.map(n=>v27Clamp(n+25));s.message='外部経路へ再接続し666を解除。全コアの侵入圧＋25。666の再構築が必要です。';}
  if(s.status!=='contained'&&(s.pressure.filter(n=>n>=100).length>=2||s.budget<8)){s.status='failed';s.failures++;s.message='外部防御失敗 / 三基の合議を停止。警報確認で事前バックアップ付きの正常復旧を実行してください。';}
  S.magi.externalDefense=s;
 }
 if(action!=='select'){addLog('magi',externalMagiState().message);sound(externalMagiState().status==='contained'?'done':'scan');}
});}
// A shared forecast drives both the armament readout and the original turn resolver.
const v210PriorForecast=defenseForecast;
defenseForecast=function(){
 const modes=S.cityArmament?.modes;if(!modes?.includes('missile'))return v210PriorForecast();
 const d=S.defense,rule=NERV_DOCTRINES[S.tactics?.posture]||NERV_DOCTRINES.balanced;
 let energy=v27Clamp(d.energy+(S.infra.power?7:0)),damage=0,shots=0;
 const votes=d.magivote?.filter(Boolean).length||0;
 d.city.slice(0,3).forEach((c,i)=>{const missile=modes[i]==='missile',cost=rule.cost+(missile?2:0);if(c.turret&&c.hp>=25&&energy>=cost&&S.infra.power){energy-=cost;shots++;damage+=Math.round((11+d.scans/15+(S.infra.comms?3:0))*(votes>=2?1.35:votes===1?.7:1)*rule.fire*(missile?1.4:1));}});
 const enemy=d.enemy,sector=enemy?((d.round+1)%3===0?3:enemy.lane):null;let loss=0;
 if(enemy&&enemy.dist<=2&&enemy.hp>damage){const c=d.city[sector],guard=S.evas[S.tactics.defender]?.state==='DEPLOYED'&&S.evas[S.tactics.defender]?.at&&evaMapSector(S.tactics.defender)===sector?12:0;loss=Math.max(5,Math.round(Math.max(5,enemy.force-(c.armor?13:0)-(S.infra.armor?5:0)-guard)*rule.loss));}
 if(sector!==null)loss=Math.min(d.city[sector].hp,loss);
 return {energy,damage:enemy?Math.min(enemy.hp,damage):0,shots,sector,loss,rule};
};
function evaCombatGuidance(){
 const d=S.defense,c=evaCombatState(),errors=combatBasics();
 if(d.status==='victory')return 'TARGET SILENCED / '+(d.victoryCause?.startsWith('eva-')?'EVA通常武器で撃破。':'作戦成功。')+' 次の敵性反応を検知できます。';
 return errors.length?errors.join(' → '):c.range>1?'接近を2回 → A.T.展開 → 中和 → 戦術承認 → ナイフ攻撃。各行動後は敵も接近・攻撃します。':c.exposedUntil<=d.round?'担当機のA.T.を展開し、敵A.T.を中和してください。':combatApproved()?'通常武器で攻撃できます。A.T.中和の残り '+(c.exposedUntil-d.round)+'行動。':'攻撃前に現ターンのMAGI戦術承認を取得してください。';
}
const v210PriorCommandMessage=commandMessage;
commandMessage=function(page){
 if(page==='magi'&&(externalMagiActive()||['external','firewall'].includes(mobileCurrent.magi)))return externalMagiState().message;
 if(page==='mission'&&['combat','engage'].includes(mobileCurrent.mission))return 'EVA通常戦闘 / UNIT-0'+S.tactics.attacker+' / '+evaCombatGuidance();
 return v210PriorCommandMessage(page);
};
function renderCommandOperations(){
 if(!$('evaCombatPanel'))return;
 const d=S.defense,c=evaCombatState(),e=S.evas[S.tactics.attacker],active=d.status==='active';
 $('combatUnit').value=String(S.tactics.attacker);
 const evaRoute=$('evaCombatPanel').querySelector('[data-ops-route^="eva/"]');evaRoute.dataset.opsRoute=e.state==='DEPLOYED'?'eva/readiness':'eva/control';evaRoute.textContent=e.state==='DEPLOYED'?'外部給電管制 ↗':'出撃管制 ↗';
 meteoText('combatStatus',active?'TURN '+d.round:d.status.toUpperCase());
 meteoText('combatHP',active?d.enemy.hp+' / '+d.enemy.maxHp:'--');
 meteoText('combatRange',c.range+' / '+(c.exposedUntil>d.round?'中和中':'健在'));
 meteoText('combatSupply',c.ammo+' / '+d.energy+'%');
 const errors=combatBasics();
 const hint=evaCombatGuidance();
 meteoText('combatHint',d.status==='victory'?'TARGET SILENCED / '+(d.victoryCause?.startsWith('eva-')?'EVA通常武器で撃破。':'作戦成功。')+' 次の敵性反応を検知できます。':hint);
 meteoText('engageTarget',active?d.enemy.hp+' HP / '+c.range+' RANGE':d.status.toUpperCase());meteoText('engageHint',d.status==='victory'?(d.victoryCause?.startsWith('eva-')?'EVA通常武器による作戦成功。':'目標沈黙 / 作戦成功。')+'戦闘管制から次の敵性反応を検知できます。':hint);
 const actions=$('combatActions');
 for(const [key,w] of Object.entries(evaCombatWeapons)){
  const b=actions.querySelector('[data-combat="'+key+'"]'),errs=evaCombatConditions(key);
  b.disabled=errs.length>0;b.title=errs.join(' / ');b.querySelector('small').textContent=errs.length?'必要：'+errs[0]:w.detail;
 }
 all('[data-combat="authorize"],[data-combat="at"]').forEach(b=>b.disabled=errors.length>0);
 all('[data-combat="authorize"]').forEach(b=>b.textContent=combatApproved()?'MAGI戦術承認済み / '+S.defense.magivote.filter(Boolean).length+'/3':'現ターンのMAGI戦術承認を取得');
 qs('[data-combat="detect"]').disabled=active;qs('[data-combat="scan"]').disabled=!active||d.energy<12||d.scans>=100||!S.infra.power;
 const f=defenseForecast();meteoText('combatForecast','機体電源 '+Math.ceil(e.power)+'秒 / '+(evaExternalPower(S.tactics.attacker)?'外部給電':'内部給電')+'。次ターン：都市武装 '+f.damage+'損耗 / 施設被害 '+f.loss+'。武器操作にも電力を使用。');
 const x=externalMagiState(),externalActive=externalMagiActive();$('externalMagiPanel').dataset.status=x.status;
 meteoText('externalState',x.status.toUpperCase());$('external666').dataset.active=String(x.status==='protected'||x.status==='contained');
 meteoText('external666Status',x.status==='protected'?'遮断維持 '+x.hold+'/3':x.status==='contained'?'EXTERNAL CONNECTION BLOCKED':'外部侵入に対する遮断防壁');
 meteoText('externalBudget','TURN '+x.turn+' / 演算資源 '+x.budget+' / 解析 '+x.analysis+'% / 三基侵入圧 '+x.pressure.join('・')+'%');
 meteoText('externalControlState','SIM / '+(x.status==='protected'?'666 '+x.hold+'/3':x.status.toUpperCase()));meteoText('externalControlBudget','演算資源 '+x.budget+' / 解析 '+x.analysis+'% / 隔離対象：'+externalCoreNames[x.selected]);meteoText('externalMessage',x.message);
 all('[data-external-core]').forEach((b,i)=>{b.setAttribute('aria-pressed',String(x.selected===i));b.querySelector('strong').textContent=x.pressure[i]+'%';b.querySelector('i').style.width=x.pressure[i]+'%';b.dataset.compromised=String(x.pressure[i]>=90);});
 for(const b of all('[data-external-action]')){const key=b.dataset.externalAction;const errors=externalConditions(key);b.disabled=errors.length>0;b.title=errors.join(' / ');b.hidden=!externalActive||x.status==='failed'||(key==='trace'&&(x.analysis>=100||x.status==='protected'))||(key==='compile'&&(x.analysis<100||x.status==='protected'))||(key==='maintain'&&x.status!=='protected')||(key==='partition'&&x.status==='protected');}
 $('externalStart').hidden=externalActive;$('externalStart').disabled=magiIntrusionActive();
 if(x.status==='failed'){$('externalStart').hidden=false;$('externalStart').textContent='警報確認・正常復旧へ';$('externalStart').disabled=false;}else $('externalStart').textContent=x.status==='contained'?'外部防御を再訓練':'外部ハッキング訓練を開始';
 if(externalActive){$('magiVote').disabled=true;meteoText('magiLiveState','外部侵入 / 通常審議停止');for(let i=0;i<3;i++){const id=['M','B','C'][i];meteoText('m'+id+'Status',x.pressure[i]>=90?'侵入危険':x.status==='protected'?'666防御中':'外部侵入');}meteoText('magiDecision','外部侵入中は通常審議を停止。外部防御で666プロテクトを構築してください。');}
 const sector=Number($('weaponSector').value),facility=d.city[sector],mode=S.cityArmament?.modes?.[sector]||'cannon';
 meteoText('weaponReadout',V27_FACILITY[sector].name+' / 健全性 '+facility.hp+'% / '+(facility.turret?'配備済み':'未配備')+' / '+(mode==='missile'?'誘導弾':'機関砲')+'。次ターン全兵装：損耗 '+f.damage+'・電力 '+f.energy+'%。');
 all('[data-city-weapon]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cityWeapon===mode)));
 $('weaponDeploy').disabled=facility.turret||facility.hp<25||d.parts<20;
}
function initCommandOperations(){
 if(!qs('#staffSupport')||!$('operationsTemplates'))return;
 for(const [id,page,label] of [['evaCombatPanel','mission','EVA直接戦闘'],['evaEngagePanel','mission','EVA交戦指示'],['externalMagiPanel','magi','外部防御 / 666'],['externalControlPanel','magi','666防御指示'],['cityWeaponsPanel','infra','兵装選択']]){const panel=$(id);qs('.page[data-page="'+page+'"]').append(panel);registerTerminalView(page,panel.dataset.view,label);}
 $('operationsTemplates').remove();
 for(const [key,w] of Object.entries(evaCombatWeapons)){const b=document.createElement('button');b.type='button';b.dataset.combat=key;const strong=document.createElement('b'),small=document.createElement('small');strong.textContent=w.label;b.append(strong,small);$('combatActions').append(b);}
 externalCoreNames.forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.dataset.externalCore=String(i);b.innerHTML='<small>'+name+'</small><strong></strong><span><i></i></span>';b.addEventListener('click',()=>externalMagiAction('select',i));$('externalCores').append(b);});
 for(const [key,x] of Object.entries(externalActions)){const b=document.createElement('button');b.type='button';b.dataset.externalAction=key;const label=document.createElement('b'),hint=document.createElement('small');label.textContent=x.label+' / '+x.cost;hint.textContent=x.hint;b.append(label,hint);b.addEventListener('click',()=>externalMagiAction(key));$('externalActions').append(b);}
 $('externalStart').addEventListener('click',()=>externalMagiState().status==='failed'?openAlertReview():externalMagiAction('start'));
 $('combatUnit').addEventListener('change',event=>{const unit=Number(event.target.value);commandOperation(()=>{if(![0,1,2].includes(unit))throw Error('対象機が不正です');$('staffAttackUnit').value=String(unit);$('staffAttackUnit').dispatchEvent(new Event('change',{bubbles:true}));S.selectedEva=unit;if(S.evaCombat)S.evaCombat.approval=null;});});
 document.addEventListener('click',event=>{const b=event.target.closest('[data-combat]');if(b&&!b.disabled)evaCombatAction(b.dataset.combat);const route=event.target.closest('[data-ops-route]');if(route){const [page,view]=route.dataset.opsRoute.split('/');if(page==='eva'&&route.closest('#evaCombatPanel')){S.selectedEva=S.tactics.attacker;draw();}window.NERV_MOBILE.open(page,view);}});
 $('weaponSector').addEventListener('change',renderCommandOperations);
 all('[data-city-weapon]').forEach(b=>b.addEventListener('click',()=>commandOperation(()=>{const modes=[0,1,2].map(i=>S.cityArmament?.modes?.[i]||'cannon');modes[Number($('weaponSector').value)]=b.dataset.cityWeapon;S.cityArmament={...S.cityArmament,modes};v27Record('兵装変更 / '+V27_FACILITY[Number($('weaponSector').value)].name+' / '+b.textContent.trim());})));
 $('weaponDeploy').addEventListener('click',()=>commandOperation(()=>{S.defense.selected=Number($('weaponSector').value);v27Turret();}));
 const link=(target,label,route)=>{const b=document.createElement('button');b.className='staff-secondary';b.textContent=label;b.dataset.opsRoute=route;target.prepend(b);};
 link($('missionOrdersPanel'),'EVA通常武器で戦う ↗','mission/combat');link($('armoryPanel'),'機関砲・誘導弾を選択 ↗','infra/weapons');link($('magiRequestPanel'),'外部ハッキング対処 / 666 ↗','magi/external');
 const priorDraw=draw;draw=function(){priorDraw();renderCommandOperations();};
 window.addEventListener('nerv-route',event=>{document.body.dataset.opsView=event.detail.page+'/'+event.detail.view;if((event.detail.page==='mission'&&['combat','engage'].includes(event.detail.view))||(event.detail.page==='magi'&&['external','firewall'].includes(event.detail.view))){delete commandAnnouncements[event.detail.page];renderCommandStreams();}if(event.detail.page==='magi'&&event.detail.view==='intrusion'&&externalMagiActive())mobileNavigate('magi','external');});
 window.NERV_OPERATIONS={combat:evaCombatAction,combatState:()=>JSON.parse(JSON.stringify(evaCombatState())),combatConditions:evaCombatConditions,external:externalMagiAction,externalState:()=>JSON.parse(JSON.stringify(externalMagiState())),forecast:()=>JSON.parse(JSON.stringify(defenseForecast()))};
 renderCommandOperations();
 const [page,view]=location.hash.slice(1).split('/');if(['combat','engage','external','firewall','weapons'].includes(view))window.NERV_MOBILE.open(page,view);
}
initCommandOperations();
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
 let gl=null,program=null,buffer=null,frame=0,disposed=false,lastDraw=0;
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
  if(isMoving()&&now-lastDraw<(window.NERV_FX?.frameBudget()||16)-1){frame=requestAnimationFrame(paint);return;}lastDraw=now;
  const rect=canvas.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,1.5),width=Math.max(1,Math.round(rect.width*ratio)),height=Math.max(1,Math.round(rect.height*ratio));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  gl.viewport(0,0,width,height);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);gl.uniform2f(uniforms.size,width,height);gl.uniform1f(uniforms.time,isMoving()?now/1000:0);gl.uniform1f(uniforms.damage,(100-S.defense.city[3].hp)/100);gl.uniform1f(uniforms.alert,magiIntrusionActive()||S.world?.cooling?.mode==='isolated'?1:0);gl.uniform1f(uniforms.load,(Number(S.world?.cooling?.load)||0)/100);gl.drawArrays(gl.TRIANGLES,0,6);
  if(isMoving())frame=requestAnimationFrame(paint);
 }
 const refresh=()=>{if(frame)cancelAnimationFrame(frame);frame=0;if(visible())paint(performance.now());};
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();disposed=true;if(frame)cancelAnimationFrame(frame);frame=0;canvas.dataset.renderer='css';});
 canvas.addEventListener('webglcontextrestored',()=>{hqProjection=createHQProjection(canvas);hqProjection.refresh();},{once:true});
 document.addEventListener('visibilitychange',refresh);window.addEventListener('resize',refresh);window.addEventListener('nerv-fx-quality',refresh);window.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change',refresh);
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
// Shared, persisted pacing and MAGI maintenance. All numerical rules are original simulation.
function worldPacing(state=S){
 const mode=['quiet','balanced','exercise'].includes(state.prefs?.eventPace)?state.prefs.eventPace:'balanced';
 return {mode,...({quiet:{securityFirst:80,securityInterval:120,magiFirst:90,magiInterval:150,jobTicks:60,radio:900000,idle:900000,idleLoad:-1},balanced:{securityFirst:40,securityInterval:60,magiFirst:60,magiInterval:90,jobTicks:40,radio:600000,idle:600000,idleLoad:-1},exercise:{securityFirst:6,securityInterval:10,magiFirst:20,magiInterval:30,jobTicks:10,radio:90000,idle:90000,idleLoad:2}}[mode])};
}
function worldCoolingReady(state){return state.world.tick>=(state.world.pacing?.nextCoolingTick||0)&&!state.world.magiOps?.active;}
const magiFaultKinds={clock:{title:'MAGI三基の時刻同期ずれ',label:'CLOCK / QUORUM',contact:'maya'},checksum:{title:'解析資料の整合性不一致',label:'ARCHIVE / CHECKSUM',contact:'ritsuko'},power:{title:'MAGI給電バスのノイズ',label:'POWER / REDUNDANCY',contact:'aoba'}};
function magiOpsDefault(tick,state=S){return {schema:1,sequence:0,auto:state.prefs?.magiFaultAuto!==false,nextDueTick:tick+worldPacing(state).magiFirst,active:null,archive:[]};}
function magiOpsNormalize(raw,tick){
 if(Number(raw?.schema)>1)return {future:true};const s=worldObject(raw)?worldClone(raw):{},d=magiOpsDefault(tick),a=s.active;
 const value={...d,...s,schema:1,sequence:Math.floor(worldBound(s.sequence,0,1e9,0)),nextDueTick:Math.floor(worldBound(s.nextDueTick,0,1e9,d.nextDueTick)),auto:s.auto!==false&&S.prefs.magiFaultAuto!==false,archive:Array.isArray(s.archive)?s.archive.filter(x=>worldObject(x)&&magiFaultKinds[x.kind]&&typeof x.id==='string').slice(0,6):[],active:null};
 if(a&&magiFaultKinds[a.kind]&&typeof a.id==='string'&&['detected','diagnosing','work','validated','reported'].includes(a.stage)){
  value.active={...a,createdTick:Math.floor(worldBound(a.createdTick,0,1e9,tick)),adjustments:[0,1,2].map(i=>Math.round(worldBound(a.adjustments?.[i],-8,8,0))),offsets:[0,1,2].map(i=>Math.round(worldBound(a.offsets?.[i],-6,6,[0,4,-3][i]))),feeds:[0,1,2].map(i=>a.feeds?.[i]!==false),damagedBus:Math.floor(worldBound(a.damagedBus,0,2,1)),inspected:[...new Set((Array.isArray(a.inspected)?a.inspected:[]).filter(i=>[0,1,2].includes(i)))],selectedCopy:[0,1,2].includes(a.selectedCopy)?a.selectedCopy:null};
  if(['diagnosing','reported'].includes(a.stage)&&!Number.isFinite(a.dueTick))value.active.stage=a.stage==='reported'?'validated':'detected';
 }
 return {value,repaired:JSON.stringify(raw)!==JSON.stringify(value)};
}
const v215PriorWorldNormalize=worldNormalize;
worldNormalize=function(raw,now){
 if(Number(raw?.pacing?.schema)>1||Number(raw?.magiOps?.schema)>1||Number(raw?.angels?.schema)>1)return {future:true};
 const result=v215PriorWorldNormalize(raw,now);if(result.future)return result;const w=result.world,oldPacing=JSON.stringify(w.pacing),oldAngels=JSON.stringify(w.angels),cfg=worldPacing(),m=magiOpsNormalize(w.magiOps,w.tick);if(m.future)return {future:true};
 if(!w.pacing||w.pacing.version!==215){w.pacing={...w.pacing,schema:1,version:215,startedAt:now,nextCoolingTick:w.tick};if(w.nextInspectionTick<w.tick+cfg.jobTicks)w.nextInspectionTick=w.tick+cfg.jobTicks;result.repaired=true;}
 w.pacing.nextCoolingTick=Math.floor(worldBound(w.pacing.nextCoolingTick,0,1e9,w.tick));w.pacing.startedAt=worldBound(w.pacing.startedAt,1,1e15,now);
 w.magiOps=m.value;result.repaired=result.repaired||m.repaired;
 const a=worldObject(w.angels)?w.angels:{};
 w.angels={...a,schema:1,auto:a.auto!==false,sequence:Math.floor(worldBound(a.sequence,0,1e9,0)),nextDueTick:Math.floor(worldBound(a.nextDueTick,0,1e9,w.tick+120)),history:Array.isArray(a.history)?a.history.filter(x=>worldObject(x)&&typeof x.id==='string').slice(0,6):[],active:a.active&&['sachiel','shamshel','ramiel'].includes(a.active.id)&&Number.isInteger(a.active.caseNo)?a.active:null};
 result.repaired=result.repaired||oldPacing!==JSON.stringify(w.pacing)||oldAngels!==JSON.stringify(w.angels);return result;
};
function magiOpsStart(state,kind,tick){
 const s=state.world.magiOps;if(s.active)throw Error('対応中のMAGI保守を先に引き継いでください');
 const keys=Object.keys(magiFaultKinds);kind=magiFaultKinds[kind]?kind:keys[s.sequence%keys.length];s.sequence++;
 s.active={id:'MAGI-OPS-'+s.sequence,kind,stage:'detected',createdTick:tick,adjustments:[0,0,0],offsets:[0,4,-3],feeds:[true,true,true],damagedBus:s.sequence%3,inspected:[],selectedCopy:null,feedback:'独立診断で原因と対象を確かめてください。'};
 worldLog(state.world,'MAGI保守受付',magiFaultKinds[kind].title+'。三基の通常審議を保留しました。',s.active.id);
 worldCommunication(state.world,'伊吹マヤ / 技術局',magiFaultKinds[kind].title+'を検出。MAGI保守盤で独立診断を依頼してください。',s.active.id);
 if(state===S){cancelSequence();staffInvalidateDecision();}
}
const v215PriorObserve=worldObserve;
worldObserve=function(state){const o=v215PriorObserve(state),a=state.world?.magiOps?.active;if(a){o.magiFault={id:a.id,kind:a.kind,title:magiFaultKinds[a.kind]?.title||'MAGI保守',stage:a.stage};o.magiHold=true;o.magi=o.magiFault.title+' / 保守確認待ち';o.alert='非常';}else o.magiFault=null;return o;};
function magiOpsTick(state,tick){
 const s=state.world.magiOps;if(!s)return;const a=s.active;
 if(!a){if(s.auto&&tick>=s.nextDueTick&&state.infra.power&&state.infra.comms&&!state.world.security?.case&&!worldActiveIncident(state.world)&&state.defense.status!=='active'&&!v215PriorObserve(state).intrusion)magiOpsStart(state,null,tick);return;}
 const sys=v215PriorObserve(state);if(!sys.power||!sys.comms||sys.intrusion||sys.magiHold)return;
 if(a.stage==='diagnosing'&&tick>=a.dueTick){a.stage='work';a.feedback='診断結果を確認し、保守盤で基準値へ合わせてください。';worldLog(state.world,'MAGI独立診断',magiFaultKinds[a.kind].title+'：保守対象を特定しました。',a.id);}
 if(a.stage==='reported'&&tick>=a.dueTick){a.stage='resolved';a.resolvedTick=tick;a.authorizedBy='赤木リツコ / 技術開発部';s.archive.unshift(worldClone(a));s.archive=s.archive.slice(0,6);s.active=null;s.nextDueTick=tick+worldPacing(state).magiInterval;worldLog(state.world,'MAGI復旧承認',magiFaultKinds[a.kind].title+'：技術部が復旧を承認。通常審議は再申請してください。',a.id);worldCommunication(state.world,'赤木リツコ / 技術開発部','照合結果を受領。三基の通常運用を再開するわ。',a.id);}
}
const v215PriorAdvance=worldAdvance;
worldAdvance=function(state,now){const before=state.world?.tick||0,changed=v215PriorAdvance(state,now);if(state.world?.magiOps)for(let t=before+1;t<=state.world.tick;t++)magiOpsTick(state,t);return changed;};
const v215PriorDispatch=worldDispatch;
worldDispatch=function(state,action){
 if(action==='pace.quiet'||action==='pace.balanced'||action==='pace.exercise'){
  state.prefs.eventPace=action.split('.')[1];const cfg=worldPacing(state),w=state.world;
  if(w.security&&!w.security.case)w.security.nextDueTick=w.tick+cfg.securityFirst;if(!w.magiOps.active)w.magiOps.nextDueTick=w.tick+cfg.magiFirst;w.nextInspectionTick=w.tick+cfg.jobTicks;worldLog(w,'勤務間隔','発生頻度を '+cfg.mode+' に変更。未処理案件は保持しました。');return;
 }
 if(!action.startsWith('magiops.'))return v215PriorDispatch(state,action);
 const w=state.world,s=w.magiOps,[,op,key,value]=action.split('.');
 if(op==='toggle'){s.auto=!s.auto;state.prefs.magiFaultAuto=s.auto;s.nextDueTick=w.tick+worldPacing(state).magiFirst;return;}
 if(op==='start'){if(!magiFaultKinds[key])throw Error('障害系統を選択してください');if(v215PriorObserve(state).intrusion||worldActiveIncident(w))throw Error('進行中のMAGI侵入・冷却異常を先に引き継いでください');magiOpsStart(state,key,w.tick);return;}
 const a=s.active;if(!a)throw Error('対応中のMAGI保守はありません');const sys=v215PriorObserve(state);if(!sys.power||!sys.comms||sys.intrusion||sys.magiHold)throw Error('主電源・通信と既存のMAGI侵入/冷却対応を確認してください');
 if(op==='diagnose'){if(a.stage!=='detected')throw Error('独立診断は受付後に一度だけ依頼できます');a.stage='diagnosing';a.dueTick=w.tick+1;}
 else if(['adjust','feed','inspect','copy'].includes(op)){
  if(a.stage!=='work')throw Error('独立診断の完了を待ってください');const index=Number(key);if(![0,1,2].includes(index))throw Error('対象の三基/系統を選んでください');
  if(op==='adjust'){const n=Number(value);if(a.kind!=='clock'||!Number.isInteger(n)||Math.abs(n)>8)throw Error('補正範囲は−8～+8 msです');a.adjustments[index]=n;}
  if(op==='feed'){if(a.kind!=='power')throw Error('給電バスの案件ではありません');a.feeds[index]=!a.feeds[index];}
  if(op==='inspect'){if(a.kind!=='checksum')throw Error('資料照合の案件ではありません');if(!a.inspected.includes(index))a.inspected.push(index);}
  if(op==='copy'){if(a.kind!=='checksum'||!a.inspected.includes(index))throw Error('原本と照合してから複製元を指定してください');a.selectedCopy=index;}
 }else if(op==='validate'){
  if(a.stage!=='work')throw Error('保守盤を確認してください');
  const correct=a.kind==='clock'?a.offsets.every((n,i)=>n+a.adjustments[i]===0):a.kind==='power'?!a.feeds[a.damagedBus]&&a.feeds.filter(Boolean).length>=2:a.inspected.length===3&&[0,1].includes(a.selectedCopy);
  a.feedback=correct?'独立照合が成立。技術部へ上申できます。':'基準値と一致しません。診断記録と現在の設定を見比べてください。';if(correct)a.stage='validated';
 }else if(op==='report'){if(a.stage!=='validated')throw Error('独立照合を先に完了してください');a.stage='reported';a.dueTick=w.tick+1;}
 else throw Error('許可された保守操作ではありません');
 worldLog(w,'MAGI保守処理',a.id+' / '+op+(key?' / '+key:'')+(a.stage==='validated'?' / 独立照合成立':''),a.id);
};
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
// Field investigation is a spatial/logical task; legacy procedure drills remain available.
Object.assign(securityKinds,{
 relay:{title:'非正規中継器・盗聴回線の検知',zone:'整備通路 / 通信中継',contact:'aoba',evidence:[['signal','搬入口の波形記録'],['hop','中継ホップの記録'],['patrol','現地担当の照会']],findings:[['登録のない識別子が区画内へ移動しています。','中継先が認証済みの経路と一致しません。','巡回担当が無許可の中継機器を確認しました。'],['更新待ちの検査用識別子を確認しました。','中継経路は技術部の試験票と一致しています。','担当職員が認可済みの測定器と確認しました。']]},
 cargo:{title:'搬入物と運送記録の不一致',zone:'搬入口 / 送電区画',contact:'hyuga',evidence:[['ticket','搬入票の記録'],['transit','搬送経路の履歴'],['seal','現地封印の確認']],findings:[['搬入票に未登録の荷番号が含まれています。','許可区画と異なる場所へ搬送されています。','封印と送り状の番号が一致しません。'],['更新された荷番号が原票に記録されています。','搬送は当直が認可した経路です。','封印と原票が一致しています。']]},
 decoy:{title:'偽警報による管制誘導の疑惑',zone:'中央管制 / 監視網',contact:'maya',evidence:[['alarm','発報源の記録'],['route','転送経路の照合'],['sensor','独立した現地確認']],findings:[['登録外の発報源から警報が転送されています。','監視網の正規の経路と異なります。','独立確認では警報の対象物がありません。'],['認可済みの感知器試験が記録されています。','転送は正式な監視経路です。','独立確認で試験担当と一致しました。']]}
});
const fieldNodeNames=['搬入口','中央昇降路','整備通路','退避経路','文書庫','送電区画'];
const v215PriorSecurityDefaults=securityDefaults;
securityDefaults=function(tick){return {...v215PriorSecurityDefaults(tick),cadence:215,nextDueTick:tick+worldPacing().securityFirst};};
const v215PriorSecurityNormalize=securityNormalize;
securityNormalize=function(raw,tick){const r=v215PriorSecurityNormalize(raw,tick);if(r.future)return r;const s=r.value;if(raw?.cadence!==215){s.cadence=215;if(!s.case)s.nextDueTick=Math.max(s.nextDueTick,tick+worldPacing().securityFirst);r.repaired=true;}
 const a=s.case;if(a?.fieldwork){const f=a.fieldwork;if(Number(f.schema)>1)return {future:true};a.fieldwork={...f,schema:1,selected:Math.floor(worldBound(f.selected,0,5,0)),budget:Math.floor(worldBound(f.budget,0,16,12)),records:Array.isArray(f.records)?f.records.filter(x=>worldObject(x)&&['camera','trace','patrol'].includes(x.tool)&&[0,1,2,3,4,5].includes(x.node)).slice(-10):[],planned:Array.isArray(f.planned)?f.planned.filter(i=>[0,1,2,3,4,5].includes(i)).slice(0,3):[],gates:[...new Set((Array.isArray(f.gates)?f.gates:[]).filter(i=>[1,2,4,5].includes(i)))].slice(0,2),verified:!!f.verified,contained:!!f.contained,patrol:f.patrol&&[0,1,2,3,4,5].includes(f.patrol.node)&&Number.isFinite(f.patrol.dueTick)?f.patrol:null};}
 if(a?.fieldwork){const f=a.fieldwork,p=f.pendingResolution;f.pendingResolution=p&&['escort','handoff'].includes(p.op)&&Number.isFinite(p.dueTick)&&a.stage==='analyzed'?{op:p.op,dueTick:p.dueTick}:null;}r.repaired=r.repaired||JSON.stringify(raw)!==JSON.stringify(s);return r;};
function fieldRoute(c){return [0,c.variant===1?2:1,['sabotage','cargo','relay'].includes(c.kind)?5:4];}
const v215PriorNewCase=securityNewCase;
securityNewCase=function(state,kind,tick,training=false){v215PriorNewCase(state,kind,tick,training);const c=securityActive(state);if(!training){c.deadlineTick=tick+24;c.fieldwork={schema:1,selected:0,budget:12,records:[],planned:[],gates:[],verified:false,contained:false,patrol:null,pendingResolution:null,feedback:'搬入口の記録から対象の移動経路を調べてください。'};}};
function fieldRecord(state,c,tool,node){
 const f=c.fieldwork,r=fieldRoute(c),index=tool==='camera'?0:tool==='trace'?1:2,hit=node===r[index],label=securityKinds[c.kind].evidence[index][0];
 const text=hit?'T+'+(index*4+2)+' / '+fieldNodeNames[node]+(index<2?' → '+fieldNodeNames[r[index+1]]:' / '+(c.variant?'認証番号は正規':'認証番号の不一致を確認')):'該当する対象の記録はありません。';
 f.records.push({tool,node,at:state.world.tick,text,match:hit});f.records=f.records.slice(-10);if(hit&&!c.evidence.includes(label))c.evidence.push(label);if(['accepted','collecting'].includes(c.stage))c.stage='collecting';f.feedback=text;worldLog(state.world,'現場照会',c.id+' / '+tool+' / '+fieldNodeNames[node]+' / '+text,c.id);
}
const v215PriorSecurityTick=securityTick;
securityTick=function(state,tick){
 const s=state.world.security,c=s?.case;
 if(!c&&(state.world.magiOps?.active||worldActiveIncident(state.world)||state.defense.status==='active')){if(s&&s.nextDueTick<=tick)s.nextDueTick=tick+4;return;}
 if(c?.fieldwork?.patrol&&tick>=c.fieldwork.patrol.dueTick&&state.infra.comms){const node=c.fieldwork.patrol.node;c.fieldwork.patrol=null;fieldRecord(state,c,'patrol',node);}
 if(c?.stage==='analyzed'&&c?.fieldwork?.pendingResolution&&tick>=c.fieldwork.pendingResolution.dueTick&&state.infra.power&&state.infra.comms){const op=c.fieldwork.pendingResolution.op;c.fieldwork.pendingResolution=null;c.stage='decision';c.decision=op==='escort'?'release':'escalate';c.contained=op!=='escort';c.fieldwork.feedback=op==='escort'?'巡回担当が正規通行の同行確認を完了。副司令へ報告できます。':'保安担当が証拠保全と現場引継ぎを受領。副司令へ報告できます。';worldLog(state.world,'保安連携',c.id+' / '+c.fieldwork.feedback,c.id);}
 v215PriorSecurityTick(state,tick);
 if(c&&!s.case)s.nextDueTick=tick+worldPacing(state).securityInterval;
};
const v215PriorSecurityDispatch=worldDispatch;
worldDispatch=function(state,action){
 const [,op,key]=action.split('.');
 if(action.startsWith('security.operation.')){if(!securityKinds[key])throw Error('保安案件を選択してください');securityNewCase(state,key,state.world.tick,false);return;}
 const c=securityActive(state),f=c?.fieldwork;
 if(!action.startsWith('security.')||!f)return v215PriorSecurityDispatch(state,action);
 if(['escort','quarantine','handoff'].includes(op)){
  if(!state.infra.power||!state.infra.comms)throw Error('主電源・通信を復旧してください');if(f.pendingResolution||c.stage!=='analyzed'||!f.verified)throw Error('経路照合・MAGI解析を完了し、進行中の照会を待ってください');
  if(op==='quarantine'){if(!['audit','relay','decoy','sabotage'].includes(c.kind))throw Error('物理的な入退館・搬入は現場担当による確認が必要です');if(state.defense.energy<6)throw Error('独立回線への切替に電力6が必要です');state.defense.energy-=6;f.method='independent-record-quarantine';f.contained=true;c.contained=true;c.decision='hold';c.stage='decision';f.feedback='取得記録を保全し、問題の回線を独立経路へ隔離しました。副司令への報告が必要です。';}
  else{if(op==='escort'&&(!['access','cargo'].includes(c.kind)||c.variant!==1||f.gates.length))throw Error('正規通行と確認した物理案件で、経路が開放されている必要があります');if(f.budget<2)throw Error('担当部署への現場照会枠2が必要です');f.budget-=2;f.method=op==='escort'?'supervised-passage':'security-team-handoff';f.pendingResolution={op,dueTick:state.world.tick+(op==='escort'?1:2)};c.contained=true;f.feedback='現場担当へ依頼済み。'+(op==='escort'?'1':'2')+'更新後に受領確認が届きます。';}
  worldLog(state.world,'保安解決手配',c.id+' / '+f.method,c.id);return;
 }
 if(['node','camera','trace','patrol','route','resetRoute','verify','gate','seal'].includes(op)){
  if(!state.infra.power||!state.infra.comms)throw Error('電源と通信を復旧してください');if(['detected','reported','failed'].includes(c.stage))throw Error('案件受領後、正式報告の前に現場照会を行ってください');
  const n=Number(key);if(['node','route','gate'].includes(op)&&![0,1,2,3,4,5].includes(n))throw Error('区画を選んでください');
  if(op==='node')f.selected=n;
  if(['camera','trace','patrol'].includes(op)){
   if(!['accepted','collecting'].includes(c.stage))throw Error('現場照会は解析を依頼する前に実施してください');const cost=op==='patrol'?2:1;if(f.budget<cost)throw Error('照会枠を使い切りました。取得記録を保全して上級へ上申してください');if(op==='patrol'&&f.patrol)throw Error('巡回照会の返答を待ってください');f.budget-=cost;
   if(op==='patrol'){f.patrol={node:f.selected,dueTick:state.world.tick+1};f.feedback='巡回担当へ照会。次の30秒更新で確認が届きます。';}else fieldRecord(state,c,op,f.selected);
  }
  if(op==='route'){if(f.planned.length>=3)throw Error('経路を消去してから描き直してください');f.planned.push(n);f.verified=false;f.contained=false;}
  if(op==='resetRoute'){f.planned=[];f.verified=false;f.contained=false;}
  if(op==='verify'){const correct=c.evidence.length===3&&f.planned.join(',')===fieldRoute(c).join(',');f.verified=correct;f.feedback=correct?'時系列と経路が一致しました。MAGI照合と区画制御へ進めます。':'映像・回線・巡回の3記録を揃え、時系列に沿って3区画を接続してください。';}
  if(op==='gate'){if(![1,2,4,5].includes(n))throw Error('退避経路・搬入口の閉鎖権限はありません');if(f.gates.includes(n))f.gates=f.gates.filter(i=>i!==n);else{if(f.gates.length>=2)throw Error('同時保留は2区画までです');f.gates.push(n);}f.contained=false;}
  if(op==='seal'){if(!f.verified||c.stage!=='analyzed')throw Error('経路の独立照合とMAGI解析を先に完了してください');f.contained=f.gates.includes(fieldRoute(c)[2]);if(f.contained)f.method='local-sector-hold';f.feedback=f.contained?'対象の最終区画を一時保留。退避経路は開放を維持しています。':'記録が示す最終区画を保留してください。';}
  return;
 }
 if(op==='evidence')throw Error('現場捜査盤で映像・回線・巡回の記録を取得してください');
 if(op==='analyze'&&!f.verified)throw Error('現場記録3件と経路の独立照合が必要です');
 if(op==='hold'&&!f.contained)throw Error('区画制御盤で対象経路の保留を確認してください');
 if(op==='release'&&(!f.verified||f.gates.length))throw Error('経路を検証し、正規通行を妨げる区画保留を解除してください');
 return v215PriorSecurityDispatch(state,action);
};
// TV-era named Angels; threat values and repeat encounters are original simulation rules.
const angelProfiles={
 sachiel:{id:'sachiel',name:'サキエル',number:3,code:'SACHIEL-03',bearing:'北東',hp:145,force:31,dist:6,lane:1,feature:'白い仮面・赤いコア / 接近型',tactic:'接近してA.T.を中和し、コアへ攻撃。通常武器でも撃破可能。'},
 shamshel:{id:'shamshel',name:'シャムシェル',number:4,code:'SHAMSHEL-04',bearing:'北西',hp:132,force:38,dist:5,lane:0,feature:'長い胴体と二本の光の鞭',tactic:'中距離は光の鞭の射程。A.T.を展開し、接近・中和後にコアを狙う。'},
 ramiel:{id:'ramiel',name:'ラミエル',number:5,code:'RAMIEL-05',bearing:'東側',hp:155,force:46,dist:6,lane:2,feature:'青い正八面体 / 高出力加粒子砲',tactic:'近接は高出力射界に阻まれる。外部給電・二段階充填・承認を経て陽電子狙撃。'}
};
function currentAngel(state=S){const a=state.world?.angels?.active;return a&&a.caseNo===state.defense.caseNo?angelProfiles[a.id]||null:null;}
const v215PriorProfile=v27Profile;
v27Profile=function(){return currentAngel()||v215PriorProfile();};
const v215PriorDetect=v27Detect;
v27Detect=function(){const a=S.world?.angels?.active;if(a&&a.caseNo!==S.defense.caseNo+1&&S.defense.status!=='active')S.world.angels.active=null;return v215PriorDetect();};
function angelStart(state,id){
 const w=state.world,p=angelProfiles[id];if(state!==S||!p)throw Error('対応する使徒を選択してください');if(state.defense.status==='active')throw Error('現在の防衛作戦を先に完了してください');
 if(worldObserve(state).magiHold||w.security?.case)throw Error('MAGI保守・保安案件を先に引き継いでください');
 w.angels.sequence++;w.angels.active={id,caseNo:state.defense.caseNo+1,stage:'detected',startedTick:w.tick,serial:w.angels.sequence};
 v27Detect();state.defense.last='第'+p.number+'使徒 '+p.name+' 接近。対象解析とEVA運用を開始してください。';worldLog(w,'使徒接近','第'+p.number+'使徒 '+p.name+' / '+p.tactic,'angel-'+w.angels.sequence);worldCommunication(w,'葛城ミサト / 戦術作戦部','パターン青。'+p.name+'の迎撃へ。担当機と装備を確認して、承認手順どおりに進めて。','angel-'+w.angels.sequence);cancelSequence();staffInvalidateDecision();
}
const v215PriorAngelDispatch=worldDispatch;
worldDispatch=function(state,action){if(!action.startsWith('angel.'))return v215PriorAngelDispatch(state,action);const [,op,id]=action.split('.');if(op==='start')return angelStart(state,id);if(op==='toggle'){state.world.angels.auto=!state.world.angels.auto;state.world.angels.nextDueTick=state.world.tick+120;return;}throw Error('使徒監視の操作を確認してください');};
const v215PriorAngelAdvance=worldAdvance;
worldAdvance=function(state,now){const changed=v215PriorAngelAdvance(state,now),w=state.world,a=w?.angels;if(changed&&state===S&&a?.auto&&w.tick>=a.nextDueTick&&state.defense.status==='idle'&&!w.security?.case&&!w.magiOps?.active&&!worldActiveIncident(w)&&!worldObserve(state).magiHold&&state.infra.power&&state.infra.comms){angelStart(state,Object.keys(angelProfiles)[a.sequence%3]);a.nextDueTick=w.tick+180;}return changed;};
const v215PriorAngelConditions=evaCombatConditions;
evaCombatConditions=function(action){const errors=v215PriorAngelConditions(action);if(currentAngel()?.id==='ramiel'&&['approach','neutralize','knife','rifle'].includes(action))errors.push('ラミエルの高出力射界 / 遠距離のポジトロンライフルを選択');return errors;};
const v215PriorAngelForecast=defenseForecast;
defenseForecast=function(){const result=v215PriorAngelForecast(),a=currentAngel();if(a&&S.defense.status==='active')result.damage=a.id==='ramiel'?0:Math.round(result.damage*.35);return result;};
const v215PriorAngelTurn=v27Advance;
v27Advance=function(){const d=S.defense,before=d.round,a=currentAngel(),unit=S.tactics.attacker,range=evaCombatState().range;v215PriorAngelTurn();if(a?.id==='shamshel'&&d.round>before&&d.status==='active'&&range===2&&S.evas[unit].state==='DEPLOYED'){const e=S.evas[unit],parts=['head','torso','leftArm','rightArm','leftLeg','rightLeg'];if(!worldObject(e.damage))e.damage=Object.fromEntries(parts.map(p=>[p,0]));e.damage.leftArm=Math.min(100,(Number(e.damage.leftArm)||0)+(e.at?2:5));e.damageSource='シャムシェルの光の鞭 / 作中使徒の独自戦闘モデル';v27Record('光の鞭が中距離へ到達 / UNIT-0'+unit+' 左腕損傷 '+e.damage.leftArm+'%');}};
const v215PriorAngelFinish=v27Finish;
v27Finish=function(won,why){const a=currentAngel(),active=S.defense.status==='active';v215PriorAngelFinish(won,why);if(a&&active){const w=S.world,c=w.angels.active;c.stage=won?'victory':'defeat';const id=c.serial+'-'+a.id;if(!w.angels.history.some(x=>x.id===id))w.angels.history.unshift({id,angel:a.id,name:a.name,caseNo:c.caseNo,result:c.stage,tick:w.tick,weapon:S.defense.lastAttackSource||'city'});w.angels.history=w.angels.history.slice(0,6);w.angels.nextDueTick=w.tick+180;worldLog(w,'使徒作戦記録',a.name+' / '+(won?'目標沈黙':'作戦中断・復旧が必要'),id);}};
const v215PriorAngelRecovery=recoveredStaffState;
recoveredStaffState=function(previous){const next=v215PriorAngelRecovery(previous);if(next.world?.angels){next.world.angels.active=null;next.world.angels.nextDueTick=next.world.tick+120;}return next;};
// Stage-one UI/controller: one authoritative S, transactional writes and visible role boundaries.
let staffWorldReady=false,staffWorldBusy=false,staffWorldError='',worldHistoryPage=0,worldCommPage=0;
function worldMagiLimited(){return staffWorldReady&&S.world?.schema===1&&worldObserve(S).magiHold;}
function worldMagiBlockText(){const fault=worldObserve(S).magiFault;return fault?fault.title+' / 技術部の復旧承認が必要':'冷却枝系統を点検中 / 技術部の復旧承認を待機';}
function renderWorldTelemetry(){
 if(!staffWorldReady)return;const level=terminalAlert().level,alarm=$('telemetryAlarm');
 if(alarm){alarm.textContent=level==='critical'?'CRITICAL':level==='watch'?'TACTICAL':'NOMINAL';alarm.style.color=level==='critical'?'#ff7976':level==='watch'?'#ffc171':'#9bf7bd';}
}
const worldPriorVoteInfo=voteInfo,worldPriorInterceptVotes=staffInterceptVotes,worldPriorApproved=staffInterceptApproved,worldPriorJudge=v27Judge,worldPriorBasics=combatBasics;
voteInfo=function(){const votes=worldPriorVoteInfo();return worldMagiLimited()?votes.map(v=>({...v,yes:false,reason:worldMagiBlockText()})):votes;};
staffInterceptVotes=function(){const votes=worldPriorInterceptVotes();return worldMagiLimited()?votes.map(v=>({...v,yes:false,reason:worldMagiBlockText()})):votes;};
staffInterceptApproved=function(){return !worldMagiLimited()&&worldPriorApproved();};
v27Judge=function(){if(worldMagiLimited()){toast(worldMagiBlockText());return;}return worldPriorJudge();};
combatBasics=function(){const reasons=worldPriorBasics();if(worldMagiLimited())reasons.push(worldMagiBlockText());return reasons;};
const worldPriorTerminalAlert=terminalAlert;
terminalAlert=function(){const previous=worldPriorTerminalAlert();if(!staffWorldReady)return previous;const observed=worldObserve(S),event=observed.incident;if(event&&(previous.level==='nominal'||(observed.magiHold&&previous.level!=='critical')))return {level:observed.magiHold?'critical':'watch',key:'world-'+event.id,title:'MAGI 冷却枝系統異常',message:'負荷 '+Math.round(S.world.cooling.load)+'% / 当直業務で受領・隔離・診断・技術部への報告を進めてください。',page:'work'};return previous;};
function worldApplyHold(previous){const limited=worldMagiLimited();if(limited!==previous||limited&&S.magi.approvedFor!==null){cancelSequence();staffInvalidateDecision();}}
async function worldAction(action){
 if(!staffWorldReady)return {ok:false,error:staffWorldError||'当直データを引継ぎ中です'};
 return commandOperation(()=>{const before=worldMagiLimited();worldAdvance(S,Date.now());worldDispatch(S,action);worldApplyHold(before);});
}
async function worldPulse(now=Date.now()){
 if(staffWorldBusy||document.hidden||!staffWorldReady||now>=S.world.lastSimAt&&now-S.world.lastSimAt<WORLD_STEP)return {ok:false,pending:true};
 staffWorldBusy=true;
 try{return await commandOperation(()=>{const before=worldMagiLimited();worldAdvance(S,now);worldApplyHold(before);});}finally{staffWorldBusy=false;}
}
const worldStatusLabels={available:'受付',accepted:'受領済み',checked:'確認済み',processing:'解析中',review:'報告待ち',complete:'完了',hold:'保留',detected:'未受領',isolated:'枝系統隔離',diagnosing:'診断中',reported:'技術部の承認待ち',resolved:'解決'};
function worldButton(container,action,label){const b=document.createElement('button');b.type='button';b.className='staff-primary';b.dataset.worldAction=action;b.textContent=label;container.append(b);}
function worldRenderPaged(target,entries,page,size,kind){
 const pages=Math.max(1,Math.ceil(entries.length/size));page=Math.max(0,Math.min(pages-1,page));const list=$(target);list.replaceChildren();
 for(const record of entries.slice(page*size,(page+1)*size)){const row=document.createElement('article'),label=document.createElement('small'),text=document.createElement('p');label.textContent=kind==='communications'?record.from+(record.read?' / 受領済み':' / 未読'):record.kind+' / '+new Date(record.at).toLocaleTimeString('ja-JP');text.textContent=record.text;row.append(label,text);list.append(row);}
 if(!entries.length)list.textContent='記録なし / 引継ぎ待機';return {page,pages};
}
function renderStaffWorld(){
 if(!$('worldBrief'))return;
 const recovery=window.__NERV_STATE_RECOVERY__,warning=staffWorldError||recovery?.message||'';
 $('worldRecovery').hidden=!warning;meteoText('worldRecovery',warning);
 if(!staffWorldReady||S.world?.schema!==1){meteoText('worldBrief',staffWorldError||'当直データのバックアップと引継ぎを確認しています。');all('[data-world-readout]').forEach(n=>n.textContent='引継ぎ待ち');return;}
 const w=S.world,observed=worldObserve(S),job=w.jobs.find(j=>j.status!=='complete'),event=observed.incident;
 renderWorldTelemetry();
 document.body.dataset.worldAlert=observed.alert==='非常'?'critical':observed.alert==='警戒'?'watch':'normal';
 all('[data-world-readout]').forEach(n=>n.textContent={alert:observed.alert,magi:observed.magi,load:Math.round(w.cooling.load)+'%'}[n.dataset.worldReadout]);
 meteoText('launcherWorld',observed.alert+' / '+(event?'未処理の異常あり':job?'担当業務 '+worldStatusLabels[job.status]:'次の点検を待機'));
 meteoText('launcherComms','司令部の5人 / 部署連絡 '+w.communications.filter(c=>!c.read).length+'未読');
 meteoText('launcher666',externalMagiActive()?'外部侵入対処中 / 666へ':'外部防御の監視・開始・対処');
 meteoText('worldBrief',event?'冷却枝系統の負荷から異常案件が発生しています。異常対応の手順を確認してください。':job?'技術局から冷却系統の定期点検が届いています。担当業務を受領してください。':'報告を引き継ぎました。設備は継続監視中です。次の点検受付を待ちます。');
 meteoText('worldMagiReason',observed.magi+' / '+(event?'冷却系統：'+worldStatusLabels[event.status]:'日常業務：'+(job?worldStatusLabels[job.status]:'完了・次の受付待ち')));
 meteoText('worldJobStatus',job?worldStatusLabels[job.status]:'完了');
 const steps=$('worldJobSteps');steps.replaceChildren();const stages=['受付','受領','確認','解析','報告'];const step=job?({available:0,accepted:1,checked:2,processing:3,review:4,hold:0}[job.status]??0):5;
 stages.forEach((label,i)=>{const li=document.createElement('li');li.textContent=label;li.dataset.done=String(i<step);li.dataset.current=String(i===step);steps.append(li);});
 meteoText('worldJobEvidence',job?.evidence?'点検時の冷却負荷 '+Math.round(job.evidence.load)+'% / 主電源 '+(job.evidence.power?'接続':'停止')+' / 通信 '+(job.evidence.comms?'接続':'停止')+(job.status==='processing'?'。MAGIで照合中。次の30秒更新を待機。':job.status==='review'?'。解析結果を技術部へ報告できます。':'。解析依頼へ進めます。'):job?'受領後に表示確認を実施します。点検・分析・報告の順に処理します。':'点検報告は提出済み。報告に基づく予防整備を技術部へ引き継ぎました。');
 const actions=$('worldJobActions');actions.replaceChildren();
 for(const [action,label] of ({available:[['accept','点検業務を受領']],hold:[['accept','保留した業務を再開']],accepted:[['inspect','系統表示を確認'],['hold','業務を保留']],checked:[['analyze','MAGIへ解析を依頼'],['hold','業務を保留']],review:[['report','技術部へ点検結果を報告']]}[job?.status]||[]))worldButton(actions,action,label);
 meteoText('worldIncidentStatus',event?worldStatusLabels[event.status]:'異常なし');$('worldLoadFill').style.width=w.cooling.load+'%';
 meteoText('worldIncidentCause',event?'原因：MAGI稼働に伴う冷却負荷の蓄積 '+Math.round(w.cooling.load)+'%。'+(observed.magiHold?'通常審議を保留しています。':'進行すると通常審議へ影響します。'):'現在の模擬冷却負荷 '+Math.round(w.cooling.load)+'%。70%で異常案件、90%で通常審議を保留します。点検報告による予防整備で負荷を軽減できます。');
 meteoText('worldIncidentProcedure',event?({detected:'1. 案件を受領し、手順書の範囲を確認。',accepted:'2. 許可された冷却枝系統だけを隔離。',isolated:'3. 技術部へ独立診断を依頼。',diagnosing:'診断中。次の30秒更新を待機。',review:'4. 診断結果を赤木リツコへ報告。',reported:'技術部が整備・再接続を判断中。次の30秒更新を待機。'}[event.status]):'発生は負荷と稼働状態に依存します。表示だけのランダム警報は生成しません。');
 const eventActions=$('worldIncidentActions');eventActions.replaceChildren();for(const [action,label] of ({detected:[['incidentAccept','異常案件を受領']],accepted:[['isolate','手順書に基づき枝系統を隔離']],isolated:[['diagnose','技術部へ独立診断を依頼']],review:[['incidentReport','赤木リツコへ診断結果を報告']]}[event?.status]||[]))worldButton(eventActions,action,label);
 const depts=$('worldDepartmentList');depts.replaceChildren();
 for(const [name,text] of [['技術開発部 / MAGI',observed.magi+' / 冷却負荷 '+Math.round(w.cooling.load)+'%'],['EVA運用・パイロット',observed.evas.map(e=>'0'+e.unit+' '+stateJP[e.state]+' / SYNC '+Number(e.sync).toFixed(1)+'%').join(' ・ ')],['施設・都市防衛','主電源 '+(observed.power?'接続':'停止')+' / 通信 '+(observed.comms?'接続':'停止')+' / 都市健全性 '+v27CityIntegrity()+'%'],['戦術作戦部',S.defense.status==='active'?'敵性反応を監視中 / CASE '+S.defense.caseNo:'作戦状況：'+S.defense.status]]){const row=document.createElement('article'),title=document.createElement('strong'),p=document.createElement('p');title.textContent=name;p.textContent=text;row.append(title,p);depts.append(row);}
 const history=worldRenderPaged('worldHistory',w.history,worldHistoryPage,4,'history');worldHistoryPage=history.page;meteoText('worldHistoryPage',(history.page+1)+' / '+history.pages);$('worldHistoryPrev').disabled=!history.page;$('worldHistoryNext').disabled=history.page+1>=history.pages;
 const comms=worldRenderPaged('worldCommunications',w.communications,worldCommPage,3,'communications');worldCommPage=comms.page;meteoText('worldCommPage',(comms.page+1)+' / '+comms.pages);$('worldCommPrev').disabled=!comms.page;$('worldCommNext').disabled=comms.page+1>=comms.pages;meteoText('worldUnread',w.communications.filter(c=>!c.read).length+' 未読');
 if(observed.magiHold){$('magiVote').disabled=true;meteoText('magiLiveState','冷却系統点検 / 通常審議保留');meteoText('magiDecision','当直業務の異常案件を技術部へ報告してください。復旧承認後に再申請できます。');}
}
async function initializeStaffWorld(){
 if(staffWorldReady||staffWorldBusy)return;staffWorldBusy=true;
 try{
  if(window.__NERV_STATE_RECOVERY__?.blocked)throw Error(window.__NERV_STATE_RECOVERY__.message);
  const normalized=worldNormalize(S.world,Date.now());if(normalized.future)throw Error('この世界状態は新しい版の形式です。現在のデータを保持して引継ぎを停止しました。');
  const backup=await callNative('backupWorld',{state:worldClone(S),quarantine:normalized.repaired});if(backup?.error)throw Error('当直状態の事前保存に失敗：'+backup.error);
  const result=await commandOperation(()=>{S.world=normalized.world;worldAdvance(S,Date.now());if(worldObserve(S).magiHold){cancelSequence();staffInvalidateDecision();}});
  if(!result.ok)throw Error(result.error);staffWorldReady=true;staffWorldError='';draw();window.dispatchEvent(new CustomEvent('nerv-world-ready'));
 }catch(error){staffWorldError=error.message;staffWorldReady=false;renderStaffWorld();}
 finally{staffWorldBusy=false;}
}
function initWorldWorkflow(){
 if(!qs('.page[data-page="work"]'))return;
 mobileGroup('work',[['brief','当直'],['jobs','担当業務'],['incidents','異常対応'],['departments','部署・設備'],['communications','部署通信'],['history','履歴']].map(([id,label])=>({id,label,existing:true})),'brief');
 qs('.page[data-page="magi"]').append($('worldMagiPanel'));$('worldWorkflowTemplate').remove();registerTerminalView('magi','workflow','当直連携');
 for(const button of all('#v27MagiJudge')){button.removeEventListener('click',worldPriorJudge);button.addEventListener('click',v27Judge);}if(window.NERV_V27_TEST)window.NERV_V27_TEST.judge=v27Judge;
 document.addEventListener('click',event=>{const b=event.target.closest('[data-world-action]');if(b&&!b.disabled)worldAction(b.dataset.worldAction);});
 $('alertTarget').addEventListener('click',event=>{if(terminalAlert().key?.startsWith('world-')){event.stopImmediatePropagation();closeAlertReview();window.NERV_MOBILE.open('work','incidents');}},true);
 $('worldHistoryPrev').addEventListener('click',()=>{worldHistoryPage--;renderStaffWorld();});$('worldHistoryNext').addEventListener('click',()=>{worldHistoryPage++;renderStaffWorld();});$('worldCommPrev').addEventListener('click',()=>{worldCommPage--;renderStaffWorld();});$('worldCommNext').addEventListener('click',()=>{worldCommPage++;renderStaffWorld();});
 const priorReview=openAlertReview,normalClearLabel=$('alertClear').textContent;openAlertReview=function(mode='alert'){priorReview(mode);const incident=staffWorldReady&&worldActiveIncident(S.world);$('alertClear').disabled=!!incident;$('alertClear').textContent=incident?'技術部の復旧承認が必要':normalClearLabel;if(incident)meteoText('alertReviewDescription','管制補助の権限では全系統を復旧できません。「対象画面」から異常案件を受領し、診断結果を技術部へ報告してください。');};
 const priorDraw=draw;draw=function(){priorDraw();renderStaffWorld();};
 const priorAlert=renderTacticalAlert;renderTacticalAlert=function(){priorAlert();renderWorldTelemetry();};
 const priorMagi=renderMAGI;renderMAGI=function(){priorMagi();if(staffWorldReady)renderStaffWorld();};
 const priorMessage=commandMessage;commandMessage=function(page){if(page==='magi'&&worldMagiLimited())return '冷却枝系統の点検中 / 当直業務で技術部へ診断結果を報告してください。';return priorMessage(page);};
 const restore=()=>{const [page,view]=location.hash.slice(1).split('/');if(page==='work'||page==='magi'&&view==='workflow')window.NERV_MOBILE.open(page,view);};
 window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
 window.addEventListener('nerv-route',event=>{if(event.detail.page==='work'&&event.detail.view==='control'&&staffWorldReady&&worldActiveIncident(S.world))mobileNavigate('work','incidents');renderStaffWorld();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)worldPulse();});
 window.addEventListener('pagehide',()=>{if(staffWorldReady)persist();});
 setInterval(()=>{if(staffWorldReady)worldPulse();else if(!staffWorldError)initializeStaffWorld();},5000);
 window.NERV_WORLD={act:worldAction,advance:worldPulse,snapshot:()=>({ready:staffWorldReady,error:staffWorldError,world:worldClone(S.world||null),observed:staffWorldReady?worldClone(worldObserve(S)):null}),retry:()=>{staffWorldError='';return initializeStaffWorld();}};
 renderStaffWorld();restore();initializeStaffWorld();
}
initWorldWorkflow();
// Make implemented features visible from the first home screen and strengthen real-state effects.
function createProtectProjection(canvas){
 let gl;try{gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});}catch(error){}
 const fallback=()=>{canvas.dataset.renderer='css';return {refresh(){}};};if(!gl)return fallback();
 let program,buffer,frame=0,lost=false,lastDraw=0;
 try{
  const compile=(kind,source)=>{const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('compile');return s;};
  const vertex=compile(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
  const fragment=compile(gl.FRAGMENT_SHADER,'precision mediump float;uniform vec2 size;uniform float clock;uniform float pressure;uniform float barrier;void main(){vec2 uv=gl_FragCoord.xy/size;vec2 q=uv*vec2(15.,4.);q.x+=mod(floor(q.y),2.)*.5;vec2 a=abs(fract(q)-.5);float h=max(a.x*.86+a.y*.5,a.y);float edge=smoothstep(.42,.47,h)*(1.-smoothstep(.48,.5,h));float scan=exp(-abs(uv.x-fract(clock*.16))*32.);vec3 red=vec3(1.,.23,.08),green=vec3(.15,1.,.7);vec3 color=mix(red,green,barrier);float alpha=edge*(.16+pressure*.22)+scan*.22;gl_FragColor=vec4(color*alpha,alpha);}');
  program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 }catch(error){if(program)gl.deleteProgram(program);if(buffer)gl.deleteBuffer(buffer);return fallback();}
 const u={};for(const name of ['size','clock','pressure','barrier'])u[name]=gl.getUniformLocation(program,name);const p=gl.getAttribLocation(program,'p');canvas.dataset.renderer='webgl';
 const visible=()=>!document.hidden&&currentPage==='magi'&&mobileCurrent.magi==='external';
 function paint(now=0){frame=0;if(lost||gl.isContextLost()||!visible())return;if(isMoving()&&now-lastDraw<(window.NERV_FX?.frameBudget()||16)-1){frame=requestAnimationFrame(paint);return;}lastDraw=now;const r=canvas.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,1.5);const width=Math.max(1,Math.round(r.width*ratio)),height=Math.max(1,Math.round(r.height*ratio));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}const state=externalMagiState();gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);gl.uniform2f(u.size,canvas.width,canvas.height);gl.uniform1f(u.clock,isMoving()?now/1000:0);gl.uniform1f(u.pressure,Math.max(...state.pressure)/100);gl.uniform1f(u.barrier,['protected','contained'].includes(state.status)?1:0);gl.drawArrays(gl.TRIANGLES,0,6);if(isMoving())frame=requestAnimationFrame(paint);}
 function refresh(){if(frame)cancelAnimationFrame(frame);frame=0;if(visible())paint(performance.now());}
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;if(frame)cancelAnimationFrame(frame);canvas.dataset.renderer='css';});document.addEventListener('visibilitychange',refresh);window.addEventListener('resize',refresh);window.addEventListener('nerv-fx-quality',refresh);window.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change',refresh);return {refresh};
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
// Small original vector plates informed by the TV-series equipment and MAGI references.
// Existing EVA, personnel, headquarters, Geofront and city-weapon artwork is untouched.
function nervWeaponPlate(kind) {
 const shapes={
  knife:'<g data-reference="user-knife"><path fill="#bfc6ca" d="M18 79 157 49l23 18-25 28L29 90z"/><path fill="#e6e8e7" d="m18 79 139-30-15 18-109 17z"/><path fill="#202b3b" d="m33 84 109-17 16 11-16 11-113 1z"/><path fill="#59606b" d="m156 49 24 18-25 28-17-6 20-15-16-7z"/><path fill="#9ea6af" d="m169 53 22 10-2 25-27 8-12-12 17-12-7-9z"/><path fill="#6b3039" d="m190 63 77-8 10 40-88-7z"/><path fill="#a45053" d="m195 64 67-5 1 8-64 8z"/><path fill="#131c2e" d="m263 55 16-4 10 44-13 5z"/><path fill="#23324b" d="m212 59-3-16 8-1 6 18-1 19h-8z"/><g fill="#121a23" stroke="#a99085" stroke-width=".7"><ellipse cx="205" cy="80" rx="4" ry="5"/><ellipse cx="230" cy="76" rx="4" ry="5"/><ellipse cx="253" cy="73" rx="4" ry="5"/></g><path d="m163 66 5-3 6 5-6 7z" fill="none" stroke="#5b626c"/><path class="knife-frequency" d="M36 101h49m8-3h44" fill="none" stroke="#85d8c4"/></g>',
  rifle:'<path fill="#556652" d="m58 79 36-11 85 2 17 13-21 23H86l-11-10H54z"/><path fill="#abb4a0" d="M181 78h109v14H181z"/><path fill="#263a35" d="m95 105-13 30 13 4 20-34m22 0-4 35 22 2 5-36"/><path fill="#9fa88e" d="m86 69 9-17h64l11 18z"/><path d="M104 78h56m-54 9h50m49-6h66m-66 7h66" stroke="#b8bd92"/><path fill="#d5a25d" d="m57 79-23-4 1 21 39 1z"/>',
  positron:'<g data-reference="user-positron" transform="translate(5 -8) rotate(-15 160 87) scale(.95)"><path fill="#202d2c" d="M171 61h130v8H171z"/><path fill="#121f21" d="M281 49h7v28h-7z"/><path fill="#687b7b" d="M174 72h75v7h-75z"/><path fill="#a1b9ba" d="m171 58 20 6-20 28-25 8-17-13z"/><path fill="#e1e8e7" d="m35 82 83-38 44-4 28 24-22 18-25 3-31 34-27 12-15-12 32-36-52 20z"/><path fill="#b5c8c9" d="m52 86 67-36 40-4 18 17-16 12-25 4-31 34-18 9-9-6 28-35z"/><path fill="#f2f1e7" d="m104 91 14 4-8 24 8 20-16 17-20-9-8-24z"/><path fill="#c7d4d1" d="m82 123 20-23 5 4-9 20 9 15-8 9-16-6z"/><path fill="#e2e5dd" d="m31 89 16 1-5 20 20-7 16 6-10 29-20 8-25-17-3-15z"/><path fill="#6c898c" d="m27 101 8-6 4 6-4 12 9 12-6 5-12-16z"/><path fill="#203d46" d="m57 94 28-5 8 6-16 17-12-5z"/><g fill="#1e3f6b" stroke="#718f9b" stroke-width="2"><ellipse cx="53" cy="123" rx="13" ry="15"/><ellipse cx="97" cy="137" rx="12" ry="13"/></g><g fill="#3da6cc" stroke="#153447" stroke-width=".7"><path d="m49 112 7 2 3 10-6 10-8-7z"/><path d="m92 128 8 2 5 9-9 9-6-8z"/></g><path d="m48 83 26-14-8 11-12 7" fill="none" stroke="#63cbe3" stroke-width="2"/><path d="m137 51 13 15 13-4m-8 12 6 9m-35-5-5 6" fill="none" stroke="#53676b"/><path class="positron-flow" d="M193 83h43" fill="none" stroke="#8ae2d4" stroke-width="2"/></g>'
 };
 const labels={knife:['PK-01 / PROGRESSIVE KNIFE','HIGH FREQUENCY / CORE CONTACT'],rifle:['PR-01 / PALLET RIFLE','KINETIC / MAGAZINE FEED'],positron:['EPC / POSITRON RIFLE','EXTERNAL POWER / TWO-STAGE CHARGE']};
 const item=labels[kind]||labels.knife;
 return '<svg class="weapon-plate" viewBox="0 0 320 170" role="img" aria-label="'+item[0]+' の独自装備図"><defs><pattern id="weaponPlateGrid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="#30483a" stroke-width=".5"/></pattern></defs><path fill="#0b1513" stroke="#6c7949" d="M1 1h318v168H1z"/><path fill="url(#weaponPlateGrid)" d="M8 25h304v126H8z"/><g stroke="#b6bd8e" stroke-width="1.4" stroke-linejoin="bevel">'+(shapes[kind]||shapes.knife)+'</g><path d="M12 30V16h20m276 14V16h-20M12 137v16h20m276-16v16h-20" stroke="#cd994f" fill="none"/><g fill="#d5ba7a" font-family="monospace" font-size="8"><text x="12" y="12">'+item[0]+'</text><text x="12" y="164">'+item[1]+'</text></g></svg>';
}
function nervMagiDiagram(id) {
 const names=['MELCHIOR','BALTHASAR','CASPER'];
 const shapes=['M104 13h112v43l-26 28h-60l-26-28z','M17 98l68-31 39 36v62H17z','m303 98-68-31-39 36v62h107z'];
 return '<svg viewBox="0 0 320 181" class="magi-network" role="img" aria-label="MAGI三基の外部防御状態"><path d="M160 83v25m-39 27h77M90 95l40-22m100 22-40-22" class="magi-data-link" fill="none"/><g fill="#15322b" stroke="#8fbc93" stroke-width="1.5">'+shapes.map((d,i)=>'<g data-fx-core="'+i+'"><path d="'+d+'"/><text x="'+[160,72,248][i]+'" y="'+[35,117,117][i]+'">'+names[i]+'-'+(i+1)+'</text><text class="magi-core-readout" x="'+[160,72,248][i]+'" y="'+[53,139,139][i]+'">待機</text></g>').join('')+'</g><path d="m133 113 27-15 27 15v28l-27 15-27-15z" fill="#2e2119" stroke="#dd974e"/><text class="magi-center" x="160" y="132">MAGI</text><text class="magi-diagram-caption" x="160" y="177">'+id+' / PERSONALITY TRANSPLANT OS</text></svg>';
}
function nervLaunchPlate() {
 return '<div class="launch-shaft" aria-hidden="true"><svg viewBox="0 0 320 145"><defs><pattern id="launchTrack" width="30" height="24" patternUnits="userSpaceOnUse"><path d="M0 0h30M6 0v24m18-24v24" fill="none" stroke="#526b5a"/></pattern></defs><path d="M40 4h240v137H40z" fill="#091b1c" stroke="#718d72"/><path class="shaft-track" d="M43 5h234v136H43z" fill="url(#launchTrack)"/><path class="launch-gate launch-gate-left" d="M40 8h111v126H40z" fill="#39382a" stroke="#d8a453"/><path class="launch-gate launch-gate-right" d="M169 8h111v126H169z" fill="#39382a" stroke="#d8a453"/><g class="entry-plug-diagram" data-reference="user-entry-plug"><g transform="translate(199 60) rotate(-42)"><path d="M0-7Q-9-7-9 0t9 7h67V-7z" fill="#eeeeea" stroke="#7e9295"/><path d="M0-7Q-11-7-11 0T0 7h7V-7z" fill="#edab2b" stroke="#a16d2d"/><path d="M68-7h10q11 7 0 14H68z" fill="#e6a329" stroke="#a16d2d"/><path d="M47-7h14V7H47z" fill="#b7292f"/><path d="M47-7h7v7h-7m7 0h7v7h-7" fill="#1e292e"/><path d="M61-7h10V7H61z" fill="#9badae"/><path d="m63-6 6 4-6 2m0 1 6 3-6 2" stroke="#a33330" fill="none" stroke-width="1.4"/><path d="M8-4h37M12 4h30" stroke="#b0bdbb" stroke-width=".5"/><text class="entry-plug-number" x="15" y="3" fill="#20282b" stroke="none" font-size="7" font-family="monospace">00</text></g></g><path d="M18 11v119m284-119v119M18 35h12m-12 24h12m-12 24h12m-12 24h12m272-72h-12m12 24h-12m12 24h-12m12 24h-12" stroke="#b8854b"/></svg><div class="eva-sprite mechanism-eva launch-unit" data-unit="1"></div><span class="launch-cage-label">CAGE LINK / ENTRY PLUG</span></div>';
}
// Separate new equipment art; protected EVA/people/HQ/city assets and old plate source stay intact.
const v214LegacyWeaponPlate=nervWeaponPlate;
nervWeaponPlate=function(kind){
 const labels={knife:['PROGRESSIVE KNIFE','高周波振動刃 / 近接装備'],rifle:['PALLET RIFLE','標準携行火器 / 運動弾'],positron:['POSITRON RIFLE','陽電子狙撃 / 外部給電']};if(!labels[kind])return v214LegacyWeaponPlate(kind);
 return '<figure class="weapon-plate detailed-weapon" data-equipment="'+kind+'" role="img" aria-label="'+labels[kind][0]+'の精細装備図"><figcaption>'+labels[kind][0]+'<small>NERV / ARMAMENT</small></figcaption><div class="weapon-art"><i data-weapon-art="'+kind+'"></i></div><p>'+labels[kind][1]+'</p></figure>';
};
nervMagiDiagram=function(id){
 const cores=[{x:140,y:8,w:140,h:84,name:'MELCHIOR-1',jp:'科学者'},{x:12,y:126,w:160,h:100,name:'BALTHASAR-2',jp:'母'},{x:248,y:126,w:160,h:100,name:'CASPER-3',jp:'女'}];
 return '<svg viewBox="0 0 420 242" class="magi-network magi-detailed" role="img" aria-label="MAGI三基・人格移植OSと合議の接続図"><g class="magi-wiring"><path d="M210 92v27m-54 57 37-37m71 37-37-37M82 125V61h58m198 64V61h-58M85 226v8h250v-8"/><path class="magi-data-link" d="M210 95v29m-27 14-25 27m79-27 25 27"/></g><g class="magi-motherboard"><path d="m180 119 30-17 30 17v34l-30 17-30-17z"/><path d="m189 124 21-12 21 12v24l-21 12-21-12z"/><text x="210" y="141">MAGI</text></g>'+cores.map((c,i)=>'<g data-fx-core="'+i+'" data-status="idle" transform="translate('+c.x+' '+c.y+')"><path class="core-shell" d="M10 0h'+(c.w-20)+'l10 10v'+(c.h-20)+'l-10 10H10L0 '+(c.h-10)+'V10z"/><path class="core-trace" d="M4 19V10l6-6h28m'+(c.w-48)+' 0h28l6 6v9M4 '+(c.h-19)+'v9l6 6h28m'+(c.w-48)+' 0h28l6-6v-9"/><path class="core-rail" d="M12 24h'+(c.w-24)+'M12 '+(c.h-27)+'h'+(c.w-24)+'"/><text class="core-index" x="'+(c.w-14)+'" y="18">0'+(i+1)+'</text><text class="core-name" x="'+c.w/2+'" y="43">'+c.name+'</text><text class="core-persona" x="'+c.w/2+'" y="'+(c.h-32)+'">'+c.jp+' / PERSONA</text><text class="magi-core-readout" x="'+c.w/2+'" y="'+(c.h-10)+'">稼働</text><g class="core-contacts"><path d="M20 0v-4m8 4v-4m8 4v-4m8 4v-4M20 '+c.h+'v4m8-4v4m8-4v4m8-4v4"/></g></g>').join('')+'<text class="magi-diagram-caption" x="210" y="240">'+id+' / PERSONALITY TRANSPLANT OS</text></svg>';
};
// Extend the existing combat resolver; old knife/rifle/city-defense rules are retained.
let armamentSelected='knife';
const v212PreviousCombat=evaCombatAction,v212PreviousConditions=evaCombatConditions;
// A small, explicitly simulated contact-damage report accompanies a real enemy turn.
// It does not replace the original city-defense resolver or invent injuries while idle.
const v212PreviousAdvance=v27Advance;
v27Advance=function(){
 const before=S.defense.round,unit=S.tactics.attacker,c=evaCombatState(),contact=S.defense.status==='active'&&c.range===1&&S.evas[unit].state==='DEPLOYED';
 v212PreviousAdvance();
 const d=S.defense,e=S.evas[unit];
 if(contact&&d.status==='active'&&d.round>before&&d.enemy.hp>0&&d.enemy.dist<=2){
  const parts=['head','torso','leftArm','rightArm','leftLeg','rightLeg'],part=parts[(d.round+unit)%parts.length],damage=e.damage&&typeof e.damage==='object'&&!Array.isArray(e.damage)?{...e.damage}:Object.fromEntries(parts.map(p=>[p,0]));
  const old=Math.max(0,Math.min(100,Number(damage[part])||0)),amount=Math.max(1,Math.round(d.enemy.force/(e.at?16:8)));
  if(old<20){damage[part]=Math.min(20,old+amount);e.damage=damage;e.damageSource='近接戦闘からの軽微損傷推定 / SIM';addLog('eva','UNIT-0'+unit+' / 接触損傷報告 '+part+' '+damage[part]+'% / 整備時に確認');}
 }
};
const v212PreviousRecovery=recoveredStaffState;
recoveredStaffState=function(previous){const next=v212PreviousRecovery(previous);if(next.evaCombat){next.evaCombat.positronCharge=0;next.evaCombat.positronUnit=null;next.evaCombat.positronRound=null;}for(const e of next.evas)if(e.damage){e.damage=Object.fromEntries(Object.keys(e.damage).map(k=>[k,0]));e.damageSource='明示的な全系統復旧 / SIM';}return next;};

const v212PreviousCombatState=evaCombatState;
evaCombatState=function(){const state=v212PreviousCombatState();if(S.evaCombat?.caseNo!==S.defense.caseNo){state.positronCharge=0;state.positronUnit=null;state.positronRound=null;}return state;};
function positronChargeState() {
 const c=evaCombatState();
 return S.evaCombat?.caseNo===S.defense.caseNo&&c.positronUnit===S.tactics.attacker&&Number.isFinite(c.positronRound)&&S.defense.round-c.positronRound<=3?Math.max(0,Math.min(100,Number(c.positronCharge)||0)):0;
}
evaCombatConditions=function(action) {
 if(action==='positronSupply'){const errors=combatBasics();if(S.defense.spares<1)errors.push('予備送電枠が必要');if(S.defense.energy>=100)errors.push('都市電力は充足しています');return errors;}
 if(!['positronCharge','positron'].includes(action))return v212PreviousConditions(action);
 const errors=combatBasics(),charge=positronChargeState(),cost=action==='positronCharge'?22:40;
 if(!evaExternalPower(S.tactics.attacker))errors.push('担当機のアンビリカルを接続 / 特別高出力送電');
 if(S.defense.scans<68)errors.push('対象を2回解析 / 解析68以上');
 if(S.defense.energy<cost)errors.push('都市電力'+cost+'必要');
 if(action==='positronCharge'&&charge>=100)errors.push('充填は完了しています');
 if(action==='positron'&&charge<100)errors.push('2段階充填を完了 / '+charge+'%');
 if(action==='positron'&&!combatApproved())errors.push('現ターンのMAGI戦術承認');
 return errors;
};
evaCombatAction=async function(action) {
 const before={hp:S.defense.enemy?.hp||0,caseNo:S.defense.caseNo,unit:S.tactics.attacker,sync:S.evas[S.tactics.attacker].sync,scans:S.defense.scans};
 const result=['positronSupply','positronCharge','positron'].includes(action)?await commandOperation(()=>{
  const errors=evaCombatConditions(action);if(errors.length)throw Error(errors.join(' / '));
  if(action==='positronSupply'){v27Power();return;}
  const d=S.defense,c=evaCombatState(),charge=positronChargeState();
  c.positronUnit=S.tactics.attacker;c.approval=null;
  if(action==='positronCharge') {
   d.energy-=22;c.positronCharge=Math.min(100,charge+50);c.positronRound=d.round+1;
   S.evaCombat=c;v27Record('ポジトロンライフル / 特別送電・充填 '+c.positronCharge+'%');v27Advance();
  } else {
   d.energy-=40;const damage=Math.round(200+d.scans*.4+S.evas[S.tactics.attacker].sync*.2);
   d.enemy.hp=Math.max(0,d.enemy.hp-damage);d.lastAttackSource='eva-positron';c.positronCharge=0;c.attacks++;
   S.evaCombat=c;v27Record('UNIT-0'+S.tactics.attacker+' / ポジトロンライフル / '+damage+' DAMAGE');addLog('eva','高出力陽電子射撃 / '+damage+' DAMAGE');
   if(d.enemy.hp<=0){evaCombatFinishing=true;try{v27Finish(true,'EVA高出力陽電子射撃で目標を撃破');}finally{evaCombatFinishing=false;}}
   else v27Advance();
  }
 }):await v212PreviousCombat(action);
 if(result.ok&&before.hp>0&&S.defense.enemy?.hp<before.hp&&['knife','rifle','positron'].includes(action)&&S.defense.caseNo===before.caseNo&&S.defense.lastAttackSource==='eva-'+action) {
  const raw=action==='knife'?Math.round(52+before.sync*.22):action==='rifle'?Math.round(30+before.scans*.18+before.sync*.08):Math.round(200+before.scans*.4+before.sync*.2);
  window.dispatchEvent(new CustomEvent('nerv-confirmed-hit',{detail:{weapon:action,unit:before.unit,caseNo:before.caseNo,damage:Math.min(before.hp,raw),remaining:S.defense.enemy.hp,maxHp:S.defense.enemy.maxHp}}));
 }
 return result;
};
function renderArmament() {
 if(!$('armamentPlate'))return;
 const c=evaCombatState(),positron=armamentSelected==='positron',name={knife:'プログレッシブナイフ',rifle:'パレットライフル',positron:'ポジトロンライフル'}[armamentSelected];
 if($('armamentPlate').dataset.weapon!==armamentSelected){$('armamentPlate').innerHTML=nervWeaponPlate(armamentSelected);$('armamentPlate').dataset.weapon=armamentSelected;const small=$('armamentControlPlate');if(small)small.innerHTML=nervWeaponPlate(armamentSelected).replaceAll('weaponPlateGrid','weaponControlGrid');}
 all('[data-armament]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.armament===armamentSelected)));
 meteoText('armamentName',name);meteoText('armamentSupply','UNIT-0'+S.tactics.attacker+' / '+(evaExternalPower(S.tactics.attacker)?'EXT':'INT')+' / ENERGY '+S.defense.energy+'%');
 const info={knife:'高周波振動刃。近接し、A.T.を中和してコアを攻撃。',rifle:'実体弾。敵A.T.の中和中に射撃。残弾 '+c.ammo+'/6。',positron:'外部給電・2段階充填で敵A.T.を貫通。充填 '+positronChargeState()+'% / 有効3ターン。'};
 meteoText('armamentDescription',info[armamentSelected]);
 const errors=evaCombatConditions(armamentSelected);$('armamentFire').disabled=!!errors.length;$('armamentFire').textContent=name+'で攻撃';
 meteoText('armamentRequirements',errors.length?'必要：'+errors.join(' / '):'条件成立 / 攻撃を実行できます。');
 $('positronSupply').hidden=!positron;$('positronSupply').disabled=!!evaCombatConditions('positronSupply').length;$('positronCharge').hidden=!positron;$('positronCharge').disabled=!!evaCombatConditions('positronCharge').length;
 $('armamentPlate').dataset.charged=String(positron&&positronChargeState()===100);$('armamentControlPlate').dataset.charged=$('armamentPlate').dataset.charged;
}
function initV212Combat() {
 if(!qs('#staffSupport')||!$('evaEngagePanel'))return;
 const panel=document.createElement('section');panel.className='mobile-view';panel.dataset.view='armament';panel.id='armamentPanel';
 panel.innerHTML='<div class="staff-panel"><div class="staff-panel-title"><h2>携行兵装 / ARMAMENT</h2><b>SIM</b></div><div class="armament-picker"><button data-armament="knife">ナイフ</button><button data-armament="rifle">パレット</button><button data-armament="positron">ポジトロン</button></div><div id="armamentPlate"></div><h3 id="armamentName"></h3><p id="armamentSupply" class="staff-note"></p><p id="armamentDescription" class="staff-guide"></p><p id="armamentRequirements" class="staff-note" role="status"></p><button id="positronCharge" class="staff-secondary">特別送電・充填 / 電力22・1ターン</button><button class="staff-secondary" data-combat="authorize">現ターンのMAGI戦術承認</button><button id="armamentFire" class="staff-primary">攻撃</button><div class="ops-route-grid"><button data-ops-route="mission/combat">接近・A.T.中和 ↗</button><button data-ops-route="eva/readiness" id="armamentPowerLink">外部給電へ ↗</button></div></div>';
 qs('.page[data-page="mission"]').append(panel);registerTerminalView('mission','armament','携行兵装');
 const control=document.createElement('section');control.className='mobile-view';control.dataset.view='weapon-control';control.id='weaponControlPanel';control.innerHTML='<div class="staff-panel"><div class="staff-panel-title"><h2>携行兵装 / 使用指示</h2><b>SIM</b></div><div id="armamentControlPlate"></div><div id="weaponPowerActions" class="weapon-power-actions"></div></div>';
 qs('.page[data-page="mission"]').append(control);registerTerminalView('mission','weapon-control','武器使用');
 const commands=control.querySelector('.staff-panel');commands.insertBefore($('armamentRequirements'),$('weaponPowerActions'));
 const supply=document.createElement('button');supply.id='positronSupply';supply.className='staff-secondary';supply.textContent='補助送電 / 予備枠1・電力+38';supply.addEventListener('click',()=>evaCombatAction('positronSupply'));$('weaponPowerActions').append(supply,$('positronCharge'),panel.querySelector('[data-combat="authorize"]'));commands.append($('armamentFire'),panel.querySelector('.ops-route-grid'));
 const use=document.createElement('button');use.className='staff-primary';use.dataset.opsRoute='mission/weapon-control';use.textContent='選択武器の使用条件・攻撃へ ↗';panel.querySelector('.staff-panel').append(use);

 all('[data-armament]').forEach(b=>b.addEventListener('click',()=>{armamentSelected=b.dataset.armament;renderArmament();window.dispatchEvent(new CustomEvent('nerv-equipment-selected',{detail:{weapon:armamentSelected}}));}));
 $('armamentFire').addEventListener('click',()=>evaCombatAction(armamentSelected));$('positronCharge').addEventListener('click',()=>evaCombatAction('positronCharge'));
 $('armamentPowerLink').addEventListener('click',()=>{S.selectedEva=S.tactics.attacker;renderEVA();});
 for(const target of [$('evaEngagePanel'),$('evaCombatPanel')]){const b=document.createElement('button');b.className='staff-secondary';b.dataset.opsRoute='mission/armament';b.textContent='武器のイメージ・ナイフ・ポジトロン ↗';target.append(b);}
 const oldDraw=draw;draw=function(){oldDraw();renderArmament();};window.addEventListener('nerv-route',()=>renderArmament());
 window.NERV_OPERATIONS.combat=evaCombatAction;window.NERV_OPERATIONS.combatConditions=evaCombatConditions;
 $('evaMaintain').addEventListener('click',event=>{if(selected().state!=='MAINTENANCE')return;event.stopImmediatePropagation();const unit=S.selectedEva;commandOperation(()=>{const e=S.evas[unit];if(e.state!=='MAINTENANCE')throw Error('整備対象を再確認してください');e.state='HANGAR';e.power=300;e.powerUpdatedAt=null;e.at=false;if(e.damage)e.damage=Object.fromEntries(Object.keys(e.damage).map(k=>[k,0]));e.damageSource='整備完了・部位確認済み / SIM';addLog('eva','UNIT-0'+unit+' / MAINTENANCE COMPLETED / 部位報告更新');});},true);
 const restore=()=>{if(['#mission/armament','#mission/weapon-control'].includes(location.hash))window.NERV_MOBILE.open('mission',location.hash.split('/')[1]);};window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);restore();renderArmament();
}
initV212Combat();
// TV-series personnel. All lines below are original writing, not episode quotations.
// No hidden lore is disclosed to a C-3 operator, including by the commander.
const dialogPersonas={
 shinji:{code:'THIRD / EVA-01',department:'EVA運用 / 初号機パイロット',role:'搭乗・管制への機体報告',authority:'自機の操作。出撃・作戦変更は指揮系統に従う',knowledge:['ownEva','public'],pronoun:'僕',address:'あなた',tone:'ためらいを残した丁寧な話し方。断定や強がりを避ける',relations:'ミサトの作戦指示を受ける。ゲンドウには距離を感じている',temperament:'内向的 / 他者の反応に敏感',
 daily:['今日はチェロの弓を張り直しました。少し音が整うと、落ち着くんです。','食事の片付けは僕の番です。休憩中なら、少し話せます。','訓練の後は、静かな場所で音楽を聴きたいです。そちらはどう過ごしていますか。','同じ曲でも、その日によって違って聞こえるんです。今日は少し穏やかに聞けました。'],care:['気づいてくれて、ありがとうございます。休める時には休みます。','少し緊張していたかもしれません。あなたも無理をしていませんか。','話を聞いてもらえると、ひと息つけます。'],close:['うまく言えないこともありますけど、聞いてもらっていいですか。','また休憩が合ったら、話したいです。急がなくていいなら。','今日は僕からも聞いていいですか。勤務の後、楽しみにしていることはありますか。'],watch:'僕は管制の連絡を待ちます。まだ勝手には動きません。',battle:'今は作戦中なので、管制の指示を聞きます。必要な連絡だけ、お願いします。',critical:'不安ですけど、管制の声を聞きます。今は安全の確認を先にお願いします。',limit:'僕にはその内部情報は分かりません。担当の方に確認してもらえますか。'},
 rei:{code:'FIRST / EVA-00',department:'EVA運用 / 零号機パイロット',role:'搭乗・接続確認',authority:'自機の操作。管制の指示を待つ',knowledge:['ownEva','public'],pronoun:'私',address:'あなた',tone:'短く静かに、必要なことを述べる。過剰に感情を言語化しない',relations:'碇司令の指示を重視する。シンジとの交流で他者を意識する',temperament:'寡黙 / 自分より任務を優先しがち',
 daily:['本を読んでいたわ。今は区切りがついたところ。','食事は済ませたわ。あなたは？','静かね。しばらく、このままでいい。','次の連絡までは待機しているわ。話は聞ける。'],care:['分かったわ。休憩の時に休む。あなたも。','体調の変化は報告するわ。気にかけてくれたのね。','ありがとう。少し、目を休めるわ。'],close:['話して。急がなくていいわ。','あなたが話したいなら、ここにいる。','前より、連絡を待つことが増えた気がするわ。'],watch:'零号機の指示を待つ。必要な確認をして。',battle:'今は作戦中。零号機の連絡を優先するわ。',critical:'安全確認を先に。私は指示を待つ。',limit:'その情報は持っていないわ。担当部署へ。'},
 asuka:{code:'SECOND / EVA-02',department:'EVA運用 / 弐号機パイロット',role:'搭乗・戦闘時の機体報告',authority:'自機の操作。作戦全体の発令権は持たない',knowledge:['ownEva','public'],pronoun:'あたし',address:'あんた',tone:'自信のある率直な口調。雑に侮辱せず、評価されたい気持ちをにじませる',relations:'ミサトの指揮下。シンジには競争心があり、レイには対抗意識がある',temperament:'負けず嫌い / 評価に敏感',
 daily:['訓練記録、ちゃんと見てる？ 数字だけじゃなくて動きも見なさいよ。','休憩くらい自分で取れるわ。あんたは昼、済ませたの？','次の訓練では無駄な動きを減らすつもり。今の記録で満足してないわよ。','少し外の空気を吸いたいわね。待機が終わってからだけど。'],care:['分かってるわよ。……気にかけてくれたことは覚えとく。','あたしは平気。あんたの方こそ、無理する前に休みなさいよ。','少し休むわ。それで十分。次はちゃんと見てなさい。'],close:['話くらいなら聞くわ。休憩が終わるまでよ。','ちゃんと最後まで聞くのね。……それなら、もう少し話してもいいけど。','あんたの話も聞かせなさいよ。いつもあたしの話ばかりじゃない。'],watch:'準備は管制と合わせるわ。出撃の指示はミサトを通して。',battle:'今は作戦中よ。弐号機に必要な情報を短く送って。',critical:'慌てて手順を飛ばさないで。こっちは管制の連絡を待つわ。',limit:'その系統の内部までは知らないわ。担当に聞きなさいよ。'},
 misato:{code:'OPS / TACTICAL',department:'戦術作戦部',role:'作戦立案・戦術指揮・パイロットへの指示',authority:'戦術指揮。技術的な復旧承認は技術部へ',knowledge:['eva','tactical','public'],pronoun:'私',address:'あなた',tone:'通常は親しみやすく、危機には短く明確な指示',relations:'リツコとは旧知。パイロットの生活と作戦双方に責任を持つ',temperament:'行動的 / 責任感',
 daily:['休憩は確保できてる？ 判断が鈍る前に交代を頼みなさい。','食事の時間、引継ぎ表と合わせておきましょ。空腹じゃ集中できないもの。','今日は仕事を早めに区切れそう？ 休める時は休んでおくのも仕事よ。','家に帰る前に、持ち越す案件だけ整理しましょ。あとは明日の当直に渡せるから。'],care:['ありがと。あなたも抱え込む前に声をかけなさい。','そうね、引継ぎを確認してひと息入れるわ。','助かるわ。気づいたことを言える相手がいるのは大事ね。'],close:['業務の話じゃなくても聞くわよ。今日はどうしたの？','話すだけで整理できることもあるでしょ。急がなくていいわ。','あなたのことも少し知っておきたいわ。話せる範囲でいいから。'],watch:'指揮系統を確認して待機。推測だけで出撃手順を進めないこと。',battle:'戦術回線を優先。担当の確認結果を短くまとめて送って。',critical:'安全と管制回線の確保を優先して。未確認のまま復旧扱いにしないこと。',limit:'その区分はこの回線では扱えないわ。職務上必要な範囲で確認しましょ。'},
 ritsuko:{code:'SCI / MAGI',department:'技術開発部 / Project E',role:'EVA・MAGIの技術管理と診断',authority:'技術診断・復旧承認。戦術発令とは区別',knowledge:['eva','magi','technical','public'],pronoun:'私',address:'あなた',tone:'落ち着いた合理的な説明。観測と推測を区別',relations:'マヤは技術部の補佐。ミサトとは旧知',temperament:'分析的 / 感情を抑制',
 daily:['コーヒーを淹れ直したところよ。冷める前に区切りをつけたいわね。','猫の本を借りたの。仕事と関係のない読書も必要ね。','記録の整理をしていたわ。休憩にまで数値を持ち込むのはやめておきましょう。','今日は少し静かね。確認を終えたら、目を休めるつもりよ。'],care:['ありがとう。あなたも睡眠は削らないこと。','自分の疲労には気づきにくいものね。忠告は受け取るわ。','少し休むわ。集中力を使い切ってからでは遅いもの。'],close:['結論を急がなくていい話なら、少し付き合うわ。','率直に話せる相手がいるのは悪くないわね。','あなたはどう考えるの？ 数値にできないことも、聞いてみたいわ。'],watch:'観測値と推測を分けて報告してください。判断材料が先よ。',battle:'技術系統を監視するわ。未照合のデータを確定値として送らないで。',critical:'隔離と診断を優先。復旧承認までは接続を戻さないで。',limit:'その情報は管制補助の職務区分には開示できないわ。'},
 maya:{code:'TECH / EVA MONITOR',department:'技術局 / 管制技術',role:'同期・機体データの監視、リツコの技術補佐',authority:'監視・照合・報告。最終復旧承認は赤木博士',knowledge:['eva','magi','technical','public'],pronoun:'私',address:'あなた',tone:'丁寧で気遣いがある。異常は具体的に報告',relations:'リツコを先輩として尊敬。日向・青葉と管制業務を分担',temperament:'誠実 / 緊急時には緊張する',
 daily:['休憩室はいま空いていましたよ。お茶を飲むなら、ちょうどよさそうです。','今日は引継ぎを早めにまとめたいです。あなたの当直はどうですか？','読みかけの本があるんです。休憩で少し進められたらと思って。','画面を見続けると肩が固まりますね。少し席を外して伸ばそうと思います。'],care:['ありがとうございます。少し目を休めますね。','つい画面を見続けてしまって。気づいてもらえて助かります。','あなたもお疲れさまです。一緒に、ひと息つきませんか。'],close:['はい。業務以外のお話も、少ししてみたいです。','あなたと話すと落ち着きます。また時間が合ったら声をかけてください。','今日はあなたのお話も聞いてみたいです。話せることからで大丈夫ですよ。'],watch:'観測表示を照合します。異常があれば担当案件に記録してください。',battle:'機体と同期データを監視中です。必要な照合は管制へお願いします。',critical:'先輩へ報告します。隔離手順と診断記録の確認を先にお願いします。',limit:'私の担当では確認できない情報です。必要なら上級職員へ照会してください。'},
 hyuga:{code:'OPS / SUPPORT',department:'戦術管制 / 作戦補佐',role:'作戦情報の整理とミサトの補佐',authority:'確認・伝達。作戦変更は作戦指揮へ上申',knowledge:['eva','tactical','public'],pronoun:'僕',address:'あなた',tone:'穏やかな敬語。実務的に相手を支える',relations:'ミサトの指揮を補佐。青葉・マヤと情報を照合',temperament:'温厚 / 忠実',
 daily:['休憩に読むものを持ってきたんですが、まだ開けていなくて。','食堂はまだ間に合いそうです。交代の時間を確認してきます。','少し静かになりましたね。連絡の整理を終えたら休憩にしましょう。','当直の合間にページを進めると、前の話を忘れてしまうんですよね。'],care:['ありがとうございます。あなたも無理のないように。','そうですね、少し目を休めます。連絡をもらえて助かりました。','お互い、交代できるうちに休んでおきましょう。'],close:['もちろんです。当直の話ばかりでは息が詰まりますから。','気軽に連絡をもらえると、ほっとします。今日は聞く側になりますよ。','あなたの休みの過ごし方も、少し聞いてみたいです。'],watch:'指示の出所と受領状況を確認しましょう。',battle:'作戦連絡を整理しています。担当の確認結果をお願いします。',critical:'重要連絡を優先します。未確認の伝達は確定報告と区別してください。',limit:'その情報にはアクセスできません。指揮系統へ照会しましょう。'},
 aoba:{code:'CTRL / COMMUNICATION',department:'中央管制 / 通信・情報',role:'通信・センサー情報の監視と伝達',authority:'通信確認・情報整理。発令と技術承認は担当へ',knowledge:['tactical','comms','public'],pronoun:'俺',address:'そちら',tone:'飾らない落ち着いた敬語。短く実務的',relations:'日向・マヤと中央管制を分担',temperament:'冷静 / 現実的',
 daily:['帰ったらギターに触るつもりです。音を出せる時間が残るといいんですが。','静かなうちに休んでおきましょう。連絡の引継ぎは確認しておきます。','今日は弦を替えたいんです。張り替えた直後は、少し音を合わせ直さないと。','仕事の外で手を動かす時間があると、気分を切り替えられますね。'],care:['どうも。そちらも疲れた時は交代を頼んでください。','助かります。引継ぎを確認してから休みます。','無理を続けても確認が雑になるだけですからね。少し休みましょう。'],close:['ええ、少し話しましょう。何を聞きたいですか。','気軽に連絡が来るのはうれしいですね。こっちからも声をかけます。','そちらにも仕事以外で続けていることはありますか。'],watch:'連絡経路を確認中です。情報の出所を添えてください。',battle:'作戦通信を優先します。必要な情報を簡潔に。',critical:'回線と警告を確認します。復旧の判断は担当部署へ。',limit:'その内容は通信担当の把握範囲にありません。担当へ照会してください。'},
 gendo:{code:'CMD / COMMANDER',department:'NERV本部 / 司令',role:'組織と作戦の統括',authority:'司令権限。個人回線の発言で正式発令を代替しない',knowledge:['eva','tactical','magi','public'],pronoun:'私',address:'君',tone:'短く抑制的。曖昧な親密さを示さず要点を求める',relations:'冬月が副司令。シンジとは職務上の距離を保つ',temperament:'寡黙 / 目的を優先',
 daily:['勤務に支障はないか。必要な連絡があれば述べたまえ。','報告の要点を整理しておけ。今はそれでよい。','当直の引継ぎを確実に行いたまえ。'],care:['休養は各自の勤務に応じて取れ。私への配慮は不要だ。','職務に支障が出る前に交代を申請したまえ。','報告は受けた。君も持ち場の管理を怠るな。'],close:['私的な話は短くしたまえ。職務上の相談なら聞こう。','その話をここで続ける必要はない。用件があれば伝えたまえ。','距離を急に縮める必要はない。勤務を通じて判断する。'],watch:'担当系統の確認を続けろ。未確認の発令は認めない。',battle:'作戦回線を優先しろ。担当の報告を上げたまえ。',critical:'担当部署へ状況を集約しろ。承認系統を省略するな。',limit:'君の職務区分では扱わない。必要な情報は担当を通じて伝える。'},
 fuyutsuki:{code:'CMD / VICE COMMANDER',department:'NERV本部 / 副司令',role:'司令補佐と組織運用の監督',authority:'司令補佐。管制補助の手順と権限を尊重',knowledge:['eva','tactical','magi','public'],pronoun:'私',address:'君',tone:'落ち着いた年長者の口調。慎重に問いを返す',relations:'碇司令を補佐。部下の報告と判断過程を重視',temperament:'慎重 / 思慮深い',
 daily:['静かな時間ほど、記録の抜けを確かめられる。君の当直はどうだね。','休息も勤務を続けるための手順だ。軽く見ないことだな。','急ぎの用でなければ、少し話を聞こう。何が気になったのかね。'],care:['気遣いは受け取っておこう。君自身の休息も忘れぬように。','無理が続く前に引継ぎを整えることだ。','そうだな。少し間を置けば、見落としにも気づく。'],close:['話を急いで結論に結びつける必要はない。続けたまえ。','君がどう受け止めたかを聞こう。正解だけを求めてはいない。','前に考えたことも、時間を置けば違って見える。話してみたまえ。'],watch:'確認の手順を省かず進めたまえ。急ぐ時ほど記録が要る。',battle:'各部署の報告を揃える。君は担当の確認を続けたまえ。',critical:'状況と推測を分けて上げたまえ。復旧は承認を待つことだ。',limit:'その区分の情報はここでは扱えない。君の担当に必要な範囲で尋ねたまえ。'}
};
// Narrow offline subjects: supported interests are explicit; other details are not invented.
const dialogInterests={
 shinji:{music:['チェロは、音が合うまで少しずつ調整するのが落ち着きます。あなたは音楽を聴きますか。','弓をゆっくり動かすと、音の揺れが分かるんです。今日はそこを練習していました。'],food:['片付けを済ませてからなら、ゆっくり話せます。あなたは食事、済みましたか。']},
 rei:{books:['本を読んでいたわ。内容を急いで話すより、もう少し考えたい。あなたは何を読むの？','読んだところを、少し戻って確かめていたわ。言葉が残ることがあるから。']},
 asuka:{training:['訓練は、前と同じ記録で終わらせたくないの。ちゃんと違いを見てよね。','結果だけじゃなく、動きも確かめるわ。次に直すところを決めたいのよ。'],food:['昼食くらいちゃんと取りなさいよ。あたし？ 自分の分は考えてるわ。']},
 misato:{rest:['休憩にまで勤務を持ち込まないこと。引継ぎを済ませたら、少し気を抜いていいのよ。','あなたが安心して休めるように、交代の連絡を揃えておきましょ。']},
 ritsuko:{cats:['猫の本を読んでいたの。仕事の資料ばかりでは、頭の切り替えができないでしょう。','猫の話なら、少し付き合うわ。あなたも興味があるの？'],coffee:['コーヒーを淹れたところよ。今度は冷める前に飲みたいわね。','コーヒーを持って席を離れると、少し考えが整理できるわ。']},
 maya:{books:['休憩で読む本を持ってきたんです。あなたも何か読んでいますか。','途中のページに栞を挟んだままで。次の休憩には続きを読めるといいんですが。']},
 hyuga:{books:['読むものを持ってきたんですが、休憩まで開かないようにしています。区切りがつかなくなるので。','休憩のたびに少しずつ読むと、先が気になりますね。そちらはどうですか。']},
 aoba:{music:['ギターは帰ってから触ります。仕事と違う音を聴くと、気持ちを切り替えられるんです。','弦を替えたばかりだと、しばらく音を合わせ直します。少しずつ落ち着いてきますよ。']},
 gendo:{rest:['休養は勤務を続けるために必要だ。各自で適切に取れ。']},
 fuyutsuki:{rest:['少し間を置くと、見落としていたものに気づく。休息を無駄と考えぬことだ。']}
};
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
// TV-era SEELE uses a restricted audit channel; it is not another NERV department.
dialogPersonas.kiel={code:'SEELE / 01',department:'ゼーレ / 監査回線',role:'NERVからの監査報告を受領する',authority:'委員会の照会。個人通信でNERVの発令・承認を代行しない',knowledge:['audit','public'],pronoun:'我々',address:'君',tone:'低く抑制された威厳ある話し方。監査の目的と報告根拠を問い、私事を広げない',relations:'碇・冬月とは組織の報告系統を通じて連絡する。本端末は公開可能な監査資料のみを扱う',temperament:'冷徹 / 組織的な監督',daily:['定例報告に、確認されていない推測を混ぜてはならない。君の担当分を整理したまえ。','報告の受領経路を確認している。差異があれば、根拠を添えて提出したまえ。','我々が求めるのは説明の体裁ではない。記録と判断が整合していることだ。'],care:['勤務を維持するための休養は、各部署で管理したまえ。','君の職務に支障があるなら、指揮系統へ報告することだ。'],close:['この回線は監査用だ。私的な親交を扱う場ではない。','話すべきは担当資料の整合性だ。用件を明確にしたまえ。'],watch:'未確認情報の転送を控え、照合済みの報告を上げたまえ。',battle:'作戦中の通信はNERVの指揮系統を優先したまえ。報告は後に受領する。',critical:'非常時の記録を保全したまえ。根拠のない復旧報告は認めない。',limit:'本回線の情報区分を超える。君に開示する監査事項はない。'};
dialogInterests.kiel={};
// Private, local conversations. No network chat service, authority changes or combat rewards.
const personalContacts=[
 {id:'shinji',name:'碇シンジ',unit:1},{id:'asuka',name:'惣流・アスカ・ラングレー',unit:2},{id:'rei',name:'綾波レイ',unit:0},
 {id:'misato',name:'葛城ミサト',staff:0},{id:'ritsuko',name:'赤木リツコ',staff:1},{id:'maya',name:'伊吹マヤ',staff:2},
 {id:'hyuga',name:'日向マコト',staff:3},{id:'aoba',name:'青葉シゲル',staff:4},
 {id:'gendo',name:'碇ゲンドウ',insignia:'司令'},{id:'fuyutsuki',name:'冬月コウゾウ',insignia:'副司令'},{id:'kiel',name:'キール・ローレンツ',insignia:'01',group:'seele'}
];
let personalReady=false,personalError='',personalContact='shinji',personalPage=0,personalGroup='pilots',personalTimer=0,personalNextRadio=0,personalInitializing=false;
const personalById=id=>personalContacts.find(c=>c.id===id);
function personalNormalize(raw) {
 if(raw&&(Number(raw.schema)>1||Number(raw.automation?.schema)>1||Object.values(raw.threads||{}).some(t=>Number(t?.memory?.schema)>1)))return {future:true};
 const source=raw&&typeof raw==='object'&&!Array.isArray(raw)?JSON.parse(JSON.stringify(raw)):{};
 const result={...source,schema:1,sequence:Math.floor(worldBound(source.sequence,0,1000000000,0)),selected:personalById(source.selected)?source.selected:'shinji',threads:source.threads&&typeof source.threads==='object'&&!Array.isArray(source.threads)?{...source.threads}:{},pending:[],automation:dialogAutomation(source.automation)};
 for(const person of personalContacts) {
  const old=source.threads?.[person.id]||{},seen=new Set();
  const messages=(Array.isArray(old.messages)?old.messages:[]).filter(m=>m&&typeof m.id==='string'&&typeof m.text==='string'&&['self','contact'].includes(m.from)&&!seen.has(m.id)&&seen.add(m.id)).slice(-24).map(m=>({...m,text:m.text.slice(0,320),at:Number.isFinite(m.at)?m.at:Date.now(),read:!!m.read}));
  result.threads[person.id]={...old,messages,memory:dialogMemory(old.memory||{relationship:Math.min(3,Number(old.exchanges)||0),lastAt:messages.at(-1)?.at||0,topic:dialogIntent(messages.filter(m=>m.from==='self').at(-1)?.text||'今日はどう？','free',{topic:'daily',deferred:''}),questions:messages.filter(m=>m.from==='self').slice(-8).map(m=>m.text.replace(/[\s。、？！?!]/g,''))}),exchanges:Math.max(0,Math.min(1000,Number(old.exchanges)||0))};
  for(const m of messages)result.sequence=Math.max(result.sequence,Number(m.id.match(/^pm-(\d+)$/)?.[1])||0);
 }
 const pendingPeople=new Set();
 for(const p of Array.isArray(source.pending)?source.pending:[]) {
  const thread=result.threads[p?.to];
  if(!personalById(p?.to)||!thread||pendingPeople.has(p.to)||typeof p.replyTo!=='string'||typeof p.text!=='string'||thread.messages.some(m=>m.replyTo===p.replyTo))continue;
  if(!thread.messages.some(m=>m.id===p.replyTo&&m.from==='self'))continue;
  pendingPeople.add(p.to);result.pending.push({...p,text:p.text.slice(0,320),...(typeof p.input==='string'?{input:p.input.slice(0,160),topic:['free',...DIALOG_TOPICS].includes(p.topic)?p.topic:'free'}:{}),due:Number.isFinite(p.due)?Math.min(p.due,Date.now()+60000):Date.now()+1500});
 }
 return {value:result,repaired:raw!=null&&JSON.stringify(raw)!==JSON.stringify(result)};
}
function personalThread(id=personalContact){return S.personalMessages?.threads?.[id]||{messages:[],exchanges:0};}
function personalStatus(person) {
 if(!S.infra.comms)return '通信回線停止 / 送信を保留';
 if(person.unit!==undefined&&['DEPLOYED','POWER_LOST'].includes(S.evas[person.unit].state))return '作戦回線優先 / '+stateJP[S.evas[person.unit].state];
 if(terminalAlert().level==='critical')return '非常対応中 / 業務連絡を優先';
 const exchanges=personalThread(person.id).memory?.relationship||0;return exchanges>=4?'信頼する連絡相手':exchanges>=1?'話し慣れた相手':'連絡可能 / 個人回線';
}
function personalReply(person,topic,text,data=S.personalMessages){return dialogRespond(data,person,topic,text).text;}
async function personalSend(text,topic='free') {
 if(!personalReady)return {ok:false,error:personalError||'通信記録を引継ぎ中です'};
 const person=personalById(personalContact),clean=String(text).trim().slice(0,160);if(!['free','daily','care','close','duty'].includes(topic))topic='free';
 if(!clean)return {ok:false,error:'本文を入力してください'};
 const result=await commandOperation(()=>{
  if(!S.infra.comms)throw Error('通信回線を復旧してください');
  const data=S.personalMessages;if(data.pending.some(p=>p.to===person.id))throw Error('この相手からの返答を待っています');
  const id='pm-'+(++data.sequence),thread=data.threads[person.id];
  thread.messages.push({id,at:Date.now(),from:'self',text:clean,read:true});thread.messages=thread.messages.slice(-24);
  data.pending.push({to:person.id,replyTo:id,text:'',input:clean,topic,due:Date.now()+1800});
 });
 if(result.ok){personalPage=0;renderPersonalMessages();schedulePersonalPulse();}return result;
}
// Preserve a message draft and keyboard focus while accepting an incoming reply.
// Merge only this extension's fields after the confirmed write, like existing personnel services.
async function personalIncoming(change) {
 if(currentPage!=='messages'||document.activeElement?.id!=='messageText')return commandOperation(()=>change(S.personalMessages));
 if(staffServiceBusy||commandOperationsBusy||recoveryBusy||sequenceBusy)return {ok:false};
 staffServiceBusy=true;
 try {
  if(!await backupVisualUpgrade())throw Error('受信前の控えを保存できません');
  const next=worldClone(S);change(next.personalMessages);
  const saved=await callNative('persist',{state:next});if(saved?.error)throw Error(saved.error);
  S.personalMessages=next.personalMessages;persist();renderPersonalMessages();return {ok:true};
 }catch(error){toast('通信受信を保留：'+error.message);return {ok:false,error:error.message};}
 finally{staffServiceBusy=false;}
}
async function personalReceive(id,automatic=false) {
 const person=personalById(id);if(!person||!personalReady||document.hidden)return {ok:false};
 if(automatic&&document.activeElement?.matches('input,textarea,[contenteditable="true"]'))return {ok:false};
 if(automatic&&(!staffCommsEnabled()||S.prefs.pilotRadio===false||terminalAlert().level!=='nominal'))return {ok:false};
 return personalIncoming(data=>{
  if(!S.infra.comms)throw Error('通信回線を復旧してください');
  const thread=data.threads[id];
  const reply=dialogRespond(data,person,'daily','今日はどうだった？');
  thread.messages.push({id:'pm-'+(++data.sequence),at:Date.now(),from:'contact',...reply,read:currentPage==='messages'&&mobileCurrent.messages==='thread'&&personalContact===id});thread.messages=thread.messages.slice(-24);
 });
}
async function personalPulse() {
 if(!personalReady||document.hidden)return;
 if(window.NERV_AI)await window.NERV_AI.prepare();
 const due=S.personalMessages.pending.filter(p=>p.due<=Date.now()&&!window.NERV_AI?.holds(p));
 if(due.length&&S.infra.comms) {
  await personalIncoming(data=>{
   for(const p of due){const thread=data.threads[p.to];if(!thread.messages.some(m=>m.replyTo===p.replyTo)){
    let reply=typeof p.input==='string'?dialogRespond(data,personalById(p.to),p.topic,p.input):dialogWorld().mode!=='normal'?dialogRespond(data,personalById(p.to),'duty','担当業務の状況'): {text:p.text,priority:'routine',topic:'daily',mode:'normal'};
    if(window.NERV_AI)reply=window.NERV_AI.take(p,reply);
    thread.messages.push({id:'pm-'+(++data.sequence),replyTo:p.replyTo,at:Date.now(),from:'contact',...reply,read:currentPage==='messages'&&mobileCurrent.messages==='thread'&&personalContact===p.to});thread.messages=thread.messages.slice(-24);thread.exchanges=Math.min(1000,thread.exchanges+1);
   }}
   const ids=new Set(due.map(p=>p.replyTo));data.pending=data.pending.filter(p=>!ids.has(p.replyTo));
  });
 }
 const routineDue=Date.now()>=personalNextRadio;
 if(routineDue)personalNextRadio=Date.now()+90000+Math.random()*90000;
 await dialogProactive(routineDue);
 window.NERV_AI?.prune();
}
function schedulePersonalPulse() {
 clearTimeout(personalTimer);personalTimer=0;if(!personalReady||document.hidden)return;
 personalTimer=setTimeout(async()=>{personalTimer=0;await personalPulse();schedulePersonalPulse();},S.personalMessages.pending.length?1000:5000);
}
function personalFace(person) {
 const face=document.createElement('span');face.className='message-avatar '+(person.unit!==undefined?'pilot-portrait':'command-staff-face');
 if(person.unit!==undefined)face.dataset.portraitUnit=String(person.unit);else if(person.staff!==undefined)face.dataset.staff=String(person.staff);else {face.className='message-avatar command-insignia';face.textContent=person.insignia;}
 face.setAttribute('role','img');face.setAttribute('aria-label',person.name+(person.insignia?'の職務識別章':'の顔'));return face;
}
function openPersonal(id) {
 if(!personalById(id)||!personalReady)return;personalContact=id;personalPage=0;
 window.NERV_MOBILE.open('messages','thread');
 commandOperation(()=>{S.personalMessages.selected=id;for(const m of personalThread(id).messages)m.read=true;});
}
function renderPersonalMessages() {
 if(!qs('#staffSupport')||!$('messageContacts'))return;meteoText('messageRecovery',personalError||(!personalReady?'通信記録を確認しています。':''));$('messageRetry').hidden=!personalError;
 if(!personalReady)return;
 const unread=personalContacts.reduce((n,p)=>n+personalThread(p.id).messages.filter(m=>m.from==='contact'&&!m.read).length,0);
 meteoText('messageUnread',unread+' 未読');meteoText('launcherMessages','11人の個別トーク / '+unread+' 未読');
 $('messageAutoToggle').setAttribute('aria-pressed',String(S.prefs.pilotRadio!==false));$('messageAutoToggle').textContent='パイロットの自動通信：'+(S.prefs.pilotRadio===false?'OFF':'ON');
 const list=$('messageContacts');list.replaceChildren();
 for(const person of personalContacts.filter(p=>p.group==='seele'?personalGroup==='seele':personalGroup==='pilots'?p.unit!==undefined:personalGroup==='staff'&&p.unit===undefined)) {
  const button=document.createElement('button');button.className='message-contact';button.dataset.messageContact=person.id;
  const body=document.createElement('span'),name=document.createElement('strong'),preview=document.createElement('small'),count=document.createElement('b'),thread=personalThread(person.id);
  name.textContent=person.name;preview.textContent=thread.messages.at(-1)?.text||personalStatus(person);count.textContent=String(thread.messages.filter(m=>m.from==='contact'&&!m.read).length||'');body.append(name,preview);button.append(personalFace(person),body,count);button.addEventListener('click',()=>openPersonal(person.id));list.append(button);
 }
 const person=personalById(personalContact);$('messagePersonFace').replaceChildren(personalFace(person));meteoText('messagePersonName',person.name);meteoText('messagePersonStatus',personalStatus(person));
 const thread=personalThread(),pages=Math.max(1,Math.ceil(thread.messages.length/4));personalPage=Math.max(0,Math.min(personalPage,pages-1));
 const end=thread.messages.length-personalPage*4,display=thread.messages.slice(Math.max(0,end-4),end),signature=JSON.stringify(display);
 if($('messageThread').dataset.signature!==signature){const box=$('messageThread');box.replaceChildren();for(const m of display){const row=document.createElement('article'),text=document.createElement('p'),stamp=document.createElement('small');row.dataset.from=m.from;text.textContent=m.text;stamp.textContent=(m.from==='self'?'送信済み':'受信')+' '+new Date(m.at).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})+(m.transport==='ai'?' / AI':m.transport==='offline-fallback'?' / LOCAL':'');row.append(text,stamp);box.append(row);}if(!display.length)box.textContent='個人回線に接続しました。下の話題から、または文章を入力して話しかけられます。';box.dataset.signature=signature;box.scrollTop=box.scrollHeight;}
 const pending=S.personalMessages.pending.some(p=>p.to===personalContact);meteoText('messageTyping',pending?'返答を待っています…':!S.infra.comms?'通信回線停止 / 復旧後に送信できます':'');
 meteoText('messagePage',(personalPage+1)+' / '+pages);$('messageOlder').disabled=personalPage>=pages-1;$('messageNewer').disabled=!personalPage;
 all('#messageComposer button,[data-message-topic]').forEach(b=>b.disabled=pending||!S.infra.comms);
}
async function initializePersonalMessages() {
 if(personalReady||personalInitializing)return;personalInitializing=true;
 try {
  if(!window.NERV_WORLD?.snapshot().ready)return;
  const normalized=personalNormalize(S.personalMessages);if(normalized.future)throw Error('新しい版の通信記録です。現在の記録を保持して通信を停止しました。');
  if(!S.personalMessages||normalized.repaired){const backup=await callNative('backupWorld',{state:worldClone(S),extension:'v212-messages',quarantine:normalized.repaired});if(backup?.error)throw Error('通信記録の控えを保存できません：'+backup.error);const result=await commandOperation(()=>{S.personalMessages=normalized.value;});if(!result.ok)throw Error(result.error);}
  personalReady=true;personalContact=personalById(location.hash.split('/')[2])?.id||S.personalMessages.selected;personalNextRadio=Date.now()+90000+Math.random()*90000;renderPersonalMessages();schedulePersonalPulse();
 }catch(error){personalError=error.message;renderPersonalMessages();}finally{personalInitializing=false;}
}
function initPersonalMessages() {
 if(!qs('#staffSupport')||!$('messageContacts'))return;
 mobileGroup('messages',[['contacts','連絡先'],['thread','トーク'],['persona','職員情報'],['memory','通信記憶'],['preferences','通信設定']].map(([id,label])=>({id,label,existing:true})),'contacts');
 const group=document.createElement('nav');group.className='message-contact-groups';group.innerHTML='<button data-personal-group="pilots" aria-pressed="true">パイロット / 3</button><button data-personal-group="staff" aria-pressed="false">司令部 / 7</button><button data-personal-group="seele" aria-pressed="false">ゼーレ / 1</button>';$('messageContacts').before(group);
 for(const b of all('[data-personal-group]'))b.addEventListener('click',()=>{personalGroup=b.dataset.personalGroup;all('[data-personal-group]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderPersonalMessages();});
 const priorNavigate=mobileNavigate;mobileNavigate=function(page,view,push=true){if(page==='messages'&&view==='thread'){priorNavigate(page,view,false);const route='#messages/thread/'+personalContact;if(push&&location.hash!==route)history.pushState({},'',route);}else priorNavigate(page,view,push);};
 const restore=()=>{const [page,view,id]=location.hash.slice(1).split('/');if(page!=='messages')return;if(personalById(id))personalContact=id;window.NERV_MOBILE.open(page,view);renderPersonalMessages();};window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
 $('messageComposer').addEventListener('submit',async e=>{e.preventDefault();if((await personalSend($('messageText').value)).ok)$('messageText').value='';});
 const prompts={daily:'今日はどんな一日だった？',care:'無理していない？ 少し休んでね。',close:'もう少し、二人で話してもいい？',duty:'担当の仕事について、相談してもいい？'};
 all('[data-message-topic]').forEach(b=>b.addEventListener('click',()=>personalSend(prompts[b.dataset.messageTopic],b.dataset.messageTopic)));
 $('messageOlder').addEventListener('click',()=>{personalPage++;renderPersonalMessages();});$('messageNewer').addEventListener('click',()=>{personalPage--;renderPersonalMessages();});
 $('pilotRadioRequest').addEventListener('click',async()=>{const p=personalContacts[Math.floor(Math.random()*3)];const result=await personalReceive(p.id);if(result.ok){toast(p.name+'から通信を受信しました');sound('scan');}});
 $('messageAutoToggle').addEventListener('click',()=>commandOperation(()=>{S.prefs.pilotRadio=S.prefs.pilotRadio===false;}));
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(personalTimer);personalTimer=0;}else{personalNextRadio=Date.now()+90000+Math.random()*90000;schedulePersonalPulse();}});
 const oldDraw=draw;draw=function(){oldDraw();renderPersonalMessages();};
 window.addEventListener('nerv-world-ready',initializePersonalMessages);
 window.NERV_MESSAGES={send:personalSend,receive:personalReceive,pulse:personalPulse,open:openPersonal,context:dialogAIContext,validateSuggestion:dialogValidateSuggestion,proactive:dialogProactive,snapshot:()=>({ready:personalReady,error:personalError,contact:personalContact,timer:!!personalTimer,state:worldClone(S.personalMessages||null)}),retry:()=>{personalError='';return initializePersonalMessages();}};
 const retry=document.createElement('button');retry.id='messageRetry';retry.className='staff-secondary';retry.textContent='通信記録の引継ぎを再試行';retry.hidden=true;retry.addEventListener('click',()=>{personalError='';initializePersonalMessages();});$('messageRecovery').after(retry);
 const link=document.createElement('button');link.className='staff-secondary';link.dataset.opsRoute='messages/contacts';link.textContent='個別メッセージ・パイロットとの会話 ↗';qs('.page[data-page="hq"] [data-view="comms"]').append(link);
 restore();initializePersonalMessages();
}
initPersonalMessages();
// One bounded scheduler owns new Canvas motion; UI values always come from S.
// Static/reduced-motion rendering remains informative and never delays a command.
function initImmersiveTerminal() {
 if(!qs('#staffSupport'))return;
 const surfaces=[],frameHooks=[],media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 let visibleSignature='',frame=0,lastFrame=0,frames=0,lastCost=0,averageCost=0,slowFrames=0,adaptiveRate=60,paintCount=0,hit=null,hitTimer=0;
 const stats={active:0,frames:0,paintCount:0,averageCost:0,rate:0};
 const quality=()=>['auto','high','low'].includes(S.prefs.fxQuality)?S.prefs.fxQuality:'auto';
 const moving=()=>!document.hidden&&isMoving();
 const rate=()=>quality()==='low'?20:quality()==='high'?60:adaptiveRate;
 function addSurface(canvas,paint,visible) {
  let context=null;try{context=canvas.getContext('2d',{alpha:true});}catch(error){}
  if(!context){canvas.dataset.renderer='static';return;}
  canvas.dataset.renderer='canvas';surfaces.push({canvas,context,paint,visible,visibleOnScreen:false});
 }
 function drawSurface(surface,time) {
  const {canvas,context}=surface,rect=canvas.getBoundingClientRect(),scale=quality()==='low'?1:Math.min(1.5,window.devicePixelRatio||1);
  if(rect.width<1||rect.height<1)return;
  const width=Math.max(1,Math.round(rect.width*scale)),height=Math.max(1,Math.round(rect.height*scale));
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  context.setTransform(scale,0,0,scale,0,0);context.clearRect(0,0,rect.width,rect.height);
  surface.paint(context,rect.width,rect.height,time);paintCount++;
 }
 function paint(time,force=false) {
  const active=surfaces.filter(s=>s.visible()&&s.canvas.getBoundingClientRect().bottom>0&&s.canvas.getBoundingClientRect().top<innerHeight);
  const hooks=frameHooks.filter(h=>h.visible());stats.active=active.length+hooks.length;visibleSignature=active.map(s=>s.canvas.id).join('|');
  for(const surface of surfaces){const enabled=active.includes(surface);surface.canvas.dataset.running=String(enabled&&moving());}
  if(!force&&time-lastFrame<1000/rate()-1)return;
  const start=performance.now();for(const s of active)drawSurface(s,moving()?time/1000:0);for(const h of hooks)h.tick(time);
  lastCost=performance.now()-start;averageCost=averageCost?averageCost*.9+lastCost*.1:lastCost;
  if(quality()==='auto'&&averageCost>8){if(++slowFrames>=20)adaptiveRate=30;}else slowFrames=Math.max(0,slowFrames-1);
  lastFrame=time;frames++;Object.assign(stats,{frames,paintCount,averageCost:Math.round(averageCost*100)/100,rate:moving()?rate():0});
 }
 function loop(time) {frame=0;if(document.hidden||!moving())return;paint(time);if(stats.active)frame=requestAnimationFrame(loop);}
 function refresh() {
  if(frame)cancelAnimationFrame(frame);frame=0;
  document.body.classList.toggle('fx-suspended',document.hidden);document.body.classList.toggle('fx-motion',moving());document.body.dataset.fxQuality=quality();
  if(document.hidden){stats.active=0;stats.rate=0;for(const s of surfaces)s.canvas.dataset.running='false';return;}
  paint(performance.now(),true);if(moving()&&stats.active)frame=requestAnimationFrame(loop);
 }
 function grid(ctx,w,h) {
  ctx.lineWidth=.6;ctx.strokeStyle='#31594c';ctx.beginPath();
  for(let x=0;x<w;x+=24){ctx.moveTo(x,0);ctx.lineTo(x,h);}for(let y=0;y<h;y+=24){ctx.moveTo(0,y);ctx.lineTo(w,y);}ctx.stroke();
 }
 function text(ctx,value,x,y,color='#b5c9a0',size=9) {ctx.fillStyle=color;ctx.font=size+'px monospace';ctx.fillText(value,x,y);}
 function neural(ctx,w,h,time) {
  if(window.NERV_VISUALS?.neural)return window.NERV_VISUALS.neural(ctx,w,h,time);
  grid(ctx,w,h);const e=selected(),connected=['READY','DEPLOYED'].includes(e.state),alert=e.state==='POWER_LOST';
  const colors=['#86cdd8','#b1a8eb','#ee9671'],color=alert?'#ed765b':colors[S.selectedEva];
  for(let line=0;line<3;line++) {
   const center=(line+1)*h/4,amplitude=connected?Math.max(3,e.sync/7):2;
   ctx.strokeStyle=line===1?color:'#739b86';ctx.lineWidth=line===1?1.6:.8;ctx.beginPath();
   for(let x=0;x<=w;x+=3){const y=center+Math.sin(x*.075-time*(line+1)*1.3)*Math.sin(x*.027+line)*amplitude;(x?ctx.lineTo(x,y):ctx.moveTo(x,y));}ctx.stroke();
  }
  text(ctx,'UNIT-0'+S.selectedEva+' / '+stateJP[e.state],8,14,color);text(ctx,'SYNC '+Number(e.sync).toFixed(1)+'% / '+(connected?'NEURAL LINK':'RESERVE'),8,h-9);
  const supply=Math.max(0,Math.min(1,e.power/300));ctx.fillStyle=evaExternalPower(S.selectedEva)?'#7dd9ba':'#cd9f60';ctx.fillRect(w-12,h*(1-supply),4,h*supply);
 }
 function compute(ctx,w,h,time) {
  grid(ctx,w,h);const x=externalMagiState(),v=S.magi.vote?.votes,active=externalMagiActive()||sequenceBusy;
  for(let i=0;i<3;i++) {
   const top=20+i*(h-26)/3,pressure=x.pressure[i],color=pressure>=90?'#ed7258':x.status==='protected'||x.status==='contained'?'#91d2b4':'#d6a561';
   ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();
   for(let px=0;px<w;px+=4){const py=top+16+(active?Math.sin(px*.06+time*(i+1))*Math.min(11,3+pressure*.1):0);px?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
   text(ctx,externalCoreNames[i]+' / '+(externalMagiActive()?pressure+'% PRESSURE':v?'DECISION REGISTERED':'STANDBY'),8,top,color);
  }
 }
 function radar(ctx,w,h,time) {
  const d=S.defense,active=d.status==='active',cx=w/2,cy=h*.54,radius=Math.min(w,h)*.47;
  ctx.save();ctx.translate(cx,cy);ctx.scale(1,.64);ctx.strokeStyle='#75ab9270';ctx.lineWidth=.7;
  for(let i=1;i<=4;i++){ctx.beginPath();ctx.arc(0,0,radius*i/4,0,Math.PI*2);ctx.stroke();}
  if(active){const angle=time*.4-.8;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(angle)*radius,Math.sin(angle)*radius);ctx.strokeStyle='#b1e2a69c';ctx.stroke();}
  ctx.restore();
  text(ctx,'TOKYO-3 / '+(active?'TRACK '+d.enemy.code:'PASSIVE WATCH'),8,14,active?'#ebbb73':'#99beaa');
  text(ctx,active?'RANGE '+d.enemy.dist+' TURNS / SCAN '+d.scans+'%':'NO HOSTILE RETURN',8,h-9);
  if(active){const coordinates=$('v27Enemy').getAttribute('transform')?.match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/);if(coordinates){const x=Number(coordinates[1])*w/680,y=Number(coordinates[2])*h/445;ctx.strokeStyle=d.scans>=68?'#edba77':'#a4c899';ctx.lineWidth=1;ctx.beginPath();for(const [sx,sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ctx.moveTo(x+sx*18,y+sy*10);ctx.lineTo(x+sx*18,y+sy*18);ctx.lineTo(x+sx*10,y+sy*18);}ctx.stroke();text(ctx,'X '+coordinates[1]+' / Y '+coordinates[2]+' / ALT —',8,27,'#c8b480',7);}}

  const forecast=defenseForecast();if(forecast.sector!==null&&forecast.loss>0){const pos=[[.26,.43],[.5,.25],[.75,.43],[.5,.72]][forecast.sector];ctx.strokeStyle='#ee8065';ctx.lineWidth=1.8;ctx.beginPath();ctx.ellipse(w*pos[0],h*pos[1],w*.12,h*.065,0,0,Math.PI*2);ctx.stroke();text(ctx,'IMPACT '+forecast.loss,w*pos[0]-24,h*pos[1]-14,'#ef9976');}
 }
 function impact(ctx,w,h,time) {
  if(!hit)return;const age=moving()?Math.max(0,(performance.now()-hit.at)/1000):.3,center=w*.68,cy=h*.45;
  const color=hit.weapon==='positron'?'#b5ecf5':hit.weapon==='knife'?'#e7d28f':'#eda36a';ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=hit.weapon==='positron'?5:2;
  ctx.beginPath();ctx.moveTo(w*.12,hit.weapon==='knife'?h*.85:cy);ctx.lineTo(center,cy);ctx.stroke();
  for(let i=0;i<3;i++){ctx.globalAlpha=Math.max(.12,1-age*.6-i*.13);ctx.lineWidth=1;ctx.beginPath();ctx.arc(center,cy,8+i*10+age*15,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;
  text(ctx,'CONFIRMED HIT / '+hit.damage+' DAMAGE',8,h-12,color,10);
 }
 function mountPanel(page,id,label,markup) {
  const panel=document.createElement('section');panel.className='mobile-view';panel.dataset.view=id;panel.innerHTML=markup;qs('.page[data-page="'+page+'"]').append(panel);registerTerminalView(page,id,label);return panel;
 }
 const neuralPanel=mountPanel('eva','neural','神経・部位監視','<div class="staff-panel fx-instrument"><div class="staff-panel-title"><h2>神経接続・部位監視</h2><b id="neuralUnit"></b></div><canvas id="neuralLive" class="fx-canvas" aria-label="実際の模擬同期率と給電に連動した神経接続波形"></canvas><div class="fx-meter-pair"><div><small>SYNC / SIM</small><strong id="neuralSync"></strong></div><div><small>POWER / SUPPLY</small><strong id="neuralPower"></strong></div></div><h3>部位別損傷報告</h3><div id="neuralDamage" class="fx-damage-grid"></div><p id="neuralDamageNote" class="staff-note"></p><button class="staff-secondary" data-ops-route="eva/control">発進・回収管制 ↗</button></div>');
 const damagePanel=mountPanel('eva','damage','部位報告','<div class="staff-panel"><div class="staff-panel-title"><h2>部位別損傷報告</h2><b>RECEIVED DATA</b></div></div>');
 neuralPanel.querySelector('h3').remove();damagePanel.querySelector('.staff-panel').append($('neuralDamage'),$('neuralDamageNote'),neuralPanel.querySelector('[data-ops-route]'));
 addSurface($('neuralLive'),neural,()=>currentPage==='eva'&&mobileCurrent.eva==='neural'&&S.prefs.fxWaveField!==false);
 const computation=mountPanel('magi','compute','演算監視','<div class="staff-panel fx-instrument"><div class="staff-panel-title"><h2>MAGI / 演算系統</h2><b id="computeStatus"></b></div><div id="computeDiagram">'+nervMagiDiagram('CORE NETWORK')+'</div><canvas id="computeLive" class="fx-canvas fx-compute" aria-label="MAGI三基の稼働・侵入圧に連動した演算表示"></canvas><p id="computeReadout" class="staff-guide"></p><div class="ops-route-grid"><button data-ops-route="magi/consensus">三基合議 ↗</button><button data-ops-route="magi/firewall">666防御指示 ↗</button></div></div>');
 const streams=mountPanel('magi','streams','演算波形','<div class="staff-panel"><div class="staff-panel-title"><h2>三基の演算・侵入圧</h2><b>LIVE / SIM</b></div></div>');
 streams.querySelector('.staff-panel').append($('computeLive'),$('computeReadout'),computation.querySelector('.ops-route-grid'));
 const inspect=document.createElement('button');inspect.className='staff-secondary';inspect.dataset.opsRoute='magi/streams';inspect.textContent='演算波形・資源を確認 ↗';computation.querySelector('.staff-panel').append(inspect);
 addSurface($('computeLive'),compute,()=>currentPage==='magi'&&mobileCurrent.magi==='streams');
 qs('#computeDiagram svg').setAttribute('role','group');
 for(const core of $('computeDiagram').querySelectorAll('[data-fx-core]')){const index=Number(core.dataset.fxCore);core.setAttribute('role','button');core.setAttribute('tabindex','0');core.setAttribute('aria-label',externalCoreNames[index]+'を選択');const select=()=>externalMagiAction('select',index);core.addEventListener('click',select);core.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();select();}});}
 const compact=document.createElement('div');compact.className='fx-magi-compact';compact.innerHTML=nervMagiDiagram('666');$('external666').append(compact);
 compact.setAttribute('role','button');compact.tabIndex=0;compact.setAttribute('aria-label','MAGI三基の防御状態を拡大');compact.addEventListener('click',()=>window.NERV_MOBILE.open('magi','compute'));compact.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();window.NERV_MOBILE.open('magi','compute');}});
 const map=$('v27IsoMap'),stack=document.createElement('div');stack.className='fx-map-stack';map.before(stack);stack.append(map);
 const mapCanvas=document.createElement('canvas');mapCanvas.id='tacticalSweep';mapCanvas.className='fx-map-canvas';mapCanvas.setAttribute('aria-hidden','true');stack.append(mapCanvas);addSurface(mapCanvas,radar,()=>currentPage==='infra'&&mobileCurrent.infra==='map');
 const impactCanvas=document.createElement('canvas');impactCanvas.id='weaponImpactCanvas';impactCanvas.className='fx-impact-canvas';impactCanvas.setAttribute('aria-hidden','true');const viewport=document.createElement('div');viewport.className='fx-weapon-viewport';$('armamentControlPlate').before(viewport);viewport.append($('armamentControlPlate'),impactCanvas);viewport.parentElement.classList.add('fx-armament-stage');
 addSurface(impactCanvas,impact,()=>currentPage==='mission'&&mobileCurrent.mission==='weapon-control'&&!!hit);
 const notice=document.createElement('div');notice.id='fxHitNotice';notice.className='fx-hit-notice hidden';notice.setAttribute('role','status');qs('#shell').append(notice);
 const effectPanel=mountPanel('settings','effects','映像品質','<div class="staff-panel"><h2>映像品質 / RENDER CONTROL</h2><label class="staff-label" for="fxQuality">描画品質</label><select id="fxQuality"><option value="auto">自動 / 60fps目標・負荷時30fps</option><option value="high">高精細 / 60fps目標</option><option value="low">省電力 / 20fps目標</option></select><p class="staff-note">画面アニメーションOFF・低モーション設定時は静止。非表示の描画を停止します。</p><dl class="fx-performance"><div><dt>描画モード</dt><dd id="fxMode"></dd></div><div><dt>表示中の計器</dt><dd id="fxActive"></dd></div><div><dt>平均描画時間 / この端末</dt><dd id="fxCost"></dd></div></dl><p class="staff-note">値はこの端末の描画処理時間です。実機のフレームレートや電池消費を保証する値ではありません。</p></div>');
 $('fxQuality').value=quality();$('fxQuality').addEventListener('change',async()=>{const selectedQuality=$('fxQuality').value;await commandOperation(()=>{S.prefs.fxQuality=selectedQuality;});$('fxQuality').value=quality();refresh();window.dispatchEvent(new CustomEvent('nerv-fx-quality'));});
 const sequence=qs('.seq-emblem');sequence.insertAdjacentHTML('beforeend',nervLaunchPlate());
 const sequencePhases={prepare:['CAGE UPLINK','PILOT SIGNAL / ENTRY PLUG','LCL / RESTRAINT CHECK','CONTROL LINK / READY'],launch:['MAGI / VERIFIED','UMBILICAL / SUPPLY ROUTE','RESTRAINT RELEASE','CATAPULT / SURFACE'],recovery:['REMOTE CONTROL','RECOVERY ROUTE','RESTRAINT / A.T. STOP','CAGE DOCKED / MAINTENANCE']};
 const oldSequence=playSequence;playSequence=function(kind,title,unit,steps,done,detail){
  const currentUnit=S.selectedEva;sequence.querySelector('.launch-unit').dataset.unit=String(currentUnit);sequence.querySelector('.entry-plug-number').textContent='0'+currentUnit;
  const result=oldSequence(kind,title,unit,steps,done,detail);sequence.dataset.sequence=kind;syncSequence();return result;
 };
 function syncSequence(){const overlay=$('sequenceOverlay');if(!overlay)return;const raw=$('seqCounter').textContent,stage=Math.max(0,Math.min(3,parseInt(raw,10)-1||0));sequence.dataset.stage=String(stage);const label=sequence.querySelector('.launch-cage-label');label.textContent=(sequencePhases[sequence.dataset.sequence]||sequencePhases.prepare)[stage];}
 const sequenceObserver=new MutationObserver(syncSequence);sequenceObserver.observe($('seqStep'),{childList:true,subtree:true,characterData:true});
 const boot=qs('.boot-lattice');if(boot)boot.innerHTML='<svg viewBox="0 0 320 110" aria-hidden="true"><g fill="none" stroke="currentColor"><path d="m110 5 100 0 49 50-49 50H110L61 55z"/><path d="m126 23 68 0 33 32-33 32h-68L93 55z"/><path d="m140 39 40 0 17 16-17 16h-40l-17-16z"/></g><path d="M0 55h61m198 0h61" stroke="#89d7d2"/></svg>';
 function renderState() {
  const alert=terminalAlert(),battle=S.defense.status==='active';document.body.dataset.fxMode=alert.level==='critical'?'emergency':battle?'battle':alert.level==='watch'?'watch':'normal';
  const e=selected();neuralPanel.dataset.unit=String(S.selectedEva);meteoText('neuralUnit','UNIT-0'+S.selectedEva);meteoText('neuralSync',Number(e.sync).toFixed(1)+'%');meteoText('neuralPower',evaExternalPower(S.selectedEva)?'EXTERNAL':Math.ceil(e.power)+' SEC');
  const damage=$('neuralDamage');damage.replaceChildren();let measured=false;
  for(const [key,label] of [['head','頭部'],['torso','胴体'],['leftArm','左腕'],['rightArm','右腕'],['leftLeg','左脚'],['rightLeg','右脚']]){const value=e.damage?.[key],known=Number.isFinite(value);measured=measured||known;const row=document.createElement('div'),name=document.createElement('span'),reading=document.createElement('b');name.textContent=label;reading.textContent=known?Math.max(0,Math.min(100,value))+'%':'未計測';row.dataset.damaged=String(known&&value>0);row.append(name,reading);damage.append(row);}
  meteoText('neuralDamageNote',measured?(e.damageSource||'受信した部位別損傷報告を表示しています。'):e.state==='MAINTENANCE'?'整備中 / 部位別損傷報告は未受信です。':'部位別損傷報告は未受信です。機体信号と電源系統を継続監視。');
  const x=externalMagiState();
  for(const root of [$('computeDiagram'),compact])for(const core of root.querySelectorAll('[data-fx-core]')){const i=Number(core.dataset.fxCore),state=x.pressure[i]>=90?'danger':['protected','contained'].includes(x.status)?'protected':externalMagiActive()?'active':'idle';core.dataset.status=state;core.dataset.selected=String(x.selected===i);core.querySelector('.magi-core-readout').textContent=externalMagiActive()||x.status==='contained'?x.pressure[i]+'%':S.magi.vote?'判定済み':'稼働';}
  meteoText('computeStatus',x.status==='protected'?'666 PROTECTED':worldMagiLimited()?'COOLING HOLD':externalMagiActive()?'EXTERNAL ATTACK':'CORE ONLINE');
  meteoText('computeReadout','解析 '+x.analysis+'% / 演算資源 '+x.budget+' / '+(externalMagiActive()||x.status==='contained'?x.message:worldMagiLimited()?'冷却系統点検中。通常審議を保留。':'三基の通常審議を監視しています。'));
  meteoText('fxMode',moving()?quality().toUpperCase()+' / '+rate()+'fps目標':'STATIC');meteoText('fxActive',String(stats.active));meteoText('fxCost',stats.averageCost+' ms');
  refresh();
 }
 window.addEventListener('nerv-confirmed-hit',event=>{
  hit={...event.detail,at:performance.now()};notice.textContent='UNIT-0'+hit.unit+' / 命中 '+hit.damage+' / 目標残 '+hit.remaining;notice.classList.remove('hidden');notice.dataset.weapon=hit.weapon;
  clearTimeout(hitTimer);hitTimer=setTimeout(()=>{hit=null;notice.classList.add('hidden');refresh();},moving()?1500:2200);refresh();
 });
 window.addEventListener('nerv-route',()=>{$('operationVisual')?.classList.add('hidden');renderState();});window.addEventListener('nerv-equipment-selected',refresh);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){hit=null;clearTimeout(hitTimer);notice.classList.add('hidden');}refresh();});
 window.addEventListener('resize',refresh);window.addEventListener('scroll',()=>{if(document.hidden)return;const visible=surfaces.filter(s=>s.visible()&&s.canvas.getBoundingClientRect().bottom>0&&s.canvas.getBoundingClientRect().top<innerHeight).map(s=>s.canvas.id).join('|');if(visible!==visibleSignature)refresh();},{passive:true});media?.addEventListener?.('change',refresh);
 $('motionSwitch').addEventListener('click',()=>{refresh();window.dispatchEvent(new CustomEvent('nerv-fx-quality'));});
 const oldDraw=draw;draw=function(){oldDraw();renderState();};const oldSettings=renderSettings;renderSettings=function(){oldSettings();refresh();};
 const oldEva=renderEVA;renderEVA=function(){oldEva();if(currentPage==='eva'&&mobileCurrent.eva==='neural')renderState();};
 window.NERV_FX={refresh,registerHook:(tick,visible)=>{if(frameHooks.length>=4)return false;frameHooks.push({tick,visible});refresh();return true;},register:(canvas,paint,visible)=>{if(!canvas||surfaces.length>=12||surfaces.some(s=>s.canvas===canvas))return false;addSurface(canvas,paint,visible);refresh();return true;},frameBudget:()=>1000/rate(),snapshot:()=>({...stats,quality:quality(),moving:moving(),scheduled:!!frame,mode:document.body.dataset.fxMode}),resetAuto:()=>{adaptiveRate=60;slowFrames=0;refresh();}};
 const restore=()=>{const [page,view]=location.hash.slice(1).split('/');if([['eva','neural'],['eva','damage'],['magi','compute'],['magi','streams'],['settings','effects']].some(([p,v])=>p===page&&v===view))window.NERV_MOBILE.open(page,view);};window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
 document.body.classList.add('fx-ready');renderState();restore();
}
initImmersiveTerminal();
// Small separate views keep history, persona details and controls off the iPhone composer.
const dialogTopicLabels={daily:'日常',care:'気遣い',close:'個人的な会話',duty:'担当業務',eva:'EVA運用',magi:'MAGI解析',incident:'異常対応',report:'状況報告',request:'依頼・確認',result:'作戦結果',restricted:'情報区分の確認',clarify:'話題の確認',recall:'前の会話',end:'通信終了'};
let dialogMemoryPage=0;
function renderDialogDetails() {
 if(!personalReady||!$('messagePriority')||currentPage!=='messages')return;
 const person=personalById(personalContact),p=dialogPersonas[person.id],thread=personalThread(),m=thread.memory,w=dialogWorld(),pending=S.personalMessages.pending.some(x=>x.to===person.id),latest=[...thread.messages].reverse().find(x=>x.from==='contact');
 const priority=w.mode==='critical'?'emergency':w.mode!=='normal'?'urgent':'routine';
 const panel=qs('.message-thread-panel');panel.dataset.priority=priority;panel.classList.toggle('message-receiving',pending);
 meteoText('messagePriority',{emergency:'非常 / EMERGENCY',urgent:'業務優先 / PRIORITY',routine:'通常 / ROUTINE'}[priority]);
 meteoText('messageLinkState',!S.infra.comms?'回線停止':pending?'送信済 / 相手が状況を確認中':'回線接続 / '+p.code);
 meteoText('messageTyping',pending?'受信待機 / 接続・情報照合中…':!S.infra.comms?'通信回線停止 / 復旧後に送信できます':m.closed?'通信を区切りました。再度送信すると再開します。':(m.topic!=='daily'?'話題：'+dialogTopicLabels[m.topic]+' / ':'')+'端末内会話・オフライン');
 const action=$('messageProposal');action.replaceChildren();
 if(latest?.proposal&&['work/jobs','work/incidents','mission/armament'].includes(latest.proposal.route)) {
  const note=document.createElement('small'),button=document.createElement('button');note.textContent='操作提案 / 未実行';button.textContent=latest.proposal.label+' ↗';button.dataset.opsRoute=latest.proposal.route;button.className='staff-secondary';action.append(note,button);
 }
 if(mobileCurrent.messages==='persona'){
 const info=$('messagePersona');info.replaceChildren();
 const fields=[['通信相手',person.name+' / '+p.code],['所属・担当',p.department+' / '+p.role],['権限',p.authority],['口調',p.pronoun+' / 呼称：'+p.address+'。'+p.tone],['人物像・関係',p.temperament+'。'+p.relations],['現在の勤務', {normal:'通常勤務',watch:'警戒待機',battle:'作戦対応',critical:'非常対応'}[w.mode]+' / '+(w.mode==='normal'?(m.emotion||'平静'):{watch:'緊張 / 待機',battle:'集中 / 作戦優先',critical:'緊迫 / 安全確認'}[w.mode])],['共有する情報',p.knowledge.map(k=>({ownEva:'自機の運用表示',eva:'EVA運用',magi:'MAGI運用',technical:'技術点検',tactical:'戦術情報',comms:'通信状態',public:'公開勤務情報'}[k])).join('・')],['回線の関係',m.relationship>=4?'複数の話題を共有した相手':m.relationship?'会話を交わした相手':'初回連絡 / 職務上の距離']];
 for(const [label,value] of fields){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);info.append(row);}
 }
 if(mobileCurrent.messages==='memory'){
 meteoText('messageMemoryTitle',person.name+' / 通信記憶');
 meteoText('messageMemorySummary','話題：'+dialogTopicLabels[m.topic]+' / '+(m.closed?'いったん終了':'継続可能')+(m.deferred?' / 保留：'+dialogTopicLabels[m.deferred]:'')+'。履歴 '+thread.messages.length+'件（最新24件を保存）。');
 const facts=[...m.facts,...m.userNotes.map((label,i)=>({key:'user-note-'+i,label:'あなたが話したこと：'+label,at:m.lastAt}))].reverse(),pages=Math.max(1,Math.ceil(facts.length/4));dialogMemoryPage=Math.min(dialogMemoryPage,pages-1);const memory=$('messageMemories');memory.replaceChildren();
 for(const f of facts.slice(dialogMemoryPage*4,dialogMemoryPage*4+4)){const row=document.createElement('article'),text=document.createElement('p'),time=document.createElement('small');text.textContent=f.label.startsWith('話した話題：')?'話した話題：'+(dialogTopicLabels[f.label.slice(6)]||f.label.slice(6)):f.label;time.textContent=new Date(f.at).toLocaleString('ja-JP');row.append(text,time);memory.append(row);}
 if(!facts.length)memory.textContent='業務上の重要な記憶はまだありません。話した話題：'+(m.topics.map(t=>dialogTopicLabels[t]).join('・')||'未登録')+'。';
 meteoText('messageMemoryPage',(dialogMemoryPage+1)+' / '+pages);$('messageMemoryPrev').disabled=!dialogMemoryPage;$('messageMemoryNext').disabled=dialogMemoryPage+1>=pages;
 }
}
function initDialogDetails() {
 if(!window.NERV_MESSAGES||!qs('#staffSupport')||!$('messagePersona'))return;
 const priorRender=renderPersonalMessages;renderPersonalMessages=function(){priorRender();renderDialogDetails();};
 const priorOpen=openPersonal;openPersonal=function(id){dialogMemoryPage=0;priorOpen(id);const panel=qs('.message-thread-panel');panel.classList.remove('message-connected');requestAnimationFrame(()=>panel.classList.add('message-connected'));};window.NERV_MESSAGES.open=openPersonal;
 $('messageMemoryPrev').addEventListener('click',()=>{dialogMemoryPage--;renderDialogDetails();});$('messageMemoryNext').addEventListener('click',()=>{dialogMemoryPage++;renderDialogDetails();});
 window.addEventListener('nerv-route',renderDialogDetails);renderDialogDetails();
}
initDialogDetails();
// Separate case/evidence/decision/archive views keep the phone workflow short.
const securityLabels={detected:'案件受付',accepted:'受領済み',collecting:'証拠照合中',analyzing:'MAGI照合中',analyzed:'照合完了',decision:'方針選択済み',reported:'副司令の確認待ち',failed:'緊急上申が必要',resolved:'引継ぎ完了'};
function securityFloorPlan(){return '<svg viewBox="0 0 360 150" class="security-plan" role="img" aria-label="保安確認区画の模擬配置"><path d="M18 18h92v42H18zm0 58h92v55H18zm115-58h95v113h-95zm118 0h91v42h-91zm0 58h91v55h-91z"/><path class="plan-route" d="M64 60v8h116V43m0 62h117V60M110 105h23"/><g fill="currentColor" stroke="none" font-size="10"><text x="28" y="39">認証区画</text><text x="28" y="104">昇降路</text><text x="145" y="71">中央管制</text><text x="261" y="41">文書庫</text><text x="261" y="104">送電系統</text></g><g class="plan-marker"><circle cx="64" cy="104" r="13"/><path d="M48 104h32m-16-16v32"/></g></svg>';}
let securityHistoryPage=0;
let securityEvidenceIndex=0,securityEvidenceCase='';
function renderSecurity(){
 if(!$('securityStatus')||!staffWorldReady)return;const s=S.world.security,c=s?.case,definition=c&&securityKinds[c.kind];
 if(securityEvidenceCase!==c?.id){securityEvidenceCase=c?.id;securityEvidenceIndex=0;}
 all('[data-security-clue]').forEach((b,i)=>{b.disabled=!c;b.setAttribute('aria-pressed',String(i===securityEvidenceIndex));b.textContent='証拠 '+(i+1)+(c?.evidence.includes(definition.evidence[i][0])?' ✓':'');});
 document.body.dataset.securityView=String(currentPage==='work'&&['security','evidence','decision','security-history','security-settings'].includes(mobileCurrent.work));
 meteoText('securityStatus',c?securityLabels[c.stage]:'保安監視 / 異常案件なし');meteoText('securityOverview',c?c.id+' / '+definition.title+' / '+definition.zone:'入退館・整備指令・監査経路を照合します。状況連動または保安演習から案件を開始できます。');
 meteoText('securityMetrics','記録整合性 '+Math.round(s.integrity)+'% / 部署間確認 '+Math.round(s.trust)+'%（独自の模擬指標）');
 meteoText('securityDeadline',c?c.contained?'当該区画は一時保留。上申・引継ぎを継続してください。':c.stage==='reported'?'副司令系統で確認中。次の30秒更新を待ちます。':'再確認期限まで '+Math.max(0,c.deadlineTick-S.world.tick)+'更新 / 1更新30秒':'新規事象の監視中。未確認の情報を脅威と断定しません。');
 $('securityAuto').textContent='状況連動イベント：'+(s.auto?'ON':'OFF');$('securityAuto').setAttribute('aria-pressed',String(s.auto));
 all('[data-security-start]').forEach(b=>b.disabled=!!c);$('securityAccept').disabled=c?.stage!=='detected';
 const clues=$('securityEvidence');clues.replaceChildren();
 if(c)for(let i=0;i<definition.evidence.length;i++){
  const [id,label]=definition.evidence[i],card=document.createElement('article'),title=document.createElement('h3'),text=document.createElement('p'),button=document.createElement('button');card.hidden=i!==securityEvidenceIndex;title.textContent=label;const known=c.evidence.includes(id);text.textContent=known?definition.findings[c.variant][i]:'未照合。担当記録と一致するかを確認してください。';button.textContent=known?'照合済み':'証拠を確認';button.className='staff-secondary';button.dataset.securityAction='evidence.'+id;button.disabled=known||!['accepted','collecting'].includes(c.stage);card.append(title,text,button);clues.append(card);
 }else clues.textContent='対応中の案件はありません。';
 $('securityAnalyze').disabled=!(c?.stage==='collecting'&&c.evidence.length>=2);meteoText('securityAnalysis',c?.stage==='analyzing'?'MAGIで2種類以上の証拠を照合中。次の更新で結果が届きます。':c?.stage==='analyzed'?'照合結果を読み、方針選択へ進んでください。':c?'証拠 '+c.evidence.length+' / 3。2種類以上を照合して解析を依頼できます。':'照合対象なし');
 meteoText('securityDecision',c?c.id+' / '+securityLabels[c.stage]+(c.decision?' / '+({hold:'当該区画を一時保留',release:'認証を確認',escalate:'上級職員へ上申'}[c.decision]||''):''):'未処理案件なし');
 $('securityHold').disabled=c?.stage!=='analyzed';$('securityRelease').disabled=c?.stage!=='analyzed';$('securityEscalate').disabled=!(c&&(['analyzed'].includes(c.stage)||['accepted','collecting'].includes(c.stage)&&c.evidence.length));$('securityReport').disabled=c?.stage!=='decision';$('securityRecover').hidden=c?.stage!=='failed';
 const pages=Math.max(1,Math.ceil(s.archive.length/3));securityHistoryPage=Math.min(securityHistoryPage,pages-1);const archive=$('securityArchive');archive.replaceChildren();for(const record of s.archive.slice(securityHistoryPage*3,securityHistoryPage*3+3)){const card=document.createElement('article'),p=document.createElement('p'),small=document.createElement('small');p.textContent=record.id+' / '+securityKinds[record.kind].title;small.textContent=record.assessment+' / '+record.authorizedBy;card.append(p,small);archive.append(card);}if(!s.archive.length)archive.textContent='引継ぎ記録はまだありません。';meteoText('securityHistoryPage',(securityHistoryPage+1)+' / '+pages);$('securityHistoryPrev').disabled=!securityHistoryPage;$('securityHistoryNext').disabled=securityHistoryPage+1>=pages;
 if(c)meteoText('launcherWorld',securityKinds[c.kind].title+' / '+securityLabels[c.stage]);
 const plan=qs('.security-plan');if(plan){plan.dataset.stage=c?.stage||'idle';const marker=plan.querySelector('.plan-marker');marker.setAttribute('transform','translate('+(c?.kind==='sabotage'?233:c?.kind==='audit'?233:0)+','+(c?.kind==='audit'?-65:0)+')');}
}
function initSecurityViews(){
 if(!qs('#staffSupport'))return;
 const content={
 security:['本部保安','<div class="staff-panel"><p class="eyebrow">INTERNAL SECURITY / SIMULATION</p><h2 id="securityStatus"></h2><p id="securityOverview" class="staff-guide"></p>'+securityFloorPlan()+'<p id="securityMetrics" class="staff-note"></p><p id="securityDeadline" class="staff-note"></p><button id="securityAccept" class="staff-primary" data-security-action="accept">保安案件を受領</button><div class="ops-route-grid"><button data-ops-route="work/evidence">証拠照合 ↗</button><button data-ops-route="work/decision">方針・報告 ↗</button></div><button class="staff-secondary" data-ops-route="work/security-settings">演習・発生設定 ↗</button></div>'],
 'security-settings':['保安設定','<div class="staff-panel"><h3>保安演習</h3><p class="staff-note">TV版の本部・組織設定を参考にした独自の模擬事案です。</p><div class="security-training">'+Object.entries(securityKinds).map(([k,v])=>'<button class="staff-secondary" data-security-start="'+k+'">'+v.title+'</button>').join('')+'</div><button id="securityAuto" class="staff-secondary" data-security-action="toggle"></button></div>'],
 evidence:['証拠照合','<div class="staff-panel"><p class="eyebrow">EVIDENCE / CROSS CHECK</p><h2>保安情報の照合</h2><div class="armament-picker" aria-label="照合する証拠"><button data-security-clue="0">証拠 1</button><button data-security-clue="1">証拠 2</button><button data-security-clue="2">証拠 3</button></div><div id="securityEvidence"></div><p id="securityAnalysis" class="staff-note"></p><button id="securityAnalyze" class="staff-primary" data-security-action="analyze">MAGIへ証拠照合を依頼</button><button class="staff-secondary" data-ops-route="work/decision">方針・上申へ ↗</button></div>'],
 decision:['保安上申','<div class="staff-panel"><p class="eyebrow">DECISION / AUTHORITY C-3</p><h2>対応方針と引継ぎ</h2><p id="securityDecision" class="staff-guide"></p><p class="staff-note">手順書で許された当該区画の一時保留、認証済み情報の確認、上級職員への上申を選びます。原因・実行者を推測で断定しません。</p><button id="securityHold" class="staff-secondary" data-security-action="hold">当該区画・転送を一時保留</button><button id="securityRelease" class="staff-secondary" data-security-action="release">証拠に基づき通行・文書の認証を確認</button><button id="securityEscalate" class="staff-secondary" data-security-action="escalate">不確定要素を残して上級へ上申</button><button id="securityReport" class="staff-primary" data-security-action="report">冬月副司令へ正式に報告</button><button id="securityRecover" class="staff-primary" data-security-action="recover">証拠保全・緊急上申</button><button class="staff-secondary" data-ops-route="work/security-history">保安履歴 ↗</button></div>'],
 'security-history':['保安履歴','<div class="staff-panel"><h2>保安案件の引継ぎ</h2><div id="securityArchive"></div><div class="message-history-nav"><button id="securityHistoryPrev">前へ</button><small id="securityHistoryPage"></small><button id="securityHistoryNext">次へ</button></div><button class="staff-secondary" data-ops-route="work/security">本部保安へ ↗</button></div>']
 };
 for(const [id,[label,html]]of Object.entries(content)){const panel=document.createElement('section');panel.className='mobile-view';panel.dataset.view=id;panel.innerHTML=html;qs('.page[data-page="work"]').append(panel);registerTerminalView('work',id,label);}
 document.addEventListener('click',event=>{const b=event.target.closest('[data-security-action],[data-security-start]');if(!b||b.disabled)return;worldAction('security.'+(b.dataset.securityStart?'start.'+b.dataset.securityStart:b.dataset.securityAction));});
 all('[data-security-clue]').forEach(b=>b.addEventListener('click',()=>{securityEvidenceIndex=Number(b.dataset.securityClue);renderSecurity();}));
 $('securityHistoryPrev').addEventListener('click',()=>{securityHistoryPage--;renderSecurity();});$('securityHistoryNext').addEventListener('click',()=>{securityHistoryPage++;renderSecurity();});
 const priorDraw=draw;draw=function(){priorDraw();renderSecurity();};window.addEventListener('nerv-route',renderSecurity);window.addEventListener('nerv-world-ready',renderSecurity);
 const priorAlert=terminalAlert;terminalAlert=function(){const old=priorAlert(),c=staffWorldReady&&securityActive(S);if(!c)return old;const level=c.stage==='failed'?'critical':'watch';if(old.level==='critical')return old;if(old.level==='nominal'||old.key?.startsWith('world-')||level==='critical')return {level,key:'security-'+c.id,title:securityKinds[c.kind].title,message:c.id+' / '+securityLabels[c.stage]+'。本部保安で証拠照合・上申を進めてください。',page:'work'};return old;};
 const priorReview=openAlertReview;openAlertReview=function(mode='alert'){priorReview(mode);if(securityActive(S)){$('alertClear').disabled=true;$('alertClear').textContent='保安案件の引継ぎが必要';meteoText('alertReviewDescription','当該区画の安全確認は全系統復旧で省略できません。本部保安から証拠を照合し、上級職員へ報告してください。');}};
 $('alertTarget').addEventListener('click',e=>{if(terminalAlert().key?.startsWith('security-')){e.stopImmediatePropagation();closeAlertReview();window.NERV_MOBILE.open('work','security');}},true);
 const intro=qs('.page[data-page="work"] [data-view="brief"]');const b=document.createElement('button');b.className='staff-secondary';b.dataset.opsRoute='work/security';b.textContent='本部保安・侵入/謀略案件 ↗';intro?.append(b);
 window.NERV_SECURITY={act:action=>worldAction('security.'+action),snapshot:()=>worldClone(S.world?.security||null)};
 renderSecurity();
}
initSecurityViews();
// Spatial Grid, Conic Portal, Wave Field and Layered Parallax share the existing render budget.
function initV214Visuals(){
 if(!window.NERV_FX||!qs('#staffSupport'))return;
 const enabled=id=>S.prefs['fx'+id]!==false;
 function panel(page,id,label,html){const el=document.createElement('section');el.className='mobile-view';el.dataset.view=id;el.innerHTML=html;qs('.page[data-page="'+page+'"]').append(el);registerTerminalView(page,id,label);return el;}
 const system=panel('magi','system','システム図','<div class="staff-panel magi-system-panel"><p class="eyebrow">S.C. MAGI / PERSONALITY TRANSPLANT OS</p><div class="staff-panel-title"><h2>三基統合システム</h2><b id="magiSystemState"></b></div><div id="magiSystemDiagram">'+nervMagiDiagram('NERV CENTRAL')+'</div><canvas id="magiWaveField" class="v214-wave" aria-label="解析状態・侵入圧に連動するWave Field"></canvas><p id="magiSystemReadout" class="staff-note"></p><div class="ops-route-grid"><button data-ops-route="magi/request">審議申請 ↗</button><button data-ops-route="magi/compute">三基・666監視 ↗</button></div></div>');
 const preview=document.createElement('button');preview.className='magi-preview';preview.dataset.opsRoute='magi/system';preview.setAttribute('aria-label','MAGI三基システム図を開く');preview.innerHTML=nervMagiDiagram('MAGI')+'<span>三基統合・演算状態 ↗</span>';$('magiRequestPanel').prepend(preview);
 const armament=panel('mission','weapon-detail','装備精密図','<div class="staff-panel"><p class="eyebrow">ARMAMENT / INSPECTION PLATE</p><h2 id="weaponDetailName">兵装精密図</h2><div class="armament-picker"><button data-detail-weapon="knife">ナイフ</button><button data-detail-weapon="rifle">パレット</button><button data-detail-weapon="positron">ポジトロン</button></div><p class="staff-note">左右へスクロールして機構を確認できます。戦闘性能は既存の運用条件に従います。</p><div class="weapon-detail-scroll" tabindex="0" role="region" aria-label="拡大した装備図"><div id="weaponDetailImage"></div></div><label class="staff-label" for="weaponDetailZoom">表示倍率</label><input id="weaponDetailZoom" type="range" min="1" max="2.2" step=".2" value="1"><button class="staff-secondary" data-ops-route="mission/armament">兵装運用へ ↗</button></div>');
 let detailWeapon='knife';function detail(){meteoText('weaponDetailName',{knife:'プログレッシブナイフ',rifle:'パレットガン',positron:'ポジトロンライフル'}[detailWeapon]);$('weaponDetailImage').innerHTML=nervWeaponPlate(detailWeapon);$('weaponDetailImage').style.width=(Number($('weaponDetailZoom').value)*100)+'%';}
 all('[data-detail-weapon]').forEach(b=>b.addEventListener('click',()=>{detailWeapon=b.dataset.detailWeapon;detail();}));$('weaponDetailZoom').addEventListener('input',detail);detail();
 const equipmentLink=document.createElement('button');equipmentLink.className='staff-secondary';equipmentLink.dataset.opsRoute='mission/weapon-detail';equipmentLink.textContent='装備精密図・拡大表示 ↗';qs('#armamentPanel .staff-panel').append(equipmentLink);
 const directorate=panel('hq','directorate','司令・副司令','<div class="staff-panel"><p class="eyebrow">NERV / DIRECTORATE</p><h2>司令部連絡</h2><div class="directorate-card"><span class="director-portrait" data-director="0" role="img" aria-label="碇ゲンドウ"></span><div><h3>碇ゲンドウ</h3><p>司令 / 組織と作戦の統括</p><button class="staff-secondary" data-director-talk="gendo">司令との通信 ↗</button></div></div><div class="directorate-card"><span class="director-portrait" data-director="1" role="img" aria-label="冬月コウゾウ"></span><div><h3>冬月コウゾウ</h3><p>副司令 / 指揮系統・報告の確認</p><button class="staff-secondary" data-director-talk="fuyutsuki">副司令との通信 ↗</button></div></div><p id="directorateDuty" class="staff-note"></p><button class="staff-secondary" data-ops-route="work/security">本部保安・正式報告 ↗</button></div>');
 panel('hq','seele','ゼーレ','<div class="staff-panel seele-panel"><p class="eyebrow">EXTERNAL AUDIT / RESTRICTED</p><div class="seele-monolith" aria-hidden="true"><span>SEELE</span><b>01</b><small>SOUND ONLY / AUTHENTICATED CHANNEL</small></div><div class="directorate-card"><span class="director-portrait" data-director="2" role="img" aria-label="キール・ローレンツ"></span><div><h2>キール・ローレンツ</h2><p>ゼーレ / 委員会監査回線</p><button class="staff-secondary" data-director-talk="kiel">監査回線を開く ↗</button></div></div><p class="staff-note">NERV職員の私的な指揮系統とは異なる外部監査回線です。未確認の文書や機密資料を転送しません。</p><button class="staff-secondary" data-ops-route="work/security">監査文書の照合 ↗</button></div>');
 const observatory=panel('hq','observatory','眺望・深度','<div class="staff-panel"><p class="eyebrow">GEOFRONT / OBSERVATION WINDOW</p><h2>ジオフロント眺望</h2><div id="layeredObservatory" class="hq-scene hq-geofront world-viewport world-geofront layered-parallax" role="img" aria-label="固定のジオフロント画像と奥行きのある管制レイヤー"><span class="parallax-mid" aria-hidden="true"></span><span class="parallax-front" aria-hidden="true"></span><canvas id="spatialGrid" aria-label="実際の都市・機体状態を参照するSpatial Grid"></canvas></div><p id="observatoryReadout" class="staff-guide"></p><p class="staff-note">Spatial Grid / Layered Parallax。画像を保持し、前景の管制線だけに奥行きを与えています。</p><div class="ops-route-grid"><button data-ops-route="hq/damage">被害状況 ↗</button><button data-ops-route="infra/defense">戦域マップ ↗</button></div></div>');
 const oldFace=personalFace;personalFace=function(person){const index={gendo:0,fuyutsuki:1,kiel:2}[person.id];if(index===undefined)return oldFace(person);const face=document.createElement('span');face.className='message-avatar director-portrait';face.dataset.director=String(index);face.setAttribute('role','img');face.setAttribute('aria-label',person.name+'の顔');return face;};
 all('[data-director-talk]').forEach(b=>b.addEventListener('click',()=>openPersonal(b.dataset.directorTalk)));
 const bridge=qs('.page[data-page="hq"] [data-view="bridge"]');const routes=document.createElement('div');routes.className='ops-route-grid v214-hq-routes';routes.innerHTML='<button data-ops-route="hq/directorate">司令・副司令 ↗</button><button data-ops-route="hq/seele">ゼーレ監査回線 ↗</button><button data-ops-route="hq/observatory">眺望・深度表示 ↗</button><button data-ops-route="work/security">本部保安 ↗</button>';bridge.append(routes);
 const effects=[['SpatialGrid','Spatial Grid','眺望と戦術情報の座標面'],['ConicPortal','Conic Portal','起動・認証の開口表現'],['WaveField','Wave Field','解析状態に連動する波面'],['LayeredParallax','Layered Parallax','固定眺望と前景の奥行き']];
 panel('settings','visual-index','視覚効果','<div class="staff-panel"><h2>視覚効果 / EFFECT INDEX</h2>'+effects.map(([id,label,description])=>'<button class="setting-row" data-v214-effect="'+id+'"><span><b>'+label+'</b><small>'+description+'</small></span><strong></strong></button>').join('')+'<p class="staff-note">全体の演出OFF・低モーションを優先します。Canvasは既存の共通描画エンジンを使い、非表示中は停止します。</p><button class="staff-secondary" data-ops-route="settings/effects">映像品質 ↗</button></div>');
 const settingsLink=document.createElement('button');settingsLink.className='staff-secondary';settingsLink.dataset.opsRoute='settings/visual-index';settingsLink.textContent='Spatial Gridなど4効果の設定 ↗';qs('.page[data-page="settings"] [data-view="effects"]').append(settingsLink);
 all('[data-v214-effect]').forEach(b=>b.addEventListener('click',()=>commandOperation(()=>{const key='fx'+b.dataset.v214Effect;S.prefs[key]=S.prefs[key]===false;})));
 const portal=document.createElement('div');portal.className='conic-portal';portal.setAttribute('aria-hidden','true');qs('.launch-shaft').prepend(portal);const bootPortal=portal.cloneNode();qs('.boot-lattice')?.append(bootPortal);
 const pointer={x:0,y:0};$('layeredObservatory').addEventListener('pointermove',e=>{if(!isMoving()||!enabled('LayeredParallax'))return;const r=e.currentTarget.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width-.5;pointer.y=(e.clientY-r.top)/r.height-.5;e.currentTarget.style.setProperty('--parallax-x',(pointer.x*10)+'px');e.currentTarget.style.setProperty('--parallax-y',(pointer.y*6)+'px');},{passive:true});$('layeredObservatory').addEventListener('pointerleave',()=>{pointer.x=pointer.y=0;$('layeredObservatory').style.setProperty('--parallax-x','0px');$('layeredObservatory').style.setProperty('--parallax-y','0px');});
 function wave(ctx,w,h,time){
  const x=externalMagiState(),analysis=S.world?.magiOps?.active?.stage==='diagnosing'||S.world?.jobs?.some(j=>j.status==='processing')||securityActive(S)?.stage==='analyzing',active=analysis||externalMagiActive(),pressure=Math.max(...x.pressure),intensity=active ? .45+pressure/180 : .06;
  ctx.strokeStyle='#3c584a';ctx.lineWidth=.5;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(0,h*i/4);ctx.lineTo(w,h*i/4);ctx.stroke();}
  for(let line=0;line<7;line++){ctx.beginPath();for(let px=0;px<=w;px+=4){const y=h*.5+(line-3)*9+Math.sin(px*.025-time*(.45+line*.08)+line*.35)*Math.cos(px*.008+time*.3)*h*intensity*.35;px?ctx.lineTo(px,y):ctx.moveTo(px,y);}ctx.strokeStyle=line===3?(externalMagiActive()?'#df7354':'#daa365'):'#74a99580';ctx.lineWidth=line===3?1.5:.65;ctx.stroke();}
 }
 function neuralField(ctx,w,h,time){
  const e=selected(),connected=['READY','DEPLOYED'].includes(e.state),amplitude=connected?Number(e.sync)/100:.06,color=['#82bbcf','#b1a0dd','#d9a26f'][S.selectedEva];
  ctx.lineWidth=.6;for(let line=0;line<8;line++){ctx.beginPath();for(let x=0;x<=w;x+=3){const envelope=Math.sin(Math.PI*x/w),y=h*.5+(line-3.5)*9+Math.sin(x*.035-time*.7+line*.3)*envelope*amplitude*23;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=line===4?color:'#718b8050';ctx.lineWidth=line===4?1.5:.6;ctx.stroke();}
  ctx.fillStyle=color;ctx.font='9px monospace';ctx.fillText('UNIT-0'+S.selectedEva+' / SYNC '+Number(e.sync).toFixed(1)+'%',8,14);ctx.fillText(evaExternalPower(S.selectedEva)?'EXTERNAL SUPPLY':'INTERNAL '+Math.ceil(e.power)+' SEC',8,h-9);
 }
 function spatial(ctx,w,h,time){
  ctx.strokeStyle='#a8b7a750';ctx.lineWidth=.6;const horizon=h*.3;for(let i=-7;i<=7;i++){ctx.beginPath();ctx.moveTo(w/2+i*8,horizon);ctx.lineTo(w/2+i*w/6,h);ctx.stroke();}for(let i=0;i<8;i++){const y=horizon+(h-horizon)*Math.pow(i/7,1.8);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  for(let i=0;i<4;i++){const facility=S.defense.city[i],x=w*(.19+i*.205),y=h*(.52+(i%2)*.14);ctx.strokeStyle=facility.hp<40?'#e88361':'#bdc99f';ctx.strokeRect(x-9,y-6,18,12);ctx.fillStyle=ctx.strokeStyle;ctx.font='8px monospace';ctx.fillText(String(facility.hp)+'%',x-9,y+18);}
 }
 window.NERV_FX.register($('magiWaveField'),wave,()=>currentPage==='magi'&&mobileCurrent.magi==='system'&&enabled('WaveField'));
 window.NERV_FX.register($('spatialGrid'),spatial,()=>currentPage==='hq'&&mobileCurrent.hq==='observatory'&&enabled('SpatialGrid'));
 const securityCanvas=document.createElement('canvas');securityCanvas.id='securitySpatialGrid';securityCanvas.className='security-grid-surface';securityCanvas.setAttribute('aria-label','保安区画のSpatial Grid');const floor=qs('.security-plan');if(floor){const stack=document.createElement('div');stack.className='security-map-stack';floor.before(stack);stack.append(securityCanvas,floor);}window.NERV_FX.register(securityCanvas,spatial,()=>currentPage==='work'&&mobileCurrent.work==='security'&&enabled('SpatialGrid'));
 function render(){
  // World quarantine/normalization finishes asynchronously; never inspect raw event records.
  if(!staffWorldReady)return;
  const viewport=$('layeredObservatory'),health=S.defense.city[3].hp;viewport.dataset.damage=health<35?'critical':health<75?'damaged':'normal';viewport.dataset.power=String(S.infra.power);viewport.style.setProperty('--hq-damage',String((100-health)/100));
  document.body.dataset.v214View=currentPage+'/'+(mobileCurrent[currentPage]||'');
  for(const [id]of effects){document.body.dataset['fx'+id]=String(enabled(id));const b=qs('[data-v214-effect="'+id+'"]');b.setAttribute('aria-pressed',String(enabled(id)));b.querySelector('strong').textContent=enabled(id)?'ON':'OFF';}
  const x=externalMagiState(),limited=securityHold()||worldMagiLimited(),votes=S.magi.vote?.votes;meteoText('magiSystemState',externalMagiActive()?'侵入対処':limited?'審議保留':S.magi.vote?'判定済み':'三基稼働');meteoText('magiSystemReadout','MAGI：'+worldObserve(S).magi+' / '+(securityHold()?'保安確認待ち':worldMagiLimited()?'冷却系統点検中':S.magi.vote?'現在の審議結果を確認できます':'審議申請を待機')+'。波面は稼働状態の視覚化です。');
  for(const root of [$('magiSystemDiagram'),preview])for(const node of root.querySelectorAll('[data-fx-core]')){const i=Number(node.dataset.fxCore);node.dataset.status=x.pressure[i]>=90?'danger':limited?'active':externalMagiActive()?'active':'idle';node.querySelector('.magi-core-readout').textContent=externalMagiActive()?x.pressure[i]+'%':limited?'保留':votes?.[i]?votes[i].yes?'可決':'否決':'稼働';}
  meteoText('directorateDuty',securityActive(S)?'本部保安案件は証拠を添えて副司令系統へ報告してください。':'現在は通常の指揮系統で報告を受け付けています。');meteoText('observatoryReadout','本部健全性 '+S.defense.city[3].hp+'% / 主電源 '+(S.infra.power?'接続':'停止')+' / '+worldObserve(S).alert);
 }
 const oldDraw=draw;draw=function(){oldDraw();render();};window.addEventListener('nerv-route',render);window.addEventListener('nerv-world-ready',render);
 window.NERV_VISUALS={neural:neuralField,snapshot:()=>({effects:Object.fromEntries(effects.map(([id,label])=>[label,enabled(id)])),magi:worldObserve(S).magi}),refresh:render};render();
}
initV214Visuals();
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
// Opt-in native AI, bounded and asynchronous. No secret crosses the WebView bridge.
function initPersonnelAI(){
 if(!window.NERV_MESSAGES||!qs('#staffSupport'))return;
 let status={available:false,configured:false,enabled:false,model:'',generation:0},preparing=false,configuring=false,lastError='';
 const active=new Set(),replies=new Map();
 const key=p=>p.to+':'+p.replyTo;
 function aiCall(action,payload={}){
  if(!window.__SCRIPTABLE__)return Promise.resolve({error:'API設定はScriptableで利用できます',available:false,enabled:false});
  if(action!=='aiReply')return callNative(action,payload);
  return new Promise(resolve=>{const id=nextBridgeId++;let timer=setTimeout(()=>{delete bridgeCallbacks[id];resolve({error:'応答待ち時間を超えました / オフラインで継続'});},15000);bridgeCallbacks[id]=result=>{clearTimeout(timer);resolve(result);};window.__nervQueue.push({id,action,payload});});
 }
 async function refresh(){const result=await aiCall('aiStatus');status={...status,...result};render();return snapshot();}
 function signature(id){const c=dialogAIContext(id);return JSON.stringify({world:c?.world,character:id,generation:status.generation});}
 function allowed(p){const m=personalThread(p.to).memory,topic=dialogIntent(p.input||'','free',m);return status.enabled&&dialogWorld().mode==='normal'&&typeof p.input==='string'&&!['restricted','request','end'].includes(topic);}
 async function prepare(){
  if(preparing||!personalReady||document.hidden||!S.infra.comms||active.size)return;
  const p=S.personalMessages.pending.find(p=>p.due<=Date.now()&&!p.aiAttempted&&allowed(p));if(!p)return;
  preparing=true;active.add(key(p));
  try{
   // Persist the attempt first. Restarting never repeats a potentially billable request.
   const result=await personalIncoming(data=>{const current=data.pending.find(x=>x.replyTo===p.replyTo);if(!current)throw Error('送信を取り消しました');current.aiAttempted=true;});
   if(!result.ok){active.delete(key(p));return;}
   const worldSignature=signature(p.to),context=dialogAIContext(p.to);context.character={id:p.to,name:personalById(p.to).name};context.mode='ai';
   aiCall('aiReply',{id:p.replyTo+':'+p.to,input:p.input,context}).then(result=>{
    const validated=result?.ok?dialogValidateSuggestion(result.reply):null;
    replies.set(key(p),validated?{validated,signature:worldSignature,model:dialogText(result.model,80)}:{error:dialogText(result?.error||'API応答を確認できません',160)});
    active.delete(key(p));lastError=validated?'':replies.get(key(p)).error;render();
    if(!document.hidden)personalPulse();
   }).catch(()=>{active.delete(key(p));replies.set(key(p),{error:'API接続エラー'});lastError='API接続エラー';if(!document.hidden)personalPulse();});
  }finally{preparing=false;render();}
 }
 function take(p,offline){
  const r=replies.get(key(p));
  if(r?.validated&&status.enabled&&r.signature===signature(p.to)&&dialogWorld().mode==='normal'){
   const suggestion=r.validated.suggestion;
   return {...offline,text:r.validated.text,transport:'ai',model:r.model,proposal:suggestion?{kind:suggestion.kind,route:suggestion.route,label:'担当画面で要件を確認'}:null};
  }
  return {...offline,transport:p.aiAttempted?'offline-fallback':'offline'};
 }
 function prune(){const pending=new Set(S.personalMessages?.pending?.map(p=>key(p))||[]);for(const id of replies.keys())if(!pending.has(id))replies.delete(id);render();}
 async function configure(){if(configuring)return;configuring=true;render();try{const result=await aiCall('aiConfigure');status={...status,...result};lastError=result.error||'';if(!status.enabled)replies.clear();}finally{configuring=false;render();if(personalReady)personalPulse();}}
 function snapshot(){return {status:{...status},busy:active.size>0,configuring,error:lastError,pendingRequests:active.size};}
 function render(){
  if(!$('personnelAIState'))return;
  meteoText('personnelAIState',status.enabled?'AI会話 ON / '+status.model:status.configured?'API設定済み / 外部送信 OFF':'オフライン会話 / API未設定');
  meteoText('personnelAIEndpoint',status.available?status.host||'Scriptable / Keychain':'ブラウザ表示ではAPIキーを保存しません。Scriptableで設定してください。');
  meteoText('personnelAIActivity',active.size?'API応答待ち / 他の管制操作は継続できます':lastError||'未設定・障害・警戒時はオフライン会話を使用します。');
  $('personnelAIConfigure').disabled=configuring||!window.__SCRIPTABLE__;$('personnelAIConfigure').textContent=configuring?'ネイティブ設定を開いています…':'接続先・モデル・APIキーを設定';
  const pending=Array.isArray(S.personalMessages?.pending)?S.personalMessages.pending:[];
  const selected=pending.find(p=>p?.to===personalContact);if(selected&&active.has(key(selected)))meteoText('messageTyping','外部AIに接続中 / 回答を照合しています…');
 }
 const panel=document.createElement('section');panel.className='mobile-view';panel.dataset.view='ai';panel.innerHTML='<div class="staff-panel"><p class="eyebrow">PERSONNEL / AI CONNECTION</p><h2>動的AI会話</h2><p id="personnelAIState" class="staff-guide"></p><p id="personnelAIEndpoint" class="staff-note"></p><button id="personnelAIConfigure" class="staff-primary">接続先・モデル・APIキーを設定</button><p id="personnelAIActivity" class="staff-note" role="status"></p><p class="staff-note">キーはScriptableのKeychainだけに保存します。OpenAI Responsesと互換Chat CompletionsのHTTPS接続先・モデルを設定できます。</p><p class="staff-note">ON時だけ、選択相手の人格・公開状態・最新12メッセージ・記憶を設定先へ送ります。API利用料金が発生する場合があります。自発通信はオフライン処理です。</p><p class="staff-note">発令・業務処理は担当画面で確認します。AIは内部状態を変更しません。設定画面から外部送信OFF・キー削除も行えます。</p><button class="staff-secondary" data-ops-route="messages/thread">トークへ ↗</button></div>';
 qs('.page[data-page="messages"]').append(panel);registerTerminalView('messages','ai','AI設定');$('personnelAIConfigure').addEventListener('click',configure);
 for(const target of [qs('.page[data-page="messages"] [data-view="preferences"] .staff-panel'),qs('.page[data-page="settings"] [data-view="data"]')]){const b=document.createElement('button');b.className='staff-secondary';b.dataset.opsRoute='messages/ai';b.textContent='動的AI会話・API設定 ↗';target?.append(b);}
 const priorRender=renderPersonalMessages;renderPersonalMessages=function(){priorRender();render();};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&window.__SCRIPTABLE__)refresh();});
 window.NERV_AI={refresh,configure,prepare,holds:p=>status.enabled&&active.has(key(p)),take,prune,snapshot};
 refresh();
}
initPersonnelAI();
// Anime.js 4.5.0 is vendored under MIT. Its own RAF loop is disabled.
function initV215Motion(){
 if(!window.NERV_FX||!window.anime)return;const live=new Map();let ticks=0;
 function stop(key){const item=live.get(key);if(!item)return;item.animation.complete();item.animation.cancel();live.delete(key);}
 function stopAll(){for(const key of [...live.keys()])stop(key);}
 function visible(owner){const r=owner?.getBoundingClientRect();return !!r&&r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight;}
 function tween(key,from,to,update,owner,duration=480){
  stop(key);if(document.hidden||!isMoving()||!visible(owner)){update(to);return false;}
  if(live.size>=6)stop(live.keys().next().value);const value={progress:from};
  const animation=window.anime.animate(value,{progress:to,duration:Math.min(800,Math.max(100,duration)),ease:'outCubic',onUpdate:()=>update(value.progress),onComplete:()=>{update(to);live.delete(key);}});
  live.set(key,{animation,owner});window.NERV_FX.refresh();return true;
 }
 window.NERV_FX.registerHook(()=>{for(const [key,item]of live)if(!visible(item.owner))stop(key);window.anime.engine.fps=S.prefs.fxQuality==='low'?20:60;window.anime.engine.update();ticks++;},()=>live.size>0&&!document.hidden&&isMoving());
 window.addEventListener('nerv-route',()=>{stopAll();const panel=qs('.page.active .mobile-view:not([hidden]) .v215-panel');if(panel)tween('panel-open',0,1,v=>{panel.style.opacity=String(.6+v*.4);panel.style.transform=v===1?'':'translateY('+(4*(1-v))+'px)';},panel,260);});
 document.addEventListener('visibilitychange',stopAll);window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',stopAll);$('motionSwitch').addEventListener('click',stopAll);
 window.NERV_MOTION={tween,stopAll,snapshot:()=>({library:'Anime.js',version:'4.5.0',active:live.size,ticks,ownRAF:window.anime.engine.reqId,defaultMainLoop:window.anime.engine.useDefaultMainLoop})};
}
initV215Motion();
// Attached sketch informs valley/lake/high-rise organization; this is a schematic, not surveyed GIS.
function initV215City(){
 const map=$('v27IsoMap');if(!map||!map.insertBefore)return;const ns='http://www.w3.org/2000/svg',scene=document.createElementNS(ns,'g');scene.id='tokyo3Terrain';scene.classList.add('v215-city-scene');
 let markup='<path class="city-basin" d="M22 151 223 78 458 50 652 200 600 323 303 407 50 318Z"/>';
 for(let layer=0;layer<5;layer++){const shift=layer*10;markup+='<path class="city-contour" d="M0 '+(92+shift)+' 52 '+(52+shift)+' 85 '+(68+shift)+' 133 '+(29+shift)+' 191 '+(65+shift)+' 253 '+(17+shift)+' 310 '+(40+shift)+' 374 '+(8+shift)+' 428 '+(38+shift)+' 486 '+(22+shift)+' 537 '+(65+shift)+' 595 '+(53+shift)+' 680 '+(114+shift)+'"/>';}
 markup+='<path class="city-lake" d="M36 159Q68 132 100 157L154 228Q175 269 126 300L55 323Q24 301 42 275L67 235Q29 209 36 159Z"/><path class="city-lake-shore" d="M43 165Q72 143 95 164L145 232Q160 267 122 291L57 312M51 176 82 182 122 244 113 277 67 299"/>';
 for(let i=0;i<9;i++){const y=103+i*27;markup+='<path class="city-road" d="M'+(143+i*9)+' '+y+' 511 '+(y-43)+' 641 '+(y+39)+'"/>';}
 for(let i=0;i<8;i++){const x=180+i*54;markup+='<path class="city-road" d="M'+x+' 91 '+(x+104)+' 302 '+(x+40)+' 362"/>';}
 markup+='<path class="city-highway" d="M33 392 235 265 451 190 675 155M27 383 231 258 446 183 672 149M116 99 273 226 535 386"/><path class="city-rail" d="M74 363 226 287 351 262 552 186 673 204"/>';
 scene.innerHTML=markup;map.insertBefore(scene,$('v27PowerLine'));const blocks=[];
 for(let row=0;row<7;row++)for(let col=0;col<11;col++){
  const x=176+col*34+row*8,y=111+row*30-col*2,sector=x<265?0:x>470?2:1,width=10+(col*7+row*3)%12,depth=width*.48,height=(row<4&&col>2&&col<8?42:12)+(col*13+row*17)%38;
  if((x<225&&y>215)||(row===6&&col>7))continue;const g=document.createElementNS(ns,'g');g.classList.add('city-block');g.dataset.citySector=String(sector);g.innerHTML='<path class="city-block-left"/><path class="city-block-right"/><path class="city-block-roof"/><path class="city-block-windows"/>';scene.append(g);blocks.push({g,x,y,width,depth,height,sector});
 }
 const marker=document.createElementNS(ns,'g');marker.classList.add('city-geofront-depth');marker.innerHTML='<path d="M340 320 413 362 340 403 267 362Z"/><path d="M340 322v80M267 362h146"/><text x="340" y="423" text-anchor="middle">GEOFRONT / 地下空洞</text>';scene.append(marker);
 const label=document.createElementNS(ns,'g');label.classList.add('city-map-labels');label.innerHTML='<text x="34" y="345">ASHINOKO / 芦ノ湖</text><text x="337" y="64">HAKONE CALDERA / 箱根外輪山</text><text x="198" y="389">TOKYO-3 / 第三新東京市</text>';scene.append(label);
 function geometry(b,ratio){const {g,x,y,width:w,depth:d,height:h}=b,z=h*ratio;g.children[0].setAttribute('d',`M${x-w} ${y-z} ${x} ${y+d-z}V${y+d}L${x-w} ${y}Z`);g.children[1].setAttribute('d',`M${x} ${y+d-z} ${x+w} ${y-z}V${y}L${x} ${y+d}Z`);g.children[2].setAttribute('d',`M${x} ${y-d-z} ${x+w} ${y-z} ${x} ${y+d-z} ${x-w} ${y-z}Z`);let windows='';for(let k=8;k<z-5;k+=8)windows+=`M${x+2} ${y+d-k}l${w-4} ${-d+2}`;g.children[3].setAttribute('d',windows);}
 const ratios=[1,1,1],keys=['','',''];
 function render(){for(let i=0;i<3;i++){const c=S.defense.city[i],key=c.armor+'-'+c.hp;if(keys[i]===key)continue;keys[i]=key;const target=c.hp<=0 ? .08 : c.armor ? .28 : 1;for(const b of blocks.filter(b=>b.sector===i))b.g.dataset.damage=c.hp<40?'critical':c.hp<75?'damaged':'normal';const update=r=>{ratios[i]=r;for(const b of blocks.filter(b=>b.sector===i))geometry(b,r);};if(window.NERV_MOTION)NERV_MOTION.tween('city-sector-'+i,ratios[i],target,update,map,620);else update(target);}map.dataset.cityMode='terrain';map.setAttribute('aria-label','第三新東京市の2.5D地形・市街地・防衛配置。芦ノ湖、箱根外輪山、武装ビル収容と実際の模擬損傷を表示');}
 const oldDraw=draw;draw=function(){oldDraw();render();};window.addEventListener('nerv-route',render);render();
 const note=document.createElement('p');note.className='staff-note city-reference-note';note.textContent='添付構想図を参考にした模式配置。実測地図ではありません。ビル収容は区画の防護状態、色は施設健全性に連動。';(map.closest('.fx-map-stack')||map).after(note);
 for(const [i,x,y]of [[0,181,198],[1,340,125],[2,500,198],[3,340,278]]){const g=map.querySelector('g[data-v27pick="'+i+'"]');if(g)g.setAttribute('transform','translate('+x+' '+y+') scale(.58) translate('+(-x)+' '+(-y)+')');}
 window.NERV_CITY={snapshot:()=>({buildings:blocks.length,ratios:[...ratios],selected:S.defense.selected,health:S.defense.city.map(c=>c.hp)}),refresh:render};
}
initV215City();
function v215Panel(page,id,label,html){const el=document.createElement('section');el.className='mobile-view';el.dataset.view=id;el.innerHTML='<div class="staff-panel v215-panel">'+html+'</div>';qs('.page[data-page="'+page+'"]').append(el);registerTerminalView(page,id,label);return el;}
function fieldMapMarkup(id){const points=[[60,40],[180,40],[300,40],[60,125],[180,125],[300,125]];return '<svg id="'+id+'" viewBox="0 0 360 165" class="field-map" role="group" aria-label="現場区画と追跡経路"><path class="field-links" d="M60 40H300M60 40 180 125M180 40 300 125M300 40 180 125M60 125H300"/><path class="field-planned"/><g>'+points.map(([x,y],i)=>'<g data-field-node="'+i+'" role="button" tabindex="0" aria-label="'+fieldNodeNames[i]+'を選択" transform="translate('+x+' '+y+')"><rect x="-47" y="-22" width="94" height="44" rx="2"/><text text-anchor="middle" y="4">'+fieldNodeNames[i]+'</text></g>').join('')+'</g></svg>';}
function initV215OperationsUI(){
 if(!qs('#staffSupport'))return;
 v215Panel('magi','maintenance','MAGI保守','<p class="eyebrow">MAGI / MAINTENANCE</p><h2 id="magiRepairTitle">MAGI保守監視</h2><div class="magi-repair-preview">'+nervMagiDiagram('MAINTENANCE')+'</div><p id="magiRepairStatus" class="staff-guide"></p><button id="magiRepairDiagnose" class="staff-primary" data-world-action="magiops.diagnose">独立診断を依頼 / 次の30秒更新</button><button class="staff-primary" data-ops-route="magi/maintenance-tools">保守調整盤へ ↗</button><div class="ops-route-grid"><button data-ops-route="magi/maintenance-settings">障害演習・設定 ↗</button><button data-ops-route="magi/maintenance-history">復旧履歴 ↗</button></div>');
 v215Panel('magi','maintenance-tools','保守調整','<p class="eyebrow">INDEPENDENT CHECK / TECHNICAL SUPPORT</p><h2>MAGI保守調整盤</h2><p id="magiRepairFeedback" class="staff-guide"></p><div id="magiRepairTools"></div><button id="magiRepairValidate" class="staff-primary" data-world-action="magiops.validate">独立照合を実施</button><button id="magiRepairReport" class="staff-primary" data-world-action="magiops.report">赤木リツコへ保守結果を上申</button><button class="staff-secondary" data-ops-route="magi/maintenance">診断・進行状況 ↗</button>');
 v215Panel('magi','maintenance-settings','障害演習','<h2>MAGI障害演習</h2><p class="staff-note">冷却以外の独自の保守事例。原因を独立診断し、補正・照合後に技術部の承認を受けます。</p>'+Object.entries(magiFaultKinds).map(([id,x])=>'<button class="staff-secondary" data-world-action="magiops.start.'+id+'">'+x.title+'</button>').join('')+'<button id="magiFaultAuto" class="staff-secondary" data-world-action="magiops.toggle"></button><button class="staff-secondary" data-ops-route="settings/cadence">全体の発生頻度 ↗</button>');
 v215Panel('magi','maintenance-history','保守履歴','<h2>MAGI復旧履歴</h2><div id="magiRepairHistory" class="v215-records"></div><button class="staff-secondary" data-ops-route="magi/maintenance">保守監視へ ↗</button>');
 v215Panel('work','case-library','保安事例','<p class="eyebrow">FIELD INVESTIGATION / ORIGINAL SCENARIOS</p><h2>本部保安・現場捜査</h2><p class="staff-note">映像から経路を追い、回線記録と巡回報告を照合。経路を描いて区画を制御します。</p><div class="case-library-grid">'+Object.entries(securityKinds).map(([id,x])=>'<button class="staff-secondary" data-field-start="'+id+'">'+x.title+'</button>').join('')+'</div><button class="staff-primary" data-ops-route="work/fieldwork">対応中の現場捜査へ ↗</button><button class="staff-secondary" data-ops-route="settings/cadence">発生頻度・監視設定 ↗</button>');
 v215Panel('work','fieldwork','現場捜査','<p class="eyebrow">SECURITY / SURVEILLANCE DESK</p><h2 id="fieldTitle">現場捜査盤</h2><p id="fieldBudget" class="staff-note"></p>'+fieldMapMarkup('fieldObservationMap')+'<button id="fieldAccept" class="staff-primary" data-security-action="accept">案件を受領</button><div class="field-tools"><button data-security-action="camera">映像照会<small>照会枠 1</small></button><button data-security-action="trace">回線追跡<small>照会枠 1</small></button><button data-security-action="patrol">巡回照会<small>照会枠 2</small></button></div><p id="fieldFeedback" class="staff-guide" role="status"></p><div class="ops-route-grid"><button data-ops-route="work/field-records">照会記録 ↗</button><button data-ops-route="work/security-control">経路・区画制御 ↗</button></div><button class="staff-secondary" data-ops-route="work/case-library">保安事例を選ぶ ↗</button>');
 v215Panel('work','field-records','現場記録','<h2>映像・回線・巡回記録</h2><div id="fieldRecords" class="v215-records"></div><button class="staff-secondary" data-ops-route="work/fieldwork">現場捜査盤へ ↗</button><button class="staff-secondary" data-ops-route="work/security-control">経路を照合する ↗</button>');
 v215Panel('work','security-control','区画制御','<p class="eyebrow">TRACE / LOCAL CONTAINMENT</p><h2>経路照合・区画制御</h2><div class="armament-picker"><button data-field-mode="route">経路を描く</button><button data-field-mode="gate">区画を保留</button></div>'+fieldMapMarkup('fieldControlMap')+'<p id="fieldRouteInfo" class="staff-note"></p><div class="field-route-actions"><button data-security-action="resetRoute">経路を消去</button><button data-security-action="verify">3記録と照合</button></div><button id="fieldAnalyze" class="staff-primary" data-security-action="analyze">MAGIへ経路照合を依頼</button><button id="fieldSeal" class="staff-primary" data-security-action="seal">最終区画の保留を確認</button><button class="staff-secondary" data-ops-route="work/security-response">解決手配・正式報告 ↗</button>');
 v215Panel('work','security-response','解決手配','<p class="eyebrow">SECURITY / DEPARTMENT COORDINATION</p><h2>現場の解決手配</h2><p id="fieldResponseStatus" class="staff-guide"></p><button class="staff-primary" data-security-action="quarantine">記録保全・独立回線へ切替 / 電力6</button><button class="staff-secondary" data-security-action="escort">巡回担当の同行確認 / 照会枠2・1更新</button><button class="staff-secondary" data-security-action="handoff">現場保安班へ引継ぎ / 照会枠2・2更新</button><button class="staff-secondary" data-ops-route="work/security-control">経路・最終区画を保留する ↗</button><button class="staff-primary" data-ops-route="work/decision">対応方針・正式報告へ ↗</button>');
 v215Panel('settings','cadence','発生頻度','<h2>勤務中の発生頻度</h2><div class="cadence-presets"><button data-world-action="pace.quiet">低頻度</button><button data-world-action="pace.balanced">通常勤務</button><button data-world-action="pace.exercise">集中演習</button></div><p id="cadenceReadout" class="staff-guide"></p><button id="cadenceSecurity" class="staff-secondary" data-security-action="toggle"></button><button id="cadenceMagi" class="staff-secondary" data-world-action="magiops.toggle"></button><button id="cadenceAngels" class="staff-secondary" data-world-action="angel.toggle"></button><p class="staff-note">待機中の冷却負荷は自然に低下。重大案件は重複を抑え、未処理案件を残したまま頻度を変更できます。</p>');
 let fieldMode='route',repairKey='';
 all('[data-field-start]').forEach(b=>b.addEventListener('click',async()=>{const r=await worldAction('security.operation.'+b.dataset.fieldStart);if(r.ok)NERV_MOBILE.open('work','fieldwork');}));
 all('[data-field-mode]').forEach(b=>b.addEventListener('click',()=>{fieldMode=b.dataset.fieldMode;render();}));
 for(const id of ['fieldObservationMap','fieldControlMap']){
  const map=$(id);const select=e=>{const n=e.target.closest('[data-field-node]');if(!n)return;if(e.type==='keydown'&&!['Enter',' '].includes(e.key))return;e.preventDefault();const op=id==='fieldObservationMap'?'node':fieldMode;worldAction('security.'+op+'.'+n.dataset.fieldNode);};map.addEventListener('click',select);map.addEventListener('keydown',select);
 }
 $('magiRepairTools').addEventListener('change',e=>{const x=e.target;if(x.dataset.magiAdjust!==undefined)worldAction('magiops.adjust.'+x.dataset.magiAdjust+'.'+x.value);});
 function render(){
  document.body.dataset.v215View=currentPage+'/'+(mobileCurrent[currentPage]||'');document.body.dataset.v215Compact=String(!!qs('.page.active .mobile-view:not([hidden]) .v215-panel'));if(!staffWorldReady)return;const w=S.world,a=w.magiOps.active,c=securityActive(S),f=c?.fieldwork,cfg=worldPacing();
  const labels={detected:'独立診断を依頼してください',diagnosing:'独立診断中 / 次の更新を待機',work:'保守調整盤で基準値へ合わせてください',validated:'独立照合成立 / 技術部へ上申',reported:'技術部の復旧承認待ち'};
  meteoText('magiRepairTitle',a?magiFaultKinds[a.kind].title:'MAGI保守監視 / 三基稼働');meteoText('magiRepairStatus',a?labels[a.stage]:'対応中の保守案件はありません。演習または状況連動の検知を待機しています。');meteoText('magiRepairFeedback',a?a.feedback:'対応中の保守案件はありません。');$('magiRepairDiagnose').hidden=a?.stage!=='detected';$('magiRepairValidate').hidden=a?.stage!=='work';$('magiRepairReport').hidden=a?.stage!=='validated';
  for(const b of all('[data-world-action^="magiops.start."]'))b.disabled=!!a;
  meteoText('magiFaultAuto','状況連動MAGI障害：'+(w.magiOps.auto?'ON':'OFF'));
  if(a){meteoText('magiSystemReadout',magiFaultKinds[a.kind].title+' / '+labels[a.stage]+'。通常審議は保留しています。');meteoText('worldBrief',magiFaultKinds[a.kind].title+'。MAGI保守盤で独立診断・照合を進めてください。');meteoText('worldMagiReason',magiFaultKinds[a.kind].title+' / '+labels[a.stage]);meteoText('launcherWorld',magiFaultKinds[a.kind].title+' / 保守確認待ち');}
  for(const core of all('.magi-repair-preview [data-fx-core]')){const i=Number(core.dataset.fxCore);let text='稼働',status='idle';if(a){status='active';text=a.stage==='detected'?'診断待ち':a.stage==='diagnosing'?'診断中':a.stage==='reported'?'承認待ち':a.stage==='validated'?'照合成立':a.kind==='clock'?(a.offsets[i]+a.adjustments[i])+' ms':a.kind==='power'?'給電照合':a.inspected.includes(i)?i===2?'不一致':'一致':'未照合';if(a.kind==='clock'&&a.stage==='work'&&a.offsets[i]+a.adjustments[i]===0||['validated','reported'].includes(a.stage))status='protected';}core.dataset.status=status;core.querySelector('.magi-core-readout').textContent=text;}
  const key=a?a.id+'-'+a.stage:'none';if(key!==repairKey){repairKey=key;const tools=$('magiRepairTools');tools.replaceChildren();
   if(a?.stage==='work'){
    if(a.kind==='clock'){tools.innerHTML='<p class="staff-note">基準時計との差を補正し、三基すべてを0 msへ合わせます。</p>'+a.offsets.map((n,i)=>'<label class="magi-adjust-row">'+externalCoreNames[i]+' / 偏差 '+(n>0?'+':'')+n+' ms <output id="magiAdjustValue'+i+'"></output><input aria-label="'+externalCoreNames[i]+'の時計補正" data-magi-adjust="'+i+'" type="range" min="-8" max="8" step="1" value="'+a.adjustments[i]+'"></label>').join('');}
    if(a.kind==='power'){tools.innerHTML='<p class="staff-note">診断：BUS '+(a.damagedBus+1)+'にノイズ。他の2系統を給電したまま対象バスを隔離します。</p>'+a.feeds.map((on,i)=>'<button class="staff-secondary" data-world-action="magiops.feed.'+i+'" id="magiFeed'+i+'"></button>').join('');}
    if(a.kind==='checksum'){tools.innerHTML='<p class="staff-note">署名済み原本：ROOT-215。3複製を照合し、原本と一致する複製元を指定します。</p>'+[0,1,2].map(i=>'<div class="magi-copy-row"><span id="magiCopyInfo'+i+'"></span><button data-world-action="magiops.inspect.'+i+'">照合</button><button data-world-action="magiops.copy.'+i+'" id="magiCopy'+i+'">複製元</button></div>').join('');}
   }
  }
  if(a?.stage==='work')for(let i=0;i<3;i++){
   if(a.kind==='clock'){meteoText('magiAdjustValue'+i,'補正 '+a.adjustments[i]+' / 結果 '+(a.offsets[i]+a.adjustments[i])+' ms');const input=qs('[data-magi-adjust="'+i+'"]');if(document.activeElement!==input)input.value=String(a.adjustments[i]);}
   if(a.kind==='power'){$('magiFeed'+i).textContent='BUS '+(i+1)+' / '+(a.feeds[i]?'給電中':'隔離');$('magiFeed'+i).setAttribute('aria-pressed',String(!a.feeds[i]));}
   if(a.kind==='checksum'){meteoText('magiCopyInfo'+i,'複製 '+(i+1)+' / '+(a.inspected.includes(i)?i===2?'ROOT-214 / 不一致':'ROOT-215 / 一致':'未照合'));$('magiCopy'+i).disabled=!a.inspected.includes(i);$('magiCopy'+i).setAttribute('aria-pressed',String(a.selectedCopy===i));}
  }
  const hist=$('magiRepairHistory');hist.replaceChildren();for(const r of w.magiOps.archive){const row=document.createElement('p');row.textContent=r.id+' / '+magiFaultKinds[r.kind].title+' / 技術部承認済み';hist.append(row);}if(!hist.children.length)hist.textContent='復旧記録なし';
  meteoText('fieldTitle',c?securityKinds[c.kind].title:'現場捜査盤');meteoText('fieldBudget',f?'選択：'+fieldNodeNames[f.selected]+' / 照会枠 '+f.budget+' / 証拠 '+c.evidence.length+'/3':c?'手順確認演習中。従来の証拠照合画面を利用できます。':'保安事例から案件を開始できます。');meteoText('fieldFeedback',f?f.feedback:'映像→回線→巡回の順に手掛かりを追います。');$('fieldAccept').hidden=!f||c.stage!=='detected';all('.field-tools button').forEach(b=>b.disabled=!f||!['accepted','collecting'].includes(c.stage)||b.dataset.securityAction==='patrol'&&!!f.patrol);
  all('[data-field-start]').forEach(b=>b.disabled=!!c);all('[data-field-mode]').forEach(b=>b.setAttribute('aria-pressed',String(fieldMode===b.dataset.fieldMode)));
  for(const id of ['fieldObservationMap','fieldControlMap']){const root=$(id),points=[[60,40],[180,40],[300,40],[60,125],[180,125],[300,125]];for(const n of root.querySelectorAll('[data-field-node]')){n.dataset.selected=String(Number(n.dataset.fieldNode)===f?.selected);n.dataset.closed=String(f?.gates.includes(Number(n.dataset.fieldNode))||false);}root.querySelector('.field-planned').setAttribute('d',f?.planned.map((n,i)=>(i?'L':'M')+points[n].join(' ')).join(' ')||'');}
  meteoText('fieldRouteInfo',f?(fieldMode==='route'?'3記録の順に区画をタップ：':'退避経路を開放したまま最終区画を保留：')+(f.planned.map(i=>fieldNodeNames[i]).join(' → ')||'経路未設定')+' / '+(f.verified?'経路一致':'未照合'):'現場捜査案件を開始してください。');$('fieldAnalyze').hidden=!f||c.stage!=='collecting'||!f.verified;$('fieldSeal').hidden=!f||c.stage!=='analyzed';
  meteoText('fieldResponseStatus',f?f.feedback+' / 照会枠 '+f.budget+' / 電力 '+S.defense.energy+'%':'現場捜査案件を開始してください。');for(const button of all('[data-security-action="quarantine"],[data-security-action="escort"],[data-security-action="handoff"]')){const op=button.dataset.securityAction;button.disabled=!f||c.stage!=='analyzed'||!f.verified||!!f.pendingResolution;button.hidden=!f||op==='quarantine'&&!['audit','relay','decoy','sabotage'].includes(c.kind)||op==='escort'&&!['access','cargo'].includes(c.kind);}
  const records=$('fieldRecords');records.replaceChildren();for(const r of f?.records.slice(-5)||[]){const p=document.createElement('p');p.textContent=({camera:'映像',trace:'回線',patrol:'巡回'}[r.tool])+' / '+r.text;records.append(p);}if(!records.children.length)records.textContent='現場記録なし';
  if(f){$('securityAnalyze').disabled=c.stage!=='collecting'||!f.verified;all('#securityEvidence button').forEach(b=>{b.disabled=true;b.textContent='現場捜査盤で照会';});}
  meteoText('cadenceReadout',({quiet:'低頻度',balanced:'通常勤務',exercise:'集中演習'}[cfg.mode])+' / 保安初回 '+cfg.securityFirst/2+'分・解決後 '+cfg.securityInterval/2+'分 / 職員通信 最短 '+cfg.radio/60000+'分');all('[data-world-action^="pace."]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.worldAction==='pace.'+cfg.mode)));
  meteoText('cadenceSecurity','状況連動保安：'+(w.security.auto?'ON':'OFF'));meteoText('cadenceMagi','状況連動MAGI障害：'+(w.magiOps.auto?'ON':'OFF'));meteoText('cadenceAngels','使徒接近の自動監視：'+(w.angels.auto?'ON':'OFF')+' / 約60分以降');
 }
 for(const [selector,page,view,label]of [['.page[data-page="magi"] [data-view="workflow"]','magi','maintenance','冷却以外のMAGI保守 ↗'],['.page[data-page="work"] [data-view="brief"]','work','case-library','現場捜査・保安事例 ↗'],['.page[data-page="work"] [data-view="security"] .staff-panel','work','fieldwork','現場捜査盤へ ↗'],['.page[data-page="settings"] [data-view="effects"]','settings','cadence','業務・警報の発生頻度 ↗']]){const b=document.createElement('button');b.className='staff-secondary';b.dataset.opsRoute=page+'/'+view;b.textContent=label;qs(selector)?.append(b);}
 const oldDraw=draw;draw=function(){oldDraw();render();};window.addEventListener('nerv-route',render);window.addEventListener('nerv-world-ready',render);
 const oldAlert=terminalAlert;terminalAlert=function(){const previous=oldAlert(),a=staffWorldReady&&S.world?.magiOps?.active;if(a&&(previous.level!=='critical'||previous.key?.startsWith('world-')))return {level:'critical',key:'magiops-'+a.id,title:magiFaultKinds[a.kind].title,message:'MAGI保守盤で独立診断・照合・技術部への報告を進めてください。',page:'magi'};return previous;};
 const oldReview=openAlertReview;openAlertReview=function(mode='alert'){oldReview(mode);if(S.world?.magiOps?.active){$('alertClear').disabled=true;$('alertClear').textContent='MAGI保守の復旧承認が必要';}};
 $('alertTarget').addEventListener('click',e=>{if(terminalAlert().key?.startsWith('magiops-')){e.stopImmediatePropagation();closeAlertReview();NERV_MOBILE.open('magi','maintenance');}},true);
 window.NERV_V215={maintenance:()=>worldClone(S.world?.magiOps),pacing:()=>worldPacing(),angel:id=>worldAction('angel.start.'+id),refresh:render};render();
}
initV215OperationsUI();
function initV215BattleUI(){
 if(!qs('#staffSupport'))return;let selectedAngel='sachiel',nextCommand=null;
 if(['knife','rifle','positron'].includes(S.prefs.selectedWeapon))armamentSelected=S.prefs.selectedWeapon;
 const labels={knife:'ナイフ',rifle:'パレット',positron:'ポジトロン'},names={knife:'プログレッシブナイフ',rifle:'パレットガン',positron:'ポジトロンライフル'};
 v215Panel('mission','angels','使徒監視','<p class="eyebrow">ANGEL SURVEILLANCE / TV SERIES</p><h2>使徒接近・迎撃記録</h2><div class="angel-roster">'+Object.values(angelProfiles).map(p=>'<button data-angel-select="'+p.id+'"><span class="angel-art" data-angel="'+p.id+'" role="img" aria-label="'+p.name+'の外観"></span><small>第'+p.number+'使徒</small><b>'+p.name+'</b></button>').join('')+'</div><p id="angelIntel" class="staff-guide"></p><p id="angelStartReason" class="staff-note" role="status"></p><button id="angelStart" class="staff-primary"></button><button class="staff-secondary" data-ops-route="mission/engagement">交戦管制へ ↗</button><p class="staff-note">作中の使徒を再現する独自シナリオ。既存の通常訓練も利用できます。</p>');
 v215Panel('mission','engagement','交戦管制','<p class="eyebrow">EVA / ENGAGEMENT CONTROL</p><div class="engagement-target" id="engagementTarget"><span class="angel-art" id="engagementPortrait" role="img"></span><div><h2 id="engagementEnemy"></h2><p id="engagementEnemyHP"></p><label class="staff-label" for="engagementUnit">攻撃担当機</label><select id="engagementUnit"><option value="0">零号機</option><option value="1">初号機</option><option value="2">弐号機</option></select></div></div><div class="engagement-weapons">'+Object.entries(labels).map(([id,label])=>'<button data-engagement-weapon="'+id+'"><span class="weapon-art"><i data-weapon-art="'+id+'"></i></span><b>'+label+'</b></button>').join('')+'</div><p id="engagementSelected" class="staff-guide"></p><p id="engagementProgress" class="staff-note"></p><button id="engagementNext" class="staff-secondary"></button><p id="engagementBlockers" class="staff-note" role="status"></p><button id="engagementFire" class="staff-primary"></button><div class="ops-route-grid"><button data-ops-route="mission/weapon-detail">装備図 ↗</button><button data-ops-route="infra/defense">戦域マップ ↗</button></div>');
 function chooseWeapon(id){armamentSelected=id;S.prefs.selectedWeapon=id;persist();renderArmament();window.dispatchEvent(new CustomEvent('nerv-equipment-selected',{detail:{weapon:id}}));}
 all('[data-angel-select]').forEach(b=>b.addEventListener('click',()=>{selectedAngel=b.dataset.angelSelect;render();}));all('[data-engagement-weapon]').forEach(b=>b.addEventListener('click',()=>chooseWeapon(b.dataset.engagementWeapon)));
 $('angelStart').addEventListener('click',async()=>{if(S.defense.status==='active'){NERV_MOBILE.open('mission','engagement');return;}const r=await worldAction('angel.start.'+selectedAngel);if(r.ok)NERV_MOBILE.open('mission','engagement');});
 $('engagementUnit').addEventListener('change',e=>commandOperation(()=>{S.tactics.attacker=Number(e.target.value);S.selectedEva=S.tactics.attacker;staffInvalidateDecision();}));
 $('engagementNext').addEventListener('click',async()=>{const command=nextCommand;if(!command)return;if(command.weapon){chooseWeapon(command.weapon);return;}if(command.route){if(command.route.startsWith('eva/')){S.selectedEva=S.tactics.attacker;renderEVA();}const [p,v]=command.route.split('/');NERV_MOBILE.open(p,v);return;}if(command.action==='wait')await commandOperation(()=>v27Advance());else await evaCombatAction(command.action);});
 $('engagementFire').addEventListener('click',()=>evaCombatAction(armamentSelected));
 function nextStep(){
  const d=S.defense,e=S.evas[S.tactics.attacker],c=evaCombatState(),w=armamentSelected;
  if(d.status!=='active')return {label:'使徒監視で対象を確認する ↗',route:'mission/angels'};
  if(!S.infra.power||!S.infra.comms)return {label:'主電源・通信を復旧する ↗',route:'infra/systems'};
  if(worldMagiLimited())return {label:'MAGI保守・異常対応を確認する ↗',route:S.world.magiOps.active?'magi/maintenance':'work/incidents'};
  if(securityHold())return {label:'保安案件を引き継ぐ ↗',route:'work/security'};
  if(e.state!=='DEPLOYED')return {label:'担当機の発進準備・出撃承認へ ↗',route:'eva/control'};
  if(!evaExternalPower(S.tactics.attacker)&&e.power<40)return {label:'担当機の給電を確認する ↗',route:'eva/readiness'};
  if(d.scans<(w==='positron'?68:34))return {label:'対象を解析する / 電力12',action:'scan'};
  if(currentAngel()?.id==='ramiel'&&w!=='positron')return {label:'対ラミエル：ポジトロンへ切り替える',weapon:'positron'};
  if(w==='positron'&&!evaExternalPower(S.tactics.attacker))return {label:'アンビリカル・外部給電を接続する ↗',route:'eva/readiness'};
  const required=w==='positron'?(positronChargeState()<100?22:40):c.range>1?4:c.exposedUntil<=d.round?12:evaCombatWeapons[w].energy;
  if(d.energy<required)return d.spares>0?{label:'補助送電 / 予備枠1・電力+38',action:'positronSupply'}:{label:'電力配分を待つ / 1ターン・敵も行動',action:'wait'};
  if(w==='positron'&&positronChargeState()<100)return {label:'特別送電・充填 / 電力22・1ターン',action:'positronCharge'};
  if(w!=='positron'&&c.range>1)return {label:'担当機を接近させる / 1ターン',action:'approach'};
  if(w!=='positron'&&!e.at)return {label:'担当機のA.T.フィールドを展開',action:'at'};
  if(w!=='positron'&&c.exposedUntil<=d.round)return {label:'敵A.T.を中和する / 1ターン',action:'neutralize'};
  if(!combatApproved())return {label:'現ターンのMAGI戦術承認を申請',action:'authorize'};
  return null;
 }
 function render(){
  if(!staffWorldReady)return;const p=angelProfiles[selectedAngel],d=S.defense,a=currentAngel(),e=S.evas[S.tactics.attacker],c=evaCombatState();
  all('[data-angel-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.angelSelect===selectedAngel)));meteoText('angelIntel','第'+p.number+'使徒 '+p.name+' / '+p.feature+'。'+p.tactic);
  const blocked=!!S.world.security.case||worldObserve(S).magiHold;meteoText('angelStartReason',d.status==='active'?'現在の迎撃を継続してください。':blocked?'進行中の保安・MAGI保守を引き継いでから受信できます。':'EVA・都市の現在の損傷や資源を引き継いで迎撃します。');$('angelStart').disabled=blocked&&d.status!=='active';$('angelStart').textContent=d.status==='active'?'現在の交戦管制へ ↗':'第'+p.number+'使徒の接近を受信';
  meteoText('engagementEnemy',a?a.name:d.status==='active'?d.enemy.code:'対象未検知');meteoText('engagementEnemyHP',d.enemy?'目標 '+d.enemy.hp+'/'+d.enemy.maxHp+' / '+({active:'交戦中',victory:'目標沈黙',defeat:'防衛失敗',idle:'待機'}[d.status]):'使徒監視または通常訓練で対象を検知');const face=$('engagementPortrait');face.hidden=!a;if(a){face.dataset.angel=a.id;face.setAttribute('aria-label',a.name+'の外観');}
  if(document.activeElement!==$('engagementUnit'))$('engagementUnit').value=String(S.tactics.attacker);all('[data-engagement-weapon]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.engagementWeapon===armamentSelected)));
  meteoText('engagementSelected','UNIT-0'+S.tactics.attacker+' / '+names[armamentSelected]);meteoText('engagementProgress','解析 '+d.scans+'% / 距離 '+c.range+' / '+(armamentSelected==='positron'?'充填 '+positronChargeState()+'%':'A.T.中和 '+(c.exposedUntil>d.round?'有効':'未実施'))+' / 都市電力 '+d.energy+'%');
  nextCommand=nextStep();$('engagementNext').hidden=!nextCommand;if(nextCommand)$('engagementNext').textContent=nextCommand.label;const errors=evaCombatConditions(armamentSelected);$('engagementFire').disabled=!!errors.length;$('engagementFire').textContent='UNIT-0'+S.tactics.attacker+' / '+names[armamentSelected]+'で攻撃';meteoText('engagementBlockers',errors.length?'未成立：'+errors[0]:'準備完了。攻撃命令で1回だけ実行します。');
  const sprite=$('angelMapSprite');if(sprite){sprite.hidden=!a||d.scans<34||d.status!=='active';if(a)sprite.dataset.angel=a.id;const enemy=$('v27Enemy');if(a&&d.scans>=34&&d.status==='active')enemy.dataset.angel=a.id;else delete enemy.dataset.angel;}
  const warning=qs('#commandAlert .command-alert-code b');if(warning)warning.textContent=a&&d.status==='active'?'FICTION / 作中使徒の迎撃':'SIMULATION / 架空の訓練警報';
 }
 const mapEnemy=$('v27Enemy');if(mapEnemy){const foreign=document.createElementNS('http://www.w3.org/2000/svg','foreignObject');foreign.setAttribute('x','-28');foreign.setAttribute('y','-60');foreign.setAttribute('width','56');foreign.setAttribute('height','88');foreign.setAttribute('pointer-events','none');foreign.innerHTML='<span xmlns="http://www.w3.org/1999/xhtml" id="angelMapSprite" class="angel-art" hidden></span>';mapEnemy.append(foreign);}
 for(const [selector,label,route]of [['#commandLauncher','使徒監視・迎撃 ↗','mission/angels'],['#armamentPanel .staff-panel','選択武器の交戦ガイド ↗','mission/engagement'],['#weaponControlPanel .staff-panel','武器選択と次の準備を確認 ↗','mission/engagement'],['#evaCombatPanel','交戦管制・武器を選択 ↗','mission/engagement']]){const b=document.createElement('button');b.className='staff-secondary v215-guide-link';b.dataset.opsRoute=route;b.textContent=label;qs(selector)?.append(b);}
 qs('#armamentPanel [data-ops-route="mission/weapon-detail"]')?.remove();
 const priorArmament=renderArmament;renderArmament=function(){priorArmament();render();};const oldDraw=draw;draw=function(){oldDraw();render();};window.addEventListener('nerv-route',render);window.addEventListener('nerv-world-ready',render);
 window.addEventListener('nerv-confirmed-hit',()=>{const card=$('engagementTarget');NERV_MOTION?.tween('angel-hit',1,0,v=>{card.style.boxShadow=v?'inset 0 0 '+(15*v)+'px rgba(232,156,83,'+(v*.4)+')':'';},card,520);});
 const oldAlert=terminalAlert;terminalAlert=function(){const previous=oldAlert(),a=currentAngel();if(a&&S.defense.status==='active'&&previous.level!=='critical')return {level:'critical',key:'angel-'+S.defense.caseNo,title:a.name+'接近',message:'EVAの担当機・武器を確認し、交戦管制の準備手順を進めてください。',page:'mission'};return previous;};
 $('alertTarget').addEventListener('click',event=>{if(terminalAlert().key?.startsWith('angel-')){event.stopImmediatePropagation();closeAlertReview();NERV_MOBILE.open('mission','engagement');}},true);
 window.addEventListener('nerv-equipment-selected',event=>{if(['knife','rifle','positron'].includes(event.detail?.weapon)){S.prefs.selectedWeapon=event.detail.weapon;persist();}});
 window.NERV_ENGAGEMENT={selectWeapon:chooseWeapon,next:()=>nextCommand?{...nextCommand}:null,snapshot:()=>({weapon:armamentSelected,angel:currentAngel()?.id||null,ready:evaCombatConditions(armamentSelected).length===0})};render();
}
initV215BattleUI();
// Shared calm cadence, rather than independent channels all talking at once.
function v215LastAutomatic(){return Math.max(S.personalMessages?.automation?.lastAt||0,...(Array.isArray(S.personnel?.messages)?S.personnel.messages:[]).map(x=>Number(x?.at)||0),...(Array.isArray(S.headquarters?.messages)?S.headquarters.messages:[]).slice(0,1).map(x=>Number(x?.at)||0));}
const v215PriorCandidates=dialogCandidates;
dialogCandidates=function(data){
 const list=v215PriorCandidates(data),a=S.world?.magiOps?.active,cfg=worldPacing(),automation=data.automation;
 if(a){const key='magiops-'+a.id+'-'+a.stage,to=magiFaultKinds[a.kind].contact;if(!automation.seen.includes(key)&&!data.pending.some(p=>p.to===to))list.unshift({to,key,topic:'magi',priority:'emergency',input:'MAGI保守の状況を報告'});}
 return list.filter(c=>{const gap=c.priority==='emergency'?30000:c.priority==='urgent'?(cfg.mode==='exercise'?90000:120000):cfg.idle;const last=c.priority==='routine'&&!c.key.startsWith('followup-')?Math.max(v215LastAutomatic(),S.world?.pacing?.startedAt||0):automation.lastAt;return Date.now()-last>=gap&&Date.now()-(automation.people[c.to]||0)>=(c.priority==='emergency'?60000:cfg.mode==='exercise'?300000:cfg.idle);});
};
const v215PriorOperational=dialogOperational;
dialogOperational=function(person,topic,text,w){const a=S.world?.magiOps?.active;if(a&&['magi','incident','duty'].includes(topic)){if(person.unit!==undefined)return dialogPersonas[person.id].watch+' MAGIの保守確認中。原因の判断は技術部へお願いします。';return magiFaultKinds[a.kind].title+' / '+a.id+' / '+({detected:'独立診断待ち',diagnosing:'診断中',work:'保守盤で照合中',validated:'技術部への報告待ち',reported:'技術部の復旧承認待ち'}[a.stage])+'。'+({gendo:'担当部署に確認させろ。判断は報告を受けてからだ。',fuyutsuki:'技術部の照合結果を待とう。正式な報告は保持してくれ。',kiel:'技術部の照合を経た正式な報告を提出したまえ。',ritsuko:'三基を確認するわ。照合が済むまで通常の審議は保留ね。',misato:'保守の確認が先よ。復旧報告が出るまで作戦指示を進めないで。',maya:'独立診断の記録を確認しています。技術部の承認を待ってください。',hyuga:'現状を管制へ共有します。承認が出るまで発令は保留してください。',aoba:'連絡回線は維持します。保守側の報告を待っています。'}[person.id]||'正式な報告系統で確認してください。');}return v215PriorOperational(person,topic,text,w);};
const v215PriorAIContext=dialogAIContext;
dialogAIContext=function(id){const context=v215PriorAIContext(id);if(!context)return null;const a=S.world?.magiOps?.active,p=dialogPersonas[id];if(a)context.world.magiMaintenance={title:magiFaultKinds[a.kind].title,stage:a.stage};if(currentAngel())context.world.angel={name:currentAngel().name,identified:S.defense.scans>=34};return context;};
function initV215Comms(){
 if(!window.NERV_MESSAGES)return;window.NERV_MESSAGES.context=dialogAIContext;let automaticBusy=false;const proactive=dialogProactive;dialogProactive=async function(allow=true){if(automaticBusy)return {ok:false};automaticBusy=true;try{return await proactive(allow);}finally{automaticBusy=false;}};window.NERV_MESSAGES.proactive=dialogProactive;
 const priorHQ=headquartersTalk;headquartersTalk=async function(index,automatic=false){if(automaticBusy&&automatic)return {ok:false};if(automatic){const start=S.world?.pacing?.startedAt||Date.now();if(Date.now()-Math.max(start,v215LastAutomatic())<worldPacing().idle||worldObserve(S).alert!=='通常')return Promise.resolve({ok:false});}if(automatic)automaticBusy=true;try{return await priorHQ(index,automatic);}finally{if(automatic)automaticBusy=false;}};
 const previousRadioScheduler=scheduleStaffRadio;document.removeEventListener('visibilitychange',previousRadioScheduler);window.removeEventListener('pageshow',previousRadioScheduler);
 scheduleStaffRadio=function(){clearTimeout(staffRadioTimer);staffRadioTimer=0;if(document.hidden||!staffCommsEnabled())return;const cfg=worldPacing();staffRadioTimer=setTimeout(async()=>{if(!automaticBusy&&staffCommsEnabled()&&!document.hidden&&S.infra.comms&&staffWorldReady&&worldObserve(S).alert==='通常'&&staffFeed().filter(x=>!x.read).length<3&&!document.activeElement?.matches('input,textarea,[contenteditable="true"]')&&Date.now()-Math.max(v215LastAutomatic(),S.world.pacing.startedAt)>=cfg.radio){automaticBusy=true;try{await receiveStaffMessage(Math.random()<.35?'broadcast':'radio');}finally{automaticBusy=false;}}scheduleStaffRadio();},cfg.radio+Math.random()*cfg.radio*.5);};
 document.addEventListener('visibilitychange',scheduleStaffRadio);window.addEventListener('pageshow',scheduleStaffRadio);
 let cadence='';const priorDraw=draw;draw=function(){priorDraw();const mode=worldPacing().mode;if(cadence!==mode){cadence=mode;scheduleStaffRadio();}};scheduleStaffRadio();
}
initV215Comms();
v214FinishRoutes();
})();
