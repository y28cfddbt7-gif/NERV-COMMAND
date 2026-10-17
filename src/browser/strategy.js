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
 if(enemy&&enemy.dist<=2&&enemy.hp>damage){const c=d.city[sector],absorb=(c.armor?13:0)+(S.infra.armor?5:0),guard=sector===3&&S.evas[S.tactics.defender]?.at?12:0;loss=Math.max(5,Math.round(Math.max(5,enemy.force-absorb-guard)*rule.loss));}
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
