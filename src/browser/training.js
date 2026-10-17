// Retain historical operator records while replacing score/timing games with staff commands.
const newOpsDefaults=()=>({xp:0,missions:0,successfulChecks:0,checkIndex:0,calibrations:0,gridBalance:50,gridQuality:0,locks:0,currentMissionLocks:0,lockBest:0,magiPredictions:0,magiMatches:0,missionAwarded:false,gridRewardKeys:[],magiRewardKeys:[],lastActions:[]});
S.ops={...newOpsDefaults(),...(S.ops&&typeof S.ops==='object'?S.ops:{})};
const isMoving=()=>S.prefs.motion&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function addXP(n,reason){S.ops.xp=Math.max(0,S.ops.xp+n);S.ops.lastActions.unshift({at:hhmmss(),reason,points:n});S.ops.lastActions=S.ops.lastActions.slice(0,8);persist();}
