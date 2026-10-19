// Preserve new deep links while older modules mount their own panels synchronously.
const v214InitialHash=typeof location==='object'?location.hash:'';
const v214NewRoute=/^#(?:work\/(?:security|evidence|decision|security-history|security-settings|fieldwork|field-records|security-control|security-response|case-library)|messages\/ai|magi\/(?:system|maintenance|maintenance-tools|maintenance-settings|maintenance-history)|mission\/(?:weapon-detail|angels|engagement)|hq\/(?:directorate|seele|observatory)|settings\/(?:visual-index|cadence))$/.test(v214InitialHash);
let v214FinishRoutes=()=>{};
if(v214NewRoute&&typeof history==='object'){
 const push=history.pushState;history.pushState=function(){};
 v214FinishRoutes=()=>{history.pushState=push;history.replaceState({},'',v214InitialHash);const [page,view]=v214InitialHash.slice(1).split('/');window.NERV_MOBILE?.open(page,view);};
}
