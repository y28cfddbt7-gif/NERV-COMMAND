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
